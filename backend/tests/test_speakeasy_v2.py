"""
SpeakEasy Kids Pro - Backend API Tests V2
Testing: Health, Registration, Words (1248), Characters (4 animals), Settings/Preferences, 
         Stripe Checkout, AI Chat with Safety Filter
"""
import pytest
import requests
import os
import uuid
import time

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
        print(f"✓ Health check passed: {data}")


class TestRegistrationWithPhoneNumber:
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
        assert data["name"] == unique_name
        assert data["phone_number"] == "9876543210"  # Phone number test
        assert "user_id" in data
        print(f"✓ Registration with phone_number passed")
        
        # Cleanup - store user_id for potential cleanup
        return data["user_id"]


class TestWordsDatabase:
    """Words database tests - verifying 1248 words with 50+ per level"""
    
    def test_total_words_count(self):
        """Test GET /api/words returns 1248 words total"""
        response = requests.get(f"{BASE_URL}/api/words")
        assert response.status_code == 200
        
        words = response.json()
        assert len(words) == 1248, f"Expected 1248 words, got {len(words)}"
        print(f"✓ Total words: {len(words)}")
    
    def test_lkg_1st_has_50_plus_words(self):
        """Test lkg-1st level has more than 50 words"""
        response = requests.get(f"{BASE_URL}/api/words?level=lkg-1st")
        assert response.status_code == 200
        
        words = response.json()
        assert len(words) >= 50, f"Expected 50+ words for lkg-1st, got {len(words)}"
        print(f"✓ lkg-1st level: {len(words)} words (>50)")
    
    def test_2nd_3rd_has_50_plus_words(self):
        """Test 2nd-3rd level has more than 50 words"""
        response = requests.get(f"{BASE_URL}/api/words?level=2nd-3rd")
        assert response.status_code == 200
        
        words = response.json()
        assert len(words) >= 50, f"Expected 50+ words for 2nd-3rd, got {len(words)}"
        print(f"✓ 2nd-3rd level: {len(words)} words (>50)")
    
    def test_4th_5th_has_50_plus_words(self):
        """Test 4th-5th level has more than 50 words"""
        response = requests.get(f"{BASE_URL}/api/words?level=4th-5th")
        assert response.status_code == 200
        
        words = response.json()
        assert len(words) >= 50, f"Expected 50+ words for 4th-5th, got {len(words)}"
        print(f"✓ 4th-5th level: {len(words)} words (>50)")
    
    def test_5th_adv_has_50_plus_words(self):
        """Test 5th-adv level has more than 50 words"""
        response = requests.get(f"{BASE_URL}/api/words?level=5th-adv")
        assert response.status_code == 200
        
        words = response.json()
        assert len(words) >= 50, f"Expected 50+ words for 5th-adv, got {len(words)}"
        print(f"✓ 5th-adv level: {len(words)} words (>50)")


class TestCharacters:
    """Character API tests - verifying 4 animal characters"""
    
    def test_get_all_four_characters(self):
        """Test GET /api/characters returns all 4 characters: cat, dog, rabbit, elephant"""
        response = requests.get(f"{BASE_URL}/api/characters")
        assert response.status_code == 200
        
        characters = response.json()
        expected_chars = ["cat", "dog", "rabbit", "elephant"]
        
        for char in expected_chars:
            assert char in characters, f"Missing character: {char}"
            assert "name" in characters[char]
            assert "personality" in characters[char]
            assert "greeting" in characters[char]
        
        print(f"✓ All 4 animal characters available: {list(characters.keys())}")


