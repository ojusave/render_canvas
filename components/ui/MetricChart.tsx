'use client';

import { useMemo } from 'react';
import type { Metric } from '@/types';

interface MetricChartProps {
  data: Metric[];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
  unit?: string;
}

export function MetricChart({ data, width = 300, height = 80, color = '#4351E8', label, unit }: MetricChartProps) {
  const { path, areaPath, max, latest } = useMemo(() => {
    if (!data || data.length === 0) return { path: '', areaPath: '', max: 0, latest: 0 };

    const values = data.map((d) => d.value);
    const maxVal = Math.max(...values, 1);
    const padding = 2;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;

    const points = values.map((v, i) => ({
      x: padding + (i / Math.max(values.length - 1, 1)) * usableWidth,
      y: padding + usableHeight - (v / maxVal) * usableHeight,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const area = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { path: linePath, areaPath: area, max: maxVal, latest: values[values.length - 1] };
  }, [data, width, height]);

  const gradientId = `metric-gradient-${label?.replace(/\s/g, '') || 'default'}`;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-card-border bg-gray-800/50" style={{ width, height }}>
        <p className="text-xs text-gray-500">No data</p>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400">{label}</p>
          <p className="text-xs text-gray-500">
            {latest.toFixed(1)}{unit ? ` ${unit}` : ''}
          </p>
        </div>
      )}
      <svg width={width} height={height} className="rounded-lg border border-card-border bg-gray-800/50">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
