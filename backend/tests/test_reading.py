import pytest
from fastapi import status
import io

class TestReading:
    @pytest.fixture
    def book_id(self, client, auth_headers):
        """Create a book and return its ID"""
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
        files = {"file": ("test.pdf", io.BytesIO(pdf_content), "application/pdf")}
        response = client.post("/api/books/upload", headers=auth_headers, files=files)
        return response.json()["id"]
    
    def test_create_reading_session(self, client, auth_headers, book_id):
        """Test creating a reading session"""
        session_data = {
            "book_id": book_id,
            "duration_minutes": 15,
            "start_page": 1
        }
        
        response = client.post("/api/reading/session", headers=auth_headers, json=session_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["book_id"] == book_id
        assert data["duration_minutes"] == 15
        assert data["start_page"] == 1
    
    def test_update_reading_session(self, client, auth_headers, book_id):
        """Test updating a reading session"""
        # Create a session first
        session_data = {
            "book_id": book_id,
            "duration_minutes": 10,
            "start_page": 1
        }
        create_response = client.post("/api/reading/session", headers=auth_headers, json=session_data)
        session_id = create_response.json()["id"]
        
        # Update the session
        update_data = {
            "end_page": 5,
            "words_encountered": 50,
            "words_saved": 3
        }
        response = client.put(f"/api/reading/session/{session_id}", headers=auth_headers, json=update_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["end_page"] == 5
        assert data["words_encountered"] == 50
        assert data["words_saved"] == 3
    
    def test_list_reading_sessions(self, client, auth_headers, book_id):
        """Test listing reading sessions"""
        # Create a session first
        session_data = {
            "book_id": book_id,
            "duration_minutes": 5,
            "start_page": 1
        }
        client.post("/api/reading/session", headers=auth_headers, json=session_data)
        
        # List sessions
        response = client.get("/api/reading/sessions", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_get_reading_stats(self, client, auth_headers, book_id):
        """Test getting reading statistics"""
        # Create a session first
        session_data = {
            "book_id": book_id,
            "duration_minutes": 20,
            "start_page": 1
        }
        client.post("/api/reading/session", headers=auth_headers, json=session_data)
        
        # Get stats
        response = client.get("/api/reading/stats", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total_sessions" in data
        assert "total_minutes" in data
        assert "total_books" in data
        assert "total_words_saved" in data
        assert "average_session_length" in data
    
    def test_get_timer_presets(self, client, auth_headers):
        """Test getting timer presets"""
        response = client.get("/api/reading/timer/presets", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        for preset in data:
            assert "minutes" in preset
            assert "label" in preset
