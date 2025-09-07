'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Clock, Brain, Users, Target, Zap, Calendar, Coffee, GraduationCap, Eye, Ear, Hand, FileText } from 'lucide-react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { toast } from 'react-hot-toast'

interface Subject {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

const STUDY_STYLES = [
  {
    id: 'visual',
    name: 'Visual Learner',
    description: 'Learn best through diagrams, charts, and visual aids',
    icon: Eye,
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    id: 'auditory',
    name: 'Auditory Learner',
    description: 'Learn best through listening, discussion, and explanation',
    icon: Ear,
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  {
    id: 'kinesthetic',
    name: 'Kinesthetic Learner',
    description: 'Learn best through hands-on activities and movement',
    icon: Hand,
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    id: 'reading',
    name: 'Reading/Writing',
    description: 'Learn best through reading and writing activities',
    icon: FileText,
    color: 'bg-orange-50 border-orange-200 text-orange-700'
  }
]

const POPULAR_SUBJECTS = [
  'Mathematics', 'Science', 'English Literature', 'History', 'Physics', 'Chemistry',
  'Biology', 'Computer Science', 'Psychology', 'Economics', 'Philosophy', 'Art',
  'Music', 'Foreign Languages', 'Geography', 'Political Science', 'Engineering',
  'Medicine', 'Law', 'Business Studies', 'Statistics', 'Calculus', 'Algebra',
  'Geometry', 'Sociology', 'Anthropology', 'Environmental Science', 'Astronomy'
]

const AGE_GROUPS = [
  {
    id: 'elementary',
    name: 'Elementary School',
    description: 'Grades 1-5',
    grades: ['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    icon: '📚'
  },
  {
    id: 'middle',
    name: 'Middle School',
    description: 'Grades 6-8',
    grades: ['6th Grade', '7th Grade', '8th Grade'],
    icon: '🎒'
  },
  {
    id: 'high',
    name: 'High School',
    description: 'Grades 9-12',
    grades: ['Freshman (9th)', 'Sophomore (10th)', 'Junior (11th)', 'Senior (12th)'],
    icon: '🎓'
  },
  {
    id: 'college',
    name: 'College/University',
    description: 'Undergraduate & Graduate',
    grades: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate Student'],
    icon: '🏛️'
  }
]

const STUDY_GOALS = [
  {
    id: 'improve_grades',
    name: 'Improve Grades',
    description: 'Focus on better academic performance',
    icon: Target
  },
  {
    id: 'exam_prep',
    name: 'Exam Preparation',
    description: 'Prepare for upcoming tests and exams',
    icon: FileText
  },
  {
    id: 'skill_development',
    name: 'Skill Development',
    description: 'Learn new skills and abilities',
    icon: Brain
  },
  {
    id: 'collaborative_learning',
    name: 'Collaborative Learning',
    description: 'Study and learn with others',
    icon: Users
  },
  {
    id: 'time_management',
    name: 'Time Management',
    description: 'Better organize study time and schedule',
    icon: Clock
  },
  {
    id: 'focus_improvement',
    name: 'Focus & Concentration',
    description: 'Improve attention and study focus',
    icon: Brain
  }
]

export default function StudyPreferences() {
  const { settings, updateStudyPreferences, isLoading } = useSettings()
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings.study)
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('')
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [quickAddSubject, setQuickAddSubject] = useState('')

  useEffect(() => {
    setLocalSettings(settings.study)
  }, [settings.study])

  const handlePreferenceChange = async (key: string, value: any) => {
    const newSettings = {
      ...localSettings,
      [key]: value
    }
    
    setLocalSettings(newSettings)
    
    // Auto-save preference changes for immediate application
    try {
      setIsSaving(true)
      await updateStudyPreferences({ [key]: value })
    } catch (error) {
      console.error('Failed to save study preference:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoalChange = async (key: string, value: any) => {
    const newGoals = {
      ...localSettings.study_goals,
      [key]: value
    }
    
    const newSettings = {
      ...localSettings,
      study_goals: newGoals
    }
    
    setLocalSettings(newSettings)
    
    // Auto-save goal changes
    try {
      setIsSaving(true)
      await updateStudyPreferences({ study_goals: newGoals })
    } catch (error) {
      console.error('Failed to save study goal:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvailabilityChange = async (day: string, field: string, value: any) => {
    const newAvailability = {
      ...localSettings.availability,
      [day]: {
        ...localSettings.availability[day],
        [field]: value
      }
    }
    
    const newSettings = {
      ...localSettings,
      availability: newAvailability
    }
    
    setLocalSettings(newSettings)
    
    // Auto-save availability changes
    try {
      setIsSaving(true)
      await updateStudyPreferences({ availability: newAvailability })
    } catch (error) {
      console.error('Failed to save availability:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addSubject = async () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '',
      level: 'beginner'
    }
    
    const newSubjects = [...(localSettings.subjects || []), newSubject]
    const newSettings = {
      ...localSettings,
      subjects: newSubjects
    }
    
    setLocalSettings(newSettings)
    
    // Auto-save new subject
    try {
      setIsSaving(true)
      await updateStudyPreferences({ subjects: newSubjects })
    } catch (error) {
      console.error('Failed to add subject:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSubject = async (id: string, field: string, value: string) => {
    const newSubjects = (localSettings.subjects || []).map((subject: any) =>
      subject.id === id ? { ...subject, [field]: value } : subject
    )
    
    const newSettings = {
      ...localSettings,
      subjects: newSubjects
    }
    
    setLocalSettings(newSettings)
    
    // Auto-save subject update
    try {
      setIsSaving(true)
      await updateStudyPreferences({ subjects: newSubjects })
    } catch (error) {
      console.error('Failed to update subject:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const removeSubject = async (id: string) => {
    const newSubjects = (localSettings.subjects || []).filter((subject: any) => subject.id !== id)
    const newSettings = {
      ...localSettings,
      subjects: newSubjects
    }
    
    setLocalSettings(newSettings)
    
    // Auto-save subject removal
    try {
      setIsSaving(true)
      await updateStudyPreferences({ subjects: newSubjects })
    } catch (error) {
      console.error('Failed to remove subject:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateStudyPreferences(localSettings)
      toast.success('Study preferences saved successfully!')
    } catch (error) {
      console.error('Failed to save all study preferences:', error)
      toast.error('Failed to save preferences. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const addQuickSubject = async () => {
    if (!quickAddSubject.trim()) return

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: quickAddSubject.trim(),
      level: 'intermediate'
    }
    
    const newSubjects = [...(localSettings.subjects || []), newSubject]
    const newSettings = {
      ...localSettings,
      subjects: newSubjects
    }
    
    setLocalSettings(newSettings)
    setQuickAddSubject('')
    
    try {
      setIsSaving(true)
      await updateStudyPreferences({ subjects: newSubjects })
      toast.success(`Added ${quickAddSubject}!`)
    } catch (error) {
      console.error('Failed to add subject:', error)
      toast.error('Failed to add subject')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleGoal = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId]
    
    setSelectedGoals(newGoals)
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-neutral-900'>Study Preferences</h2>
          <p className='text-neutral-600 mt-1'>Customize your learning experience and study habits</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className='btn-primary'
        >
          {isSaving ? 'Saving...' : isLoading ? 'Loading...' : 'Save All Changes'}
        </button>
      </div>

      {/* Quick Subject Addition */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 space-y-4'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <BookOpen className='h-5 w-5 mr-2' />
          Quick Add Subjects
        </h3>
        
        <div className='flex space-x-3'>
          <input
            type='text'
            value={quickAddSubject}
            onChange={(e) => setQuickAddSubject(e.target.value)}
            placeholder='Enter subject name (e.g., Advanced Calculus)'
            className='flex-1 input-field'
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addQuickSubject()
              }
            }}
          />
          <button
            onClick={addQuickSubject}
            disabled={!quickAddSubject.trim() || isSaving}
            className='btn-primary'
          >
            Add Subject
          </button>
        </div>

        <div className='text-sm text-neutral-600'>
          Popular subjects to add:
        </div>
        <div className='flex flex-wrap gap-2'>
          {POPULAR_SUBJECTS.slice(0, 8).map((subject) => (
            <button
              key={subject}
              onClick={() => {
                setQuickAddSubject(subject)
              }}
              className='px-3 py-1 text-xs bg-white border border-blue-200 rounded-full hover:bg-blue-50 transition-colors'
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Education Level */}
      <div className='space-y-4'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <GraduationCap className='h-5 w-5 mr-2' />
          Education Level
        </h3>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {AGE_GROUPS.map((group) => (
            <button
              key={group.id}
              onClick={() => {
                setSelectedAgeGroup(group.id)
                setSelectedGradeLevel('')
                handlePreferenceChange('age_group', group.id)
              }}
              className={`p-4 text-left border-2 rounded-lg transition-all ${
                selectedAgeGroup === group.id || localSettings.age_group === group.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className='text-2xl mb-2'>{group.icon}</div>
              <div className='font-medium text-neutral-900'>{group.name}</div>
              <div className='text-sm text-neutral-600 mt-1'>{group.description}</div>
            </button>
          ))}
        </div>

        {(selectedAgeGroup || localSettings.age_group) && (
          <div className='space-y-3'>
            <h4 className='font-medium text-neutral-900'>Select your specific grade level:</h4>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
              {AGE_GROUPS.find(g => g.id === (selectedAgeGroup || localSettings.age_group))?.grades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => {
                    setSelectedGradeLevel(grade)
                    handlePreferenceChange('grade_level', grade)
                  }}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                    selectedGradeLevel === grade || localSettings.grade_level === grade
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Study Goals */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Target className='h-5 w-5 mr-2' />
          Study Goals & Objectives
        </h3>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {STUDY_GOALS.map((goal) => {
            const Icon = goal.icon
            const isSelected = selectedGoals.includes(goal.id) || (localSettings.selected_goals || []).includes(goal.id)
            
            return (
              <button
                key={goal.id}
                onClick={() => {
                  toggleGoal(goal.id)
                  const newGoals = isSelected
                    ? (localSettings.selected_goals || []).filter((id: string) => id !== goal.id)
                    : [...(localSettings.selected_goals || []), goal.id]
                  handlePreferenceChange('selected_goals', newGoals)
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-green-600' : 'text-neutral-600'}`} />
                <div className='font-medium text-neutral-900'>{goal.name}</div>
                <div className='text-sm text-neutral-600 mt-1'>{goal.description}</div>
              </button>
            )
          })}
        </div>
        
        <div className='text-sm text-neutral-500'>
          Selected {selectedGoals.length || (localSettings.selected_goals || []).length} goal{(selectedGoals.length || (localSettings.selected_goals || []).length) !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Learning Style */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Brain className='h-5 w-5 mr-2' />
          Learning Style
        </h3>
        
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {STUDY_STYLES.map((style) => {
            const Icon = style.icon
            return (
              <button
                key={style.id}
                onClick={() => handlePreferenceChange('learning_style', style.id)}
                className={`p-4 text-left border-2 rounded-lg transition-all ${
                  localSettings.learning_style === style.id
                    ? `${style.color} border-current shadow-lg`
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Icon className='h-8 w-8 mb-3' />
                <div className='font-medium text-neutral-900'>{style.name}</div>
                <div className='text-sm text-neutral-600 mt-1'>{style.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Study Schedule */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Clock className='h-5 w-5 mr-2' />
          Study Schedule Preferences
        </h3>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Preferred Study Time
            </label>
            <select
              value={localSettings.preferred_time}
              onChange={(e: any) => handlePreferenceChange('preferred_time', e.target.value)}
              className='input-field'
            >
              <option value='morning'>Morning (6AM - 12PM)</option>
              <option value='afternoon'>Afternoon (12PM - 6PM)</option>
              <option value='evening'>Evening (6PM - 10PM)</option>
              <option value='night'>Night (10PM - 2AM)</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Session Duration
            </label>
            <select
              value={localSettings.session_duration}
              onChange={(e: any) => handlePreferenceChange('session_duration', parseInt(e.target.value))}
              className='input-field'
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Break Frequency
            </label>
            <select
              value={localSettings.break_frequency}
              onChange={(e: any) => handlePreferenceChange('break_frequency', parseInt(e.target.value))}
              className='input-field'
            >
              <option value={15}>Every 15 minutes</option>
              <option value={25}>Every 25 minutes (Pomodoro)</option>
              <option value={30}>Every 30 minutes</option>
              <option value={45}>Every 45 minutes</option>
              <option value={60}>Every hour</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Reminder Timing
            </label>
            <select
              value={localSettings.reminder_advance}
              onChange={(e: any) => handlePreferenceChange('reminder_advance', parseInt(e.target.value))}
              className='input-field'
            >
              <option value={5}>5 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
            </select>
          </div>
        </div>
      </div>

      {/* Study Environment */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Coffee className='h-5 w-5 mr-2' />
          Study Environment
        </h3>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Group Size Preference
            </label>
            <select
              value={localSettings.group_size_preference}
              onChange={(e: any) => handlePreferenceChange('group_size_preference', e.target.value)}
              className='input-field'
            >
              <option value='individual'>Individual Study</option>
              <option value='small'>Small Groups (2-4 people)</option>
              <option value='medium'>Medium Groups (5-8 people)</option>
              <option value='large'>Large Groups (9+ people)</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-neutral-700 mb-2'>
              Study Environment
            </label>
            <select
              value={localSettings.study_environment}
              onChange={(e: any) => handlePreferenceChange('study_environment', e.target.value)}
              className='input-field'
            >
              <option value='quiet'>Complete Silence</option>
              <option value='background_music'>Background Music</option>
              <option value='ambient'>Ambient Sounds</option>
              <option value='collaborative'>Collaborative Discussion</option>
            </select>
          </div>
        </div>
      </div>

      {/* Study Goals */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Target className='h-5 w-5 mr-2' />
          Study Goals
        </h3>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Daily Study Time Goal (minutes)
              </label>
              <input
                type='range'
                min='30'
                max='480'
                step='30'
                value={localSettings.study_goals.daily_study_time}
                onChange={(e: any) => handleGoalChange('daily_study_time', parseInt(e.target.value))}
                className='w-full'
              />
              <div className='text-sm text-neutral-600 mt-1'>
                {Math.floor(localSettings.study_goals.daily_study_time / 60)}h {localSettings.study_goals.daily_study_time % 60}m per day
              </div>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Weekly Study Sessions
              </label>
              <input
                type='range'
                min='1'
                max='21'
                value={localSettings.study_goals.weekly_sessions}
                onChange={(e: any) => handleGoalChange('weekly_sessions', parseInt(e.target.value))}
                className='w-full'
              />
              <div className='text-sm text-neutral-600 mt-1'>
                {localSettings.study_goals.weekly_sessions} sessions per week
              </div>
            </div>
          </div>
          
          <div className='space-y-3'>
            <h4 className='font-medium text-neutral-900'>Focus Areas</h4>
            {[
              { key: 'focus_improvement', label: 'Focus Improvement' },
              { key: 'skill_development', label: 'Skill Development' },
              { key: 'exam_preparation', label: 'Exam Preparation' },
              { key: 'collaborative_learning', label: 'Collaborative Learning' }
            ].map((goal: any) => (
              <label key={goal.key} className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  checked={localSettings.study_goals[goal.key as keyof typeof localSettings.study_goals] as boolean}
                  onChange={(e: any) => handleGoalChange(goal.key, e.targetDate.checked)}
                  className='rounded border-neutral-300 text-primary-600 focus:ring-primary-500'
                />
                <span className='text-sm text-neutral-700'>{goal.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <div className='flex items-center justify-between'>
          <h3 className='font-medium text-neutral-900 flex items-center'>
            <BookOpen className='h-5 w-5 mr-2' />
            Study Subjects
          </h3>
          <button
            onClick={addSubject}
            className='btn-outline text-sm'
          >
            Add Subject
          </button>
        </div>
        
        <div className='space-y-3'>
          {(localSettings.subjects || []).map((subject: any) => (
            <div key={subject.id} className='flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg'>
              <input
                type='text'
                value={subject.name}
                onChange={(e: any) => updateSubject(subject.id, 'name', e.target.value)}
                placeholder='Subject name'
                className='flex-1 input-field'
              />
              <select
                value={subject.level}
                onChange={(e: any) => updateSubject(subject.id, 'level', e.target.value)}
                className='input-field w-32'
              >
                <option value='beginner'>Beginner</option>
                <option value='intermediate'>Intermediate</option>
                <option value='advanced'>Advanced</option>
              </select>
              <button
                onClick={() => removeSubject(subject.id)}
                className='text-red-600 hover:text-red-800'
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Availability */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Calendar className='h-5 w-5 mr-2' />
          Weekly Availability
        </h3>
        
        <div className='space-y-3'>
          {Object.entries(localSettings.availability || {}).map(([day, settings]) => (
            <div key={day} className='flex items-center space-x-4 p-3 border border-neutral-200 rounded-lg'>
              <div className='w-20'>
                <span className='font-medium text-neutral-900 capitalize'>{day}</span>
              </div>
              
              <label className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  checked={settings.available}
                  onChange={(e: any) => handleAvailabilityChange(day, 'available', e.target.checked)}
                  className='rounded border-neutral-300 text-primary-600 focus:ring-primary-500'
                />
                <span className='text-sm text-neutral-700'>Available</span>
              </label>
              
              {settings.available && (
                <>
                  <div className='flex items-center space-x-2'>
                    <label className='text-sm text-neutral-700'>From:</label>
                    <input
                      type='time'
                      value={settings.start}
                      onChange={(e: any) => handleAvailabilityChange(day, 'start', e.target.value)}
                      className='input-field w-24'
                    />
                  </div>
                  
                  <div className='flex items-center space-x-2'>
                    <label className='text-sm text-neutral-700'>To:</label>
                    <input
                      type='time'
                      value={settings.end}
                      onChange={(e: any) => handleAvailabilityChange(day, 'end', e.target.value)}
                      className='input-field w-24'
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className='space-y-4 border-t border-neutral-200 pt-6'>
        <h3 className='font-medium text-neutral-900 flex items-center'>
          <Zap className='h-5 w-5 mr-2' />
          Advanced Options
        </h3>
        
        <div className='space-y-3'>
          <label className='flex items-center justify-between p-3 border border-neutral-200 rounded-lg'>
            <div>
              <div className='font-medium text-neutral-900'>Auto-Scheduling</div>
              <div className='text-sm text-neutral-600'>Automatically schedule study sessions based on your preferences</div>
            </div>
            <input
              type='checkbox'
              checked={localSettings.auto_scheduling}
              onChange={(e: any) => handlePreferenceChange('auto_scheduling', e.targetDate.checked)}
              className='rounded border-neutral-300 text-primary-600 focus:ring-primary-500'
            />
          </label>
        </div>
      </div>
    </div>
  )
}