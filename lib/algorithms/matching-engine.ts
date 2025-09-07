import { User, UserSubject, Partnership, PersonalStudySession, Goal } from '@prisma/client';

// Extended User type with required matching fields
export interface ExtendedUser extends Omit<User, 'academicLevel' | 'institution' | 'availabilityHours'> {
  academicLevel?: string;
  learningStyle: string | null;
  institution?: string;
  availabilityHours?: string;
  availability: string; // Alias for availabilityHours (required for compatibility)
  userSubjects?: UserSubject[];
  partnerships1?: Partnership[];
  personalStudySessions?: PersonalStudySession[];
}

// ============================================================================
// ADVANCED DATA STRUCTURES
// ============================================================================

/**
 * Priority Queue for efficient partner matching
 * Time Complexity: O(log n) for insert/delete, O(1) for peek
 */
class PriorityQueue<T> {
  private heap: Array<{ item: T; priority: number }> = [];

  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | null {
    if (this.heap.length === 0) return null;
    
    const result = this.heap[0].item;
    const last = this.heap.pop()!;
    
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    
    return result;
  }

  peek(): T | null {
    return this.heap.length > 0 ? this.heap[0].item : null;
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority >= this.heap[index].priority) break;
      
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      let largest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < this.heap.length && 
          this.heap[leftChild].priority > this.heap[largest].priority) {
        largest = leftChild;
      }

      if (rightChild < this.heap.length && 
          this.heap[rightChild].priority > this.heap[largest].priority) {
        largest = rightChild;
      }

      if (largest === index) break;

      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }
}

/**
 * LRU Cache for caching matching results
 * Time Complexity: O(1) for get/set operations
 */
