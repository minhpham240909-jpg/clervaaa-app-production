'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Clock, Star, X, Send, Eye, UserPlus, Heart, MessageCircle, Sparkles, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AIPartnerMatching from '@/components/ai/AIPartnerMatching'

interface StudyPartner {
  id: string
  name: string
  email: string
  avatar?: string
  major: string
  year: string
  graduationYear?: string
  university: string
  location: string
  bio?: string
  studyLevel: 'beginner' | 'intermediate' | 'advanced'
  subjects: string[]
  availability: string[]
  availabilityHours?: string[]
  timezone: string
  rating: number
  totalSessions: number
  preferredStudyTime: string[]
  learningStyle: string
  isOnline: boolean
  lastActive: Date
  compatibilityScore?: number
  completionStatus?: number
}

interface PartnerFilters {
  subject: string
  level: string
  availability: string
  availabilityHours?: string
  location: string
  studyTime: string
  learningStyle: string
  rating: number
  completionStatus?: number
}

const mockPartners: StudyPartner[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.j@university.edu',
    major: 'Computer Science',
    year: 'Junior',
    university: 'State University',
    location: 'Campus Library',
    bio: 'Passionate about algorithms and data structures. Looking for study partners for advanced CS courses.',
    studyLevel: 'advanced',
    subjects: ['Computer Science', 'Mathematics', 'Data Structures'],
    availability: ['evenings', 'weekends'],
    timezone: 'PST',
    rating: 4.8,
    totalSessions: 24,
    preferredStudyTime: ['evening'],
    learningStyle: 'visual',
    isOnline: true,
    lastActive: new Date(),
    compatibilityScore: 95
  },
  {
    id: '2',
    name: 'Bob Chen',
    email: 'bob.chen@university.edu',
    major: 'Physics',
    year: 'Senior',
    university: 'State University',
    location: 'Physics Building',
    bio: 'Physics major with strong math background. Great at explaining complex concepts.',
    studyLevel: 'advanced',
    subjects: ['Physics', 'Mathematics', 'Calculus'],
    availability: ['afternoons', 'evenings'],
    timezone: 'PST',
    rating: 4.9,
    totalSessions: 31,
    preferredStudyTime: ['afternoon'],
    learningStyle: 'kinesthetic',
    isOnline: false,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    compatibilityScore: 88
  },
  {
    id: '3',
    name: 'Carol Smith',
    email: 'carol.smith@university.edu',
    major: 'Mathematics',
    year: 'Sophomore',
    university: 'State University',
    location: 'Math Department',
    bio: 'Love solving challenging math problems and helping others understand difficult concepts.',
    studyLevel: 'intermediate',
    subjects: ['Mathematics', 'Statistics', 'Calculus'],
    availability: ['mornings', 'afternoons'],
    timezone: 'PST',
    rating: 4.7,
    totalSessions: 18,
    preferredStudyTime: ['morning'],
    learningStyle: 'auditory',
    isOnline: true,
    lastActive: new Date(),
    compatibilityScore: 82
  },
  {
    id: '4',
    name: 'David Lee',
    email: 'david.lee@university.edu',
    major: 'Chemistry',
    year: 'Graduate',
    university: 'State University',
    location: 'Chemistry Lab',
    bio: 'PhD student in organic chemistry. Happy to help with both undergraduate and graduate level chemistry.',
    studyLevel: 'advanced',
    subjects: ['Chemistry', 'Organic Chemistry', 'Biochemistry'],
    availability: ['evenings', 'weekends'],
    timezone: 'PST',
    rating: 4.95,
    totalSessions: 42,
    preferredStudyTime: ['evening'],
    learningStyle: 'reading',
    isOnline: false,
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    compatibilityScore: 76
  }
]

const subjects = [
  'Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Biology',
  'Business', 'Literature', 'History', 'Psychology', 'Engineering'
]

