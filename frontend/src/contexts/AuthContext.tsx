'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LoginCredentials, RegisterData } from '@/types'
import { authApi } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const userData = await authApi.getCurrentUser()
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const { user } = await authApi.login(credentials)
      setUser(user)
      
      if (user.role === 'instructor') {
        router.push('/instructor/dashboard')
      } else {
        router.push('/student/dashboard')
      }
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const { user } = await authApi.register(data)
      setUser(user)
      
      if (user.role === 'instructor') {
        router.push('/instructor/dashboard')
      } else {
        router.push('/student/dashboard')
      }
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    router.push('/auth/login')
  }

  const updateUser = async (data: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(data)
      setUser(updatedUser)
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

