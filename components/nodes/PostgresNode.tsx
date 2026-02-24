'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Database } from 'lucide-react';
import type { ServiceNodeData } from '@/types';
import { BaseServiceNode } from './BaseServiceNode';

function PostgresNodeInner({ data, selected }: NodeProps) {
  const nodeData = data as ServiceNodeData;
  return (
    <BaseServiceNode
      data={nodeData}
      selected={selected}
      icon={<Database className="h-4 w-4" />}
      width={220}
      metadata={
        <div className="flex flex-col gap-1 text-xs text-gray-400">
          {nodeData.plan && <p>Plan: {nodeData.plan}</p>}
          {(nodeData.version as string | undefined) && (
            <p>Version: {nodeData.version as string}</p>
          )}
          {nodeData.region && <p>Region: {nodeData.region}</p>}
        </div>
      }
    />
  );
}

export const PostgresNode = memo(PostgresNodeInner);
