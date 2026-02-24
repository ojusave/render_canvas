'use client';

import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ content, children, className, position = 'top' }: TooltipProps) {
  return (
    <div className={cn('group relative inline-flex', className)}>
      {children}
      <div
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-gray-700 px-2.5 py-1.5 text-xs text-white shadow-lg',
          'opacity-0 transition-opacity group-hover:opacity-100',
          positionStyles[position]
        )}
      >
        {content}
      </div>
    </div>
  );
}
