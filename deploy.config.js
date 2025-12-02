module.exports = {
  // Deployment targets
  targets: {
    vercel: {
      provider: 'vercel',
      name: 'Vercel Deployment',
      script: 'vercel',
      env: {
        production: {
          VERCEL_ENV: 'production',
          NODE_ENV: 'production',
        },
        preview: {
          VERCEL_ENV: 'preview',
          NODE_ENV: 'development',
        },
        development: {
          VERCEL_ENV: 'development',
          NODE_ENV: 'development',
        },
      },
    },
    netlify: {
      provider: 'netlify',
      name: 'Netlify Deployment',
      script: 'netlify',
      env: {
        production: {
          NETLIFY_ENV: 'production',
          NODE_ENV: 'production',
        },
      },
    },
  },

  // Build configuration
  build: {
    command: 'bun run build',
    output: '.next',
    basePath: '/',
    assetPrefix: process.env.ASSET_PREFIX || '',
    cleanUrls: true,
    trailingSlash: false,
  },

  // Environment variables
  env: {
    // Database
    DATABASE_URL: process.env.DATABASE_URL || 'file:./prod.db',

    // Authentication
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'generate-a-strong-secret',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://your-domain.com',

    // Security
    JWT_SECRET: process.env.JWT_SECRET || 'generate-a-strong-jwt-secret',
    SESSION_SECRET: process.env.SESSION_SECRET || 'generate-a-strong-session-secret',

    // Feature flags
    NEXT_PUBLIC_FEATURE_EXPERIMENTAL: process.env.NEXT_PUBLIC_FEATURE_EXPERIMENTAL || 'false',
    NEXT_PUBLIC_FEATURE_DEBUG_MODE: process.env.NEXT_PUBLIC_FEATURE_DEBUG_MODE || 'false',

    // Analytics
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
  },

  // Performance optimizations
  performance: {
    images: {
      unoptimized: false,
      domains: ['your-domain.com', 'cdn.your-domain.com'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    fonts: {
      preload: true,
      display: 'swap',
    },
    scripts: {
      strategy: 'afterInteractive',
    },
    caching: {
      staticFiles: {
        maxAge: 31536000, // 1 year
        immutable: true,
      },
      apiRoutes: {
        maxAge: 300, // 5 minutes
        staleWhileRevalidate: 600, // 10 minutes
      },
    },
  },

  // Security headers
  security: {
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "cdn.your-domain.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      connectSrc: ["'self'", "api.your-domain.com"],
    },
    strictTransportSecurity: {
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true,
    },
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
  },

  // Monitoring configuration
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.2,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      console: true,
      file: process.env.NODE_ENV === 'production' ? './logs/app.log' : null,
    },
  },

  // CI/CD configuration
  ciCd: {
    githubActions: {
      nodeVersion: '20',
      cache: {
        enabled: true,
        paths: ['node_modules', '.next/cache'],
      },
      artifacts: {
        enabled: true,
        paths: ['coverage', 'test-results'],
      },
    },
  },
}