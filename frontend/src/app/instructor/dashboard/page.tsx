'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CourseCard from '@/components/CourseCard'
import { coursesApi } from '@/lib/courses'
import { Course } from '@/types'

export default function InstructorDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCourse, setNewCourse] = useState({ title: '', description: '' })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'instructor')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === 'instructor') {
      loadCourses()
    }
  }, [user])

  const loadCourses = async () => {
    try {
      const data = await coursesApi.getCourses()
      // Filter to show only instructor's courses
      setCourses(data.filter((c: Course) => c.instructor.id === user?.id))
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setIsLoadingCourses(false)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await coursesApi.createCourse(newCourse)
      setNewCourse({ title: '', description: '' })
      setShowCreateModal(false)
      loadCourses()
    } catch (error) {
      console.error('Failed to create course:', error)
      alert('Failed to create course')
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      await coursesApi.deleteCourse(courseId)
      loadCourses()
    } catch (error) {
      console.error('Failed to delete course:', error)
      alert('Failed to delete course')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-2">Manage your courses and chapters</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium shadow-md"
          >
            + Create New Course
          </button>
        </div>

        {isLoadingCourses ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">No courses yet. Create your first course!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isInstructor
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Create New Course</h2>
            <form onSubmit={handleCreateCourse}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md font-medium"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

