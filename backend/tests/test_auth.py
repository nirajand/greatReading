import pytest
from fastapi import status

class TestAuth:
    def test_register_success(self, client, test_user_data):
        """Test successful user registration"""
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "id" in data
        assert data["email"] == test_user_data["email"]
        assert data["username"] == test_user_data["username"]
        assert "hashed_password" not in data
    
    def test_register_duplicate_email(self, client, test_user_data):
        """Test registration with duplicate email"""
        # First registration
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Second registration with same email
        duplicate_data = test_user_data.copy()
        duplicate_data["username"] = "anotheruser"
        response = client.post("/api/auth/register", json=duplicate_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_register_duplicate_username(self, client, test_user_data):
        """Test registration with duplicate username"""
        # First registration
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Second registration with same username
        duplicate_data = test_user_data.copy()
        duplicate_data["email"] = "another@example.com"
        response = client.post("/api/auth/register", json=duplicate_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email"""
        data = {
            "email": "invalid-email",
            "username": "testuser",
            "password": "password123"
        }
        response = client.post("/api/auth/register", json=data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_login_success(self, client, test_user_data):
        """Test successful login"""
        # Register first
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Login
        login_data = {
            "username": test_user_data["username"],
            "password": test_user_data["password"]
        }
        response = client.post("/api/auth/login", data=login_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_wrong_password(self, client, test_user_data):
        """Test login with wrong password"""
        # Register first
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Login with wrong password
        login_data = {
            "username": test_user_data["username"],
            "password": "wrongpassword"
        }
        response = client.post("/api/auth/login", data=login_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user"""
        login_data = {
            "username": "nonexistent",
            "password": "password123"
        }
        response = client.post("/api/auth/login", data=login_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_current_user(self, client, auth_headers):
        """Test getting current user info"""
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "username" in data
        assert "is_active" in data
    
    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without auth"""
        response = client.get("/api/auth/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
