import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session
  
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error('Auth error:', error)
    // Allow access in demo mode if auth fails
    session = null
  }
  
  // Only redirect if we're sure there's no session and not in demo mode
  if (!session && process.env.NODE_ENV === 'production') {
    redirect('/signin')
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardLayoutClient>
        {children}
      </DashboardLayoutClient>
    </Suspense>
  )
}