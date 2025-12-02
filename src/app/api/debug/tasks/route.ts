import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';

export async function GET() {
  try {
    const tasks = await mockDb.task.findMany({});
    return NextResponse.json({
      tasks: tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}