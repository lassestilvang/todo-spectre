import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DatabaseError } from '@/lib/errors';
import { SearchService } from '@/services/search-service';

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
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
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
    if (searchParams.has('include_lists')) {
      filters.include_lists = searchParams.get('include_lists') === 'true';
    }

    const searchService = new SearchService();
    const results = await searchService.searchTasks(
      Number(session.user.id),
      query,
      filters,
      page,
      limit
    );

    return NextResponse.json({
      results: results.items,
      total: results.total,
      page: results.page,
      limit: results.limit,
      totalPages: results.totalPages
    });

  } catch (error) {
    console.error('Error searching:', error);
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