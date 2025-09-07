import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import InteractiveStudyCalendar from '@/components/calendar/InteractiveStudyCalendar'

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return <div>Please sign in to access calendar</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-heading text-neutral-900'>
            Study Calendar
          </h1>
          <p className='text-neutral-600 mt-1'>
            Manage your study sessions, deadlines, and events
          </p>
        </div>
      </div>
      
      <InteractiveStudyCalendar />
    </div>
  )
}