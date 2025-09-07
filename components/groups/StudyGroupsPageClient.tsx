'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar, BookOpen, Star, Plus, Search, Filter, X, MessageCircle, UserPlus, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface StudyGroup {
  id: string
  name: string
  subject: string
  description?: string
  members: number
  maxMembers?: number
  nextSession?: string
  level: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  role?: 'admin' | 'member' | null
  isPublic: boolean
  tags?: string[]
  createdAt: Date
}

interface GroupFilters {
  search: string
  subject: string
  level: string
}

const subjects = [
  { name: 'Mathematics', count: 24, color: 'bg-primary-100 text-primary-700' },
  { name: 'Computer Science', count: 18, color: 'bg-learning-light text-learning-dark' },
  { name: 'Physics', count: 15, color: 'bg-accent-100 text-accent-700' },
  { name: 'Chemistry', count: 12, color: 'bg-secondary-100 text-secondary-700' },
  { name: 'Biology', count: 10, color: 'bg-focus-light text-focus-dark' },
  { name: 'Business', count: 8, color: 'bg-motivation-light text-motivation-dark' },
  { name: 'Literature', count: 6, color: 'bg-purple-100 text-purple-700' },
  { name: 'History', count: 5, color: 'bg-orange-100 text-orange-700' }
]

const mockGroups: StudyGroup[] = [
  {
    id: '1',
    name: 'Calculus Master Class',
    subject: 'Mathematics',
    members: 12,
    maxMembers: 15,
    nextSession: 'Tomorrow, 2:00 PM',
    level: 'intermediate',
    rating: 4.8,
    role: 'admin',
    isPublic: true,
    description: 'Advanced calculus concepts with weekly problem-solving sessions.',
    tags: ['derivatives', 'integrals', 'limits'],
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'React Development',
    subject: 'Computer Science',
    members: 8,
    maxMembers: 12,
    nextSession: 'Friday, 4:00 PM',
    level: 'advanced',
    rating: 4.9,
    role: 'member',
    isPublic: true,
    description: 'Learn modern React development patterns and best practices.',
    tags: ['javascript', 'frontend', 'hooks'],
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Physics Problem Solving',
    subject: 'Physics',
    members: 15,
    maxMembers: 20,
    nextSession: 'Monday, 6:00 PM',
    level: 'intermediate',
    rating: 4.6,
    role: null,
    isPublic: true,
    description: 'Weekly sessions focused on solving complex physics problems together.',
    tags: ['mechanics', 'thermodynamics', 'waves'],
    createdAt: new Date()
  },
  {
    id: '4',
    name: 'Data Science Bootcamp',
    subject: 'Computer Science',
    members: 20,
    maxMembers: 25,
    nextSession: 'Wednesday, 7:00 PM',
    level: 'beginner',
    rating: 4.7,
    role: null,
    isPublic: true,
    description: 'Learn data science fundamentals with hands-on projects and peer support.',
    tags: ['python', 'statistics', 'machine learning'],
    createdAt: new Date()
  }
]

