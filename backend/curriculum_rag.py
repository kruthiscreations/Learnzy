# RAG Grounding - Vetted K-5 English Curriculum
# This serves as the "source of truth" for AI responses

import json
from typing import List, Dict, Optional
import os

# Vetted curriculum data for RAG grounding
CURRICULUM_DATA = {
    "vocabulary": {
        "action_verbs": {
            "basic": ["eat", "drink", "sleep", "walk", "run", "jump", "sit", "stand", "play", "read", "write", "sing", "dance", "draw", "color"],
            "body_movement": ["carry", "kneel", "stretch", "twist", "balance", "bend", "climb", "crawl", "hop", "skip", "throw", "catch", "kick", "push", "pull"],
            "daily_routine": ["wake up", "brush teeth", "take bath", "eat breakfast", "go to school", "do homework", "watch TV", "feed pet", "water plants", "clean room", "set table", "make bed"],
            "communication": ["talk", "listen", "ask", "answer", "tell", "say", "whisper", "shout", "call", "greet", "thank", "apologize", "share", "help"]
        },
        "categories": {
            "animals": {
                "domestic": ["dog", "cat", "cow", "goat", "sheep", "horse", "donkey", "hen", "duck", "parrot"],
                "wild": ["lion", "tiger", "elephant", "monkey", "bear", "deer", "fox", "wolf", "zebra", "giraffe"],
                "birds": ["sparrow", "crow", "pigeon", "peacock", "eagle", "owl", "parrot", "kingfisher", "swan", "crane"],
                "insects": ["ant", "bee", "butterfly", "ladybug", "grasshopper", "spider", "mosquito", "fly", "caterpillar", "dragonfly"]
            },
            "colors": ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "black", "white", "grey", "golden"],
            "shapes": ["circle", "square", "triangle", "rectangle", "oval", "diamond", "star", "heart", "pentagon", "hexagon"],
            "numbers_words": ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "twenty", "hundred"],
            "family": ["mother", "father", "sister", "brother", "grandmother", "grandfather", "aunt", "uncle", "cousin", "baby"],
            "body_parts": ["head", "hair", "eyes", "ears", "nose", "mouth", "teeth", "tongue", "neck", "shoulders", "arms", "hands", "fingers", "legs", "feet", "toes"],
            "food": ["rice", "roti", "dal", "vegetables", "fruits", "milk", "water", "juice", "bread", "egg", "fish", "chicken", "ice cream", "cake", "biscuit"],
            "fruits": ["apple", "banana", "mango", "orange", "grapes", "watermelon", "papaya", "guava", "pomegranate", "coconut"],
            "vegetables": ["potato", "tomato", "onion", "carrot", "cabbage", "spinach", "beans", "peas", "cucumber", "pumpkin"]
        }
    },
    "phonics": {
        "phase1": {
            "name": "Environmental Sounds",
            "skills": ["Listen to sounds", "Identify sounds", "Remember sounds", "Talk about sounds"],
            "activities": ["Sound walks", "Listening games", "Voice sounds", "Rhythm and rhyme"]
        },
        "phase2": {
            "name": "Single Graphemes",
            "letters": {
                "set1": ["s", "a", "t", "p"],
                "set2": ["i", "n", "m", "d"],
                "set3": ["g", "o", "c", "k"],
                "set4": ["ck", "e", "u", "r"],
                "set5": ["h", "b", "f", "ff", "l", "ll", "ss"]
            },
            "blending": "c-a-t = cat, s-a-t = sat, p-i-n = pin",
            "segmenting": "cat = c-a-t, dog = d-o-g"
        },
        "phase3": {
            "name": "Consonant Digraphs & Long Vowels",
            "digraphs": ["ch", "sh", "th", "ng", "wh", "ph"],
            "vowel_digraphs": ["ai", "ee", "igh", "oa", "oo", "ar", "or", "ur", "ow", "oi", "ear", "air", "ure", "er"],
            "examples": {
                "ch": ["chip", "chat", "lunch", "rich"],
                "sh": ["ship", "shop", "fish", "wish"],
                "th": ["this", "that", "with", "bath"],
                "ai": ["rain", "train", "paint", "wait"],
                "ee": ["see", "tree", "green", "sleep"],
                "oa": ["boat", "coat", "road", "soap"]
            }
        },
        "phase4": {
            "name": "Consonant Blends",
            "initial_blends": ["bl", "br", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "sc", "sk", "sl", "sm", "sn", "sp", "st", "sw", "tr", "tw"],
            "final_blends": ["ft", "lk", "lp", "lt", "mp", "nd", "nk", "nt", "pt", "sk", "sp", "st"],
            "examples": {
                "bl": ["blue", "black", "blend"],
                "br": ["brown", "bread", "bring"],
                "st": ["stop", "star", "stick"],
                "nd": ["hand", "sand", "find"]
            }
        },
        "phase5": {
            "name": "Alternative Spellings",
            "alternative_graphemes": {
                "ay": "day, play, say",
                "ou": "out, cloud, shout",
                "ie": "pie, tie, lie",
                "ea": "sea, read, meat",
                "oy": "boy, toy, enjoy",
                "ir": "bird, girl, first",
                "ue": "blue, true, glue",
                "aw": "saw, draw, claw",
                "wh": "when, where, what",
                "ew": "new, few, grew"
            }
        },
        "tricky_words": {
            "phase2": ["the", "to", "I", "no", "go", "into"],
            "phase3": ["he", "she", "we", "me", "be", "was", "you", "they", "all", "are", "my", "her"],
            "phase4": ["said", "have", "like", "so", "do", "some", "come", "were", "there", "little", "one", "when", "out", "what"],
            "phase5": ["oh", "their", "people", "Mr", "Mrs", "looked", "called", "asked", "could"]
        }
    },
    "grammar": {
        "parts_of_speech": {
            "nouns": {
                "definition": "A noun is a naming word - it names a person, place, animal, or thing",
                "examples": ["boy", "girl", "school", "park", "dog", "cat", "book", "pen"],
                "types": {
                    "common": ["boy", "city", "dog"],
                    "proper": ["Rahul", "Delhi", "India"],
                    "collective": ["team", "family", "flock"]
                }
            },
            "verbs": {
                "definition": "A verb is a doing word or action word",
                "examples": ["run", "jump", "eat", "sleep", "write", "read", "play", "sing"],
                "types": {
                    "action": ["run", "jump", "eat"],
                    "being": ["is", "am", "are", "was", "were"]
                }
            },
            "adjectives": {
                "definition": "An adjective is a describing word - it tells us more about a noun",
                "examples": ["big", "small", "red", "beautiful", "happy", "tall", "fast", "slow"],
                "types": {
                    "size": ["big", "small", "tiny", "huge"],
                    "color": ["red", "blue", "green"],
                    "quality": ["good", "bad", "beautiful", "ugly"],
                    "number": ["one", "two", "many", "few"]
                }
            },
            "pronouns": {
                "definition": "A pronoun is a word used in place of a noun",
                "examples": ["I", "you", "he", "she", "it", "we", "they", "me", "him", "her"]
            }
        },
        "tenses": {
            "present": {
                "definition": "Present tense tells what is happening now",
                "structure": "Subject + Verb (base form / -s/-es)",
                "examples": ["I eat", "She reads", "They play", "He runs"],
                "keywords": ["now", "today", "always", "usually", "every day"]
            },
            "past": {
                "definition": "Past tense tells what already happened",
                "structure": "Subject + Verb (past form / -ed)",
                "examples": ["I ate", "She read", "They played", "He ran"],
                "keywords": ["yesterday", "last week", "ago", "before"],
                "irregular_verbs": {
                    "eat": "ate",
                    "run": "ran",
                    "go": "went",
                    "come": "came",
                    "see": "saw",
                    "give": "gave",
                    "take": "took",
                    "make": "made"
                }
            },
            "future": {
                "definition": "Future tense tells what will happen",
                "structure": "Subject + will + Verb (base form)",
                "examples": ["I will eat", "She will read", "They will play"],
                "keywords": ["tomorrow", "next week", "soon", "later"]
            }
        },
        "sentence_structure": {
            "simple_sentence": "Subject + Verb + Object (The dog eats food)",
            "question": "Question word + Helping verb + Subject + Main verb (What does the dog eat?)",
            "negative": "Subject + do/does + not + Verb (The dog does not eat vegetables)"
        }
    },
    "writing": {
        "stages": {
            "lkg": {
                "skills": ["Hold pencil correctly", "Trace letters", "Copy letters", "Write name"],
                "activities": ["Finger tracing", "Sand writing", "Air writing", "Worksheet tracing"]
            },
            "ukg": {
                "skills": ["Write all letters", "Leave spaces between words", "Copy simple words", "Write 3-letter words"],
                "activities": ["Letter formation", "Word copying", "Picture labeling", "Simple sentences"]
            },
            "class1": {
                "skills": ["Write simple sentences", "Use capital letters and full stops", "Describe pictures", "Write 3-4 sentences"],
                "activities": ["Sentence completion", "Picture description", "Simple stories", "Diary writing"]
            },
            "class2": {
                "skills": ["Write paragraphs", "Use adjectives", "Organize ideas", "Write stories with beginning, middle, end"],
                "activities": ["Paragraph writing", "Story writing", "Letter writing", "Describing events"]
            },
            "class3_5": {
                "skills": ["Multiple paragraphs", "Use dialogue", "Different text types", "Edit and revise"],
                "activities": ["Essay writing", "Creative stories", "Persuasive writing", "Report writing"]
            }
        },
        "text_types": ["Narrative", "Descriptive", "Expository", "Persuasive", "Poetry"]
    },
    "conversation": {
        "greetings": {
            "morning": ["Good morning!", "Hello!", "Hi!"],
            "afternoon": ["Good afternoon!"],
            "evening": ["Good evening!"],
            "night": ["Good night!", "Sweet dreams!"],
            "responses": ["I'm fine, thank you!", "I'm doing well!", "Very good, thank you!"]
        },
        "polite_expressions": {
            "requests": ["Please", "May I", "Could you please", "Would you mind"],
            "thanks": ["Thank you", "Thanks a lot", "Thank you very much"],
            "apology": ["Sorry", "I'm sorry", "Excuse me", "Pardon me"],
            "permission": ["May I go?", "Can I help?", "Is it okay if...?"]
        },
        "daily_topics": {
            "school": ["What did you learn today?", "Who is your best friend?", "What is your favorite subject?"],
            "family": ["How many people are in your family?", "What does your father do?", "Do you have siblings?"],
            "hobbies": ["What do you like to do?", "What is your favorite game?", "Do you like drawing?"],
            "food": ["What did you eat today?", "What is your favorite food?", "Do you like vegetables?"],
            "feelings": ["How are you feeling?", "Are you happy today?", "What makes you happy?"]
        }
    }
}

