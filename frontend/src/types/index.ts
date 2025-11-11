export type UserRole = 'instructor' | 'student'

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  first_name?: string
  last_name?: string
  bio?: string
  profile_picture?: string
  created_at: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password2: string
  role: UserRole
  first_name?: string
  last_name?: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface Course {
  id: number
  title: string
  description: string
  instructor: User
  thumbnail?: string
  chapters?: Chapter[]
  enrolled_students_count: number
  is_enrolled?: boolean
  created_at: string
  updated_at?: string
}

export interface Chapter {
  id: number
  course: number
  title: string
  content: any // Plate.js JSON content
  order: number
  visibility: 'public' | 'private'
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: number
  student: User
  course: Course
  enrolled_at: string
  is_active: boolean
}

export interface ApiError {
  detail?: string
  [key: string]: any
}

