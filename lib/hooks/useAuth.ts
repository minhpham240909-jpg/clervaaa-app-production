import { useState, useEffect } from 'react'
import { signIn, getProviders } from 'next-auth/react'
import { toast } from 'react-hot-toast'

export interface AuthError {
  type: 'network' | 'oauth' | 'validation' | 'unknown'
  message: string
  details?: string
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [providers, setProviders] = useState<any>(null)
  const [error, setError] = useState<AuthError | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const res = await getProviders()
      setProviders(res)
    } catch (err) {
      console.error('Failed to fetch providers', err)
      setError({
        type: 'network',
        message: 'Unable to load sign-in options',
        details: 'Please check your internet connection and refresh the page.'
      })
    }
  }

  const signInWithProvider = async (provider: string) => {
    setIsLoading(true)
    setError(null)
    setSelectedProvider(provider)

    try {
      // Show loading toast
      const loadingToast = toast.loading(`Signing in with ${provider}...`)

      const result = await signIn(provider, {
        callbackUrl: '/dashboard',
        redirect: false // Prevent automatic redirect to give us more control
      })

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Handle the result properly
      if (result?.error) {
        // Handle specific OAuth errors
        let errorMessage = 'Sign-in failed. Please try again.'
        let errorType: AuthError['type'] = 'oauth'

        switch (result.error) {
          case 'OAuthSignin':
            errorMessage = 'OAuth sign-in initialization failed.'
            break
          case 'OAuthCallback':
            errorMessage = 'OAuth callback failed. Please try again.'
            break
          case 'OAuthCreateAccount':
            errorMessage = 'Unable to create account. Please try again.'
            break
          case 'EmailCreateAccount':
            errorMessage = 'Unable to create account with email.'
            break
          case 'Callback':
            errorMessage = 'Authentication callback failed.'
            break
          case 'OAuthAccountNotLinked':
            errorMessage = 'This account is already linked to another sign-in method.'
            errorType = 'validation'
            break
          case 'EmailSignin':
            errorMessage = 'Email sign-in failed.'
            break
          case 'CredentialsSignin':
            errorMessage = 'Invalid credentials.'
            errorType = 'validation'
            break
          case 'SessionRequired':
            errorMessage = 'Session required. Please sign in again.'
            break
          default:
            errorMessage = result.error
        }

        setError({
          type: errorType,
          message: errorMessage,
          details: 'Please check your credentials and try again.'
        })

        toast.error(errorMessage)
      } else if (result?.ok) {
        // Successful sign-in - redirect manually
        toast.success('Successfully signed in!')
        
        // Check if user should go to founder dashboard
        const founderEmails = (process.env.NEXT_PUBLIC_FOUNDER_EMAILS || '').split(',').map((e: any) => e.trim()).filter((e: any) => e.length > 0)
        
        // For now, just redirect to result URL or dashboard
        window.location.href = result.url || '/dashboard'
      }
    } catch (err) {
      console.error('Sign in error', err)
      setError({
        type: 'unknown',
        message: 'An unexpected error occurred',
        details: 'Please try again or contact support if the problem persists.'
      })
      toast.error('Sign-in failed. Please try again.')
    } finally {
      setIsLoading(false)
      setSelectedProvider(null)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const retrySignIn = () => {
    if (selectedProvider) {
      signInWithProvider(selectedProvider)
    }
  }

  return {
    isLoading,
    providers,
    error,
    selectedProvider,
    signInWithProvider,
    clearError,
    retrySignIn,
    fetchProviders
  }
}
