import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'google';
    const userId = searchParams.get('userId');
    const code = searchParams.get('code');

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    // In production, exchange `code` for access/refresh tokens via the provider's token endpoint.
    // For this scaffold, store a mock token.
    await prisma.calendarIntegration.upsert({
      where: { user_id_provider: { user_id: Number(userId), provider } },
      update: { access_token: code || 'mock-access-token', updated_at: new Date() },
      create: {
        user_id: Number(userId),
        provider,
        access_token: code || 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      },
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/settings?calendar=connected`);
  } catch (error) {
    console.error('Error in calendar callback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
