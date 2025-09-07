'use client'

import React, { useState, useEffect } from 'react'
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
  subMonths,
  startOfDay,
  addDays,
  addHours,
  eachHourOfInterval,
  isSameWeek,
  startOfWeek as startOfWeekFn,
  endOfWeek as endOfWeekFn
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Filter, X, Calendar, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react'

interface StudyEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  type: 'study_session' | 'group_study' | 'exam' | 'assignment' | 'meeting' | 'reminder'
  color: string
  location?: string
  isAllDay?: boolean
  participants?: string[]
  createdBy?: string
}

interface CreateEventForm {
  title: string
  description: string
  startTime: string
  endTime: string
  date: string
  type: StudyEvent['type']
  location: string
  isAllDay: boolean
}

const defaultForm: CreateEventForm = {
  title: '',
  description: '',
  startTime: '09:00',
  endTime: '10:00',
  date: '',
  type: 'study_session',
  location: '',
  isAllDay: false
}

const eventTypes = [
  { value: 'study_session', label: 'Study Session', color: '#3B82F6', icon: '📚' },
  { value: 'group_study', label: 'Group Study', color: '#10B981', icon: '👥' },
  { value: 'exam', label: 'Exam', color: '#EF4444', icon: '📝' },
  { value: 'assignment', label: 'Assignment', color: '#F59E0B', icon: '📋' },
  { value: 'meeting', label: 'Meeting', color: '#8B5CF6', icon: '🤝' },
  { value: 'reminder', label: 'Reminder', color: '#EC4899', icon: '⏰' }
]

