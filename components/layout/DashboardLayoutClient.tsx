'use client'

import { ReactNode } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { useAppliedSettings } from '@/lib/hooks/useAppliedSettings'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import ChunkErrorHandler from '@/components/ChunkErrorHandler'
import LoginReminderChecker from '@/components/reminders/LoginReminderChecker'

interface DashboardLayoutClientProps {
  children: ReactNode
}

export default function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  // Apply settings to DOM
  useAppliedSettings()
  
  // Get settings for component styling
  const { settings } = useSettings()

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      settings.appearance.theme === 'dark' ? 'bg-neutral-900' : 'bg-neutral-50'
    } ${
      settings.appearance.compact_mode ? 'text-sm' : ''
    } ${
      settings.appearance.focus_mode ? 'focus-mode' : ''
    }`}>
      <ChunkErrorHandler />
      <LoginReminderChecker />
      <div className='flex'>
        <Sidebar />
        <div className='flex-1 flex flex-col min-h-screen'>
          <TopBar />
          <main className={`flex-1 transition-all duration-200 ${
            settings.appearance.compact_mode ? 'p-4' : 'p-6'
          } ${
            settings.appearance.focus_mode ? 'px-8' : ''
          }`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}