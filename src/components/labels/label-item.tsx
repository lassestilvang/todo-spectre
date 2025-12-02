'use client';

import { Label } from '@/types/label-types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit2 } from 'lucide-react';

interface LabelItemProps {
  label: Label;
  isActive?: boolean;
  onSelect: (labelId: number) => void;
  onDelete: (labelId: number) => void;
  onEdit: (label: Label) => void;
}

export function LabelItem({ label, isActive, onSelect, onDelete, onEdit }: LabelItemProps) {
  const handleDelete = async () => {
    try {
      // For now, just call the onDelete callback
      onDelete(label.id);
    } catch (err) {
      console.error('Error deleting label:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete label');
    }
  };

  const handleEdit = () => {
    onEdit(label);
  };

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900/50'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      onClick={() => onSelect(label.id)}
    >
      <div className="flex items-center gap-2 flex-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: label.color || '#6366f1' }}
        />
        <span className="text-sm font-medium truncate">
          {label.icon} {label.name}
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
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}