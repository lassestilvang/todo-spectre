'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task, TaskLog, TaskLabel, TaskAttachment } from '@/types/task-types';
import { format, formatDistanceToNow } from 'date-fns';
import { Pencil, Trash2, Clock, Calendar, Tag, Paperclip, History, CheckCircle, AlertCircle, MinusCircle, Archive } from 'lucide-react';

interface TaskDetailViewProps {
  taskId: number;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: number) => void;
}

export function TaskDetailView({ taskId, isOpen, onClose, onTaskUpdated, onTaskDeleted }: TaskDetailViewProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (taskId && isOpen) {
      fetchTask();
      fetchTaskLogs();
    }
  }, [taskId, isOpen, fetchTask, fetchTaskLogs]);

  const fetchTask = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }
      const data = await response.json();
      setTask(data);
    } catch (err) {
      console.error('Error fetching task:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch task');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaskLogs = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/logs`);
      if (!response.ok) {
        throw new Error('Failed to fetch task logs');
      }
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching task logs:', err);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      onTaskDeleted(taskId);
      onClose();
      router.refresh();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 3: return <Badge variant="destructive" className="bg-red-500">High</Badge>;
      case 2: return <Badge variant="secondary" className="bg-yellow-500">Medium</Badge>;
      case 1: return <Badge variant="secondary" className="bg-blue-500">Low</Badge>;
      default: return <Badge variant="outline">None</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="secondary" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'in_progress': return <Badge variant="secondary" className="bg-blue-500"><AlertCircle className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case 'archived': return <Badge variant="secondary" className="bg-gray-500"><Archive className="w-3 h-3 mr-1" /> Archived</Badge>;
      default: return <Badge variant="outline" className="bg-gray-300"><MinusCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const formatTimeMinutes = (minutes?: number): string => {
    if (minutes === undefined || minutes === null) return '00:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span className="truncate max-w-[70%]">{task.title}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/tasks/${task.id}/edit`)}>
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Task Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Created:</strong> {format(new Date(task.created_at), 'PPpp')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Updated:</strong> {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Due:</strong> {task.due_date ? format(new Date(task.due_date), 'PP') : 'No due date'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Deadline:</strong> {task.deadline ? format(new Date(task.deadline), 'PPpp') : 'No deadline'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Estimate:</strong> {formatTimeMinutes(task.estimate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Actual Time:</strong> {formatTimeMinutes(task.actual_time)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    <strong>Priority:</strong> {getPriorityBadge(task.priority)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    <strong>Status:</strong> {getStatusBadge(task.status)}
                  </span>
                </div>
              </div>

              {task.recurring && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Recurring:</strong> {task.recurring}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description Section */}
          {task.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{task.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Labels Section */}
          {task.task_labels && task.task_labels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Labels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {task.task_labels.map((label) => (
                    <Badge
                      key={label.id}
                      style={{ backgroundColor: label.color || '#6366f1' }}
                      className="text-white"
                    >
                      {label.icon && <span className="mr-1">{label.icon}</span>}
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments Section */}
          {task.task_attachments && task.task_attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4" /> Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.task_attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{attachment.file_name}</span>
                        <span className="text-xs text-gray-500">({attachment.file_type}, {formatFileSize(attachment.file_size)})</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reminders Section */}
          {task.reminders && task.reminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.reminders.map((reminder, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{reminder}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task Logs Button */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setShowLogs(true)}>
              <History className="w-4 h-4 mr-2" /> View Task History
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      </DialogContent>

      {/* Task Logs Dialog */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="sm:max-w-[600px] max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {logs.length === 0 ? (
              <p className="text-gray-500">No task history available.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium capitalize">{log.action}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(log.created_at), 'PPpp')}
                          </p>
                        </div>
                        {log.changes && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              try {
                                const changes = JSON.parse(log.changes!);
                                alert(JSON.stringify(changes, null, 2));
                              } catch (e) {
                                alert(log.changes!);
                              }
                            }}
                          >
                            View Changes
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};