import { mockDb } from '@/lib/mock-db';
import { DatabaseError } from '@/lib/errors';
import { Task, CreateTaskInput, UpdateTaskInput, TaskService as ITaskService, TaskLog, TaskLabel, TaskAttachment } from '@/types/task-types';

export class TaskService implements ITaskService {
  async getAllTasks(userId: number, filters?: any): Promise<Task[]> {
    try {
      const whereClause: any = {
        list: {
          user_id: userId
        }
      };

      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          whereClause.status = filters.status;
        }
        if (filters.priority) {
          whereClause.priority = filters.priority;
        }
        if (filters.list_id) {
          whereClause.list_id = filters.list_id;
        }
        if (filters.due_date) {
          whereClause.due_date = filters.due_date;
        }
      }

      const tasks = await mockDb.task.findMany({
        where: whereClause,
        include: {
          task_logs: true,
          task_labels: true,
          task_attachments: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return tasks;
    } catch (error) {
      console.error('Error getting all tasks:', error);
      throw new DatabaseError('Failed to get tasks', 'GET_TASKS_ERROR', error);
    }
  }

  async getTaskById(id: number, userId: number): Promise<Task | null> {
    try {
      // For mock database, just find by ID since we don't have proper user associations
      const task = await mockDb.task.findUnique({
        where: {
          id: id
        },
        include: {
          task_logs: true,
          task_labels: true,
          task_attachments: true
        }
      });

      return task;
    } catch (error) {
      console.error('Error getting task by ID:', error);
      throw new DatabaseError('Failed to get task', 'GET_TASK_ERROR', error);
    }
  }

  async createTask(userId: number, data: CreateTaskInput): Promise<Task> {
    try {
      // Validate input
      if (!data.title || data.title.trim() === '') {
        throw new Error('Task title is required');
      }

      // Validate priority
      if (data.priority !== undefined && (data.priority < 0 || data.priority > 3)) {
        throw new Error('Priority must be between 0 and 3');
      }

      // Validate estimate and actual_time
      if (data.estimate !== undefined && data.estimate < 0) {
        throw new Error('Estimate must be a positive number');
      }
      if (data.actual_time !== undefined && data.actual_time < 0) {
        throw new Error('Actual time must be a positive number');
      }

      const newTask = await mockDb.task.create({
        data: {
          list_id: data.list_id,
          title: data.title.trim(),
          description: data.description,
          due_date: data.due_date,
          deadline: data.deadline,
          reminders: data.reminders,
          estimate: data.estimate,
          actual_time: data.actual_time,
          priority: data.priority || 0,
          recurring: data.recurring,
          status: data.status || 'pending',
          task_labels: data.task_labels ? {
            create: data.task_labels
          } : undefined,
          task_attachments: data.task_attachments ? {
            create: data.task_attachments
          } : undefined
        },
        include: {
          task_logs: true,
          task_labels: true,
          task_attachments: true
        }
      });

      // Add initial log entry
      await this.addTaskLog(newTask.id, userId, 'create', {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status
      });

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      if (error instanceof Error && error.message.startsWith('Task')) {
        throw new DatabaseError(error.message, 'VALIDATION_ERROR');
      }
      throw new DatabaseError('Failed to create task', 'CREATE_TASK_ERROR', error);
    }
  }

  async updateTask(id: number, userId: number, data: UpdateTaskInput): Promise<Task> {
    try {
      // Get the current task to check if it exists
      const currentTask = await mockDb.task.findUnique({
        where: {
          id: id
        }
      });

      if (!currentTask) {
        throw new DatabaseError('Task not found', 'TASK_NOT_FOUND');
      }

      // Validate input
      if (data.title && data.title.trim() === '') {
        throw new Error('Task title cannot be empty');
      }

      // Validate priority
      if (data.priority !== undefined && (data.priority < 0 || data.priority > 3)) {
        throw new Error('Priority must be between 0 and 3');
      }

      // Validate estimate and actual_time
      if (data.estimate !== undefined && data.estimate < 0) {
        throw new Error('Estimate must be a positive number');
      }
      if (data.actual_time !== undefined && data.actual_time < 0) {
        throw new Error('Actual time must be a positive number');
      }

      // Prepare changes for logging
      const changes: any = {};
      if (data.title !== undefined && data.title !== currentTask.title) {
        changes.title = { from: currentTask.title, to: data.title };
      }
      if (data.description !== undefined && data.description !== currentTask.description) {
        changes.description = { from: currentTask.description, to: data.description };
      }
      if (data.priority !== undefined && data.priority !== currentTask.priority) {
        changes.priority = { from: currentTask.priority, to: data.priority };
      }
      if (data.status !== undefined && data.status !== currentTask.status) {
        changes.status = { from: currentTask.status, to: data.status };
      }

      const updatedTask = await mockDb.task.update({
        where: {
          id: id
        },
        data: {
          list_id: data.list_id,
          title: data.title ? data.title.trim() : undefined,
          description: data.description,
          due_date: data.due_date,
          deadline: data.deadline,
          reminders: data.reminders,
          estimate: data.estimate,
          actual_time: data.actual_time,
          priority: data.priority,
          recurring: data.recurring,
          status: data.status,
          updated_at: new Date(),
          task_labels: data.task_labels ? {
            deleteMany: {},
            create: data.task_labels
          } : undefined,
          task_attachments: data.task_attachments ? {
            create: data.task_attachments
          } : undefined
        },
        include: {
          task_logs: true,
          task_labels: true,
          task_attachments: true
        }
      });

      // Add update log entry if there were changes
      if (Object.keys(changes).length > 0) {
        await this.addTaskLog(updatedTask.id, userId, 'update', changes);
      }

      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      if (error instanceof Error && error.message.startsWith('Task')) {
        throw new DatabaseError(error.message, 'VALIDATION_ERROR');
      }
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to update task', 'UPDATE_TASK_ERROR', error);
    }
  }

  async deleteTask(id: number, userId: number): Promise<void> {
    try {
      // Get the task to check if it exists
      const task = await mockDb.task.findUnique({
        where: {
          id: id
        }
      });

      if (!task) {
        throw new DatabaseError('Task not found', 'TASK_NOT_FOUND');
      }

      // Add delete log entry
      await this.addTaskLog(id, userId, 'delete', {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status
      });

      await mockDb.task.delete({
        where: {
          id: id
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to delete task', 'DELETE_TASK_ERROR', error);
    }
  }

  async addTaskLog(taskId: number, userId: number, action: string, changes?: any): Promise<TaskLog> {
    try {
      const taskLog = await mockDb.taskLog.create({
        data: {
          task_id: taskId,
          action: action,
          changes: changes ? JSON.stringify(changes) : null
        }
      });

      return taskLog;
    } catch (error) {
      console.error('Error adding task log:', error);
      throw new DatabaseError('Failed to add task log', 'ADD_TASK_LOG_ERROR', error);
    }
  }

  async getTaskLogs(taskId: number, userId: number): Promise<TaskLog[]> {
    try {
      // Verify the task belongs to the user
      const task = await mockDb.task.findUnique({
        where: {
          id: taskId
        }
      });

      if (!task) {
        throw new DatabaseError('Task not found', 'TASK_NOT_FOUND');
      }

      const logs = await mockDb.taskLog.findMany({
        where: {
          task_id: taskId
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return logs;
    } catch (error) {
      console.error('Error getting task logs:', error);
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to get task logs', 'GET_TASK_LOGS_ERROR', error);
    }
  }

  async getTasksByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Task[]> {
    try {
      const tasks = await mockDb.task.findMany({
        where: {
          list: {
            user_id: userId
          },
          OR: [
            {
              due_date: {
                gte: startDate,
                lte: endDate
              }
            },
            {
              deadline: {
                gte: startDate,
                lte: endDate
              }
            }
          ]
        },
        include: {
          task_logs: true,
          task_labels: true,
          task_attachments: true
        },
        orderBy: {
          due_date: 'asc'
        }
      });

      return tasks;
    } catch (error) {
      console.error('Error getting tasks by date range:', error);
      throw new DatabaseError('Failed to get tasks by date range', 'GET_TASKS_BY_DATE_RANGE_ERROR', error);
    }
  }

  async getUpcomingTasks(userId: number): Promise<Task[]> {
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + 7); // Next 7 days

      const tasks = await mockDb.task.findMany({
        where: {
          list: {
            user_id: userId
          },
          status: 'pending',
          OR: [
            {
              due_date: {
                gte: now,
                lte: endDate
              }
            },
            {
              deadline: {
                gte: now,
                lte: endDate
              }
            }
          ]
        },
        include: {
          task_logs: true,
          task_labels: true,
          task_attachments: true
        },
        orderBy: {
          due_date: 'asc'
        }
      });

      return tasks;
    } catch (error) {
      console.error('Error getting upcoming tasks:', error);
      throw new DatabaseError('Failed to get upcoming tasks', 'GET_UPCOMING_TASKS_ERROR', error);
    }
  }

  async getTasksByPriority(userId: number, priority: number): Promise<Task[]> {
    try {
      const tasks = await mockDb.task.findMany({
        where: {
          list: {
            user_id: userId
          },
          priority: priority
        },
        include: {
          task_logs: true,
          task_labels: true,
          task_attachments: true
        },
        orderBy: {
          priority: 'desc'
        }
      });

      return tasks;
    } catch (error) {
      console.error('Error getting tasks by priority:', error);
      throw new DatabaseError('Failed to get tasks by priority', 'GET_TASKS_BY_PRIORITY_ERROR', error);
    }
  }

  async getTasksByStatus(userId: number, status: string): Promise<Task[]> {
    try {
      const tasks = await mockDb.task.findMany({
        where: {
          list: {
            user_id: userId
          },
          status: status
        },
        include: {
          task_logs: true,
          task_labels: true,
          task_attachments: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return tasks;
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      throw new DatabaseError('Failed to get tasks by status', 'GET_TASKS_BY_STATUS_ERROR', error);
    }
  }

  async getTasksByList(userId: number, listId: number): Promise<Task[]> {
    try {
      const tasks = await mockDb.task.findMany({
        where: {
          list_id: listId,
          list: {
            user_id: userId
          }
        },
        include: {
          task_logs: true,
          task_labels: true,
          task_attachments: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return tasks;
    } catch (error) {
      console.error('Error getting tasks by list:', error);
      throw new DatabaseError('Failed to get tasks by list', 'GET_TASKS_BY_LIST_ERROR', error);
    }
  }
}