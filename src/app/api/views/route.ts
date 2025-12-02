import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ViewService } from '@/services/view-service';
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

    const viewService = new ViewService();
    const views = await viewService.getAllViews(Number(session.user.id));
    return NextResponse.json(views);

  } catch (error) {
    console.error('Error fetching views:', error);
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
    const viewService = new ViewService();

    const newView = await viewService.createView(Number(session.user.id), {
      name: data.name,
      type: data.type,
      filter_criteria: data.filter_criteria,
      sort_order: data.sort_order,
      show_completed: data.show_completed || false
    });

    return NextResponse.json(newView, { status: 201 });

  } catch (error) {
    console.error('Error creating view:', error);
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