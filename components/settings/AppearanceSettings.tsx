'use client'

import { useState, useEffect } from 'react'
import { Palette, Monitor, Sun, Moon, Smartphone, Type, Eye, Zap } from 'lucide-react'
import { useSettings } from '@/lib/contexts/SettingsContext'

export default function AppearanceSettings() {
  const { settings, updateAppearanceSettings, isLoading } = useSettings()
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings.appearance)

  useEffect(() => {
    setLocalSettings(settings.appearance)
  }, [settings.appearance])

  const handleSettingChange = async (key: string, value: any) => {
    const newSettings = {
      ...localSettings,
      [key]: value
    }
    
    // Optimistically update local settings first for immediate UI response
    setLocalSettings(newSettings)
    
    // Auto-save on change for immediate application
    try {
      setIsSaving(true)
      await updateAppearanceSettings({ [key]: value })
      
      // Immediately apply the setting to give instant feedback
      applySettingImmediately(key, value)
    } catch (error) {
      console.error('Failed to save appearance setting:', error)
      // Revert on error
      setLocalSettings(settings.appearance)
    } finally {
      setIsSaving(false)
    }
  }

  // Apply settings immediately for instant visual feedback
  const applySettingImmediately = (key: string, value: any) => {
    const root = document.documentElement
    
    switch (key) {
      case 'theme':
        if (value === 'dark') {
          root.classList.add('dark')
        } else if (value === 'light') {
          root.classList.remove('dark')
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          root.classList.toggle('dark', prefersDark)
        }
        // Store theme preference for immediate application
        localStorage.setItem('studybuddy-theme', value)
        break
      case 'font_size':
        const fontSizes = { small: '14px', medium: '16px', large: '18px', 'extra-large': '20px' }
        root.style.fontSize = fontSizes[value as keyof typeof fontSizes] || '16px'
        localStorage.setItem('studybuddy-font-size', value)
        break
      case 'high_contrast':
        root.classList.toggle('high-contrast', value)
        localStorage.setItem('studybuddy-high-contrast', value.toString())
        break
      case 'reduce_motion':
        root.classList.toggle('reduce-motion', value)
        localStorage.setItem('studybuddy-reduce-motion', value.toString())
        break
      case 'compact_mode':
        root.classList.toggle('compact-mode', value)
        localStorage.setItem('studybuddy-compact-mode', value.toString())
        break
      case 'focus_mode':
        root.classList.toggle('focus-mode', value)
        localStorage.setItem('studybuddy-focus-mode', value.toString())
        break
      case 'color_scheme':
        // Apply color scheme to CSS variables
        const colorSchemes = {
          blue: { primary: '#0ea5e9', secondary: '#0284c7' },
          green: { primary: '#10b981', secondary: '#059669' },
          purple: { primary: '#8b5cf6', secondary: '#7c3aed' },
          orange: { primary: '#f97316', secondary: '#ea580c' },
          red: { primary: '#ef4444', secondary: '#dc2626' }
        }
        const scheme = colorSchemes[value as keyof typeof colorSchemes]
        if (scheme) {
          root.style.setProperty('--color-primary', scheme.primary)
          root.style.setProperty('--color-secondary', scheme.secondary)
        }
        localStorage.setItem('studybuddy-color-scheme', value)
        break
    }
    
    // Trigger a visual feedback effect
    const settingName = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    const feedback = document.createElement('div')
    feedback.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300'
    feedback.textContent = `${settingName} applied instantly!`
    document.body.appendChild(feedback)
    
    setTimeout(() => {
      feedback.style.opacity = '0'
      setTimeout(() => document.body.removeChild(feedback), 300)
    }, 2000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateAppearanceSettings(localSettings)
    } catch (error) {
      console.error('Failed to save all appearance settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const colorSchemes = [
    { value: 'blue', label: 'Ocean Blue', color: 'bg-blue-500', preview: 'from-blue-400 to-blue-600' },
    { value: 'green', label: 'Forest Green', color: 'bg-green-500', preview: 'from-green-400 to-green-600' },
    { value: 'purple', label: 'Royal Purple', color: 'bg-purple-500', preview: 'from-purple-400 to-purple-600' },
    { value: 'orange', label: 'Sunset Orange', color: 'bg-orange-500', preview: 'from-orange-400 to-orange-600' },
    { value: 'red', label: 'Cherry Red', color: 'bg-red-500', preview: 'from-red-400 to-red-600' }
  ]

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-neutral-900'>Appearance</h2>
          <p className='text-neutral-600 mt-1'>Customize how Clerva looks and feels</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className='btn-primary'
        >
          {isSaving ? 'Saving...' : isLoading ? 'Loading...' : 'Save All Changes'}
        </button>
      </div>

      {/* Theme Selection */}
      <div className='space-y-4'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Palette className='h-5 w-5 mr-2' />
          Theme
        </h3>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {[
            { 
              value: 'light', 
              label: 'Light Theme', 
              description: 'Clean and bright interface',
              icon: Sun,
              preview: 'bg-white border-neutral-200'
            },
            { 
              value: 'dark', 
              label: 'Dark Theme', 
              description: 'Easy on the eyes for low-light use',
              icon: Moon,
              preview: 'bg-neutral-800 border-neutral-700'
            },
            { 
              value: 'system', 
              label: 'System Theme', 
              description: 'Follows your device settings',
              icon: Monitor,
              preview: 'bg-gradient-to-br from-white to-neutral-800'
            }
          ].map((theme: any) => {
            const Icon = theme.icon
            return (
              <button
                key={theme.value}
                onClick={() => handleSettingChange('theme', theme.value)}
                className={`p-4 text-left border-2 rounded-lg transition-colors ${
                  localSettings.theme === theme.value
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <div className={`w-full h-16 rounded-md mb-3 border ${theme.preview}`}></div>
                <div className='flex items-center space-x-2 mb-2'>
                  <Icon className='h-4 w-4 text-neutral-600' />
                  <span className='font-medium text-neutral-900'>{theme.label}</span>
                </div>
                <p className='text-sm text-neutral-600'>{theme.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Color Scheme */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900'>Color Scheme</h3>
        
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          {colorSchemes.map((scheme: any) => (
            <button
              key={scheme.value}
              onClick={() => handleSettingChange('color_scheme', scheme.value)}
              className={`p-4 text-center border-2 rounded-lg transition-colors ${
                localSettings.color_scheme === scheme.value
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 bg-gradient-to-r ${scheme.preview}`}></div>
              <div className='font-medium text-neutral-900 text-sm'>{scheme.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Type className='h-5 w-5 mr-2' />
          Typography
        </h3>
        
        <div>
          <label className='block text-sm font-medium text-neutral-700 mb-3'>Font Size</label>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            {[
              { value: 'small', label: 'Small', sample: 'text-sm' },
              { value: 'medium', label: 'Medium', sample: 'text-base' },
              { value: 'large', label: 'Large', sample: 'text-lg' },
              { value: 'extra-large', label: 'Extra Large', sample: 'text-xl' }
            ].map((size: any) => (
              <button
                key={size.value}
                onClick={() => handleSettingChange('font_size', size.value)}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  localSettings.font_size === size.value
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <div className={`font-medium text-neutral-900 mb-1 ${size.sample}`}>
                  {size.label}
                </div>
                <div className={`text-neutral-600 ${size.sample}`}>
                  Sample text
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Options */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Monitor className='h-5 w-5 mr-2' />
          Layout Options
        </h3>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {[
            { 
              value: 'default', 
              label: 'Default', 
              description: 'Standard sidebar with full navigation',
              preview: 'grid grid-cols-4 gap-1 h-12'
            },
            { 
              value: 'compact', 
              label: 'Compact', 
              description: 'Narrower sidebar with icons and labels',
              preview: 'grid grid-cols-5 gap-1 h-12'
            },
            { 
              value: 'minimal', 
              label: 'Minimal', 
              description: 'Icons only sidebar for more content space',
              preview: 'grid grid-cols-6 gap-1 h-12'
            }
          ].map((style: any) => (
            <button
              key={style.value}
              onClick={() => handleSettingChange('sidebar_style', style.value)}
              className={`p-4 text-left border-2 rounded-lg transition-colors ${
                localSettings.sidebar_style === style.value
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className={style.preview}>
                <div className='bg-neutral-300 rounded'></div>
                <div className='bg-neutral-100 rounded col-span-3'></div>
                <div className='bg-neutral-100 rounded col-span-3'></div>
                <div className='bg-neutral-100 rounded col-span-3'></div>
              </div>
              <div className='font-medium text-neutral-900 mt-3'>{style.label}</div>
              <div className='text-sm text-neutral-600'>{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility & Performance */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Eye className='h-5 w-5 mr-2' />
          Accessibility & Performance
        </h3>
        
        <div className='space-y-4'>
          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>High Contrast Mode</h4>
              <p className='text-sm text-neutral-600'>Increase contrast for better readability</p>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={localSettings.high_contrast}
                onChange={(e: any) => handleSettingChange('high_contrast', e.targetDate.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>

          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>Reduce Motion</h4>
              <p className='text-sm text-neutral-600'>Minimize animations and transitions</p>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={localSettings.reduce_motion}
                onChange={(e: any) => handleSettingChange('reduce_motion', e.targetDate.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>

          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>Smooth Animations</h4>
              <p className='text-sm text-neutral-600'>Enable smooth transitions and micro-interactions</p>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={localSettings.animations}
                onChange={(e: any) => handleSettingChange('animations', e.targetDate.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>
        </div>
      </div>

      {/* Display Options */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Smartphone className='h-5 w-5 mr-2' />
          Display Options
        </h3>
        
        <div className='space-y-4'>
          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>Show Profile Photos</h4>
              <p className='text-sm text-neutral-600'>Display profile pictures in messages and lists</p>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={localSettings.show_profile_photos}
                onChange={(e: any) => handleSettingChange('show_profile_photos', e.targetDate.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>

          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>Compact Mode</h4>
              <p className='text-sm text-neutral-600'>Reduce spacing and padding for more content</p>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={localSettings.compact_mode}
                onChange={(e: any) => handleSettingChange('compact_mode', e.targetDate.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>

          <div className='flex items-center justify-between p-4 border border-neutral-200 rounded-lg'>
            <div>
              <h4 className='font-medium text-neutral-900'>Focus Mode</h4>
              <p className='text-sm text-neutral-600'>Hide distracting elements during study sessions</p>
            </div>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={localSettings.focus_mode}
                onChange={(e: any) => handleSettingChange('focus_mode', e.targetDate.checked)}
                className='sr-only peer'
              />
              <div className='relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'></div>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className='bg-neutral-50 rounded-lg p-6 border-t border-neutral-200'>
        <h4 className='font-medium text-neutral-900 mb-4'>Preview</h4>
        <div className='space-y-3'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-neutral-600'>Current theme:</span>
            <span className='font-medium capitalize'>{localSettings.theme}</span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-neutral-600'>Color scheme:</span>
            <span className='font-medium capitalize'>{localSettings.color_scheme}</span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-neutral-600'>Font size:</span>
            <span className='font-medium capitalize'>{localSettings.font_size}</span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-neutral-600'>Layout style:</span>
            <span className='font-medium capitalize'>{localSettings.sidebar_style}</span>
          </div>
        </div>
        
        <div className='mt-4 p-4 bg-white rounded-lg border'>
          <div className='text-sm text-neutral-600 mb-2'>Preview will be applied after saving</div>
          <div className='flex space-x-2'>
            <div className={`w-4 h-4 rounded-full ${colorSchemes.find(c => c.value === localSettings.color_scheme)?.color}`}></div>
            <div className='text-sm font-medium'>Sample interface element</div>
          </div>
        </div>
      </div>
    </div>
  )
}