import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const scheduleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  weekStartDate: z.date({
    required_error: 'Week start date is required',
  }),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(300, 'Description must be less than 300 characters').optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Priority is required',
  }),
  category: z.string().max(50, 'Category must be less than 50 characters').optional(),
  estimatedTime: z.number().min(1, 'Estimated time must be at least 1 minute').max(1440, 'Estimated time cannot exceed 24 hours').optional(),
});

export const dayNotesSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ScheduleFormData = z.infer<typeof scheduleSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type DayNotesFormData = z.infer<typeof dayNotesSchema>;
