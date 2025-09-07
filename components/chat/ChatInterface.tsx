'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ChatSidebar from './ChatSidebar'
import ChatContainer from './ChatContainer'

interface ChatInterfaceProps {
  userId: string
}

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    // Only initialize WebSocket connection if we have a valid user ID and in browser
    if (!userId || typeof window === 'undefined') return

    try {
      // Subscribe to online presence
      const channel = supabase.channel('online-users')
      
      channel
        .on('presence', { event: 'sync' }, () => {
          try {
            const state = channel.presenceState()
            const users = Object.keys(state)
            setOnlineUsers(users)
          } catch (error) {
            console.warn('Error syncing presence:', error)
          }
        })
        .on('presence', { event: 'join' }, ({ key }) => {
          setOnlineUsers(prev => [...new Set([...prev, key])])
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          setOnlineUsers(prev => prev.filter((id: any) => id !== key))
        })
        .subscribe(async (status: any) => {
          if (status === 'SUBSCRIBED') {
            try {
              await channel.track({ 
                user_id: userId, 
                online_at: new Date().toISOString() 
              })
            } catch (error) {
              console.warn('Error tracking presence:', error)
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('WebSocket channel error - continuing without real-time presence')
          }
        })

      return () => {
        try {
          supabase.removeChannel(channel)
        } catch (error) {
          console.warn('Error removing channel:', error)
        }
      }
    } catch (error) {
      console.warn('WebSocket connection failed - continuing without real-time features:', error)
    }
  }, [userId])

  return (
    <div className='flex h-full'>
      <ChatSidebar
        userId={userId}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        onlineUsers={onlineUsers}
      />
      
      <div className='flex-1 flex flex-col'>
        {selectedChatId ? (
          <ChatContainer
            chatId={selectedChatId}
            userId={userId}
          />
        ) : (
          <div className='flex-1 flex items-center justify-center text-neutral-500'>
            <div className='text-center'>
              <div className='text-6xl mb-4'>💬</div>
              <h3 className='text-lg font-medium mb-2'>Select a conversation</h3>
              <p>Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}