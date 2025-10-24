import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './products.css'

export default function ProductsPage() {
  return (
    <div className="products-container">
      <Header />

      <section className="products-list-section">
        <div className="products-list-content">
          <h1 className="products-title">Our Products</h1>
          <div className="product-card">
            <h2 className="product-card-title">Decentralized Cloud</h2>
            <p className="product-card-description">
              Ship apps on distributed infrastructure in minutes. Host anything on distributed nodes keeping you up even when Centralized Services are down.
            </p>
            <a href="/products/cloud" className="product-card-link">Learn More →</a>
          </div>
        </div>
      </section>

      <section className="products-list-section">
        <div className="products-list-content">
          <div className="product-card product-card-orange">
            <h2 className="product-card-title product-card-title-orange">Coming Soon</h2>
            <p className="product-card-subtitle">printshot.xyz</p>
            <p className="product-card-description product-card-description-orange">
              We&apos;re working on something exciting. Stay tuned!
            </p>
            <a href="https://printshot.xyz" target="_blank" rel="noopener noreferrer" className="product-card-link product-card-link-orange">Visit Site →</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
