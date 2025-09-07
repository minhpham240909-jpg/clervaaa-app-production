'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Brain, Users, Target, Zap, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface StudySession {
  id: string
  title: string
  subject: string
  partnerId?: string
  partnerName?: string
  startTime: Date
  duration: number // in minutes
  type: 'solo' | 'partner' | 'group'
  difficulty: 'easy' | 'medium' | 'hard'
  aiGenerated: boolean
  confidence: number
  description?: string
  goals: string[]
  resources: string[]
}

interface AIRecommendation {
  type: 'optimal_time' | 'study_break' | 'partner_session' | 'review_session'
  title: string
  description: string
  confidence: number
  action: () => void
  icon: any
}

interface SmartStudySchedulerProps {
  userId: string
  currentPartner?: {
    id: string
    name: string
    subjects: string[]
    availability: any[]
  }
}

export default function SmartStudyScheduler({ userId, currentPartner }: SmartStudySchedulerProps) {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    fetchSessions()
    generateAIRecommendations()
  }, [userId])

  const fetchSessions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSessions: StudySession[] = [
        {
          id: '1',
          title: 'Calculus Review Session',
          subject: 'Mathematics',
          partnerId: currentPartner?.id,
          partnerName: currentPartner?.name,
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          duration: 90,
          type: 'partner',
          difficulty: 'medium',
          aiGenerated: true,
          confidence: 0.92,
          description: 'Focus on integration techniques and word problems',
          goals: ['Master u-substitution', 'Solve 10 practice problems', 'Review exam material'],
          resources: ['Textbook Chapter 7', 'Online practice quiz', 'Study notes']
        },
        {
          id: '2',
          title: 'Physics Problem Set',
          subject: 'Physics',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          duration: 60,
          type: 'solo',
          difficulty: 'hard',
          aiGenerated: true,
          confidence: 0.78,
          description: 'Work through thermodynamics problems',
          goals: ['Complete problem set 8', 'Understand heat engines'],
          resources: ['Physics textbook', 'Online simulations']
        }
      ]
      setSessions(mockSessions)
    } catch (error) {
      toast.error('Failed to load study sessions')
    } finally {
      setLoading(false)
    }
  }

  const generateAIRecommendations = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const aiRecommendations: AIRecommendation[] = [
        {
          type: 'optimal_time',
          title: 'Peak Focus Time Detected',
          description: 'Your productivity is highest at 2 PM. Schedule challenging topics then.',
          confidence: 0.87,
          action: () => {
            setSelectedDate(new Date())
            setShowCreateModal(true)
            toast.success('Creating session at optimal time!')
          },
          icon: TrendingUp
        },
        {
          type: 'partner_session',
          title: 'Partner Study Recommended',
          description: `${currentPartner?.name || 'Your study partner'} is available for a calculus session.`,
          confidence: 0.91,
          action: () => {
            toast.success('Partner session scheduled!')
          },
          icon: Users
        },
        {
          type: 'study_break',
          title: 'Break Reminder',
          description: 'You\'ve been studying for 2 hours. Take a 15-minute break for better retention.',
          confidence: 0.95,
          action: () => {
            toast.success('Break timer started!')
          },
          icon: Zap
        },
        {
          type: 'review_session',
          title: 'Review Needed',
          description: 'It\'s been 3 days since your last physics review. Schedule a refresher.',
          confidence: 0.83,
          action: () => {
            toast.success('Review session added!')
          },
          icon: Target
        }
      ]
      
      setRecommendations(aiRecommendations)
    } catch (error) {
      toast.error('Failed to generate AI recommendations')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const createAISession = async (type: 'solo' | 'partner', subject: string) => {
    try {
      const aiSession: StudySession = {
        id: Date.now().toString(),
        title: `AI-Optimized ${subject} Session`,
        subject,
        partnerId: type === 'partner' ? currentPartner?.id : undefined,
        partnerName: type === 'partner' ? currentPartner?.name : undefined,
        startTime: selectedDate,
        duration: 75, // AI-optimized duration
        type,
        difficulty: 'medium',
        aiGenerated: true,
        confidence: 0.89,
        description: 'AI-generated study session optimized for your learning patterns',
        goals: [
          'Review key concepts',
          'Practice problem-solving',
          'Identify knowledge gaps'
        ],
        resources: ['Recommended textbook sections', 'AI-curated practice problems']
      }
      
      setSessions(prev => [...prev, aiSession])
      setShowCreateModal(false)
      toast.success('AI study session created!')
    } catch (error) {
      toast.error('Failed to create AI session')
    }
  }

  const getSessionStatusColor = (session: StudySession) => {
    const now = new Date()
    const sessionTime = new Date(session.startTime)
    
    if (sessionTime < now) {
      return 'bg-gray-100 border-gray-300 text-gray-600'
    } else if (sessionTime.getTime() - now.getTime() < 60 * 60 * 1000) { // Within 1 hour
      return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    } else {
      return 'bg-blue-100 border-blue-300 text-blue-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="h-6 w-6 mr-2 text-blue-600" />
            Smart Study Scheduler
          </h2>
          <p className="text-gray-600">AI-powered study session optimization</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Session
        </button>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
          {isAnalyzing && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Analyzing...
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
              onClick={rec.action}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <rec.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center text-xs text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {Math.round(rec.confidence * 100)}% confidence
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-lg border-2 ${getSessionStatusColor(session)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{session.title}</h4>
                    {session.aiGenerated && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Generated
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(session.difficulty)}`}>
                      {session.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {session.startTime.toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{session.duration}min</span>
                    {session.partnerName && (
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {session.partnerName}
                      </span>
                    )}
                  </div>
                  
                  {session.description && (
                    <p className="text-sm text-gray-600 mb-2">{session.description}</p>
                  )}
                  
                  {session.goals.length > 0 && (
                    <div className="mb-2">
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Goals:</h5>
                      <div className="flex flex-wrap gap-1">
                        {session.goals.slice(0, 3).map((goal, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {goal}
                          </span>
                        ))}
                        {session.goals.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                            +{session.goals.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  {session.aiGenerated && (
                    <div className="flex items-center text-xs text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {Math.round(session.confidence * 100)}% optimal
                    </div>
                  )}
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                    Join Session
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create AI Study Session</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Computer Science</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="type" value="solo" className="mr-2" />
                    Solo Study
                  </label>
                  {currentPartner && (
                    <label className="flex items-center">
                      <input type="radio" name="type" value="partner" className="mr-2" />
                      With {currentPartner.name}
                    </label>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                <input
                  type="datetime-local"
                  value={selectedDate.toISOString().slice(0, 16)}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createAISession('solo', 'Mathematics')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create AI Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
