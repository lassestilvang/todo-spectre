import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { TaskService } from '@/services/task-service';
import { DatabaseError } from '@/lib/errors';

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

    // Get all tasks (both scheduled and unscheduled)
    const allTasks = await taskService.getAllTasks(Number(session.user.id));

    // Filter out completed tasks if showCompleted is false
    const filteredTasks = showCompleted
      ? allTasks
      : allTasks.filter(task => task.status !== 'completed');

    return NextResponse.json({
      tasks: filteredTasks,
      view: 'all',
      totalCount: allTasks.length,
      filteredCount: filteredTasks.length
    });

  } catch (error) {
    console.error('Error fetching all tasks:', error);
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