import { isValidEmail, isValidPassword, sanitizeInput, validateStudyGoals } from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('user_name@example-domain.com')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test..test@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('validates strong passwords', () => {
      expect(isValidPassword('Password123!')).toBe(true);
      expect(isValidPassword('MySecure2024$')).toBe(true);
      expect(isValidPassword('Complex#Pass9')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(isValidPassword('password')).toBe(false); // No uppercase, number, special char
      expect(isValidPassword('PASSWORD')).toBe(false); // No lowercase, number, special char
      expect(isValidPassword('Password')).toBe(false); // No number, special char
      expect(isValidPassword('Pass1')).toBe(false); // Too short
      expect(isValidPassword('')).toBe(false); // Empty
    });
  });

  describe('sanitizeInput', () => {
    it('removes dangerous HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('Hello');
      expect(sanitizeInput('<img onerror="alert(1)" src="x">')).toBe('');
      expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello World');
    });

    it('preserves safe content', () => {
      expect(sanitizeInput('Hello World!')).toBe('Hello World!');
      expect(sanitizeInput('Study session at 3pm')).toBe('Study session at 3pm');
      expect(sanitizeInput('Math & Science')).toBe('Math & Science');
    });

    it('handles empty and null inputs', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('validateStudyGoals', () => {
    it('validates proper study goals', () => {
      const validGoals = [
        { subject: 'Math', hoursPerWeek: 10, priority: 'high' },
        { subject: 'Science', hoursPerWeek: 5, priority: 'medium' }
      ];
      expect(validateStudyGoals(validGoals)).toBe(true);
    });

    it('rejects invalid study goals', () => {
      const invalidGoals = [
        { subject: '', hoursPerWeek: 10, priority: 'high' }, // Empty subject
        { subject: 'Math', hoursPerWeek: 0, priority: 'high' }, // Zero hours
        { subject: 'Math', hoursPerWeek: -5, priority: 'high' }, // Negative hours
      ];
      expect(validateStudyGoals(invalidGoals)).toBe(false);
    });

    it('handles empty arrays', () => {
      expect(validateStudyGoals([])).toBe(true); // Empty is valid
    });
  });
});

// Note: Functions are now imported from @/lib/validation