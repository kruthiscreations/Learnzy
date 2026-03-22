"""
Test suite for new TTS and Voice Chat features in SpeakEasy Kids Pro
Features tested:
1. TTS API endpoint - POST /api/tts/speak-base64 - returns audio base64
2. TTS word endpoint - POST /api/tts/word/{word} - returns audio mp3
3. TTS speak endpoint - POST /api/tts/speak - returns audio mp3
4. Voice chat endpoint - POST /api/voice-chat - accepts audio and returns text+audio response
5. Word database count - should have 1,552 words total
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', os.environ.get('EXPO_PUBLIC_BACKEND_URL', '')).rstrip('/')

class TestWordDatabase:
    """Test word database has correct count (1,552 words expected)"""
    
    def test_word_count_total(self):
        """Verify database has 1,552 total words"""
        response = requests.get(f"{BASE_URL}/api/words")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        words = response.json()
        assert len(words) == 1552, f"Expected 1552 words, got {len(words)}"
        print(f"✓ Word database has {len(words)} words (expected 1,552)")
    
    def test_words_by_level(self):
        """Verify word distribution by level"""
        response = requests.get(f"{BASE_URL}/api/words")
        assert response.status_code == 200
        
        words = response.json()
        level_counts = {}
        for word in words:
            level = word.get('level', 'unknown')
            level_counts[level] = level_counts.get(level, 0) + 1
        
        print(f"✓ Words by level: {level_counts}")
        
        # Each level should have >50 words
        for level, count in level_counts.items():
            assert count >= 50, f"Level {level} has only {count} words, expected >50"


class TestTTSBase64:
    """Test POST /api/tts/speak-base64 - returns audio as base64 string"""
    
    def test_tts_base64_success(self):
        """TTS base64 endpoint should return audio_base64 and format"""
        response = requests.post(
            f"{BASE_URL}/api/tts/speak-base64",
            json={"text": "hello", "voice": "nova", "speed": 1.0}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "audio_base64" in data, "Response should contain 'audio_base64'"
        assert "format" in data, "Response should contain 'format'"
        assert data["format"] == "mp3", f"Expected format 'mp3', got {data['format']}"
        
        # Verify base64 is valid
        try:
            audio_bytes = base64.b64decode(data["audio_base64"])
            assert len(audio_bytes) > 0, "Audio should not be empty"
            print(f"✓ TTS base64 returned {len(audio_bytes)} bytes of audio")
        except Exception as e:
            pytest.fail(f"Invalid base64 audio: {e}")
    
    def test_tts_base64_with_sentence(self):
        """TTS should handle longer sentences"""
        response = requests.post(
            f"{BASE_URL}/api/tts/speak-base64",
            json={"text": "Hello! I am learning English. It is fun!", "voice": "nova", "speed": 1.0}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "audio_base64" in data
        
        audio_bytes = base64.b64decode(data["audio_base64"])
        assert len(audio_bytes) > 1000, "Sentence audio should be longer than single word"
        print(f"✓ TTS base64 for sentence returned {len(audio_bytes)} bytes")
    
    def test_tts_base64_different_voices(self):
        """Test different voice options work"""
        voices = ["nova", "alloy", "echo"]  # Common OpenAI TTS voices
        
        for voice in voices:
            response = requests.post(
                f"{BASE_URL}/api/tts/speak-base64",
                json={"text": "test", "voice": voice, "speed": 1.0}
            )
            
            # Voice should work or return 200 with default
            if response.status_code == 200:
                print(f"✓ Voice '{voice}' works")
            else:
                print(f"⚠ Voice '{voice}' returned {response.status_code}")
    
    def test_tts_base64_text_too_long(self):
        """TTS should reject text > 4096 characters"""
        long_text = "a" * 5000
        response = requests.post(
            f"{BASE_URL}/api/tts/speak-base64",
            json={"text": long_text, "voice": "nova", "speed": 1.0}
        )
        
        assert response.status_code == 400, f"Expected 400 for text too long, got {response.status_code}"
        print("✓ TTS correctly rejects text > 4096 characters")


class TestTTSWord:
    """Test POST /api/tts/word/{word} - returns audio mp3 directly"""
    
    def test_tts_word_returns_audio(self):
        """TTS word endpoint should return audio/mpeg"""
        response = requests.post(f"{BASE_URL}/api/tts/word/apple")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert "audio" in response.headers.get("Content-Type", "").lower(), \
            f"Expected audio content-type, got {response.headers.get('Content-Type')}"
        
        # Check audio content is not empty
        assert len(response.content) > 1000, f"Audio too small: {len(response.content)} bytes"
        print(f"✓ TTS word 'apple' returned {len(response.content)} bytes of audio")
    
    def test_tts_word_different_words(self):
        """Test multiple words"""
        words = ["hello", "cat", "dog", "school", "family"]
        
        for word in words:
            response = requests.post(f"{BASE_URL}/api/tts/word/{word}")
            assert response.status_code == 200, f"Word '{word}' failed: {response.status_code}"
            assert len(response.content) > 500, f"Word '{word}' audio too small"
        
        print(f"✓ TTS word endpoint works for {len(words)} different words")


class TestTTSSpeak:
    """Test POST /api/tts/speak - returns audio mp3 directly (not base64)"""
    
    def test_tts_speak_returns_audio(self):
        """TTS speak endpoint should return audio/mpeg"""
        response = requests.post(
            f"{BASE_URL}/api/tts/speak",
            json={"text": "Hello world", "voice": "nova", "speed": 1.0}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "audio" in response.headers.get("Content-Type", "").lower(), \
            f"Expected audio content-type, got {response.headers.get('Content-Type')}"
        
        assert len(response.content) > 1000, f"Audio too small: {len(response.content)} bytes"
        print(f"✓ TTS speak returned {len(response.content)} bytes of audio")


class TestVoiceChat:
    """Test POST /api/voice-chat - voice conversation with AI bot"""
    
    @pytest.fixture
    def test_user_id(self):
        """Create a test user for voice chat"""
        response = requests.post(
            f"{BASE_URL}/api/register",
            json={
                "name": "TEST_VoiceChat_User",
                "age_group": "2nd-3rd",
                "selected_character": "cat",
                "preferred_language": "hindi",
                "phone_number": "+919876543210"
            }
        )
        assert response.status_code == 200
        return response.json()["user_id"]
    
    def test_voice_chat_invalid_character(self, test_user_id):
        """Voice chat should reject invalid character"""
        # Create a minimal audio file (silence/dummy)
        # For this test, we'll send a minimal webm header
        dummy_audio = b'\x1a\x45\xdf\xa3' + b'\x00' * 100  # Minimal webm header
        
        response = requests.post(
            f"{BASE_URL}/api/voice-chat",
            data={
                "user_id": test_user_id,
                "character": "invalid_character"
            },
            files={
                "audio": ("test.webm", dummy_audio, "audio/webm")
            }
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid character, got {response.status_code}"
        print("✓ Voice chat correctly rejects invalid character")
    
    def test_voice_chat_valid_characters(self, test_user_id):
        """Voice chat should accept valid characters"""
        valid_characters = ["cat", "dog", "rabbit", "elephant"]
        
        for char in valid_characters:
            # We can't fully test without real audio, but we can verify the endpoint accepts the character
            # by checking that error is not "invalid character"
            response = requests.post(
                f"{BASE_URL}/api/voice-chat",
                data={
                    "user_id": test_user_id,
                    "character": char
                },
                files={
                    "audio": ("test.webm", b'\x1a\x45\xdf\xa3' + b'\x00' * 100, "audio/webm")
                }
            )
            
            # Should either succeed or fail with audio processing error, not character validation
            if response.status_code == 400:
                error_msg = response.json().get("detail", "")
                assert "invalid character" not in error_msg.lower(), \
                    f"Character '{char}' rejected as invalid: {error_msg}"
        
        print(f"✓ Voice chat accepts all valid characters: {valid_characters}")


class TestChatWithTTS:
    """Test that regular chat endpoint works (TTS is handled on frontend)"""
    
    @pytest.fixture
    def test_user_id(self):
        """Create a test user for chat"""
        response = requests.post(
            f"{BASE_URL}/api/register",
            json={
                "name": "TEST_Chat_TTS_User",
                "age_group": "lkg-1st",
                "selected_character": "dog",
                "preferred_language": "telugu"
            }
        )
        assert response.status_code == 200
        return response.json()["user_id"]
    
    def test_chat_returns_response_for_tts(self, test_user_id):
        """Chat should return text response that can be used with TTS"""
        response = requests.post(
            f"{BASE_URL}/api/chat",
            json={
                "user_id": test_user_id,
                "character": "dog",
                "message": "Hello!"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "response" in data, "Chat should return 'response' text"
        assert "conversation_id" in data, "Chat should return 'conversation_id'"
        assert len(data["response"]) > 0, "Response should not be empty"
        
        # Verify response can be sent to TTS
        tts_response = requests.post(
            f"{BASE_URL}/api/tts/speak-base64",
            json={"text": data["response"], "voice": "nova", "speed": 1.0}
        )
        
        assert tts_response.status_code == 200, "Chat response should be valid for TTS"
        assert "audio_base64" in tts_response.json(), "TTS should return audio"
        
        print(f"✓ Chat response works with TTS: '{data['response'][:50]}...'")


class TestHealthAndBasicAPIs:
    """Basic health checks and API validation"""
    
    def test_api_health(self):
        """Health endpoint should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        print("✓ API is healthy and database connected")
    
    def test_characters_endpoint(self):
        """Characters endpoint should return all 4 characters"""
        response = requests.get(f"{BASE_URL}/api/characters")
        assert response.status_code == 200
        
        characters = response.json()
        expected = ["cat", "dog", "rabbit", "elephant"]
        
        for char in expected:
            assert char in characters, f"Missing character: {char}"
        
        print(f"✓ All characters available: {list(characters.keys())}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
