'use client';

import { useRouter } from 'next/navigation';
import { IntegratedTaskCreation } from '@/components/tasks/integrated-task-creation';
import { Task } from '@/types/task-types';

export default function CreateTaskPage() {
  const router = useRouter();

  const handleTaskCreated = (newTask: Task) => {
    router.push(`/tasks/${newTask.id}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <IntegratedTaskCreation
          onTaskCreated={handleTaskCreated}
          onClose={() => router.push('/tasks')}
        />
      </div>
    </div>
  );
}