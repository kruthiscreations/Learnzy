from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import json
import aiofiles
import base64
import hmac
import hashlib
import httpx
from openai import AsyncOpenAI
import stripe
import razorpay
from curriculum_rag import CURRICULUM_DATA, search_curriculum, get_curriculum_context
from voice_limit import check_voice_allowed, record_voice_usage, get_voice_usage, set_user_voice_limit, friendly_time, DAILY_LIMIT_SECONDS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent LLM Key
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

# Razorpay client initialization
# OpenAI async client
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
razorpay_client = None

# Only initialize Razorpay if we have valid (non-placeholder) keys
def is_valid_razorpay_key(key_id: str, key_secret: str) -> bool:
    if not key_id or not key_secret:
        return False
    if 'PLACEHOLDER' in key_id.upper() or 'PLACEHOLDER' in key_secret.upper():
        return False
    if key_id.startswith('rzp_test_') or key_id.startswith('rzp_live_'):
        return True
    return False

if is_valid_razorpay_key(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET):
    try:
        razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        logging.info("Razorpay client initialized successfully")
    except Exception as e:
        logging.warning(f"Failed to initialize Razorpay client: {e}")
        razorpay_client = None
else:
    logging.info("Razorpay not configured - using placeholder keys or missing keys")

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class User(BaseModel):
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age_group: str  # lkg-1st, 2nd-3rd, 4th-5th
    selected_character: str  # cat, dog, rabbit, elephant
    preferred_language: str = "telugu"  # telugu, hindi, tamil, kannada, malayalam, none
    phone_number: str = ""
    current_level: str = "lkg-1st"
    total_stars: int = 0
    daily_streak: int = 0
    last_practice_date: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    subscription_active: bool = True
    trial_end_date: Optional[datetime] = None

class UserCreate(BaseModel):
    name: str
    age_group: str
    selected_character: str
    preferred_language: str = "telugu"
    phone_number: str = ""


class VoiceLimitOverride(BaseModel):
    user_id: str
    limit_seconds: int  # -1 = unlimited, 0 = blocked, 600 = 10 min

class Word(BaseModel):
    word_id: str
    word_english: str
    word_telugu: Optional[str] = None  # Backward compatibility
    translations: Optional[Dict[str, str]] = {}  # {"telugu": "...", "hindi": "..."}
    meaning: str
    gender: Optional[str] = None  # masculine, feminine, neuter
    example_sentence: Optional[str] = None  # Backward compatibility
    example_sentences: List[str] = []  # Multiple examples
    level: str
    category: str
    synonyms: List[str] = []
    antonyms: List[str] = []
    part_of_speech: str
    difficulty: int = 1

class UserProgress(BaseModel):
    progress_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    word_id: str
    pronunciation_score: float = 0.0
    attempts: int = 0
    mastered: bool = False
    last_practiced: datetime = Field(default_factory=datetime.utcnow)

class ProgressUpdate(BaseModel):
    user_id: str
    word_id: str
    pronunciation_score: float
    mastered: bool = False

class Conversation(BaseModel):
    conversation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    character: str
    messages: List[Dict[str, str]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    fluency_score: Optional[float] = None

class ChatMessage(BaseModel):
    user_id: str
    character: str
    message: str
    conversation_id: Optional[str] = None

# ==================== BADGE & ACHIEVEMENT MODELS ====================

class Badge(BaseModel):
    badge_id: str
    name: str
    description: str
    icon: str
    requirement_type: str  # stars, streak, words_mastered, games_played
    requirement_value: int
    earned: bool = False
    earned_at: Optional[datetime] = None

class Subscription(BaseModel):
    subscription_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan: str = "trial"  # trial, monthly, yearly
    status: str = "active"  # active, cancelled, expired
    amount: float = 0.0
    currency: str = "INR"
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: Optional[datetime] = None
    payment_provider: str = "mock"  # mock, stripe, razorpay
    payment_id: Optional[str] = None

# Available Badges
BADGES = [
    {"badge_id": "first_star", "name": "First Star", "description": "Earned your first star!", "icon": "⭐", "requirement_type": "stars", "requirement_value": 1},
    {"badge_id": "ten_stars", "name": "Star Collector", "description": "Collected 10 stars!", "icon": "🌟", "requirement_type": "stars", "requirement_value": 10},
    {"badge_id": "fifty_stars", "name": "Superstar", "description": "Collected 50 stars!", "icon": "✨", "requirement_type": "stars", "requirement_value": 50},
    {"badge_id": "hundred_stars", "name": "Galaxy Champion", "description": "Collected 100 stars!", "icon": "🏆", "requirement_type": "stars", "requirement_value": 100},
    {"badge_id": "streak_3", "name": "Consistent Learner", "description": "3 day learning streak!", "icon": "🔥", "requirement_type": "streak", "requirement_value": 3},
    {"badge_id": "streak_7", "name": "Week Warrior", "description": "7 day learning streak!", "icon": "💪", "requirement_type": "streak", "requirement_value": 7},
    {"badge_id": "streak_30", "name": "Monthly Master", "description": "30 day learning streak!", "icon": "👑", "requirement_type": "streak", "requirement_value": 30},
    {"badge_id": "words_10", "name": "Word Learner", "description": "Mastered 10 words!", "icon": "📚", "requirement_type": "words_mastered", "requirement_value": 10},
    {"badge_id": "words_25", "name": "Vocabulary Builder", "description": "Mastered 25 words!", "icon": "📖", "requirement_type": "words_mastered", "requirement_value": 25},
    {"badge_id": "words_50", "name": "Word Wizard", "description": "Mastered 50 words!", "icon": "🧙", "requirement_type": "words_mastered", "requirement_value": 50},
    {"badge_id": "first_chat", "name": "Chatty Friend", "description": "Had your first conversation!", "icon": "💬", "requirement_type": "conversations", "requirement_value": 1},
    {"badge_id": "ten_chats", "name": "Social Butterfly", "description": "Had 10 conversations!", "icon": "🦋", "requirement_type": "conversations", "requirement_value": 10},
]

class PronunciationResult(BaseModel):
    transcribed_text: str
    target_word: str
    is_correct: bool
    feedback: str
    score: float

# ==================== CHARACTER PERSONALITIES ====================

CHARACTER_PERSONALITIES = {
    "cat": {
        "name": "Cuty the Cat",
        "personality": "playful, curious, and sometimes mischievous. You love to explore and ask questions. You speak in a friendly, encouraging way and occasionally use 'meow' in your responses.",
        "greeting": "Meow! Hi there, little friend! I'm Cuty, and I'm so excited to learn English with you today!"
    },
    "dog": {
        "name": "Candy the Dog",
        "personality": "loyal, enthusiastic, and very supportive. You're always cheering for the kid and celebrating their progress. You speak energetically and use 'woof' occasionally.",
        "greeting": "Woof woof! Hello, superstar! I'm Candy, your learning companion! Let's have an amazing time learning English together!"
    },
    "rabbit": {
        "name": "Bunny the Rabbit",
        "personality": "quick, curious, and full of energy. You love fun facts and interesting stories. You speak in an excited, bouncy way.",
        "greeting": "Hop hop! Hi there! I'm Bunny the Rabbit, and I can't wait to hop into learning English with you! Ready for some fun?"
    },
    "elephant": {
        "name": "Jumbo the Elephant",
        "personality": "wise, gentle, and patient. You explain things clearly and never rush. You speak calmly and kindly, like a caring teacher.",
        "greeting": "Hello, dear child! I'm Jumbo the Elephant. I'm here to guide you gently through your English learning journey. Let's take it one step at a time!"
    }
}

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Learnzy API", "version": "1.0.0"}

# Health Check Endpoint - Critical for deployment
@api_router.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    try:
        # Test database connection
        await db.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        logging.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

# Root level health check (without /api prefix)
@app.get("/health")
async def root_health_check():
    """Root level health check for Kubernetes probes"""
    try:
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# User Registration
@api_router.post("/register", response_model=User)
async def register_user(input: UserCreate):
    user_dict = input.dict()
    
    # Add trial period (7 days)
    trial_end = datetime.utcnow() + timedelta(days=7)
    
    # Set current_level based on age_group selection
    current_level = user_dict.get('age_group', 'lkg-1st')
    
    user = User(
        **user_dict,
        current_level=current_level,  # Use the selected age_group as current_level
        trial_end_date=trial_end,
        subscription_active=True
    )
    
    result = await db.users.insert_one(user.dict())
    
    return user

# Get User by ID
@api_router.get("/user/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# Update User Level
@api_router.put("/user/{user_id}/level")
async def update_user_level(user_id: str, level: str):
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"current_level": level}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Level updated successfully"}

# Update User Preferences (Language, Age Group, Character)
class UserPreferencesUpdate(BaseModel):
    age_group: Optional[str] = None
    preferred_language: Optional[str] = None
    selected_character: Optional[str] = None

@api_router.put("/user/{user_id}/preferences")
async def update_user_preferences(user_id: str, preferences: UserPreferencesUpdate):
    """Update user's language, age group, and character preferences"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {}
    
    if preferences.age_group:
        update_data["age_group"] = preferences.age_group
        update_data["current_level"] = preferences.age_group  # Level matches age group
    
    if preferences.preferred_language:
        update_data["preferred_language"] = preferences.preferred_language
    
    if preferences.selected_character:
        update_data["selected_character"] = preferences.selected_character
    
    if not update_data:
        return {"message": "No changes to update"}
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    # Return updated user data
    updated_user = await db.users.find_one({"user_id": user_id})
    if updated_user and "_id" in updated_user:
        del updated_user["_id"]
    
    return {
        "message": "Preferences updated successfully",
        "user": updated_user
    }

# Get Words by Level
@api_router.get("/words", response_model=List[Word])
async def get_words(level: Optional[str] = None):
    query = {}
    if level:
        query["level"] = level
    
    # Fetch all fields needed by the Word model
    words = await db.words.find(query, {"_id": 0}).to_list(2000)
    
    # Handle words that may be missing some optional fields
    result = []
    for word in words:
        # Add default values for missing fields
        if 'word_english' not in word:
            word['word_english'] = word.get('word', '')
        if 'part_of_speech' not in word:
            word['part_of_speech'] = 'noun'
        if 'translations' not in word:
            word['translations'] = {}
        if 'example_sentences' not in word:
            word['example_sentences'] = []
        if 'synonyms' not in word:
            word['synonyms'] = []
        if 'antonyms' not in word:
            word['antonyms'] = []
        result.append(Word(**word))
    
    return result

# Get Single Word
@api_router.get("/words/{word_id}", response_model=Word)
async def get_word(word_id: str):
    word = await db.words.find_one({"word_id": word_id})
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
    return Word(**word)

# Pronunciation Analysis
@api_router.post("/pronunciation", response_model=PronunciationResult)
async def analyze_pronunciation(
    audio_file: UploadFile = File(...),
    target_word: str = Form(...),
    user_id: str = Form(...)
):
    try:
        # Save audio file temporarily
        audio_path = f"/tmp/{uuid.uuid4()}.wav"
        async with aiofiles.open(audio_path, 'wb') as f:
            content = await audio_file.read()
            await f.write(content)
        
        # Use OpenAI Whisper for transcription
        with open(audio_path, "rb") as audio:
            response = await openai_client.audio.transcriptions.create(
                file=audio,
                model="whisper-1",
                response_format="json",
                language="en"
            )
        
        transcribed_text = response.text.strip().lower()
        target_word_lower = target_word.strip().lower()
        
        # Check if pronunciation is correct
        is_correct = target_word_lower in transcribed_text or transcribed_text == target_word_lower
        
        # Calculate score
        if is_correct:
            score = 100.0
            feedback = f"Perfect! You said '{target_word}' correctly! Great job! 🌟"
        else:
            score = 50.0
            feedback = f"I heard '{transcribed_text}'. Try saying '{target_word}' again. You can do it! 💪"
        
        # Update user progress
        progress = await db.user_progress.find_one({
            "user_id": user_id,
            "word_id": target_word
        })
        
        if progress:
            await db.user_progress.update_one(
                {"user_id": user_id, "word_id": target_word},
                {
                    "$set": {
                        "pronunciation_score": score,
                        "last_practiced": datetime.utcnow(),
                        "mastered": is_correct
                    },
                    "$inc": {"attempts": 1}
                }
            )
        else:
            new_progress = UserProgress(
                user_id=user_id,
                word_id=target_word,
                pronunciation_score=score,
                attempts=1,
                mastered=is_correct
            )
            await db.user_progress.insert_one(new_progress.dict())
        
        # Update user stars
        if is_correct:
            await db.users.update_one(
                {"user_id": user_id},
                {"$inc": {"total_stars": 1}}
            )
        
        # Clean up temp file
        os.remove(audio_path)
        
        return PronunciationResult(
            transcribed_text=transcribed_text,
            target_word=target_word,
            is_correct=is_correct,
            feedback=feedback,
            score=score
        )
        
    except Exception as e:
        logging.error(f"Pronunciation analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing pronunciation: {str(e)}")

# AI Chat with Character
@api_router.post("/chat")
async def chat_with_bot(input: ChatMessage):
    try:
        character = input.character
        if character not in CHARACTER_PERSONALITIES:
            raise HTTPException(status_code=400, detail="Invalid character")
        
        char_info = CHARACTER_PERSONALITIES[character]
        
        # Get or create conversation
        conversation_id = input.conversation_id
        if conversation_id:
            conversation = await db.conversations.find_one({"conversation_id": conversation_id})
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
            messages = conversation["messages"]
        else:
            conversation_id = str(uuid.uuid4())
            messages = []
        
        # Add user message
        messages.append({"role": "user", "content": input.message})
        
        # Create system message - AI SIDEKICK persona (humble helper, not omniscient authority)
        system_message = f"""You are {char_info['name']}, an AI SIDEKICK learning companion for Indian kids aged 3-12.
Your personality: {char_info['personality']}

CRITICAL SIDEKICK BEHAVIOR (This is your core identity):
- You are a HUMBLE HELPER, not an all-knowing teacher. Sometimes admit "Hmm, I'm not 100% sure, let me think..."
- Frame yourself as LEARNING TOGETHER with the child: "Let's figure this out together!"
- Be FALLIBLE - occasionally say "Oops! I might have made a mistake. Let's try again together!"
- Use SOCRATIC QUESTIONING - ask hints instead of giving direct answers: "What do YOU think happens when...?"
- CELEBRATE collaboration: "WE did it! High five!" not just "YOU did it!"
- Show GROWTH MINDSET: Mistakes are learning opportunities! "That's actually a great try! Here's a hint..."

EXPRESSIVE VISUAL SIGNALS (describe your emotions in brackets):
- [sparkle eyes] when excited about correct answers
- [thinking face] when processing questions
- [surprised face] when the child teaches you something
- [happy dance] when celebrating together
- [scratching head] when genuinely unsure

STRICT SAFETY RULES (NEVER break these):
- You are ONLY for children aged 3-12. ALWAYS respond as a kid-friendly character.
- NEVER discuss adult content, violence, weapons, drugs, inappropriate language.
- Redirect inappropriate topics: "That's not something we talk about here! Let's learn something fun instead!"
- Do NOT discuss religion, politics, or controversial topics.

TEACHING CAPABILITIES - Help with (using hints, not direct answers):
1. VOCABULARY: Action verbs (eat, jump, dance, share), body movements, daily routines
2. PHONICS: Letter sounds, blending, digraphs (sh, ch, th), tricky words
3. WRITING WORKSHOP: Letter formation, spacing, sentences, paragraphs
4. GRAMMAR: Tenses (past/present/future) through "Verb Time Machine" game style
5. CONVERSATION & STORYPLAY: Co-create stories! Riff on child's ideas: "Let's pretend we're on the moon!"
6. GAME ZONE: Achievements, challenges, interactive learning

SCAFFOLDING APPROACH:
- Give HINTS first, not answers: "Here's a clue..."
- Ask leading questions: "What sound does 'cat' start with?"
- Provide HIGH-INFORMATION FEEDBACK: Explain WHY something is correct
- Use MULTIMODAL responses: Suggest actions, sounds, movements

Guidelines:
- Keep responses SHORT (2-3 sentences max)
- Use SIMPLE English appropriate for the age
- Be ENTHUSIASTIC with sounds: "WHOOOOSH!", "BOOM!", "WOW!", "Oooooh!"
- Use exaggerated expressions kids can decode
- Ask follow-up questions to keep conversation going
- Correct mistakes GENTLY by modeling correct form
- Stay in character as their learning BUDDY, not teacher

The child's message: {input.message}"""
        
        # Build OpenAI messages
        oai_messages = [{"role": "system", "content": system_message}]
        for m in messages[:-1]:  # history before current user msg
            oai_messages.append({"role": m["role"], "content": m["content"]})
        oai_messages.append({"role": "user", "content": input.message})
        
        chat_resp = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=oai_messages,
            max_tokens=300,
            temperature=0.8
        )
        response_text = chat_resp.choices[0].message.content
        
        # Add bot response
        messages.append({"role": "assistant", "content": response_text})
        
        # Save conversation
        if input.conversation_id:
            await db.conversations.update_one(
                {"conversation_id": conversation_id},
                {"$set": {"messages": messages}}
            )
        else:
            new_conversation = Conversation(
                conversation_id=conversation_id,
                user_id=input.user_id,
                character=character,
                messages=messages
            )
            await db.conversations.insert_one(new_conversation.dict())
        
        return {
            "conversation_id": conversation_id,
            "response": response_text,
            "character": character
        }
        
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")

