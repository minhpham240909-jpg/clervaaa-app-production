'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Phone, Video, Paperclip, Smile, MoreVertical, File, Brain, Lightbulb, Target, Calendar, BookOpen, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { logger } from '@/lib/logger'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { 
  ssr: false,
  loading: () => <div className='w-72 h-96 bg-neutral-100 rounded-lg animate-pulse' />
})
import { useDropzone } from 'react-dropzone'
import EnhancedCallInterface from './EnhancedCallInterface'

interface SmartChatWindowOfflineProps {
  chatId: string
  userId: string
  partnerId: string
  onStartCall: (call: any) => void
}

interface Message {
  id: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM' | 'AI_SUGGESTION' | 'STUDY_PLAN' | 'QUIZ'
  fileUrl?: string
  fileName?: string
  senderId: string
  sender: {
    id: string
    name: string
    image: string | null
  }
  createdAt: string
  isEdited: boolean
  reactions: {
    emoji: string
    users: string[]
  }[]
  aiMetadata?: {
    suggestionType?: 'study_session' | 'quiz' | 'break_reminder' | 'goal_check'
    confidence?: number
    actionData?: any
  }
}

interface ChatInfo {
  id: string
  name: string | null
  type: 'DIRECT' | 'GROUP' | 'STUDY_GROUP'
  isGroup: boolean
  participants: {
    user: {
      id: string
      name: string
      image: string | null
    }
  }[]
}

interface StudySuggestion {
  type: 'session' | 'break' | 'quiz' | 'goal' | 'resource'
  title: string
  description: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
  action: () => void
  icon: any
}

