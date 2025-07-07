import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' for API routes to work
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove assetPrefix for production deployment
  serverExternalPackages: ['bcryptjs'],
};

export default nextConfig;