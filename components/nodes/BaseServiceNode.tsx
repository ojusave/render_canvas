'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ExternalLink } from 'lucide-react';
import type { ServiceNodeData } from '@/types';
import { SERVICE_TYPE_CONFIG, STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface BaseServiceNodeProps {
  data: ServiceNodeData;
  selected?: boolean;
  icon?: React.ReactNode;
  metadata?: React.ReactNode;
  width?: number;
}

function BaseServiceNodeInner({ data, selected, icon, metadata, width = 240 }: BaseServiceNodeProps) {
  const config = SERVICE_TYPE_CONFIG[data.type];
  const Icon = config?.icon;
  const statusColors = STATUS_COLORS[data.status];

  const isError = ['failed', 'build_failed', 'update_failed', 'pre_deploy_failed', 'unavailable'].includes(data.status);
  const isDeploying = ['building', 'deploying', 'build_in_progress', 'update_in_progress', 'pre_deploy_in_progress', 'creating', 'created'].includes(data.status);
  const isSuspended = data.status === 'suspended';

  const accentColor = isError ? 'border-l-red-500' : isDeploying ? 'border-l-blue-500' : isSuspended ? 'border-l-amber-500' : 'border-l-transparent';

  return (
    <div
      className={cn(
        'rounded-xl border bg-card-bg shadow-lg transition-all duration-200 border-l-[3px]',
        selected ? 'border-render-blue ring-2 ring-render-blue/20' : 'border-card-border',
        accentColor,
      )}
      style={{ width }}
    >
      {/* Target handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-500 !border-2 !border-card-bg hover:!bg-render-blue transition-colors"
      />

      {/* Header */}
      <div className="flex items-start gap-3 p-3 pb-2">
        <div className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          data.isDatabase ? 'bg-render-green/10 text-render-green' : 'bg-render-blue/10 text-render-blue'
        )}>
          {icon || (Icon && <Icon className="h-4 w-4" />)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-white">{data.name}</h3>
            {data.dashboardUrl && (
              <a
                href={data.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <p className="text-xs text-gray-500">{config?.label || data.type}</p>
        </div>
      </div>

      {/* Status */}
      <div className="px-3 pb-2">
        <StatusBadge status={data.status} />
      </div>

      {/* Failure reason */}
      {isError && data.failureReason && (
        <div className="mx-3 mb-2 rounded-md bg-red-500/10 px-2 py-1.5">
          <p className="text-xs text-red-400 line-clamp-2">{data.failureReason}</p>
        </div>
      )}

      {/* Type-specific metadata */}
      {metadata && (
        <div className="border-t border-card-border px-3 py-2">
          {metadata}
        </div>
      )}

      {/* Source handle at bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-gray-500 !border-2 !border-card-bg hover:!bg-render-blue transition-colors"
      />
    </div>
  );
}

export const BaseServiceNode = memo(BaseServiceNodeInner);
