import { formatDate, createDueDate, isPastDue, getRelativeTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { validateEmail, validateUrl, sanitizeFilename } from '@/lib/utils/validation';

describe('Date utilities', () => {
  describe('formatDate', () => {
    it('should format valid dates correctly', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      expect(formatDate(date)).toBe('Mar 15, 2024');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-03-15');
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid date');
      expect(formatDate(new Date('invalid'))).toBe('Invalid date');
    });
  });

  describe('createDueDate', () => {
    it('should set time to 23:59 for dates without time', () => {
      const date = createDueDate('2024-03-15');
      expect(date.getHours()).toBe(23);
      expect(date.getMinutes()).toBe(59);
    });

    it('should preserve existing time', () => {
      const date = createDueDate('2024-03-15T14:30:00Z');
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
    });
  });

  describe('isPastDue', () => {
    it('should correctly identify past dates', () => {
      const pastDate = new Date(Date.now() - 86400000); // 1 day ago
      const futureDate = new Date(Date.now() + 86400000); // 1 day from now
      
      expect(isPastDue(pastDate)).toBe(true);
      expect(isPastDue(futureDate)).toBe(false);
    });
  });

  describe('getRelativeTime', () => {
    it('should return correct relative time strings', () => {
      const now = new Date();
      const inOneDay = new Date(now.getTime() + 86400000);
      const oneDayAgo = new Date(now.getTime() - 86400000);
      
      expect(getRelativeTime(inOneDay)).toBe('in 1 day');
      expect(getRelativeTime(oneDayAgo)).toBe('1 day ago');
    });
  });
});

describe('Class name utilities', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
      expect(cn('px-4', 'px-6')).toBe('px-6'); // Tailwind merge should work
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional');
      expect(cn('base', false && 'conditional')).toBe('base');
    });
  });
});

describe('Validation utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('ftp://invalid')).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filenames correctly', () => {
      expect(sanitizeFilename('My File Name.pdf')).toBe('my_file_name.pdf');
      expect(sanitizeFilename('Special@#$%Characters')).toBe('special____characters');
    });
  });
});
