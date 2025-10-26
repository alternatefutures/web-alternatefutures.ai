import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  outputFileTracingRoot: path.join(__dirname),
  compress: true,
  poweredByHeader: false,
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  images: {
    unoptimized: true, // Required for static export
  },
}

export default nextConfig