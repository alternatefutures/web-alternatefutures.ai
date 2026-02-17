import React from 'react'
import Image from 'next/image'

interface HeaderProps {
  activePage?: string
  subPage?: string
}

const Header: React.FC<HeaderProps> = ({ activePage, subPage }) => {
  return (
    <header className="header">
      <div className="header-content">
        <a href="/" className="logo">
          <Image src="/assets/logo.svg" alt="Alternate Futures" width={72} height={58} priority />
        </a>
        <nav className="nav">
          <div className="nav-links">
            <div className="nav-column">
              <a href="/products" className={`nav-link ${activePage === 'products' ? 'active' : ''}`}>Products</a>
              {subPage && activePage === 'products' && (
                <div className="sub-nav-content">
                  <span className="sub-nav-line"></span>
                  <span className="sub-nav-text">{subPage}</span>
                </div>
              )}
            </div>
            <div className="nav-column">
              <a href="/consulting" className={`nav-link ${activePage === 'consulting' ? 'active' : ''}`}>Consulting</a>
              {subPage && activePage === 'consulting' && (
                <div className="sub-nav-content">
                  <span className="sub-nav-line"></span>
                  <span className="sub-nav-text">{subPage}</span>
                </div>
              )}
            </div>
            <div className="nav-column">
              <a href="/blog" className={`nav-link ${activePage === 'blog' ? 'active' : ''}`}>Blog</a>
            </div>
            <div className="nav-column">
              <a href="https://docs.alternatefutures.ai" className="nav-link" target="_blank" rel="noopener noreferrer">Docs</a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header