import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

// Helper function to check if user is founder
function isFounder(user: any): boolean {
  const founderEmails = process.env.FOUNDER_EMAILS?.split(',') || process.env.ADMIN_EMAILS?.split(',') || []
  return founderEmails.includes(user.email)
}

export default async function AdminFeedbackPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !isFounder(session.user)) {
    redirect('/signin')
  }

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold mb-6'>Feedback Management</h1>
      <div className='bg-white rounded-lg p-6 shadow-sm border'>
        <p className='text-gray-600'>
          Feedback management dashboard will be implemented here.
          This page will show all user feedback, feature requests, and bug reports.
        </p>
      </div>
    </div>
  )
}
