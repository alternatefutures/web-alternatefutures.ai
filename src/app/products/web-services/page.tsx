import React from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CopyButton from '@/components/CopyButton'
import './web-services.css'

export const metadata = {
  title: 'Web Services - Alternate Futures',
  description: 'Ship apps on distributed infrastructure in minutes. Host anything on distributed nodes keeping you up even when centralized services are down.',
}

export default function WebServicesPage() {
  return (
    <div className="cloud-container">
      <Header activePage="products" subPage="Web Services" />

      <div className="cloud-scrollable">
        <main className="cloud-main">
        <div className="cloud-content">
          <div className="cloud-left">
            <h1 className="cloud-title">
              Ship&nbsp;apps&nbsp;on distributed&nbsp;infra in&nbsp;minutes.
            </h1>
            <p className="cloud-subtitle">
              Host anything on distributed nodes keeping you up even when Centralized Services are down.
            </p>
          </div>

          <div className="cloud-right">
            <div className="cloud-graphic">
              <div className="circle-large"></div>
              <div className="circle-small"></div>
              <div className="circle-orange"></div>
              <Image src="/assets/soft-star.svg" alt="" className="star-icon star-1" width={73} height={73} />
              <Image src="/assets/soft-star.svg" alt="" className="star-icon star-2" width={29} height={29} />
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-buttons">
                    <span className="terminal-button red"></span>
                    <span className="terminal-button yellow"></span>
                    <span className="terminal-button green"></span>
                  </div>
                  <CopyButton text="npm i @alternatefutures/cli" />
                </div>
                <div className="terminal-content">
                  <span className="terminal-prompt">%</span>
                  <span className="terminal-text">npm i @alternatefutures/cli</span>
                </div>
              </div>
            </div>
          </div>

          <div className="cloud-buttons">
            <a href="/docs" className="cloud-button cloud-button-primary">
              Docs
            </a>
            <a href="https://github.com/alternatefutures/package-cloud-cli" className="cloud-button cloud-button-outline">
              CLI
            </a>
            <a href="https://github.com/alternatefutures/package-cloud-sdk" className="cloud-button cloud-button-outline">
              SDK
            </a>
            <a href="https://app.alternatefutures.ai" className="cloud-button cloud-button-outline">
              App
            </a>
          </div>
        </div>
      </main>

      <div className="wave-section"></div>
      </div>

      <Footer variant="peach" />
    </div>
  )
}
