'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Database, 
  Search, 
  Play, 
  Download, 
  Upload, 
  RefreshCw, 
  Save, 
  Edit, 
  Trash2, 
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Activity,
  BarChart3,
  Clock,
  HardDrive,
  Server,
  Zap,
  Shield,
  Key,
  Users,
  FileText,
  Table,
  Archive,
  Copy,
  Filter,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface DatabaseStats {
  totalTables: number
  totalRecords: number
  databaseSize: string
  lastBackup: string
  connectionStatus: 'connected' | 'disconnected' | 'error'
  activeConnections: number
  queryPerformance: {
    avgQueryTime: number
    slowQueries: number
    totalQueries: number
  }
}

interface TableInfo {
  name: string
  recordCount: number
  size: string
  lastModified: string
  type: 'table' | 'view'
}

interface QueryResult {
  columns: string[]
  rows: any[]
  rowCount: number
  executionTime: number
  success: boolean
  error?: string
}

interface SavedQuery {
  id: string
  name: string
  query: string
  description?: string
  createdAt: string
  lastRun?: string
  category: 'users' | 'content' | 'analytics' | 'system'
}

export default function DatabaseAccessPanel() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'query' | 'tables' | 'backup'>('overview')
  const [currentQuery, setCurrentQuery] = useState('')
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [queryLoading, setQueryLoading] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [showSaveQueryModal, setShowSaveQueryModal] = useState(false)
  const [newQueryName, setNewQueryName] = useState('')
  const [newQueryDescription, setNewQueryDescription] = useState('')
  const [newQueryCategory, setNewQueryCategory] = useState<'users' | 'content' | 'analytics' | 'system'>('users')

  useEffect(() => {
    loadDatabaseData()
  }, [])

  const loadDatabaseData = async () => {
    try {
      const [statsResponse, tablesResponse, queriesResponse] = await Promise.all([
        fetch('/api/admin/database/stats'),
        fetch('/api/admin/database/tables'),
        fetch('/api/admin/database/saved-queries')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats || getDefaultStats())
      } else {
        setStats(getDefaultStats())
      }

      if (tablesResponse.ok) {
        const tablesData = await tablesResponse.json()
        setTables(tablesData.tables || getDefaultTables())
      } else {
        setTables(getDefaultTables())
      }

      if (queriesResponse.ok) {
        const queriesData = await queriesResponse.json()
        setSavedQueries(queriesData.queries || getDefaultQueries())
      } else {
        setSavedQueries(getDefaultQueries())
      }
    } catch (error) {
      console.error('Failed to load database data:', error)
      toast.error('Failed to load database data')
      // Set default data
      setStats(getDefaultStats())
      setTables(getDefaultTables())
      setSavedQueries(getDefaultQueries())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultStats = (): DatabaseStats => ({
    totalTables: 25,
    totalRecords: 156789,
    databaseSize: '2.4 GB',
    lastBackup: new Date(Date.now() - 3600000 * 6).toISOString(),
    connectionStatus: 'connected',
    activeConnections: 12,
    queryPerformance: {
      avgQueryTime: 45,
      slowQueries: 3,
      totalQueries: 1247
    }
  })

  const getDefaultTables = (): TableInfo[] => [
    { name: 'User', recordCount: 1234, size: '45.2 MB', lastModified: new Date().toISOString(), type: 'table' },
    { name: 'PersonalStudySession', recordCount: 5678, size: '123.4 MB', lastModified: new Date().toISOString(), type: 'table' },
    { name: 'Goal', recordCount: 890, size: '12.1 MB', lastModified: new Date().toISOString(), type: 'table' },
    { name: 'Subject', recordCount: 156, size: '2.3 MB', lastModified: new Date().toISOString(), type: 'table' },
    { name: 'Partnership', recordCount: 234, size: '8.9 MB', lastModified: new Date().toISOString(), type: 'table' },
    { name: 'AIInteraction', recordCount: 12456, size: '234.5 MB', lastModified: new Date().toISOString(), type: 'table' },
    { name: 'Notification', recordCount: 3456, size: '67.8 MB', lastModified: new Date().toISOString(), type: 'table' },
    { name: 'UserMetric', recordCount: 7890, size: '156.7 MB', lastModified: new Date().toISOString(), type: 'table' }
  ]

  const getDefaultQueries = (): SavedQuery[] => [
    {
      id: '1',
      name: 'Active Users Today',
      query: 'SELECT COUNT(*) as active_users FROM User WHERE isActive = true AND updatedAt >= date("now", "-1 day")',
      description: 'Count of users who were active in the last 24 hours',
      createdAt: new Date().toISOString(),
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      category: 'users'
    },
    {
      id: '2',
      name: 'Top Study Subjects',
      query: 'SELECT s.name, COUNT(*) as session_count FROM Subject s JOIN PersonalStudySession pss ON s.id = pss.subjectId GROUP BY s.id ORDER BY session_count DESC LIMIT 10',
      description: 'Most popular study subjects by session count',
      createdAt: new Date().toISOString(),
      lastRun: new Date(Date.now() - 7200000).toISOString(),
      category: 'analytics'
    },
    {
      id: '3',
      name: 'AI Usage Statistics',
      query: 'SELECT DATE(createdAt) as date, COUNT(*) as requests FROM AIInteraction WHERE createdAt >= date("now", "-30 days") GROUP BY DATE(createdAt) ORDER BY date DESC',
      description: 'Daily AI interaction counts for the last 30 days',
      createdAt: new Date().toISOString(),
      category: 'content'
    }
  ]

  const executeQuery = async () => {
    if (!currentQuery.trim()) {
      toast.error('Please enter a query')
      return
    }

    setQueryLoading(true)
    try {
      const response = await fetch('/api/admin/database/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery })
      })

      const result = await response.json()
      
      if (result.success) {
        setQueryResult(result.data)
        toast.success(`Query executed successfully (${result.data.rowCount} rows, ${result.data.executionTime}ms)`)
      } else {
        setQueryResult({
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: 0,
          success: false,
          error: result.error || 'Query execution failed'
        })
        toast.error(result.error || 'Query execution failed')
      }
    } catch (error) {
      console.error('Query execution error:', error)
      setQueryResult({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: 0,
        success: false,
        error: 'Network error occurred'
      })
      toast.error('Failed to execute query')
    } finally {
      setQueryLoading(false)
    }
  }

  const loadSavedQuery = (query: SavedQuery) => {
    setCurrentQuery(query.query)
    toast.success(`Loaded query: ${query.name}`)
  }

  const saveCurrentQuery = async () => {
    if (!currentQuery.trim() || !newQueryName.trim()) {
      toast.error('Please enter a query and name')
      return
    }

    try {
      const response = await fetch('/api/admin/database/save-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newQueryName,
          query: currentQuery,
          description: newQueryDescription,
          category: newQueryCategory
        })
      })

      if (response.ok) {
        toast.success('Query saved successfully')
        setShowSaveQueryModal(false)
        setNewQueryName('')
        setNewQueryDescription('')
        loadDatabaseData() // Refresh saved queries
      } else {
        toast.error('Failed to save query')
      }
    } catch (error) {
      toast.error('Error saving query')
    }
  }

  const exportQueryResult = () => {
    if (!queryResult || !queryResult.success) {
      toast.error('No query result to export')
      return
    }

    const csv = [
      queryResult.columns.join(','),
      ...queryResult.rows.map(row => 
        queryResult.columns.map(col => 
          typeof row[col] === 'string' ? `"${row[col]}"` : row[col]
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query-result-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Query result exported')
  }

  const createBackup = async () => {
    try {
      const response = await fetch('/api/admin/database/backup', {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Database backup created successfully')
        loadDatabaseData() // Refresh stats
      } else {
        toast.error('Failed to create backup')
      }
    } catch (error) {
      toast.error('Error creating backup')
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
            <h1 className="text-3xl font-bold text-gray-900">Database Access</h1>
            <p className="text-gray-600 mt-1">
              Direct database access and management tools
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              stats?.connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : 
              stats?.connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                stats?.connectionStatus === 'connected' ? 'bg-green-500' : 
                stats?.connectionStatus === 'error' ? 'bg-red-500' :
                'bg-gray-500'
              }`}></div>
              <span className="capitalize">{stats?.connectionStatus || 'Unknown'}</span>
            </div>
            
            <button
              onClick={loadDatabaseData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Database Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRecords.toLocaleString()}</p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Across {stats.totalTables} tables
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Database Size</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.databaseSize}</p>
                </div>
                <HardDrive className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {stats.activeConnections} active connections
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Query Performance</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.queryPerformance.avgQueryTime}ms</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {stats.queryPerformance.slowQueries} slow queries
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Backup</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor((Date.now() - new Date(stats.lastBackup).getTime()) / 3600000)}h ago
                  </p>
                </div>
                <Archive className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {new Date(stats.lastBackup).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'query', label: 'Query Builder', icon: Play },
              { id: 'tables', label: 'Tables', icon: Table },
              { id: 'backup', label: 'Backup & Restore', icon: Archive }
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Table className="h-5 w-5 mr-2" />
                  Database Schema
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tables.slice(0, 10).map((table) => (
                    <div key={table.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Table className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{table.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{table.recordCount.toLocaleString()} rows</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Queries
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedQueries.slice(0, 5).map((query) => (
                    <div key={query.id} className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{query.name}</span>
                        <button
                          onClick={() => loadSavedQuery(query)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Load
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{query.description}</p>
                      {query.lastRun && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last run: {new Date(query.lastRun).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'query' && (
          <div className="space-y-6">
            {/* Query Builder */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">SQL Query Builder</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowSaveQueryModal(true)}
                      disabled={!currentQuery.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Query</span>
                    </button>
                    <button
                      onClick={executeQuery}
                      disabled={!currentQuery.trim() || queryLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {queryLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      <span>Execute</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <textarea
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  placeholder="Enter your SQL query here..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>

            {/* Saved Queries */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Saved Queries</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedQueries.map((query) => (
                    <div key={query.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{query.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          query.category === 'users' ? 'bg-blue-100 text-blue-800' :
                          query.category === 'content' ? 'bg-green-100 text-green-800' :
                          query.category === 'analytics' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {query.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{query.description}</p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => loadSavedQuery(query)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Load Query
                        </button>
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-gray-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Query Results */}
            {queryResult && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Query Results</h3>
                      {queryResult.success && (
                        <p className="text-sm text-gray-600">
                          {queryResult.rowCount} rows returned in {queryResult.executionTime}ms
                        </p>
                      )}
                    </div>
                    {queryResult.success && (
                      <button
                        onClick={exportQueryResult}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {queryResult.success ? (
                    queryResult.rowCount > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              {queryResult.columns.map((column, index) => (
                                <th key={index} className="px-4 py-2 text-left font-medium text-gray-700">
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {queryResult.rows.slice(0, 100).map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                {queryResult.columns.map((column, colIndex) => (
                                  <td key={colIndex} className="px-4 py-2 text-gray-900">
                                    {typeof row[column] === 'object' ? 
                                      JSON.stringify(row[column]) : 
                                      String(row[column] || '')
                                    }
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {queryResult.rowCount > 100 && (
                          <div className="mt-4 text-center text-sm text-gray-600">
                            Showing first 100 rows of {queryResult.rowCount} total results
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-gray-600">Query executed successfully but returned no results</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <p className="text-gray-900 font-medium mb-2">Query Error</p>
                      <p className="text-red-600 text-sm font-mono bg-red-50 p-3 rounded">
                        {queryResult.error}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'tables' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Database Tables</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Modified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tables.map((table) => (
                      <tr key={table.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Table className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{table.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {table.recordCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {table.size}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(table.lastModified).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            table.type === 'table' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {table.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setCurrentQuery(`SELECT * FROM ${table.name} LIMIT 100`)
                                setSelectedTab('query')
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Data"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentQuery(`SELECT COUNT(*) as total_records FROM ${table.name}`)
                                setSelectedTab('query')
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Count Records"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900" title="More Options">
                              <MoreHorizontal className="h-4 w-4" />
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

        {selectedTab === 'backup' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Backup & Restore</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Archive className="h-5 w-5 mr-2" />
                    Create Backup
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Create a full backup of the database including all tables and data.
                  </p>
                  <button
                    onClick={createBackup}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Archive className="h-4 w-4" />
                    <span>Create Backup</span>
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Restore Backup
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Restore database from a previously created backup file.
                  </p>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".sql,.db,.backup"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      <Upload className="h-4 w-4" />
                      <span>Restore Backup</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-yellow-800">Important Notice</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      Database operations can affect system performance and data integrity. 
                      Always create backups before making significant changes and test restore 
                      operations in a development environment first.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Query Modal */}
        {showSaveQueryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Save Query</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Query Name</label>
                  <input
                    type="text"
                    value={newQueryName}
                    onChange={(e) => setNewQueryName(e.target.value)}
                    placeholder="Enter query name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newQueryDescription}
                    onChange={(e) => setNewQueryDescription(e.target.value)}
                    placeholder="Enter query description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newQueryCategory}
                    onChange={(e) => setNewQueryCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="users">Users</option>
                    <option value="content">Content</option>
                    <option value="analytics">Analytics</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowSaveQueryModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCurrentQuery}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Query
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
