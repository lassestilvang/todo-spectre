'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  onFilterChange: (filters: Record<string, unknown>) => void;
  currentFilters: Record<string, unknown>;
}

export function SearchFilters({ onFilterChange, currentFilters }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, unknown>>(currentFilters);

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    onFilterChange({});
    setIsOpen(false);
  };

  const handleStatusChange = (value: string) => {
    setLocalFilters({ ...localFilters, status: value });
  };

  const handlePriorityChange = (value: number) => {
    setLocalFilters({ ...localFilters, priority: value });
  };

  const handleIncludeListsChange = (checked: boolean) => {
    setLocalFilters({ ...localFilters, include_lists: checked });
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' }
  ];

  const priorityOptions = [
    { value: 0, label: 'All Priorities' },
    { value: 1, label: 'Low' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'High' }
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          {Object.keys(currentFilters).length > 0 ? (
            <>
              Filters <span className="ml-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{Object.keys(currentFilters).length}</span>
            </>
          ) : (
            'Filters'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Search Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select value={localFilters.status || ''} onValueChange={handleStatusChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <Select value={String(localFilters.priority || 0)} onValueChange={(value) => handlePriorityChange(Number(value))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-lists"
                checked={localFilters.include_lists || false}
                onCheckedChange={handleIncludeListsChange}
              />
              <Label htmlFor="include-lists" className="text-sm font-medium">
                Include Lists
              </Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}