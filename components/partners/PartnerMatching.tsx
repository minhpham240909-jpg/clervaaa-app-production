'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Heart, X, User, BookOpen, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import Image from 'next/image';

interface PartnerMatch {
  user: {
    id: string;
    name: string;
    image: string;
    bio: string;
    university: string;
    major: string;
    year: string;
    studyLevel: string;
    learningStyle: string;
    totalPoints: number;
    currentStreak: number;
  };
  compatibilityScore: number;
  reasons: string[];
  sharedInterests: string[];
  complementarySkills: string[];
  subjects: Array<{
    name: string;
    skillLevel: string;
    category: string;
  }>;
  stats: {
    totalPartnerships: number;
    reviewCount: number;
    recentActivity: number;
  };
  aiEnhanced: boolean;
  behaviorInsights?: string[];
  studyPredictions?: {
    successProbability: number;
    recommendedSessionLength: number;
    optimalMeetingFrequency: string;
    strongestCollaborationAreas: string[];
    growthOpportunities: string[];
  };
  partnershipPredictions?: {
    estimatedStudyImprovement: string;
    recommendedFirstMeeting: string;
    idealCollaborationStyle: string;
    mutualBenefits: string[];
  };
}

interface Filters {
  studyLevel: string[];
  subjects: string[];
  learningStyle: string[];
  sessionType: string[];
}

