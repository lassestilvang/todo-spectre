'use client';

import { useState } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface UseConfirmationOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function useConfirmation() {
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    options: UseConfirmationOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (options: UseConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmationState({
        isOpen: true,
        options,
        resolve,
      });
    });
  };

  const handleClose = () => {
    if (confirmationState) {
      confirmationState.resolve(false);
      setConfirmationState(null);
    }
  };

  const handleConfirm = () => {
    if (confirmationState) {
      confirmationState.resolve(true);
      setConfirmationState(null);
    }
  };

  const ConfirmationComponent = () => {
    if (!confirmationState) return null;

    return (
      <ConfirmationDialog
        isOpen={confirmationState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={confirmationState.options.title}
        description={confirmationState.options.description}
        confirmText={confirmationState.options.confirmText}
        cancelText={confirmationState.options.cancelText}
        type={confirmationState.options.type}
      />
    );
  };

  return { confirm, ConfirmationComponent };
}