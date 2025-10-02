import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <a href="/" className="logo">
          <img src="/assets/logo.svg" alt="Alternate Futures" />
        </a>
        <nav className="nav">
          <div className="nav-links">
            <a href="/products" className="nav-link">Products</a>
            <a href="/consulting" className="nav-link">Consulting</a>
          </div>
          <div className="social-links">
            <a href="https://www.linkedin.com/company/alternate-futures-ai" className="social-link">
              <img src="/assets/linkedin.svg" alt="LinkedIn Social Link" />
            </a>
            <a className="social-link" href="https://x.com/AltFuturesAI">
              <img src="/assets/twitter.svg" alt="Twitter Social Link" />
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header