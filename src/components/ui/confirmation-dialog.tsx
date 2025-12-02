'use client';

import { ReactNode } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './dialog';
import { AlertTriangle, Trash2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  children?: ReactNode;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  children,
}: ConfirmationDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'danger': return <Trash2 className="w-6 h-6 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default: return <AlertCircle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger': return 'destructive';
      case 'warning': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>

        {description && (
          <DialogDescription className="py-4">
            {description}
          </DialogDescription>
        )}

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}