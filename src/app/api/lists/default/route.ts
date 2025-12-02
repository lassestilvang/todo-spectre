import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ListService } from '@/services/list-service';
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

    const listService = new ListService();
    const defaultList = await listService.getDefaultList(Number(session.user.id));

    if (!defaultList) {
      return NextResponse.json(
        { error: 'Default list not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(defaultList);

  } catch (error) {
    console.error('Error fetching default list:', error);
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