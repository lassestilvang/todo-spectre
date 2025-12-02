import { prisma } from '../prisma/prisma.config'
import { faker } from '@faker-js/faker'

async function seedTestData() {
  console.log('Starting test data seeding...')

  try {
    await prisma.$connect()

    // Clear existing data
    console.log('Clearing existing test data...')
    await clearTestData()

    // Create test user
    console.log('Creating test user...')
    const testUser = await createTestUser()

    // Create test lists
    console.log('Creating test lists...')
    const testLists = await createTestLists(testUser.id)

    // Create test tasks
    console.log('Creating test tasks...')
    await createTestTasks(testUser.id, testLists)

    // Create test views
    console.log('Creating test views...')
    await createTestViews(testUser.id)

    console.log('Test data seeding completed successfully')
  } catch (error) {
    console.error('Test data seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function clearTestData() {
  // Delete all data in reverse order of dependencies
  const models = [
    'taskAttachment', 'taskLabel', 'taskLog', 'task',
    'taskView', 'list', 'user'
  ]

  for (const model of models) {
    try {
      // @ts-ignore
      await prisma[model].deleteMany()
      console.log(`Cleared ${model} data`)
    } catch (error) {
      console.log(`No ${model} data to clear or error:`, error)
    }
  }
}

async function createTestUser() {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      password_hash: 'test_password_hash',
      name: 'Test User'
    }
  })
}

async function createTestLists(userId: number) {
  const lists = [
    {
      title: 'Work',
      color: '#4285F4',
      icon: 'briefcase'
    },
    {
      title: 'Personal',
      color: '#34A853',
      icon: 'heart'
    },
    {
      title: 'Shopping',
      color: '#FBBC04',
      icon: 'cart'
    },
    {
      title: 'Projects',
      color: '#EA4335',
      icon: 'folder'
    }
  ]

  const createdLists = []
  for (const list of lists) {
    const createdList = await prisma.list.create({
      data: {
        user_id: userId,
        ...list
      }
    })
    createdLists.push(createdList)
  }

  return createdLists
}

async function createTestTasks(userId: number, lists: any[]) {
  const statuses = ['pending', 'in_progress', 'completed']
  const priorities = [0, 1, 2, 3]

  // Create tasks for each list
  for (const list of lists) {
    const taskCount = Math.floor(Math.random() * 5) + 3 // 3-7 tasks per list

    for (let i = 0; i < taskCount; i++) {
      await prisma.task.create({
        data: {
          list_id: list.id,
          title: faker.lorem.words({ min: 2, max: 5 }),
          description: faker.lorem.sentence(),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          estimate: Math.floor(Math.random() * 120) + 15, // 15-135 minutes
          due_date: faker.date.future(),
          created_at: faker.date.recent(),
          updated_at: faker.date.recent()
        }
      })
    }
  }

  // Create some tasks without lists (inbox tasks)
  const inboxTaskCount = Math.floor(Math.random() * 3) + 2 // 2-4 inbox tasks
  for (let i = 0; i < inboxTaskCount; i++) {
    await prisma.task.create({
      data: {
        title: `Inbox: ${faker.lorem.words({ min: 2, max: 4 })}`,
        description: faker.lorem.sentence(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        estimate: Math.floor(Math.random() * 60) + 10, // 10-70 minutes
        created_at: faker.date.recent(),
        updated_at: faker.date.recent()
      }
    })
  }
}

async function createTestViews(userId: number) {
  const views = [
    {
      name: 'Today',
      type: 'day',
      filter_criteria: JSON.stringify({ status: 'pending', due_date: { lte: new Date().toISOString() } }),
      sort_order: JSON.stringify({ field: 'priority', direction: 'desc' })
    },
    {
      name: 'This Week',
      type: 'week',
      filter_criteria: JSON.stringify({ status: 'pending' }),
      sort_order: JSON.stringify({ field: 'due_date', direction: 'asc' })
    },
    {
      name: 'High Priority',
      type: 'custom',
      filter_criteria: JSON.stringify({ priority: { gte: 2 } }),
      sort_order: JSON.stringify({ field: 'priority', direction: 'desc' })
    }
  ]

  for (const view of views) {
    await prisma.taskView.create({
      data: {
        user_id: userId,
        ...view
      }
    })
  }
}

if (require.main === module) {
  seedTestData()
}

export { seedTestData, clearTestData, createTestUser, createTestLists, createTestTasks, createTestViews }