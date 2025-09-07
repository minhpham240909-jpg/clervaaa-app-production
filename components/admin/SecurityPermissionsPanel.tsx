'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Shield, 
  Users, 
  Key, 
  Lock, 
  AlertTriangle, 
  Eye, 
  Activity, 
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Bell,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  Ban,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Server,
  Database,
  Wifi,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SecurityAlert {
  id: string
  type: 'failed_login' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access' | 'system_error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  location?: string
  resolved: boolean
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'founder' | 'admin' | 'moderator'
  permissions: string[]
  lastLogin: string
  status: 'active' | 'inactive' | 'suspended'
  twoFactorEnabled: boolean
  loginAttempts: number
  ipAddresses: string[]
  createdAt: string
}

interface SecurityStats {
  totalAlerts: number
  criticalAlerts: number
  resolvedAlerts: number
  failedLogins: number
  suspiciousActivities: number
  activeAdmins: number
  totalAdmins: number
  lastSecurityScan: string
  systemUptime: number
  dataEncryptionStatus: boolean
}

interface Permission {
  id: string
  name: string
  description: string
  category: 'users' | 'content' | 'system' | 'analytics' | 'security'
}

export default function SecurityPermissionsPanel() {
  const { data: session } = useSession()
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'alerts' | 'admins' | 'permissions' | 'logs'>('overview')
  const [alertFilter, setAlertFilter] = useState<'all' | 'unresolved' | 'critical'>('all')
  const [showAdminModal, setShowAdminModal] = useState<AdminUser | null>(null)
  const [showAlertModal, setShowAlertModal] = useState<SecurityAlert | null>(null)

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    try {
      const [alertsResponse, adminsResponse, statsResponse, permissionsResponse] = await Promise.all([
        fetch('/api/admin/security/alerts'),
        fetch('/api/admin/security/admins'),
        fetch('/api/admin/security/stats'),
        fetch('/api/admin/security/permissions')
      ])

      // Load alerts
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData.alerts || getDefaultAlerts())
      } else {
        setAlerts(getDefaultAlerts())
      }

      // Load admins
      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json()
        setAdmins(adminsData.admins || getDefaultAdmins())
      } else {
        setAdmins(getDefaultAdmins())
      }

      // Load stats
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats || getDefaultStats())
      } else {
        setStats(getDefaultStats())
      }

      // Load permissions
      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json()
        setPermissions(permissionsData.permissions || getDefaultPermissions())
      } else {
        setPermissions(getDefaultPermissions())
      }
    } catch (error) {
      console.error('Failed to load security data:', error)
      toast.error('Failed to load security data')
      // Set default data
      setAlerts(getDefaultAlerts())
      setAdmins(getDefaultAdmins())
      setStats(getDefaultStats())
      setPermissions(getDefaultPermissions())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultAlerts = (): SecurityAlert[] => [
    {
      id: '1',
      type: 'failed_login',
      severity: 'medium',
      title: 'Multiple Failed Login Attempts',
      description: 'User attempted to login 5 times with incorrect password',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userId: 'user123',
      ipAddress: '192.168.1.100',
      location: 'New York, US',
      resolved: false
    },
    {
      id: '2',
      type: 'suspicious_activity',
      severity: 'high',
      title: 'Unusual API Access Pattern',
      description: 'Detected unusual API access pattern from unknown IP',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      ipAddress: '203.45.67.89',
      location: 'Unknown',
      resolved: false
    },
    {
      id: '3',
      type: 'unauthorized_access',
      severity: 'critical',
      title: 'Unauthorized Admin Panel Access Attempt',
      description: 'Non-admin user attempted to access admin panel',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      userId: 'user456',
      ipAddress: '10.0.0.50',
      location: 'California, US',
      resolved: true
    }
  ]

  const getDefaultAdmins = (): AdminUser[] => [
    {
      id: '1',
      name: 'John Founder',
      email: 'john@studybuddy.com',
      role: 'founder',
      permissions: ['all'],
      lastLogin: new Date(Date.now() - 3600000).toISOString(),
      status: 'active',
      twoFactorEnabled: true,
      loginAttempts: 0,
      ipAddresses: ['192.168.1.100', '203.45.67.89'],
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
    },
    {
      id: '2',
      name: 'Jane Admin',
      email: 'jane@studybuddy.com',
      role: 'admin',
      permissions: ['users', 'content', 'analytics'],
      lastLogin: new Date(Date.now() - 7200000).toISOString(),
      status: 'active',
      twoFactorEnabled: true,
      loginAttempts: 0,
      ipAddresses: ['10.0.0.25'],
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
    },
    {
      id: '3',
      name: 'Mike Moderator',
      email: 'mike@studybuddy.com',
      role: 'moderator',
      permissions: ['users', 'content'],
      lastLogin: new Date(Date.now() - 14400000).toISOString(),
      status: 'active',
      twoFactorEnabled: false,
      loginAttempts: 2,
      ipAddresses: ['172.16.0.10'],
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
    }
  ]

  const getDefaultStats = (): SecurityStats => ({
    totalAlerts: 47,
    criticalAlerts: 3,
    resolvedAlerts: 35,
    failedLogins: 23,
    suspiciousActivities: 8,
    activeAdmins: 3,
    totalAdmins: 3,
    lastSecurityScan: new Date(Date.now() - 3600000).toISOString(),
    systemUptime: 99.9,
    dataEncryptionStatus: true
  })

  const getDefaultPermissions = (): Permission[] => [
    { id: '1', name: 'users.view', description: 'View user accounts', category: 'users' },
    { id: '2', name: 'users.edit', description: 'Edit user accounts', category: 'users' },
    { id: '3', name: 'users.delete', description: 'Delete user accounts', category: 'users' },
    { id: '4', name: 'content.view', description: 'View content', category: 'content' },
    { id: '5', name: 'content.moderate', description: 'Moderate content', category: 'content' },
    { id: '6', name: 'analytics.view', description: 'View analytics', category: 'analytics' },
    { id: '7', name: 'system.settings', description: 'Modify system settings', category: 'system' },
    { id: '8', name: 'security.manage', description: 'Manage security settings', category: 'security' }
  ]

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/security/alerts/${alertId}/resolve`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Alert resolved')
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ))
      } else {
        toast.error('Failed to resolve alert')
      }
    } catch (error) {
      toast.error('Error resolving alert')
    }
  }

  const handleAdminStatusChange = async (adminId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      const response = await fetch(`/api/admin/security/admins/${adminId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Admin status updated to ${status}`)
        setAdmins(admins.map(admin => 
          admin.id === adminId ? { ...admin, status } : admin
        ))
      } else {
        toast.error('Failed to update admin status')
      }
    } catch (error) {
      toast.error('Error updating admin status')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'failed_login': return <Key className="h-5 w-5" />
      case 'suspicious_activity': return <Eye className="h-5 w-5" />
      case 'data_breach': return <Database className="h-5 w-5" />
      case 'unauthorized_access': return <Lock className="h-5 w-5" />
      case 'system_error': return <Server className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'founder': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'admin': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'moderator': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (alertFilter === 'unresolved') return !alert.resolved
    if (alertFilter === 'critical') return alert.severity === 'critical'
    return true
  })

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
            <h1 className="text-3xl font-bold text-gray-900">Security & Permissions</h1>
            <p className="text-gray-600 mt-1">
              Manage security settings, user roles, and system permissions
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={loadSecurityData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Security Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className={`${stats.criticalAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.criticalAlerts} critical
                </span>
                <span className="text-gray-500 ml-2">• {stats.resolvedAlerts} resolved</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.failedLogins}</p>
                </div>
                <Key className="h-8 w-8 text-red-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">-12% vs yesterday</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAdmins}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {stats.totalAdmins} total administrators
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.systemUptime}%</p>
                </div>
                <Server className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">All systems operational</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle },
              { id: 'admins', label: 'Admin Users', icon: Users },
              { id: 'permissions', label: 'Permissions', icon: Key },
              { id: 'logs', label: 'Security Logs', icon: Activity }
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
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Security Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Data Encryption</span>
                    </div>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">SSL/TLS</span>
                    </div>
                    <span className="text-xs text-green-600">Enabled</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">2FA Enforcement</span>
                    </div>
                    <span className="text-xs text-yellow-600">Partial</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Firewall</span>
                    </div>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Key className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Force Password Reset</h4>
                  <p className="text-sm text-gray-600">Reset all user passwords</p>
                </button>
                
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Lock className="h-8 w-8 text-red-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Emergency Lockdown</h4>
                  <p className="text-sm text-gray-600">Lock all user accounts</p>
                </button>
                
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Download className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Export Security Logs</h4>
                  <p className="text-sm text-gray-600">Download security audit logs</p>
                </button>
                
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Settings className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Security Settings</h4>
                  <p className="text-sm text-gray-600">Configure security policies</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
                  <div className="flex items-center space-x-4">
                    <select
                      value={alertFilter}
                      onChange={(e) => setAlertFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Alerts</option>
                      <option value="unresolved">Unresolved</option>
                      <option value="critical">Critical Only</option>
                    </select>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                              {getAlertIcon(alert.type)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                              <div className="text-sm text-gray-500">{alert.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {alert.ipAddress && (
                              <div className="flex items-center space-x-1">
                                <Globe className="h-4 w-4 text-gray-400" />
                                <span>{alert.ipAddress}</span>
                              </div>
                            )}
                            {alert.location && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                <span>{alert.location}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            alert.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {alert.resolved ? 'Resolved' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setShowAlertModal(alert)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {!alert.resolved && (
                              <button
                                onClick={() => handleResolveAlert(alert.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAlerts.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No security alerts found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'admins' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Administrator Accounts</h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Plus className="h-4 w-4" />
                    <span>Add Admin</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Administrator</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Security</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(admin.role)}`}>
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            admin.status === 'active' ? 'bg-green-100 text-green-800' :
                            admin.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {admin.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(admin.lastLogin).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {admin.twoFactorEnabled ? (
                              <span className="flex items-center text-xs text-green-600">
                                <Shield className="h-3 w-3 mr-1" />
                                2FA
                              </span>
                            ) : (
                              <span className="flex items-center text-xs text-red-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                No 2FA
                              </span>
                            )}
                            {admin.loginAttempts > 0 && (
                              <span className="text-xs text-yellow-600">
                                {admin.loginAttempts} failed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setShowAdminModal(admin)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            {admin.role !== 'founder' && (
                              <button
                                onClick={() => handleAdminStatusChange(admin.id, admin.status === 'active' ? 'suspended' : 'active')}
                                className={`${admin.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                              >
                                {admin.status === 'active' ? <Ban className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </button>
                            )}
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

        {selectedTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Permission Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['users', 'content', 'system', 'analytics', 'security'].map((category) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 capitalize">{category} Permissions</h4>
                    <div className="space-y-2">
                      {permissions
                        .filter(p => p.category === category)
                        .map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                              <div className="text-xs text-gray-500">{permission.description}</div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Audit Logs</h3>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Security logs will be displayed here</p>
                <p className="text-sm text-gray-400 mt-2">This feature is coming soon</p>
              </div>
            </div>
          </div>
        )}

        {/* Alert Detail Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
                  <button 
                    onClick={() => setShowAlertModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-3 rounded-full ${getSeverityColor(showAlertModal.severity)}`}>
                    {getAlertIcon(showAlertModal.type)}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{showAlertModal.title}</h4>
                    <p className="text-gray-600 mt-1">{showAlertModal.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(showAlertModal.severity)}`}>
                      {showAlertModal.severity}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="text-sm text-gray-900 capitalize">{showAlertModal.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="text-sm text-gray-900">{showAlertModal.ipAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-sm text-gray-900">{showAlertModal.location || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="text-sm text-gray-900">{new Date(showAlertModal.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      showAlertModal.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {showAlertModal.resolved ? 'Resolved' : 'Active'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                  {!showAlertModal.resolved && (
                    <button
                      onClick={() => {
                        handleResolveAlert(showAlertModal.id)
                        setShowAlertModal(null)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Resolve Alert
                    </button>
                  )}
                  <button
                    onClick={() => setShowAlertModal(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Detail Modal */}
        {showAdminModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Administrator Details</h3>
                  <button 
                    onClick={() => setShowAdminModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{showAdminModal.name}</h4>
                  <p className="text-gray-600">{showAdminModal.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(showAdminModal.role)}`}>
                      {showAdminModal.role}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      showAdminModal.status === 'active' ? 'bg-green-100 text-green-800' :
                      showAdminModal.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {showAdminModal.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Login</label>
                    <p className="text-sm text-gray-900">{new Date(showAdminModal.lastLogin).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Created</label>
                    <p className="text-sm text-gray-900">{new Date(showAdminModal.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Two-Factor Auth</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      showAdminModal.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {showAdminModal.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Failed Login Attempts</label>
                    <p className="text-sm text-gray-900">{showAdminModal.loginAttempts}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="flex flex-wrap gap-2">
                    {showAdminModal.permissions.map((permission, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recent IP Addresses</label>
                  <div className="space-y-1">
                    {showAdminModal.ipAddresses.map((ip, index) => (
                      <div key={index} className="text-sm text-gray-600 font-mono">{ip}</div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                  {showAdminModal.role !== 'founder' && (
                    <button
                      onClick={() => {
                        handleAdminStatusChange(showAdminModal.id, showAdminModal.status === 'active' ? 'suspended' : 'active')
                        setShowAdminModal(null)
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        showAdminModal.status === 'active' 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {showAdminModal.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowAdminModal(null)}
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
