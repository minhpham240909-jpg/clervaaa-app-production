'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Brain, 
  Settings, 
  Zap, 
  DollarSign, 
  Users, 
  BarChart3, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  Edit,
  Trash2,
  Plus,
  Eye,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  MessageCircle,
  BookOpen,
  Target,
  Star,
  Award,
  Key,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Globe,
  Calendar
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'local'
  model: string
  status: 'active' | 'inactive' | 'error'
  requestsToday: number
  totalRequests: number
  avgResponseTime: number
  errorRate: number
  costPerRequest: number
  rateLimit: number
  description?: string
}

interface AILimits {
  freeUserLimits: {
    flashcardsPerDay: number
    quizzesPerDay: number
    aiChatMessages: number
    studyPlansPerMonth: number
  }
  premiumUserLimits: {
    flashcardsPerDay: number
    quizzesPerDay: number
    aiChatMessages: number
    studyPlansPerMonth: number
  }
  globalLimits: {
    totalRequestsPerHour: number
    maxConcurrentUsers: number
    emergencyThreshold: number
  }
}

interface ContentStats {
  aiRequests: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
  }
  contentGenerated: {
    flashcards: number
    quizzes: number
    studyPlans: number
    summaries: number
  }
  userUsage: {
    activeUsers: number
    premiumUsers: number
    averageRequestsPerUser: number
    topUsers: Array<{ name: string; requests: number }>
  }
  costs: {
    totalCostToday: number
    totalCostThisMonth: number
    costPerUser: number
    projectedMonthlyCost: number
  }
}

