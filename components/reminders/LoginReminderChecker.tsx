'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'

export default function LoginReminderChecker() {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Only run when session is loaded and user is authenticated
    if (status === 'authenticated' && session?.user?.email) {
      checkAndCreateLoginReminders()
    }
  }, [status, session])

  const checkAndCreateLoginReminders = async () => {
    try {
      const response = await fetch('/api/reminders/login-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.reminderCreated) {
          // Show a welcome back notification
          setTimeout(() => {
            toast.success('Welcome back! We\'ve set up some study reminders for you.', {
              duration: 5000,
              icon: '🎉'
            })
          }, 2000) // Delay to avoid overwhelming the user on page load
        }
      }
    } catch (error) {
      console.error('Failed to check login reminders:', error)
      // Silently fail - this is not critical functionality
    }
  }

  // This component doesn't render anything visible
  return null
}
