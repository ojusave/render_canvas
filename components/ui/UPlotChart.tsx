'use client';

import { useRef, useEffect, useCallback } from 'react';
import uPlot from 'uplot';

interface UPlotChartProps {
  data: Array<{ timestamp: string; value: number }>;
  label: string;
  unit: string;
  color: string;
  width: number;
  height: number;
}

export function UPlotChart({ data, label, unit, color, width, height }: UPlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);

  const buildChart = useCallback(() => {
    if (!containerRef.current || data.length === 0) return;

    // Clean up previous instance
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const timestamps = data.map((d) => Math.floor(new Date(d.timestamp).getTime() / 1000));
    const values = data.map((d) => d.value);

    const opts: uPlot.Options = {
      width: Math.max(width, 200),
      height,
      cursor: {
        show: true,
        x: true,
        y: true,
      },
      scales: {
        x: { time: true },
        y: { auto: true },
      },
      axes: [
        {
          stroke: '#6b7280',
          grid: { stroke: '#374151', width: 1 },
          ticks: { stroke: '#374151', width: 1 },
          font: '10px system-ui',
        },
        {
          stroke: '#6b7280',
          grid: { stroke: '#374151', width: 1 },
          ticks: { stroke: '#374151', width: 1 },
          font: '10px system-ui',
          values: (_u: uPlot, vals: number[]) => vals.map((v) => `${v.toFixed(1)}${unit}`),
        },
      ],
      series: [
        {},
        {
          label,
          stroke: color,
          width: 2,
          fill: `${color}20`,
        },
      ],
    };

    const plotData: uPlot.AlignedData = [
      new Float64Array(timestamps),
      new Float64Array(values),
    ];

    chartRef.current = new uPlot(opts, plotData, containerRef.current);
  }, [data, width, height, label, unit, color]);

  useEffect(() => {
    buildChart();
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [buildChart]);

  if (!data || data.length === 0) {
    return (
      <div>
        <p className="text-xs font-medium text-gray-400 mb-1.5">{label}</p>
        <div
          className="flex items-center justify-center rounded-lg border border-card-border bg-gray-800/50"
          style={{ width, height }}
        >
          <p className="text-xs text-gray-500">No data</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 mb-1.5">{label}</p>
      <div
        ref={containerRef}
        className="rounded-lg border border-card-border bg-gray-800/50 overflow-hidden"
      />
    </div>
  );
}