export default function StudyGroupsPageClient() {
  const router = useRouter()
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<GroupFilters>({
    search: '',
    subject: '',
    level: ''
  })
  const [showGroupModal, setShowGroupModal] = useState<StudyGroup | null>(null)
  const [joinLoading, setJoinLoading] = useState<string | null>(null)

  useEffect(() => {
    // Initialize with mock data first
    if (groups.length === 0 && !filters.search && !filters.subject && !filters.level) {
      setGroups(mockGroups)
      setLoading(false)
    } else {
      fetchGroups()
    }
  }, [filters])

  const fetchGroups = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.subject) params.append('subject', filters.subject)
      if (filters.level) params.append('level', filters.level)

      const response = await fetch(`/api/study-groups?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGroups(Array.isArray(data) ? data : [])
      } else {
        // Use mock data for demo
        const filtered = mockGroups.filter((group: any) => {
          const matchesSearch = !filters.search || 
            (group.name && group.name.toLowerCase().includes(filters.search.toLowerCase())) ||
            (group.description && group.description.toLowerCase().includes(filters.search.toLowerCase()))
          const matchesSubject = !filters.subject || group.subject === filters.subject
          const matchesLevel = !filters.level || group.level === filters.level
          
          return matchesSearch && matchesSubject && matchesLevel
        })
        setGroups(filtered)
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
      // Use filtered mock data
      const filtered = mockGroups.filter((group: any) => {
        const matchesSearch = !filters.search || 
          (group.name && group.name.toLowerCase().includes(filters.search.toLowerCase())) ||
          (group.description && group.description.toLowerCase().includes(filters.search.toLowerCase()))
        const matchesSubject = !filters.subject || group.subject === filters.subject
        const matchesLevel = !filters.level || group.level === filters.level
        
        return matchesSearch && matchesSubject && matchesLevel
      })
      setGroups(filtered)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    setJoinLoading(groupId)
    try {
      const response = await fetch(`/api/study-groups/${groupId}/join`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // Update group in local state
        setGroups((prevGroups: any) => (prevGroups || []).map((group: any) => 
          group.id === groupId 
            ? { ...group, members: group.members + 1, role: 'member' }
            : group
        ))
        alert('Successfully joined the group!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to join group')
      }
    } catch (error) {
      console.error('Failed to join group:', error)
      // For demo, simulate join
      setGroups((prevGroups: any) => (prevGroups || []).map((group: any) => 
        group.id === groupId 
          ? { ...group, members: group.members + 1, role: 'member' }
          : group
      ))
      alert('Successfully joined the group!')
    } finally {
      setJoinLoading(null)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to leave this group?')) return

    try {
      const response = await fetch(`/api/study-groups/${groupId}/leave`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setGroups((prevGroups: any) => (prevGroups || []).map((group: any) => 
          group.id === groupId 
            ? { ...group, members: group.members - 1, role: null }
            : group
        ))
        alert('Left the group successfully')
      }
    } catch (error) {
      console.error('Failed to leave group:', error)
      // For demo, simulate leave
      setGroups((prevGroups: any) => (prevGroups || []).map((group: any) => 
        group.id === groupId 
          ? { ...group, members: group.members - 1, role: null }
          : group
      ))
      alert('Left the group successfully')
    }
  }

  const handleViewGroup = (group: StudyGroup) => {
    setShowGroupModal(group)
  }

  const handleSubjectClick = (subjectName: string) => {
    setFilters(prev => ({ ...prev, subject: subjectName }))
  }

  const clearFilters = () => {
    setFilters({ search: '', subject: '', level: '' })
  }

  const myGroups = (groups || []).filter((group: any) => group.role)
  const recommendedGroups = (groups || []).filter((group: any) => !group.role)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-neutral-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="h-20 bg-neutral-200 rounded animate-pulse"></div>
        
        <div className="space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-32 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-neutral-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-heading text-neutral-900'>
            Study Groups
          </h1>
          <p className='text-neutral-600 mt-1'>
            Join or create study groups to learn together
          </p>
        </div>
        <Link href='/groups/new' className='btn-primary inline-flex items-center'>
          <Plus className='h-4 w-4 mr-2' />
          Create Group
        </Link>
      </div>

      {/* Search and Filter */}
      <div className='card'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='md:col-span-2'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
              <input
                type='text'
                placeholder='Search study groups...'
                className='input-field pl-10'
                value={filters.search}
                onChange={(e: any) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <select 
              className='input-field'
              value={filters.subject}
              onChange={(e: any) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
            >
              <option value=''>All Subjects</option>
              {subjects.map((subject: any) => (
                <option key={subject.name} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select 
              className='input-field'
              value={filters.level}
              onChange={(e: any) => setFilters(prev => ({ ...prev, level: e.target.value }))}
            >
              <option value=''>All Levels</option>
              <option value='beginner'>Beginner</option>
              <option value='intermediate'>Intermediate</option>
              <option value='advanced'>Advanced</option>
            </select>
          </div>
        </div>
        
        {(filters.search || filters.subject || filters.level) && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                  Search: "{filters.search}"
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="ml-1 text-primary-500 hover:text-primary-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.subject && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent-100 text-accent-700">
                  Subject: {filters.subject}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, subject: '' }))}
                    className="ml-1 text-accent-500 hover:text-accent-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.level && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 text-secondary-700">
                  Level: {filters.level}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, level: '' }))}
                    className="ml-1 text-secondary-500 hover:text-secondary-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-neutral-500 hover:text-neutral-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold text-neutral-900'>My Groups</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {myGroups.map((group: any) => (
              <div key={group.id} className='card hover:shadow-lg transition-shadow'>
                <div className='flex items-start justify-between mb-3'>
                  <h3 className='font-semibold text-neutral-900'>{group.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    group.role === 'admin' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'bg-accent-100 text-accent-700'
                  }`}>
                    {group.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>
                
                <div className='space-y-2 text-sm text-neutral-600 mb-4'>
                  <div className='flex items-center'>
                    <BookOpen className='h-4 w-4 mr-2' />
                    <span>{group.subject} • {group.level}</span>
                  </div>
                  <div className='flex items-center'>
                    <Users className='h-4 w-4 mr-2' />
                    <span>{group.members}/{group.maxMembers || '∞'} members</span>
                  </div>
                  {group.nextSession && (
                    <div className='flex items-center'>
                      <Calendar className='h-4 w-4 mr-2' />
                      <span>{group.nextSession}</span>
                    </div>
                  )}
                  <div className='flex items-center'>
                    <Star className='h-4 w-4 mr-2' />
                    <span>{group.completionStatus}/5.0 rating</span>
                  </div>
                </div>
                
                <div className='flex space-x-2'>
                  <button 
                    onClick={() => handleViewGroup(group)}
                    className='btn-primary flex-1 text-sm'
                  >
                    <Eye className='h-3 w-3 mr-1' />
                    View Group
                  </button>
                  <button 
                    onClick={() => router.push(`/messages?group=${group.id}`)}
                    className='btn-outline text-sm'
                  >
                    <MessageCircle className='h-3 w-3 mr-1' />
                    Chat
                  </button>
                  <button
                    onClick={() => handleLeaveGroup(group.id)}
                    className='btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50'
                  >
                    Leave
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Groups */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold text-neutral-900'>
          {myGroups.length > 0 ? 'Discover More Groups' : 'Available Groups'}
        </h2>
        {recommendedGroups.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No groups found</h3>
            <p className="text-neutral-600 mb-4">
              {filters.search || filters.subject || filters.level 
                ? "Try adjusting your filters or create a new group"
                : "Be the first to create a study group!"
              }
            </p>
            <div className="flex justify-center space-x-3">
              {(filters.search || filters.subject || filters.level) && (
                <button onClick={clearFilters} className="btn-outline">
                  Clear Filters
                </button>
              )}
              <Link href="/groups/new" className="btn-primary">
                Create Group
              </Link>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {recommendedGroups.map((group: any) => (
              <div key={group.id} className='card hover:shadow-lg transition-shadow'>
                <div className="flex items-start justify-between mb-3">
                  <h3 className='font-semibold text-neutral-900'>{group.name}</h3>
                  {group.maxMembers && group.members >= group.maxMembers && (
                    <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-600">
                      Full
                    </span>
                  )}
                </div>
                <p className='text-sm text-neutral-600 mb-3'>{group.description}</p>
                
                <div className='space-y-2 text-sm text-neutral-600 mb-4'>
                  <div className='flex items-center'>
                    <BookOpen className='h-4 w-4 mr-2' />
                    <span>{group.subject} • {group.level}</span>
                  </div>
                  <div className='flex items-center'>
                    <Users className='h-4 w-4 mr-2' />
                    <span>{group.members}/{group.maxMembers || '∞'} members</span>
                  </div>
                  {group.nextSession && (
                    <div className='flex items-center'>
                      <Calendar className='h-4 w-4 mr-2' />
                      <span>{group.nextSession}</span>
                    </div>
                  )}
                  <div className='flex items-center'>
                    <Star className='h-4 w-4 mr-2' />
                    <span>{group.completionStatus}/5.0 rating</span>
                  </div>
                </div>
                
                <div className='flex space-x-2'>
                  <button 
                    onClick={() => handleJoinGroup(group.id)}
                    className='btn-primary flex-1 text-sm'
                    disabled={joinLoading === group.id || (group.maxMembers ? group.members >= group.maxMembers : false)}
                  >
                    <UserPlus className='h-3 w-3 mr-1' />
                    {joinLoading === group.id ? 'Joining...' : 'Join Group'}
                  </button>
                  <button 
                    onClick={() => handleViewGroup(group)}
                    className='btn-outline text-sm'
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Subjects */}
      <div className='card'>
        <h3 className='text-lg font-semibold text-neutral-900 mb-4'>Browse by Subject</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
          {subjects.map((subject, index) => (
            <button
              key={index}
              onClick={() => handleSubjectClick(subject.name)}
              className={`p-4 rounded-lg text-center transition-all hover:scale-105 ${
                filters.subject === subject.name 
                  ? subject.color + ' ring-2 ring-offset-2 ring-current' 
                  : subject.color + ' hover:opacity-80'
              }`}
            >
              <div className='font-medium'>{subject.name}</div>
              <div className='text-sm opacity-75'>{subject.count} groups</div>
            </button>
          ))}
        </div>
      </div>

      {/* Group Details Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">{showGroupModal.name}</h2>
                  <div className="flex items-center space-x-4 text-sm text-neutral-600">
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {showGroupModal.subject}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {showGroupModal.members} members
                    </span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      {showGroupModal.maxMembers} max
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGroupModal(null)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Description</h3>
                  <p className="text-neutral-600">{showGroupModal.description}</p>
                </div>
                
                {showGroupModal.tags && showGroupModal.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {showGroupModal.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {showGroupModal.nextSession && (
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Next Session</h3>
                    <p className="text-neutral-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {showGroupModal.nextSession}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 pt-4 border-t border-neutral-200">
                  {showGroupModal.role ? (
                    <>
                      <button 
                        onClick={() => router.push(`/messages?group=${showGroupModal.id}`)}
                        className="btn-primary flex-1"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Open Chat
                      </button>
                      <button
                        onClick={() => handleLeaveGroup(showGroupModal.id)}
                        className="btn-outline text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Leave Group
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        handleJoinGroup(showGroupModal.id)
                        setShowGroupModal(null)
                      }}
                      className="btn-primary flex-1"
                      disabled={joinLoading === showGroupModal.id}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Group
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}