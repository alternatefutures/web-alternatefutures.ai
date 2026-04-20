'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  fetchContentScores,
  scoreContent,
  type AIContentScore,
  type AIContentType,
  type ScoreContentInput,
} from '@/lib/aeo-api'
import { getCookieValue } from '@/lib/cookies'
import Link from 'next/link'
import '../aeo.module.css'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CONTENT_TYPES: AIContentType[] = ['BLOG', 'DOCS', 'TUTORIAL', 'LANDING_PAGE', 'FAQ']

const CONTENT_TYPE_LABELS: Record<AIContentType, string> = {
  BLOG: 'Blog',
  DOCS: 'Documentation',
  TUTORIAL: 'Tutorial',
  LANDING_PAGE: 'Landing Page',
  FAQ: 'FAQ',
}

const DIMENSION_LABELS: Record<string, string> = {
  answerFirst: 'Answer First',
  headingHierarchy: 'Heading Hierarchy',
  conciseness: 'Conciseness',
  schemaPresence: 'Schema Presence',
  listTable: 'Lists & Tables',
  eeat: 'E-E-A-T',
}

function scoreClass(val: number): string {
  if (val >= 85) return 'excellent'
  if (val >= 70) return 'good'
  if (val >= 50) return 'fair'
  return 'poor'
}

