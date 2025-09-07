'use client'

import { useState, useEffect } from 'react'
import { Clock, MapPin, Users, Play, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StudySession {
  id: string
  title: string
  subject: string
  time: string
  duration: string
  location: string
  participants: number
  type: 'in-person' | 'virtual'
  status: 'scheduled' | 'in-progress' | 'completed'
}

const defaultSessions: StudySession[] = [
  {
    id: '1',
    title: 'Calculus Study Group',
    subject: 'Mathematics',
    time: 'Today, 3:00 PM',
    duration: '2 hours',
    location: 'Library Room 204',
    participants: 4,
    type: 'in-person',
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'Algorithm Review',
    subject: 'Computer Science',
    time: 'Tomorrow, 10:00 AM',
    duration: '1.5 hours',
    location: 'Zoom Meeting',
    participants: 3,
    type: 'virtual',
    status: 'scheduled',
  },
  {
    id: '3',
    title: 'Organic Chemistry Lab Prep',
    subject: 'Chemistry',
    time: 'Friday, 2:00 PM',
    duration: '3 hours',
    location: 'Chemistry Building',
    participants: 5,
    type: 'in-person',
    status: 'scheduled',
  },
]

export default function UpcomingSessions() {
  const [sessions, setSessions] = useState<StudySession[]>(defaultSessions)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUpcomingSessions()
  }, [])

  const fetchUpcomingSessions = async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch('/api/dashboard/test-sessions', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setSessions(Array.isArray(data) && data.length > 0 ? data : defaultSessions)
      } else {
        // If API fails, use default sessions and stop loading
        console.warn('Sessions API call failed, using default sessions')
        setSessions(defaultSessions)
      }
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        console.warn('Sessions API call timed out, using default sessions')
      } else {
        console.error('Failed to fetch sessions:', error)
      }
      // Use default sessions on error
      setSessions(defaultSessions)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/join`, {
        method: 'POST',
      })
      if (response.ok) {
        router.push(`/sessions/${sessionId}`)
      }
    } catch (error) {
      console.error('Failed to join session:', error)
    }
  }

  const handleCancelSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/cancel`, {
        method: 'POST',
      })
      if (response.ok) {
        setSessions(sessions.filter((session: any) => session.id !== sessionId))
      }
    } catch (error) {
      console.error('Failed to cancel session:', error)
    }
  }

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <div className='h-6 bg-neutral-200 rounded w-32 animate-pulse'></div>
          <div className='h-4 bg-neutral-200 rounded w-16 animate-pulse'></div>
        </div>
        <div className='space-y-4'>
          {[...Array(3)].map((_, index) => (
            <div key={index} className='border border-neutral-200 rounded-lg p-4 animate-pulse'>
              <div className='h-4 bg-neutral-200 rounded mb-2 w-3/4'></div>
              <div className='h-3 bg-neutral-200 rounded mb-2 w-1/2'></div>
              <div className='flex space-x-4'>
                <div className='h-3 bg-neutral-200 rounded w-20'></div>
                <div className='h-3 bg-neutral-200 rounded w-16'></div>
                <div className='h-3 bg-neutral-200 rounded w-24'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold font-heading text-neutral-900'>
          Upcoming Sessions
        </h2>
      </div>
      
      <div className='space-y-4'>
        {sessions.length === 0 ? (
          <div className='text-center py-8'>
            <Clock className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <h4 className='text-lg font-medium text-gray-600 mb-2'>No Upcoming Sessions</h4>
            <p className='text-gray-500 mb-4'>You don't have any study sessions scheduled yet.</p>
            <button 
              onClick={() => router.push('/sessions/create')}
              className='btn-primary'
            >
              Schedule a Session
            </button>
          </div>
        ) : (
          sessions.map((session: any) => (
            <div key={session.id} className='border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-all duration-200 group'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='font-medium text-neutral-900 mb-1'>{session.title || 'Untitled Session'}</h3>
                  <p className='text-sm text-neutral-600 mb-2'>{session.subject || 'General Study'}</p>
                  
                  <div className='flex items-center space-x-4 text-sm text-neutral-500 mb-3'>
                    <div className='flex items-center'>
                      <Clock className='h-4 w-4 mr-1' />
                      {session.time || 'TBD'}
                    </div>
                    <div className='flex items-center'>
                      <MapPin className='h-4 w-4 mr-1' />
                      {session.location || 'Location TBD'}
                    </div>
                    <div className='flex items-center'>
                      <Users className='h-4 w-4 mr-1' />
                      {session.participants || 0} participants
                    </div>
                  </div>

                  <div className='flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                    <button
                      onClick={() => handleJoinSession(session.id)}
                      className='btn-primary text-xs inline-flex items-center px-3 py-1.5'
                    >
                      <Play className='h-3 w-3 mr-1' />
                      Join
                    </button>
                    <button
                      onClick={() => handleCancelSession(session.id)}
                      className='btn-outline text-xs inline-flex items-center px-3 py-1.5 border-red-200 text-red-600 hover:bg-red-50'
                    >
                      <X className='h-3 w-3 mr-1' />
                      Cancel
                    </button>
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  session.type === 'virtual' 
                    ? 'bg-learning-light text-learning-dark' 
                    : 'bg-accent-100 text-accent-600'
                }`}>
                  {session.type}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}