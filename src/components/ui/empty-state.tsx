'use client';

import { ReactNode } from 'react';
import { Button } from './button';
import { motion } from 'framer-motion';
import { File, Plus, Search, Inbox, Calendar, List } from 'lucide-react';

type EmptyStateType = 'tasks' | 'lists' | 'search' | 'inbox' | 'calendar' | 'custom';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export function EmptyState({
  type = 'tasks',
  title,
  description,
  actionButton,
  className,
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'tasks':
        return {
          icon: <List className="w-12 h-12 text-muted-foreground" />,
          title: 'No tasks found',
          description: 'Create your first task to get started',
        };
      case 'lists':
        return {
          icon: <Inbox className="w-12 h-12 text-muted-foreground" />,
          title: 'No lists found',
          description: 'Create your first list to organize your tasks',
        };
      case 'search':
        return {
          icon: <Search className="w-12 h-12 text-muted-foreground" />,
          title: 'No results found',
          description: 'Try adjusting your search criteria',
        };
      case 'inbox':
        return {
          icon: <Inbox className="w-12 h-12 text-muted-foreground" />,
          title: 'Your inbox is empty',
          description: 'All caught up! Add new tasks as they come in',
        };
      case 'calendar':
        return {
          icon: <Calendar className="w-12 h-12 text-muted-foreground" />,
          title: 'No events scheduled',
          description: 'Add tasks with due dates to see them here',
        };
      default:
        return {
          icon: <File className="w-12 h-12 text-muted-foreground" />,
          title: 'Nothing to show',
          description: 'Create content to get started',
        };
    }
  };

  const { icon, title: defaultTitle, description: defaultDescription } = getDefaultContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      <div className="mb-4">
        {icon}
      </div>

      <h3 className="text-lg font-medium mb-2">
        {title || defaultTitle}
      </h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {description || defaultDescription}
      </p>

      {actionButton && (
        <Button
          onClick={actionButton.onClick}
          className="flex items-center gap-2"
        >
          {actionButton.icon && <span className="mr-1">{actionButton.icon}</span>}
          {actionButton.text}
        </Button>
      )}
    </motion.div>
  );
}