import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const integration = await prisma.calendarIntegration.findFirst({
      where: { user_id: Number(session.user.id) },
    });

    if (!integration) {
      return NextResponse.json({ error: 'No calendar connected' }, { status: 400 });
    }

    // In production, fetch events from the provider using integration.access_token.
    // For this scaffold, create a sample task from a mock event.
    const list = await prisma.list.findFirst({ where: { user_id: Number(session.user.id) } });
    if (!list) {
      return NextResponse.json({ error: 'No list found' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        list_id: list.id,
        title: 'Synced calendar event',
        description: `Imported from ${integration.provider} calendar`,
        priority: 1,
        status: 'pending',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ synced: 1, tasks: [task] });
  } catch (error) {
    console.error('Error syncing calendar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
