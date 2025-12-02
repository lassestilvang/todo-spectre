'use client';

import { ReactNode } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FormValidationProps {
  errors: Record<string, string>;
  className?: string;
}

export function FormValidation({ errors, className }: FormValidationProps) {
  if (Object.keys(errors).length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
      className={`space-y-2 p-3 bg-destructive/10 rounded-md ${className}`}
    >
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="w-4 h-4" />
        <span className="font-medium">Please fix the following errors:</span>
      </div>

      <ul className="space-y-1 text-sm text-destructive">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field} className="flex items-center gap-2">
            <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span>
            <span>{message}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

interface FormFieldProps {
  children: ReactNode;
  error?: string;
  className?: string;
}

export function FormField({ children, error, className }: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

interface FormSuccessProps {
  message: string;
  className?: string;
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-2 p-3 bg-success/10 rounded-md text-success ${className}`}
    >
      <CheckCircle className="w-4 h-4" />
      <span>{message}</span>
    </motion.div>
  );
}