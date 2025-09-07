'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Users, 
  Activity, 
  Shield, 
  Database, 
  Brain, 
  Settings,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Server,
  Lock,
  UserCheck,
  BookOpen,
  MessageCircle,
  Zap,
  DollarSign,
  Heart,
  Star,
  Award,
  RefreshCw,
  Bell,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Globe
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface DashboardStats {
  users: {
    total: number
    active: number
    newToday: number
    retention: number
    banned: number
    pending: number
  }
  analytics: {
    pageViews: number
    sessions: number
    avgSessionTime: number
    bounceRate: number
  }
  content: {
    aiRequests: number
    flashcardsGenerated: number
    quizzesCreated: number
    studyHours: number
  }
  security: {
    failedLogins: number
    suspiciousActivity: number
    activeAdmins: number
    lastSecurityScan: string
  }
  system: {
    uptime: number
    responseTime: number
    errorRate: number
    dbConnections: number
  }
}

interface RecentActivity {
  id: string
  type: 'user_signup' | 'user_login' | 'content_generated' | 'security_alert' | 'system_error'
  message: string
  timestamp: string
  severity: 'info' | 'warning' | 'error' | 'success'
}

export default function AdminOverviewDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadDashboardData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/dashboard-stats'),
        fetch('/api/admin/recent-activity')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return <UserCheck className="h-4 w-4" />
      case 'user_login': return <Users className="h-4 w-4" />
      case 'content_generated': return <Brain className="h-4 w-4" />
      case 'security_alert': return <Shield className="h-4 w-4" />
      case 'system_error': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Complete control and monitoring of your StudyBuddy platform
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={loadDashboardData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.users.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+{stats?.users.newToday || 0} today</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats?.users.active || 0} active • {stats?.users.banned || 0} banned
            </div>
          </div>

          {/* Analytics Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.analytics.pageViews || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Clock className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-blue-600">{stats?.analytics.avgSessionTime || 0}min avg</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats?.analytics.bounceRate || 0}% bounce rate
            </div>
          </div>

          {/* Content & AI Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.content.aiRequests || 0}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <BookOpen className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-purple-600">{stats?.content.studyHours || 0}h studied</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats?.content.flashcardsGenerated || 0} flashcards • {stats?.content.quizzesCreated || 0} quizzes
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.system.uptime || 99.9}%</p>
              </div>
              <Server className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Activity className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">{stats?.system.responseTime || 0}ms response</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats?.system.errorRate || 0}% error rate
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Management */}
          <Link href="/admin/users" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                <p className="text-gray-600 text-sm mb-4">
                  View, manage, and moderate user accounts
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{stats?.users.total || 0} total users</span>
                  <span>{stats?.users.pending || 0} pending</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Link>

          {/* Analytics & Monitoring */}
          <Link href="/admin/analytics" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics & Monitoring</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Track usage, performance, and user behavior
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{stats?.analytics.sessions || 0} sessions</span>
                  <span>{stats?.analytics.pageViews || 0} views</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Link>

          {/* Content & AI Control */}
          <Link href="/admin/content" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Content & AI Control</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Manage AI models, limits, and content policies
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{stats?.content.aiRequests || 0} AI requests</span>
                  <span>{stats?.content.flashcardsGenerated || 0} flashcards</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Brain className="h-8 w-8 text-purple-600 mb-2" />
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Link>

          {/* Security & Permissions */}
          <Link href="/admin/security" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Security & Permissions</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Manage roles, permissions, and security settings
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{stats?.security.activeAdmins || 0} admins</span>
                  <span>{stats?.security.failedLogins || 0} failed logins</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-red-600 mb-2" />
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Link>

          {/* Database Access */}
          <Link href="/admin/database" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Database Access</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Direct database queries and data management
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{stats?.system.dbConnections || 0} connections</span>
                  <span>SQLite/PostgreSQL</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Database className="h-8 w-8 text-indigo-600 mb-2" />
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Link>

          {/* System Settings */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Configure platform settings and preferences
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Environment: Production</span>
                  <span>Version: 2.1.0</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Settings className="h-8 w-8 text-gray-600 mb-2" />
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </h3>
              <Link href="/admin/activity" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${getSeverityColor(activity.severity)}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs opacity-75">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Security Alerts */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Status
              </h3>
              <span className="text-xs text-gray-500">
                Last scan: {stats?.security.lastSecurityScan || 'Never'}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">System Security</span>
                </div>
                <span className="text-xs text-green-600">All Clear</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-800">Failed Logins</span>
                </div>
                <span className="text-xs text-yellow-600">{stats?.security.failedLogins || 0} today</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">Active Admins</span>
                </div>
                <span className="text-xs text-blue-600">{stats?.security.activeAdmins || 0} online</span>
              </div>
              
              {stats?.security.suspiciousActivity && stats.security.suspiciousActivity > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-800">Suspicious Activity</span>
                  </div>
                  <span className="text-xs text-red-600">{stats.security.suspiciousActivity} alerts</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
