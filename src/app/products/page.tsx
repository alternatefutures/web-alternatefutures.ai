import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './products.css'

export const metadata = {
  title: 'AI Products for Deployment, AI Search and Commerce',
  description: 'Explore Alternate Futures products for distributed cloud infrastructure, AI application deployment, answer engine optimization, and agent-powered commerce.',
  alternates: { canonical: '/products' },
  openGraph: {
    url: '/products',
    title: 'AI products that move work from intent to outcome',
    description: 'Meet Alternate Clouds, AnswerReady, and the practical AI products Alternate Futures is building to help people deploy, get understood, and complete real work.',
  },
}

const productListData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Alternate Futures products',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'SoftwareApplication',
        name: 'Alternate Clouds',
        applicationCategory: 'DeveloperApplication',
        url: 'https://www.alternatefutures.ai/products/clouds',
        description: 'Distributed cloud infrastructure for deploying applications, AI agents, models, and sites across CPU, scalable GPU, and storage.',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'SoftwareApplication',
        name: 'AnswerReady',
        applicationCategory: 'BusinessApplication',
        url: 'https://www.alternatefutures.ai/products/answerready',
        description: 'AI search and answer engine optimization tools that turn high-value website pages into clear, source-backed answers.',
      },
    },
  ],
}

export default function ProductsPage() {
  return (
    <div className="products-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productListData).replace(/</g, '\\u003c'),
        }}
      />
      <Header activePage="products" />

      <div className="products-scrollable">
        <main>
          <section className="products-hero">
            <div className="products-shell products-hero-grid">
              <div className="products-hero-copy">
                <p className="products-eyebrow">WELCOME TO THE FUTURE</p>
                <h1>AI products that move work from <em>intent</em> to <em>outcome.</em></h1>
              </div>
              <div className="products-hero-detail">
                <p>
                  Alternate Futures builds the practical layers that help AI
                  become useful: infrastructure to run it, clearer information
                  for people and answer engines, and agents that can complete
                  real-world tasks.
                </p>
                <a href="#product-portfolio" className="products-text-link">Meet the products ↓</a>
              </div>
              <div className="products-hero-orbit" aria-hidden="true">
                <span className="products-orbit-core">AF</span>
                <span className="products-orbit-node products-orbit-node-one"></span>
                <span className="products-orbit-node products-orbit-node-two"></span>
                <span className="products-orbit-node products-orbit-node-three"></span>
              </div>
            </div>
          </section>

          <section className="products-thesis" aria-labelledby="products-thesis-title">
            <div className="products-shell">
              <div className="products-section-heading">
                <p className="products-eyebrow">ONE CONNECTED PRODUCT THESIS</p>
                <h2 id="products-thesis-title">Make the distance between wanting and doing shorter.</h2>
              </div>
              <div className="products-thesis-grid">
                <article>
                  <span>01 · UNDERSTAND</span>
                  <h3>Make the answer clear.</h3>
                  <p>Turn knowledge into useful, source-backed information people and AI systems can retrieve.</p>
                </article>
                <article>
                  <span>02 · DEPLOY</span>
                  <h3>Put the system to work.</h3>
                  <p>Give applications, agents, and models an affordable place to run across CPU, GPU, and storage.</p>
                </article>
                <article>
                  <span>03 · ACT</span>
                  <h3>Finish the job.</h3>
                  <p>Design agents around real outcomes, with people in control of the decisions that matter.</p>
                </article>
              </div>
            </div>
          </section>

        <section className="products-list-section">
        <div className="products-shell products-list-heading" id="product-portfolio">
          <p className="products-eyebrow">THE PRODUCT PORTFOLIO</p>
          <h2>Built to be used, not just admired.</h2>
          <p>Start with what is slowing you down today. Each product solves a different part of the path from an idea to a working outcome.</p>
        </div>
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
                <p className="alternate-clouds-tagline">Deploy apps, agents, models, and sites across CPU, GPU, and storage.</p>
                <span className="alternate-clouds-card-link">Deploy with Alternate Clouds ↗</span>
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
                <p className="answerready-tagline">Make your best pages clear, useful, and ready to retrieve.</p>
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
          <div className="product-card printshot-card" aria-label="Printshot, a social commerce agent in development">
            <div className="printshot-card-header">
              <div className="printshot-status">IN DEVELOPMENT</div>
              <p className="printshot-label">SOCIAL COMMERCE AGENT</p>
              <div className="printshot-logo">
                <img src="/assets/printshot_logo_blackoutlined.svg" alt="Printshot" className="printshot-logo-img" />
              </div>
            </div>
            <div className="printshot-wave" aria-hidden="true"><span></span></div>
            <div className="printshot-card-content">
              <h3>From “I want that” to a completed order.</h3>
              <p>Printshot is being designed to help people discover, confirm, and buy products without breaking the conversation.</p>
              <div className="printshot-steps" aria-label="See, confirm, and ship">
                <span>SEE</span><i>→</i><span>CONFIRM</span><i>→</i><span>SHIP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

          <section className="products-start" aria-labelledby="products-start-title">
            <div className="products-shell products-start-grid">
              <div>
                <p className="products-eyebrow products-eyebrow-light">START WHERE THE WORK IS STUCK</p>
                <h2 id="products-start-title">What do you need to move forward?</h2>
              </div>
              <div className="products-start-options">
                <a href="https://clouds.alternatefutures.ai">
                  <span>I need somewhere to run it.</span>
                  <strong>Start deploying on Alternate Clouds ↗</strong>
                </a>
                <a href="https://answerready.alternatefutures.ai/#checker">
                  <span>I need people and AI systems to understand it.</span>
                  <strong>Check a page with AnswerReady ↗</strong>
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer variant="cream" />
    </div>
  )
}