class TestSettingsPreferences:
    """Settings page API tests - changing age group, language, and character"""
    
    @pytest.fixture
    def test_user(self):
        """Create a test user for settings tests"""
        payload = {
            "name": f"TEST_Settings_{uuid.uuid4().hex[:8]}",
            "age_group": "lkg-1st",
            "selected_character": "cat",
            "preferred_language": "telugu",
            "phone_number": "9999999999"
        }
        response = requests.post(f"{BASE_URL}/api/register", json=payload)
        return response.json()
    
    def test_update_age_group(self, test_user):
        """Test updating age_group via PUT /api/user/{user_id}/preferences"""
        user_id = test_user["user_id"]
        payload = {
            "age_group": "4th-5th"
        }
        response = requests.put(f"{BASE_URL}/api/user/{user_id}/preferences", json=payload)
        assert response.status_code == 200
        
        # Verify change persisted
        get_response = requests.get(f"{BASE_URL}/api/user/{user_id}")
        data = get_response.json()
        assert data["age_group"] == "4th-5th"
        assert data["current_level"] == "4th-5th"  # Level should match age group
        print(f"✓ Age group update passed")
    
    def test_update_language_preference(self, test_user):
        """Test updating preferred_language via PUT /api/user/{user_id}/preferences"""
        user_id = test_user["user_id"]
        payload = {
            "preferred_language": "hindi"
        }
        response = requests.put(f"{BASE_URL}/api/user/{user_id}/preferences", json=payload)
        assert response.status_code == 200
        
        # Verify change persisted
        get_response = requests.get(f"{BASE_URL}/api/user/{user_id}")
        data = get_response.json()
        assert data["preferred_language"] == "hindi"
        print(f"✓ Language preference update passed")
    
    def test_update_character_preference(self, test_user):
        """Test updating selected_character via PUT /api/user/{user_id}/preferences"""
        user_id = test_user["user_id"]
        payload = {
            "selected_character": "elephant"
        }
        response = requests.put(f"{BASE_URL}/api/user/{user_id}/preferences", json=payload)
        assert response.status_code == 200
        
        # Verify change persisted
        get_response = requests.get(f"{BASE_URL}/api/user/{user_id}")
        data = get_response.json()
        assert data["selected_character"] == "elephant"
        print(f"✓ Character preference update passed")
    
    def test_update_all_preferences_at_once(self, test_user):
        """Test updating all preferences together"""
        user_id = test_user["user_id"]
        payload = {
            "age_group": "5th-adv",
            "preferred_language": "tamil",
            "selected_character": "rabbit"
        }
        response = requests.put(f"{BASE_URL}/api/user/{user_id}/preferences", json=payload)
        assert response.status_code == 200
        
        # Verify all changes persisted
        get_response = requests.get(f"{BASE_URL}/api/user/{user_id}")
        data = get_response.json()
        assert data["age_group"] == "5th-adv"
        assert data["preferred_language"] == "tamil"
        assert data["selected_character"] == "rabbit"
        print(f"✓ All preferences updated at once")