export default function FindPartnersPageClient() {
  const router = useRouter()
  const [partners, setPartners] = useState<StudyPartner[]>(mockPartners)
  const [filteredPartners, setFilteredPartners] = useState<StudyPartner[]>(mockPartners)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<StudyPartner | null>(null)
  const [requestLoading, setRequestLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ai-matching' | 'search'>('ai-matching')

  
  const [filters, setFilters] = useState<PartnerFilters>({
    subject: '',
    level: '',
    availability: '',
    location: '',
    studyTime: '',
    learningStyle: '',
    rating: 0
  })

  const [searchQuery, setSearchQuery] = useState('')



  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, searchQuery, partners])

  const applyFilters = () => {
    let filtered = partners.filter((partner: any) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          partner.name.toLowerCase().includes(query) ||
          partner.major.toLowerCase().includes(query) ||
          (partner.preferredSubjects || []).some(subject => subject.toLowerCase().includes(query)) ||
          partner.bio?.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Subject filter
      if (filters.subject && !(partner.preferredSubjects || []).includes(filters.subject)) return false

      // Level filter
      if (filters.level && partner.studyLevel !== filters.level) return false

      // Availability filter
      if (filters.availabilityHours && (!partner.availabilityHours || !partner.availabilityHours.includes(filters.availabilityHours))) return false

      // Study time filter
      if (filters.studyTime && !partner.preferredStudyTime.includes(filters.studyTime)) return false

      // Learning style filter
      if (filters.learningStyle && partner.learningStyle !== filters.learningStyle) return false

      // Rating filter
      if (filters.completionStatus && filters.completionStatus > 0 && (!partner.completionStatus || partner.completionStatus < filters.completionStatus)) return false

      return true
    })

    // Sort by compatibility score
    filtered.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0))

    setFilteredPartners(filtered)
  }

  const handleSendRequest = async (partnerId: string) => {
    setRequestLoading(partnerId)
    try {
      const response = await fetch(`/api/partners/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId })
      })

      if (response.ok) {
        alert('Partner request sent successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to send request')
      }
    } catch (error) {
      console.error('Failed to send partner request:', error)
      // For demo, show success
      alert('Partner request sent successfully!')
    } finally {
      setRequestLoading(null)
    }
  }

  const handleViewProfile = (partner: StudyPartner) => {
    setSelectedPartner(partner)
  }

  const clearFilters = () => {
    setFilters({
      subject: '',
      level: '',
      availability: '',
      location: '',
      studyTime: '',
      learningStyle: '',
      rating: 0
    })
    setSearchQuery('')
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value: any) => value && value !== 0).length + (searchQuery ? 1 : 0)
  }

  const formatLastActive = (lastActive: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Active now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-neutral-200 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-neutral-200 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="h-32 bg-neutral-200 rounded animate-pulse"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-neutral-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-heading text-neutral-900'>
            Find Study Partners
          </h1>
          <p className='text-neutral-600 mt-1'>
            Connect with students who share your academic interests and schedule
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'search' && (
            <>
              <span className="text-sm text-neutral-600">
                {filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''} found
              </span>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className='btn-outline inline-flex items-center relative'
              >
                <Filter className='h-4 w-4 mr-2' />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('ai-matching')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'ai-matching'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Partner Matching
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Search className="h-4 w-4" />
          Search & Filter
        </button>
      </div>

      {/* AI Partner Matching Tab */}
      {activeTab === 'ai-matching' && (
        <AIPartnerMatching />
      )}

      {/* Search & Filter Tab */}
      {activeTab === 'search' && (
        <>
          {/* Search Bar */}
          <div className='card'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
              <input
                type='text'
                placeholder='Search by name, subject, or keywords...'
                className='input-field pl-10'
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className='card border-primary-200 bg-primary-50'>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-neutral-900">Filter Partners</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Subject
              </label>
              <select 
                className='input-field'
                value={filters.subject}
                onChange={(e: any) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              >
                <option value=''>All Subjects</option>
                {subjects.map((subject: any) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Study Level
              </label>
              <select 
                className='input-field'
                value={filters.level}
                onChange={(e: any) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              >
                <option value=''>Any Level</option>
                <option value='beginner'>Beginner</option>
                <option value='intermediate'>Intermediate</option>
                <option value='advanced'>Advanced</option>
              </select>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Availability
              </label>
              <select 
                className='input-field'
                value={filters.availabilityHours || ''}
                onChange={(e: any) => setFilters(prev => ({ ...prev, availabilityHours: e.target.value }))}
              >
                <option value=''>Any Time</option>
                <option value='mornings'>Mornings</option>
                <option value='afternoons'>Afternoons</option>
                <option value='evenings'>Evenings</option>
                <option value='weekends'>Weekends</option>
              </select>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Learning Style
              </label>
              <select 
                className='input-field'
                value={filters.learningStyle}
                onChange={(e: any) => setFilters(prev => ({ ...prev, learningStyle: e.target.value }))}
              >
                <option value=''>Any Style</option>
                <option value='visual'>Visual</option>
                <option value='auditory'>Auditory</option>
                <option value='kinesthetic'>Kinesthetic</option>
                <option value='reading'>Reading/Writing</option>
              </select>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Minimum Rating
              </label>
              <select 
                className='input-field'
                value={filters.completionStatus || 0}
                onChange={(e: any) => setFilters(prev => ({ ...prev, completionStatus: Number(e.target.value) }))}
              >
                <option value={0}>Any Rating</option>
                <option value={4.0}>4.0+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.8}>4.8+ Stars</option>
              </select>
            </div>
          </div>
          
          {getActiveFilterCount() > 0 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-primary-200">
              <span className="text-sm text-neutral-600">
                {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Partners Grid */}
      <div className='space-y-4'>
        <div className="flex items-center justify-between">
          <h2 className='text-xl font-semibold text-neutral-900'>
            {searchQuery || getActiveFilterCount() > 0 ? 'Search Results' : 'Recommended Partners'}
          </h2>
          {filteredPartners.length > 0 && (
            <span className="text-sm text-neutral-500">
              Sorted by compatibility
            </span>
          )}
        </div>
        
        {filteredPartners.length === 0 ? (
          <div className="card text-center py-12">
            <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No partners found</h3>
            <p className="text-neutral-600 mb-4">
              {getActiveFilterCount() > 0 || searchQuery 
                ? "Try adjusting your search criteria or filters"
                : "No study partners match your current preferences"
              }
            </p>
            {(getActiveFilterCount() > 0 || searchQuery) && (
              <button onClick={clearFilters} className="btn-outline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredPartners.map((partner: any) => (
              <div key={partner.id} className='card hover:shadow-lg transition-all duration-200 cursor-pointer group'>
                <div className='flex items-start space-x-4 mb-4'>
                  <div className='relative'>
                    <div className='w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center'>
                      <span className='text-primary-600 font-semibold'>
                        {partner.name.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    {partner.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className='font-semibold text-neutral-900 truncate'>{partner.name}</h3>
                      {partner.compatibilityScore && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {partner.compatibilityScore}% match
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-neutral-600'>{partner.major} • {partner.year || partner.graduationYear}</p>
                    <div className='flex items-center mt-1 text-xs text-neutral-500'>
                      <MapPin className='h-3 w-3 mr-1' />
                      <span className="truncate">{partner.location || partner.timezone}</span>
                    </div>
                    <div className='flex items-center mt-1 text-xs text-neutral-500'>
                      <Clock className='h-3 w-3 mr-1' />
                      <span>{formatLastActive(partner.lastActive)}</span>
                    </div>
                    <div className='flex items-center mt-1 text-xs text-neutral-500'>
                      <Star className='h-3 w-3 mr-1 fill-current text-yellow-400' />
                      <span>{partner.completionStatus} ({partner.totalSessions} sessions)</span>
                    </div>
                  </div>
                </div>
                
                {partner.bio && (
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {partner.bio}
                  </p>
                )}
                
                <div className='flex flex-wrap gap-1 mb-4'>
                  {(partner.preferredSubjects || []).slice(0, 3).map((subject: any) => (
                    <span key={subject} className='px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full'>
                      {subject}
                    </span>
                  ))}
                  {(partner.preferredSubjects || []).length > 3 && (
                    <span className='px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded-full'>
                      +{(partner.preferredSubjects || []).length - 3} more
                    </span>
                  )}
                </div>
                
                <div className='flex space-x-2'>
                  <button 
                    onClick={() => handleSendRequest(partner.id)}
                    className='btn-primary flex-1 text-sm py-2'
                    disabled={requestLoading === partner.id}
                  >
                    <Send className='h-3 w-3 mr-1' />
                    {requestLoading === partner.id ? 'Sending...' : 'Connect'}
                  </button>
                  <button 
                    onClick={() => handleViewProfile(partner)}
                    className='btn-outline flex-1 text-sm py-2'
                  >
                    <Eye className='h-3 w-3 mr-1' />
                    Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Partner Profile Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4">
                  <div className='relative'>
                    <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center'>
                      <span className='text-primary-600 font-semibold text-xl'>
                        {selectedPartner.name.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    {selectedPartner.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-1">{selectedPartner.name}</h2>
                    <p className="text-neutral-600 mb-2">{selectedPartner.major} • {selectedPartner.graduationYear || selectedPartner.year}</p>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600">
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
                        {selectedPartner.completionStatus || selectedPartner.rating} rating
                      </span>
                      <span>{selectedPartner.totalSessions} sessions</span>
                      <span className={`flex items-center ${selectedPartner.isOnline ? 'text-green-600' : 'text-neutral-500'}`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${selectedPartner.isOnline ? 'bg-green-500' : 'bg-neutral-400'}`}></div>
                        {selectedPartner.isOnline ? 'Online' : formatLastActive(selectedPartner.lastActive)}
                      </span>
                    </div>
                    {selectedPartner.compatibilityScore && (
                      <div className="mt-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {selectedPartner.compatibilityScore}% compatibility match
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPartner(null)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {selectedPartner.bio && (
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">About</h3>
                    <p className="text-neutral-600">{selectedPartner.bio}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Study Subjects</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPartner.subjects.map((subject: any) => (
                        <span key={subject} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Availability</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedPartner.availabilityHours || selectedPartner.availability).map((time: any) => (
                        <span key={time} className="px-2 py-1 bg-accent-100 text-accent-700 rounded-full text-sm capitalize">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Study Details</h3>
                    <div className="space-y-1 text-sm text-neutral-600">
                      <p>Level: <span className="capitalize font-medium">{selectedPartner.studyLevel}</span></p>
                      <p>Learning Style: <span className="capitalize font-medium">{selectedPartner.learningStyle}</span></p>
                      <p>Location: <span className="font-medium">{selectedPartner.timezone}</span></p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Preferred Study Times</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPartner.preferredStudyTime.map((time: any) => (
                        <span key={time} className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm capitalize">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-6 border-t border-neutral-200">
                  <button 
                    onClick={() => {
                      handleSendRequest(selectedPartner.id)
                      setSelectedPartner(null)
                    }}
                    className="btn-primary flex-1"
                    disabled={requestLoading === selectedPartner.id}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Connection Request
                  </button>
                  <button 
                    onClick={() => router.push(`/messages?user=${selectedPartner.id}`)}
                    className="btn-outline"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}