export default function PartnerMatching() {
  const [matches, setMatches] = useState<PartnerMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    studyLevel: [],
    subjects: [],
    learningStyle: [],
    sessionType: [],
  });
  const [availableFilters, setAvailableFilters] = useState<any>(null);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/ai/partner-matching');
      if (response.ok) {
        const data = await response.json();
        setAvailableFilters(data.filters);
      }
    } catch (error) {
      logger.error('Failed to fetch filter options', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/partner-matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            studyLevel: filters.studyLevel.length > 0 ? filters.studyLevel : undefined,
            subjects: filters.subjects.length > 0 ? filters.subjects : undefined,
            learningStyle: filters.learningStyle.length > 0 ? filters.learningStyle : undefined,
            sessionType: filters.sessionType.length > 0 ? filters.sessionType : undefined,
          },
          limit: 20,
          includeAIScoring: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data = await response.json();
      setMatches(data.matches);
      setCurrentMatchIndex(0);
    } catch (error) {
      logger.error('Failed to fetch matches', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to load partner matches');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMatches();
    fetchFilterOptions();
  }, [fetchMatches]);

  const handleLike = async (match: PartnerMatch) => {
    try {
      // Send partner request
      const response = await fetch('/api/partners/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: match.user.id,
          message: `Hi! I'd love to be study partners. We have a ${match.compatibilityScore}% compatibility score!`,
        }),
      });

      if (response.ok) {
        toast.success(`Study partner request sent to ${match.user.name}!`);
        nextMatch();
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      logger.error('Failed to send partner request', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to send partner request');
    }
  };

  const handlePass = () => {
    nextMatch();
  };

  const nextMatch = () => {
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      // Fetch more matches
      fetchMatches();
    }
  };

  const updateFilter = (filterType: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((v: any) => v !== value)
        : [...prev[filterType], value]
    }));
  };

  const applyFilters = () => {
    setShowFilters(false);
    fetchMatches();
  };

  const clearFilters = () => {
    setFilters({
      studyLevel: [],
      subjects: [],
      learningStyle: [],
      sessionType: [],
    });
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const currentMatch = matches && matches.length > 0 ? matches[currentMatchIndex] : null;

  if (isLoading && (!matches || matches.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" role="status" aria-label="Loading"></div>
          <p className="text-gray-600">Finding your perfect study partners...</p>
        </div>
      </div>
    );
  }

  if (!currentMatch && (!matches || matches.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No more matches</h2>
          <p className="text-gray-600 mb-4">Try adjusting your filters or check back later!</p>
          <button
            onClick={() => {
              clearFilters();
              fetchMatches();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reset and Find More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Find Study Partners</h1>
        <button
          onClick={() => setShowFilters(true)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <Filter className="w-6 h-6" />
        </button>
      </div>

      {/* Match Card */}
      <AnimatePresence mode="wait">
        {currentMatch && (
          <motion.div
            key={currentMatchIndex}
            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
          >
            {/* Profile Image and Basic Info */}
            <div className="relative">
              <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                {currentMatch.user.image ? (
                  <Image
                    src={currentMatch.user.image}
                    alt={currentMatch.user.name}
                    width={128}
                    height={128}
                    className="rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-white flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Compatibility Score */}
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getCompatibilityColor(currentMatch.compatibilityScore)}`}>
                  {currentMatch.compatibilityScore}% Match
                  {currentMatch.aiEnhanced && <Sparkles className="w-4 h-4 inline ml-1" />}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{currentMatch.user.name}</h2>
                <p className="text-gray-600">{currentMatch.user.major} • {currentMatch.user.year}</p>
                <p className="text-gray-500 text-sm">{currentMatch.user.university}</p>
              </div>

              {/* Bio */}
              {currentMatch.user.bio && (
                <div className="mb-4">
                  <p className="text-gray-700 text-center italic">"{currentMatch.user.bio}"</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{currentMatch.user.totalPoints || 0}</div>
                  <div className="text-xs text-gray-500">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{currentMatch.user.currentStreak || 0}</div>
                  <div className="text-xs text-gray-500">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{currentMatch.stats.totalPartnerships}</div>
                  <div className="text-xs text-gray-500">Partners</div>
                </div>
              </div>

              {/* Study Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Study Level: {currentMatch.user.studyLevel}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Learning Style: {currentMatch.user.learningStyle}</span>
                </div>
              </div>

              {/* Subjects */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Subjects</h4>
                <div className="flex flex-wrap gap-2">
                  {currentMatch.subjects?.slice(0, 6)?.map((subject, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {subject.name} ({subject.skillLevel})
                    </span>
                  )) || <span className="text-sm text-gray-500">No subjects listed</span>}
                  {currentMatch.subjects && currentMatch.subjects.length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{currentMatch.subjects.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Shared Interests */}
              {currentMatch.sharedInterests.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Shared Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentMatch.sharedInterests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Compatibility Analysis */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Why you're compatible</h4>
                
                {/* Compatibility Reasons */}
                <ul className="space-y-2 mb-4">
                  {currentMatch.reasons.slice(0, 3).map((reason, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {reason}
                    </li>
                  ))}
                </ul>

                {/* AI Insights */}
                {currentMatch.aiEnhanced && currentMatch.behaviorInsights && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <h5 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" />
                      AI Behavioral Analysis
                    </h5>
                    <div className="space-y-1">
                      {currentMatch.behaviorInsights.map((insight: string, index: number) => (
                        <p key={index} className="text-xs text-blue-700">{insight}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Study Predictions */}
                {currentMatch.studyPredictions && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-green-900 mb-2">Partnership Predictions</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                      <div>
                        <span className="font-medium">Success Rate:</span> {currentMatch.studyPredictions.successProbability}%
                      </div>
                      <div>
                        <span className="font-medium">Session Length:</span> {currentMatch.studyPredictions.recommendedSessionLength}min
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Meeting Frequency:</span> {currentMatch.studyPredictions.optimalMeetingFrequency}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex p-6 pt-0">
              <button
                onClick={handlePass}
                className="flex-1 mr-2 flex items-center justify-center space-x-2 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-300 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
                <span>Pass</span>
              </button>
              <button
                onClick={() => handleLike(currentMatch)}
                className="flex-1 ml-2 flex items-center justify-center space-x-2 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span>Connect</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
                  <div className="text-center text-sm text-gray-500">
              {currentMatchIndex + 1} of {matches?.length || 0} matches
            </div>

      {/* Filters Modal */}
      {showFilters && availableFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filter Partners</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close filter modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Sections */}
              <div className="space-y-6">
                {/* Study Level */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Study Level</h4>
                  <div className="space-y-2">
                    {availableFilters.studyLevels.map((level: string) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.studyLevel.includes(level)}
                          onChange={() => updateFilter('studyLevel', level)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Learning Style */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Learning Style</h4>
                  <div className="space-y-2">
                    {availableFilters.learningStyles.map((style: string) => (
                      <label key={style} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.learningStyle.includes(style)}
                          onChange={() => updateFilter('learningStyle', style)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Session Type */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Session Type</h4>
                  <div className="space-y-2">
                    {availableFilters.sessionTypes.map((type: string) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.sessionType.includes(type)}
                          onChange={() => updateFilter('sessionType', type)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {type.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}