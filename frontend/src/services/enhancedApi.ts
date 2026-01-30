import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

// const API_BASE_URL = 'http://localhost:8000';

const API_BASE_URL = 'https://glowing-succotash-9qwjwwqqvr937xjw-8000.app.github.dev/';

class EnhancedApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.api.interceptors.response.use(
      (res) => res,
      (error: AxiosError) => {
        const detail = (error.response?.data as any)?.detail;
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        if (detail) {
          const message = Array.isArray(detail) ? detail[0].msg : detail;
          toast.error(message);
        }
        return Promise.reject(error);
      }
    );
  }

  // AUTH: Uses URLSearchParams for OAuth2 compatibility
  async login(username: string, password: string) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    // Added a more robust error catcher for the "Blocked by client" issue
    try {
      const { data } = await this.api.post('/api/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      return data;
    } catch (error) {
       console.error("Request blocked or failed:", error);
       throw error;
    }
  }

  async register(payload: any) {
    return (await this.api.post('/api/auth/register', payload)).data;
  }

  async getCurrentUser() {
    return (await this.api.get('/api/auth/me')).data;
  }

  // BOOK ENDPOINTS (Kept exactly as requested)
  async getBooks() { return (await this.api.get('/api/books/')).data; }
  async getBook(id: number) { return (await this.api.get(`/api/books/${id}`)).data; }
  async deleteBook(id: number) { return (await this.api.delete(`/api/books/${id}`)).data; }
  async getPageText(id: number, p: number) { return (await this.api.get(`/api/books/${id}/page/${p}`)).data; }
  async uploadBook(file: File, title: string) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    return (await this.api.post('/api/books/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }})).data;
  }
}

export const enhancedApi = new EnhancedApiService();