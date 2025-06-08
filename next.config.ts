import { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  /* config options here */
  // Removed eslint and typescript ignore options for production builds
  // These should be resolved rather than ignored
  
  // Disabling static export to support dynamic routes
  // output: "export",
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src')
    // Optimize webpack for better memory usage
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    }
    return config
  },
  // Remove experimental optimizeCss to reduce memory usage
  swcMinify: true,
}

export default nextConfig

