'use client';

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaletteItemProps {
  type: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  collapsed?: boolean;
}

export function PaletteItem({ type, label, icon: Icon, description, collapsed }: PaletteItemProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/rendercanvas', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  if (collapsed) {
    return (
      <div
        draggable
        onDragStart={onDragStart}
        className="flex h-10 w-10 cursor-grab items-center justify-center rounded-lg border border-card-border bg-card-bg text-gray-400 hover:border-gray-500 hover:text-white active:cursor-grabbing transition-colors"
        title={label}
      >
        <Icon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex cursor-grab items-center gap-3 rounded-lg border border-card-border bg-card-bg p-3 hover:border-gray-500 active:cursor-grabbing transition-colors"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-render-blue/10 text-render-blue">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-gray-500 truncate">{description}</p>}
      </div>
    </div>
  );
}
