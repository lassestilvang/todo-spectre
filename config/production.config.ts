import { NextConfig } from 'next';

export const productionConfig: NextConfig = {
  // Performance optimizations
  output: 'standalone',
  compress: true,
  poweredByHeader: false,

  // Security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Content-Security-Policy',
          value: `
            default-src 'self';
            script-src 'self' 'unsafe-eval' cdn.jsdelivr.net;
            style-src 'self' 'unsafe-inline' fonts.googleapis.com;
            img-src 'self' data: cdn.your-domain.com;
            font-src 'self' fonts.gstatic.com;
            object-src 'none';
            frame-src 'none';
            connect-src 'self' api.your-domain.com;
          `,
        },
      ],
    },
  ],


  // Image optimization
  images: {
    unoptimized: false,
    domains: ['your-domain.com', 'cdn.your-domain.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    NODE_ENV: 'production',
    DATABASE_URL: process.env.DATABASE_URL || 'file:./prod.db',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
  },


};

export default productionConfig;