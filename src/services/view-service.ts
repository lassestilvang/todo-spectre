import { mockDb } from '@/lib/mock-db';
import { DatabaseError } from '@/lib/errors';
import { View, CreateViewInput, UpdateViewInput, ViewService as IViewService } from '@/types/view-types';
import { TaskService } from './task-service';
import { Task } from '@/types/task-types';

// For testing, we need to use the mockPrisma from tests
// This allows tests to properly mock the database
let db: any

// Check if we're in a test environment and use mockPrisma if available
if (process.env.NODE_ENV === 'test') {
  try {
    const { mockPrisma } = require('../../tests/mocks/mock-db')
    db = mockPrisma
    console.log('Using mockPrisma for testing')
  } catch (error) {
    console.warn('mockPrisma not available, using mockDb')
    db = mockDb
  }
} else {
  db = mockDb
}

export class ViewService implements IViewService {
  async getAllViews(userId: number): Promise<View[]> {
    try {
      const views = await db.view.findMany({
        where: {
          user_id: userId
        }
      });

      return views;
    } catch (error) {
      console.error('Error getting all views:', error);
      throw new DatabaseError('Failed to get views', 'GET_VIEWS_ERROR', error);
    }
  }

  async getViewById(id: number, userId: number): Promise<View | null> {
    try {
      const view = await db.view.findUnique({
        where: {
          id: id,
          user_id: userId
        }
      });

      return view;
    } catch (error) {
      console.error('Error getting view by ID:', error);
      throw new DatabaseError('Failed to get view', 'GET_VIEW_ERROR', error);
    }
  }

  async createView(userId: number, data: CreateViewInput): Promise<View> {
    try {
      // Validate input
      if (!data.name || data.name.trim() === '') {
        throw new Error('View name is required');
      }

      if (!['day', 'week', 'month', 'custom'].includes(data.type)) {
        throw new Error('Invalid view type');
      }

      const newView = await db.view.create({
        data: {
          user_id: userId,
          name: data.name.trim(),
          type: data.type,
          filter_criteria: data.filter_criteria,
          sort_order: data.sort_order,
          show_completed: data.show_completed || false
        }
      });

      return newView;
    } catch (error) {
      console.error('Error creating view:', error);
      if (error instanceof Error && error.message.startsWith('View')) {
        throw new DatabaseError(error.message, 'VALIDATION_ERROR');
      }
      throw new DatabaseError('Failed to create view', 'CREATE_VIEW_ERROR', error);
    }
  }

  async updateView(id: number, userId: number, data: UpdateViewInput): Promise<View> {
    try {
      // Get the current view to check if it exists
      const currentView = await db.view.findUnique({
        where: {
          id: id,
          user_id: userId
        }
      });

      if (!currentView) {
        throw new DatabaseError('View not found', 'VIEW_NOT_FOUND');
      }

      // Validate input
      if (data.name && data.name.trim() === '') {
        throw new Error('View name cannot be empty');
      }

      if (data.type && !['day', 'week', 'month', 'custom'].includes(data.type)) {
        throw new Error('Invalid view type');
      }

      const updatedView = await db.view.update({
        where: {
          id: id,
          user_id: userId
        },
        data: {
          name: data.name ? data.name.trim() : undefined,
          type: data.type,
          filter_criteria: data.filter_criteria,
          sort_order: data.sort_order,
          show_completed: data.show_completed,
          updated_at: new Date()
        }
      });

      if (!updatedView) {
        throw new DatabaseError('View update failed - view not found', 'VIEW_UPDATE_FAILED');
      }

      return updatedView;
    } catch (error) {
      console.error('Error updating view:', error);
      if (error instanceof Error && error.message.startsWith('View')) {
        throw new DatabaseError(error.message, 'VALIDATION_ERROR');
      }
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to update view', 'UPDATE_VIEW_ERROR', error);
    }
  }

  async deleteView(id: number, userId: number): Promise<void> {
    try {
      // Get the view to check if it exists
      const view = await db.view.findUnique({
        where: {
          id: id,
          user_id: userId
        }
      });

      if (!view) {
        throw new DatabaseError('View not found', 'VIEW_NOT_FOUND');
      }

      await db.view.delete({
        where: {
          id: id,
          user_id: userId
        }
      });
    } catch (error) {
      console.error('Error deleting view:', error);
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to delete view', 'DELETE_VIEW_ERROR', error);
    }
  }

