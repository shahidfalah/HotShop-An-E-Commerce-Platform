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
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL as string, // <<< IMPORTANT: Replace with your actual Supabase project ID
        port: '',
        pathname: '/storage/v1/object/public/product-images/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // For fallback images
        port: '',
        pathname: '/**',
      },
      // Add any other external image domains you might use
    ],
  },
}

export default nextConfig
