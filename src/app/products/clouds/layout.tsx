import { Metadata } from 'next'

const CLOUDS_TITLE = 'Alternate Clouds | 30–80% Cheaper Than Big Tech. One Command to Deploy.'
const CLOUDS_DESCRIPTION =
  'Alternate Clouds: real savings on compute, one-command deploys, no vendor lock-in, straightforward UX. 30–80% cheaper than big tech like AWS or Vercel. Flat pricing, no surprises. Made by builders, for builders.'

export const metadata: Metadata = {
  title: 'Alternate Clouds',
  description: CLOUDS_DESCRIPTION,

  openGraph: {
    type: 'website',
    url: '/products/clouds',
    title: CLOUDS_TITLE,
    description: CLOUDS_DESCRIPTION,
    siteName: 'Alternate Futures',
    images: [
      {
        url: 'https://www.alternatefutures.ai/og-image-alternate-clouds.png?v=2',
        width: 1200,
        height: 630,
        alt: 'Alternate Clouds — 30–80% cheaper than big tech. One command to deploy.',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@AltFuturesAI',
    creator: '@wonderwomancode',
    title: CLOUDS_TITLE,
    description: CLOUDS_DESCRIPTION,
    images: [
      {
        url: 'https://www.alternatefutures.ai/og-image-alternate-clouds.png?v=2',
        width: 1200,
        height: 630,
        alt: 'Alternate Clouds — 30–80% cheaper than big tech. One command to deploy.',
      },
    ],
  },
}

export default function CloudsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
