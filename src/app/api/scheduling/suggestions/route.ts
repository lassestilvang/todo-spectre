import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SchedulingAlgorithm } from '@/lib/scheduling-algorithm';
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

    const { task_duration, preferred_time, due_date } = await request.json();

    // Validate input
    if (!task_duration || typeof task_duration !== 'number' || task_duration <= 0) {
      return NextResponse.json(
        { error: 'Task duration is required and must be a positive number (in minutes)' },
        { status: 400 }
      );
    }

    // Get scheduling suggestions
    const suggestions = await SchedulingAlgorithm.suggestOptimalSchedule(
      Number(session.user.id),
      task_duration,
      preferred_time,
      due_date ? new Date(due_date) : undefined
    );

    return NextResponse.json({
      success: true,
      suggestions: suggestions,
      count: suggestions.length
    });

  } catch (error) {
    console.error('Error getting scheduling suggestions:', error);
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

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get availability analysis
    const analysis = await SchedulingAlgorithm.analyzeAvailability(Number(session.user.id));

    return NextResponse.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('Error getting availability analysis:', error);
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