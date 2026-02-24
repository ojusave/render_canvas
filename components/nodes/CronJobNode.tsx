'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import type { ServiceNodeData } from '@/types';
import { BaseServiceNode } from './BaseServiceNode';

function CronJobNodeInner({ data, selected }: NodeProps) {
  const nodeData = data as ServiceNodeData;
  return (
    <BaseServiceNode
      data={nodeData}
      selected={selected}
      icon={<Clock className="h-4 w-4" />}
      metadata={
        <div className="flex flex-col gap-1 text-xs text-gray-400">
          {nodeData.schedule && <p>Schedule: {nodeData.schedule}</p>}
          {nodeData.runtime && <p>Runtime: {nodeData.runtime}</p>}
          {nodeData.region && <p>Region: {nodeData.region}</p>}
        </div>
      }
    />
  );
}

export const CronJobNode = memo(CronJobNodeInner);
