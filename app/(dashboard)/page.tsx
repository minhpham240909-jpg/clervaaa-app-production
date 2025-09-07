'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import DashboardOverviewSimple from '@/components/dashboard/DashboardOverviewSimple'
import QuickActions from '@/components/dashboard/QuickActions'
import RecentActivity from '@/components/dashboard/RecentActivity'
import UpcomingSessions from '@/components/dashboard/UpcomingSessions'
import AIFeaturesQuick from '@/components/dashboard/AIFeaturesQuick'
import { DashboardErrorBoundary } from '@/components/boundary/DashboardErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (!session && process.env.NODE_ENV === 'production') {
      router.push('/signin')
    }
  }, [session, status, router])
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }
  
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-heading text-neutral-900'>
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className='text-neutral-600 mt-1'>
            Ready to continue your learning journey?
          </p>
          {!session && (
            <p className='text-orange-600 mt-2 text-sm'>
              ⚠️ Demo mode - Some features may be limited without authentication
            </p>
          )}
        </div>
        <QuickActions />
      </div>
      
      <DashboardErrorBoundary>
        <DashboardOverviewSimple />
      </DashboardErrorBoundary>

      {/* AI Features Section */}
      <DashboardErrorBoundary>
        <AIFeaturesQuick />
      </DashboardErrorBoundary>
      
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <DashboardErrorBoundary>
          <UpcomingSessions />
        </DashboardErrorBoundary>
        <DashboardErrorBoundary>
          <RecentActivity />
        </DashboardErrorBoundary>
      </div>
    </div>
  )
}