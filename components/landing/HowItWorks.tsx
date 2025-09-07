import { UserPlus, Search, Users, BookOpen, Sparkles, ArrowRight, Target, Heart } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    title: 'Define Your Quest',
    description: 'Share your academic dreams, learning style, and schedule. This isn\'t just data—it\'s your study DNA that helps us find your perfect match.',
  },
  {
    icon: Search,
    title: 'Discover Your Fellowship',
    description: 'Our AI assembles your study squad—not just anyone, but the right partners who complement your journey and fill your knowledge gaps.',
  },
  {
    icon: Users,
    title: 'Spark the Connection',
    description: 'First conversations reveal everything. Within minutes, you\'ll know if you\'ve found your study soulmate or academic accountability partner.',
  },
  {
    icon: BookOpen,
    title: 'Transform Together',
    description: 'Solo struggles become shared victories. Individual weaknesses become collective strengths. You don\'t just study—you conquer.',
  },
]

export default function HowItWorks() {
  return (
    <section id='how-it-works' className='py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50/20 via-neutral-50 to-white relative overflow-hidden'>
      {/* Background decorations */}
      <div className='absolute top-0 left-0 w-full h-full'>
        <div className='absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-r from-primary-200/30 to-purple-200/30 rounded-full filter blur-2xl animate-float-slow'></div>
        <div className='absolute bottom-1/4 right-1/6 w-24 h-24 bg-gradient-to-l from-secondary-200/30 to-yellow-200/30 rounded-full filter blur-2xl animate-float-medium'></div>
      </div>
      
      <div className='max-w-7xl mx-auto relative'>
        <div className='text-center mb-20 animate-fade-in-up'>
          <div className='inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-purple-100 text-primary-700 text-sm font-medium mb-8'>
            <Target className='w-4 h-4 mr-2' />
            <span>Your Path to Academic Excellence</span>
            <Sparkles className='w-4 h-4 ml-2' />
          </div>
          
          <h2 className='text-5xl sm:text-6xl lg:text-7xl font-bold font-heading text-neutral-900 mb-8'>
            Your Journey from Struggle to 
            <span className='text-gradient block animate-gradient-shift'>
              Success
            </span>
          </h2>
          <p className='text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed'>
            Every academic hero starts alone, facing impossible challenges. But the greatest achievements happen 
            when brilliant minds unite. Here's how your transformation begins.
          </p>
        </div>
        
        <div className='relative'>
          {/* Connection lines for desktop */}
          <div className='hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-5xl'>
            <div className='flex justify-between items-center h-1'>
              <div className='flex-1 h-0.5 bg-gradient-to-r from-transparent via-primary-300 to-primary-300'></div>
              <div className='flex-1 h-0.5 bg-gradient-to-r from-primary-300 to-primary-300'></div>
              <div className='flex-1 h-0.5 bg-gradient-to-r from-primary-300 to-transparent'></div>
            </div>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12'>
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className='text-center group animate-fade-in-up' style={{animationDelay: `${index * 0.2}s`}}>
                  <div className='relative mb-8'>
                    <div className='bg-gradient-to-br from-primary-500 via-purple-500 to-primary-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                      <Icon className='h-12 w-12 text-white group-hover:animate-pulse' />
                    </div>
                    <div className='absolute -top-3 -right-3 bg-gradient-to-r from-secondary-400 to-yellow-400 text-neutral-900 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-125 transition-transform duration-300'>
                      {index + 1}
                    </div>
                    
                    {/* Step connector arrow for mobile/tablet */}
                    {index < steps.length - 1 && (
                      <div className='lg:hidden flex justify-center mt-6'>
                        <ArrowRight className='w-6 h-6 text-primary-400 animate-bounce' />
                      </div>
                    )}
                  </div>
                  
                  <h3 className='font-bold text-2xl mb-6 font-heading text-neutral-900 group-hover:text-primary-700 transition-colors duration-300'>
                    {step.title}
                  </h3>
                  <p className='text-neutral-600 leading-relaxed text-lg group-hover:text-neutral-700 transition-colors duration-300'>
                    {step.description}
                  </p>
                  
                  {/* Hover effect */}
                  <div className='mt-6 w-16 h-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                </div>
              )
            })}
          </div>
          
          {/* Call to action */}
          <div className='text-center mt-20'>
            <div className='bg-gradient-to-r from-neutral-900 via-primary-900 to-neutral-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-3xl'>
              <div className='absolute inset-0 bg-gradient-to-t from-primary-600/20 to-transparent'></div>
              
              <div className='relative z-10'>
                <div className='inline-flex items-center px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6'>
                  <Heart className='w-4 h-4 mr-2 text-rose-300' />
                  <span>Ready to Begin Your Transformation?</span>
                </div>
                
                <h3 className='text-3xl font-bold mb-6 font-heading'>Your Study Success Story Starts Now</h3>
                <p className='text-xl mb-8 opacity-90 max-w-2xl mx-auto'>Don't let another semester slip by. Take the first step towards collaborative learning today.</p>
                
                <a href='/signin' className='inline-flex items-center px-10 py-4 bg-white text-primary-600 rounded-2xl font-bold hover:bg-primary-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105'>
                  <span>Start My Journey</span>
                  <ArrowRight className='ml-3 h-6 w-6' />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}