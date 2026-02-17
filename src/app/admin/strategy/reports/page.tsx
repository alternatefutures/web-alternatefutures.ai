'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchAllInitiatives, type Initiative } from '@/lib/initiative-api'
import { fetchAllMilestones, getStatusLabel, type Milestone } from '@/lib/roadmap-api'
import { getCookieValue } from '@/lib/cookies'

type ReportType = 'weekly' | 'monthly' | 'quarterly'

interface ReportTemplate {
  id: string
  title: string
  description: string
  type: ReportType
  lastGenerated: string | null
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'rpt-1',
    title: 'Weekly Strategy Update',
    description: 'Summary of initiative progress, tasks completed, blockers, and upcoming milestones for the current week.',
    type: 'weekly',
    lastGenerated: '2026-02-14',
  },
  {
    id: 'rpt-2',
    title: 'Monthly Exec Summary',
    description: 'Executive overview of OKR progress, initiative status, team velocity, and key decisions made during the month.',
    type: 'monthly',
    lastGenerated: '2026-01-31',
  },
  {
    id: 'rpt-3',
    title: 'Quarterly Strategy Review',
    description: 'Comprehensive quarterly review covering OKR achievement, roadmap adherence, cross-team alignment, and next quarter planning.',
    type: 'quarterly',
    lastGenerated: null,
  },
  {
    id: 'rpt-4',
    title: 'Weekly Risk Report',
    description: 'Active risks, blockers, at-risk milestones, and initiatives behind schedule with recommended mitigations.',
    type: 'weekly',
    lastGenerated: '2026-02-14',
  },
  {
    id: 'rpt-5',
    title: 'Monthly Team Velocity',
    description: 'Team-by-team velocity metrics, task throughput, and workload distribution analysis.',
    type: 'monthly',
    lastGenerated: '2026-01-31',
  },
  {
    id: 'rpt-6',
    title: 'Quarterly Investor Update',
    description: 'Investor-ready summary of progress, KPIs, market traction, and upcoming milestones for stakeholders.',
    type: 'quarterly',
    lastGenerated: null,
  },
]

