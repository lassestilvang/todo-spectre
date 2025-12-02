'use client';

import { useEffect } from 'react';
import { useSearch } from '@/context/search-context';

export function useSearchAnalytics() {
  const { isSearchOpen } = useSearch();

  useEffect(() => {
    if (isSearchOpen) {
      // Track search open event
      console.log('Search opened - tracking event');
      // In a real app, this would send to analytics service
      // analytics.track('search_opened');
    }
  }, [isSearchOpen]);
}

export function trackSearch(query: string, resultsCount: number) {
  console.log(`Search performed: "${query}" - ${resultsCount} results`);
  // In a real app, this would send to analytics service
  // analytics.track('search_performed', { query, resultsCount });
}

export function trackSearchResultClick(resultType: 'task' | 'list', resultId: number) {
  console.log(`Search result clicked: ${resultType} ${resultId}`);
  // In a real app, this would send to analytics service
  // analytics.track('search_result_clicked', { resultType, resultId });
}