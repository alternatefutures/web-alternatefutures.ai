'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import RequestAccessModal from '@/components/RequestAccessModal'

export interface HomepagePost {
  slug: string
  title: string
  excerpt: string | null
  publishedAt: string | null
  readingTimeMin: number | null
  tags: string[]
}

interface LandingPageClientProps {
  featuredPosts?: HomepagePost[]
}

const CLOUDS_URL = 'https://clouds.alternatefutures.ai'
const DOCS_URL = 'https://docs.alternatefutures.ai'
const EDUCATION_URL = 'https://education.alternatefutures.ai'

const pathways = [
  {
    number: '01',
    title: 'Deploy AI agents',
    description:
      'Run agent services, tools, memory, and private endpoints on infrastructure you can actually operate.',
    keywords: ['AI agent infrastructure', 'private services'],
    href: '/products/clouds',
  },
  {
    number: '02',
    title: 'Scale GPU workloads',
    description:
      'Move model inference, training experiments, and accelerated workloads onto scalable GPU compute.',
    keywords: ['GPU cloud', 'AI inference'],
    href: '/products/clouds',
  },
  {
    number: '03',
    title: 'Run CPU services',
    description:
      'Deploy APIs, workers, web applications, and the ordinary services every serious AI system still needs.',
    keywords: ['CPU cloud', 'application hosting'],
    href: '/products/clouds',
  },
  {
    number: '04',
    title: 'Connect storage',
    description:
      'Keep artifacts, data, and application state close to the workloads that use them.',
    keywords: ['cloud storage', 'data infrastructure'],
    href: DOCS_URL,
    external: true,
  },
  {
    number: '05',
    title: 'Build at the edge',
    description:
      'Design responsive AI experiences that divide work intelligently between the browser, edge, and cloud.',
    keywords: ['edge AI', 'browser AI'],
    href: '/blog',
  },
  {
    number: '06',
    title: 'Learn by deploying',
    description:
      'Take a hands-on course and finish with a working project—not a folder of slides.',
    keywords: ['AI education', 'hands-on workshops'],
    href: EDUCATION_URL,
    external: true,
  },
]

const platformLayers = [
  ['GPU', 'Accelerated workloads'],
  ['CPU', 'Agents, APIs, and apps'],
  ['Storage', 'State, data, and artifacts'],
  ['Edge', 'Fast, local experiences'],
]

const defaultResources: HomepagePost[] = [
  {
    slug: 'introducing-alternate-futures',
    title: 'What belongs in an AI infrastructure stack?',
    excerpt:
      'A practical look at the compute, storage, deployment, and operational layers between an idea and a production AI system.',
    publishedAt: null,
    readingTimeMin: null,
    tags: ['AI infrastructure'],
  },
  {
    slug: 'deploy-first-ai-agent',
    title: 'How do you deploy an AI agent?',
    excerpt:
      'Follow the path from an agent project to a live, inspectable deployment with the services it needs around it.',
    publishedAt: null,
    readingTimeMin: null,
    tags: ['AI agents'],
  },
  {
    slug: 'web3-hosting-vacuum',
    title: 'Where does decentralized infrastructure fit?',
    excerpt:
      'Understand when distributed infrastructure creates real operational value and when it is only extra complexity.',
    publishedAt: null,
    readingTimeMin: null,
    tags: ['Distributed cloud'],
  },
]

