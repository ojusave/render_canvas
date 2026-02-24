import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const RENDER_API_BASE = 'https://api.render.com/v1';

async function proxyRequest(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
  method: string
) {
  const session = await getSession();
  if (!session.apiKey) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { path } = await context.params;
  const renderPath = path.join('/');
  const url = new URL(`${RENDER_API_BASE}/${renderPath}`);

  // Forward query params
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: HeadersInit = {
    Authorization: `Bearer ${session.apiKey}`,
    Accept: 'application/json',
  };

  const fetchOptions: RequestInit = { method, headers };

  if (method !== 'GET' && method !== 'DELETE') {
    const body = await req.text();
    if (body) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = body;
    }
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
    });
  } catch (error) {
    console.error('Render API proxy error:', error);
    return NextResponse.json(
      { message: 'Failed to reach Render API' },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context, 'GET');
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context, 'POST');
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context, 'PATCH');
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context, 'PUT');
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context, 'DELETE');
}
