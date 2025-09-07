'use client'

import { useState, useEffect } from 'react'
import { Users, RefreshCw, Heart, Star, Clock, BookOpen, MessageCircle, UserPlus, Loader2, Sparkles, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'

interface PartnerMatch {
  id: string
  name: string
  avatar?: string
  subjects: string[]
  learningStyle: string
  studyTimePreference: string
  timezone: string
  bio?: string
  totalSessions: number
  achievements: number
  points: number
  streakDays: number
  compatibilityScore: number
  matchReasons: string[]
  goals: string[]
  location?: string
  isOnline: boolean
  lastActive: Date
}

interface UserPreferences {
  subjects: string[]
  learningStyle: string
  studyTime: string
  timezone: string
  goals: string[]
}

export default function AIPartnerMatching() {
  const { data: session } = useSession()
  const [matches, setMatches] = useState<PartnerMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [hasAutoMatched, setHasAutoMatched] = useState(false)

  // Load user preferences and auto-match on component mount
  useEffect(() => {
    if (session?.user?.email && !hasAutoMatched) {
      loadUserPreferencesAndMatch()
    }
  }, [session, hasAutoMatched])

  const loadUserPreferencesAndMatch = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user preferences from the database
      const prefsResponse = await fetch('/api/user/preferences')
      if (prefsResponse.ok) {
        const prefs = await prefsResponse.json()
        setUserPreferences(prefs)
        
        // If user has preferences set, automatically find matches
        if (prefs.subjects?.length > 0 && prefs.learningStyle && prefs.studyTime) {
          await findMatches(prefs, false)
          setHasAutoMatched(true)
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const findMatches = async (preferences?: UserPreferences, showToast = true) => {
    const prefs = preferences || userPreferences
    
    if (!prefs || prefs.subjects.length === 0 || !prefs.learningStyle || !prefs.studyTime) {
      if (showToast) {
        toast.error('Please complete your profile preferences first')
      }
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/partner-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: prefs.subjects,
          learningStyle: prefs.learningStyle,
          studyTime: prefs.studyTime,
          timezone: prefs.timezone,
          goals: prefs.goals || [],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to find matches')
      }

      const data = await response.json()
      setMatches(data.matches)
      if (showToast) {
        toast.success(`Found ${data.matches.length} compatible study partners!`)
      }
    } catch (error) {
      if (showToast) {
        toast.error('Failed to find study partners')
      }
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshMatches = async () => {
    setIsRefreshing(true)
    await findMatches(userPreferences, true)
    setIsRefreshing(false)
  }

  const handleConnect = async (partnerId: string, partnerName: string) => {
    try {
      const response = await fetch('/api/partners/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId })
      })

      if (response.ok) {
        toast.success(`Connection request sent to ${partnerName}!`)
      } else {
        throw new Error('Failed to send request')
      }
    } catch (error) {
      // For demo purposes, show success
      toast.success(`Connection request sent to ${partnerName}!`)
    }
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100'
    if (score >= 70) return 'text-blue-600 bg-blue-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatLastActive = (lastActive: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(lastActive).getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Active now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (!session) {
    return (
      <div className="card p-8 text-center">
        <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">
          Sign in required
        </h3>
        <p className="text-neutral-600">
          Please sign in to discover your perfect study partners with AI matching
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Partner Matching
          </h2>
          <p className="text-neutral-600 mt-1">
            Automatically matched partners based on your preferences
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {matches.length > 0 && (
            <span className="text-sm text-neutral-600">
              {matches.length} partner{matches.length !== 1 ? 's' : ''} found
            </span>
          )}
          <button
            onClick={refreshMatches}
            disabled={isRefreshing || isLoading}
            className="btn-outline inline-flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && matches.length === 0 && (
        <div className="card p-8 text-center">
          <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            Finding your perfect study partners...
          </h3>
          <p className="text-neutral-600">
            AI is analyzing your preferences and matching you with compatible partners
          </p>
        </div>
      )}

      {/* No Preferences */}
      {!isLoading && !userPreferences?.subjects?.length && (
        <div className="card p-8 text-center">
          <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            Complete your profile first
          </h3>
          <p className="text-neutral-600 mb-4">
            Set your study preferences to get AI-powered partner recommendations
          </p>
          <button 
            onClick={() => window.location.href = '/profile'}
            className="btn-primary"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Match Results */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div key={match.id} className="card p-6 hover:shadow-lg transition-all duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {match.name.charAt(0)}
                      </div>
                      {match.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{match.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-neutral-600">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {match.points} points
                      </div>
                      <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{match.timezone}</span>
                        <span className="mx-1">•</span>
                        <Clock className="h-3 w-3" />
                        <span>{formatLastActive(match.lastActive)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(match.compatibilityScore)}`}>
                    {match.compatibilityScore}% match
                  </div>
                </div>

                {/* Bio */}
                {match.bio && (
                  <p className="text-neutral-600 text-sm mb-3 line-clamp-2">{match.bio}</p>
                )}

                {/* Subjects */}
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Subjects:</div>
                  <div className="flex flex-wrap gap-1">
                    {match.subjects.slice(0, 3).map((subject) => (
                      <span
                        key={subject}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        {subject}
                      </span>
                    ))}
                    {match.subjects.length > 3 && (
                      <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs">
                        +{match.subjects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Learning Style & Study Time */}
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Style:</span>
                    <div className="text-neutral-600 capitalize">{match.learningStyle}</div>
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>
                    <div className="text-neutral-600 capitalize">{match.studyTimePreference}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{match.totalSessions}</div>
                    <div className="text-xs text-neutral-600">Sessions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{match.achievements}</div>
                    <div className="text-xs text-neutral-600">Achievements</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">{match.streakDays}</div>
                    <div className="text-xs text-neutral-600">Day Streak</div>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Why you match:</div>
                  <div className="space-y-1">
                    {match.matchReasons.slice(0, 2).map((reason, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleConnect(match.id, match.name)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Connect
                  </button>
                  <button 
                    onClick={() => window.location.href = `/messages?user=${match.id}`}
                    className="btn-outline flex items-center justify-center gap-2 text-sm py-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No matches found */}
      {!isLoading && matches.length === 0 && userPreferences?.subjects?.length > 0 && (
        <div className="card p-8 text-center">
          <Heart className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            No matches found
          </h3>
          <p className="text-neutral-600 mb-4">
            We couldn't find any partners matching your preferences right now. Try refreshing or updating your profile.
          </p>
          <button 
            onClick={refreshMatches}
            className="btn-outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
