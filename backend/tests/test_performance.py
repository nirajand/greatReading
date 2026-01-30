import pytest
import time
from fastapi import status
import io

class TestPerformance:
    """Performance tests for critical endpoints"""
    
    @pytest.mark.performance
    def test_book_list_performance(self, client, auth_headers):
        """Test performance of book listing with many books"""
        # Upload multiple books
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
        
        start_time = time.time()
        for i in range(5):  # Upload 5 books
            files = {"file": (f"book{i}.pdf", io.BytesIO(pdf_content), "application/pdf")}
            client.post("/api/books/upload", headers=auth_headers, files=files)
        upload_time = time.time() - start_time
        
        # Test listing performance
        start_time = time.time()
        response = client.get("/api/books/", headers=auth_headers)
        list_time = time.time() - start_time
        
        assert response.status_code == status.HTTP_200_OK
        assert list_time < 1.0  # Should be under 1 second
        print(f"Upload time: {upload_time:.2f}s, List time: {list_time:.2f}s")
    
    @pytest.mark.performance
    def test_dictionary_lookup_performance(self, client, auth_headers):
        """Test performance of dictionary lookups"""
        # Mock the external API call
        import app.services.dictionary_service
        
        original_lookup = app.services.dictionary_service.DictionaryService.lookup_word
        
        def mock_lookup(word):
            time.sleep(0.1)  # Simulate network delay
            return {
                "word": word,
                "phonetic": f"/{word}/",
                "meanings": [{"partOfSpeech": "noun", "definitions": [{"definition": f"definition of {word}"}]}]
            }
        
        app.services.dictionary_service.DictionaryService.lookup_word = staticmethod(mock_lookup)
        
        try:
            start_time = time.time()
            response = client.post("/api/dictionary/lookup/test", headers=auth_headers)
            lookup_time = time.time() - start_time
            
            assert response.status_code == status.HTTP_200_OK
            assert lookup_time < 0.5  # Should be under 500ms with mock
            print(f"Dictionary lookup time: {lookup_time:.2f}s")
        finally:
            app.services.dictionary_service.DictionaryService.lookup_word = staticmethod(original_lookup)
    
    @pytest.mark.performance
    def test_concurrent_requests(self, client, auth_headers):
        """Test handling of concurrent requests"""
        import threading
        import queue
        
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
        results = queue.Queue()
        
        def make_request(req_num):
            try:
                start_time = time.time()
                files = {"file": (f"concurrent{req_num}.pdf", io.BytesIO(pdf_content), "application/pdf")}
                response = client.post("/api/books/upload", headers=auth_headers, files=files)
                elapsed = time.time() - start_time
                results.put((req_num, response.status_code, elapsed))
            except Exception as e:
                results.put((req_num, str(e), 0))
        
        # Start multiple threads
        threads = []
        for i in range(3):
            thread = threading.Thread(target=make_request, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Collect results
        successful = 0
        total_time = 0
        while not results.empty():
            req_num, status_code, elapsed = results.get()
            if status_code == 200:
                successful += 1
                total_time += elapsed
        
        assert successful == 3  # All requests should succeed
        print(f"Concurrent requests: {successful} successful, average time: {total_time/3:.2f}s")
