'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '@/context/search-context';

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openSearch } = useSearch();

  return (
    <div className="md:hidden">
      <div className="flex justify-between items-center p-4 bg-background border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <h1 className="text-lg font-semibold">Todo Spectre</h1>

        <Button
          variant="ghost"
          size="icon"
          onClick={openSearch}
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-background border-b border-border"
          >
            <div className="p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsMenuOpen(false);
                  // Add navigation logic here
                }}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsMenuOpen(false);
                  // Add navigation logic here
                }}
              >
                Tasks
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsMenuOpen(false);
                  // Add navigation logic here
                }}
              >
                Settings
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}