"""
SpeakEasy Kids Pro - Backend API Tests
Testing: Health, Registration with phone_number, Words database, User operations
"""
import pytest
import requests
import os
import uuid

# Use production URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://daily-session-demo.preview.emergentagent.com'))

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_api_health(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        assert "version" in data
        print(f"✓ Health check passed: {data}")


class TestRegistration:
    """Registration API tests - includes phone_number field"""
    
    def test_register_user_with_phone_number(self):
        """Test POST /api/register with phone_number field"""
        unique_name = f"TEST_Child_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": unique_name,
            "age_group": "lkg-1st",
            "selected_character": "cat",
            "preferred_language": "telugu",
            "phone_number": "9876543210"
        }
        
        response = requests.post(f"{BASE_URL}/api/register", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        # Verify all fields are returned correctly
        assert data["name"] == unique_name
        assert data["age_group"] == "lkg-1st"
        assert data["selected_character"] == "cat"
        assert data["preferred_language"] == "telugu"
        assert data["phone_number"] == "9876543210"  # Key test for phone number
        assert data["current_level"] == "lkg-1st"
        assert "user_id" in data
        assert data["subscription_active"] == True
        print(f"✓ Registration with phone_number passed: user_id={data['user_id']}")
        
        # Verify user can be retrieved
        user_id = data["user_id"]
        get_response = requests.get(f"{BASE_URL}/api/user/{user_id}")
        assert get_response.status_code == 200
        
        retrieved_user = get_response.json()
        assert retrieved_user["phone_number"] == "9876543210"
        print(f"✓ User retrieval verified phone_number persisted")
    
    def test_register_user_without_phone_number(self):
        """Test POST /api/register without phone_number (default empty)"""
        unique_name = f"TEST_NoPhone_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": unique_name,
            "age_group": "2nd-3rd",
            "selected_character": "dog",
            "preferred_language": "hindi"
        }
        
        response = requests.post(f"{BASE_URL}/api/register", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["phone_number"] == ""  # Default empty string
        print(f"✓ Registration without phone_number passed")
    
    def test_register_all_age_groups(self):
        """Test registration for all 4 age groups"""
        age_groups = ["lkg-1st", "2nd-3rd", "4th-5th", "5th-adv"]
        characters = ["cat", "dog", "rabbit", "elephant"]
        
        for i, age_group in enumerate(age_groups):
            payload = {
                "name": f"TEST_AgeGroup_{age_group}_{uuid.uuid4().hex[:6]}",
                "age_group": age_group,
                "selected_character": characters[i],
                "preferred_language": "telugu",
                "phone_number": f"987654321{i}"
            }
            
            response = requests.post(f"{BASE_URL}/api/register", json=payload)
            assert response.status_code == 200
            
            data = response.json()
            assert data["age_group"] == age_group
            assert data["current_level"] == age_group
            print(f"✓ Age group {age_group} registration passed")


class TestWordsDatabase:
    """Words database tests - verifying 1000+ words"""
    
    def test_get_all_words(self):
        """Test GET /api/words returns 1000+ words"""
        response = requests.get(f"{BASE_URL}/api/words")
        assert response.status_code == 200
        
        words = response.json()
        assert len(words) >= 1000, f"Expected 1000+ words, got {len(words)}"
        print(f"✓ Total words: {len(words)}")
    
    def test_get_words_by_level_lkg_1st(self):
        """Test GET /api/words?level=lkg-1st returns 296 words"""
        response = requests.get(f"{BASE_URL}/api/words?level=lkg-1st")
        assert response.status_code == 200
        
        words = response.json()
        assert len(words) == 296, f"Expected 296 words for lkg-1st, got {len(words)}"
        
        # Verify word structure
        if words:
            word = words[0]
            assert "word_id" in word
            assert "word_english" in word
            assert "level" in word
            assert word["level"] == "lkg-1st"
        print(f"✓ lkg-1st level: {len(words)} words")
    
    def test_get_words_by_level_2nd_3rd(self):
        """Test GET /api/words?level=2nd-3rd returns 241 words"""
        response = requests.get(f"{BASE_URL}/api/words?level=2nd-3rd")
        assert response.status_code == 200
        
        words = response.json()
        assert len(words) == 241, f"Expected 241 words for 2nd-3rd, got {len(words)}"
        print(f"✓ 2nd-3rd level: {len(words)} words")
    
    def test_get_words_by_level_4th_5th(self):
        """Test GET /api/words?level=4th-5th returns 243 words"""
        response = requests.get(f"{BASE_URL}/api/words?level=4th-5th")
        assert response.status_code == 200
        
        words = response.json()
        assert len(words) == 243, f"Expected 243 words for 4th-5th, got {len(words)}"
        print(f"✓ 4th-5th level: {len(words)} words")
    
    def test_get_words_by_level_5th_adv(self):
        """Test GET /api/words?level=5th-adv returns 223 words"""
        response = requests.get(f"{BASE_URL}/api/words?level=5th-adv")
        assert response.status_code == 200
        
        words = response.json()
        assert len(words) == 223, f"Expected 223 words for 5th-adv, got {len(words)}"
        print(f"✓ 5th-adv level: {len(words)} words")
    
    def test_word_structure(self):
        """Test word structure has all required fields"""
        response = requests.get(f"{BASE_URL}/api/words?level=lkg-1st")
        assert response.status_code == 200
        
        words = response.json()
        assert len(words) > 0
        
        word = words[0]
        required_fields = ["word_id", "word_english", "meaning", "level", "category", "part_of_speech"]
        for field in required_fields:
            assert field in word, f"Missing field: {field}"
        
        print(f"✓ Word structure validated with all required fields")


class TestCharacters:
    """Character API tests"""
    
    def test_get_characters(self):
        """Test GET /api/characters returns all 4 characters"""
        response = requests.get(f"{BASE_URL}/api/characters")
        assert response.status_code == 200
        
        characters = response.json()
        expected_chars = ["cat", "dog", "rabbit", "elephant"]
        
        for char in expected_chars:
            assert char in characters, f"Missing character: {char}"
            assert "name" in characters[char]
            assert "personality" in characters[char]
            assert "greeting" in characters[char]
        
        print(f"✓ All 4 characters available: {list(characters.keys())}")


class TestUserOperations:
    """User CRUD operation tests"""
    
    @pytest.fixture
    def test_user(self):
        """Create a test user for user operations"""
        payload = {
            "name": f"TEST_UserOps_{uuid.uuid4().hex[:8]}",
            "age_group": "lkg-1st",
            "selected_character": "cat",
            "preferred_language": "telugu",
            "phone_number": "9999999999"
        }
        response = requests.post(f"{BASE_URL}/api/register", json=payload)
        return response.json()
    
    def test_get_user(self, test_user):
        """Test GET /api/user/{user_id}"""
        user_id = test_user["user_id"]
        response = requests.get(f"{BASE_URL}/api/user/{user_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["user_id"] == user_id
        assert data["phone_number"] == "9999999999"
        print(f"✓ Get user passed")
    
    def test_update_user_level(self, test_user):
        """Test PUT /api/user/{user_id}/level"""
        user_id = test_user["user_id"]
        response = requests.put(f"{BASE_URL}/api/user/{user_id}/level?level=2nd-3rd")
        assert response.status_code == 200
        
        # Verify level was updated
        get_response = requests.get(f"{BASE_URL}/api/user/{user_id}")
        assert get_response.status_code == 200
        assert get_response.json()["current_level"] == "2nd-3rd"
        print(f"✓ Update user level passed")
    
    def test_update_user_preferences(self, test_user):
        """Test PUT /api/user/{user_id}/preferences"""
        user_id = test_user["user_id"]
        payload = {
            "age_group": "4th-5th",
            "preferred_language": "hindi",
            "selected_character": "dog"
        }
        response = requests.put(f"{BASE_URL}/api/user/{user_id}/preferences", json=payload)
        assert response.status_code == 200
        
        # Verify preferences were updated
        get_response = requests.get(f"{BASE_URL}/api/user/{user_id}")
        data = get_response.json()
        assert data["age_group"] == "4th-5th"
        assert data["preferred_language"] == "hindi"
        assert data["selected_character"] == "dog"
        print(f"✓ Update user preferences passed")
    
    def test_get_nonexistent_user(self):
        """Test GET /api/user/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/user/invalid-user-id-12345")
        assert response.status_code == 404
        print(f"✓ Nonexistent user returns 404")


class TestProgress:
    """User progress API tests"""
    
    @pytest.fixture
    def test_user_progress(self):
        """Create a test user for progress tests"""
        payload = {
            "name": f"TEST_Progress_{uuid.uuid4().hex[:8]}",
            "age_group": "lkg-1st",
            "selected_character": "rabbit",
            "preferred_language": "telugu"
        }
        response = requests.post(f"{BASE_URL}/api/register", json=payload)
        return response.json()
    
    def test_get_user_progress(self, test_user_progress):
        """Test GET /api/progress/{user_id}"""
        user_id = test_user_progress["user_id"]
        response = requests.get(f"{BASE_URL}/api/progress/{user_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "user_id" in data
        assert "total_stars" in data
        assert "daily_streak" in data
        print(f"✓ Get user progress passed")
    
    def test_update_progress(self, test_user_progress):
        """Test POST /api/progress"""
        user_id = test_user_progress["user_id"]
        payload = {
            "user_id": user_id,
            "word_id": "lkg_001",
            "pronunciation_score": 85.0,
            "mastered": False
        }
        response = requests.post(f"{BASE_URL}/api/progress", json=payload)
        assert response.status_code == 200
        print(f"✓ Update progress passed")


class TestSubscription:
    """Subscription API tests (MOCKED)"""
    
    @pytest.fixture
    def test_user_sub(self):
        """Create a test user for subscription tests"""
        payload = {
            "name": f"TEST_Sub_{uuid.uuid4().hex[:8]}",
            "age_group": "lkg-1st",
            "selected_character": "elephant",
            "preferred_language": "hindi"
        }
        response = requests.post(f"{BASE_URL}/api/register", json=payload)
        return response.json()
    
    def test_get_subscription(self, test_user_sub):
        """Test GET /api/subscription/{user_id} - MOCKED"""
        user_id = test_user_sub["user_id"]
        response = requests.get(f"{BASE_URL}/api/subscription/{user_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "plan" in data
        assert "status" in data
        print(f"✓ Get subscription (MOCKED) passed: plan={data.get('plan')}")
    
    def test_create_subscription(self, test_user_sub):
        """Test POST /api/subscribe - MOCKED"""
        user_id = test_user_sub["user_id"]
        payload = {
            "user_id": user_id,
            "plan": "monthly",
            "payment_method": "mock"
        }
        response = requests.post(f"{BASE_URL}/api/subscribe", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "MOCKED" in data.get("note", "") or "mock" in str(data).lower()
        print(f"✓ Create subscription (MOCKED) passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
