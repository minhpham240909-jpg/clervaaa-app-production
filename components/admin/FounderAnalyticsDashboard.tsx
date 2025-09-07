'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Users, 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Globe,
  Brain,
  MessageCircle,
  BookOpen,
  Target,
  AlertTriangle,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Settings,
  Heart,
  Star,
  Award,
  DollarSign,
  TrendingUp as TrendUp,
  UserCheck,
  Clock as ClockIcon,
  Wifi,
  Users as UsersIcon,
  Activity as ActivityIcon,
  Search,
  FileText,
  BarChart,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    newUsersToday: number
    totalSessions: number
    avgSessionDuration: number
    studyHoursToday: number
    aiUsageCount: number
    retentionRate: number
  }
  realTime: {
    currentlyOnline: number
    sessionsLast24h: number
    popularPages: Array<{ path: string; views: number }>
    activeFeatures: Array<{ feature: string; usage: number }>
    recentActions: Array<{ action: string; timestamp: string; user?: string }>
  }
  userBehavior: {
    deviceBreakdown: Array<{ device: string; count: number; percentage: number }>
    browserBreakdown: Array<{ browser: string; count: number }>
    studyPatterns: Array<{ hour: number; studyTime: number; users: number }>
    popularFeatures: Array<{ feature: string; usage: number; successRate: number }>
    retentionCohorts: Array<{ month: string; retention1w: number; retention1m: number }>
  }
  studyAnalytics: {
    totalStudyTime: number
    avgSessionLength: number
    popularSubjects: Array<{ subject: string; hours: number; users: number }>
    studyStreaks: { avg: number; max: number; activeStreaks: number }
    aiFeatureUsage: Array<{ feature: string; usage: number; satisfaction: number }>
    partnershipStats: { totalMatches: number; activePartnerships: number; successRate: number }
  }
  engagement: {
    dailyActiveUsers: Array<{ date: string; users: number }>
    featureAdoption: Array<{ feature: string; adopted: number; total: number }>
    userJourney: Array<{ step: string; completion: number; dropoff: number }>
    satisfactionScore: number
    npsScore: number
    churnRisk: Array<{ userId: string; name: string; riskScore: number; lastActive: string }>
    conversionFunnel: Array<{ stage: string; users: number; percentage: number }>
    geographicData: Array<{ country: string; users: number; sessions: number }>
  }
  performance: {
    avgPageLoadTime: number
    errorRate: number
    uptime: number
    apiResponseTime: number
    crashReports: Array<{ error: string; count: number; lastOccurred: string }>
  }

}

