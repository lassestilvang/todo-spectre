'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastFeedbackProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function ToastFeedback({
  message,
  type = 'info',
  duration = 3000,
  onClose
}: ToastFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          icon: <AlertCircle className="w-5 h-5" />
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          text: 'text-black',
          icon: <AlertCircle className="w-5 h-5" />
        };
      default: // info
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          icon: <Info className="w-5 h-5" />
        };
    }
  };

  const styles = getToastStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`${styles.bg} ${styles.text} p-4 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`}
        >
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              if (onClose) onClose();
            }}
            className="text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close toast"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}