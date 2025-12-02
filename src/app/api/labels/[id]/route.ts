import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { LabelService } from '@/services/label-service';
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
    const labelService = new LabelService();
    const label = await labelService.getLabelById(
      Number(paramsObj.id),
      Number(session.user.id)
    );

    if (!label) {
      return NextResponse.json(
        { error: 'Label not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(label);

  } catch (error) {
    console.error('Error fetching label:', error);
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