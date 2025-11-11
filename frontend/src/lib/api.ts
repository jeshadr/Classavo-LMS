import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// Normalize base URL: strip trailing slash if present; fall back to localhost in dev.
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL
const API_URL = (RAW_API_URL && RAW_API_URL.replace(/\/$/, '')) || 'http://localhost:8000'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        // Helpful warning if the app was built without the env var on a hosted domain.
        if (process.env.NODE_ENV === 'production' && RAW_API_URL == null) {
          // eslint-disable-next-line no-console
          console.warn('NEXT_PUBLIC_API_URL is not set at build time; falling back to http://localhost:8000')
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem('refresh_token')
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
                refresh: refreshToken,
              })

              const { access } = response.data
              localStorage.setItem('access_token', access)

              originalRequest.headers.Authorization = `Bearer ${access}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            // Refresh token failed, clear storage and redirect to login
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/auth/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  getClient(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient().getClient()
export default apiClient

