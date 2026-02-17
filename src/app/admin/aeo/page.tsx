'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchAllPrompts,
  getVisibility,
  getCitations,
  fetchAllSchemaMarkups,
  fetchContentScores,
  getGaps,
  AI_ENGINE_LABELS,
  AI_ENGINE_COLORS,
  ALL_AI_ENGINES,
  type AIPrompt,
  type AIVisibilitySnapshot,
  type AICitation,
  type SchemaMarkup,
  type AIContentScore,
  type PromptGap,
} from '@/lib/aeo-api'
import { getCookieValue } from '@/lib/cookies'
import './aeo.css'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function scoreClass(val: number): string {
  if (val >= 85) return 'excellent'
  if (val >= 70) return 'good'
  if (val >= 50) return 'fair'
  return 'poor'
}

function trendArrow(diff: number): string {
  return diff >= 0 ? '\u2191' : '\u2193'
}

/** Build a simple sparkline path from an array of numbers */
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

export default function AEODashboardPage() {
  const [prompts, setPrompts] = useState<AIPrompt[]>([])
  const [visibility, setVisibility] = useState<AIVisibilitySnapshot[]>([])
  const [citations, setCitations] = useState<AICitation[]>([])
  const [schemas, setSchemas] = useState<SchemaMarkup[]>([])
  const [scores, setScores] = useState<AIContentScore[]>([])
  const [gaps, setGaps] = useState<PromptGap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [p, v, c, s, sc, g] = await Promise.all([
        fetchAllPrompts(token),
        getVisibility(token),
        getCitations(token),
        fetchAllSchemaMarkups(token),
        fetchContentScores(token),
        getGaps(token),
      ])
      setPrompts(p)
      setVisibility(v)
      setCitations(c)
      setSchemas(s)
      setScores(sc)
      setGaps(g)
      setLoading(false)
    }
    load()
  }, [])

  // --- Derived metrics ---

  const citationScore = useMemo(() => {
    if (prompts.length === 0) return 0
    const citedCount = prompts.filter((p) =>
      p.engines.some((e) => e.afCited),
    ).length
    return citedCount / prompts.length
  }, [prompts])

  const schemaCoverage = useMemo(() => {
    const validCount = schemas.filter((s) => s.validationStatus === 'VALID').length
    return schemas.length > 0 ? validCount / schemas.length : 0
  }, [schemas])

  const aiVisibilityScore = useMemo(() => {
    if (visibility.length === 0) return 0
    const latest = visibility.reduce((acc, v) => {
      if (!acc[v.engine] || v.date > acc[v.engine].date) {
        acc[v.engine] = v
      }
      return acc
    }, {} as Record<string, AIVisibilitySnapshot>)
    const vals = Object.values(latest)
    if (vals.length === 0) return 0
    return vals.reduce((s, v) => s + v.citationRate, 0) / vals.length
  }, [visibility])

  const kgCompleteness = useMemo(() => {
    const requiredTypes = ['ORGANIZATION', 'FAQ_PAGE', 'HOW_TO', 'ARTICLE', 'PRODUCT']
    const present = new Set(schemas.map((s) => s.schemaType))
    const count = requiredTypes.filter((t) => present.has(t as SchemaMarkup['schemaType'])).length
    return count / requiredTypes.length
  }, [schemas])

  // Trend sparklines — last 14 days of visibility (aggregated across engines)
  const citationTrend = useMemo(() => {
    const daily: Record<string, number[]> = {}
    for (const v of visibility) {
      if (!daily[v.date]) daily[v.date] = []
      daily[v.date].push(v.citationRate)
    }
    return Object.keys(daily)
      .sort()
      .slice(-14)
      .map((d) => {
        const arr = daily[d]
        return arr.reduce((s, x) => s + x, 0) / arr.length
      })
  }, [visibility])

  const trendDiff = useMemo(() => {
    if (citationTrend.length < 2) return 0
    const recent = citationTrend.slice(-3).reduce((a, b) => a + b, 0) / 3
    const older = citationTrend.slice(0, 3).reduce((a, b) => a + b, 0) / 3
    return recent - older
  }, [citationTrend])

  // Recent AF citations
  const recentAfCitations = useMemo(() => {
    return citations
      .filter((c) => c.brand === 'Alternate Futures')
      .sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())
      .slice(0, 8)
  }, [citations])

  // Average content score
  const avgContentScore = useMemo(() => {
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((s, sc) => s + sc.overallScore, 0) / scores.length)
  }, [scores])

  if (loading) {
    return <div className="aeo-loading">Loading AEO dashboard...</div>
  }

  return (
    <>
      {/* Header */}
      <div className="aeo-header">
        <h1>AEO / AI Search</h1>
        <div className="aeo-header-actions">
          <Link href="/admin/aeo/schema" className="aeo-btn-secondary">
            Schema Editor
          </Link>
          <Link href="/admin/aeo/citations" className="aeo-btn-secondary">
            Citations
          </Link>
          <Link href="/admin/aeo/optimization" className="aeo-btn-secondary">
            Optimization
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="aeo-stats">
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Citation Score</div>
          <div className="aeo-stat-value">{formatPct(citationScore)}</div>
          <div className="aeo-stat-sub">
            {prompts.filter((p) => p.engines.some((e) => e.afCited)).length} / {prompts.length} prompts
            {trendDiff !== 0 && (
              <span className={`aeo-stat-trend ${trendDiff >= 0 ? 'up' : 'down'}`}>
                {trendArrow(trendDiff)} {formatPct(Math.abs(trendDiff))}
              </span>
            )}
          </div>
          {citationTrend.length > 1 && (
            <div className="aeo-sparkline-wrap">
              <svg className="aeo-sparkline-svg" viewBox={`0 0 120 32`} preserveAspectRatio="none">
                <path
                  d={sparklinePath(citationTrend, 120, 32)}
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
          <div className="aeo-stat-label">Schema Coverage</div>
          <div className="aeo-stat-value">{formatPct(schemaCoverage)}</div>
          <div className="aeo-stat-sub">
            {schemas.filter((s) => s.validationStatus === 'VALID').length} valid / {schemas.length} total
          </div>
        </div>

        <div className="aeo-stat-card">
          <div className="aeo-stat-label">AI Visibility</div>
          <div className="aeo-stat-value">{formatPct(aiVisibilityScore)}</div>
          <div className="aeo-stat-sub">
            Avg citation rate across {ALL_AI_ENGINES.length} engines
          </div>
        </div>

        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Knowledge Graph</div>
          <div className="aeo-stat-value">{formatPct(kgCompleteness)}</div>
          <div className="aeo-stat-sub">
            Core schema types present
          </div>
        </div>
      </div>

      {/* Two-column layout: Recent Citations + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--af-space-arm)' }}>
        {/* Recent Citations */}
        <div className="aeo-section">
          <h2>Recent AF Citations</h2>
          {recentAfCitations.length === 0 ? (
            <div className="aeo-empty">No AF citations found yet.</div>
          ) : (
            <div className="aeo-citations-list">
              {recentAfCitations.map((c) => {
                const prompt = prompts.find((p) => p.id === c.promptId)
                return (
                  <div key={c.id} className="aeo-citation-item">
                    <div className="aeo-citation-query">
                      {prompt?.text || 'Unknown query'}
                    </div>
                    <div className="aeo-citation-meta">
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
                      <span className="aeo-position-badge top">#{c.citationPosition}</span>
                      <span className="aeo-citation-date">{formatDate(c.capturedAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div style={{ marginTop: 'var(--af-space-hand)' }}>
            <Link href="/admin/aeo/citations" className="aeo-btn-secondary" style={{ fontSize: '12px' }}>
              View All Citations
            </Link>
          </div>
        </div>

        {/* Right column: Quick Actions + Gaps */}
        <div>
          <div className="aeo-section">
            <h2>Quick Actions</h2>
            <div className="aeo-quick-actions">
              <Link href="/admin/aeo/schema" className="aeo-quick-action-btn">
                <span className="aeo-quick-action-icon">{'{}'}</span>
                Generate Schema
              </Link>
              <Link href="/admin/aeo/optimization" className="aeo-quick-action-btn">
                <span className="aeo-quick-action-icon">&#9733;</span>
                Run Audit
              </Link>
              <Link href="/admin/aeo/citations" className="aeo-quick-action-btn">
                <span className="aeo-quick-action-icon">&#8599;</span>
                Check Citations
              </Link>
            </div>
          </div>

          {/* Prompt Gaps */}
          <div className="aeo-section">
            <h2>Content Gaps ({gaps.length})</h2>
            {gaps.slice(0, 4).map((g) => (
              <div key={g.id} className="aeo-citation-item" style={{ marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div className="aeo-citation-query">{g.promptText}</div>
                  <div style={{
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: '11px',
                    color: 'var(--af-stone-500)',
                    marginTop: '2px',
                  }}>
                    {g.competitorsPresent.join(', ')} are cited &middot; {g.estimatedVolume.toLocaleString()} vol
                  </div>
                </div>
                <span className="aeo-position-badge">{g.strategicImportance}/10</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Score Overview */}
      <div className="aeo-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--af-space-hand)' }}>
          <h2 style={{ margin: 0 }}>Content Scores</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--af-space-palm)' }}>
            <span style={{
              fontFamily: 'var(--af-font-architect)',
              fontSize: '12px',
              color: 'var(--af-stone-500)',
            }}>
              Avg: {avgContentScore}/100
            </span>
            <Link href="/admin/aeo/optimization" className="aeo-btn-secondary" style={{ fontSize: '12px' }}>
              View All
            </Link>
          </div>
        </div>
        <div className="aeo-card-grid">
          {scores.slice(0, 4).map((sc) => {
            const cls = scoreClass(sc.overallScore)
            return (
              <div key={sc.id} className="aeo-card">
                <div className="aeo-card-header">
                  <span className="aeo-card-title">{sc.contentId}</span>
                  <span className="aeo-chip" style={{
                    background: 'var(--af-stone-100)',
                    color: 'var(--af-stone-600)',
                  }}>
                    {sc.contentType}
                  </span>
                </div>
                <div className="aeo-score-bar-wrap">
                  <div className="aeo-score-bar">
                    <div
                      className={`aeo-score-bar-fill ${cls}`}
                      style={{ width: `${sc.overallScore}%` }}
                    />
                  </div>
                  <span className={`aeo-score-label ${cls}`}>{sc.overallScore}</span>
                </div>
                {sc.improvements.length > 0 && (
                  <div style={{
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: '11px',
                    color: 'var(--af-stone-500)',
                    marginTop: '8px',
                  }}>
                    {sc.improvements.length} suggestion{sc.improvements.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Engine Breakdown */}
      <div className="aeo-section">
        <h2>Engine Coverage</h2>
        <div className="aeo-table-wrap">
          <table className="aeo-table">
            <thead>
              <tr>
                <th>Engine</th>
                <th>Cited</th>
                <th>Mentioned</th>
                <th>Avg Position</th>
              </tr>
            </thead>
            <tbody>
              {ALL_AI_ENGINES.map((engine) => {
                const engineResults = prompts.flatMap((p) =>
                  p.engines.filter((e) => e.engine === engine),
                )
                const citedCount = engineResults.filter((e) => e.afCited).length
                const mentionedCount = engineResults.filter((e) => e.afMentioned).length
                const positions = engineResults
                  .filter((e) => e.afPosition !== null)
                  .map((e) => e.afPosition!)
                const avgPos = positions.length > 0
                  ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1)
                  : '--'
                const total = engineResults.length

                return (
                  <tr key={engine}>
                    <td>
                      <span
                        className="aeo-engine-chip"
                        style={{
                          background: `${AI_ENGINE_COLORS[engine]}10`,
                          color: AI_ENGINE_COLORS[engine],
                          borderColor: `${AI_ENGINE_COLORS[engine]}30`,
                        }}
                      >
                        {AI_ENGINE_LABELS[engine]}
                      </span>
                    </td>
                    <td>
                      <span className="aeo-chip aeo-chip-cited">
                        {citedCount}/{total}
                      </span>
                    </td>
                    <td>
                      <span className="aeo-chip aeo-chip-mentioned">
                        {mentionedCount}/{total}
                      </span>
                    </td>
                    <td>
                      <span className={`aeo-position-badge ${positions.length > 0 && Number(avgPos) <= 2 ? 'top' : ''}`}>
                        {avgPos}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
