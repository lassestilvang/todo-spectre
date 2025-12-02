import { mockDb } from '@/lib/mock-db';
import { DatabaseError } from '@/lib/errors';
import { Label, CreateLabelInput, UpdateLabelInput, LabelService as ILabelService } from '@/types/label-types';

export class LabelService implements ILabelService {
  async getAllLabels(userId: number): Promise<Label[]> {
    try {
      const labels = await mockDb.label.findMany({
        where: {
          user_id: userId
        }
      });

      return labels;
    } catch (error) {
      console.error('Error getting all labels:', error);
      throw new DatabaseError('Failed to get labels', 'GET_LABELS_ERROR', error);
    }
  }

  async getLabelById(id: number, userId: number): Promise<Label | null> {
    try {
      const label = await mockDb.label.findUnique({
        where: {
          id: id,
          user_id: userId
        }
      });

      return label;
    } catch (error) {
      console.error('Error getting label by ID:', error);
      throw new DatabaseError('Failed to get label', 'GET_LABEL_ERROR', error);
    }
  }

  async createLabel(userId: number, data: CreateLabelInput): Promise<Label> {
    try {
      // Validate input
      if (!data.name || data.name.trim() === '') {
        throw new Error('Label name is required');
      }

      const newLabel = await mockDb.label.create({
        data: {
          user_id: userId,
          name: data.name.trim(),
          color: data.color,
          icon: data.icon
        }
      });

      return newLabel;
    } catch (error) {
      console.error('Error creating label:', error);
      if (error instanceof Error && error.message === 'Label name is required') {
        throw new DatabaseError(error.message, 'VALIDATION_ERROR');
      }
      throw new DatabaseError('Failed to create label', 'CREATE_LABEL_ERROR', error);
    }
  }

  async updateLabel(id: number, userId: number, data: UpdateLabelInput): Promise<Label> {
    try {
      // Get the current label to check if it exists
      const currentLabel = await mockDb.label.findUnique({
        where: {
          id: id,
          user_id: userId
        }
      });

      if (!currentLabel) {
        throw new DatabaseError('Label not found', 'LABEL_NOT_FOUND');
      }

      // Validate input
      if (data.name && data.name.trim() === '') {
        throw new Error('Label name cannot be empty');
      }

      const updatedLabel = await mockDb.label.update({
        where: {
          id: id,
          user_id: userId
        },
        data: {
          name: data.name ? data.name.trim() : undefined,
          color: data.color,
          icon: data.icon,
          updated_at: new Date()
        }
      });

      return updatedLabel;
    } catch (error) {
      console.error('Error updating label:', error);
      if (error instanceof Error && error.message === 'Label name cannot be empty') {
        throw new DatabaseError(error.message, 'VALIDATION_ERROR');
      }
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to update label', 'UPDATE_LABEL_ERROR', error);
    }
  }

  async deleteLabel(id: number, userId: number): Promise<void> {
    try {
      // Get the label to check if it exists
      const label = await mockDb.label.findUnique({
        where: {
          id: id,
          user_id: userId
        }
      });

      if (!label) {
        throw new DatabaseError('Label not found', 'LABEL_NOT_FOUND');
      }

      await mockDb.label.delete({
        where: {
          id: id,
          user_id: userId
        }
      });
    } catch (error) {
      console.error('Error deleting label:', error);
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to delete label', 'DELETE_LABEL_ERROR', error);
    }
  }

  async getDefaultLabels(userId: number): Promise<Label[]> {
    try {
      // Return some default labels
      const defaultLabels = [
        { id: 1, user_id: userId, name: 'Work', color: '#3b82f6', icon: '💼', created_at: new Date(), updated_at: new Date() },
        { id: 2, user_id: userId, name: 'Personal', color: '#10b981', icon: '🏠', created_at: new Date(), updated_at: new Date() },
        { id: 3, user_id: userId, name: 'Important', color: '#ef4444', icon: '⭐', created_at: new Date(), updated_at: new Date() },
        { id: 4, user_id: userId, name: 'Shopping', color: '#f59e0b', icon: '🛒', created_at: new Date(), updated_at: new Date() }
      ];

      return defaultLabels;
    } catch (error) {
      console.error('Error getting default labels:', error);
      throw new DatabaseError('Failed to get default labels', 'GET_DEFAULT_LABELS_ERROR', error);
    }
  }
}