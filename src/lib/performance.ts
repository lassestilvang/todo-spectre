import { useEffect, useMemo, useCallback } from 'react'

// Performance monitoring utilities
export function startPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Mark the start of the application
  performance.mark('app-start')

  // Set up performance observers
  setupPerformanceObservers()
}

// Set up performance observers
function setupPerformanceObservers() {
  if (typeof performance === 'undefined') return

  // Navigation timing observer
  const navigationObserver = new PerformanceObserver((list) => {
    const entries = list.getEntriesByType('navigation')
    entries.forEach((entry: any) => {
      console.log('Navigation timing:', {
        domainLookup: entry.domainLookupEnd - entry.domainLookupStart,
        connect: entry.connectEnd - entry.connectStart,
        request: entry.responseEnd - entry.requestStart,
        processing: entry.domContentLoadedEventEnd - entry.responseEnd,
        load: entry.loadEventEnd - entry.loadEventStart,
        total: entry.loadEventEnd - entry.startTime,
      })
    })
  })

  // Resource timing observer
  const resourceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntriesByType('resource')
    entries.forEach((entry: any) => {
      if (entry.duration > 1000) {
        console.warn('Slow resource:', {
          name: entry.name,
          duration: entry.duration,
          initiatorType: entry.initiatorType,
        })
      }
    })
  })

  // Paint timing observer
  const paintObserver = new PerformanceObserver((list) => {
    const entries = list.getEntriesByType('paint')
    entries.forEach((entry: any) => {
      console.log('Paint timing:', {
        name: entry.name,
        startTime: entry.startTime,
      })
    })
  })

  navigationObserver.observe({ type: 'navigation', buffered: true })
  resourceObserver.observe({ type: 'resource', buffered: true })
  paintObserver.observe({ type: 'paint', buffered: true })
}

// Performance optimization hooks
export function usePerformanceOptimization() {
  useEffect(() => {
    startPerformanceMonitoring()
  }, [])
}

// Memoization utilities
export function useOptimizedMemo<T>(factory: () => T, deps: any[]): T {
  return useMemo(() => {
    const start = performance.now()
    const result = factory()
    const end = performance.now()

    if (end - start > 10) {
      console.warn('Slow memo computation:', end - start, 'ms')
    }

    return result
  }, deps)
}

// Callback optimization
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T {
  return useCallback(callback, deps)
}

// Debounce utility
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Throttle utility
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: NodeJS.Timeout | null = null
  let lastRan = 0

  return function (...args: Parameters<T>): void {
    if (!lastRan) {
      func(...args)
      lastRan = Date.now()
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc)
      }

      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

// Performance measurement
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()

  console.log(`${name} took ${end - start}ms`)
  return result
}

// Lazy loading utility
export function lazyLoad<T>(factory: () => Promise<{ default: T }>): () => Promise<T> {
  let promise: Promise<T> | null = null

  return () => {
    if (!promise) {
      promise = factory().then(module => module.default)
    }
    return promise
  }
}

// Image optimization
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return

  // Add loading="lazy" to all images
  const images = document.querySelectorAll('img')
  images.forEach(img => {
    if (!img.loading) {
      img.loading = 'lazy'
    }
  })
}

// Resource preloading
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // Preload critical CSS
  const criticalCSS = document.createElement('link')
  criticalCSS.rel = 'preload'
  criticalCSS.href = '/globals.css'
  criticalCSS.as = 'style'
  document.head.appendChild(criticalCSS)

  // Preload critical fonts
  const criticalFont = document.createElement('link')
  criticalFont.rel = 'preload'
  criticalFont.href = '/fonts/inter.woff2'
  criticalFont.as = 'font'
  criticalFont.type = 'font/woff2'
  criticalFont.crossOrigin = 'anonymous'
  document.head.appendChild(criticalFont)
}

// Performance metrics collection
export function collectPerformanceMetrics() {
  if (typeof performance === 'undefined') return {}

  return {
    navigation: getNavigationMetrics(),
    resources: getResourceMetrics(),
    paint: getPaintMetrics(),
    memory: getMemoryMetrics(),
  }
}

function getNavigationMetrics() {
  const [navigationEntry] = performance.getEntriesByType('navigation')
  if (!navigationEntry) return null

  return {
    domainLookup: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
    connect: navigationEntry.connectEnd - navigationEntry.connectStart,
    request: navigationEntry.responseEnd - navigationEntry.requestStart,
    processing: navigationEntry.domContentLoadedEventEnd - navigationEntry.responseEnd,
    load: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
    total: navigationEntry.loadEventEnd - navigationEntry.startTime,
  }
}

function getResourceMetrics() {
  const resourceEntries = performance.getEntriesByType('resource')
  return resourceEntries.map(entry => ({
    name: entry.name,
    duration: entry.duration,
    initiatorType: entry.initiatorType,
    transferSize: entry.transferSize,
    encodedBodySize: entry.encodedBodySize,
    decodedBodySize: entry.decodedBodySize,
  }))
}

function getPaintMetrics() {
  const paintEntries = performance.getEntriesByType('paint')
  return paintEntries.map(entry => ({
    name: entry.name,
    startTime: entry.startTime,
  }))
}

function getMemoryMetrics() {
  if (typeof performance.memory === 'undefined') return null

  return {
    usedJSHeapSize: performance.memory.usedJSHeapSize,
    totalJSHeapSize: performance.memory.totalJSHeapSize,
    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
  }
}