'use client'

import { useSettings } from '@/lib/contexts/SettingsContext'
import { useEffect } from 'react'

export const useAppliedSettings = () => {
  const { settings } = useSettings()

  useEffect(() => {
    // Apply theme
    const root = document.documentElement
    const { theme, color_scheme, font_size, high_contrast, reduce_motion, compact_mode, focus_mode } = settings.appearance

    // Apply theme
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    // Apply color scheme
    root.style.setProperty('--color-primary', getColorSchemeValue(color_scheme))
    root.setAttribute('data-color-scheme', color_scheme)

    // Apply font size
    root.setAttribute('data-font-size', font_size)
    switch (font_size) {
      case 'small':
        root.style.fontSize = '14px'
        break
      case 'medium':
        root.style.fontSize = '16px'
        break
      case 'large':
        root.style.fontSize = '18px'
        break
      case 'extra-large':
        root.style.fontSize = '20px'
        break
    }

    // Apply accessibility settings
    if (high_contrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (reduce_motion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Apply layout settings
    if (compact_mode) {
      root.classList.add('compact-mode')
    } else {
      root.classList.remove('compact-mode')
    }

    if (focus_mode) {
      root.classList.add('focus-mode')
    } else {
      root.classList.remove('focus-mode')
    }

    // Apply sidebar style
    root.setAttribute('data-sidebar-style', settings.appearance.sidebar_style)
  }, [settings.appearance])

  return settings
}

const getColorSchemeValue = (scheme: string) => {
  const colorMap = {
    blue: '#0ea5e9',
    green: '#22c55e',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    red: '#ef4444'
  }
  return colorMap[scheme as keyof typeof colorMap] || colorMap.blue
}