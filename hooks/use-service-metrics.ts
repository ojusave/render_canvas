'use client';

import { useQuery } from '@tanstack/react-query';
import { renderClient } from '@/lib/render-client';
import type { MetricResponse } from '@/types';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/lib/constants';

export type MetricTimeRange = '1h' | '6h' | '24h' | '7d';

export function useServiceMetrics(serviceId: string | null, timeRange: MetricTimeRange = '1h') {
  return useQuery({
    queryKey: [...QUERY_KEYS.metrics(serviceId || ''), timeRange],
    queryFn: async () => {
      const [cpu, memory, bandwidth] = await Promise.all([
        renderClient.get<MetricResponse[]>(`metrics/cpu?resource=${serviceId}`).catch(() => []),
        renderClient.get<MetricResponse[]>(`metrics/memory?resource=${serviceId}`).catch(() => []),
        renderClient.get<MetricResponse[]>(`metrics/bandwidth?resource=${serviceId}`).catch(() => []),
      ]);
      return { cpu: cpu || [], memory: memory || [], bandwidth: bandwidth || [] };
    },
    enabled: !!serviceId,
    refetchInterval: REFETCH_INTERVALS.metrics,
  });
}
