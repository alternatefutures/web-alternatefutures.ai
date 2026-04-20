'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  fetchAllMilestones,
  fetchDependencies,
  formatDateRange,
  daysRemaining,
  getPhaseLabel,
  getStatusLabel,
  ROADMAP_QUARTERS,
  type Milestone,
  type Dependency,
} from '@/lib/roadmap-api'
import { getCookieValue } from '@/lib/cookies'

export default function RoadmapPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPhase, setFilterPhase] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [ms, deps] = await Promise.all([
        fetchAllMilestones(token),
        fetchDependencies(token),
      ])
      setMilestones(ms)
      setDependencies(deps)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = milestones
    if (filterPhase !== 'all') result = result.filter((m) => m.phase === filterPhase)
    if (filterStatus !== 'all') result = result.filter((m) => m.status === filterStatus)
    return result.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
  }, [milestones, filterPhase, filterStatus])

  const stats = useMemo(() => {
    const total = milestones.length
    const completed = milestones.filter((m) => m.status === 'completed').length
    const inProgress = milestones.filter((m) => m.status === 'in-progress').length
    const atRisk = milestones.filter((m) => m.status === 'at-risk' || m.status === 'blocked').length
    const avgProgress = total > 0
      ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / total)
      : 0
    return { total, completed, inProgress, atRisk, avgProgress }
  }, [milestones])

  // Timeline calculation: full year 2026
  const yearStart = new Date('2026-01-01').getTime()
  const yearEnd = new Date('2026-12-31').getTime()
  const yearSpan = yearEnd - yearStart

  function getBarPosition(startDate: string, endDate: string) {
    const s = Math.max(new Date(startDate).getTime(), yearStart)
    const e = Math.min(new Date(endDate).getTime(), yearEnd)
    const left = ((s - yearStart) / yearSpan) * 100
    const width = Math.max(((e - s) / yearSpan) * 100, 2)
    return { left: `${left}%`, width: `${width}%` }
  }

  if (loading) {
    return (
      <div className="strategy-page">
        <div className="strategy-header">
          <h1>Roadmap</h1>
        </div>
        <div className="strategy-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="strategy-skeleton-row">
              <div className="strategy-skeleton-block w-40" />
              <div className="strategy-skeleton-block w-20" />
              <div className="strategy-skeleton-block w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="strategy-page">
      <div className="strategy-header">
        <h1>Roadmap</h1>
        <div className="strategy-header-actions">
          <span style={{
            fontFamily: 'var(--af-font-machine)',
            fontSize: 'var(--af-type-xs)',
            color: 'var(--af-stone-400)',
          }}>
            {filtered.length} milestones
          </span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="strategy-kpi-row">
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">Total</div>
          <div className="strategy-kpi-value">{stats.total}</div>
          <div className="strategy-kpi-sub">milestones</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">Completed</div>
          <div className="strategy-kpi-value" style={{ color: 'var(--af-signal-go)' }}>{stats.completed}</div>
          <div className="strategy-kpi-sub">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">In Progress</div>
          <div className="strategy-kpi-value" style={{ color: 'var(--af-ultra)' }}>{stats.inProgress}</div>
          <div className="strategy-kpi-sub">active</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">At Risk</div>
          <div className="strategy-kpi-value" style={{ color: 'var(--af-signal-stop)' }}>{stats.atRisk}</div>
          <div className="strategy-kpi-sub">need attention</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">Avg Progress</div>
          <div className="strategy-kpi-value">{stats.avgProgress}%</div>
          <div className="strategy-kpi-sub">across all</div>
        </div>
      </div>

      {/* Filters */}
      <div className="strategy-filters">
        <select
          className="strategy-select"
          value={filterPhase}
          onChange={(e) => setFilterPhase(e.target.value)}
        >
          <option value="all">All Phases</option>
          <option value="discovery">Discovery</option>
          <option value="design">Design</option>
          <option value="build">Build</option>
          <option value="launch">Launch</option>
          <option value="scale">Scale</option>
        </select>
        <select
          className="strategy-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="planned">Planned</option>
          <option value="at-risk">At Risk</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Timeline View */}
      <div className="strategy-card" style={{ overflow: 'auto' }}>
        <div className="strategy-timeline" style={{ minWidth: 800 }}>
          {/* Quarter Headers */}
          <div className="strategy-timeline-header">
            <div style={{ padding: 'var(--af-space-palm) var(--af-space-hand)', fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-xs)', fontWeight: 600, color: 'var(--af-stone-500)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--af-stone-100)' }}>
              Milestone
            </div>
            <div className="strategy-timeline-quarters">
              {ROADMAP_QUARTERS.map((q) => (
                <div key={q.label} className="strategy-timeline-quarter">{q.label}</div>
              ))}
            </div>
          </div>

          {/* Milestone Rows */}
          {filtered.map((ms) => {
            const pos = getBarPosition(ms.startDate, ms.endDate)
            const days = daysRemaining(ms.endDate)

            return (
              <div key={ms.id} className="strategy-timeline-row">
                <div className="strategy-timeline-label" title={ms.title}>
                  {ms.title}
                </div>
                <div className="strategy-timeline-bar-area">
                  <div
                    className={`strategy-timeline-bar ${ms.status}`}
                    style={{
                      left: pos.left,
                      width: pos.width,
                      backgroundColor: ms.ownerColor,
                      opacity: ms.status === 'completed' ? 0.6 : 1,
                    }}
                    title={`${ms.title} — ${getStatusLabel(ms.status)} — ${ms.progress}% — ${formatDateRange(ms.startDate, ms.endDate)}${days > 0 ? ` — ${days}d left` : ''}`}
                  >
                    {ms.progress}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Milestone Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--af-space-hand)' }}>
        {filtered.map((ms) => {
          const days = daysRemaining(ms.endDate)
          const depNames = ms.dependencies
            .map((depId) => milestones.find((m) => m.id === depId)?.title)
            .filter(Boolean)
          const progressColor =
            ms.progress >= 80 ? 'var(--af-signal-go)' :
            ms.progress >= 50 ? 'var(--af-signal-wait)' :
            'var(--af-signal-stop)'

          return (
            <div key={ms.id} className="strategy-card">
              <div className="strategy-card-header">
                <div className="strategy-owner-badge" style={{ background: ms.ownerColor }}>
                  {ms.owner.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="strategy-initiative-title">{ms.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--af-space-palm)', flexWrap: 'wrap' }}>
                    <span className="strategy-initiative-owner">{ms.owner}</span>
                    <span className={`strategy-status-chip ${ms.status}`}>{getStatusLabel(ms.status)}</span>
                    <span style={{
                      fontFamily: 'var(--af-font-machine)',
                      fontSize: '11px',
                      color: 'var(--af-stone-400)',
                    }}>
                      {getPhaseLabel(ms.phase)}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="strategy-progress-label" style={{ color: progressColor }}>
                    {ms.progress}%
                  </div>
                  <div style={{
                    fontFamily: 'var(--af-font-machine)',
                    fontSize: '10px',
                    color: days > 0 ? 'var(--af-stone-400)' : 'var(--af-signal-stop)',
                  }}>
                    {days > 0 ? `${days}d left` : days === 0 ? 'Due today' : `${Math.abs(days)}d overdue`}
                  </div>
                </div>
              </div>
              <div className="strategy-card-body">
                <p style={{
                  fontFamily: 'var(--af-font-architect)',
                  fontSize: 'var(--af-type-sm)',
                  color: 'var(--af-stone-600)',
                  margin: '0 0 var(--af-space-palm)',
                  lineHeight: 'var(--af-leading-body)',
                }}>
                  {ms.description}
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: 'var(--af-space-palm)' }}>
                  <div className="strategy-progress-track">
                    <div
                      className="strategy-progress-fill"
                      style={{ width: `${ms.progress}%`, background: progressColor }}
                    />
                  </div>
                </div>

                {/* Date range */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--af-space-palm)' }}>
                  <span style={{
                    fontFamily: 'var(--af-font-machine)',
                    fontSize: '11px',
                    color: 'var(--af-stone-500)',
                  }}>
                    {formatDateRange(ms.startDate, ms.endDate)}
                  </span>

                  {depNames.length > 0 && (
                    <div style={{ display: 'flex', gap: 'var(--af-space-grain)', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'var(--af-font-architect)',
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--af-stone-400)',
                      }}>Depends on:</span>
                      {depNames.map((name) => (
                        <span key={name} className="strategy-tag">{name}</span>
                      ))}
                    </div>
                  )}

                  <div className="strategy-tags">
                    {ms.tags.map((tag) => (
                      <span key={tag} className="strategy-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
