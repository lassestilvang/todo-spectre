'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { List } from '@/types/list-types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit2 } from 'lucide-react';

interface ListItemProps {
  list: List;
  isActive?: boolean;
  onSelect: (listId: number) => void;
  onDelete: (listId: number) => void;
  onEdit: (list: List) => void;
}

export function ListItem({ list, isActive, onSelect, onDelete, onEdit }: ListItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (list.title === 'Inbox') {
      alert('Cannot delete the Inbox list');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/lists`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: list.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete list');
      }

      onDelete(list.id);
      router.refresh();
    } catch (err) {
      console.error('Error deleting list:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete list');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    onEdit(list);
  };

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900/50'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      onClick={() => onSelect(list.id)}
    >
      <div className="flex items-center gap-2 flex-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: list.color || '#6366f1' }}
        />
        <span className="text-sm font-medium truncate">
          {list.icon} {list.title}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          {list.title !== 'Inbox' && (
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}