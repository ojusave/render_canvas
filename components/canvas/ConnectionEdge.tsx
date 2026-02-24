'use client';

import { memo } from 'react';
import {
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from '@xyflow/react';
import type { ConnectionEdgeData } from '@/types';
import { EDGE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

function ConnectionEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as ConnectionEdgeData | undefined;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const connType = edgeData?.connectionType || 'unknown';
  const healthy = edgeData?.healthy !== false;
  const color = healthy ? (EDGE_COLORS[connType] || EDGE_COLORS.unknown) : '#ef4444';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: healthy ? '8 4' : '6 4',
          animation: healthy ? 'flow-dots 1.5s linear infinite' : undefined,
          opacity: healthy ? 1 : 0.6,
        }}
      />

      {edgeData?.envVarKey && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              'absolute rounded-md px-2 py-0.5 text-[10px] font-mono pointer-events-all',
              selected ? 'bg-render-blue/20 text-render-blue' : 'bg-gray-800/90 text-gray-400'
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {edgeData.envVarKey}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const ConnectionEdge = memo(ConnectionEdgeInner);
