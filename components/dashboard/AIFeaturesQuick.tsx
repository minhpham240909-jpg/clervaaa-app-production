'use client'

import { Brain, FileText, BarChart3, HelpCircle, Users, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AIFeaturesQuick() {
  const aiFeatures = [
    {
      id: 'summaries-flashcards',
      icon: FileText,
      title: 'AI Summaries & Flashcards',
      description: 'Generate study summaries and flashcards from your content',
      color: 'from-blue-500 to-purple-600',
      action: () => {
        window.open('/ai/summaries-flashcards', '_blank')
      }
    },
    {
      id: 'progress-analysis',
      icon: BarChart3,
      title: 'AI Progress Analysis',
      description: 'Analyze your study progress and get insights',
      color: 'from-green-500 to-teal-600',
      action: () => {
        window.open('/ai/progress-analysis', '_blank')
      }
    },
    {
      id: 'quiz-generator',
      icon: HelpCircle,
      title: 'AI Quiz Generator',
      description: 'Generate personalized quizzes from your study material',
      color: 'from-orange-500 to-red-600',
      action: () => {
        window.open('/ai/quiz-generator', '_blank')
      }
    },
    {
      id: 'partner-matching',
      icon: Users,
      title: 'AI Partner Matching',
      description: 'Find perfect study partners using AI matching',
      color: 'from-purple-500 to-pink-600',
      action: () => {
        window.open('/ai/partner-matching', '_blank')
      }
    }
  ]

  return (
    <div className="space-y-4" data-ai-features>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg w-10 h-10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">AI-Powered Features</h2>
            <p className="text-sm text-neutral-600">Enhanced studying with new AI capabilities</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-xs text-neutral-500">
          <Sparkles className="h-3 w-3" />
          <span>Powered by AI</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiFeatures.map((feature: any) => {
          const Icon = feature.icon
          return (
            <div 
              key={feature.id}
              className="card cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white"
              onClick={feature.action}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">
                    {feature.title}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {feature.description}
                  </p>
                </div>
                <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-lg transition-transform hover:scale-110`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Coming Soon Banner */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">New AI Features</span>
          </div>
          <button 
            onClick={() => toast.success('New AI features are being developed!')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Learn More →
          </button>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Enhanced AI capabilities for summaries, flashcards, progress analysis, quizzes, and partner matching
        </p>
      </div>
    </div>
  )
}