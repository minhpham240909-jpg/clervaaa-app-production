'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BookOpen, 
  Home, 
  Users, 
  MessageCircle, 
  Search,
  Settings,
  User,
  Bell,
  Brain,
  FileText,
  BarChart3,
  HelpCircle,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/lib/contexts/SettingsContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Find Partners', href: '/find', icon: Search },
  { name: 'My Groups', href: '/groups', icon: Users },
  { name: 'Messages', href: '/messages', icon: MessageCircle },
  { name: 'Reminders', href: '/reminders', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

// AI-Powered Features Section
const aiFeatures = [
  { name: 'AI Quiz Generator', href: '/ai/quiz-generator', icon: HelpCircle },
  { name: 'AI Progress Analysis', href: '/ai/progress-analysis', icon: BarChart3 },
  { name: 'AI Summaries & Flashcards', href: '/ai/summaries-flashcards', icon: FileText },
  { name: 'AI Partner Matching', href: '/ai/partner-matching', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { settings } = useSettings()
  const { sidebar_style, theme, compact_mode, show_profile_photos, focus_mode } = settings.appearance
  
  const getWidthClass = () => {
    if (focus_mode) return 'w-16'
    switch (sidebar_style) {
      case 'minimal':
        return 'w-16'
      case 'compact':
        return 'w-48'
      default:
        return 'w-64'
    }
  }

  return (
    <div className={cn(
      getWidthClass(),
      'border-r h-screen sticky top-0 transition-all duration-200',
      theme === 'dark' ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'
    )}>
      <div className={cn(
        compact_mode ? 'p-4' : 'p-6'
      )}>
        <div className='flex items-center space-x-2'>
          <BookOpen className='h-8 w-8 text-primary-500' />
          {(sidebar_style !== 'minimal' && !focus_mode) && (
            <span className={cn(
              'font-bold font-heading transition-colors',
              compact_mode ? 'text-lg' : 'text-xl',
              theme === 'dark' ? 'text-white' : 'text-neutral-900'
            )}>
              Clerva
            </span>
          )}
        </div>
      </div>

      <nav className={cn(
        'pb-6',
        compact_mode ? 'px-2' : 'px-3'
      )}>
        <ul className={cn(
          compact_mode ? 'space-y-0.5' : 'space-y-1'
        )}>
          {navigation.map((item: any) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const showLabel = sidebar_style !== 'minimal' && !focus_mode
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-lg transition-all duration-200 group relative',
                    compact_mode ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm',
                    'font-medium',
                    showLabel ? 'justify-start' : 'justify-center',
                    isActive
                      ? theme === 'dark'
                        ? 'bg-primary-900/50 text-primary-300'
                        : 'bg-primary-100 text-primary-700'
                      : theme === 'dark'
                        ? 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                  title={!showLabel ? item.name : undefined}
                >
                  <Icon className={cn(
                    'h-5 w-5',
                    showLabel ? 'mr-3' : ''
                  )} />
                  {showLabel && (
                    <span className='truncate'>{item.name}</span>
                  )}
                  
                  {/* Tooltip for minimal sidebar */}
                  {!showLabel && (
                    <div className='absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50'>
                      {item.name}
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* AI-Powered Features Section */}
        {(sidebar_style !== 'minimal' && !focus_mode) && (
          <div className={cn('mt-6 pt-6 border-t', theme === 'dark' ? 'border-neutral-700' : 'border-neutral-200')}>
            <div className="flex items-center space-x-2 mb-3 px-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-md w-4 h-4 flex items-center justify-center">
                <Brain className="h-2.5 w-2.5 text-white" />
              </div>
              <h3 className={cn(
                'text-xs font-semibold uppercase tracking-wider',
                theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
              )}>
                AI Features
              </h3>
              <Sparkles className="h-3 w-3 text-blue-500" />
            </div>
            <ul className={cn(compact_mode ? 'space-y-0.5' : 'space-y-1')}>
              {aiFeatures.map((item: any) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center rounded-lg transition-all duration-200 group relative',
                        compact_mode ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm',
                        'font-medium justify-start',
                        isActive
                          ? theme === 'dark'
                            ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-blue-300'
                            : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200'
                          : theme === 'dark'
                            ? 'text-neutral-300 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 hover:text-blue-300'
                            : 'text-neutral-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
                      )}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <span className='truncate text-xs'>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Minimal sidebar AI features */}
        {(sidebar_style === 'minimal' || focus_mode) && (
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <ul className="space-y-0.5">
              {aiFeatures.map((item: any) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center justify-center rounded-lg transition-all duration-200 group relative px-2 py-1.5',
                        isActive
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
                          : 'text-neutral-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
                      )}
                      title={item.name}
                    >
                      <Icon className="h-4 w-4" />
                      
                      {/* Tooltip for minimal sidebar */}
                      <div className='absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50'>
                        {item.name}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </nav>
    </div>
  )
}