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
}

// Set up mock responses
export function setupMockDatabase() {
  // User mocks
  mockPrisma.user.findMany.mockResolvedValue(mockDatabaseResponses.users)
  mockPrisma.user.findUnique.mockImplementation(({ where }) => {
    const user = mockDatabaseResponses.users.find(u => u.id === where.id || u.email === where.email)
    return Promise.resolve(user || null)
  })
  mockPrisma.user.create.mockImplementation((data) => {
    const newUser = { ...data.data, id: mockDatabaseResponses.users.length + 1 }
    mockDatabaseResponses.users.push(newUser)
    return Promise.resolve(newUser)
  })
  mockPrisma.user.count.mockResolvedValue(mockDatabaseResponses.users.length)

  // List mocks
  mockPrisma.list.findMany.mockResolvedValue(mockDatabaseResponses.lists)
  mockPrisma.list.findUnique.mockImplementation(({ where }) => {
    const list = mockDatabaseResponses.lists.find(l => l.id === where.id)
    return Promise.resolve(list || null)
  })
  mockPrisma.list.create.mockImplementation((data) => {
    const newList = { ...data.data, id: mockDatabaseResponses.lists.length + 1 }
    mockDatabaseResponses.lists.push(newList)
    return Promise.resolve(newList)
  })
  mockPrisma.list.count.mockResolvedValue(mockDatabaseResponses.lists.length)

  // Task mocks
  mockPrisma.task.findMany.mockResolvedValue(mockDatabaseResponses.tasks)
  mockPrisma.task.findUnique.mockImplementation(({ where }) => {
    const task = mockDatabaseResponses.tasks.find(t => t.id === where.id)
    return Promise.resolve(task || null)
  })
  mockPrisma.task.create.mockImplementation((data) => {
    const newTask = { ...data.data, id: mockDatabaseResponses.tasks.length + 1 }
    mockDatabaseResponses.tasks.push(newTask)
    return Promise.resolve(newTask)
  })
  mockPrisma.task.count.mockResolvedValue(mockDatabaseResponses.tasks.length)

  // TaskView mocks
  mockPrisma.taskView.findMany.mockResolvedValue(mockDatabaseResponses.taskViews)
  mockPrisma.taskView.findUnique.mockImplementation(({ where }) => {
    const view = mockDatabaseResponses.taskViews.find(v => v.id === where.id)
    return Promise.resolve(view || null)
  })
  mockPrisma.taskView.create.mockImplementation((data) => {
    const newView = { ...data.data, id: mockDatabaseResponses.taskViews.length + 1 }
    mockDatabaseResponses.taskViews.push(newView)
    return Promise.resolve(newView)
  })
  mockPrisma.taskView.count.mockResolvedValue(mockDatabaseResponses.taskViews.length)

  // Connection mocks
  mockPrisma.$connect.mockResolvedValue(undefined)
  mockPrisma.$disconnect.mockResolvedValue(undefined)
  mockPrisma.$queryRaw.mockResolvedValue([{ test: 1 }])

  return mockPrisma
}

// Reset all mocks
export function resetMockDatabase() {
  vi.clearAllMocks()
  Object.keys(mockDatabaseResponses).forEach(key => {
    // @ts-ignore
    mockDatabaseResponses[key] = []
  })
}

// Mock Prisma module
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}))

export { mockPrisma as prisma }