'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const renderRoleBadge = () => {
    if (!user) return null

    const roleConfig =
      user.role === 'instructor'
        ? { icon: '👨‍🏫', label: 'Instructor', bg: 'bg-orange-100', text: 'text-orange-700' }
        : { icon: '🎓', label: 'Student', bg: 'bg-blue-100', text: 'text-blue-700' }

    return (
      <span
        title={roleConfig.label}
        className={`inline-flex items-center justify-center w-7 h-7 ${roleConfig.bg} ${roleConfig.text} rounded-full text-sm leading-none`}
        aria-label={roleConfig.label}
      >
        {roleConfig.icon}
      </span>
    )
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              LMS
            </Link>
            {user && (
              <div className="ml-10 flex items-baseline space-x-4">
                {user.role === 'instructor' && (
                  <Link
                    href="/instructor/dashboard"
                    className={`${pathname?.startsWith('/instructor') ? 'text-primary-600 font-semibold bg-primary-50' : 'text-gray-700'} hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === 'student' && (
                  <>
                    <Link
                      href="/student/dashboard"
                      className={`${pathname === '/student/dashboard' ? 'text-primary-600 font-semibold bg-primary-50' : 'text-gray-700'} hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/student/courses"
                      className={`${pathname?.startsWith('/student/courses') ? 'text-primary-600 font-semibold bg-primary-50' : 'text-gray-700'} hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                    >
                      Browse Courses
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 font-medium">
                  {user.username}
                </span>
                {renderRoleBadge()}
                <button
                  onClick={logout}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

