import { z } from 'zod';

/**
 * Common validation schemas
 */
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      (file) => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type),
      'File must be PDF, DOCX, or TXT'
    ),
});

export const syllabusItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  type: z.enum(['ASSIGNMENT', 'EXAM', 'QUIZ', 'PROJECT', 'READING', 'EVENT', 'DEADLINE']),
  dueDate: z.string().datetime().optional(),
  weight: z.number().min(0).max(100).optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  confidence: z.number().min(0).max(1).default(1),
  sourceLine: z.string().optional(),
});

export const syllabusSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  courseName: z.string().min(1, 'Course name is required').max(100, 'Course name must be less than 100 characters'),
  semester: z.string().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  instructor: z.string().max(100, 'Instructor name must be less than 100 characters').optional(),
  items: z.array(syllabusItemSchema).default([]),
});

export const exportOptionsSchema = z.object({
  includeDescriptions: z.boolean().default(true),
  timezone: z.string().default('UTC'),
  reminderMinutes: z.number().min(0).max(10080).default(60), // Max 1 week
});

/**
 * Type definitions derived from schemas
 */
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type SyllabusItem = z.infer<typeof syllabusItemSchema>;
export type Syllabus = z.infer<typeof syllabusSchema>;
export type ExportOptions = z.infer<typeof exportOptionsSchema>;

/**
 * Validation helper functions
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
}
