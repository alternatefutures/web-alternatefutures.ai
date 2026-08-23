'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import RequestAccessModal from '@/components/RequestAccessModal'
import BrandWordmark from '@/components/BrandWordmark'

export default function LandingPageClient() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    source: 'request-access' | 'get-in-touch'
  }>({
    isOpen: false,
    source: 'request-access',
  })

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
        <section className="hero-section">
          <BrandWordmark height={100} className="title-graphic" />
          <h1 className="tagline">
            AI infrastructure for the systems people actually use.
          </h1>
          <img
            src="/landing/decorative-top.svg"
            alt=""
            className="decorative-element decorative-top"
          />
        </section>

        <div className="wave-divider wave-1" aria-hidden="true"></div>

        <section className="cta-section" aria-labelledby="clouds-heading">
          <div className="cta-content">
            <img
              src="/landing/decorative-bottom.svg"
              alt=""
              className="decorative-element decorative-bottom"
            />
            <p className="cta-text" id="clouds-heading">
              Deploy applications and AI workloads across CPU, scalable GPU,
              and storage with{' '}
              <Link href="/products/clouds" className="highlight highlight-link">
                Alternate Clouds
              </Link>
              .
            </p>
            <button
              className="cta-button"
              onClick={() => openModal('request-access')}
            >
              Request access
              <img src="/landing/star.svg" alt="" className="button-star" />
            </button>
          </div>
        </section>

        <div className="wave-divider wave-2" aria-hidden="true"></div>

        <section className="info-section">
          <h2 className="info-title">
            AI Infrastructure for Human-Computer Alignment
          </h2>
          <p className="info-text">
            Alternate Futures builds the tools, education, and standards needed
            to deploy adaptive AI systems while preserving human agency. Use
            distributed infrastructure for real applications, learn through
            working deployments, and publish evidence another person can inspect.
          </p>
          <nav className="info-links" aria-label="Explore Alternate Futures">
            <Link href="/products/clouds">Explore Alternate Clouds</Link>
            <Link href="/blog">Read infrastructure insights</Link>
            <a href="https://education.alternatefutures.ai">
              Take a hands-on class
            </a>
            <a href="https://docs.alternatefutures.ai">Read the documentation</a>
          </nav>
          <button
            className="info-button"
            onClick={() => openModal('get-in-touch')}
          >
            Get in touch
          </button>
        </section>
      </main>

      <Footer variant="blue" />

      <RequestAccessModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        source={modalState.source}
      />
    </div>
  )
}
