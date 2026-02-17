'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  PiArrowLeftBold,
  PiGlobeBold,
  PiChartLineUpBold,
  PiShieldCheckBold,
  PiWarningBold,
  PiLightbulbBold,
  PiTargetBold,
  PiNewspaperBold,
  PiCurrencyDollarBold,
  PiCheckBold,
  PiXBold,
} from 'react-icons/pi'
import {
  fetchCompetitorById,
  fetchIntelEntries,
  fetchFeatureMatrix,
  type CompetitorProfile,
  type IntelEntry,
  type FeatureComparison,
} from '@/lib/intel-api'
import '../../intel-admin.css'

export default function CompetitorDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [competitor, setCompetitor] = useState<CompetitorProfile | null>(null)
  const [news, setNews] = useState<IntelEntry[]>([])
  const [features, setFeatures] = useState<FeatureComparison[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [c, n, f] = await Promise.all([
        fetchCompetitorById(id),
        fetchIntelEntries(20, 0, { competitor: id }),
        fetchFeatureMatrix(),
      ])
      setCompetitor(c)
      setNews(n)
      setFeatures(f)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="growth-empty" style={{ padding: '80px 0' }}>
        <div className="growth-empty-sub">Loading competitor profile...</div>
      </div>
    )
  }

  if (!competitor) {
    return (
      <div className="growth-empty" style={{ padding: '80px 0' }}>
        <div className="growth-empty-title">Competitor not found</div>
        <Link href="/admin/intel/competitors" className="intel-btn" style={{ marginTop: 16 }}>
          <PiArrowLeftBold /> Back to Competitors
        </Link>
      </div>
    )
  }

  // Generate SWOT opportunities and threats from weaknesses/strengths
  const opportunities = competitor.weaknesses.map((w) => `Exploit: ${w}`)
  const threats = competitor.strengths.map((s) => `They lead in: ${s}`)

  function renderFeatureValue(value: boolean | string): React.ReactNode {
    if (value === true) return <span className="intel-check"><PiCheckBold /></span>
    if (value === false) return <span className="intel-cross"><PiXBold /></span>
    return <span className="intel-partial">{String(value)}</span>
  }

  return (
    <>
      {/* Breadcrumb + Header */}
      <div style={{ marginBottom: 8 }}>
        <Link href="/admin/intel/competitors" style={{ fontSize: 13, color: 'var(--af-stone-500)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <PiArrowLeftBold /> Back to Competitors
        </Link>
      </div>

      <div className="intel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="intel-competitor-logo" style={{ width: 48, height: 48, fontSize: 20 }}>
            {competitor.name.charAt(0)}
          </div>
          <div>
            <h1 style={{ margin: 0 }}>{competitor.name}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
              <span className="intel-competitor-category" data-cat={competitor.category}>
                {competitor.category}
              </span>
              <a
                href={competitor.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--af-ultra)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}
              >
                <PiGlobeBold /> {competitor.website.replace(/https?:\/\//, '')}
              </a>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontFamily: 'var(--af-font-architect)', fontSize: 14, color: 'var(--af-stone-600)', lineHeight: 1.5, margin: '0 0 24px', maxWidth: 700 }}>
        {competitor.description}
      </p>

      {/* Key Metrics */}
      <div className="intel-stats" style={{ marginBottom: 24 }}>
        <div className="intel-stat-card">
          <div className="intel-stat-icon"><PiChartLineUpBold /></div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{competitor.marketShare}%</div>
            <div className="intel-stat-label">Market Share</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-terra) 10%, white)', color: 'var(--af-terra)' }}>
            <PiCurrencyDollarBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{competitor.pricing.tiers[0]?.price || 'N/A'}</div>
            <div className="intel-stat-label">Starting Price</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-signal-go) 10%, white)', color: 'var(--af-signal-go)' }}>
            <PiTargetBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{competitor.features.length}</div>
            <div className="intel-stat-label">Features</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-patina) 10%, white)', color: 'var(--af-patina)' }}>
            <PiNewspaperBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{news.length}</div>
            <div className="intel-stat-label">Intel Items</div>
          </div>
        </div>
      </div>

      {/* SWOT Analysis */}
      <div className="intel-section" style={{ marginBottom: 20 }}>
        <div className="intel-section-header">
          <h3 className="intel-section-title">SWOT Analysis</h3>
        </div>
        <div className="intel-section-body">
          <div className="intel-swot">
            <div className="intel-swot-quadrant strengths">
              <h4 className="intel-swot-label" style={{ color: 'var(--af-signal-go)' }}>
                <PiShieldCheckBold style={{ marginRight: 6, verticalAlign: -2 }} />
                Strengths
              </h4>
              <ul className="intel-swot-list">
                {competitor.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div className="intel-swot-quadrant weaknesses">
              <h4 className="intel-swot-label" style={{ color: 'var(--af-signal-stop)' }}>
                <PiWarningBold style={{ marginRight: 6, verticalAlign: -2 }} />
                Weaknesses
              </h4>
              <ul className="intel-swot-list">
                {competitor.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>

            <div className="intel-swot-quadrant opportunities">
              <h4 className="intel-swot-label" style={{ color: 'var(--af-ultra)' }}>
                <PiLightbulbBold style={{ marginRight: 6, verticalAlign: -2 }} />
                Opportunities
              </h4>
              <ul className="intel-swot-list">
                {opportunities.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>

            <div className="intel-swot-quadrant threats">
              <h4 className="intel-swot-label" style={{ color: 'var(--af-signal-wait)' }}>
                <PiTargetBold style={{ marginRight: 6, verticalAlign: -2 }} />
                Threats
              </h4>
              <ul className="intel-swot-list">
                {threats.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="intel-grid">
        {/* Feature Comparison vs AF */}
        <div className="intel-section">
          <div className="intel-section-header">
            <h3 className="intel-section-title">Feature Comparison vs AF</h3>
          </div>
          <div className="intel-section-body" style={{ overflowX: 'auto' }}>
            <table className="intel-comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th style={{ color: 'var(--af-terra)', fontWeight: 700 }}>AF</th>
                  <th>{competitor.name}</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f) => (
                  <tr key={f.featureName}>
                    <td>{f.featureName}</td>
                    <td>{renderFeatureValue(f.af)}</td>
                    <td>{renderFeatureValue(f.competitors[competitor.name] ?? false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing */}
        <div className="intel-section">
          <div className="intel-section-header">
            <h3 className="intel-section-title">Pricing Tiers</h3>
          </div>
          <div className="intel-section-body">
            <div className="intel-pricing-grid">
              {competitor.pricing.tiers.map((tier) => (
                <div key={tier.name} className="intel-pricing-card">
                  <h4 className="intel-pricing-card-name">{tier.name}</h4>
                  <div className="intel-pricing-card-price">{tier.price}</div>
                  <ul className="intel-pricing-card-features">
                    {tier.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Share Visualization */}
      <div className="intel-section" style={{ marginTop: 20 }}>
        <div className="intel-section-header">
          <h3 className="intel-section-title">Market Position</h3>
        </div>
        <div className="intel-section-body">
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: 13, fontWeight: 600 }}>
                {competitor.name}
              </span>
              <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 13, fontWeight: 700 }}>
                {competitor.marketShare}%
              </span>
            </div>
            <div className="intel-market-share-bar" style={{ height: 28 }}>
              <div
                className="intel-market-share-fill"
                style={{
                  width: `${Math.min(competitor.marketShare * 4, 100)}%`,
                  background: 'var(--af-ultra)',
                }}
              >
                {competitor.marketShare > 3 && `${competitor.marketShare}%`}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--af-stone-500)', fontFamily: 'var(--af-font-architect)' }}>
            Last updated: {new Date(competitor.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="intel-section" style={{ marginTop: 20 }}>
        <div className="intel-section-header">
          <h3 className="intel-section-title">
            <PiNewspaperBold style={{ marginRight: 6, verticalAlign: -2 }} />
            Related Intel ({news.length})
          </h3>
        </div>
        <div className="intel-section-body">
          {news.length === 0 ? (
            <div className="growth-empty" style={{ padding: '32px 0' }}>
              <div className="growth-empty-sub">No intel entries for this competitor yet</div>
            </div>
          ) : (
            <div className="intel-news-feed">
              {news.map((entry) => (
                <div key={entry.id} className="intel-news-item">
                  <div className={`intel-timeline-dot ${entry.category}`} style={{ marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <h4 className="intel-news-title">
                      <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer">
                        {entry.title}
                      </a>
                    </h4>
                    <p style={{ fontFamily: 'var(--af-font-architect)', fontSize: 13, color: 'var(--af-stone-500)', margin: '4px 0', lineHeight: 1.4 }}>
                      {entry.summary}
                    </p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      <span className="intel-news-source">{entry.source}</span>
                      <span className="intel-news-source">{new Date(entry.publishedAt).toLocaleDateString()}</span>
                      <span className={`intel-sentiment ${entry.sentiment}`}>
                        {entry.sentiment}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
