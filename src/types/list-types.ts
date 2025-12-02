export interface List {
  id: number;
  user_id: number;
  title: string;
  color?: string;
  icon?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateListInput {
  title: string;
  color?: string;
  icon?: string;
}

export interface UpdateListInput {
  title?: string;
  color?: string;
  icon?: string;
}

export interface ListService {
  getAllLists(userId: number): Promise<List[]>;
  getListById(id: number, userId: number): Promise<List | null>;
  createList(userId: number, data: CreateListInput): Promise<List>;
  updateList(id: number, userId: number, data: UpdateListInput): Promise<List>;
  deleteList(id: number, userId: number): Promise<void>;
  getDefaultList(userId: number): Promise<List>;
  ensureDefaultList(userId: number): Promise<List>;
}