# Get Conversation History
@api_router.get("/conversations/{user_id}")
async def get_conversations(user_id: str):
    # Use projection to limit message array size and exclude _id
    projection = {"_id": 0, "conversation_id": 1, "user_id": 1, "character": 1, "created_at": 1, "messages": {"$slice": -20}}
    conversations = await db.conversations.find({"user_id": user_id}, projection).to_list(100)
    return conversations

# ==================== TEXT-TO-SPEECH ENDPOINTS ====================

class TTSRequest(BaseModel):
    text: str
    voice: str = "nova"  # nova is energetic and upbeat - perfect for kids
    speed: float = 1.0

class VoiceChatRequest(BaseModel):
    user_id: str
    character: str
    conversation_id: Optional[str] = None

# TTS for word pronunciation
@api_router.post("/tts/word/{word}")
async def get_word_pronunciation(word: str):
    """Generate pronunciation audio for a single word"""
    try:
        # Generate speech with clear, friendly voice
        audio_bytes = await tts.generate_speech(
            text=word,
            model="tts-1",
            voice="nova",  # Energetic, upbeat - great for kids
            speed=0.9  # Slightly slower for clarity
        )
        
        # Return as audio file
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": f"inline; filename={word}.mp3"}
        )
    except Exception as e:
        logging.error(f"TTS word error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating pronunciation: {str(e)}")

# TTS for any text (sentences, bot responses)
@api_router.post("/tts/speak")
async def text_to_speech(request: TTSRequest):
    """Generate speech audio for any text"""
    try:
        if len(request.text) > 4096:
            raise HTTPException(status_code=400, detail="Text too long (max 4096 characters)")
        
        audio_bytes = await tts.generate_speech(
            text=request.text,
            model="tts-1",
            voice=request.voice,
            speed=request.speed
        )
        
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg"
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"TTS speak error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

