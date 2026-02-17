'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  getCitations,
  fetchAllPrompts,
  getSOV,
  AI_ENGINE_LABELS,
  AI_ENGINE_COLORS,
  ALL_AI_ENGINES,
  type AICitation,
  type AIPrompt,
  type AICompetitorBenchmark,
} from '@/lib/aeo-api'
import { getCookieValue } from '@/lib/cookies'
import Link from 'next/link'
import '../aeo.css'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPct(val: number): string {
  return `${(val * 100).toFixed(1)}%`
}

function sparklinePath(values: number[], width: number, height: number): string {
  if (values.length < 2) return ''
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const step = width / (values.length - 1)
  return values
    .map((v, i) => {
      const x = i * step
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CitationTrackerPage() {
  const [citations, setCitations] = useState<AICitation[]>([])
  const [prompts, setPrompts] = useState<AIPrompt[]>([])
  const [benchmarks, setBenchmarks] = useState<AICompetitorBenchmark[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [engineFilter, setEngineFilter] = useState<string>('ALL')
  const [brandFilter, setBrandFilter] = useState<string>('ALL')
  const [sentimentFilter, setSentimentFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<'date' | 'position' | 'engine'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Detail view
  const [detailCitation, setDetailCitation] = useState<AICitation | null>(null)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [c, p, b] = await Promise.all([
        getCitations(token),
        fetchAllPrompts(token),
        getSOV(token),
      ])
      setCitations(c)
      setPrompts(p)
      setBenchmarks(b)
      setLoading(false)
    }
    load()
  }, [])

  const promptLookup = useMemo(() => {
    const map = new Map<string, AIPrompt>()
    for (const p of prompts) map.set(p.id, p)
    return map
  }, [prompts])

  const filtered = useMemo(() => {
    let result = citations
    if (engineFilter !== 'ALL') {
      result = result.filter((c) => c.engine === engineFilter)
    }
    if (brandFilter !== 'ALL') {
      result = result.filter((c) => c.brand === brandFilter)
    }
    if (sentimentFilter !== 'ALL') {
      result = result.filter((c) => c.sentiment === sentimentFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((c) => {
        const prompt = promptLookup.get(c.promptId)
        return (
          (prompt?.text || '').toLowerCase().includes(q) ||
          c.citedUrl.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q)
        )
      })
    }
    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortField === 'date') {
        cmp = new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
      } else if (sortField === 'position') {
        cmp = a.citationPosition - b.citationPosition
      } else if (sortField === 'engine') {
        cmp = a.engine.localeCompare(b.engine)
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
    return result
  }, [citations, engineFilter, brandFilter, sentimentFilter, searchQuery, sortField, sortDir, promptLookup])

  const handleSort = useCallback((field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }, [sortField])

  // Stats
  const afCitationCount = useMemo(
    () => citations.filter((c) => c.brand === 'Alternate Futures').length,
    [citations],
  )

  const competitorCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of citations) {
      if (c.brand !== 'Alternate Futures') {
        counts[c.brand] = (counts[c.brand] || 0) + 1
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
  }, [citations])

  // Trend: AF citations per day (last 14 days)
  const dailyTrend = useMemo(() => {
    const afCitations = citations.filter((c) => c.brand === 'Alternate Futures')
    const days: Record<string, number> = {}
    for (const c of afCitations) {
      const d = c.capturedAt.slice(0, 10)
      days[d] = (days[d] || 0) + 1
    }
    return Object.keys(days).sort().slice(-14).map((d) => days[d])
  }, [citations])

  // Unique brands
  const allBrands = useMemo(() => {
    const set = new Set(citations.map((c) => c.brand))
    return Array.from(set).sort()
  }, [citations])

  if (loading) {
    return <div className="aeo-loading">Loading citation data...</div>
  }

  return (
    <>
      {/* Header */}
      <div className="aeo-header">
        <h1>Citation Tracker</h1>
        <div className="aeo-header-actions">
          <Link href="/admin/aeo" className="aeo-btn-secondary">
            Dashboard
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="aeo-stats">
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Total Citations</div>
          <div className="aeo-stat-value">{citations.length}</div>
        </div>
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">AF Citations</div>
          <div className="aeo-stat-value">{afCitationCount}</div>
          <div className="aeo-stat-sub">
            {citations.length > 0
              ? formatPct(afCitationCount / citations.length)
              : '0%'} of total
          </div>
          {dailyTrend.length > 1 && (
            <div className="aeo-sparkline-wrap">
              <svg className="aeo-sparkline-svg" viewBox="0 0 120 32" preserveAspectRatio="none">
                <path
                  d={sparklinePath(dailyTrend, 120, 32)}
                  fill="none"
                  stroke="var(--af-terra)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Engines Tracked</div>
          <div className="aeo-stat-value">{ALL_AI_ENGINES.length}</div>
        </div>
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Queries Tracked</div>
          <div className="aeo-stat-value">{prompts.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="aeo-filters">
        <input
          className="aeo-search"
          placeholder="Search by query, URL, or brand..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="aeo-select"
          value={engineFilter}
          onChange={(e) => setEngineFilter(e.target.value)}
        >
          <option value="ALL">All Engines</option>
          {ALL_AI_ENGINES.map((e) => (
            <option key={e} value={e}>{AI_ENGINE_LABELS[e]}</option>
          ))}
        </select>
        <select
          className="aeo-select"
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
        >
          <option value="ALL">All Brands</option>
          {allBrands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select
          className="aeo-select"
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
        >
          <option value="ALL">All Sentiment</option>
          <option value="POSITIVE">Positive</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="NEGATIVE">Negative</option>
        </select>
      </div>

      {/* Citations Table */}
      <div className="aeo-section">
        <h2>Citations ({filtered.length})</h2>
        <div className="aeo-table-wrap">
          <table className="aeo-table">
            <thead>
              <tr>
                <th>Query</th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('engine')}
                >
                  Engine {sortField === 'engine' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
                </th>
                <th>Brand</th>
                <th>Cited?</th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('position')}
                >
                  Position {sortField === 'position' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
                </th>
                <th>Sentiment</th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('date')}
                >
                  Date {sortField === 'date' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="aeo-empty">No citations match your filters.</div>
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map((c) => {
                  const prompt = promptLookup.get(c.promptId)
                  const isAf = c.brand === 'Alternate Futures'
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="aeo-card-title" style={{ maxWidth: '260px' }}>
                          {prompt?.text || 'Unknown query'}
                        </div>
                      </td>
                      <td>
                        <span
                          className="aeo-engine-chip"
                          style={{
                            background: `${AI_ENGINE_COLORS[c.engine]}10`,
                            color: AI_ENGINE_COLORS[c.engine],
                            borderColor: `${AI_ENGINE_COLORS[c.engine]}30`,
                          }}
                        >
                          {AI_ENGINE_LABELS[c.engine]}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'var(--af-font-architect)',
                          fontSize: '12px',
                          fontWeight: isAf ? 700 : 400,
                          color: isAf ? 'var(--af-terra)' : 'var(--af-stone-700)',
                        }}>
                          {c.brand}
                        </span>
                      </td>
                      <td>
                        <span className={`aeo-chip ${isAf ? 'aeo-chip-cited' : 'aeo-chip-mentioned'}`}>
                          {isAf ? 'AF Cited' : 'Competitor'}
                        </span>
                      </td>
                      <td>
                        <span className={`aeo-position-badge ${c.citationPosition <= 2 ? 'top' : ''}`}>
                          #{c.citationPosition}
                        </span>
                      </td>
                      <td>
                        <span className={`aeo-sentiment-chip ${c.sentiment.toLowerCase()}`}>
                          {c.sentiment.charAt(0) + c.sentiment.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td style={{
                        fontFamily: 'var(--af-font-architect)',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                      }}>
                        {formatDate(c.capturedAt)}
                      </td>
                      <td>
                        <button
                          className="aeo-action-btn"
                          onClick={() => setDetailCitation(c)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div style={{
            fontFamily: 'var(--af-font-architect)',
            fontSize: '12px',
            color: 'var(--af-stone-500)',
            textAlign: 'center',
            padding: 'var(--af-space-hand)',
          }}>
            Showing 50 of {filtered.length} citations
          </div>
        )}
      </div>

      {/* Competitor Comparison */}
      <div className="aeo-section">
        <h2>Competitor Comparison</h2>
        <div className="aeo-table-wrap">
          <table className="aeo-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Citations</th>
                <th>Share</th>
                <th>Bar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span style={{
                    fontFamily: 'var(--af-font-architect)',
                    fontWeight: 700,
                    color: 'var(--af-terra)',
                  }}>
                    Alternate Futures
                  </span>
                </td>
                <td>{afCitationCount}</td>
                <td>{citations.length > 0 ? formatPct(afCitationCount / citations.length) : '0%'}</td>
                <td style={{ width: '40%' }}>
                  <div className="aeo-score-bar">
                    <div
                      className="aeo-score-bar-fill excellent"
                      style={{
                        width: `${citations.length > 0 ? (afCitationCount / citations.length) * 100 : 0}%`,
                        background: 'var(--af-terra)',
                      }}
                    />
                  </div>
                </td>
              </tr>
              {competitorCounts.map(([name, count]) => (
                <tr key={name}>
                  <td style={{ fontFamily: 'var(--af-font-architect)' }}>{name}</td>
                  <td>{count}</td>
                  <td>{formatPct(count / citations.length)}</td>
                  <td style={{ width: '40%' }}>
                    <div className="aeo-score-bar">
                      <div
                        className="aeo-score-bar-fill good"
                        style={{ width: `${(count / citations.length) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      {detailCitation && (
        <div className="aeo-dialog-overlay" onClick={() => setDetailCitation(null)}>
          <div className="aeo-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Citation Detail</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr',
              gap: '8px 16px',
              fontFamily: 'var(--af-font-architect)',
              fontSize: '14px',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--af-stone-600)' }}>Query</span>
              <span>{promptLookup.get(detailCitation.promptId)?.text || 'Unknown'}</span>

              <span style={{ fontWeight: 600, color: 'var(--af-stone-600)' }}>Engine</span>
              <span>
                <span
                  className="aeo-engine-chip"
                  style={{
                    background: `${AI_ENGINE_COLORS[detailCitation.engine]}10`,
                    color: AI_ENGINE_COLORS[detailCitation.engine],
                    borderColor: `${AI_ENGINE_COLORS[detailCitation.engine]}30`,
                  }}
                >
                  {AI_ENGINE_LABELS[detailCitation.engine]}
                </span>
              </span>

              <span style={{ fontWeight: 600, color: 'var(--af-stone-600)' }}>Brand</span>
              <span>{detailCitation.brand}</span>

              <span style={{ fontWeight: 600, color: 'var(--af-stone-600)' }}>URL</span>
              <span style={{ wordBreak: 'break-all', color: 'var(--af-ultra)' }}>
                {detailCitation.citedUrl}
              </span>

              <span style={{ fontWeight: 600, color: 'var(--af-stone-600)' }}>Position</span>
              <span>
                <span className={`aeo-position-badge ${detailCitation.citationPosition <= 2 ? 'top' : ''}`}>
                  #{detailCitation.citationPosition}
                </span>
              </span>

              <span style={{ fontWeight: 600, color: 'var(--af-stone-600)' }}>Sentiment</span>
              <span>
                <span className={`aeo-sentiment-chip ${detailCitation.sentiment.toLowerCase()}`}>
                  {detailCitation.sentiment}
                </span>
              </span>

              <span style={{ fontWeight: 600, color: 'var(--af-stone-600)' }}>Date</span>
              <span>{formatDate(detailCitation.capturedAt)}</span>
            </div>

            <div style={{ marginTop: 'var(--af-space-hand)' }}>
              <label className="aeo-label">AI Response Excerpt</label>
              <div className="aeo-json-preview" style={{ fontFamily: 'var(--af-font-architect)', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                {detailCitation.fullResponseText}
              </div>
            </div>

            {detailCitation.competitorUrlsCited.length > 0 && (
              <div style={{ marginTop: 'var(--af-space-hand)' }}>
                <label className="aeo-label">Other URLs in Response</label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontFamily: 'var(--af-font-architect)',
                  fontSize: '12px',
                  color: 'var(--af-stone-600)',
                }}>
                  {detailCitation.competitorUrlsCited.map((url, i) => (
                    <span key={i}>{url}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="aeo-dialog-actions">
              <button className="aeo-btn-secondary" onClick={() => setDetailCitation(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
