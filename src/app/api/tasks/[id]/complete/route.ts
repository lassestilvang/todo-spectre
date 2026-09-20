import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { TaskService } from '@/services/task-service';
import { addDays, addMonths } from "date-fns";
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

    const becomingCompleted = task.status !== 'completed';
    const updatedTask = await taskService.updateTask(
      Number(id),
      Number(session.user.id),
      { status: becomingCompleted ? 'completed' : 'pending' }
    );

    // Spawn next occurrence for recurring tasks when completed
    if (becomingCompleted && task.recurring && task.due_date) {
      const baseDue = new Date(task.due_date);
      let nextDue: Date | null = null;
      switch (task.recurring) {
        case 'daily':
          nextDue = addDays(baseDue, 1);
          break;
        case 'weekly':
          nextDue = addDays(baseDue, 7);
          break;
        case 'biweekly':
          nextDue = addDays(baseDue, 14);
          break;
        case 'monthly':
          nextDue = addMonths(baseDue, 1);
          break;
        case 'yearly':
          nextDue = addMonths(baseDue, 12);
          break;
        default:
          break;
      }
      if (nextDue) {
        await taskService.createTask(Number(session.user.id), {
          list_id: task.list_id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          recurring: task.recurring,
          due_date: nextDue,
          status: 'pending',
        });
      }
    }

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
