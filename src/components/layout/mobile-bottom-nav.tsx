'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, List, Search, Plus, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { href: '/tasks', icon: <List className="w-5 h-5" />, label: 'Tasks' },
    { href: '/search', icon: <Search className="w-5 h-5" />, label: 'Search' },
    { href: '/tasks/create', icon: <Plus className="w-5 h-5" />, label: 'Add' },
    { href: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? 'secondary' : 'ghost'}
            size="icon"
            className="flex flex-col items-center justify-center h-14 w-14 gap-1"
            onClick={() => router.push(item.href)}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </motion.div>
  );
}