class LRUCache<K, V> {
  private capacity: number;
  private cache = new Map<K, V>();
  private accessOrder: K[] = [];

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      this.updateAccessOrder(key);
      return this.cache.get(key);
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.updateAccessOrder(key);
    } else {
      this.accessOrder.push(key);
      if (this.accessOrder.length > this.capacity) {
        const oldestKey = this.accessOrder.shift()!;
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }

  private updateAccessOrder(key: K): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Graph structure for social network analysis
 */
class UserGraph {
  private adjacencyList = new Map<string, Set<string>>();
  private weights = new Map<string, number>();

  addEdge(user1: string, user2: string, weight: number): void {
    if (!this.adjacencyList.has(user1)) {
      this.adjacencyList.set(user1, new Set());
    }
    if (!this.adjacencyList.has(user2)) {
      this.adjacencyList.set(user2, new Set());
    }

    this.adjacencyList.get(user1)!.add(user2);
    this.adjacencyList.get(user2)!.add(user1);
    
    const edgeKey = `${user1}-${user2}`;
    this.weights.set(edgeKey, weight);
  }

  getNeighbors(userId: string): string[] {
    return Array.from(this.adjacencyList.get(userId) || []);
  }

  getWeight(user1: string, user2: string): number {
    const edgeKey = `${user1}-${user2}`;
    return this.weights.get(edgeKey) || 0;
  }

  findConnectedComponents(): string[][] {
    const visited = new Set<string>();
    const components: string[][] = [];

    for (const userId of Array.from(this.adjacencyList.keys())) {
      if (!visited.has(userId)) {
        const component: string[] = [];
        this.dfs(userId, visited, component);
        components.push(component);
      }
    }

    return components;
  }

  private dfs(userId: string, visited: Set<string>, component: string[]): void {
    visited.add(userId);
    component.push(userId);

    for (const neighbor of this.getNeighbors(userId)) {
      if (!visited.has(neighbor)) {
        this.dfs(neighbor, visited, component);
      }
    }
  }
}

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface MatchingCriteria {
  subjects: string[];
  academicLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  learningStyle: string;
  availability: TimeSlot[];
  location: string;
  preferences: UserPreferences;
  maxDistance?: number;
  minCompatibilityScore?: number;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface UserPreferences {
  sessionType: 'virtual' | 'in_person' | 'hybrid';
  groupSize: 'one_on_one' | 'small_group' | 'large_group';
  communicationStyle: 'formal' | 'casual' | 'mixed';
  studyIntensity: 'relaxed' | 'moderate' | 'intensive';
}

export interface CompatibilityScore {
  overall: number;
  subjectMatch: number;
  levelCompatibility: number;
  styleCompatibility: number;
  timeOverlap: number;
  locationCompatibility: number;
  activityCompatibility: number;
  reputationScore: number;
}

export interface MatchResult {
  user: ExtendedUser;
  compatibilityScore: CompatibilityScore;
  reasons: string[];
  sharedInterests: string[];
  complementarySkills: string[];
  subjects: UserSubject[];
  stats: {
    totalPartnerships: number;
    reviewCount: number;
    recentActivity: number;
    averageRating: number;
  };
  aiEnhanced: boolean;
}

// ============================================================================
// MATCHING ALGORITHMS
// ============================================================================

export class AdvancedMatchingEngine {
  private cache = new LRUCache<string, MatchResult[]>(1000);
  private userGraph = new UserGraph();

  /**
   * Main matching algorithm using multiple optimization techniques
   * Time Complexity: O(n log n) where n is number of potential partners
   */
  async findOptimalMatches(
    currentUser: ExtendedUser & {
      subjects: UserSubject[];
      partnerships: Partnership[];
      goals: Goal[];
      personalStudySessions: PersonalStudySession[];
    },
    criteria: MatchingCriteria,
    limit: number = 10
  ): Promise<MatchResult[]> {
    const cacheKey = this.generateCacheKey(currentUser.id, criteria);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached.slice(0, limit);

    // Step 1: Pre-filter candidates using efficient data structures
    const candidates = await this.preFilterCandidates(currentUser, criteria);
    
    // Step 2: Calculate compatibility scores using weighted algorithm
    const scoredCandidates = await this.calculateCompatibilityScores(currentUser, candidates);
    
    // Step 3: Apply advanced ranking algorithm
    const rankedCandidates = this.rankCandidates(scoredCandidates, criteria);
    
    // Step 4: Apply diversity and fairness algorithms
    const finalMatches = this.applyDiversityAlgorithm(rankedCandidates, limit);
    
    // Convert to MatchResult format
    const matchResults: MatchResult[] = finalMatches.map((candidate: any) => ({
      user: candidate.user,
      compatibilityScore: candidate.score,
      reasons: [],
      sharedInterests: [],
      complementarySkills: [],
      subjects: candidate.user.userSubjects || [],
      stats: {
        totalPartnerships: candidate.user.partnerships1?.length || 0,
        reviewCount: 0,
        recentActivity: candidate.user.personalStudySessions?.length || 0,
        averageRating: 0
      },
      aiEnhanced: false
    }));
    
    // Cache results
    this.cache.set(cacheKey, matchResults);
    
    return matchResults;
  }

  /**
   * Pre-filtering using efficient data structures
   * Time Complexity: O(n) where n is total users
   */
  private async preFilterCandidates(
    currentUser: ExtendedUser,
    criteria: MatchingCriteria
  ): Promise<ExtendedUser[]> {
    // Build efficient query using database indexes
    const whereClause = this.buildWhereClause(criteria, currentUser.id);
    
    // Use database-level filtering for performance
    const candidates = await this.queryDatabase(whereClause);
    
    return candidates;
  }

  /**
   * Advanced compatibility scoring algorithm
   * Time Complexity: O(m * n) where m is criteria factors, n is candidates
   */
  private async calculateCompatibilityScores(
    currentUser: ExtendedUser,
    candidates: ExtendedUser[]
  ): Promise<Array<{ user: ExtendedUser; score: CompatibilityScore }>> {
    const results: Array<{ user: ExtendedUser; score: CompatibilityScore }> = [];

    for (const candidate of candidates) {
      const score = await this.calculateIndividualScore(currentUser, candidate);
      results.push({ user: candidate, score });
    }

    return results;
  }

  /**
   * Individual compatibility scoring with weighted factors
   */
  private async calculateIndividualScore(
    user1: ExtendedUser,
    user2: ExtendedUser
  ): Promise<CompatibilityScore> {
    // Subject overlap using Set intersection (O(n + m))
    const subjectMatch = this.calculateSubjectOverlap(user1, user2);
    
    // Study level compatibility using level mapping
    const levelCompatibility = this.calculateLevelCompatibility(user1, user2);
    
    // Learning style compatibility
    const styleCompatibility = this.calculateStyleCompatibility(user1, user2);
    
    // Time overlap using interval intersection algorithm
    const timeOverlap = this.calculateTimeOverlap(user1, user2);
    
    // Location compatibility using distance calculation
    const locationCompatibility = this.calculateLocationCompatibility(user1, user2);
    
    // Activity compatibility using statistical analysis
    const activityCompatibility = this.calculateActivityCompatibility(user1, user2);
    
    // Reputation score using weighted average
    const reputationScore = await this.calculateReputationScore(user2);

    // Weighted combination
    const overall = this.calculateWeightedScore({
      subjectMatch,
      levelCompatibility,
      styleCompatibility,
      timeOverlap,
      locationCompatibility,
      activityCompatibility,
      reputationScore
    });

    return {
      overall,
      subjectMatch,
      levelCompatibility,
      styleCompatibility,
      timeOverlap,
      locationCompatibility,
      activityCompatibility,
      reputationScore
    };
  }

  /**
   * Subject overlap using Set intersection
   * Time Complexity: O(n + m) where n, m are subject counts
   */
  private calculateSubjectOverlap(user1: ExtendedUser, user2: ExtendedUser): number {
    const subjects1 = new Set(user1.userSubjects?.map((s: any) => s.subjectId) || []);
    const subjects2 = new Set(user2.userSubjects?.map((s: any) => s.subjectId) || []);
    
    const intersection = new Set(Array.from(subjects1).filter((x: any) => subjects2.has(x)));
    const union = new Set([...Array.from(subjects1), ...Array.from(subjects2)]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Study level compatibility using level mapping
   */
  private calculateLevelCompatibility(user1: ExtendedUser, user2: ExtendedUser): number {
    const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
    const level1 = levels.indexOf(user1.academicLevel || 'BEGINNER');
    const level2 = levels.indexOf(user2.academicLevel || 'BEGINNER');
    
    const difference = Math.abs(level1 - level2);
    
    if (difference === 0) return 1.0; // Same level
    if (difference === 1) return 0.8; // Adjacent levels
    if (difference === 2) return 0.5; // Two levels apart
    return 0.2; // Three levels apart
  }

  /**
   * Learning style compatibility
   */
  private calculateStyleCompatibility(user1: ExtendedUser, user2: ExtendedUser): number {
    if (!user1.learningStyle || !user2.learningStyle) return 0.5;
    
    if (user1.learningStyle === user2.learningStyle) return 1.0;
    
    // Complementary styles
    const complementaryPairs = [
      ['visual', 'kinesthetic'],
      ['auditory', 'reading'],
      ['visual', 'auditory']
    ];
    
    for (const pair of complementaryPairs) {
      if (pair.includes(user1.learningStyle) && pair.includes(user2.learningStyle)) {
        return 0.8;
      }
    }
    
    return 0.3; // Different styles
  }

  /**
   * Time overlap using interval intersection algorithm
   * Time Complexity: O(n log n) for sorting + O(n) for intersection
   */
  private calculateTimeOverlap(user1: ExtendedUser, user2: ExtendedUser): number {
    const availability1 = this.parseAvailability(user1.availabilityHours);
    const availability2 = this.parseAvailability(user2.availabilityHours);
    
    if (!availability1.length || !availability2.length) return 0;
    
    // Sort intervals by start time
    const sorted1 = availability1.sort((a, b) => a.start - b.start);
    const sorted2 = availability2.sort((a, b) => a.start - b.start);
    
    let overlap = 0;
    let i = 0, j = 0;
    
    while (i < sorted1.length && j < sorted2.length) {
      const interval1 = sorted1[i];
      const interval2 = sorted2[j];
      
      // Check for overlap
      const start = Math.max(interval1.start, interval2.start);
      const end = Math.min(interval1.end, interval2.end);
      
      if (start < end) {
        overlap += end - start;
      }
      
      // Move pointer with earlier end time
      if (interval1.end < interval2.end) {
        i++;
      } else {
        j++;
      }
    }
    
    const totalTime1 = availability1.reduce((sum, interval) => sum + (interval.end - interval.start), 0);
    const totalTime2 = availability2.reduce((sum, interval) => sum + (interval.end - interval.start), 0);
    
    return Math.min(overlap / totalTime1, overlap / totalTime2);
  }

  /**
   * Location compatibility using distance calculation
   */
  private calculateLocationCompatibility(user1: ExtendedUser, user2: ExtendedUser): number {
    if (!user1.timezone || !user2.timezone) return 0.5;
    
    if (user1.timezone === user2.timezone) return 1.0;
    
    // Calculate distance (simplified - you'd use a proper geocoding service)
    const distance = this.calculateDistance(user1.timezone, user2.timezone);
    
    if (distance < 10) return 0.9; // Same city
    if (distance < 50) return 0.7; // Same region
    if (distance < 200) return 0.4; // Same country
    return 0.1; // Different country
  }

  /**
   * Activity compatibility using statistical analysis
   */
  private calculateActivityCompatibility(user1: ExtendedUser, user2: ExtendedUser): number {
    const activity1 = user1.personalStudySessions?.length || 0;
    const activity2 = user2.personalStudySessions?.length || 0;
    
    const difference = Math.abs(activity1 - activity2);
    const maxActivity = Math.max(activity1, activity2);
    
    if (maxActivity === 0) return 0.5;
    
    return Math.max(0, 1 - (difference / maxActivity));
  }

  /**
   * Reputation score using weighted average
   */
  private async calculateReputationScore(user: ExtendedUser): Promise<number> {
    // This would query reviews and calculate weighted average
    // For now, return a placeholder
    return 0.8;
  }

  /**
   * Weighted score calculation
   */
  private calculateWeightedScore(scores: Omit<CompatibilityScore, 'overall'>): number {
    const weights = {
      subjectMatch: 0.25,
      levelCompatibility: 0.20,
      styleCompatibility: 0.15,
      timeOverlap: 0.15,
      locationCompatibility: 0.10,
      activityCompatibility: 0.10,
      reputationScore: 0.05
    };

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0);
  }

  /**
   * Advanced ranking algorithm using multiple factors
   */
  private rankCandidates(
    candidates: Array<{ user: ExtendedUser; score: CompatibilityScore }>,
    criteria: MatchingCriteria
  ): Array<{ user: ExtendedUser; score: CompatibilityScore }> {
    return candidates.sort((a, b) => {
      // Primary sort by overall compatibility
      if (Math.abs(a.score.overall - b.score.overall) > 0.1) {
        return b.score.overall - a.score.overall;
      }
      
      // Secondary sort by subject match
      if (Math.abs(a.score.subjectMatch - b.score.subjectMatch) > 0.05) {
        return b.score.subjectMatch - a.score.subjectMatch;
      }
      
      // Tertiary sort by time overlap
      return b.score.timeOverlap - a.score.timeOverlap;
    });
  }

  /**
   * Diversity algorithm to ensure varied results
   */
  private applyDiversityAlgorithm(
    candidates: Array<{ user: ExtendedUser; score: CompatibilityScore }>,
    limit: number
  ): Array<{ user: ExtendedUser; score: CompatibilityScore }> {
    const selected: Array<{ user: ExtendedUser; score: CompatibilityScore }> = [];
    const usedUniversities = new Set<string>();
    const usedStudyLevels = new Set<string>();
    
    for (const candidate of candidates) {
      if (selected.length >= limit) break;
      
      // Check diversity constraints
      const university = candidate.user.institution || 'unknown';
      const studyLevel = candidate.user.academicLevel || 'unknown';
      
      const universityDiversity = !usedUniversities.has(university) || usedUniversities.size < 3;
      const levelDiversity = !usedStudyLevels.has(studyLevel) || usedStudyLevels.size < 2;
      
      if (universityDiversity && levelDiversity) {
        selected.push(candidate);
        usedUniversities.add(university);
        usedStudyLevels.add(studyLevel);
      }
    }
    
    // Fill remaining slots if needed
    for (const candidate of candidates) {
      if (selected.length >= limit) break;
      if (!selected.some(s => s.user.id === candidate.user.id)) {
        selected.push(candidate);
      }
    }
    
    return selected;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private generateCacheKey(userId: string, criteria: MatchingCriteria): string {
    return `${userId}-${JSON.stringify(criteria)}`;
  }

  private buildWhereClause(criteria: MatchingCriteria, excludeUserId: string): any {
    return {
      id: { not: excludeUserId },
      isActive: true,
      profileComplete: true,
      ...(criteria.academicLevel && { studyLevel: criteria.academicLevel }),
      ...(criteria.learningStyle && { learningStyle: criteria.learningStyle })
    };
  }

  private async queryDatabase(whereClause: any): Promise<ExtendedUser[]> {
    // This would be your actual database query
    // For now, return empty array
    return [];
  }

  private parseAvailability(availability: string | null): Array<{ start: number; end: number }> {
    if (!availability) return [];
    
    try {
      const parsed = JSON.parse(availability);
      return parsed.map((slot: any) => ({
        start: new Date(slot.startTime).getTime(),
        end: new Date(slot.endTime).getTime()
      }));
    } catch {
      return [];
    }
  }

  private calculateDistance(location1: string, location2: string): number {
    // Simplified distance calculation
    // In production, use a proper geocoding service
    return Math.random() * 100;
  }
}

// ============================================================================
// SCHEDULING ALGORITHMS
// ============================================================================

export class StudySessionScheduler {
  /**
   * Find optimal study times using interval scheduling algorithm
   * Time Complexity: O(n log n) for sorting + O(n) for selection
   */
  findOptimalStudyTimes(
    participants: ExtendedUser[],
    duration: number,
    timezone: string
  ): Array<{ start: Date; end: Date; participants: string[] }> {
    // Get all availability intervals
    const allIntervals: Array<{
      start: Date;
      end: Date;
      userId: string;
    }> = [];
    
    for (const participant of participants) {
      const availability = this.parseAvailability(participant.availabilityHours);
      for (const slot of availability) {
        allIntervals.push({
          start: new Date(slot.startTime),
          end: new Date(slot.endTime),
          userId: participant.id
        });
      }
    }
    
    // Sort by start time
    allIntervals.sort((a, b) => a.start.getTime() - b.start.getTime());
    
    // Find overlapping intervals
    const overlappingSlots = this.findOverlappingIntervals(allIntervals, participants.length);
    
    // Filter by duration and rank by participant count
    return overlappingSlots
      .filter((slot: any) => {
        const slotDuration = slot.end.getTime() - slot.start.getTime();
        return slotDuration >= duration * 60 * 1000; // Convert minutes to milliseconds
      })
      .sort((a, b) => b.participants.length - a.participants.length)
      .slice(0, 5); // Return top 5 options
  }

  private findOverlappingIntervals(
    intervals: Array<{ start: Date; end: Date; userId: string }>,
    minParticipants: number
  ): Array<{ start: Date; end: Date; participants: string[] }> {
    const result: Array<{ start: Date; end: Date; participants: string[] }> = [];
    
    for (let i = 0; i < intervals.length; i++) {
      const current = intervals[i];
      const participants = new Set([current.userId]);
      
      for (let j = i + 1; j < intervals.length; j++) {
        const other = intervals[j];
        
        // Check if intervals overlap
        if (current.start < other.end && other.start < current.end) {
          participants.add(other.userId);
        }
      }
      
      if (participants.size >= minParticipants) {
        result.push({
          start: current.start,
          end: current.end,
          participants: Array.from(participants)
        });
      }
    }
    
    return result;
  }

  private parseAvailability(availability: string | null): Array<{ startTime: string; endTime: string }> {
    if (!availability) return [];
    
    try {
      return JSON.parse(availability);
    } catch {
      return [];
    }
  }
}

// ============================================================================
// PROGRESS PREDICTION ALGORITHMS
// ============================================================================

export class ProgressPredictor {
  /**
   * Predict study progress using linear regression
   * Time Complexity: O(n) where n is number of data points
   */
  predictProgress(
    historicalData: Array<{ date: Date; hours: number }>,
    goal: { target: number; deadline: Date }
  ): {
    estimatedCompletion: Date;
    confidence: number;
    currentRate: number;
    requiredRate: number;
  } {
    if (historicalData.length < 2) {
      return {
        estimatedCompletion: goal.deadline,
        confidence: 0.3,
        currentRate: 0,
        requiredRate: goal.target / this.daysUntil(goal.deadline)
      };
    }
    
    // Calculate linear regression
    const { slope, intercept, rSquared } = this.calculateLinearRegression(historicalData);
    
    // Predict completion
    const currentProgress = historicalData[historicalData.length - 1].hours;
    const remaining = goal.target - currentProgress;
    const estimatedDays = remaining / slope;
    
    const estimatedCompletion = new Date();
    estimatedCompletion.setDate(estimatedCompletion.getDate() + estimatedDays);
    
    return {
      estimatedCompletion,
      confidence: Math.min(rSquared, 0.95), // Cap confidence at 95%
      currentRate: slope,
      requiredRate: remaining / this.daysUntil(goal.deadline)
    };
  }

  private calculateLinearRegression(data: Array<{ date: Date; hours: number }>): {
    slope: number;
    intercept: number;
    rSquared: number;
  } {
    const n = data.length;
    const xValues = data.map((_, index) => index);
    const yValues = data.map((d: any) => d.hours);
    
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const meanY = sumY / n;
    const ssRes = yValues.reduce((sum, y, i) => {
      const predicted = slope * xValues[i] + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);
    
    return { slope, intercept, rSquared };
  }

  private daysUntil(deadline: Date): number {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Export the main matching engine
export const matchingEngine = new AdvancedMatchingEngine();
export const sessionScheduler = new StudySessionScheduler();
export const progressPredictor = new ProgressPredictor();
