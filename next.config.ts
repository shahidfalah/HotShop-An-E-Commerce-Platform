import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ["src", "app", "pages", "components", "lib"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure Prisma generates during build
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
}

export default nextConfig
