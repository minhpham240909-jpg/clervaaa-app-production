import { Star, Quote, TrendingUp, Users, Heart, Sparkles, Award, CheckCircle, Zap } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Computer Science Student',
    university: 'Stanford University',
    content: 'Clerva transformed my 3 AM coding struggles into collaborative victories. Found three partners who each brought different strengths. Algorithms now feel like puzzles we solve together!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b590?w=64&h=64&fit=crop&crop=face',
    improvement: '+40% Grade Improvement',
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Marcus Johnson',
    role: 'Pre-Med Student',
    university: 'Harvard University', 
    content: 'Went from competing against everyone to collaborating with my dream team. My study partners became my support system—we lift each other up instead of burning out.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
    improvement: '95% on MCAT Practice',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Psychology Major',
    university: 'UCLA',
    content: 'Group work used to terrify me. Clerva found partners who understood my communication style. Studying became comfortable, natural, even fun. I gained friends AND grades!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
    improvement: 'From B- to A+ Average',
    color: 'from-green-500 to-emerald-500'
  },
]

const stats = [
  { icon: Users, label: '10K+ Active Students', value: '10,000+' },
  { icon: TrendingUp, label: 'Average Grade Increase', value: '+2.3 GPA' },
  { icon: Heart, label: 'Student Satisfaction', value: '98%' },
]

export default function Testimonials() {
  return (
    <section id='testimonials' className='py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-neutral-50 to-primary-50/30 relative overflow-hidden'>
      {/* Enhanced Background decoration */}
      <div className='absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary-50/30 to-transparent'></div>
      <div className='absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary-50/20 to-transparent'></div>
      
      {/* Floating elements */}
      <div className='absolute top-1/6 right-1/6 w-20 h-20 bg-gradient-to-r from-purple-200/40 to-pink-200/40 rounded-full filter blur-xl animate-float-slow'></div>
      <div className='absolute bottom-1/4 left-1/8 w-16 h-16 bg-gradient-to-l from-blue-200/40 to-cyan-200/40 rounded-full filter blur-xl animate-float-medium'></div>
      
      <div className='max-w-7xl mx-auto relative'>
        <div className='text-center mb-20'>
          <div className='inline-flex items-center px-4 py-2 rounded-full bg-secondary-100 text-secondary-700 text-sm font-medium mb-6'>
            <Heart className='w-4 h-4 mr-2' />
            <span>Loved by thousands of students</span>
          </div>
          
          <h2 className='text-5xl sm:text-6xl lg:text-7xl font-bold font-heading text-neutral-900 mb-8 animate-fade-in-up'>
            Real Students,
            <span className='text-gradient block relative animate-gradient-shift'>
              Real Success Stories
              <Award className='absolute -top-4 -right-8 w-8 h-8 text-yellow-500 animate-bounce' />
              <Sparkles className='absolute -bottom-2 -left-6 w-6 h-6 text-purple-400 animate-spin-slow' />
            </span>
          </h2>
          <p className='text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed'>
            From struggling alone to thriving together. These transformation stories show what happens when 
            <span className='font-semibold text-primary-600'> collaboration meets the right platform</span>.
          </p>
        </div>
        
        {/* Enhanced Stats bar */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-10 mb-20'>
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className={`text-center group animate-fade-in-up`} style={{animationDelay: `${index * 0.1}s`}}>
                <div className='relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-neutral-100 group-hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2 overflow-hidden'>
                  {/* Shine effect */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
                  
                  <div className='relative'>
                    <div className='bg-gradient-to-br from-primary-500 via-purple-500 to-primary-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500'>
                      <Icon className='w-8 h-8 text-white group-hover:animate-pulse' />
                    </div>
                    <div className='text-3xl font-bold text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors duration-300'>{stat.value}</div>
                    <div className='text-lg font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300'>{stat.label}</div>
                    
                    <div className='mt-4 h-1 w-12 bg-gradient-to-r from-primary-400 to-purple-600 rounded-full mx-auto group-hover:w-20 transition-all duration-500'></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={`relative group animate-fade-in-up`} style={{animationDelay: `${index * 0.1}s`}}>
              <div className='relative bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 border border-neutral-100 group-hover:-translate-y-4 overflow-hidden'>
                {/* Background glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
                
                {/* Shine effect */}
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
                
                {/* Quote icon */}
                <div className='absolute -top-6 left-8'>
                  <div className={`bg-gradient-to-br ${testimonial.color} w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Quote className='w-8 h-8 text-white' />
                  </div>
                </div>
                
                <div className='relative z-10'>
                  {/* Rating */}
                  <div className='flex items-center mb-8 pt-6'>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className='h-6 w-6 text-yellow-400 fill-current mr-1 group-hover:animate-pulse' style={{animationDelay: `${i * 0.1}s`}} />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <p className='text-neutral-700 mb-8 leading-relaxed text-xl font-medium group-hover:text-neutral-800 transition-colors duration-300'>
                    "{testimonial.content}"
                  </p>
                  
                  {/* Improvement badge */}
                  <div className={`inline-flex items-center px-4 py-2 rounded-2xl bg-gradient-to-r ${testimonial.color} text-white text-base font-bold mb-8 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <TrendingUp className='w-5 h-5 mr-2' />
                    {testimonial.improvement}
                  </div>
                  
                  {/* Author */}
                  <div className='flex items-center'>
                    <div className='relative'>
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        className='rounded-full border-4 border-white shadow-2xl group-hover:scale-110 transition-transform duration-300'
                      />
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r ${testimonial.color} rounded-full border-2 border-white flex items-center justify-center shadow-lg`}>
                        <CheckCircle className='w-4 h-4 text-white' />
                      </div>
                    </div>
                    <div className='ml-6'>
                      <h4 className='font-bold text-neutral-900 text-xl group-hover:text-primary-700 transition-colors duration-300'>{testimonial.name}</h4>
                      <p className='text-neutral-600 font-semibold text-lg'>{testimonial.role}</p>
                      <p className='text-neutral-500 font-medium'>{testimonial.university}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced Bottom CTA */}
        <div className='text-center mt-24'>
          <div className='relative bg-gradient-to-r from-neutral-900 via-primary-900 to-neutral-900 rounded-3xl p-12 text-white overflow-hidden shadow-3xl'>
            <div className='absolute inset-0 bg-gradient-to-r from-primary-600/30 to-secondary-600/30'></div>
            <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent'></div>
            
            {/* Animated background elements */}
            <div className='absolute top-0 left-0 w-40 h-40 bg-gradient-to-r from-white/10 to-primary-300/20 rounded-full filter blur-2xl animate-float-slow'></div>
            <div className='absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-l from-secondary-300/20 to-white/10 rounded-full filter blur-2xl animate-float-medium'></div>
            
            <div className='relative z-10'>
              <div className='inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-8 animate-pulse'>
                <Sparkles className='w-4 h-4 mr-2' />
                <span>Join the Success Revolution</span>
                <Zap className='w-4 h-4 ml-2' />
              </div>
              
              <h3 className='text-4xl font-bold mb-8 font-heading'>Ready to Write Your Own Success Story?</h3>
              <p className='text-2xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed'>Join thousands of students who transformed their academic journey with Clerva.</p>
              
              <a href='/signin' className='group relative inline-flex items-center px-12 py-5 bg-white text-neutral-900 rounded-2xl font-bold hover:bg-neutral-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-r from-primary-50/50 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
                <span className='relative z-10 text-xl'>Start Your Journey Today</span>
                <TrendingUp className='ml-3 h-6 w-6 relative z-10 group-hover:animate-bounce' />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}