'use server';

import { DateTime } from 'luxon';
import { Task } from '@/types/task-types';

/**
 * Natural Language Parser for Task Creation
 * Parses natural language input to extract task details
 */
export class NaturalLanguageParser {
  private static priorityKeywords = {
    high: ['urgent', 'important', 'critical', 'asap', 'priority', 'immediately', 'high'],
    medium: ['soon', 'moderate', 'medium', 'significant'],
    low: ['eventually', 'later', 'whenever', 'low', 'optional', 'task']
  };

  private static dateTimePatterns = [
    // Date patterns
    { regex: /(today|tomorrow|yesterday)/i, type: 'relative' },
    { regex: /(next|this) (week|month|year)/i, type: 'relative' },
    { regex: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, type: 'day' },
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, type: 'date' },
    { regex: /(\d{4})-(\d{1,2})-(\d{1,2})/, type: 'date' },
    { regex: /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?/i, type: 'date' },

    // Time patterns
    { regex: /(\d{1,2}):(\d{2})\s*(am|pm)?/i, type: 'time' },
    { regex: /(\d{1,2})\s*(am|pm)/i, type: 'time' },
    { regex: /(morning|afternoon|evening|night)/i, type: 'time-period' },

    // Combined patterns
    { regex: /(on|by|due)\s+([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?)/i, type: 'due-date' },
    { regex: /(at|around)\s+(\d{1,2}(?::\d{2})?\s*(am|pm)?)/i, type: 'due-time' }
  ];

  /**
   * Parse natural language input to extract task details
   */
  public static parseTaskInput(input: string): Partial<Task> {
    const result: Partial<Task> = {
      title: '',
      description: '',
      priority: 0,
      status: 'pending'
    };

    // Extract title and description more intelligently
    const lines = input.split('\n');
    const firstLine = lines[0].trim();

    // Check if first line contains a clear separator (dash, colon, etc.)
    const separatorMatch = firstLine.match(/^(.*?)(?:\s*[-:–—]\s*(.*))?$/);

    if (separatorMatch && separatorMatch[1].trim()) {
      result.title = separatorMatch[1].trim();

      // If there's content after separator on first line, or additional lines, use as description
      if (separatorMatch[2] || lines.length > 1) {
        const descriptionParts = [];
        if (separatorMatch[2]) descriptionParts.push(separatorMatch[2].trim());
        if (lines.length > 1) {
          descriptionParts.push(lines.slice(1).join('\n').trim());
        }
        result.description = descriptionParts.join(' ').trim();
      }
    } else {
      // If no clear separator, look for first sentence ending with punctuation
      const titleMatch = input.match(/^[^.!?]+[.!?]/);
      if (titleMatch) {
        result.title = titleMatch[0].trim().replace(/[.!?]$/, '');
        // Extract description from remaining content
        const remaining = input.substring(titleMatch[0].length).trim();
        if (remaining) {
          result.description = remaining;
        }
      } else {
        // If no punctuation, take first line as title, rest as description
        result.title = firstLine || input.trim();
        if (lines.length > 1) {
          result.description = lines.slice(1).join('\n').trim();
        }
      }
    }

    // Extract priority
    const priority = this.extractPriority(input);
    result.priority = priority;

    // Extract due date
    const dueDate = this.extractDueDate(input);
    if (dueDate) {
      result.due_date = dueDate;
    }

    return result;
  }

  /**
   * Extract priority from text
   */
  private static extractPriority(text: string): number | null {
    const lowerText = text.toLowerCase();

    // Check for high priority keywords
    for (const keyword of this.priorityKeywords.high) {
      if (lowerText.includes(keyword)) {
        return 3; // High priority
      }
    }

    // Check for medium priority keywords
    for (const keyword of this.priorityKeywords.medium) {
      if (lowerText.includes(keyword)) {
        return 2; // Medium priority
      }
    }

    // Check for low priority keywords
    for (const keyword of this.priorityKeywords.low) {
      if (lowerText.includes(keyword)) {
        return 1; // Low priority
      }
    }

    return 0; // Default to medium priority if no keywords found
  }