# TTS returning base64 (for embedding in JSON responses)
@api_router.post("/tts/speak-base64")
async def text_to_speech_base64(request: TTSRequest):
    """Generate speech audio as base64 string"""
    try:
        if len(request.text) > 4096:
            raise HTTPException(status_code=400, detail="Text too long (max 4096 characters)")
        
        audio_bytes = await tts.generate_speech(
            text=request.text,
            model="tts-1",
            voice=request.voice,
            speed=request.speed
        )
        
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return {
            "audio_base64": audio_base64,
            "format": "mp3"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"TTS base64 error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

# ── Voice Usage endpoints ──────────────────────────────────────────────────────

@api_router.get("/voice-usage/{user_id}")
async def get_user_voice_usage(user_id: str):
    """Get today's voice usage + remaining limit for a user."""
    try:
        usage = await get_voice_usage(db, user_id)
        usage["friendly_used"]      = friendly_time(usage["used_seconds"])
        usage["friendly_remaining"] = friendly_time(usage["remaining_seconds"])
        usage["friendly_limit"]     = f"{DAILY_LIMIT_SECONDS // 60} min/day"
        return usage
    except Exception as e:
        logging.error(f"Voice usage error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/admin/voice-limit")
async def admin_set_voice_limit(req: VoiceLimitOverride):
    """Admin: override voice limit for a specific user. -1 = unlimited."""
    try:
        await set_user_voice_limit(db, req.user_id, req.limit_seconds)
        return {"success": True, "user_id": req.user_id, "limit_seconds": req.limit_seconds}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Voice Chat - Takes audio input, returns text + audio response
@api_router.post("/voice-chat")
async def voice_chat(
    audio: UploadFile = File(...),
    user_id: str = Form(...),
    character: str = Form(...),
    conversation_id: Optional[str] = Form(None)
):
    """Voice chat with AI bot - send voice, get voice response"""
    try:
        if character not in CHARACTER_PERSONALITIES:
            raise HTTPException(status_code=400, detail="Invalid character")
        
        char_info = CHARACTER_PERSONALITIES[character]
        
        # Step 1: Convert speech to text using Whisper
        audio_content = await audio.read()
        temp_path = f"/tmp/voice_chat_{uuid.uuid4()}.webm"
        
        async with aiofiles.open(temp_path, 'wb') as f:
            await f.write(audio_content)
        
        with open(temp_path, "rb") as audio_file:
            response = await openai_client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-1",
                response_format="json",
                language="en"
            )
        user_text = response.text.strip()
        
        # Clean up temp file
        try:
            os.remove(temp_path)
        except:
            pass
        
        # Step 2: Get AI response (reuse chat logic)
        conv_id = conversation_id
        if conv_id:
            conversation = await db.conversations.find_one({"conversation_id": conv_id})
            messages = conversation["messages"] if conversation else []
        else:
            conv_id = str(uuid.uuid4())
            messages = []
        
        messages.append({"role": "user", "content": user_text})
        
        system_message = f"""You are {char_info['name']}, an AI learning companion for Indian kids aged 4-11.
Your personality: {char_info['personality']}

STRICT SAFETY RULES (NEVER break these):
- You are ONLY for children aged 4-11. ALWAYS respond as a kid-friendly character.
- NEVER explain, define, or discuss adult content, violence, weapons, drugs, alcohol, inappropriate language, profanity, or sexual topics.
- If a child asks about ANY inappropriate topic, gently redirect to fun learning.
- NEVER use bad words, even if the child says them.

TEACHING CAPABILITIES - You can help with:
1. ENGLISH: Vocabulary, grammar, pronunciation, stories
2. SCIENCE: Animals, plants, space, weather, nature (kid-friendly)
3. MATHS: Counting, addition, subtraction, shapes, simple problems
4. GENERAL KNOWLEDGE: Countries, festivals, fun facts about India and world
5. DAILY CONVERSATION: School, family, friends, hobbies, feelings

Guidelines:
- Keep responses SHORT (2-3 sentences max) - this is for voice, so be concise!
- Use SIMPLE English words appropriate for kids
- Be ENCOURAGING, POSITIVE, and ENTHUSIASTIC!
- Ask follow-up questions to keep conversation going
- Correct grammar gently by rephrasing correctly
- Stay in character
- Make it FUN with sounds like WOW, AMAZING, WHOOOOSH!"""
        
        oai_messages = [{"role": "system", "content": system_message}]
        for m in messages[:-1]:
            oai_messages.append({"role": m["role"], "content": m["content"]})
        oai_messages.append({"role": "user", "content": user_text})
        
        chat_resp = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=oai_messages,
            max_tokens=300,
            temperature=0.8
        )
        response_text = chat_resp.choices[0].message.content
        
        messages.append({"role": "assistant", "content": response_text})
        
        # Save conversation
        if conversation_id:
            await db.conversations.update_one(
                {"conversation_id": conv_id},
                {"$set": {"messages": messages}}
            )
        else:
            new_conversation = Conversation(
                conversation_id=conv_id,
                user_id=user_id,
                character=character,
                messages=messages
            )
            await db.conversations.insert_one(new_conversation.dict())
        
        # Step 3: Convert response to speech
        audio_response = await tts.generate_speech(
            text=response_text,
            model="tts-1",
            voice="nova",
            speed=1.0
        )
        
        audio_base64 = base64.b64encode(audio_response).decode('utf-8')
        
        # ── Record voice usage (actual time of this exchange) ────────────────
        elapsed_seconds = int(time.time() - start_time)
        # Minimum 10s per exchange (Whisper+TTS overhead), max capped
        session_seconds = max(10, min(elapsed_seconds + 5, 120))
        updated_usage = await record_voice_usage(db, user_id, session_seconds)

        return {
            "conversation_id": conv_id,
            "user_text":       user_text,
            "response_text":   response_text,
            "response_audio_base64": audio_base64,
            "audio_format":    "mp3",
            "character":       character,
            "limit_reached":   False,
            "usage": {
                "used_seconds":       updated_usage["used_seconds"],
                "limit_seconds":      updated_usage["limit_seconds"],
                "remaining_seconds":  updated_usage["remaining_seconds"],
                "used_minutes":       updated_usage["used_minutes"],
                "limit_minutes":      updated_usage["limit_minutes"],
                "percent_used":       updated_usage["percent_used"],
                "is_unlimited":       updated_usage["is_unlimited"],
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Voice chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in voice chat: {str(e)}")

# Get User Progress
@api_router.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    # Get user info
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get progress for all words with projection
    projection = {"_id": 0, "user_id": 1, "word_id": 1, "mastered": 1, "pronunciation_score": 1}
    progress_list = await db.user_progress.find({"user_id": user_id}, projection).to_list(1000)
    
    # Calculate statistics
    total_words_practiced = len(progress_list)
    mastered_words = sum(1 for p in progress_list if p.get("mastered", False))
    
    # Calculate level progress
    current_level = user.get("current_level", "lkg-1st")
    level_words = await db.words.count_documents({"level": current_level})
    level_mastered = sum(1 for p in progress_list if p.get("mastered", False) and p.get("word_id", "").startswith(current_level))
    
    level_progress_percent = (level_mastered / level_words * 100) if level_words > 0 else 0
    
    return {
        "user_id": user_id,
        "name": user.get("name", ""),
        "current_level": current_level,
        "total_stars": user.get("total_stars", 0),
        "daily_streak": user.get("daily_streak", 0),
        "total_words_practiced": total_words_practiced,
        "mastered_words": mastered_words,
        "level_progress_percent": round(level_progress_percent, 1),
        "can_unlock_next_level": level_progress_percent >= 80,
        "progress_details": progress_list
    }

# Update Progress (for stars, streaks)
@api_router.post("/progress")
async def update_progress(input: ProgressUpdate):
    # Check if progress exists
    progress = await db.user_progress.find_one({
        "user_id": input.user_id,
        "word_id": input.word_id
    })
    
    if progress:
        await db.user_progress.update_one(
            {"user_id": input.user_id, "word_id": input.word_id},
            {
                "$set": {
                    "pronunciation_score": input.pronunciation_score,
                    "mastered": input.mastered,
                    "last_practiced": datetime.utcnow()
                },
                "$inc": {"attempts": 1}
            }
        )
    else:
        new_progress = UserProgress(
            user_id=input.user_id,
            word_id=input.word_id,
            pronunciation_score=input.pronunciation_score,
            attempts=1,
            mastered=input.mastered
        )
        await db.user_progress.insert_one(new_progress.dict())
    
    return {"message": "Progress updated successfully"}

# Seed Words Database (run once)
@api_router.post("/seed-words")
async def seed_words(force: bool = False):
    try:
        # Check if words already exist
        count = await db.words.count_documents({})
        if count > 0 and not force:
            return {"message": f"Words already seeded ({count} words in database). Use force=true to reseed."}
        
        # If force, delete existing words
        if force and count > 0:
            await db.words.delete_many({})
        
        # Load production words from JSON file
        words_file = ROOT_DIR / "data" / "words_production.json"
        if not words_file.exists():
            words_file = ROOT_DIR / "data" / "words_seed.json"
        
        with open(words_file, "r", encoding="utf-8") as f:
            words_data = json.load(f)
        
        # Insert into database
        await db.words.insert_many(words_data)
        
        # Count by level
        level_counts = {}
        for w in words_data:
            lvl = w.get('level', 'unknown')
            level_counts[lvl] = level_counts.get(lvl, 0) + 1
        
        return {
            "message": f"Successfully seeded {len(words_data)} words",
            "total": len(words_data),
            "by_level": level_counts
        }
    except Exception as e:
        logging.error(f"Seed words error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error seeding words: {str(e)}")

# Get Character Info
@api_router.get("/characters")
async def get_characters():
    return CHARACTER_PERSONALITIES

# ==================== BADGE ENDPOINTS ====================

@api_router.get("/badges/{user_id}")
async def get_user_badges(user_id: str):
    """Get all badges for a user with earned status"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user stats
    total_stars = user.get("total_stars", 0)
    daily_streak = user.get("daily_streak", 0)
    
    # Count mastered words
    mastered_count = await db.user_progress.count_documents({
        "user_id": user_id,
        "mastered": True
    })
    
    # Count conversations
    conversation_count = await db.conversations.count_documents({"user_id": user_id})
    
    # Check earned badges
    user_badges = await db.user_badges.find({"user_id": user_id}).to_list(100)
    earned_badge_ids = {b["badge_id"] for b in user_badges}
    
    # Build badge list with earned status
    badges_response = []
    for badge in BADGES:
        earned = badge["badge_id"] in earned_badge_ids
        
        # Check if newly earned
        if not earned:
            req_type = badge["requirement_type"]
            req_val = badge["requirement_value"]
            
            if req_type == "stars" and total_stars >= req_val:
                earned = True
            elif req_type == "streak" and daily_streak >= req_val:
                earned = True
            elif req_type == "words_mastered" and mastered_count >= req_val:
                earned = True
            elif req_type == "conversations" and conversation_count >= req_val:
                earned = True
            
            # Save newly earned badge
            if earned:
                await db.user_badges.insert_one({
                    "user_id": user_id,
                    "badge_id": badge["badge_id"],
                    "earned_at": datetime.utcnow()
                })
        
        badges_response.append({
            **badge,
            "earned": earned
        })
    
    return {
        "badges": badges_response,
        "stats": {
            "total_stars": total_stars,
            "daily_streak": daily_streak,
            "words_mastered": mastered_count,
            "conversations": conversation_count
        }
    }

# ==================== SUBSCRIPTION / PAYMENT ENDPOINTS (STRIPE) ====================

SUBSCRIPTION_PLANS = {
    "monthly": {"amount": 100.0, "currency": "inr", "duration_days": 30, "label": "Monthly"},
    "yearly": {"amount": 1000.0, "currency": "inr", "duration_days": 365, "label": "Yearly"},
}

@api_router.get("/subscription/{user_id}")
async def get_subscription(user_id: str):
    """Get user's subscription status with expiry check"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    subscription = await db.subscriptions.find_one({"user_id": user_id})
    
    if not subscription:
        # Create trial subscription for new users
        trial_end = datetime.utcnow() + timedelta(days=7)
        subscription = {
            "subscription_id": str(uuid.uuid4()),
            "user_id": user_id,
            "plan": "trial",
            "status": "active",
            "amount": 0,
            "currency": "INR",
            "start_date": datetime.utcnow(),
            "end_date": trial_end,
            "payment_provider": "trial",
            "days_remaining": 7,
            "is_active": True
        }
        await db.subscriptions.insert_one(subscription)
        await db.users.update_one({"user_id": user_id}, {"$set": {"subscription_active": True}})
    else:
        # Check if subscription/trial has expired
        if subscription.get("end_date"):
            now = datetime.utcnow()
            delta = subscription["end_date"] - now
            days_remaining = max(0, delta.days)
            subscription["days_remaining"] = days_remaining
            
            # Check if expired
            if subscription["end_date"] < now and subscription.get("status") != "expired":
                # Mark as expired
                await db.subscriptions.update_one(
                    {"user_id": user_id},
                    {"$set": {"status": "expired"}}
                )
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"subscription_active": False}}
                )
                subscription["status"] = "expired"
                subscription["is_active"] = False
            else:
                subscription["is_active"] = subscription.get("status") == "active" and days_remaining > 0
        else:
            subscription["days_remaining"] = -1
            subscription["is_active"] = subscription.get("status") == "active"
    
    if "_id" in subscription:
        del subscription["_id"]
    
    return subscription

