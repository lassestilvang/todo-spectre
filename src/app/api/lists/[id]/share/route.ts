import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const shares = await prisma.listShare.findMany({
      where: { list_id: Number(id) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(shares);
  } catch (error) {
    console.error('Error fetching shares:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { email, role } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const share = await prisma.listShare.upsert({
      where: { list_id_user_id: { list_id: Number(id), user_id: user.id } },
      update: { role: role || 'viewer' },
      create: { list_id: Number(id), user_id: user.id, role: role || 'viewer' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error('Error sharing list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
