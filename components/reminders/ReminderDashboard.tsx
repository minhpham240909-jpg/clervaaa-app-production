'use client'

import React, { useState, useMemo } from 'react'
import { isAfter, isBefore, addDays, startOfDay } from 'date-fns'
import { Plus, Filter, Calendar, AlertTriangle } from 'lucide-react'
import ReminderCard from './ReminderCard'

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

interface ReminderDashboardProps {
  reminders: Reminder[]
  onCreateReminder: () => void
  onEditReminder: (_id: string) => void
  onDeleteReminder: (_id: string) => void
  onCompleteReminder: (_id: string) => void
}

export default function ReminderDashboard({
  reminders,
  onCreateReminder,
  onEditReminder,
  onDeleteReminder,
  onCompleteReminder
}: ReminderDashboardProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'overdue' | 'completed' | 'today' | 'week'>('all')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate')

  const stats = useMemo(() => {
    const now = new Date()
    const todayEnd = addDays(startOfDay(now), 1)
    const weekEnd = addDays(now, 7)

    return {
      total: reminders.length,
      completed: reminders.filter((r: any) => r.isCompleted).length,
      pending: reminders.filter((r: any) => !r.isCompleted).length,
      overdue: reminders.filter((r: any) => !r.isCompleted && isAfter(now, r.dueDate)).length,
      dueToday: reminders.filter((r: any) => !r.isCompleted && isBefore(r.dueDate, todayEnd) && isAfter(r.dueDate, startOfDay(now))).length,
      dueThisWeek: reminders.filter((r: any) => !r.isCompleted && isBefore(r.dueDate, weekEnd) && isAfter(r.dueDate, now)).length
    }
  }, [reminders])

  const filteredReminders = useMemo(() => {
    const now = new Date()
    const todayEnd = addDays(startOfDay(now), 1)
    const weekEnd = addDays(now, 7)

    let filtered = reminders.filter((reminder: any) => {
      switch (selectedFilter) {
        case 'pending':
          return !reminder.isCompleted
        case 'completed':
          return reminder.isCompleted
        case 'overdue':
          return !reminder.isCompleted && isAfter(now, reminder.dueDate)
        case 'today':
          return !reminder.isCompleted && isBefore(reminder.dueDate, todayEnd) && isAfter(reminder.dueDate, startOfDay(now))
        case 'week':
          return !reminder.isCompleted && isBefore(reminder.dueDate, weekEnd) && isAfter(reminder.dueDate, now)
        default:
          return true
      }
    })

    // Sort reminders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'dueDate':
          return a.dueDate.getTime() - b.dueDate.getTime()
        case 'created':
          return b.id.localeCompare(a.id) // Assuming ID is chronological
        default:
          return 0
      }
    })

    return filtered
  }, [reminders, selectedFilter, sortBy])

  const filters = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'overdue', label: 'Overdue', count: stats.overdue },
    { key: 'today', label: 'Due Today', count: stats.dueToday },
    { key: 'week', label: 'This Week', count: stats.dueThisWeek },
    { key: 'completed', label: 'Completed', count: stats.completed }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading text-neutral-900">
            Reminders & Deadlines
          </h2>
          <p className="text-neutral-600">
            Stay on top of your assignments, exams, and important dates
          </p>
        </div>
        <button
          onClick={onCreateReminder}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
          <div className="text-sm text-neutral-600">Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          <div className="text-sm text-neutral-600">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-neutral-600">Overdue</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-neutral-600">Completed</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter: any) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as any)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className="ml-1 text-xs">({filter.count})</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value as any)}
            className="text-sm border border-neutral-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No reminders found
            </h3>
            <p className="text-neutral-500 mb-4">
              {selectedFilter === 'all' 
                ? "You don't have any reminders yet. Create your first reminder to get started."
                : `No reminders match the "${filters.find(f => f.key === selectedFilter)?.label}" filter.`
              }
            </p>
            <button
              onClick={onCreateReminder}
              className="btn-primary"
            >
              Create Reminder
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReminders.map((reminder: any) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={onCompleteReminder}
                onEdit={onEditReminder}
                onDelete={onDeleteReminder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions for Upcoming Deadlines */}
      {stats.dueToday > 0 && selectedFilter !== 'today' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h4 className="font-medium text-orange-900">
              Urgent: {stats.dueToday} reminder{stats.dueToday > 1 ? 's' : ''} due today
            </h4>
          </div>
          <p className="text-sm text-orange-700 mb-3">
            Don't forget about your upcoming deadlines today.
          </p>
          <button
            onClick={() => setSelectedFilter('today')}
            className="text-sm bg-orange-600 text-white px-3 py-1 rounded-md hover:bg-orange-700 transition-colors"
          >
            View Today's Reminders
          </button>
        </div>
      )}
    </div>
  )
}