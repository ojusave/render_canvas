'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { FileCode } from 'lucide-react';
import type { ServiceNodeData } from '@/types';
import { BaseServiceNode } from './BaseServiceNode';

function StaticSiteNodeInner({ data, selected }: NodeProps) {
  const nodeData = data as ServiceNodeData;
  return (
    <BaseServiceNode
      data={nodeData}
      selected={selected}
      icon={<FileCode className="h-4 w-4" />}
      metadata={
        <div className="flex flex-col gap-1 text-xs text-gray-400">
          {nodeData.url && <p className="truncate">{nodeData.url.replace('https://', '')}</p>}
          {(nodeData.publishPath as string | undefined) && (
            <p>Publish: {nodeData.publishPath as string}</p>
          )}
        </div>
      }
    />
  );
}

export const StaticSiteNode = memo(StaticSiteNodeInner);
