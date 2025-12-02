import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ViewService } from '@/services/view-service';
import { DatabaseError } from '@/lib/errors';

export async function PUT(request: Request, { params }: { params: { viewName: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { showCompleted } = await request.json();
    const viewService = new ViewService();

    // Find the view by name and user
    const views = await viewService.getAllViews(Number(session.user.id));
    const view = views.find(v => v.name.toLowerCase() === params.viewName.toLowerCase());

    if (!view) {
      return NextResponse.json(
        { error: 'View not found' },
        { status: 404 }
      );
    }

    // Toggle completed tasks visibility
    const updatedView = await viewService.toggleCompletedVisibility(
      view.id,
      Number(session.user.id),
      Boolean(showCompleted)
    );

    return NextResponse.json({
      success: true,
      view: updatedView
    });

  } catch (error) {
    console.error('Error toggling completed tasks visibility:', error);
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