import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'google';

    // In production, redirect to the provider's OAuth consent screen.
    // For this scaffold, return a mock authorization URL.
    const redirectUri = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/calendar/callback?provider=${provider}&userId=${session.user.id}`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID || 'mock-client-id'}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly')}&access_type=offline&prompt=consent`;

    return NextResponse.json({ provider, authUrl });
  } catch (error) {
    console.error('Error initiating calendar connect:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