export default function InteractiveStudyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<StudyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState<CreateEventForm>(defaultForm)
  const [editingEvent, setEditingEvent] = useState<StudyEvent | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [eventTypeFilters, setEventTypeFilters] = useState<string[]>([])

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      // First try to use a real API endpoint, fall back to mock data
      const response = await fetch('/api/calendar/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.map((event: any) => ({
          ...event,
          startTime: new Date(event.createdAt),
          endTime: new Date(event.scheduledAt)
        })))
      } else {
        // Use mock data for demonstration
        setEvents(getMockEvents())
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
      // Use mock data for demonstration
      setEvents(getMockEvents())
    } finally {
      setLoading(false)
    }
  }

  const getMockEvents = (): StudyEvent[] => {
    const today = new Date()
    return [
      {
        id: '1',
        title: 'Mathematics Study Session',
        description: 'Calculus review with study group',
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000), // tomorrow
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 hours
        type: 'group_study',
        color: '#10B981',
        location: 'Library Room 205',
        participants: ['Alice', 'Bob', 'Charlie']
      },
      {
        id: '2',
        title: 'Computer Science Exam',
        description: 'Final exam for CS 101',
        startTime: addDays(today, 3),
        endTime: addHours(addDays(today, 3), 3),
        type: 'exam',
        color: '#EF4444',
        location: 'Main Hall'
      },
      {
        id: '3',
        title: 'Physics Assignment Due',
        description: 'Submit quantum mechanics problem set',
        startTime: addDays(today, 5),
        endTime: addDays(today, 5),
        type: 'assignment',
        color: '#F59E0B',
        isAllDay: true
      }
    ]
  }

  const getEventsForDay = (day: Date) => {
    const filtered = eventTypeFilters.length > 0 
      ? events.filter((event: any) => event.type && eventTypeFilters.includes(event.type))
      : events
    
    return filtered.filter((event: any) => 
      event.createdAt && isSameDay(event.createdAt, day)
    )
  }

  const getEventTypeConfig = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0]
  }

  const handlePrevPeriod = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1))
        break
      case 'week':
        setCurrentDate(addDays(currentDate, -7))
        break
      case 'day':
        setCurrentDate(addDays(currentDate, -1))
        break
    }
  }

  const handleNextPeriod = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1))
        break
      case 'week':
        setCurrentDate(addDays(currentDate, 7))
        break
      case 'day':
        setCurrentDate(addDays(currentDate, 1))
        break
    }
  }

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
  }

  const handleCreateEvent = (date?: Date) => {
    const eventDate = date || selectedDate || new Date()
    setCreateForm({
      ...defaultForm,
      date: format(eventDate, 'yyyy-MM-dd')
    })
    setEditingEvent(null)
    setShowCreateModal(true)
  }

  const handleEditEvent = (event: StudyEvent) => {
    setCreateForm({
      title: event.title,
      description: event.description || '',
      startTime: format(event.startTime, 'HH:mm'),
      endTime: format(event.endTime, 'HH:mm'),
      date: format(event.startTime, 'yyyy-MM-dd'),
      type: event.type,
      location: event.location || '',
      isAllDay: event.isAllDay || false
    })
    setEditingEvent(event)
    setShowCreateModal(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/calendar/events/${eventId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setEvents(events.filter((e: any) => e.id !== eventId))
        }
      } catch (error) {
        // For demo, just remove from local state
        setEvents(events.filter((e: any) => e.id !== eventId))
      }
    }
  }

  const handleSubmitEvent = async () => {
    try {
      const eventData = {
        ...createForm,
        startTime: createForm.isAllDay 
          ? startOfDay(new Date(createForm.date))
          : new Date(`${createForm.date}T${createForm.startTime}:00`),
        endTime: createForm.isAllDay 
          ? startOfDay(new Date(createForm.date))
          : new Date(`${createForm.date}T${createForm.endTime}:00`),
        color: getEventTypeConfig(createForm.type).color
      }

      if (editingEvent) {
        // Update existing event
        const response = await fetch(`/api/calendar/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        })
        
        if (response.ok || true) { // Allow demo mode
          setEvents(events.map((e: any) => 
            e.id === editingEvent.id ? { ...e, ...eventData, id: editingEvent.id } : e
          ))
        }
      } else {
        // Create new event
        const response = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        })
        
        const newEvent = {
          ...eventData,
          id: Date.now().toString(), // Demo ID
          participants: []
        }
        
        setEvents([...events, newEvent])
      }

      setShowCreateModal(false)
      setCreateForm(defaultForm)
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  const handleFilterToggle = (type: string) => {
    setEventTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter((t: any) => t !== type)
        : [...prev, type]
    )
  }

  const formatViewTitle = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'MMMM yyyy')
      case 'week':
        const weekStart = startOfWeekFn(currentDate)
        const weekEnd = endOfWeekFn(currentDate)
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy')
    }
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-neutral-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day: any) => (
            <div key={day} className="p-4 text-center text-sm font-medium text-neutral-500 bg-neutral-50">
              {day}
            </div>
          ))}
        </div>
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
                  <span className={`text-sm font-medium ${
                    isToday(day)
                      ? 'bg-primary-500 text-white w-6 h-6 rounded-full flex items-center justify-center'
                      : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {isCurrentMonth && (
                    <button
                      onClick={(e: any) => {
                        e.stopPropagation()
                        handleCreateEvent(day)
                      }}
                      className="opacity-0 hover:opacity-100 text-neutral-400 hover:text-primary-600 transition-opacity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event: any) => (
                    <div
                      key={event.id}
                      onClick={(e: any) => {
                        e.stopPropagation()
                        handleEditEvent(event)
                      }}
                      className="text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: event.color }}
                      title={`${event.title} - ${event.isAllDay ? 'All day' : format(event.createdAt, 'h:mm a')}`}
                    >
                      <span className="mr-1">{getEventTypeConfig(event.type).icon}</span>
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
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeekFn(currentDate)
    const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })
    const hours = eachHourOfInterval({ 
      start: new Date(2024, 0, 1, 6, 0), 
      end: new Date(2024, 0, 1, 22, 0) 
    })

    return (
      <div className="card overflow-hidden">
        <div className="grid grid-cols-8 border-b border-neutral-200">
          <div className="p-4 text-sm font-medium text-neutral-500 bg-neutral-50"></div>
          {weekDays.map((day: any) => (
            <div key={day.toISOString()} className="p-4 text-center text-sm font-medium text-neutral-500 bg-neutral-50">
              <div>{format(day, 'EEE')}</div>
              <div className={`mt-1 ${isToday(day) ? 'bg-primary-500 text-white w-6 h-6 rounded-full flex items-center justify-center mx-auto' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {hours.map((hour: any) => (
            <div key={hour.toISOString()} className="grid grid-cols-8 border-b border-neutral-100">
              <div className="p-2 text-xs text-neutral-500 bg-neutral-50 border-r border-neutral-200">
                {format(hour, 'h a')}
              </div>
              {weekDays.map((day: any) => {
                const cellEvents = events.filter((event: any) => 
                  isSameDay(event.createdAt, day) && 
                  format(event.createdAt, 'H') === format(hour, 'H')
                )
                return (
                  <div 
                    key={`${day.toISOString()}-${hour.toISOString()}`}
                    className="p-1 border-r border-neutral-200 min-h-[40px] hover:bg-neutral-50 cursor-pointer"
                    onClick={() => handleCreateEvent(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour.getHours()))}
                  >
                    {cellEvents.map((event: any) => (
                      <div
                        key={event.id}
                        onClick={(e: any) => {
                          e.stopPropagation()
                          handleEditEvent(event)
                        }}
                        className="text-xs p-1 rounded text-white truncate mb-1 cursor-pointer"
                        style={{ backgroundColor: event.color }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate)
    
    return (
      <div className="card">
        <div className="border-b border-neutral-200 p-4 bg-neutral-50">
          <h3 className="font-medium text-neutral-900">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        
        <div className="p-4">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500 mb-4">No events scheduled for this day</p>
              <button
                onClick={() => handleCreateEvent(currentDate)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event: any) => (
                <div key={event.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full mt-2"
                        style={{ backgroundColor: event.color }}
                      ></div>
                      <div>
                        <h4 className="font-medium text-neutral-900">
                          <span className="mr-2">{getEventTypeConfig(event.type).icon}</span>
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-sm text-neutral-600 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-500">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {event.isAllDay 
                              ? 'All day' 
                              : `${format(event.createdAt, 'h:mm a')} - ${format(event.scheduledAt, 'h:mm a')}`
                            }
                          </span>
                          {event.timezone && (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.timezone}
                            </span>
                          )}
                          {event.participants && event.participants.length > 0 && (
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {event.participants.length} participants
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-1 text-neutral-400 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1 text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="h-10 bg-neutral-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-neutral-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="h-96 bg-neutral-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold font-heading text-neutral-900">
            {formatViewTitle()}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevPeriod}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-600" />
            </button>
            <button
              onClick={handleNextPeriod}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-neutral-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleCreateEvent()}
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
          
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-primary-100 text-primary-600' : 'hover:bg-neutral-100'
              }`}
            >
              <Filter className="h-5 w-5" />
            </button>
            
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 p-4">
                <h4 className="font-medium text-neutral-900 mb-3">Filter by Type</h4>
                <div className="space-y-2">
                  {eventTypes.map((type: any) => (
                    <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventTypeFilters.includes(type.value)}
                        onChange={() => handleFilterToggle(type.value)}
                        className="rounded border-neutral-300"
                      />
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
                {eventTypeFilters.length > 0 && (
                  <button
                    onClick={() => setEventTypeFilters([])}
                    className="text-sm text-primary-600 hover:text-primary-700 mt-3"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

      {/* Create/Edit Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Title</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e: any) => setCreateForm(prev => ({...prev, title: e.target.value}))}
                  className="input-field"
                  placeholder="Enter event title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Type</label>
                <select
                  value={createForm.type}
                  onChange={(e: any) => setCreateForm(prev => ({...prev, type: e.target.value as any}))}
                  className="input-field"
                >
                  {eventTypes.map((type: any) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Date</label>
                <input
                  type="date"
                  value={createForm.date}
                  onChange={(e: any) => setCreateForm(prev => ({...prev, date: e.target.value}))}
                  className="input-field"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={createForm.isAllDay}
                  onChange={(e: any) => setCreateForm(prev => ({...prev, isAllDay: e.targetDate.checked}))}
                  className="rounded border-neutral-300"
                />
                <label htmlFor="allDay" className="text-sm text-neutral-700">All day event</label>
              </div>
              
              {!createForm.isAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={createForm.startTime}
                      onChange={(e: any) => setCreateForm(prev => ({...prev, startTime: e.target.value}))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={createForm.endTime}
                      onChange={(e: any) => setCreateForm(prev => ({...prev, endTime: e.target.value}))}
                      className="input-field"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Location (optional)</label>
                <input
                  type="text"
                  value={createForm.location}
                  onChange={(e: any) => setCreateForm(prev => ({...prev, location: e.target.value}))}
                  className="input-field"
                  placeholder="Enter location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Description (optional)</label>
                <textarea
                  value={createForm.description}
                  onChange={(e: any) => setCreateForm(prev => ({...prev, description: e.target.value}))}
                  rows={3}
                  className="input-field"
                  placeholder="Enter description"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSubmitEvent}
                className="btn-primary flex-1"
                disabled={!createForm.title || !createForm.date}
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}