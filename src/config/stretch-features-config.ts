/**
 * Stretch Features Configuration
 * Central configuration for natural language and smart scheduling features
 */
export class StretchFeaturesConfig {
  // Feature flags
  public static ENABLE_NATURAL_LANGUAGE = true;
  public static ENABLE_SMART_SCHEDULING = true;
  public static ENABLE_USER_PREFERENCE_LEARNING = true;

  // Natural Language Configuration
  public static NATURAL_LANGUAGE = {
    enabled: true,
    default_priority: 2, // Medium priority as default
    date_formats: ['MM/DD/YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY'],
    time_formats: ['HH:mm', 'h:mm a'],
    priority_keywords: {
      high: ['urgent', 'important', 'critical', 'asap', 'priority'],
      medium: ['soon', 'moderate', 'medium'],
      low: ['eventually', 'later', 'whenever', 'low']
    }
  };

  // Smart Scheduling Configuration
  public static SMART_SCHEDULING = {
    enabled: true,
    default_working_hours: {
      start: 9,
      end: 17
    },
    preferred_time_slots: ['morning', 'afternoon', 'evening'],
    min_suggestion_count: 3,
    max_suggestion_count: 5,
    productivity_weights: {
      morning: 0.9,
      afternoon: 0.7,
      evening: 0.5
    }
  };

  // User Preference Learning Configuration
  public static USER_PREFERENCE_LEARNING = {
    enabled: true,
    learning_period_days: 30,
    min_samples_required: 10,
    preference_decay_rate: 0.95,
    learning_factors: {
      time_preference: 0.3,
      duration_estimation: 0.2,
      priority_selection: 0.25,
      scheduling_acceptance: 0.25
    }
  };

  /**
   * Get current configuration
   */
  public static getConfig() {
    return {
      natural_language: this.NATURAL_LANGUAGE,
      smart_scheduling: this.SMART_SCHEDULING,
      user_preference_learning: this.USER_PREFERENCE_LEARNING,
      feature_flags: {
        natural_language: this.ENABLE_NATURAL_LANGUAGE,
        smart_scheduling: this.ENABLE_SMART_SCHEDULING,
        user_preference_learning: this.ENABLE_USER_PREFERENCE_LEARNING
      }
    };
  }

  /**
   * Update configuration (would persist to database in real implementation)
   */
  public static updateConfig(newConfig: Partial<ReturnType<typeof this.getConfig>>) {
    console.log('Updating stretch features configuration:', newConfig);
    // In a real implementation, this would update the database
    return { success: true, message: 'Configuration updated successfully' };
  }
}