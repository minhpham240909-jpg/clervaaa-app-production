'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, Sparkles, Plus, X, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface Deadline {
  subject: string;
  deadline: string;
  description: string;
}

interface StudyPlanItem {
  date: string;
  subject: string;
  topic: string;
  duration: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'review' | 'new_material' | 'practice' | 'exam_prep';
  description: string;
}

interface StudyPlan {
  plan: StudyPlanItem[];
  recommendations: string[];
  totalHours: number;
  estimatedCompletion: Date;
}

export default function StudyPlanGenerator() {
  const [subjects, setSubjects] = useState<string[]>(['']);
  const [deadlines, setDeadlines] = useState<Deadline[]>([{ subject: '', deadline: '', description: '' }]);
  const [availableHours, setAvailableHours] = useState<number>(10);
  const [goals, setGoals] = useState<string[]>(['']);
  const [generateCalendarEvents, setGenerateCalendarEvents] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchStudyPlanContext();
  }, []);

  const fetchStudyPlanContext = async () => {
    try {
      const response = await fetch('/api/ai/study-plan');
      if (response.ok) {
        const data = await response.json();
        setAvailableSubjects(data.context.userSubjects.map((s: any) => s.name));
      }
    } catch (error) {
      logger.error('Failed to fetch context', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, '']);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const addDeadline = () => {
    setDeadlines([...deadlines, { subject: '', deadline: '', description: '' }]);
  };

  const removeDeadline = (index: number) => {
    setDeadlines(deadlines.filter((_, i) => i !== index));
  };

  const updateDeadline = (index: number, field: keyof Deadline, value: string) => {
    const newDeadlines = [...deadlines];
    newDeadlines[index] = { ...newDeadlines[index], [field]: value };
    setDeadlines(newDeadlines);
  };

  const addGoal = () => {
    setGoals([...goals, '']);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const generateStudyPlan = async () => {
    const validSubjects = subjects.filter((s: any) => s.trim());
    const validDeadlines = deadlines.filter((d: any) => d.subject && d.targetDate && d.description);
    const validGoals = goals.filter((g: any) => g.trim());

    if (validSubjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }

    if (availableHours <= 0) {
      toast.error('Please specify available hours per week');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjects: validSubjects,
          deadlines: validDeadlines,
          availableHours,
          goals: validGoals,
          generateCalendarEvents,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study plan');
      }

      const data = await response.json();
      setGeneratedPlan(data.plan);
      toast.success('Study plan generated successfully!');
    } catch (error) {
      logger.error('Study plan generation error', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to generate study plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam_prep': return '📝';
      case 'practice': return '💪';
      case 'new_material': return '📚';
      case 'review': return '🔄';
      default: return '📖';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Study Plan Generator</h1>
        <p className="text-gray-600">Create a personalized study plan powered by AI</p>
      </div>

      {!generatedPlan ? (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects to Study
            </label>
            {subjects.map((subject, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={subject}
                  onChange={(e: any) => updateSubject(index, e.target.value)}
                  placeholder="Enter subject name"
                  list="available-subjects"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="available-subjects">
                  {availableSubjects.map((s: any) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                {subjects.length > 1 && (
                  <button
                    onClick={() => removeSubject(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addSubject}
              className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          {/* Available Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Hours per Week
            </label>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={availableHours}
                onChange={(e: any) => setAvailableHours(parseInt(e.target.value) || 0)}
                min="1"
                max="168"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              />
              <span className="text-gray-500">hours</span>
            </div>
          </div>

          {/* Deadlines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upcoming Deadlines
            </label>
            {deadlines.map((deadline, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  value={deadline.subject}
                  onChange={(e: any) => updateDeadline(index, 'subject', e.target.value)}
                  placeholder="Subject"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={deadline.deadline}
                  onChange={(e: any) => updateDeadline(index, 'deadline', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={deadline.description}
                    onChange={(e: any) => updateDeadline(index, 'description', e.target.value)}
                    placeholder="Description (e.g., Final Exam)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {deadlines.length > 1 && (
                    <button
                      onClick={() => removeDeadline(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={addDeadline}
              className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deadline</span>
            </button>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Goals (Optional)
            </label>
            {goals.map((goal, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e: any) => updateGoal(index, e.target.value)}
                  placeholder="Enter study goal"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {goals.length > 1 && (
                  <button
                    onClick={() => removeGoal(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addGoal}
              className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </div>

          {/* Options */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="generate-events"
              checked={generateCalendarEvents}
              onChange={(e: any) => setGenerateCalendarEvents(e.targetDate.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="generate-events" className="text-sm text-gray-700">
              Create calendar events for study sessions
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateStudyPlan}
            disabled={isGenerating}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating Study Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate AI Study Plan</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Plan Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Study Plan</h2>
              <button
                onClick={() => setGeneratedPlan(null)}
                className="px-4 py-2 text-blue-500 hover:text-blue-700 text-sm"
              >
                Generate New Plan
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{generatedPlan.totalHours}</div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{generatedPlan.plan.length}</div>
                <div className="text-sm text-gray-600">Study Sessions</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {new Date(generatedPlan.estimatedCompletion).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Completion Date</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Recommendations</h3>
              <div className="space-y-2">
                {generatedPlan.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Study Schedule */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Study Schedule</h3>
            <div className="space-y-4">
              {generatedPlan.plan.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getTypeIcon(item.type)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.topic}</h4>
                          <p className="text-sm text-gray-600">{item.subject}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{item.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.duration} hours</span>
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}