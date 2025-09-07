import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import SignInForm from '@/components/auth/SignInForm'

// Helper function to check if user is founder
function isFounder(email: string | null | undefined): boolean {
  if (!email) return false
  const founderEmails = (process.env.FOUNDER_EMAILS || '').split(',').map((e: any) => e.trim()).filter((e: any) => e.length > 0)
  // Check founder access
  return founderEmails.includes(email)
}

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    // Redirect founders to admin dashboard, others to regular dashboard
    if (isFounder(session.user?.email)) {
      redirect('/admin/analytics')
    } else {
      redirect('/dashboard')
    }
  }

  return <SignInForm />
}