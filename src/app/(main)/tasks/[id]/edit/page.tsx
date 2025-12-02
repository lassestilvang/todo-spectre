'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EditTaskForm } from '@/components/tasks/edit-task-form';
import { Task } from '@/types/task-types';

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTask();
  }, [params.id]);

  const fetchTask = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${params.id}`);
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

  const handleTaskUpdated = (updatedTask: Task) => {
    setTask(updatedTask);
    router.push(`/tasks/${updatedTask.id}`);
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
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => router.push('/tasks')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-gray-500 mb-4">Task not found</p>
        <button
          onClick={() => router.push('/tasks')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <EditTaskForm
        taskId={task.id}
        isOpen={true}
        onClose={() => router.push(`/tasks/${task.id}`)}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
}