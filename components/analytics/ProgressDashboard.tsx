'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Target, Clock, Zap, Trophy, Brain, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface ProgressAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextActions: string[];
  motivationalMessage: string;
}

interface Metrics {
  timeframe: string;
  totalStudyHours: number;
  averageSessionRating: number;
  studyConsistency: number;
  totalSessions: number;
  completedGoals: number;
  activeGoals: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
}

interface SubjectInsight {
  subject: string;
  skillLevel: string;
  hoursStudied: number;
  sessionCount: number;
  averageRating: number;
}

interface Achievement {
  name: string;
  description: string;
  category: string;
  rarity: string;
  unlockedAt: string;
}

interface Trends {
  weeklyHours: number[];
  productivityScore: number;
  focusScore: number;
}

interface ProgressData {
  analysis: ProgressAnalysis;
  metrics: Metrics;
  subjectInsights: SubjectInsight[];
  recentAchievements: Achievement[];
  trends: Trends;
  generatedAt: string;
}

export default function ProgressDashboard() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showAIInsights, setShowAIInsights] = useState(true);

  const fetchProgressAnalysis = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/progress-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe,
          includeRecommendations: true,
          focusAreas: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress analysis');
      }

      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      logger.error('Failed to fetch progress analysis', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to load progress analysis');
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchProgressAnalysis();
  }, [fetchProgressAnalysis]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'text-purple-600 bg-purple-100 border-purple-300';
      case 'epic': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'rare': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'uncommon': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  if (isLoading && !progressData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your progress...</p>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No data available</h2>
          <p className="text-gray-600 mb-4">Start studying to see your progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Analytics</h1>
          <p className="text-gray-600">AI-powered insights into your study journey</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e: any) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          
          <button
            onClick={() => setShowAIInsights(!showAIInsights)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              showAIInsights ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Insights</span>
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreColor(progressData.analysis.overallScore)}`}>
            {progressData.analysis.overallScore}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Overall Progress Score</h2>
          <p className="text-gray-600">Based on your study habits and goal completion</p>
        </div>

        {showAIInsights && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">AI Motivation</h3>
            <p className="text-blue-800">{progressData.analysis.motivationalMessage}</p>
          </div>
        )}
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{progressData.metrics.totalStudyHours}h</div>
          <div className="text-sm text-gray-600">Total Study Hours</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{progressData.metrics.completedGoals}</div>
          <div className="text-sm text-gray-600">Goals Completed</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{progressData.metrics.currentStreak}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{progressData.metrics.totalPoints}</div>
          <div className="text-sm text-gray-600">Total Points</div>
        </motion.div>
      </div>

      {/* Trends and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Study Hours</h3>
          <div className="space-y-2">
            {progressData.trends.weeklyHours.map((hours, index) => (
              <div key={index} className="flex items-center">
                <span className="text-sm text-gray-600 w-16">Week {index + 1}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min((hours / Math.max(...progressData.trends.weeklyHours)) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12">{hours}h</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Scores</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Productivity</span>
                <span>{progressData.trends.productivityScore}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${progressData.trends.productivityScore}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Focus Score</span>
                <span>{progressData.trends.focusScore}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${progressData.trends.focusScore}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Consistency</span>
                <span>{Math.round(progressData.metrics.studyConsistency)}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${progressData.metrics.studyConsistency}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {progressData.recentAchievements.length > 0 ? (
              progressData.recentAchievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getRarityColor(achievement.rarity)}`}>
                  <div className="font-medium">{achievement.name}</div>
                  <div className="text-sm opacity-75">{achievement.description}</div>
                  <div className="text-xs mt-1 opacity-60">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent achievements. Keep studying to unlock new badges!</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      {showAIInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths and Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
              <ul className="space-y-1">
                {progressData.analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-orange-700 mb-2">Areas for Improvement</h4>
              <ul className="space-y-1">
                {progressData.analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-blue-700 mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {progressData.analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-purple-700 mb-2">Next Actions</h4>
              <ul className="space-y-2">
                {progressData.analysis.nextActions.map((action, index) => (
                  <li key={index} className="text-sm text-gray-700 bg-purple-50 p-2 rounded flex items-start">
                    <Calendar className="w-4 h-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      )}

      {/* Subject Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Subject</th>
                <th className="text-left py-2">Skill Level</th>
                <th className="text-left py-2">Hours Studied</th>
                <th className="text-left py-2">Sessions</th>
                <th className="text-left py-2">Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {progressData.subjectInsights.map((insight, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{insight.subject}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {insight.skillLevel}
                    </span>
                  </td>
                  <td className="py-2">{insight.hoursStudied.toFixed(1)}h</td>
                  <td className="py-2">{insight.sessionCount}</td>
                  <td className="py-2">
                    <div className="flex items-center">
                      <span className="mr-1">{insight.averageRating.toFixed(1)}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star: any) => (
                          <span
                            key={star}
                            className={`text-xs ${
                              star <= insight.averageRating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}