function formatDate(value: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

export default function LandingPageClient({
  featuredPosts = [],
}: LandingPageClientProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    source: 'request-access' | 'get-in-touch'
  }>({
    isOpen: false,
    source: 'request-access',
  })

  const resources = featuredPosts.length > 0
    ? featuredPosts.slice(0, 3)
    : defaultResources

  const openModal = (source: 'request-access' | 'get-in-touch') => {
    setModalState({ isOpen: true, source })
  }

  const closeModal = () => {
    setModalState((current) => ({ ...current, isOpen: false }))
  }

  return (
    <div className="frontpage">
      <Header />

      <main>
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-shell home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-kicker">Welcome to the future</p>
              <h1 id="home-title">
                AI infrastructure that fits the <em>whole stack.</em>
              </h1>
              <p className="home-hero-summary">
                Deploy agents, applications, and models across scalable GPU,
                CPU, storage, and edge infrastructure—without stitching
                together a pile of clouds.
              </p>
              <div className="home-actions">
                <a className="home-button home-button-primary" href={CLOUDS_URL}>
                  Start deploying <Arrow />
                </a>
                <Link className="home-button home-button-secondary" href="/products/clouds">
                  Explore Alternate Clouds
                </Link>
              </div>
              <a
                className="home-inception"
                href="https://www.nvidia.com/en-us/startups/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Alternate Futures is a member of the NVIDIA Inception program"
              >
                <span className="home-inception-badge">
                  <img
                    src="/assets/nvidia-inception-program-badge.svg"
                    alt="NVIDIA Inception Program"
                    width="222"
                    height="80"
                  />
                </span>
                <span>
                  Alternate Futures is a member of NVIDIA Inception, a program
                  supporting startups building what comes next in AI.
                </span>
              </a>
            </div>

            <div className="home-stack" aria-label="Alternate Futures infrastructure stack">
              <div className="home-stack-orbit home-stack-orbit-one" aria-hidden="true"></div>
              <div className="home-stack-orbit home-stack-orbit-two" aria-hidden="true"></div>
              <div className="home-stack-star" aria-hidden="true">✦</div>
              <div className="home-stack-label">One control plane</div>
              <div className="home-stack-core">
                <img src="/assets/logo.svg" alt="" width="86" height="70" />
                <p>From code to a live workload</p>
              </div>
              <div className="home-layer-list">
                {platformLayers.map(([title, description]) => (
                  <div className="home-layer" key={title}>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="home-marquee" aria-label="Platform capabilities">
          <div>
            <span>AI agents</span>
            <span aria-hidden="true">✦</span>
            <span>Scalable GPU</span>
            <span aria-hidden="true">✦</span>
            <span>CPU services</span>
            <span aria-hidden="true">✦</span>
            <span>Storage</span>
            <span aria-hidden="true">✦</span>
            <span>Browser + edge AI</span>
          </div>
        </section>

        <section className="home-pathways" aria-labelledby="pathways-title">
          <div className="home-shell">
            <div className="home-section-heading">
              <p className="home-eyebrow">Start with the work</p>
              <h2 id="pathways-title">What are you trying to ship?</h2>
              <p>
                Choose the problem that brought you here. Each path connects
                the infrastructure, documentation, and learning resources you
                need to make it real.
              </p>
            </div>

            <div className="home-pathway-grid">
              {pathways.map((pathway) => {
                const content = (
                  <>
                    <span className="home-card-number">{pathway.number}</span>
                    <h3>{pathway.title}</h3>
                    <p>{pathway.description}</p>
                    <ul aria-label={`${pathway.title} topics`}>
                      {pathway.keywords.map((keyword) => (
                        <li key={keyword}>{keyword}</li>
                      ))}
                    </ul>
                    <span className="home-card-link">Follow this path <Arrow /></span>
                  </>
                )

                return pathway.external ? (
                  <a
                    className="home-pathway-card"
                    href={pathway.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={pathway.title}
                  >
                    {content}
                  </a>
                ) : (
                  <Link className="home-pathway-card" href={pathway.href} key={pathway.title}>
                    {content}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="home-platform" aria-labelledby="platform-title">
          <div className="home-shell home-platform-grid">
            <div className="home-platform-copy">
              <p className="home-eyebrow home-eyebrow-light">Alternate Clouds</p>
              <h2 id="platform-title">
                AI systems need more than <em>accelerators.</em>
              </h2>
              <p>
                Alternate Clouds pairs scalable GPU access with the CPU,
                storage, networking, templates, and deployment workflows that
                turn compute into a working product.
              </p>
              <div className="home-actions">
                <a className="home-button home-button-cream" href={CLOUDS_URL}>
                  Open Alternate Clouds <Arrow />
                </a>
                <a className="home-text-link" href={DOCS_URL}>
                  Read the documentation <Arrow />
                </a>
              </div>
            </div>

            <dl className="home-value-list">
              <div>
                <dt>One deployment flow</dt>
                <dd>Move from a template or repository to a live URL with less operational glue.</dd>
              </div>
              <div>
                <dt>Workload-shaped infrastructure</dt>
                <dd>Use GPU where acceleration matters, CPU where it doesn’t, and storage where state must persist.</dd>
              </div>
              <div>
                <dt>Learning built into the platform</dt>
                <dd>Courses and workshops end in deployments, so teams learn on the same system they can keep using.</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="home-company" aria-labelledby="company-title">
          <div className="home-shell">
            <div className="home-section-heading home-section-heading-wide">
              <p className="home-eyebrow">One company, three ways forward</p>
              <h2 id="company-title">Build it. Learn it. Make it work for people.</h2>
            </div>
            <div className="home-company-grid">
              <Link href="/products/clouds" className="home-company-card home-company-card-blue">
                <span>Infrastructure</span>
                <h3>Alternate Clouds</h3>
                <p>Deploy agents, applications, models, sites, and services across flexible infrastructure.</p>
                <strong>Explore the platform <Arrow /></strong>
              </Link>
              <a href={EDUCATION_URL} className="home-company-card home-company-card-peach">
                <span>Education</span>
                <h3>Hands-on pathways</h3>
                <p>Build practical AI skills and finish every class with evidence you can publish and share.</p>
                <strong>See upcoming classes <Arrow /></strong>
              </a>
              <Link href="/consulting" className="home-company-card home-company-card-cream">
                <span>Human-centered AI</span>
                <h3>Consulting</h3>
                <p>Shape AI products, interfaces, and operating practices around real human needs.</p>
                <strong>Work with us <Arrow /></strong>
              </Link>
            </div>
          </div>
        </section>

        <section className="home-resources" aria-labelledby="resources-title">
          <div className="home-shell">
            <div className="home-resource-heading">
              <div className="home-section-heading">
                <p className="home-eyebrow">Answers for builders</p>
                <h2 id="resources-title">Learn before you choose.</h2>
              </div>
              <Link href="/blog" className="home-text-link home-text-link-dark">
                Read every article <Arrow />
              </Link>
            </div>

            <div className="home-resource-grid">
              {resources.map((post, index) => {
                const date = formatDate(post.publishedAt)
                return (
                  <Link href={`/blog/${post.slug}`} className="home-resource-card" key={post.slug}>
                    <span className="home-resource-index">0{index + 1}</span>
                    <div className="home-resource-meta">
                      {post.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                    <h3>{post.title}</h3>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <div className="home-resource-footer">
                      <span>{date || 'Practical guide'}</span>
                      {post.readingTimeMin && <span>{post.readingTimeMin} min read</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="home-faq" aria-labelledby="faq-title">
          <div className="home-shell home-faq-grid">
            <div className="home-section-heading">
              <p className="home-eyebrow">Good questions</p>
              <h2 id="faq-title">What builders ask us first.</h2>
            </div>
            <div className="home-faq-list">
              <details>
                <summary>What can I deploy on Alternate Clouds?</summary>
                <p>You can deploy AI agents, model services, web applications, APIs, workers, static sites, and private services using templates or your own containerized project.</p>
              </details>
              <details>
                <summary>Does Alternate Clouds provide scalable GPUs?</summary>
                <p>Yes. Scalable GPU compute is part of the platform, alongside CPU and storage. The point is to support the complete workload rather than treating every project as GPU-only.</p>
              </details>
              <details>
                <summary>How is this different from a GPU marketplace?</summary>
                <p>A GPU marketplace helps you find accelerated compute. Alternate Clouds also gives you deployment workflows, templates, CPU services, storage, domains, and the surrounding infrastructure needed to publish a working system.</p>
              </details>
              <details>
                <summary>Do I need to be an infrastructure engineer?</summary>
                <p>No. The platform is built for people who need to ship, including designers, researchers, founders, and other technology workers using agents to expand what they can do.</p>
              </details>
              <details>
                <summary>Can my team learn the platform before committing?</summary>
                <p>Yes. Alternate Futures Education offers practical classes for AI infrastructure, design, HCI, and frontend engineering. Every pathway includes an Alternate Clouds deployment.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="home-final-cta" aria-labelledby="final-cta-title">
          <div className="home-shell home-final-cta-inner">
            <div>
              <p className="home-kicker">Welcome to the future</p>
              <h2 id="final-cta-title">Deploy something people can use.</h2>
            </div>
            <div className="home-actions">
              <a className="home-button home-button-primary" href={CLOUDS_URL}>
                Start building <Arrow />
              </a>
              <button
                className="home-button home-button-secondary"
                onClick={() => openModal('get-in-touch')}
              >
                Talk with us
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="cream" />

      <RequestAccessModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        source={modalState.source}
      />
    </div>
  )
}
