'use client'

import { useState, useEffect } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { Shield, Eye, EyeOff, Lock, Users, Globe, UserCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PrivacyOption {
  id: string
  title: string
  description: string
  value: 'public' | 'friends' | 'private'
  icon: any
}

export default function PrivacySettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'public' as 'public' | 'friends' | 'private',
    study_history: 'friends' as 'public' | 'friends' | 'private',
    online_status: 'friends' as 'public' | 'friends' | 'private',
    study_schedule: 'private' as 'public' | 'friends' | 'private',
    achievements: 'public' as 'public' | 'friends' | 'private',
    study_groups: 'public' as 'public' | 'friends' | 'private',
  })

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    email_notifications: true,
    security_alerts: true,
    login_notifications: true,
    data_processing: true,
    marketing_emails: false,
    research_participation: false
  })

  const privacyOptions: PrivacyOption[] = [
    {
      id: 'profile_visibility',
      title: 'Profile Visibility',
      description: 'Who can see your profile information and study interests',
      value: privacySettings.profile_visibility,
      icon: UserCheck
    },
    {
      id: 'study_history',
      title: 'Study History',
      description: 'Who can see your past study sessions and progress',
      value: privacySettings.study_history,
      icon: Eye
    },
    {
      id: 'online_status',
      title: 'Online Status',
      description: 'Who can see when you\'re online and available to study',
      value: privacySettings.online_status,
      icon: Globe
    },
    {
      id: 'study_schedule',
      title: 'Study Schedule',
      description: 'Who can see your upcoming study sessions and calendar',
      value: privacySettings.study_schedule,
      icon: Lock
    },
    {
      id: 'achievements',
      title: 'Achievements & Progress',
      description: 'Who can see your study achievements and milestones',
      value: privacySettings.achievements,
      icon: Shield
    },
    {
      id: 'study_groups',
      title: 'Study Group Membership',
      description: 'Who can see which study groups you belong to',
      value: privacySettings.study_groups,
      icon: Users
    }
  ]

  const handlePrivacyChange = async (settingId: string, value: 'public' | 'friends' | 'private') => {
    // Optimistically update UI immediately
    setPrivacySettings(prev => ({
      ...prev,
      [settingId]: value
    }))
    
    try {
      setIsSaving(true)
      
      // Save privacy settings to user profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences: {
            privacy: {
              ...privacySettings,
              [settingId]: value
            }
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update privacy setting')
      }
      
      toast.success(`Privacy setting updated: ${settingId.replace('_', ' ')} set to ${value}`)
    } catch (error) {
      console.error('Privacy setting update error:', error)
      toast.error('Failed to update privacy setting')
      // Revert the optimistic update
      setPrivacySettings(prev => ({
        ...prev,
        [settingId]: privacySettings[settingId as keyof typeof privacySettings]
      }))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSecurityChange = async (settingId: string, value: boolean) => {
    // Optimistically update UI immediately
    setSecuritySettings(prev => ({
      ...prev,
      [settingId]: value
    }))
    
    try {
      setIsSaving(true)
      
      // Save security settings to user profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences: {
            security: {
              ...securitySettings,
              [settingId]: value
            }
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update security setting')
      }
      
      const action = value ? 'enabled' : 'disabled'
      toast.success(`Security setting ${action}: ${settingId.replace('_', ' ')}`)
    } catch (error) {
      console.error('Security setting update error:', error)
      toast.error('Failed to update security setting')
      // Revert the optimistic update
      setSecuritySettings(prev => ({
        ...prev,
        [settingId]: securitySettings[settingId as keyof typeof securitySettings]
      }))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save all privacy and security settings at once
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences: {
            privacy: privacySettings,
            security: securitySettings
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update privacy settings')
      }
      
      toast.success('Privacy settings updated successfully!')
    } catch (error) {
      console.error('Privacy settings save error:', error)
      toast.error('Failed to update privacy settings')
    } finally {
      setIsSaving(false)
    }
  }

  const getVisibilityIcon = (value: string) => {
    switch (value) {
      case 'public':
        return <Globe className='h-4 w-4 text-green-600' />
      case 'friends':
        return <Users className='h-4 w-4 text-yellow-600' />
      case 'private':
        return <Lock className='h-4 w-4 text-red-600' />
      default:
        return <Globe className='h-4 w-4 text-neutral-600' />
    }
  }

  const getVisibilityColor = (value: string) => {
    switch (value) {
      case 'public':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'friends':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'private':
        return 'text-red-600 bg-red-100 border-red-200'
      default:
        return 'text-neutral-600 bg-neutral-100 border-neutral-200'
    }
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-neutral-900'>Privacy & Security</h2>
          <p className='text-neutral-600 mt-1'>Control who can see your information and manage your security settings</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className='btn-primary'
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Privacy Controls */}
      <div className='space-y-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Eye className='h-5 w-5 mr-2' />
          Privacy Controls
        </h3>
        
        <div className='space-y-4'>
          {privacyOptions.map((option: any) => {
            const Icon = option.icon
            return (
              <div key={option.id} className='border border-neutral-200 rounded-lg p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-start space-x-3'>
                    <Icon className='h-5 w-5 text-neutral-600 mt-1' />
                    <div className='flex-1'>
                      <h4 className='font-medium text-neutral-900'>{option.title}</h4>
                      <p className='text-sm text-neutral-600 mt-1'>{option.description}</p>
                    </div>
                  </div>
                  
                  <div className='flex items-center space-x-2'>
                    {getVisibilityIcon(privacySettings[option.id as keyof typeof privacySettings])}
                    <select
                      value={privacySettings[option.id as keyof typeof privacySettings]}
                      onChange={(e: any) => handlePrivacyChange(option.id, e.target.value as 'public' | 'friends' | 'private')}
                      className={`text-sm border rounded-md px-3 py-1 ${getVisibilityColor(privacySettings[option.id as keyof typeof privacySettings])}`}
                    >
                      <option value='public'>Public</option>
                      <option value='friends'>Study Partners Only</option>
                      <option value='private'>Private</option>
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Security Settings */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Shield className='h-5 w-5 mr-2' />
          Security Settings
        </h3>
        
        <div className='space-y-4'>
          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>Two-Factor Authentication</h4>
              <p className='text-sm text-neutral-600'>Add an extra layer of security to your account</p>
            </div>
            <div className='flex items-center space-x-3'>
              {!securitySettings.two_factor_enabled && (
                <span className='text-sm text-orange-600 font-medium'>Recommended</span>
              )}
              <label className='flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={securitySettings.two_factor_enabled}
                  onChange={(e: any) => handleSecurityChange('two_factor_enabled', e.targetDate.checked)}
                  className='sr-only peer'
                />
                <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
              </label>
            </div>
          </div>

          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>Security Alerts</h4>
              <p className='text-sm text-neutral-600'>Get notified about suspicious account activity</p>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={securitySettings.security_alerts}
                onChange={(e: any) => handleSecurityChange('security_alerts', e.targetDate.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>

          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>Login Notifications</h4>
              <p className='text-sm text-neutral-600'>Get emails when someone logs into your account</p>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={securitySettings.login_notifications}
                onChange={(e: any) => handleSecurityChange('login_notifications', e.targetDate.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data & Communication */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900'>Data & Communication</h3>
        
        <div className='space-y-4'>
          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>Data Processing</h4>
              <p className='text-sm text-neutral-600'>Allow us to process your data to improve study recommendations</p>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={securitySettings.data_processing}
                onChange={(e: any) => handleSecurityChange('data_processing', e.targetDate.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>

          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>Marketing Emails</h4>
              <p className='text-sm text-neutral-600'>Receive emails about new features and study tips</p>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={securitySettings.marketing_emails}
                onChange={(e: any) => handleSecurityChange('marketing_emails', e.targetDate.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>

          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>Research Participation</h4>
              <p className='text-sm text-neutral-600'>Help improve Clerva by participating in anonymous research</p>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={securitySettings.research_participation}
                onChange={(e: any) => handleSecurityChange('research_participation', e.targetDate.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Summary */}
      <div className='bg-neutral-50 rounded-lg p-4'>
        <h4 className='font-medium text-neutral-900 mb-3'>Privacy Summary</h4>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
          <div className='flex items-center space-x-2'>
            <Globe className='h-4 w-4 text-green-600' />
            <span className='text-neutral-600'>Public settings:</span>
            <span className='font-medium'>
              {Object.values(privacySettings).filter((v: any) => v === 'public').length}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <Users className='h-4 w-4 text-yellow-600' />
            <span className='text-neutral-600'>Partners only:</span>
            <span className='font-medium'>
              {Object.values(privacySettings).filter((v: any) => v === 'friends').length}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <Lock className='h-4 w-4 text-red-600' />
            <span className='text-neutral-600'>Private settings:</span>
            <span className='font-medium'>
              {Object.values(privacySettings).filter((v: any) => v === 'private').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}