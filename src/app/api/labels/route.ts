import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { LabelService } from '@/services/label-service';
import { DatabaseError } from '@/lib/errors';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const labelService = new LabelService();
    const labels = await labelService.getAllLabels(Number(session.user.id));
    return NextResponse.json(labels);

  } catch (error) {
    console.error('Error fetching labels:', error);
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
    const labelService = new LabelService();

    const newLabel = await labelService.createLabel(Number(session.user.id), {
      name: data.name,
      color: data.color,
      icon: data.icon
    });

    return NextResponse.json(newLabel, { status: 201 });

  } catch (error) {
    console.error('Error creating label:', error);
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