import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { TaskService } from '@/services/task-service';
import { DatabaseError } from '@/lib/errors';
import { endOfToday, addDays } from 'date-fns';

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

    // Get all upcoming tasks (future tasks beyond next 7 days)
    const todayEnd = endOfToday();
    const upcomingStart = addDays(todayEnd, 8); // Start from 8 days from now

    const upcomingTasks = await taskService.getTasksByDateRange(
      Number(session.user.id),
      upcomingStart,
      new Date('2099-12-31') // Far future date
    );

    // Filter out completed tasks if showCompleted is false
    const filteredTasks = showCompleted
      ? upcomingTasks
      : upcomingTasks.filter(task => task.status !== 'completed');

    return NextResponse.json({
      tasks: filteredTasks,
      view: 'upcoming',
      dateRange: {
        start: upcomingStart,
        end: new Date('2099-12-31')
      }
    });

  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
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