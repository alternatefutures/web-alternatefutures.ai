import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './products.css'

export default function ProductsPage() {
  return (
    <div className="products-container">
      <Header />

      <section className="coming-soon-section">
        <div className="coming-soon-content">
          <h1 className="coming-soon-title">Coming Soon</h1>
          <p className="coming-soon-subtitle">printshot.xyz</p>
          <p className="coming-soon-description">
            We&apos;re working on something exciting. Stay tuned!
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
