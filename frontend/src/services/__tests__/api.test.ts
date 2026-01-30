import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { apiService } from '../api'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('login', () => {
    it('successfully logs in', async () => {
      const mockResponse = {
        data: {
          access_token: 'test_token',
          token_type: 'bearer',
        },
      }
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse)
      
      const result = await apiService.login('testuser', 'password123')
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.any(FormData),
        expect.any(Object)
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('handles login failure', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Login failed'))
      
      await expect(apiService.login('testuser', 'wrongpass')).rejects.toThrow('Login failed')
    })
  })

  describe('register', () => {
    it('successfully registers', async () => {
      const mockResponse = {
        data: { id: 1, email: 'test@example.com', username: 'testuser' },
      }
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse)
      
      const result = await apiService.register('test@example.com', 'testuser', 'password123')
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/auth/register',
        {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        },
        expect.any(Object)
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getCurrentUser', () => {
    it('returns user data when authenticated', async () => {
      const mockUser = { id: 1, email: 'test@example.com', username: 'testuser' }
      const mockResponse = { data: mockUser }
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse)
      localStorage.setItem('token', 'test_token')
      
      const result = await apiService.getCurrentUser()
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/me', expect.any(Object))
      expect(result).toEqual(mockUser)
    })

    it('handles unauthorized access', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401 },
      })
      
      await expect(apiService.getCurrentUser()).rejects.toThrow()
    })
  })

  describe('testApi', () => {
    it('returns health status', async () => {
      const mockResponse = { data: { status: 'healthy' } }
      mockedAxios.get.mockResolvedValueOnce(mockResponse)
      
      const result = await apiService.testApi()
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/health', expect.any(Object))
      expect(result).toEqual({ status: 'healthy' })
    })
  })

  describe('request interceptor', () => {
    it('adds token to requests when available', async () => {
      localStorage.setItem('token', 'test_token')
      
      mockedAxios.get.mockResolvedValueOnce({ data: {} })
      
      await apiService.testApi()
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/health',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token',
          }),
        })
      )
    })

    it('does not add token when not available', async () => {
      localStorage.removeItem('token')
      
      mockedAxios.get.mockResolvedValueOnce({ data: {} })
      
      await apiService.testApi()
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/health',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      )
    })
  })

  describe('response interceptor', () => {
    it('handles 401 unauthorized', async () => {
      const removeItemSpy = vi.spyOn(localStorage, 'removeItem')
      const locationSpy = vi.spyOn(window.location, 'href', 'set')
      
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401 },
      })
      
      await expect(apiService.testApi()).rejects.toThrow()
      
      expect(removeItemSpy).toHaveBeenCalledWith('token')
      // Note: window.location.href assignment might be prevented in tests
    })

    it('passes through other errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
      
      await expect(apiService.testApi()).rejects.toThrow('Network error')
    })
  })
})
