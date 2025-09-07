import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ReminderPageClient from '@/components/reminders/ReminderPageClient'
import ChunkErrorBoundary from '@/components/ChunkErrorBoundary'

// This page uses dynamic server features
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RemindersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-neutral-900 mb-2'>
            Sign in Required
          </h2>
          <p className='text-neutral-600 mb-4'>
            Please sign in to access your reminders and deadlines
          </p>
          <a
            href='/signin'
            className='btn-primary inline-flex items-center'
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <ChunkErrorBoundary>
      <ReminderPageClient />
    </ChunkErrorBoundary>
  )
}