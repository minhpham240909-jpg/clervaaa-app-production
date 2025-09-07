// Settings Applicator - Ensures all settings changes are immediately applied across the app
import { toast } from 'react-hot-toast'

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  color_scheme: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  font_size: 'small' | 'medium' | 'large' | 'extra-large'
  sidebar_style: 'default' | 'compact' | 'minimal'
  animations: boolean
  high_contrast: boolean
  reduce_motion: boolean
  show_profile_photos: boolean
  compact_mode: boolean
  focus_mode: boolean
}

interface NotificationSettings {
  email_enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
  sound_enabled: boolean
  do_not_disturb: boolean
  quiet_hours_start: string
  quiet_hours_end: string
}

interface StudyPreferences {
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  preferred_time: 'morning' | 'afternoon' | 'evening' | 'night'
  session_duration: number
  break_frequency: number
  group_size_preference: 'individual' | 'small' | 'medium' | 'large'
  study_environment: 'quiet' | 'background_music' | 'ambient' | 'collaborative'
  auto_scheduling: boolean
}

class SettingsApplicator {
  private static instance: SettingsApplicator
  private isInitialized = false

  static getInstance(): SettingsApplicator {
    if (!SettingsApplicator.instance) {
      SettingsApplicator.instance = new SettingsApplicator()
    }
    return SettingsApplicator.instance
  }

  initialize() {
    if (this.isInitialized) return

    // Listen for settings updates from any component
    window.addEventListener('settingsUpdated', this.handleSettingsUpdate.bind(this))
    
    // Apply stored settings on page load
    this.applyStoredSettings()
    
    this.isInitialized = true
  }

  private handleSettingsUpdate(event: CustomEvent) {
    const { section, newSettings } = event.detail
    
    switch (section) {
      case 'appearance':
        this.applyAppearanceSettings(newSettings)
        break
      case 'notifications':
        this.applyNotificationSettings(newSettings)
        break
      case 'study':
        this.applyStudySettings(newSettings)
        break
    }
  }

  private applyStoredSettings() {
    // Apply theme immediately on page load
    const storedTheme = localStorage.getItem('studybuddy-theme')
    if (storedTheme) {
      this.applyTheme(storedTheme as AppearanceSettings['theme'])
    }

    // Apply other stored appearance settings
    const storedFontSize = localStorage.getItem('studybuddy-font-size')
    if (storedFontSize) {
      this.applyFontSize(storedFontSize as AppearanceSettings['font_size'])
    }

    const storedColorScheme = localStorage.getItem('studybuddy-color-scheme')
    if (storedColorScheme) {
      this.applyColorScheme(storedColorScheme as AppearanceSettings['color_scheme'])
    }

    // Apply accessibility settings
    const highContrast = localStorage.getItem('studybuddy-high-contrast') === 'true'
    if (highContrast) document.documentElement.classList.add('high-contrast')

    const reduceMotion = localStorage.getItem('studybuddy-reduce-motion') === 'true'
    if (reduceMotion) document.documentElement.classList.add('reduce-motion')

    const compactMode = localStorage.getItem('studybuddy-compact-mode') === 'true'
    if (compactMode) document.documentElement.classList.add('compact-mode')

    const focusMode = localStorage.getItem('studybuddy-focus-mode') === 'true'
    if (focusMode) document.documentElement.classList.add('focus-mode')
  }

  applyAppearanceSettings(settings: Partial<AppearanceSettings>) {
    Object.entries(settings).forEach(([key, value]) => {
      switch (key) {
        case 'theme':
          this.applyTheme(value as AppearanceSettings['theme'])
          break
        case 'color_scheme':
          this.applyColorScheme(value as AppearanceSettings['color_scheme'])
          break
        case 'font_size':
          this.applyFontSize(value as AppearanceSettings['font_size'])
          break
        case 'high_contrast':
          this.applyHighContrast(value as boolean)
          break
        case 'reduce_motion':
          this.applyReduceMotion(value as boolean)
          break
        case 'compact_mode':
          this.applyCompactMode(value as boolean)
          break
        case 'focus_mode':
          this.applyFocusMode(value as boolean)
          break
        case 'animations':
          this.applyAnimations(value as boolean)
          break
        case 'sidebar_style':
          this.applySidebarStyle(value as AppearanceSettings['sidebar_style'])
          break
      }
    })

    this.showFeedback('Appearance settings applied!')
  }

  applyNotificationSettings(settings: Partial<NotificationSettings>) {
    // Apply notification preferences
    if ('sound_enabled' in settings) {
      // Update global sound preference
      window.localStorage.setItem('studybuddy-sound-enabled', settings.sound_enabled!.toString())
    }

    if ('do_not_disturb' in settings) {
      // Update do not disturb mode
      window.localStorage.setItem('studybuddy-do-not-disturb', settings.do_not_disturb!.toString())
      this.applyDoNotDisturbMode(settings.do_not_disturb!)
    }

    this.showFeedback('Notification preferences updated!')
  }

