'use client';

import { useQuery } from '@tanstack/react-query';
import { renderClient } from '@/lib/render-client';
import type { LogEntry } from '@/types';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/lib/constants';
import { useUIStore } from '@/store/ui-store';

interface RenderLog {
  id: string;
  timestamp: string;
  message: string;
  labels: Array<{ name: string; value: string }>;
}

interface LogsResponse {
  logs: RenderLog[] | null;
  hasMore: boolean;
  nextStartTime: string;
  nextEndTime: string;
}

export type TimeRange = '15m' | '1h' | '6h' | '24h';

const TIME_RANGE_MS: Record<TimeRange, number> = {
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
};

export function useServiceLogs(serviceId: string | null, timeRange: TimeRange = '1h') {
  const workspaceId = useUIStore((s) => s.workspaceId);

  return useQuery({
    queryKey: [...QUERY_KEYS.logs(serviceId || ''), timeRange],
    queryFn: async (): Promise<{ logs: LogEntry[]; hasMore: boolean }> => {
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - TIME_RANGE_MS[timeRange]).toISOString();
      const params = new URLSearchParams({
        resource: serviceId!,
        ownerId: workspaceId!,
        startTime,
        endTime,
        limit: '200',
      });
      const data = await renderClient.get<LogsResponse>(`logs?${params.toString()}`);
      if (!data.logs) return { logs: [], hasMore: false };
      const logs = data.logs.map((log) => {
        const levelLabel = log.labels?.find((l) => l.name === 'level');
        return {
          id: log.id,
          timestamp: log.timestamp,
          message: log.message,
          level: (levelLabel?.value as LogEntry['level']) || undefined,
        };
      });
      return { logs, hasMore: data.hasMore };
    },
    enabled: !!serviceId && !!workspaceId,
    refetchInterval: REFETCH_INTERVALS.logs,
  });
}
