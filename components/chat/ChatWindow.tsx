'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Phone, Video, Paperclip, Smile, MoreVertical, File } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { logger } from '@/lib/logger'
import dynamic from 'next/dynamic'

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { 
  ssr: false,
  loading: () => <div className='w-72 h-96 bg-neutral-100 rounded-lg animate-pulse' />
})
import { useDropzone } from 'react-dropzone'

interface ChatWindowProps {
  chatId: string
  userId: string
  onStartCall: (call: any) => void
}

interface Message {
  id: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM'
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

export default function ChatWindow({ chatId, userId, onStartCall }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchChatInfo = useCallback(async () => {
    // Mock data - replace with actual API call
    const mockChatInfo: ChatInfo = {
      id: chatId,
      name: chatId === '1' ? null : 'Computer Science Study Group',
      type: chatId === '1' ? 'DIRECT' : 'STUDY_GROUP',
      isGroup: chatId !== '1',
      participants: chatId === '1' ? [
        {
          user: {
            id: '2',
            name: 'Sarah Chen',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b590?w=40&h=40&fit=crop&crop=face'
          }
        }
      ] : [
        {
          user: {
            id: '3',
            name: 'Alex Johnson',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
          }
        },
        {
          user: {
            id: '4',
            name: 'Maria Garcia',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
          }
        }
      ]
    }
    
    setChatInfo(mockChatInfo)
  }, [chatId])

  const fetchMessages = useCallback(async () => {
    try {
      // Mock messages - replace with actual API call
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hey! Ready for our calculus study session?',
          type: 'TEXT',
          senderId: '2',
          sender: {
            id: '2',
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
          senderId: '2',
          sender: {
            id: '2',
            name: 'Sarah Chen',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b590?w=40&h=40&fit=crop&crop=face'
          },
          createdAt: new Date(Date.now() - 180000).toISOString(),
          isEdited: false,
          reactions: [
            { emoji: '👍', users: [userId] }
          ]
        }
      ]
      
      setMessages(mockMessages)
    } catch (error) {
      logger.error('Error fetching messages', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchChatInfo()
    fetchMessages()
    
    // Only setup real-time subscriptions if we have valid IDs and in browser
    if (!chatId || !userId || typeof window === 'undefined') return
    
    try {
      const channel = supabase
        .channel(`chat:${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        }, (payload: any) => {
          try {
            const newMessage = payload.new as Message
            if (newMessage.senderId !== userId) {
              setMessages(prev => [...prev, newMessage])
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
            console.warn('Chat channel error - continuing without real-time messages')
          }
        })

      return () => {
        try {
          supabase.removeChannel(channel)
        } catch (error) {
          console.warn('Error removing chat channel:', error)
        }
      }
    } catch (error) {
      console.warn('Failed to setup real-time chat:', error)
    }
  }, [chatId, fetchChatInfo, fetchMessages, userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      
      setMessages(prev => [...prev, optimisticMessage])
      setNewMessage('')
      
      // In real app, send to API/Supabase
      // await supabase.from('ChatMessage').insert(message)
      
    } catch (error) {
      logger.error('Error sending message', error instanceof Error ? error : new Error(String(error)));
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startCall = (type: 'AUDIO' | 'VIDEO') => {
    const call = {
      id: `call-${chatId}-${Date.now()}`,
      chatRoomId: chatId,
      type,
      participants: chatInfo?.participants || []
    }
    logger.info('Starting call from ChatWindow', { callId: call.id, type, participantCount: call.participants.length });
    onStartCall(call)
  }

  const onDrop = (acceptedFiles: File[]) => {
    // Handle file uploads
    logger.info('Files selected for upload', { fileCount: acceptedFiles.length })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true
  })

  const getChatDisplayName = () => {
    if (!chatInfo) return 'Loading...'
    if (chatInfo.isGroup) {
      return chatInfo.name || 'Study Group'
    }
    return chatInfo.participants[0]?.user.name || 'Unknown User'
  }

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map((msg: any) => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji)
        if (existingReaction) {
          if (existingReaction.users.includes(userId)) {
            // Remove reaction
            return {
              ...msg,
              reactions: msg.reactions.map((r: any) => 
                r.emoji === emoji 
                  ? { ...r, users: r.users.filter((id: any) => id !== userId) }
                  : r
              ).filter((r: any) => r.users.length > 0)
            }
          } else {
            // Add user to reaction
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
          // Add new reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, users: [userId] }]
          }
        }
      }
      return msg
    }))
  }

  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500'></div>
      </div>
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
            <button className='p-2 hover:bg-neutral-100 rounded-lg transition-colors'>
              <MoreVertical className='h-5 w-5 text-neutral-600' />
            </button>
          </div>
        </div>
      </div>

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
            className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === userId
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-neutral-200'
              }`}
            >
              {message.senderId !== userId && (
                <p className='text-xs text-neutral-500 mb-1'>{message.sender.name}</p>
              )}
              
              <p className='text-sm'>{message.content}</p>
              
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
              
              <p className='text-xs opacity-75 mt-1'>
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                {message.isEdited && ' (edited)'}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

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