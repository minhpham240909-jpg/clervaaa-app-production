'use client';

import React, { useState, useEffect } from 'react';
import { TrendingDown, AlertTriangle, CheckCircle, Clock, Target, Users, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface EngagementPrediction {
  engagementScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  predictedDropoutDays: number;
  confidence: number;
  recommendations: string[];
  interventions: string[];
  features?: any;
  featureImportance?: Array<{ feature: string; importance: number }>;
  modelVersion?: string;
}

interface EngagementPredictionProps {
  userId?: string;
  refreshInterval?: number; // in milliseconds
  showFeatures?: boolean;
}

export default function EngagementPrediction({ 
  userId: _userId, 
  refreshInterval = 300000, // 5 minutes
  showFeatures = false 
}: EngagementPredictionProps) {
  const [prediction, setPrediction] = useState<EngagementPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ml/engagement-prediction', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch engagement prediction');
      }

      const data = await response.json();
      setPrediction(data);
      setLastUpdated(new Date());

    } catch (error) {
      // Error is handled by toast and error state
      setError('Failed to load engagement prediction');
      toast.error('Failed to load engagement prediction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();

    // Set up refresh interval
    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrediction, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="w-5 h-5" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5" />;
      case 'high':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getEngagementScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchPrediction}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Engagement Prediction</h3>
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Engagement Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Engagement Score</span>
              <span className={`text-lg font-bold ${getEngagementScoreColor(prediction.engagementScore)}`}>
                {prediction.engagementScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  prediction.engagementScore >= 70 ? 'bg-green-500' :
                  prediction.engagementScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${prediction.engagementScore}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>

          {/* Risk Level */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Risk Level</span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(prediction.riskLevel)}`}>
                {getRiskLevelIcon(prediction.riskLevel)}
                {prediction.riskLevel.toUpperCase()}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {prediction.riskLevel === 'low' && 'You\'re doing great! Keep up the excellent work.'}
              {prediction.riskLevel === 'medium' && 'You\'re on the right track, but there\'s room for improvement.'}
              {prediction.riskLevel === 'high' && 'We\'re here to help you get back on track with your studies.'}
            </p>
          </div>

          {/* Prediction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Predicted Dropout</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {prediction.predictedDropoutDays} days
              </p>
              <p className="text-xs text-gray-500">
                Time until potential disengagement
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Confidence</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {Math.round(prediction.confidence * 100)}%
              </p>
              <p className="text-xs text-gray-500">
                Prediction confidence level
              </p>
            </div>
          </div>

          {/* Recommendations */}
          {prediction.recommendations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {prediction.recommendations.map((recommendation, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    {recommendation}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Interventions */}
          {prediction.interventions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Suggested Interventions
              </h4>
              <ul className="space-y-2">
                {prediction.interventions.map((intervention, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    {intervention}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Features (if enabled) */}
          {showFeatures && prediction.features && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Feature Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Study Hours:</span>
                  <span className="ml-1 font-medium">{prediction.features.totalStudyHours.toFixed(1)}h</span>
                </div>
                <div>
                  <span className="text-gray-500">Streak:</span>
                  <span className="ml-1 font-medium">{prediction.features.streakLength} days</span>
                </div>
                <div>
                  <span className="text-gray-500">Partners:</span>
                  <span className="ml-1 font-medium">{prediction.features.partnerCount}</span>
                </div>
                <div>
                  <span className="text-gray-500">Session Freq:</span>
                  <span className="ml-1 font-medium">{prediction.features.sessionFrequency.toFixed(1)}/week</span>
                </div>
                <div>
                  <span className="text-gray-500">Goal Completion:</span>
                  <span className="ml-1 font-medium">{(prediction.features.goalCompletionRate * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Activity:</span>
                  <span className="ml-1 font-medium">{prediction.features.lastActivityDays} days ago</span>
                </div>
              </div>
            </div>
          )}

          {/* Feature Importance (if available) */}
          {prediction.featureImportance && prediction.featureImportance.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Feature Importance</h4>
              <div className="space-y-2">
                {prediction.featureImportance.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 capitalize">{item.feature.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full" 
                          style={{ width: `${(item.importance / Math.max(...prediction.featureImportance!.map((f: any) => f.importance))) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-500 w-8 text-right">{(item.importance * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model Version */}
          {prediction.modelVersion && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ML Model Version:</span>
                <span className="font-mono">{prediction.modelVersion}</span>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={fetchPrediction}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
