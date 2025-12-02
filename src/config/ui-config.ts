/**
 * UI Configuration for Todo Spectre Application
 * Responsive design, view transitions, and loading states configuration
 */

export const uiConfig = {
  // Responsive design breakpoints
  responsive: {
    breakpoints: {
      xs: 480,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    // Responsive container sizes
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    // Responsive font sizes
    fontSizes: {
      base: '1rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },

  // View transition API configuration
  viewTransitions: {
    enabled: true,
    animationDuration: 300, // ms
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // View transition classes
    classes: {
      enter: 'page-transition-enter',
      enterActive: 'page-transition-enter-active',
      exit: 'page-transition-exit',
      exitActive: 'page-transition-exit-active',
    },
  },

  // Loading states configuration
  loadingStates: {
    spinner: {
      size: '1.5rem',
      borderWidth: '2px',
      animationDuration: '1s',
      colors: {
        light: 'var(--color-primary-500)',
        dark: 'var(--color-primary-400)',
      },
    },
    skeleton: {
      baseColor: 'var(--color-neutral-200)',
      highlightColor: 'var(--color-neutral-100)',
      darkBaseColor: 'var(--color-neutral-800)',
      darkHighlightColor: 'var(--color-neutral-700)',
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    progress: {
      height: '4px',
      colors: {
        primary: 'var(--color-primary-500)',
        secondary: 'var(--color-secondary-500)',
        success: 'var(--color-success-500)',
        warning: 'var(--color-warning-500)',
        danger: 'var(--color-danger-500)',
      },
    },
  },

  // Error handling styles
  errorHandling: {
    toast: {
      duration: 5000, // ms
      position: 'top-right',
      maxVisible: 5,
    },
    alert: {
      variants: {
        info: {
          bg: 'var(--color-primary-50)',
          border: 'var(--color-primary-200)',
          text: 'var(--color-primary-800)',
        },
        success: {
          bg: 'var(--color-success-50)',
          border: 'var(--color-success-200)',
          text: 'var(--color-success-800)',
        },
        warning: {
          bg: 'var(--color-warning-50)',
          border: 'var(--color-warning-200)',
          text: 'var(--color-warning-800)',
        },
        error: {
          bg: 'var(--color-danger-50)',
          border: 'var(--color-danger-200)',
          text: 'var(--color-danger-800)',
        },
      },
    },
  },

  // Animation configuration
  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easings: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  // Responsive utility classes
  responsiveUtils: {
    text: {
      base: 'text-base',
      sm: 'text-sm sm:text-base',
      md: 'text-sm sm:text-base md:text-lg',
      lg: 'text-base sm:text-lg md:text-xl',
    },
    padding: {
      base: 'p-4',
      sm: 'p-2 sm:p-4',
      md: 'p-2 sm:p-3 md:p-4',
      lg: 'p-3 sm:p-4 md:p-6',
    },
    margin: {
      base: 'm-4',
      sm: 'm-2 sm:m-4',
      md: 'm-2 sm:m-3 md:m-4',
      lg: 'm-3 sm:m-4 md:m-6',
    },
  },
};

export type UIConfig = typeof uiConfig;