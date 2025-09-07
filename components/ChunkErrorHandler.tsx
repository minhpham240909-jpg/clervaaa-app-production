'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function ChunkErrorHandler() {
  useEffect(() => {
    // Global error handler for chunk loading errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message)
      
      if (
        error.name === 'ChunkLoadError' || 
        event.message?.includes('Loading chunk') ||
        event.message?.includes('Failed to import')
      ) {
        logger.error('Global chunk loading error detected', error, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          userAgent: navigator.userAgent
        })
        
        // Clear any cached chunks and reload
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              if (name.includes('next-static') || name.includes('webpack')) {
                caches.delete(name)
              }
            })
          }).then(() => {
            if (typeof window !== 'undefined') {
              (window as any).timezone.reload()
            }
          })
        } else {
          if (typeof window !== 'undefined') {
            (window as any).timezone.reload()
          }
        }
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      
      if (
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to import')
      ) {
        logger.error('Global chunk loading promise rejection', error)
        event.preventDefault() // Prevent the default unhandled rejection behavior
        window.location.reload()
      }
    }

    // Add event listeners
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null // This component doesn't render anything
}