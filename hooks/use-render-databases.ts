'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAllPages } from '@/lib/render-client';
import type { RenderPostgres, RenderKeyValue } from '@/types';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/lib/constants';

export function useRenderDatabases(ownerId?: string | null) {
  const postgres = useQuery({
    queryKey: [...QUERY_KEYS.postgres, ownerId],
    queryFn: () => {
      if (!ownerId) return Promise.resolve([]);
      return fetchAllPages<RenderPostgres>('postgres', 'postgres', ownerId);
    },
    enabled: !!ownerId,
    refetchInterval: REFETCH_INTERVALS.services,
  });

  const keyValue = useQuery({
    queryKey: [...QUERY_KEYS.keyValue, ownerId],
    queryFn: () => {
      if (!ownerId) return Promise.resolve([]);
      return fetchAllPages<RenderKeyValue>('key-value', 'keyValue', ownerId);
    },
    enabled: !!ownerId,
    refetchInterval: REFETCH_INTERVALS.services,
  });

  return {
    postgres: postgres.data || [],
    keyValues: keyValue.data || [],
    isLoading: postgres.isLoading || keyValue.isLoading,
    isError: postgres.isError || keyValue.isError,
    error: postgres.error || keyValue.error,
    refetch: () => { postgres.refetch(); keyValue.refetch(); },
  };
}
