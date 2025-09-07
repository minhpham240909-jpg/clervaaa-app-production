'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Users, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { logger } from '@/lib/logger'

interface ChatSidebarProps {
  userId: string
  selectedChatId: string | null
  onSelectChat: (chatId: string) => void
  onlineUsers: string[]
}

interface ChatRoom {
  id: string
  name: string | null
  type: 'DIRECT' | 'GROUP' | 'STUDY_GROUP'
  isGroup: boolean
  updatedAt: string
  participants: {
    user: {
      id: string
      name: string
      image: string | null
    }
  }[]
  messages: {
    content: string
    createdAt: string
    sender: {
      name: string
    }
  }[]
}

export default function ChatSidebar({ 
  userId, 
  selectedChatId, 
  onSelectChat, 
  onlineUsers 
}: ChatSidebarProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChatRooms()
    
    // Only setup real-time subscriptions if we have a valid user ID and in browser
    if (!userId || typeof window === 'undefined') return
    
    try {
      // Subscribe to new messages for real-time updates
      const channel = supabase
        .channel('chat-updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'ChatMessage' }, 
          () => {
            fetchChatRooms()
          }
        )
        .subscribe(status => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Chat updates channel error - continuing without real-time updates')
          }
        })

      return () => {
        try {
          supabase.removeChannel(channel)
        } catch (error) {
          console.warn('Error removing chat updates channel:', error)
        }
      }
    } catch (error) {
      console.warn('Failed to setup real-time chat updates:', error)
    }
  }, [userId])

  const fetchChatRooms = async () => {
    try {
      // This would be replaced with actual API call
      const mockChatRooms: ChatRoom[] = [
        {
          id: '1',
          name: null,
          type: 'DIRECT',
          isGroup: false,
          updatedAt: new Date().toISOString(),
          participants: [
            {
              user: {
                id: '2',
                name: 'Sarah Chen',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b590?w=40&h=40&fit=crop&crop=face'
              }
            }
          ],
          messages: [
            {
              content: 'Hey! Ready for our calculus study session?',
              createdAt: new Date(Date.now() - 300000).toISOString(),
              sender: { name: 'Sarah Chen' }
            }
          ]
        },
        {
          id: '2',
          name: 'Computer Science Study Group',
          type: 'STUDY_GROUP',
          isGroup: true,
          updatedAt: new Date(Date.now() - 600000).toISOString(),
          participants: [
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
          ],
          messages: [
            {
              content: 'Who wants to review algorithms tomorrow?',
              createdAt: new Date(Date.now() - 600000).toISOString(),
              sender: { name: 'Alex Johnson' }
            }
          ]
        }
      ]
      
      setChatRooms(mockChatRooms)
    } catch (error) {
      logger.error('Error fetching chat rooms', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false)
    }
  }

  const filteredChats = chatRooms.filter((chat: any) => {
    const chatName = chat.isGroup 
      ? chat.name 
      : chat.participants[0]?.user.name || 'Unknown'
    
    return (chatName || '').toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getChatDisplayName = (chat: ChatRoom) => {
    if (chat.isGroup) {
      return chat.name || 'Study Group'
    }
    return chat.participants[0]?.user.name || 'Unknown User'
  }

  const getChatDisplayImage = (chat: ChatRoom) => {
    if (chat.isGroup) {
      return null
    }
    return chat.participants[0]?.user.image
  }

  const getLastMessage = (chat: ChatRoom) => {
    const lastMessage = chat.messages[0]
    if (!lastMessage) return 'No messages yet'
    
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content
  }

  const isUserOnline = (chat: ChatRoom) => {
    if (chat.isGroup) return false
    const otherUserId = chat.participants[0]?.user.id
    return onlineUsers.includes(otherUserId)
  }

  if (loading) {
    return (
      <div className='w-80 bg-neutral-50 border-r border-neutral-200 p-4'>
        <div className='animate-pulse space-y-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='flex items-center space-x-3'>
              <div className='w-12 h-12 bg-neutral-200 rounded-full'></div>
              <div className='flex-1'>
                <div className='h-4 bg-neutral-200 rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-neutral-200 rounded w-1/2'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='w-80 bg-neutral-50 border-r border-neutral-200 flex flex-col'>
      <div className='p-4 border-b border-neutral-200'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-neutral-900'>Messages</h2>
          <button className='p-2 hover:bg-neutral-200 rounded-lg transition-colors'>
            <Plus className='h-5 w-5 text-neutral-600' />
          </button>
        </div>
        
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4' />
          <input
            type='text'
            placeholder='Search conversations...'
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm'
          />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {filteredChats.length === 0 ? (
          <div className='p-4 text-center text-neutral-500'>
            <MessageCircle className='h-12 w-12 mx-auto mb-2 text-neutral-300' />
            <p>No conversations yet</p>
            <p className='text-sm'>Start chatting with your study partners!</p>
          </div>
        ) : (
          <div className='space-y-1 p-2'>
            {filteredChats.map((chat: any) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedChatId === chat.id
                    ? 'bg-primary-100 border border-primary-200'
                    : 'hover:bg-white border border-transparent'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <div className='relative'>
                    {getChatDisplayImage(chat) ? (
                      <Image
                        src={getChatDisplayImage(chat)!}
                        alt={getChatDisplayName(chat)}
                        width={48}
                        height={48}
                        className='rounded-full object-cover'
                      />
                    ) : (
                      <div className='w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center'>
                        {chat.isGroup ? (
                          <Users className='h-6 w-6 text-white' />
                        ) : (
                          <span className='text-white font-medium text-lg'>
                            {getChatDisplayName(chat)[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {!chat.isGroup && isUserOnline(chat) && (
                      <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-accent-500 border-2 border-white rounded-full'></div>
                    )}
                  </div>
                  
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-1'>
                      <h3 className='font-medium text-neutral-900 truncate'>
                        {getChatDisplayName(chat)}
                      </h3>
                      {chat.messages[0] && (
                        <span className='text-xs text-neutral-500'>
                          {formatDistanceToNow(new Date(chat.messages[0].createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-neutral-600 truncate'>
                      {getLastMessage(chat)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}