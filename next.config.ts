// Vercel Deployment Preparation Notes:
// The following configurations were noted during Vercel deployment preparation:
// 1. `eslint: { ignoreDuringBuilds: true }`: It's recommended to resolve ESLint issues and remove this option for production.
// 2. `typescript: { ignoreBuildErrors: true }`: It's recommended to resolve TypeScript errors and remove this option for production.
// 3. `images: { unoptimized: true }`: Next.js Image Optimization is currently disabled. Vercel provides its own image optimization.
//    You may want to review this setting to ensure optimal image handling.
//    Consider removing `unoptimized: true` to leverage Vercel's image optimization,
//    or confirm if this setting is intentional for your project's needs.
//
import { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disabling static export to support dynamic routes
  // output: "export",
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src')
    return config
  }
}

export default nextConfig
