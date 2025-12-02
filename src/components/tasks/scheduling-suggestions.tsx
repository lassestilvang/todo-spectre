'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
import { DateTime } from 'luxon';
import { ScheduleSuggestion } from '@/lib/scheduling-algorithm';

interface SchedulingSuggestionsProps {
  taskDuration: number;
  onSuggestionSelected: (suggestion: ScheduleSuggestion) => void;
  onClose: () => void;
  preferredTime?: string;
  dueDate?: Date;
}

export function SchedulingSuggestions({
  taskDuration,
  onSuggestionSelected,
  onClose,
  preferredTime,
  dueDate
}: SchedulingSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ScheduleSuggestion | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/scheduling/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_duration: taskDuration,
            preferred_time: preferredTime,
            due_date: dueDate
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get scheduling suggestions');
        }

        const result = await response.json();
        setSuggestions(result.suggestions);

      } catch (err) {
        console.error('Error fetching scheduling suggestions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch scheduling suggestions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [taskDuration, preferredTime, dueDate]);

  const handleSelectSuggestion = (suggestion: ScheduleSuggestion) => {
    setSelectedSuggestion(suggestion);
    onSuggestionSelected(suggestion);
  };

  const formatTimeRange = (start: Date, end: Date): string => {
    const startTime = DateTime.fromJSDate(start);
    const endTime = DateTime.fromJSDate(end);

    return `${startTime.toFormat('hh:mm a')} - ${endTime.toFormat('hh:mm a')}`;
  };

  const getPriorityScore = (suggestion: ScheduleSuggestion): number => {
    // Calculate overall priority score (higher is better)
    return (suggestion.productivity_score * 0.7) + ((1 - suggestion.conflict_score) * 0.3);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Smart Scheduling Suggestions</h2>
      <p className="text-sm text-gray-600">
        Based on your availability and productivity patterns
      </p>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : suggestions.length === 0 ? (
        <p className="text-gray-500">No scheduling suggestions available</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion, index) => {
              const priorityScore = getPriorityScore(suggestion);
              const isSelected = selectedSuggestion?.start_time === suggestion.start_time;

              return (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'border-primary border-2' : ''
                  }`}
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {DateTime.fromJSDate(suggestion.date).toFormat('ccc, MMM d')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Time</span>
                        <span className="font-medium">
                          {formatTimeRange(suggestion.start_time, suggestion.end_time)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Duration</span>
                        <span className="font-medium">
                          {Math.floor(suggestion.duration_minutes / 60)}h {suggestion.duration_minutes % 60}m
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Productivity</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">
                            {(suggestion.productivity_score * 100).toFixed(0)}%
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${suggestion.productivity_score * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Conflict Risk</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">
                            {(suggestion.conflict_score * 100).toFixed(0)}%
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-red-500 rounded-full"
                              style={{ width: `${suggestion.conflict_score * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t mt-2">
                        <p className="text-xs text-gray-600 italic">
                          {suggestion.suggestion_reason}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedSuggestion && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-2">Selected Suggestion:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-medium">
                    {DateTime.fromJSDate(selectedSuggestion.date).toFormat('MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Time</p>
                  <p className="font-medium">
                    {formatTimeRange(selectedSuggestion.start_time, selectedSuggestion.end_time)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-medium">
                    {Math.floor(selectedSuggestion.duration_minutes / 60)} hours
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Overall Score</p>
                  <p className="font-medium">
                    {(getPriorityScore(selectedSuggestion) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}