import Image from 'next/image'
import { Heart, Users, Target, Award, BookOpen, Globe, TrendingUp, Brain, FileText, BarChart3, HelpCircle, MessageCircle, Calendar, Zap, Sparkles } from 'lucide-react'

// Team section removed for startup authenticity

const values = [
  {
    icon: Heart,
    title: 'Students First',
    description: 'Every decision is made with student success and wellbeing in mind. We\'re not just building software—we\'re supporting dreams, futures, and academic journeys.'
  },
  {
    icon: Users,
    title: 'Collaboration Over Competition',
    description: 'We believe learning is better together. Instead of fostering academic competition, we create environments where students lift each other up and succeed collectively.'
  },
  {
    icon: Target,
    title: 'Results That Matter',
    description: 'We measure success not just by grades, but by confidence gained, relationships built, and the lifelong learning skills students develop through collaboration.'
  },
  {
    icon: Award,
    title: 'Authenticity & Trust',
    description: 'Real students, real challenges, real solutions. We maintain a community of verified learners who are genuinely committed to academic excellence and mutual support.'
  }
]

const stats = [
  { number: '500+', label: 'Early Adopters', icon: Users },
  { number: '50+', label: 'Subjects Covered', icon: BookOpen },
  { number: '1,000+', label: 'Study Sessions', icon: Target },
  { number: 'Beta', label: 'Version 1.0', icon: TrendingUp }
]

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Intelligence',
    description: 'Our advanced AI system powers everything from partner matching to content generation, making your study experience smarter and more personalized.',
    highlights: ['Machine learning algorithms', 'Natural language processing', 'Personalized recommendations', 'Adaptive learning paths']
  },
  {
    icon: FileText,
    title: 'Smart Content Generation',
    description: 'Transform any study material into summaries, flashcards, and interactive content with our AI-powered tools.',
    highlights: ['Auto-generated summaries', 'Interactive flashcards', 'Content extraction', 'Study guides creation']
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Get deep insights into your learning patterns with AI-driven analytics that help optimize your study strategy.',
    highlights: ['Learning velocity tracking', 'Knowledge gap analysis', 'Performance predictions', 'Study pattern insights']
  },
  {
    icon: HelpCircle,
    title: 'Adaptive Quizzing',
    description: 'Generate personalized quizzes that adapt to your knowledge level and focus on areas that need improvement.',
    highlights: ['Adaptive difficulty', 'Detailed explanations', 'Progress tracking', 'Custom question types']
  },
  {
    icon: Users,
    title: 'Intelligent Matching',
    description: 'Find your perfect study partner through AI analysis of learning styles, schedules, and academic compatibility.',
    highlights: ['Personality matching', 'Schedule coordination', 'Subject expertise pairing', 'Learning style compatibility']
  },
  {
    icon: MessageCircle,
    title: 'Seamless Communication',
    description: 'Stay connected with integrated messaging, video calls, file sharing, and real-time collaboration tools.',
    highlights: ['Real-time messaging', 'Video conferencing', 'File sharing', 'Screen sharing capabilities']
  }
]

