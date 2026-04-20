'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import {
  fetchAllDevRelMetrics,
  computeMetricsSummary,
  computeMonthOverMonthGrowth,
  METRIC_LABELS,
  METRIC_COLORS,
  type DevRelMetrics,
} from '@/lib/devrel-metrics-api'
import { getCookieValue } from '@/lib/cookies'
import '../devrel-admin.css'

export default function DevRelMetricsDashboard() {
  const [metrics, setMetrics] = useState<DevRelMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const data = await fetchAllDevRelMetrics(token)
        setMetrics(data)
      } catch {
        setLoadError('Failed to load metrics. Please refresh to try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const summary = useMemo(() => computeMetricsSummary(metrics), [metrics])

  const latestMonth = useMemo(() => metrics.length > 0 ? metrics[metrics.length - 1] : null, [metrics])

  function formatNumber(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return n.toLocaleString()
  }

  function formatPeriod(period: string): string {
    const [year, month] = period.split('-')
    const date = new Date(Number(year), Number(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  function growthBadge(field: keyof Omit<DevRelMetrics, 'id' | 'period'>) {
    const growth = computeMonthOverMonthGrowth(metrics, field)
    if (growth === null) return null
    return (
      <span className={`devrel-metric-card-trend ${growth >= 0 ? 'positive' : 'negative'}`}
        style={{ color: growth >= 0 ? 'var(--color-success, #2D8659)' : 'var(--color-error, #EF4444)' }}>
        {growth >= 0 ? '+' : ''}{growth}%
      </span>
    )
  }

  if (loading) {
    return <div className="devrel-admin-empty"><p>Loading metrics...</p></div>
  }

  if (loadError) {
    return (
      <div className="devrel-admin-empty">
        <h2>Error</h2>
        <p>{loadError}</p>
        <button
          className="devrel-admin-new-btn"
          onClick={() => window.location.reload()}
          style={{ marginTop: 12 }}
        >
          Retry
        </button>
      </div>
    )
  }

  const metricFields: (keyof Omit<DevRelMetrics, 'id' | 'period'>)[] = [
    'npmDownloads', 'githubStars', 'githubForks', 'openIssues', 'closedIssues',
    'prMergeTime', 'docsPageviews', 'cliInstalls', 'sdkDownloads',
    'tutorialCompletions', 'communityQuestions', 'communityAnswers',
  ]

  return (
    <>
      <div className="devrel-admin-header">
        <div>
          <Link href="/admin/devrel" className="devrel-admin-back">
            &larr; DevRel
          </Link>
          <h1 style={{ marginTop: 8 }}>Developer Metrics</h1>
        </div>
      </div>

      <div className="devrel-admin-stats">
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Total npm Downloads</div>
          <div className="devrel-admin-stat-value">{formatNumber(summary.totalNpmDownloads)}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">GitHub Stars</div>
          <div className="devrel-admin-stat-value">{formatNumber(summary.totalGithubStars)}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Total Docs Pageviews</div>
          <div className="devrel-admin-stat-value">{formatNumber(summary.totalDocPageviews)}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Avg PR Merge Time</div>
          <div className="devrel-admin-stat-value">{summary.avgPrMergeTime}h</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <h2 className="devrel-admin-section-title">Current Month ({latestMonth ? formatPeriod(latestMonth.period) : '--'})</h2>
      <div className="devrel-metrics-grid">
        {latestMonth && metricFields.map((field) => (
          <div key={field} className="devrel-metric-card">
            <div className="devrel-metric-card-label">{METRIC_LABELS[field]}</div>
            <div className="devrel-metric-card-value" style={{ color: METRIC_COLORS[field] || undefined }}>
              {field === 'prMergeTime'
                ? `${latestMonth[field]}h`
                : formatNumber(latestMonth[field] as number)}
            </div>
            {growthBadge(field)}
          </div>
        ))}
      </div>

      <h2 className="devrel-admin-section-title">Trend: npm Downloads</h2>
      <div style={{ background: 'var(--color-white, #fff)', border: '1px solid var(--color-border, #E5E7EB)', borderRadius: 'var(--radius-md, 8px)', padding: '20px' }}>
        <div className="devrel-bar-chart">
          {metrics.map((m) => {
            const max = Math.max(...metrics.map((x) => x.npmDownloads))
            const pct = max > 0 ? (m.npmDownloads / max) * 100 : 0
            return (
              <div key={m.period} className="devrel-bar-col">
                <div
                  className="devrel-bar"
                  style={{ height: `${pct}%`, background: METRIC_COLORS.npmDownloads }}
                  title={`${m.npmDownloads.toLocaleString()} downloads`}
                />
                <div className="devrel-bar-label">{formatPeriod(m.period)}</div>
              </div>
            )
          })}
        </div>
      </div>

      <h2 className="devrel-admin-section-title" style={{ marginTop: 32 }}>Trend: GitHub Stars</h2>
      <div style={{ background: 'var(--color-white, #fff)', border: '1px solid var(--color-border, #E5E7EB)', borderRadius: 'var(--radius-md, 8px)', padding: '20px' }}>
        <div className="devrel-bar-chart">
          {metrics.map((m) => {
            const max = Math.max(...metrics.map((x) => x.githubStars))
            const pct = max > 0 ? (m.githubStars / max) * 100 : 0
            return (
              <div key={m.period} className="devrel-bar-col">
                <div
                  className="devrel-bar"
                  style={{ height: `${pct}%`, background: METRIC_COLORS.githubStars }}
                  title={`${m.githubStars.toLocaleString()} stars`}
                />
                <div className="devrel-bar-label">{formatPeriod(m.period)}</div>
              </div>
            )
          })}
        </div>
      </div>

      <h2 className="devrel-admin-section-title" style={{ marginTop: 32 }}>All Data</h2>
      <div className="devrel-admin-table-wrap">
        <table className="devrel-admin-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>npm DLs</th>
              <th>Stars</th>
              <th>Forks</th>
              <th>Docs Views</th>
              <th>CLI Installs</th>
              <th>PR Merge (h)</th>
              <th>Q&A Rate</th>
            </tr>
          </thead>
          <tbody>
            {[...metrics].reverse().map((m) => (
              <tr key={m.id}>
                <td style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                  {formatPeriod(m.period)}
                </td>
                <td>{formatNumber(m.npmDownloads)}</td>
                <td>{formatNumber(m.githubStars)}</td>
                <td>{formatNumber(m.githubForks)}</td>
                <td>{formatNumber(m.docsPageviews)}</td>
                <td>{formatNumber(m.cliInstalls)}</td>
                <td>{m.prMergeTime}</td>
                <td>
                  {m.communityQuestions > 0
                    ? `${Math.round((m.communityAnswers / m.communityQuestions) * 100)}%`
                    : '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
