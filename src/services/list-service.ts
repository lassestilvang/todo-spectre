import { prisma } from '@/lib/prisma';
import { DatabaseError } from '@/lib/errors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = prisma

if (process.env.NODE_ENV === 'test') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { mockPrisma } = require('../../tests/mocks/mock-db')
    db = mockPrisma
  } catch {
    db = prisma
  }
} else {
  db = prisma
}
import { List, CreateListInput, UpdateListInput, ListService as IListService } from '@/types/list-types';

export class ListService implements IListService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(dbOverride?: any) {
    this.db = dbOverride ?? db;
  }

  private DEFAULT_LIST_TITLE = 'Inbox';
  private DEFAULT_LIST_COLOR = '#6366f1'; // Indigo color
  private DEFAULT_LIST_ICON = '📥';

  async getAllLists(userId: number): Promise<List[]> {
    try {
      const lists = await this.db.list.findMany({
        where: {
          user_id: userId
        }
      });

      return lists;
    } catch (error) {
      console.error('Error getting all lists:', error);
      throw new DatabaseError('Failed to get lists', 'GET_LISTS_ERROR', error);
    }
  }

  async getListById(id: number, userId: number): Promise<List | null> {
    try {
      const list = await this.db.list.findUnique({
        where: {
          id: id,
          user_id: userId
        }
      });

      return list;
    } catch (error) {
      console.error('Error getting list by ID:', error);
      throw new DatabaseError('Failed to get list', 'GET_LIST_ERROR', error);
    }
  }

  async createList(userId: number, data: CreateListInput): Promise<List> {
    try {
      // Validate input
      if (!data.title || data.title.trim() === '') {
        throw new Error('List title is required');
      }

      const newList = await this.db.list.create({
        data: {
          user_id: userId,
          title: data.title.trim(),
          color: data.color,
          icon: data.icon
        }
      });

      return newList;
    } catch (error) {
      console.error('Error creating list:', error);
      if (error instanceof Error && error.message === 'List title is required') {
        throw new DatabaseError(error.message, 'VALIDATION_ERROR');
      }
      throw new DatabaseError('Failed to create list', 'CREATE_LIST_ERROR', error);
    }
  }

  async updateList(id: number, userId: number, data: UpdateListInput): Promise<List> {
    try {
      // Get the current list to check if it's the default list
      const currentList = await this.db.list.findUnique({
        where: {
          id: id,
          user_id: userId
        }
      });

      console.log('currentList', currentList && currentList.id, currentList && currentList.title)
      if (!currentList) {
        throw new DatabaseError('List not found', 'LIST_NOT_FOUND');
      }

      // Prevent renaming or deleting the default Inbox list
      if (currentList.title === this.DEFAULT_LIST_TITLE) {
        if (data.title && data.title !== this.DEFAULT_LIST_TITLE) {
          throw new DatabaseError('Cannot rename the Inbox list', 'INBOX_RENAME_ERROR');
        }
      }

      // Validate input
      if (data.title && data.title.trim() === '') {
        throw new Error('List title cannot be empty');
      }

      const updatedList = await this.db.list.update({
        where: {
          id: id,
          user_id: userId
        },
        data: {
          title: data.title ? data.title.trim() : undefined,
          color: data.color,
          icon: data.icon,
          updated_at: new Date()
        }
      });

      return updatedList;
    } catch (error) {
      console.error('Error updating list:', error);
      if (error instanceof Error && error.message === 'List title cannot be empty') {
        throw new DatabaseError(error.message, 'VALIDATION_ERROR');
      }
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to update list', 'UPDATE_LIST_ERROR', error);
    }
  }

  async deleteList(id: number, userId: number): Promise<void> {
    try {
      // Get the list to check if it's the default list
      const list = await this.db.list.findUnique({
        where: {
          id: id,
          user_id: userId
        }
      });

      if (!list) {
        throw new DatabaseError('List not found', 'LIST_NOT_FOUND');
      }

      // Prevent deleting the default Inbox list
      if (list.title === this.DEFAULT_LIST_TITLE) {
        throw new DatabaseError('Cannot delete the Inbox list', 'INBOX_DELETE_ERROR');
      }

      await this.db.list.delete({
        where: {
          id: id,
          user_id: userId
        }
      });
    } catch (error) {
      console.error('Error deleting list:', error);
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to delete list', 'DELETE_LIST_ERROR', error);
    }
  }

  async getDefaultList(userId: number): Promise<List> {
    try {
      // Try to find an existing Inbox list
      let defaultList = await this.db.list.findFirst({
        where: {
          user_id: userId,
          title: this.DEFAULT_LIST_TITLE
        }
      });

      // If no default list exists, create one
      if (!defaultList) {
        defaultList = await this.createDefaultList(userId);
      }

      return defaultList;
    } catch (error) {
      console.error('Error getting default list:', error);
      throw new DatabaseError('Failed to get default list', 'GET_DEFAULT_LIST_ERROR', error);
    }
  }

  async ensureDefaultList(userId: number): Promise<List> {
    try {
      // Check if default list exists
      const existingDefault = await this.db.list.findFirst({
        where: {
          user_id: userId,
          title: this.DEFAULT_LIST_TITLE
        }
      });

      if (existingDefault) {
        return existingDefault;
      }

      // Create default list if it doesn't exist
      return await this.createDefaultList(userId);
    } catch (error) {
      console.error('Error ensuring default list:', error);
      throw new DatabaseError('Failed to ensure default list', 'ENSURE_DEFAULT_LIST_ERROR', error);
    }
  }

  private async createDefaultList(userId: number): Promise<List> {
    const newList = await this.db.list.create({
      data: {
        user_id: userId,
        title: this.DEFAULT_LIST_TITLE,
        color: this.DEFAULT_LIST_COLOR,
        icon: this.DEFAULT_LIST_ICON
      }
    });

    return newList;
  }
}