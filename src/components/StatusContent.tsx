'use client'

import { useState, useEffect } from 'react'
import '../app/status/status.css'

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

export default function StatusContent() {
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
    // Only refresh if page is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchHealth()
      }
    }, 30000)
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
  )
}
