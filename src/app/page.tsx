import type { Metadata } from 'next'
import LandingPageClient from '@/components/LandingPageClient'
import './landing.css'

const SITE_URL = 'https://www.alternatefutures.ai'

export const metadata: Metadata = {
  title: 'AI Infrastructure, Distributed Cloud & Education',
  description:
    'Build and deploy AI systems across CPU, scalable GPU, storage, and distributed infrastructure with Alternate Clouds, expert consulting, and hands-on education.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    url: '/',
    title: 'Alternate Futures | AI Infrastructure, Distributed Cloud & Education',
    description:
      'Build and deploy AI systems across CPU, scalable GPU, storage, and distributed infrastructure.',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Alternate Futures',
      url: SITE_URL,
      logo: `${SITE_URL}/assets/logo.svg`,
      sameAs: [
        'https://www.linkedin.com/company/alternate-futures-ai',
        'https://x.com/AltFuturesAI',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Alternate Futures',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#ai-infrastructure`,
      name: 'Alternate Futures AI Infrastructure',
      serviceType: 'Distributed cloud computing and AI infrastructure',
      provider: { '@id': `${SITE_URL}/#organization` },
      url: `${SITE_URL}/products/clouds`,
      description:
        'Infrastructure for deploying applications and AI workloads across CPU, scalable GPU, storage, and distributed cloud resources.',
    },
  ],
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <LandingPageClient />
    </>
  )
}
