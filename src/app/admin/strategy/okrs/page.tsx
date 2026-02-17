'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  fetchOKRs,
  type OKR,
  type OKRStatus,
  type KeyResult,
  type KRUnit,
} from '@/lib/orchestrator-api'
import { AGENT_PROFILES } from '@/lib/agent-tasks-api'
import {
  PiTrendUpBold,
  PiTrendDownBold,
  PiCaretDownBold,
  PiCaretRightBold,
} from 'react-icons/pi'
import { getCookieValue } from '@/lib/cookies'
import './okr-admin.css'

const QUARTERS = ['Q1-2026', 'Q2-2026', 'Q3-2026', 'Q4-2026']
const QUARTER_LABELS: Record<string, string> = {
  'Q1-2026': 'Q1 2026',
  'Q2-2026': 'Q2 2026',
  'Q3-2026': 'Q3 2026',
  'Q4-2026': 'Q4 2026',
}

function getKRStatus(kr: KeyResult): 'on-track' | 'at-risk' | 'behind' {
  if (kr.progress >= 60) return 'on-track'
  if (kr.progress >= 30) return 'at-risk'
  return 'behind'
}

function getConfidence(okr: OKR): 'high' | 'medium' | 'low' {
  if (okr.status === 'ON_TRACK' || okr.status === 'COMPLETED') return 'high'
  if (okr.status === 'AT_RISK') return 'low'
  if (okr.progress >= 50) return 'high'
  if (okr.progress >= 25) return 'medium'
  return 'low'
}

function getProgressColor(progress: number): string {
  if (progress >= 60) return 'var(--af-signal-go)'
  if (progress >= 30) return 'var(--af-signal-wait)'
  return 'var(--af-signal-stop)'
}

function getStatusBadge(status: OKRStatus): { label: string; color: string; bg: string } {
  const map: Record<OKRStatus, { label: string; color: string; bg: string }> = {
    DRAFT: { label: 'Draft', color: '#6B7280', bg: '#F3F4F6' },
    ACTIVE: { label: 'Active', color: '#1E40AF', bg: '#DBEAFE' },
    AT_RISK: { label: 'At Risk', color: '#92400E', bg: '#FEF3C7' },
    ON_TRACK: { label: 'On Track', color: '#065F46', bg: '#D1FAE5' },
    COMPLETED: { label: 'Completed', color: '#065F46', bg: '#D1FAE5' },
    CANCELLED: { label: 'Cancelled', color: '#6B7280', bg: '#F3F4F6' },
  }
  return map[status]
}

