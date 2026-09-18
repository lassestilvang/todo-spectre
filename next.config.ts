import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "vercel.com"],
    },
    viewTransition: true,
  },
  turbopack: {
    root: "/Users/lasse/Sites/todo-spectre",
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "vercel.com",
      },
    ],
    unoptimized: true,
  },
  transpilePackages: ["framer-motion"],
  compiler: {
    styledComponents: true,
    emotion: true,
  },
  output: "standalone",
  poweredByHeader: false,
  compress: true,
};

export default withPWA(nextConfig);
