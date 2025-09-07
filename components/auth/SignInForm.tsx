'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookOpen, Loader2, Shield, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, User, Mail, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { signIn } from 'next-auth/react'

export default function SignInForm({ session }: { session?: any }) {
  const searchParams = useSearchParams()
  const {
    isLoading,
    providers,
    error,
    selectedProvider,
    signInWithProvider,
    clearError,
    retrySignIn
  } = useAuth()

  // Form state
  const [isSignUp, setIsSignUp] = useState(false)

  // Set initial mode based on URL parameter
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'signup') {
      setIsSignUp(true)
    } else if (mode === 'login') {
      setIsSignUp(false)
    }
  }, [searchParams])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const googleSignIn = () => signInWithProvider('google')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formError) setFormError('')
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError('')

    try {
      if (isSignUp) {
        // Validate confirm password
        if (formData.password !== formData.confirmPassword) {
          setFormError('Passwords do not match')
          setIsSubmitting(false)
          return
        }

        // Create account
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create account')
        }

        // Auto sign in after successful signup
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setFormError('Account created but failed to sign in. Please try signing in manually.')
        } else {
          // Redirect will be handled by NextAuth
          window.location.href = '/dashboard'
        }
      } else {
        // Sign in
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setFormError('Invalid email or password')
        } else {
          // Redirect will be handled by NextAuth
          window.location.href = '/dashboard'
        }
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If user is already signed in, show a different message
  if (session) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='card max-w-md w-full mx-auto text-center'
      >
        <div className='mb-8'>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className='flex items-center justify-center mb-6'
          >
            <div className='relative'>
              <BookOpen className='h-16 w-16 text-green-500' />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className='absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'
              >
                <CheckCircle className='w-4 h-4 text-white' />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='text-3xl font-bold font-heading text-neutral-900 mb-3'
          >
            Welcome back!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='text-neutral-600 text-lg mb-6'
          >
            You're already signed in as {session.user?.name || session.user?.email}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='space-y-4'
          >
            <a 
              href='/dashboard' 
              className='btn-primary w-full inline-block text-center'
            >
              Go to Dashboard
            </a>
            <a 
              href='/' 
              className='btn-outline w-full inline-block text-center'
            >
              Back to Homepage
            </a>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='card max-w-md w-full mx-auto'
    >
      {/* Header Section */}
      <div className='text-center mb-8'>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className='flex items-center justify-center mb-6'
        >
          <div className='relative'>
            <BookOpen className='h-16 w-16 text-primary-500' />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className='absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'
            >
              <CheckCircle className='w-4 h-4 text-white' />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='text-3xl font-bold font-heading text-neutral-900 mb-3'
        >
          {isSignUp ? 'Sign Up' : 'Log In'}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='text-neutral-600 text-lg'
        >
          {isSignUp 
            ? 'Create your account to access the study dashboard' 
            : 'Welcome back! Please sign in to your account'
          }
        </motion.p>
      </div>

      {/* Enhanced Error Message */}
      <AnimatePresence>
        {(error || formError) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'
          >
            <div className='flex items-start'>
              <AlertCircle className='w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0' />
              <div className='flex-1'>
                <p className='text-red-700 text-sm font-medium mb-1'>
                  {formError || error?.message}
                </p>
                {error?.details && (
                  <p className='text-red-600 text-xs mb-3'>{error.details}</p>
                )}
                <div className='flex space-x-2'>
                  {error && (
                    <button
                      onClick={retrySignIn}
                      className='text-red-600 hover:text-red-800 text-xs font-medium flex items-center'
                    >
                      <RefreshCw className='w-3 h-3 mr-1' />
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={() => {
                      clearError()
                      setFormError('')
                    }}
                    className='text-red-600 hover:text-red-800 text-xs font-medium'
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentication Form */}
      <div className='space-y-6'>
        {/* Section Header */}
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-full'>
            <div className='flex-grow border-t border-neutral-300'></div>
            <span className='flex-shrink mx-4 text-neutral-600 font-medium text-sm'>
              {isSignUp ? 'Create New Account' : 'Sign In to Your Account'}
            </span>
            <div className='flex-grow border-t border-neutral-300'></div>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsSubmit} className='space-y-4'>
          {/* Full Name Field (Sign Up Only) */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='relative'
            >
              <User className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400' />
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Full Name'
                required={isSignUp}
                className='w-full pl-10 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors duration-200 bg-white text-neutral-900 placeholder-neutral-500'
              />
            </motion.div>
          )}

          {/* Email Field */}
          <div className='relative'>
            <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400' />
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              placeholder='Email Address'
              required
              className='w-full pl-10 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors duration-200 bg-white text-neutral-900 placeholder-neutral-500'
            />
          </div>

          {/* Password Field */}
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400' />
            <input
              type={showPassword ? 'text' : 'password'}
              name='password'
              value={formData.password}
              onChange={handleInputChange}
              placeholder='Password'
              required
              className='w-full pl-10 pr-12 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors duration-200 bg-white text-neutral-900 placeholder-neutral-500'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600'
            >
              {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
            </button>
          </div>

          {/* Confirm Password Field (Sign Up Only) */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='relative'
            >
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400' />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder='Confirm Password'
                required={isSignUp}
                className='w-full pl-10 pr-12 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors duration-200 bg-white text-neutral-900 placeholder-neutral-500'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600'
              >
                {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            </motion.div>
          )}

          {/* Password Requirements (Sign Up Only) */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='text-xs text-neutral-600 space-y-1'
            >
              <p>Password must contain:</p>
              <ul className='list-disc list-inside ml-2 space-y-1'>
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
              </ul>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type='submit'
            disabled={isSubmitting}
            className='w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                {isSignUp ? 'Creating Account...' : 'Logging In...'}
              </>
            ) : (
              isSignUp ? 'Sign Up' : 'Log In'
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-neutral-200' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-neutral-500'>or</span>
          </div>
        </div>

        {/* Google Sign-in Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={googleSignIn}
          disabled={isLoading}
          className='w-full group relative flex items-center justify-center px-6 py-3 border-2 border-neutral-200 rounded-xl text-neutral-700 bg-white hover:bg-neutral-50 hover:border-primary-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md'
          aria-label='Sign in with Google'
        >
          {isLoading && selectedProvider === 'google' ? (
            <Loader2 className='w-5 h-5 mr-3 animate-spin text-primary-500' />
          ) : (
            <svg className='w-6 h-6 mr-3' viewBox='0 0 24 24'>
              <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
              <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
              <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
              <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
            </svg>
          )}
          <span className='font-medium'>
            {isLoading && selectedProvider === 'google' ? 'Signing in...' : 'Continue with Google'}
          </span>
          
          {/* Hover effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
        </motion.button>

        {/* Toggle Sign In/Sign Up */}
        <div className='text-center'>
          <button
            type='button'
            onClick={() => {
              setIsSignUp(!isSignUp)
              setFormError('')
              setFormData({ name: '', email: '', password: '', confirmPassword: '' })
            }}
            className='text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200'
          >
            {isSignUp 
              ? 'Already have an account? Log In' 
              : "Don't have an account? Sign Up"
            }
          </button>
        </div>
      </div>

      {/* Security Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className='mt-6 p-4 bg-green-50 border border-green-200 rounded-lg'
      >
        <div className='flex items-center justify-center'>
          <Shield className='w-5 h-5 text-green-600 mr-2' />
          <span className='text-green-700 text-sm font-medium'>
            Secure OAuth 2.0 Authentication
          </span>
        </div>
      </motion.div>

      {/* Terms and Privacy */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className='mt-6 text-center text-sm text-neutral-500'
      >
        By signing in, you agree to our{' '}
        <a href='#' className='text-primary-600 hover:underline font-medium'>
          Terms of Service
        </a>{' '}
        and{' '}
        <a href='#' className='text-primary-600 hover:underline font-medium'>
          Privacy Policy
        </a>
      </motion.div>

      {/* Back to Home Link */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className='mt-6 text-center'
      >
        <a 
          href='/' 
          className='text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline transition-colors duration-200 inline-flex items-center'
        >
          ← Back to Homepage
        </a>
      </motion.div>

      {/* Dashboard Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className='mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200'
      >
        <h3 className='text-sm font-bold text-primary-900 mb-2'>After signing in, you'll get access to:</h3>
        <div className='space-y-2 text-xs text-primary-700'>
          <div className='flex items-center'>
            <div className='w-2 h-2 bg-primary-500 rounded-full mr-2'></div>
            <span>AI-powered study partner matching</span>
          </div>
          <div className='flex items-center'>
            <div className='w-2 h-2 bg-secondary-500 rounded-full mr-2'></div>
            <span>Personalized study dashboard</span>
          </div>
          <div className='flex items-center'>
            <div className='w-2 h-2 bg-accent-500 rounded-full mr-2'></div>
            <span>Smart study analytics & recommendations</span>
          </div>
          <div className='flex items-center'>
            <div className='w-2 h-2 bg-purple-500 rounded-full mr-2'></div>
            <span>Real-time messaging with study partners</span>
          </div>
        </div>
      </motion.div>

      {/* Additional Security Info */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className='mt-4 text-center text-xs text-neutral-400'
      >
        <p>🔒 Your data is protected with industry-standard encryption</p>
        <p>⚡ Quick sign-in with your existing account</p>
        <p>🎯 Find study partners in seconds</p>
      </motion.div>
    </motion.div>
  )
}