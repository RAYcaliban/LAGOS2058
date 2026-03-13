import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // future map phase: allow leaflet tile CDN images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.basemaps.cartocdn.com',
      },
    ],
  },
}

export default nextConfig