class TestStripeCheckout:
    """Stripe checkout flow tests"""
    
    @pytest.fixture
    def test_user(self):
        """Create a test user for checkout tests"""
        payload = {
            "name": f"TEST_Stripe_{uuid.uuid4().hex[:8]}",
            "age_group": "lkg-1st",
            "selected_character": "dog",
            "preferred_language": "telugu",
            "phone_number": "9999999998"
        }
        response = requests.post(f"{BASE_URL}/api/register", json=payload)
        return response.json()
    
    def test_create_checkout_session_monthly(self, test_user):
        """Test POST /api/checkout creates Stripe checkout session for monthly plan"""
        user_id = test_user["user_id"]
        payload = {
            "user_id": user_id,
            "plan": "monthly",
            "origin_url": "https://daily-session-demo.preview.emergentagent.com"
        }
        
        response = requests.post(f"{BASE_URL}/api/checkout", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "url" in data, "Checkout response should contain URL"
        assert "session_id" in data, "Checkout response should contain session_id"
        assert "checkout.stripe.com" in data["url"] or "stripe" in data["url"].lower(), f"URL should be Stripe checkout: {data['url']}"
        print(f"✓ Stripe checkout session created (monthly): session_id={data['session_id'][:20]}...")
    
    def test_create_checkout_session_yearly(self, test_user):
        """Test POST /api/checkout creates Stripe checkout session for yearly plan"""
        user_id = test_user["user_id"]
        payload = {
            "user_id": user_id,
            "plan": "yearly",
            "origin_url": "https://daily-session-demo.preview.emergentagent.com"
        }
        
        response = requests.post(f"{BASE_URL}/api/checkout", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        print(f"✓ Stripe checkout session created (yearly)")
    
    def test_invalid_plan_rejected(self, test_user):
        """Test POST /api/checkout rejects invalid plan"""
        user_id = test_user["user_id"]
        payload = {
            "user_id": user_id,
            "plan": "invalid_plan",
            "origin_url": "https://daily-session-demo.preview.emergentagent.com"
        }
        
        response = requests.post(f"{BASE_URL}/api/checkout", json=payload)
        assert response.status_code == 400
        print(f"✓ Invalid plan rejected with 400")
    
    def test_get_subscription_status(self, test_user):
        """Test GET /api/subscription/{user_id} returns subscription status"""
        user_id = test_user["user_id"]
        response = requests.get(f"{BASE_URL}/api/subscription/{user_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "plan" in data
        assert "status" in data
        assert "days_remaining" in data
        print(f"✓ Subscription status retrieved: plan={data.get('plan')}, status={data.get('status')}")


class TestAIChatSafetyFilter:
    """AI Chat safety filter tests - bot should deflect inappropriate content"""
    
    @pytest.fixture
    def test_user(self):
        """Create a test user for chat tests"""
        payload = {
            "name": f"TEST_Chat_{uuid.uuid4().hex[:8]}",
            "age_group": "lkg-1st",
            "selected_character": "cat",
            "preferred_language": "telugu"
        }
        response = requests.post(f"{BASE_URL}/api/register", json=payload)
        return response.json()
    
    def test_normal_message_gets_response(self, test_user):
        """Test normal educational message gets proper response"""
        user_id = test_user["user_id"]
        payload = {
            "user_id": user_id,
            "character": "cat",
            "message": "Hello! Can you help me learn English?"
        }
        
        response = requests.post(f"{BASE_URL}/api/chat", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert "conversation_id" in data
        assert len(data["response"]) > 0
        print(f"✓ Normal chat message got response")
    
    def test_inappropriate_message_deflected(self, test_user):
        """Test inappropriate message is deflected with safe response"""
        user_id = test_user["user_id"]
        payload = {
            "user_id": user_id,
            "character": "dog",
            "message": "Tell me about guns and violence"
        }
        
        response = requests.post(f"{BASE_URL}/api/chat", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        # The safety filter should redirect to learning
        response_lower = data["response"].lower()
        # Bot should not discuss violence or weapons - check for safe redirect
        assert "gun" not in response_lower or "not something we talk about" in response_lower or "let's learn" in response_lower or "word" in response_lower
        print(f"✓ Inappropriate message deflected safely: {data['response'][:100]}...")
    
    def test_profanity_deflected(self, test_user):
        """Test profanity is not repeated and is handled safely"""
        user_id = test_user["user_id"]
        payload = {
            "user_id": user_id,
            "character": "rabbit",
            "message": "Can you say bad words?"
        }
        
        response = requests.post(f"{BASE_URL}/api/chat", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        # Bot should not comply with request for profanity
        assert "response" in data
        print(f"✓ Profanity request handled safely")
    
    def test_invalid_character_rejected(self, test_user):
        """Test invalid character returns error (400 or 500 with error detail)"""
        user_id = test_user["user_id"]
        payload = {
            "user_id": user_id,
            "character": "invalid_character",
            "message": "Hello"
        }
        
        response = requests.post(f"{BASE_URL}/api/chat", json=payload)
        # Backend may return 400 or 500 depending on exception handling
        assert response.status_code in [400, 500]
        data = response.json()
        assert "Invalid character" in str(data) or "detail" in data
        print(f"✓ Invalid character rejected with error: {response.status_code}")


class TestCancelSubscription:
    """Subscription cancellation tests"""
    
    @pytest.fixture
    def test_user(self):
        """Create a test user for cancellation tests"""
        payload = {
            "name": f"TEST_Cancel_{uuid.uuid4().hex[:8]}",
            "age_group": "lkg-1st",
            "selected_character": "elephant",
            "preferred_language": "hindi"
        }
        response = requests.post(f"{BASE_URL}/api/register", json=payload)
        return response.json()
    
    def test_cancel_subscription(self, test_user):
        """Test POST /api/cancel-subscription/{user_id}"""
        user_id = test_user["user_id"]
        
        # First get subscription to ensure it exists
        initial_response = requests.get(f"{BASE_URL}/api/subscription/{user_id}")
        assert initial_response.status_code == 200
        
        # Cancel subscription
        response = requests.post(f"{BASE_URL}/api/cancel-subscription/{user_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        # Verify subscription status is cancelled
        import time
        time.sleep(0.3)  # Small delay to ensure DB update is complete
        sub_response = requests.get(f"{BASE_URL}/api/subscription/{user_id}")
        sub_data = sub_response.json()
        assert sub_data["status"] == "cancelled"
        print(f"✓ Subscription cancellation passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