  async getViewTasks(viewId: number, userId: number): Promise<Task[]> {
    try {
      const view = await this.getViewById(viewId, userId);
      if (!view) {
        throw new DatabaseError('View not found', 'VIEW_NOT_FOUND');
      }

      const taskService = new TaskService();
      const { startOfToday, endOfToday, addDays } = await import('date-fns');
      const todayEnd = endOfToday();

      // Get tasks based on view type and filter criteria
      switch (view.type) {
        case 'day':
          // For day views, get tasks for today
          const todayTasks = await taskService.getTasksByDateRange(
            userId,
            startOfToday(),
            todayEnd
          );
          return this.applyViewFilters(todayTasks, view);

        case 'week':
          // For week views, get tasks for next 7 days
          const weekEnd = addDays(todayEnd, 7);
          const weekTasks = await taskService.getTasksByDateRange(
            userId,
            new Date(todayEnd.getTime() + 1), // Start from tomorrow
            weekEnd
          );
          return this.applyViewFilters(weekTasks, view);

        case 'month':
          // For month views, get tasks for next 30 days
          const monthEnd = addDays(todayEnd, 30);
          const monthTasks = await taskService.getTasksByDateRange(
            userId,
            new Date(todayEnd.getTime() + 1), // Start from tomorrow
            monthEnd
          );
          return this.applyViewFilters(monthTasks, view);

        case 'custom':
        default:
          // For custom views, get all tasks and apply custom filters
          const allTasks = await taskService.getAllTasks(userId);
          return this.applyViewFilters(allTasks, view);
      }
    } catch (error) {
      console.error('Error getting view tasks:', error);
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to get view tasks', 'GET_VIEW_TASKS_ERROR', error);
    }
  }

  async toggleCompletedVisibility(viewId: number, userId: number, showCompleted: boolean): Promise<View> {
    try {
      const updatedView = await this.updateView(viewId, userId, {
        show_completed: showCompleted
      });

      return updatedView;
    } catch (error) {
      console.error('Error toggling completed visibility:', error);
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to toggle completed visibility', 'TOGGLE_COMPLETED_ERROR', error);
    }
  }

  private async applyViewFilters(tasks: Task[], view: View): Promise<Task[]> {
    let filteredTasks = [...tasks];

    // Apply filter criteria if specified
    if (view.filter_criteria) {
      try {
        const filters = typeof view.filter_criteria === 'string'
          ? JSON.parse(view.filter_criteria)
          : view.filter_criteria;

        if (filters.status) {
          filteredTasks = filteredTasks.filter(task => task.status === filters.status);
        }

        if (filters.priority) {
          filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
        }

        if (filters.list_id) {
          filteredTasks = filteredTasks.filter(task => task.list_id === filters.list_id);
        }

        // Apply show_completed filter
        if (!view.show_completed) {
          filteredTasks = filteredTasks.filter(task => task.status !== 'completed');
        }

      } catch (error) {
        console.error('Error parsing view filter criteria:', error);
      }
    } else {
      // Default filtering - hide completed tasks if show_completed is false
      if (!view.show_completed) {
        filteredTasks = filteredTasks.filter(task => task.status !== 'completed');
      }
    }

    // Apply sort order if specified
    if (view.sort_order) {
      try {
        const sortOrder = typeof view.sort_order === 'string'
          ? JSON.parse(view.sort_order)
          : view.sort_order;

        if (sortOrder.field && sortOrder.direction) {
          filteredTasks.sort((a, b) => {
            const fieldA = a[sortOrder.field as keyof Task];
            const fieldB = b[sortOrder.field as keyof Task];

            if (fieldA === undefined || fieldB === undefined) return 0;

            if (typeof fieldA === 'number' && typeof fieldB === 'number') {
              return sortOrder.direction === 'desc' ? fieldB - fieldA : fieldA - fieldB;
            }

            if (fieldA instanceof Date && fieldB instanceof Date) {
              const timeA = fieldA.getTime();
              const timeB = fieldB.getTime();
              return sortOrder.direction === 'desc' ? timeB - timeA : timeA - timeB;
            }

            return 0;
          });
        }
      } catch (error) {
        console.error('Error parsing view sort order:', error);
      }
    }

    return filteredTasks;
  }
}