import { Metadata } from 'next'

const SITE_URL = 'https://alternatefutures.ai'
const CLOUDS_TITLE = 'Alternate Clouds — A more affordable, more stable way to deploy everything from sites to AI agents.'
const CLOUDS_DESCRIPTION = 'Ship apps on distributed infrastructure in minutes. Lower costs, always online, developer-first tooling. Host anything on distributed nodes keeping you up even when centralized services are down.'

export const metadata: Metadata = {
  title: 'Alternate Clouds',
  description: CLOUDS_DESCRIPTION,

  openGraph: {
    type: 'website',
    url: `${SITE_URL}/products/alternate-clouds`,
    title: CLOUDS_TITLE,
    description: CLOUDS_DESCRIPTION,
    siteName: 'Alternate Futures',
    images: [
      {
        url: `${SITE_URL}/og-image-alternate-clouds.png`,
        width: 1200,
        height: 630,
        alt: 'Alternate Clouds — A more affordable, more stable way to deploy everything from sites to AI agents.',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@AltFutures_ai',
    creator: '@wonderwomancode',
    title: CLOUDS_TITLE,
    description: CLOUDS_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image-alternate-clouds.png`,
        width: 1200,
        height: 630,
        alt: 'Alternate Clouds — A more affordable, more stable way to deploy everything from sites to AI agents.',
      },
    ],
  },
}

export default function AlternateCloudsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
