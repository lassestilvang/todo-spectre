/**
 * UI Utilities for Todo Spectre Application
 * Responsive design, view transitions, and loading state helpers
 */

import { uiConfig } from '@/config/ui-config';
import { useEffect, useState } from 'react';
import { useTheme } from '@/components/theme-provider';

/**
 * Custom hook for responsive breakpoints
 */
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });

      // Determine current breakpoint
      if (width < uiConfig.responsive.breakpoints.xs) {
        setBreakpoint('xs');
      } else if (width < uiConfig.responsive.breakpoints.sm) {
        setBreakpoint('sm');
      } else if (width < uiConfig.responsive.breakpoints.md) {
        setBreakpoint('md');
      } else if (width < uiConfig.responsive.breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width < uiConfig.responsive.breakpoints.xl) {
        setBreakpoint('xl');
      } else {
        setBreakpoint('2xl');
      }
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    windowSize,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2Xl: breakpoint === '2xl',
  };
}

/**
 * View transition helper
 */
export function useViewTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startViewTransition = async (callback: () => Promise<void> | void) => {
    if (!uiConfig.viewTransitions.enabled || !document.startViewTransition) {
      await callback();
      return;
    }

    setIsTransitioning(true);

    try {
      const transition = document.startViewTransition(() => {
        return new Promise<void>(async (resolve) => {
          await callback();
          resolve();
        });
      });

      await transition.ready;
      await transition.finished;
    } catch (error) {
      console.error('View transition error:', error);
      await callback();
    } finally {
      setIsTransitioning(false);
    }
  };

  return {
    isTransitioning,
    startViewTransition,
  };
}

/**
 * Loading state utilities
 */
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const startLoading = (message = 'Loading...') => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingMessage(message);
  };

  const updateLoading = (progress: number, message?: string) => {
    setLoadingProgress(progress);
    if (message) {
      setLoadingMessage(message);
    }
  };

  const completeLoading = () => {
    setIsLoading(false);
    setLoadingProgress(100);
  };

  const simulateLoading = async (duration = 2000, steps = 10) => {
    startLoading();

    return new Promise<void>((resolve) => {
      let currentStep = 0;
      const stepDuration = duration / steps;
      const interval = setInterval(() => {
        currentStep++;
        updateLoading((currentStep / steps) * 100);

        if (currentStep >= steps) {
          clearInterval(interval);
          completeLoading();
          resolve();
        }
      }, stepDuration);
    });
  };

  return {
    isLoading,
    loadingProgress,
    loadingMessage,
    startLoading,
    updateLoading,
    completeLoading,
    simulateLoading,
  };
}

/**
 * Error handling utilities
 */
export function handleError(error: unknown, context = 'Operation') {
  console.error(`[${context}] Error:`, error);

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }

  return {
    message: 'An unknown error occurred',
    stack: undefined,
    name: 'UnknownError',
  };
}

/**
 * Responsive class name generator
 */
export function getResponsiveClassName(
  baseClass: string,
  responsiveClasses: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  },
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | null
) {
  const responsiveClass = breakpoint ? responsiveClasses[breakpoint] : '';
  return `${baseClass} ${responsiveClass || ''}`;
}

/**
 * Theme-aware utility
 */
export function useThemeAware() {
  const { isDarkMode } = useTheme();

  const getThemeAwareValue = <T>(lightValue: T, darkValue: T): T => {
    return isDarkMode ? darkValue : lightValue;
  };

  return {
    isDarkMode,
    getThemeAwareValue,
  };
}