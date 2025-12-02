import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { TaskService } from '@/services/task-service';
import { DatabaseError } from '@/lib/errors';

export async function GET(
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

    const paramsObj = await params;
    const taskService = new TaskService();
    const tasks = await taskService.getTasksByList(
      Number(session.user.id),
      Number(paramsObj.id)
    );

    return NextResponse.json({ tasks });

  } catch (error) {
    console.error('Error fetching tasks by list:', error);
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