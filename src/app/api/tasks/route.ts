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
    const filters: any = {};

    // Parse query parameters for filtering
    if (searchParams.has('status')) {
      filters.status = searchParams.get('status');
    }
    if (searchParams.has('priority')) {
      filters.priority = parseInt(searchParams.get('priority') || '0');
    }
    if (searchParams.has('list_id')) {
      filters.list_id = parseInt(searchParams.get('list_id') || '0');
    }

    const taskService = new TaskService();
    const tasks = await taskService.getAllTasks(Number(session.user.id), filters);
    return NextResponse.json(tasks);

  } catch (error) {
    console.error('Error fetching tasks:', error);
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

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const taskService = new TaskService();

    const newTask = await taskService.createTask(Number(session.user.id), {
      list_id: data.list_id,
      title: data.title,
      description: data.description,
      due_date: data.due_date ? new Date(data.due_date) : undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      reminders: data.reminders,
      estimate: data.estimate,
      actual_time: data.actual_time,
      priority: data.priority,
      recurring: data.recurring,
      status: data.status,
      task_labels: data.task_labels,
      task_attachments: data.task_attachments
    });

    return NextResponse.json(newTask, { status: 201 });

  } catch (error) {
    console.error('Error creating task:', error);
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

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, ...data } = await request.json();
    const taskService = new TaskService();

    const updatedTask = await taskService.updateTask(
      Number(id),
      Number(session.user.id),
      {
        list_id: data.list_id,
        title: data.title,
        description: data.description,
        due_date: data.due_date ? new Date(data.due_date) : undefined,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        reminders: data.reminders,
        estimate: data.estimate,
        actual_time: data.actual_time,
        priority: data.priority,
        recurring: data.recurring,
        status: data.status,
        task_labels: data.task_labels,
        task_attachments: data.task_attachments
      }
    );

    return NextResponse.json(updatedTask);

  } catch (error) {
    console.error('Error updating task:', error);
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

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await request.json();
    const taskService = new TaskService();

    await taskService.deleteTask(Number(id), Number(session.user.id));

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting task:', error);
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