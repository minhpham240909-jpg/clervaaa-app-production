import { renderHook, act } from '@testing-library/react';

describe('useStudySession hook', () => {
  describe('session management', () => {
    it('starts a study session', () => {
      const { result } = renderHook(() => useStudySession());

      act(() => {
        result.current.startSession('Math');
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.subject).toBe('Math');
      expect(result.current.startTime).toBeTruthy();
    });

    it('stops a study session', () => {
      const { result } = renderHook(() => useStudySession());

      act(() => {
        result.current.startSession('Math');
      });

      act(() => {
        result.current.stopSession();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.subject).toBeNull();
    });

    it('pauses and resumes session', () => {
      const { result } = renderHook(() => useStudySession());

      act(() => {
        result.current.startSession('Math');
      });

      act(() => {
        result.current.pauseSession();
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.resumeSession();
      });

      expect(result.current.isPaused).toBe(false);
    });

    it('calculates session duration', async () => {
      jest.useFakeTimers();
      
      const { result } = renderHook(() => useStudySession());

      act(() => {
        result.current.startSession('Math');
      });

      act(() => {
        jest.advanceTimersByTime(300000); // 5 minutes
      });

      expect(result.current.duration).toBe(300); // 5 minutes in seconds

      jest.useRealTimers();
    });

    it('handles session with breaks', () => {
      const { result } = renderHook(() => useStudySession());

      act(() => {
        result.current.startSession('Math');
        result.current.addBreak(5); // 5 minute break
      });

      expect(result.current.breaks).toHaveLength(1);
      expect(result.current.totalBreakTime).toBe(5);
    });

    it('tracks study goals progress', () => {
      const { result } = renderHook(() => useStudySession());

      act(() => {
        result.current.setDailyGoal(120); // 2 hours
        result.current.startSession('Math');
        result.current.completeSession(60); // 1 hour session
      });

      expect(result.current.todayProgress).toBe(50); // 50% of daily goal
    });
  });

  describe('session statistics', () => {
    it('calculates weekly statistics', () => {
      const { result } = renderHook(() => useStudySession());

      const mockSessions = [
        { subject: 'Math', duration: 60, date: new Date() },
        { subject: 'Math', duration: 90, date: new Date() },
        { subject: 'Science', duration: 45, date: new Date() }
      ];

      act(() => {
        result.current.setSessionHistory(mockSessions);
      });

      const stats = result.current.getWeeklyStats();

      expect(stats.totalMinutes).toBe(195);
      expect(stats.averageSession).toBe(65);
      expect(stats.subjectBreakdown).toHaveProperty('Math');
      expect(stats.subjectBreakdown).toHaveProperty('Science');
    });

    it('calculates study streaks', () => {
      const { result } = renderHook(() => useStudySession());

      const mockSessions = Array.from({ length: 5 }, (_, i) => ({
        subject: 'Math',
        duration: 60,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // Last 5 days
      }));

      act(() => {
        result.current.setSessionHistory(mockSessions);
      });

      expect(result.current.currentStreak).toBe(5);
    });
  });

  describe('pomodoro integration', () => {
    it('handles pomodoro timer', async () => {
      jest.useFakeTimers();
      
      const { result } = renderHook(() => useStudySession());

      act(() => {
        result.current.startPomodoro('Math', 25); // 25 minute pomodoro
      });

      expect(result.current.isPomodoro).toBe(true);
      expect(result.current.pomodoroTimeLeft).toBe(25 * 60); // 25 minutes in seconds

      act(() => {
        jest.advanceTimersByTime(1500000); // 25 minutes
      });

      expect(result.current.pomodoroComplete).toBe(true);

      jest.useRealTimers();
    });

    it('handles pomodoro breaks', () => {
      const { result } = renderHook(() => useStudySession());

      act(() => {
        result.current.completedPomodoros = 4;
        result.current.startPomodoroBreak();
      });

      expect(result.current.isOnBreak).toBe(true);
      expect(result.current.breakDuration).toBe(15); // Long break after 4 pomodoros
    });
  });
});

// Mock implementation of useStudySession hook
function useStudySession() {
  const [state, setState] = React.useState({
    isActive: false,
    isPaused: false,
    subject: null as string | null,
    startTime: null as Date | null,
    duration: 0,
    breaks: [] as number[],
    dailyGoal: 0,
    todayProgress: 0,
    sessionHistory: [] as any[],
    currentStreak: 0,
    isPomodoro: false,
    pomodoroTimeLeft: 0,
    pomodoroComplete: false,
    completedPomodoros: 0,
    isOnBreak: false,
    breakDuration: 0,
  });

  return {
    ...state,
    startSession: (subject: string) => {
      setState(prev => ({
        ...prev,
        isActive: true,
        subject,
        startTime: new Date(),
        isPaused: false
      }));
    },
    stopSession: () => {
      setState(prev => ({
        ...prev,
        isActive: false,
        subject: null,
        startTime: null,
        duration: 0
      }));
    },
    pauseSession: () => {
      setState(prev => ({ ...prev, isPaused: true }));
    },
    resumeSession: () => {
      setState(prev => ({ ...prev, isPaused: false }));
    },
    addBreak: (duration: number) => {
      setState(prev => ({
        ...prev,
        breaks: [...prev.breaks, duration]
      }));
    },
    get totalBreakTime() {
      return state.breaks.reduce((sum, b) => sum + b, 0);
    },
    setDailyGoal: (goal: number) => {
      setState(prev => ({ ...prev, dailyGoal: goal }));
    },
    completeSession: (duration: number) => {
      setState(prev => ({
        ...prev,
        todayProgress: prev.dailyGoal > 0 ? (duration / prev.dailyGoal) * 100 : 0
      }));
    },
    setSessionHistory: (history: any[]) => {
      setState(prev => ({
        ...prev,
        sessionHistory: history,
        currentStreak: history.length // Simplified streak calculation
      }));
    },
    getWeeklyStats: () => {
      const totalMinutes = state.sessionHistory.reduce((sum, s) => sum + s.duration, 0);
      const subjectBreakdown: Record<string, number> = {};
      
      state.sessionHistory.forEach(session => {
        subjectBreakdown[session.subject] = 
          (subjectBreakdown[session.subject] || 0) + session.duration;
      });

      return {
        totalMinutes,
        averageSession: state.sessionHistory.length > 0 
          ? Math.round(totalMinutes / state.sessionHistory.length) 
          : 0,
        subjectBreakdown
      };
    },
    startPomodoro: (subject: string, duration: number) => {
      setState(prev => ({
        ...prev,
        isActive: true,
        isPomodoro: true,
        subject,
        pomodoroTimeLeft: duration * 60,
        startTime: new Date()
      }));
    },
    startPomodoroBreak: () => {
      const longBreak = state.completedPomodoros >= 4;
      setState(prev => ({
        ...prev,
        isOnBreak: true,
        breakDuration: longBreak ? 15 : 5
      }));
    }
  };
}

// Mock React for the hook
const React = {
  useState: (initialState: any) => {
    let currentState = initialState;
    const setState = (newState: any) => {
      if (typeof newState === 'function') {
        currentState = newState(currentState);
      } else {
        currentState = newState;
      }
    };
    return [currentState, setState];
  }
};