import { prisma } from '@/lib/prisma'
type PrismaErr = { code?: string; meta?: Record<string, unknown>; message?: string }

// Database error types
export enum DatabaseErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONSTRAINT_ERROR = 'CONSTRAINT_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class DatabaseError extends Error {
  constructor(
    public type: DatabaseErrorType,
    message: string,
    public originalError?: unknown,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

/**
 * Execute a database operation with proper error handling
 */
export async function executeWithDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context: Record<string, unknown> = {}
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    // Convert Prisma errors to our standard format
    const _errName = (error as { constructor?: { name?: string } })?.constructor?.name;
    if (_errName === 'PrismaClientKnownRequestError') {
      switch ((error as PrismaErr).code) {
        case 'P2002':
          throw new DatabaseError(
            DatabaseErrorType.CONSTRAINT_ERROR,
            `Unique constraint violation: ${(error as PrismaErr).meta?.target}`,
            error,
            context
          )
        case 'P2025':
          throw new DatabaseError(
            DatabaseErrorType.NOT_FOUND_ERROR,
            `Record not found: ${(error as PrismaErr).meta?.cause}`,
            error,
            context
          )
        case 'P2003':
          throw new DatabaseError(
            DatabaseErrorType.CONSTRAINT_ERROR,
            `Foreign key constraint failed: ${(error as PrismaErr).meta?.field_name}`,
            error,
            context
          )
        case 'P2021':
        case 'P2022':
          throw new DatabaseError(
            DatabaseErrorType.CONSTRAINT_ERROR,
            `Table or column not found: ${(error as PrismaErr).meta?.model_name || (error as PrismaErr).meta?.field_name}`,
            error,
            context
          )
        default:
          throw new DatabaseError(
            DatabaseErrorType.QUERY_ERROR,
            `Database query error (${(error as PrismaErr).code}): ${(error as PrismaErr).message}`,
            error,
            context
          )
      }
    } else if (_errName === 'PrismaClientValidationError') {
      throw new DatabaseError(
        DatabaseErrorType.VALIDATION_ERROR,
        `Validation error: ${(error as PrismaErr).message}`,
        error,
        context
      )
    } else if (_errName === 'PrismaClientInitializationError') {
      throw new DatabaseError(
        DatabaseErrorType.CONNECTION_ERROR,
        `Database connection failed: ${(error as PrismaErr).message}`,
        error,
        context
      )
    } else {
      throw new DatabaseError(
        DatabaseErrorType.UNKNOWN_ERROR,
        `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
        context
      )
    }
  }
}

/**
 * Check database connection health
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}

/**
 * Transaction helper for multiple operations
 */
export async function executeInTransaction<T>(
  operations: ((tx: unknown) => Promise<T>)[],
  context: Record<string, unknown> = {}
): Promise<T[]> {
  return await prisma.$transaction(async (tx) => {
    const results: T[] = []

    for (const operation of operations) {
      try {
        const result = await operation(tx)
        results.push(result)
      } catch (error) {
        throw new DatabaseError(
          DatabaseErrorType.QUERY_ERROR,
          `Transaction operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error,
          { ...context, operation: operations.indexOf(operation) }
        )
      }
    }

    return results
  })
}

/**
 * Database health check with detailed information
 */
export async function getDatabaseHealth(): Promise<{
  connected: boolean
  tables: string[]
  recordCounts: Record<string, number>
  error?: DatabaseError
}> {
  try {
    await prisma.$connect()

    // Get table information
    const tables = await prisma.$queryRaw<
      Array<{ name: string }>
    >`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations'`

    // Get record counts for main tables
    const recordCounts: Record<string, number> = {}
    const mainTables = ['User', 'List', 'Task', 'TaskView']

    for (const table of mainTables) {
      try {
        const model = prisma[table.toLowerCase() as keyof typeof prisma] as unknown;
        const count = await (model as { count: () => Promise<number> }).count()
        recordCounts[table] = count
      } catch (countError) {
        recordCounts[table] = 0
      }
    }

    return {
      connected: true,
      tables: tables.map(t => t.name),
      recordCounts,
    }
  } catch (error) {
    const dbError = error instanceof DatabaseError
      ? error
      : new DatabaseError(
          DatabaseErrorType.CONNECTION_ERROR,
          `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error
        )

    return {
      connected: false,
      tables: [],
      recordCounts: {},
      error: dbError,
    }
  } finally {
    await prisma.$disconnect()
  }
}