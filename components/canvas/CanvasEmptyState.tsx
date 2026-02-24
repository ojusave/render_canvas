'use client';

import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/ui-store';

export function CanvasEmptyState() {
  const openCommandPalette = () => useUIStore.getState().openCommandPalette();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center h-full text-center px-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-render-blue/10 mb-6"
      >
        <Layers className="h-8 w-8 text-render-blue" />
      </motion.div>
      <h2 className="text-lg font-semibold text-white mb-2">Your workspace is empty</h2>
      <p className="text-sm text-gray-400 max-w-md mb-6">
        Drag a service from the sidebar or press{' '}
        <kbd className="inline-flex items-center gap-0.5 rounded border border-card-border bg-card-bg px-1.5 py-0.5 text-xs font-mono text-gray-300">
          Cmd+K
        </kbd>{' '}
        to get started.
      </p>
      <Button onClick={openCommandPalette} size="md">
        Open Command Palette
      </Button>
    </motion.div>
  );
}
