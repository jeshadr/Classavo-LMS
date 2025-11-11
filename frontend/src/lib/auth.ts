import apiClient from './api'
import { User, LoginCredentials, RegisterData, AuthTokens } from '@/types'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post('/api/auth/login/', credentials)
    const { access, refresh } = response.data
    
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    
    const userResponse = await apiClient.get('/api/auth/me/')
    
    return {
      user: userResponse.data,
      tokens: { access, refresh },
    }
  },

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post('/api/auth/register/', data)
    const { user, access, refresh } = response.data
    
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    
    return {
      user,
      tokens: { access, refresh },
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/api/auth/me/')
    return response.data
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch('/api/auth/profile/', data)
    return response.data
  },

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}

