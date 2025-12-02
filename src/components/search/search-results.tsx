'use client';

import { Task, List } from '@/types/task-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, List as ListIcon, Tag, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SearchResultsProps {
  results: (Task | List)[];
  isLoading: boolean;
  error: string | null;
  onResultClick: (result: Task | List) => void;
  selectedIndex?: number;
}

export function SearchResults({
  results,
  isLoading,
  error,
  onResultClick
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-500">No results found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((result, index) => (
        <Card
          key={`search-${result.id}`}
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            selectedIndex === index ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onResultClick(result)}
          data-search-result
        >
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {result.hasOwnProperty('list_id') ? (
                  <div className="flex items-center gap-2">
                    <ListIcon className="h-4 w-4" />
                    <span>{(result as Task).title}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ListIcon className="h-4 w-4" />
                    <span>{(result as List).title}</span>
                  </div>
                )}
              </CardTitle>
              {result.hasOwnProperty('status') && (
                <Badge variant={(result as Task).status === 'completed' ? 'secondary' : 'default'}>
                  {(result as Task).status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {result.hasOwnProperty('description') && (result as Task).description && (
              <p className="text-sm text-gray-600 mb-2">
                {(result as Task).description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
              {result.hasOwnProperty('priority') && (result as Task).priority > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Priority: {(result as Task).priority}
                </Badge>
              )}

              {result.hasOwnProperty('due_date') && (result as Task).due_date && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due: {new Date((result as Task).due_date).toLocaleDateString()}
                </Badge>
              )}

              {result.hasOwnProperty('estimate') && (result as Task).estimate && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Est: {(result as Task).estimate} min
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Helper component for search icon
function Search({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}