'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus } from 'lucide-react'
import ReminderDashboard from './ReminderDashboard'
import CreateReminderModal from './CreateReminderModal'
import { logger } from '@/lib/logger'

interface Reminder {
  id: string
  title: string
  description?: string
  dueDate: Date
  type: 'assignment' | 'exam' | 'meeting' | 'personal' | 'study_session'
  priority: 'low' | 'medium' | 'high'
  isCompleted: boolean
  tags?: string[]
  course?: string
}

// Mock reminder data
const mockReminders: Reminder[] = [
  {
    id: '1',
    title: 'Complete Math Assignment 3',
    description: 'Finish calculus problem set due tomorrow',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    type: 'assignment',
    priority: 'high',
    isCompleted: false,
    tags: ['mathematics', 'calculus'],
    course: 'MATH 201'
  },
  {
    id: '2',
    title: 'Physics Final Exam',
    description: 'Review all chapters 1-12 for comprehensive final',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    type: 'exam',
    priority: 'high',
    isCompleted: false,
    tags: ['physics', 'final-exam'],
    course: 'PHYS 101'
  },
  {
    id: '3',
    title: 'Study Group Meeting',
    description: 'Weekly computer science study group',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    type: 'meeting',
    priority: 'medium',
    isCompleted: false,
    tags: ['study-group', 'computer-science'],
    course: 'CS 101'
  },
  {
    id: '4',
    title: 'Review Biology Notes',
    description: 'Go through cell biology chapter before quiz',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    type: 'study_session',
    priority: 'medium',
    isCompleted: false,
    tags: ['biology', 'cell-biology'],
    course: 'BIO 101'
  },
  {
    id: '5',
    title: 'Submit Chemistry Lab Report',
    description: 'Lab 5 - Organic compounds analysis',
    dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (overdue)
    type: 'assignment',
    priority: 'high',
    isCompleted: false,
    tags: ['chemistry', 'lab-report'],
    course: 'CHEM 201'
  },
  {
    id: '6',
    title: 'History Essay Completed',
    description: 'Essay on World War II impacts',
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    type: 'assignment',
    priority: 'medium',
    isCompleted: true,
    tags: ['history', 'essay'],
    course: 'HIST 101'
  }
]

export default function ReminderPageClient() {
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle chunk loading errors and other runtime errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('Loading chunk') || event.message?.includes('ChunkLoadError')) {
        logger.error('Chunk loading error detected, attempting refresh', new Error(event.message))
        // Attempt to reload the page to fix chunk loading issues
        window.location.reload()
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.name === 'ChunkLoadError' || event.reason?.message?.includes('Loading chunk')) {
        logger.error('Chunk loading promise rejection', event.reason)
        window.location.reload()
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const handleCreateReminder = useCallback(() => {
    setShowCreateModal(true)
  }, [])

  const handleEditReminder = useCallback((id: string) => {
    logger.info('Edit reminder requested', { reminderId: id })
    // TODO: Implement edit functionality
  }, [])

  const handleDeleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter((reminder: any) => reminder.id !== id))
  }, [])

  const handleCompleteReminder = useCallback((id: string) => {
    setReminders(prev =>
      prev.map((reminder: any) =>
        reminder.id === id
          ? { ...reminder, isCompleted: !reminder.isCompleted }
          : reminder
      )
    )
  }, [])

  const handleCreateNew = useCallback((newReminder: Omit<Reminder, 'id' | 'isCompleted'>) => {
    const reminder: Reminder = {
      ...newReminder,
      id: Date.now().toString(),
      isCompleted: false,
    }
    setReminders(prev => [...prev, reminder])
    setShowCreateModal(false)
  }, [])

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-neutral-900 mb-2'>
            Something went wrong
          </h2>
          <p className='text-neutral-600 mb-4'>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='btn-primary'
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-heading text-neutral-900'>
            Reminders & Deadlines
          </h1>
          <p className='text-neutral-600 mt-1'>
            Stay on top of your study schedule and never miss important deadlines
          </p>
        </div>
        <button
          onClick={handleCreateReminder}
          className='btn-primary inline-flex items-center'
        >
          <Plus className='h-4 w-4 mr-2' />
          Add Reminder
        </button>
      </div>
      
      <ReminderDashboard 
        reminders={reminders}
        onCreateReminder={handleCreateReminder}
        onEditReminder={handleEditReminder}
        onDeleteReminder={handleDeleteReminder}
        onCompleteReminder={handleCompleteReminder}
      />

      {showCreateModal && (
        <CreateReminderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateNew}
        />
      )}
    </div>
  )
}