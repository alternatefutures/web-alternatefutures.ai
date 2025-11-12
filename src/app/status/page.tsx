'use client'

import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './status.css'

const StatusContent = dynamic(() => import('@/components/StatusContent'), {
  loading: () => (
    <main className="status-page">
      <div className="status-container">
        <h1 className="status-title">System Status</h1>
        <p className="status-subtitle">Real-time monitoring of Alternate Futures infrastructure</p>
        <div className="status-loading">
          <div className="spinner"></div>
          <p>Loading status...</p>
        </div>
      </div>
    </main>
  ),
  ssr: false
})

export default function StatusPage() {
  return (
    <div className="container">
      <div className="page-wrapper">
        <Header />
        <StatusContent />
        <Footer />
      </div>
    </div>
  )
}
