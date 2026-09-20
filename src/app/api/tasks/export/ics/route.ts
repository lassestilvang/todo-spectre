import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function toICSDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tasks = await prisma.task.findMany({
      where: { list: { user_id: Number(session.user.id) } },
      orderBy: { due_date: 'asc' },
    });

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Todo Spectre//EN',
      'CALSCALE:GREGORIAN',
    ];

    for (const task of tasks) {
      if (!task.due_date) continue;
      const start = new Date(task.due_date);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:task-${task.id}@todo-spectre`);
      lines.push(`DTSTAMP:${toICSDate(new Date())}`);
      lines.push(`DTSTART:${toICSDate(start)}`);
      lines.push(`DTEND:${toICSDate(end)}`);
      lines.push(`SUMMARY:${(task.title || '').replace(/\n/g, ' ')}`);
      if (task.description) lines.push(`DESCRIPTION:${task.description.replace(/\n/g, ' ')}`);
      lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');

    return new NextResponse(lines.join('\r\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="tasks.ics"',
      },
    });
  } catch (error) {
    console.error('Error exporting ICS:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
