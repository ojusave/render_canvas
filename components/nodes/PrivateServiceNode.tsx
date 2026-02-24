'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Lock } from 'lucide-react';
import type { ServiceNodeData } from '@/types';
import { BaseServiceNode } from './BaseServiceNode';

function PrivateServiceNodeInner({ data, selected }: NodeProps) {
  const nodeData = data as ServiceNodeData;
  return (
    <BaseServiceNode
      data={nodeData}
      selected={selected}
      icon={<Lock className="h-4 w-4" />}
      metadata={
        <div className="flex flex-col gap-1 text-xs text-gray-400">
          {nodeData.runtime && <p>Runtime: {nodeData.runtime}</p>}
          {nodeData.region && <p>Region: {nodeData.region}</p>}
          {(nodeData.openPorts as Array<{ port: number; protocol: string }> | undefined) && (
            <p>
              Ports:{' '}
              {(nodeData.openPorts as Array<{ port: number; protocol: string }>)
                .map((p) => `${p.port}/${p.protocol}`)
                .join(', ')}
            </p>
          )}
        </div>
      }
    />
  );
}

export const PrivateServiceNode = memo(PrivateServiceNodeInner);
