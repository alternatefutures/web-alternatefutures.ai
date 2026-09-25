import '../../styles.css'
import '../styles/design-tokens.css'
import '../styles/geometric-shapes.css'
import '@/components/GoogleAnalytics.css'
import { Metadata } from 'next'
import { Suspense } from 'react'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alternatefutures.ai'
const SITE_NAME = 'Alternate Futures'
const DEFAULT_TITLE = 'Alternate Futures | AI Infrastructure, Cloud & Education'
const DEFAULT_DESCRIPTION = 'Build and deploy AI systems with distributed cloud infrastructure, CPU, scalable GPU, storage, education, and human-centered AI expertise from Alternate Futures.'

export const metadata: Metadata = {
  title: {
    default: DEFAULT_TITLE,
    template: '%s | Alternate Futures',
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  keywords: [
    'AI infrastructure',
    'distributed cloud',
    'GPU cloud',
    'CPU cloud',
    'AI agent infrastructure',
    'AI education',
    'human-centered AI',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  referrer: 'no-referrer',
  metadataBase: new URL(SITE_URL),

  // Open Graph — Facebook, LinkedIn, WhatsApp, iMessage, Slack, Teams, Telegram
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.png?v=2',
        width: 1200,
        height: 630,
        alt: 'Alternate Futures — Welcome to the future',
        type: 'image/png',
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    site: '@AltFuturesAI',
    creator: '@wonderwomancode',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.png?v=2',
        width: 1200,
        height: 630,
        alt: 'Alternate Futures — Welcome to the future',
      },
    ],
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/favicons/apple-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/favicons/apple-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/favicons/apple-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/favicons/apple-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/favicons/apple-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/favicons/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/favicons/apple-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/favicons/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/favicons/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/favicons/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },

  // Discord theme color
  other: {
    'X-DNS-Prefetch-Control': 'off',
    'theme-color': '#000AFF',
    'og:logo': '/assets/logo.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/InstrumentSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/InstrumentSans-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/InstrumentSans-SemiBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/InstrumentSerif-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/InstrumentSerif-Italic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/logo.svg" as="image" />
      </head>
      <body>
        {children}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  )
}
