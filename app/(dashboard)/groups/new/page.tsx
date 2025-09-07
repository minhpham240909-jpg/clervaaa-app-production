import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Users, BookOpen, Calendar, Settings, Globe, Lock } from 'lucide-react'

// This page uses dynamic server features
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewGroupPage() {
  await getServerSession(authOptions)

  return (
    <div className='space-y-6 max-w-3xl'>
      <div>
        <h1 className='text-3xl font-bold font-heading text-neutral-900'>
          Create Study Group
        </h1>
        <p className='text-neutral-600 mt-1'>
          Start a new study group and invite students to join
        </p>
      </div>

      <form className='space-y-6'>
        {/* Basic Information */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-neutral-900 mb-4 flex items-center'>
            <BookOpen className='h-5 w-5 mr-2' />
            Group Information
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Group Name *
              </label>
              <input
                type='text'
                placeholder='e.g., Advanced Calculus Study Group'
                className='input-field'
                required
              />
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Subject *
                </label>
                <select className='input-field' required>
                  <option value=''>Select a subject</option>
                  <option value='mathematics'>Mathematics</option>
                  <option value='physics'>Physics</option>
                  <option value='chemistry'>Chemistry</option>
                  <option value='biology'>Biology</option>
                  <option value='computer-science'>Computer Science</option>
                  <option value='engineering'>Engineering</option>
                  <option value='business'>Business</option>
                  <option value='literature'>Literature</option>
                  <option value='history'>History</option>
                  <option value='psychology'>Psychology</option>
                  <option value='other'>Other</option>
                </select>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Study Level *
                </label>
                <select className='input-field' required>
                  <option value=''>Select level</option>
                  <option value='beginner'>Beginner</option>
                  <option value='intermediate'>Intermediate</option>
                  <option value='advanced'>Advanced</option>
                  <option value='mixed'>Mixed Levels</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Description
              </label>
              <textarea
                rows={4}
                placeholder='Describe what your group will study, goals, meeting style, etc.'
                className='input-field'
              />
            </div>
          </div>
        </div>

        {/* Group Settings */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-neutral-900 mb-4 flex items-center'>
            <Settings className='h-5 w-5 mr-2' />
            Group Settings
          </h3>
          
          <div className='space-y-6'>
            {/* Privacy Settings */}
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-3'>
                Privacy Setting
              </label>
              <div className='space-y-3'>
                <label className='flex items-start space-x-3 p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors'>
                  <input type='radio' name='privacy' value='public' className='text-primary-600 mt-1' defaultChecked />
                  <div>
                    <div className='flex items-center'>
                      <Globe className='h-4 w-4 mr-2' />
                      <span className='font-medium text-neutral-900'>Public</span>
                    </div>
                    <div className='text-sm text-neutral-600 mt-1'>
                      Anyone can discover and join this group
                    </div>
                  </div>
                </label>
                
                <label className='flex items-start space-x-3 p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors'>
                  <input type='radio' name='privacy' value='invite-only' className='text-primary-600 mt-1' />
                  <div>
                    <div className='flex items-center'>
                      <Lock className='h-4 w-4 mr-2' />
                      <span className='font-medium text-neutral-900'>Invite Only</span>
                    </div>
                    <div className='text-sm text-neutral-600 mt-1'>
                      Only invited members can join this group
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Group Size */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Maximum Members
                </label>
                <select className='input-field'>
                  <option value='5'>5 members</option>
                  <option value='10'>10 members</option>
                  <option value='15' selected>15 members</option>
                  <option value='20'>20 members</option>
                  <option value='25'>25 members</option>
                  <option value='unlimited'>Unlimited</option>
                </select>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Join Approval
                </label>
                <select className='input-field'>
                  <option value='automatic'>Automatic approval</option>
                  <option value='manual' selected>Requires approval</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Schedule */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-neutral-900 mb-4 flex items-center'>
            <Calendar className='h-5 w-5 mr-2' />
            Meeting Schedule (Optional)
          </h3>
          
          <div className='space-y-4'>
            <div className='flex items-center space-x-2 mb-4'>
              <input
                type='checkbox'
                id='hasSchedule'
                className='rounded border-neutral-300 text-primary-600 focus:ring-primary-500'
              />
              <label htmlFor='hasSchedule' className='text-sm font-medium text-neutral-700'>
                Set up regular meeting schedule
              </label>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50'>
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Frequency
                </label>
                <select className='input-field' disabled>
                  <option value='weekly'>Weekly</option>
                  <option value='biweekly'>Bi-weekly</option>
                  <option value='monthly'>Monthly</option>
                  <option value='flexible'>Flexible</option>
                </select>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Day of Week
                </label>
                <select className='input-field' disabled>
                  <option value='monday'>Monday</option>
                  <option value='tuesday'>Tuesday</option>
                  <option value='wednesday'>Wednesday</option>
                  <option value='thursday'>Thursday</option>
                  <option value='friday'>Friday</option>
                  <option value='saturday'>Saturday</option>
                  <option value='sunday'>Sunday</option>
                </select>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Time
                </label>
                <input
                  type='time'
                  className='input-field'
                  disabled
                />
              </div>
            </div>
            
            <div className='opacity-50'>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Duration
              </label>
              <select className='input-field' disabled>
                <option value='60'>1 hour</option>
                <option value='90'>1.5 hours</option>
                <option value='120'>2 hours</option>
                <option value='180'>3 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-neutral-900 mb-4'>
            Tags (Optional)
          </h3>
          <div className='space-y-3'>
            <input
              type='text'
              placeholder='Add tags to help others find your group (press Enter to add)'
              className='input-field'
            />
            <div className='flex flex-wrap gap-2'>
              {['exam-prep', 'homework-help', 'project-based'].map((tag, index) => (
                <span
                  key={index}
                  className='px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-full'
                >
                  {tag}
                  <button className='ml-2 hover:text-primary-900'>×</button>
                </span>
              ))}
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
              className='btn-primary inline-flex items-center'
            >
              <Users className='h-4 w-4 mr-2' />
              Create Group
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}