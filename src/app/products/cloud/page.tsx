'use client'

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './cloud.css'

export default function CloudPage() {
  const copyToClipboard = () => {
    const command = 'npm i @alternatefutures/cli'
    navigator.clipboard.writeText(command).then(() => {
      // Optional: Show a confirmation that it was copied
      const copyButton = document.querySelector('.terminal-copy')
      if (copyButton) {
        const originalText = copyButton.textContent
        copyButton.textContent = 'Copied!'
        setTimeout(() => {
          copyButton.textContent = originalText
        }, 2000)
      }
    })
  }
  return (
    <div className="cloud-container">
      <Header />

      <main className="cloud-main">
        <div className="cloud-content">
          <div className="cloud-left">
            <h1 className="cloud-title">
              Ship apps on distributed infra in minutes.
            </h1>
            <p className="cloud-subtitle">
              Host anything on distributed nodes keeping you up even when Centralized Services are down.
            </p>
            <div className="cloud-buttons">
              <a href="/docs" className="cloud-button cloud-button-primary">
                Docs
              </a>
              <a href="https://www.npmjs.com/package/@alternatefutures/cli" className="cloud-button cloud-button-outline">
                NPM packages
              </a>
            </div>
          </div>

          <div className="cloud-right">
            <div className="cloud-graphic">
              <div className="circle-large"></div>
              <div className="circle-small"></div>
              <div className="circle-orange"></div>
              <img src="/assets/soft-star.svg" alt="" className="star-icon star-1" />
              <img src="/assets/soft-star.svg" alt="" className="star-icon star-2" />
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-buttons">
                    <span className="terminal-button red"></span>
                    <span className="terminal-button yellow"></span>
                    <span className="terminal-button green"></span>
                  </div>
                  <span className="terminal-copy" onClick={copyToClipboard} style={{cursor: 'pointer'}}>Copy</span>
                </div>
                <div className="terminal-content">
                  <span className="terminal-prompt">%</span>
                  <span className="terminal-text">npm i @alternatefutures/cli</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="wave-section"></div>

      <Footer variant="peach" />
    </div>
  )
}
