import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Base schemas
export const baseSchemas = {
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  url: z.string().url().optional(),
  date: z.string().datetime().or(z.date()),
  boolean: z.boolean(),
  integer: z.number().int().positive(),
  float: z.number().positive(),
};

// User-related schemas
export const userSchemas = {
  profile: z.object({
    name: baseSchemas.name,
    bio: z.string().max(200).optional(),
    university: z.string().max(100).optional(),
    major: z.string().max(100).optional(),
    year: z.string().max(20).optional(),
    location: z.string().max(100).optional(),
    timezone: z.string().max(50).optional(),
    studyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
    learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
    focusTime: z.number().int().min(5).max(120).optional(),
    dailyGoalHours: z.number().min(0.5).max(12).optional(),
  }),

  preferences: z.object({
    notifications: z.object({
      email: z.boolean(),
      studyReminders: z.boolean(),
      newMatches: z.boolean(),
    }),
    privacy: z.object({
      showEmail: z.boolean(),
      showLocation: z.boolean(),
    }),
  }),
};

// Study-related schemas
export const studySchemas = {
  session: z.object({
    title: baseSchemas.name,
    description: baseSchemas.description,
    startTime: baseSchemas.date,
    endTime: baseSchemas.date,
    location: z.string().max(200).optional(),
    meetingType: z.enum(['IN_PERSON', 'VIRTUAL', 'HYBRID']),
    sessionType: z.enum(['STUDY', 'REVIEW', 'PRACTICE', 'EXAM_PREP']).default('STUDY'),
    topics: z.string().max(500).optional(),
    notes: z.string().max(1000).optional(),
  }),

  group: z.object({
    name: baseSchemas.name,
    description: baseSchemas.description,
    maxMembers: z.number().int().min(2).max(50).default(10),
    isPrivate: z.boolean().default(false),
    location: z.string().max(200).optional(),
    schedule: z.string().max(500).optional(), // JSON string
    tags: z.string().max(200).optional(), // comma-separated
  }),

  request: z.object({
    receiverId: baseSchemas.id,
    requestType: z.enum(['STUDY_BUDDY', 'STUDY_GROUP_JOIN', 'TUTORING']),
    message: z.string().max(500).optional(),
    subjectId: baseSchemas.id.optional(),
  }),

  goal: z.object({
    title: baseSchemas.name,
    description: baseSchemas.description,
    goalType: z.enum(['STUDY_HOURS', 'STUDY_SESSIONS', 'ASSIGNMENTS', 'EXAMS']),
    target: baseSchemas.float,
    unit: z.string().max(20),
    deadline: baseSchemas.date.optional(),
    isPublic: z.boolean().default(false),
    rewards: z.string().max(200).optional(), // comma-separated
  }),
};

// Chat and messaging schemas
export const chatSchemas = {
  sendMessage: z.object({
    message: z.string().min(1).max(1000),
    context: z.object({
      type: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    }).optional(),
  }),

  createChat: z.object({
    participantIds: z.array(baseSchemas.id).min(2).max(10),
    name: z.string().max(100).optional(),
    isGroup: z.boolean().default(false),
  }),
};

// Reminder and notification schemas
export const reminderSchemas = {
  create: z.object({
    title: baseSchemas.name,
    description: baseSchemas.description,
    dueDate: baseSchemas.date,
    reminderType: z.enum(['STUDY_SESSION', 'ASSIGNMENT_DUE', 'EXAM', 'GENERAL']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  }),

  assignment: z.object({
    title: baseSchemas.name,
    description: baseSchemas.description,
    dueDate: baseSchemas.date,
    subjectId: baseSchemas.id.optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    progress: z.number().int().min(0).max(100).default(0),
    tags: z.string().max(200).optional(), // comma-separated
  }),
};

// Search and filter schemas
export const searchSchemas = {
  partnerSearch: z.object({
    subjects: z.array(z.string()).optional(),
    studyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
    learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
    location: z.string().max(100).optional(),
    university: z.string().max(100).optional(),
    maxDistance: z.number().int().min(1).max(100).optional(),
    availability: z.string().max(200).optional(), // JSON string
  }),

  studySessionSearch: z.object({
    subject: z.string().optional(),
    dateRange: z.object({
      start: baseSchemas.date,
      end: baseSchemas.date,
    }).optional(),
    meetingType: z.enum(['IN_PERSON', 'VIRTUAL', 'HYBRID']).optional(),
    maxParticipants: z.number().int().min(1).max(50).optional(),
  }),
};

// API response schemas
export const apiSchemas = {
  success: z.object({
    success: z.boolean().default(true),
    data: z.any().optional(),
    message: z.string().optional(),
  }),

  error: z.object({
    success: z.boolean().default(false),
    error: z.string(),
    details: z.any().optional(),
  }),

  paginated: z.object({
    data: z.array(z.any()),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  }),
};

// Validation utilities
export class ValidationUtils {
  static validateAndSanitize<T>(
    schema: z.ZodSchema<T>,
    data: any,
    options: { sanitize?: boolean } = {}
  ): T {
    // Sanitize string fields if requested
    if (options.sanitize) {
      data = this.sanitizeData(data);
    }

    // Validate with Zod
    return schema.parse(data);
  }

  static sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return DOMPurify.sanitize(data.trim());
    }

    if (Array.isArray(data)) {
      return data.map((item: any) => this.sanitizeData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized;
    }

    return data;
  }

  static validateEmail(email: string): boolean {
    try {
      baseSchemas.email.parse(email);
      return true;
    } catch {
      return false;
    }
  }

  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateStudySessionTime(startTime: Date, endTime: Date): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (startTime >= endTime) {
      errors.push('Start time must be before end time');
    }

    const duration = endTime.getTime() - startTime.getTime();
    const maxDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

    if (duration > maxDuration) {
      errors.push('Study session cannot exceed 8 hours');
    }

    if (duration < 15 * 60 * 1000) { // 15 minutes
      errors.push('Study session must be at least 15 minutes long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target'],
    });
  }

  static validateFileUpload(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'] } = options;

    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Partner matching schemas
export const partnerSchemas = {
  matchingRequest: z.object({
    preferences: z.object({
      subjects: z.array(z.string()).optional(),
      studyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
      learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
      location: z.string().max(100).optional(),
      university: z.string().max(100).optional(),
      maxDistance: z.number().int().min(1).max(100).optional(),
      availability: z.string().max(200).optional(),
      timeZone: z.string().max(50).optional(),
    }),
    limit: z.number().int().min(1).max(50).default(10),
    includeAIScoring: z.boolean().default(true),
  }),
};

// Export all schemas
export const schemas = {
  base: baseSchemas,
  user: userSchemas,
  study: studySchemas,
  chat: chatSchemas,
  reminder: reminderSchemas,
  search: searchSchemas,
  partner: partnerSchemas,
  api: apiSchemas,
};

// Export individual utility functions for backward compatibility
export const isValidEmail = ValidationUtils.validateEmail;
export const isValidPassword = (password: string) => ValidationUtils.validatePassword(password).isValid;
export const sanitizeInput = ValidationUtils.sanitizeHtml;
export const validateStudyGoals = (goals: any) => {
  try {
    studySchemas.goal.parse(goals);
    return { isValid: true, errors: [] };
  } catch (error: any) {
    return { isValid: false, errors: error.errors || ['Invalid study goals'] };
  }
};
