'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { List } from '@/types/list-types';
import { View } from '@/types/view-types';
import { Label } from '@/types/label-types';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Plus, Menu, X, Tag, List as ListIcon, Calendar, CheckSquare, Eye, EyeOff, Search } from 'lucide-react';
import { CreateListForm } from '@/components/lists/create-list-form';
import { CreateLabelForm } from '@/components/labels/create-label-form';
import { SearchModal } from '@/components/search/search-modal';
import { useSearch } from '@/context/search-context';

export function TaskSidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lists state
  const [lists, setLists] = useState<List[]>([]);
  const [isCreateListDialogOpen, setIsCreateListDialogOpen] = useState(false);

  // Views state
  const [views, setViews] = useState<View[]>([
    { id: 1, user_id: 1, name: 'Today', type: 'day', show_completed: false, created_at: new Date(), updated_at: new Date() },
    { id: 2, user_id: 1, name: 'Next 7 Days', type: 'week', show_completed: false, created_at: new Date(), updated_at: new Date() },
    { id: 3, user_id: 1, name: 'Upcoming', type: 'month', show_completed: false, created_at: new Date(), updated_at: new Date() },
    { id: 4, user_id: 1, name: 'All Tasks', type: 'custom', show_completed: false, created_at: new Date(), updated_at: new Date() }
  ]);

  // Labels state
  const [labels, setLabels] = useState<Label[]>([]);
  const [isCreateLabelDialogOpen, setIsCreateLabelDialogOpen] = useState(false);

  // Search context
  const { openSearch } = useSearch();

  // Fetch data on mount
  useEffect(() => {
    fetchLists();
    fetchLabels();

    // Set initial active states based on URL
    const currentTab = searchParams.get('tab');
    if (currentTab) {
      const view = views.find(v => v.name.toLowerCase().replace(' ', '') === currentTab);
      if (view) setActiveViewId(view.id);
    }
  }, [searchParams, views]);

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/lists');
      if (!response.ok) throw new Error('Failed to fetch lists');
      const data = await response.json();
      setLists(data);
      if (data.length > 0) setActiveListId(data[0].id);
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
  };

  const fetchLabels = async () => {
    // Mock data for now - will implement API later
    const mockLabels = [
      { id: 1, user_id: 1, name: 'Work', color: '#3b82f6', icon: '💼', created_at: new Date(), updated_at: new Date() },
      { id: 2, user_id: 1, name: 'Personal', color: '#10b981', icon: '🏠', created_at: new Date(), updated_at: new Date() },
      { id: 3, user_id: 1, name: 'Important', color: '#ef4444', icon: '⭐', created_at: new Date(), updated_at: new Date() },
      { id: 4, user_id: 1, name: 'Shopping', color: '#f59e0b', icon: '🛒', created_at: new Date(), updated_at: new Date() }
    ];
    setLabels(mockLabels);
  };

  const handleListCreated = (newList: List) => {
    setLists([...lists, newList]);
    setActiveListId(newList.id);
  };


  const handleListSelect = (listId: number) => {
    setActiveListId(listId);
    router.push(`/lists/${listId}`);
  };

  const handleViewSelect = (viewId: number) => {
    const view = views.find(v => v.id === viewId);
    if (view) {
      setActiveViewId(viewId);
      const viewTab = view.name.toLowerCase().replace(' ', '');
      router.push(`/views?tab=${viewTab}`);
    }
  };

  const handleLabelSelect = (labelId: number) => {
    setActiveLabelId(labelId);
    router.push(`/labels/${labelId}`);
  };

  const toggleViewCompleted = (viewId: number) => {
    setViews(views.map(view =>
      view.id === viewId ? { ...view, show_completed: !view.show_completed } : view
    ));
  };





  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu toggle button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="w-10 h-10"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar - Desktop */}
      <div className={`hidden md:flex flex-col h-screen w-64 border-r bg-background transition-all duration-300 ${isSidebarOpen ? '' : 'hidden'}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-semibold">Todo Spectre</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={openSearch}
              className="md:flex hidden"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Lists Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <ListIcon className="w-4 h-4" />
              Lists
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateListDialogOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> New
            </Button>
          </div>

          <div className="space-y-1">
            {lists.map((list) => (
              <div
                key={list.id}
                className={getListItemClass(list.id)}
                onClick={() => handleListSelect(list.id)}
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
              </div>
            ))}
          </div>
        </div>

        {/* Views Section */}
        <div className="p-4 border-t border-b">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Views
          </h2>

          <div className="space-y-1">
            {views.map((view) => (
              <div key={view.id} className="flex items-center gap-2">
                <button
                  className={`flex-1 text-left ${getViewLinkClass(view.id)}`}
                  onClick={() => handleViewSelect(view.id)}
                >
                  {view.name}
                </button>
                <Toggle
                  size="sm"
                  pressed={view.show_completed}
                  onPressedChange={() => toggleViewCompleted(view.id)}
                  aria-label={`Toggle completed tasks for ${view.name}`}
                >
                  {view.show_completed ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Toggle>
              </div>
            ))}
          </div>
        </div>

        {/* Labels Section */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Labels
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateLabelDialogOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> New
            </Button>
          </div>

          <div className="space-y-1">
            {labels.map((label) => (
              <div
                key={label.id}
                className={getLabelItemClass(label.id)}
                onClick={() => handleLabelSelect(label.id)}
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
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r z-50 overflow-y-auto">
            {/* Mobile Sidebar Content - Same as desktop but with close button */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-blue-600" />
                <h1 className="text-lg font-semibold">Todo Spectre</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Lists Section - Mobile */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <ListIcon className="w-4 h-4" />
                  Lists
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateListDialogOpen(true)}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" /> New
                </Button>
              </div>

              <div className="space-y-1">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className={getListItemClass(list.id)}
                    onClick={() => {
                      handleListSelect(list.id);
                      toggleMobileMenu();
                    }}
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
                  </div>
                ))}
              </div>
            </div>

            {/* Views Section - Mobile */}
            <div className="p-4 border-t border-b">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Views
              </h2>

              <div className="space-y-1">
                {views.map((view) => (
                  <div key={view.id} className="flex items-center gap-2">
                    <button
                      className={`flex-1 text-left ${getViewLinkClass(view.id)}`}
                      onClick={() => {
                        handleViewSelect(view.id);
                        toggleMobileMenu();
                      }}
                    >
                      {view.name}
                    </button>
                    <Toggle
                      size="sm"
                      pressed={view.show_completed}
                      onPressedChange={() => toggleViewCompleted(view.id)}
                      aria-label={`Toggle completed tasks for ${view.name}`}
                    >
                      {view.show_completed ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </Toggle>
                  </div>
                ))}
              </div>
            </div>

            {/* Labels Section - Mobile */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Labels
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateLabelDialogOpen(true)}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" /> New
                </Button>
              </div>

              <div className="space-y-1">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className={getLabelItemClass(label.id)}
                    onClick={() => {
                      handleLabelSelect(label.id);
                      toggleMobileMenu();
                    }}
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal />

      {/* Dialogs */}
      <CreateListForm
        isOpen={isCreateListDialogOpen}
        onClose={() => setIsCreateListDialogOpen(false)}
        onListCreated={handleListCreated}
      />

      <CreateLabelForm
        isOpen={isCreateLabelDialogOpen}
        onClose={() => setIsCreateLabelDialogOpen(false)}
        onLabelCreated={(newLabel) => setLabels([...labels, newLabel])}
      />
    </>
  );
}