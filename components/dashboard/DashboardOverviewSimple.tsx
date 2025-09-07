'use client'

import { Users, Sparkles, MessageCircle, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface DashboardStats {
  studyPartners: number
  aiMatches: number
  activeChats: number
  studyScore: number
  studyPartnersChange: string
  aiMatchesChange: string
  activeChatsChange: string
  studyScoreChange: string
}

const stats: DashboardStats = {
  studyPartners: 12,
  aiMatches: 8,
  activeChats: 8,
  studyScore: 85,
  studyPartnersChange: '+2 this week',
  aiMatchesChange: '3 new matches',
  activeChatsChange: '2 new messages',
  studyScoreChange: '+5% this month',
}

export default function DashboardOverviewSimple() {
  const router = useRouter()

  const handleStatClick = (statType: string) => {
    toast.success(`Clicked ${statType}! Navigation working.`)
    
    switch (statType) {
      case 'partners':
        router.push('/find')
        break
      case 'ai-matches':
        router.push('/find')
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
      title: 'AI Matches',
      value: stats.aiMatches.toString(),
      change: stats.aiMatchesChange,
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      onClick: () => handleStatClick('ai-matches'),
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

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-neutral-900'>Dashboard Overview</h2>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div 
              key={index} 
              className='card cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white'
              onClick={stat.onClick}
              style={{ zIndex: 10 }}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-neutral-600 mb-1'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold text-neutral-900'>
                    {stat.value}
                  </p>
                  <p className='text-sm text-neutral-500 mt-1'>
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg transition-transform hover:scale-110`}>
                  <Icon className='h-6 w-6' />
                </div>
              </div>
            </div>
          )
        })}
      </div>


    </div>
  )
}