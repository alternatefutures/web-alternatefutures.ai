import React from 'react'
import Image from 'next/image'
import './clouds.css'

const APP_URL = 'https://clouds.alternatefutures.ai'
const DOCS_URL = 'https://docs.alternatefutures.ai'
const DEMO_URL = 'https://demo.alternatefutures.ai'

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function CloudsPage() {
  return (
    <div className="ac-page">
      {/* Helmet Banner */}
      <a href={APP_URL} className="ac-banner">
        <span className="ac-banner-text">Ready to save 30%-80% on compute costs?&nbsp;&nbsp;→&nbsp;&nbsp;</span>
        <span className="ac-banner-link">Join our public beta today!</span>
      </a>

      {/* Navbar */}
      <header className="ac-navbar">
        <a href="/" className="ac-navbar-logo" aria-label="Alternate Futures home">
          <Image src="/products/clouds/af-mark.svg" alt="Alternate Futures" width={50} height={46} priority />
        </a>
        <nav className="ac-navbar-nav" aria-label="Main navigation">
          <a href="/products" className="ac-nav-link">Products</a>
          <a href="/consulting" className="ac-nav-link">Consulting</a>
          <a href={DOCS_URL} className="ac-nav-link" target="_blank" rel="noopener noreferrer">Docs</a>
          <a href={APP_URL} className="ac-btn ac-btn-primary ac-nav-signin" target="_blank" rel="noopener noreferrer">
            Sign In
          </a>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="ac-hero">
          <div className="ac-hero-content">
            <div className="ac-hero-title-wrap">
              <h1 className="ac-hero-title">Alternate Clouds</h1>
              <img src="/products/clouds/beta-pill.svg" alt="Beta" className="ac-beta-pill" />
            </div>
            <p className="ac-hero-subtitle">30–80% cheaper than big tech. One command to deploy.</p>
            <div className="ac-hero-actions">
              <a href={APP_URL} className="ac-btn ac-btn-primary" target="_blank" rel="noopener noreferrer">
                Start saving on compute
                <ChevronRight />
              </a>
              <a href={DOCS_URL} className="ac-btn ac-btn-outline" target="_blank" rel="noopener noreferrer">
                See the docs
                <ChevronRight className="ac-chevron-sm" />
              </a>
            </div>
          </div>
          <div className="ac-hero-mockup">
            <div className="ac-hero-mockup-screen">
              <Image
                src="/products/clouds/hero-mockup.png"
                alt="Alternate Clouds dashboard showing a live deployment with pay-as-you-go pricing"
                width={2362}
                height={1330}
                priority
              />
            </div>
          </div>
        </section>

        {/* Mid-CTA Section */}
        <section className="ac-midcta">
          <img src="/products/clouds/orbs-stars.svg" alt="" className="ac-orbs-mobile" aria-hidden="true" />
          <img src="/products/clouds/reaper.svg" alt="" className="ac-midcta-reaper" aria-hidden="true" />
          <div className="ac-midcta-copy">
            <h2 className="ac-midcta-heading">
              <span className="ac-midcta-line">Compute costs kill momentum.</span>
              <span className="ac-midcta-line">Cheap workarounds add complexity.</span>
              <span className="ac-midcta-serif">We fixed both.</span>
            </h2>
            <p className="ac-midcta-body">
              Cost is the hardest part of building, testing, and scaling anything AI — we know, because it kept
              throttling us too. So we built <strong>Alternate Clouds: real savings on compute, one-command deploys,
              no vendor lock-in, straightforward UX</strong>. Made by builders, for builders. The future just got
              cheaper (<em>and easier</em>) to ship.
            </p>
          </div>
          <a href={DEMO_URL} className="ac-btn ac-btn-terra" target="_blank" rel="noopener noreferrer">
            Watch a demo
            <ChevronRight />
          </a>
        </section>

        {/* Interactive Features Section */}
        <section className="ac-features">
          <img src="/products/clouds/orbs-stars.svg" alt="" className="ac-orbs" aria-hidden="true" />
          <div className="ac-features-inner">
            <div className="ac-features-left">
              <div className="ac-features-heading">
                <p className="ac-eyebrow">Next-Gen Features</p>
                <h2 className="ac-features-title">Built for builders</h2>
              </div>
              <ul className="ac-feature-list">
                <li className="ac-feature">
                  <span className="ac-feature-icon">
                    <img src="/products/clouds/icon-zap.svg" alt="" width={28} height={28} />
                  </span>
                  <div className="ac-feature-text">
                    <h3 className="ac-feature-title">One command = live deployment</h3>
                    <p className="ac-feature-desc">
                      It&rsquo;s that simple! And we have a growing library of templates for all kinds of projects.
                    </p>
                  </div>
                </li>
                <li className="ac-feature">
                  <span className="ac-feature-icon">
                    <img src="/products/clouds/icon-trending-up.svg" alt="" width={28} height={28} />
                  </span>
                  <div className="ac-feature-text">
                    <h3 className="ac-feature-title">Radically Cheaper</h3>
                    <p className="ac-feature-desc">
                      30–80% less cost than big tech like AWS or Vercel. <strong>Flat pricing, no surprises.</strong>
                    </p>
                  </div>
                </li>
                <li className="ac-feature">
                  <span className="ac-feature-icon">
                    <img src="/products/clouds/icon-shield.svg" alt="" width={28} height={28} />
                  </span>
                  <div className="ac-feature-text">
                    <h3 className="ac-feature-title">Private by design</h3>
                    <p className="ac-feature-desc">
                      AI agents can be run in <strong>Trusted Execution Environments (TEEs)</strong>. No one sees
                      inside — not even us.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="ac-features-diagram">
              <img
                src="/products/clouds/network-diagram.svg"
                alt="Diagram of the Alternate Clouds UX layer connecting users to decentralized network infrastructure: AI agents, DePIN site hosting, applications, AI model workbench, integrated services, domain registration, verifiable compute, serverless edge, and decentralized storage"
                width={622}
                height={476}
              />
            </div>
          </div>
        </section>

        {/* Grid Section — deeper look */}
        <section className="ac-deeper">
          <h2 className="ac-deeper-title">Take a deeper look:</h2>
          <div className="ac-deeper-buttons">
            <a href={DOCS_URL} className="ac-btn ac-btn-primary" target="_blank" rel="noopener noreferrer">
              Docs
              <ChevronRight />
            </a>
            <a
              href="https://github.com/alternatefutures/package-cloud-cli"
              className="ac-btn ac-btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              CLI
              <ChevronRight className="ac-chevron-sm" />
            </a>
            <a
              href="https://github.com/alternatefutures/package-cloud-sdk"
              className="ac-btn ac-btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              SDK
              <ChevronRight className="ac-chevron-sm" />
            </a>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="ac-midcta ac-finalcta">
          <div className="ac-midcta-copy">
            <h2 className="ac-finalcta-heading">
              Welcome to the <span className="ac-finalcta-serif">future.</span>
            </h2>
            <p className="ac-finalcta-sub">See how much you can get done with more affordable compute.</p>
          </div>
          <a href={APP_URL} className="ac-btn ac-btn-terra">
            Try Alternate Clouds Beta
            <ChevronRight />
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="ac-footer">
        <div className="ac-footer-top">
          <div className="ac-footer-brand">
            <a href="/" aria-label="Alternate Futures home">
              <img
                src="/landing/title-union.svg"
                alt="Alternate Futures"
                className="ac-footer-wordmark"
                width={280}
                height={62}
              />
            </a>
            <p className="ac-footer-tagline">Building the infrastructure for human-computer alignment.</p>
          </div>
          <div className="ac-footer-social">
            <a href="https://x.com/AltFuturesAI" aria-label="Twitter/X" target="_blank" rel="noopener noreferrer">
              <img src="/products/clouds/icon-twitter.svg" alt="" width={20} height={20} />
            </a>
            <a href="https://github.com/alternatefutures" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
              <img src="/products/clouds/icon-github.svg" alt="" width={20} height={20} />
            </a>
            <a
              href="https://www.linkedin.com/company/alternate-futures-ai"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/products/clouds/icon-linkedin.svg" alt="" width={20} height={20} />
            </a>
            <a href="https://discord.gg/YW6zZfZZUU" aria-label="Discord" target="_blank" rel="noopener noreferrer">
              <img src="/products/clouds/icon-circle-x.svg" alt="" width={20} height={20} />
            </a>
          </div>
        </div>
        <div className="ac-footer-bottom">
          <p className="ac-footer-copyright">© {new Date().getFullYear()} Alternate Futures Labs Inc. All rights reserved.</p>
          <div className="ac-footer-links">
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/privacy">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