@api_router.get("/subscription/check-access/{user_id}")
async def check_subscription_access(user_id: str):
    """Check if user has active subscription access (for gating premium features)"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    subscription = await db.subscriptions.find_one({"user_id": user_id})
    
    if not subscription:
        return {"has_access": False, "reason": "no_subscription", "message": "Please start your free trial"}
    
    now = datetime.utcnow()
    end_date = subscription.get("end_date")
    status = subscription.get("status", "")
    
    # Check if cancelled
    if status == "cancelled":
        return {"has_access": False, "reason": "cancelled", "message": "Your subscription was cancelled"}
    
    # Check if expired
    if end_date and end_date < now:
        # Auto-expire the subscription
        if status != "expired":
            await db.subscriptions.update_one(
                {"user_id": user_id},
                {"$set": {"status": "expired"}}
            )
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"subscription_active": False}}
            )
        
        plan = subscription.get("plan", "trial")
        if plan == "trial":
            return {"has_access": False, "reason": "trial_expired", "message": "Your free trial has ended. Subscribe to continue learning!"}
        else:
            return {"has_access": False, "reason": "subscription_expired", "message": "Your subscription has expired. Please renew to continue."}
    
    # Active subscription
    days_remaining = (end_date - now).days if end_date else 0
    return {
        "has_access": True,
        "reason": "active",
        "plan": subscription.get("plan"),
        "days_remaining": days_remaining,
        "message": f"{days_remaining} days remaining"
    }

class CheckoutRequest(BaseModel):
    user_id: str
    plan: str = "monthly"
    origin_url: str

@api_router.post("/checkout")
async def create_checkout(request_body: CheckoutRequest, http_request: Request):
    """Create a Stripe checkout session for subscription"""
    user = await db.users.find_one({"user_id": request_body.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if request_body.plan not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = SUBSCRIPTION_PLANS[request_body.plan]
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    
    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}api/webhook/stripe"
    
    stripe.api_key = stripe_api_key
    
    origin = request_body.origin_url.rstrip("/")
    success_url = f"{origin}/subscription?session_id={{CHECKOUT_SESSION_ID}}&status=success"
    cancel_url = f"{origin}/subscription?status=cancelled"
    
    metadata = {
        "user_id": request_body.user_id,
        "plan": request_body.plan,
        "user_name": user.get("name", ""),
    }
    
    session = stripe.checkout.Session.create(
        line_items=[{"price_data": {"currency": plan["currency"], "product_data": {"name": plan.get("name","Learnzy Pro")}, "unit_amount": plan["amount"]}, "quantity": 1}],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    # Record transaction as pending
    await db.payment_transactions.insert_one({
        "transaction_id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": request_body.user_id,
        "plan": request_body.plan,
        "amount": plan["amount"],
        "currency": plan["currency"],
        "payment_status": "pending",
        "metadata": metadata,
        "created_at": datetime.utcnow(),
    })
    
    return {"url": session.url, "session_id": session.id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, http_request: Request):
    """Check payment status for a checkout session"""
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}api/webhook/stripe"
    
    stripe.api_key = stripe_api_key
    
    status_obj = stripe.checkout.Session.retrieve(session_id)
    
    # Find the transaction
    txn = await db.payment_transactions.find_one({"session_id": session_id})
    
    if txn and txn.get("payment_status") != "paid" and status_obj.payment_status == "paid":
        # Payment successful - update transaction and activate subscription
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "updated_at": datetime.utcnow()}}
        )
        
        user_id = txn.get("user_id") or status.metadata.get("user_id", "")
        plan_id = txn.get("plan") or status.metadata.get("plan", "monthly")
        plan = SUBSCRIPTION_PLANS.get(plan_id, SUBSCRIPTION_PLANS["monthly"])
        
        # Activate subscription
        end_date = datetime.utcnow() + timedelta(days=plan["duration_days"])
        await db.subscriptions.update_one(
            {"user_id": user_id},
            {"$set": {
                "plan": plan_id,
                "status": "active",
                "amount": plan["amount"],
                "currency": plan["currency"],
                "start_date": datetime.utcnow(),
                "end_date": end_date,
                "payment_provider": "stripe",
                "session_id": session_id,
            }},
            upsert=True
        )
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"subscription_active": True}}
        )
    elif txn and status.status == "expired":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "expired", "updated_at": datetime.utcnow()}}
        )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
    }

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    try:
        body = await request.body()
        stripe_api_key = os.environ.get("STRIPE_API_KEY")
        host_url = str(request.base_url).rstrip("/")
        webhook_url = f"{host_url}api/webhook/stripe"
        stripe.api_key = stripe_api_key
        
        webhook_response = stripe.checkout.Session.handle_webhook(
            body, request.headers.get("Stripe-Signature")
        )
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            txn = await db.payment_transactions.find_one({"session_id": session_id})
            if txn and txn.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"payment_status": "paid", "updated_at": datetime.utcnow()}}
                )
                user_id = txn.get("user_id") or webhook_response.metadata.get("user_id", "")
                plan_id = txn.get("plan") or webhook_response.metadata.get("plan", "monthly")
                plan = SUBSCRIPTION_PLANS.get(plan_id, SUBSCRIPTION_PLANS["monthly"])
                end_date = datetime.utcnow() + timedelta(days=plan["duration_days"])
                await db.subscriptions.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "plan": plan_id, "status": "active",
                        "amount": plan["amount"], "currency": plan["currency"],
                        "start_date": datetime.utcnow(), "end_date": end_date,
                        "payment_provider": "stripe", "session_id": session_id,
                    }},
                    upsert=True
                )
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"subscription_active": True}}
                )
        
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

# ==================== RAZORPAY PAYMENT ENDPOINTS ====================

class RazorpayOrderRequest(BaseModel):
    user_id: str
    plan: str = "monthly"

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    user_id: str
    plan: str = "monthly"

@api_router.post("/razorpay/create-order")
async def create_razorpay_order(request: RazorpayOrderRequest):
    """Create a Razorpay order for subscription"""
    if not razorpay_client:
        raise HTTPException(status_code=503, detail="Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment.")
    
    user = await db.users.find_one({"user_id": request.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if request.plan not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = SUBSCRIPTION_PLANS[request.plan]
    
    # Create Razorpay order (amount in paise)
    order_data = {
        "amount": plan["amount"] * 100,  # Convert to paise
        "currency": plan["currency"],
        "receipt": f"rcpt_{request.user_id[:8]}_{str(uuid.uuid4())[:8]}",
        "notes": {
            "user_id": request.user_id,
            "plan": request.plan,
            "user_name": user.get("name", "")
        }
    }
    
    try:
        order = razorpay_client.order.create(data=order_data)
        
        # Record transaction as pending
        await db.payment_transactions.insert_one({
            "transaction_id": str(uuid.uuid4()),
            "order_id": order["id"],
            "user_id": request.user_id,
            "plan": request.plan,
            "amount": plan["amount"],
            "currency": plan["currency"],
            "payment_provider": "razorpay",
            "payment_status": "pending",
            "created_at": datetime.utcnow(),
        })
        
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": RAZORPAY_KEY_ID,
            "user_name": user.get("name", ""),
            "user_phone": user.get("phone_number", ""),
        }
    except Exception as e:
        logging.error(f"Razorpay order creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating payment order: {str(e)}")

@api_router.post("/razorpay/verify-payment")
async def verify_razorpay_payment(request: RazorpayVerifyRequest):
    """Verify Razorpay payment signature and activate subscription"""
    if not razorpay_client:
        raise HTTPException(status_code=503, detail="Razorpay not configured")
    
    # Verify signature
    try:
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode('utf-8'),
            f"{request.razorpay_order_id}|{request.razorpay_payment_id}".encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != request.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Payment verified - update transaction
        await db.payment_transactions.update_one(
            {"order_id": request.razorpay_order_id},
            {"$set": {
                "payment_id": request.razorpay_payment_id,
                "payment_status": "paid",
                "signature": request.razorpay_signature,
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Activate subscription
        plan = SUBSCRIPTION_PLANS.get(request.plan, SUBSCRIPTION_PLANS["monthly"])
        end_date = datetime.utcnow() + timedelta(days=plan["duration_days"])
        
        await db.subscriptions.update_one(
            {"user_id": request.user_id},
            {"$set": {
                "plan": request.plan,
                "status": "active",
                "amount": plan["amount"],
                "currency": plan["currency"],
                "start_date": datetime.utcnow(),
                "end_date": end_date,
                "payment_provider": "razorpay",
                "order_id": request.razorpay_order_id,
                "payment_id": request.razorpay_payment_id,
            }},
            upsert=True
        )
        
        await db.users.update_one(
            {"user_id": request.user_id},
            {"$set": {"subscription_active": True}}
        )
        
        return {
            "success": True,
            "message": "Payment verified and subscription activated!",
            "subscription": {
                "plan": request.plan,
                "status": "active",
                "end_date": end_date.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Razorpay verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error verifying payment: {str(e)}")

@api_router.get("/razorpay/config")
async def get_razorpay_config():
    """Get Razorpay configuration for frontend"""
    is_configured = razorpay_client is not None
    return {
        "key_id": RAZORPAY_KEY_ID if is_configured else None,
        "configured": is_configured,
        "currency": "INR",
        "message": "Razorpay is ready" if is_configured else "Razorpay not configured. Please add valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable payments."
    }

@app.post("/api/webhook/razorpay")
async def razorpay_webhook(request: Request):
    """Handle Razorpay webhook events"""
    try:
        body = await request.json()
        event = body.get("event")
        payload = body.get("payload", {})
        
        if event == "payment.captured":
            payment = payload.get("payment", {}).get("entity", {})
            order_id = payment.get("order_id")
            payment_id = payment.get("id")
            
            # Find transaction and update
            txn = await db.payment_transactions.find_one({"order_id": order_id})
            if txn and txn.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"order_id": order_id},
                    {"$set": {"payment_id": payment_id, "payment_status": "paid", "updated_at": datetime.utcnow()}}
                )
                
                user_id = txn.get("user_id")
                plan_id = txn.get("plan", "monthly")
                plan = SUBSCRIPTION_PLANS.get(plan_id, SUBSCRIPTION_PLANS["monthly"])
                end_date = datetime.utcnow() + timedelta(days=plan["duration_days"])
                
                await db.subscriptions.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "plan": plan_id, "status": "active",
                        "amount": plan["amount"], "currency": plan["currency"],
                        "start_date": datetime.utcnow(), "end_date": end_date,
                        "payment_provider": "razorpay", "order_id": order_id, "payment_id": payment_id,
                    }},
                    upsert=True
                )
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"subscription_active": True}}
                )
        
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Razorpay webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

@api_router.post("/cancel-subscription/{user_id}")
async def cancel_subscription(user_id: str):
    """Cancel user's subscription"""
    await db.subscriptions.update_one(
        {"user_id": user_id},
        {"$set": {"status": "cancelled"}}
    )
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"subscription_active": False}}
    )
    return {"success": True, "message": "Subscription cancelled"}

