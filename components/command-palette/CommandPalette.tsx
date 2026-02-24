'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { fuzzyFilter } from '@/lib/fuzzy-match';
import type { CommandItem } from '@/hooks/use-command-palette';
import { CommandGroup } from './CommandGroup';
import { CommandItemRow } from './CommandItem';

interface CommandPaletteProps {
  items: CommandItem[];
}

export function CommandPalette({ items }: CommandPaletteProps) {
  const isOpen = useUIStore((s) => s.commandPaletteOpen);
  const close = useUIStore((s) => s.closeCommandPalette);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => fuzzyFilter(items, query, (item) => `${item.label} ${item.description || ''}`),
    [items, query]
  );

  // Group items while maintaining flat index
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const group = map.get(item.group) || [];
      group.push(item);
      map.set(item.group, group);
    }
    return map;
  }, [filtered]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const executeItem = useCallback(
    (item: CommandItem) => {
      item.action();
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(filtered.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % Math.max(filtered.length, 1));
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        executeItem(filtered[activeIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    },
    [filtered, activeIndex, executeItem, close]
  );

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] bg-gray-900/60"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-lg rounded-xl border border-card-border bg-card-bg shadow-2xl overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-card-border px-4 py-3">
            <Search className="h-4 w-4 text-gray-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
            />
            <kbd className="shrink-0 rounded border border-card-border bg-gray-800 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">No results found</p>
            ) : (
              Array.from(groups.entries()).map(([groupLabel, groupItems]) => (
                <div key={groupLabel}>
                  <CommandGroup label={groupLabel} />
                  {groupItems.map((item) => {
                    const idx = flatIndex++;
                    return (
                      <div key={item.id} data-index={idx} className="px-2">
                        <CommandItemRow
                          icon={item.icon}
                          label={item.label}
                          description={item.description}
                          shortcut={item.shortcut}
                          active={idx === activeIndex}
                          onClick={() => executeItem(item)}
                        />
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
