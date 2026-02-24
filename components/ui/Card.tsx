'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, selected, hoverable = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card-bg',
        selected ? 'border-render-blue' : 'border-card-border',
        hoverable && 'cursor-pointer transition-colors hover:border-gray-500',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
