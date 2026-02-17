'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { fetchAllInitiatives, type Initiative } from '@/lib/initiative-api'
import { fetchAllMilestones, type Milestone } from '@/lib/roadmap-api'
import { getCookieValue } from '@/lib/cookies'

// Simulated weekly velocity data
const VELOCITY_DATA = [
  { week: 'W1', completed: 4 },
  { week: 'W2', completed: 6 },
  { week: 'W3', completed: 3 },
  { week: 'W4', completed: 8 },
  { week: 'W5', completed: 5 },
  { week: 'W6', completed: 7 },
  { week: 'W7', completed: 9 },
]

export default function ExecutionPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [inits, ms] = await Promise.all([
        fetchAllInitiatives(token),
        fetchAllMilestones(token),
      ])
      setInitiatives(inits)
      setMilestones(ms)
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const allTasks = initiatives.flatMap((i) => i.tasks)
    const done = allTasks.filter((t) => t.status === 'done').length
    const inProgress = allTasks.filter((t) => t.status === 'in-progress').length
    const blocked = allTasks.filter((t) => t.status === 'blocked').length
    const total = allTasks.length
    const activeInits = initiatives.filter((i) => i.status === 'active').length
    const avgProgress = initiatives.length > 0
      ? Math.round(initiatives.reduce((s, i) => s + i.progress, 0) / initiatives.length)
      : 0
    const atRiskMs = milestones.filter((m) => m.status === 'at-risk' || m.status === 'blocked').length
    return { done, inProgress, blocked, total, activeInits, avgProgress, atRiskMs }
  }, [initiatives, milestones])

  // Blockers from updates
  const blockers = useMemo(() => {
    const result: { initiative: string; initId: string; author: string; content: string; date: string }[] = []
    for (const init of initiatives) {
      for (const update of init.updates) {
        if (update.type === 'blocker') {
          result.push({
            initiative: init.title,
            initId: init.id,
            author: update.author,
            content: update.content,
            date: update.date,
          })
        }
      }
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [initiatives])

  // Risk indicators: at-risk milestones + initiatives with low progress near deadline
  const risks = useMemo(() => {
    const result: { title: string; type: string; reason: string; href: string }[] = []

    for (const ms of milestones) {
      if (ms.status === 'at-risk') {
        result.push({
          title: ms.title,
          type: 'milestone',
          reason: `At risk — ${ms.progress}% complete`,
          href: '/admin/strategy/roadmap',
        })
      }
      if (ms.status === 'blocked') {
        result.push({
          title: ms.title,
          type: 'milestone',
          reason: 'Blocked',
          href: '/admin/strategy/roadmap',
        })
      }
    }

    for (const init of initiatives) {
      const daysLeft = Math.ceil(
        (new Date(init.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
      if (daysLeft < 30 && init.progress < 60 && init.status === 'active') {
        result.push({
          title: init.title,
          type: 'initiative',
          reason: `${daysLeft}d left, only ${init.progress}% done`,
          href: `/admin/strategy/initiatives/${init.id}`,
        })
      }
    }

    return result
  }, [initiatives, milestones])

  // Owner workload
  const ownerWorkload = useMemo(() => {
    const map: Record<string, { owner: string; color: string; tasks: number; done: number; initiatives: number }> = {}
    for (const init of initiatives) {
      const key = init.owner
      if (!map[key]) {
        map[key] = { owner: key, color: init.ownerColor, tasks: 0, done: 0, initiatives: 0 }
      }
      map[key].initiatives++
      map[key].tasks += init.tasks.length
      map[key].done += init.tasks.filter((t) => t.status === 'done').length
    }
    return Object.values(map).sort((a, b) => b.tasks - a.tasks)
  }, [initiatives])

  const maxVelocity = Math.max(...VELOCITY_DATA.map((v) => v.completed), 1)

  if (loading) {
    return (
      <div className="strategy-page">
        <div className="strategy-header">
          <h1>Execution Dashboard</h1>
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
        <h1>Execution Dashboard</h1>
      </div>

      {/* KPI Strip */}
      <div className="strategy-kpi-row">
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">Active</div>
          <div className="strategy-kpi-value" style={{ color: 'var(--af-ultra)' }}>{stats.activeInits}</div>
          <div className="strategy-kpi-sub">initiatives</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">Tasks Done</div>
          <div className="strategy-kpi-value" style={{ color: 'var(--af-signal-go)' }}>{stats.done}</div>
          <div className="strategy-kpi-sub">of {stats.total}</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">In Progress</div>
          <div className="strategy-kpi-value">{stats.inProgress}</div>
          <div className="strategy-kpi-sub">tasks</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">Blocked</div>
          <div className="strategy-kpi-value" style={{ color: 'var(--af-signal-stop)' }}>{stats.blocked}</div>
          <div className="strategy-kpi-sub">tasks</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">Avg Progress</div>
          <div className="strategy-kpi-value">{stats.avgProgress}%</div>
          <div className="strategy-kpi-sub">all initiatives</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">At Risk</div>
          <div className="strategy-kpi-value" style={{ color: 'var(--af-signal-wait)' }}>{stats.atRiskMs}</div>
          <div className="strategy-kpi-sub">milestones</div>
        </div>
      </div>

      <div className="strategy-section-grid">
        {/* Velocity Chart */}
        <div className="strategy-section">
          <h2>Weekly Velocity</h2>
          <div className="strategy-velocity-chart">
            {VELOCITY_DATA.map((v, i) => (
              <div key={v.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  className={`strategy-velocity-bar${i === VELOCITY_DATA.length - 1 ? ' current' : ''}`}
                  style={{ height: `${(v.completed / maxVelocity) * 100}%` }}
                  title={`${v.completed} tasks completed`}
                />
                <div className="strategy-velocity-label">{v.week}</div>
              </div>
            ))}
          </div>
          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--af-font-machine)',
            fontSize: '11px',
            color: 'var(--af-stone-400)',
            marginTop: 'var(--af-space-palm)',
          }}>
            Avg: {Math.round(VELOCITY_DATA.reduce((s, v) => s + v.completed, 0) / VELOCITY_DATA.length)} tasks/week
          </div>
        </div>

        {/* Owner Workload */}
        <div className="strategy-section">
          <h2>Team Workload</h2>
          {ownerWorkload.map((w) => {
            const pct = w.tasks > 0 ? Math.round((w.done / w.tasks) * 100) : 0
            const progressColor =
              pct >= 70 ? 'var(--af-signal-go)' :
              pct >= 40 ? 'var(--af-signal-wait)' :
              'var(--af-signal-stop)'

            return (
              <div key={w.owner} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--af-space-palm)',
                padding: 'var(--af-space-palm) 0',
                borderBottom: 'var(--af-border-hair) solid var(--af-stone-200)',
              }}>
                <div className="strategy-owner-badge" style={{ background: w.color, width: 28, height: 28, fontSize: 10 }}>
                  {w.owner.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: 'var(--af-type-sm)',
                    fontWeight: 600,
                    color: 'var(--af-stone-800)',
                  }}>
                    {w.owner}
                  </div>
                  <div style={{
                    fontFamily: 'var(--af-font-machine)',
                    fontSize: '11px',
                    color: 'var(--af-stone-400)',
                  }}>
                    {w.initiatives} initiative{w.initiatives !== 1 ? 's' : ''} &middot; {w.tasks} tasks
                  </div>
                </div>
                <div style={{ width: 80, textAlign: 'right' }}>
                  <span className="strategy-progress-label" style={{ color: progressColor }}>
                    {w.done}/{w.tasks}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="strategy-section-grid">
        {/* Risk Indicators */}
        <div className="strategy-section">
          <h2>Risk Indicators ({risks.length})</h2>
          {risks.length === 0 ? (
            <div style={{
              fontFamily: 'var(--af-font-poet)',
              fontStyle: 'italic',
              fontSize: 'var(--af-type-sm)',
              color: 'var(--af-stone-400)',
              padding: 'var(--af-space-palm) 0',
            }}>
              No active risks detected.
            </div>
          ) : (
            risks.map((risk, i) => (
              <div key={i} className="strategy-blocker-item">
                <div className="strategy-blocker-icon">!</div>
                <div className="strategy-blocker-content">
                  <Link href={risk.href} className="strategy-blocker-title" style={{ textDecoration: 'none' }}>
                    {risk.title}
                  </Link>
                  <div className="strategy-blocker-desc">
                    <span style={{ textTransform: 'capitalize' }}>{risk.type}</span> — {risk.reason}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Blockers */}
        <div className="strategy-section">
          <h2>Active Blockers ({blockers.length})</h2>
          {blockers.length === 0 ? (
            <div style={{
              fontFamily: 'var(--af-font-poet)',
              fontStyle: 'italic',
              fontSize: 'var(--af-type-sm)',
              color: 'var(--af-stone-400)',
              padding: 'var(--af-space-palm) 0',
            }}>
              No blockers reported.
            </div>
          ) : (
            blockers.map((blocker, i) => (
              <div key={i} className="strategy-blocker-item">
                <div className="strategy-blocker-icon">!</div>
                <div className="strategy-blocker-content">
                  <Link
                    href={`/admin/strategy/initiatives/${blocker.initId}`}
                    className="strategy-blocker-title"
                    style={{ textDecoration: 'none' }}
                  >
                    {blocker.initiative}
                  </Link>
                  <div className="strategy-blocker-desc">
                    {blocker.content}
                  </div>
                  <div style={{
                    fontFamily: 'var(--af-font-machine)',
                    fontSize: '10px',
                    color: 'var(--af-stone-400)',
                    marginTop: 'var(--af-space-grain)',
                  }}>
                    {blocker.author} &middot; {new Date(blocker.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Initiative Progress Ranking */}
      <div className="strategy-section">
        <h2>Initiative Progress Ranking</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[...initiatives]
            .sort((a, b) => b.progress - a.progress)
            .map((init, i) => {
              const progressColor =
                init.progress >= 70 ? 'var(--af-signal-go)' :
                init.progress >= 40 ? 'var(--af-signal-wait)' :
                'var(--af-signal-stop)'

              return (
                <Link
                  key={init.id}
                  href={`/admin/strategy/initiatives/${init.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--af-space-hand)',
                    padding: 'var(--af-space-palm) 0',
                    borderBottom: 'var(--af-border-hair) solid var(--af-stone-200)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--af-font-machine)',
                    fontSize: 'var(--af-type-xs)',
                    fontWeight: 700,
                    color: 'var(--af-stone-400)',
                    width: 24,
                    textAlign: 'center',
                  }}>
                    #{i + 1}
                  </span>
                  <div className="strategy-owner-badge" style={{ background: init.ownerColor, width: 24, height: 24, fontSize: 10 }}>
                    {init.owner.charAt(0)}
                  </div>
                  <span style={{
                    flex: 1,
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: 'var(--af-type-sm)',
                    fontWeight: 500,
                    color: 'var(--af-stone-800)',
                  }}>
                    {init.title}
                  </span>
                  <span className={`strategy-status-chip ${init.status}`} style={{ fontSize: 10, padding: '1px 6px' }}>
                    {init.status}
                  </span>
                  <div style={{ width: 100 }}>
                    <div className="strategy-progress-track" style={{ height: 4, marginBottom: 2 }}>
                      <div className="strategy-progress-fill" style={{ width: `${init.progress}%`, background: progressColor }} />
                    </div>
                  </div>
                  <span className="strategy-progress-label" style={{ color: progressColor, width: 40, textAlign: 'right' }}>
                    {init.progress}%
                  </span>
                </Link>
              )
            })}
        </div>
      </div>
    </div>
  )
}
