'use client';

export class RenderApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'RenderApiError';
    this.status = status;
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/render/${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    if (res.status === 401) {
      // API key was revoked or session expired — clear session and redirect to login
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      window.location.href = '/';
      throw new RenderApiError('API key is invalid or expired. Redirecting to login...', 401);
    }
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new RenderApiError(error.message || `API error ${res.status}`, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchAllPages<T>(endpoint: string, resourceKey: string, ownerId?: string): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ limit: '100' });
    if (ownerId) params.set('ownerId', ownerId);
    if (cursor) params.set('cursor', cursor);

    const data = await fetchApi<Array<{ cursor: string } & Record<string, T>>>(
      `${endpoint}?${params.toString()}`
    );

    if (!Array.isArray(data) || data.length === 0) break;

    for (const item of data) {
      if (item[resourceKey]) {
        items.push(item[resourceKey] as T);
      }
      cursor = item.cursor;
    }

    if (data.length < 100) break;
  } while (cursor);

  return items;
}

export const renderClient = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    fetchApi<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: unknown) =>
    fetchApi<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) =>
    fetchApi<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'DELETE' }),
  fetchAllPages,
};