function scoreLabel(val: number): string {
  if (val >= 85) return 'Excellent'
  if (val >= 70) return 'Good'
  if (val >= 50) return 'Fair'
  return 'Needs Work'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContentOptimizationPage() {
  const [scores, setScores] = useState<AIContentScore[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Scoring dialog
  const [showScoreDialog, setShowScoreDialog] = useState(false)
  const [scoreContentId, setScoreContentId] = useState('')
  const [scoreContentType, setScoreContentType] = useState<AIContentType>('BLOG')
  const [scoring, setScoring] = useState(false)
  const [scoreResult, setScoreResult] = useState<AIContentScore | null>(null)

  // Detail view
  const [detailScore, setDetailScore] = useState<AIContentScore | null>(null)

  // Bulk scoring
  const [bulkScoring, setBulkScoring] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchContentScores(token)
      setScores(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = scores
    if (filterType !== 'ALL') {
      result = result.filter((s) => s.contentType === filterType)
    }
    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'score') {
        cmp = a.overallScore - b.overallScore
      } else {
        cmp = new Date(a.scoredAt).getTime() - new Date(b.scoredAt).getTime()
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
    return result
  }, [scores, filterType, sortBy, sortDir])

  const handleSort = useCallback((field: 'score' | 'date') => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir(field === 'score' ? 'asc' : 'desc')
    }
  }, [sortBy])

  const handleScore = useCallback(async () => {
    if (!scoreContentId.trim()) return
    setScoring(true)
    setScoreResult(null)
    try {
      const token = getCookieValue('af_access_token')
      const result = await scoreContent(token, {
        contentId: scoreContentId,
        contentType: scoreContentType,
      })
      setScoreResult(result)
      setScores((prev) => [result, ...prev.filter((s) => s.contentId !== result.contentId)])
    } catch {
      // silent
    } finally {
      setScoring(false)
    }
  }, [scoreContentId, scoreContentType])

  const handleBulkScore = useCallback(async () => {
    setBulkScoring(true)
    setBulkProgress(0)
    const token = getCookieValue('af_access_token')
    const lowScores = scores.filter((s) => s.overallScore < 70)
    for (let i = 0; i < lowScores.length; i++) {
      try {
        const result = await scoreContent(token, {
          contentId: lowScores[i].contentId,
          contentType: lowScores[i].contentType,
        })
        setScores((prev) =>
          prev.map((s) => (s.contentId === result.contentId ? result : s)),
        )
      } catch {
        // continue
      }
      setBulkProgress(Math.round(((i + 1) / lowScores.length) * 100))
    }
    setBulkScoring(false)
  }, [scores])

  // Stats
  const avgScore = useMemo(() => {
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((s, sc) => s + sc.overallScore, 0) / scores.length)
  }, [scores])

  const lowCount = useMemo(
    () => scores.filter((s) => s.overallScore < 70).length,
    [scores],
  )

  const topCount = useMemo(
    () => scores.filter((s) => s.overallScore >= 85).length,
    [scores],
  )

  const totalImprovements = useMemo(
    () => scores.reduce((s, sc) => s + sc.improvements.length, 0),
    [scores],
  )

  function renderScoreBreakdown(sc: AIContentScore) {
    const dims = [
      { key: 'answerFirst', label: 'Answer First', value: sc.answerFirstScore },
      { key: 'headingHierarchy', label: 'Heading Hierarchy', value: sc.headingHierarchyScore },
      { key: 'conciseness', label: 'Conciseness', value: sc.concisenessScore },
      { key: 'schemaPresence', label: 'Schema Presence', value: sc.schemaPresenceScore },
      { key: 'listTable', label: 'Lists & Tables', value: sc.listTableScore },
      { key: 'eeat', label: 'E-E-A-T', value: sc.eeatScore },
    ]

    return (
      <div className="aeo-score-breakdown">
        {dims.map((d) => {
          const cls = scoreClass(d.value)
          return (
            <div key={d.key} className="aeo-score-dimension">
              <div className="aeo-score-dimension-label">{d.label}</div>
              <div className="aeo-score-bar-wrap">
                <div className="aeo-score-bar">
                  <div
                    className={`aeo-score-bar-fill ${cls}`}
                    style={{ width: `${d.value}%` }}
                  />
                </div>
                <span className={`aeo-score-label ${cls}`}>{d.value}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return <div className="aeo-loading">Loading content scores...</div>
  }

  return (
    <>
      {/* Header */}
      <div className="aeo-header">
        <h1>Content Optimization</h1>
        <div className="aeo-header-actions">
          <Link href="/admin/aeo" className="aeo-btn-secondary">
            Dashboard
          </Link>
          <button
            className="aeo-btn-secondary"
            onClick={handleBulkScore}
            disabled={bulkScoring || lowCount === 0}
          >
            {bulkScoring ? `Re-scoring... ${bulkProgress}%` : `Bulk Re-score (${lowCount} low)`}
          </button>
          <button
            className="aeo-btn-primary"
            onClick={() => {
              setScoreContentId('')
              setScoreContentType('BLOG')
              setScoreResult(null)
              setShowScoreDialog(true)
            }}
          >
            + Score Content
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="aeo-stats">
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Avg Score</div>
          <div className="aeo-stat-value">{avgScore}</div>
          <div className="aeo-stat-sub">{scoreLabel(avgScore)}</div>
        </div>
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Content Scored</div>
          <div className="aeo-stat-value">{scores.length}</div>
        </div>
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Top Performers</div>
          <div className="aeo-stat-value">{topCount}</div>
          <div className="aeo-stat-sub">Score 85+</div>
        </div>
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Improvements</div>
          <div className="aeo-stat-value">{totalImprovements}</div>
          <div className="aeo-stat-sub">Suggestions pending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="aeo-filters">
        <select
          className="aeo-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="ALL">All Content Types</option>
          {CONTENT_TYPES.map((t) => (
            <option key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <button
          className="aeo-btn-secondary"
          onClick={() => handleSort('score')}
          style={{ fontSize: '12px' }}
        >
          Sort by Score {sortBy === 'score' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
        </button>
        <button
          className="aeo-btn-secondary"
          onClick={() => handleSort('date')}
          style={{ fontSize: '12px' }}
        >
          Sort by Date {sortBy === 'date' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
        </button>
      </div>

      {/* Content Cards */}
      <div className="aeo-card-grid">
        {filtered.length === 0 ? (
          <div className="aeo-empty">No content scores found. Score your first content above.</div>
        ) : (
          filtered.map((sc) => {
            const cls = scoreClass(sc.overallScore)
            return (
              <div key={sc.id} className="aeo-card">
                <div className="aeo-card-header">
                  <span className="aeo-card-title">{sc.contentId}</span>
                  <span className="aeo-chip" style={{
                    background: 'var(--af-stone-100)',
                    color: 'var(--af-stone-600)',
                  }}>
                    {CONTENT_TYPE_LABELS[sc.contentType]}
                  </span>
                </div>

                {/* Overall score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--af-space-hand)', marginBottom: 'var(--af-space-hand)' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: '20px',
                    fontWeight: 700,
                    flexShrink: 0,
                    border: '3px solid',
                    borderColor: cls === 'excellent' ? 'var(--af-signal-go)'
                      : cls === 'good' ? 'var(--af-ultra)'
                      : cls === 'fair' ? '#eab308'
                      : 'var(--af-signal-stop)',
                    color: cls === 'excellent' ? 'var(--af-signal-go)'
                      : cls === 'good' ? 'var(--af-ultra)'
                      : cls === 'fair' ? '#a16207'
                      : 'var(--af-signal-stop)',
                  }}>
                    {sc.overallScore}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--af-font-architect)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--af-stone-800)',
                    }}>
                      {scoreLabel(sc.overallScore)}
                    </div>
                    <div style={{
                      fontFamily: 'var(--af-font-architect)',
                      fontSize: '11px',
                      color: 'var(--af-stone-500)',
                    }}>
                      {sc.improvements.length} suggestion{sc.improvements.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Mini breakdown */}
                <div className="aeo-score-breakdown">
                  {[
                    { label: 'Answer First', value: sc.answerFirstScore },
                    { label: 'Schema', value: sc.schemaPresenceScore },
                    { label: 'E-E-A-T', value: sc.eeatScore },
                  ].map((d) => {
                    const dcls = scoreClass(d.value)
                    return (
                      <div key={d.label} className="aeo-score-dimension">
                        <div className="aeo-score-dimension-label">{d.label}</div>
                        <div className="aeo-score-bar-wrap">
                          <div className="aeo-score-bar">
                            <div
                              className={`aeo-score-bar-fill ${dcls}`}
                              style={{ width: `${d.value}%` }}
                            />
                          </div>
                          <span className={`aeo-score-label ${dcls}`} style={{ fontSize: '11px' }}>
                            {d.value}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', gap: '4px', marginTop: 'var(--af-space-hand)' }}>
                  <button
                    className="aeo-action-btn"
                    onClick={() => setDetailScore(sc)}
                  >
                    Full Details
                  </button>
                  <button
                    className="aeo-action-btn"
                    onClick={async () => {
                      const token = getCookieValue('af_access_token')
                      const result = await scoreContent(token, {
                        contentId: sc.contentId,
                        contentType: sc.contentType,
                      })
                      setScores((prev) =>
                        prev.map((s) => (s.contentId === result.contentId ? result : s)),
                      )
                    }}
                  >
                    Re-score
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Score Content Dialog */}
      {showScoreDialog && (
        <div className="aeo-dialog-overlay" onClick={() => setShowScoreDialog(false)}>
          <div className="aeo-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Score Content</h3>

            <div className="aeo-form-row">
              <div className="aeo-form-group">
                <label className="aeo-label">Content ID</label>
                <input
                  className="aeo-input"
                  value={scoreContentId}
                  onChange={(e) => setScoreContentId(e.target.value)}
                  placeholder="e.g. blog-my-article-slug"
                />
              </div>
              <div className="aeo-form-group">
                <label className="aeo-label">Content Type</label>
                <select
                  className="aeo-select"
                  value={scoreContentType}
                  onChange={(e) => setScoreContentType(e.target.value as AIContentType)}
                  style={{ width: '100%' }}
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="aeo-dialog-actions" style={{ justifyContent: 'space-between' }}>
              <button className="aeo-btn-secondary" onClick={() => setShowScoreDialog(false)}>
                Cancel
              </button>
              <button
                className="aeo-btn-primary"
                onClick={handleScore}
                disabled={scoring || !scoreContentId.trim()}
              >
                {scoring ? 'Scoring...' : 'Run AEO Score'}
              </button>
            </div>

            {/* Results */}
            {scoreResult && (
              <div style={{ marginTop: 'var(--af-space-arm)' }}>
                <h3 style={{ fontFamily: 'var(--af-font-architect)', fontSize: '16px' }}>
                  Results: {scoreResult.overallScore}/100
                </h3>
                {renderScoreBreakdown(scoreResult)}

                {scoreResult.improvements.length > 0 && (
                  <div className="aeo-improvements">
                    <label className="aeo-label">Recommendations</label>
                    {scoreResult.improvements.map((imp, i) => (
                      <div key={i} className="aeo-improvement-item">
                        <span className="aeo-improvement-dim">
                          {DIMENSION_LABELS[imp.dimension] || imp.dimension}
                        </span>
                        <span>{imp.suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      {detailScore && (
        <div className="aeo-dialog-overlay" onClick={() => setDetailScore(null)}>
          <div className="aeo-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <h3>{detailScore.contentId}</h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--af-space-palm)',
              marginBottom: 'var(--af-space-arm)',
            }}>
              <span className="aeo-chip" style={{
                background: 'var(--af-stone-100)',
                color: 'var(--af-stone-600)',
              }}>
                {CONTENT_TYPE_LABELS[detailScore.contentType]}
              </span>
              <span style={{
                fontFamily: 'var(--af-font-architect)',
                fontSize: '11px',
                color: 'var(--af-stone-500)',
              }}>
                Scored {new Date(detailScore.scoredAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
            </div>

            {/* Full breakdown */}
            <div style={{ marginBottom: 'var(--af-space-arm)' }}>
              <label className="aeo-label">Score Breakdown</label>
              {renderScoreBreakdown(detailScore)}
            </div>

            {/* Overall */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--af-space-hand)',
              padding: 'var(--af-space-hand)',
              background: 'var(--af-stone-100)',
              borderRadius: 'var(--af-radius-worn)',
              marginBottom: 'var(--af-space-arm)',
            }}>
              <span style={{
                fontFamily: 'var(--af-font-architect)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--af-stone-700)',
              }}>
                Overall:
              </span>
              <span className={`aeo-score-label ${scoreClass(detailScore.overallScore)}`} style={{ fontSize: '24px' }}>
                {detailScore.overallScore}/100
              </span>
              <span style={{
                fontFamily: 'var(--af-font-architect)',
                fontSize: '13px',
                color: 'var(--af-stone-600)',
              }}>
                {scoreLabel(detailScore.overallScore)}
              </span>
            </div>

            {/* Improvements */}
            {detailScore.improvements.length > 0 && (
              <div className="aeo-improvements">
                <label className="aeo-label">Recommendations ({detailScore.improvements.length})</label>
                {detailScore.improvements.map((imp, i) => (
                  <div key={i} className="aeo-improvement-item">
                    <span className="aeo-improvement-dim">
                      {DIMENSION_LABELS[imp.dimension] || imp.dimension}
                    </span>
                    <span>{imp.suggestion}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="aeo-dialog-actions">
              <button className="aeo-btn-secondary" onClick={() => setDetailScore(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
