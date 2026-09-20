import { afterEach, beforeEach, vi, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { TextEncoder, TextDecoder } from 'util'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
globalThis.window = dom.window as unknown as Window & typeof globalThis
globalThis.document = dom.window.document
globalThis.navigator = dom.window.navigator
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.Element = dom.window.Element
globalThis.Node = dom.window.Node

global.TextEncoder = TextEncoder as typeof globalThis.TextEncoder
;(global as typeof globalThis).TextDecoder = TextDecoder as typeof globalThis.TextDecoder

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
        name: 'Test User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

beforeEach(async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001/api'

  try {
    const { seedTestData } = await import('../scripts/seed-test-data')
    const { setupMockDatabase, mockDatabaseResponses } = await import('./mocks/mock-db')

    mockDatabaseResponses.users = []
    mockDatabaseResponses.lists = []
    mockDatabaseResponses.tasks = []
    mockDatabaseResponses.taskViews = []
    mockDatabaseResponses.taskLogs = []

    seedTestData()
    setupMockDatabase()
  } catch (error) {
    console.warn('Test data seeding failed:', error)
  }
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

global.testUtils = {
  mockApiResponse: (data: unknown, status = 200) => ({
    json: () => Promise.resolve(data),
    status,
    ok: status >= 200 && status < 300,
  }),
  mockApiError: (message = 'API Error', status = 500) => ({
    json: () => Promise.resolve({ error: message }),
    status,
    ok: false,
  }),
}

expect.extend({
  toBeInTheDocument(received: HTMLElement) {
    if (!received) {
      return { message: () => 'Expected element to be in the document', pass: false }
    }
    return { message: () => 'Expected element not to be in the document', pass: true }
  },
})

declare global {
  interface JestAssertion {
    toBeInTheDocument(): void
  }
  var testUtils: {
    mockApiResponse: (data: unknown, status?: number) => unknown
    mockApiError: (message?: string, status?: number) => unknown
  }
}
