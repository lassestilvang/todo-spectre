'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SearchInput } from './search-input';
import { SearchResults } from './search-results';
import { SearchFilters } from './search-filters';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { Task } from '@/types/task-types';
import { List } from '@/types/list-types';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/context/search-context';
import { trackSearch, trackSearchResultClick } from '@/lib/search-analytics';

export function SearchModal() {
  const { isSearchOpen, closeSearch } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Task | List)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim() && Object.keys(filters).length === 0) {
      setSearchResults([]);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&page=${page}&limit=10${Object.entries(filters)
        .map(([key, value]) => `&${key}=${encodeURIComponent(value)}`)
        .join('')}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results);
      setTotalResults(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
      // Track search analytics
      if (searchQuery.trim()) {
        trackSearch(searchQuery, searchResults.length);
      }
    }
  }, [searchQuery, filters, page]);

  useEffect(() => {
    if (isSearchOpen) {
      // Reset to first page when opening or changing query/filters
      setPage(1);
      if (searchQuery.trim() || Object.keys(filters).length > 0) {
        performSearch();
      } else {
        setSearchResults([]);
        setTotalResults(0);
        setTotalPages(1);
      }
    }
  }, [isSearchOpen, searchQuery, filters, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow down - select next result
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedResultIndex(prev =>
          Math.min(prev + 1, searchResults.length - 1)
        );
      }
      // Arrow up - select previous result
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedResultIndex(prev =>
          Math.max(prev - 1, -1)
        );
      }
      // Enter - navigate to selected result
      else if (e.key === 'Enter' && selectedResultIndex >= 0) {
        e.preventDefault();
        handleResultClick(searchResults[selectedResultIndex]);
      }
      // Escape - close search
      else if (e.key === 'Escape') {
        e.preventDefault();
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, searchResults, selectedResultIndex, closeSearch, handleResultClick, setSelectedResultIndex]);

  // Scroll selected result into view
  useEffect(() => {
    if (selectedResultIndex >= 0 && resultsRef.current) {
      const resultElements = resultsRef.current.querySelectorAll('[data-search-result]');
      if (resultElements[selectedResultIndex]) {
        resultElements[selectedResultIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedResultIndex]);

  const handleResultClick = (result: Task | List) => {
    if (result.hasOwnProperty('list_id')) {
      // It's a task
      const task = result as Task;
      trackSearchResultClick('task', task.id);
      router.push(`/tasks/${task.id}`);
    } else {
      // It's a list
      const list = result as List;
      trackSearchResultClick('list', list.id);
      router.push(`/lists/${list.id}`);
    }
    closeSearch();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Dialog open={isSearchOpen} onOpenChange={closeSearch}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Search</span>
            <div className="flex items-center gap-2">
              <SearchFilters
                onFilterChange={setFilters}
                currentFilters={filters}
              />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={performSearch}
            placeholder="Search tasks and lists..."
          />

          {totalResults > 0 && (
            <div className="text-sm text-gray-500">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </div>
          )}

          <div ref={resultsRef}>
            <SearchResults
              results={searchResults}
              isLoading={isLoading}
              error={error}
              onResultClick={handleResultClick}
              selectedIndex={selectedResultIndex}
            />
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (page > 1) handlePageChange(page - 1);
                    }}
                    disabled={page <= 1}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => {
                          handlePageChange(pageNum);
                        }}
                        isActive={pageNum === page}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (page < totalPages) handlePageChange(page + 1);
                    }}
                    disabled={page >= totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}