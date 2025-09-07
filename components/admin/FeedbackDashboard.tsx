'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  MessageSquare, 
  Lightbulb, 
  Bug, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Star,
  Filter,
  Search,
  Download,
  Eye,
  MessageCircle,
  User,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Feedback {
  id: string
  type: 'feedback' | 'idea' | 'bug'
  content: string
  rating?: number
  userId?: string
  userEmail?: string
  status: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  user?: {
    id: string
    name?: string
    email: string
    image?: string
  }
  responses?: Array<{
    id: string
    message: string
    createdAt: string
    isPublic: boolean
  }>
}

interface FeedbackStats {
  total: number
  byType: Record<string, number>
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  avgRating: number
  recentTrend: 'up' | 'down' | 'stable'
}

export default function FeedbackDashboard() {
  const { data: session, status } = useSession()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    if (status === 'authenticated') {
      loadFeedback()
      loadStats()
    }
  }, [status, currentPage, typeFilter, statusFilter, priorityFilter, searchQuery])

  const loadFeedback = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })
      
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/feedback?${params}`)
      const data = await response.json()

      if (response.ok) {
        setFeedback(data.feedback)
        setTotalPages(data.pagination.totalPages)
      } else {
        toast.error('Failed to load feedback')
      }
    } catch (error) {
      toast.error('Error loading feedback')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/feedback/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const updateFeedbackStatus = async (id: string, status: string, priority?: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority })
      })

      if (response.ok) {
        await loadFeedback()
        toast.success('Feedback updated successfully')
      } else {
        toast.error('Failed to update feedback')
      }
    } catch (error) {
      toast.error('Error updating feedback')
    }
  }

  const exportFeedback = async () => {
    try {
      const response = await fetch('/api/feedback/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Feedback exported successfully')
    } catch (error) {
      toast.error('Failed to export feedback')
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
          <h1 className='text-2xl font-bold mb-4'>Admin Access Required</h1>
          <p>Please sign in as an administrator to view this page.</p>
        </div>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feedback': return <MessageSquare className='h-4 w-4' />
      case 'idea': return <Lightbulb className='h-4 w-4' />
      case 'bug': return <Bug className='h-4 w-4' />
      default: return <MessageSquare className='h-4 w-4' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'reviewed': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Feedback Dashboard</h1>
          <p className='text-gray-600 mt-1'>Manage user feedback, ideas, and bug reports</p>
        </div>
        <button
          onClick={exportFeedback}
          className='btn-outline flex items-center space-x-2'
        >
          <Download className='h-4 w-4' />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <div className='bg-white rounded-lg p-6 shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Feedback</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
              </div>
              <BarChart3 className='h-8 w-8 text-blue-600' />
            </div>
            <div className='mt-2 flex items-center text-sm'>
              {stats.recentTrend === 'up' ? (
                <TrendingUp className='h-4 w-4 text-green-600 mr-1' />
              ) : stats.recentTrend === 'down' ? (
                <TrendingDown className='h-4 w-4 text-red-600 mr-1' />
              ) : null}
              <span className={`${
                stats.recentTrend === 'up' ? 'text-green-600' : 
                stats.recentTrend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {stats.recentTrend === 'stable' ? 'Stable' : 
                 stats.recentTrend === 'up' ? 'Trending up' : 'Trending down'}
              </span>
            </div>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Avg Rating</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.avgRating ? stats.avgRating.toFixed(1) : 'N/A'}
                </p>
              </div>
              <Star className='h-8 w-8 text-yellow-600' />
            </div>
            <div className='mt-2 flex items-center'>
              {stats.avgRating && (
                <div className='flex'>
                  {[1, 2, 3, 4, 5].map((star: any) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(stats.avgRating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>New Items</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.byStatus.new || 0}
                </p>
              </div>
              <Clock className='h-8 w-8 text-orange-600' />
            </div>
            <p className='text-xs text-gray-500 mt-2'>Needs attention</p>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Critical</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.byPriority.critical || 0}
                </p>
              </div>
              <AlertCircle className='h-8 w-8 text-red-600' />
            </div>
            <p className='text-xs text-gray-500 mt-2'>High priority items</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className='bg-white rounded-lg p-4 shadow-sm border'>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Search</label>
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                placeholder='Search feedback...'
                className='input-field pl-10'
              />
            </div>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Type</label>
            <select
              value={typeFilter}
              onChange={(e: any) => setTypeFilter(e.target.value)}
              className='input-field'
            >
              <option value='all'>All Types</option>
              <option value='feedback'>Feedback</option>
              <option value='idea'>Ideas</option>
              <option value='bug'>Bugs</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className='input-field'
            >
              <option value='all'>All Status</option>
              <option value='new'>New</option>
              <option value='reviewed'>Reviewed</option>
              <option value='in_progress'>In Progress</option>
              <option value='resolved'>Resolved</option>
              <option value='closed'>Closed</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Priority</label>
            <select
              value={priorityFilter}
              onChange={(e: any) => setPriorityFilter(e.target.value)}
              className='input-field'
            >
              <option value='all'>All Priorities</option>
              <option value='critical'>Critical</option>
              <option value='high'>High</option>
              <option value='medium'>Medium</option>
              <option value='low'>Low</option>
            </select>
          </div>

          <div className='flex items-end'>
            <button
              onClick={() => {
                setTypeFilter('all')
                setStatusFilter('all')
                setPriorityFilter('all')
                setSearchQuery('')
              }}
              className='btn-outline w-full'
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className='bg-white rounded-lg shadow-sm border overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Feedback
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  User
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Priority
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {feedback.map((item: any) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4'>
                    <div className='flex items-start space-x-3'>
                      <div className={`p-2 rounded-full bg-gray-100`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center space-x-2 mb-1'>
                          <span className='text-sm font-medium text-gray-900 capitalize'>
                            {item.type}
                          </span>
                          {item.completionStatus && (
                            <div className='flex items-center space-x-1'>
                              <Star className='h-3 w-3 text-yellow-400 fill-current' />
                              <span className='text-xs text-gray-600'>{item.completionStatus}/5</span>
                            </div>
                          )}
                        </div>
                        <p className='text-sm text-gray-600 line-clamp-2'>
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className='px-6 py-4'>
                    <div className='flex items-center space-x-2'>
                      <User className='h-4 w-4 text-gray-400' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {item.user?.name || 'Anonymous'}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {item.userEmail || 'No email'}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className='px-6 py-4'>
                    <select
                      value={item.status}
                      onChange={(e: any) => updateFeedbackStatus(item.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(item.status)}`}
                    >
                      <option value='new'>New</option>
                      <option value='reviewed'>Reviewed</option>
                      <option value='in_progress'>In Progress</option>
                      <option value='resolved'>Resolved</option>
                      <option value='closed'>Closed</option>
                    </select>
                  </td>
                  
                  <td className='px-6 py-4'>
                    <select
                      value={item.priority}
                      onChange={(e: any) => updateFeedbackStatus(item.id, item.status, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}
                    >
                      <option value='low'>Low</option>
                      <option value='medium'>Medium</option>
                      <option value='high'>High</option>
                      <option value='critical'>Critical</option>
                    </select>
                  </td>
                  
                  <td className='px-6 py-4 text-sm text-gray-500'>
                    <div className='flex items-center space-x-1'>
                      <Calendar className='h-3 w-3' />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  
                  <td className='px-6 py-4'>
                    <button
                      onClick={() => setSelectedFeedback(item)}
                      className='text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1'
                    >
                      <Eye className='h-3 w-3' />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='bg-white px-4 py-3 border-t border-gray-200'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-700'>
                Page {currentPage} of {totalPages}
              </div>
              <div className='flex space-x-2'>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className='btn-outline text-sm disabled:opacity-50'
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className='btn-outline text-sm disabled:opacity-50'
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      {selectedFeedback && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>Feedback Details</h2>
              <button
                onClick={() => setSelectedFeedback(null)}
                className='text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            </div>
            
            <div className='space-y-6'>
              {/* Feedback Info */}
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Type</label>
                  <div className='mt-1 flex items-center space-x-2'>
                    {getTypeIcon(selectedFeedback.type)}
                    <span className='capitalize'>{selectedFeedback.type}</span>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Rating</label>
                  <div className='mt-1'>
                    {selectedFeedback.priority ? (
                      <div className='flex items-center space-x-1'>
                        <span className='text-sm text-gray-600'>
                          Priority: {selectedFeedback.priority}
                        </span>
                      </div>
                    ) : (
                      <span className='text-gray-500'>No priority set</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>Message</label>
                <div className='mt-1 p-4 bg-gray-50 rounded-lg'>
                  <p className='text-gray-900 whitespace-pre-wrap'>
                    {selectedFeedback.content}
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>User</label>
                  <div className='mt-1'>
                    <p className='text-gray-900'>
                      {selectedFeedback.user?.name || 'Anonymous User'}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {selectedFeedback.userEmail || 'No email provided'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Submitted</label>
                  <p className='mt-1 text-gray-900'>
                    {new Date(selectedFeedback.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Management */}
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Status</label>
                  <select
                    value={selectedFeedback.status}
                    onChange={(e: any) => updateFeedbackStatus(selectedFeedback.id, e.target.value)}
                    className='mt-1 input-field'
                  >
                    <option value='new'>New</option>
                    <option value='reviewed'>Reviewed</option>
                    <option value='in_progress'>In Progress</option>
                    <option value='resolved'>Resolved</option>
                    <option value='closed'>Closed</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Priority</label>
                  <select
                    value={selectedFeedback.priority}
                    onChange={(e: any) => updateFeedbackStatus(selectedFeedback.id, selectedFeedback.status, e.target.value)}
                    className='mt-1 input-field'
                  >
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                    <option value='critical'>Critical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}