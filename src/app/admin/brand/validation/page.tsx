'use client'

import { useState, useCallback } from 'react'
import {
  validateContent as brandApiValidate,
  fetchBrandReviews,
  type BrandReview,
  type ValidateContentInput,
} from '@/lib/brand-api'
import {
  validateContent as fullValidate,
  shouldBlockApproval,
  type BrandValidationResult,
} from '@/lib/brand-validation-api'
import { getCookieValue } from '@/lib/cookies'
import '../brand-admin.css'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ContentType = ValidateContentInput['contentType']
type CheckMode = 'full' | 'terminology' | 'voice' | 'quick'

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'SOCIAL_POST', label: 'Social Post' },
  { value: 'BLOG_POST', label: 'Blog Post' },
  { value: 'MARKETING_COPY', label: 'Marketing Copy' },
  { value: 'DOCUMENTATION', label: 'Documentation' },
]

const PLATFORMS = ['X', 'BLUESKY', 'LINKEDIN', 'BLOG', 'DISCORD', 'DOCUMENTATION', 'MARKETING']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreClass(score: number): string {
  if (score >= 80) return 'pass'
  if (score >= 60) return 'warn'
  return 'fail'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContentValidationPage() {
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState<ContentType>('MARKETING_COPY')
  const [platform, setPlatform] = useState('MARKETING')
  const [checkMode, setCheckMode] = useState<CheckMode>('full')
  const [validating, setValidating] = useState(false)

  // Results
  const [fullResult, setFullResult] = useState<BrandValidationResult | null>(null)
  const [quickResult, setQuickResult] = useState<BrandReview | null>(null)
  const [blocked, setBlocked] = useState(false)

  // History
  const [history, setHistory] = useState<BrandReview[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // ---------------------------------------------------------------------------
  // Validate
  // ---------------------------------------------------------------------------

  const handleValidate = useCallback(async () => {
    if (!content.trim()) return
    setValidating(true)
    setFullResult(null)
    setQuickResult(null)
    setBlocked(false)

    try {
      const token = getCookieValue('af_access_token')

      if (checkMode === 'full' || checkMode === 'voice') {
        const result = await fullValidate(content, platform, token)
        setFullResult(result)
        setBlocked(shouldBlockApproval(result))
      } else {
        const review = await brandApiValidate(token, {
          content,
          contentType,
        })
        setQuickResult(review)
        setBlocked(!review.approved)
      }
    } catch {
      // silent fail
    } finally {
      setValidating(false)
    }
  }, [content, contentType, platform, checkMode])

  // ---------------------------------------------------------------------------
  // Fix suggestion apply
  // ---------------------------------------------------------------------------

  const applySuggestion = useCallback((original: string, replacement: string) => {
    if (!replacement) return
    // Extract the actual replacement text from "Replace with ..." format
    const match = replacement.match(/^Replace with "(.+)"$/)
    const replaceWith = match ? match[1] : replacement
    setContent((prev) => prev.replace(original, replaceWith))
  }, [])

  // ---------------------------------------------------------------------------
  // Load history
  // ---------------------------------------------------------------------------

  const loadHistory = useCallback(async () => {
    if (historyLoaded) return
    setLoadingHistory(true)
    try {
      const token = getCookieValue('af_access_token')
      const reviews = await fetchBrandReviews(token, { limit: 20 })
      setHistory(reviews)
      setHistoryLoaded(true)
    } catch {
      // silent
    } finally {
      setLoadingHistory(false)
    }
  }, [historyLoaded])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Header */}
      <div className="brand-admin-header">
        <div>
          <h1>Content Validation</h1>
          <p className="brand-admin-subtitle">Validate content against brand rules before publishing</p>
        </div>
      </div>

      {/* Input area */}
      <div className="brand-admin-card">
        <h3>Content to Validate</h3>
        <textarea
          className="brand-admin-textarea"
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type your content here..."
        />

        <div className="brand-admin-validation-controls">
          <div className="brand-admin-validation-options">
            <div className="brand-admin-form-group" style={{ marginBottom: 0 }}>
              <label className="brand-admin-form-label">Content Type</label>
              <select
                className="brand-admin-select"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
              >
                {CONTENT_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>

            <div className="brand-admin-form-group" style={{ marginBottom: 0 }}>
              <label className="brand-admin-form-label">Platform</label>
              <select
                className="brand-admin-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="brand-admin-form-group" style={{ marginBottom: 0 }}>
              <label className="brand-admin-form-label">Check Mode</label>
              <select
                className="brand-admin-select"
                value={checkMode}
                onChange={(e) => setCheckMode(e.target.value as CheckMode)}
              >
                <option value="full">Full Validation</option>
                <option value="terminology">Terminology Only</option>
                <option value="voice">Voice + Tone</option>
                <option value="quick">Quick Check</option>
              </select>
            </div>
          </div>

          <button
            className="brand-admin-new-btn"
            onClick={handleValidate}
            disabled={validating || !content.trim()}
          >
            {validating ? 'Validating...' : 'Validate'}
          </button>
        </div>
      </div>

      {/* Full validation results */}
      {fullResult && (
        <div className="brand-admin-card">
          <h3>Validation Results</h3>

          {/* Status banner */}
          {blocked ? (
            <div className="brand-admin-scan-fail">
              Content blocked — fix violations before publishing
            </div>
          ) : (
            <div className="brand-admin-scan-pass">
              Content approved for publishing
            </div>
          )}

          {/* Score ring */}
          <div className={`brand-admin-score-ring ${scoreClass(fullResult.overallScore)}`}>
            {fullResult.overallScore}
          </div>

          {/* Score breakdown */}
          <div className="brand-admin-score-breakdown">
            <div className="brand-admin-score-item">
              <div className="brand-admin-score-item-label">Terminology</div>
              <div className={`brand-admin-score-item-value ${scoreClass(fullResult.terminologyScore)}`}>
                {fullResult.terminologyScore}
              </div>
              <div className="brand-admin-score-item-weight">40%</div>
            </div>
            <div className="brand-admin-score-item">
              <div className="brand-admin-score-item-label">Voice</div>
              <div className={`brand-admin-score-item-value ${scoreClass(fullResult.voiceConsistencyScore)}`}>
                {fullResult.voiceConsistencyScore}
              </div>
              <div className="brand-admin-score-item-weight">30%</div>
            </div>
            <div className="brand-admin-score-item">
              <div className="brand-admin-score-item-label">Tone</div>
              <div className={`brand-admin-score-item-value ${scoreClass(fullResult.toneScore)}`}>
                {fullResult.toneScore}
              </div>
              <div className="brand-admin-score-item-weight">20%</div>
            </div>
            <div className="brand-admin-score-item">
              <div className="brand-admin-score-item-label">Platform Fit</div>
              <div className={`brand-admin-score-item-value ${scoreClass(fullResult.platformFitScore)}`}>
                {fullResult.platformFitScore}
              </div>
              <div className="brand-admin-score-item-weight">10%</div>
            </div>
          </div>

          {/* Violations */}
          {fullResult.violations.length > 0 && (
            <div>
              <h3>Violations ({fullResult.violations.length})</h3>
              {fullResult.violations.map((v) => (
                <div
                  key={v.id}
                  className={`brand-admin-violation brand-admin-violation--${v.severity.toLowerCase()}`}
                >
                  <div className="brand-admin-violation-header">
                    <span className={`brand-admin-chip brand-admin-chip--${v.severity.toLowerCase()}`}>
                      {v.severity}
                    </span>
                    <span className="brand-admin-category-chip">{v.category}</span>
                  </div>
                  <p className="brand-admin-violation-message">{v.message}</p>
                  {v.suggestion && (
                    <div className="brand-admin-violation-fix-row">
                      <p className="brand-admin-violation-suggestion">{v.suggestion}</p>
                      {v.matchedText && v.suggestion && (
                        <button
                          className="brand-admin-action-btn"
                          onClick={() => applySuggestion(v.matchedText!, v.suggestion!)}
                        >
                          Apply Fix
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {fullResult.suggestions.length > 0 && (
            <div style={{ marginTop: 'var(--af-space-hand)' }}>
              <h3>Platform Tips</h3>
              <ul className="brand-admin-list">
                {fullResult.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick check results */}
      {quickResult && (
        <div className="brand-admin-card">
          <h3>Quick Check Results</h3>

          {blocked ? (
            <div className="brand-admin-scan-fail">
              Content has blocking violations
            </div>
          ) : (
            <div className="brand-admin-scan-pass">
              Content passed quick check
            </div>
          )}

          <div className={`brand-admin-score-ring ${scoreClass(quickResult.score.overall)}`}>
            {quickResult.score.overall}
          </div>

          {quickResult.violations.length > 0 && (
            <div>
              {quickResult.violations.map((v) => (
                <div
                  key={v.id}
                  className={`brand-admin-violation brand-admin-violation--${v.severity.toLowerCase()}`}
                >
                  <div className="brand-admin-violation-header">
                    <span className={`brand-admin-chip brand-admin-chip--${v.severity.toLowerCase()}`}>
                      {v.severity}
                    </span>
                  </div>
                  <p className="brand-admin-violation-message">
                    Found &ldquo;{v.original}&rdquo; at {v.location}
                  </p>
                  {v.suggestion && (
                    <div className="brand-admin-violation-fix-row">
                      <p className="brand-admin-violation-suggestion">{v.suggestion}</p>
                      {v.original && v.suggestion && (
                        <button
                          className="brand-admin-action-btn"
                          onClick={() => applySuggestion(v.original, v.suggestion!)}
                        >
                          Apply Fix
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Validation history */}
      <div className="brand-admin-card">
        <div className="brand-admin-voice-card-header">
          <h3>Validation History</h3>
          {!historyLoaded && (
            <button
              className="brand-admin-secondary-btn"
              onClick={loadHistory}
              disabled={loadingHistory}
            >
              {loadingHistory ? 'Loading...' : 'Load History'}
            </button>
          )}
        </div>

        {historyLoaded && history.length === 0 && (
          <p style={{ fontFamily: 'var(--af-font-poet)', fontStyle: 'italic', color: 'var(--af-stone-400)' }}>
            No validation history yet.
          </p>
        )}

        {history.length > 0 && (
          <div className="brand-admin-table-wrap">
            <table className="brand-admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Violations</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.reviewedAt)}</td>
                    <td>
                      <span className="brand-admin-category-chip">{r.contentType}</span>
                    </td>
                    <td>
                      <span className={`brand-admin-score-item-value ${scoreClass(r.score.overall)}`}>
                        {r.score.overall}
                      </span>
                    </td>
                    <td>{r.violations.length}</td>
                    <td>
                      <span className={`brand-admin-chip brand-admin-chip--${r.approved ? 'required' : 'error'}`}>
                        {r.approved ? 'APPROVED' : 'REJECTED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