  applyStudySettings(settings: Partial<StudyPreferences>) {
    // Apply study preferences that affect UI
    if ('auto_scheduling' in settings) {
      // Update auto-scheduling preference
      window.localStorage.setItem('studybuddy-auto-scheduling', settings.auto_scheduling!.toString())
    }

    if ('learning_style' in settings) {
      // Apply learning style visual cues
      document.documentElement.setAttribute('data-learning-style', settings.learning_style!)
    }

    this.showFeedback('Study preferences updated!')
  }

  private applyTheme(theme: AppearanceSettings['theme']) {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    }
    
    localStorage.setItem('studybuddy-theme', theme)
  }

  private applyColorScheme(colorScheme: AppearanceSettings['color_scheme']) {
    const colorSchemes = {
      blue: { primary: '#0ea5e9', secondary: '#0284c7', accent: '#06b6d4' },
      green: { primary: '#10b981', secondary: '#059669', accent: '#14b8a6' },
      purple: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a855f7' },
      orange: { primary: '#f97316', secondary: '#ea580c', accent: '#f59e0b' },
      red: { primary: '#ef4444', secondary: '#dc2626', accent: '#f97316' }
    }

    const scheme = colorSchemes[colorScheme]
    if (scheme) {
      const root = document.documentElement
      root.style.setProperty('--color-primary', scheme.primary)
      root.style.setProperty('--color-secondary', scheme.secondary)
      root.style.setProperty('--color-accent', scheme.accent)
      root.setAttribute('data-color-scheme', colorScheme)
    }
    
    localStorage.setItem('studybuddy-color-scheme', colorScheme)
  }

  private applyFontSize(fontSize: AppearanceSettings['font_size']) {
    const fontSizes = { 
      small: '14px', 
      medium: '16px', 
      large: '18px', 
      'extra-large': '20px' 
    }
    
    document.documentElement.style.fontSize = fontSizes[fontSize] || '16px'
    localStorage.setItem('studybuddy-font-size', fontSize)
  }

  private applyHighContrast(enabled: boolean) {
    document.documentElement.classList.toggle('high-contrast', enabled)
    localStorage.setItem('studybuddy-high-contrast', enabled.toString())
  }

  private applyReduceMotion(enabled: boolean) {
    document.documentElement.classList.toggle('reduce-motion', enabled)
    localStorage.setItem('studybuddy-reduce-motion', enabled.toString())
  }

  private applyCompactMode(enabled: boolean) {
    document.documentElement.classList.toggle('compact-mode', enabled)
    localStorage.setItem('studybuddy-compact-mode', enabled.toString())
  }

  private applyFocusMode(enabled: boolean) {
    document.documentElement.classList.toggle('focus-mode', enabled)
    localStorage.setItem('studybuddy-focus-mode', enabled.toString())
  }

  private applyAnimations(enabled: boolean) {
    document.documentElement.classList.toggle('no-animations', !enabled)
    localStorage.setItem('studybuddy-animations', enabled.toString())
  }

  private applySidebarStyle(style: AppearanceSettings['sidebar_style']) {
    document.documentElement.setAttribute('data-sidebar-style', style)
    localStorage.setItem('studybuddy-sidebar-style', style)
  }

  private applyDoNotDisturbMode(enabled: boolean) {
    document.documentElement.classList.toggle('do-not-disturb', enabled)
    
    if (enabled) {
      // Disable all non-critical notifications
      this.showFeedback('Do Not Disturb mode enabled', 'info')
    } else {
      this.showFeedback('Do Not Disturb mode disabled', 'info')
    }
  }

  private showFeedback(message: string, type: 'success' | 'info' = 'success') {
    if (type === 'success') {
      toast.success(message)
    } else {
      toast(message, { icon: 'ℹ️' })
    }
  }

  // Public method to manually apply all settings
  applyAllSettings(settings: {
    appearance?: Partial<AppearanceSettings>
    notifications?: Partial<NotificationSettings>
    study?: Partial<StudyPreferences>
  }) {
    if (settings.appearance) {
      this.applyAppearanceSettings(settings.appearance)
    }
    if (settings.notifications) {
      this.applyNotificationSettings(settings.notifications)
    }
    if (settings.study) {
      this.applyStudySettings(settings.study)
    }
  }
}

// Export singleton instance
export const settingsApplicator = SettingsApplicator.getInstance()

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => settingsApplicator.initialize())
  } else {
    settingsApplicator.initialize()
  }
}