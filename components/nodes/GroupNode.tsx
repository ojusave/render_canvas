'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { ChevronDown, ChevronRight, Trash2, GripVertical } from 'lucide-react';
import { useGroupStore } from '@/store/group-store';
import { cn } from '@/lib/utils';
import type { GroupNodeData } from '@/types';

function GroupNodeInner({ id, data }: NodeProps) {
  const groupData = data as unknown as GroupNodeData;
  const toggleCollapsed = useGroupStore((s) => s.toggleCollapsed);
  const deleteGroup = useGroupStore((s) => s.deleteGroup);
  const group = useGroupStore((s) => s.groups[id]);

  const isCollapsed = group?.collapsed ?? groupData.collapsed;
  const label = group?.label ?? groupData.label ?? 'Group';
  const childCount = group?.childNodeIds?.length ?? groupData.childCount ?? 0;
  const isDropTarget = groupData.isDropTarget;

  if (isCollapsed) {
    return (
      <div
        className={cn(
          'rounded-xl border-2 border-dashed bg-gray-800/40 p-3 min-w-[180px] cursor-pointer transition-colors',
          isDropTarget ? 'border-render-blue bg-render-blue/5' : 'border-gray-600/50'
        )}
        style={{ zIndex: -1 }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleCollapsed(id)}
            className="text-gray-400 hover:text-white"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-medium text-gray-300">{label}</span>
          <span className="rounded-full bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400">
            {childCount}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed bg-gray-800/20 min-w-[300px] min-h-[200px] transition-colors',
        isDropTarget ? 'border-render-blue bg-render-blue/5' : 'border-gray-600/50'
      )}
      style={{ zIndex: -1 }}
    >
      {/* Header bar */}
      <div className="group-drag-handle flex items-center justify-between rounded-t-xl bg-gray-800/40 px-3 py-2 cursor-grab">
        <div className="flex items-center gap-2">
          <GripVertical className="h-3 w-3 text-gray-600" />
          <button
            onClick={() => toggleCollapsed(id)}
            className="text-gray-400 hover:text-white"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-medium text-gray-300">{label}</span>
          <span className="rounded-full bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400">
            {childCount}
          </span>
        </div>
        <button
          onClick={() => deleteGroup(id)}
          className="rounded p-1 text-gray-600 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover/header:opacity-100"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      {/* Body — children render inside */}
      <div className="p-4" />
    </div>
  );
}

export const GroupNode = memo(GroupNodeInner);
