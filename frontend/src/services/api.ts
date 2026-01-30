import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor to inject the JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Auth: FastAPI expects form-data for OAuth2
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const { data } = await api.post('/api/auth/login', formData);
    return data; // Returns { access_token: string, token_type: string }
  },

  getCurrentUser: () => api.get('/api/auth/me').then(res => res.data),

  // Books
  getBooks: () => api.get('/api/books').then(res => res.data),

  uploadBook: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/books/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getBookById: (id: string) => api.get(`/api/books/${id}`).then(res => res.data),
};

export default api;