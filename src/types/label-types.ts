export interface Label {
  id: number;
  user_id: number;
  name: string;
  color?: string;
  icon?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLabelInput {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
  icon?: string;
}

export interface LabelService {
  getAllLabels(userId: number): Promise<Label[]>;
  getLabelById(id: number, userId: number): Promise<Label | null>;
  createLabel(userId: number, data: CreateLabelInput): Promise<Label>;
  updateLabel(id: number, userId: number, data: UpdateLabelInput): Promise<Label>;
  deleteLabel(id: number, userId: number): Promise<void>;
  getDefaultLabels(userId: number): Promise<Label[]>;
}