import type { NextConfig } from 'next'
import path from 'path'

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.google-analytics.com",
  "font-src 'self'",
  "connect-src 'self' https://*.google-analytics.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/blog',
        destination: 'https://blog.alternatefutures.ai',
        permanent: true,
      },
      {
        source: '/blog/rss.xml',
        destination: 'https://blog.alternatefutures.ai/rss.xml',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: 'https://blog.alternatefutures.ai/posts/:slug',
        permanent: true,
      },
      {
        source: '/products/alternate-clouds',
        destination: '/products/clouds',
        permanent: true,
      },
      {
        source: '/products/alternate-clouds/:path*',
        destination: '/products/clouds/:path*',
        permanent: true,
      },
      {
        // Agentika hackathon registration (asked by Saad, 2026-10-12). Temporary
        // so the target can change once the event is over.
        source: '/agentika-hackathon',
        destination: 'https://nascon.com.pk/events/register/98be43c6-adcb-4b39-8e46-fa71482f9ee3',
        permanent: false,
      },
    ]
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
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
        ],
      },
    ]
  },
}

export default nextConfig
