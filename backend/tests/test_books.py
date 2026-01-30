import pytest
from fastapi import status
import io

class TestBooks:
    @pytest.fixture
    def sample_pdf_file(self):
        """Create a sample PDF file for testing"""
        # Create a minimal PDF file content
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
        return io.BytesIO(pdf_content)
    
    def test_upload_book(self, client, auth_headers, sample_pdf_file):
        """Test uploading a book"""
        files = {"file": ("test.pdf", sample_pdf_file, "application/pdf")}
        data = {"title": "Test Book", "author": "Test Author"}
        
        response = client.post(
            "/api/books/upload",
            headers=auth_headers,
            files=files,
            data=data
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Test Book"
        assert data["author"] == "Test Author"
        assert "file_path" in data
        assert "file_name" in data
        assert "total_pages" in data
    
    def test_upload_book_invalid_file_type(self, client, auth_headers):
        """Test uploading non-PDF file"""
        file_content = b"Not a PDF"
        files = {"file": ("test.txt", io.BytesIO(file_content), "text/plain")}
        
        response = client.post(
            "/api/books/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_list_books(self, client, auth_headers, sample_pdf_file):
        """Test listing books"""
        # Upload a book first
        files = {"file": ("test.pdf", sample_pdf_file, "application/pdf")}
        client.post("/api/books/upload", headers=auth_headers, files=files)
        
        # List books
        response = client.get("/api/books/", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_get_book(self, client, auth_headers, sample_pdf_file):
        """Test getting a specific book"""
        # Upload a book first
        files = {"file": ("test.pdf", sample_pdf_file, "application/pdf")}
        upload_response = client.post("/api/books/upload", headers=auth_headers, files=files)
        book_id = upload_response.json()["id"]
        
        # Get the book
        response = client.get(f"/api/books/{book_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == book_id
    
    def test_get_nonexistent_book(self, client, auth_headers):
        """Test getting non-existent book"""
        response = client.get("/api/books/999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_update_book_progress(self, client, auth_headers, sample_pdf_file):
        """Test updating book progress"""
        # Upload a book first
        files = {"file": ("test.pdf", sample_pdf_file, "application/pdf")}
        upload_response = client.post("/api/books/upload", headers=auth_headers, files=files)
        book_id = upload_response.json()["id"]
        
        # Update progress
        update_data = {"current_page": 10, "progress": 25.5}
        response = client.put(f"/api/books/{book_id}", headers=auth_headers, json=update_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["current_page"] == 10
        assert data["progress"] == 25.5
    
    def test_delete_book(self, client, auth_headers, sample_pdf_file):
        """Test deleting a book"""
        # Upload a book first
        files = {"file": ("test.pdf", sample_pdf_file, "application/pdf")}
        upload_response = client.post("/api/books/upload", headers=auth_headers, files=files)
        book_id = upload_response.json()["id"]
        
        # Delete the book
        response = client.delete(f"/api/books/{book_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        
        # Verify it's deleted
        response = client.get(f"/api/books/{book_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_page_text(self, client, auth_headers, sample_pdf_file):
        """Test getting text from a book page"""
        # Upload a book first
        files = {"file": ("test.pdf", sample_pdf_file, "application/pdf")}
        upload_response = client.post("/api/books/upload", headers=auth_headers, files=files)
        book_id = upload_response.json()["id"]
        
        # Get page text
        response = client.get(f"/api/books/{book_id}/page/1", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "text" in data
        assert data["page_number"] == 1
