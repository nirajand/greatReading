import pytest
from fastapi import status
from unittest.mock import patch

class TestDictionary:
    def test_lookup_word(self, client, auth_headers):
        """Test looking up a word definition"""
        with patch('app.services.dictionary_service.DictionaryService.lookup_word') as mock_lookup:
            mock_lookup.return_value = {
                "word": "test",
                "phonetic": "/test/",
                "meanings": [{
                    "partOfSpeech": "noun",
                    "definitions": [{"definition": "a procedure intended to establish something"}]
                }]
            }
            
            response = client.post("/api/dictionary/lookup/test", headers=auth_headers)
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["word"] == "test"
            assert "meanings" in data
    
    def test_create_dictionary_entry(self, client, auth_headers):
        """Test saving a word to dictionary"""
        entry_data = {
            "word": "example",
            "definition": "a representative form or pattern",
            "context": "This is an example sentence.",
            "book_id": None,
            "page_number": None,
            "phonetic": "/ɪɡˈzæmpl/",
            "part_of_speech": "noun"
        }
        
        response = client.post("/api/dictionary/", headers=auth_headers, json=entry_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["word"] == "example"
        assert data["definition"] == entry_data["definition"]
        assert data["context"] == entry_data["context"]
    
    def test_list_dictionary_entries(self, client, auth_headers):
        """Test listing dictionary entries"""
        # Create an entry first
        entry_data = {
            "word": "test",
            "definition": "a test definition"
        }
        client.post("/api/dictionary/", headers=auth_headers, json=entry_data)
        
        # List entries
        response = client.get("/api/dictionary/", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_get_dictionary_entry(self, client, auth_headers):
        """Test getting a specific dictionary entry"""
        # Create an entry first
        entry_data = {
            "word": "specific",
            "definition": "clearly defined or identified"
        }
        create_response = client.post("/api/dictionary/", headers=auth_headers, json=entry_data)
        entry_id = create_response.json()["id"]
        
        # Get the entry
        response = client.get(f"/api/dictionary/{entry_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == entry_id
        assert data["word"] == "specific"
    
    def test_update_dictionary_entry(self, client, auth_headers):
        """Test updating a dictionary entry"""
        # Create an entry first
        entry_data = {
            "word": "update",
            "definition": "original definition"
        }
        create_response = client.post("/api/dictionary/", headers=auth_headers, json=entry_data)
        entry_id = create_response.json()["id"]
        
        # Update the entry
        update_data = {
            "definition": "updated definition",
            "mastered": 2
        }
        response = client.put(f"/api/dictionary/{entry_id}", headers=auth_headers, json=update_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["definition"] == "updated definition"
        assert data["mastered"] == 2
    
    def test_delete_dictionary_entry(self, client, auth_headers):
        """Test deleting a dictionary entry"""
        # Create an entry first
        entry_data = {
            "word": "delete",
            "definition": "to remove or erase"
        }
        create_response = client.post("/api/dictionary/", headers=auth_headers, json=entry_data)
        entry_id = create_response.json()["id"]
        
        # Delete the entry
        response = client.delete(f"/api/dictionary/{entry_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        
        # Verify it's deleted
        response = client.get(f"/api/dictionary/{entry_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND
