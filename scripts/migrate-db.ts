import { prisma } from '../prisma/prisma.config'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function runMigrations() {
  console.log('Starting database migration process...')

  try {
    // Check if database file exists
    const dbPath = path.resolve(__dirname, '../dev.db')
    const dbExists = fs.existsSync(dbPath)

    if (dbExists) {
      console.log('Database file already exists')
    } else {
      console.log('No existing database file found, creating new one')
    }

    // Run Prisma migrations
    console.log('Running Prisma migrations...')
    try {
      execSync('bunx prisma migrate dev --name init', { stdio: 'inherit' })
      console.log('Migrations completed successfully')
    } catch (migrationError) {
      console.error('Migration failed, trying reset...')
      execSync('bunx prisma migrate reset --force', { stdio: 'inherit' })
      execSync('bunx prisma migrate dev --name init', { stdio: 'inherit' })
    }

    // Test database connection
    await prisma.$connect()
    console.log('Database connection verified')

    // Run database seeding if in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Running database seeding for development...')
      await seedDevelopmentData()
    }

    console.log('Database migration process completed successfully')
  } catch (error) {
    console.error('Database migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function seedDevelopmentData() {
  try {
    // Check if data already exists
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      console.log('Database already contains data, skipping seeding')
      return
    }

    console.log('Seeding development data...')

    // Create sample user
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password_hash: 'hashed_password_placeholder',
        name: 'Sample User'
      }
    })

    // Create sample lists
    const inboxList = await prisma.list.create({
      data: {
        user_id: user.id,
        title: 'Inbox',
        color: '#FF5733',
        icon: 'inbox'
      }
    })

    const workList = await prisma.list.create({
      data: {
        user_id: user.id,
        title: 'Work',
        color: '#4285F4',
        icon: 'briefcase'
      }
    })

    const personalList = await prisma.list.create({
      data: {
        user_id: user.id,
        title: 'Personal',
        color: '#34A853',
        icon: 'heart'
      }
    })

    // Create sample tasks
    await prisma.task.createMany({
      data: [
        {
          list_id: inboxList.id,
          title: 'Review project requirements',
          description: 'Go through the technical specification document',
          priority: 2,
          status: 'pending',
          estimate: 60
        },
        {
          list_id: workList.id,
          title: 'Implement database schema',
          description: 'Set up all required database tables',
          priority: 1,
          status: 'in_progress',
          estimate: 120,
          actual_time: 45
        },
        {
          list_id: personalList.id,
          title: 'Buy groceries',
          description: 'Milk, eggs, bread, vegetables',
          priority: 3,
          status: 'pending',
          estimate: 30
        }
      ]
    })

    // Create sample task view
    await prisma.taskView.create({
      data: {
        user_id: user.id,
        name: 'Today',
        type: 'day',
        filter_criteria: JSON.stringify({ status: 'pending' }),
        sort_order: JSON.stringify({ field: 'priority', direction: 'desc' })
      }
    })

    console.log('Development data seeded successfully')
  } catch (error) {
    console.error('Error during database seeding:', error)
    throw error
  }
}

if (require.main === module) {
  runMigrations()
}

export { runMigrations, seedDevelopmentData }