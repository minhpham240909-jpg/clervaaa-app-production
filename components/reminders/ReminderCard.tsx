'use client'

import React from 'react'
import { format, isAfter } from 'date-fns'
import { CheckCircle, Clock, AlertTriangle, Trash2, Edit } from 'lucide-react'

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

interface ReminderCardProps {
  reminder: Reminder
  onComplete: (_id: string) => void
  onEdit: (_id: string) => void
  onDelete: (_id: string) => void
}

export default function ReminderCard({ 
  reminder, 
  onComplete, 
  onEdit, 
  onDelete 
}: ReminderCardProps) {
  const isOverdue = !reminder.isCompleted && isAfter(new Date(), reminder.dueDate)
  
  const getTypeIcon = () => {
    switch (reminder.type) {
      case 'assignment':
        return '📝'
      case 'exam':
        return '📋'
      case 'meeting':
        return '🤝'
      case 'study_session':
        return '📚'
      case 'personal':
        return '⭐'
      default:
        return '📅'
    }
  }

  const getPriorityColor = () => {
    switch (reminder.priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  const formatDueDate = () => {
    return format(reminder.dueDate, 'MMM d, yyyy h:mm a')
  }

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        reminder.isCompleted
          ? 'bg-neutral-50 border-neutral-200 opacity-75'
          : isOverdue
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-neutral-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => onComplete(reminder.id)}
            className={`mt-1 p-1 rounded-full transition-colors ${
              reminder.isCompleted
                ? 'text-accent-600 bg-accent-100'
                : 'text-neutral-400 hover:text-accent-600 hover:bg-accent-100'
            }`}
            disabled={reminder.isCompleted}
          >
            <CheckCircle className="h-5 w-5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{getTypeIcon()}</span>
              <h3
                className={`font-medium ${
                  reminder.isCompleted
                    ? 'text-neutral-500 line-through'
                    : 'text-neutral-900'
                }`}
              >
                {reminder.title}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor()}`}>
                {reminder.priority}
              </span>
            </div>

            {reminder.description && (
              <p
                className={`text-sm mb-2 ${
                  reminder.isCompleted ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                {reminder.description}
              </p>
            )}

            <div className="flex items-center space-x-4 text-sm">
              <div className={`flex items-center space-x-1 ${
                isOverdue 
                  ? 'text-red-600' 
                  : reminder.isCompleted 
                  ? 'text-neutral-400' 
                  : 'text-neutral-500'
              }`}>
                {isOverdue ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                <span>{formatDueDate()}</span>
              </div>

              {reminder.course && (
                <span className="text-neutral-500">
                  📖 {reminder.course}
                </span>
              )}
            </div>

            {reminder.tags && reminder.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {reminder.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={() => onEdit(reminder.id)}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
            title="Edit reminder"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(reminder.id)}
            className="p-1 text-neutral-400 hover:text-red-600 rounded"
            title="Delete reminder"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}