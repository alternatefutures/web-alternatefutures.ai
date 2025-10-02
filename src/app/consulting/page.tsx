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
            <span className="serif">into the AI era.</span>
          </h1>
          <a href="#contact" className="cta-button">Talk to us</a>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0,30 Q30,10 60,30 T120,30 T180,30 T240,30 T300,30 T360,30 T420,30 T480,30 T540,30 T600,30 T660,30 T720,30 T780,30 T840,30 T900,30 T960,30 T1020,30 T1080,30 T1140,30 T1200,30 L1200,60 L0,60 Z"
                fill="#0026FF"
                opacity="1"/>
        </svg>
      </div>

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

      <Footer />
    </div>
  )
}