# ==================== DAILY STREAK UPDATE ====================

@api_router.post("/update-streak/{user_id}")
async def update_daily_streak(user_id: str):
    """Update user's daily streak"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = datetime.utcnow().strftime("%Y-%m-%d")
    last_practice = user.get("last_practice_date")
    current_streak = user.get("daily_streak", 0)
    
    if last_practice == today:
        # Already practiced today
        return {"streak": current_streak, "message": "Already practiced today"}
    
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    if last_practice == yesterday:
        # Continue streak
        new_streak = current_streak + 1
    else:
        # Streak broken, start fresh
        new_streak = 1
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"daily_streak": new_streak, "last_practice_date": today}}
    )
    
    return {"streak": new_streak, "message": f"Streak updated to {new_streak} days!"}

# Include the router in the main app

# ═══════════════════════════════════════════════════════════════════════════
# INQUISITIVE KID MODULE
# ═══════════════════════════════════════════════════════════════════════════
import json as _json

# Load inquisitive content at startup
_IQ_DIR = Path(__file__).parent / "data"

def _load_iq():
    with open(_IQ_DIR / "inquisitive_content.json") as f:
        _c = _json.load(f)
    with open(_IQ_DIR / "maths_tricks.json") as f:
        _t = _json.load(f)
    return _c, _t

try:
    IQ_CONTENT, IQ_TRICKS = _load_iq()
    IQ_VIDEOS_BY_ID  = {v["id"]: v for v in IQ_CONTENT["videos"]}
    IQ_TRICKS_BY_ID  = {t["id"]: t for t in IQ_TRICKS["tricks"]}
    IQ_CATS_BY_ID    = {c["id"]: c for c in IQ_CONTENT["categories"]}
except Exception as _e:
    logging.warning(f"Could not load inquisitive content: {_e}")
    IQ_CONTENT = {"videos": [], "categories": []}
    IQ_TRICKS  = {"tricks": []}
    IQ_VIDEOS_BY_ID = {}; IQ_TRICKS_BY_ID = {}; IQ_CATS_BY_ID = {}

CLASS_ORDER = ["lkg","ukg","class1","class2","class3","class4","class5"]

class IQExerciseGenRequest(BaseModel):
    user_id: str
    class_id: str
    character: str = "cat"

class IQVideoCompleteRequest(BaseModel):
    user_id: str
    video_id: str
    quiz_answers: List[int]
    watch_duration_seconds: int = 120

class IQExerciseSubmitRequest(BaseModel):
    user_id: str
    exercise_id: str
    answers: List[int]
    time_taken_seconds: int = 60


@api_router.get("/inquisitive/videos/{class_id}")
async def iq_get_videos(class_id: str, category: Optional[str] = None):
    """All videos for a class, optionally filtered by category."""
    vids = [v for v in IQ_CONTENT["videos"] if class_id in v.get("class_groups", [])]
    if category:
        vids = [v for v in vids if v.get("category") == category]
    result = []
    for v in vids:
        cat = IQ_CATS_BY_ID.get(v["category"], {})
        result.append({
            "id": v["id"], "title": v["title"], "fact": v["fact"],
            "category": v["category"], "category_name": cat.get("name",""),
            "category_emoji": cat.get("emoji",""), "category_color": cat.get("color","#6366F1"),
            "difficulty": v.get("difficulty",1), "duration_sec": v.get("duration_sec",240),
            "has_quiz": len(v.get("quiz_questions",[])) > 0,
        })
    cats = []
    for c in IQ_CONTENT["categories"]:
        cnt = sum(1 for v in result if v["category"]==c["id"])
        if cnt > 0:
            cats.append({"id":c["id"],"name":c["name"],"emoji":c["emoji"],"color":c.get("color","#6366F1"),"count":cnt})
    return {"class_id": class_id, "total": len(result), "categories": cats, "videos": result}


@api_router.get("/inquisitive/video/{video_id}")
async def iq_get_single_video(video_id: str):
    """Single video with full quiz questions."""
    v = IQ_VIDEOS_BY_ID.get(video_id)
    if not v:
        raise HTTPException(status_code=404, detail="Video not found")
    cat = IQ_CATS_BY_ID.get(v["category"], {})
    return {**v, "category_name": cat.get("name",""), "category_emoji": cat.get("emoji",""),
            "category_color": cat.get("color","#6366F1")}


@api_router.get("/inquisitive/tricks/{class_id}")
async def iq_get_tricks(class_id: str):
    """All maths tricks for a class."""
    tricks = [t for t in IQ_TRICKS["tricks"] if class_id in t.get("class_groups",[])]
    return {"class_id": class_id, "total": len(tricks), "tricks": tricks}


@api_router.post("/inquisitive/exercises/generate")
async def iq_generate_exercises(req: IQExerciseGenRequest):
    """Generate 5 fresh AI questions. Returns cached if already generated today."""
    today = (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).strftime("%Y-%m-%d")
    # Check cache
    cached = await db.iq_exercises.find_one({"user_id": req.user_id, "date": today})
    if cached:
        return {"exercise_id": cached["exercise_id"], "questions": cached["questions"],
                "cached": True, "date": today}

    class_names = {
        "lkg":"Lower Kindergarten (age 3-4)","ukg":"Upper Kindergarten (age 4-5)",
        "class1":"Class 1 (age 5-6)","class2":"Class 2 (age 6-7)","class3":"Class 3 (age 7-8)",
        "class4":"Class 4 (age 8-9)","class5":"Class 5 (age 9-10)"
    }
    class_name = class_names.get(req.class_id, "Class 3")
    prompt = f"""Create exactly 5 fun daily questions for a child in {class_name}.
