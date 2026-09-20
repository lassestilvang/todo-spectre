import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const logs = await prisma.taskLog.findMany({
      where: { task: { list: { user_id: Number(session.user.id) } } },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: { task: { select: { id: true, title: true } } },
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
