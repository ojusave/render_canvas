import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, workspaceId, workspaceName } = body;

    const session = await getSession();

    // Handle workspace selection (session already has API key)
    if (workspaceId && session.apiKey) {
      session.workspaceId = workspaceId;
      session.workspaceName = workspaceName || session.workspaceName;
      await session.save();
      return NextResponse.json({ authenticated: true });
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ message: 'API key is required' }, { status: 400 });
    }

    // Strip "Bearer " prefix if user included it, and trim whitespace
    const trimmedKey = apiKey.trim().replace(/^Bearer\s+/i, '');

    // Validate the API key by fetching owners
    const response = await fetch('https://api.render.com/v1/owners?limit=100', {
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Render API error:', response.status, errorBody);
      return NextResponse.json(
        { message: 'Invalid API key' },
        { status: 401 }
      );
    }

    const owners = await response.json();

    // Store in session
    session.apiKey = trimmedKey;

    // Only auto-select workspace if there's exactly one
    if (owners.length === 1) {
      const owner = owners[0].owner;
      session.workspaceId = owner.id;
      session.workspaceName = owner.name;
    }

    await session.save();

    return NextResponse.json({
      authenticated: true,
      owners: owners.map((o: { owner: { id: string; name: string; email: string; type: string } }) => o.owner),
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
