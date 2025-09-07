'use client'

import { useState } from 'react'
import { Users, Heart, Star, Clock, BookOpen, MessageCircle, UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PartnerMatch {
  id: string
  name: string
  avatar?: string
  subjects: string[]
  learningStyle: string
  studyTimePreference: string
  bio?: string
  totalSessions: number
  achievements: number
  points: number
  streakDays: number
  compatibilityScore: number
  matchReasons: string[]
}

export default function PartnerMatching() {
  const [matches, setMatches] = useState<PartnerMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Preferences form
  const [subjects, setSubjects] = useState<string[]>([])
  const [newSubject, setNewSubject] = useState('')
  const [learningStyle, setLearningStyle] = useState('')
  const [studyTime, setStudyTime] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [newGoal, setNewGoal] = useState('')

  const findMatches = async () => {
    if (subjects.length === 0 || !learningStyle || !studyTime) {
      toast.error('Please fill in all preferences')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/partner-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          learningStyle,
          studyTime,
          goals,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to find matches')
      }

      const data = await response.json()
      setMatches(data.matches)
      toast.success(`Found ${data.matches.length} compatible study partners!`)
    } catch (error) {
      toast.error('Failed to find study partners')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()])
      setNewSubject('')
    }
  }

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter((s: any) => s !== subject))
  }

  const addGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      setGoals([...goals, newGoal.trim()])
      setNewGoal('')
    }
  }

  const removeGoal = (goal: string) => {
    setGoals(goals.filter((g: any) => g !== goal))
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          AI Partner Matching
        </h1>
        <p className="text-neutral-600">
          Find your perfect study partner using AI-powered compatibility matching
        </p>
      </div>

      {/* Preferences Form */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Your Study Preferences
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium mb-2">Subjects of Interest</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e: any) => setNewSubject(e.target.value)}
                onKeyPress={(e: any) => e.key === 'Enter' && addSubject()}
                placeholder="e.g., Mathematics, Physics, History"
                className="flex-1 p-2 border border-neutral-300 rounded-lg"
              />
              <button
                onClick={addSubject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject: any) => (
                <span
                  key={subject}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {subject}
                  <button
                    onClick={() => removeSubject(subject)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Learning Style */}
          <div>
            <label className="block text-sm font-medium mb-2">Learning Style</label>
            <select
              value={learningStyle}
              onChange={(e: any) => setLearningStyle(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg"
            >
              <option value="">Select your learning style</option>
              <option value="visual">Visual - Charts, diagrams, images</option>
              <option value="auditory">Auditory - Discussions, lectures</option>
              <option value="kinesthetic">Kinesthetic - Hands-on activities</option>
              <option value="reading">Reading/Writing - Notes, texts</option>
            </select>
          </div>

          {/* Study Time Preference */}
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Study Time</label>
            <select
              value={studyTime}
              onChange={(e: any) => setStudyTime(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg"
            >
              <option value="">Select preferred time</option>
              <option value="morning">Morning (6 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
              <option value="evening">Evening (6 PM - 10 PM)</option>
              <option value="night">Night (10 PM - 2 AM)</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium mb-2">Study Goals</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e: any) => setNewGoal(e.target.value)}
                onKeyPress={(e: any) => e.key === 'Enter' && addGoal()}
                placeholder="e.g., Prepare for SAT, Improve GPA"
                className="flex-1 p-2 border border-neutral-300 rounded-lg"
              />
              <button
                onClick={addGoal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {goals.map((goal: any) => (
                <span
                  key={goal}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {goal}
                  <button
                    onClick={() => removeGoal(goal)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={findMatches}
          disabled={isLoading || subjects.length === 0 || !learningStyle || !studyTime}
          className="mt-6 btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Users className="h-4 w-4" />
          )}
          Find Study Partners
        </button>
      </div>

      {/* Match Results */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Your Study Partner Matches
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match: any) => (
              <div key={match.id} className="card p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {match.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{match.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-neutral-600">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {match.points} points
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(match.compatibilityScore)}`}>
                    {match.compatibilityScore}% match
                  </div>
                </div>

                {/* Bio */}
                {match.bio && (
                  <p className="text-neutral-600 text-sm mb-3">{match.bio}</p>
                )}

                {/* Subjects */}
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Subjects:</div>
                  <div className="flex flex-wrap gap-1">
                    {match.userSubjects.map((subject: any) => (
                      <span
                        key={subject}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Learning Style & Study Time */}
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Learning Style:</span>
                    <div className="text-neutral-600 capitalize">{match.learningStyle}</div>
                  </div>
                  <div>
                    <span className="font-medium">Study Time:</span>
                    <div className="text-neutral-600 capitalize">{match.studyTimePreference}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{match.totalSessions}</div>
                    <div className="text-xs text-neutral-600">Sessions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{match.userAchievements}</div>
                    <div className="text-xs text-neutral-600">Achievements</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">{match.streakDays}</div>
                    <div className="text-xs text-neutral-600">Day Streak</div>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Why you're compatible:</div>
                  <div className="space-y-1">
                    {match.matchReasons.slice(0, 3).map((reason, index) => (
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
                    onClick={() => toast.success(`Connection request sent to ${match.name}!`)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Connect
                  </button>
                  <button 
                    onClick={() => toast.success(`Message sent to ${match.name}!`)}
                    className="btn-outline flex items-center justify-center gap-2"
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

      {matches.length === 0 && !isLoading && (
        <div className="card p-8 text-center">
          <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            No matches yet
          </h3>
          <p className="text-neutral-600">
            Set your preferences above and click "Find Study Partners" to discover compatible study buddies!
          </p>
        </div>
      )}
    </div>
  )
}