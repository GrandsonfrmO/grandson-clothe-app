'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiClient, setAuthToken, getAuthToken, User } from '@/hooks/use-api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Marquer comme monté côté client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize auth on mount and restore session
  useEffect(() => {
    if (!isMounted) return
    
    const initAuth = async () => {
      try {
        const token = getAuthToken()
        if (token) {
          try {
            const response = await apiClient.getProfile()
            setUser(response.user)
            setIsAuthenticated(true)
          } catch (error) {
            console.error('Error fetching profile:', error)
            // Token might be expired, but keep it for now
            // Only clear if it's a 401 error
            if (error instanceof Error && error.message.includes('401')) {
              setAuthToken(null)
              setIsAuthenticated(false)
            }
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [isMounted])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error) {
      setIsAuthenticated(false)
      throw error
    }
  }, [])

  const register = useCallback(async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => {
    try {
      const response = await apiClient.register(data)
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error) {
      setIsAuthenticated(false)
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    const currentUserId = user?.id
    
    // Clear auth token and user state
    setAuthToken(null)
    setUser(null)
    setIsAuthenticated(false)
    
    // Clear all auth-related data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_token_time')
      
      // Clear ALL user-specific data to prevent data leakage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cart_user_') || key.startsWith('favorites_user_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }, [user])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
  }, [])

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
  }

  return (
    <AuthContext.Provider value={value}>
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