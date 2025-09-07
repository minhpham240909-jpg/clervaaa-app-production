import Link from 'next/link'
import { ArrowRight, Users, BookOpen, Target, Star, Sparkles, Zap, Heart, Brain } from 'lucide-react'

export default function Hero() {
  return (
    <section className='relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center bg-white'>
      {/* Enhanced Background Elements */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-yellow-50'></div>
      <div className='absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-50/30'></div>
      
      {/* Floating orbs with enhanced animations */}
      <div className='absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse'></div>
      <div className='absolute top-0 right-4 w-80 h-80 bg-gradient-to-l from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse'></div>
      <div className='absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-t from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse'></div>
      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full mix-blend-overlay filter blur-3xl animate-pulse'></div>
      
      {/* Particle effects */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping'></div>
        <div className='absolute top-1/3 right-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse'></div>
        <div className='absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping'></div>
        <div className='absolute top-2/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce'></div>
      </div>
      
      <div className='relative max-w-7xl mx-auto'>
        <div className='text-center'>
          {/* Badge */}
          <div className='inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8'>
            <Sparkles className='w-4 h-4 mr-2' />
            <span>🚀 New Startup - Join our growing community</span>
            <Star className='w-4 h-4 ml-2 fill-current' />
          </div>
          
          <h1 className='text-5xl sm:text-6xl lg:text-8xl font-bold font-heading text-neutral-900 mb-8 relative'>
            Stop Studying 
            <span className='text-gradient block relative'>
              Alone Forever
              <svg className='absolute -bottom-2 left-0 w-full h-4 text-secondary-300' viewBox='0 0 100 10' preserveAspectRatio='none'>
                <path d='M0 8 Q 50 2 100 8' stroke='currentColor' strokeWidth='3' fill='none' />
              </svg>
              {/* Sparkle effects */}
              <Sparkles className='absolute -top-4 -right-4 w-8 h-8 text-secondary-400 animate-spin' />
              <Heart className='absolute -bottom-2 -left-6 w-6 h-6 text-rose-400 animate-pulse' />
            </span>
          </h1>
          
          <p className='text-2xl sm:text-3xl text-neutral-600 mb-12 max-w-5xl mx-auto leading-relaxed relative'>
            We're building the future of collaborative learning. Join us as we create a platform where students 
            <span className='font-bold text-primary-600 relative inline-block'>
              connect, learn, and succeed together
              <Brain className='inline w-6 h-6 ml-2 text-purple-500 animate-bounce' />
            </span>.
          </p>
          
          <div className='flex flex-col sm:flex-row gap-6 justify-center mb-20'>
            <Link href='/signin?mode=signup' className='group relative bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600 text-white text-xl px-12 py-5 rounded-2xl font-bold inline-flex items-center justify-center transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
              <Zap className='mr-3 h-6 w-6 animate-pulse' />
              Start Your Success Story
              <ArrowRight className='ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300' />
            </Link>
            <Link href='#features' className='group bg-white/80 backdrop-blur-sm border-2 border-primary-200 text-primary-700 text-xl px-12 py-5 rounded-2xl font-bold transform hover:scale-105 transition-all duration-300 hover:bg-primary-50 hover:border-primary-300 shadow-lg hover:shadow-xl'>
              <span className='group-hover:animate-pulse'>Be an Early Adopter</span>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className='flex items-center justify-center gap-8 mb-16 opacity-60'>
            <div className='flex items-center gap-2'>
              <div className='flex -space-x-2'>
                <div className='w-8 h-8 bg-primary-400 rounded-full border-2 border-white'></div>
                <div className='w-8 h-8 bg-secondary-400 rounded-full border-2 border-white'></div>
                <div className='w-8 h-8 bg-accent-400 rounded-full border-2 border-white'></div>
              </div>
              <span className='text-sm font-medium'>Growing daily</span>
            </div>
            <div className='flex items-center gap-1'>
              {[...Array(5)].map((_, i) => (
                <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
              ))}
              <span className='text-sm font-medium ml-1'>4.9/5 rating</span>
            </div>
          </div>
          
          {/* Enhanced Stats Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-8'>
            <div className='group relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-3xl p-10 text-center shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-primary-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              <div className='relative'>
                <div className='bg-gradient-to-br from-primary-400 via-purple-500 to-primary-600 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl'>
                  <Users className='h-12 w-12 text-white animate-pulse' />
                </div>
                <h3 className='font-bold text-3xl mb-3 text-neutral-900 group-hover:text-primary-700 transition-colors duration-300'>500+</h3>
                <p className='text-neutral-600 font-semibold text-lg'>Early Adopters</p>
                <div className='mt-6 h-2 w-16 bg-gradient-to-r from-primary-400 to-purple-600 rounded-full mx-auto group-hover:w-24 transition-all duration-500'></div>
              </div>
            </div>
            
            <div className='group relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-3xl p-10 text-center shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-secondary-50/50 to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              <div className='relative'>
                <div className='bg-gradient-to-br from-secondary-400 via-yellow-500 to-secondary-600 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl'>
                  <BookOpen className='h-12 w-12 text-white animate-pulse animation-delay-200' />
                </div>
                <h3 className='font-bold text-3xl mb-3 text-neutral-900 group-hover:text-secondary-700 transition-colors duration-300'>50+</h3>
                <p className='text-neutral-600 font-semibold text-lg'>Subjects Covered</p>
                <div className='mt-6 h-2 w-16 bg-gradient-to-r from-secondary-400 to-yellow-600 rounded-full mx-auto group-hover:w-24 transition-all duration-500'></div>
              </div>
            </div>
            
            <div className='group relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-3xl p-10 text-center shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-accent-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              <div className='relative'>
                <div className='bg-gradient-to-br from-accent-400 via-green-500 to-accent-600 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl'>
                  <Target className='h-12 w-12 text-white animate-pulse animation-delay-400' />
                </div>
                <h3 className='font-bold text-3xl mb-3 text-neutral-900 group-hover:text-accent-700 transition-colors duration-300'>Beta</h3>
                <p className='text-neutral-600 font-semibold text-lg'>Version 1.0</p>
                <div className='mt-6 h-2 w-16 bg-gradient-to-r from-accent-400 to-green-600 rounded-full mx-auto group-hover:w-24 transition-all duration-500'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}