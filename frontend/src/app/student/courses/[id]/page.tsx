'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import PlateEditor from '@/components/PlateEditor'
import { coursesApi } from '@/lib/courses'
import { Course, Chapter } from '@/types'

export default function StudentCoursePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'student')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === 'student') {
      loadData()
    }
  }, [user, params.id])

  const loadData = async () => {
    try {
      const courseData = await coursesApi.getCourse(Number(params.id))
      setCourse(courseData)
      setIsEnrolled(courseData.is_enrolled || false)

      if (courseData.is_enrolled) {
        const chaptersData = await coursesApi.getCourseChapters(Number(params.id))
        setChapters(chaptersData)
        if (chaptersData.length > 0) {
          setSelectedChapter(chaptersData[0])
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleEnroll = async () => {
    try {
      await coursesApi.enrollInCourse(Number(params.id))
      loadData()
    } catch (error) {
      console.error('Failed to enroll:', error)
      alert('Failed to enroll in course')
    }
  }

  const handleUnenroll = async () => {
    if (!confirm('Are you sure you want to unenroll from this course?')) return

    try {
      await coursesApi.unenrollFromCourse(Number(params.id))
      loadData()
    } catch (error) {
      console.error('Failed to unenroll:', error)
      alert('Failed to unenroll from course')
    }
  }

  if (isLoading || isLoadingData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/student/courses')}
          className="text-primary-600 hover:text-primary-800 mb-4"
        >
          ← Back to Courses
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
          <p className="text-gray-600 mt-2">{course?.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-4">
              <span className="text-sm text-gray-600">
                By: {course?.instructor.username}
              </span>
              <span className="text-sm text-gray-600">
                {course?.enrolled_students_count} students enrolled
              </span>
            </div>
            {isEnrolled ? (
              <button
                onClick={handleUnenroll}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium"
              >
                Unenroll
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium"
              >
                Enroll Now
              </button>
            )}
          </div>
        </div>

        {isEnrolled ? (
          chapters.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">
                No chapters available yet. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chapters Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-lg font-bold mb-4">Chapters</h2>
                  <div className="space-y-2">
                    {chapters.map((chapter, index) => (
                      <button
                        key={chapter.id}
                        onClick={() => setSelectedChapter(chapter)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedChapter?.id === chapter.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="text-sm">
                          {index + 1}. {chapter.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chapter Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-md p-6">
                  {selectedChapter ? (
                    <>
                      <h2 className="text-2xl font-bold mb-4">
                        {selectedChapter.title}
                      </h2>
                      <PlateEditor
                        key={selectedChapter.id}
                        value={selectedChapter.content}
                        onChange={() => {}}
                        readOnly
                      />
                    </>
                  ) : (
                    <p className="text-gray-600">Select a chapter to view its content</p>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-lg mb-4">
              Enroll in this course to access the chapters and start learning!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

