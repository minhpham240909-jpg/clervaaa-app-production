describe('Helper Utilities', () => {
  describe('formatTime', () => {
    it('formats time correctly', () => {
      expect(formatTime(90)).toBe('1h 30m');
      expect(formatTime(60)).toBe('1h 0m');
      expect(formatTime(30)).toBe('30m');
      expect(formatTime(0)).toBe('0m');
    });
  });

  describe('generateStudyPlan', () => {
    it('generates study plan based on goals', () => {
      const goals = [
        { subject: 'Math', hoursPerWeek: 10, priority: 'high' },
        { subject: 'Science', hoursPerWeek: 5, priority: 'medium' }
      ];
      
      const plan = generateStudyPlan(goals);
      
      expect(plan).toHaveLength(2);
      expect(plan[0].subject).toBe('Math');
      expect(plan[0].sessionsPerWeek).toBeGreaterThan(0);
    });
  });

  describe('calculateProgress', () => {
    it('calculates progress percentage correctly', () => {
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(100, 100)).toBe(100);
      expect(calculateProgress(150, 100)).toBe(100); // Max 100%
    });

    it('handles edge cases', () => {
      expect(calculateProgress(10, 0)).toBe(0); // Avoid division by zero
      expect(calculateProgress(-5, 100)).toBe(0); // Negative current
    });
  });

  describe('formatStudyStreak', () => {
    it('formats streak correctly', () => {
      expect(formatStudyStreak(1)).toBe('1 day');
      expect(formatStudyStreak(7)).toBe('1 week');
      expect(formatStudyStreak(14)).toBe('2 weeks');
      expect(formatStudyStreak(30)).toBe('1 month');
      expect(formatStudyStreak(0)).toBe('0 days');
    });
  });

  describe('generateUserStats', () => {
    it('generates comprehensive user stats', () => {
      const mockSessions = [
        { duration: 60, subject: 'Math', date: new Date() },
        { duration: 90, subject: 'Science', date: new Date() },
        { duration: 45, subject: 'Math', date: new Date() }
      ];

      const stats = generateUserStats(mockSessions);

      expect(stats.totalHours).toBe(3.25); // 195 minutes / 60
      expect(stats.totalSessions).toBe(3);
      expect(stats.averageSession).toBe(65);
      expect(stats.subjects).toEqual(['Math', 'Science']);
    });

    it('handles empty sessions', () => {
      const stats = generateUserStats([]);
      
      expect(stats.totalHours).toBe(0);
      expect(stats.totalSessions).toBe(0);
      expect(stats.averageSession).toBe(0);
      expect(stats.subjects).toEqual([]);
    });
  });
});

// Mock implementations
function formatTime(minutes: number): string {
  if (minutes === 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function generateStudyPlan(goals: any[]) {
  return goals.map(goal => ({
    subject: goal.subject,
    hoursPerWeek: goal.hoursPerWeek,
    sessionsPerWeek: Math.ceil(goal.hoursPerWeek / 2), // 2 hours per session
    priority: goal.priority
  }));
}

function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  if (current < 0) return 0;
  
  const percentage = (current / target) * 100;
  return Math.min(percentage, 100);
}

function formatStudyStreak(days: number): string {
  if (days === 0) return '0 days';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  
  const weeks = Math.floor(days / 7);
  if (days < 30) {
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month' : `${months} months`;
}

function generateUserStats(sessions: any[]) {
  if (sessions.length === 0) {
    return {
      totalHours: 0,
      totalSessions: 0,
      averageSession: 0,
      subjects: []
    };
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const subjects = [...new Set(sessions.map(s => s.subject))];

  return {
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    totalSessions: sessions.length,
    averageSession: Math.round(totalMinutes / sessions.length),
    subjects
  };
}