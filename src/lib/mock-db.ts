// Mock database for development testing
import { List } from '@/types/list-types';
import { Task, TaskLog, TaskLabel, TaskAttachment } from '@/types/task-types';
import { View } from '@/types/view-types';

// Module-level database state
const mockLists: List[] = [
  {
    id: 1,
    user_id: 1,
    title: 'Inbox',
    color: '#6366f1',
    icon: '📥',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockTasks: Task[] = [];
let mockTaskLogs: TaskLog[] = [];
let mockTaskLabels: TaskLabel[] = [];
let mockTaskAttachments: TaskAttachment[] = [];
const mockViews: View[] = [];

let nextListId = 2;
let nextTaskId = 1;
let nextLogId = 1;
let nextLabelId = 1;
let nextAttachmentId = 1;
let nextViewId = 1;

export const mockDb = {
  list: {
    findMany: async (options: { where: { user_id: number } }) => {
      return mockLists.filter(list => list.user_id === options.where.user_id);
    },
    findUnique: async (options: { where: { id: number; user_id: number } }) => {
      return mockLists.find(list => list.id === options.where.id && list.user_id === options.where.user_id) || null;
    },
    findFirst: async (options: { where: { title: string; user_id: number } }) => {
      return mockLists.find(list => list.title === options.where.title && list.user_id === options.where.user_id) || null;
    },
    create: async (options: any) => {
      const newList = {
        id: nextListId++,
        user_id: options.data.user_id,
        title: options.data.title,
        color: options.data.color,
        icon: options.data.icon,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockLists.push(newList);
      return newList;
    },
    update: async (options: any) => {
      const index = mockLists.findIndex(list => list.id === options.where.id && list.user_id === options.where.user_id);
      if (index === -1) return null;

      const updatedList = {
        ...mockLists[index],
        ...options.data,
        updated_at: new Date()
      };
      mockLists[index] = updatedList;
      return updatedList;
    },
    delete: async (options: any) => {
      const index = mockLists.findIndex(list => list.id === options.where.id && list.user_id === options.where.user_id);
      if (index !== -1) {
        mockLists.splice(index, 1);
      }
      return {};
    }
  },
  task: {
    findMany: async (options: { where?: { list?: { id: number }; status?: string; priority?: number; list_id?: number }; include?: { task_logs?: boolean; task_labels?: boolean; task_attachments?: boolean }; orderBy?: any }) => {
      let tasks = [...mockTasks];

      // Apply where conditions
      const where = options.where;
      if (where) {
        if (where.list?.id) {
          tasks = tasks.filter(task => task.list_id === where.list!.id);
        }
        if (where.status) {
          tasks = tasks.filter(task => task.status === where.status);
        }
        if (where.priority) {
          tasks = tasks.filter(task => task.priority === where.priority);
        }
        if (where.list_id) {
          tasks = tasks.filter(task => task.list_id === where.list_id);
        }
      }

      // Apply include relations
      const include = options.include;
      if (include) {
        tasks = tasks.map(task => {
          const result: any = { ...task };
          if (include.task_logs) {
            result.task_logs = mockTaskLogs.filter(log => log.task_id === task.id);
          }
          if (include.task_labels) {
            result.task_labels = mockTaskLabels.filter(label => label.task_id === task.id);
          }
          if (include.task_attachments) {
            result.task_attachments = mockTaskAttachments.filter(attachment => attachment.task_id === task.id);
          }
          return result;
        });
      }

      // Apply ordering
      if (options.orderBy) {
        tasks.sort((a, b) => {
          const field = Object.keys(options.orderBy)[0];
          const direction = options.orderBy[field];

          if (field === 'created_at' || field === 'due_date') {
            const dateA = a[field] ? new Date(a[field]).getTime() : 0;
            const dateB = b[field] ? new Date(b[field]).getTime() : 0;
            return direction === 'desc' ? dateB - dateA : dateA - dateB;
          }
          return 0;
        });
      }

      return tasks;
    },
    findUnique: async (options: any) => {
      const task = mockTasks.find(task => task.id === options.where.id);
      if (!task) return null;

      const result: any = { ...task };
      if (options.include) {
        if (options.include.task_logs) {
          result.task_logs = mockTaskLogs.filter(log => log.task_id === task.id);
        }
        if (options.include.task_labels) {
          result.task_labels = mockTaskLabels.filter(label => label.task_id === task.id);
        }
        if (options.include.task_attachments) {
          result.task_attachments = mockTaskAttachments.filter(attachment => attachment.task_id === task.id);
        }
      }
      return result;
    },
    create: async (options: any) => {
      const taskData = options.data;

      const newTask: Task = {
        id: nextTaskId++,
        list_id: taskData.list_id,
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.due_date,
        deadline: taskData.deadline,
        reminders: taskData.reminders,
        estimate: taskData.estimate,
        actual_time: taskData.actual_time,
        priority: taskData.priority || 0,
        recurring: taskData.recurring,
        status: taskData.status || 'pending',
        created_at: new Date(),
        updated_at: new Date(),
        task_logs: [],
        task_labels: [],
        task_attachments: []
      };

      mockTasks.push(newTask);

      // Create related entities
      if (taskData.task_labels && taskData.task_labels.create) {
        for (const label of taskData.task_labels.create) {
          const newLabel: TaskLabel = {
            id: nextLabelId++,
            task_id: newTask.id,
            name: label.name,
            color: label.color,
            icon: label.icon,
            created_at: new Date()
          };
          mockTaskLabels.push(newLabel);
          newTask.task_labels!.push(newLabel);
        }
      }

      if (taskData.task_attachments && taskData.task_attachments.create) {
        for (const attachment of taskData.task_attachments.create) {
          const newAttachment: TaskAttachment = {
            id: nextAttachmentId++,
            task_id: newTask.id,
            file_name: attachment.file_name,
            file_path: attachment.file_path,
            file_type: attachment.file_type,
            file_size: attachment.file_size,
            created_at: new Date()
          };
          mockTaskAttachments.push(newAttachment);
          newTask.task_attachments!.push(newAttachment);
        }
      }

      return newTask;
    },
    update: async (options: any) => {
      const index = mockTasks.findIndex(task => task.id === options.where.id);
      if (index === -1) return null;

      const taskData = options.data;
      const updatedTask: Task = {
        ...mockTasks[index],
        ...taskData,
        updated_at: new Date()
      };

      // Handle task_labels update (delete and create)
      if (taskData.task_labels) {
        if (taskData.task_labels.deleteMany) {
          mockTaskLabels = mockTaskLabels.filter(label => label.task_id !== updatedTask.id);
        }
        if (taskData.task_labels.create) {
          for (const label of taskData.task_labels.create) {
            const newLabel: TaskLabel = {
              id: nextLabelId++,
              task_id: updatedTask.id,
              name: label.name,
              color: label.color,
              icon: label.icon,
              created_at: new Date()
            };
            mockTaskLabels.push(newLabel);
          }
        }
      }

      // Handle task_attachments update
      if (taskData.task_attachments && taskData.task_attachments.create) {
        for (const attachment of taskData.task_attachments.create) {
          const newAttachment: TaskAttachment = {
            id: nextAttachmentId++,
            task_id: updatedTask.id,
            file_name: attachment.file_name,
            file_path: attachment.file_path,
            file_type: attachment.file_type,
            file_size: attachment.file_size,
            created_at: new Date()
          };
          mockTaskAttachments.push(newAttachment);
        }
      }

      mockTasks[index] = updatedTask;
      return updatedTask;
    },
    delete: async (options: any) => {
      const index = mockTasks.findIndex(task => task.id === options.where.id);
      if (index !== -1) {
        // Delete related entities
        mockTaskLogs = mockTaskLogs.filter(log => log.task_id !== mockTasks[index].id);
        mockTaskLabels = mockTaskLabels.filter(label => label.task_id !== mockTasks[index].id);
        mockTaskAttachments = mockTaskAttachments.filter(attachment => attachment.task_id !== mockTasks[index].id);

        mockTasks.splice(index, 1);
      }
      return {};
    }
  },
  taskLog: {
    findMany: async (options: any) => {
      return mockTaskLogs.filter(log => log.task_id === options.where.task_id);
    },
    create: async (options: any) => {
      const newLog: TaskLog = {
        id: nextLogId++,
        task_id: options.data.task_id,
        action: options.data.action,
        changes: options.data.changes,
        created_at: new Date()
      };
      mockTaskLogs.push(newLog);
      return newLog;
    }
  },
  view: {
  findMany: async (options: any) => {
    return mockViews.filter(view => view.user_id === options.where.user_id);
  },
  findUnique: async (options: any) => {
    return mockViews.find(view => view.id === options.where.id && view.user_id === options.where.user_id) || null;
  },
  create: async (options: any) => {
    const viewData = options.data;
    const newView: View = {
      id: nextViewId++,
      user_id: viewData.user_id,
      name: viewData.name,
      type: viewData.type,
      filter_criteria: viewData.filter_criteria,
      sort_order: viewData.sort_order,
      show_completed: viewData.show_completed || false,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockViews.push(newView);
    return newView;
  },
  update: async (options: any) => {
    const index = mockViews.findIndex(view => view.id === options.where.id && view.user_id === options.where.user_id);
    if (index === -1) return null;

    const viewData = options.data;
    const updatedView: View = {
      ...mockViews[index],
      ...viewData,
      updated_at: new Date()
    };
    mockViews[index] = updatedView;
    return updatedView;
  },
  delete: async (options: any) => {
    const index = mockViews.findIndex(view => view.id === options.where.id && view.user_id === options.where.user_id);
    if (index !== -1) {
      mockViews.splice(index, 1);
    }
    return {};
  }
}
};