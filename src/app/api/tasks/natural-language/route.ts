import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { TaskService } from '@/services/task-service';
import { NaturalLanguageParser } from '@/lib/natural-language-parser';
import { DatabaseError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { natural_language_input, list_id } = await request.json();

    if (!natural_language_input || typeof natural_language_input !== 'string') {
      return NextResponse.json(
        { error: 'Natural language input is required and must be a string' },
        { status: 400 }
      );
    }

    // Parse the natural language input
    const parsedTaskData = NaturalLanguageParser.parseNaturalLanguageToTask(natural_language_input);

    if (!parsedTaskData.title || parsedTaskData.title.trim() === '') {
      return NextResponse.json(
        { error: 'Could not extract task title from input' },
        { status: 400 }
      );
    }

    const taskService = new TaskService();

    // Create the task with parsed data
    const newTask = await taskService.createTask(Number(session.user.id), {
      list_id: list_id,
      title: parsedTaskData.title,
      description: parsedTaskData.description,
      due_date: parsedTaskData.due_date,
      priority: parsedTaskData.priority || 0,
      estimate: parsedTaskData.estimate,
      reminders: parsedTaskData.reminders,
      status: parsedTaskData.status || 'pending'
    });

    return NextResponse.json({
      success: true,
      task: newTask,
      parsed_data: parsedTaskData
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating task from natural language:', error);
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}