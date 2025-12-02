'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/types/label-types';

interface CreateLabelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onLabelCreated: (label: Label) => void;
}

export function CreateLabelForm({ isOpen, onClose, onLabelCreated }: CreateLabelFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1'); // Default indigo color
  const [icon, setIcon] = useState('🏷️');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // For now, create a mock label - will implement API later
      const mockLabel: Label = {
        id: Math.floor(Math.random() * 10000),
        user_id: 1,
        name,
        color,
        icon,
        created_at: new Date(),
        updated_at: new Date()
      };

      onLabelCreated(mockLabel);
      onClose();
      router.refresh();

    } catch (err) {
      console.error('Error creating label:', err);
      setError(err instanceof Error ? err.message : 'Failed to create label');
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
    '🏷️', '⭐', '⚡', '🔥', '💡', '🚀', '🎯', '📌', '📍', '🔖',
    '💼', '🏠', '🛒', '📚', '🎨', '💻', '📱', '📧', '📅', '🎵'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Label</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Label Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work, Personal, Important"
              required
              minLength={2}
              maxLength={50}
            />
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
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Creating...' : 'Create Label'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}