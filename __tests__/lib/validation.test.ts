import { ValidationUtils, schemas } from '@/lib/validation';

describe('ValidationUtils', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@numbers.com',
      ];

      validEmails.forEach(email => {
        expect(ValidationUtils.validateEmail(email)).toBe(true);
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        '',
        '   ',
      ];

      invalidEmails.forEach(email => {
        expect(ValidationUtils.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const strongPassword = 'StrongPass123!';
      const result = ValidationUtils.validatePassword(strongPassword);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects weak passwords', () => {
      const weakPasswords = [
        'short', // too short
        'nouppercase123!', // no uppercase
        'NOLOWERCASE123!', // no lowercase
        'NoNumbers!', // no numbers
        'NoSpecialChar123', // no special characters
      ];

      weakPasswords.forEach(password => {
        const result = ValidationUtils.validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('provides specific error messages', () => {
      const password = 'WEAK1234'; // uppercase only, no lowercase, no special chars
      const result = ValidationUtils.validatePassword(password);
      
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
      expect(result.errors).toContain('Password must contain at least one special character');
      expect(result.errors).not.toContain('Password must be at least 8 characters long');
      expect(result.errors).not.toContain('Password must contain at least one uppercase letter');
      expect(result.errors).not.toContain('Password must contain at least one number');
    });
  });

  describe('validateStudySessionTime', () => {
    it('validates correct session times', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T11:00:00Z');
      
      const result = ValidationUtils.validateStudySessionTime(startTime, endTime);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid session times', () => {
      const startTime = new Date('2024-01-01T11:00:00Z');
      const endTime = new Date('2024-01-01T10:00:00Z'); // end before start
      
      const result = ValidationUtils.validateStudySessionTime(startTime, endTime);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Start time must be before end time');
    });

    it('rejects sessions that are too long', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T19:00:00Z'); // 9 hours
      
      const result = ValidationUtils.validateStudySessionTime(startTime, endTime);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Study session cannot exceed 8 hours');
    });

    it('rejects sessions that are too short', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:05:00Z'); // 5 minutes
      
      const result = ValidationUtils.validateStudySessionTime(startTime, endTime);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Study session must be at least 15 minutes long');
    });
  });

  describe('sanitizeHtml', () => {
    it('allows safe HTML tags', () => {
      const input = '<b>Bold</b> <i>Italic</i> <a href="https://example.com">Link</a>';
      const result = ValidationUtils.sanitizeHtml(input);
      
      expect(result).toContain('<b>Bold</b>');
      expect(result).toContain('<i>Italic</i>');
      expect(result).toContain('<a href="https://example.com">Link</a>');
    });

    it('removes dangerous HTML tags', () => {
      const input = '<script>alert("xss")</script><b>Safe</b>';
      const result = ValidationUtils.sanitizeHtml(input);
      
      expect(result).not.toContain('<script>');
      expect(result).toContain('<b>Safe</b>');
    });

    it('removes dangerous attributes', () => {
      const input = '<a href="javascript:alert(\'xss\')" onclick="alert(\'xss\')">Link</a>';
      const result = ValidationUtils.sanitizeHtml(input);
      
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('onclick');
    });
  });

  describe('validateFileUpload', () => {
    it('validates correct file uploads', () => {
      const mockFile = {
        size: 1024 * 1024, // 1MB
        type: 'image/jpeg',
      } as File;
      
      const result = ValidationUtils.validateFileUpload(mockFile);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects files that are too large', () => {
      const mockFile = {
        size: 10 * 1024 * 1024, // 10MB
        type: 'image/jpeg',
      } as File;
      
      const result = ValidationUtils.validateFileUpload(mockFile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size must be less than 5MB');
    });

    it('rejects unsupported file types', () => {
      const mockFile = {
        size: 1024 * 1024, // 1MB
        type: 'application/exe',
      } as File;
      
      const result = ValidationUtils.validateFileUpload(mockFile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File type must be one of: image/jpeg, image/png, image/gif');
    });

    it('accepts custom file size and type limits', () => {
      const mockFile = {
        size: 2 * 1024 * 1024, // 2MB
        type: 'image/png',
      } as File;
      
      const result = ValidationUtils.validateFileUpload(mockFile, {
        maxSize: 3 * 1024 * 1024, // 3MB
        allowedTypes: ['image/png'],
      });
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeData', () => {
    it('sanitizes string data', () => {
      const input = '  <script>alert("xss")</script>  ';
      const result = ValidationUtils.sanitizeData(input);
      
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('  '); // trimmed
    });

    it('sanitizes array data', () => {
      const input = ['  test  ', '<script>alert("xss")</script>'];
      const result = ValidationUtils.sanitizeData(input);
      
      expect(result[0]).toBe('test'); // trimmed
      expect(result[1]).not.toContain('<script>');
    });

    it('sanitizes object data', () => {
      const input = {
        name: '  John  ',
        bio: '<script>alert("xss")</script>',
        age: 25,
      };
      const result = ValidationUtils.sanitizeData(input);
      
      expect(result.name).toBe('John'); // trimmed
      expect(result.bio).not.toContain('<script>');
      expect(result.age).toBe(25); // unchanged
    });

    it('handles nested objects', () => {
      const input = {
        user: {
          name: '  Jane  ',
          preferences: {
            theme: '  dark  ',
          },
        },
      };
      const result = ValidationUtils.sanitizeData(input);
      
      expect(result.user.name).toBe('Jane');
      expect(result.user.preferences.theme).toBe('dark');
    });
  });
});

describe('Validation Schemas', () => {
  describe('userSchemas.profile', () => {
    it('validates correct user profile data', () => {
      const validProfile = {
        name: 'John Doe',
        bio: 'A student',
        university: 'MIT',
        major: 'Computer Science',
        year: 'Junior',
        location: 'Boston, MA',
        timezone: 'America/New_York',
        studyLevel: 'INTERMEDIATE',
        learningStyle: 'visual',
        focusTime: 25,
        dailyGoalHours: 2.5,
      };

      expect(() => schemas.user.profile.parse(validProfile)).not.toThrow();
    });

    it('rejects invalid user profile data', () => {
      const invalidProfile = {
        name: '', // empty name
        studyLevel: 'INVALID_LEVEL', // invalid enum
        focusTime: -5, // negative number
        dailyGoalHours: 25, // too high
      };

      expect(() => schemas.user.profile.parse(invalidProfile)).toThrow();
    });
  });

  describe('studySchemas.session', () => {
    it('validates correct study session data', () => {
      const validSession = {
        title: 'Math Study Session',
        description: 'Review calculus concepts',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        location: 'Library Room 101',
        meetingType: 'IN_PERSON',
        sessionType: 'STUDY',
        topics: 'Calculus, Derivatives, Integrals',
        notes: 'Bring calculator and notes',
      };

      expect(() => schemas.study.session.parse(validSession)).not.toThrow();
    });

    it('rejects invalid study session data', () => {
      const invalidSession = {
        title: '', // empty title
        meetingType: 'INVALID_TYPE', // invalid enum
        startTime: 'invalid-date', // invalid date
      };

      expect(() => schemas.study.session.parse(invalidSession)).toThrow();
    });
  });
});
