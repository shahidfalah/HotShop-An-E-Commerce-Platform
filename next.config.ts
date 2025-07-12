// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // REMOVED: unoptimized: true, // This was the problem!
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "faonlwdlcauinddwhqbe.supabase.co",
        port: '',
        pathname: '/storage/v1/object/public/product-images/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // For fallback images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // ADDED: To allow Google profile images
        port: '',
        pathname: '/**',
      },
      // Add any other external image domains you might use
    ],
  },
}

export default nextConfig
