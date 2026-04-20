'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PiBuildingsBold,
  PiMagnifyingGlassBold,
  PiArrowsLeftRightBold,
  PiCheckBold,
  PiXBold,
} from 'react-icons/pi'
import {
  fetchCompetitorProfiles,
  fetchFeatureMatrix,
  type CompetitorProfile,
  type CompetitorCategory,
  type FeatureComparison,
} from '@/lib/intel-api'
import '../intel-admin.css'

export default function CompetitorProfilesPage() {
  const [competitors, setCompetitors] = useState<CompetitorProfile[]>([])
  const [features, setFeatures] = useState<FeatureComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<CompetitorCategory | 'all'>('all')
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [c, f] = await Promise.all([fetchCompetitorProfiles(), fetchFeatureMatrix()])
      setCompetitors(c)
      setFeatures(f)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = competitors.filter((c) => {
    if (filterCategory !== 'all' && c.category !== filterCategory) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function toggleCompareSelect(id: string) {
    setSelectedForCompare((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const comparedCompetitors = competitors.filter((c) => selectedForCompare.has(c.id))

  function renderFeatureValue(value: boolean | string): React.ReactNode {
    if (value === true) return <span className="intel-check">&#10003;</span>
    if (value === false) return <span className="intel-cross">—</span>
    return <span className="intel-partial">{String(value)}</span>
  }

  return (
    <>
      <div className="intel-header">
        <h1>Competitor Profiles</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`intel-btn${compareMode ? ' intel-btn--primary' : ''}`}
            onClick={() => {
              if (compareMode && selectedForCompare.size >= 2) {
                setShowComparison(true)
                setCompareMode(false)
              } else {
                setCompareMode(!compareMode)
                if (!compareMode) setSelectedForCompare(new Set())
              }
            }}
          >
            <PiArrowsLeftRightBold />
            {compareMode
              ? selectedForCompare.size >= 2
                ? `Compare (${selectedForCompare.size})`
                : `Select (${selectedForCompare.size})`
              : 'Compare'}
          </button>
        </div>
      </div>

      <div className="intel-subnav">
        <Link href="/admin/intel">Overview</Link>
        <Link href="/admin/intel/competitors" className="active">Competitors</Link>
        <Link href="/admin/intel/alerts">Alerts</Link>
        <Link href="/admin/intel/signals">Signals</Link>
        <Link href="/admin/intel/predictions">Predictions</Link>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <PiMagnifyingGlassBold style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--af-stone-400)', fontSize: 14 }} />
          <input
            className="growth-form-input"
            style={{ paddingLeft: 32 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search competitors..."
          />
        </div>
        <div className="intel-filter-chips">
          {(['all', 'direct', 'indirect', 'adjacent'] as const).map((cat) => (
            <button
              key={cat}
              className={`intel-chip${filterCategory === cat ? ' active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Competitor Cards */}
      <div className="intel-competitor-grid">
        {filtered.map((c) => {
          const isSelected = selectedForCompare.has(c.id)
          return (
            <div
              key={c.id}
              className="intel-competitor-card"
              onClick={() => compareMode ? toggleCompareSelect(c.id) : null}
              style={{
                borderColor: isSelected ? 'var(--af-ultra)' : undefined,
                borderWidth: isSelected ? 2 : undefined,
                cursor: compareMode ? 'pointer' : undefined,
              }}
            >
              {compareMode && (
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: `2px solid ${isSelected ? 'var(--af-ultra)' : 'var(--af-stone-300)'}`,
                  background: isSelected ? 'var(--af-ultra)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 12,
                }}>
                  {isSelected && <PiCheckBold />}
                </div>
              )}

              <div className="intel-competitor-card-header">
                <div className="intel-competitor-logo">{c.name.charAt(0)}</div>
                <div>
                  <h4 className="intel-competitor-name">{c.name}</h4>
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
                  <span className="intel-competitor-metric-value">{c.features.length}</span>
                  <span className="intel-competitor-metric-label">Features</span>
                </div>
                <div className="intel-competitor-metric">
                  <span className="intel-competitor-metric-value">{c.pricing.tiers[0]?.price || '—'}</span>
                  <span className="intel-competitor-metric-label">Starting Price</span>
                </div>
              </div>

              {!compareMode && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <Link
                    href={`/admin/intel/competitors/${c.id}`}
                    className="intel-btn"
                    style={{ fontSize: 12, padding: '3px 10px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Full Profile
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Side-by-side Comparison */}
      {showComparison && comparedCompetitors.length >= 2 && (
        <div style={{ marginTop: 24 }}>
          <div className="intel-section">
            <div className="intel-section-header">
              <h3 className="intel-section-title">
                Side-by-Side Comparison
              </h3>
              <button
                className="intel-btn"
                style={{ fontSize: 12, padding: '3px 10px' }}
                onClick={() => { setShowComparison(false); setSelectedForCompare(new Set()) }}
              >
                <PiXBold /> Close
              </button>
            </div>
            <div className="intel-section-body" style={{ overflowX: 'auto' }}>
              <table className="intel-comparison-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th style={{ color: 'var(--af-terra)', fontWeight: 700 }}>AF</th>
                    {comparedCompetitors.map((c) => (
                      <th key={c.id}>{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((f) => (
                    <tr key={f.featureName}>
                      <td>{f.featureName}</td>
                      <td>{renderFeatureValue(f.af)}</td>
                      {comparedCompetitors.map((c) => (
                        <td key={c.id}>
                          {renderFeatureValue(f.competitors[c.name] ?? false)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Comparison Matrix */}
          <div className="intel-section" style={{ marginTop: 16 }}>
            <div className="intel-section-header">
              <h3 className="intel-section-title">Pricing Comparison</h3>
            </div>
            <div className="intel-section-body" style={{ overflowX: 'auto' }}>
              <table className="intel-comparison-table">
                <thead>
                  <tr>
                    <th>Competitor</th>
                    {Array.from(
                      new Set(comparedCompetitors.flatMap((c) => c.pricing.tiers.map((t) => t.name)))
                    ).map((tier) => (
                      <th key={tier}>{tier}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparedCompetitors.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      {Array.from(
                        new Set(comparedCompetitors.flatMap((cc) => cc.pricing.tiers.map((t) => t.name)))
                      ).map((tierName) => {
                        const tier = c.pricing.tiers.find((t) => t.name === tierName)
                        return (
                          <td key={tierName} style={{ fontFamily: 'var(--af-font-machine)' }}>
                            {tier?.price || '—'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
