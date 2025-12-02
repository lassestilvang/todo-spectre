'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { List } from '@/types/list-types';

interface EditListFormProps {
  isOpen: boolean;
  onClose: () => void;
  list: List | null;
  onListUpdated: (updatedList: List) => void;
}

export function EditListForm({ isOpen, onClose, list, onListUpdated }: EditListFormProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('📋');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (list) {
      setTitle(list.title);
      setColor(list.color || '#6366f1');
      setIcon(list.icon || '📋');
    }
  }, [list]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!list) return;

    try {
      const response = await fetch(`/api/lists`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: list.id,
          title,
          color,
          icon
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update list');
      }

      const updatedList = await response.json();
      onListUpdated(updatedList);
      onClose();
      router.refresh();

    } catch (err) {
      console.error('Error updating list:', err);
      setError(err instanceof Error ? err.message : 'Failed to update list');
    } finally {
      setIsLoading(false);
    }
  };

  const colorOptions = [
    { value: '#6366f1', label: 'Indigo' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#10b981', label: 'Emerald' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#ef4444', label: 'Red' },
    { value: '#14b8a6', label: 'Teal' },
  ];

  const iconOptions = [
    '📋', '📝', '📥', '📦', '🗂️', '📁', '📂', '🗃️', '🗄️', '🗑️',
    '🎯', '⭐', '⚡', '🔥', '💡', '🚀', '🎨', '📊', '📈', '🎵'
  ];

  if (!list) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              List Name
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Work, Personal, Shopping"
              required
              minLength={2}
              maxLength={50}
              disabled={list.title === 'Inbox'}
            />
            {list.title === 'Inbox' && (
              <p className="text-xs text-gray-500">Inbox list cannot be renamed</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-8 h-8 rounded-full ${color === option.value ? 'ring-2 ring-white ring-offset-2' : ''}`}
                  style={{ backgroundColor: option.value }}
                  onClick={() => setColor(option.value)}
                  aria-label={`Select ${option.label} color`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Icon</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((iconOption) => (
                <button
                  key={iconOption}
                  type="button"
                  className={`w-8 h-8 flex items-center justify-center rounded ${icon === iconOption ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setIcon(iconOption)}
                  aria-label={`Select ${iconOption} icon`}
                >
                  <span className="text-lg">{iconOption}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? 'Updating...' : 'Update List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}