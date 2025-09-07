'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, UserPlus, Calendar, Award, ExternalLink, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Activity {
  id: string
  type: 'message' | 'new_partner' | 'session_completed' | 'session_scheduled' | 'achievement' | 'reminder'
  content: string
  time: string
  icon: any
  color: string
  bgColor: string
  actionable?: boolean
  actionUrl?: string
  actionText?: string
}

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'message',
    content: 'Sarah sent you a message about the Math study group',
    time: '2 minutes ago',
    icon: MessageCircle,
    color: 'text-primary-600',
    bgColor: 'bg-primary-100',
    actionable: true,
    actionUrl: '/messages',
    actionText: 'Reply',
  },
  {
    id: '2',
    type: 'new_partner',
    content: 'You matched with Alex for Computer Science',
    time: '1 hour ago',
    icon: UserPlus,
    color: 'text-accent-600',
    bgColor: 'bg-accent-100',
    actionable: true,
    actionUrl: '/partners',
    actionText: 'View Profile',
  },
  {
    id: '3',
    type: 'session_completed',
    content: 'Completed study session: Physics Problem Solving',
    time: '3 hours ago',
    icon: Award,
    color: 'text-secondary-600',
    bgColor: 'bg-secondary-100',
    actionable: true,
    actionUrl: '/sessions/3/feedback',
    actionText: 'Rate Session',
  },
  {
    id: '4',
    type: 'session_scheduled',
    content: 'New session scheduled for tomorrow at 2 PM',
    time: '1 day ago',
    icon: Calendar,
    color: 'text-learning-dark',
    bgColor: 'bg-learning-light',
    actionable: true,
    actionUrl: '/calendar',
    actionText: 'View Calendar',
  },
]

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch('/api/dashboard/activity', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setActivities(Array.isArray(data) ? data : [])
      } else {
        // If API fails, show empty state for fresh app
        console.warn('API call failed, showing empty state')
        setActivities([])
      }
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        console.warn('API call timed out, showing empty state')
      } else {
        console.error('Failed to fetch activity:', error)
      }
      // Show empty state on error for fresh app
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activity/${activityId}/read`, {
        method: 'POST',
      })
      if (response.ok) {
        setActivities(activities.filter((activity: any) => activity.id !== activityId))
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
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
          {[...Array(4)].map((_, index) => (
            <div key={index} className='flex items-start space-x-3 animate-pulse'>
              <div className='bg-neutral-200 p-2 rounded-lg flex-shrink-0'>
                <div className='h-4 w-4 bg-neutral-300 rounded'></div>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='h-4 bg-neutral-200 rounded mb-1 w-3/4'></div>
                <div className='h-3 bg-neutral-200 rounded w-1/3'></div>
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
          Recent Activity
        </h2>
      </div>
      
      <div className='space-y-4'>
        {activities.length === 0 ? (
          <div className='text-center py-8'>
            <MessageCircle className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <h4 className='text-lg font-medium text-gray-600 mb-2'>No Recent Activity</h4>
            <p className='text-gray-500'>Your activity feed will appear here as you start using Clerva.</p>
          </div>
        ) : (
          activities.map((activity: any) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className='flex items-start space-x-3 group hover:bg-neutral-50 -mx-2 px-2 py-2 rounded-lg transition-colors duration-200'>
                <div className={`${activity.bgColor} ${activity.color} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className='h-4 w-4' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm text-neutral-900'>{activity.content}</p>
                  <p className='text-xs text-neutral-500 mt-1'>{activity.time}</p>
                  
                  {activity.actionable && (
                    <div className='flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                      <button
                        onClick={() => router.push(activity.actionUrl!)}
                        className='text-xs text-primary-600 hover:text-primary-700 inline-flex items-center font-medium'
                      >
                        {activity.actionText}
                        <ExternalLink className='h-3 w-3 ml-1' />
                      </button>
                      <button
                        onClick={() => markAsRead(activity.id)}
                        className='text-xs text-neutral-500 hover:text-neutral-700 inline-flex items-center'
                      >
                        <CheckCircle className='h-3 w-3 mr-1' />
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}