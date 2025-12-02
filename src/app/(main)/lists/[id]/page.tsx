'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Task } from '@/types/task-types';
import { TaskList } from '@/components/tasks/task-list';
import { CreateTaskForm } from '@/components/tasks/create-task-form';
import { TaskDetailView } from '@/components/tasks/task-detail-view';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';

export default function ListPage() {
  const params = useParams();
  const [list, setList] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchListAndTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch the list details
      const listResponse = await fetch(`/api/lists/${params.id}`);
      if (!listResponse.ok) {
        throw new Error('Failed to fetch list');
      }
      const listData = await listResponse.json();
      setList(listData);

      // Fetch tasks for this list
      const tasksResponse = await fetch(`/api/lists/${params.id}/tasks`);
      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch tasks for this list');
      }
      const tasksData = await tasksResponse.json();
      setTasks(tasksData.tasks || []);

    } catch (err) {
      console.error('Error fetching list data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch list data');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchListAndTasks();
    }
  }, [params.id, fetchListAndTasks]);

  const handleTaskCreated = () => {
    fetchListAndTasks();
    setShowCreateForm(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    fetchListAndTasks();
    setSelectedTask(updatedTask);
  };

  const handleTaskDeleted = () => {
    fetchListAndTasks();
    setSelectedTask(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <ErrorDisplay message={error} onRetry={fetchListAndTasks} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {list?.icon} {list?.title}
        </h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <span>+</span> New Task
        </button>
      </div>

      <TaskList
        tasks={tasks}
        onTaskSelect={setSelectedTask}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
        showCompleted={true}
      />

      <CreateTaskForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onTaskCreated={handleTaskCreated}
        defaultListId={list?.id}
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