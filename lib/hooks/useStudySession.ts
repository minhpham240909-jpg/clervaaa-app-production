'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/logger';

export interface StudyNote {
  id: string;
  content: string;
  timestamp: number;
  author: string;
  type: 'note' | 'highlight' | 'question' | 'idea';
}

export interface StudySessionData {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  participants: string[];
  notes: StudyNote[];
  topic?: string;
  screenshareEvents: {
    timestamp: number;
    participantId: string;
    action: 'start' | 'stop';
  }[];
}

export interface UseStudySessionOptions {
  sessionId: string;
  userId: string;
  topic?: string;
  onSessionEnd?: (sessionData: StudySessionData) => void;
  onNoteAdded?: (note: StudyNote) => void;
}

export function useStudySession(options: UseStudySessionOptions) {
  const { sessionId, userId, topic, onSessionEnd, onNoteAdded } = options;
  
  const [sessionData, setSessionData] = useState<StudySessionData>({
    sessionId,
    startTime: Date.now(),
    duration: 0,
    participants: [userId],
    notes: [],
    topic,
    screenshareEvents: []
  });
  
  const [isActive, setIsActive] = useState(true);
  const [currentNote, setCurrentNote] = useState('');
  const intervalRef = useRef<NodeJS.Timeout>();

  // Update session duration
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSessionData(prev => ({
          ...prev,
          duration: Date.now() - prev.startTime
        }));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const addNote = useCallback((content: string, type: StudyNote['type'] = 'note') => {
    if (!content.trim()) return;

    const note: StudyNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      timestamp: Date.now(),
      author: userId,
      type
    };

    setSessionData(prev => ({
      ...prev,
      notes: [...prev.notes, note]
    }));

    onNoteAdded?.(note);
    logger.info('Study note added', { noteId: note.id, type, sessionId });

    return note;
  }, [userId, sessionId, onNoteAdded]);

  const addParticipant = useCallback((participantId: string) => {
    setSessionData(prev => ({
      ...prev,
      participants: [...new Set([...prev.participants, participantId])]
    }));
    logger.info('Participant added to study session', { participantId, sessionId });
  }, [sessionId]);

  const removeParticipant = useCallback((participantId: string) => {
    setSessionData(prev => ({
      ...prev,
      participants: prev.participants.filter(id => id !== participantId)
    }));
    logger.info('Participant removed from study session', { participantId, sessionId });
  }, [sessionId]);

  const recordScreenshareEvent = useCallback((participantId: string, action: 'start' | 'stop') => {
    setSessionData(prev => ({
      ...prev,
      screenshareEvents: [...prev.screenshareEvents, {
        timestamp: Date.now(),
        participantId,
        action
      }]
    }));
    
    logger.info('Screenshare event recorded', { participantId, action, sessionId });
  }, [sessionId]);

  const endSession = useCallback(() => {
    if (!isActive) return sessionData;

    setIsActive(false);
    
    const finalSessionData: StudySessionData = {
      ...sessionData,
      endTime: Date.now(),
      duration: Date.now() - sessionData.startTime
    };

    setSessionData(finalSessionData);
    onSessionEnd?.(finalSessionData);
    
    logger.info('Study session ended', { 
      sessionId, 
      duration: finalSessionData.duration,
      noteCount: finalSessionData.notes.length,
      participantCount: finalSessionData.participants.length 
    });

    return finalSessionData;
  }, [isActive, sessionData, sessionId, onSessionEnd]);

  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }, []);

  const getSessionSummary = useCallback(() => {
    const notesByType = sessionData.notes.reduce((acc, note) => {
      acc[note.type] = (acc[note.type] || 0) + 1;
      return acc;
    }, {} as Record<StudyNote['type'], number>);

    const screenshareTime = sessionData.screenshareEvents.reduce((total, event, index) => {
      if (event.action === 'start') {
        const nextEvent = sessionData.screenshareEvents[index + 1];
        const endTime = nextEvent?.action === 'stop' ? nextEvent.timestamp : Date.now();
        return total + (endTime - event.timestamp);
      }
      return total;
    }, 0);

    return {
      duration: sessionData.duration,
      formattedDuration: formatDuration(sessionData.duration),
      participantCount: sessionData.participants.length,
      totalNotes: sessionData.notes.length,
      notesByType,
      screenshareTime,
      formattedScreenshareTime: formatDuration(screenshareTime),
      topic: sessionData.topic
    };
  }, [sessionData, formatDuration]);

  // Auto-save session data periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (isActive && sessionData.notes.length > 0) {
        try {
          localStorage.setItem(`study-session-${sessionId}`, JSON.stringify(sessionData));
        } catch (error) {
          logger.warn('Failed to save study session data', error as Error);
        }
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [sessionId, sessionData, isActive]);

  return {
    sessionData,
    isActive,
    currentNote,
    setCurrentNote,
    addNote,
    addParticipant,
    removeParticipant,
    recordScreenshareEvent,
    endSession,
    formatDuration,
    getSessionSummary
  };
}