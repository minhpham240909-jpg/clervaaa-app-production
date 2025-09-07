'use client'

import { useState } from 'react'
import { X, Calendar, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface CreateReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (_reminder: {
    title: string
    description?: string
    dueDate: Date
    type: 'assignment' | 'exam' | 'meeting' | 'personal' | 'study_session'
    priority: 'low' | 'medium' | 'high'
    tags?: string[]
    course?: string
  }) => void
}

export default function CreateReminderModal({ isOpen, onClose, onSubmit }: CreateReminderModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'study_session' as 'assignment' | 'exam' | 'meeting' | 'personal' | 'study_session',
    dueDate: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    priority: 'medium' as 'low' | 'medium' | 'high',
    tags: '',
    course: ''
  })

  const reminderTypes = [
    { value: 'study_session', label: '📚 Study Session', color: 'bg-primary-100 text-primary-700' },
    { value: 'assignment', label: '📝 Assignment Due', color: 'bg-orange-100 text-orange-700' },
    { value: 'exam', label: '🎓 Exam', color: 'bg-red-100 text-red-700' },
    { value: 'meeting', label: '👥 Meeting', color: 'bg-blue-100 text-blue-700' },
    { value: 'personal', label: '⭐ Personal', color: 'bg-neutral-100 text-neutral-700' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' }
  ]


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    const tags = formData.tags ? formData.tags.split(',').map((tag: any) => tag.trim()) : undefined
    
    onSubmit({
      title: formData.title,
      description: formData.description || undefined,
      dueDate: new Date(formData.dueDate),
      type: formData.type,
      priority: formData.priority,
      tags,
      course: formData.course || undefined
    })
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      type: 'study_session',
      dueDate: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      priority: 'medium',
      tags: '',
      course: ''
    })
    
    onClose()
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold font-heading">Create Reminder</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e: any) => handleChange('title', e.target.value)}
              placeholder="Enter reminder title..."
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e: any) => handleChange('description', e.target.value)}
              placeholder="Add additional details..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {reminderTypes.map((type: any) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange('type', type.value)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    formData.type === type.value
                      ? `${type.color} border-current`
                      : 'bg-white border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Due Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e: any) => handleChange('dueDate', e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorities.map((priority: any) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleChange('priority', priority.value)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    formData.priority === priority.value
                      ? `${priority.color} border-current`
                      : 'bg-white border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Course (Optional)
            </label>
            <input
              type="text"
              value={formData.course}
              onChange={(e: any) => handleChange('course', e.target.value)}
              placeholder="e.g., MATH 201, PHYS 101"
              className="input-field"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e: any) => handleChange('tags', e.target.value)}
              placeholder="e.g., calculus, homework, important (comma separated)"
              className="input-field"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Create Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}