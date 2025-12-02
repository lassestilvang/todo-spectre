'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskList } from './task-list';
import { CreateTaskForm } from './create-task-form';
import { TaskDetailView } from './task-detail-view';
import { Task } from '@/types/task-types';
import { format, addDays, startOfToday, endOfToday } from 'date-fns';

export function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const router = useRouter();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask]);
    setShowCreateForm(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setSelectedTask(updatedTask);
  };

  const handleTaskDeleted = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setSelectedTask(null);
  };

  const getFilteredTasks = (filterType: string): Task[] => {
    const now = new Date();

    switch (filterType) {
      case 'today':
        return tasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate >= startOfToday() && dueDate <= endOfToday();
        });

      case 'next7days':
        const next7DaysEnd = addDays(startOfToday(), 7);
        return tasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate > endOfToday() && dueDate <= next7DaysEnd;
        });

      case 'upcoming':
        return tasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate > endOfToday();
        });

      case 'all':
      default:
        return tasks;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchTasks}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <span>+</span> New Task
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="next7days">Next 7 Days</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <TaskList
            tasks={getFilteredTasks('today')}
            title={`Today's Tasks (${getFilteredTasks('today').length})`}
            onTaskClick={setSelectedTask}
            onRefresh={fetchTasks}
          />
        </TabsContent>

        <TabsContent value="next7days">
          <TaskList
            tasks={getFilteredTasks('next7days')}
            title={`Next 7 Days (${getFilteredTasks('next7days').length})`}
            onTaskClick={setSelectedTask}
            onRefresh={fetchTasks}
          />
        </TabsContent>

        <TabsContent value="upcoming">
          <TaskList
            tasks={getFilteredTasks('upcoming')}
            title={`Upcoming Tasks (${getFilteredTasks('upcoming').length})`}
            onTaskClick={setSelectedTask}
            onRefresh={fetchTasks}
          />
        </TabsContent>

        <TabsContent value="all">
          <TaskList
            tasks={getFilteredTasks('all')}
            title={`All Tasks (${getFilteredTasks('all').length})`}
            onTaskClick={setSelectedTask}
            onRefresh={fetchTasks}
          />
        </TabsContent>
      </Tabs>

      <CreateTaskForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onTaskCreated={handleTaskCreated}
      />

      {selectedTask && (
        <TaskDetailView
          taskId={selectedTask.id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}