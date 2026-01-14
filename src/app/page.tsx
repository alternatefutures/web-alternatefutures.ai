'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import RequestAccessModal from '@/components/RequestAccessModal'
import './landing.css'

export default function LandingPage() {
  const [modalState, setModalState] = useState<{ isOpen: boolean; source: 'request-access' | 'get-in-touch' }>({
    isOpen: false,
    source: 'request-access'
  })

  const openModal = (source: 'request-access' | 'get-in-touch') => {
    setModalState({ isOpen: true, source })
  }

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false })
  }

  return (
    <div className="frontpage">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <img src="/landing/title-union.svg" alt="Alternate Futures" className="title-graphic" />
        <p className="tagline">Building the infrastructure for human-computer alignment.</p>
        <img
          src="/landing/decorative-top.svg"
          alt=""
          className="decorative-element decorative-top"
        />
      </section>

      {/* Wave Divider 1 */}
      <div className="wave-divider wave-1"></div>

      {/* CTA Section */}
      <section className="cta-section">
        {/* Left decorative sparkles */}
        <img src="/landing/star.svg" alt="" className="cta-sparkle-large" />
        <img src="/landing/star.svg" alt="" className="cta-sparkle-small" />

        <div className="cta-content">
          <p className="cta-text">
            Deploy anything on distributed infrastructure in minutes with{' '}
            <span className="highlight">Alternate Clouds</span>.
          </p>
          <button className="cta-button" onClick={() => openModal('request-access')}>
            Request access
            <img src="/landing/star.svg" alt="" className="button-star" />
          </button>
        </div>
      </section>

      {/* Wave Divider 2 */}
      <div className="wave-divider wave-2"></div>

      {/* Info Section */}
      <section className="info-section">
        <h2 className="info-title">Building the Infrastructure for Human-Computer Alignment</h2>
        <p className="info-text">
          We're developing the first comprehensive standards framework and toolset that ensures AI technology serves human flourishing. Our platform enables the creation of adaptive AI products that anticipate user needs while respecting human agency.
        </p>
        <button className="info-button" onClick={() => openModal('get-in-touch')}>
          Get in touch
        </button>
      </section>

      {/* Decorative Bottom Element */}
      <img
        src="/landing/decorative-bottom.svg"
        alt=""
        className="decorative-element decorative-bottom"
      />

      {/* Request Access Modal */}
      <RequestAccessModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        source={modalState.source}
      />
    </div>
  )
}
