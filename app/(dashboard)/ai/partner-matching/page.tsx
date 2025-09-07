import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AIPartnerMatching from '@/components/ai/AIPartnerMatching'

// This page uses dynamic server features
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AIPartnerMatchingPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-neutral-900 mb-2'>
            Sign in Required
          </h2>
          <p className='text-neutral-600 mb-4'>
            Please sign in to access AI partner matching
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
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold font-heading text-neutral-900'>
          AI Partner Matching
        </h1>
        <p className='text-neutral-600 mt-1'>
          Let AI find your perfect study partners based on your preferences
        </p>
      </div>
      
      <AIPartnerMatching />
    </div>
  )
}
