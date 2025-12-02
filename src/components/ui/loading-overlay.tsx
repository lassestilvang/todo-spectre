'use client';

import { motion } from 'framer-motion';
import { LoadingSpinner } from './loading-spinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = 'Loading...' }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1000]"
    >
      <div className="bg-background p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-foreground">{message}</p>
      </div>
    </motion.div>
  );
}