export interface View {
  id: number;
  user_id: number;
  name: string;
  type: 'day' | 'week' | 'month' | 'custom';
  filter_criteria?: any; // JSON with filter rules
  sort_order?: any; // JSON with sort rules
  show_completed?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateViewInput {
  name: string;
  type: 'day' | 'week' | 'month' | 'custom';
  filter_criteria?: any;
  sort_order?: any;
  show_completed?: boolean;
}

export interface UpdateViewInput {
  name?: string;
  type?: 'day' | 'week' | 'month' | 'custom';
  filter_criteria?: any;
  sort_order?: any;
  show_completed?: boolean;
}

export interface ViewService {
  getAllViews(userId: number): Promise<View[]>;
  getViewById(id: number, userId: number): Promise<View | null>;
  createView(userId: number, data: CreateViewInput): Promise<View>;
  updateView(id: number, userId: number, data: UpdateViewInput): Promise<View>;
  deleteView(id: number, userId: number): Promise<void>;
  getViewTasks(viewId: number, userId: number): Promise<any[]>;
  toggleCompletedVisibility(viewId: number, userId: number, showCompleted: boolean): Promise<View>;
}

export interface ViewPreferences {
  showCompletedTasks: boolean;
  defaultView: string;
}