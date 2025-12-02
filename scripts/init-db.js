import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database initialization...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connection established');

    // Create initial tables if they don't exist
    console.log('Database tables are ready');

    // Seed initial data for development
    await seedDevelopmentData();

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedDevelopmentData() {
  if (process.env.NODE_ENV !== 'development') {
    console.log('Skipping seeding in non-development environment');
    return;
  }

  console.log('Seeding development data...');

  // Check if we already have data
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('Database already seeded');
    return;
  }

  // Create sample user
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password_hash: 'hashed_password_placeholder',
      name: 'Sample User'
    }
  });

  // Create sample lists
  const inboxList = await prisma.list.create({
    data: {
      user_id: user.id,
      title: 'Inbox',
      color: '#FF5733',
      icon: 'inbox'
    }
  });

  const workList = await prisma.list.create({
    data: {
      user_id: user.id,
      title: 'Work',
      color: '#4285F4',
      icon: 'briefcase'
    }
  });

  const personalList = await prisma.list.create({
    data: {
      user_id: user.id,
      title: 'Personal',
      color: '#34A853',
      icon: 'heart'
    }
  });

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
  });

  // Create sample task view
  await prisma.taskView.create({
    data: {
      user_id: user.id,
      name: 'Today',
      type: 'day',
      filter_criteria: JSON.stringify({ status: 'pending' }),
      sort_order: JSON.stringify({ field: 'priority', direction: 'desc' })
    }
  });

  console.log('Development data seeded successfully');
}

if (require.main === module) {
  main();
}

module.exports = { main };