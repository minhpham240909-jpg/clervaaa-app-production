import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Plus, Calendar, TrendingUp, Award, Clock, BookOpen } from 'lucide-react'

export default async function GoalsPage() {
  await getServerSession(authOptions)

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-heading text-neutral-900'>
            Goals & Progress
          </h1>
          <p className='text-neutral-600 mt-1'>
            Track your learning objectives and celebrate achievements
          </p>
        </div>
        <button className='btn-primary inline-flex items-center'>
          <Plus className='h-4 w-4 mr-2' />
          New Goal
        </button>
      </div>

      {/* Progress Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='card text-center'>
          <div className='text-3xl font-bold text-primary-600'>12</div>
          <div className='text-sm text-neutral-600 mt-1'>Active Goals</div>
          <div className='text-xs text-accent-600 mt-1'>↗ +2 this month</div>
        </div>
        <div className='card text-center'>
          <div className='text-3xl font-bold text-accent-600'>8</div>
          <div className='text-sm text-neutral-600 mt-1'>Completed</div>
          <div className='text-xs text-accent-600 mt-1'>↗ +3 this week</div>
        </div>
        <div className='card text-center'>
          <div className='text-3xl font-bold text-secondary-600'>75%</div>
          <div className='text-sm text-neutral-600 mt-1'>Success Rate</div>
          <div className='text-xs text-accent-600 mt-1'>↗ +5% improvement</div>
        </div>
        <div className='card text-center'>
          <div className='text-3xl font-bold text-learning-dark'>24</div>
          <div className='text-sm text-neutral-600 mt-1'>Study Streak</div>
          <div className='text-xs text-neutral-500 mt-1'>days</div>
        </div>
      </div>

      {/* Active Goals */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-neutral-900'>Active Goals</h2>
          <div className='flex items-center space-x-2 text-sm text-neutral-600'>
            <span>Sort by:</span>
            <select className='border-none bg-transparent focus:ring-0'>
              <option>Due Date</option>
              <option>Priority</option>
              <option>Progress</option>
            </select>
          </div>
        </div>
        
        <div className='space-y-4'>
          {[
            {
              title: 'Master Calculus Integration',
              category: 'Mathematics',
              dueDate: '2024-02-15',
              progress: 75,
              priority: 'High',
              tasks: 8,
              completedTasks: 6,
              description: 'Complete all integration techniques and practice problems',
              timeSpent: '24h 30m'
            },
            {
              title: 'Complete React Portfolio Project',
              category: 'Computer Science',
              dueDate: '2024-02-20',
              progress: 60,
              priority: 'Medium',
              tasks: 12,
              completedTasks: 7,
              description: 'Build and deploy a full-stack React application',
              timeSpent: '18h 45m'
            },
            {
              title: 'Physics Final Exam Prep',
              category: 'Physics',
              dueDate: '2024-02-10',
              progress: 90,
              priority: 'High',
              tasks: 15,
              completedTasks: 13,
              description: 'Review all chapters and complete practice exams',
              timeSpent: '32h 15m'
            }
          ].map((goal, index) => (
            <div key={index} className='card hover:shadow-lg transition-shadow'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <h3 className='font-semibold text-neutral-900 text-lg'>{goal.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      goal.priority === 'High' 
                        ? 'bg-red-100 text-red-700' 
                        : goal.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>
                  <p className='text-neutral-600 text-sm mb-3'>{goal.description}</p>
                  
                  <div className='flex items-center space-x-4 text-sm text-neutral-600 mb-3'>
                    <div className='flex items-center'>
                      <BookOpen className='h-4 w-4 mr-1' />
                      <span>{goal.category}</span>
                    </div>
                    <div className='flex items-center'>
                      <Calendar className='h-4 w-4 mr-1' />
                      <span>Due {new Date(goal.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className='flex items-center'>
                      <Clock className='h-4 w-4 mr-1' />
                      <span>{goal.timeSpent} spent</span>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-2xl font-bold text-primary-600'>{goal.progress}%</div>
                  <div className='text-xs text-neutral-600'>
                    {goal.completedTasks}/{goal.tasks} tasks
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className='mb-4'>
                <div className='flex items-center justify-between text-sm text-neutral-600 mb-2'>
                  <span>Progress</span>
                  <span>{goal.completedTasks} of {goal.tasks} tasks completed</span>
                </div>
                <div className='w-full bg-neutral-200 rounded-full h-2'>
                  <div 
                    className='bg-primary-600 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
              
              <div className='flex items-center justify-between'>
                <div className='flex space-x-2'>
                  <button className='btn-primary text-sm'>
                    View Details
                  </button>
                  <button className='btn-outline text-sm'>
                    Add Task
                  </button>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className={`text-sm ${
                    goal.progress >= 90 ? 'text-accent-600' :
                    goal.progress >= 50 ? 'text-secondary-600' :
                    'text-neutral-600'
                  }`}>
                    {goal.progress >= 90 ? 'Almost there!' :
                     goal.progress >= 50 ? 'Good progress' :
                     'Getting started'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold text-neutral-900 flex items-center'>
          <Award className='h-5 w-5 mr-2 text-secondary-600' />
          Recent Achievements
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[
            {
              title: 'Completed Chemistry Lab Report',
              date: 'Yesterday',
              category: 'Chemistry',
              points: 100
            },
            {
              title: 'Finished Statistics Problem Set',
              date: '2 days ago',
              category: 'Mathematics',
              points: 75
            },
            {
              title: 'Submitted Programming Assignment',
              date: '3 days ago',
              category: 'Computer Science',
              points: 150
            }
          ].map((achievement, index) => (
            <div key={index} className='card bg-gradient-to-r from-secondary-50 to-accent-50 border-secondary-200'>
              <div className='flex items-center justify-between mb-2'>
                <Award className='h-6 w-6 text-secondary-600' />
                <span className='text-sm font-medium text-secondary-700'>+{achievement.points} pts</span>
              </div>
              <h4 className='font-medium text-neutral-900 mb-1'>{achievement.title}</h4>
              <div className='text-sm text-neutral-600'>
                <span>{achievement.category}</span> • <span>{achievement.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Analytics */}
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-neutral-900 flex items-center'>
            <TrendingUp className='h-5 w-5 mr-2' />
            Progress Analytics
          </h3>
          <select className='input-field text-sm w-auto'>
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-accent-600 mb-2'>5</div>
            <div className='text-sm text-neutral-600'>Goals Completed</div>
            <div className='text-xs text-accent-600 mt-1'>↗ 25% increase</div>
          </div>
          
          <div className='text-center'>
            <div className='text-2xl font-bold text-primary-600 mb-2'>48h</div>
            <div className='text-sm text-neutral-600'>Study Time</div>
            <div className='text-xs text-accent-600 mt-1'>↗ 15% increase</div>
          </div>
          
          <div className='text-center'>
            <div className='text-2xl font-bold text-secondary-600 mb-2'>85%</div>
            <div className='text-sm text-neutral-600'>On-time Rate</div>
            <div className='text-xs text-accent-600 mt-1'>↗ 10% improvement</div>
          </div>
        </div>
        
        <div className='mt-6 p-4 bg-neutral-50 rounded-lg'>
          <div className='text-sm text-neutral-700 font-medium mb-2'>Weekly Study Pattern</div>
          <div className='flex items-end justify-between h-20'>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className='flex flex-col items-center'>
                <div 
                  className='bg-primary-600 rounded-sm mb-2' 
                  style={{ 
                    width: '12px', 
                    height: `${Math.random() * 60 + 20}px` 
                  }}
                />
                <span className='text-xs text-neutral-600'>{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}