const milestones = [
  {
    year: '2024',
    title: 'The Beginning',
    description: 'Started as a simple idea: what if students could easily find study partners who actually understand their learning style?'
  },
  {
    year: '2024',
    title: 'First Prototype',
    description: 'Built our first version with basic matching features. Early users loved the concept and provided valuable feedback.'
  },
  {
    year: '2024',
    title: 'Beta Launch',
    description: 'Launched our beta version with 500+ early adopters. We\'re learning and improving every day based on user feedback.'
  },
  {
    year: '2024',
    title: 'Growing Community',
    description: 'Our community is growing organically as students discover the power of collaborative learning. We\'re just getting started!'
  }
]

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto text-center'>
          <h1 className='text-4xl sm:text-5xl font-bold font-heading text-neutral-900 mb-6'>
            Building the Future of
            <span className='text-gradient block'>Collaborative Learning</span>
          </h1>
          <p className='text-xl text-neutral-600 max-w-3xl mx-auto'>
            We're a startup on a mission to connect students and make learning collaborative. 
            Join us as we build the platform that will transform how students study together.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-50 to-secondary-50'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-8'>
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className='text-center'>
                  <div className='bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm'>
                    <Icon className='h-8 w-8 text-primary-600' />
                  </div>
                  <div className='text-3xl font-bold text-neutral-900 mb-2'>{stat.number}</div>
                  <div className='text-neutral-600'>{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold font-heading text-neutral-900 mb-6'>Our Story</h2>
          </div>
          
          <div className='prose prose-lg mx-auto text-neutral-700'>
            <p>
              It started with a simple observation: students are struggling alone when they could be learning together. 
              We noticed that despite being surrounded by peers, many students feel isolated in their academic journey.
            </p>
            
            <p>
              The idea was born from our own experiences as students. We saw the potential for technology to 
              connect learners in meaningful ways, but existing solutions were either too complex or didn\'t 
              focus on the right things.
            </p>
            
            <p>
              We believe the best learning happens through collaboration. Not just any collaboration—the right 
              kind where students complement each other\'s strengths, share compatible schedules, and genuinely 
              want to succeed together.
            </p>
            
            <p>
              Today, we\'re building Clerva with 500+ early adopters who believe in our vision. 
              We\'re learning from their feedback and growing our community organically. This is just the beginning 
              of our journey to transform how students learn together.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-primary-50/30'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6'>
              <Sparkles className='w-4 h-4 mr-2' />
              <span>Powered by Advanced AI</span>
            </div>
            <h2 className='text-3xl font-bold font-heading text-neutral-900 mb-6'>What Makes Clerva Special</h2>
            <p className='text-xl text-neutral-600 max-w-3xl mx-auto'>
              We've built cutting-edge AI features that transform how you study, collaborate, and succeed academically. Here's what you get access to:
            </p>
          </div>
          
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className='bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-neutral-100'>
                  <div className='flex items-center mb-6'>
                    <div className='bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl w-14 h-14 flex items-center justify-center mr-4'>
                      <Icon className='h-7 w-7 text-white' />
                    </div>
                    <h3 className='text-xl font-bold font-heading text-neutral-900'>{feature.title}</h3>
                  </div>
                  <p className='text-neutral-600 mb-6 leading-relaxed'>{feature.description}</p>
                  <div className='space-y-2'>
                    {feature.highlights.map((highlight, highlightIndex) => (
                      <div key={highlightIndex} className='flex items-center text-sm text-neutral-700'>
                        <div className='w-1.5 h-1.5 bg-primary-500 rounded-full mr-3'></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* How It Works */}
          <div className='mt-20'>
            <div className='text-center mb-12'>
              <h3 className='text-2xl font-bold font-heading text-neutral-900 mb-4'>How It All Works Together</h3>
              <p className='text-lg text-neutral-600 max-w-2xl mx-auto'>
                Our platform creates a seamless ecosystem where every feature enhances your learning experience
              </p>
            </div>
            
            <div className='bg-gradient-to-r from-primary-500 via-purple-600 to-primary-700 rounded-2xl p-8 text-white relative overflow-hidden'>
              <div className='absolute inset-0 bg-black/10'></div>
              <div className='relative z-10'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
                  <div className='space-y-4'>
                    <div className='bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto'>
                      <Brain className='h-8 w-8' />
                    </div>
                    <h4 className='font-bold text-lg'>AI Analyzes</h4>
                    <p className='text-primary-100 text-sm'>Your learning style, schedule, and goals</p>
                  </div>
                  <div className='space-y-4'>
                    <div className='bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto'>
                      <Users className='h-8 w-8' />
                    </div>
                    <h4 className='font-bold text-lg'>Perfect Matches</h4>
                    <p className='text-primary-100 text-sm'>Connect with compatible study partners</p>
                  </div>
                  <div className='space-y-4'>
                    <div className='bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto'>
                      <Zap className='h-8 w-8' />
                    </div>
                    <h4 className='font-bold text-lg'>Accelerated Learning</h4>
                    <p className='text-primary-100 text-sm'>Achieve better results faster together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold font-heading text-neutral-900 mb-4'>Our Values</h2>
            <p className='text-xl text-neutral-600 max-w-3xl mx-auto'>
              These principles guide everything we do, from product decisions to community policies
            </p>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className='card p-8'>
                  <div className='flex items-center mb-6'>
                    <div className='bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mr-4'>
                      <Icon className='h-6 w-6 text-primary-600' />
                    </div>
                    <h3 className='text-xl font-bold font-heading text-neutral-900'>{value.title}</h3>
                  </div>
                  <p className='text-neutral-600'>{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold font-heading text-neutral-900 mb-4'>Our Journey</h2>
            <p className='text-xl text-neutral-600'>
              From dorm room idea to global community of learners
            </p>
          </div>
          
          <div className='relative'>
            <div className='absolute left-8 top-0 bottom-0 w-px bg-primary-200'></div>
            
            <div className='space-y-12'>
              {milestones.map((milestone, index) => (
                <div key={index} className='relative flex items-start'>
                  <div className='bg-primary-500 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-sm mr-8 relative z-10'>
                    {milestone.year}
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-neutral-900 mb-2'>{milestone.title}</h3>
                    <p className='text-neutral-600'>{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Removed for startup authenticity */}

      {/* Mission CTA */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-learning-DEFAULT'>
        <div className='max-w-4xl mx-auto text-center'>
          <Globe className='h-16 w-16 text-white mx-auto mb-6' />
          <h2 className='text-3xl font-bold font-heading text-white mb-4'>
            Join Our Growing Community
          </h2>
          <p className='text-xl text-primary-100 mb-8 max-w-2xl mx-auto'>
            Be part of our journey as we build the future of collaborative learning. 
            Your feedback and participation will help shape what we become.
          </p>
          <a 
            href='/signin' 
            className='bg-white text-primary-600 hover:bg-neutral-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md inline-flex items-center justify-center'
          >
            Start Your Journey Today
          </a>
        </div>
      </section>
    </div>
  )
}