'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  BookOpen, 
  Brain, 
  Calendar, 
  Target, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ChevronRight,
  SkipForward as Skip,
  GraduationCap,
  Users,
  Clock,
  Lightbulb,
  Eye,
  Ear,
  Hand,
  FileText,
  Music,
  Headphones,
  Coffee,
  MessageSquare,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingData {
  studyStyle: string
  subjects: string[]
  ageGroup: string
  gradeLevel: string
  studyGoals: string[]
  preferredTime: string
  sessionDuration: number
  studyEnvironment: string
}

const STUDY_STYLES = [
  {
    id: 'visual',
    name: 'Visual Learner',
    description: 'Learn best through diagrams, charts, and visual aids',
    icon: Eye,
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    id: 'auditory',
    name: 'Auditory Learner',
    description: 'Learn best through listening, discussion, and explanation',
    icon: Ear,
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  {
    id: 'kinesthetic',
    name: 'Kinesthetic Learner',
    description: 'Learn best through hands-on activities and movement',
    icon: Hand,
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    id: 'reading',
    name: 'Reading/Writing',
    description: 'Learn best through reading and writing activities',
    icon: FileText,
    color: 'bg-orange-50 border-orange-200 text-orange-700'
  }
]

const POPULAR_SUBJECTS = [
  'Mathematics', 'Science', 'English Literature', 'History', 'Physics', 'Chemistry',
  'Biology', 'Computer Science', 'Psychology', 'Economics', 'Philosophy', 'Art',
  'Music', 'Foreign Languages', 'Geography', 'Political Science', 'Engineering',
  'Medicine', 'Law', 'Business Studies', 'Statistics', 'Calculus', 'Algebra',
  'Geometry', 'Sociology', 'Anthropology', 'Environmental Science', 'Astronomy'
]

const AGE_GROUPS = [
  {
    id: 'elementary',
    name: 'Elementary School',
    description: 'Grades 1-5',
    grades: ['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    icon: '📚',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'middle',
    name: 'Middle School',
    description: 'Grades 6-8',
    grades: ['6th Grade', '7th Grade', '8th Grade'],
    icon: '🎒',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'high',
    name: 'High School',
    description: 'Grades 9-12',
    grades: ['Freshman (9th)', 'Sophomore (10th)', 'Junior (11th)', 'Senior (12th)'],
    icon: '🎓',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'college',
    name: 'College/University',
    description: 'Undergraduate & Graduate',
    grades: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate Student'],
    icon: '🏛️',
    color: 'bg-purple-50 border-purple-200'
  }
]

const STUDY_GOALS = [
  {
    id: 'improve_grades',
    name: 'Improve Grades',
    description: 'Focus on better academic performance',
    icon: Target,
    color: 'text-red-600'
  },
  {
    id: 'exam_prep',
    name: 'Exam Preparation',
    description: 'Prepare for upcoming tests and exams',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    id: 'skill_development',
    name: 'Skill Development',
    description: 'Learn new skills and abilities',
    icon: Lightbulb,
    color: 'text-yellow-600'
  },
  {
    id: 'collaborative_learning',
    name: 'Collaborative Learning',
    description: 'Study and learn with others',
    icon: Users,
    color: 'text-green-600'
  },
  {
    id: 'time_management',
    name: 'Time Management',
    description: 'Better organize study time and schedule',
    icon: Clock,
    color: 'text-purple-600'
  },
  {
    id: 'focus_improvement',
    name: 'Focus & Concentration',
    description: 'Improve attention and study focus',
    icon: Brain,
    color: 'text-indigo-600'
  }
]

export default function OnboardingFlow() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    studyStyle: '',
    subjects: [],
    ageGroup: '',
    gradeLevel: '',
    studyGoals: [],
    preferredTime: 'morning',
    sessionDuration: 60,
    studyEnvironment: 'quiet'
  })

  const steps = [
    'Study Style',
    'Subjects',
    'Age & Grade',
    'Study Goals',
    'Preferences'
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = async () => {
    try {
      setIsLoading(true)
      
      // Save that user skipped onboarding
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true,
          skipped: true,
          data: {}
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save onboarding status')
      }

      toast.success('You can complete your profile in Settings anytime!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async () => {
    try {
      setIsLoading(true)
      
      // Save onboarding data
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true,
          skipped: false,
          data
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save onboarding data')
      }

      toast.success('Welcome to StudyBuddy! Your profile has been set up.')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleArrayValue = (field: keyof OnboardingData, value: string) => {
    const currentArray = data[field] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateData(field, newArray)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return data.studyStyle !== ''
      case 1: return data.subjects.length > 0
      case 2: return data.ageGroup !== '' && data.gradeLevel !== ''
      case 3: return data.studyGoals.length > 0
      case 4: return true
      default: return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">
              Welcome to StudyBuddy!
            </h1>
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="text-blue-100 hover:text-white transition-colors text-sm flex items-center space-x-1"
            >
              <ChevronRight className="h-4 w-4" />
              <span>Skip for now</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 mb-2">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500 text-blue-100'
                }`}>
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 rounded ${
                    index < currentStep ? 'bg-white' : 'bg-blue-500'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <p className="text-blue-100 text-sm">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 0: Study Style */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      What's your learning style?
                    </h2>
                    <p className="text-gray-600">
                      Understanding how you learn best helps us personalize your experience
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STUDY_STYLES.map((style) => {
                      const Icon = style.icon
                      return (
                        <button
                          key={style.id}
                          onClick={() => updateData('studyStyle', style.id)}
                          className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                            data.studyStyle === style.id
                              ? `${style.color} border-current shadow-lg scale-105`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-8 w-8 mb-3" />
                          <h3 className="font-semibold text-lg mb-2">{style.name}</h3>
                          <p className="text-sm text-gray-600">{style.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 1: Subjects */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      What subjects are you studying?
                    </h2>
                    <p className="text-gray-600">
                      Select the subjects you're currently studying or want to learn
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {POPULAR_SUBJECTS.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => toggleArrayValue('subjects', subject)}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                          data.subjects.includes(subject)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    Selected {data.subjects.length} subject{data.subjects.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}

              {/* Step 2: Age & Grade */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <GraduationCap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      What's your education level?
                    </h2>
                    <p className="text-gray-600">
                      This helps us match you with appropriate study partners and content
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {AGE_GROUPS.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => {
                          updateData('ageGroup', group.id)
                          updateData('gradeLevel', '') // Reset grade when changing age group
                        }}
                        className={`p-6 border-2 rounded-xl text-left transition-all ${
                          data.ageGroup === group.id
                            ? `${group.color} border-current shadow-lg`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{group.icon}</div>
                        <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </button>
                    ))}
                  </div>

                  {data.ageGroup && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-center">
                        Select your specific grade level:
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {AGE_GROUPS.find(g => g.id === data.ageGroup)?.grades.map((grade) => (
                          <button
                            key={grade}
                            onClick={() => updateData('gradeLevel', grade)}
                            className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                              data.gradeLevel === grade
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            {grade}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Study Goals */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      What are your study goals?
                    </h2>
                    <p className="text-gray-600">
                      Tell us what you want to achieve so we can help you succeed
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STUDY_GOALS.map((goal) => {
                      const Icon = goal.icon
                      return (
                        <button
                          key={goal.id}
                          onClick={() => toggleArrayValue('studyGoals', goal.id)}
                          className={`p-6 border-2 rounded-xl text-left transition-all ${
                            data.studyGoals.includes(goal.id)
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`h-8 w-8 mb-3 ${goal.color}`} />
                          <h3 className="font-semibold text-lg mb-2">{goal.name}</h3>
                          <p className="text-sm text-gray-600">{goal.description}</p>
                        </button>
                      )
                    })}
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    Selected {data.studyGoals.length} goal{data.studyGoals.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}

              {/* Step 4: Preferences */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Study Preferences
                    </h2>
                    <p className="text-gray-600">
                      Let's customize your study experience
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Preferred Study Time */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Preferred Study Time</h3>
                      <div className="space-y-2">
                        {[
                          { value: 'morning', label: 'Morning (6AM - 12PM)', icon: '🌅' },
                          { value: 'afternoon', label: 'Afternoon (12PM - 6PM)', icon: '☀️' },
                          { value: 'evening', label: 'Evening (6PM - 10PM)', icon: '🌆' },
                          { value: 'night', label: 'Night (10PM - 2AM)', icon: '🌙' }
                        ].map((time) => (
                          <button
                            key={time.value}
                            onClick={() => updateData('preferredTime', time.value)}
                            className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                              data.preferredTime === time.value
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="mr-3">{time.icon}</span>
                            {time.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Session Duration */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4">
                        Preferred Session Duration: {data.sessionDuration} minutes
                      </h3>
                      <input
                        type="range"
                        min="30"
                        max="180"
                        step="30"
                        value={data.sessionDuration}
                        onChange={(e) => updateData('sessionDuration', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>30 min</span>
                        <span>3 hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Study Environment */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Study Environment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { value: 'quiet', label: 'Complete Silence', icon: '🔇' },
                        { value: 'background_music', label: 'Background Music', icon: '🎵' },
                        { value: 'ambient', label: 'Ambient Sounds', icon: '🌊' },
                        { value: 'collaborative', label: 'Collaborative Discussion', icon: '💬' }
                      ].map((env) => (
                        <button
                          key={env.value}
                          onClick={() => updateData('studyEnvironment', env.value)}
                          className={`p-3 border-2 rounded-lg text-left transition-all ${
                            data.studyEnvironment === env.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="mr-3">{env.icon}</span>
                          {env.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-8 py-6 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="text-sm text-gray-500">
            {currentStep + 1} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>{currentStep === steps.length - 1 ? 'Complete' : 'Next'}</span>
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
