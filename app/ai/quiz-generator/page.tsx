import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import QuizGenerator from '@/components/ai/QuizGenerator'

export default async function QuizGeneratorPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Energetic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600"></div>
      
      {/* Quiz Elements Pattern */}
      <div className="absolute inset-0 opacity-15">
        {/* Question marks */}
        <div className="absolute top-20 left-16 text-6xl text-white/30 animate-bounce">?</div>
        <div className="absolute top-32 right-20 text-4xl text-white/20 animate-bounce animation-delay-1000">?</div>
        <div className="absolute bottom-40 left-32 text-5xl text-white/25 animate-bounce animation-delay-2000">?</div>
        <div className="absolute bottom-28 right-16 text-3xl text-white/20 animate-bounce animation-delay-3000">?</div>
        
        {/* Exclamation marks */}
        <div className="absolute top-40 left-1/3 text-4xl text-yellow-200/30 animate-pulse-slow">!</div>
        <div className="absolute bottom-1/3 right-1/3 text-5xl text-orange-200/25 animate-pulse-slow animation-delay-1000">!</div>
        
        {/* Geometric shapes for answers */}
        <div className="absolute top-1/4 right-1/4 w-8 h-8 border-4 border-white/20 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-6 h-6 border-3 border-white/25 animate-spin-slow animation-delay-2000"></div>
      </div>
      
      {/* Lightning bolts for "brain power" */}
      <div className="absolute top-24 right-1/3">
        <svg width="40" height="60" viewBox="0 0 24 36" fill="none" className="text-yellow-300/20 animate-twinkle">
          <path d="M13 2L3 14h8l-2 14 10-12h-8l2-14z" fill="currentColor"/>
        </svg>
      </div>
      <div className="absolute bottom-32 left-1/4">
        <svg width="32" height="48" viewBox="0 0 24 36" fill="none" className="text-amber-300/25 animate-twinkle animation-delay-2000">
          <path d="M13 2L3 14h8l-2 14 10-12h-8l2-14z" fill="currentColor"/>
        </svg>
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-16 left-20 w-3 h-3 bg-yellow-400/30 rounded-full animate-float-fast"></div>
      <div className="absolute top-60 right-32 w-4 h-4 bg-orange-400/25 rounded-full animate-float-medium"></div>
      <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-amber-400/35 rounded-full animate-float-slow"></div>
      <div className="absolute bottom-44 right-1/4 w-5 h-5 bg-red-400/20 rounded-full animate-float-fast animation-delay-1000"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <QuizGenerator />
      </div>
    </div>
  )
}