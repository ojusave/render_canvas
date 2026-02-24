'use client';

import { useQuery } from '@tanstack/react-query';
import { renderClient } from '@/lib/render-client';
import type { Deploy } from '@/types';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/lib/constants';

export function useServiceDeploys(serviceId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.deploys(serviceId || ''),
    queryFn: async () => {
      const data = await renderClient.get<Array<{ deploy: Deploy; cursor: string }>>(
        `services/${serviceId}/deploys?limit=20`
      );
      return (data || []).map((item) => item.deploy);
    },
    enabled: !!serviceId,
    refetchInterval: REFETCH_INTERVALS.deploys,
  });
}
