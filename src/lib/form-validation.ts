import { z } from 'zod'

// Form validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const listSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  due_date: z.string().datetime('Invalid date format').optional(),
  priority: z.number().min(0).max(3).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  estimate: z.number().min(1).max(1440).optional(), // 1-1440 minutes (24 hours)
})

export const viewSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  type: z.enum(['day', 'week', 'month', 'custom']),
  filter_criteria: z.record(z.any()).optional(),
  sort_order: z.record(z.any()).optional(),
})

// Form validation utility
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: z.ZodError
} {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, error: result.error }
  }
}

// Format validation errors for display
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}

  error.errors.forEach((err) => {
    const path = err.path.join('.')
    errors[path] = err.message
  })

  return errors
}

// Date validation utilities
export function isValidDateString(dateString: string): boolean {
  return !isNaN(Date.parse(dateString))
}

export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  return date > now
}

export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  return date < now
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  valid: boolean
  score: number
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password should be at least 8 characters')
  }

  // Character variety checks
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add uppercase letters')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add lowercase letters')
  }

  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Add numbers')
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add special characters')
  }

  return {
    valid: score >= 4,
    score,
    feedback: score >= 4 ? [] : feedback,
  }
}