import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { installGlobals } from '@remix-run/node'
import { TextEncoder, TextDecoder } from 'util'

// Set up DOM globals
installGlobals()

// Set up text encoding for older Node versions
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

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
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001/api'
})

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// Global test utilities
global.testUtils = {
  mockApiResponse: (data: any, status = 200) => {
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
    interface JestAssertion<T = any> extends jest.Matchers<void, T> {
      toBeInTheDocument(): void
    }
  }
  var testUtils: {
    mockApiResponse: (data: any, status?: number) => any
    mockApiError: (message?: string, status?: number) => any
  }
}