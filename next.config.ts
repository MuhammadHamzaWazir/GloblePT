import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: 'export' to allow API routes
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
  // Removed assetPrefix for production
  serverExternalPackages: ['bcryptjs', '@prisma/client'],
};

export default nextConfig;