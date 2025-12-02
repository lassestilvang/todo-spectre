import { format, parseISO, addDays, subDays, startOfDay, endOfDay, isSameDay, isBefore, isAfter } from 'date-fns'

// Date formatting utilities
export function formatDate(date: Date | string, formatStr = 'PPP'): string {
  if (typeof date === 'string') {
    date = parseISO(date)
  }
  return format(date, formatStr)
}

export function formatDateTime(date: Date | string, formatStr = 'PPPp'): string {
  if (typeof date === 'string') {
    date = parseISO(date)
  }
  return format(date, formatStr)
}

// Date range utilities
export function getDateRange(type: 'day' | 'week' | 'month' | 'custom', referenceDate?: Date): { start: Date; end: Date } {
  const today = referenceDate || new Date()

  switch (type) {
    case 'day':
      return {
        start: startOfDay(today),
        end: endOfDay(today),
      }
    case 'week':
      const startOfWeek = subDays(today, today.getDay())
      const endOfWeek = addDays(startOfWeek, 6)
      return {
        start: startOfDay(startOfWeek),
        end: endOfDay(endOfWeek),
      }
    case 'month':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return {
        start: startOfDay(startOfMonth),
        end: endOfDay(endOfMonth),
      }
    case 'custom':
    default:
      return {
        start: startOfDay(today),
        end: endOfDay(addDays(today, 6)),
      }
  }
}

// Date comparison utilities
export function isDateInRange(date: Date | string, range: { start: Date; end: Date }): boolean {
  const targetDate = typeof date === 'string' ? parseISO(date) : date
  return isAfter(targetDate, range.start) && isBefore(targetDate, range.end)
}

export function isToday(date: Date | string): boolean {
  const targetDate = typeof date === 'string' ? parseISO(date) : date
  return isSameDay(targetDate, new Date())
}

// Date picker integration utilities
export function createDatePickerConfig() {
  return {
    fromDate: new Date(),
    toDate: addDays(new Date(), 365), // Allow selection up to 1 year in future
    disabledDates: {
      before: new Date(), // Don't allow past dates by default
    },
    weekStartsOn: 1, // Monday
    locale: 'en-US',
    format: 'PPP',
    timeFormat: 'p',
  }
}

// Task scheduling utilities
export function getTaskScheduleOptions() {
  return [
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this_week', label: 'This Week' },
    { value: 'next_week', label: 'Next Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'custom', label: 'Custom Date' },
  ]
}

// Recurring task utilities
export function getRecurringOptions() {
  return [
    { value: 'none', label: 'Does not repeat' },
    { value: 'daily', label: 'Every day' },
    { value: 'weekly', label: 'Every week' },
    { value: 'monthly', label: 'Every month' },
    { value: 'yearly', label: 'Every year' },
    { value: 'custom', label: 'Custom...' },
  ]
}

// Date validation for forms
export function validateTaskDate(dateString: string | null | undefined): {
  valid: boolean
  error?: string
  parsedDate?: Date
} {
  if (!dateString) {
    return { valid: true } // Optional field
  }

  try {
    const parsedDate = parseISO(dateString)

    if (isBefore(parsedDate, new Date())) {
      return {
        valid: false,
        error: 'Date cannot be in the past',
        parsedDate,
      }
    }

    return {
      valid: true,
      parsedDate,
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid date format',
    }
  }
}

// Time estimation utilities
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  } else {
    const days = Math.floor(minutes / 1440)
    const hours = Math.floor((minutes % 1440) / 60)
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  }
}

// Date range for API queries
export function getDateRangeForApi(type: string): {
  start?: string
  end?: string
} {
  const today = new Date()
  const { start, end } = getDateRange(type as 'day' | 'week' | 'month' | 'custom', today)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}