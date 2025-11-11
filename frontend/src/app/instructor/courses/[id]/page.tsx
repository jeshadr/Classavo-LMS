'use client'

import Navbar from '@/components/Navbar'
import PlateEditor from '@/components/PlateEditor'
import { useAuth } from '@/contexts/AuthContext'
import { coursesApi } from '@/lib/courses'
import { Chapter, Course } from '@/types'
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function InstructorCoursePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [chapterForm, setChapterForm] = useState<{
    title: string
    content: any[]
    visibility: 'public' | 'private'
  }>({
    title: '',
    content: [],
    visibility: 'private',
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'instructor')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === 'instructor') {
      loadData()
    }
  }, [user, params.id])

  const loadData = async () => {
    try {
      const courseData = await coursesApi.getCourse(Number(params.id))
      
      // Check if user is the instructor
      if (courseData.instructor.id !== user?.id) {
        alert('You are not authorized to manage this course')
        router.push('/instructor/dashboard')
        return
      }

      setCourse(courseData)
      const chaptersData = await coursesApi.getCourseChapters(Number(params.id))
      setChapters(chaptersData)
    } catch (error) {
      console.error('Failed to load data:', error)
      alert('Failed to load course data')
    } finally {
      setIsLoadingData(false)
    }
  }

  const getNextOrder = () => {
    if (chapters.length === 0) return 0
    const maxOrder = chapters.reduce((max, chapter) => Math.max(max, chapter.order ?? 0), 0)
    return maxOrder + 1
  }

  const handleCreateChapter = () => {
    setEditingChapter(null)
    setChapterForm({
      title: '',
      content: [],
      visibility: 'private',
    })
    setShowChapterModal(true)
  }

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter)
    setChapterForm({
      title: chapter.title,
      content: chapter.content || [],
      visibility: chapter.visibility,
    })
    setShowChapterModal(true)
  }

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const orderValue = editingChapter ? editingChapter.order : getNextOrder()
      const chapterData = {
        ...chapterForm,
        order: orderValue,
        course: Number(params.id),
      }

      if (editingChapter) {
        await coursesApi.updateChapter(editingChapter.id, chapterData)
      } else {
        await coursesApi.createChapter(chapterData)
      }

      setShowChapterModal(false)
      loadData()
    } catch (error) {
      console.error('Failed to save chapter:', error)
      alert('Failed to save chapter')
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    const reordered = Array.from(chapters)
    const [moved] = reordered.splice(sourceIndex, 1)
    reordered.splice(destinationIndex, 0, moved)
    setChapters(reordered)

    const persistOrder = async () => {
      try {
        const offset = reordered.length

        // First pass: move to temporary order range to avoid unique constraint conflicts
        for (let index = 0; index < reordered.length; index += 1) {
          const chapter = reordered[index]
          await coursesApi.updateChapter(chapter.id, { order: index + offset })
        }

        // Second pass: write final order values
        for (let index = 0; index < reordered.length; index += 1) {
          const chapter = reordered[index]
          await coursesApi.updateChapter(chapter.id, { order: index })
        }
      } catch (error) {
        console.error('Failed to reorder chapters:', error)
        alert('Failed to reorder chapters')
        loadData()
      }
    }

    void persistOrder()
  }

  const handleDeleteChapter = async (chapterId: number) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return

    try {
      await coursesApi.deleteChapter(chapterId)
      loadData()
    } catch (error) {
      console.error('Failed to delete chapter:', error)
      alert('Failed to delete chapter')
    }
  }

  if (isLoading || isLoadingData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/instructor/dashboard')}
            className="text-primary-600 hover:text-primary-800 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
          <p className="text-gray-600 mt-2">{course?.description}</p>
          <div className="mt-4 flex gap-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {chapters.length} chapters
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {course?.enrolled_students_count} students enrolled
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Chapters</h2>
            <button
              onClick={handleCreateChapter}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium"
            >
              + Add Chapter
            </button>
          </div>

          {chapters.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No chapters yet. Create your first chapter!
            </p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="chapters-droppable">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    {chapters.map((chapter, index) => (
                      <Draggable
                        key={chapter.id.toString()}
                        draggableId={chapter.id.toString()}
                        index={index}
                      >
                        {(draggableProvided, snapshot) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            className={`border rounded-lg p-4 transition-colors ${
                              snapshot.isDragging ? 'border-primary-500 shadow-lg bg-gray-50' : 'hover:border-primary-500'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3 flex-1">
                                <span
                                  {...draggableProvided.dragHandleProps}
                                  className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing select-none"
                                  title="Drag to reorder"
                                >
                                  ⋮⋮
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{chapter.title}</h3>
                                    <span
                                      className={`px-2 py-1 rounded text-xs ${
                                        chapter.visibility === 'public'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {chapter.visibility}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Chapter {index + 1}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditChapter(chapter)}
                                  className="text-primary-600 hover:text-primary-800 px-3 py-1 rounded-md border border-primary-600"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteChapter(chapter.id)}
                                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md border border-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Chapter Modal */}
      {showChapterModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setShowChapterModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {editingChapter ? 'Edit Chapter' : 'Create New Chapter'}
            </h2>
            <form onSubmit={handleSaveChapter}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={chapterForm.title}
                  onChange={(e) =>
                    setChapterForm({ ...chapterForm, title: e.target.value })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={chapterForm.visibility}
                  onChange={(e) =>
                    setChapterForm({
                      ...chapterForm,
                      visibility: e.target.value as 'public' | 'private',
                    })
                  }
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <PlateEditor
                  value={chapterForm.content}
                  onChange={(content) => setChapterForm({ ...chapterForm, content })}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md font-medium"
                >
                  {editingChapter ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

