'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NaturalLanguageTaskForm } from './natural-language-task-form';
import { CreateTaskForm } from './create-task-form';
import { SchedulingSuggestions } from './scheduling-suggestions';
import { Task } from '@/types/task-types';
import { ScheduleSuggestion } from '@/lib/scheduling-algorithm';
import { UserPreferenceLearning } from '@/lib/user-preference-learning';
import { StretchFeaturesConfig } from '@/config/stretch-features-config';

interface IntegratedTaskCreationProps {
  onTaskCreated: (task: Task) => void;
  onClose: () => void;
  listId?: number;
}

export function IntegratedTaskCreation({ onTaskCreated, onClose, listId }: IntegratedTaskCreationProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'natural' | 'scheduling'>('form');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [parsedTaskData, setParsedTaskData] = useState<Partial<Task> | null>(null);
  const [schedulingSuggestions, setSchedulingSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ScheduleSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const preferences = await UserPreferenceLearning.getUserPreferences(1); // User ID 1 for demo
        console.log('Loaded user preferences:', preferences);
      } catch (err) {
        console.error('Error loading preferences:', err);
      }
    };

    loadPreferences();
  }, []);

  const handleNaturalLanguageSubmit = async (input: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Parse natural language input
      const response = await fetch('/api/tasks/natural-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          natural_language_input: input,
          list_id: listId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse natural language');
      }

      const result = await response.json();
      setParsedTaskData(result.parsed_data);
      setNaturalLanguageInput(input);

      // Record user action for learning
      await UserPreferenceLearning.recordUserAction(1, 'task_created', {
        time_of_day: getTimeOfDayCategory(),
        duration: result.parsed_data.estimate || 30
      });

      // If we have an estimate, get scheduling suggestions
      if (result.parsed_data.estimate) {
        const schedulingResponse = await fetch('/api/scheduling/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_duration: result.parsed_data.estimate,
            due_date: result.parsed_data.due_date
          }),
        });

        if (schedulingResponse.ok) {
          const schedulingResult = await schedulingResponse.json();
          setSchedulingSuggestions(schedulingResult.suggestions);
        }
      }

      // Switch to scheduling tab if we have suggestions
      if (StretchFeaturesConfig.ENABLE_SMART_SCHEDULING && result.parsed_data.estimate) {
        setActiveTab('scheduling');
      } else {
        // Create task directly if no scheduling needed
        onTaskCreated(result.task);
        onClose();
      }

    } catch (err) {
      console.error('Error in natural language processing:', err);
      setError(err instanceof Error ? err.message : 'Failed to process natural language input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelected = (suggestion: ScheduleSuggestion) => {
    setSelectedSuggestion(suggestion);

    // Record scheduling acceptance for learning
    UserPreferenceLearning.recordUserAction(1, 'scheduling_accepted', {
      time_slot: suggestion.start_time.toISOString()
    });
  };

  const handleCreateTaskWithSuggestion = async () => {
    if (!parsedTaskData || !selectedSuggestion) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create task with scheduling information
      const taskData = {
        ...parsedTaskData,
        due_date: selectedSuggestion.start_time,
        // Add scheduling info to description
        description: parsedTaskData.description
          ? `${parsedTaskData.description}\n\n[Scheduled: ${selectedSuggestion.start_time.toLocaleString()}]`
          : `[Scheduled: ${selectedSuggestion.start_time.toLocaleString()}]`
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          list_id: listId,
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date,
          priority: taskData.priority || 0,
          estimate: taskData.estimate,
          status: taskData.status || 'pending'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const newTask = await response.json();
      onTaskCreated(newTask);
      onClose();
      router.refresh();

    } catch (err) {
      console.error('Error creating task with scheduling:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task with scheduling');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeOfDayCategory = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Create New Task</h1>
      <p className="text-sm text-gray-600">
        Choose how you want to create your task
      </p>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Standard Form</TabsTrigger>
          <TabsTrigger value="natural">Natural Language</TabsTrigger>
          <TabsTrigger value="scheduling" disabled={!StretchFeaturesConfig.ENABLE_SMART_SCHEDULING}>
            Smart Scheduling
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {activeTab === 'form' && (
          <CreateTaskForm
            isOpen={true}
            onClose={onClose}
            onTaskCreated={onTaskCreated}
            listId={listId}
          />
        )}

        {activeTab === 'natural' && (
          <NaturalLanguageTaskForm
            isOpen={true}
            onClose={onClose}
            onTaskCreated={(task) => {
              onTaskCreated(task);
              // Record the natural language usage
              UserPreferenceLearning.recordUserAction(1, 'task_created', {
                method: 'natural_language',
                time_of_day: getTimeOfDayCategory()
              });
            }}
            listId={listId}
          />
        )}

        {activeTab === 'scheduling' && parsedTaskData && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Task Details from Natural Language:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Title</p>
                  <p className="font-medium">{parsedTaskData.title}</p>
                </div>
                {parsedTaskData.description && (
                  <div>
                    <p className="text-gray-600">Description</p>
                    <p className="font-medium">{parsedTaskData.description.substring(0, 50)}{parsedTaskData.description.length > 50 ? '...' : ''}</p>
                  </div>
                )}
                {parsedTaskData.due_date && (
                  <div>
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-medium">{new Date(parsedTaskData.due_date).toLocaleDateString()}</p>
                  </div>
                )}
                {parsedTaskData.priority && (
                  <div>
                    <p className="text-gray-600">Priority</p>
                    <p className="font-medium">{this.getPriorityLabel(parsedTaskData.priority)}</p>
                  </div>
                )}
                {parsedTaskData.estimate && (
                  <div>
                    <p className="text-gray-600">Estimated Time</p>
                    <p className="font-medium">{Math.floor(parsedTaskData.estimate / 60)}h {parsedTaskData.estimate % 60}m</p>
                  </div>
                )}
              </div>
            </div>

            <SchedulingSuggestions
              taskDuration={parsedTaskData.estimate || 60}
              onSuggestionSelected={handleSuggestionSelected}
              onClose={onClose}
              dueDate={parsedTaskData.due_date}
            />

            {selectedSuggestion && (
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('natural')}
                  disabled={isLoading}
                >
                  Back to Edit
                </Button>
                <Button
                  onClick={handleCreateTaskWithSuggestion}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2">▶</span> Creating Task...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">▶</span> Create Task with Schedule
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper method for priority labels
function getPriorityLabel(priority: number): string {
  switch(priority) {
    case 3: return 'High';
    case 2: return 'Medium';
    case 1: return 'Low';
    default: return 'None';
  }
}