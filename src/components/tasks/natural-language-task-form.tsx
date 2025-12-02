'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Task } from '@/types/task-types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';

interface NaturalLanguageTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  listId?: number;
}

export function NaturalLanguageTaskForm({ isOpen, onClose, onTaskCreated, listId }: NaturalLanguageTaskFormProps) {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setParsedData(null);

    if (!naturalLanguageInput.trim()) {
      setError('Please enter a task description');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tasks/natural-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          natural_language_input: naturalLanguageInput,
          list_id: listId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task from natural language');
      }

      const result = await response.json();
      setParsedData(result.parsed_data);
      onTaskCreated(result.task);
      onClose();
      router.refresh();

    } catch (err) {
      console.error('Error creating task from natural language:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task from natural language');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task with Natural Language</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="natural-language-input">Describe your task in natural language</Label>
            <Textarea
              id="natural-language-input"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              placeholder="Example: 'Complete the project proposal by Friday at 5pm - this is urgent and should take about 2 hours'"
              rows={6}
              className="min-h-[150px]"
              required
            />
            <p className="text-sm text-gray-500">
              You can use natural language like: "Finish the report by tomorrow", "Schedule meeting with team next Monday at 2pm", "Buy groceries this afternoon - low priority"
            </p>
          </div>

          {parsedData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold mb-2">Parsed Task Details:</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {parsedData.title}</p>
                {parsedData.description && <p><strong>Description:</strong> {parsedData.description}</p>}
                {parsedData.due_date && <p><strong>Due Date:</strong> {new Date(parsedData.due_date).toLocaleString()}</p>}
                {parsedData.priority && <p><strong>Priority:</strong> {this.getPriorityLabel(parsedData.priority)}</p>}
                {parsedData.estimate && <p><strong>Estimated Time:</strong> {Math.floor(parsedData.estimate / 60)} hours {parsedData.estimate % 60} minutes</p>}
                {parsedData.reminders && parsedData.reminders.length > 0 && (
                  <p><strong>Reminders:</strong> {parsedData.reminders.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {error && (
            <ErrorDisplay message={error} />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !naturalLanguageInput.trim()}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Creating Task...
                </>
              ) : 'Create Task from Description'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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