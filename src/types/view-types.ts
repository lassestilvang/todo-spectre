import { ViewFilterCriteria, ViewSortOrder } from '@/types/filter-types';

export interface View {
  id: number;
  user_id: number;
  name: string;
  type: 'day' | 'week' | 'month' | 'custom';
  filter_criteria?: ViewFilterCriteria; // JSON with filter rules
  sort_order?: ViewSortOrder; // JSON with sort rules
  show_completed?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateViewInput {
  name: string;
  type: 'day' | 'week' | 'month' | 'custom';
  filter_criteria?: ViewFilterCriteria;
  sort_order?: ViewSortOrder;
  show_completed?: boolean;
}

export interface UpdateViewInput {
  name?: string;
  type?: 'day' | 'week' | 'month' | 'custom';
  filter_criteria?: ViewFilterCriteria;
  sort_order?: ViewSortOrder;
  show_completed?: boolean;
}

export interface ViewService {
  getAllViews(userId: number): Promise<View[]>;
  getViewById(id: number, userId: number): Promise<View | null>;
  createView(userId: number, data: CreateViewInput): Promise<View>;
  updateView(id: number, userId: number, data: UpdateViewInput): Promise<View>;
  deleteView(id: number, userId: number): Promise<void>;
  getViewTasks(viewId: number, userId: number): Promise<Task[]>;
  toggleCompletedVisibility(viewId: number, userId: number, showCompleted: boolean): Promise<View>;
}

export interface ViewPreferences {
  showCompletedTasks: boolean;
  defaultView: string;
}