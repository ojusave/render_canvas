import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionData } from '@/types';

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'fallback-secret-must-be-at-least-32-chars-long!',
  cookieName: 'render-canvas-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
