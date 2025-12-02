'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Task } from '@/types/task-types';
import { format } from 'date-fns';
import { FormValidation, FormField } from '@/components/ui/form-validation';
import { DatePicker } from '@/components/ui/date-picker';

interface CreateTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  listId?: number;
}

export function CreateTaskForm({ isOpen, onClose, onTaskCreated, listId }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('0');
  const [estimate, setEstimate] = useState('');
  const [actualTime, setActualTime] = useState('');
  const [status, setStatus] = useState('pending');
  const [recurring, setRecurring] = useState('');
  const [reminders, setReminders] = useState<string[]>([]);
  const [labels, setLabels] = useState<{name: string; color?: string; icon?: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length < 2) {
      errors.title = 'Title must be at least 2 characters';
    } else if (title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }

    if (description && description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    if (dueDate && new Date(dueDate) < new Date()) {
      errors.dueDate = 'Due date cannot be in the past';
    }

    if (deadline && new Date(deadline) < new Date()) {
      errors.deadline = 'Deadline cannot be in the past';
    }

    if (estimate && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(estimate)) {
      errors.estimate = 'Please enter a valid time (HH:mm)';
    }

    if (actualTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(actualTime)) {
      errors.actualTime = 'Please enter a valid time (HH:mm)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          list_id: listId,
          title,
          description,
          due_date: dueDate ? new Date(dueDate) : undefined,
          deadline: deadline ? new Date(deadline) : undefined,
          reminders,
          estimate: estimate ? parseTimeToMinutes(estimate) : undefined,
          actual_time: actualTime ? parseTimeToMinutes(actualTime) : undefined,
          priority: parseInt(priority),
          recurring: recurring || undefined,
          status,
          task_labels: labels.map(label => ({
            name: label.name,
            color: label.color,
            icon: label.icon
          }))
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
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const parseTimeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  const priorityOptions = [
    { value: '0', label: 'None' },
    { value: '1', label: 'Low' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'High' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];

  const recurringOptions = [
    { value: '', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const addReminder = () => {
    setReminders([...reminders, '']);
  };

  const updateReminder = (index: number, value: string) => {
    const newReminders = [...reminders];
    newReminders[index] = value;
    setReminders(newReminders);
  };

  const removeReminder = (index: number) => {
    const newReminders = [...reminders];
    newReminders.splice(index, 1);
    setReminders(newReminders);
  };

  const addLabel = () => {
    setLabels([...labels, { name: '', color: getRandomColor(), icon: getRandomIcon() }]);
  };

  const updateLabel = (index: number, field: keyof TaskLabel, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = { ...newLabels[index], [field]: value };
    setLabels(newLabels);
  };

  const removeLabel = (index: number) => {
    const newLabels = [...labels];
    newLabels.splice(index, 1);
    setLabels(newLabels);
  };

  const getRandomColor = () => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRandomIcon = () => {
    const icons = ['🏷️', '⭐', '⚡', '🔥', '💡', '🚀', '🎯', '📌'];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete project proposal"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField error={formErrors.dueDate}>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={formErrors.dueDate ? 'border-destructive' : ''}
              />
            </FormField>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimate">Estimate (HH:mm)</Label>
              <Input
                id="estimate"
                type="time"
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                step="60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualTime">Actual Time (HH:mm)</Label>
              <Input
                id="actualTime"
                type="time"
                value={actualTime}
                onChange={(e) => setActualTime(e.target.value)}
                step="60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurring">Recurring</Label>
            <Select value={recurring} onValueChange={setRecurring}>
              <SelectTrigger>
                <SelectValue placeholder="Select recurring pattern" />
              </SelectTrigger>
              <SelectContent>
                {recurringOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reminders</Label>
            {reminders.map((reminder, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  type="time"
                  value={reminder}
                  onChange={(e) => updateReminder(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeReminder(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addReminder}
            >
              Add Reminder
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Labels</Label>
            {labels.map((label, index) => (
              <div key={index} className="flex gap-2 items-center mb-2 p-2 border rounded">
                <Input
                  value={label.name}
                  onChange={(e) => updateLabel(index, 'name', e.target.value)}
                  placeholder="Label name"
                />
                <Input
                  type="color"
                  value={label.color || '#6366f1'}
                  onChange={(e) => updateLabel(index, 'color', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={label.icon || ''}
                  onChange={(e) => updateLabel(index, 'icon', e.target.value)}
                  placeholder="🏷️"
                  className="w-12"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeLabel(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLabel}
            >
              Add Label
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}