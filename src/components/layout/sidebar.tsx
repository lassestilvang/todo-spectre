'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ListManagement } from '@/components/lists/list-management';

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getLinkClass = (path: string) => {
    return `block px-3 py-2 rounded hover:bg-gray-100 ${pathname === path ? 'bg-gray-100 font-medium' : ''}`;
  };

  const getViewLinkClass = (viewTab: string) => {
    const currentTab = searchParams.get('tab');
    return `block px-3 py-2 rounded hover:bg-gray-100 ${pathname === '/views' && currentTab === viewTab ? 'bg-gray-100 font-medium' : ''}`;
  };

  return (
    <div className="w-64 border-r hidden md:block">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Navigation</h2>
        <div className="mt-4 space-y-2">
          <Link href="/lists" className={getLinkClass('/lists')}>
            Lists
          </Link>
          <Link href="/tasks" className={getLinkClass('/tasks')}>
            Tasks
          </Link>
          <Link href="/views" className={getLinkClass('/views')}>
            Views
          </Link>
        </div>
        <ListManagement />
      </div>

      {/* Views Navigation */}
      <div className="p-4 border-b">
        <h3 className="text-md font-semibold mb-3">Views</h3>
        <div className="space-y-2">
          <Link href="/views?tab=today" className={getViewLinkClass('today')}>
            Today
          </Link>
          <Link href="/views?tab=next7days" className={getViewLinkClass('next7days')}>
            Next 7 Days
          </Link>
          <Link href="/views?tab=upcoming" className={getViewLinkClass('upcoming')}>
            Upcoming
          </Link>
          <Link href="/views?tab=all" className={getViewLinkClass('all')}>
            All Tasks
          </Link>
        </div>
      </div>
    </div>
  );
}