export default function FounderAnalyticsDashboard() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'engagement' | 'performance'>('overview')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      loadAnalytics()
      
      // Set up auto-refresh
      if (autoRefresh) {
        const interval = setInterval(() => {
          loadAnalytics()
        }, 30000) // Refresh every 30 seconds
        return () => clearInterval(interval)
      }
    }
  }, [status, selectedTimeRange, autoRefresh])

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?range=${selectedTimeRange}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
        setLastUpdated(new Date())
      } else {
        toast.error('Failed to load analytics data')
      }
    } catch (error) {
      toast.error('Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch(`/api/analytics/export?range=${selectedTimeRange}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Analytics data exported')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500'></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Founder Access Required</h1>
          <p>Please sign in as the founder to view analytics.</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className='text-center'>
          <AlertTriangle className='h-12 w-12 text-yellow-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>No Data Available</h2>
          <p className='text-gray-600'>Analytics data will appear here once users start using the app.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Founder Analytics</h1>
          <p className='text-gray-600 mt-1'>
            Complete insight into user behavior and app performance
          </p>
          <p className='text-sm text-gray-500 mt-1'>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className='flex items-center space-x-4'>
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e: any) => setSelectedTimeRange(e.target.value as any)}
            className='input-field'
          >
            <option value='24h'>Last 24 Hours</option>
            <option value='7d'>Last 7 Days</option>
            <option value='30d'>Last 30 Days</option>
            <option value='90d'>Last 90 Days</option>
          </select>

          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
              autoRefresh 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Auto' : 'Manual'}</span>
          </button>

          {/* Export button */}
          <button onClick={exportData} className='btn-outline flex items-center space-x-2'>
            <Download className='h-4 w-4' />
            <span>Export</span>
          </button>

          {/* Manual refresh */}
          <button onClick={loadAnalytics} className='btn-primary flex items-center space-x-2'>
            <RefreshCw className='h-4 w-4' />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='bg-white rounded-lg shadow-sm border mb-6'>
        <div className='flex overflow-x-auto'>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: UsersIcon },
            { id: 'engagement', label: 'Engagement', icon: Heart },
            { id: 'performance', label: 'Performance', icon: ActivityIcon }
          ].map((tab: any) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className='h-5 w-5' />
                <span className='font-medium whitespace-nowrap'>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg p-4 shadow-sm border mb-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <Search className='h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
              <input
                type='text'
                placeholder='Search analytics data...'
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
              />
            </div>
            <select className='input-field'>
              <option value=''>All Segments</option>
              <option value='new'>New Users</option>
              <option value='returning'>Returning Users</option>
              <option value='premium'>Premium Users</option>
            </select>
          </div>
          <button className='btn-outline flex items-center space-x-2'>
            <Filter className='h-4 w-4' />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* Dynamic Content Based on Selected Tab */}
      {selectedTab === 'overview' && (
        <>
        {/* Key Metrics Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Users</p>
              <p className='text-2xl font-bold text-gray-900'>{data.overview.totalUsers}</p>
            </div>
            <Users className='h-8 w-8 text-blue-600' />
          </div>
          <div className='mt-2 flex items-center text-sm'>
            <TrendingUp className='h-4 w-4 text-green-600 mr-1' />
            <span className='text-green-600'>+{data.overview.newUsersToday} today</span>
          </div>
        </div>

        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Active Users</p>
              <p className='text-2xl font-bold text-gray-900'>{data.overview.activeUsers}</p>
            </div>
            <Activity className='h-8 w-8 text-green-600' />
          </div>
          <div className='mt-2 flex items-center text-sm'>
            <Eye className='h-4 w-4 text-blue-600 mr-1' />
            <span className='text-blue-600'>{data.realTime.currentlyOnline} online now</span>
          </div>
        </div>

        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Study Hours Today</p>
              <p className='text-2xl font-bold text-gray-900'>{(data.overview.studyHoursToday || 0).toFixed(1)}h</p>
            </div>
            <BookOpen className='h-8 w-8 text-purple-600' />
          </div>
          <div className='mt-2 flex items-center text-sm'>
            <Clock className='h-4 w-4 text-purple-600 mr-1' />
            <span className='text-purple-600'>Avg: {data.overview.avgSessionDuration}min</span>
          </div>
        </div>

        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>AI Usage</p>
              <p className='text-2xl font-bold text-gray-900'>{data.overview.aiUsageCount}</p>
            </div>
            <Brain className='h-8 w-8 text-yellow-600' />
          </div>
          <div className='mt-2 flex items-center text-sm'>
            <Zap className='h-4 w-4 text-yellow-600 mr-1' />
            <span className='text-yellow-600'>AI features used</span>
          </div>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Activity className='h-5 w-5 mr-2' />
            Real-time Activity
          </h3>
          
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Currently Online</span>
              <div className='flex items-center space-x-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                <span className='font-semibold'>{data.realTime.currentlyOnline} users</span>
              </div>
            </div>
            
            <div className='border-t pt-4'>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>Recent Actions</h4>
              <div className='space-y-2 max-h-48 overflow-y-auto'>
                {data.realTime.recentActions.slice(0, 10).map((action, index) => (
                  <div key={index} className='flex items-center justify-between text-sm'>
                    <span className='text-gray-600'>{action.action}</span>
                    <div className='flex items-center space-x-2'>
                      {action.user && (
                        <span className='text-blue-600 text-xs'>{action.user}</span>
                      )}
                      <span className='text-gray-400 text-xs'>
                        {new Date(action.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <TrendingUp className='h-5 w-5 mr-2' />
            Popular Pages
          </h3>
          
          <div className='space-y-3'>
            {data.realTime.popularPages.slice(0, 8).map((page, index) => (
              <div key={index} className='flex items-center justify-between'>
                <span className='text-sm text-gray-700 font-mono'>{page.path}</span>
                <div className='flex items-center space-x-2'>
                  <div className='w-12 bg-gray-200 rounded-full h-2'>
                    <div 
                      className='bg-blue-600 h-2 rounded-full'
                      style={{ width: `${(page.views / Math.max(...data.realTime.popularPages.map((p: any) => p.views))) * 100}%` }}
                    ></div>
                  </div>
                  <span className='text-sm font-semibold text-gray-900'>{page.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Behavior Analysis */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Smartphone className='h-5 w-5 mr-2' />
            Device Usage
          </h3>
          
          <div className='space-y-3'>
            {data.userBehavior.deviceBreakdown.map((device, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  {device.device === 'desktop' && <Monitor className='h-4 w-4 text-gray-600' />}
                  {device.device === 'mobile' && <Smartphone className='h-4 w-4 text-gray-600' />}
                  {device.device === 'tablet' && <Smartphone className='h-4 w-4 text-gray-600' />}
                  <span className='text-sm text-gray-700 capitalize'>{device.device}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm font-semibold'>{(device.percentage || 0).toFixed(1)}%</span>
                  <span className='text-xs text-gray-500'>({device.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Brain className='h-5 w-5 mr-2' />
            AI Feature Usage
          </h3>
          
          <div className='space-y-3'>
            {data.studyAnalytics.aiFeatureUsage.slice(0, 6).map((feature, index) => (
              <div key={index} className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-700'>{feature.feature}</span>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm font-semibold'>{feature.usage}</span>
                    <div className='flex items-center space-x-1'>
                      <Star className='h-3 w-3 text-yellow-500 fill-current' />
                      <span className='text-xs text-gray-600'>{(feature.satisfaction || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-1'>
                  <div 
                    className='bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full'
                    style={{ width: `${(feature.usage / Math.max(...data.studyAnalytics.aiFeatureUsage.map((f: any) => f.usage))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Target className='h-5 w-5 mr-2' />
            Study Performance
          </h3>
          
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {(data.studyAnalytics.studyStreaks.avg || 0).toFixed(1)}
              </div>
              <div className='text-sm text-gray-600'>Average Streak</div>
            </div>
            
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center'>
                <div className='text-lg font-semibold text-blue-600'>
                  {data.studyAnalytics.studyStreaks.max}
                </div>
                <div className='text-xs text-gray-600'>Best Streak</div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-semibold text-purple-600'>
                  {data.studyAnalytics.studyStreaks.activeStreaks}
                </div>
                <div className='text-xs text-gray-600'>Active Streaks</div>
              </div>
            </div>

            <div className='border-t pt-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Avg Session</span>
                <span className='font-semibold'>{data.studyAnalytics.avgSessionLength}min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Study Analytics */}
      <div className='bg-white rounded-lg p-6 shadow-sm border'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <BookOpen className='h-5 w-5 mr-2' />
          Study Subject Popularity
        </h3>
        
        {data.studyAnalytics.popularSubjects.length === 0 ? (
          <div className='text-center py-8'>
            <BookOpen className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <h4 className='text-lg font-medium text-gray-600 mb-2'>No Study Data Yet</h4>
            <p className='text-gray-500'>Subject popularity will appear here once users start studying.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {data.studyAnalytics.popularSubjects.slice(0, 6).map((subject, index) => (
              <div key={index} className='text-center p-4 bg-gray-50 rounded-lg'>
                <div className='text-lg font-bold text-gray-900'>{subject.subject}</div>
                <div className='text-sm text-gray-600 mt-1'>
                  {subject.hours.toFixed(1)}h study time
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  {subject.users} users
                </div>
                <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
                  <div 
                    className='bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full'
                    style={{ width: `${(subject.hours / Math.max(...data.studyAnalytics.popularSubjects.map((s: any) => s.hours))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Satisfaction & Churn Risk */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Heart className='h-5 w-5 mr-2' />
            User Satisfaction
          </h3>
          
          <div className='grid grid-cols-2 gap-6'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-green-600'>
                {(data.engagement.satisfactionScore || 0).toFixed(1)}
              </div>
              <div className='text-sm text-gray-600'>Satisfaction Score</div>
              <div className='flex justify-center mt-2'>
                {[1, 2, 3, 4, 5].map((star: any) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(data.engagement.satisfactionScore) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600'>
                {data.engagement.npsScore}
              </div>
              <div className='text-sm text-gray-600'>NPS Score</div>
              <div className='text-xs text-gray-500 mt-1'>
                {data.engagement.npsScore >= 50 ? 'Excellent' : 
                 data.engagement.npsScore >= 20 ? 'Good' : 
                 data.engagement.npsScore >= 0 ? 'Needs Improvement' : 'Poor'}
              </div>
            </div>
          </div>

          <div className='mt-4 border-t pt-4'>
            <div className='text-sm font-medium text-gray-700 mb-2'>Retention Rate</div>
            <div className='flex items-center justify-between'>
              <span className='text-lg font-bold text-green-600'>
                {(data.overview.retentionRate || 0).toFixed(1)}%
              </span>
              <span className='text-sm text-gray-600'>7-day retention</span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <AlertTriangle className='h-5 w-5 mr-2' />
            Churn Risk Users
          </h3>
          
          {data.engagement.churnRisk.length === 0 ? (
            <div className='text-center py-8'>
              <Heart className='h-12 w-12 text-green-300 mx-auto mb-4' />
              <h4 className='text-lg font-medium text-gray-600 mb-2'>No Churn Risk Detected</h4>
              <p className='text-gray-500'>User retention analysis will appear here once you have active users.</p>
            </div>
          ) : (
            <div className='space-y-3 max-h-64 overflow-y-auto'>
              {data.engagement.churnRisk.slice(0, 10).map((user, index) => (
                <div key={index} className='flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500'>
                  <div>
                    <div className='font-medium text-gray-900'>{user.name}</div>
                    <div className='text-sm text-gray-600'>
                      Last active: {new Date(user.lastActive).toLocaleDateString()}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className={`text-sm font-semibold ${
                      user.riskScore > 0.8 ? 'text-red-600' : 
                      user.riskScore > 0.6 ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {(user.riskScore * 100).toFixed(0)}% risk
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <div className='space-y-6'>
          {/* User Growth Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Total Users</p>
                  <p className='text-2xl font-bold text-gray-900'>{data.overview.totalUsers}</p>
                </div>
                <Users className='h-8 w-8 text-blue-600' />
              </div>
              <div className='mt-2 flex items-center text-sm'>
                <ArrowUp className='h-4 w-4 text-green-600 mr-1' />
                <span className='text-green-600'>+12.5% vs last month</span>
              </div>
            </div>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Daily Active Users</p>
                  <p className='text-2xl font-bold text-gray-900'>{data.overview.activeUsers}</p>
                </div>
                <UserCheck className='h-8 w-8 text-green-600' />
              </div>
              <div className='mt-2 flex items-center text-sm'>
                <ArrowUp className='h-4 w-4 text-green-600 mr-1' />
                <span className='text-green-600'>+8.3% vs yesterday</span>
              </div>
            </div>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>User Retention</p>
                  <p className='text-2xl font-bold text-gray-900'>{(data.overview.retentionRate || 0).toFixed(1)}%</p>
                </div>
                <Heart className='h-8 w-8 text-red-600' />
              </div>
              <div className='mt-2 flex items-center text-sm'>
                <Minus className='h-4 w-4 text-yellow-600 mr-1' />
                <span className='text-yellow-600'>-2.1% vs last week</span>
              </div>
            </div>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Avg. Session Time</p>
                  <p className='text-2xl font-bold text-gray-900'>{data.overview.avgSessionDuration}min</p>
                </div>
                <ClockIcon className='h-8 w-8 text-purple-600' />
              </div>
              <div className='mt-2 flex items-center text-sm'>
                <ArrowUp className='h-4 w-4 text-green-600 mr-1' />
                <span className='text-green-600'>+5.2% vs last week</span>
              </div>
            </div>
          </div>

          {/* User Cohort Analysis */}
          <div className='bg-white rounded-lg p-6 shadow-sm border'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
              <Users className='h-5 w-5 mr-2' />
              User Cohort Analysis
            </h3>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>Cohort</th>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>Users</th>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>Week 1</th>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>Week 2</th>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>Week 4</th>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>Week 8</th>
                  </tr>
                </thead>
                <tbody>
                  {['August 2024', 'September 2024', 'October 2024', 'November 2024'].map((month, index) => (
                    <tr key={month} className='border-b hover:bg-gray-50'>
                      <td className='py-2 px-3 font-medium'>{month}</td>
                      <td className='py-2 px-3'>{150 - index * 20}</td>
                      <td className='py-2 px-3'>
                        <div className='flex items-center space-x-2'>
                          <div className='w-12 bg-gray-200 rounded-full h-2'>
                            <div className='bg-green-600 h-2 rounded-full' style={{width: `${85 - index * 5}%`}}></div>
                          </div>
                          <span>{85 - index * 5}%</span>
                        </div>
                      </td>
                      <td className='py-2 px-3'>
                        <div className='flex items-center space-x-2'>
                          <div className='w-12 bg-gray-200 rounded-full h-2'>
                            <div className='bg-blue-600 h-2 rounded-full' style={{width: `${72 - index * 8}%`}}></div>
                          </div>
                          <span>{72 - index * 8}%</span>
                        </div>
                      </td>
                      <td className='py-2 px-3'>
                        <div className='flex items-center space-x-2'>
                          <div className='w-12 bg-gray-200 rounded-full h-2'>
                            <div className='bg-yellow-600 h-2 rounded-full' style={{width: `${58 - index * 6}%`}}></div>
                          </div>
                          <span>{58 - index * 6}%</span>
                        </div>
                      </td>
                      <td className='py-2 px-3'>
                        <div className='flex items-center space-x-2'>
                          <div className='w-12 bg-gray-200 rounded-full h-2'>
                            <div className='bg-red-600 h-2 rounded-full' style={{width: `${42 - index * 4}%`}}></div>
                          </div>
                          <span>{42 - index * 4}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Demographics */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Geographic Distribution</h3>
              <div className='space-y-3'>
                {['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia'].map((country, index) => (
                  <div key={country} className='flex items-center justify-between'>
                    <span className='text-gray-700'>{country}</span>
                    <div className='flex items-center space-x-2'>
                      <div className='w-16 bg-gray-200 rounded-full h-2'>
                        <div 
                          className='bg-blue-600 h-2 rounded-full' 
                          style={{width: `${85 - index * 15}%`}}
                        ></div>
                      </div>
                      <span className='text-sm font-medium text-gray-900'>{85 - index * 15}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>User Segments</h3>
              <div className='space-y-4'>
                {[
                  { segment: 'Power Users', count: 156, color: 'bg-green-500' },
                  { segment: 'Regular Users', count: 324, color: 'bg-blue-500' },
                  { segment: 'Occasional Users', count: 189, color: 'bg-yellow-500' },
                  { segment: 'At-Risk Users', count: 78, color: 'bg-red-500' }
                ].map((item) => (
                  <div key={item.segment} className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className='text-gray-700'>{item.segment}</span>
                    </div>
                    <span className='font-semibold text-gray-900'>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {selectedTab === 'engagement' && (
        <div className='space-y-6'>
          {/* Engagement Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Page Views</p>
                  <p className='text-2xl font-bold text-gray-900'>125.4K</p>
                </div>
                <Eye className='h-8 w-8 text-blue-600' />
              </div>
              <div className='mt-2 flex items-center text-sm'>
                <ArrowUp className='h-4 w-4 text-green-600 mr-1' />
                <span className='text-green-600'>+15.2% vs last week</span>
              </div>
            </div>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Bounce Rate</p>
                  <p className='text-2xl font-bold text-gray-900'>32.8%</p>
                </div>
                <TrendUp className='h-8 w-8 text-orange-600' />
              </div>
              <div className='mt-2 flex items-center text-sm'>
                <ArrowDown className='h-4 w-4 text-green-600 mr-1' />
                <span className='text-green-600'>-3.4% vs last week</span>
              </div>
            </div>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Pages/Session</p>
                  <p className='text-2xl font-bold text-gray-900'>4.7</p>
                </div>
                <FileText className='h-8 w-8 text-purple-600' />
              </div>
              <div className='mt-2 flex items-center text-sm'>
                <ArrowUp className='h-4 w-4 text-green-600 mr-1' />
                <span className='text-green-600'>+2.1% vs last week</span>
              </div>
            </div>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Click-through Rate</p>
                  <p className='text-2xl font-bold text-gray-900'>18.5%</p>
                </div>
                <MousePointer className='h-8 w-8 text-green-600' />
              </div>
              <div className='mt-2 flex items-center text-sm'>
                <ArrowUp className='h-4 w-4 text-green-600 mr-1' />
                <span className='text-green-600'>+7.8% vs last week</span>
              </div>
            </div>
          </div>

          {/* Content Performance */}
          <div className='bg-white rounded-lg p-6 shadow-sm border'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Content Performance</h3>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>Page</th>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>Views</th>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>Unique Visitors</th>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>Avg. Time</th>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>Bounce Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.realTime.popularPages.map((page, index) => (
                    <tr key={index} className='border-b hover:bg-gray-50'>
                      <td className='py-2 px-3 font-mono text-blue-600'>{page.path}</td>
                      <td className='py-2 px-3 font-semibold'>{page.views}</td>
                      <td className='py-2 px-3'>{Math.round(page.views * 0.7)}</td>
                      <td className='py-2 px-3'>2:34</td>
                      <td className='py-2 px-3'>
                        <span className='px-2 py-1 rounded-full text-xs bg-green-100 text-green-800'>
                          {(25 + index * 3).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {selectedTab === 'performance' && (
        <div className='space-y-6'>
          {/* Performance Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Uptime</p>
                  <p className='text-2xl font-bold text-green-600'>99.9%</p>
                </div>
                <Wifi className='h-8 w-8 text-green-600' />
              </div>
              <div className='mt-2 text-sm text-gray-600'>
                Last 30 days
              </div>
            </div>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Avg Response Time</p>
                  <p className='text-2xl font-bold text-blue-600'>245ms</p>
                </div>
                <Clock className='h-8 w-8 text-blue-600' />
              </div>
              <div className='mt-2 flex items-center text-sm'>
                <ArrowDown className='h-4 w-4 text-green-600 mr-1' />
                <span className='text-green-600'>-12ms vs yesterday</span>
              </div>
            </div>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Error Rate</p>
                  <p className='text-2xl font-bold text-red-600'>0.05%</p>
                </div>
                <AlertTriangle className='h-8 w-8 text-red-600' />
              </div>
              <div className='mt-2 flex items-center text-sm'>
                <ArrowDown className='h-4 w-4 text-green-600 mr-1' />
                <span className='text-green-600'>-0.02% vs last week</span>
              </div>
            </div>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Page Load Time</p>
                  <p className='text-2xl font-bold text-purple-600'>1.2s</p>
                </div>
                <TrendingUp className='h-8 w-8 text-purple-600' />
              </div>
              <div className='mt-2 flex items-center text-sm'>
                <ArrowDown className='h-4 w-4 text-green-600 mr-1' />
                <span className='text-green-600'>-0.3s vs last month</span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>System Health</h3>
              <div className='space-y-4'>
                {[
                  { service: 'Database', status: 'healthy', uptime: '99.98%', responseTime: '12ms' },
                  { service: 'API Gateway', status: 'healthy', uptime: '99.95%', responseTime: '45ms' },
                  { service: 'Authentication', status: 'healthy', uptime: '99.99%', responseTime: '23ms' },
                  { service: 'File Storage', status: 'warning', uptime: '99.85%', responseTime: '156ms' },
                  { service: 'Real-time Chat', status: 'healthy', uptime: '99.92%', responseTime: '78ms' }
                ].map((service) => (
                  <div key={service.service} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center space-x-3'>
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-500' :
                        service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className='font-medium text-gray-900'>{service.service}</span>
                    </div>
                    <div className='text-right text-sm text-gray-600'>
                      <div>{service.uptime} uptime</div>
                      <div>{service.responseTime} avg</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Recent Errors</h3>
              <div className='space-y-3'>
                {[
                  { error: 'Database connection timeout', count: 3, time: '2 hours ago' },
                  { error: 'File upload failed', count: 1, time: '5 hours ago' },
                  { error: 'Authentication token expired', count: 7, time: '8 hours ago' },
                  { error: 'API rate limit exceeded', count: 2, time: '1 day ago' }
                ].map((error, index) => (
                  <div key={index} className='flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500'>
                    <div>
                      <div className='font-medium text-gray-900'>{error.error}</div>
                      <div className='text-sm text-gray-600'>{error.time}</div>
                    </div>
                    <div className='text-red-600 font-semibold'>{error.count}x</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Feature Adoption */}
      <div className='bg-white rounded-lg p-6 shadow-sm border'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <Settings className='h-5 w-5 mr-2' />
          Feature Adoption Rates
        </h3>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {data.engagement.featureAdoption.map((feature, index) => {
            const adoptionRate = (feature.adopted / feature.total) * 100
            return (
              <div key={index} className='p-4 border rounded-lg'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-medium text-gray-900'>{feature.feature}</span>
                  <span className='text-sm font-semibold text-blue-600'>
                    {adoptionRate.toFixed(1)}%
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div 
                    className={`h-2 rounded-full ${
                      adoptionRate >= 80 ? 'bg-green-500' : 
                      adoptionRate >= 60 ? 'bg-yellow-500' : 
                      adoptionRate >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${adoptionRate}%` }}
                  ></div>
                </div>
                <div className='text-xs text-gray-600 mt-1'>
                  {feature.adopted} of {feature.total} users
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}