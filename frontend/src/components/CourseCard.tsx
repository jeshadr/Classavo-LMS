'use client'

import { Course } from '@/types'
import Link from 'next/link'

const gradientOptions = [
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-purple-400 to-pink-500',
  'from-orange-400 to-amber-500',
  'from-sky-400 to-cyan-600',
  'from-rose-400 to-red-500',
]

const iconOptions = ['📚', '🎓', '🧠', '📝', '💡', '📖']

interface CourseCardProps {
  course: Course
  isInstructor?: boolean
  onEdit?: (course: Course) => void
  onDelete?: (courseId: number) => void
}

export default function CourseCard({ course, isInstructor = false, onEdit, onDelete }: CourseCardProps) {
  const indexSeed = course.id ?? course.title.length
  const gradientClass = gradientOptions[indexSeed % gradientOptions.length]
  const icon = iconOptions[indexSeed % iconOptions.length]

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className={`h-48 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-6xl" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>By: {course.instructor.username}</span>
          <span>{course.enrolled_students_count} students</span>
        </div>
        <div className="flex gap-2">
          {isInstructor ? (
            <>
              <Link
                href={`/instructor/courses/${course.id}`}
                className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-sm font-medium"
              >
                Manage
              </Link>
              {onEdit && (
                <button
                  onClick={() => onEdit(course)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm font-medium"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(course.id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </>
          ) : (
            <Link
              href={`/student/courses/${course.id}`}
              className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-sm font-medium"
            >
              {course.is_enrolled ? 'View Course' : 'Learn More'}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

