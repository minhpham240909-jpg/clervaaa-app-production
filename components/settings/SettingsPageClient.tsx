'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  User, 
  Shield, 
  Bell, 
  BookOpen, 
  Palette, 
  Globe,
  Send,
  Lightbulb,
  MessageSquare,
  Star,
  Bug,
  Plus,
  Heart,
  Coffee,
  HelpCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import AccountSettings from './AccountSettings'
import PrivacySettings from './PrivacySettings'
import NotificationSettings from './NotificationSettings'
import StudyPreferences from './StudyPreferences'
import AppearanceSettings from './AppearanceSettings'

type SettingsTab = 'account' | 'privacy' | 'notifications' | 'study' | 'appearance' | 'feedback'

const settingsNavigation = [
  { 
    id: 'account' as const, 
    name: 'Account', 
    icon: User,
    description: 'Manage your profile and basic information'
  },
  { 
    id: 'privacy' as const, 
    name: 'Privacy & Security', 
    icon: Shield,
    description: 'Control who can see your information and activity'
  },
  { 
    id: 'notifications' as const, 
    name: 'Notifications', 
    icon: Bell,
    description: 'Customize how and when you receive notifications'
  },
  { 
    id: 'study' as const, 
    name: 'Study Preferences', 
    icon: BookOpen,
    description: 'Set your learning preferences and study habits'
  },
  { 
    id: 'appearance' as const, 
    name: 'Appearance', 
    icon: Palette,
    description: 'Customize the look and feel of your interface'
  },
  { 
    id: 'feedback' as const, 
    name: 'Support & Feedback', 
    icon: HelpCircle,
    description: 'Share your ideas and help us improve Clerva'
  }
]

