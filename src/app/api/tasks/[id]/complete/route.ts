import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { TaskService } from '@/services/task-service';
import { DatabaseError } from '@/lib/errors';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const taskService = new TaskService();
    const task = await taskService.getTaskById(Number(id), Number(session.user.id));
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updatedTask = await taskService.updateTask(
      Number(id),
      Number(session.user.id),
      { status: task.status === 'completed' ? 'pending' : 'completed' }
    );

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error toggling task completion:', error);
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
