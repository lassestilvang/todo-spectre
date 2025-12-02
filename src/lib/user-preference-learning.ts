'use server';

import { DateTime } from 'luxon';

/**
 * User Preference Learning System
 * Learns from user behavior to improve scheduling suggestions
 */
export class UserPreferenceLearning {
  private static userPreferences: Map<number, UserPreferences> = new Map();

  /**
   * Record user action for learning
   */
  public static async recordUserAction(
    userId: number,
    actionType: 'task_created' | 'scheduling_accepted' | 'priority_set' | 'time_estimated',
    actionData: any
  ): Promise<void> {
    // Initialize preferences if not exists
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, this.getDefaultPreferences());
    }

    const preferences = this.userPreferences.get(userId)!;

    // Update preferences based on action type
    switch (actionType) {
      case 'task_created':
        this.updateFromTaskCreation(preferences, actionData);
        break;
      case 'scheduling_accepted':
        this.updateFromSchedulingAcceptance(preferences, actionData);
        break;
      case 'priority_set':
        this.updateFromPrioritySetting(preferences, actionData);
        break;
      case 'time_estimated':
        this.updateFromTimeEstimation(preferences, actionData);
        break;
    }

    // Apply decay to old preferences
    this.applyPreferenceDecay(preferences);

    // Save updated preferences
    this.userPreferences.set(userId, preferences);
  }

  /**
   * Get user preferences
   */
  public static async getUserPreferences(userId: number): Promise<UserPreferences> {
    // Initialize if not exists
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, this.getDefaultPreferences());
    }

    return this.userPreferences.get(userId)!;
  }

  /**
   * Update preferences from task creation
   */
  private static updateFromTaskCreation(preferences: UserPreferences, taskData: any) {
    // Learn from task creation patterns
    if (taskData.time_of_day) {
      preferences.time_preferences[taskData.time_of_day] =
        (preferences.time_preferences[taskData.time_of_day] || 0) + 0.1;
    }

    if (taskData.duration) {
      const durationCategory = this.getDurationCategory(taskData.duration);
      preferences.duration_estimates[durationCategory] =
        (preferences.duration_estimates[durationCategory] || 0) + 0.05;
    }
  }

  /**
   * Update preferences from scheduling acceptance
   */
  private static updateFromSchedulingAcceptance(preferences: UserPreferences, schedulingData: any) {
    if (schedulingData.time_slot) {
      const hour = DateTime.fromISO(schedulingData.time_slot).hour;
      const timeCategory = this.getTimeCategory(hour);

      // Increase preference for this time category
      preferences.time_preferences[timeCategory] =
        (preferences.time_preferences[timeCategory] || 0) + 0.2;

      // Normalize to keep sum around 1
      this.normalizePreferences(preferences.time_preferences);
    }
  }

  /**
   * Update preferences from priority setting
   */
  private static updateFromPrioritySetting(preferences: UserPreferences, priorityData: any) {
    if (priorityData.priority_level !== undefined) {
      const priorityIndex = Math.min(3, Math.max(0, priorityData.priority_level));
      preferences.priority_distribution[priorityIndex] =
        (preferences.priority_distribution[priorityIndex] || 0) + 0.1;

      // Normalize priority distribution
      const total = preferences.priority_distribution.reduce((sum, val) => sum + val, 0);
      if (total > 0) {
        preferences.priority_distribution = preferences.priority_distribution.map(
          val => val / total
        );
      }
    }
  }

  /**
   * Update preferences from time estimation
   */
  private static updateFromTimeEstimation(preferences: UserPreferences, timeData: any) {
    if (timeData.estimated_minutes) {
      const durationCategory = this.getDurationCategory(timeData.estimated_minutes);
      preferences.duration_estimates[durationCategory] =
        (preferences.duration_estimates[durationCategory] || 0) + 0.1;

      // Normalize duration estimates
      this.normalizePreferences(preferences.duration_estimates);
    }
  }

  /**
   * Apply decay to old preferences
   */
  private static applyPreferenceDecay(preferences: UserPreferences) {
    // Apply decay to all preference values
    Object.keys(preferences.time_preferences).forEach(key => {
      preferences.time_preferences[key] *= 0.98; // 2% decay
    });

    Object.keys(preferences.duration_estimates).forEach(key => {
      preferences.duration_estimates[key] *= 0.97; // 3% decay
    });

    // Apply decay to priority distribution
    preferences.priority_distribution = preferences.priority_distribution.map(
      val => val * 0.99 // 1% decay
    );
  }

  /**
   * Get default preferences
   */
  private static getDefaultPreferences(): UserPreferences {
    return {
      time_preferences: {
        morning: 0.4,
        afternoon: 0.35,
        evening: 0.25
      },
      duration_estimates: {
        short: 0.4,    // < 30 minutes
        medium: 0.4,   // 30-120 minutes
        long: 0.2      // > 120 minutes
      },
      priority_distribution: [0.3, 0.4, 0.2, 0.1], // None, Low, Medium, High
      last_updated: new Date(),
      learning_samples: 0
    };
  }

  /**
   * Get duration category
   */
  private static getDurationCategory(minutes: number): 'short' | 'medium' | 'long' {
    if (minutes < 30) return 'short';
    if (minutes <= 120) return 'medium';
    return 'long';
  }

  /**
   * Get time category from hour
   */
  private static getTimeCategory(hour: number): 'morning' | 'afternoon' | 'evening' {
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  /**
   * Normalize preference values to sum to 1
   */
  private static normalizePreferences(prefs: Record<string, number>) {
    const values = Object.values(prefs);
    const sum = values.reduce((total, val) => total + val, 0);

    if (sum > 0) {
      Object.keys(prefs).forEach(key => {
        prefs[key] = prefs[key] / sum;
      });
    }
  }
}

// Type definitions for user preferences
export interface UserPreferences {
  time_preferences: {
    morning: number;    // 0-1 preference score
    afternoon: number;  // 0-1 preference score
    evening: number;    // 0-1 preference score
  };
  duration_estimates: {
    short: number;     // 0-1 preference score
    medium: number;    // 0-1 preference score
    long: number;      // 0-1 preference score
  };
  priority_distribution: number[]; // [none, low, medium, high] probabilities
  last_updated: Date;
  learning_samples: number;
}