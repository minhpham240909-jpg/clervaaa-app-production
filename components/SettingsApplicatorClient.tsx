'use client'

import { useEffect } from 'react'
import { settingsApplicator } from '@/lib/utils/settingsApplicator'

export default function SettingsApplicatorClient() {
  useEffect(() => {
    // Initialize the settings applicator on the client side
    settingsApplicator.initialize()
  }, [])

  return null // This component only handles initialization
}