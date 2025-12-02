import { TaskFilterCriteria } from '@/types/filter-types';

export interface Task {
  id: number;
  list_id?: number;
  title: string;
  description?: string;
  due_date?: Date;
  deadline?: Date;
  reminders?: string[]; // Array of reminder times
  estimate?: number; // Estimated time in minutes
  actual_time?: number; // Actual time spent in minutes
  priority: number; // 0 = None, 1 = Low, 2 = Medium, 3 = High
  recurring?: string; // Recurring pattern (daily, weekly, monthly, etc.)
  status: string; // 'pending', 'in_progress', 'completed', 'archived'
  created_at: Date;
  updated_at: Date;
  task_logs?: TaskLog[];
  task_labels?: TaskLabel[];
  task_attachments?: TaskAttachment[];
}

export interface TaskLog {
  id: number;
  task_id: number;
  action: string; // 'create', 'update', 'delete', 'complete'
  changes?: string; // JSON with change details
  created_at: Date;
}

export interface TaskLabel {
  id: number;
  task_id: number;
  name: string;
  color?: string;
  icon?: string;
  created_at: Date;
}

export interface TaskAttachment {
  id: number;
  task_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: Date;
}

export interface CreateTaskInput {
  list_id?: number;
  title: string;
  description?: string;
  due_date?: Date;
  deadline?: Date;
  reminders?: string[];
  estimate?: number;
  actual_time?: number;
  priority?: number;
  recurring?: string;
  status?: string;
  task_labels?: Omit<TaskLabel, 'id' | 'task_id' | 'created_at'>[];
  task_attachments?: Omit<TaskAttachment, 'id' | 'task_id' | 'created_at'>[];
}

export interface UpdateTaskInput {
  list_id?: number;
  title?: string;
  description?: string;
  due_date?: Date;
  deadline?: Date;
  reminders?: string[];
  estimate?: number;
  actual_time?: number;
  priority?: number;
  recurring?: string;
  status?: string;
  task_labels?: Omit<TaskLabel, 'id' | 'task_id' | 'created_at'>[];
  task_attachments?: Omit<TaskAttachment, 'id' | 'task_id' | 'created_at'>[];
}

export interface TaskService {
  getAllTasks(userId: number, filters?: TaskFilterCriteria): Promise<Task[]>;
  getTaskById(id: number, userId: number): Promise<Task | null>;
  createTask(userId: number, data: CreateTaskInput): Promise<Task>;
  updateTask(id: number, userId: number, data: UpdateTaskInput): Promise<Task>;
  deleteTask(id: number, userId: number): Promise<void>;
  addTaskLog(taskId: number, userId: number, action: string, changes?: Record<string, unknown>): Promise<TaskLog>;
  getTaskLogs(taskId: number, userId: number): Promise<TaskLog[]>;
  getTasksByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Task[]>;
  getUpcomingTasks(userId: number): Promise<Task[]>;
  getTasksByPriority(userId: number, priority: number): Promise<Task[]>;
  getTasksByStatus(userId: number, status: string): Promise<Task[]>;
  getTasksByList(userId: number, listId: number): Promise<Task[]>;
}