export default function ContentAIControlPanel() {
  const { data: session } = useSession()
  const [models, setModels] = useState<AIModel[]>([])
  const [limits, setLimits] = useState<AILimits | null>(null)
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'models' | 'limits' | 'stats' | 'content'>('models')
  const [editingLimits, setEditingLimits] = useState(false)
  const [showModelModal, setShowModelModal] = useState<AIModel | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [modelsResponse, limitsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/ai-models'),
        fetch('/api/admin/ai-limits'),
        fetch('/api/admin/content-stats')
      ])

      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json()
        setModels(modelsData.models || [])
      }

      if (limitsResponse.ok) {
        const limitsData = await limitsResponse.json()
        setLimits(limitsData.limits || getDefaultLimits())
      } else {
        setLimits(getDefaultLimits())
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats || getDefaultStats())
      } else {
        setStats(getDefaultStats())
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load AI control panel data')
      // Set default data
      setModels(getDefaultModels())
      setLimits(getDefaultLimits())
      setStats(getDefaultStats())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultModels = (): AIModel[] => [
    {
      id: '1',
      name: 'GPT-4',
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      status: 'active',
      requestsToday: 1247,
      totalRequests: 45623,
      avgResponseTime: 2.3,
      errorRate: 0.02,
      costPerRequest: 0.03,
      rateLimit: 10000,
      description: 'Primary model for complex reasoning and content generation'
    },
    {
      id: '2',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      status: 'active',
      requestsToday: 3421,
      totalRequests: 156789,
      avgResponseTime: 1.1,
      errorRate: 0.01,
      costPerRequest: 0.002,
      rateLimit: 50000,
      description: 'Fast model for simple tasks and high volume requests'
    },
    {
      id: '3',
      name: 'Claude 3',
      provider: 'anthropic',
      model: 'claude-3-opus-20240229',
      status: 'inactive',
      requestsToday: 0,
      totalRequests: 12456,
      avgResponseTime: 2.8,
      errorRate: 0.03,
      costPerRequest: 0.015,
      rateLimit: 5000,
      description: 'Backup model for specialized content generation'
    }
  ]

  const getDefaultLimits = (): AILimits => ({
    freeUserLimits: {
      flashcardsPerDay: 10,
      quizzesPerDay: 3,
      aiChatMessages: 20,
      studyPlansPerMonth: 2
    },
    premiumUserLimits: {
      flashcardsPerDay: 100,
      quizzesPerDay: 25,
      aiChatMessages: 200,
      studyPlansPerMonth: 20
    },
    globalLimits: {
      totalRequestsPerHour: 10000,
      maxConcurrentUsers: 500,
      emergencyThreshold: 90
    }
  })

  const getDefaultStats = (): ContentStats => ({
    aiRequests: {
      total: 234567,
      today: 4668,
      thisWeek: 32456,
      thisMonth: 124567
    },
    contentGenerated: {
      flashcards: 45678,
      quizzes: 12345,
      studyPlans: 3456,
      summaries: 8901
    },
    userUsage: {
      activeUsers: 1234,
      premiumUsers: 156,
      averageRequestsPerUser: 3.8,
      topUsers: [
        { name: 'John Doe', requests: 245 },
        { name: 'Jane Smith', requests: 198 },
        { name: 'Mike Johnson', requests: 167 }
      ]
    },
    costs: {
      totalCostToday: 89.45,
      totalCostThisMonth: 2456.78,
      costPerUser: 1.99,
      projectedMonthlyCost: 3200.00
    }
  })

  const handleModelToggle = async (modelId: string, status: 'active' | 'inactive') => {
    try {
      const response = await fetch(`/api/admin/ai-models/${modelId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Model ${status === 'active' ? 'activated' : 'deactivated'}`)
        loadData()
      } else {
        toast.error('Failed to update model status')
      }
    } catch (error) {
      toast.error('Error updating model')
    }
  }

  const handleLimitsSave = async () => {
    try {
      const response = await fetch('/api/admin/ai-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limits })
      })

      if (response.ok) {
        toast.success('AI limits updated successfully')
        setEditingLimits(false)
      } else {
        toast.error('Failed to update limits')
      }
    } catch (error) {
      toast.error('Error updating limits')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return <Brain className="h-5 w-5 text-green-600" />
      case 'anthropic': return <MessageCircle className="h-5 w-5 text-blue-600" />
      case 'google': return <Globe className="h-5 w-5 text-red-600" />
      case 'local': return <Server className="h-5 w-5 text-purple-600" />
      default: return <Brain className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content & AI Control</h1>
            <p className="text-gray-600 mt-1">
              Manage AI models, limits, and content generation policies
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={loadData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Requests Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.aiRequests.today || 0}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12% vs yesterday</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Generated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.contentGenerated.flashcards || 0) + (stats?.contentGenerated.quizzes || 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {stats?.contentGenerated.flashcards} flashcards, {stats?.contentGenerated.quizzes} quizzes
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cost Today</p>
                <p className="text-2xl font-bold text-gray-900">${stats?.costs.totalCostToday.toFixed(2) || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              ${stats?.costs.costPerUser.toFixed(2)} per user
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold text-gray-900">
                  {models.filter(m => m.status === 'active').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {models.length} total models
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex overflow-x-auto">
            {[
              { id: 'models', label: 'AI Models', icon: Brain },
              { id: 'limits', label: 'Usage Limits', icon: Shield },
              { id: 'stats', label: 'Statistics', icon: BarChart3 },
              { id: 'content', label: 'Content Management', icon: FileText }
            ].map((tab: any) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium whitespace-nowrap">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'models' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">AI Models Configuration</h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Plus className="h-4 w-4" />
                    <span>Add Model</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage Today</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {models.map((model) => (
                      <tr key={model.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{model.name}</div>
                            <div className="text-sm text-gray-500">{model.model}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getProviderIcon(model.provider)}
                            <span className="text-sm text-gray-900 capitalize">{model.provider}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(model.status)}`}>
                            {model.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{model.requestsToday.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">of {model.rateLimit.toLocaleString()} limit</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{model.avgResponseTime}s avg</div>
                          <div className="text-xs text-red-600">{(model.errorRate * 100).toFixed(2)}% errors</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">${model.costPerRequest.toFixed(3)}</div>
                          <div className="text-xs text-gray-500">per request</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setShowModelModal(model)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleModelToggle(model.id, model.status === 'active' ? 'inactive' : 'active')}
                              className={`${model.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            >
                              {model.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'limits' && limits && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Usage Limits Configuration</h3>
                  <div className="flex items-center space-x-2">
                    {editingLimits ? (
                      <>
                        <button
                          onClick={() => setEditingLimits(false)}
                          className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleLimitsSave}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingLimits(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Limits</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Free User Limits */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Free User Limits
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Flashcards per Day</label>
                      <input
                        type="number"
                        value={limits.freeUserLimits.flashcardsPerDay}
                        onChange={(e) => setLimits({
                          ...limits,
                          freeUserLimits: { ...limits.freeUserLimits, flashcardsPerDay: parseInt(e.target.value) }
                        })}
                        disabled={!editingLimits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quizzes per Day</label>
                      <input
                        type="number"
                        value={limits.freeUserLimits.quizzesPerDay}
                        onChange={(e) => setLimits({
                          ...limits,
                          freeUserLimits: { ...limits.freeUserLimits, quizzesPerDay: parseInt(e.target.value) }
                        })}
                        disabled={!editingLimits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">AI Chat Messages</label>
                      <input
                        type="number"
                        value={limits.freeUserLimits.aiChatMessages}
                        onChange={(e) => setLimits({
                          ...limits,
                          freeUserLimits: { ...limits.freeUserLimits, aiChatMessages: parseInt(e.target.value) }
                        })}
                        disabled={!editingLimits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Study Plans per Month</label>
                      <input
                        type="number"
                        value={limits.freeUserLimits.studyPlansPerMonth}
                        onChange={(e) => setLimits({
                          ...limits,
                          freeUserLimits: { ...limits.freeUserLimits, studyPlansPerMonth: parseInt(e.target.value) }
                        })}
                        disabled={!editingLimits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Premium User Limits */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-600" />
                    Premium User Limits
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Flashcards per Day</label>
                      <input
                        type="number"
                        value={limits.premiumUserLimits.flashcardsPerDay}
                        onChange={(e) => setLimits({
                          ...limits,
                          premiumUserLimits: { ...limits.premiumUserLimits, flashcardsPerDay: parseInt(e.target.value) }
                        })}
                        disabled={!editingLimits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quizzes per Day</label>
                      <input
                        type="number"
                        value={limits.premiumUserLimits.quizzesPerDay}
                        onChange={(e) => setLimits({
                          ...limits,
                          premiumUserLimits: { ...limits.premiumUserLimits, quizzesPerDay: parseInt(e.target.value) }
                        })}
                        disabled={!editingLimits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">AI Chat Messages</label>
                      <input
                        type="number"
                        value={limits.premiumUserLimits.aiChatMessages}
                        onChange={(e) => setLimits({
                          ...limits,
                          premiumUserLimits: { ...limits.premiumUserLimits, aiChatMessages: parseInt(e.target.value) }
                        })}
                        disabled={!editingLimits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Study Plans per Month</label>
                      <input
                        type="number"
                        value={limits.premiumUserLimits.studyPlansPerMonth}
                        onChange={(e) => setLimits({
                          ...limits,
                          premiumUserLimits: { ...limits.premiumUserLimits, studyPlansPerMonth: parseInt(e.target.value) }
                        })}
                        disabled={!editingLimits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Global System Limits */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-red-600" />
                    Global System Limits
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Requests per Hour</label>
                      <input
                        type="number"
                        value={limits.globalLimits.totalRequestsPerHour}
                        onChange={(e) => setLimits({
                          ...limits,
                          globalLimits: { ...limits.globalLimits, totalRequestsPerHour: parseInt(e.target.value) }
                        })}
                        disabled={!editingLimits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Concurrent Users</label>
                      <input
                        type="number"
                        value={limits.globalLimits.maxConcurrentUsers}
                        onChange={(e) => setLimits({
                          ...limits,
                          globalLimits: { ...limits.globalLimits, maxConcurrentUsers: parseInt(e.target.value) }
                        })}
                        disabled={!editingLimits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Threshold (%)</label>
                      <input
                        type="number"
                        value={limits.globalLimits.emergencyThreshold}
                        onChange={(e) => setLimits({
                          ...limits,
                          globalLimits: { ...limits.globalLimits, emergencyThreshold: parseInt(e.target.value) }
                        })}
                        disabled={!editingLimits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  AI Request Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Today</span>
                    <span className="font-semibold">{stats.aiRequests.today.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-semibold">{stats.aiRequests.thisWeek.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold">{stats.aiRequests.thisMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-gray-600 font-medium">Total</span>
                    <span className="font-bold text-lg">{stats.aiRequests.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Cost Analysis
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Today</span>
                    <span className="font-semibold">${stats.costs.totalCostToday.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold">${stats.costs.totalCostThisMonth.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost per User</span>
                    <span className="font-semibold">${stats.costs.costPerUser.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-gray-600 font-medium">Projected Monthly</span>
                    <span className="font-bold text-lg text-orange-600">${stats.costs.projectedMonthlyCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Content Generation Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{stats.contentGenerated.flashcards.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Flashcards</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{stats.contentGenerated.quizzes.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Quizzes</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{stats.contentGenerated.studyPlans.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Study Plans</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <FileText className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{stats.contentGenerated.summaries.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Summaries</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Top Users by AI Usage
              </h3>
              <div className="space-y-3">
                {stats.userUsage.topUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{user.requests} requests</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Management Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <FileText className="h-8 w-8 text-blue-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Content Moderation</h4>
                  <p className="text-sm text-gray-600">Review and moderate AI-generated content</p>
                </button>
                
                <button className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Settings className="h-8 w-8 text-green-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Content Templates</h4>
                  <p className="text-sm text-gray-600">Manage templates for AI content generation</p>
                </button>
                
                <button className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Shield className="h-8 w-8 text-red-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Content Policies</h4>
                  <p className="text-sm text-gray-600">Configure content filtering and safety policies</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Model Detail Modal */}
        {showModelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Model Details</h3>
                  <button 
                    onClick={() => setShowModelModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                  {getProviderIcon(showModelModal.provider)}
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{showModelModal.name}</h4>
                    <p className="text-gray-600">{showModelModal.model}</p>
                    <p className="text-sm text-gray-500 mt-1">{showModelModal.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-blue-600">{showModelModal.requestsToday.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Requests Today</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-green-600">{showModelModal.avgResponseTime}s</p>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-red-600">{(showModelModal.errorRate * 100).toFixed(2)}%</p>
                    <p className="text-sm text-gray-600">Error Rate</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-yellow-600">${showModelModal.costPerRequest.toFixed(3)}</p>
                    <p className="text-sm text-gray-600">Cost per Request</p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                  <button
                    onClick={() => handleModelToggle(showModelModal.id, showModelModal.status === 'active' ? 'inactive' : 'active')}
                    className={`px-4 py-2 rounded-lg ${
                      showModelModal.status === 'active' 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {showModelModal.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setShowModelModal(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
