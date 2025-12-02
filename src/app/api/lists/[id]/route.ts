import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ListService } from '@/services/list-service';
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
    const listService = new ListService();
    const list = await listService.getListById(
      Number(paramsObj.id),
      Number(session.user.id)
    );

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(list);

  } catch (error) {
    console.error('Error fetching list:', error);
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