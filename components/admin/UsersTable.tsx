'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Calendar, 
  Award, 
  MapPin,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  MessageCircle,
  UserPlus,
  AlertTriangle,
  Settings,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Star,
  Target,
  BookOpen,
  Activity
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  university: string | null
  major: string | null
  year: string | null
  location: string | null
  studyLevel: string | null
  learningStyle: string | null
  totalPoints: number | null
  currentStreak: number | null
  profileComplete: boolean | null
  isActive: boolean | null
  createdAt: string
  updatedAt: string
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  premiumUsers: number
  averageSessionTime: number
  retentionRate: number
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'premium'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'totalPoints' | 'currentStreak'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showUserModal, setShowUserModal] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data.users)
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users data')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete' | 'sendEmail') => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first')
      return
    }

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers, action })
      })

      if (response.ok) {
        toast.success(`${action} completed for ${selectedUsers.length} users`)
        setSelectedUsers([])
        fetchUsers()
      } else {
        toast.error(`Failed to ${action} users`)
      }
    } catch (error) {
      toast.error(`Error performing ${action}`)
    }
  }

  const exportUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Users data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const filteredUsers = users
    .filter(user => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.university?.toLowerCase().includes(searchLower) ||
          user.major?.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
    .filter(user => {
      if (filterStatus === 'active') return user.isActive
      if (filterStatus === 'inactive') return !user.isActive
      if (filterStatus === 'premium') return (user.totalPoints || 0) > 1000
      return true
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof User] || 0
      const bValue = b[sortBy as keyof User] || 0
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalUsers}</p>
                <p className="text-sm text-neutral-600">Total Users</p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% vs last month
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.activeUsers}</p>
                <p className="text-sm text-neutral-600">Active Users</p>
              </div>
              <Activity className="h-8 w-8 text-accent-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8% vs yesterday
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.newUsersToday}</p>
                <p className="text-sm text-neutral-600">New Today</p>
              </div>
              <UserPlus className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="mt-2 text-sm text-neutral-600">
              vs 12 yesterday
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-neutral-900">89</p>
                <p className="text-sm text-neutral-600">Premium Users</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 text-sm text-neutral-600">
              12.1% conversion
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-neutral-900">24.5min</p>
                <p className="text-sm text-neutral-600">Avg Session</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +2.1min vs last week
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-neutral-900">73.4%</p>
                <p className="text-sm text-neutral-600">Retention Rate</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-red-600">
              <TrendingDown className="h-4 w-4 mr-1" />
              -2.3% vs last month
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name, email, university..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-80"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e: any) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
              <option value="premium">Premium Users</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e: any) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
              className="input-field"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="totalPoints-desc">Highest Points</option>
              <option value="currentStreak-desc">Highest Streak</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-600">
                  {selectedUsers.length} selected
                </span>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="btn-sm btn-primary"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="btn-sm btn-outline"
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('sendEmail')}
                  className="btn-sm btn-outline"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </button>
              </div>
            )}
            
            <button onClick={exportUsers} className="btn-outline flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                    className="rounded border-neutral-300"
                  />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">User</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">University</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Study Info</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Activity</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className={`border-b border-neutral-100 hover:bg-neutral-50 ${
                  selectedUsers.includes(user.id) ? 'bg-primary-50' : ''
                }`}>
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id])
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                        }
                      }}
                      className="rounded border-neutral-300"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.name || 'User'} 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-semibold">
                            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-neutral-900">{user.name || 'Anonymous'}</p>
                        <p className="text-sm text-neutral-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-neutral-900">
                    <div>
                      <p className="font-medium">{user.university || '-'}</p>
                      {user.location && (
                        <div className="flex items-center text-sm text-neutral-600 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {user.location}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-neutral-900">
                    <div>
                      <p className="font-medium">{user.major || '-'}</p>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-neutral-600">
                        {user.year && <span>Year: {user.year}</span>}
                        {user.learningStyle && (
                          <span className="px-2 py-1 bg-neutral-100 rounded-full text-xs capitalize">
                            {user.learningStyle}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-secondary-600">
                          {user.totalPoints || 0} pts
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-accent-600">
                          {user.currentStreak || 0} days
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          user.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          user.isActive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {user.profileComplete && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </span>
                      )}
                      
                      {(user.totalPoints || 0) > 1000 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-neutral-600">
                    <div>
                      <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-neutral-500">
                        {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowUserModal(user.id)}
                        className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-neutral-400 hover:text-blue-600 transition-colors"
                        title="Send Message"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                        title="More Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">
                {users.length === 0 ? 'No users found' : 'No users match your current filters'}
              </p>
              {searchTerm || filterStatus !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterStatus('all')
                  }}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">User Details</h3>
              <button
                onClick={() => setShowUserModal(null)}
                className="p-2 text-neutral-400 hover:text-neutral-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {(() => {
              const user = users.find(u => u.id === showUserModal)
              if (!user) return null
              
              return (
                <div className="space-y-6">
                  {/* User Header */}
                  <div className="flex items-center space-x-4 pb-6 border-b">
                    {user.image ? (
                      <img 
                        src={user.image} 
                        alt={user.name || 'User'} 
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600">
                          {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900">{user.name || 'Anonymous'}</h4>
                      <p className="text-neutral-600">{user.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {(user.totalPoints || 0) > 1000 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Premium User
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                      <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-neutral-900">{user.totalPoints || 0}</p>
                      <p className="text-sm text-neutral-600">Total Points</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                      <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-neutral-900">{user.currentStreak || 0}</p>
                      <p className="text-sm text-neutral-600">Day Streak</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                      <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-neutral-900">{user.studyLevel || 'N/A'}</p>
                      <p className="text-sm text-neutral-600">Study Level</p>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div>
                    <h5 className="font-medium text-neutral-900 mb-3">Academic Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-neutral-700">University:</span>
                        <p className="text-neutral-600">{user.university || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">Major:</span>
                        <p className="text-neutral-600">{user.major || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">Academic Year:</span>
                        <p className="text-neutral-600">{user.year || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">Learning Style:</span>
                        <p className="text-neutral-600 capitalize">{user.learningStyle || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h5 className="font-medium text-neutral-900 mb-3">Account Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-neutral-700">Joined:</span>
                        <p className="text-neutral-600">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">Last Updated:</span>
                        <p className="text-neutral-600">{new Date(user.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">Profile Complete:</span>
                        <p className={user.profileComplete ? 'text-green-600' : 'text-red-600'}>
                          {user.profileComplete ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-700">Location:</span>
                        <p className="text-neutral-600">{user.location || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-4 border-t">
                    <button className="btn-primary flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Send Email</span>
                    </button>
                    <button className="btn-outline flex items-center space-x-2">
                      <Edit className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button className="btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-2">
                      {user.isActive ? (
                        <>
                          <Ban className="h-4 w-4" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-neutral-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50">
            Previous
          </button>
          <button className="px-3 py-2 text-sm bg-primary-500 text-white rounded-lg">1</button>
          <button className="px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50">2</button>
          <button className="px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50">3</button>
          <button className="px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}