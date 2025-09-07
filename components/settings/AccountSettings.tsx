'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Camera, Save, Edit2, Mail, MapPin, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AccountSettings() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    bio: '',
    university: '',
    major: '',
    year: '',
    location: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    linkedinUrl: '',
    githubUrl: '',
    phone: ''
  })

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) return
      
      try {
        const response = await fetch('/api/user/profile')
        const data = await response.json()
        
        if (response.ok && data.profile) {
          setFormData({
            name: data.profile.name || session.user.name || '',
            email: session.user.email || '',
            bio: data.profile.bio || '',
            university: data.profile.university || '',
            major: data.profile.major || '',
            year: data.profile.year?.toString() || '',
            location: data.profile.location || '',
            timezone: data.profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            linkedinUrl: '',
            githubUrl: '',
            phone: ''
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [session])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          university: formData.university,
          major: formData.major,
          year: formData.year,
          location: formData.location,
          timezone: formData.timezone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }
      
      toast.success(data.message || 'Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      bio: '',
      university: '',
      major: '',
      year: '',
      location: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      linkedinUrl: '',
      githubUrl: '',
      phone: ''
    })
    setIsEditing(false)
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-neutral-900'>Account Settings</h2>
          <p className='text-neutral-600 mt-1'>Manage your profile information and account details</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className='btn-outline inline-flex items-center'
          >
            <Edit2 className='h-4 w-4 mr-2' />
            Edit Profile
          </button>
        ) : (
          <div className='flex space-x-3'>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className='btn-outline'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className='btn-primary inline-flex items-center'
            >
              <Save className='h-4 w-4 mr-2' />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Photo */}
      <div className='flex items-center space-x-4 pb-6 border-b border-neutral-200'>
        <div className='relative'>
          <div className='w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center'>
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'Profile'}
                className='w-20 h-20 rounded-full object-cover'
              />
            ) : (
              <span className='text-2xl font-bold text-primary-600'>
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          {isEditing && (
            <button className='absolute -bottom-1 -right-1 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-colors'>
              <Camera className='h-4 w-4' />
            </button>
          )}
        </div>
        
        <div>
          <h3 className='font-semibold text-neutral-900'>{session?.user?.name}</h3>
          <p className='text-neutral-600'>{session?.user?.email}</p>
          <p className='text-sm text-neutral-500 mt-1'>
            Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className='space-y-4'>
        <h3 className='font-medium text-neutral-900'>Basic Information</h3>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Full Name
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={(e: any) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
              className='input-field'
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              <Mail className='inline h-4 w-4 mr-1' />
              Email Address
            </label>
            <input
              type='email'
              value={formData.email}
              disabled={true} // Email usually can't be changed
              className='input-field bg-neutral-50'
            />
            <p className='text-xs text-neutral-500 mt-1'>
              Contact support to change your email address
            </p>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Phone Number (Optional)
            </label>
            <input
              type='tel'
              value={formData.phone}
              onChange={(e: any) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              className='input-field'
              placeholder='+1 (555) 123-4567'
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              <MapPin className='inline h-4 w-4 mr-1' />
              Location
            </label>
            <input
              type='text'
              value={formData.location}
              onChange={(e: any) => handleInputChange('location', e.target.value)}
              disabled={!isEditing}
              className='input-field'
              placeholder='City, Country'
            />
          </div>
        </div>
        
        <div>
          <label className='block text-sm font-medium text-neutral-700 mb-2'>
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e: any) => handleInputChange('bio', e.target.value)}
            disabled={!isEditing}
            rows={3}
            className='input-field'
            placeholder='Tell others about yourself, your study interests, and goals...'
          />
        </div>
      </div>

      {/* Academic Information */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900'>Academic Information</h3>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              University/School
            </label>
            <input
              type='text'
              value={formData.university}
              onChange={(e: any) => handleInputChange('university', e.target.value)}
              disabled={!isEditing}
              className='input-field'
              placeholder='University of Example'
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Major/Field of Study
            </label>
            <input
              type='text'
              value={formData.major}
              onChange={(e: any) => handleInputChange('major', e.target.value)}
              disabled={!isEditing}
              className='input-field'
              placeholder='Computer Science'
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              <Calendar className='inline h-4 w-4 mr-1' />
              Academic Year
            </label>
            <select
              value={formData.year}
              onChange={(e: any) => handleInputChange('year', e.target.value)}
              disabled={!isEditing}
              className='input-field'
            >
              <option value=''>Select year</option>
              <option value='freshman'>Freshman</option>
              <option value='sophomore'>Sophomore</option>
              <option value='junior'>Junior</option>
              <option value='senior'>Senior</option>
              <option value='graduate'>Graduate Student</option>
              <option value='phd'>PhD Student</option>
              <option value='other'>Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900'>Social Links (Optional)</h3>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              LinkedIn Profile
            </label>
            <input
              type='url'
              value={formData.linkedinUrl}
              onChange={(e: any) => handleInputChange('linkedinUrl', e.target.value)}
              disabled={!isEditing}
              className='input-field'
              placeholder='https://linkedin.com/in/yourprofile'
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              GitHub Profile
            </label>
            <input
              type='url'
              value={formData.githubUrl}
              onChange={(e: any) => handleInputChange('githubUrl', e.target.value)}
              disabled={!isEditing}
              className='input-field'
              placeholder='https://github.com/yourusername'
            />
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className='bg-neutral-50 rounded-lg p-4 border-t border-neutral-200'>
        <h4 className='font-medium text-neutral-900 mb-2'>Account Status</h4>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-neutral-600'>Account Type:</span>
          <span className='font-medium text-primary-600'>Free Plan</span>
        </div>
        <div className='flex items-center justify-between text-sm mt-2'>
          <span className='text-neutral-600'>Email Verified:</span>
          <span className='font-medium text-accent-600'>✓ Verified</span>
        </div>
        <div className='flex items-center justify-between text-sm mt-2'>
          <span className='text-neutral-600'>Two-Factor Auth:</span>
          <span className='font-medium text-neutral-500'>Not Enabled</span>
        </div>
      </div>
    </div>
  )
}