  /**
   * Extract due date from text
   */
  private static extractDueDate(text: string): Date | null {
    const lowerText = text.toLowerCase();
    const now = DateTime.now();

    // Check for relative dates
    if (lowerText.includes('today')) {
      return now.toJSDate();
    }

    if (lowerText.includes('tomorrow')) {
      return now.plus({ days: 1 }).toJSDate();
    }

    if (lowerText.includes('yesterday')) {
      return now.minus({ days: 1 }).toJSDate();
    }

    // Check for specific day names
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (let i = 0; i < dayNames.length; i++) {
      if (lowerText.includes(dayNames[i])) {
        const targetDay = i + 1; // 1 = Monday, 7 = Sunday
        const currentDay = now.weekday;
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Next week if same or past day
        return now.plus({ days: daysToAdd }).toJSDate();
      }
    }

    // Check for date patterns (MM/DD/YYYY or YYYY-MM-DD)
    const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (dateMatch) {
      const month = parseInt(dateMatch[1]);
      const day = parseInt(dateMatch[2]);
      let year = parseInt(dateMatch[3]);
      if (year < 100) year = 2000 + year; // Handle 2-digit years
      return new Date(year, month - 1, day);
    }

    const isoDateMatch = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoDateMatch) {
      const year = parseInt(isoDateMatch[1]);
      const month = parseInt(isoDateMatch[2]);
      const day = parseInt(isoDateMatch[3]);
      return new Date(year, month - 1, day);
    }

    // Check for month names
    const monthMatch = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?/i);
    if (monthMatch) {
      const monthName = monthMatch[1].toLowerCase();
      const day = parseInt(monthMatch[2]);
      const monthIndex = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].indexOf(monthName);
      const year = now.year;
      return new Date(year, monthIndex, day);
    }

    return null;
  }

  /**
   * Extract time from text
   */
  public static extractTime(text: string): string | null {
    const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3]?.toLowerCase();

      // Convert to 24-hour format if needed
      if (period === 'pm' && hours < 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Check for simple time (just hours with am/pm)
    const simpleTimeMatch = text.match(/(\d{1,2})\s*(am|pm)/i);
    if (simpleTimeMatch) {
      let hours = parseInt(simpleTimeMatch[1]);
      const period = simpleTimeMatch[2].toLowerCase();

      if (period === 'pm' && hours < 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, '0')}:00`;
    }

    return null;
  }

  /**
   * Parse natural language to create a task object
   */
  public static parseNaturalLanguageToTask(input: string): Partial<Task> {
    const taskData = this.parseTaskInput(input);

    // Additional processing for reminders, estimates, etc.
    const timeEstimate = this.extractTimeEstimate(input);
    if (timeEstimate) {
      taskData.estimate = timeEstimate;
    }

    const reminders = this.extractReminders(input);
    if (reminders.length > 0) {
      taskData.reminders = reminders;
    }

    return taskData;
  }

  /**
   * Extract time estimate from text
   */
  private static extractTimeEstimate(text: string): number | null {
    const timeMatch = text.match(/(\d+)\s*(hours?|hrs?|minutes?|mins?)/i);
    if (timeMatch) {
      const amount = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();

      if (unit.includes('hour') || unit.includes('hr')) {
        return amount * 60; // Convert hours to minutes
      } else if (unit.includes('minute') || unit.includes('min')) {
        return amount;
      }
    }

    return null;
  }

  /**
   * Extract reminders from text
   */
  private static extractReminders(text: string): string[] {
    const reminders: string[] = [];
    const reminderMatch = text.match(/remind(?:er)?\s+(?:me|at)\s+([\w\s:]+)/i);
    if (reminderMatch) {
      const time = this.extractTime(reminderMatch[1]);
      if (time) {
        reminders.push(time);
      }
    }
    return reminders;
  }
}