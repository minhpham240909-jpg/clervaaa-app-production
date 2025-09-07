'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { useOnboardingData } from '@/lib/hooks/useOnboardingData'
import { BookOpen, Clock, Target, Users, Brain, Calendar, TrendingUp, Award } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PersonalizedContent {
  greeting: string
  recommendedActions: Array<{
    id: string
    title: string
    description: string
    icon: any
    priority: 'high' | 'medium' | 'low'
    action: () => void
  }>
  studyTips: string[]
  motivationalQuote: string
  focusAreas: string[]
}

const LEARNING_STYLE_TIPS = {
  visual: [
    "Use mind maps and diagrams to organize information",
    "Create colorful charts and graphs to visualize data",
    "Watch educational videos and use flashcards with images"
  ],
  auditory: [
    "Record yourself reading notes and listen back",
    "Join study groups and discuss topics aloud",
    "Use music or background sounds while studying"
  ],
  kinesthetic: [
    "Take breaks to move around every 25 minutes",
    "Use hands-on activities and experiments when possible",
    "Write notes by hand instead of typing"
  ],
  reading: [
    "Take detailed written notes and summaries",
    "Create written outlines and lists",
    "Read materials multiple times for better retention"
  ]
}

const TIME_BASED_GREETINGS = {
  morning: [
    "Good morning! Ready to start your learning journey?",
    "Rise and shine! Let's make today productive!",
    "Morning motivation: Every expert was once a beginner!"
  ],
  afternoon: [
    "Good afternoon! Time to power through your goals!",
    "Afternoon energy boost: You're doing great!",
    "Keep the momentum going this afternoon!"
  ],
  evening: [
    "Good evening! Perfect time for focused study!",
    "Evening reflection: What will you accomplish tonight?",
    "Wind down with some productive learning!"
  ],
  night: [
    "Night owl mode activated! Let's study smart!",
    "Late night learning session - you've got this!",
    "Burning the midnight oil? Make it count!"
  ]
}

const MOTIVATIONAL_QUOTES = [
  "The beautiful thing about learning is that no one can take it away from you.",
  "Education is the most powerful weapon which you can use to change the world.",
  "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Don't let what you cannot do interfere with what you can do."
]

export default function PersonalizedDashboard() {
  const { data: session } = useSession()
  const { settings, isLoading } = useSettings()
  const { onboardingData, loadOnboardingData } = useOnboardingData()
  const [personalizedContent, setPersonalizedContent] = useState<PersonalizedContent | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isLoading && settings) {
      generatePersonalizedContent()
    }
  }, [settings, isLoading, currentTime])

  const generatePersonalizedContent = () => {
    const { study } = settings
    const hour = currentTime.getHours()
    
    // Determine time of day
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
    if (hour >= 6 && hour < 12) timeOfDay = 'morning'
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon'
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening'
    else timeOfDay = 'night'

    // Generate personalized greeting
    const greetings = TIME_BASED_GREETINGS[timeOfDay]
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]

    // Generate recommended actions based on preferences
    const recommendedActions = []

    // Study session recommendation based on preferred time
    if (study.preferred_time === timeOfDay) {
      recommendedActions.push({
        id: 'study-session',
        title: 'Start Your Optimal Study Session',
        description: `Perfect time for a ${study.session_duration}-minute focused session`,
        icon: Clock,
        priority: 'high' as const,
        action: () => {
          toast.success('Study session started! Stay focused!')
          // TODO: Integrate with actual study session system
        }
      })
    }

    // Subject-based recommendations
    if (study.subjects.length > 0) {
      const randomSubject = study.subjects[Math.floor(Math.random() * study.subjects.length)]
      recommendedActions.push({
        id: 'subject-focus',
        title: `Focus on ${randomSubject.name}`,
        description: `Continue your ${randomSubject.level} level progress`,
        icon: BookOpen,
        priority: 'medium' as const,
        action: () => {
          toast.success(`Let's dive into ${randomSubject.name}!`)
          // TODO: Navigate to subject-specific content
        }
      })
    }

    // Goal-based recommendations
    if (study.selected_goals && study.selected_goals.length > 0) {
      const goalActions = {
        improve_grades: {
          title: 'Review Recent Performance',
          description: 'Check your progress and identify areas for improvement',
          icon: TrendingUp
        },
        exam_prep: {
          title: 'Practice Test Questions',
          description: 'Take a quick quiz to test your knowledge',
          icon: Target
        },
        skill_development: {
          title: 'Learn Something New',
          description: 'Explore a new concept or skill today',
          icon: Brain
        },
        collaborative_learning: {
          title: 'Find Study Partners',
          description: 'Connect with others studying similar topics',
          icon: Users
        },
        time_management: {
          title: 'Plan Your Study Schedule',
          description: 'Organize your upcoming study sessions',
          icon: Calendar
        },
        focus_improvement: {
          title: 'Focus Exercise',
          description: 'Try a concentration-building activity',
          icon: Target
        }
      }

      study.selected_goals.forEach(goalId => {
        const goalAction = goalActions[goalId as keyof typeof goalActions]
        if (goalAction) {
          recommendedActions.push({
            id: `goal-${goalId}`,
            title: goalAction.title,
            description: goalAction.description,
            icon: goalAction.icon,
            priority: 'medium' as const,
            action: () => {
              toast.success(`Working on your ${goalId.replace('_', ' ')} goal!`)
              // TODO: Implement goal-specific actions
            }
          })
        }
      })
    }

    // Study tips based on learning style
    const studyTips = LEARNING_STYLE_TIPS[study.learning_style] || LEARNING_STYLE_TIPS.visual

    // Random motivational quote
    const motivationalQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]

    // Focus areas based on subjects and goals
    const focusAreas = [
      ...study.subjects.slice(0, 3).map(s => s.name),
      ...(study.selected_goals?.slice(0, 2).map(g => g.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())) || [])
    ]

    setPersonalizedContent({
      greeting,
      recommendedActions: recommendedActions.slice(0, 4), // Limit to 4 actions
      studyTips,
      motivationalQuote,
      focusAreas
    })
  }

  if (isLoading || !personalizedContent) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Personalized Greeting */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">
          {personalizedContent.greeting}
        </h2>
        <p className="text-blue-100 mb-4">
          {session?.user?.name ? `Welcome back, ${session.user.name.split(' ')[0]}!` : 'Welcome back!'}
        </p>
        <blockquote className="text-blue-100 italic border-l-2 border-blue-300 pl-4">
          "{personalizedContent.motivationalQuote}"
        </blockquote>
      </div>

      {/* Recommended Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-600" />
          Recommended for You
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {personalizedContent.recommendedActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-lg ${
                  action.priority === 'high'
                    ? 'border-red-200 bg-red-50 hover:border-red-300'
                    : action.priority === 'medium'
                    ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <Icon className={`h-8 w-8 mb-3 ${
                  action.priority === 'high'
                    ? 'text-red-600'
                    : action.priority === 'medium'
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`} />
                <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Study Tips and Focus Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Tips */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-green-600" />
            Tips for {settings.study.learning_style} Learners
          </h3>
          <ul className="space-y-3">
            {personalizedContent.studyTips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{tip}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Focus Areas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-purple-600" />
            Your Focus Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {personalizedContent.focusAreas.map((area, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">
              <strong>Your Study Environment:</strong> {settings.study.study_environment.replace('_', ' ')}
            </p>
            <p className="text-sm text-purple-700 mt-1">
              <strong>Optimal Session Length:</strong> {settings.study.session_duration} minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
