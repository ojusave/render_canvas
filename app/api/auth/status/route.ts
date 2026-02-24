import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();

  return NextResponse.json({
    authenticated: !!session.apiKey,
    hasWorkspace: !!session.workspaceId,
    workspaceId: session.workspaceId || null,
    workspaceName: session.workspaceName || null,
  });
}
