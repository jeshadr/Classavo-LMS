'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CourseCard from '@/components/CourseCard'
import { coursesApi } from '@/lib/courses'
import { Course, Enrollment } from '@/types'

export default function StudentDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'student')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === 'student') {
      loadEnrolledCourses()
    }
  }, [user])

  const loadEnrolledCourses = async () => {
    try {
      const enrollments = await coursesApi.getEnrollments()
      setEnrolledCourses(enrollments.map((e: Enrollment) => e.course))
    } catch (error) {
      console.error('Failed to load enrolled courses:', error)
    } finally {
      setIsLoadingCourses(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Enrolled Courses</h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {isLoadingCourses ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg mb-4">
              You haven't enrolled in any courses yet.
            </p>
            <button
              onClick={() => router.push('/student/courses')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} isInstructor={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

