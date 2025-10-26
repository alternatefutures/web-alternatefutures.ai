import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './consulting.css'

export default function ConsultingPage() {
  return (
    <div className="consulting-container">
      <Header />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content-consulting">
          <h1 className="hero-title">
            Guiding your business<br/>
            <span className="serif" style={{ textAlign: 'right', display: 'block' }}>into the AI era.</span>
          </h1>
          <a href="mailto:system@alternatefutures.ai" className="cta-button">Talk to us</a>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider"></div>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-container">
          <div className="services-grid">

            {/* Social Commerce Agents Card */}
            <div className="service-card">
              <div className="card-header">
                <h2 className="card-title">Social Commerce Agents</h2>
              </div>
              <div className="card-content">
                <p className="card-description">
                  Generate more business from more places AND spend more time building real customer relationships.
                </p>
                <ul className="features-list">
                  <li className="feature-item">
                    <img src="/assets/double-star-icon.svg" alt="" className="feature-icon" />
                    <span>Shopify integrations</span>
                  </li>
                  <li className="feature-item">
                    <img src="/assets/double-star-icon.svg" alt="" className="feature-icon" />
                    <span>Social media and multi-channel</span>
                  </li>
                </ul>
              </div>
              <div className="card-footer">
                <a href="mailto:system@alternatefutures.ai" className="card-button">Let&apos;s talk agents</a>
              </div>
            </div>

            {/* AI Integration Strategy Card */}
            <div className="service-card">
              <div className="card-header">
                <h2 className="card-title">AI Integration Strategy</h2>
              </div>
              <div className="card-content">
                <p className="card-description">
                  Whether you&apos;ve only dabbled or started to implement AI solutions in your business, we are ready to level up your AI efficacy.
                </p>
                <ul className="features-list">
                  <li className="feature-item">
                    <img src="/assets/double-star-icon.svg" alt="" className="feature-icon" />
                    <span>Agentic implementation</span>
                  </li>
                  <li className="feature-item">
                    <img src="/assets/double-star-icon.svg" alt="" className="feature-icon" />
                    <span>Solutions engineering</span>
                  </li>
                  <li className="feature-item">
                    <img src="/assets/double-star-icon.svg" alt="" className="feature-icon" />
                    <span>LLM/AI site AEO / GEO</span>
                  </li>
                </ul>
              </div>
              <div className="card-footer">
                <a href="mailto:system@alternatefutures.ai" className="card-button">Let&apos;s talk strategy</a>
              </div>
            </div>

            {/* Bespoke AI Projects Card */}
            <div className="service-card">
              <div className="card-header">
                <h2 className="card-title">Bespoke AI Projects</h2>
              </div>
              <div className="card-content">
                <p className="card-description">
                  We take a limited number of engagements to build custom solutions.
                </p>
                <ul className="features-list">
                  <li className="feature-item">
                    <img src="/assets/double-star-icon.svg" alt="" className="feature-icon" />
                    <span>Agent experience design</span>
                  </li>
                  <li className="feature-item">
                    <img src="/assets/double-star-icon.svg" alt="" className="feature-icon" />
                    <span>Fine tuning models or custom generators</span>
                  </li>
                  <li className="feature-item">
                    <img src="/assets/double-star-icon.svg" alt="" className="feature-icon" />
                    <span>AI focused UX solutions</span>
                  </li>
                </ul>
              </div>
              <div className="card-footer">
                <a href="mailto:system@alternatefutures.ai" className="card-button">Let&apos;s design the future</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer variant="blue" />
    </div>
  )
}
