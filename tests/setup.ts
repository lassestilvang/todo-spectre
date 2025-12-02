import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { TextEncoder, TextDecoder } from 'util'

// Set up DOM globals
global.TextEncoder = TextEncoder
// TextDecoder assignment removed due to type compatibility issues

// Mock Next.js specific features
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    status: 'authenticated'
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock environment variables
beforeEach(() => {
  // Use Object.defineProperty to set read-only properties
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: true,
    configurable: true
  })
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001/api'

  // Reset and seed test data for mock database
  try {
    const { seedTestData, mockDatabaseResponses } = await import('../scripts/seed-test-data')
    const { setupMockDatabase, mockPrisma } = await import('./mocks/mock-db')

    // Reset all mock database data
    mockDatabaseResponses.users = []
    mockDatabaseResponses.lists = []
    mockDatabaseResponses.tasks = []
    mockDatabaseResponses.taskViews = []
    mockDatabaseResponses.taskLogs = []

    // Seed fresh test data
    seedTestData()

    // Setup mock database
    setupMockDatabase()
  } catch (error) {
    console.warn('Test data seeding failed:', error)
  }
})

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// Global test utilities
global.testUtils = {
  mockApiResponse: (data: unknown, status = 200) => {
    return {
      json: () => Promise.resolve(data),
      status,
      ok: status >= 200 && status < 300,
    }
  },
  mockApiError: (message = 'API Error', status = 500) => {
    return {
      json: () => Promise.resolve({ error: message }),
      status,
      ok: false,
    }
  }
}

// Extend expect with custom matchers
expect.extend({
  toBeInTheDocument(received: HTMLElement) {
    if (!received) {
      return {
        message: () => 'Expected element to be in the document',
        pass: false,
      }
    }
    return {
      message: () => 'Expected element not to be in the document',
      pass: true,
    }
  },
})

declare global {
  namespace Vi {
    interface JestAssertion<T = unknown> extends jest.Matchers<void, T> {
      toBeInTheDocument(): void
    }
  }
  var testUtils: {
    mockApiResponse: (data: unknown, status?: number) => unknown
    mockApiError: (message?: string, status?: number) => unknown
  }
}