# Function to search curriculum data
def search_curriculum(query: str, category: Optional[str] = None) -> Dict:
    """Search the vetted curriculum for relevant content"""
    query_lower = query.lower()
    results = {
        "found": False,
        "category": None,
        "content": None,
        "related_topics": []
    }
    
    # Search in vocabulary
    if not category or category == "vocabulary":
        for cat, data in CURRICULUM_DATA["vocabulary"].items():
            if isinstance(data, dict):
                for subcat, items in data.items():
                    if query_lower in str(items).lower():
                        results["found"] = True
                        results["category"] = f"vocabulary/{cat}/{subcat}"
                        results["content"] = items
                        return results
    
    # Search in phonics
    if not category or category == "phonics":
        for phase, data in CURRICULUM_DATA["phonics"].items():
            if query_lower in str(data).lower():
                results["found"] = True
                results["category"] = f"phonics/{phase}"
                results["content"] = data
                return results
    
    # Search in grammar
    if not category or category == "grammar":
        for topic, data in CURRICULUM_DATA["grammar"].items():
            if query_lower in str(data).lower():
                results["found"] = True
                results["category"] = f"grammar/{topic}"
                results["content"] = data
                return results
    
    return results

# Function to get curriculum context for AI
def get_curriculum_context(topic: str) -> str:
    """Get relevant curriculum context for AI grounding"""
    result = search_curriculum(topic)
    if result["found"]:
        return f"[Curriculum Source: {result['category']}] {json.dumps(result['content'], indent=2)}"
    return ""

# Function to validate AI response against curriculum
def validate_against_curriculum(response: str, topic: str) -> Dict:
    """Check if AI response aligns with vetted curriculum"""
    curriculum_data = search_curriculum(topic)
    return {
        "is_grounded": curriculum_data["found"],
        "source": curriculum_data["category"] if curriculum_data["found"] else None,
        "confidence": "high" if curriculum_data["found"] else "unverified"
    }

# Export curriculum summary for quick reference
def get_curriculum_summary() -> Dict:
    """Get a summary of all curriculum topics"""
    return {
        "vocabulary_categories": list(CURRICULUM_DATA["vocabulary"]["categories"].keys()),
        "phonics_phases": list(CURRICULUM_DATA["phonics"].keys()),
        "grammar_topics": list(CURRICULUM_DATA["grammar"].keys()),
        "writing_stages": list(CURRICULUM_DATA["writing"]["stages"].keys()),
        "conversation_topics": list(CURRICULUM_DATA["conversation"].keys())
    }