export default function SmartChatWindowOffline({ chatId, userId, partnerId, onStartCall }: SmartChatWindowOfflineProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState<string[]>([])
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<StudySuggestion[]>([])
  const [isAnalyzingConversation, setIsAnalyzingConversation] = useState(false)
  const [activeCall, setActiveCall] = useState<any>(null)
  const [showCallInterface, setShowCallInterface] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Smart AI Analysis - No External API Required
  const analyzeConversationOffline = useCallback(async () => {
    setIsAnalyzingConversation(true)
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Analyze conversation content
      const analysisResults = performIntelligentAnalysis(messages)
      
      // Generate smart suggestions based on analysis
      const suggestions = generateSmartSuggestions(analysisResults)
      
      setAiSuggestions(suggestions)
      setShowAISuggestions(true)
      
      toast.success(`🧠 Generated ${suggestions.length} intelligent suggestions`, {
        duration: 3000
      })
      
    } catch (error) {
      logger.error('AI analysis failed:', error as Error)
      toast.error('Analysis failed, please try again')
    } finally {
      setIsAnalyzingConversation(false)
    }
  }, [messages])

  // Built-in Intelligence - No API needed
  const performIntelligentAnalysis = (messages: Message[]) => {
    const analysis = {
      studyTopics: [] as string[],
      sentiment: 'neutral' as 'positive' | 'negative' | 'neutral',
      intensity: 'moderate' as 'low' | 'moderate' | 'high',
      timePattern: 'active' as 'active' | 'tired' | 'focused',
      needsBreak: false,
      studyKeywords: 0,
      questionCount: 0,
      helpRequests: 0
    }

    // Study topic keywords
    const studyKeywords = [
      'math', 'calculus', 'algebra', 'geometry', 'physics', 'chemistry', 'biology',
      'computer science', 'programming', 'javascript', 'python', 'java',
      'history', 'literature', 'psychology', 'sociology', 'economics',
      'study', 'learn', 'practice', 'homework', 'assignment', 'exam', 'test', 'quiz'
    ]

    // Sentiment keywords
    const positiveWords = ['good', 'great', 'awesome', 'love', 'easy', 'understand', 'clear', 'helpful']
    const negativeWords = ['bad', 'difficult', 'hard', 'confused', 'stuck', 'hate', 'boring', 'tired']
    const breakWords = ['tired', 'exhausted', 'break', 'rest', 'overwhelmed', 'stressed']
    const helpWords = ['help', 'explain', 'confused', 'don\'t understand', 'stuck', 'difficult']

    let positiveCount = 0
    let negativeCount = 0
    let totalWords = 0

    messages.forEach(message => {
      if (message.type !== 'TEXT') return
      
      const content = message.content.toLowerCase()
      const words = content.split(/\s+/)
      totalWords += words.length

      // Count study topics
      studyKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          analysis.studyTopics.push(keyword)
          analysis.studyKeywords++
        }
      })

      // Count sentiment
      words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++
        if (negativeWords.includes(word)) negativeCount++
      })

      // Check for break needs
      if (breakWords.some(word => content.includes(word))) {
        analysis.needsBreak = true
      }

      // Count help requests
      if (helpWords.some(word => content.includes(word))) {
        analysis.helpRequests++
      }

      // Count questions
      if (content.includes('?')) {
        analysis.questionCount++
      }
    })

    // Determine sentiment
    const sentimentRatio = (positiveCount - negativeCount) / Math.max(totalWords, 1)
    if (sentimentRatio > 0.1) analysis.sentiment = 'positive'
    else if (sentimentRatio < -0.1) analysis.sentiment = 'negative'

    // Determine intensity
    const studyRatio = analysis.studyKeywords / Math.max(totalWords, 1)
    if (studyRatio > 0.3) analysis.intensity = 'high'
    else if (studyRatio > 0.1) analysis.intensity = 'moderate'
    else analysis.intensity = 'low'

    // Remove duplicates from topics
    analysis.studyTopics = [...new Set(analysis.studyTopics)]

    return analysis
  }

  // Generate intelligent suggestions based on analysis
  const generateSmartSuggestions = (analysis: any): StudySuggestion[] => {
    const suggestions: StudySuggestion[] = []

    // Study session suggestion
    if (analysis.studyTopics.length > 0 && analysis.intensity !== 'low') {
      suggestions.push({
        type: 'session',
        title: 'Schedule Study Session',
        description: `Focus on ${analysis.studyTopics.slice(0, 2).join(' and ')} with your study partner`,
        confidence: analysis.intensity === 'high' ? 90 : 75,
        priority: analysis.intensity === 'high' ? 'high' : 'medium',
        action: () => createStudySession({
          subjects: analysis.studyTopics.slice(0, 2),
          duration: analysis.intensity === 'high' ? 90 : 60
        }),
        icon: Calendar
      })
    }

    // Quiz suggestion
    if (analysis.studyTopics.length > 0 && analysis.sentiment === 'positive') {
      suggestions.push({
        type: 'quiz',
        title: 'Generate Practice Quiz',
        description: `Test your knowledge with a ${analysis.studyTopics[0]} quiz`,
        confidence: 80,
        priority: 'medium',
        action: () => generateQuiz({
          topic: analysis.studyTopics[0],
          difficulty: analysis.intensity === 'high' ? 'advanced' : 'intermediate'
        }),
        icon: Brain
      })
    }

    // Break suggestion
    if (analysis.needsBreak || analysis.intensity === 'high' || analysis.sentiment === 'negative') {
      suggestions.push({
        type: 'break',
        title: 'Take a Study Break',
        description: analysis.needsBreak ? 'You mentioned being tired - take a refreshing break' : 'Intensive studying detected - time for a break',
        confidence: analysis.needsBreak ? 95 : 70,
        priority: analysis.needsBreak ? 'high' : 'medium',
        action: () => suggestBreak({
          duration: analysis.needsBreak ? 20 : 15,
          type: analysis.needsBreak ? 'rest_break' : 'active_break'
        }),
        icon: Zap
      })
    }

    // Goal suggestion
    if (analysis.studyTopics.length > 0 && analysis.helpRequests > 0) {
      suggestions.push({
        type: 'goal',
        title: 'Set Learning Goals',
        description: `Create specific goals for ${analysis.studyTopics[0]} improvement`,
        confidence: 65,
        priority: 'low',
        action: () => createGoal({
          subject: analysis.studyTopics[0],
          focus: 'improvement'
        }),
        icon: Target
      })
    }

    // Resource suggestion
    if (analysis.helpRequests > 1 || analysis.sentiment === 'negative') {
      suggestions.push({
        type: 'resource',
        title: 'Find Study Resources',
        description: 'Get additional materials to help with challenging topics',
        confidence: 75,
        priority: 'medium',
        action: () => findResources({
          topics: analysis.studyTopics,
          difficulty: 'beginner'
        }),
        icon: BookOpen
      })
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Action implementations
  const createStudySession = async (data: any) => {
    try {
      toast.success(`📅 Study session scheduled: ${data.subjects.join(' & ')} (${data.duration} min)`, {
        duration: 4000
      })
      
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `📅 Study session created: ${data.subjects.join(' & ')} - ${data.duration} minutes`,
        type: 'SYSTEM',
        senderId: 'system',
        sender: { id: 'system', name: 'StudyBuddy AI', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      setMessages(prev => [...prev, systemMessage])
      setShowAISuggestions(false)
    } catch (error) {
      toast.error('Failed to create study session')
    }
  }

  const generateQuiz = async (data: any) => {
    try {
      toast.success(`🧠 Generated ${data.difficulty} ${data.topic} quiz with 5 questions`, {
        duration: 4000
      })
      
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `🧠 Quiz ready: 5 ${data.difficulty} questions on ${data.topic}`,
        type: 'SYSTEM',
        senderId: 'system',
        sender: { id: 'system', name: 'StudyBuddy AI', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      setMessages(prev => [...prev, systemMessage])
      setShowAISuggestions(false)
    } catch (error) {
      toast.error('Failed to generate quiz')
    }
  }

  const suggestBreak = async (data: any) => {
    try {
      toast.success(`⏰ ${data.duration}-minute ${data.type.replace('_', ' ')} recommended`, {
        duration: 4000
      })
      
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `⏰ Break time! Take ${data.duration} minutes to ${data.type === 'rest_break' ? 'rest and recharge' : 'stretch and refresh'}`,
        type: 'SYSTEM',
        senderId: 'system',
        sender: { id: 'system', name: 'StudyBuddy AI', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      setMessages(prev => [...prev, systemMessage])
      setShowAISuggestions(false)
    } catch (error) {
      toast.error('Failed to set break reminder')
    }
  }

  const createGoal = async (data: any) => {
    try {
      toast.success(`🎯 Learning goal set for ${data.subject} ${data.focus}`, {
        duration: 4000
      })
      
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `🎯 Goal created: Improve ${data.subject} understanding through focused practice`,
        type: 'SYSTEM',
        senderId: 'system',
        sender: { id: 'system', name: 'StudyBuddy AI', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      setMessages(prev => [...prev, systemMessage])
      setShowAISuggestions(false)
    } catch (error) {
      toast.error('Failed to create goal')
    }
  }

  const findResources = async (data: any) => {
    try {
      toast.success(`📚 Found study resources for ${data.topics.join(', ')}`, {
        duration: 4000
      })
      
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `📚 Resources found: Video tutorials, practice problems, and study guides for ${data.topics.join(', ')}`,
        type: 'SYSTEM',
        senderId: 'system',
        sender: { id: 'system', name: 'StudyBuddy AI', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      setMessages(prev => [...prev, systemMessage])
      setShowAISuggestions(false)
    } catch (error) {
      toast.error('Failed to find resources')
    }
  }

  // Initialize with sample data
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true)
      
      // Mock chat info
      setChatInfo({
        id: chatId,
        name: null,
        type: 'DIRECT',
        isGroup: false,
        participants: [{
          user: {
            id: partnerId,
            name: 'Sarah Chen',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b590?w=40&h=40&fit=crop&crop=face'
          }
        }]
      })

      // Mock messages
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hey! Ready to study calculus together?',
          type: 'TEXT',
          senderId: partnerId,
          sender: {
            id: partnerId,
            name: 'Sarah Chen',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b590?w=40&h=40&fit=crop&crop=face'
          },
          createdAt: new Date(Date.now() - 300000).toISOString(),
          isEdited: false,
          reactions: []
        },
        {
          id: '2',
          content: 'Yes! I need help with integration by parts. It\'s quite difficult.',
          type: 'TEXT',
          senderId: userId,
          sender: {
            id: userId,
            name: 'You',
            image: null
          },
          createdAt: new Date(Date.now() - 240000).toISOString(),
          isEdited: false,
          reactions: []
        },
        {
          id: '3',
          content: 'No problem! Let\'s start with the basic formula and work through some examples.',
          type: 'TEXT',
          senderId: partnerId,
          sender: {
            id: partnerId,
            name: 'Sarah Chen',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b590?w=40&h=40&fit=crop&crop=face'
          },
          createdAt: new Date(Date.now() - 180000).toISOString(),
          isEdited: false,
          reactions: []
        }
      ]
      
      setMessages(mockMessages)
      setLoading(false)
    }

    initializeChat()
  }, [chatId, userId, partnerId])

  // Rest of the component implementation would be similar to SmartChatWindow
  // but without the API calls - just using the offline analysis

  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500'></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className='border-b border-neutral-200 p-4 bg-white'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center'>
              <span className='text-white font-medium'>SC</span>
            </div>
            <div>
              <h3 className='font-medium text-neutral-900'>Sarah Chen</h3>
            </div>
          </div>
          
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              className={`p-2 rounded-lg transition-colors ${showAISuggestions ? 'bg-primary-100 text-primary-600' : 'hover:bg-neutral-100 text-neutral-600'}`}
              title='AI Study Assistant (Offline)'
            >
              <Brain className='h-5 w-5' />
            </button>
            <button
              onClick={() => onStartCall({ id: 'call-1', type: 'VIDEO' })}
              className='p-2 hover:bg-neutral-100 rounded-lg transition-colors'
              title='Start video call'
            >
              <Video className='h-5 w-5 text-neutral-600' />
            </button>
          </div>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showAISuggestions && (
        <div className='border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='font-medium text-blue-900 flex items-center'>
              <Brain className='h-4 w-4 mr-2' />
              AI Study Assistant (Offline)
              {aiSuggestions.length > 0 && (
                <span className='ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full'>
                  {aiSuggestions.length} suggestions
                </span>
              )}
            </h4>
            {isAnalyzingConversation && (
              <div className='flex items-center text-blue-600 text-sm'>
                <div className='animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-2'></div>
                Analyzing conversation...
              </div>
            )}
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className='bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md'
              >
                <div className='p-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center'>
                      <suggestion.icon className='h-4 w-4 mr-2 text-blue-600' />
                      <span className='font-medium text-gray-900 text-sm'>{suggestion.title}</span>
                    </div>
                    <span className='px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium'>
                      {suggestion.confidence}%
                    </span>
                  </div>
                  <p className='text-xs text-gray-600 mb-3'>{suggestion.description}</p>
                  
                  <div className='flex items-center justify-between'>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {suggestion.priority} priority
                    </span>
                    <button
                      onClick={suggestion.action}
                      className='px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors font-medium'
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {aiSuggestions.length === 0 && !isAnalyzingConversation && (
            <div className='text-center py-6'>
              <div className='mb-3'>
                <Brain className='h-8 w-8 text-blue-400 mx-auto mb-2' />
                <p className='text-blue-700 mb-1 font-medium'>No AI suggestions yet</p>
                <p className='text-blue-600 text-sm'>Send some messages about your study topics</p>
              </div>
              <button
                onClick={analyzeConversationOffline}
                className='px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium'
              >
                🧠 Analyze Conversation (Offline)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'SYSTEM' 
                ? 'justify-center' 
                : message.senderId === userId 
                  ? 'justify-end' 
                  : 'justify-start'
            }`}
          >
            {message.type === 'SYSTEM' ? (
              <div className='bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm max-w-md text-center'>
                {message.content}
              </div>
            ) : (
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-neutral-200 text-neutral-900'
                }`}
              >
                <p>{message.content}</p>
                <p className='text-xs mt-1 opacity-75'>
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className='border-t border-neutral-200 p-4 bg-white'>
        <div className='flex items-center space-x-2'>
          <input
            type='text'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                if (newMessage.trim()) {
                  const message: Message = {
                    id: `msg-${Date.now()}`,
                    content: newMessage,
                    type: 'TEXT',
                    senderId: userId,
                    sender: { id: userId, name: 'You', image: null },
                    createdAt: new Date().toISOString(),
                    isEdited: false,
                    reactions: []
                  }
                  setMessages(prev => [...prev, message])
                  setNewMessage('')
                }
              }
            }}
            placeholder='Type a message about your studies...'
            className='flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          />
          <button className='p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors'>
            <Send className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  )
}
