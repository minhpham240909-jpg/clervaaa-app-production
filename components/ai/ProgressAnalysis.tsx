'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Target, Lightbulb, Award, Calendar, Clock, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ProgressAnalysis {
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  overallScore: number
  trends: {
    studyTime: number
    completion: number
    performance: number
  }
}

interface UserData {
  totalSessions: number
  totalStudyTime: number
  currentStreak: number
  points: number
  achievements: number
}

export default function ProgressAnalysis() {
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchAnalysis = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/progress-analysis')
      if (!response.ok) {
        throw new Error('Failed to fetch analysis')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      setUserData(data.userData)
    } catch (error) {
      toast.error('Failed to load progress analysis')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          AI Progress Analysis
        </h1>
        <p className="text-neutral-600">
          Get AI-powered insights into your study progress and performance
        </p>
      </div>

      {/* Quick Stats */}
      {userData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="card p-4 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userData.totalSessions}</div>
            <div className="text-sm text-neutral-600">Study Sessions</div>
          </div>
          <div className="card p-4 text-center">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{Math.round(userData.totalStudyTime / 60)}h</div>
            <div className="text-sm text-neutral-600">Total Study Time</div>
          </div>
          <div className="card p-4 text-center">
            <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userData.currentStreak}</div>
            <div className="text-sm text-neutral-600">Day Streak</div>
          </div>
          <div className="card p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userData.points}</div>
            <div className="text-sm text-neutral-600">Points Earned</div>
          </div>
          <div className="card p-4 text-center">
            <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userData.achievements}</div>
            <div className="text-sm text-neutral-600">Achievements</div>
          </div>
        </div>
      )}

      {analysis && (
        <>
          {/* Overall Score */}
          <div className="card p-6 text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r ${getScoreBackground(analysis.overallScore)} text-white mb-4`}>
              <div>
                <div className="text-3xl font-bold">{analysis.overallScore}</div>
                <div className="text-sm opacity-90">Overall Score</div>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Study Performance Analysis</h2>
            <p className="text-neutral-600">
              Based on your recent study patterns and achievements
            </p>
          </div>

          {/* Trends */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Performance Trends
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analysis.trends.studyTime}%
                </div>
                <div className="text-sm text-neutral-600">Study Time Trend</div>
                <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysis.trends.studyTime}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analysis.trends.completion}%
                </div>
                <div className="text-sm text-neutral-600">Task Completion</div>
                <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysis.trends.completion}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {analysis.trends.performance}%
                </div>
                <div className="text-sm text-neutral-600">Performance</div>
                <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysis.trends.performance}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
                <Award className="h-5 w-5" />
                Your Strengths
              </h3>
              <div className="space-y-3">
                {analysis.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-neutral-700">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-700">
                <Target className="h-5 w-5" />
                Areas for Improvement
              </h3>
              <div className="space-y-3">
                {analysis.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-neutral-700">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
              <Lightbulb className="h-5 w-5" />
              AI Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-neutral-700">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh Analysis */}
          <div className="text-center">
            <button
              onClick={fetchAnalysis}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <BarChart3 className="h-4 w-4" />
              Refresh Analysis
            </button>
          </div>
        </>
      )}
    </div>
  )
}