function formatKRValue(value: number, unit: KRUnit): string {
  switch (unit) {
    case 'CURRENCY':
      return value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toLocaleString()}`
    case 'PERCENT':
      return `${value}%`
    case 'RATIO':
      return `${value.toFixed(1)}x`
    case 'SCORE':
      return `${value}`
    case 'COUNT':
    default:
      return value.toLocaleString()
  }
}

function getOwnerName(ownerId: string): string {
  const profile = AGENT_PROFILES[ownerId as keyof typeof AGENT_PROFILES]
  return profile?.name || ownerId
}

function getOwnerColor(ownerId: string): string {
  const colors: Record<string, string> = {
    orchestrator: '#4B5563',
    'growth-hacker': '#059669',
    'content-writer': '#000AFF',
    'community-manager': '#BE4200',
    'devrel-lead': '#5C7A6B',
    partnerships: '#1E3A5F',
    'brand-guardian': '#C9A84C',
    'market-intel': '#264653',
  }
  return colors[ownerId] || '#6B7280'
}

export default function OKRPage() {
  const [okrs, setOkrs] = useState<OKR[]>([])
  const [loading, setLoading] = useState(true)
  const [quarter, setQuarter] = useState(QUARTERS[0])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<OKRStatus | 'ALL'>('ALL')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const token = getCookieValue('af_access_token')
      const data = await fetchOKRs(token, { quarter }).catch(() => [])
      setOkrs(data)
      setExpandedIds(new Set(data.map((o) => o.id)))
      setLoading(false)
    }
    load()
  }, [quarter])

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return okrs
    return okrs.filter((o) => o.status === statusFilter)
  }, [okrs, statusFilter])

  const healthStats = useMemo(() => {
    const allKRs = okrs.flatMap((o) => o.keyResults)
    return {
      total: okrs.length,
      avgProgress: okrs.length > 0
        ? Math.round(okrs.reduce((sum, o) => sum + o.progress, 0) / okrs.length)
        : 0,
      onTrack: allKRs.filter((kr) => getKRStatus(kr) === 'on-track').length,
      atRisk: allKRs.filter((kr) => getKRStatus(kr) === 'at-risk').length,
      behind: allKRs.filter((kr) => getKRStatus(kr) === 'behind').length,
    }
  }, [okrs])

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <>
        <div className="okr-admin-header">
          <h1>Objectives & Key Results</h1>
          <select className="okr-quarter-select" value={quarter} onChange={(e) => setQuarter(e.target.value)}>
            {QUARTERS.map((q) => (
              <option key={q} value={q}>{QUARTER_LABELS[q]}</option>
            ))}
          </select>
        </div>
        <div className="okr-health-strip">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="okr-health-card" style={{ pointerEvents: 'none' }}>
              <div className="skeleton-block" style={{ width: '40%', height: 28, margin: '0 auto 6px' }} />
              <div className="skeleton-block" style={{ width: '60%', height: 12, margin: '0 auto' }} />
            </div>
          ))}
        </div>
        <div className="okr-objectives-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="okr-objective-card" style={{ pointerEvents: 'none' }}>
              <div className="okr-objective-header">
                <div className="skeleton-block" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton-block" style={{ width: '70%', height: 14, marginBottom: 6 }} />
                  <div className="skeleton-block" style={{ width: '40%', height: 11 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="okr-admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--af-space-hand)', flexWrap: 'wrap' }}>
          <h1>Objectives & Key Results</h1>
          <select
            className="okr-quarter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OKRStatus | 'ALL')}
            style={{ fontSize: 'var(--af-type-xs)' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
            <option value="COMPLETED">Completed</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
        <select
          className="okr-quarter-select"
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
        >
          {QUARTERS.map((q) => (
            <option key={q} value={q}>{QUARTER_LABELS[q]}</option>
          ))}
        </select>
      </div>

      <div className="okr-health-strip">
        <div className="okr-health-card">
          <div className="okr-health-value neutral">{healthStats.total}</div>
          <div className="okr-health-label">Objectives</div>
        </div>
        <div className="okr-health-card">
          <div className={`okr-health-value ${healthStats.avgProgress >= 60 ? 'on-track' : healthStats.avgProgress >= 40 ? 'at-risk' : 'behind'}`}>
            {healthStats.avgProgress}%
          </div>
          <div className="okr-health-label">Avg Progress</div>
        </div>
        <div className="okr-health-card">
          <div className="okr-health-value on-track">{healthStats.onTrack}</div>
          <div className="okr-health-label">On Track KRs</div>
        </div>
        <div className="okr-health-card">
          <div className="okr-health-value at-risk">{healthStats.atRisk}</div>
          <div className="okr-health-label">At Risk KRs</div>
        </div>
        <div className="okr-health-card">
          <div className="okr-health-value behind">{healthStats.behind}</div>
          <div className="okr-health-label">Behind KRs</div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="okr-empty">
          <h2>No objectives found</h2>
          <p>No OKRs match your current filters for {QUARTER_LABELS[quarter]}.</p>
        </div>
      )}

      <div className="okr-objectives-list">
        {filtered.map((okr, idx) => {
          const expanded = expandedIds.has(okr.id)
          const confidence = getConfidence(okr)
          const progressColor = getProgressColor(okr.progress)
          const statusBadge = getStatusBadge(okr.status)

          return (
            <div key={okr.id} className="okr-objective-card">
              <div
                className="okr-objective-header"
                onClick={() => toggleExpanded(okr.id)}
              >
                <div
                  className="okr-objective-number"
                  style={{ background: getOwnerColor(okr.owner) }}
                >
                  O{idx + 1}
                </div>
                <div className="okr-objective-info">
                  <div className="okr-objective-title">{okr.title}</div>
                  <div className="okr-objective-owner">
                    {getOwnerName(okr.owner)}
                    <span
                      style={{
                        marginLeft: 8,
                        padding: '1px 6px',
                        borderRadius: 'var(--af-radius-chip)',
                        fontSize: 10,
                        fontWeight: 600,
                        background: statusBadge.bg,
                        color: statusBadge.color,
                      }}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
                <div className="okr-confidence">
                  <span className={`okr-confidence-dot ${confidence}`} />
                  <span className={`okr-confidence-label ${confidence}`}>
                    {confidence === 'high' ? 'High' : confidence === 'medium' ? 'Med' : 'Low'}
                  </span>
                </div>
                <span style={{ color: 'var(--af-stone-400)', fontSize: 14, flexShrink: 0 }}>
                  {expanded ? <PiCaretDownBold /> : <PiCaretRightBold />}
                </span>
              </div>

              <div className="okr-objective-progress">
                <div className="okr-progress-labels">
                  <span className="okr-progress-pct" style={{ color: progressColor }}>
                    {okr.progress}%
                  </span>
                  <span className="okr-progress-target">
                    {okr.keyResults.length} key result{okr.keyResults.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="okr-progress-bar-track">
                  <div
                    className="okr-progress-bar-fill"
                    style={{ width: `${okr.progress}%`, background: progressColor }}
                  />
                </div>
              </div>

              {expanded && (
                <>
                  <div className="okr-kr-list">
                    {okr.keyResults.map((kr) => {
                      const krStatus = getKRStatus(kr)
                      const krPct = Math.round(kr.progress)

                      return (
                        <div key={kr.id} className="okr-kr-item">
                          <span className={`okr-kr-indicator ${krStatus}`} />
                          <div className="okr-kr-info">
                            <div className="okr-kr-title">{kr.title}</div>
                            <div className="okr-kr-metric">
                              {formatKRValue(kr.currentValue, kr.unit)} / {formatKRValue(kr.targetValue, kr.unit)}
                              {kr.trend !== 'FLAT' && (
                                <span style={{
                                  marginLeft: 6,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  color: kr.trend === 'UP' ? 'var(--af-signal-go)' : 'var(--af-signal-stop)',
                                }}>
                                  {kr.trend === 'UP' ? <PiTrendUpBold size={11} /> : <PiTrendDownBold size={11} />}
                                </span>
                              )}
                              <span style={{ marginLeft: 8, color: 'var(--af-stone-400)' }}>
                                {getOwnerName(kr.owner)}
                              </span>
                            </div>
                          </div>
                          <div className="okr-kr-progress">
                            <div className="okr-kr-progress-track">
                              <div
                                className="okr-kr-progress-fill"
                                style={{
                                  width: `${Math.min(krPct, 100)}%`,
                                  background: getProgressColor(kr.progress),
                                }}
                              />
                            </div>
                            <div className={`okr-kr-pct ${krStatus}`}>
                              {krPct}%
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {okr.description && (
                    <div className="okr-campaigns">
                      <div className="okr-campaigns-label">Description</div>
                      <div style={{
                        fontFamily: 'var(--af-font-architect)',
                        fontSize: 'var(--af-type-sm)',
                        color: 'var(--af-stone-600)',
                        lineHeight: 'var(--af-leading-body)',
                      }}>
                        {okr.description}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
