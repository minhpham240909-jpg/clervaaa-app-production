'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar, MessageCircle, Award, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/lib/contexts/SettingsContext'

interface DashboardStats {
  studyPartners: number
  upcomingSessions: number
  activeChats: number
  studyScore: number
  studyPartnersChange: string
  upcomingSessionsChange: string
  activeChatsChange: string
  studyScoreChange: string
}

const defaultStats: DashboardStats = {
  studyPartners: 12,
  upcomingSessions: 5,
  activeChats: 8,
  studyScore: 85,
  studyPartnersChange: '+2 this week',
  upcomingSessionsChange: '3 this week',
  activeChatsChange: '2 new messages',
  studyScoreChange: '+5% this month',
}

export default function DashboardOverview() {
  const router = useRouter()
  const { settings } = useSettings()
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Use default stats for now
  const stats = defaultStats

  useEffect(() => {
    // Set loading to false after a short delay to ensure everything is rendered
    const timer = setTimeout(() => {
      setLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      // Simple page reload for now
      window.location.reload()
    } catch (error) {
      console.error('Failed to refresh dashboard:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Apply theme-based styling dynamically
  const getThemeClasses = () => {
    const baseClasses = 'card cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]'
    
    if (!settings?.appearance) return baseClasses
    
    if (settings.appearance.reduce_motion) {
      return baseClasses.replace('hover:scale-[1.02]', 'hover:shadow-md')
    }
    
    if (settings.appearance.compact_mode) {
      return `${baseClasses} p-3`
    }
    
    return baseClasses
  }

  const handleStatClick = (statType: string) => {
    switch (statType) {
      case 'partners':
        router.push('/find')
        break
      case 'sessions':
        router.push('/sessions')
        break
      case 'chats':
        router.push('/messages')
        break
      case 'score':
        router.push('/profile')
        break
    }
  }

  const statCards = [
    {
      title: 'Study Partners',
      value: stats.studyPartners.toString(),
      change: stats.studyPartnersChange,
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      onClick: () => handleStatClick('partners'),
    },
    {
      title: 'Upcoming Sessions',
      value: stats.upcomingSessions.toString(),
      change: stats.upcomingSessionsChange,
      icon: Calendar,
      color: 'text-learning-dark',
      bgColor: 'bg-learning-light',
      onClick: () => handleStatClick('sessions'),
    },
    {
      title: 'Active Chats',
      value: stats.activeChats.toString(),
      change: stats.activeChatsChange,
      icon: MessageCircle,
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
      onClick: () => handleStatClick('chats'),
    },
    {
      title: 'Study Score',
      value: `${stats.studyScore}%`,
      change: stats.studyScoreChange,
      icon: Award,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
      onClick: () => handleStatClick('score'),
    },
  ]

  if (loading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[...Array(4)].map((_, index) => (
          <div key={index} className='card animate-pulse'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='h-4 bg-neutral-200 rounded mb-2 w-20'></div>
                <div className='h-8 bg-neutral-200 rounded mb-2 w-16'></div>
                <div className='h-4 bg-neutral-200 rounded w-24'></div>
              </div>
              <div className='bg-neutral-200 p-3 rounded-lg'>
                <div className='h-6 w-6 bg-neutral-300 rounded'></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Header with refresh button */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-neutral-900'>Dashboard Overview</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className='btn-outline text-sm flex items-center space-x-2'
          title='Refresh dashboard data'
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${settings?.appearance?.compact_mode ? 'gap-3' : 'gap-6'}`}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div 
              key={index} 
              className={getThemeClasses()}
              onClick={stat.onClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  stat.onClick()
                }
              }}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p className={`text-sm text-neutral-600 mb-1 ${settings?.appearance?.compact_mode ? 'text-xs' : ''}`}>
                    {stat.title}
                  </p>
                  <p className={`font-bold text-neutral-900 ${settings?.appearance?.compact_mode ? 'text-xl' : 'text-2xl'}`}>
                    {stat.value}
                  </p>
                  <p className={`text-neutral-500 mt-1 ${settings?.appearance?.compact_mode ? 'text-xs' : 'text-sm'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} rounded-lg transition-transform ${
                  settings?.appearance?.reduce_motion ? '' : 'hover:scale-110'
                } ${settings?.appearance?.compact_mode ? 'p-2' : 'p-3'}`}>
                  <Icon className={`${settings?.appearance?.compact_mode ? 'h-5 w-5' : 'h-6 w-6'}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}