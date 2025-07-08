import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove trailingSlash to prevent API redirect issues
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