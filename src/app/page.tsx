import type { Metadata } from 'next'
import LandingPageClient, { type HomepagePost } from '@/components/LandingPageClient'
import { fetchPublishedPosts } from '@/lib/blog-api'
import './landing.css'

const SITE_URL = 'https://www.alternatefutures.ai'

export const metadata: Metadata = {
  title: 'AI Agent Infrastructure, GPU Cloud, CPU & Storage',
  description:
    'Deploy AI agents, applications, and models across scalable GPU, CPU, storage, edge, and distributed cloud infrastructure with Alternate Futures.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    url: '/',
    title: 'Alternate Futures | AI Agent Infrastructure, GPU Cloud, CPU & Storage',
    description:
      'Deploy AI agents, applications, and models across scalable GPU, CPU, storage, edge, and distributed cloud infrastructure.',
  },
}

const homepageFaqs = [
  {
    question: 'What can I deploy on Alternate Clouds?',
    answer:
      'You can deploy AI agents, model services, web applications, APIs, workers, static sites, and private services using templates or your own containerized project.',
  },
  {
    question: 'Does Alternate Clouds provide scalable GPUs?',
    answer:
      'Yes. Scalable GPU compute is part of the platform, alongside CPU and storage. The point is to support the complete workload rather than treating every project as GPU-only.',
  },
  {
    question: 'How is this different from a GPU marketplace?',
    answer:
      'A GPU marketplace helps you find accelerated compute. Alternate Clouds also provides deployment workflows, templates, CPU services, storage, domains, and the surrounding infrastructure needed to publish a working system.',
  },
  {
    question: 'Do I need to be an infrastructure engineer?',
    answer:
      'No. The platform is built for people who need to ship, including designers, researchers, founders, and other technology workers using agents to expand what they can do.',
  },
  {
    question: 'Can my team learn the platform before committing?',
    answer:
      'Yes. Alternate Futures Education offers practical classes for AI infrastructure, design, HCI, and frontend engineering. Every pathway includes an Alternate Clouds deployment.',
  },
]

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
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Alternate Clouds infrastructure',
        itemListElement: [
          'AI agent deployment',
          'Scalable GPU compute',
          'CPU application hosting',
          'Cloud storage',
          'Edge and distributed infrastructure',
        ].map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name },
        })),
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: homepageFaqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    },
  ],
}

export default async function LandingPage() {
  const posts = await fetchPublishedPosts(3)
  const featuredPosts: HomepagePost[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    readingTimeMin: post.readingTimeMin,
    tags: post.tags.map((tag) => tag.name),
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <LandingPageClient featuredPosts={featuredPosts} />
    </>
  )
}
