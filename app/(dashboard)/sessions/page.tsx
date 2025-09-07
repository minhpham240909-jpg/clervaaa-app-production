import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Calendar, Clock, Users, Video, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function StudySessionsPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-heading text-neutral-900'>
            Study Sessions
          </h1>
          <p className='text-neutral-600 mt-1'>
            Manage your upcoming and past study sessions
          </p>
        </div>
        <Link href='/sessions/new' className='btn-primary inline-flex items-center'>
          <Calendar className='h-4 w-4 mr-2' />
          New Session
        </Link>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='card'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-primary-600'>5</div>
            <div className='text-sm text-neutral-600'>Upcoming</div>
          </div>
        </div>
        <div className='card'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-accent-600'>12</div>
            <div className='text-sm text-neutral-600'>This Week</div>
          </div>
        </div>
        <div className='card'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-secondary-600'>48h</div>
            <div className='text-sm text-neutral-600'>Total Time</div>
          </div>
        </div>
        <div className='card'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-learning-dark'>8</div>
            <div className='text-sm text-neutral-600'>Partners</div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold text-neutral-900'>Upcoming Sessions</h2>
        <div className='space-y-4'>
          {[
            {
              id: 1,
              subject: 'Calculus Study Group',
              date: 'Today, 2:00 PM',
              duration: '2 hours',
              type: 'Group Session',
              location: 'Virtual Meeting',
              participants: ['Alice', 'Bob', 'Charlie'],
              status: 'confirmed'
            },
            {
              id: 2,
              subject: 'Physics Problem Solving',
              date: 'Tomorrow, 10:00 AM',
              duration: '1.5 hours',
              type: '1-on-1',
              location: 'Library Room 201',
              participants: ['Sarah'],
              status: 'pending'
            },
            {
              id: 3,
              subject: 'Programming Fundamentals',
              date: 'Friday, 4:00 PM',
              duration: '3 hours',
              type: 'Group Session',
              location: 'Virtual Meeting',
              participants: ['David', 'Emma', 'Frank'],
              status: 'confirmed'
            }
          ].map((session: any) => (
            <div key={session.id} className='card hover:shadow-lg transition-shadow'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='font-semibold text-neutral-900 text-lg'>
                        {session.subject}
                      </h3>
                      <div className='flex items-center mt-2 space-x-4 text-sm text-neutral-600'>
                        <div className='flex items-center'>
                          <Clock className='h-4 w-4 mr-1' />
                          <span>{session.date} • {session.duration}</span>
                        </div>
                        <div className='flex items-center'>
                          <Users className='h-4 w-4 mr-1' />
                          <span>{session.type}</span>
                        </div>
                      </div>
                      <div className='flex items-center mt-1 text-sm text-neutral-600'>
                        {session.timezone.includes('Virtual') ? (
                          <Video className='h-4 w-4 mr-1' />
                        ) : (
                          <MapPin className='h-4 w-4 mr-1' />
                        )}
                        <span>{session.timezone}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      session.status === 'confirmed' 
                        ? 'bg-accent-100 text-accent-700' 
                        : 'bg-secondary-100 text-secondary-700'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  
                  <div className='mt-4 flex items-center space-x-2'>
                    <span className='text-sm text-neutral-600'>Participants:</span>
                    <div className='flex -space-x-2'>
                      {session.participants.map((participant, index) => (
                        <div
                          key={index}
                          className='w-6 h-6 bg-primary-100 border-2 border-white rounded-full flex items-center justify-center'
                          title={participant}
                        >
                          <span className='text-xs text-primary-600 font-medium'>
                            {participant[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className='mt-4 flex space-x-2'>
                <button className='btn-primary text-sm'>
                  {session.timezone.includes('Virtual') ? 'Join Meeting' : 'View Details'}
                </button>
                <button className='btn-outline text-sm'>
                  Edit Session
                </button>
                <button className='btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50'>
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold text-neutral-900'>Recent Sessions</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {[
            {
              subject: 'Organic Chemistry Review',
              date: 'Yesterday',
              duration: '2h 30m',
              rating: 5
            },
            {
              subject: 'Statistics Workshop',
              date: '2 days ago',
              duration: '1h 45m',
              rating: 4
            }
          ].map((session, index) => (
            <div key={index} className='card'>
              <h4 className='font-medium text-neutral-900'>{session.subject}</h4>
              <p className='text-sm text-neutral-600 mt-1'>
                {session.date} • {session.duration}
              </p>
              <div className='flex items-center mt-2'>
                <div className='flex'>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 ${i < session.rating ? 'text-secondary-500' : 'text-neutral-300'}`}
                    >
                      ⭐
                    </div>
                  ))}
                </div>
                <span className='text-sm text-neutral-600 ml-2'>
                  ({session.rating}/5)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}