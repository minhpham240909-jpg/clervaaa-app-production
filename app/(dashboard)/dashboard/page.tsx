import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

import DashboardOverviewSimple from '@/components/dashboard/DashboardOverviewSimple'
import PersonalizedDashboard from '@/components/dashboard/PersonalizedDashboard'
import QuickActions from '@/components/dashboard/QuickActions'
import RecentActivity from '@/components/dashboard/RecentActivity'
import UpcomingSessions from '@/components/dashboard/UpcomingSessions'
import { DashboardErrorBoundary } from '@/components/boundary/DashboardErrorBoundary'


export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  return (
    <div className='space-y-6'>
      {/* Personalized Dashboard Section */}
      <DashboardErrorBoundary>
        <PersonalizedDashboard />
      </DashboardErrorBoundary>
      
      {/* Quick Actions */}
      <div className='flex justify-end'>
        <QuickActions />
      </div>
      
      {/* Dashboard Overview */}
      <DashboardErrorBoundary>
        <DashboardOverviewSimple />
      </DashboardErrorBoundary>

      {/* Sessions and Activity */}
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