import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// View transition types
export type ViewTransitionType = 'fade' | 'slide' | 'scale' | 'none'

// View transition configuration
export interface ViewTransitionConfig {
  type?: ViewTransitionType
  duration?: number
  easing?: string
  delay?: number
}

// Default view transition configuration
export const DEFAULT_VIEW_TRANSITION: ViewTransitionConfig = {
  type: 'fade',
  duration: 300,
  easing: 'ease-in-out',
  delay: 0,
}

// View transition utility hook
export function useViewTransition(config: ViewTransitionConfig = DEFAULT_VIEW_TRANSITION) {
  const router = useRouter()

  useEffect(() => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      console.warn('View Transitions API not supported in this browser')
      return
    }

    // Apply view transition styles
    applyViewTransitionStyles(config)
  }, [config])

  // Wrapped navigation with view transition
  const transitionNavigate = (href: string) => {
    if (!document.startViewTransition) {
      router.push(href)
      return
    }

    // Start view transition
    const transition = document.startViewTransition(() => {
      router.push(href)
    })

    // Handle transition completion
    transition.finished
      .then(() => {
        console.log('View transition completed')
      })
      .catch((error) => {
        console.error('View transition error:', error)
      })
  }

  return {
    transitionNavigate,
    isSupported: !!document.startViewTransition,
  }
}

// Apply view transition styles to the document
function applyViewTransitionStyles(config: ViewTransitionConfig) {
  const style = document.createElement('style')
  style.textContent = `
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation-duration: ${config.duration}ms;
      animation-timing-function: ${config.easing};
      animation-delay: ${config.delay}ms;
    }

    ::view-transition-old(root) {
      ${getTransitionStyle(config.type || 'fade', 'old')}
    }

    ::view-transition-new(root) {
      ${getTransitionStyle(config.type || 'fade', 'new')}
    }
  `

  document.head.appendChild(style)
}

// Get transition style based on type
function getTransitionStyle(type: ViewTransitionType, state: 'old' | 'new'): string {
  switch (type) {
    case 'fade':
      return state === 'old'
        ? 'opacity: 0;'
        : 'opacity: 1;'
    case 'slide':
      return state === 'old'
        ? 'transform: translateX(-20px); opacity: 0;'
        : 'transform: translateX(0); opacity: 1;'
    case 'scale':
      return state === 'old'
        ? 'transform: scale(0.95); opacity: 0;'
        : 'transform: scale(1); opacity: 1;'
    case 'none':
    default:
      return ''
  }
}

// View transition wrapper component
export function ViewTransitionWrapper({
  children,
  config = DEFAULT_VIEW_TRANSITION,
}: {
  children: React.ReactNode
  config?: ViewTransitionConfig
}) {
  useViewTransition(config)
  return React.createElement(React.Fragment, null, children)
}

// Check if view transitions are supported
export function isViewTransitionSupported(): boolean {
  return !!document.startViewTransition
}

// Fallback for unsupported browsers
export function withViewTransitionFallback(
  Component: React.ComponentType,
  fallbackConfig: ViewTransitionConfig = { type: 'none' }
) {
  return function WrappedComponent(props: any) {
    const { isSupported } = useViewTransition()

    if (!isSupported) {
      return React.createElement(Component, props)
    }

    return (
      React.createElement(ViewTransitionWrapper, { config: fallbackConfig, children: React.createElement(Component, props) })
    )
  }
}

// View transition context
export function createViewTransitionContext() {
  // This would be implemented with React context for global transition management
  return {
    // Context implementation would go here
  }
}