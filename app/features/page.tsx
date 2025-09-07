import { Search, MessageCircle, Calendar, Shield, Zap, Award, Users, BookOpen, Brain, Heart, Target, Clock } from 'lucide-react'

const mainFeatures = [
  {
    icon: Search,
    title: 'Academic Soulmate Finder',
    description: 'Our AI doesn\'t just match subjects—it matches minds, schedules, and study rhythms.',
    details: [
      'Advanced algorithm considers learning style, study preferences, and personality',
      'Schedule compatibility ensures you can actually meet when needed',
      'Subject expertise matching pairs complementary knowledge levels',
      'Location-based matching for in-person study sessions'
    ]
  },
  {
    icon: MessageCircle,
    title: 'Never Study Alone Again',
    description: 'Your study squad is always one message away, ready to help breakthrough moments or tackle tough problems.',
    details: [
      'Real-time messaging with study partners and groups',
      'Share files, images, and study materials instantly',
      'Voice and video calling for complex explanations',
      'Study session chat rooms with whiteboards and screen sharing'
    ]
  },
  {
    icon: Calendar,
    title: 'Time Magic',
    description: 'Transform chaotic calendars into coordinated success with smart scheduling.',
    details: [
      'Automated scheduling based on everyone\'s availability',
      'Recurring study session templates',
      'Integration with Google Calendar, Outlook, and Apple Calendar',
      'Smart reminders and preparation notifications'
    ]
  },
  {
    icon: Shield,
    title: 'Your Academic Safe Haven',
    description: 'Every profile verified, every conversation protected, every interaction builds trust.',
    details: [
      'Student verification through university email addresses',
      'Secure, encrypted messaging and file sharing',
      'Report and block features for inappropriate behavior',
      'Privacy controls for sharing personal information'
    ]
  },
  {
    icon: Zap,
    title: 'Your Growth Story Unfolding',
    description: 'Watch your transformation happen in real-time with comprehensive progress tracking.',
    details: [
      'Track study hours, session quality, and learning outcomes',
      'Visual progress charts and achievement milestones',
      'Subject mastery levels and skill development metrics',
      'Personal and group productivity analytics'
    ]
  },
  {
    icon: Award,
    title: 'Build Your Academic Reputation',
    description: 'Great study partners become great references, building networks that open doors.',
    details: [
      'Peer review system for study sessions and partnerships',
      'Achievement badges for consistent participation',
      'Study partner recommendations and testimonials',
      'Portfolio of collaborative projects and success stories'
    ]
  }
]

const additionalFeatures = [
  {
    icon: Brain,
    title: 'AI Study Assistant',
    description: 'Get personalized study plans and intelligent recommendations'
  },
  {
    icon: Heart,
    title: 'Wellness Tracking',
    description: 'Monitor study-life balance and stress levels'
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set and track academic milestones with your study partners'
  },
  {
    icon: Clock,
    title: 'Focus Timer',
    description: 'Pomodoro sessions synchronized with your study group'
  },
  {
    icon: Users,
    title: 'Study Groups',
    description: 'Create and manage study groups of 3-8 members'
  },
  {
    icon: BookOpen,
    title: 'Resource Library',
    description: 'Shared study materials and collaborative note-taking'
  }
]

export default function FeaturesPage() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-50 to-secondary-50'>
        <div className='max-w-4xl mx-auto text-center'>
          <h1 className='text-4xl sm:text-5xl font-bold font-heading text-neutral-900 mb-6'>
            Features We're Building
            <span className='text-gradient block'>For Students Like You</span>
          </h1>
          <p className='text-xl text-neutral-600 max-w-3xl mx-auto'>
            We're constantly adding new features based on user feedback. 
            Here's what we have now and what's coming next.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid gap-16'>
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className={`grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className='flex items-center mb-4'>
                      <div className='bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mr-4'>
                        <Icon className='h-6 w-6 text-primary-600' />
                      </div>
                      <h3 className='text-2xl font-bold font-heading text-neutral-900'>{feature.title}</h3>
                    </div>
                    <p className='text-lg text-neutral-600 mb-6'>{feature.description}</p>
                    <ul className='space-y-3'>
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className='flex items-start'>
                          <div className='bg-accent-100 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0'></div>
                          <span className='text-neutral-700'>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`bg-neutral-100 rounded-lg h-64 flex items-center justify-center ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                    <Icon className='h-24 w-24 text-neutral-300' />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold font-heading text-neutral-900 mb-4'>
              More Features Coming Soon
            </h2>
            <p className='text-xl text-neutral-600'>
              We're working on these features based on user requests
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className='card text-center p-6'>
                  <div className='bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                    <Icon className='h-8 w-8 text-primary-600' />
                  </div>
                  <h3 className='font-semibold text-xl mb-3 font-heading'>{feature.title}</h3>
                  <p className='text-neutral-600'>{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-learning-DEFAULT'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold font-heading text-white mb-4'>
            Ready to Be an Early Adopter?
          </h2>
          <p className='text-xl text-primary-100 mb-8'>
            Join our growing community and help shape the future of collaborative learning
          </p>
          <a 
            href='/signin' 
            className='bg-white text-primary-600 hover:bg-neutral-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md inline-flex items-center justify-center'
          >
            Join Our Beta
          </a>
        </div>
      </section>
    </div>
  )
}