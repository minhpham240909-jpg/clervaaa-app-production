import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DatabaseAccessPanel from '@/components/admin/DatabaseAccessPanel'

// Helper function to check if user is founder
function isFounder(user: any): boolean {
  if (!user?.email) return false
  const founderEmails = (process.env.FOUNDER_EMAILS || '').split(',').map((e: any) => e.trim()).filter((e: any) => e.length > 0)
  return founderEmails.includes(user.email)
}

export default async function AdminDatabasePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !isFounder(session.user)) {
    redirect('/signin?callbackUrl=' + encodeURIComponent('/admin/database'))
  }

  return <DatabaseAccessPanel />
}
