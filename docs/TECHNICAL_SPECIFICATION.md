# Next.js Daily Task Planner - Technical Specification

## 1. Project Overview
A production-ready Next.js application for daily task planning with clear separation of concerns, API routes, and component hierarchy.

## 2. Project Structure

```
todo-spectre/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── (auth)/           # Authentication routes
│   │   ├── (main)/           # Main application routes
│   │   └── layout.tsx        # Root layout
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Core business logic
│   ├── hooks/                # Custom React hooks
│   ├── context/              # React context providers
│   ├── styles/               # Global styles and CSS
│   ├── types/                # TypeScript types
│   ├── utils/                # Utility functions
│   └── config/               # Configuration files
├── public/                   # Static assets
├── prisma/                   # Database schema
├── scripts/                  # Build/deployment scripts
└── tests/                    # Test files

## 3. Database Schema (SQLite)

### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lists table
CREATE TABLE lists (
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
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATETIME,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE SET NULL
);

-- Task views
CREATE TABLE task_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'day', 'week', 'month', 'custom'
  filter_criteria TEXT, -- JSON with filter rules
  sort_order TEXT, -- JSON with sort rules
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 4. API Routes Structure

### RESTful API Endpoints

```
GET    /api/lists              - Get all lists
POST   /api/lists              - Create new list
GET    /api/lists/:id          - Get specific list
PUT    /api/lists/:id          - Update list
DELETE /api/lists/:id          - Delete list

GET    /api/tasks              - Get all tasks (with filters)
POST   /api/tasks              - Create new task
GET    /api/tasks/:id          - Get specific task
PUT    /api/tasks/:id          - Update task
DELETE /api/tasks/:id          - Delete task

GET    /api/views              - Get all views
POST   /api/views              - Create new view
GET    /api/views/:id          - Get specific view
PUT    /api/views/:id          - Update view
DELETE /api/views/:id          - Delete view

GET    /api/search             - Search tasks and lists
```

## 5. Component Hierarchy

### Core Components

```
App
├── AuthProvider
│   ├── AuthContext
│   └── AuthHooks
├── TaskProvider
│   ├── TaskContext
│   └── TaskHooks
├── Layout
│   ├── Header
│   │   ├── Navigation
│   │   ├── SearchBar
│   │   └── UserMenu
│   ├── Sidebar
│   │   ├── ListNavigation
│   │   ├── ViewSelector
│   │   └── QuickActions
│   └── MainContent
│       ├── ViewContainer
│       │   ├── DayView
│       │   ├── WeekView
│       │   ├── MonthView
│       │   └── CustomView
│       └── TaskList
│           ├── TaskItem
│           │   ├── TaskHeader
│           │   ├── TaskContent
│           │   └── TaskActions
│           └── TaskForm
└── Modals
    ├── CreateListModal
    ├── CreateTaskModal
    └── SettingsModal
```

## 6. State Management Approach

### Hybrid State Management

```typescript
// Core state management strategy
const stateManagement = {
  // Global state (persistent across app)
  global: {
    user: {
      authStatus: 'authenticated|unauthenticated|loading',
      userData: User | null,
      preferences: UserPreferences
    },
    // Using React Context + useReducer for global state
    implementation: 'React Context + useReducer'
  },

  // Local component state
  local: {
    // Using React useState/useReducer for component-specific state
    implementation: 'React useState/useReducer'
  },

  // Server state (API data)
  server: {
    lists: List[],
    tasks: Task[],
    views: View[],
    // Using React Query for server state management
    implementation: 'React Query (TanStack Query)'
  },

  // URL state (routing)
  url: {
    currentView: 'day|week|month|custom',
    filters: FilterCriteria,
    // Using Next.js router for URL state
    implementation: 'Next.js App Router'
  }
};
```

## 7. Technical Stack Integration Plan

### Core Technologies

```markdown
1. **Frontend Framework**: Next.js 14+ (App Router)
   - Server Components
   - Client Components
   - Server Actions

2. **UI Framework**: Tailwind CSS + Headless UI
   - Responsive design system
   - Customizable components
   - Dark mode support

3. **Database**: SQLite with Prisma ORM
   - Schema migrations
   - Type-safe queries
   - Connection pooling

4. **Authentication**: NextAuth.js
   - Email/password
   - OAuth providers
   - Session management

5. **State Management**: React Query + Zustand
   - Server state caching
   - Optimistic updates
   - Background sync

6. **Form Handling**: React Hook Form
   - Validation
   - Error handling
   - Accessibility

7. **Testing**: Jest + React Testing Library
   - Unit tests
   - Integration tests
   - E2E tests
```

## 8. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Next.js project structure
- [ ] Configure SQLite with Prisma
- [ ] Implement authentication system
- [ ] Create base API routes
- [ ] Set up state management

### Phase 2: Core Features (Week 3-4)
- [ ] Implement task CRUD operations
- [ ] Build list management
- [ ] Create view system
- [ ] Implement search functionality
- [ ] Develop UI components

### Phase 3: Advanced Features (Week 5-6)
- [ ] Add drag-and-drop functionality
- [ ] Implement task prioritization
- [ ] Add calendar integrations
- [ ] Create notification system
- [ ] Build analytics dashboard

### Phase 4: Polish & Deployment (Week 7-8)
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Security hardening
- [ ] Deployment configuration
- [ ] Documentation

## 9. Technical Recommendations

### Best Practices

1. **Performance**: Use Next.js caching strategies and React Query for efficient data fetching
2. **Security**: Implement proper authentication, authorization, and input validation
3. **Accessibility**: Follow WCAG guidelines and use semantic HTML
4. **Testing**: Implement comprehensive test coverage with CI/CD integration
5. **Documentation**: Maintain up-to-date technical documentation and API specs

### Deployment Strategy

```markdown
- **Environment**: Vercel (optimized for Next.js)
- **Database**: SQLite with persistent storage
- **CI/CD**: GitHub Actions with automated testing
- **Monitoring**: Sentry for error tracking
- **Analytics**: Plausible for privacy-friendly analytics
```

## 10. Architecture Diagram

```mermaid
graph TD
    A[Client] -->|HTTP Requests| B[Next.js API Routes]
    B -->|Database Queries| C[Prisma ORM]
    C -->|SQL Queries| D[SQLite Database]
    A -->|State Updates| E[React Query]
    E -->|Optimistic Updates| F[UI Components]
    F -->|User Actions| A
    G[Authentication] -->|Session Management| B
    H[External APIs] -->|Integrations| B