export default function ReportsPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all')

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

  const filteredTemplates = useMemo(() => {
    if (filterType === 'all') return REPORT_TEMPLATES
    return REPORT_TEMPLATES.filter((r) => r.type === filterType)
  }, [filterType])

  // Generate report preview content
  const reportContent = useMemo(() => {
    if (!selectedReport) return null

    const template = REPORT_TEMPLATES.find((r) => r.id === selectedReport)
    if (!template) return null

    const activeInits = initiatives.filter((i) => i.status === 'active')
    const allTasks = initiatives.flatMap((i) => i.tasks)
    const doneTasks = allTasks.filter((t) => t.status === 'done').length
    const blockedTasks = allTasks.filter((t) => t.status === 'blocked').length
    const avgProgress = initiatives.length > 0
      ? Math.round(initiatives.reduce((s, i) => s + i.progress, 0) / initiatives.length)
      : 0
    const atRiskMs = milestones.filter((m) => m.status === 'at-risk')
    const completedMs = milestones.filter((m) => m.status === 'completed')
    const blockerUpdates = initiatives.flatMap((i) =>
      i.updates.filter((u) => u.type === 'blocker').map((u) => ({ ...u, initiative: i.title })),
    )

    return {
      template,
      data: {
        activeInits: activeInits.length,
        totalInits: initiatives.length,
        totalTasks: allTasks.length,
        doneTasks,
        blockedTasks,
        avgProgress,
        atRiskMs,
        completedMs,
        blockerUpdates,
        activeInitiatives: activeInits,
        milestoneCount: milestones.length,
      },
    }
  }, [selectedReport, initiatives, milestones])

  if (loading) {
    return (
      <div className="strategy-page">
        <div className="strategy-header">
          <h1>Strategy Reports</h1>
        </div>
        <div className="strategy-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="strategy-skeleton-row">
              <div className="strategy-skeleton-block w-40" />
              <div className="strategy-skeleton-block w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="strategy-page">
      <div className="strategy-header">
        <h1>Strategy Reports</h1>
        <div className="strategy-header-actions">
          <select
            className="strategy-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ReportType | 'all')}
          >
            <option value="all">All Types</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      {/* Report Templates */}
      <div className="strategy-report-grid">
        {filteredTemplates.map((report) => (
          <div
            key={report.id}
            className="strategy-report-card"
            onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
            style={{
              borderColor: selectedReport === report.id ? 'var(--af-terra)' : undefined,
            }}
          >
            <div className="strategy-report-card-title">{report.title}</div>
            <div className="strategy-report-card-desc">{report.description}</div>
            <div className="strategy-report-card-meta">
              <span className="strategy-report-card-type">{report.type}</span>
              <span style={{
                fontFamily: 'var(--af-font-machine)',
                fontSize: '11px',
                color: report.lastGenerated ? 'var(--af-stone-400)' : 'var(--af-signal-wait)',
              }}>
                {report.lastGenerated
                  ? `Last: ${new Date(report.lastGenerated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : 'Never generated'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Report Preview */}
      {reportContent && (
        <div className="strategy-section" style={{ marginTop: 'var(--af-space-hand)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--af-space-hand)' }}>
            <h2>{reportContent.template.title} — Preview</h2>
            <span style={{
              fontFamily: 'var(--af-font-machine)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--af-stone-400)',
            }}>
              Generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Summary Stats */}
          <div className="strategy-kpi-row" style={{ marginBottom: 'var(--af-space-hand)' }}>
            <div className="strategy-kpi-card">
              <div className="strategy-kpi-label">Initiatives</div>
              <div className="strategy-kpi-value">{reportContent.data.activeInits}/{reportContent.data.totalInits}</div>
              <div className="strategy-kpi-sub">active</div>
            </div>
            <div className="strategy-kpi-card">
              <div className="strategy-kpi-label">Tasks</div>
              <div className="strategy-kpi-value" style={{ color: 'var(--af-signal-go)' }}>{reportContent.data.doneTasks}</div>
              <div className="strategy-kpi-sub">of {reportContent.data.totalTasks} done</div>
            </div>
            <div className="strategy-kpi-card">
              <div className="strategy-kpi-label">Progress</div>
              <div className="strategy-kpi-value">{reportContent.data.avgProgress}%</div>
              <div className="strategy-kpi-sub">average</div>
            </div>
            <div className="strategy-kpi-card">
              <div className="strategy-kpi-label">Blockers</div>
              <div className="strategy-kpi-value" style={{ color: reportContent.data.blockedTasks > 0 ? 'var(--af-signal-stop)' : 'var(--af-signal-go)' }}>
                {reportContent.data.blockedTasks}
              </div>
              <div className="strategy-kpi-sub">tasks blocked</div>
            </div>
          </div>

          {/* Initiative Status */}
          <div style={{ marginBottom: 'var(--af-space-hand)' }}>
            <h3 style={{
              fontFamily: 'var(--af-font-architect)',
              fontSize: 'var(--af-type-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--af-stone-600)',
              margin: '0 0 var(--af-space-palm)',
            }}>
              Initiative Status
            </h3>
            {reportContent.data.activeInitiatives.map((init) => {
              const progressColor =
                init.progress >= 70 ? 'var(--af-signal-go)' :
                init.progress >= 40 ? 'var(--af-signal-wait)' :
                'var(--af-signal-stop)'

              return (
                <div key={init.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--af-space-hand)',
                  padding: 'var(--af-space-palm) 0',
                  borderBottom: 'var(--af-border-hair) solid var(--af-stone-200)',
                }}>
                  <div className="strategy-owner-badge" style={{ background: init.ownerColor, width: 24, height: 24, fontSize: 10 }}>
                    {init.owner.charAt(0)}
                  </div>
                  <span style={{
                    flex: 1,
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: 'var(--af-type-sm)',
                    fontWeight: 500,
                    color: 'var(--af-stone-700)',
                  }}>
                    {init.title}
                  </span>
                  <div style={{ width: 80 }}>
                    <div className="strategy-progress-track" style={{ height: 4 }}>
                      <div className="strategy-progress-fill" style={{ width: `${init.progress}%`, background: progressColor }} />
                    </div>
                  </div>
                  <span className="strategy-progress-label" style={{ color: progressColor, width: 36, textAlign: 'right' }}>
                    {init.progress}%
                  </span>
                </div>
              )
            })}
          </div>

          {/* Milestones */}
          <div style={{ marginBottom: 'var(--af-space-hand)' }}>
            <h3 style={{
              fontFamily: 'var(--af-font-architect)',
              fontSize: 'var(--af-type-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--af-stone-600)',
              margin: '0 0 var(--af-space-palm)',
            }}>
              At-Risk Milestones ({reportContent.data.atRiskMs.length})
            </h3>
            {reportContent.data.atRiskMs.length === 0 ? (
              <div style={{
                fontFamily: 'var(--af-font-poet)',
                fontStyle: 'italic',
                fontSize: 'var(--af-type-sm)',
                color: 'var(--af-stone-400)',
              }}>
                No at-risk milestones.
              </div>
            ) : (
              reportContent.data.atRiskMs.map((ms) => (
                <div key={ms.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--af-space-palm) 0',
                  borderBottom: 'var(--af-border-hair) solid var(--af-stone-200)',
                }}>
                  <span style={{
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: 'var(--af-type-sm)',
                    fontWeight: 500,
                    color: 'var(--af-stone-700)',
                  }}>
                    {ms.title}
                  </span>
                  <span className={`strategy-status-chip ${ms.status}`}>
                    {getStatusLabel(ms.status)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Blockers */}
          {reportContent.data.blockerUpdates.length > 0 && (
            <div>
              <h3 style={{
                fontFamily: 'var(--af-font-architect)',
                fontSize: 'var(--af-type-xs)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--af-stone-600)',
                margin: '0 0 var(--af-space-palm)',
              }}>
                Reported Blockers
              </h3>
              {reportContent.data.blockerUpdates.map((blocker, i) => (
                <div key={i} className="strategy-blocker-item">
                  <div className="strategy-blocker-icon">!</div>
                  <div className="strategy-blocker-content">
                    <div className="strategy-blocker-title">{blocker.initiative}</div>
                    <div className="strategy-blocker-desc">{blocker.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
