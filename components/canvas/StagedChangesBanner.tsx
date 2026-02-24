'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStagedChangesStore } from '@/store/staged-changes-store';

export function StagedChangesBanner() {
  const changes = useStagedChangesStore((s) => s.changes);
  const clearAll = useStagedChangesStore((s) => s.clearAll);
  const openReviewDialog = useStagedChangesStore((s) => s.openReviewDialog);

  if (changes.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 shadow-lg backdrop-blur-sm"
      >
        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
        <span className="text-sm text-amber-200 font-medium">
          {changes.length} pending change{changes.length !== 1 ? 's' : ''}
        </span>
        <Button size="sm" onClick={openReviewDialog}>
          Review & Deploy
        </Button>
        <button
          onClick={clearAll}
          className="rounded p-1 text-amber-400/60 hover:text-amber-300 transition-colors"
          title="Discard all changes"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
