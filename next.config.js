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
    // Currently only localhost is allowed for development
    domains: ['localhost'],
  },
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
}

// Export the configuration to be used by Next.js
module.exports = nextConfig
