'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAllPages } from '@/lib/render-client';
import type { RenderService } from '@/types';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/lib/constants';

export function useRenderServices(ownerId?: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.services, ownerId],
    queryFn: () => {
      if (!ownerId) return Promise.resolve([]);
      return fetchAllPages<RenderService>('services', 'service', ownerId);
    },
    enabled: !!ownerId,
    refetchInterval: REFETCH_INTERVALS.services,
  });
}
