'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { User, Settings, Bell, Shield, BookOpen, Award, Camera, Edit, Save, X, Lock, Trash2, Eye, EyeOff, RefreshCw, Upload, Loader2 } from 'lucide-react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { toast } from 'react-hot-toast'

interface UserProfile {
  name: string
  email: string
  bio: string
  university: string
  major: string
  year: string
  location: string
  studyGoals: string
  studyLevel: string
  learningStyle: string
  preferredStudyTime: string
  subjectInterests: string[]
  points: number
  totalStudyTime: number
  streak: number
  memberSince: string
  profileVisibility: string
  showStudyHistory: boolean
  image?: string
  notifications: {
    studyReminders: boolean
    newMessages: boolean
    goalDeadlines: boolean
    partnerRequests: boolean
    achievements: boolean
    weeklySummary: boolean
  }
}

interface PasswordChangeForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const defaultProfile: UserProfile = {
  name: '',
  email: '',
  bio: '',
  university: '',
  major: '',
  year: '',
  location: '',
  studyGoals: '',
  studyLevel: 'intermediate',
  learningStyle: 'visual',
  preferredStudyTime: 'morning',
  subjectInterests: ['Mathematics', 'Physics', 'Computer Science'],
  points: 850,
  totalStudyTime: 124,
  streak: 24,
  memberSince: 'Jan 2024',
  profileVisibility: 'everyone',
  showStudyHistory: true,
  notifications: {
    studyReminders: true,
    newMessages: true,
    goalDeadlines: true,
    partnerRequests: true,
    achievements: true,
    weeklySummary: false
  }
}

