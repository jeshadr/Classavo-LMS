'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CourseCard from '@/components/CourseCard'
import { coursesApi } from '@/lib/courses'
import { Course } from '@/types'

export default function BrowseCoursesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'student')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === 'student') {
      loadCourses()
    }
  }, [user])

  const loadCourses = async () => {
    try {
      const data = await coursesApi.getCourses()
      setCourses(data)
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setIsLoadingCourses(false)
    }
  }

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
          <p className="text-gray-600 mt-2">Discover courses and start learning</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoadingCourses ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No courses found matching your search.' : 'No courses available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} isInstructor={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

