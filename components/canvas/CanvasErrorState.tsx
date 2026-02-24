'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Authentication expired. Please reconnect your API key.',
  403: 'Access denied. Check your API key permissions.',
  429: 'Rate limited. Please wait a moment and retry.',
  500: 'Render API is experiencing issues.',
  503: 'Render API is temporarily unavailable.',
};

interface CanvasErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export function CanvasErrorState({ error, onRetry }: CanvasErrorStateProps) {
  const status = (error as { status?: number }).status;
  const message = (status && ERROR_MESSAGES[status]) || error.message || 'Failed to load services.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full text-center px-8"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 mb-5">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-400 max-w-md mb-6">{message}</p>
      <Button onClick={onRetry} variant="secondary" size="md">
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </motion.div>
  );
}
