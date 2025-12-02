import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001', 'vercel.com'],
    },
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'vercel.com',
      },
    ],
    unoptimized: true,
  },
  transpilePackages: ['framer-motion'],
  compiler: {
    styledComponents: true,
    emotion: true,
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
