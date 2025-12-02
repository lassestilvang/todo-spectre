# Agent Instructions

## Build/Test/Lint Commands
- **Development**: `bun run dev` (Next.js dev server on port 3000)
- **Build**: `bun run build` && `bun run start` (production build)
- **Lint**: `bun run lint` (ESLint)
- **Test single file**: `bun test path/to/file.test.ts`
- **Test all**: `bun run test:all` (runs all tests via scripts/run-tests.ts)
- **Test watch**: `bun run test:watch`
- **Test coverage**: `bun run test:coverage`
- **Test by category**: `bun test tests/services`, `bun test tests/api`, `bun test tests/components`
- **Database**: `bun run db:migrate`, `bun run db:reset`, `bun run db:studio` (Prisma Studio)

## Architecture
- **Framework**: Next.js 16 (App Router) with React 19, TypeScript 5
- **Database**: SQLite (Prisma ORM) with models: User, List, Task, TaskView, TaskLog, TaskLabel, TaskAttachment
- **Testing**: Vitest with @testing-library/react; Jest for unit tests; coverage threshold: 80%
- **UI**: Tailwind CSS 4, Radix UI components, Framer Motion, Lucide Icons
- **Code path**: `src/` contains app/, components/, services/, lib/, hooks/, utils/, types/, config/
- **State**: TanStack React Query for server state, context API for local state

## Code Style
- **TypeScript**: Strict mode enabled, paths alias `@/*` -> `src/*`
- **Naming**: camelCase (functions/variables), PascalCase (classes/components), SCREAMING_SNAKE_CASE (constants)
- **Imports**: Use path alias `@/` for all internal imports; group imports: dependencies → relative paths
- **Error handling**: Custom `DatabaseError` class in `src/lib/errors.ts`; throw typed errors with code/details; try-catch in services
- **Services**: Class-based services (TaskService, ListService) with public methods and error handling
- **Validation**: Zod schemas in `src/lib/form-validation.ts` for type-safe runtime validation
- **Components**: Functional components with hooks; keep component logic in hooks and services
- **Formatting**: ESLint via next/core-web-vitals and next/typescript configs
