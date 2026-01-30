import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

const API_BASE_URL = 'http://localhost:8000'

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
  onComplete?: (response: any) => void
  onError?: (error: ApiError) => void
}

class EnhancedApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
  })

  private requests = new Map<string, AbortController>()

  constructor() {
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request ID for tracking
        const requestId = this.generateRequestId()
        config.headers['X-Request-ID'] = requestId

        // Create abort controller for this request
        const controller = new AbortController()
        config.signal = controller.signal
        this.requests.set(requestId, controller)

        return config
      },
      (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Remove request from map
        const requestId = response.config.headers?.['X-Request-ID']
        if (requestId) {
          this.requests.delete(requestId)
        }

        // Log successful response
        console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`)

        return response
      },
      (error: AxiosError) => {
        // Remove request from map
        const requestId = error.config?.headers?.['X-Request-ID']
        if (requestId) {
          this.requests.delete(requestId)
        }

        const apiError = this.handleError(error)

        // Show error toast for client errors
        if (apiError.code !== 'NETWORK_ERROR' && apiError.code !== 'TIMEOUT_ERROR') {
          toast.error(apiError.message)
        }

        return Promise.reject(apiError)
      }
    )
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private handleError(error: AxiosError): ApiError {
    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Request timeout. Please check your connection and try again.',
        code: 'TIMEOUT_ERROR',
      }
    }

    if (!error.response) {
      return {
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      }
    }

    const status = error.response.status
    const data = error.response.data as any

    switch (status) {
      case 400:
        return {
          message: data?.detail || 'Invalid request. Please check your input.',
          code: 'BAD_REQUEST',
          details: data,
        }
      case 401:
        localStorage.removeItem('token')
        window.location.href = '/login'
        return {
          message: 'Session expired. Please login again.',
          code: 'UNAUTHORIZED',
        }
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          code: 'FORBIDDEN',
        }
      case 404:
        return {
          message: 'The requested resource was not found.',
          code: 'NOT_FOUND',
        }
      case 422:
        return {
          message: 'Validation error. Please check your input.',
          code: 'VALIDATION_ERROR',
          details: data?.detail || data,
        }
      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED',
        }
      case 500:
        return {
          message: 'Internal server error. Please try again later.',
          code: 'SERVER_ERROR',
        }
      case 503:
        return {
          message: 'Service temporarily unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE',
        }
      default:
        return {
          message: data?.detail || 'An unexpected error occurred.',
          code: 'UNKNOWN_ERROR',
        }
    }
  }

  public cancelRequest(requestId: string) {
    const controller = this.requests.get(requestId)
    if (controller) {
      controller.abort()
      this.requests.delete(requestId)
    }
  }

  public cancelAllRequests() {
    this.requests.forEach((controller) => controller.abort())
    this.requests.clear()
  }

  // Auth methods
  async login(username: string, password: string) {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    const response = await this.api.post('/api/auth/login', formData)
    const token = response.data.access_token

    if (token) {
      localStorage.setItem('token', token)
    }

    return response.data
  }

  async register(email: string, username: string, password: string) {
    const response = await this.api.post('/api/auth/register', {
      email,
      username,
      password,
    })
    return response.data
  }

  async getCurrentUser() {
    const response = await this.api.get('/api/auth/me')
    return response.data
  }

  // File upload with progress tracking
  async uploadBook(
    file: File,
    title?: string,
    author?: string,
    options?: UploadOptions
  ) {
    const formData = new FormData()
    formData.append('file', file)
    if (title) formData.append('title', title)
    if (author) formData.append('author', author)

    const response = await this.api.post('/api/books/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && options?.onProgress) {
          const progress: UploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          }
          options.onProgress(progress)
        }
      },
    })

    if (options?.onComplete) {
      options.onComplete(response.data)
    }

    return response.data
  }

  // Enhanced book upload with chunking for large files
  async uploadBookEnhanced(
    file: File,
    title?: string,
    author?: string,
    chunkSize: number = 5 * 1024 * 1024, // 5MB chunks
    options?: UploadOptions
  ) {
    if (file.size <= chunkSize) {
      return this.uploadBook(file, title, author, options)
    }

    // For large files, implement chunked upload
    const totalChunks = Math.ceil(file.size / chunkSize)
    const fileHash = await this.calculateFileHash(file)

    // Start upload session
    const sessionResponse = await this.api.post('/api/books/upload-session', {
      filename: file.name,
      file_size: file.size,
      total_chunks: totalChunks,
      file_hash: fileHash,
      title,
      author,
    })

    const sessionId = sessionResponse.data.session_id

    // Upload chunks
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      const chunkFormData = new FormData()
      chunkFormData.append('session_id', sessionId)
      chunkFormData.append('chunk_index', chunkIndex.toString())
      chunkFormData.append('total_chunks', totalChunks.toString())
      chunkFormData.append('chunk', chunk)

      await this.api.post('/api/books/upload-chunk', chunkFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && options?.onProgress) {
            const overallProgress = ((chunkIndex * chunkSize + progressEvent.loaded) / file.size) * 100
            const progress: UploadProgress = {
              loaded: chunkIndex * chunkSize + progressEvent.loaded,
              total: file.size,
              percentage: Math.round(overallProgress),
            }
            options.onProgress(progress)
          }
        },
      })
    }

    // Complete upload
    const completeResponse = await this.api.post('/api/books/complete-upload', {
      session_id: sessionId,
    })

    if (options?.onComplete) {
      options.onComplete(completeResponse.data)
    }

    return completeResponse.data
  }

  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Book methods
  async getBooks(skip = 0, limit = 100) {
    const response = await this.api.get('/api/books/', {
      params: { skip, limit },
    })
    return response.data
  }

  async getBook(bookId: number) {
    const response = await this.api.get(`/api/books/${bookId}`)
    return response.data
  }

  async updateBook(bookId: number, data: any) {
    const response = await this.api.put(`/api/books/${bookId}`, data)
    return response.data
  }

  async deleteBook(bookId: number) {
    const response = await this.api.delete(`/api/books/${bookId}`)
    return response.data
  }

  async getPageText(bookId: number, pageNumber: number) {
    const response = await this.api.get(`/api/books/${bookId}/page/${pageNumber}`)
    return response.data
  }

  // Dictionary methods
  async lookupWord(word: string) {
    const response = await this.api.post(`/api/dictionary/lookup/${word}`)
    return response.data
  }

  async saveWord(data: any) {
    const response = await this.api.post('/api/dictionary/', data)
    return response.data
  }

  async getDictionaryEntries(skip = 0, limit = 100, mastered?: number) {
    const params: any = { skip, limit }
    if (mastered !== undefined) params.mastered = mastered

    const response = await this.api.get('/api/dictionary/', { params })
    return response.data
  }

  async updateDictionaryEntry(entryId: number, data: any) {
    const response = await this.api.put(`/api/dictionary/${entryId}`, data)
    return response.data
  }

  async deleteDictionaryEntry(entryId: number) {
    const response = await this.api.delete(`/api/dictionary/${entryId}`)
    return response.data
  }

  // Reading methods
  async createReadingSession(data: any) {
    const response = await this.api.post('/api/reading/session', data)
    return response.data
  }

  async updateReadingSession(sessionId: number, data: any) {
    const response = await this.api.put(`/api/reading/session/${sessionId}`, data)
    return response.data
  }

  async getReadingSessions(skip = 0, limit = 50) {
    const response = await this.api.get('/api/reading/sessions', {
      params: { skip, limit },
    })
    return response.data
  }

  async getReadingStats() {
    const response = await this.api.get('/api/reading/stats')
    return response.data
  }

  async getTimerPresets() {
    const response = await this.api.get('/api/reading/timer/presets')
    return response.data
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.api.get('/health')
      return {
        status: 'healthy',
        data: response.data,
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: this.handleError(error as AxiosError),
      }
    }
  }
}

export const enhancedApi = new EnhancedApiService()
export default enhancedApi