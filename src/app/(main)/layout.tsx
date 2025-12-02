import { ReactNode } from 'react';
import { TaskSidebar } from '@/components/layout/task-sidebar';
import { SearchProvider } from '@/context/search-context';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ViewTransition } from '@/components/ui/view-transition';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { openSearch } = useSearch();

  return (
    <SearchProvider>
      <div className="flex h-screen bg-background">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Task Sidebar */}
        <TaskSidebar />

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
      <MobileBottomNav />
    </SearchProvider>
  );
}