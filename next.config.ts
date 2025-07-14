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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "faonlwdlcauinddwhqbe.supabase.co",
        port: '',
        pathname: '/storage/v1/object/public/product-images/**', // For original/direct image URLs
      },
      {
        protocol: 'https',
        hostname: "faonlwdlcauinddwhqbe.supabase.co",
        port: '',
        pathname: '/storage/v1/render/image/public/product-images/**', // ADDED: For Supabase transformed/rendered images
      },
      {
        protocol: 'https',
        hostname: "faonlwdlcauinddwhqbe.supabase.co",
        port: '',
        pathname: '/storage/v1/object/public/user-avatars/**', // ADDED: For user avatars (original)
      },
      {
        protocol: 'https',
        hostname: "faonlwdlcauinddwhqbe.supabase.co",
        port: '',
        pathname: '/storage/v1/render/image/public/user-avatars/**', // ADDED: For user avatars (rendered/transformed)
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // For fallback images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // To allow Google profile images
        port: '',
        pathname: '/**',
      },
      // Add any other external image domains you might use
    ],
  },
}

export default nextConfig
