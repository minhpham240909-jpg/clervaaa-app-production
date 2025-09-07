'use client'

import React, { useState } from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  isToday,
  addMonths,
  subMonths
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react'

interface StudyEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  type: 'study_session' | 'group_study' | 'exam' | 'assignment' | 'meeting'
  color: string
  location?: string
  isAllDay?: boolean
  participants?: string[]
}

interface StudyCalendarProps {
  events: StudyEvent[]
  onEventClick?: (event: StudyEvent) => void
  onDateClick?: (date: Date) => void
  onCreateEvent?: (date: Date) => void
}

export default function StudyCalendar({ 
  events = [], 
  onEventClick: _onEventClick, 
  onDateClick, 
  onCreateEvent 
}: StudyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const getEventsForDay = (day: Date) => {
    return events.filter((event: any) => 
      isSameDay(event.createdAt, day)
    )
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'study_session':
        return '📚'
      case 'group_study':
        return '👥'
      case 'exam':
        return '📝'
      case 'assignment':
        return '📋'
      case 'meeting':
        return '🤝'
      default:
        return '📅'
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
    onDateClick?.(day)
  }

  const handleCreateEvent = (day: Date) => {
    onCreateEvent?.(day)
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold font-heading text-neutral-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-neutral-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleCreateEvent(new Date())}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </button>
          
          <div className="flex items-center space-x-1 bg-neutral-100 rounded-lg p-1">
            {['month', 'week', 'day'].map((mode: any) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
                  viewMode === mode
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          
          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <Filter className="h-5 w-5 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-neutral-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day: any) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-medium text-neutral-500 bg-neutral-50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`min-h-[120px] p-2 border-r border-b border-neutral-200 cursor-pointer transition-colors ${
                  !isCurrentMonth
                    ? 'bg-neutral-50 text-neutral-400'
                    : isSelected
                    ? 'bg-primary-50'
                    : 'hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isToday(day)
                        ? 'bg-primary-500 text-white w-6 h-6 rounded-full flex items-center justify-center'
                        : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event: any) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded text-white truncate"
                      style={{ backgroundColor: event.color }}
                      title={`${event.title} - ${format(event.createdAt, 'h:mm a')}`}
                    >
                      <span className="mr-1">{getEventTypeIcon(event.type)}</span>
                      {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-neutral-500 pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="card">
          <h3 className="text-lg font-semibold font-heading mb-4">
            Events for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          
          <div className="space-y-3">
            {getEventsForDay(selectedDate).length === 0 ? (
              <p className="text-neutral-500 text-center py-4">No events scheduled for this day</p>
            ) : (
              getEventsForDay(selectedDate).map((event: any) => (
                <div key={event.id} className="border border-neutral-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full mt-2"
                        style={{ backgroundColor: event.color }}
                      ></div>
                      <div>
                        <h4 className="font-medium text-neutral-900">
                          <span className="mr-2">{getEventTypeIcon(event.type)}</span>
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-sm text-neutral-600 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-500">
                          <span>
                            {event.isAllDay 
                              ? 'All day' 
                              : `${format(event.createdAt, 'h:mm a')} - ${format(event.scheduledAt, 'h:mm a')}`
                            }
                          </span>
                          {event.timezone && (
                            <span>📍 {event.timezone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-xs px-2 py-1 bg-neutral-100 rounded-full capitalize">
                      {event.type.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}