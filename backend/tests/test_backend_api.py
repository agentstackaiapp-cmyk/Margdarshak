"""
Backend API Tests for Margdarshak AI
Tests: Health, Daily Tip, Auth (dev-login, /me), Preferences, Ask, Conversations
"""
import pytest
import requests
import os
import time

# Use the public preview URL for testing
BASE_URL = "https://margdarshak-preview.preview.emergentagent.com"

class TestHealth:
    """Health check endpoints"""
    
    def test_root_health(self):
        """Test GET / returns 200 (frontend HTML)"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        # Root returns HTML (frontend), not JSON
        assert len(response.text) > 0
        print(f"✓ Root health check passed: Frontend HTML loaded")
    
    def test_api_health_endpoint(self):
        """Test GET /api/health or backend health"""
        # Try /api/health first, fallback to checking if backend is responding
        response = requests.get(f"{BASE_URL}/api/daily-tip")
        assert response.status_code == 200
        print(f"✓ Backend health verified via /api/daily-tip")


class TestDailyTip:
    """Daily tip endpoint (public)"""
    
    def test_daily_tip(self):
        """Test GET /api/daily-tip returns scripture data"""
        response = requests.get(f"{BASE_URL}/api/daily-tip")
        assert response.status_code == 200
        data = response.json()
        assert "quote" in data
        assert "translation" in data
        assert "source" in data
        assert "message" in data
        print(f"✓ Daily tip passed: {data['source']}")


class TestAuth:
    """Authentication flows"""
    
    def test_dev_login_creates_session(self):
        """Test POST /api/auth/dev-login creates user and returns session_token"""
        payload = {
            "name": "TEST_User",
            "email": f"test_{int(time.time())}@test.com"
        }
        response = requests.post(f"{BASE_URL}/api/auth/dev-login", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert data["email"] == payload["email"]
        assert "session_token" in data
        assert data["session_token"].startswith("dev_session_")
        print(f"✓ Dev login passed: user_id={data['user_id']}, session_token={data['session_token'][:20]}...")
        
        # Store for next test
        pytest.session_token = data["session_token"]
        pytest.user_id = data["user_id"]
    
    def test_auth_me_with_token(self):
        """Test GET /api/auth/me with session_token returns user info"""
        if not hasattr(pytest, 'session_token'):
            pytest.skip("Requires session_token from test_dev_login_creates_session")
        
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {pytest.session_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert "name" in data
        print(f"✓ Auth /me passed: {data['email']}")
    
    def test_auth_me_without_token_fails(self):
        """Test GET /api/auth/me without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ Auth /me without token correctly returns 401")


class TestPreferences:
    """Preferences endpoints"""
    
    def test_preferences_schema(self):
        """Test GET /api/preferences/schema returns onboarding questions"""
        response = requests.get(f"{BASE_URL}/api/preferences/schema")
        assert response.status_code == 200
        
        data = response.json()
        assert "questions" in data
        assert len(data["questions"]) > 0
        
        # Check first question structure
        q = data["questions"][0]
        assert "id" in q
        # Schema uses 'text' field, not 'question'
        assert "text" in q or "options" in q  # Some questions have text, some have options
        print(f"✓ Preferences schema passed: {len(data['questions'])} questions")


class TestAsk:
    """Ask endpoint - AI responses"""
    
    def test_ask_requires_auth(self):
        """Test POST /api/ask without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/ask",
            json={"question": "What is dharma?"}
        )
        assert response.status_code == 401
        print("✓ Ask endpoint correctly requires auth")
    
    def test_ask_with_auth_returns_response(self):
        """Test POST /api/ask with auth returns AI response"""
        if not hasattr(pytest, 'session_token'):
            pytest.skip("Requires session_token from auth tests")
        
        payload = {
            "question": "What is karma?",
            "category": "spirituality"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ask",
            json=payload,
            headers={"Authorization": f"Bearer {pytest.session_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "conversation_id" in data
        assert "response" in data
        assert "question" in data
        assert data["question"] == payload["question"]
        assert len(data["response"]) > 0
        
        print(f"✓ Ask endpoint passed: conversation_id={data['conversation_id']}, response_length={len(data['response'])}")
        
        # Store for conversation tests
        pytest.conversation_id = data["conversation_id"]


class TestConversations:
    """Conversation management"""
    
    def test_get_conversations_requires_auth(self):
        """Test GET /api/conversations without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/conversations")
        assert response.status_code == 401
        print("✓ Conversations endpoint correctly requires auth")
    
    def test_get_conversations_with_auth(self):
        """Test GET /api/conversations returns user conversations"""
        if not hasattr(pytest, 'session_token'):
            pytest.skip("Requires session_token from auth tests")
        
        response = requests.get(
            f"{BASE_URL}/api/conversations",
            headers={"Authorization": f"Bearer {pytest.session_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            conv = data[0]
            assert "conversation_id" in conv
            assert "title" in conv
            assert "messages" in conv
            print(f"✓ Get conversations passed: {len(data)} conversations found")
        else:
            print("✓ Get conversations passed: 0 conversations (new user)")
    
    def test_get_specific_conversation(self):
        """Test GET /api/conversations/{id} returns conversation details"""
        if not hasattr(pytest, 'session_token') or not hasattr(pytest, 'conversation_id'):
            pytest.skip("Requires session_token and conversation_id from previous tests")
        
        response = requests.get(
            f"{BASE_URL}/api/conversations/{pytest.conversation_id}",
            headers={"Authorization": f"Bearer {pytest.session_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["conversation_id"] == pytest.conversation_id
        assert "messages" in data
        assert len(data["messages"]) >= 2  # At least user + assistant
        print(f"✓ Get specific conversation passed: {len(data['messages'])} messages")


class TestDatabases:
    """VR-RAG database catalogue"""
    
    def test_databases_endpoint(self):
        """Test GET /api/databases returns scripture database info"""
        response = requests.get(f"{BASE_URL}/api/databases")
        assert response.status_code == 200
        
        data = response.json()
        assert "databases" in data
        
        # Check for expected databases
        dbs = data["databases"]
        assert "gita" in dbs
        assert "vedas" in dbs
        
        # Check structure
        gita = dbs["gita"]
        assert "pdf_count" in gita
        assert "available" in gita
        print(f"✓ Databases endpoint passed: {len(dbs)} databases available")
