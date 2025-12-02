'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Task, TaskLabel, TaskAttachment } from '@/types/task-types';
import { format } from 'date-fns';

interface EditTaskFormProps {
  taskId: number;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
}

export function EditTaskForm({ taskId, isOpen, onClose, onTaskUpdated }: EditTaskFormProps) {
  const [task, setTask] = useState<Task | null>(null);
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
  const router = useRouter();

  useEffect(() => {
    if (taskId && isOpen) {
      fetchTask();
    }
  }, [taskId, isOpen]);

  const fetchTask = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }
      const data = await response.json();
      setTask(data);

      // Set form values
      setTitle(data.title);
      setDescription(data.description || '');
      setDueDate(data.due_date ? format(new Date(data.due_date), 'yyyy-MM-dd') : '');
      setDeadline(data.deadline ? format(new Date(data.deadline), 'yyyy-MM-dd') : '');
      setPriority(data.priority?.toString() || '0');
      setEstimate(data.estimate ? formatTimeMinutes(data.estimate) : '');
      setActualTime(data.actual_time ? formatTimeMinutes(data.actual_time) : '');
      setStatus(data.status || 'pending');
      setRecurring(data.recurring || '');
      setReminders(data.reminders || []);
      setLabels(data.task_labels?.map(label => ({
        name: label.name,
        color: label.color,
        icon: label.icon
      })) || []);
    } catch (err) {
      console.error('Error fetching task:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
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
        throw new Error(errorData.error || 'Failed to update task');
      }

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
      onClose();
      router.refresh();

    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const parseTimeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  const formatTimeMinutes = (minutes?: number): string => {
    if (minutes === undefined || minutes === null) return '00:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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

  if (isLoading && !task) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task Not Found</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">The requested task could not be found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
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
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

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
              {isLoading ? 'Updating...' : 'Update Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}