'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PiChartLineUpBold,
  PiBuildingsBold,
  PiTrendUpBold,
  PiNewspaperBold,
  PiBellBold,
  PiMagnifyingGlassBold,
  PiArrowsClockwiseBold,
} from 'react-icons/pi'
import {
  fetchIntelEntries,
  fetchCompetitorProfiles,
  getIntelByCategory,
  getCompetitorActivityTimeline,
  getMarketTrends,
  type IntelEntry,
  type CompetitorProfile,
  type IntelCategory,
} from '@/lib/intel-api'
import './intel-admin.css'

const CATEGORY_COLORS: Record<IntelCategory, string> = {
  competitor: 'var(--af-ultra)',
  market: 'var(--af-signal-go)',
  pricing: 'var(--af-terra)',
  technology: 'var(--af-patina)',
  sentiment: 'var(--af-kin-repair)',
}

const CATEGORY_LABELS: Record<IntelCategory, string> = {
  competitor: 'Competitor',
  market: 'Market',
  pricing: 'Pricing',
  technology: 'Technology',
  sentiment: 'Sentiment',
}

export default function IntelHubPage() {
  const [entries, setEntries] = useState<IntelEntry[]>([])
  const [competitors, setCompetitors] = useState<CompetitorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<IntelCategory | null>(null)
  const [alerts, setAlerts] = useState({
    pricingChanges: true,
    newFunding: true,
    productLaunches: true,
    marketReports: false,
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [e, c] = await Promise.all([
        fetchIntelEntries(50, 0, search ? { search } : filterCategory ? { category: filterCategory } : undefined),
        fetchCompetitorProfiles(),
      ])
      setEntries(e)
      setCompetitors(c)
      setLoading(false)
    }
    load()
  }, [search, filterCategory])

  const byCategory = getIntelByCategory(entries)
  const timeline = getCompetitorActivityTimeline(entries)
  const trends = getMarketTrends(entries)

  function getHealthIndicator(c: CompetitorProfile): 'strong' | 'neutral' | 'weak' {
    if (c.marketShare > 8) return 'strong'
    if (c.marketShare > 3) return 'neutral'
    return 'weak'
  }

  function toggleAlert(key: keyof typeof alerts) {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      <div className="intel-header">
        <h1>Market Intelligence Hub</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="intel-btn" onClick={() => window.location.reload()} disabled={loading}>
            <PiArrowsClockwiseBold /> Refresh
          </button>
        </div>
      </div>

      <div className="intel-subnav">
        <Link href="/admin/intel" className="active">Overview</Link>
        <Link href="/admin/intel/competitors">Competitors</Link>
        <Link href="/admin/intel/alerts">Alerts</Link>
        <Link href="/admin/intel/signals">Signals</Link>
        <Link href="/admin/intel/predictions">Predictions</Link>
      </div>

      {/* Stats */}
      <div className="intel-stats">
        <div className="intel-stat-card">
          <div className="intel-stat-icon"><PiBuildingsBold /></div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{competitors.length}</div>
            <div className="intel-stat-label">Tracked Competitors</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-terra) 10%, white)', color: 'var(--af-terra)' }}>
            <PiNewspaperBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{entries.length}</div>
            <div className="intel-stat-label">Intel Entries</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-signal-go) 10%, white)', color: 'var(--af-signal-go)' }}>
            <PiTrendUpBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{trends.length}</div>
            <div className="intel-stat-label">Active Trends</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-patina) 10%, white)', color: 'var(--af-patina)' }}>
            <PiChartLineUpBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">
              {entries.filter((e) => e.sentiment === 'positive').length}
            </div>
            <div className="intel-stat-label">Positive Signals</div>
          </div>
        </div>
      </div>

      {/* Competitor Grid */}
      <div className="intel-section" style={{ marginBottom: 20 }}>
        <div className="intel-section-header">
          <h3 className="intel-section-title">Competitor Overview</h3>
          <Link href="/admin/intel/competitors" className="intel-btn" style={{ fontSize: 12, padding: '3px 10px' }}>
            View All
          </Link>
        </div>
        <div className="intel-section-body">
          <div className="intel-competitor-grid">
            {competitors.map((c) => {
              const health = getHealthIndicator(c)
              const relatedNews = entries.filter((e) => e.relatedCompetitors.includes(c.id))
              return (
                <Link key={c.id} href={`/admin/intel/competitors/${c.id}`} className="intel-competitor-card">
                  <div className="intel-competitor-card-header">
                    <div className="intel-competitor-logo">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="intel-competitor-name">
                        <span className={`intel-health-dot ${health}`} />
                        {c.name}
                      </h4>
                      <span className="intel-competitor-category" data-cat={c.category}>
                        {c.category}
                      </span>
                    </div>
                  </div>
                  <p className="intel-competitor-desc">{c.description}</p>
                  <div className="intel-competitor-metrics">
                    <div className="intel-competitor-metric">
                      <span className="intel-competitor-metric-value">{c.marketShare}%</span>
                      <span className="intel-competitor-metric-label">Market Share</span>
                    </div>
                    <div className="intel-competitor-metric">
                      <span className="intel-competitor-metric-value">{c.pricing.tiers.length}</span>
                      <span className="intel-competitor-metric-label">Tiers</span>
                    </div>
                    <div className="intel-competitor-metric">
                      <span className="intel-competitor-metric-value">{relatedNews.length}</span>
                      <span className="intel-competitor-metric-label">Intel Items</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="intel-grid">
        {/* Recent Moves Timeline */}
        <div className="intel-section">
          <div className="intel-section-header">
            <h3 className="intel-section-title">Recent Activity</h3>
          </div>
          <div className="intel-section-body">
            {/* Category filters */}
            <div className="intel-filter-chips">
              <button
                className={`intel-chip${!filterCategory ? ' active' : ''}`}
                onClick={() => setFilterCategory(null)}
              >
                All
              </button>
              {(Object.keys(CATEGORY_LABELS) as IntelCategory[]).map((cat) => (
                <button
                  key={cat}
                  className={`intel-chip${filterCategory === cat ? ' active' : ''}`}
                  onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            <div className="intel-timeline">
              {entries.slice(0, 8).map((entry) => (
                <div key={entry.id} className="intel-timeline-item">
                  <div className={`intel-timeline-dot ${entry.category}`} />
                  <div className="intel-timeline-content">
                    <h4 className="intel-timeline-title">{entry.title}</h4>
                    <p className="intel-timeline-summary">{entry.summary}</p>
                    <div className="intel-timeline-meta">
                      <span>{entry.source}</span>
                      <span>{new Date(entry.publishedAt).toLocaleDateString()}</span>
                      <span className={`intel-sentiment ${entry.sentiment}`}>
                        {entry.sentiment}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Industry Trends + Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Trends */}
          <div className="intel-section">
            <div className="intel-section-header">
              <h3 className="intel-section-title">Industry Trends</h3>
            </div>
            <div className="intel-section-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {trends.slice(0, 12).map((trend) => (
                  <span
                    key={trend.trend}
                    className={`intel-sentiment ${trend.sentiment}`}
                    style={{
                      padding: '4px 12px',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                    onClick={() => setSearch(trend.trend)}
                  >
                    {trend.trend} ({trend.count})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Alert Configuration */}
          <div className="intel-section">
            <div className="intel-section-header">
              <h3 className="intel-section-title">
                <PiBellBold style={{ marginRight: 6, verticalAlign: -2 }} />
                Alert Configuration
              </h3>
            </div>
            <div className="intel-section-body">
              <div className="intel-alert-config">
                <div className="intel-alert-row">
                  <span className="intel-alert-label">Pricing changes</span>
                  <button
                    className={`intel-alert-toggle${alerts.pricingChanges ? ' active' : ''}`}
                    onClick={() => toggleAlert('pricingChanges')}
                  />
                </div>
                <div className="intel-alert-row">
                  <span className="intel-alert-label">New funding rounds</span>
                  <button
                    className={`intel-alert-toggle${alerts.newFunding ? ' active' : ''}`}
                    onClick={() => toggleAlert('newFunding')}
                  />
                </div>
                <div className="intel-alert-row">
                  <span className="intel-alert-label">Product launches</span>
                  <button
                    className={`intel-alert-toggle${alerts.productLaunches ? ' active' : ''}`}
                    onClick={() => toggleAlert('productLaunches')}
                  />
                </div>
                <div className="intel-alert-row">
                  <span className="intel-alert-label">Market reports</span>
                  <button
                    className={`intel-alert-toggle${alerts.marketReports ? ' active' : ''}`}
                    onClick={() => toggleAlert('marketReports')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Market Share Summary */}
          <div className="intel-section">
            <div className="intel-section-header">
              <h3 className="intel-section-title">Market Share Estimates</h3>
            </div>
            <div className="intel-section-body">
              {competitors
                .sort((a, b) => b.marketShare - a.marketShare)
                .map((c) => (
                  <div key={c.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: 12, fontWeight: 500, color: 'var(--af-stone-700)' }}>
                        {c.name}
                      </span>
                      <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12, fontWeight: 600, color: 'var(--af-stone-600)' }}>
                        {c.marketShare}%
                      </span>
                    </div>
                    <div className="intel-market-share-bar">
                      <div
                        className="intel-market-share-fill"
                        style={{
                          width: `${Math.min(c.marketShare * 4, 100)}%`,
                          background: c.marketShare > 8 ? 'var(--af-ultra)' : c.marketShare > 3 ? 'var(--af-patina)' : 'var(--af-stone-400)',
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
