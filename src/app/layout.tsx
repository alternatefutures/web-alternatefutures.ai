import '../../styles.css'
import '../styles/design-tokens.css'
import { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://alternatefutures.ai'
const SITE_NAME = 'Alternate Futures'
const DEFAULT_TITLE = 'Alternate Futures | Infrastructure for Human-Computer Alignment'
const DEFAULT_DESCRIPTION = 'Building the standards framework and toolset that ensures AI technology serves human flourishing. Deploy apps on decentralized infrastructure with lower costs, always-on uptime, and developer-first tooling.'

export const metadata: Metadata = {
  title: {
    default: DEFAULT_TITLE,
    template: '%s | Alternate Futures',
  },
  description: DEFAULT_DESCRIPTION,
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
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Alternate Futures — Building the infrastructure for human-computer alignment',
        type: 'image/png',
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    site: '@AltFutures_ai',
    creator: '@wonderwomancode',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Alternate Futures — Building the infrastructure for human-computer alignment',
      },
    ],
  },

  // Icons
  icons: {
    icon: '/assets/favicon.ico',
    apple: '/assets/favicon.ico',
  },

  // Discord theme color
  other: {
    'X-DNS-Prefetch-Control': 'off',
    'theme-color': '#000AFF',
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
      <body>{children}</body>
    </html>
  )
}
