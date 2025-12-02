'use client';

import { useTheme } from '@/components/theme-provider';
import { Button } from './button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme, isDarkMode, systemTheme, isSystemDark } = useTheme();

  const getIcon = () => {
    if (theme === 'system') {
      return isSystemDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
    }
    return isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (theme === 'system') {
      return `System (${isSystemDark ? 'Dark' : 'Light'})`;
    }
    return isDarkMode ? 'Dark' : 'Light';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="flex items-center gap-2"
      >
        {getIcon()}
        <span>{getLabel()}</span>
      </Button>
    </motion.div>
  );
}