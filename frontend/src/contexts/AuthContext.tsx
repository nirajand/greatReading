import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { enhancedApi } from '../services/enhancedApi'
import { toast } from 'sonner'

interface User {
  id: number
  email: string
  username: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await enhancedApi.getCurrentUser()
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('token')
          console.error('Auth initialization failed:', error)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string, rememberMe: boolean) => {
    try {
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username)
      }
      
      await enhancedApi.login(username, password)
      const userData = await enhancedApi.getCurrentUser()
      setUser(userData)
      toast.success('Welcome back!')
    } catch (error) {
      toast.error('Invalid credentials')
      throw error
    }
  }

  const register = async (email: string, username: string, password: string) => {
    try {
      await enhancedApi.register({ email, username, password })
      toast.success('Account created successfully! Please login.')
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    toast.info('Logged out successfully')
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}