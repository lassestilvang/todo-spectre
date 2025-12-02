'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskList } from '@/components/tasks/task-list';
import { Task } from '@/types/task-types';
import { format } from 'date-fns';
import { Toggle } from '@/components/ui/toggle';
import { Eye, EyeOff } from 'lucide-react';

interface ViewContainerProps {
  viewType: 'today' | 'next7days' | 'upcoming' | 'all';
  initialTasks: Task[];
  showCompleted: boolean;
  onToggleCompleted: (showCompleted: boolean) => void;
  onRefresh: () => void;
}

export function ViewContainer({
  viewType,
  initialTasks,
  showCompleted,
  onToggleCompleted,
  onRefresh
}: ViewContainerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const getViewHeader = () => {
    const today = new Date();
    switch (viewType) {
      case 'today':
        return {
          title: 'Today',
          subtitle: format(today, 'EEEE, MMMM d, yyyy'),
          description: 'Tasks due today'
        };
      case 'next7days':
        const next7DaysEnd = new Date();
        next7DaysEnd.setDate(today.getDate() + 7);
        return {
          title: 'Next 7 Days',
          subtitle: `${format(today, 'MMM d')} - ${format(next7DaysEnd, 'MMM d, yyyy')}`,
          description: 'Tasks due in the next week'
        };
      case 'upcoming':
        return {
          title: 'Upcoming',
          subtitle: 'Future Tasks',
          description: 'Tasks due beyond the next 7 days'
        };
      case 'all':
      default:
        return {
          title: 'All Tasks',
          subtitle: 'Complete Task List',
          description: 'All your tasks (scheduled and unscheduled)'
        };
    }
  };

  const header = getViewHeader();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{header.title}</h2>
          <p className="text-sm text-gray-500">{header.subtitle}</p>
          <p className="text-sm text-gray-400 mt-1">{header.description}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Toggle
              pressed={showCompleted}
              onPressedChange={onToggleCompleted}
              aria-label="Toggle completed tasks"
              className="w-10 h-10"
            >
              {showCompleted ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Toggle>
            <span className="text-sm text-gray-600">
              {showCompleted ? 'Hide' : 'Show'} Completed
            </span>
          </div>

          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200 flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></span>
            ) : (
              <span>↻</span>
            )}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              onRefresh();
            }}
            className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      <div className="border-t pt-4">
        <TaskList
          tasks={tasks}
          title={`${header.title} (${tasks.length})`}
          onTaskClick={(task) => {
            router.push(`/tasks/${task.id}`);
          }}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
}