export default function SettingsPageClient() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')

  if (status === 'loading') {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500'></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>🔒</div>
          <h2 className='text-2xl font-semibold text-neutral-900 mb-2'>
            Sign in Required
          </h2>
          <p className='text-neutral-600 mb-4'>
            Please sign in to access your settings and preferences
          </p>
          <a
            href='/signin'
            className='btn-primary inline-flex items-center'
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  const renderSettingsContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />
      case 'privacy':
        return <PrivacySettings />
      case 'notifications':
        return <NotificationSettings />
      case 'study':
        return <StudyPreferences />
      case 'appearance':
        return <AppearanceSettings />
      case 'feedback':
        return <SupportAndFeedback />
      default:
        return <AccountSettings />
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold font-heading text-neutral-900'>
          Settings
        </h1>
        <p className='text-neutral-600 mt-1'>
          Manage your account settings and study preferences
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Settings Navigation */}
        <div className='lg:col-span-1'>
          <nav className='space-y-1'>
            {settingsNavigation.map((item: any) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'hover:bg-neutral-50 text-neutral-700 border border-transparent'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <Icon className='h-5 w-5' />
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium'>{item.name}</div>
                      <div className='text-xs text-neutral-500 mt-1 line-clamp-2'>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className='lg:col-span-3'>
          <div className='bg-white rounded-lg border border-neutral-200 shadow-sm'>
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

function SupportAndFeedback() {
  const [activeTab, setActiveTab] = useState<'feedback' | 'ideas' | 'bugs'>('feedback')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [featureIdea, setFeatureIdea] = useState('')
  const [bugReport, setBugReport] = useState('')
  const [selectedRating, setSelectedRating] = useState(0)

  const submitFeedback = async (type: 'feedback' | 'idea' | 'bug', content: string, rating?: number) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          content,
          rating,
          metadata: {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }
      
      toast.success('Thank you! Your feedback helps us improve Clerva 🚀')
      
      // Clear the form
      if (type === 'feedback') {
        setFeedback('')
        setSelectedRating(0)
      } else if (type === 'idea') {
        setFeatureIdea('')
      } else if (type === 'bug') {
        setBugReport('')
      }
    } catch (error) {
      console.error('Feedback submission error:', error)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const feedbackTabs = [
    { id: 'feedback' as const, name: 'General Feedback', icon: MessageSquare },
    { id: 'ideas' as const, name: 'Feature Ideas', icon: Lightbulb },
    { id: 'bugs' as const, name: 'Report Issues', icon: Bug }
  ]

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div>
        <h2 className='text-xl font-semibold text-neutral-900'>Support & Feedback</h2>
        <p className='text-neutral-600 mt-1'>Help us make Clerva better by sharing your thoughts and ideas</p>
      </div>

      {/* Feedback Tabs */}
      <div className='border-b border-neutral-200'>
        <nav className='-mb-px flex space-x-8'>
          {feedbackTabs.map((tab: any) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <Icon className='h-4 w-4' />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Feedback Form */}
      {activeTab === 'feedback' && (
        <div className='space-y-6'>
          <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6'>
            <h3 className='font-medium text-neutral-900 mb-2 flex items-center'>
              <Heart className='h-5 w-5 text-red-500 mr-2' />
              Share Your Experience
            </h3>
            <p className='text-neutral-600 text-sm'>
              Your honest feedback helps us understand what's working and what needs improvement. Every comment matters!
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-3'>
              How would you rate your overall experience with Clerva?
            </label>
            <div className='flex space-x-2'>
              {[1, 2, 3, 4, 5].map((rating: any) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedRating >= rating
                      ? 'text-yellow-500'
                      : 'text-neutral-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className={`h-6 w-6 ${selectedRating >= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            {selectedRating > 0 && (
              <p className='text-sm text-neutral-600 mt-2'>
                {selectedRating === 5 && '🌟 Amazing! Thank you for the love!'}
                {selectedRating === 4 && '😊 Great! We\'re glad you\'re enjoying Clerva!'}
                {selectedRating === 3 && '👍 Good! Help us make it even better!'}
                {selectedRating === 2 && '😐 We can do better. Tell us how!'}
                {selectedRating === 1 && '😔 We\'re sorry. Your feedback will help us improve!'}
              </p>
            )}
          </div>

          {/* Feedback Text */}
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Tell us more about your experience
            </label>
            <textarea
              value={feedback}
              onChange={(e: any) => setFeedback(e.target.value)}
              placeholder='What do you love about Clerva? What could we improve? Share any thoughts, suggestions, or experiences...'
              rows={5}
              className='input-field w-full'
            />
            <p className='text-xs text-neutral-500 mt-1'>
              {feedback.length}/500 characters
            </p>
          </div>

          <button
            onClick={() => submitFeedback('feedback', feedback, selectedRating)}
            disabled={!feedback.trim() || isSubmitting}
            className='btn-primary flex items-center space-x-2'
          >
            {isSubmitting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className='h-4 w-4' />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Feature Ideas */}
      {activeTab === 'ideas' && (
        <div className='space-y-6'>
          <div className='bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6'>
            <h3 className='font-medium text-neutral-900 mb-2 flex items-center'>
              <Lightbulb className='h-5 w-5 text-yellow-600 mr-2' />
              Your Ideas Shape Our Future
            </h3>
            <p className='text-neutral-600 text-sm'>
              Have an idea for a new feature or improvement? We'd love to hear it! The best ideas often come from our users.
            </p>
          </div>

          {/* Popular Requests */}
          <div>
            <h4 className='font-medium text-neutral-900 mb-3'>Popular Feature Requests</h4>
            <div className='space-y-2'>
              {[
                '🎯 Advanced AI matching with personality tests',
                '📱 Mobile app with offline study modes',
                '🏆 Gamification with study streaks and challenges',
                '📊 Detailed progress analytics and insights',
                '🎵 Study music integration and ambient sounds'
              ].map((request, index) => (
                <div key={index} className='flex items-center space-x-3 p-2 bg-neutral-50 rounded-lg'>
                  <div className='text-sm text-neutral-700'>{request}</div>
                </div>
              ))}
            </div>
          </div>

          {/* New Idea Form */}
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Share Your Feature Idea
            </label>
            <textarea
              value={featureIdea}
              onChange={(e: any) => setFeatureIdea(e.target.value)}
              placeholder='Describe your feature idea in detail... What problem would it solve? How would it work? Why would it be valuable to students?'
              rows={4}
              className='input-field w-full'
            />
          </div>

          <button
            onClick={() => submitFeedback('idea', featureIdea)}
            disabled={!featureIdea.trim() || isSubmitting}
            className='btn-primary flex items-center space-x-2'
          >
            <Plus className='h-4 w-4' />
            <span>Submit Idea</span>
          </button>
        </div>
      )}

      {/* Bug Reports */}
      {activeTab === 'bugs' && (
        <div className='space-y-6'>
          <div className='bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6'>
            <h3 className='font-medium text-neutral-900 mb-2 flex items-center'>
              <Bug className='h-5 w-5 text-red-600 mr-2' />
              Help Us Fix Issues
            </h3>
            <p className='text-neutral-600 text-sm'>
              Found something that's not working as expected? Report it here and help us make Clerva better for everyone.
            </p>
          </div>

          {/* Bug Report Form */}
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Describe the Issue
            </label>
            <textarea
              value={bugReport}
              onChange={(e: any) => setBugReport(e.target.value)}
              placeholder='Please describe: 
• What were you trying to do?
• What happened instead?
• What browser are you using?
• Any error messages you saw?

The more details you provide, the faster we can fix it!'
              rows={6}
              className='input-field w-full'
            />
          </div>

          <button
            onClick={() => submitFeedback('bug', bugReport)}
            disabled={!bugReport.trim() || isSubmitting}
            className='btn-primary flex items-center space-x-2'
          >
            <Bug className='h-4 w-4' />
            <span>Report Issue</span>
          </button>
        </div>
      )}

      {/* Community Support */}
      <div className='border-t border-neutral-200 pt-6 space-y-4'>
        <h3 className='font-medium text-neutral-900'>Join Our Community</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors'>
            <Globe className='h-6 w-6 text-primary-600 mb-2' />
            <h4 className='font-medium text-neutral-900'>Community Forum</h4>
            <p className='text-sm text-neutral-600 mt-1'>Connect with other students and share study tips</p>
          </div>
          <div className='p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors'>
            <Coffee className='h-6 w-6 text-orange-600 mb-2' />
            <h4 className='font-medium text-neutral-900'>Buy Us a Coffee</h4>
            <p className='text-sm text-neutral-600 mt-1'>Support our development with a small donation</p>
          </div>
        </div>
      </div>

      {/* Thank You Message */}
      <div className='bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6'>
        <h4 className='font-medium text-neutral-900 mb-2 flex items-center'>
          <Heart className='h-5 w-5 text-green-600 mr-2' />
          Thank You for Helping Us Improve!
        </h4>
        <p className='text-neutral-700 text-sm'>
          Every piece of feedback, big or small, helps us make Clerva better for students like you. 
          We read every submission and use your insights to guide our development roadmap.
        </p>
        <p className='text-neutral-600 text-xs mt-2'>
          💡 Pro tip: Follow us on social media to stay updated on new features and improvements!
        </p>
      </div>
    </div>
  )
}