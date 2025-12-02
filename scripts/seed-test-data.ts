import { mockDatabaseResponses } from '../tests/mocks/mock-db'

/**
 * Seed test data for the mock database
 * This ensures consistent test data across all test runs
 */
export function seedTestData() {
  // Clear existing data
  mockDatabaseResponses.users = []
  mockDatabaseResponses.lists = []
  mockDatabaseResponses.tasks = []
  mockDatabaseResponses.taskViews = []
  mockDatabaseResponses.taskLogs = []

  // Seed users
  mockDatabaseResponses.users.push({
    id: 1,
    email: 'test@example.com',
    password_hash: 'hashed_password',
    name: 'Test User',
    created_at: new Date(),
    updated_at: new Date(),
  })

  // Seed lists
  mockDatabaseResponses.lists.push({
    id: 1,
    user_id: 1,
    title: 'Test List',
    color: '#FF5733',
    icon: 'inbox',
    created_at: new Date(),
    updated_at: new Date(),
  })

  // Seed tasks
  mockDatabaseResponses.tasks.push({
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
  })

  // Seed task views
  mockDatabaseResponses.taskViews.push({
    id: 1,
    user_id: 1,
    name: 'Today',
    type: 'day',
    filter_criteria: JSON.stringify({ status: 'pending' }),
    sort_order: JSON.stringify({ field: 'priority', direction: 'desc' }),
    created_at: new Date(),
    updated_at: new Date(),
  })

  // Seed task logs
  mockDatabaseResponses.taskLogs.push({
    id: 1,
    task_id: 1,
    action: 'create',
    changes: JSON.stringify({ title: 'Test Task', description: 'Test Description' }),
    created_at: new Date(),
  })
}

// Export for use in tests
export { mockDatabaseResponses }