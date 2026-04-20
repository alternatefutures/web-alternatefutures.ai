'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  fetchBrandHealth,
  fetchBrandGuide,
  fetchBrandReviews,
  fetchBrandCertifications,
  type BrandHealthMetrics,
  type BrandGuide,
  type BrandReview,
  type BrandCertification,
  type BrandViolationType,
} from '@/lib/brand-api'
import { getCookieValue } from '@/lib/cookies'
import './brand-admin.css'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreClass(score: number): string {
  if (score >= 80) return 'pass'
  if (score >= 60) return 'warn'
  return 'fail'
}

function violationTypeLabel(t: BrandViolationType): string {
  const labels: Record<BrandViolationType, string> = {
    TERMINOLOGY: 'Terminology',
    PARTNER_POSITIONING: 'Partner',
    COMPETITOR_TREATMENT: 'Competitor',
    VOICE_MISMATCH: 'Voice',
    TRACK_MISALIGNMENT: 'Track',
    VISUAL_NONCOMPLIANCE: 'Visual',
  }
  return labels[t] || t
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BrandDashboardPage() {
  const [health, setHealth] = useState<BrandHealthMetrics | null>(null)
  const [guide, setGuide] = useState<BrandGuide | null>(null)
  const [reviews, setReviews] = useState<BrandReview[]>([])
  const [certs, setCerts] = useState<BrandCertification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [h, g, r, c] = await Promise.all([
          fetchBrandHealth(token),
          fetchBrandGuide(token),
          fetchBrandReviews(token, { limit: 10 }),
          fetchBrandCertifications(token),
        ])
        setHealth(h)
        setGuide(g)
        setReviews(r)
        setCerts(c)
      } catch {
        setError('Failed to load brand data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="brand-admin-empty">
        <p>Loading brand governance...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="brand-admin-empty">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  const recentViolations = reviews
    .flatMap((r) =>
      r.violations.map((v) => ({
        ...v,
        contentId: r.contentId,
        contentType: r.contentType,
        reviewedAt: r.reviewedAt,
      })),
    )
    .slice(0, 8)

  const activeRules = guide?.rules.filter((r) => r.active) || []

  return (
    <>
      {/* Header */}
      <div className="brand-admin-header">
        <div>
          <h1>Brand Governance</h1>
          <p className="brand-admin-subtitle">Protecting brand consistency across all channels</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="brand-admin-quick-actions">
        <Link href="/admin/brand/validation" className="brand-admin-new-btn">
          Run Scan
        </Link>
        <Link href="/admin/brand/terminology" className="brand-admin-secondary-btn">
          Terminology
        </Link>
        <Link href="/admin/brand/voice" className="brand-admin-secondary-btn">
          Voice Profiles
        </Link>
        <Link href="/admin/brand/rules" className="brand-admin-secondary-btn">
          Rules
        </Link>
      </div>

      {/* Health score card */}
      {health && (
        <div className="brand-admin-stats">
          <div className="brand-admin-stat-card">
            <div className="brand-admin-stat-label">Overall Score</div>
            <div className={`brand-admin-stat-value ${scoreClass(health.overallScore)}`}>
              {health.overallScore}
            </div>
          </div>
          <div className="brand-admin-stat-card">
            <div className="brand-admin-stat-label">Approval Rate</div>
            <div className="brand-admin-stat-value">{health.approvalRate}%</div>
          </div>
          <div className="brand-admin-stat-card">
            <div className="brand-admin-stat-label">Violations This Week</div>
            <div className="brand-admin-stat-value">{health.violationsThisWeek}</div>
          </div>
          <div className="brand-admin-stat-card">
            <div className="brand-admin-stat-label">Blocking</div>
            <div className="brand-admin-stat-value">{health.blockingViolations}</div>
          </div>
        </div>
      )}

      {/* Two-column layout: Score breakdown + Voice Overview */}
      <div className="brand-admin-grid-2">
        {/* Score breakdown */}
        {health && (
          <div className="brand-admin-card">
            <h3>Average Scores</h3>
            <div className="brand-admin-score-breakdown">
              {Object.entries(health.avgScore).map(([key, val]) => (
                <div key={key} className="brand-admin-score-item">
                  <div className="brand-admin-score-item-label">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className={`brand-admin-score-item-value ${scoreClass(val)}`}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice profile overview */}
        {guide && (
          <div className="brand-admin-card">
            <h3>Voice Profile</h3>
            <div className="brand-admin-card-title">{guide.missionStatement.slice(0, 120)}...</div>
            <div style={{ marginBottom: 'var(--af-space-hand)' }}>
              {guide.voiceAttributes.map((attr) => (
                <span key={attr} className="brand-admin-tone-tag">{attr}</span>
              ))}
            </div>
            <div className="brand-admin-card-meta">
              Guide v{guide.version} &middot; {guide.rules.length} rules &middot; {guide.prohibitedTerms.length} prohibited terms
            </div>
          </div>
        )}
      </div>

      {/* Top violation types */}
      {health && health.topViolationTypes.length > 0 && (
        <div className="brand-admin-card">
          <h3>Top Violation Types</h3>
          <div className="brand-admin-violation-types">
            {health.topViolationTypes.map((vt) => (
              <div key={vt.type} className="brand-admin-violation-type-row">
                <span className="brand-admin-category-chip">{violationTypeLabel(vt.type)}</span>
                <div className="brand-admin-violation-type-bar-wrap">
                  <div
                    className="brand-admin-violation-type-bar"
                    style={{
                      width: `${Math.min(100, (vt.count / Math.max(1, health.violationsThisWeek)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="brand-admin-violation-type-count">{vt.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent violations */}
      {recentViolations.length > 0 && (
        <div className="brand-admin-card">
          <h3>Recent Violations</h3>
          {recentViolations.map((v) => (
            <div
              key={v.id}
              className={`brand-admin-violation brand-admin-violation--${v.severity.toLowerCase()}`}
            >
              <div className="brand-admin-violation-header">
                <span className={`brand-admin-chip brand-admin-chip--${v.severity.toLowerCase()}`}>
                  {v.severity}
                </span>
                <span className="brand-admin-category-chip">{violationTypeLabel(v.type)}</span>
                <span className="brand-admin-violation-date">{formatDate(v.reviewedAt)}</span>
              </div>
              <p className="brand-admin-violation-message">{v.original}</p>
              {v.suggestion && (
                <p className="brand-admin-violation-suggestion">{v.suggestion}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Active rules summary */}
      {activeRules.length > 0 && (
        <div className="brand-admin-card">
          <h3>Active Brand Rules ({activeRules.length})</h3>
          <div className="brand-admin-table-wrap">
            <table className="brand-admin-table">
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Category</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {activeRules.slice(0, 10).map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.name}</td>
                    <td>
                      <span className="brand-admin-category-chip">{rule.category}</span>
                    </td>
                    <td>
                      <span className={`brand-admin-chip brand-admin-chip--${rule.severity.toLowerCase()}`}>
                        {rule.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activeRules.length > 10 && (
            <div style={{ textAlign: 'center', marginTop: 'var(--af-space-palm)' }}>
              <Link href="/admin/brand/rules" className="brand-admin-action-btn">
                View all {activeRules.length} rules
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Certifications */}
      {certs.length > 0 && (
        <div className="brand-admin-card">
          <h3>Agent Certifications</h3>
          <div className="brand-admin-certs-grid">
            {certs.map((cert) => (
              <div key={cert.id} className={`brand-admin-cert-card brand-admin-cert-card--${cert.status.toLowerCase()}`}>
                <div className="brand-admin-cert-name">{cert.agentName}</div>
                <div className="brand-admin-cert-score">{cert.score}</div>
                <div className={`brand-admin-chip brand-admin-chip--${cert.status === 'CERTIFIED' ? 'required' : cert.status === 'EXPIRED' ? 'warning' : 'info'}`}>
                  {cert.status}
                </div>
                <div className="brand-admin-cert-meta">v{cert.guideVersion}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
