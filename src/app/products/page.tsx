import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './products.css'

export const metadata = {
  title: 'AI Products and Distributed Cloud Infrastructure',
  description: 'Explore Alternate Clouds, AnswerReady, and the AI products Alternate Futures is building for infrastructure, AI search optimization, deployment, and social commerce.',
  alternates: { canonical: '/products' },
}

export default function ProductsPage() {
  return (
    <div className="products-container">
      <Header activePage="products" />

      <div className="products-scrollable">
        <section className="products-list-section">
        <h1 className="products-intro">Approachable AI products and infrastructure built for real deployment.</h1>
        <div className="products-list-content">
          {/* Alternate Clouds Card */}
          <a href="/products/clouds" className="product-card-link">
            <div className="product-card alternate-clouds-card">
              <div className="alternate-clouds-card-copy">
                <p className="alternate-clouds-label">DISTRIBUTED CLOUD INFRASTRUCTURE</p>
                <div className="alternate-clouds-title-row">
                  <h2>Alternate Clouds</h2>
                  <span className="alternate-clouds-beta">BETA</span>
                </div>
                <p className="alternate-clouds-tagline">30–80% cheaper than big tech. One command to deploy.</p>
                <span className="alternate-clouds-card-link">Explore Alternate Clouds ↗</span>
              </div>
              <div className="alternate-clouds-preview">
                <div className="alternate-clouds-preview-frame">
                  <img
                    src="/products/clouds/hero-mockup.png"
                    alt="Alternate Clouds dashboard with a live deployment"
                  />
                </div>
                <span className="alternate-clouds-orbit" aria-hidden="true"></span>
              </div>
            </div>
          </a>

          {/* AnswerReady Card */}
          <a href="/products/answerready" className="product-card-link">
            <div className="product-card answerready-card">
              <div className="answerready-card-header">
                <p className="answerready-label">AN ALTERNATE FUTURES PRODUCT</p>
                <h2 className="answerready-title">Answer<span>Ready</span></h2>
                <p className="answerready-tagline">Make your best pages answer ready.</p>
                <div className="answerready-orbit" aria-hidden="true">
                  <span></span>
                </div>
              </div>
              <div className="answerready-card-content">
                <div className="answerready-question">
                  <span>BUYER QUESTION</span>
                  <p>What does it cost, and what do I receive?</p>
                </div>
                <div className="answerready-answer">
                  <span>PUBLISH-READY ANSWER</span>
                  <p>Price, scope, evidence, and the next step.</p>
                </div>
                <span className="answerready-card-link">Explore AnswerReady ↗</span>
              </div>
            </div>
          </a>

          {/* Printshot Card */}
          <div className="product-card printshot-card">
            <div className="coming-soon-ribbon">Coming Soon</div>
            <div className="card-header black-header">
              <div className="printshot-logo">
                <img src="/assets/printshot_logo_blackoutlined.svg" alt="Printshot" className="printshot-logo-img" />
              </div>
            </div>
            <svg className="wavy-divider-multi" viewBox="0 0 400 72" preserveAspectRatio="none">
              <path d="M0,0 L400,0 L400,72 L0,72 Z" fill="#000000"/>
              <path d="M0,24 Q25,0 50,24 T100,24 T150,24 T200,24 T250,24 T300,24 T350,24 T400,24 L400,72 L0,72 Z" fill="#00D9FF"/>
              <path d="M0,36 Q25,12 50,36 T100,36 T150,36 T200,36 T250,36 T300,36 T350,36 T400,36 L400,72 L0,72 Z" fill="#FFFF00"/>
              <path d="M0,48 Q25,24 50,48 T100,48 T150,48 T200,48 T250,48 T300,48 T350,48 T400,48 L400,72 L0,72 Z" fill="#FF00FF"/>
              <path d="M0,60 Q25,36 50,60 T100,60 T150,60 T200,60 T250,60 T300,60 T350,60 T400,60 L400,72 L0,72 Z" fill="#FFFFFF"/>
            </svg>
            <div className="card-content white-section">
              <p className="printshot-text-blue">Our social media commerce agent come to life, and simple to use.</p>
              <p className="printshot-text-blue">See something, printshot it, pay securely via comments, and it ships to you.</p>
            </div>
          </div>
        </div>
      </section>
      </div>

      <Footer variant="cream" />
    </div>
  )
}
