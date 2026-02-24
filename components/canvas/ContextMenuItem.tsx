'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextMenuItemProps {
  icon?: LucideIcon;
  label: string;
  shortcut?: string;
  danger?: boolean;
  onClick: () => void;
}

export function ContextMenuItem({ icon: Icon, label, shortcut, danger, onClick }: ContextMenuItemProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      )}
      onClick={onClick}
    >
      {Icon && <Icon className={cn('h-3.5 w-3.5 shrink-0', danger ? 'text-red-400' : 'text-gray-500')} />}
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-[10px] text-gray-600">{shortcut}</span>
      )}
    </button>
  );
}

export function ContextMenuSeparator() {
  return <div className="mx-2 my-1 border-t border-card-border" />;
}
