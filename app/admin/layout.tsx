import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

// Helper function to check if user is founder
function isFounder(user: any): boolean {
  if (!user?.email) return false
  const founderEmails = (process.env.FOUNDER_EMAILS || '').split(',').map((e: any) => e.trim()).filter((e: any) => e.length > 0)
  // Admin access check
  return founderEmails.includes(user.email)
}

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !isFounder(session.user)) {
    redirect('/signin?callbackUrl=' + encodeURIComponent('/admin/analytics'))
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>Clerva Admin</h1>
              <p className='text-sm text-gray-600'>Founder Dashboard</p>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-700'>
                Signed in as: {session.user.email}
              </span>
              <nav className='flex space-x-4'>
                <a 
                  href='/admin' 
                  className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                >
                  Overview
                </a>
                <a 
                  href='/admin/users' 
                  className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                >
                  Users
                </a>
                <a 
                  href='/admin/analytics' 
                  className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                >
                  Analytics
                </a>
                <a 
                  href='/admin/content' 
                  className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                >
                  Content & AI
                </a>
                <a 
                  href='/admin/security' 
                  className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                >
                  Security
                </a>
                <a 
                  href='/admin/database' 
                  className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                >
                  Database
                </a>
                <a 
                  href='/dashboard' 
                  className='text-gray-600 hover:text-gray-800 text-sm'
                >
                  Back to App
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}