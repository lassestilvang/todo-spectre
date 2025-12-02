import { render, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { MemoryRouterProvider } from 'next-router-mock'
import { ThemeProvider as ThemeProviderComponent } from '../src/components/theme-provider'

// Create a test query client
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

// Render with all providers
export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = {}
): any {
  const user = userEvent.setup()

  const Wrapper = ({ children }: { children: ReactElement }) => {
    const ProviderWrapper = QueryClientProvider as any;
    return ProviderWrapper({
      client: queryClient,
      children: children
    })
  }

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Mock API client
export class MockApiClient {
  private responses: Map<string, { data: unknown; status: number; error?: string }> = new Map()

  constructor(responses: Record<string, { data: unknown; status: number; error?: string }> = {}) {
    Object.entries(responses).forEach(([key, value]) => {
      this.responses.set(key, value)
    })
  }

  async get(url: string): Promise<{ data: unknown; status: number }> {
    const response = this.responses.get(url)
    if (!response) {
      throw new Error(`No mock response configured for GET ${url}`)
    }
    if (response.error) {
      throw new Error(response.error)
    }
    return { data: response.data, status: response.status }
  }

  async post(url: string, data: unknown): Promise<{ data: unknown; status: number }> {
    const response = this.responses.get(url)
    if (!response) {
      throw new Error(`No mock response configured for POST ${url}`)
    }
    if (response.error) {
      throw new Error(response.error)
    }
    return { data: response.data, status: response.status }
  }

  async put(url: string, data: unknown): Promise<{ data: unknown; status: number }> {
    const response = this.responses.get(url)
    if (!response) {
      throw new Error(`No mock response configured for PUT ${url}`)
    }
    if (response.error) {
      throw new Error(response.error)
    }
    return { data: response.data, status: response.status }
  }

  async delete(url: string): Promise<{ data: unknown; status: number }> {
    const response = this.responses.get(url)
    if (!response) {
      throw new Error(`No mock response configured for DELETE ${url}`)
    }
    if (response.error) {
      throw new Error(response.error)
    }
    return { data: response.data, status: response.status }
  }

  setResponse(url: string, response: { data: unknown; status: number; error?: string }) {
    this.responses.set(url, response)
  }

  clearResponses() {
    this.responses.clear()
  }
}

// Test data generators
export const testData = {
  user: {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  list: {
    id: 1,
    user_id: 1,
    title: 'Test List',
    color: '#FF5733',
    icon: 'inbox',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  task: {
    id: 1,
    list_id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  view: {
    id: 1,
    user_id: 1,
    name: 'Test View',
    type: 'day',
    filter_criteria: JSON.stringify({ status: 'pending' }),
    sort_order: JSON.stringify({ field: 'priority', direction: 'desc' }),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
}

// Assertion helpers
export function expectApiError(error: unknown, message: string) {
  expect(error).toBeInstanceOf(Error)
  expect((error as Error).message).toContain(message)
}

export function expectDatabaseError(error: unknown, type: string) {
  expect(error).toBeInstanceOf(Error)
  expect((error as Error).name).toBe('DatabaseError')
  expect(error).toHaveProperty('type', type)
}

// Wait for next tick (for async operations)
export async function waitForNextTick() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Create mock storage
export function createMockStorage(data: Record<string, string> = {}): Storage {
  const store: Record<string, string> = { ...data }

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key])
    },
    key: (index: number) => Object.keys(store)[index] || null,
    length: Object.keys(store).length,
  }
}