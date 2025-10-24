'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface SubscriptionError {
  timestamp: string
  error: string
  deploymentId?: string
}

interface SubscriptionMetrics {
  activeSubscriptions: number
  totalSubscriptionsCreated: number
  totalSubscriptionsClosed: number
  totalEventsEmitted: number
  lastEventTimestamp: string | null
  errors: SubscriptionError[]
}

interface SubscriptionHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  metrics: SubscriptionMetrics
  alerts: string[]
}

export default function StatusPage() {
  const [health, setHealth] = useState<SubscriptionHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchHealth = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              subscriptionHealth {
                status
                metrics {
                  activeSubscriptions
                  totalSubscriptionsCreated
                  totalSubscriptionsClosed
                  totalEventsEmitted
                  lastEventTimestamp
                  errors {
                    timestamp
                    error
                    deploymentId
                  }
                }
                alerts
              }
            }
          `,
        }),
      })

      const data = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setHealth(data.data.subscriptionHealth)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#10B981'
      case 'degraded':
        return '#F59E0B'
      case 'unhealthy':
        return '#EF4444'
      default:
        return '#6B7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✓'
      case 'degraded':
        return '⚠'
      case 'unhealthy':
        return '✗'
      default:
        return '?'
    }
  }

  return (
    <div className="container">
      <div className="page-wrapper">
        <Header />

        <main className="status-page">
          <div className="status-container">
            <h1 className="status-title">System Status</h1>
            <p className="status-subtitle">
              Real-time monitoring of Alternate Futures infrastructure
            </p>

            {loading && (
              <div className="status-loading">
                <div className="spinner"></div>
                <p>Loading status...</p>
              </div>
            )}

            {error && (
              <div className="status-error">
                <p>⚠ Error: {error}</p>
                <button onClick={fetchHealth} className="retry-button">
                  Retry
                </button>
              </div>
            )}

            {health && !loading && (
              <>
                <div className="status-overview">
                  <div
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(health.status),
                      color: 'white'
                    }}
                  >
                    <span className="status-icon">{getStatusIcon(health.status)}</span>
                    <span className="status-text">
                      {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                    </span>
                  </div>
                  <p className="last-updated">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>

                {health.alerts.length > 0 && (
                  <div className="alerts-section">
                    <h2 className="section-title">Active Alerts</h2>
                    {health.alerts.map((alert, index) => (
                      <div key={index} className="alert-item">
                        <span className="alert-icon">⚠</span>
                        <span>{alert}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="metrics-section">
                  <h2 className="section-title">Subscription Metrics</h2>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-value">
                        {health.metrics.activeSubscriptions}
                      </div>
                      <div className="metric-label">Active Subscriptions</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">
                        {health.metrics.totalSubscriptionsCreated}
                      </div>
                      <div className="metric-label">Total Created</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">
                        {health.metrics.totalSubscriptionsClosed}
                      </div>
                      <div className="metric-label">Total Closed</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">
                        {health.metrics.totalEventsEmitted}
                      </div>
                      <div className="metric-label">Events Emitted</div>
                    </div>
                  </div>

                  {health.metrics.lastEventTimestamp && (
                    <div className="last-event">
                      Last event: {new Date(health.metrics.lastEventTimestamp).toLocaleString()}
                    </div>
                  )}
                </div>

                {health.metrics.errors.length > 0 && (
                  <div className="errors-section">
                    <h2 className="section-title">Recent Errors (Last {health.metrics.errors.length})</h2>
                    <div className="errors-list">
                      {health.metrics.errors.slice(0, 10).map((err, index) => (
                        <div key={index} className="error-item">
                          <div className="error-time">
                            {new Date(err.timestamp).toLocaleString()}
                          </div>
                          <div className="error-message">{err.error}</div>
                          {err.deploymentId && (
                            <div className="error-deployment">
                              Deployment: {err.deploymentId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .status-page {
          flex: 1;
          width: 100%;
          padding: 40px 30px;
          font-family: 'Instrument Sans', sans-serif;
        }

        .status-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .status-title {
          font-size: 48px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #1F2937;
        }

        .status-subtitle {
          font-size: 18px;
          color: #6B7280;
          margin-bottom: 40px;
        }

        .status-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 60px 20px;
          color: #6B7280;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #E5E7EB;
          border-top-color: #3B82F6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status-error {
          background-color: #FEF2F2;
          border: 1px solid #FCA5A5;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-error p {
          color: #DC2626;
          margin: 0;
        }

        .retry-button {
          background-color: #DC2626;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .retry-button:hover {
          background-color: #B91C1C;
        }

        .status-overview {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 24px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 24px;
          font-weight: 600;
        }

        .status-icon {
          font-size: 28px;
        }

        .last-updated {
          color: #6B7280;
          font-size: 14px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #1F2937;
        }

        .alerts-section {
          background-color: #FEF3C7;
          border: 1px solid #FCD34D;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          color: #92400E;
          font-size: 16px;
        }

        .alert-item:not(:last-child) {
          border-bottom: 1px solid #FCD34D;
        }

        .alert-icon {
          font-size: 20px;
        }

        .metrics-section {
          background-color: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .metric-card {
          background-color: #F9FAFB;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .metric-value {
          font-size: 36px;
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 8px;
        }

        .metric-label {
          font-size: 14px;
          color: #6B7280;
        }

        .last-event {
          text-align: center;
          color: #6B7280;
          font-size: 14px;
          padding-top: 16px;
          border-top: 1px solid #E5E7EB;
        }

        .errors-section {
          background-color: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .errors-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .error-item {
          background-color: #FEF2F2;
          border-left: 4px solid #EF4444;
          padding: 16px;
          border-radius: 6px;
        }

        .error-time {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 6px;
        }

        .error-message {
          font-size: 14px;
          color: #DC2626;
          margin-bottom: 4px;
        }

        .error-deployment {
          font-size: 12px;
          color: #9CA3AF;
          font-family: monospace;
        }

        @media (max-width: 768px) {
          .status-title {
            font-size: 32px;
          }

          .status-overview {
            flex-direction: column;
            gap: 16px;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
