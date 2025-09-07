'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Edit, Trash2, Calendar, Clock, Brain, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface SmartReminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  reminderType: 'STUDY_SESSION' | 'ASSIGNMENT_DUE' | 'EXAM' | 'GOAL_DEADLINE' | 'BREAK_TIME' | 'MOTIVATION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isCompleted: boolean;
  isAIGenerated: boolean;
  aiConfidence?: number;
  adaptiveScheduling: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AIReminderSuggestion {
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  type: string;
  scheduledFor: string;
  reasoning: string[];
}

export default function SmartReminderSystem() {
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<AIReminderSuggestion[]>([]);
  const [_isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'ai-generated'>('all');
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: '',
    reminderType: 'STUDY_SESSION' as const,
    priority: 'MEDIUM' as const,
    adaptiveScheduling: true,
  });

  useEffect(() => {
    fetchReminders();
    fetchAISuggestions();
  }, []);

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration
      const mockReminders: SmartReminder[] = [
        {
          id: '1',
          title: 'Review Mathematics Chapter 5',
          description: 'Focus on calculus derivatives',
          dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          reminderType: 'STUDY_SESSION',
          priority: 'HIGH',
          isCompleted: false,
          isAIGenerated: true,
          aiConfidence: 92,
          adaptiveScheduling: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Physics Assignment Due',
          description: 'Submit quantum mechanics problem set',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          reminderType: 'ASSIGNMENT_DUE',
          priority: 'URGENT',
          isCompleted: false,
          isAIGenerated: false,
          adaptiveScheduling: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Take a 15-minute break',
          description: 'You\'ve been studying for 2 hours straight',
          dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          reminderType: 'BREAK_TIME',
          priority: 'MEDIUM',
          isCompleted: false,
          isAIGenerated: true,
          aiConfidence: 85,
          adaptiveScheduling: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      setReminders(mockReminders);
    } catch (error) {
      logger.error('Failed to fetch reminders', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAISuggestions = async () => {
    try {
      // Mock AI suggestions
      const mockSuggestions: AIReminderSuggestion[] = [
        {
          message: 'Based on your study pattern, it\'s time for your daily review session',
          urgency: 'medium',
          type: 'study_session',
          scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          reasoning: [
            'You typically study at this time',
            'You haven\'t reviewed today',
            'Your retention improves with daily review'
          ],
        },
        {
          message: 'Consider taking a break - you\'ve been focused for 90 minutes',
          urgency: 'low',
          type: 'break',
          scheduledFor: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          reasoning: [
            'Pomodoro technique suggests breaks every 90 minutes',
            'Your focus scores decrease after prolonged sessions',
            'Short breaks improve overall productivity'
          ],
        },
      ];
      
      setAISuggestions(mockSuggestions);
    } catch (error) {
      logger.error('Failed to fetch AI suggestions', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const createReminder = async () => {
    if (!newReminder.title || !newReminder.dueDate) {
      toast.error('Please fill in the required fields');
      return;
    }

    try {
      const reminder: SmartReminder = {
        id: Date.now().toString(),
        ...newReminder,
        isCompleted: false,
        isAIGenerated: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setReminders(prev => [...prev, reminder]);
      setNewReminder({
        title: '',
        description: '',
        dueDate: '',
        reminderType: 'STUDY_SESSION',
        priority: 'MEDIUM',
        adaptiveScheduling: true,
      });
      setShowCreateForm(false);
      toast.success('Reminder created successfully');
    } catch (error) {
      logger.error('Failed to create reminder', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to create reminder');
    }
  };

  const acceptAISuggestion = async (suggestion: AIReminderSuggestion) => {
    try {
      const reminder: SmartReminder = {
        id: Date.now().toString(),
        title: suggestion.message,
        description: `AI suggested based on: ${suggestion.reasoning.join(', ')}`,
        dueDate: suggestion.scheduledFor,
        reminderType: suggestion.type.toUpperCase() as any,
        priority: suggestion.urgency.toUpperCase() as any,
        isCompleted: false,
        isAIGenerated: true,
        aiConfidence: 88,
        adaptiveScheduling: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setReminders(prev => [...prev, reminder]);
      setAISuggestions(prev => prev.filter((s: any) => s !== suggestion));
      toast.success('AI suggestion accepted and scheduled');
    } catch (error) {
      logger.error('Failed to accept AI suggestion', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to create reminder from suggestion');
    }
  };

  const toggleCompletion = async (id: string) => {
    setReminders(prev =>
      prev.map((reminder: any) =>
        reminder.id === id
          ? { ...reminder, isCompleted: !reminder.isCompleted, updatedAt: new Date().toISOString() }
          : reminder
      )
    );
  };

  const deleteReminder = async (id: string) => {
    setReminders(prev => prev.filter((r: any) => r.id !== id));
    toast.success('Reminder deleted');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'STUDY_SESSION': return <Brain className="w-5 h-5 text-blue-500" />;
      case 'ASSIGNMENT_DUE': return <Target className="w-5 h-5 text-red-500" />;
      case 'EXAM': return <Zap className="w-5 h-5 text-purple-500" />;
      case 'BREAK_TIME': return <Clock className="w-5 h-5 text-green-500" />;
      case 'MOTIVATION': return <Bell className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFilteredReminders = () => {
    switch (filter) {
      case 'pending':
        return reminders.filter((r: any) => !r.isCompleted);
      case 'completed':
        return reminders.filter((r: any) => r.isCompleted);
      case 'ai-generated':
        return reminders.filter((r: any) => r.isAIGenerated);
      default:
        return reminders;
    }
  };

  const formatTimeUntil = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));

    if (diffInMinutes < 0) {
      return 'Overdue';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / (24 * 60));
      return `${days}d`;
    }
  };

  const filteredReminders = getFilteredReminders();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Reminders</h1>
          <p className="text-gray-600">AI-powered study reminders that adapt to your habits</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 text-blue-500 mr-2" />
            AI Suggestions
          </h2>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{suggestion.message}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Scheduled for {new Date(suggestion.scheduledFor).toLocaleTimeString()}
                    </p>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">AI reasoning:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {suggestion.reasoning.map((reason, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => acceptAISuggestion(suggestion)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setAISuggestions(prev => prev.filter((s: any) => s !== suggestion))}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { key: 'all', label: 'All', count: reminders.length },
          { key: 'pending', label: 'Pending', count: reminders.filter((r: any) => !r.isCompleted).length },
          { key: 'completed', label: 'Completed', count: reminders.filter((r: any) => r.isCompleted).length },
          { key: 'ai-generated', label: 'AI Generated', count: reminders.filter((r: any) => r.isAIGenerated).length },
        ].map((tab: any) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
              filter === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === tab.key ? 'bg-blue-400' : 'bg-gray-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredReminders.map((reminder: any) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-white rounded-lg border p-4 ${
                reminder.isCompleted ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={reminder.isCompleted}
                    onChange={() => toggleCompletion(reminder.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  
                  <div className="flex-shrink-0 mt-0.5">
                    {getReminderIcon(reminder.reminderType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className={`font-medium text-gray-900 ${
                        reminder.isCompleted ? 'line-through' : ''
                      }`}>
                        {reminder.title}
                        {reminder.isAIGenerated && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            <Brain className="w-3 h-3 mr-1" />
                            AI
                            {reminder.aiConfidence && (
                              <span className="ml-1">{reminder.aiConfidence}%</span>
                            )}
                          </span>
                        )}
                      </h3>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTimeUntil(reminder.dueDate)}
                        </span>
                      </div>
                    </div>
                    
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(reminder.dueDate).toLocaleString()}
                      </span>
                      {reminder.adaptiveScheduling && (
                        <span className="flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          Adaptive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {/* Edit functionality */}}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredReminders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No reminders found</p>
          </div>
        )}
      </div>

      {/* Create Reminder Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Reminder</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e: any) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reminder title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newReminder.description}
                    onChange={(e: any) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newReminder.reminderType}
                      onChange={(e: any) => setNewReminder(prev => ({ ...prev, reminderType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="STUDY_SESSION">Study Session</option>
                      <option value="ASSIGNMENT_DUE">Assignment Due</option>
                      <option value="EXAM">Exam</option>
                      <option value="BREAK_TIME">Break Time</option>
                      <option value="MOTIVATION">Motivation</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newReminder.priority}
                      onChange={(e: any) => setNewReminder(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newReminder.dueDate}
                    onChange={(e: any) => setNewReminder(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adaptive"
                    checked={newReminder.adaptiveScheduling}
                    onChange={(e: any) => setNewReminder(prev => ({ ...prev, adaptiveScheduling: e.targetDate.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="adaptive" className="ml-2 text-sm text-gray-700">
                    Enable adaptive scheduling (AI will optimize timing)
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createReminder}
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Create Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}