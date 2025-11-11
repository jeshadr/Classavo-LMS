import apiClient from './api'
import { Course, Chapter } from '@/types'

export const coursesApi = {
  async getCourses(): Promise<Course[]> {
    const response = await apiClient.get('/api/courses/courses/')
    return response.data.results || response.data
  },

  async getCourse(id: number): Promise<Course> {
    const response = await apiClient.get(`/api/courses/courses/${id}/`)
    return response.data
  },

  async createCourse(data: Partial<Course>): Promise<Course> {
    const response = await apiClient.post('/api/courses/courses/', data)
    return response.data
  },

  async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    const response = await apiClient.patch(`/api/courses/courses/${id}/`, data)
    return response.data
  },

  async deleteCourse(id: number): Promise<void> {
    await apiClient.delete(`/api/courses/courses/${id}/`)
  },

  async getCourseChapters(courseId: number): Promise<Chapter[]> {
    const response = await apiClient.get(`/api/courses/courses/${courseId}/chapters/`)
    return response.data
  },

  async enrollInCourse(courseId: number): Promise<any> {
    const response = await apiClient.post(`/api/courses/courses/${courseId}/enroll/`)
    return response.data
  },

  async unenrollFromCourse(courseId: number): Promise<any> {
    const response = await apiClient.post(`/api/courses/courses/${courseId}/unenroll/`)
    return response.data
  },

  async getChapters(): Promise<Chapter[]> {
    const response = await apiClient.get('/api/courses/chapters/')
    return response.data.results || response.data
  },

  async getChapter(id: number): Promise<Chapter> {
    const response = await apiClient.get(`/api/courses/chapters/${id}/`)
    return response.data
  },

  async createChapter(data: Partial<Chapter>): Promise<Chapter> {
    const response = await apiClient.post('/api/courses/chapters/', data)
    return response.data
  },

  async updateChapter(id: number, data: Partial<Chapter>): Promise<Chapter> {
    const response = await apiClient.patch(`/api/courses/chapters/${id}/`, data)
    return response.data
  },

  async deleteChapter(id: number): Promise<void> {
    await apiClient.delete(`/api/courses/chapters/${id}/`)
  },

  async getEnrollments(): Promise<any[]> {
    const response = await apiClient.get('/api/courses/enrollments/')
    return response.data.results || response.data
  },
}

