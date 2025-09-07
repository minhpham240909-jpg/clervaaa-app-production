import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SummariesFlashcards from '@/components/ai/SummariesFlashcards'

export default async function SummariesFlashcardsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
      
      {/* Floating AI Elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-blue-400/20 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-purple-400/20 rounded-full animate-float-medium"></div>
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-indigo-400/20 rounded-full animate-float-slow"></div>
      <div className="absolute bottom-20 right-1/3 w-12 h-12 bg-cyan-400/20 rounded-full animate-twinkle"></div>
      
      {/* Neural Network Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute top-2/3 left-2/3 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-white rounded-full"></div>
        
        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full" style={{zIndex: 1}}>
          <line x1="25%" y1="25%" x2="50%" y2="33%" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <line x1="50%" y1="33%" x2="33%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <line x1="33%" y1="50%" x2="67%" y2="67%" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <line x1="67%" y1="67%" x2="75%" y2="75%" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <SummariesFlashcards />
      </div>
    </div>
  )
}