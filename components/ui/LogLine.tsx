'use client';

import { cn } from '@/lib/utils';

interface LogLineProps {
  timestamp: string;
  message: string;
  level?: 'info' | 'warn' | 'error';
  highlight?: string;
}

const levelColors = {
  info: 'text-gray-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
};

export function LogLine({ timestamp, message, level = 'info', highlight }: LogLineProps) {
  const time = new Date(timestamp).toLocaleTimeString();

  const renderMessage = () => {
    if (!highlight) return message;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = message.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-500/30 text-amber-200 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex gap-3 font-mono text-xs leading-5 hover:bg-gray-800/50">
      <span className="shrink-0 text-gray-600 select-none">{time}</span>
      <span className={cn('break-all', levelColors[level])}>{renderMessage()}</span>
    </div>
  );
}
