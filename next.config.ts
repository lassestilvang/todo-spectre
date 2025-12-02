import type { NextConfig } from "next";

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

export default nextConfig;
