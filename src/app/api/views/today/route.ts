import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { TaskService } from '@/services/task-service';
import { DatabaseError } from '@/lib/errors';
import { startOfToday, endOfToday } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const showCompleted = searchParams.get('showCompleted') === 'true';

    const taskService = new TaskService();

    // Get tasks for today
    const todayTasks = await taskService.getTasksByDateRange(
      Number(session.user.id),
      startOfToday(),
      endOfToday()
    );

    // Filter out completed tasks if showCompleted is false
    const filteredTasks = showCompleted
      ? todayTasks
      : todayTasks.filter(task => task.status !== 'completed');

    return NextResponse.json({
      tasks: filteredTasks,
      view: 'today',
      dateRange: {
        start: startOfToday(),
        end: endOfToday()
      }
    });

  } catch (error) {
    console.error('Error fetching today tasks:', error);
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