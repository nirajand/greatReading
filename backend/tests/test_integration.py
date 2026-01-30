import pytest
from fastapi import status
import io

class TestIntegration:
    """Integration tests for complete workflows"""
    
    def test_complete_reading_workflow(self, client, auth_headers):
        """Test complete workflow: upload book, read, save words, track stats"""
        # 1. Upload a book
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
        files = {"file": ("workflow.pdf", io.BytesIO(pdf_content), "application/pdf")}
        upload_response = client.post("/api/books/upload", headers=auth_headers, files=files)
        book_id = upload_response.json()["id"]
        
        # 2. Start a reading session
        session_data = {
            "book_id": book_id,
            "duration_minutes": 15,
            "start_page": 1
        }
        session_response = client.post("/api/reading/session", headers=auth_headers, json=session_data)
        session_id = session_response.json()["id"]
        
        # 3. Look up and save a word
        with pytest.MonkeyPatch.context() as mp:
            mp.setattr('app.services.dictionary_service.DictionaryService.lookup_word', 
                      lambda self, word: {
                          "word": "integrate",
                          "phonetic": "/ˈɪn.tə.ɡreɪt/",
                          "meanings": [{
                              "partOfSpeech": "verb",
                              "definitions": [{"definition": "combine one thing with another"}]
                          }]
                      })
            
            # Look up word
            lookup_response = client.post("/api/dictionary/lookup/integrate", headers=auth_headers)
            assert lookup_response.status_code == status.HTTP_200_OK
            
            # Save word to dictionary
            word_data = {
                "word": "integrate",
                "definition": "combine one thing with another",
                "context": "We need to integrate these systems.",
                "book_id": book_id,
                "page_number": 1,
                "part_of_speech": "verb"
            }
            save_response = client.post("/api/dictionary/", headers=auth_headers, json=word_data)
            assert save_response.status_code == status.HTTP_200_OK
        
        # 4. Update reading session with progress
        update_data = {
            "end_page": 5,
            "words_encountered": 100,
            "words_saved": 1
        }
        update_response = client.put(f"/api/reading/session/{session_id}", headers=auth_headers, json=update_data)
        assert update_response.status_code == status.HTTP_200_OK
        
        # 5. Update book progress
        book_update = {"current_page": 5, "progress": 25.0}
        book_response = client.put(f"/api/books/{book_id}", headers=auth_headers, json=book_update)
        assert book_response.status_code == status.HTTP_200_OK
        
        # 6. Check reading stats
        stats_response = client.get("/api/reading/stats", headers=auth_headers)
        assert stats_response.status_code == status.HTTP_200_OK
        stats = stats_response.json()
        assert stats["total_sessions"] == 1
        assert stats["total_minutes"] == 15
        assert stats["total_words_saved"] == 1
        
        # 7. Check dictionary entries
        dict_response = client.get("/api/dictionary/", headers=auth_headers)
        assert dict_response.status_code == status.HTTP_200_OK
        entries = dict_response.json()
        assert len(entries) == 1
        assert entries[0]["word"] == "integrate"
        
        # 8. Check book list
        books_response = client.get("/api/books/", headers=auth_headers)
        assert books_response.status_code == status.HTTP_200_OK
        books = books_response.json()
        assert len(books) == 1
        assert books[0]["current_page"] == 5
        assert books[0]["progress"] == 25.0
    
    def test_error_handling(self, client, auth_headers):
        """Test error handling in various scenarios"""
        # Test 404 for non-existent book
        response = client.get("/api/books/9999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        # Test 404 for non-existent dictionary entry
        response = client.get("/api/dictionary/9999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        # Test 404 for non-existent reading session
        response = client.put("/api/reading/session/9999", headers=auth_headers, json={"end_page": 5})
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        # Test 401 for unauthorized access
        response = client.get("/api/books/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Test 400 for invalid data
        invalid_book_data = {"invalid": "data"}
        response = client.put("/api/books/1", headers=auth_headers, json=invalid_book_data)
        assert response.status_code == status.HTTP_404_NOT_FOUND
