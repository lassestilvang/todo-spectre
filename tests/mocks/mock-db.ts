import { PrismaClient } from '@prisma/client'
import { vi } from 'vitest'

// Mock Prisma Client
export const mockPrisma = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  list: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  task: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  taskView: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  view: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $queryRaw: vi.fn(),
  $transaction: vi.fn(),
  $on: vi.fn(),
  executeWithErrorHandling: vi.fn(),
} as unknown as PrismaClient

// Mock database responses
export const mockDatabaseResponses = {
  users: [
    {
      id: 1,
      email: 'test@example.com',
      password_hash: 'hashed_password',
      name: 'Test User',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  lists: [
    {
      id: 1,
      user_id: 1,
      title: 'Test List',
      color: '#FF5733',
      icon: 'inbox',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  tasks: [
    {
      id: 1,
      list_id: 1,
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 1,
      created_at: new Date(),
      updated_at: new Date(),
      task_logs: [],
      task_labels: [],
      task_attachments: []
    },
    {
      id: 2,
      list_id: 1,
      title: 'Completed Task',
      description: 'Completed Description',
      status: 'completed',
      priority: 2,
      created_at: new Date(),
      updated_at: new Date(),
      task_logs: [],
      task_labels: [],
      task_attachments: []
    },
  ],
  taskViews: [
    {
      id: 1,
      user_id: 1,
      name: 'Today',
      type: 'day',
      filter_criteria: JSON.stringify({ status: 'pending' }),
      sort_order: JSON.stringify({ field: 'priority', direction: 'desc' }),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  views: [
    {
      id: 1,
      user_id: 1,
      name: 'Test View',
      type: 'day',
      filter_criteria: JSON.stringify({ status: 'pending' }),
      sort_order: JSON.stringify({ field: 'priority', direction: 'desc' }),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  taskLogs: [
    {
      id: 1,
      task_id: 1,
      action: 'create',
      changes: JSON.stringify({ title: 'Test Task', description: 'Test Description' }),
      created_at: new Date(),
    },
  ],
}

// Set up mock responses
export function setupMockDatabase() {
  // Simple mock implementation that bypasses complex typing
  const mockImplementation = (method: string, returnValue: any) => {
    return vi.fn().mockImplementation(() => Promise.resolve(returnValue))
  }

  // User mocks
  mockPrisma.user.findMany = mockImplementation('findMany', mockDatabaseResponses.users)
  mockPrisma.user.findUnique = vi.fn().mockImplementation(({ where }) => {
    const user = mockDatabaseResponses.users.find(u => u.id === where.id || u.email === where.email)
    return Promise.resolve(user || null)
  })
  mockPrisma.user.create = vi.fn().mockImplementation((data) => {
    const newUser = {
      id: mockDatabaseResponses.users.length + 1,
      email: data.data.email,
      password_hash: data.data.password_hash,
      name: data.data.name || 'Test User',
      created_at: new Date(),
      updated_at: new Date()
    }
    mockDatabaseResponses.users.push(newUser)
    return Promise.resolve(newUser)
  })
  mockPrisma.user.count = mockImplementation('count', mockDatabaseResponses.users.length)

  // List mocks
  mockPrisma.list.findMany = mockImplementation('findMany', mockDatabaseResponses.lists)
  mockPrisma.list.findUnique = vi.fn().mockImplementation(({ where }) => {
    const list = mockDatabaseResponses.lists.find(l => l.id === where.id)
    return Promise.resolve(list || null)
  })
  mockPrisma.list.create = vi.fn().mockImplementation((data) => {
    const newList = { ...data.data, id: mockDatabaseResponses.lists.length + 1 }
    mockDatabaseResponses.lists.push(newList)
    return Promise.resolve(newList)
  })
  mockPrisma.list.count = mockImplementation('count', mockDatabaseResponses.lists.length)

  // Task mocks
  mockPrisma.task.findMany = vi.fn().mockImplementation(({ where }) => {
    let tasks = [...mockDatabaseResponses.tasks]

    // Apply filters if provided
    if (where) {
      // Handle list.user_id filter
      if (where.list && where.list.user_id) {
        tasks = tasks.filter(task => task.list_id === where.list.user_id)
      }
      // Handle status filter
      if (where.status) {
        tasks = tasks.filter(task => task.status === where.status)
      }
      // Handle priority filter
      if (where.priority) {
        tasks = tasks.filter(task => task.priority === where.priority)
      }
      // Handle list_id filter
      if (where.list_id) {
        tasks = tasks.filter(task => task.list_id === where.list_id)
      }
      // Handle complex AND conditions (list.user_id AND priority)
      if (where.AND) {
        where.AND.forEach(condition => {
          if (condition.list && condition.list.user_id) {
            tasks = tasks.filter(task => task.list_id === condition.list.user_id)
          }
          if (condition.priority) {
            tasks = tasks.filter(task => task.priority === condition.priority)
          }
          if (condition.status) {
            tasks = tasks.filter(task => task.status === condition.status)
          }
        })
      }
    }

    return Promise.resolve(tasks)
  })
  mockPrisma.task.findUnique = vi.fn().mockImplementation(({ where }) => {
    const task = mockDatabaseResponses.tasks.find(t => t.id === where.id)
    return Promise.resolve(task || null)
  })
  mockPrisma.task.create = vi.fn().mockImplementation((data) => {
    const newTask = {
      ...data.data,
      id: mockDatabaseResponses.tasks.length + 1,
      created_at: new Date(),
      updated_at: new Date(),
      task_logs: [],
      task_labels: [],
      task_attachments: []
    }
    mockDatabaseResponses.tasks.push(newTask)
    return Promise.resolve(newTask)
  })
  mockPrisma.task.update = vi.fn().mockImplementation(({ where, data }) => {
    const taskIndex = mockDatabaseResponses.tasks.findIndex(t => t.id === where.id)
    if (taskIndex === -1) return Promise.resolve(null)

    const updatedTask = {
      ...mockDatabaseResponses.tasks[taskIndex],
      ...data,
      updated_at: new Date()
    }
    mockDatabaseResponses.tasks[taskIndex] = updatedTask
    return Promise.resolve(updatedTask)
  })
  mockPrisma.task.delete = vi.fn().mockImplementation(({ where }) => {
    const taskIndex = mockDatabaseResponses.tasks.findIndex(t => t.id === where.id)
    if (taskIndex === -1) return Promise.resolve(null)

    const deletedTask = mockDatabaseResponses.tasks[taskIndex]
    mockDatabaseResponses.tasks.splice(taskIndex, 1)
    return Promise.resolve(deletedTask)
  })
  mockPrisma.task.count = mockImplementation('count', mockDatabaseResponses.tasks.length)

  // TaskView mocks
  mockPrisma.taskView.findMany = vi.fn().mockImplementation(({ where }) => {
    let views = [...mockDatabaseResponses.taskViews]

    if (where && where.user_id) {
      views = views.filter(view => view.user_id === where.user_id)
    }

    return Promise.resolve(views)
  })
  mockPrisma.taskView.findUnique = vi.fn().mockImplementation(({ where }) => {
    const view = mockDatabaseResponses.taskViews.find(v => v.id === where.id && v.user_id === where.user_id)
    return Promise.resolve(view || null)
  })
  mockPrisma.taskView.create = vi.fn().mockImplementation((data) => {
    const newView = {
      ...data.data,
      id: mockDatabaseResponses.taskViews.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    }
    mockDatabaseResponses.taskViews.push(newView)
    return Promise.resolve(newView)
  })
  mockPrisma.taskView.update = vi.fn().mockImplementation(({ where, data }) => {
    const viewIndex = mockDatabaseResponses.taskViews.findIndex(v => v.id === where.id && v.user_id === where.user_id)
    if (viewIndex === -1) return Promise.resolve(null)

    const updatedView = {
      ...mockDatabaseResponses.taskViews[viewIndex],
      ...data,
      updated_at: new Date()
    }
    mockDatabaseResponses.taskViews[viewIndex] = updatedView
    return Promise.resolve(updatedView)
  })
  mockPrisma.taskView.delete = vi.fn().mockImplementation(({ where }) => {
    const viewIndex = mockDatabaseResponses.taskViews.findIndex(v => v.id === where.id && v.user_id === where.user_id)
    if (viewIndex === -1) return Promise.resolve(null)

    mockDatabaseResponses.taskViews.splice(viewIndex, 1)
    return Promise.resolve({})
  })
  mockPrisma.taskView.count = mockImplementation('count', mockDatabaseResponses.taskViews.length)

  // View mocks
  mockPrisma.view.findMany = vi.fn().mockImplementation(({ where }) => {
    let views = [...mockDatabaseResponses.views]

    if (where && where.user_id) {
      views = views.filter(view => view.user_id === where.user_id)
    }

    return Promise.resolve(views)
  })
  mockPrisma.view.findUnique = vi.fn().mockImplementation(({ where }) => {
    const view = mockDatabaseResponses.views.find(v => v.id === where.id && v.user_id === where.user_id)
    return Promise.resolve(view || null)
  })
  mockPrisma.view.create = vi.fn().mockImplementation((data) => {
    const newView = {
      ...data.data,
      id: mockDatabaseResponses.views.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    }
    mockDatabaseResponses.views.push(newView)
    return Promise.resolve(newView)
  })
  mockPrisma.view.update = vi.fn().mockImplementation(({ where, data }) => {
    const viewIndex = mockDatabaseResponses.views.findIndex(v => v.id === where.id && v.user_id === where.user_id)
    if (viewIndex === -1) return Promise.resolve(null)

    const updatedView = {
      ...mockDatabaseResponses.views[viewIndex],
      ...data,
      updated_at: new Date()
    }
    mockDatabaseResponses.views[viewIndex] = updatedView
    return Promise.resolve(updatedView)
  })
  mockPrisma.view.delete = vi.fn().mockImplementation(({ where }) => {
    const viewIndex = mockDatabaseResponses.views.findIndex(v => v.id === where.id && v.user_id === where.user_id)
    if (viewIndex === -1) return Promise.resolve(null)

    mockDatabaseResponses.views.splice(viewIndex, 1)
    return Promise.resolve({})
  })
  mockPrisma.view.count = mockImplementation('count', mockDatabaseResponses.views.length)

  // TaskLog mocks
  mockPrisma.taskLog = {
    findMany: vi.fn().mockImplementation(({ where }) => {
      let logs = [...mockDatabaseResponses.taskLogs]

      if (where && where.task_id) {
        logs = logs.filter(log => log.task_id === where.task_id)
      }

      return Promise.resolve(logs)
    }),
    findUnique: vi.fn().mockImplementation(({ where }) => {
      const log = mockDatabaseResponses.taskLogs.find(l => l.id === where.id)
      return Promise.resolve(log || null)
    }),
    create: vi.fn().mockImplementation((data) => {
      const newLog = {
        ...data.data,
        id: mockDatabaseResponses.taskLogs.length + 1,
        created_at: new Date()
      }
      mockDatabaseResponses.taskLogs.push(newLog)
      return Promise.resolve(newLog)
    }),
    update: vi.fn().mockImplementation(({ where, data }) => {
      const logIndex = mockDatabaseResponses.taskLogs.findIndex(l => l.id === where.id)
      if (logIndex === -1) return Promise.resolve(null)

      const updatedLog = {
        ...mockDatabaseResponses.taskLogs[logIndex],
        ...data,
        updated_at: new Date()
      }
      mockDatabaseResponses.taskLogs[logIndex] = updatedLog
      return Promise.resolve(updatedLog)
    }),
    delete: vi.fn().mockImplementation(({ where }) => {
      const logIndex = mockDatabaseResponses.taskLogs.findIndex(l => l.id === where.id)
      if (logIndex === -1) return Promise.resolve(null)

      mockDatabaseResponses.taskLogs.splice(logIndex, 1)
      return Promise.resolve({})
    }),
    count: mockImplementation('count', mockDatabaseResponses.taskLogs.length)
  }

  // Connection mocks
  mockPrisma.$connect = mockImplementation('$connect', undefined)
  mockPrisma.$disconnect = mockImplementation('$disconnect', undefined)
  mockPrisma.$queryRaw = mockImplementation('$queryRaw', [{ test: 1 }])

  return mockPrisma
}

// Reset all mocks
export function resetMockDatabase() {
  vi.clearAllMocks()
  Object.keys(mockDatabaseResponses).forEach(key => {
    // @ts-expect-error - This is a mock function that intentionally has incorrect typing
    mockDatabaseResponses[key] = []
  })
}

// Mock Prisma module
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}))

export { mockPrisma as prisma }