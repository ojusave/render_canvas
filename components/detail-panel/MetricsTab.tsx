'use client';

import { useState, useRef, useEffect } from 'react';
import { useServiceMetrics, type MetricTimeRange } from '@/hooks/use-service-metrics';
import { UPlotChart } from '@/components/ui/UPlotChart';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface MetricsTabProps {
  serviceId: string;
  isDatabase?: boolean;
}

const TIME_RANGES: { value: MetricTimeRange; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
];

export function MetricsTab({ serviceId, isDatabase }: MetricsTabProps) {
  const [timeRange, setTimeRange] = useState<MetricTimeRange>('1h');
  const { data, isLoading } = useServiceMetrics(serviceId, timeRange);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(320);

  // Responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setChartWidth(Math.floor(entry.contentRect.width) - 4);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  const cpuData = (data?.cpu?.[0]?.values || []).map((v: { timestamp: string; value: number }) => ({
    timestamp: v.timestamp,
    value: v.value,
  }));
  const memData = (data?.memory?.[0]?.values || []).map((v: { timestamp: string; value: number }) => ({
    timestamp: v.timestamp,
    value: v.value,
  }));
  const bwData = (data?.bandwidth?.[0]?.values || []).map((v: { timestamp: string; value: number }) => ({
    timestamp: v.timestamp,
    value: v.value,
  }));

  const noData = cpuData.length === 0 && memData.length === 0 && bwData.length === 0;

  if (noData && isDatabase) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-gray-500">No metrics data available for this resource</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-6 p-4">
      {/* Time range selector */}
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

      <UPlotChart
        data={cpuData}
        label="CPU Usage"
        unit="%"
        color="#4351E8"
        width={chartWidth}
        height={120}
      />
      <UPlotChart
        data={memData}
        label="Memory Usage"
        unit="MB"
        color="#59FFA4"
        width={chartWidth}
        height={120}
      />
      {bwData.length > 0 && (
        <UPlotChart
          data={bwData}
          label="Bandwidth"
          unit="KB/s"
          color="#f59e0b"
          width={chartWidth}
          height={120}
        />
      )}
    </div>
  );
}
