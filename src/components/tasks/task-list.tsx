'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task-types';
import { format, formatDistanceToNow } from 'date-fns';
import { CheckCircle, AlertCircle, MinusCircle, Archive, Plus, Calendar, Clock, Tag } from 'lucide-react';
import { ErrorDisplay } from '@/components/ui/error-display';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

interface TaskListProps {
  tasks: Task[];
  title: string;
  onTaskClick: (task: Task) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  error?: Error | string;
  onRetry?: () => void;
}

export function TaskList({ tasks, title, onTaskClick, onRefresh, isLoading, error, onRetry }: TaskListProps) {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<number | null>(null);

  const filteredTasks = tasks.filter(task => {
    if (filterStatus && task.status !== filterStatus) return false;
    if (filterPriority !== null && task.priority !== filterPriority) return false;
    return true;
  });

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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} disabled>
              <span className="mr-1">🔄</span> Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => router.push('/tasks/create')}
              disabled
            >
              <Plus className="w-4 h-4 mr-1" /> New Task
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <SkeletonLoader className="h-10 w-full" />
          <SkeletonLoader className="h-8 w-1/2" />
          <div className="space-y-2">
            <SkeletonLoader className="h-20 w-full" />
            <SkeletonLoader className="h-20 w-full" />
            <SkeletonLoader className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRetry || onRefresh}>
              <span className="mr-1">🔄</span> {onRetry ? 'Retry' : 'Refresh'}
            </Button>
            <Button
              size="sm"
              onClick={() => router.push('/tasks/create')}
            >
              <Plus className="w-4 h-4 mr-1" /> New Task
            </Button>
          </div>
        </div>

        <ErrorDisplay error={error} onRetry={onRetry} className="mt-4" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <span className="mr-1">🔄</span> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => router.push('/tasks/create')}
          >
            <Plus className="w-4 h-4 mr-1" /> New Task
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Select
          value={filterStatus || ''}
          onValueChange={(value) => setFilterStatus(value === '' ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterPriority?.toString() || ''}
          onValueChange={(value) => setFilterPriority(value === '' ? null : parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="0">None</SelectItem>
            <SelectItem value="1">Low</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No tasks found</p>
            <Button
              className="mt-4"
              onClick={() => router.push('/tasks/create')}
            >
              <Plus className="w-4 h-4 mr-1" /> Create Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onTaskClick(task)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{task.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{task.description}</p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}

                      {task.due_date && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.due_date), 'PP')}
                        </Badge>
                      )}

                      {task.estimate && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeMinutes(task.estimate)}
                        </Badge>
                      )}

                      {task.task_labels && task.task_labels.length > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {task.task_labels.length} label(s)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-400">
                      Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Import Select components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';