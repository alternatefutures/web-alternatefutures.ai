'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import {
  fetchAllDevRelMetrics,
  computeMetricsSummary,
  computeMonthOverMonthGrowth,
  type DevRelMetrics,
} from '@/lib/devrel-metrics-api'
import { fetchAllChangelog, type ChangelogEntry } from '@/lib/changelog-api'
import { getCookieValue } from '@/lib/cookies'
import './devrel-admin.css'

export default function DevRelDashboard() {
  const [metrics, setMetrics] = useState<DevRelMetrics[]>([])
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [metricsData, changelogData] = await Promise.all([
          fetchAllDevRelMetrics(token),
          fetchAllChangelog(token),
        ])
        setMetrics(metricsData)
        setChangelog(changelogData)
      } catch {
        setLoadError('Failed to load DevRel data. Please refresh to try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const summary = useMemo(() => computeMetricsSummary(metrics), [metrics])

  const growthStars = useMemo(() => computeMonthOverMonthGrowth(metrics, 'githubStars'), [metrics])
  const growthDownloads = useMemo(() => computeMonthOverMonthGrowth(metrics, 'npmDownloads'), [metrics])
  const growthDocs = useMemo(() => computeMonthOverMonthGrowth(metrics, 'docsPageviews'), [metrics])

  function formatNumber(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return n.toLocaleString()
  }

  if (loading) {
    return <div className="devrel-admin-empty"><p>Loading DevRel dashboard...</p></div>
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

  return (
    <>
      <div className="devrel-admin-header">
        <h1>Developer Relations</h1>
      </div>

      <div className="devrel-admin-stats">
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">GitHub Stars</div>
          <div className="devrel-admin-stat-value">{formatNumber(summary.totalGithubStars)}</div>
          {growthStars !== null && (
            <div className={`devrel-admin-stat-change ${growthStars >= 0 ? 'positive' : 'negative'}`}>
              {growthStars >= 0 ? '+' : ''}{growthStars}% MoM
            </div>
          )}
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">npm Downloads</div>
          <div className="devrel-admin-stat-value">{formatNumber(summary.totalNpmDownloads)}</div>
          {growthDownloads !== null && (
            <div className={`devrel-admin-stat-change ${growthDownloads >= 0 ? 'positive' : 'negative'}`}>
              {growthDownloads >= 0 ? '+' : ''}{growthDownloads}% MoM
            </div>
          )}
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Docs Pageviews</div>
          <div className="devrel-admin-stat-value">{formatNumber(summary.totalDocPageviews)}</div>
          {growthDocs !== null && (
            <div className={`devrel-admin-stat-change ${growthDocs >= 0 ? 'positive' : 'negative'}`}>
              {growthDocs >= 0 ? '+' : ''}{growthDocs}% MoM
            </div>
          )}
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Avg PR Merge Time</div>
          <div className="devrel-admin-stat-value">{summary.avgPrMergeTime}h</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Answer Rate</div>
          <div className="devrel-admin-stat-value">{summary.answerRate}%</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <h2 className="devrel-admin-section-title">Quick Access</h2>
      <div className="devrel-admin-nav-cards">
        <Link href="/admin/devrel/changelog" className="devrel-admin-nav-card">
          <div className="devrel-admin-nav-card-title">Changelog</div>
          <div className="devrel-admin-nav-card-desc">
            {changelog.length} entries across {new Set(changelog.map((c) => c.version)).size} versions
          </div>
        </Link>
        <Link href="/admin/devrel/metrics" className="devrel-admin-nav-card">
          <div className="devrel-admin-nav-card-title">Developer Metrics</div>
          <div className="devrel-admin-nav-card-desc">
            {metrics.length} months of data tracked
          </div>
        </Link>
        <Link href="/admin/devrel/docs" className="devrel-admin-nav-card">
          <div className="devrel-admin-nav-card-title">Documentation</div>
          <div className="devrel-admin-nav-card-desc">
            Manage doc pages, coverage reports
          </div>
        </Link>
        <Link href="/admin/devrel/tutorials" className="devrel-admin-nav-card">
          <div className="devrel-admin-nav-card-title">Tutorials</div>
          <div className="devrel-admin-nav-card-desc">
            Tutorial series, completion tracking
          </div>
        </Link>
        <Link href="/admin/devrel/programs" className="devrel-admin-nav-card">
          <div className="devrel-admin-nav-card-title">Developer Programs</div>
          <div className="devrel-admin-nav-card-desc">
            Ambassadors, beta testers, SDK adoption
          </div>
        </Link>
      </div>

      <h2 className="devrel-admin-section-title">Recent Changelog</h2>
      {changelog.length === 0 ? (
        <div className="devrel-admin-empty">
          <p>No changelog entries yet.</p>
        </div>
      ) : (
        <div className="devrel-admin-table-wrap">
          <table className="devrel-admin-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Title</th>
                <th>Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {changelog.slice(0, 5).map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                      {entry.version}
                    </span>
                  </td>
                  <td>{entry.title}</td>
                  <td>
                    <span
                      className="devrel-type-chip"
                      style={{
                        background: entry.type === 'feature' ? '#DBEAFE' : entry.type === 'fix' ? '#D1FAE5' : entry.type === 'improvement' ? '#FEF3C7' : entry.type === 'breaking' ? '#FEE2E2' : '#F3F4F6',
                        color: entry.type === 'feature' ? '#1E40AF' : entry.type === 'fix' ? '#065F46' : entry.type === 'improvement' ? '#92400E' : entry.type === 'breaking' ? '#991B1B' : '#6B7280',
                      }}
                    >
                      {entry.type}
                    </span>
                  </td>
                  <td>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
