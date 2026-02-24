'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import type { Owner } from '@/types';

interface AuthStatus {
  authenticated: boolean;
  hasWorkspace: boolean;
  workspaceId: string | null;
  workspaceName: string | null;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const status = useQuery({
    queryKey: QUERY_KEYS.auth,
    queryFn: async (): Promise<AuthStatus> => {
      const res = await fetch('/api/auth/status');
      return res.json();
    },
  });

  const login = useMutation({
    mutationFn: async (apiKey: string): Promise<{ authenticated: boolean; owners: Owner[] }> => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Authentication failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth });
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services });
    },
  });

  return {
    isAuthenticated: status.data?.authenticated ?? false,
    hasWorkspace: status.data?.hasWorkspace ?? false,
    workspaceId: status.data?.workspaceId ?? null,
    workspaceName: status.data?.workspaceName ?? null,
    isLoading: status.isLoading,
    login,
    logout,
  };
}
