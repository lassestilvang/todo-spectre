import { Task } from './task-types';
import { List } from './list-types';

export interface SearchResult {
  items: (Task | List)[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilters {
  status?: string;
  priority?: number;
  list_id?: number;
  include_lists?: boolean;
}

export interface SearchService {
  searchTasks(
    userId: number,
    query: string,
    filters?: SearchFilters,
    page?: number,
    limit?: number
  ): Promise<SearchResult>;
}