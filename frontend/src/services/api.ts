import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const login = (username: string, password: string) => {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  return api.post('/api/auth/login', formData).then(res => res.data)
}

export const register = (email: string, username: string, password: string) => {
  return api.post('/api/auth/register', { email, username, password }).then(res => res.data)
}

export const getCurrentUser = () => {
  return api.get('/api/auth/me').then(res => res.data)
}

// Test endpoint
export const testApi = () => {
  return api.get('/health').then(res => res.data)
}

// Export the api instance and all functions
export const apiService = {
  login,
  register,
  getCurrentUser,
  testApi
}

export default apiService