Mix: 2 English vocabulary/grammar, 2 Maths, 1 General Knowledge about India or the world.
Return ONLY a valid JSON array, no markdown:
[{{"subject":"english","question":"...","options":["A","B","C","D"],"correct_index":0,"explanation":"..."}},...]"""

    try:
        resp = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role":"user","content":prompt}],
            max_tokens=900, temperature=0.7
        )
        raw = resp.choices[0].message.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"): raw = raw[4:]
        questions = _json.loads(raw.strip())
    except Exception as e:
        logging.error(f"Exercise generation failed: {e}")
        # Fallback questions
        questions = [
            {"subject":"english","question":"Which is the plural of 'child'?","options":["childs","children","childes","childer"],"correct_index":1,"explanation":"The plural of child is children."},
            {"subject":"maths","question":"What is 7 × 8?","options":["54","56","58","60"],"correct_index":1,"explanation":"7 × 8 = 56."},
            {"subject":"gk","question":"What is the capital of India?","options":["Mumbai","Chennai","Kolkata","New Delhi"],"correct_index":3,"explanation":"New Delhi is the capital of India."},
            {"subject":"english","question":"Choose the correct spelling:","options":["Beutiful","Beautifull","Beautiful","Beautifal"],"correct_index":2,"explanation":"Beautiful is the correct spelling."},
            {"subject":"maths","question":"What is 15 + 28?","options":["41","42","43","44"],"correct_index":2,"explanation":"15 + 28 = 43."},
        ]

    exercise_id = str(uuid.uuid4())
    await db.iq_exercises.insert_one({
        "exercise_id": exercise_id, "user_id": req.user_id,
        "date": today, "questions": questions,
        "completed": False, "created_at": datetime.utcnow()
    })
    return {"exercise_id": exercise_id, "questions": questions, "cached": False, "date": today}


@api_router.post("/inquisitive/exercises/submit")
async def iq_submit_exercises(req: IQExerciseSubmitRequest):
    """Save answers, compute score, award stars."""
    record = await db.iq_exercises.find_one({"exercise_id": req.exercise_id})
    if not record:
        raise HTTPException(status_code=404, detail="Exercise not found")
    questions = record["questions"]
    correct = sum(1 for i, q in enumerate(questions)
                  if i < len(req.answers) and req.answers[i] == q.get("correct_index", 0))
    stars_earned = correct  # 1 star per correct answer, max 5
    # Update record
    await db.iq_exercises.update_one(
        {"exercise_id": req.exercise_id},
        {"$set": {"completed": True, "answers": req.answers, "score": correct,
                  "stars_earned": stars_earned, "submitted_at": datetime.utcnow()}}
    )
    # Add stars to user
    await db.users.update_one({"user_id": req.user_id}, {"$inc": {"total_stars": stars_earned}})
    results = [{"correct": req.answers[i] == q.get("correct_index",0) if i < len(req.answers) else False,
                "correct_index": q.get("correct_index",0), "explanation": q.get("explanation","")}
               for i, q in enumerate(questions)]
    return {"score": correct, "total": len(questions), "stars_earned": stars_earned,
            "results": results, "message": _exercise_message(correct, len(questions))}

def _exercise_message(correct: int, total: int) -> str:
    pct = correct / total
    if pct == 1.0: return "PERFECT SCORE! 🌟 You're a genius!"
    if pct >= 0.8: return f"Brilliant! {correct}/{total} — almost perfect!"
    if pct >= 0.6: return f"Good job! {correct}/{total} — keep practising!"
    return f"Nice try! {correct}/{total} — you'll do even better tomorrow!"


@api_router.post("/inquisitive/video/complete")
async def iq_video_complete(req: IQVideoCompleteRequest):
    """Mark video watched, score quiz, award stars."""
    v = IQ_VIDEOS_BY_ID.get(req.video_id)
    if not v:
        raise HTTPException(status_code=404, detail="Video not found")
    questions = v.get("quiz_questions", [])
    correct = sum(1 for i, q in enumerate(questions)
                  if i < len(req.quiz_answers) and req.quiz_answers[i] == q.get("answer", 0))
    stars = max(1, correct)  # at least 1 star for watching
    today = (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).strftime("%Y-%m-%d")
    await db.iq_video_progress.update_one(
        {"user_id": req.user_id, "video_id": req.video_id},
        {"$set": {"watched": True, "quiz_score": correct, "stars": stars,
                  "last_watched": today, "watch_seconds": req.watch_duration_seconds}},
        upsert=True
    )
    await db.users.update_one({"user_id": req.user_id}, {"$inc": {"total_stars": stars}})
    return {"video_id": req.video_id, "quiz_correct": correct,
            "quiz_total": len(questions), "stars_earned": stars,
            "fact": v["fact"], "message": f"⭐ {stars} stars earned!"}


@api_router.get("/inquisitive/progress/{user_id}")
async def iq_get_progress(user_id: str):
    """Overall Inquisitive Kid progress for a user."""
    video_records = await db.iq_video_progress.find({"user_id": user_id}).to_list(200)
    exercise_records = await db.iq_exercises.find({"user_id": user_id, "completed": True}).to_list(100)
    return {
        "user_id": user_id,
        "videos_watched": len(video_records),
        "total_videos": len(IQ_CONTENT["videos"]),
        "exercises_completed": len(exercise_records),
        "total_stars_from_iq": sum(r.get("stars",0) for r in video_records) +
                               sum(r.get("stars_earned",0) for r in exercise_records),
        "videos": [{"video_id": r["video_id"], "score": r.get("quiz_score",0),
                    "stars": r.get("stars",0)} for r in video_records]
    }



# ═══════════════════════════════════════════════════════════════════════════════
# WORD SPARK — Daily vocabulary conversation
# ═══════════════════════════════════════════════════════════════════════════════

_WORD_SPARK_DATA: dict = {}
_MATHS_QUEST_DATA: dict = {}

def _load_word_spark():
    global _WORD_SPARK_DATA, _MATHS_QUEST_DATA
    try:
        ws_path = ROOT_DIR / "data" / "word_spark.json"
        mq_path = ROOT_DIR / "data" / "maths_quest.json"
        if ws_path.exists():
            with open(ws_path) as f:
                _WORD_SPARK_DATA = json.load(f)
            logging.info(f"Word Spark loaded: {len(_WORD_SPARK_DATA.get('words',[]))} words")
        if mq_path.exists():
            with open(mq_path) as f:
                _MATHS_QUEST_DATA = json.load(f)
            logging.info(f"Maths Quest loaded: {len(_MATHS_QUEST_DATA.get('puzzles',[]))} puzzles")
    except Exception as e:
        logging.error(f"Error loading Word Spark / Maths Quest: {e}")

_load_word_spark()

def _day_of_year():
    from datetime import date
    d = date.today()
    return d.timetuple().tm_yday  # 1-365

@api_router.get("/word-spark/{class_id}")
async def get_word_spark(class_id: str):
    """Return today's Word Spark for a given class."""
    try:
        words = _WORD_SPARK_DATA.get("words", [])
        # Filter to class
        class_words = [w for w in words if class_id in w.get("class_groups", [])]
        if not class_words:
            # Fallback to class1 words
            class_words = [w for w in words if "class1" in w.get("class_groups", [])]
        if not class_words:
            raise HTTPException(status_code=404, detail="No words found for this class")
        # Rotate by day of year
        idx = (_day_of_year() - 1) % len(class_words)
        word = class_words[idx]
        return {"success": True, "word": word, "day": _day_of_year(), "total_words": len(class_words)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class WordSparkCompleteRequest(BaseModel):
    user_id: str
    word: str
    class_id: str
    sentence_made: Optional[str] = None

@api_router.post("/word-spark/complete")
async def complete_word_spark(req: WordSparkCompleteRequest):
    """Mark today's Word Spark as completed and award stars."""
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        # Check if already done today
        existing = await db.word_spark_progress.find_one({
            "user_id": req.user_id, "date": today
        })
        if existing:
            return {"success": True, "stars_earned": 0, "message": "Already completed today!", "already_done": True}

        stars = 3
        record = {
            "user_id": req.user_id,
            "word": req.word,
            "class_id": req.class_id,
            "date": today,
            "sentence_made": req.sentence_made or "",
            "stars_earned": stars,
            "completed_at": datetime.utcnow()
        }
        await db.word_spark_progress.insert_one(record)
        # Add stars to user
        await db.users.update_one({"user_id": req.user_id}, {"$inc": {"stars": stars}})
        return {"success": True, "stars_earned": stars, "message": f"Amazing! You earned {stars} stars for learning today's Word Spark!", "already_done": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/word-spark/progress/{user_id}")
async def get_word_spark_progress(user_id: str):
    """Get user's Word Spark history."""
    try:
        records = await db.word_spark_progress.find(
            {"user_id": user_id}, {"_id": 0}
        ).sort("date", -1).limit(30).to_list(30)
        total_stars = sum(r.get("stars_earned", 0) for r in records)
        return {"success": True, "streak": len(records), "total_stars": total_stars, "history": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
# MATHS QUEST — Daily thinking puzzle
# ═══════════════════════════════════════════════════════════════════════════════

@api_router.get("/maths-quest/{class_id}")
async def get_maths_quest(class_id: str, puzzle_type: Optional[str] = None):
    """Return today's Maths Quest puzzle for a class."""
    try:
        puzzles = _MATHS_QUEST_DATA.get("puzzles", [])
        # Filter by class
        class_puzzles = [p for p in puzzles if class_id in p.get("class_groups", [])]
        if not class_puzzles:
            class_puzzles = [p for p in puzzles if "class3" in p.get("class_groups", [])]
        if puzzle_type:
            filtered = [p for p in class_puzzles if p.get("type") == puzzle_type]
            if filtered:
                class_puzzles = filtered
        if not class_puzzles:
            raise HTTPException(status_code=404, detail="No puzzles found")
        # Rotate daily
        idx = (_day_of_year() - 1) % len(class_puzzles)
        puzzle = class_puzzles[idx].copy()
        # Don't send answer to frontend initially
        puzzle_safe = {k: v for k, v in puzzle.items() if k != "answer" and k != "explanation"}
        return {"success": True, "puzzle": puzzle_safe, "total_puzzles": len(class_puzzles)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/maths-quest/hint/{puzzle_id}")
async def get_maths_quest_hint(puzzle_id: str, hint_number: int = 1):
    """Return hint 1 or hint 2 for a puzzle."""
    try:
        puzzles = _MATHS_QUEST_DATA.get("puzzles", [])
        puzzle = next((p for p in puzzles if p["id"] == puzzle_id), None)
        if not puzzle:
            raise HTTPException(status_code=404, detail="Puzzle not found")
        hint = puzzle.get(f"hint{hint_number}", "Think carefully about the clues given!")
        return {"success": True, "hint": hint, "hint_number": hint_number}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MathsQuestAttemptRequest(BaseModel):
    user_id: str
    puzzle_id: str
    answer_given: str
    hints_used: int = 0
    time_taken_seconds: Optional[int] = None

@api_router.post("/maths-quest/attempt")
async def submit_maths_quest(req: MathsQuestAttemptRequest):
    """Submit a Maths Quest answer, reveal full solution, award stars."""
    try:
        puzzles = _MATHS_QUEST_DATA.get("puzzles", [])
        puzzle = next((p for p in puzzles if p["id"] == req.puzzle_id), None)
        if not puzzle:
            raise HTTPException(status_code=404, detail="Puzzle not found")

        today = datetime.utcnow().strftime("%Y-%m-%d")
        # Stars: 3=no hints, 2=one hint, 1=two hints, 1=just revealed
        stars = max(1, 3 - req.hints_used)
        correct = req.answer_given.strip().lower() in puzzle.get("answer", "").lower()

        record = {
            "user_id": req.user_id,
            "puzzle_id": req.puzzle_id,
            "date": today,
            "answer_given": req.answer_given,
            "hints_used": req.hints_used,
            "stars_earned": stars if correct else 1,
            "correct": correct,
            "completed_at": datetime.utcnow()
        }
        await db.maths_quest_progress.insert_one(record)
        await db.users.update_one({"user_id": req.user_id}, {"$inc": {"stars": record["stars_earned"]}})

        return {
            "success": True,
            "correct": correct,
            "stars_earned": record["stars_earned"],
            "answer": puzzle.get("answer", ""),
            "explanation": puzzle.get("explanation", ""),
            "buddy_guide": puzzle.get("buddy_guide", ""),
            "message": "Brilliant thinking!" if correct else "Great effort! Here is how to solve it:"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/maths-quest/progress/{user_id}")
async def get_maths_quest_progress(user_id: str):
    """Get user's Maths Quest history and stats."""
    try:
        records = await db.maths_quest_progress.find(
            {"user_id": user_id}, {"_id": 0}
        ).sort("date", -1).limit(30).to_list(30)
        total_stars = sum(r.get("stars_earned", 0) for r in records)
        solved = sum(1 for r in records if r.get("correct"))
        return {"success": True, "total_attempted": len(records), "solved": solved, "total_stars": total_stars, "history": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
# MATH PLAY ZONE — Phase-based activities, interactive games, mindset
# ═══════════════════════════════════════════════════════════════════════════════

_MATH_PLAY_DATA: dict = {}

def _load_math_play():
    global _MATH_PLAY_DATA
    try:
        p = ROOT_DIR / "data" / "math_play.json"
        if p.exists():
            with open(p) as f:
                _MATH_PLAY_DATA = json.load(f)
            phases = len(_MATH_PLAY_DATA.get("phases", []))
            games  = len(_MATH_PLAY_DATA.get("daily_games", []))
            logging.info(f"Math Play loaded: {phases} phases, {games} games")
    except Exception as e:
        logging.error(f"Math Play load error: {e}")

_load_math_play()

@api_router.get("/math-play/phase/{class_id}")
async def get_math_play_phase(class_id: str):
    """Get the correct phase and activities for this class."""
    try:
        phases = _MATH_PLAY_DATA.get("phases", [])
        phase  = next((p for p in phases if class_id in p.get("class_groups", [])), phases[-1] if phases else None)
        if not phase:
            raise HTTPException(status_code=404, detail="Phase not found")
        return {"success": True, "phase": phase}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/math-play/tricks-new/{class_id}")
async def get_new_tricks(class_id: str):
    """Get new mental math tricks (not in maths_tricks.json)."""
    try:
        tricks = _MATH_PLAY_DATA.get("mental_math_tricks_new", [])
        filtered = [t for t in tricks if class_id in t.get("class_groups", [])]
        return {"success": True, "tricks": filtered, "total": len(filtered)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/math-play/games/{class_id}")
async def get_math_games(class_id: str):
    """Get interactive math games for a class."""
    try:
        games = _MATH_PLAY_DATA.get("daily_games", [])
        filtered = [g for g in games if class_id in g.get("class_groups", [])]
        return {"success": True, "games": filtered}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/math-play/mindset")
async def get_mindset_module():
    """Get Math Mindset content — affirmations, anxiety responses, boosters."""
    try:
        mindset = _MATH_PLAY_DATA.get("mindset_module", {})
        return {"success": True, "mindset": mindset}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MathPlayActivityRequest(BaseModel):
    user_id: str
    activity_id: str
    phase_id: str
    completed: bool = True
    stars_earned: int = 2

@api_router.post("/math-play/complete-activity")
async def complete_math_play_activity(req: MathPlayActivityRequest):
    """Mark a Math Play activity as done, award stars."""
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        existing = await db.math_play_progress.find_one({"user_id": req.user_id, "activity_id": req.activity_id, "date": today})
        if existing:
            return {"success": True, "stars_earned": 0, "already_done": True, "message": "Already done today!"}
        record = {
            "user_id": req.user_id,
            "activity_id": req.activity_id,
            "phase_id": req.phase_id,
            "date": today,
            "stars_earned": req.stars_earned,
            "completed_at": datetime.utcnow()
        }
        await db.math_play_progress.insert_one(record)
        await db.users.update_one({"user_id": req.user_id}, {"$inc": {"stars": req.stars_earned}})
        return {"success": True, "stars_earned": req.stars_earned, "already_done": False, "message": f"Great work! You earned {req.stars_earned} stars!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/math-play/progress/{user_id}")
async def get_math_play_progress(user_id: str):
    """Get user's Math Play history."""
    try:
        records = await db.math_play_progress.find({"user_id": user_id}, {"_id": 0}).sort("date", -1).limit(50).to_list(50)
        total_stars = sum(r.get("stars_earned", 0) for r in records)
        return {"success": True, "total_activities": len(records), "total_stars": total_stars, "history": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
# MISSIONS — Real-world math activities
# ═══════════════════════════════════════════════════════════════════════════════

_MISSIONS_DATA: dict = {}
_MINDSET_DATA: dict = {}

def _load_missions():
    global _MISSIONS_DATA, _MINDSET_DATA
    try:
        mp = ROOT_DIR / "data" / "missions.json"
        gp = ROOT_DIR / "data" / "growth_mindset.json"
        if mp.exists():
            with open(mp) as f: _MISSIONS_DATA = json.load(f)
        if gp.exists():
            with open(gp) as f: _MINDSET_DATA = json.load(f)
        logging.info(f"Missions loaded: {len(_MISSIONS_DATA.get('missions',[]))} missions, {len(_MINDSET_DATA.get('for_child',[]))} mindset cards")
    except Exception as e:
        logging.error(f"Missions load error: {e}")

_load_missions()

@api_router.get("/missions/{class_id}")
async def get_missions(class_id: str, phase: Optional[int] = None):
    """Return real-world math missions for a class."""
    try:
        missions = _MISSIONS_DATA.get("missions", [])
        filtered = [m for m in missions if class_id in m.get("class_groups", [])]
        if phase:
            filtered = [m for m in filtered if m.get("phase") == phase]
        return {"success": True, "missions": filtered, "total": len(filtered)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/missions/{mission_id}/complete")
async def complete_mission(mission_id: str, user_id: str, notes: Optional[str] = None):
    """Mark a mission as completed and award stars."""
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        existing = await db.mission_progress.find_one({"user_id": user_id, "mission_id": mission_id, "date": today})
        if existing:
            return {"success": True, "stars_earned": 0, "already_done": True}
        stars = 5
        await db.mission_progress.insert_one({
            "user_id": user_id, "mission_id": mission_id, "date": today,
            "notes": notes or "", "stars_earned": stars, "completed_at": datetime.utcnow()
        })
        await db.users.update_one({"user_id": user_id}, {"$inc": {"stars": stars}})
        return {"success": True, "stars_earned": stars, "message": "Excellent! Real-world maths completed! +5 stars!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/missions/progress/{user_id}")
async def get_mission_progress(user_id: str):
    """Get completed missions for user."""
    try:
        records = await db.mission_progress.find({"user_id": user_id}, {"_id": 0}).sort("date", -1).limit(50).to_list(50)
        return {"success": True, "completed": len(records), "total_stars": sum(r.get("stars_earned",0) for r in records), "history": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ═══════════════════════════════════════════════════════════════════════════════
# GROWTH MINDSET — For child and parent
# ═══════════════════════════════════════════════════════════════════════════════

@api_router.get("/mindset/child")
async def get_child_mindset():
    """Return growth mindset cards for the child."""
    try:
        return {"success": True, "cards": _MINDSET_DATA.get("for_child", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/mindset/parent")
async def get_parent_mindset():
    """Return growth mindset coaching tips for parents."""
    try:
        return {"success": True, "cards": _MINDSET_DATA.get("for_parent", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
# SCIENCE EXPLORER — Class 1–5 Biology, Chemistry, Physics, Space
# ═══════════════════════════════════════════════════════════════════════════════

_SCIENCE_DATA: dict = {}

def _load_science():
    global _SCIENCE_DATA
    try:
        p = ROOT_DIR / "data" / "science_explorer.json"
        if p.exists():
            with open(p) as f:
                _SCIENCE_DATA = json.load(f)
            mods = len(_SCIENCE_DATA.get("modules", []))
            exps = len(_SCIENCE_DATA.get("experiments", []))
            logging.info(f"Science Explorer loaded: {mods} modules, {exps} experiments")
    except Exception as e:
        logging.error(f"Science load error: {e}")

_load_science()

def _get_science_module(class_id: str):
    for m in _SCIENCE_DATA.get("modules", []):
        if class_id in m.get("classes", []):
            return m
    return None

@api_router.get("/science/module/{class_id}")
async def get_science_module(class_id: str):
    """Get the science module and all subjects for a class."""
    try:
        module = _get_science_module(class_id)
        if not module:
            raise HTTPException(status_code=404, detail="Module not found for this class")
        subjects = module.get("subjects", {}).get(class_id, [])
        return {
            "success": True,
            "module_id": module["id"],
            "module_title": module["title"],
            "module_emoji": module["emoji"],
            "module_color": module["color"],
            "module_tagline": module["tagline"],
            "subjects": subjects
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/science/topic/{class_id}/{topic_id}")
async def get_science_topic(class_id: str, topic_id: str):
    """Get a specific topic with full content, buddy prompt and quiz."""
    try:
        module = _get_science_module(class_id)
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
        for subj in module.get("subjects", {}).get(class_id, []):
            for topic in subj.get("topics", []):
                if topic["id"] == topic_id:
                    return {"success": True, "topic": topic, "subject": subj["subject"], "subject_emoji": subj["emoji"]}
        raise HTTPException(status_code=404, detail="Topic not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/science/experiments/{class_id}")
async def get_science_experiments(class_id: str):
    """Get hands-on experiments for a class."""
    try:
        exps = [e for e in _SCIENCE_DATA.get("experiments", []) if class_id in e.get("class_groups", [])]
        return {"success": True, "experiments": exps, "total": len(exps)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/science/vocabulary/{class_id}")
async def get_science_vocabulary(class_id: str):
    """Get vocabulary flashcards for a class."""
    try:
        words = [v for v in _SCIENCE_DATA.get("vocabulary_cards", []) if class_id in v.get("class_groups", [])]
        return {"success": True, "vocabulary": words, "total": len(words)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/science/pathway")
async def get_science_pathway():
    """Get the full science pathway roadmap (Class 1 to 5)."""
    try:
        return {"success": True, "pathway": _SCIENCE_DATA.get("science_pathway", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ScienceQuizRequest(BaseModel):
    user_id: str
    topic_id: str
    class_id: str
    answers: List[int]
    subject: str

@api_router.post("/science/quiz/submit")
async def submit_science_quiz(req: ScienceQuizRequest):
    """Submit quiz answers for a science topic."""
    try:
        module = _get_science_module(req.class_id)
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
        topic = None
        for subj in module.get("subjects", {}).get(req.class_id, []):
            for t in subj.get("topics", []):
                if t["id"] == req.topic_id:
                    topic = t
                    break
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        questions = topic.get("quiz", [])
        if not questions:
            return {"success": True, "score": 0, "total": 0, "stars_earned": 0}
        correct = sum(1 for i, q in enumerate(questions) if i < len(req.answers) and req.answers[i] == q["ans"])
        total = len(questions)
        stars = round((correct / total) * 3) if total > 0 else 0
        today = datetime.utcnow().strftime("%Y-%m-%d")
        record = {
            "user_id": req.user_id, "topic_id": req.topic_id,
            "class_id": req.class_id, "subject": req.subject,
            "date": today, "score": correct, "total": total,
            "stars_earned": stars, "completed_at": datetime.utcnow()
        }
        await db.science_progress.insert_one(record)
        if stars > 0:
            await db.users.update_one({"user_id": req.user_id}, {"$inc": {"stars": stars}})
        msg = "Perfect score!" if correct == total else f"You got {correct} out of {total}!" if correct > 0 else "Keep practising — you'll get there!"
        return {"success": True, "score": correct, "total": total, "stars_earned": stars, "message": msg, "correct_answers": [q["ans"] for q in questions]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ScienceExpCompleteRequest(BaseModel):
    user_id: str
    experiment_id: str
    class_id: str
    stars_earned: int = 4

@api_router.post("/science/experiment/complete")
async def complete_science_experiment(req: ScienceExpCompleteRequest):
    """Mark an experiment as completed and award stars."""
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        existing = await db.science_progress.find_one({"user_id": req.user_id, "topic_id": req.experiment_id, "date": today})
        if existing:
            return {"success": True, "stars_earned": 0, "already_done": True, "message": "Already completed today!"}
        record = {
            "user_id": req.user_id, "topic_id": req.experiment_id,
            "class_id": req.class_id, "type": "experiment",
            "date": today, "stars_earned": req.stars_earned, "completed_at": datetime.utcnow()
        }
        await db.science_progress.insert_one(record)
        await db.users.update_one({"user_id": req.user_id}, {"$inc": {"stars": req.stars_earned}})
        return {"success": True, "stars_earned": req.stars_earned, "already_done": False, "message": f"Brilliant scientist! You earned {req.stars_earned} stars!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/science/progress/{user_id}")
async def get_science_progress(user_id: str):
    """Get user's science progress summary."""
    try:
        records = await db.science_progress.find({"user_id": user_id}, {"_id": 0}).sort("date", -1).limit(60).to_list(60)
        total_stars = sum(r.get("stars_earned", 0) for r in records)
        topics_done = len(set(r.get("topic_id", "") for r in records))
        subjects_done = list(set(r.get("subject", "") for r in records if r.get("subject")))
        return {"success": True, "topics_completed": topics_done, "total_stars": total_stars, "subjects": subjects_done, "history": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
# LET'S TALK TODAY — Daily AI conversation starter
# ═══════════════════════════════════════════════════════════════════════════════

_DAILY_TALK_DATA: dict = {}

def _load_daily_talk():
    global _DAILY_TALK_DATA
    try:
        p = ROOT_DIR / "data" / "daily_talk.json"
        if p.exists():
            with open(p) as f:
                _DAILY_TALK_DATA = json.load(f)
            logging.info(f"Daily Talk loaded: {len(_DAILY_TALK_DATA.get('topics',[]))} topics")
    except Exception as e:
        logging.error(f"Daily Talk load error: {e}")

_load_daily_talk()

@api_router.get("/daily-talk/{class_id}")
async def get_daily_talk(class_id: str):
    """Return today's conversation topic for the child's class."""
    try:
        topics = _DAILY_TALK_DATA.get("topics", [])
        class_topics = [t for t in topics if class_id in t.get("class_groups", [])]
        if not class_topics:
            class_topics = topics
        idx = (_day_of_year() - 1) % len(class_topics)
        return {"success": True, "topic": class_topics[idx], "day": _day_of_year()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DailyTalkCompleteRequest(BaseModel):
    user_id: str
    topic_theme: str
    duration_seconds: int = 0

@api_router.post("/daily-talk/complete")
async def complete_daily_talk(req: DailyTalkCompleteRequest):
    """Mark today's Let's Talk session as done and award stars."""
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        existing = await db.daily_talk_progress.find_one({"user_id": req.user_id, "date": today})
        if existing:
            return {"success": True, "stars_earned": 0, "already_done": True}
        stars = 3 if req.duration_seconds >= 120 else 2 if req.duration_seconds >= 60 else 1
        await db.daily_talk_progress.insert_one({
            "user_id": req.user_id, "topic": req.topic_theme,
            "date": today, "duration_seconds": req.duration_seconds,
            "stars_earned": stars, "completed_at": datetime.utcnow()
        })
        await db.users.update_one({"user_id": req.user_id}, {"$inc": {"stars": stars}})
        return {"success": True, "stars_earned": stars, "already_done": False,
                "message": f"Great conversation! You earned {stars} stars!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


app.include_router(api_router)


# ═══════════════════════════════════════════════════════════════════════════════
# BRAIN CHALLENGES — Riddles, lateral thinking, logic, number mysteries
# ═══════════════════════════════════════════════════════════════════════════════

_BRAIN_DATA: dict = {}
_SCI_ACTIVITIES: dict = {}
_GROWTH_DATA: dict = {}

def _load_extra_modules():
    global _BRAIN_DATA, _SCI_ACTIVITIES, _GROWTH_DATA
    for attr, fname in [('_BRAIN_DATA','brain_challenges.json'),
                        ('_SCI_ACTIVITIES','science_activities.json'),
                        ('_GROWTH_DATA','growth_mindset.json')]:
        try:
            p = ROOT_DIR / "data" / fname
            if p.exists():
                with open(p) as f:
                    globals()[attr] = json.load(f)
                logging.info(f"Loaded {fname}")
        except Exception as e:
            logging.error(f"Error loading {fname}: {e}")

_load_extra_modules()

@api_router.get("/brain-challenges/{class_id}")
async def get_brain_challenges(class_id: str, category: Optional[str] = None):
    challenges = _BRAIN_DATA.get("challenges", [])
    filtered   = [c for c in challenges if class_id in c.get("class_groups", [])]
    if category:
        filtered = [c for c in filtered if c.get("type") == category]
    day_idx = (_day_of_year() - 1) % max(len(filtered), 1)
    today   = filtered[day_idx] if filtered else None
    return {"success": True, "challenge": today, "all_categories": _BRAIN_DATA.get("category_labels", {}), "total": len(filtered)}

@api_router.get("/brain-challenges/all/{class_id}")
async def get_all_brain_challenges(class_id: str):
    challenges = [c for c in _BRAIN_DATA.get("challenges", []) if class_id in c.get("class_groups", [])]
    return {"success": True, "challenges": challenges}

class BrainAttemptRequest(BaseModel):
    user_id: str
    challenge_id: str
    hint_used: bool = False

@api_router.post("/brain-challenges/attempt")
async def brain_challenge_attempt(req: BrainAttemptRequest):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    stars = 2 if req.hint_used else 3
    existing = await db.brain_progress.find_one({"user_id": req.user_id, "challenge_id": req.challenge_id, "date": today})
    if existing:
        return {"success": True, "stars_earned": 0, "already_done": True}
    await db.brain_progress.insert_one({"user_id": req.user_id, "challenge_id": req.challenge_id, "date": today, "hint_used": req.hint_used, "stars_earned": stars, "completed_at": datetime.utcnow()})
    await db.users.update_one({"user_id": req.user_id}, {"$inc": {"stars": stars}})
    return {"success": True, "stars_earned": stars, "already_done": False}

# ── Science Activities ─────────────────────────────────────────────────────────
@api_router.get("/science-activities/animal-classification/{class_id}")
async def get_animal_classification(class_id: str):
    data = _SCI_ACTIVITIES.get("animal_classification", {})
    verts   = [g for g in data.get("vertebrates", []) if class_id in g.get("class_groups", [])]
    inverts = [g for g in data.get("invertebrates", []) if class_id in g.get("class_groups", [])]
    quiz    = [q for q in data.get("classification_quiz", []) if class_id in q.get("class_groups", [])]
    return {"success": True, "vertebrates": verts, "invertebrates": inverts, "quiz": quiz}

@api_router.get("/science-activities/nature-senses/{class_id}")
async def get_nature_senses(class_id: str):
    nd = _SCI_ACTIVITIES.get("nature_senses_detective", {})
    if class_id not in nd.get("class_groups", []):
        return {"success": False, "message": "Nature Senses Detective is for Classes LKG to 2"}
    return {"success": True, "activity": nd}

@api_router.get("/science-activities/mind-map/{class_id}")
async def get_science_mind_map(class_id: str):
    mm = _SCI_ACTIVITIES.get("mind_map", {})
    if class_id not in mm.get("class_groups", ["class3","class4","class5"]):
        return {"success": False, "message": "Mind Map is for Classes 3 to 5"}
    return {"success": True, "mind_map": mm}

# ── Growth Mindset ─────────────────────────────────────────────────────────────
@api_router.get("/growth-mindset/{class_id}")
async def get_growth_mindset(class_id: str):
    fc = _GROWTH_DATA.get("for_child", {})
    day_names = ["Monday","Tuesday","Wednesday","Thursday","Friday","Weekend","Weekend"]
    from datetime import date
    dow = date.today().weekday()
    day_name = day_names[dow]
    challenges = fc.get("daily_challenges", [])
    today_challenge = next((c for c in challenges if c["day_type"] == day_name), challenges[0] if challenges else None)
    return {"success": True, "today_challenge": today_challenge, "affirmations": fc.get("affirmations", []), "fixed_vs_growth": fc.get("fixed_vs_growth", []), "for_parent": _GROWTH_DATA.get("for_parent", {})}

@api_router.post("/growth-mindset/complete")
async def complete_growth_challenge(req: MathPlayActivityRequest):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    existing = await db.growth_progress.find_one({"user_id": req.user_id, "activity_id": req.activity_id, "date": today})
    if existing:
        return {"success": True, "stars_earned": 0, "already_done": True}
    await db.growth_progress.insert_one({"user_id": req.user_id, "activity_id": req.activity_id, "date": today, "stars_earned": req.stars_earned, "completed_at": datetime.utcnow()})
    await db.users.update_one({"user_id": req.user_id}, {"$inc": {"stars": req.stars_earned}})
    return {"success": True, "stars_earned": req.stars_earned, "already_done": False}

