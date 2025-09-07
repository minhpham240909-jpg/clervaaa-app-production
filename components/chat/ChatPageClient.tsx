'use client'

import { useSession } from 'next-auth/react'
import ChatInterface from './ChatInterface'
import { ChatErrorBoundary } from '../boundary/ChatErrorBoundary'

export default function ChatPageClient() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500'></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>💬</div>
          <h2 className='text-2xl font-semibold text-neutral-900 mb-2'>
            Sign in Required
          </h2>
          <p className='text-neutral-600 mb-4'>
            Please sign in to access your messages and chat with study partners
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

  // Use email as fallback ID if user.id is not available
  const userId = session.user.id || session.user.email || 'anonymous'

  return (
    <div className='h-full'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold font-heading text-neutral-900'>
          Messages
        </h1>
        <p className='text-neutral-600 mt-1'>
          Chat with your study partners and groups
        </p>
      </div>
      
      <ChatErrorBoundary>
        <div className='bg-white rounded-xl shadow-soft border border-neutral-200 h-[calc(100vh-12rem)]'>
          <ChatInterface userId={userId} />
        </div>
      </ChatErrorBoundary>
    </div>
  )
}