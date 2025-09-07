import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Calendar, Users, MapPin, Plus } from 'lucide-react'

export default async function NewSessionPage() {
  await getServerSession(authOptions)

  return (
    <div className='space-y-6 max-w-3xl'>
      <div>
        <h1 className='text-3xl font-bold font-heading text-neutral-900'>
          Schedule New Session
        </h1>
        <p className='text-neutral-600 mt-1'>
          Create a study session and invite your partners
        </p>
      </div>

      <form className='space-y-6'>
        {/* Session Type */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-neutral-900 mb-4'>Session Type</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <label className='flex items-center space-x-3 p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors'>
              <input type='radio' name='sessionType' value='individual' className='text-primary-600' />
              <div>
                <div className='font-medium text-neutral-900'>Individual Study</div>
                <div className='text-sm text-neutral-600'>Personal study time</div>
              </div>
            </label>
            <label className='flex items-center space-x-3 p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors'>
              <input type='radio' name='sessionType' value='partner' className='text-primary-600' defaultChecked />
              <div>
                <div className='font-medium text-neutral-900'>1-on-1 Session</div>
                <div className='text-sm text-neutral-600'>Study with one partner</div>
              </div>
            </label>
            <label className='flex items-center space-x-3 p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors'>
              <input type='radio' name='sessionType' value='group' className='text-primary-600' />
              <div>
                <div className='font-medium text-neutral-900'>Group Session</div>
                <div className='text-sm text-neutral-600'>Study with multiple people</div>
              </div>
            </label>
          </div>
        </div>

        {/* Session Details */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-neutral-900 mb-4'>Session Details</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Subject/Topic
              </label>
              <input
                type='text'
                placeholder='e.g., Calculus Integration'
                className='input-field'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Study Level
              </label>
              <select className='input-field' required>
                <option value=''>Select level</option>
                <option value='beginner'>Beginner</option>
                <option value='intermediate'>Intermediate</option>
                <option value='advanced'>Advanced</option>
              </select>
            </div>
          </div>
          <div className='mt-4'>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Description
            </label>
            <textarea
              rows={3}
              placeholder='What will you be studying? Any specific goals or materials to bring?'
              className='input-field'
            />
          </div>
        </div>

        {/* Schedule */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-neutral-900 mb-4 flex items-center'>
            <Calendar className='h-5 w-5 mr-2' />
            Schedule
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Date
              </label>
              <input
                type='date'
                className='input-field'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Start Time
              </label>
              <input
                type='time'
                className='input-field'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Duration
              </label>
              <select className='input-field' required>
                <option value=''>Select duration</option>
                <option value='30'>30 minutes</option>
                <option value='60'>1 hour</option>
                <option value='90'>1.5 hours</option>
                <option value='120'>2 hours</option>
                <option value='180'>3 hours</option>
                <option value='240'>4 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-neutral-900 mb-4 flex items-center'>
            <MapPin className='h-5 w-5 mr-2' />
            Location
          </h3>
          <div className='space-y-4'>
            <div className='flex space-x-4'>
              <label className='flex items-center space-x-2'>
                <input type='radio' name='locationType' value='virtual' className='text-primary-600' defaultChecked />
                <span>Virtual Meeting</span>
              </label>
              <label className='flex items-center space-x-2'>
                <input type='radio' name='locationType' value='physical' className='text-primary-600' />
                <span>In-Person</span>
              </label>
            </div>
            <input
              type='text'
              placeholder='Meeting link will be generated automatically'
              className='input-field'
              disabled
            />
          </div>
        </div>

        {/* Participants */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-neutral-900 mb-4 flex items-center'>
            <Users className='h-5 w-5 mr-2' />
            Invite Participants
          </h3>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <input
                type='email'
                placeholder='Enter email or username'
                className='input-field flex-1'
              />
              <button
                type='button'
                className='btn-outline inline-flex items-center'
              >
                <Plus className='h-4 w-4 mr-1' />
                Add
              </button>
            </div>
            
            {/* Suggested Partners */}
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Suggested Partners
              </label>
              <div className='flex flex-wrap gap-2'>
                {['Alice Cooper', 'Bob Smith', 'Charlie Brown', 'Diana Prince'].map((name, index) => (
                  <button
                    key={index}
                    type='button'
                    className='px-3 py-1 text-sm bg-neutral-100 hover:bg-primary-100 text-neutral-700 hover:text-primary-700 rounded-full border border-neutral-200 hover:border-primary-300 transition-colors'
                  >
                    + {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-between pt-6 border-t border-neutral-200'>
          <button
            type='button'
            className='btn-outline'
          >
            Save as Draft
          </button>
          <div className='flex space-x-3'>
            <button
              type='button'
              className='btn-outline'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='btn-primary'
            >
              Create Session
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}