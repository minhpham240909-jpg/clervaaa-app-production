'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, Smartphone, Volume2, VolumeX, Clock, Users, MessageCircle, Calendar, Target, Award } from 'lucide-react'
import { useSettings } from '@/lib/contexts/SettingsContext'

interface NotificationCategory {
  id: string
  title: string
  description: string
  icon: any
  settings: {
    email: boolean
    push: boolean
    inApp: boolean
  }
}

export default function NotificationSettings() {
  const { settings, updateNotificationSettings, isLoading } = useSettings()
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings.notifications)

  useEffect(() => {
    setLocalSettings(settings.notifications)
  }, [settings.notifications])

  // Auto-check for expired DND timers
  useEffect(() => {
    const checkDndExpiration = () => {
      if (localSettings.do_not_disturb && isDndExpired()) {
        // Auto turn off DND when timer expires
        handleGlobalSettingChange('do_not_disturb', false)
        // DND timer expired
      }
    }

    const interval = setInterval(checkDndExpiration, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [localSettings.do_not_disturb])

  // Default notification categories with fallback values
  const defaultCategorySettings = {
    study_reminders: { email: true, push: true, inApp: true },
    partner_requests: { email: true, push: true, inApp: true },
    messages: { email: false, push: true, inApp: true },
    session_updates: { email: true, push: true, inApp: true },
    goal_progress: { email: true, push: false, inApp: true },
    achievements: { email: false, push: true, inApp: true }
  }

  // Safe access to categories with fallbacks
  const safeCategories = localSettings.categories || defaultCategorySettings

  const notificationCategories: NotificationCategory[] = [
    {
      id: 'study_reminders',
      title: 'Study Reminders',
      description: 'Reminders for upcoming study sessions and deadlines',
      icon: Clock,
      settings: safeCategories.study_reminders || defaultCategorySettings.study_reminders || { email: true, push: false, inApp: true }
    },
    {
      id: 'partner_requests',
      title: 'Partner Requests',
      description: 'When someone wants to study with you or join your group',
      icon: Users,
      settings: safeCategories.partner_requests || defaultCategorySettings.partner_requests || { email: true, push: true, inApp: true }
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'New messages in your study chats and conversations',
      icon: MessageCircle,
      settings: safeCategories.messages || defaultCategorySettings.messages || { email: false, push: true, inApp: true }
    },
    {
      id: 'session_updates',
      title: 'Session Updates',
      description: 'Changes to your study sessions and group meetings',
      icon: Calendar,
      settings: safeCategories.session_updates || defaultCategorySettings.session_updates || { email: true, push: true, inApp: true }
    },
    {
      id: 'goal_progress',
      title: 'Goal Progress',
      description: 'Updates on your study goals and milestones',
      icon: Target,
      settings: safeCategories.goal_progress || defaultCategorySettings.goal_progress || { email: true, push: false, inApp: true }
    },
    {
      id: 'achievements',
      title: 'Achievements',
      description: 'When you earn new badges or reach study milestones',
      icon: Award,
      settings: safeCategories.achievements || defaultCategorySettings.achievements || { email: false, push: true, inApp: true }
    }
  ]

  const handleGlobalSettingChange = async (setting: string, value: boolean | string) => {
    const newSettings = {
      ...localSettings,
      [setting]: value
    }
    
    setLocalSettings(newSettings)
    
    // Auto-save global setting changes for immediate application
    try {
      setIsSaving(true)
      await updateNotificationSettings({ [setting]: value })
    } catch (error) {
      console.error('Failed to save notification setting:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Check if DND has expired
  const isDndExpired = () => {
    return false // Simplified - no timer functionality
  }

  // Get DND expiration time string
  const getDndExpirationString = () => {
    return null // Simplified - no timer functionality
  }

  const handleNotificationChange = async (categoryId: string, type: 'email' | 'push' | 'inApp', value: boolean) => {
    const newCategories = {
      ...safeCategories,
      [categoryId]: {
        ...safeCategories[categoryId],
        [type]: value
      }
    }
    
    const newSettings = {
      ...localSettings,
      categories: newCategories
    }
    
    setLocalSettings(newSettings)
    
    // Auto-save notification category changes
    try {
      setIsSaving(true)
      await updateNotificationSettings({ categories: newCategories })
    } catch (error) {
      console.error('Failed to save notification category:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateNotificationSettings(localSettings)
    } catch (error) {
      console.error('Failed to save all notification settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const enableAllNotifications = async () => {
    const newCategories = { ...safeCategories }
    Object.keys(newCategories).forEach(key => {
      newCategories[key] = { email: true, push: true, inApp: true }
    })
    
    const newSettings = {
      ...localSettings,
      categories: newCategories
    }
    
    setLocalSettings(newSettings)
    
    try {
      setIsSaving(true)
      await updateNotificationSettings({ categories: newCategories })
    } catch (error) {
      console.error('Failed to enable all notifications:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const disableAllNotifications = async () => {
    const newCategories = { ...safeCategories }
    Object.keys(newCategories).forEach(key => {
      newCategories[key] = { email: false, push: false, inApp: false }
    })
    
    const newSettings = {
      ...localSettings,
      categories: newCategories
    }
    
    setLocalSettings(newSettings)
    
    try {
      setIsSaving(true)
      await updateNotificationSettings({ categories: newCategories })
    } catch (error) {
      console.error('Failed to disable all notifications:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-neutral-900'>Notification Settings</h2>
          <p className='text-neutral-600 mt-1'>Customize how and when you receive notifications</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className='btn-primary'
        >
          {isSaving ? 'Saving...' : isLoading ? 'Loading...' : 'Save All Changes'}
        </button>
      </div>

      {/* Global Controls */}
      <div className='space-y-4'>
        <h3 className='font-medium text-neutral-900'>Global Controls</h3>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div className='flex items-center space-x-3'>
              <Mail className='h-5 w-5 text-neutral-600' />
              <div>
                <h4 className='font-medium text-neutral-900'>Email Notifications</h4>
                <p className='text-sm text-neutral-600'>Receive notifications via email</p>
              </div>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={localSettings.email_enabled}
                onChange={(e: any) => handleGlobalSettingChange('email_enabled', e.target.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>

          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div className='flex items-center space-x-3'>
              <Smartphone className='h-5 w-5 text-neutral-600' />
              <div>
                <h4 className='font-medium text-neutral-900'>Push Notifications</h4>
                <p className='text-sm text-neutral-600'>Receive push notifications on your devices</p>
              </div>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={localSettings.push_enabled}
                onChange={(e: any) => handleGlobalSettingChange('push_enabled', e.target.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>

          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div className='flex items-center space-x-3'>
              {localSettings.sound_enabled ? (
                <Volume2 className='h-5 w-5 text-neutral-600' />
              ) : (
                <VolumeX className='h-5 w-5 text-neutral-600' />
              )}
              <div>
                <h4 className='font-medium text-neutral-900'>Sound Effects</h4>
                <p className='text-sm text-neutral-600'>Play sounds for notifications</p>
              </div>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={localSettings.sound_enabled}
                onChange={(e: any) => handleGlobalSettingChange('sound_enabled', e.target.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>

          <div className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
            localSettings.do_not_disturb 
              ? 'border-red-300 bg-red-50' 
              : 'border-neutral-200 bg-white'
          }`}>
            <div className='flex items-center space-x-3'>
              <div className={`p-2 rounded-full ${
                localSettings.do_not_disturb 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-neutral-100 text-neutral-600'
              }`}>
                <Bell className={`h-5 w-5 ${
                  localSettings.do_not_disturb ? 'text-red-600' : 'text-neutral-600'
                }`} />
              </div>
              <div>
                <h4 className={`font-medium ${
                  localSettings.do_not_disturb ? 'text-red-900' : 'text-neutral-900'
                }`}>
                  Do Not Disturb
                </h4>
                <p className={`text-sm ${
                  localSettings.do_not_disturb 
                    ? 'text-red-700 font-medium' 
                    : 'text-neutral-600'
                }`}>
                  {localSettings.do_not_disturb 
                    ? (
                        <>
                          🔕 Currently active - All notifications paused
                          {/* Timer functionality removed */}
                          {isDndExpired() && (
                            <div className='text-xs text-orange-600 mt-1'>
                              Timer expired - DND still active
                            </div>
                          )}
                        </>
                      )
                    : 'Temporarily pause all notifications'
                  }
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              {localSettings.do_not_disturb && (
                <span className='text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full'>
                  ACTIVE
                </span>
              )}
              <label className='flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={localSettings.do_not_disturb}
                  onChange={(e: any) => handleGlobalSettingChange('do_not_disturb', e.target.checked)}
                  className='sr-only peer'
                />
                <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600'></div>
              </label>
            </div>
          </div>
        </div>

        {/* Do Not Disturb Quick Actions */}
        {localSettings.do_not_disturb && (
          <div className='p-4 border border-red-200 rounded-lg bg-red-50'>
            <h4 className='font-medium text-red-900 mb-3 flex items-center'>
              <Bell className='h-4 w-4 mr-2' />
              Do Not Disturb Options
            </h4>
            <p className='text-sm text-red-700 mb-4'>
              Choose how long to keep notifications paused, or turn off manually
            </p>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => handleGlobalSettingChange('do_not_disturb', false)}
                className='px-3 py-2 text-sm bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors'
              >
                Turn Off Now
              </button>
              <button
                onClick={() => {
                  // Set a timer for 30 minutes
                  // Timer functionality removed
                }}
                className='px-3 py-2 text-sm bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors'
              >
                30 minutes
              </button>
              <button
                onClick={() => {
                  // Set a timer for 1 hour
                  // Timer functionality removed
                }}
                className='px-3 py-2 text-sm bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors'
              >
                1 hour
              </button>
              <button
                onClick={() => {
                  // Set a timer for 2 hours
                  // Timer functionality removed
                }}
                className='px-3 py-2 text-sm bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors'
              >
                2 hours
              </button>
              <button
                onClick={() => {
                  // Set until tomorrow morning (8 AM)
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  tomorrow.setHours(8, 0, 0, 0)
                  // Timer functionality removed
                }}
                className='px-3 py-2 text-sm bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors'
              >
                Until 8 AM tomorrow
              </button>
            </div>
          </div>
        )}

        {/* Quiet Hours */}
        <div className='p-4 border border-neutral-200 rounded-lg'>
          <h4 className='font-medium text-neutral-900 mb-3'>Quiet Hours</h4>
          <p className='text-sm text-neutral-600 mb-4'>
            Notifications will be paused during these hours (except for urgent messages)
          </p>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>Start Time</label>
              <input
                type='time'
                value={localSettings.quiet_hours_start}
                onChange={(e: any) => handleGlobalSettingChange('quiet_hours_start', e.target.value)}
                className='input-field'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>End Time</label>
              <input
                type='time'
                value={localSettings.quiet_hours_end}
                onChange={(e: any) => handleGlobalSettingChange('quiet_hours_end', e.target.value)}
                className='input-field'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Categories */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <div className='flex items-center justify-between'>
          <h3 className='font-medium text-neutral-900'>Notification Categories</h3>
          <div className='flex space-x-2'>
            <button
              onClick={enableAllNotifications}
              className='btn-outline text-sm'
            >
              Enable All
            </button>
            <button
              onClick={disableAllNotifications}
              className='btn-outline text-sm'
            >
              Disable All
            </button>
          </div>
        </div>
        
        <div className='space-y-4'>
          <div className='hidden md:grid md:grid-cols-12 gap-4 p-3 bg-neutral-50 rounded-lg text-sm font-medium text-neutral-700'>
            <div className='col-span-6'>Notification Type</div>
            <div className='col-span-2 text-center'>Email</div>
            <div className='col-span-2 text-center'>Push</div>
            <div className='col-span-2 text-center'>In-App</div>
          </div>
          
          {notificationCategories.map((category: any) => {
            const Icon = category.icon
            return (
              <div key={category.id} className='border border-neutral-200 rounded-lg p-4'>
                <div className='grid grid-cols-1 md:grid-cols-12 gap-4 items-center'>
                  <div className='md:col-span-6'>
                    <div className='flex items-center space-x-3'>
                      <Icon className='h-5 w-5 text-neutral-600' />
                      <div>
                        <h4 className='font-medium text-neutral-900'>{category.title}</h4>
                        <p className='text-sm text-neutral-600'>{category.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className='md:col-span-2 flex justify-center'>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={category.settings?.email && localSettings.email_enabled}
                        onChange={(e: any) => handleNotificationChange(category.id, 'email', e.target.checked)}
                        disabled={!localSettings.email_enabled}
                        className='sr-only peer'
                      />
                      <div className='relative w-8 h-5 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50'></div>
                    </label>
                  </div>
                  
                  <div className='md:col-span-2 flex justify-center'>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={category.settings?.push && localSettings.push_enabled}
                        onChange={(e: any) => handleNotificationChange(category.id, 'push', e.target.checked)}
                        disabled={!localSettings.push_enabled}
                        className='sr-only peer'
                      />
                      <div className='relative w-8 h-5 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50'></div>
                    </label>
                  </div>
                  
                  <div className='md:col-span-2 flex justify-center'>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={category.settings?.inApp && localSettings.in_app_enabled}
                        onChange={(e: any) => handleNotificationChange(category.id, 'inApp', e.target.checked)}
                        disabled={!localSettings.in_app_enabled}
                        className='sr-only peer'
                      />
                      <div className='relative w-8 h-5 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50'></div>
                    </label>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <div className='bg-neutral-50 rounded-lg p-4'>
        <h4 className='font-medium text-neutral-900 mb-3'>Notification Summary</h4>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
          <div>
            <span className='text-neutral-600'>Email notifications:</span>
            <span className='font-medium ml-2'>
              {notificationCategories.filter((n: any) => n.settings?.email).length}/{notificationCategories.length} enabled
            </span>
          </div>
          <div>
            <span className='text-neutral-600'>Push notifications:</span>
            <span className='font-medium ml-2'>
              {notificationCategories.filter((n: any) => n.settings?.push).length}/{notificationCategories.length} enabled
            </span>
          </div>
          <div>
            <span className='text-neutral-600'>In-app notifications:</span>
            <span className='font-medium ml-2'>
              {notificationCategories.filter((n: any) => n.settings?.inApp).length}/{notificationCategories.length} enabled
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}