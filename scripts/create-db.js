import sqlite3 from 'sqlite3';
import fs from 'fs';

// Create database file if it doesn't exist
const dbFile = './dev.db';
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, '');
  console.log('Created database file: dev.db');
}

// Connect to database
const db = new sqlite3.Database(dbFile);

console.log('Database connection established');

// Create tables based on Prisma schema
const createTables = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lists table
CREATE TABLE IF NOT EXISTS lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATETIME,
  deadline DATETIME,
  reminders TEXT,
  estimate INTEGER,
  actual_time INTEGER,
  priority INTEGER DEFAULT 0,
  recurring TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE SET NULL
);

-- Task views
CREATE TABLE IF NOT EXISTS task_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  filter_criteria TEXT,
  sort_order TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Task logs
CREATE TABLE IF NOT EXISTS task_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  changes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Task labels
CREATE TABLE IF NOT EXISTS task_labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Task attachments
CREATE TABLE IF NOT EXISTS task_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS lists_user_id_idx ON lists(user_id);
CREATE INDEX IF NOT EXISTS tasks_list_id_idx ON tasks(list_id);
CREATE INDEX IF NOT EXISTS task_views_user_id_idx ON task_views(user_id);
CREATE INDEX IF NOT EXISTS task_logs_task_id_idx ON task_logs(task_id);
CREATE INDEX IF NOT EXISTS task_labels_task_id_idx ON task_labels(task_id);
CREATE INDEX IF NOT EXISTS task_attachments_task_id_idx ON task_attachments(task_id);
`;

db.serialize(() => {
  // Execute table creation
  db.exec(createTables, (err) => {
    if (err) {
      console.error('Error creating tables:', err);
      db.close();
      process.exit(1);
    }

    console.log('Database tables created successfully');

    // Seed development data if in development environment
    if (process.env.NODE_ENV === 'development') {
      seedDevelopmentData(db);
    } else {
      console.log('Skipping seeding in non-development environment');
      db.close();
    }
  });
});

function seedDevelopmentData(db) {
  console.log('Seeding development data...');

  // Check if we already have data
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error('Error checking user count:', err);
      db.close();
      return;
    }

    if (row.count > 0) {
      console.log('Database already seeded');
      db.close();
      return;
    }

    // Insert sample data
    db.serialize(() => {
      // Insert sample user
      db.run(`
        INSERT INTO users (email, password_hash, name)
        VALUES ('user@example.com', 'hashed_password_placeholder', 'Sample User')
      `, function(err) {
        if (err) {
          console.error('Error inserting user:', err);
          db.close();
          return;
        }

        const userId = this.lastID;

        // Insert sample lists
        const lists = [
          { title: 'Inbox', color: '#FF5733', icon: 'inbox' },
          { title: 'Work', color: '#4285F4', icon: 'briefcase' },
          { title: 'Personal', color: '#34A853', icon: 'heart' }
        ];

        const listIds = [];
        lists.forEach(list => {
          db.run(`
            INSERT INTO lists (user_id, title, color, icon)
            VALUES (?, ?, ?, ?)
          `, [userId, list.title, list.color, list.icon], function(err) {
            if (err) {
              console.error('Error inserting list:', err);
              return;
            }
            listIds.push(this.lastID);
          });
        });

        // Insert sample tasks
        const tasks = [
          {
            title: 'Review project requirements',
            description: 'Go through the technical specification document',
            priority: 2,
            status: 'pending',
            estimate: 60
          },
          {
            title: 'Implement database schema',
            description: 'Set up all required database tables',
            priority: 1,
            status: 'in_progress',
            estimate: 120,
            actual_time: 45
          },
          {
            title: 'Buy groceries',
            description: 'Milk, eggs, bread, vegetables',
            priority: 3,
            status: 'pending',
            estimate: 30
          }
        ];

        // We'll use the first list ID for all tasks
        setTimeout(() => {
          const listId = listIds[0] || 1; // Use first list ID or default to 1

          tasks.forEach(task => {
            db.run(`
              INSERT INTO tasks (list_id, title, description, priority, status, estimate, actual_time)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              listId,
              task.title,
              task.description,
              task.priority,
              task.status,
              task.estimate,
              task.actual_time || null
            ]);
          });

          // Insert sample task view
          db.run(`
            INSERT INTO task_views (user_id, name, type, filter_criteria, sort_order)
            VALUES (?, ?, ?, ?, ?)
          `, [
            userId,
            'Today',
            'day',
            JSON.stringify({ status: 'pending' }),
            JSON.stringify({ field: 'priority', direction: 'desc' })
          ]);

          console.log('Development data seeded successfully');
          db.close();
        }, 100); // Small delay to ensure lists are inserted first
      });
    });
  });
}