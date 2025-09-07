import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProgressAnalysis from '@/components/ai/ProgressAnalysis'

export default async function ProgressAnalysisPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Data Analytics Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800"></div>
      
      {/* Chart-like grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Data visualization elements */}
      <div className="absolute inset-0">
        {/* Progress bars */}
        <div className="absolute top-32 left-16 w-32 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-green-400/60 rounded-full animate-pulse" style={{width: '75%'}}></div>
        </div>
        <div className="absolute top-48 right-20 w-24 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-teal-400/60 rounded-full animate-pulse animation-delay-1000" style={{width: '60%'}}></div>
        </div>
        <div className="absolute bottom-32 left-24 w-28 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400/60 rounded-full animate-pulse animation-delay-2000" style={{width: '85%'}}></div>
        </div>
        
        {/* Chart dots */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-green-400/40 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/3 left-2/5 w-4 h-4 bg-teal-400/40 rounded-full animate-pulse-slow animation-delay-500"></div>
        <div className="absolute top-2/5 left-1/2 w-5 h-5 bg-emerald-400/40 rounded-full animate-pulse-slow animation-delay-1000"></div>
        <div className="absolute top-1/2 left-3/5 w-3 h-3 bg-cyan-400/40 rounded-full animate-pulse-slow animation-delay-1500"></div>
        <div className="absolute top-3/5 left-2/3 w-4 h-4 bg-green-400/40 rounded-full animate-pulse-slow animation-delay-2000"></div>
        
        {/* Connecting trend line */}
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <polyline 
            points="33,25 40,33 50,40 60,50 67,60" 
            fill="none" 
            stroke="rgba(34,197,94,0.4)" 
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          >
            <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="3s" repeatCount="indefinite"/>
          </polyline>
        </svg>
      </div>
      
      {/* Analytics icons */}
      <div className="absolute top-20 right-16 text-green-300/20 animate-float-slow">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3,3V21H21V19H5V3H3M18,17H20V10H18V17M14,17H16V7H14V17M10,17H12V13H10V17M6,17H8V15H6V17Z"/>
        </svg>
      </div>
      <div className="absolute bottom-20 right-24 text-teal-300/15 animate-float-medium animation-delay-2000">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M7,9L12,2L17,9H13V15H11V9H7Z"/>
        </svg>
      </div>
      
      {/* Floating data particles */}
      <div className="absolute top-16 left-1/4 w-2 h-2 bg-emerald-400/30 rounded-full animate-twinkle"></div>
      <div className="absolute top-40 right-1/3 w-3 h-3 bg-teal-400/25 rounded-full animate-twinkle animation-delay-1000"></div>
      <div className="absolute bottom-28 left-1/3 w-2 h-2 bg-cyan-400/35 rounded-full animate-twinkle animation-delay-2000"></div>
      <div className="absolute bottom-48 right-20 w-4 h-4 bg-green-400/20 rounded-full animate-twinkle animation-delay-3000"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <ProgressAnalysis />
      </div>
    </div>
  )
}