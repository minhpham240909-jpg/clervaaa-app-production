'use client'

import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns'

interface DeadlineTrackerProps {
  assignments: {
    id: string
    title: string
    dueDate: Date
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    progress: number
    subject?: string
  }[]
}

export default function DeadlineTracker({ assignments }: DeadlineTrackerProps) {
  const getUrgentAssignments = () => {
    return assignments
      .filter((a: any) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      case 'LOW':
        return 'text-green-600'
      default:
        return 'text-neutral-600'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const days = differenceInDays(dueDate, new Date())
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    return `${days} days left`
  }

  const urgentAssignments = getUrgentAssignments()

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold font-heading text-neutral-900'>
          Deadline Tracker
        </h3>
        <AlertTriangle className='h-5 w-5 text-orange-500' />
      </div>

      {urgentAssignments.length === 0 ? (
        <div className='text-center py-6 text-neutral-500'>
          <CheckCircle className='h-12 w-12 mx-auto mb-2 text-accent-400' />
          <p className='font-medium'>All caught up!</p>
          <p className='text-sm'>No urgent deadlines</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {urgentAssignments.map((assignment: any) => {
            const daysLeft = differenceInDays(assignment.dueDate, new Date())
            const isOverdue = daysLeft < 0
            const isDueToday = isToday(assignment.dueDate)
            const isDueTomorrow = isTomorrow(assignment.dueDate)

            return (
              <div
                key={assignment.id}
                className={`border rounded-lg p-3 transition-colors ${
                  isOverdue
                    ? 'bg-red-50 border-red-200'
                    : isDueToday
                    ? 'bg-orange-50 border-orange-200'
                    : isDueTomorrow
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <div className='flex items-start justify-between mb-2'>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-medium text-neutral-900 text-sm truncate'>
                      {assignment.title}
                    </h4>
                    {assignment.subject && (
                      <p className='text-xs text-neutral-500'>{assignment.subject}</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                    {assignment.priority}
                  </span>
                </div>

                <div className='flex items-center justify-between text-xs text-neutral-600 mb-2'>
                  <span className='flex items-center'>
                    <Clock className='h-3 w-3 mr-1' />
                    {getDaysUntilDue(assignment.dueDate)}
                  </span>
                  <span>{assignment.progress}% complete</span>
                </div>

                {/* Progress Bar */}
                <div className='w-full bg-neutral-200 rounded-full h-1.5 mb-2'>
                  <div
                    className={`h-1.5 rounded-full transition-all ${getProgressColor(assignment.progress)}`}
                    style={{ width: `${assignment.progress}%` }}
                  ></div>
                </div>

                <div className='flex items-center justify-between text-xs'>
                  <span className='text-neutral-500'>
                    Due {format(assignment.dueDate, 'MMM d, h:mm a')}
                  </span>
                  <div className='flex items-center space-x-1'>
                    <div className={`w-2 h-2 rounded-full ${
                      assignment.status === 'IN_PROGRESS' 
                        ? 'bg-blue-500' 
                        : 'bg-neutral-300'
                    }`}></div>
                    <span className='text-neutral-500 capitalize'>
                      {assignment.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className='mt-4 pt-4 border-t border-neutral-200'>
        <button className='w-full text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors'>
          View all assignments →
        </button>
      </div>
    </div>
  )
}