import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, Heart, Target, Star } from 'lucide-react'

export default function CTA() {
  return (
    <section className='py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 via-purple-600 to-learning-DEFAULT relative overflow-hidden'>
      {/* Background effects */}
      <div className='absolute inset-0'>
        <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent'></div>
        <div className='absolute top-1/4 left-1/6 w-32 h-32 bg-white/10 rounded-full filter blur-2xl animate-float-slow'></div>
        <div className='absolute bottom-1/4 right-1/6 w-24 h-24 bg-yellow-300/20 rounded-full filter blur-2xl animate-float-medium'></div>
        
        {/* Floating particles */}
        <div className='absolute top-1/6 right-1/4 w-2 h-2 bg-white/60 rounded-full animate-twinkle'></div>
        <div className='absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-yellow-300/80 rounded-full animate-twinkle animation-delay-1000'></div>
        <div className='absolute top-2/3 right-1/6 w-1 h-1 bg-white/50 rounded-full animate-twinkle animation-delay-2000'></div>
      </div>
      
      <div className='max-w-5xl mx-auto text-center relative z-10'>
        <div className='inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-8 animate-pulse'>
          <Target className='w-4 h-4 mr-2' />
          <span>The Moment of Truth</span>
          <Sparkles className='w-4 h-4 ml-2' />
        </div>
        
        <h2 className='text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-white mb-8 animate-fade-in-up relative'>
          The Choice is Yours
          <Star className='absolute -top-4 -right-4 w-8 h-8 text-yellow-300 animate-bounce' />
          <Heart className='absolute -bottom-2 -left-6 w-6 h-6 text-rose-300 animate-pulse' />
        </h2>
        <p className='text-2xl text-primary-50 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200'>
          <span className='block mb-4 text-red-200 font-medium'>Path 1: Keep studying alone, struggling with the same challenges, wondering if there's a better way.</span>
          <span className='block text-green-200 font-bold'>Path 2: Join thousands who chose to study smarter. Find your perfect partner. Transform your academic journey forever.</span>
        </p>
        <div className='flex flex-col sm:flex-row gap-8 justify-center animate-fade-in-up animation-delay-400'>
          <Link 
            href='/signin?mode=signup' 
            className='group relative bg-white text-primary-600 hover:bg-neutral-50 font-bold py-5 px-12 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl inline-flex items-center justify-center transform hover:scale-105 overflow-hidden text-xl'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-primary-50/50 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
            <Zap className='mr-3 h-6 w-6 relative z-10 group-hover:animate-pulse text-yellow-500' />
            <span className='relative z-10'>Choose Your Path</span>
            <ArrowRight className='ml-3 h-6 w-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300' />
          </Link>
          <Link 
            href='/signin?mode=login' 
            className='group border-2 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm font-bold py-5 px-12 rounded-2xl transition-all duration-300 inline-flex items-center justify-center transform hover:scale-105 text-xl'
          >
            <span className='group-hover:animate-pulse'>Already Have Account? Log In</span>
            <Sparkles className='ml-3 h-6 w-6 group-hover:animate-spin transition-transform duration-300' />
          </Link>
        </div>
        
        <div className='mt-16 text-primary-100 text-lg animate-fade-in-up animation-delay-600'>
          <div className='flex flex-col sm:flex-row gap-8 justify-center items-center'>
            <div className='flex items-center'>
              <div className='w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse'></div>
              <span className='font-semibold'>No risk, only reward</span>
            </div>
            <div className='flex items-center'>
              <div className='w-3 h-3 bg-yellow-400 rounded-full mr-3 animate-pulse animation-delay-200'></div>
              <span className='font-semibold'>No barriers, just possibilities</span>
            </div>
            <div className='flex items-center'>
              <div className='w-3 h-3 bg-blue-400 rounded-full mr-3 animate-pulse animation-delay-400'></div>
              <span className='font-semibold'>Your transformation starts now</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}