'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ViewContainer } from '@/components/views/view-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@/types/task-types';
import { CreateTaskForm } from '@/components/tasks/create-task-form';
import { TaskDetailView } from '@/components/tasks/task-detail-view';

function ViewsPageContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from URL or default to 'today'
  const activeTab = searchParams.get('tab') || 'today';

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let apiUrl = '';
      switch (activeTab) {
        case 'today':
          apiUrl = `/api/views/today?showCompleted=${showCompleted}`;
          break;
        case 'next7days':
          apiUrl = `/api/views/next7days?showCompleted=${showCompleted}`;
          break;
        case 'upcoming':
          apiUrl = `/api/views/upcoming?showCompleted=${showCompleted}`;
          break;
        case 'all':
        default:
          apiUrl = `/api/views/all?showCompleted=${showCompleted}`;
          break;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.tasks || []);

    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, showCompleted]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskCreated = () => {
    // Refresh the current view to include the new task
    fetchTasks();
    setShowCreateForm(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    // Refresh the current view to show updated task
    fetchTasks();
    setSelectedTask(updatedTask);
  };

  const handleTaskDeleted = () => {
    // Refresh the current view to remove deleted task
    fetchTasks();
    setSelectedTask(null);
  };

  const handleToggleCompleted = (show: boolean) => {
    setShowCompleted(show);
  };

  const handleTabChange = (tab: string) => {
    // Update URL with the new tab parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/views?${params.toString()}`);
  };

  if (isLoading && tasks.length === 0) {
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
        <h1 className="text-3xl font-bold">Task Views</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <span>+</span> New Task
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="next7days">Next 7 Days</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <ViewContainer
            viewType="today"
            initialTasks={tasks}
            showCompleted={showCompleted}
            onToggleCompleted={handleToggleCompleted}
            onRefresh={fetchTasks}
          />
        </TabsContent>

        <TabsContent value="next7days">
          <ViewContainer
            viewType="next7days"
            initialTasks={tasks}
            showCompleted={showCompleted}
            onToggleCompleted={handleToggleCompleted}
            onRefresh={fetchTasks}
          />
        </TabsContent>

        <TabsContent value="upcoming">
          <ViewContainer
            viewType="upcoming"
            initialTasks={tasks}
            showCompleted={showCompleted}
            onToggleCompleted={handleToggleCompleted}
            onRefresh={fetchTasks}
          />
        </TabsContent>

        <TabsContent value="all">
          <ViewContainer
            viewType="all"
            initialTasks={tasks}
            showCompleted={showCompleted}
            onToggleCompleted={handleToggleCompleted}
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

export default function ViewsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading views...</div>}>
      <ViewsPageContent />
    </Suspense>
  );
}