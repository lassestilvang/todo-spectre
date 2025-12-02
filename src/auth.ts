import { NextRequest } from 'next/server';

export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface Session {
  user: User;
}

export async function auth(): Promise<Session | null> {
  // Mock authentication for development
  // In a real app, this would use NextAuth.js or similar
  return {
    user: {
      id: 1, // Default user ID for development
      email: 'user@example.com',
      name: 'Test User'
    }
  };
}

export function getServerSession() {
  return auth();
}