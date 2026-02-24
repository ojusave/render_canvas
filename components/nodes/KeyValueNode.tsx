'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { HardDrive } from 'lucide-react';
import type { ServiceNodeData } from '@/types';
import { BaseServiceNode } from './BaseServiceNode';

function KeyValueNodeInner({ data, selected }: NodeProps) {
  const nodeData = data as ServiceNodeData;
  return (
    <BaseServiceNode
      data={nodeData}
      selected={selected}
      icon={<HardDrive className="h-4 w-4" />}
      width={220}
      metadata={
        <div className="flex flex-col gap-1 text-xs text-gray-400">
          {nodeData.plan && <p>Plan: {nodeData.plan}</p>}
          {nodeData.region && <p>Region: {nodeData.region}</p>}
        </div>
      }
    />
  );
}

export const KeyValueNode = memo(KeyValueNodeInner);
