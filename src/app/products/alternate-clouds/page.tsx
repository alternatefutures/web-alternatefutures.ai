'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import RequestAccessModal from '@/components/RequestAccessModal'
import './alternate-clouds.css'

export default function AlternateCloudsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="cloud-container">
      <div className="announcement-bar">
        <span className="announcement-text">Alternate Clouds is now in Beta!</span>
        <a
          href="#"
          className="announcement-cta"
          onClick={(e) => {
            e.preventDefault()
            setIsModalOpen(true)
          }}
        >
          Request Access
        </a>
      </div>
      <Header activePage="products" subPage="Alternate Clouds" />

      <div className="cloud-scrollable">
        <main className="cloud-main">
        <div className="cloud-content">
          <div className="cloud-left">
            <Image
              src="/assets/alternate-clouds-logo.png"
              alt="Alternate Clouds"
              width={1056}
              height={304}
              className="cloud-logo"
              priority
            />
            <p className="cloud-subtitle">
              A more affordable, more stable way to deploy everything from sites to AI agents.
            </p>
            <button className="cloud-cta-button" onClick={() => setIsModalOpen(true)}>
              Request access
              <img src="/landing/star.svg" alt="" className="cloud-button-star" />
            </button>
          </div>

          <div className="cloud-right">
          </div>
        </div>
      </main>

      <div className="wave-divider wave-1"></div>

      <div className="wave-section">
        <div className="wave-section-content">
          <div className="wave-section-text">
            <h2 className="wave-section-title">Deploy anywhere. Pay less. Stay online.</h2>
            <p className="wave-section-subtitle">Decentralized cloud infrastructure that actually works like cloud should—simple, stable, and affordable.</p>
          </div>
          <div className="cloud-graphic">
            <div className="circle-large"></div>
            <div className="circle-small"></div>
            <div className="circle-orange"></div>
            <Image src="/assets/soft-star.svg" alt="" className="star-icon star-1" width={73} height={73} />
            <Image src="/assets/soft-star.svg" alt="" className="star-icon star-2" width={29} height={29} />
          </div>
        </div>
      </div>

      <div className="wave-divider wave-2"></div>

      <div className="blue-section">
        <div className="features-grid">
          <div className="feature-item">
            <h3 className="feature-title">LOWER COSTS</h3>
            <p className="feature-subtitle">Predictable pricing. Finally</p>
            <p className="feature-description">No surprise charges. No rate limits. No corporate markup. Simple, transparent per-resource pricing. Deploy unlimited times. Scale without fear. Your bill makes sense.</p>
          </div>
          <div className="feature-item">
            <h3 className="feature-title">ALWAYS ONLINE</h3>
            <p className="feature-subtitle">When other providers are down, you're still up.</p>
            <p className="feature-description">No single point of failure. Your apps run across distributed networks. One provider goes dark? Your service doesn't notice. True redundancy. Zero downtime anxiety.</p>
          </div>
          <div className="feature-item">
            <h3 className="feature-title">DEVELOPER TOOLING</h3>
            <p className="feature-subtitle">Ship in minutes, not days.</p>
            <p className="feature-description">JavaScript SDKs. CLI tools. Everything you expect. Decentralized infrastructure with centralized cloud UX. Easy enough for side projects. Powerful enough for production.</p>
            <div className="feature-buttons">
              <a href="https://github.com/alternatefutures/package-cloud-cli" className="feature-button">
                CLI
              </a>
              <a href="https://github.com/alternatefutures/package-cloud-sdk" className="feature-button">
                SDK
              </a>
            </div>
          </div>
          <div className="feature-item">
            <h3 className="feature-title">PERMISSIONLESS</h3>
            <p className="feature-subtitle">Your code. Your terms. You're in control.</p>
            <p className="feature-description">Deploy without asking permission. Run without restrictions. Infrastructure that can't be arbitrarily shut down by a single company. Build freely. Deploy confidently.</p>
          </div>
          <div className="feature-item">
            <h3 className="feature-title">JOIN EARLY ACCESS</h3>
            <p className="feature-subtitle">Be among the first to deploy on infrastructure that works for you, not against you.</p>
            <p className="feature-description">• No seat fees during early access<br/>• No minimums. No commitment.<br/>• Rolling access as we scale</p>
          </div>
          <div className="feature-item">
            <h3 className="feature-title">OPEN SOURCE</h3>
            <p className="feature-subtitle">Transparency and trust are central to our philosophy.</p>
            <p className="feature-description">Built on open standards and community driven</p>
          </div>
        </div>
      </div>
      </div>

      <Footer variant="blue" />
      <RequestAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source="request-access"
      />
    </div>
  )
}
