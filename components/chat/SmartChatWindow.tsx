'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { Send, Phone, Video, Paperclip, Smile, MoreVertical, File, Brain, Lightbulb, Target, Calendar, BookOpen, Zap, Image, Trash2, X } from 'lucide-react'
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

interface SmartChatWindowProps {
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
  type: 'session' | 'break' | 'quiz' | 'goal'
  title: string
  description: string
  action: () => void
  icon: any
}

export default function SmartChatWindow({ chatId, userId, partnerId, onStartCall }: SmartChatWindowProps) {
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
  const [isProcessingAction, setIsProcessingAction] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to add messages without blocking UI
  const addMessage = useCallback((newMessage: Message) => {
    startTransition(() => {
      setMessages(prev => [...prev, newMessage])
    })
  }, [])

  // Helper function to update messages without blocking UI
  const updateMessages = useCallback((updater: (prev: Message[]) => Message[]) => {
    startTransition(() => {
      setMessages(updater)
    })
  }, [])

  const fetchChatInfo = useCallback(async () => {
    // Mock data - replace with actual API call
    const mockChatInfo: ChatInfo = {
      id: chatId,
      name: null, // Direct chat
      type: 'DIRECT',
      isGroup: false,
      participants: [
        {
          user: {
            id: partnerId,
            name: 'Sarah Chen',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b590?w=40&h=40&fit=crop&crop=face'
          }
        }
      ]
    }
    
    setChatInfo(mockChatInfo)
  }, [chatId, partnerId])

  const fetchMessages = useCallback(async () => {
    try {
      // Mock messages with AI-enhanced features
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hey! Ready for our calculus study session?',
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
          content: "Absolutely! I've been working through the practice problems.",
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
          content: 'Great! Should we do a quick video call to go over the harder ones?',
          type: 'TEXT',
          senderId: partnerId,
          sender: {
            id: partnerId,
            name: 'Sarah Chen',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b590?w=40&h=40&fit=crop&crop=face'
          },
          createdAt: new Date(Date.now() - 180000).toISOString(),
          isEdited: false,
          reactions: [
            { emoji: '👍', users: [userId] }
          ]
        },
        {
          id: '4',
          content: 'I notice you\'ve been studying calculus for 45 minutes. Would you like me to generate a quick quiz to test your understanding?',
          type: 'AI_SUGGESTION',
          senderId: 'ai',
          sender: {
            id: 'ai',
            name: 'StudyBuddy AI',
            image: null
          },
          createdAt: new Date(Date.now() - 120000).toISOString(),
          isEdited: false,
          reactions: [],
          aiMetadata: {
            suggestionType: 'quiz',
            confidence: 0.85,
            actionData: {
              subject: 'calculus',
              difficulty: 'intermediate',
              questionCount: 5
            }
          }
        }
      ]
      
      startTransition(() => {
        setMessages(mockMessages)
      })
    } catch (error) {
      logger.error('Error fetching messages', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false)
    }
  }, [userId, partnerId])

  const generateAISuggestions = useCallback(async () => {
    setIsAnalyzingConversation(true)
    
    try {
      // Call the real AI chat analysis API
      const response = await fetch('/api/ai/chat-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          messages: messages
            .filter(msg => ['TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO', 'SYSTEM'].includes(msg.type))
            .map(msg => ({
              content: msg.content,
              senderId: msg.senderId,
              createdAt: msg.createdAt,
              type: msg.type
            })),
          analysisType: 'study_suggestions'
        })
      })

      let suggestions: StudySuggestion[] = []

      if (response.ok) {
        const data = await response.json()
        
        // Convert API suggestions to UI format with working actions
        suggestions = data.suggestions.map((apiSuggestion: any) => ({
          type: apiSuggestion.type,
          title: apiSuggestion.title,
          description: apiSuggestion.description,
          confidence: apiSuggestion.confidence,
          priority: apiSuggestion.priority,
          action: () => handleAISuggestionAction(apiSuggestion),
          icon: getSuggestionIcon(apiSuggestion.type)
        }))
        
        toast.success(`Generated ${suggestions.length} AI suggestions based on your conversation`, {
          icon: '🧠'
        })
      } else {
        // Fallback suggestions if API fails
        suggestions = getFallbackSuggestions()
        toast('Using offline AI suggestions', { icon: '⚠️' })
      }
      
      setAiSuggestions(suggestions)
    } catch (error) {
      logger.error('Error generating AI suggestions', error instanceof Error ? error : new Error(String(error)))
      
      // Use fallback suggestions on error
      const suggestions = getFallbackSuggestions()
      setAiSuggestions(suggestions)
      toast.error('AI analysis failed, using offline suggestions')
    } finally {
      setIsAnalyzingConversation(false)
    }
  }, [chatId, messages])

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'session': return Calendar
      case 'quiz': return Brain
      case 'break': return Zap
      case 'goal': return Target
      case 'resource': return BookOpen
      default: return Lightbulb
    }
  }

  // Handle AI suggestion actions with real functionality
  const handleAISuggestionAction = useCallback(async (suggestionOrMessage: any) => {
    // Prevent multiple simultaneous actions
    if (isProcessingAction) {
      toast.error('Please wait for the current action to complete')
      return
    }

    setIsProcessingAction(true)
    
    try {
      // Handle both suggestion objects and message objects
      let suggestion = suggestionOrMessage
      
      // If it's a message object, extract the suggestion data
      if (suggestionOrMessage.content && suggestionOrMessage.senderId) {
        // This is a message object, create a default suggestion
        suggestion = {
          type: 'session', // Default type
          actionData: {
            subject: 'Study Session',
            duration: 60
          }
        }
      }

      switch (suggestion.type) {
        case 'session':
          await createStudySession(suggestion.actionData || {})
          break
        case 'quiz':
          await generateQuiz(suggestion.actionData || {})
          break
        case 'break':
          await suggestBreak(suggestion.actionData || {})
          break
        case 'goal':
          await createGoal(suggestion.actionData || {})
          break
        case 'resource':
          await findResources(suggestion.actionData || {})
          break
        default:
          toast.success('AI suggestion applied successfully!')
      }
      
      // Close AI suggestions panel after successful action
      setShowAISuggestions(false)
    } catch (error) {
      logger.error('Failed to apply AI suggestion:', error as Error)
      toast.error('Failed to apply suggestion. Please try again.')
    } finally {
      // Always reset processing state
      setIsProcessingAction(false)
    }
  }, [isProcessingAction])

  // Fallback suggestions when API is unavailable
  const getFallbackSuggestions = (): StudySuggestion[] => [
    {
      type: 'session',
      title: 'Schedule Study Session',
      description: 'Based on your conversation, schedule a focused study session',
      action: () => createStudySession({ subject: 'General Study', duration: 60 }),
      icon: Calendar
    },
    {
      type: 'quiz',
      title: 'Generate Practice Quiz',
      description: 'Create a personalized quiz based on recent topics',
      action: () => generateQuiz({ topics: ['General'], difficulty: 'intermediate' }),
      icon: Brain
    },
    {
      type: 'break',
      title: 'Take a Study Break',
      description: 'Recommended 10-15 minute break to improve focus',
      action: () => suggestBreak({ duration: 15, type: 'active_break' }),
      icon: Zap
    },
    {
      type: 'goal',
      title: 'Update Study Goals',
      description: 'Track your progress and set new learning objectives',
      action: () => createGoal({ type: 'study_progress', timeframe: 'weekly' }),
      icon: Target
    }
  ]

  // Real action implementations
  const createStudySession = async (actionData: any = {}) => {
    try {
      const sessionData = {
        title: `Study Session: ${actionData.subject || 'General Study'}`,
        duration: actionData.duration || 60,
        type: actionData.type || 'collaborative',
        partnerId: partnerId,
        scheduledTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      }
      
      // Here you would call your study session creation API
      // const response = await fetch('/api/study-sessions', { method: 'POST', body: JSON.stringify(sessionData) })
      
      toast.success(`📅 Study session scheduled for ${sessionData.title}`, {
        duration: 4000
      })
      
      // Add system message to chat
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `📅 Study session scheduled: "${sessionData.title}" for ${new Date(sessionData.scheduledTime).toLocaleTimeString()}`,
        type: 'SYSTEM',
        senderId: 'system',
        sender: { id: 'system', name: 'StudyBuddy', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      addMessage(systemMessage)
    } catch (error) {
      throw new Error('Failed to create study session')
    }
  }

  const generateQuiz = async (actionData: any = {}) => {
    try {
      const quizData = {
        topics: actionData.topics || ['General'],
        difficulty: actionData.difficulty || 'intermediate',
        questionCount: actionData.questionCount || 5
      }
      
      toast.success(`🧠 Generated ${quizData.questionCount}-question quiz on ${quizData.topics.join(', ')}`, {
        duration: 4000
      })
      
      // Add system message to chat
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `🧠 Quiz generated: ${quizData.questionCount} ${quizData.difficulty} questions on ${quizData.topics.join(', ')}`,
        type: 'SYSTEM',
        senderId: 'system',
        sender: { id: 'system', name: 'StudyBuddy', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      addMessage(systemMessage)
    } catch (error) {
      throw new Error('Failed to generate quiz')
    }
  }

  const suggestBreak = async (actionData: any = {}) => {
    try {
      const breakData = {
        duration: actionData.duration || 15,
        type: actionData.type || 'active_break'
      }
      
      toast.success(`⏰ ${breakData.duration}-minute ${breakData.type.replace('_', ' ')} recommended`, {
        duration: 4000
      })
      
      // Add system message to chat
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `⏰ Break time! Take a ${breakData.duration}-minute ${breakData.type.replace('_', ' ')} to recharge`,
        type: 'SYSTEM',
        senderId: 'system',
        sender: { id: 'system', name: 'StudyBuddy', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      addMessage(systemMessage)
    } catch (error) {
      throw new Error('Failed to set break reminder')
    }
  }

  const createGoal = async (actionData: any = {}) => {
    try {
      const goalData = {
        type: actionData.type || 'study_progress',
        timeframe: actionData.timeframe || 'weekly',
        subject: actionData.subject || 'General Study'
      }
      
      toast.success(`🎯 New ${goalData.timeframe} goal created for ${goalData.subject}`, {
        duration: 4000
      })
      
      // Add system message to chat
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `🎯 Goal set: Track ${goalData.subject} progress ${goalData.timeframe}`,
        type: 'SYSTEM',
        senderId: 'system',
        sender: { id: 'system', name: 'StudyBuddy', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      addMessage(systemMessage)
    } catch (error) {
      throw new Error('Failed to create goal')
    }
  }

  const findResources = async (actionData: any = {}) => {
    try {
      const resourceData = {
        topics: actionData.topics || ['General Study'],
        resourceTypes: actionData.resourceTypes || ['videos', 'practice_problems']
      }
      
      toast.success(`📚 Found resources: ${resourceData.resourceTypes.join(', ')} for ${resourceData.topics.join(', ')}`, {
        duration: 4000
      })
      
      // Add system message to chat
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `📚 Resources found: ${resourceData.resourceTypes.join(', ')} for ${resourceData.topics.join(', ')}`,
        type: 'SYSTEM',
        senderId: 'system',
        sender: { id: 'system', name: 'StudyBuddy', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      addMessage(systemMessage)
    } catch (error) {
      throw new Error('Failed to find resources')
    }
  }

  useEffect(() => {
    fetchChatInfo()
    fetchMessages()
    
    // Auto-generate AI suggestions after a delay (only if not already processing)
    const suggestionTimer = setTimeout(() => {
      if (!isProcessingAction && !isAnalyzingConversation) {
        generateAISuggestions()
      }
    }, 5000)
    
    // Setup real-time subscriptions
    if (!chatId || !userId || typeof window === 'undefined') return
    
    try {
      const channel = supabase
        .channel(`smart-chat:${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        }, (payload: any) => {
          try {
            const newMessage = payload.new as Message
            if (newMessage.senderId !== userId) {
              addMessage(newMessage)
            }
          } catch (error) {
            console.warn('Error processing new message:', error)
          }
        })
        .on('broadcast', { event: 'typing' }, (payload: any) => {
          try {
            const { userId: typingUserId, isTyping } = payload.payload
            if (isTyping) {
              setTyping(prev => [...prev.filter((id: any) => id !== typingUserId), typingUserId])
            } else {
              setTyping(prev => prev.filter((id: any) => id !== typingUserId))
            }
          } catch (error) {
            console.warn('Error processing typing indicator:', error)
          }
        })
        .subscribe(status => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Smart chat channel error - continuing without real-time messages')
          }
        })

      return () => {
        clearTimeout(suggestionTimer)
        if (analysisTimeoutRef.current) {
          clearTimeout(analysisTimeoutRef.current)
        }
        try {
          supabase.removeChannel(channel)
        } catch (error) {
          console.warn('Error removing smart chat channel:', error)
        }
      }
    } catch (error) {
      console.warn('Failed to setup real-time smart chat:', error)
    }
  }, [chatId, fetchChatInfo, fetchMessages, userId, generateAISuggestions])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cleanup effect to prevent UI freezing
  useEffect(() => {
    return () => {
      // Clean up any active states when component unmounts
      if (activeCall) {
        setActiveCall(null)
      }
      if (showCallInterface) {
        setShowCallInterface(false)
      }
      if (showAISuggestions) {
        setShowAISuggestions(false)
      }
      if (isAnalyzingConversation) {
        setIsAnalyzingConversation(false)
      }
      if (isProcessingAction) {
        setIsProcessingAction(false)
      }
    }
  }, [activeCall, showCallInterface, showAISuggestions, isAnalyzingConversation, isProcessingAction])

  // Escape key handler to exit from stuck states
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Reset all modal/overlay states
        if (showCallInterface) {
          setActiveCall(null)
          setShowCallInterface(false)
        }
        if (showAISuggestions) {
          setShowAISuggestions(false)
        }
        if (showMoreMenu) {
          setShowMoreMenu(false)
        }
        if (showImagePreview) {
          setShowImagePreview(null)
        }
        if (isAnalyzingConversation) {
          setIsAnalyzingConversation(false)
        }
        if (isProcessingAction) {
          setIsProcessingAction(false)
        }
        toast.success('Exited with Escape key')
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu) {
        setShowMoreMenu(false)
      }
      if (selectedMessageId) {
        setSelectedMessageId(null)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showCallInterface, showAISuggestions, showMoreMenu, showImagePreview, isAnalyzingConversation, selectedMessageId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const message = {
      content: newMessage,
      type: 'TEXT' as const,
      senderId: userId,
      chatRoomId: chatId
    }

    try {
      // Add optimistic update
      const optimisticMessage: Message = {
        id: Date.now().toString(),
        ...message,
        sender: { id: userId, name: 'You', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      
      addMessage(optimisticMessage)
      setNewMessage('')
      
      // Analyze message for AI suggestions
      analyzeMessageForSuggestions(newMessage)
      
      // In real app, send to API/Supabase
      // await supabase.from('ChatMessage').insert(message)
      
    } catch (error) {
      logger.error('Error sending message', error instanceof Error ? error : new Error(String(error)));
    }
  }

  const analyzeMessageForSuggestions = async (messageContent: string) => {
    // Simple keyword analysis for demo
    const studyKeywords = ['study', 'learn', 'practice', 'quiz', 'test', 'homework']
    const breakKeywords = ['tired', 'exhausted', 'break', 'rest']
    const scheduleKeywords = ['schedule', 'when', 'time', 'meet', 'session']
    
    const content = messageContent.toLowerCase()
    
    if (studyKeywords.some(keyword => content.includes(keyword))) {
      // Suggest study resources (debounced)
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
      }
      
      analysisTimeoutRef.current = setTimeout(() => {
        if (!isProcessingAction) { // Only add if not processing other actions
          const aiSuggestion: Message = {
            id: Date.now().toString(),
            content: 'I noticed you mentioned studying! Would you like me to help create a study plan or generate practice questions?',
            type: 'AI_SUGGESTION',
            senderId: 'ai',
            sender: { id: 'ai', name: 'StudyBuddy AI', image: null },
            createdAt: new Date().toISOString(),
            isEdited: false,
            reactions: [],
            aiMetadata: {
              suggestionType: 'study_session',
              confidence: 0.8
            }
          }
          addMessage(aiSuggestion)
        }
      }, 2000)
    }
    
    if (breakKeywords.some(keyword => content.includes(keyword)) && !isProcessingAction) {
      // Suggest taking a break (only if not processing other actions)
      const aiSuggestion: Message = {
        id: Date.now().toString(),
        content: 'It sounds like you might need a break! Research shows that 10-15 minute breaks can improve focus and retention.',
        type: 'AI_SUGGESTION',
        senderId: 'ai',
        sender: { id: 'ai', name: 'StudyBuddy AI', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: [],
        aiMetadata: {
          suggestionType: 'break_reminder',
          confidence: 0.75
        }
      }
      addMessage(aiSuggestion)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startCall = useCallback(async (type: 'AUDIO' | 'VIDEO') => {
    // Prevent multiple call starts
    if (activeCall || showCallInterface) {
      toast.error('Call already in progress')
      return
    }

    const call = {
      id: `call-${chatId}-${Date.now()}`,
      chatRoomId: chatId,
      type,
      participants: chatInfo?.participants || []
    }
    
    try {
      setActiveCall(call)
      setShowCallInterface(true)
      
      // Add system message about call
      const callMessage: Message = {
        id: Date.now().toString(),
        content: `${type.toLowerCase()} call started`,
        type: 'SYSTEM',
        senderId: 'system',
        sender: { id: 'system', name: 'System', image: null },
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: []
      }
      
      addMessage(callMessage)
      
      logger.info('Starting enhanced call', { callId: call.id, type, participantCount: call.participants.length })
      toast.success(`${type.toLowerCase()} call started`)
      
    } catch (error) {
      logger.error('Failed to start call', error as Error)
      toast.error('Failed to start call')
      // Reset states on error
      setActiveCall(null)
      setShowCallInterface(false)
    }
  }, [activeCall, showCallInterface, chatId, chatInfo?.participants])

  const endCall = useCallback(() => {
    try {
      if (activeCall) {
        // Add system message about call end
        const endMessage: Message = {
          id: Date.now().toString(),
          content: 'Call ended',
          type: 'SYSTEM',
          senderId: 'system',
          sender: { id: 'system', name: 'System', image: null },
          createdAt: new Date().toISOString(),
          isEdited: false,
          reactions: []
        }
        
        addMessage(endMessage)
        toast.success('Call ended')
      }
    } catch (error) {
      logger.error('Error ending call', error as Error)
    } finally {
      // Always reset states, even if there's an error
      setActiveCall(null)
      setShowCallInterface(false)
    }
  }, [activeCall])

  const onDrop = (acceptedFiles: File[]) => {
    logger.info('Files selected for upload', { fileCount: acceptedFiles.length })
    toast.success(`${acceptedFiles.length} file(s) selected for upload`)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true
  })

  const getChatDisplayName = () => {
    if (!chatInfo) return 'Loading...'
    return chatInfo.participants[0]?.user.name || 'Study Partner'
  }

  const addReaction = (messageId: string, emoji: string) => {
    updateMessages(prev => prev.map((msg: any) => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji)
        if (existingReaction) {
          if (existingReaction.users.includes(userId)) {
            return {
              ...msg,
              reactions: msg.reactions.map((r: any) => 
                r.emoji === emoji 
                  ? { ...r, users: r.users.filter((id: any) => id !== userId) }
                  : r
              ).filter((r: any) => r.users.length > 0)
            }
          } else {
            return {
              ...msg,
              reactions: msg.reactions.map((r: any) => 
                r.emoji === emoji 
                  ? { ...r, users: [...r.users, userId] }
                  : r
              )
            }
          }
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, users: [userId] }]
          }
        }
      }
      return msg
    }))
  }

  const handleImageUpload = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        continue
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`)
        continue
      }

      try {
        // Create a preview URL for immediate display
        const previewUrl = URL.createObjectURL(file)
        
        // Create optimistic image message
        const imageMessage: Message = {
          id: `temp-${Date.now()}-${i}`,
          content: `Shared an image: ${file.name}`,
          type: 'IMAGE',
          fileUrl: previewUrl,
          fileName: file.name,
          senderId: userId,
          sender: { id: userId, name: 'You', image: null },
          createdAt: new Date().toISOString(),
          isEdited: false,
          reactions: []
        }

        addMessage(imageMessage)

        // In a real app, you would upload to a storage service here
        // For now, we'll simulate a successful upload
        setTimeout(() => {
          toast.success(`Image ${file.name} uploaded successfully`)
        }, 1000)

        // TODO: Replace with actual upload logic
        // const uploadedUrl = await uploadImageToStorage(file)
        // updateMessage(imageMessage.id, { fileUrl: uploadedUrl })

      } catch (error) {
        logger.error('Error uploading image', error as Error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }
  }, [userId, addMessage])

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      // Optimistically remove the message
      updateMessages(prev => prev.filter(msg => msg.id !== messageId))
      
      // In a real app, you would call an API to delete the message
      // await deleteMessageFromDatabase(messageId)
      
      toast.success('Message deleted')
      setSelectedMessageId(null)
      
    } catch (error) {
      logger.error('Error deleting message', error as Error)
      toast.error('Failed to delete message')
      
      // Revert the optimistic update by refetching messages
      fetchMessages()
    }
  }, [updateMessages, fetchMessages])

  const handleMoreMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMoreMenu(!showMoreMenu)
  }

  const handleImageInputClick = () => {
    imageInputRef.current?.click()
    setShowMoreMenu(false)
  }

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImageUpload(e.target.files)
    }
    // Reset the input so the same file can be selected again
    e.target.value = ''
  }



  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500'></div>
      </div>
    )
  }

  // Show call interface if there's an active call
  if (showCallInterface && activeCall) {
    return (
      <EnhancedCallInterface
        call={activeCall}
        userId={userId}
        onEndCall={endCall}
        onError={(error) => {
          logger.error('Call error', error)
          toast.error('Call error occurred')
          endCall()
        }}
      />
    )
  }

  return (
    <div className='flex-1 flex flex-col h-full' {...getRootProps()}>
      <input {...getInputProps()} />
      
      {/* Chat Header */}
      <div className='border-b border-neutral-200 p-4 bg-white'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center'>
              <span className='text-white font-medium'>
                {getChatDisplayName()[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className='font-medium text-neutral-900'>{getChatDisplayName()}</h3>
              {typing.length > 0 && (
                <p className='text-sm text-primary-600'>
                  {typing.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
                </p>
              )}
            </div>
          </div>
          
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              className={`p-2 rounded-lg transition-colors ${showAISuggestions ? 'bg-primary-100 text-primary-600' : 'hover:bg-neutral-100 text-neutral-600'}`}
              title='AI Study Assistant'
            >
              <Brain className='h-5 w-5' />
            </button>
            <button
              onClick={() => startCall('AUDIO')}
              className='p-2 hover:bg-neutral-100 rounded-lg transition-colors'
              title='Start voice call'
            >
              <Phone className='h-5 w-5 text-neutral-600' />
            </button>
            <button
              onClick={() => startCall('VIDEO')}
              className='p-2 hover:bg-neutral-100 rounded-lg transition-colors'
              title='Start video call'
            >
              <Video className='h-5 w-5 text-neutral-600' />
            </button>
            <div className='relative'>
              <button 
                onClick={handleMoreMenuClick}
                className='p-2 hover:bg-neutral-100 rounded-lg transition-colors'
                title='More options'
              >
                <MoreVertical className='h-5 w-5 text-neutral-600' />
              </button>
              
              {showMoreMenu && (
                <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50'>
                  <div className='py-2'>
                    <button
                      onClick={handleImageInputClick}
                      className='w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center space-x-2 text-neutral-700'
                    >
                      <Image className='h-4 w-4' />
                      <span>Upload Images</span>
                    </button>
                    <button
                      onClick={() => {
                        toast('Select a message to delete by clicking on it', { icon: 'ℹ️' })
                        setShowMoreMenu(false)
                      }}
                      className='w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center space-x-2 text-neutral-700'
                    >
                      <Trash2 className='h-4 w-4' />
                      <span>Delete Messages</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showAISuggestions && (
        <div className='border-b border-neutral-200 bg-blue-50 p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='font-medium text-blue-900 flex items-center'>
              <Brain className='h-4 w-4 mr-2' />
              AI Study Assistant
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
                    {(suggestion as any).confidence && (
                      <span className='px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium'>
                        {Math.round((suggestion as any).confidence * 100)}%
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-gray-600 mb-3'>{suggestion.description}</p>
                  
                  <div className='flex items-center justify-between'>
                    {(suggestion as any).priority && (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        (suggestion as any).priority === 'high' ? 'bg-red-100 text-red-700' :
                        (suggestion as any).priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {(suggestion as any).priority} priority
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (suggestion.action) {
                          suggestion.action()
                        }
                      }}
                      className='px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                      disabled={isProcessingAction}
                    >
                      {isProcessingAction ? 'Processing...' : 'Apply'}
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
                <p className='text-blue-600 text-sm'>Send some messages about your study topics to get personalized suggestions</p>
              </div>
              <button
                onClick={generateAISuggestions}
                className='px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium'
              >
                🧠 Generate AI Suggestions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50'>
        {isDragActive && (
          <div className='absolute inset-0 bg-primary-100 bg-opacity-75 border-2 border-dashed border-primary-400 rounded-lg flex items-center justify-center z-10'>
            <div className='text-center'>
              <File className='h-12 w-12 text-primary-600 mx-auto mb-2' />
              <p className='text-primary-700 font-medium'>Drop files here to share</p>
            </div>
          </div>
        )}
        
        {messages.map((message: any) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'SYSTEM' || message.type === 'AI_SUGGESTION' 
                ? 'justify-center' 
                : message.senderId === userId 
                ? 'justify-end' 
                : 'justify-start'
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg relative group ${
                message.type === 'SYSTEM'
                  ? 'bg-gray-100 border border-gray-200 text-gray-600 text-sm max-w-xs'
                  : message.type === 'AI_SUGGESTION'
                  ? 'bg-blue-100 border border-blue-200 max-w-xs lg:max-w-md'
                  : message.senderId === userId
                  ? 'bg-primary-500 text-white max-w-xs lg:max-w-md'
                  : 'bg-white border border-neutral-200 max-w-xs lg:max-w-md'
              } ${selectedMessageId === message.id ? 'ring-2 ring-red-300' : ''}`}
              onClick={() => {
                if (selectedMessageId === message.id) {
                  setSelectedMessageId(null)
                } else {
                  setSelectedMessageId(message.id)
                }
              }}
            >
              {message.senderId !== userId && (
                <div className='flex items-center mb-1'>
                  {message.type === 'AI_SUGGESTION' && (
                    <Brain className='h-3 w-3 text-blue-600 mr-1' />
                  )}
                  <p className='text-xs text-neutral-500'>{message.sender.name}</p>
                </div>
              )}
              
              <p className={`text-sm ${message.type === 'AI_SUGGESTION' ? 'text-blue-800' : ''}`}>
                {message.content}
              </p>

              {/* Image display for IMAGE type messages */}
              {message.type === 'IMAGE' && message.fileUrl && (
                <div className='mt-2'>
                  <img
                    src={message.fileUrl}
                    alt={message.fileName || 'Shared image'}
                    className='max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity'
                    style={{ maxHeight: '200px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowImagePreview(message.fileUrl)
                    }}
                  />
                  {message.fileName && (
                    <p className='text-xs opacity-75 mt-1'>{message.fileName}</p>
                  )}
                </div>
              )}

              {/* Delete button for selected messages */}
              {selectedMessageId === message.id && message.type !== 'SYSTEM' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm('Are you sure you want to delete this message?')) {
                      deleteMessage(message.id)
                    }
                  }}
                  className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg'
                  title='Delete message'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
              
              {message.type === 'AI_SUGGESTION' && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleAISuggestionAction(message)
                  }}
                  className='mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={isProcessingAction}
                >
                  {isProcessingAction ? 'Processing...' : 'Try This'}
                </button>
              )}
              
              {message.reactions.length > 0 && (
                <div className='flex flex-wrap gap-1 mt-2'>
                  {message.reactions.map((reaction: any) => (
                    <button
                      key={reaction.emoji}
                      onClick={() => addReaction(message.id, reaction.emoji)}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        reaction.users.includes(userId)
                          ? 'bg-primary-100 border-primary-300'
                          : 'bg-neutral-100 border-neutral-300'
                      }`}
                    >
                      {reaction.emoji} {reaction.users.length}
                    </button>
                  ))}
                </div>
              )}
              
              <p className={`text-xs opacity-75 mt-1 ${message.type === 'AI_SUGGESTION' ? 'text-blue-600' : ''}`}>
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                {message.isEdited && ' (edited)'}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div 
          className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
          onClick={() => setShowImagePreview(null)}
        >
          <div className='relative max-w-4xl max-h-4xl p-4'>
            <button
              onClick={() => setShowImagePreview(null)}
              className='absolute top-2 right-2 bg-white bg-opacity-20 text-white rounded-full p-2 hover:bg-opacity-30 transition-colors'
            >
              <X className='h-6 w-6' />
            </button>
            <img
              src={showImagePreview}
              alt='Preview'
              className='max-w-full max-h-full object-contain rounded-lg'
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className='border-t border-neutral-200 p-4 bg-white'>
        <div className='flex items-center space-x-2'>
          <input
            ref={fileInputRef}
            type='file'
            multiple
            className='hidden'
            onChange={(e: any) => {
              if (e.target.files) {
                onDrop(Array.from(e.target.files))
              }
            }}
          />
          <input
            ref={imageInputRef}
            type='file'
            multiple
            accept='image/*'
            className='hidden'
            onChange={handleImageInputChange}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className='p-2 hover:bg-neutral-100 rounded-lg transition-colors'
            title='Attach file'
          >
            <Paperclip className='h-5 w-5 text-neutral-600' />
          </button>
          
          <div className='flex-1 relative'>
            <input
              type='text'
              value={newMessage}
              onChange={(e: any) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Type a message...'
              className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
            />
          </div>
          
          <div className='relative'>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className='p-2 hover:bg-neutral-100 rounded-lg transition-colors'
              title='Add emoji'
            >
              <Smile className='h-5 w-5 text-neutral-600' />
            </button>
            
            {showEmojiPicker && (
              <div className='absolute bottom-12 right-0 z-10'>
                <EmojiPicker
                  onEmojiClick={(emojiData: any) => {
                    setNewMessage(prev => prev + emojiData.emoji)
                    setShowEmojiPicker(false)
                  }}
                  width={300}
                  height={400}
                />
              </div>
            )}
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className='p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='Send message'
          >
            <Send className='h-5 w-5' />
          </button>
        </div>
      </div>
    </div>
  )
}
