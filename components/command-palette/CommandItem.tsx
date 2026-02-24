'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItemProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  shortcut?: string;
  active: boolean;
  onClick: () => void;
}

export function CommandItemRow({ icon: Icon, label, description, shortcut, active, onClick }: CommandItemProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
        active ? 'bg-render-blue/10 text-white' : 'text-gray-300 hover:bg-gray-800'
      )}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      {Icon && <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-render-blue' : 'text-gray-500')} />}
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{label}</p>
        {description && <p className="text-xs text-gray-500 truncate">{description}</p>}
      </div>
      {shortcut && (
        <kbd className="shrink-0 rounded border border-card-border bg-card-bg px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
