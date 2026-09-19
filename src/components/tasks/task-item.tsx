'use client';

import { Task } from '@/types/task-types';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onClick?: (id: number) => void;
}

export function TaskItem({ task, onClick }: TaskItemProps) {
  const getPriorityIndicator = (priority: number) => {
    switch (priority) {
      case 3: return '🔴';
      case 2: return '🟡';
      case 1: return '🔵';
      default: return '⚪';
    }
  };

  const formatTime = (minutes?: number): string => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div
      className={`task-item p-3 rounded-md border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        task.status === 'completed' ? 'completed opacity-75' : ''
      }`}
      onClick={() => onClick?.(task.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="priority-indicator text-lg">
            {getPriorityIndicator(task.priority)}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-gray-500 truncate">{task.description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={task.status === 'completed' ? 'secondary' : 'outline'} className="text-xs">
            {task.status}
          </Badge>
          {task.due_date && (
            <div className="due-date flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString()}
            </div>
          )}
          {task.estimate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatTime(task.estimate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}