import { defineConfig } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  generators: {
    client: {
      provider: 'prisma-client-js',
      previewFeatures: ['fullTextSearch', 'extendedWhereUnique'],
    },
  },
})

// Enhanced Prisma client with error handling
class EnhancedPrismaClient extends PrismaClient {
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
      errorFormat: 'pretty',
    })

    // Add event listeners for query logging
    this.$on('query', (e) => {
      console.log('Query:', e.query)
      console.log('Params:', e.params)
      console.log('Duration:', e.duration + 'ms')
    })

    this.$on('error', (e) => {
      console.error('Prisma Error:', e)
    })
  }

  // Custom error handling
  async executeWithErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      this.handlePrismaError(error)
      throw error
    }
  }

  private handlePrismaError(error: unknown): void {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma Known Request Error:', {
        code: error.code,
        message: error.message,
        meta: error.meta,
      })

      // Handle specific error codes
      switch (error.code) {
        case 'P2002':
          throw new Error(`Unique constraint violation: ${error.meta?.target}`)
        case 'P2025':
          throw new Error(`Record not found: ${error.meta?.cause}`)
        case 'P2003':
          throw new Error(`Foreign key constraint failed: ${error.meta?.field_name}`)
        default:
          throw new Error(`Database error (${error.code}): ${error.message}`)
      }
    } else if (error instanceof PrismaClientValidationError) {
      console.error('Prisma Validation Error:', error.message)
      throw new Error(`Validation error: ${error.message}`)
    } else if (error instanceof PrismaClientInitializationError) {
      console.error('Prisma Initialization Error:', error.message)
      throw new Error(`Database initialization failed: ${error.message}`)
    } else if (error instanceof PrismaClientRustPanicError) {
      console.error('Prisma Rust Panic Error:', error.message)
      throw new Error(`Database panic occurred: ${error.message}`)
    } else if (error instanceof PrismaClientUnknownRequestError) {
      console.error('Prisma Unknown Error:', error.message)
      throw new Error(`Unknown database error: ${error.message}`)
    } else {
      console.error('Unknown Prisma Error:', error)
      throw new Error(`Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const prisma = new EnhancedPrismaClient()