/**
 * Next.js Configuration File
 * 
 * This file configures various Next.js settings for the AgroInsight application.
 * 
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Image optimization configuration
  images: {
    // Allowed domains for Next.js Image Optimization
    domains: ['localhost'],
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/**',
      },
    ],
    
    formats: ['image/avif', 'image/webp'],
    
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    minimumCacheTTL: 86400, // 24 hours
    
    disableStaticImages: false,
    
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

// Export the configuration to be used by Next.js
module.exports = nextConfig
