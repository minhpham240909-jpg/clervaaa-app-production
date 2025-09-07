import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SignInForm from '@/components/auth/SignInForm'
import { BookOpen, Users, Target, Shield } from 'lucide-react'

export default async function SignInPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className='relative overflow-hidden'>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-5'>
        <div className='absolute top-20 left-20 w-32 h-32 bg-primary-500 rounded-full blur-3xl'></div>
        <div className='absolute bottom-20 right-20 w-40 h-40 bg-secondary-500 rounded-full blur-3xl'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-accent-500 rounded-full blur-3xl'></div>
      </div>

      {/* Floating Icons */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 animate-bounce'>
          <BookOpen className='w-8 h-8 text-primary-400 opacity-20' />
        </div>
        <div className='absolute top-1/3 right-1/4 animate-pulse'>
          <Users className='w-6 h-6 text-secondary-400 opacity-20' />
        </div>
        <div className='absolute bottom-1/4 left-1/3 animate-bounce'>
          <Target className='w-7 h-7 text-accent-400 opacity-20' />
        </div>
        <div className='absolute bottom-1/3 right-1/3 animate-pulse'>
          <Shield className='w-5 h-5 text-primary-400 opacity-20' />
        </div>
      </div>

      {/* Main Content */}
      <div className='relative z-10'>
        <SignInForm session={session} />
      </div>

      {/* Footer */}
      <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-xs text-neutral-400'>
        <p>Clerva © 2024 • Empowering students worldwide</p>
      </div>
    </div>
  )
}