'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ListItem } from './list-item';
import { CreateListForm } from './create-list-form';
import { EditListForm } from './edit-list-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { List } from '@/types/list-types';

export function ListManagement() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/lists');
      if (!response.ok) {
        throw new Error('Failed to fetch lists');
      }
      const data = await response.json();
      setLists(data);

      // Set active list to first list or create default if empty
      if (data.length > 0) {
        setActiveListId(data[0].id);
      } else {
        // Create default Inbox list if none exists
        await createDefaultList();
      }
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError(err instanceof Error ? err.message : 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultList = async () => {
    try {
      const response = await fetch('/api/lists/default');
      if (!response.ok) {
        throw new Error('Failed to create default list');
      }
      const defaultList = await response.json();
      setLists([defaultList]);
      setActiveListId(defaultList.id);
    } catch (err) {
      console.error('Error creating default list:', err);
      setError(err instanceof Error ? err.message : 'Failed to create default list');
    }
  };

  const handleListCreated = (newList: List) => {
    setLists([...lists, newList]);
    setActiveListId(newList.id);
  };

  const handleListUpdated = (updatedList: List) => {
    setLists(lists.map(list =>
      list.id === updatedList.id ? updatedList : list
    ));
    setEditingList(null);
  };

  const handleListDeleted = (deletedListId: number) => {
    setLists(lists.filter(list => list.id !== deletedListId));
    if (activeListId === deletedListId && lists.length > 1) {
      // If deleted list was active, select the first remaining list
      setActiveListId(lists[0].id);
    }
  };

  const handleListSelect = (listId: number) => {
    setActiveListId(listId);
    // In a real app, you would navigate to the list view
    // router.push(`/lists/${listId}`);
  };

  const handleEditList = (list: List) => {
    setEditingList(list);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Lists</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-500">Loading lists...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchLists} variant="outline" size="sm" className="ml-2">
            Retry
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {lists.map((list) => (
            <ListItem
              key={list.id}
              list={list}
              isActive={activeListId === list.id}
              onSelect={handleListSelect}
              onDelete={handleListDeleted}
              onEdit={handleEditList}
            />
          ))}
        </div>
      )}

      <div className="p-4 border-t">
        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New List
        </Button>
      </div>

      <CreateListForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onListCreated={handleListCreated}
      />

      <EditListForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        list={editingList}
        onListUpdated={handleListUpdated}
      />
    </div>
  );
}