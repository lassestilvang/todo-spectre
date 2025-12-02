export interface TaskFilterCriteria {
  status?: string;
  priority?: number;
  list_id?: number;
  due_date?: Date;
  deadline?: Date;
}

export interface TaskSortOrder {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ViewFilterCriteria {
  status?: string;
  priority?: number;
  list_id?: number;
  [key: string]: unknown;
}

export interface ViewSortOrder {
  field: string;
  direction: 'asc' | 'desc';
}