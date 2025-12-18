import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './products.css'

export const metadata = {
  title: 'Products - Alternate Futures',
  description: 'Approachable AI, Agentic technologies, and the tools that support them. Explore our decentralized web services and AI consulting solutions.',
}

export default function ProductsPage() {
  return (
    <div className="products-container">
      <Header activePage="products" />

      <div className="products-scrollable">
        <section className="products-list-section">
        <p className="products-intro">We are dedicated to creating approachable AI, Agentic technologies, and the tools that support&nbsp;them.</p>
        <div className="products-list-content">
          {/* Web Services Card */}
          <a href="/products/web-services" className="product-card-link">
            <div className="product-card web-services-card">
              <div className="card-header">
                <div className="title-geo-row">
                  <h2 className="web-services-title">Web Services</h2>
                  <img src="/assets/web_services_geo_cluster.png" alt="Web Services" className="geo-cluster" />
                </div>
              </div>
              <svg className="wavy-divider" viewBox="0 0 400 48" preserveAspectRatio="none">
                <path d="M0,24 Q25,0 50,24 T100,24 T150,24 T200,24 T250,24 T300,24 T350,24 T400,24 L400,48 L0,48 Z" fill="#FFC7AA"/>
              </svg>
              <div className="card-content peach-section">
                <p className="bullet-text">Ship apps on distributed infrastructure in minutes.</p>
                <p className="bullet-text">Host anything on distributed nodes keeping you up even when centralized services are down.</p>
              </div>
            </div>
          </a>

          {/* Printshot Card */}
          <div className="product-card printshot-card">
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
