import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { TaskService } from '@/services/task-service';
import { DatabaseError } from '@/lib/errors';
import { startOfToday, endOfToday, addDays } from 'date-fns';

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

    // Get tasks for next 7 days (excluding today)
    const todayEnd = endOfToday();
    const next7DaysEnd = addDays(todayEnd, 7);

    const next7DaysTasks = await taskService.getTasksByDateRange(
      Number(session.user.id),
      new Date(todayEnd.getTime() + 1), // Start from tomorrow
      next7DaysEnd
    );

    // Filter out completed tasks if showCompleted is false
    const filteredTasks = showCompleted
      ? next7DaysTasks
      : next7DaysTasks.filter(task => task.status !== 'completed');

    return NextResponse.json({
      tasks: filteredTasks,
      view: 'next7days',
      dateRange: {
        start: new Date(todayEnd.getTime() + 1),
        end: next7DaysEnd
      }
    });

  } catch (error) {
    console.error('Error fetching next 7 days tasks:', error);
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