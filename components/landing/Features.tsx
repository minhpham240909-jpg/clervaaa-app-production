import { Search, MessageCircle, Calendar, FileText, BarChart3, HelpCircle, Users, Heart, Sparkles, Star, TrendingUp, Zap } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'AI Summaries & Flashcards',
    description: 'Transform your study materials into comprehensive summaries and interactive flashcards with advanced AI. Upload your notes, textbooks, or lecture materials and get personalized study content that adapts to your learning style. Perfect for exam prep and knowledge retention.',
    gradient: 'from-blue-500 to-purple-600',
    bgGradient: 'from-blue-50 to-purple-50',
  },
  {
    icon: BarChart3,
    title: 'AI Progress Analysis',
    description: 'Get deep insights into your study patterns and academic performance with AI-powered analytics. Track your learning velocity, identify knowledge gaps, and receive personalized recommendations to optimize your study strategy. Watch your academic growth unfold with detailed progress visualization.',
    gradient: 'from-green-500 to-teal-600',
    bgGradient: 'from-green-50 to-teal-50',
  },
  {
    icon: HelpCircle,
    title: 'AI Quiz Generator',
    description: 'Generate personalized quizzes from your study material using advanced AI. Test your knowledge with adaptive questions that adjust to your learning level, focus on weak areas, and provide detailed explanations. Turn any content into an interactive learning experience.',
    gradient: 'from-orange-500 to-red-600',
    bgGradient: 'from-orange-50 to-red-50',
  },
  {
    icon: Users,
    title: 'AI Partner Matching',
    description: 'Find your perfect study partner through intelligent AI matching that analyzes learning styles, schedules, academic goals, and personality traits. Our advanced algorithm connects you with compatible study buddies who complement your strengths and help overcome your challenges.',
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50',
  },
  {
    icon: MessageCircle,
    title: 'Smart Communication Hub',
    description: 'Stay connected with your study network through intelligent messaging, video calls, and real-time collaboration tools. Share files, schedule sessions, and get instant help when you need it most. Your academic support system is always just a tap away.',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
  },
  {
    icon: Calendar,
    title: 'Intelligent Scheduling',
    description: 'Effortlessly coordinate study sessions with AI-powered scheduling that finds optimal time slots for everyone. Sync with your calendar, set preferences, and let our smart system handle the coordination. No more scheduling conflicts or missed opportunities.',
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50',
  },
]

export default function Features() {
  return (
    <section id='features' className='py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-50 via-white to-primary-50/20 relative overflow-hidden'>
      {/* Enhanced Background decoration */}
      <div className='absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-50/30 to-transparent'></div>
      <div className='absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-secondary-50/20 to-transparent'></div>
      <div className='absolute top-1/4 left-1/4 w-32 h-32 bg-purple-200/30 rounded-full filter blur-xl animate-float-slow'></div>
      <div className='absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-200/30 rounded-full filter blur-xl animate-float-medium'></div>
      
      <div className='max-w-7xl mx-auto relative'>
        <div className='text-center mb-20'>
          <div className='inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6'>
            <Zap className='w-4 h-4 mr-2' />
            <span>Supercharge Your Studies</span>
          </div>
          
          <h2 className='text-5xl sm:text-6xl lg:text-7xl font-bold font-heading text-neutral-900 mb-8 animate-fade-in-up'>
            Turn Study Struggles into
            <span className='text-gradient block relative animate-gradient-shift'>
              Academic Superpowers
              <Sparkles className='absolute -top-2 -right-8 w-8 h-8 text-yellow-400 animate-spin-slow' />
              <Star className='absolute -bottom-2 -left-4 w-6 h-6 text-purple-400 animate-pulse' />
            </span>
          </h2>
          <p className='text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200'>
            Every feature is carefully designed to solve real study challenges. These aren't just tools—they're your 
            <span className='font-bold text-primary-600 relative'> secret weapons for academic success
              <Zap className='inline w-5 h-5 ml-1 text-yellow-500 animate-bounce' />
            </span>.
          </p>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className={`relative group cursor-pointer transition-all duration-700 hover:-translate-y-4 animate-fade-in-up`} style={{animationDelay: `${index * 0.1}s`}}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className='relative bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-3xl transition-all duration-700 border border-neutral-100 group-hover:border-white overflow-hidden'>
                  {/* Shine effect */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
                  
                  <div className={`bg-gradient-to-br ${feature.gradient} rounded-3xl w-20 h-20 flex items-center justify-center mb-8 shadow-xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden`}>
                    <div className='absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                    <Icon className='h-10 w-10 text-white relative z-10 group-hover:animate-pulse' />
                  </div>
                  
                  <h3 className='font-bold text-2xl mb-6 font-heading text-neutral-900 group-hover:text-neutral-800 transition-colors duration-300'>
                    {feature.title}
                  </h3>
                  
                  <p className='text-neutral-600 leading-relaxed text-lg group-hover:text-neutral-700 transition-colors duration-300'>
                    {feature.description}
                  </p>
                  
                  {/* Enhanced hover indicators */}
                  <div className='absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-ping'></div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Enhanced CTA section */}
        <div className='text-center mt-24'>
          <div className='relative bg-gradient-to-r from-primary-500 via-purple-600 to-secondary-500 rounded-3xl p-12 text-white overflow-hidden shadow-3xl'>
            <div className='absolute inset-0 bg-black/10'></div>
            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
            
            {/* Animated background elements */}
            <div className='absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full filter blur-xl animate-float-slow'></div>
            <div className='absolute bottom-0 right-0 w-24 h-24 bg-yellow-300/20 rounded-full filter blur-xl animate-float-medium'></div>
            
            <div className='relative z-10'>
              <div className='inline-flex items-center px-6 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6 animate-pulse'>
                <TrendingUp className='w-4 h-4 mr-2' />
                <span>Transform Your Academic Journey</span>
              </div>
              
              <h3 className='text-3xl sm:text-4xl font-bold mb-6 font-heading'>Ready to Transform Your Study Experience?</h3>
              <p className='text-xl mb-8 opacity-95 max-w-3xl mx-auto leading-relaxed'>Join thousands of students who've already discovered the power of collaborative learning.</p>
              
              <div className='flex flex-col sm:flex-row gap-6 justify-center'>
                <a href='/signin' className='group relative bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold hover:bg-neutral-50 transition-all duration-300 inline-flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105 overflow-hidden'>
                  <div className='absolute inset-0 bg-gradient-to-r from-primary-50/50 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
                  <span className='relative z-10'>Start Free Today</span>
                  <Search className='ml-3 h-5 w-5 relative z-10 group-hover:animate-pulse' />
                </a>
                <a href='#testimonials' className='group border-2 border-white/30 text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/20 backdrop-blur-sm transition-all duration-300 inline-flex items-center justify-center transform hover:scale-105'>
                  <span className='group-hover:animate-pulse'>See Success Stories</span>
                  <Heart className='ml-3 h-5 w-5 group-hover:text-rose-300 transition-colors' />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}