export default function ProfilePageClient() {
  const { data: session } = useSession()
  const { settings } = useSettings()
  
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  
  // Edit modes for different sections
  const [editModes, setEditModes] = useState({
    personal: false,
    preferences: false
  })

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile()
    }
  }, [session])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile({
          ...defaultProfile,
          name: data.name || session?.user?.name || '',
          email: data.email || session?.user?.email || '',
          ...data
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      
      if (response.ok) {
        setEditModes({ personal: false, preferences: false })
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to save profile changes')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error('Failed to save profile changes')
    } finally {
      setSaving(false)
    }
  }

  const toggleEditMode = (section: 'personal' | 'preferences') => {
    setEditModes(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (setting: string, value: boolean) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: value
      }
    }))
  }

  const handleSubjectToggle = (subject: string) => {
    setProfile(prev => ({
      ...prev,
      subjectInterests: prev.subjectInterests.includes(subject)
        ? prev.subjectInterests.filter((s: any) => s !== subject)
        : [...prev.subjectInterests, subject]
    }))
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      
      if (response.ok) {
        setShowPasswordModal(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        alert('Password changed successfully')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      alert('Failed to change password')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" to confirm')
      return
    }
    
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        alert('Account deletion initiated. You will be logged out.')
        window.location.href = '/signout'
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('Failed to delete account')
    }
  }

  const handleImageUpload = async (file: File) => {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF)')
      return
    }

    if (file.size > maxSize) {
      toast.error('Image file too large (max 5MB)')
      return
    }

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setProfile(prev => ({
        ...prev,
        image: data.imageUrl
      }))
      toast.success('Profile image updated successfully!')
    } catch (error) {
      toast.error('Failed to upload image')
      console.error(error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const triggerImageUpload = () => {
    imageInputRef.current?.click()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-neutral-200 rounded animate-pulse"></div>
          <div className="lg:col-span-2 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-neutral-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const availableSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Literature', 'Economics', 'Psychology', 'Engineering']

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-heading text-neutral-900'>
            Profile & Settings
          </h1>
          <p className='text-neutral-600 mt-1'>
            Manage your account, preferences, and study profile
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className='btn-outline text-sm flex items-center space-x-2'
          title='Refresh profile data'
        >
          <RefreshCw className='h-4 w-4' />
          <span>Refresh</span>
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Profile Overview */}
        <div className='lg:col-span-1'>
          <div className='card text-center'>
            <div className='relative inline-block mb-4'>
              <div className='w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto overflow-hidden'>
                {profile.image ? (
                  <img 
                    src={profile.image} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className='text-2xl font-bold text-primary-600'>
                    {profile.name?.[0] || 'U'}
                  </span>
                )}
              </div>
              <button 
                onClick={triggerImageUpload}
                disabled={isUploadingImage}
                className='absolute bottom-0 right-0 bg-white border-2 border-neutral-200 rounded-full p-2 hover:bg-neutral-50 transition-colors disabled:opacity-50'
              >
                {isUploadingImage ? (
                  <Loader2 className='h-4 w-4 text-neutral-600 animate-spin' />
                ) : (
                  <Camera className='h-4 w-4 text-neutral-600' />
                )}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e: any) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
              />
            </div>
            
            <h3 className='font-semibold text-neutral-900 text-lg'>
              {profile.name || 'User Name'}
            </h3>
            <p className='text-neutral-600 text-sm mb-4'>
              {profile.email || 'user@example.com'}
            </p>
            
            <div className='space-y-3 text-sm'>
              <div className='flex items-center justify-between'>
                <span className='text-neutral-600'>Study Level:</span>
                <span className='font-medium capitalize'>{profile.studyLevel}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-neutral-600'>Study Score:</span>
                <span className='font-medium text-secondary-600'>{profile.points} points</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-neutral-600'>Study Streak:</span>
                <span className='font-medium text-accent-600'>{profile.streak} days</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-neutral-600'>Total Hours:</span>
                <span className='font-medium'>{profile.totalStudyTime}h</span>
              </div>
            </div>
            
            <button 
              onClick={() => toggleEditMode('personal')}
              className='btn-primary w-full mt-4'
              disabled={saving}
            >
              <Edit className='h-4 w-4 mr-2' />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Settings Sections */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Personal Information */}
          <div className='card'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-neutral-900 flex items-center'>
                <User className='h-5 w-5 mr-2' />
                Personal Information
              </h3>
              <div className="flex space-x-2">
                {editModes.personal ? (
                  <>
                    <button 
                      onClick={handleSaveProfile}
                      className='btn-primary text-sm'
                      disabled={saving}
                    >
                      <Save className='h-4 w-4 mr-1' />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={() => toggleEditMode('personal')}
                      className='btn-outline text-sm'
                    >
                      <X className='h-4 w-4 mr-1' />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => toggleEditMode('personal')}
                    className='btn-outline text-sm'
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Full Name
                </label>
                <input
                  type='text'
                  value={profile.name}
                  onChange={(e: any) => handleInputChange('name', e.target.value)}
                  className='input-field'
                  disabled={!editModes.personal}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Email Address
                </label>
                <input
                  type='email'
                  value={profile.email}
                  className='input-field bg-neutral-50'
                  disabled
                />
                <p className='text-xs text-neutral-500 mt-1'>Email cannot be changed</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  University/School
                </label>
                <input
                  type='text'
                  value={profile.university}
                  onChange={(e: any) => handleInputChange('university', e.target.value)}
                  placeholder='Enter your university'
                  className='input-field'
                  disabled={!editModes.personal}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Year of Study
                </label>
                <select 
                  value={profile.year}
                  onChange={(e: any) => handleInputChange('year', e.target.value)}
                  className='input-field' 
                  disabled={!editModes.personal}
                >
                  <option value="">Select year</option>
                  <option value="freshman">Freshman</option>
                  <option value="sophomore">Sophomore</option>
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="graduate">Graduate</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e: any) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  placeholder='Tell others about yourself...'
                  className='input-field'
                  disabled={!editModes.personal}
                />
              </div>
            </div>
          </div>

          {/* Study Preferences */}
          <div className='card'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-neutral-900 flex items-center'>
                <BookOpen className='h-5 w-5 mr-2' />
                Study Preferences
              </h3>
              <div className="flex space-x-2">
                {editModes.preferences ? (
                  <>
                    <button 
                      onClick={handleSaveProfile}
                      className='btn-primary text-sm'
                      disabled={saving}
                    >
                      <Save className='h-4 w-4 mr-1' />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={() => toggleEditMode('preferences')}
                      className='btn-outline text-sm'
                    >
                      <X className='h-4 w-4 mr-1' />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => toggleEditMode('preferences')}
                    className='btn-outline text-sm'
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-neutral-700 mb-2'>
                    Preferred Study Time
                  </label>
                  <select 
                    value={profile.preferredStudyTime}
                    onChange={(e: any) => handleInputChange('preferredStudyTime', e.target.value)}
                    className='input-field' 
                    disabled={!editModes.preferences}
                  >
                    <option value="morning">Morning (6AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 6PM)</option>
                    <option value="evening">Evening (6PM - 10PM)</option>
                    <option value="night">Night (10PM - 2AM)</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-neutral-700 mb-2'>
                    Learning Style
                  </label>
                  <select 
                    value={profile.learningStyle}
                    onChange={(e: any) => handleInputChange('learningStyle', e.target.value)}
                    className='input-field' 
                    disabled={!editModes.preferences}
                  >
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="kinesthetic">Kinesthetic</option>
                    <option value="reading">Reading/Writing</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Subject Interests
                </label>
                <div className='flex flex-wrap gap-2'>
                  {availableSubjects.map((subject: any) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => editModes.preferences && handleSubjectToggle(subject)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        profile.subjectInterests.includes(subject)
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                      } ${!editModes.preferences ? 'cursor-default' : 'cursor-pointer'}`}
                      disabled={!editModes.preferences}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Study Goals
                </label>
                <textarea
                  value={profile.studyGoals}
                  onChange={(e: any) => handleInputChange('studyGoals', e.target.value)}
                  rows={3}
                  placeholder='What are your learning objectives?'
                  className='input-field'
                  disabled={!editModes.preferences}
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className='card'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-neutral-900 flex items-center'>
                <Bell className='h-5 w-5 mr-2' />
                Notification Settings
              </h3>
            </div>
            
            <div className='space-y-4'>
              {[
                { key: 'studyReminders', title: 'Study Reminders', description: 'Get notified about upcoming study sessions' },
                { key: 'newMessages', title: 'New Messages', description: 'Receive notifications for new chat messages' },
                { key: 'goalDeadlines', title: 'Goal Deadlines', description: 'Reminders when goal deadlines are approaching' },
                { key: 'partnerRequests', title: 'Partner Requests', description: 'Notifications when someone wants to study together' },
                { key: 'achievements', title: 'Achievement Updates', description: 'Celebrate when you reach new milestones' },
                { key: 'weeklySummary', title: 'Weekly Summary', description: 'Get a weekly report of your study progress' }
              ].map((setting: any) => (
                <div key={setting.key} className='flex items-center justify-between p-3 border border-neutral-200 rounded-lg'>
                  <div>
                    <div className='font-medium text-neutral-900'>{setting.title}</div>
                    <div className='text-sm text-neutral-600'>{setting.description}</div>
                  </div>
                  <label className='flex items-center cursor-pointer'>
                    <input 
                      type='checkbox' 
                      className='sr-only peer' 
                      checked={profile.notifications[setting.key as keyof typeof profile.notifications]}
                      onChange={(e: any) => handleNotificationChange(setting.key, e.target.checked)}
                    />
                    <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Security */}
          <div className='card'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-neutral-900 flex items-center'>
                <Shield className='h-5 w-5 mr-2' />
                Privacy & Security
              </h3>
            </div>
            
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-3 border border-neutral-200 rounded-lg'>
                <div>
                  <div className='font-medium text-neutral-900'>Profile Visibility</div>
                  <div className='text-sm text-neutral-600'>Who can see your profile and study information</div>
                </div>
                <select 
                  value={profile.profileVisibility}
                  onChange={(e: any) => handleInputChange('profileVisibility', e.target.value)}
                  className='input-field text-sm w-auto'
                >
                  <option value="everyone">Everyone</option>
                  <option value="partners">Study Partners Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              
              <div className='flex items-center justify-between p-3 border border-neutral-200 rounded-lg'>
                <div>
                  <div className='font-medium text-neutral-900'>Study History</div>
                  <div className='text-sm text-neutral-600'>Allow others to see your study session history</div>
                </div>
                <label className='flex items-center cursor-pointer'>
                  <input 
                    type='checkbox' 
                    className='sr-only peer' 
                    checked={profile.showStudyHistory}
                    onChange={(e: any) => handleInputChange('showStudyHistory', e.target.checked)}
                  />
                  <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
                </label>
              </div>
              
              <div className='pt-4 border-t border-neutral-200'>
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className='btn-outline text-red-600 border-red-200 hover:bg-red-50 transition-colors'
                >
                  <Lock className='h-4 w-4 mr-2' />
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className='card bg-neutral-50 border-neutral-200'>
            <h3 className='text-lg font-semibold text-neutral-900 mb-4'>Account Actions</h3>
            <div className='space-y-3'>
              <button className='btn-outline w-full text-left'>
                Export Study Data
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className='btn-outline w-full text-left text-red-600 border-red-200 hover:bg-red-50 transition-colors'
              >
                <Trash2 className='h-4 w-4 mr-2 inline' />
                Delete Account
              </button>
            </div>
            <p className='text-xs text-neutral-500 mt-3'>
              Deleting your account is permanent and cannot be undone. All your study data, messages, and connections will be lost.
            </p>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Change Password</h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e: any) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                    className="input-field pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({...prev, current: !prev.current}))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e: any) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                    className="input-field pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({...prev, new: !prev.new}))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e: any) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                    className="input-field pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({...prev, confirm: !prev.confirm}))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleChangePassword}
                className="btn-primary flex-1"
                disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                Change Password
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Delete Account</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-neutral-700 mb-4">
                This action is permanent and cannot be undone. All your study data, messages, and connections will be lost.
              </p>
              
              <p className="text-sm font-medium text-neutral-900 mb-2">
                Type "DELETE MY ACCOUNT" to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e: any) => setDeleteConfirmation(e.target.value)}
                className="input-field"
                placeholder="DELETE MY ACCOUNT"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
                disabled={deleteConfirmation !== 'DELETE MY ACCOUNT'}
              >
                Delete My Account
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                }}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}