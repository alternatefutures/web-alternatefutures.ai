import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  outputFileTracingRoot: path.join(__dirname),
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for static export
  },
  // Security headers (also defined in public/_headers for deployment)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig