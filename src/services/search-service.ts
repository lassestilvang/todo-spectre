import { mockDb } from '@/lib/mock-db';
import { DatabaseError } from '@/lib/errors';
import { SearchResult, SearchFilters } from '@/types/search-types';
import { Task, List } from '@/types/task-types';

// Fuzzy search implementation using Levenshtein distance
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

function fuzzyMatch(query: string, text: string): number {
  if (!query || !text) return 0;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Simple fuzzy matching score (0-1)
  const distance = levenshteinDistance(queryLower, textLower);
  const maxLength = Math.max(queryLower.length, textLower.length);
  const similarity = 1 - (distance / maxLength);

  return Math.max(0, similarity);
}

export class SearchService {
  async searchTasks(
    userId: number,
    query: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResult> {
    try {
      const offset = (page - 1) * limit;

      // Get all tasks and lists for the user
      const tasks = await mockDb.task.findMany({
        where: {
          list: {
            user_id: userId
          }
        },
        include: {
          task_logs: true,
          task_labels: true,
          task_attachments: true,
          list: true
        }
      });

      const lists = await mockDb.list.findMany({
        where: {
          user_id: userId
        }
      });

      // Apply filters
      let filteredTasks = [...tasks];

      if (filters.status) {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }

      if (filters.priority !== undefined) {
        filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
      }

      if (filters.list_id) {
        filteredTasks = filteredTasks.filter(task => task.list_id === filters.list_id);
      }

      // Perform fuzzy search
      const searchResults: (Task | List)[] = [];

      if (query) {
        // Search in tasks
        const taskResults = filteredTasks
          .map(task => {
            const titleScore = fuzzyMatch(query, task.title);
            const descriptionScore = task.description ? fuzzyMatch(query, task.description) : 0;
            const combinedScore = Math.max(titleScore, descriptionScore);

            return {
              item: task,
              score: combinedScore,
              type: 'task' as const
            };
          })
          .filter(result => result.score > 0.3) // Minimum similarity threshold
          .sort((a, b) => b.score - a.score)
          .map(result => result.item);

        // Search in lists if requested
        if (filters.include_lists) {
          const listResults = lists
            .map(list => {
              const score = fuzzyMatch(query, list.title);
              return {
                item: list,
                score: score,
                type: 'list' as const
              };
            })
            .filter(result => result.score > 0.3) // Minimum similarity threshold
            .sort((a, b) => b.score - a.score)
            .map(result => result.item);

          searchResults.push(...listResults);
        }

        searchResults.push(...taskResults);
      } else {
        // If no query, return all filtered tasks
        searchResults.push(...filteredTasks);
      }

      // Apply pagination
      const paginatedResults = searchResults.slice(offset, offset + limit);

      return {
        items: paginatedResults,
        total: searchResults.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(searchResults.length / limit)
      };

    } catch (error) {
      console.error('Error searching tasks:', error);
      throw new DatabaseError('Failed to search tasks', 'SEARCH_TASKS_ERROR', error);
    }
  }
}