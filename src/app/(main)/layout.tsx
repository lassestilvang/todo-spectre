'use client';

import { ReactNode, Suspense } from 'react';
import { TaskSidebar } from '@/components/layout/task-sidebar';
import { SearchProvider, useSearch } from '@/context/search-context';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ViewTransition } from '@/components/ui/view-transition';
import { MobileHeader } from '@/components/layout/mobile-header';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SearchProvider>
      <MainLayoutContent>
        {children}
      </MainLayoutContent>
    </SearchProvider>
  );
}

function MainLayoutContent({ children }: { children: ReactNode }) {
  const { openSearch } = useSearch();

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader />

      {/* Task Sidebar - Wrapped in Suspense for useSearchParams */}
      <Suspense fallback={<div className="hidden md:flex flex-col h-screen w-64 border-r bg-background">Loading sidebar...</div>}>
        <TaskSidebar />
      </Suspense>

      {/* Main content */}
      <div className="flex-1 overflow-auto md:ml-64">
        {/* Global Search Button - visible on mobile */}
        <div className="md:hidden fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10"
            onClick={openSearch}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <ViewTransition>
          {children}
        </ViewTransition>
      </div>
    </div>
  );
}