'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useServiceLogs, type TimeRange } from '@/hooks/use-service-logs';
import { LogLine } from '@/components/ui/LogLine';
import { Spinner } from '@/components/ui/Spinner';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogsTabProps {
  serviceId: string;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
];

const LEVEL_FILTERS: { value: string; label: string; color: string; activeColor: string }[] = [
  { value: 'info', label: 'Info', color: 'border-gray-600 text-gray-400', activeColor: 'border-gray-400 bg-gray-400/10 text-gray-300' },
  { value: 'warn', label: 'Warn', color: 'border-amber-600/50 text-amber-500/70', activeColor: 'border-amber-500 bg-amber-500/10 text-amber-400' },
  { value: 'error', label: 'Error', color: 'border-red-600/50 text-red-500/70', activeColor: 'border-red-500 bg-red-500/10 text-red-400' },
];

export function LogsTab({ serviceId }: LogsTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [levelFilters, setLevelFilters] = useState<Set<string>>(new Set(['info', 'warn', 'error']));
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  const { data, isLoading } = useServiceLogs(serviceId, timeRange);
  const logs = data?.logs || [];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!levelFilters.has(log.level || 'info')) return false;
      if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [logs, levelFilters, search]);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredLogs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20,
    overscan: 20,
  });

  useEffect(() => {
    if (autoScroll && parentRef.current) {
      parentRef.current.scrollTop = parentRef.current.scrollHeight;
    }
  }, [filteredLogs.length, autoScroll]);

  const handleScroll = () => {
    if (!parentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  const toggleLevel = (level: string) => {
    setLevelFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="p-3 border-b border-card-border space-y-2">
        {/* Time range pills */}
        <div className="flex items-center gap-1">
          {TIME_RANGES.map((tr) => (
            <button
              key={tr.value}
              onClick={() => setTimeRange(tr.value)}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                timeRange === tr.value
                  ? 'bg-render-blue text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              {tr.label}
            </button>
          ))}
        </div>

        {/* Level filter chips */}
        <div className="flex items-center gap-1.5">
          {LEVEL_FILTERS.map((lf) => (
            <button
              key={lf.value}
              onClick={() => toggleLevel(lf.value)}
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
                levelFilters.has(lf.value) ? lf.activeColor : lf.color
              )}
            >
              {lf.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg py-1.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:border-render-blue focus:outline-none"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      <div
        ref={parentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3"
      >
        {filteredLogs.length > 0 ? (
          <div
            style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const log = filteredLogs[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                >
                  <LogLine
                    timestamp={log.timestamp}
                    message={log.message}
                    level={log.level}
                    highlight={search || undefined}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && (
            <p className="text-center text-xs text-gray-500 py-8">No logs available</p>
          )
        )}
      </div>
    </div>
  );
}
