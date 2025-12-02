'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Task } from '@/types/task-types';
import { TaskList } from '@/components/tasks/task-list';
import { CreateTaskForm } from '@/components/tasks/create-task-form';
import { TaskDetailView } from '@/components/tasks/task-detail-view';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';

export default function LabelPage() {
  const params = useParams();
  const [label, setLabel] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchLabelAndTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch the label details
      const labelResponse = await fetch(`/api/labels/${params.id}`);
      if (!labelResponse.ok) {
        throw new Error('Failed to fetch label');
      }
      const labelData = await labelResponse.json();
      setLabel(labelData);

      // Fetch tasks for this label
      const tasksResponse = await fetch(`/api/labels/${params.id}/tasks`);
      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch tasks for this label');
      }
      const tasksData = await tasksResponse.json();
      setTasks(tasksData.tasks || []);

    } catch (err) {
      console.error('Error fetching label data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch label data');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchLabelAndTasks();
    }
  }, [params.id, fetchLabelAndTasks]);

  const handleTaskCreated = () => {
    fetchLabelAndTasks();
    setShowCreateForm(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    fetchLabelAndTasks();
    setSelectedTask(updatedTask);
  };

  const handleTaskDeleted = () => {
    fetchLabelAndTasks();
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
        <ErrorDisplay message={error} onRetry={fetchLabelAndTasks} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {label?.icon} {label?.name}
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