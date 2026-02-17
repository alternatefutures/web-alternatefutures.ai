'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { fetchAllPosts, type BlogPost } from '@/lib/blog-api'
import { fetchAllSocialPosts, type SocialMediaPost } from '@/lib/social-api'
import { fetchAllEvents, getEventTypeColor, getEventTypeLabel, type MarketingEvent } from '@/lib/calendar-api'
import {
  fetchLatestSnapshots, fetchAllSparklines, formatKPIValue,
  getTrendArrow, getTrendColor, generateSparkline,
  SEED_TIME_SERIES, KPI_DEFINITIONS,
  type KPISnapshot, type SparklineData,
} from '@/lib/kpi-api'
import {
  fetchAgentTasks, computeTaskStats, AGENT_PROFILES,
  type AgentTask, type AgentId,
} from '@/lib/agent-tasks-api'
import {
  PiArticleBold, PiMegaphoneBold, PiPenNibBold, PiPaperPlaneRightBold,
  PiArrowsClockwiseBold, PiCalendarPlusBold, PiTrendUpBold,
  PiTrendDownBold, PiEqualsBold, PiWarningBold,
  PiWarningCircleBold, PiInfoBold, PiCheckCircleBold,
  PiRobotBold, PiLightningBold, PiChartLineUpBold,
  PiChartBarBold, PiFileTextBold, PiClipboardTextBold,
  PiCurrencyDollarBold, PiUsersThreeBold, PiRocketBold,
  PiShieldCheckBold, PiFlagBold, PiCalendarBlankBold,
  PiCaretRightBold, PiEyeBold, PiStarBold,
} from 'react-icons/pi'
import { getCookieValue } from '@/lib/cookies'
import { ConstellationField, WaveDivider } from '@/components/admin/ShapeDecoration'
import './exec-dashboard.css'
import './dashboard-admin.css'

// --- Sparkline SVG ---
function SparklineSVG({ points, trend, width = 80, height = 28 }: {
  points: number[]
  trend: 'UP' | 'DOWN' | 'FLAT'
  width?: number
  height?: number
}) {
  if (points.length < 2) return null
  const pad = 2
  const w = width - pad * 2
  const h = height - pad * 2
  const step = w / (points.length - 1)
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${pad + i * step},${pad + h - p * h}`)
    .join(' ')
  const color = trend === 'UP' ? 'var(--af-signal-go)'
    : trend === 'DOWN' ? 'var(--af-signal-stop)'
    : 'var(--af-stone-400)'

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// --- Helpers ---
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// --- GTM Milestone Data ---
const GTM_MILESTONES = [
  { id: 'dev-tools', label: 'Developer Tools', progress: 65, color: 'var(--af-ultra)', owner: 'Senku', dueDate: '2026-03-31' },
  { id: 'web3', label: 'Web3 & DePIN', progress: 45, color: 'var(--af-patina)', owner: 'Atlas', dueDate: '2026-04-30' },
  { id: 'ai-agents', label: 'AI Agent Hosting', progress: 30, color: 'var(--af-terra)', owner: 'Lain', dueDate: '2026-05-31' },
  { id: 'enterprise', label: 'Enterprise Onboarding', progress: 15, color: 'var(--af-ai-hanada)', owner: 'Echo', dueDate: '2026-06-30' },
  { id: 'marketplace', label: 'Template Marketplace', progress: 10, color: 'var(--af-kin-repair)', owner: 'Yusuke', dueDate: '2026-06-30' },
]

// --- Human Oversight Seed ---
const PENDING_APPROVALS = [
  { id: 'pa-1', type: 'content', title: 'Blog: "Decentralized AI Agents on AF"', agent: 'content-writer' as AgentId, submittedAt: '2026-02-15T08:30:00Z' },
  { id: 'pa-2', type: 'brand', title: 'Social campaign: Q1 launch batch', agent: 'brand-guardian' as AgentId, submittedAt: '2026-02-15T07:00:00Z' },
  { id: 'pa-3', type: 'partnership', title: 'Akash co-marketing proposal', agent: 'partnerships' as AgentId, submittedAt: '2026-02-14T16:00:00Z' },
]

const CEO_DECISIONS = [
  { id: 'cd-1', decision: 'Approved', title: 'Pricing page update — Pro tier', timestamp: '2026-02-14T22:00:00Z' },
  { id: 'cd-2', decision: 'Rejected', title: 'Sponsorship: DevConf 2026', timestamp: '2026-02-14T18:00:00Z' },
  { id: 'cd-3', decision: 'Approved', title: 'Brand refresh: logo color variant', timestamp: '2026-02-13T14:00:00Z' },
]

// --- Skeleton ---
function DashboardSkeleton() {
  return (
    <>
      <div className="dashboard-admin-header"><h1>Executive Dashboard</h1></div>
      <div className="exec-kpi-row">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="exec-kpi-card" style={{ pointerEvents: 'none' }}>
            <div className="exec-kpi-top">
              <div className="skeleton-block" style={{ width: '60%', height: 12 }} />
              <div className="skeleton-block" style={{ width: 36, height: 36, borderRadius: 8 }} />
            </div>
            <div className="skeleton-block" style={{ width: '40%', height: 36, marginBottom: 8 }} />
            <div className="skeleton-block" style={{ width: '50%', height: 12 }} />
          </div>
        ))}
      </div>
      <div className="exec-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="exec-section">
            <div className="exec-section-header">
              <div className="skeleton-block" style={{ width: '40%', height: 12 }} />
            </div>
            <div style={{ padding: 16 }}>
              {[1, 2, 3].map((j) => (
                <div key={j} style={{ padding: '10px 0', borderBottom: '1px solid var(--af-stone-200)' }}>
                  <div className="skeleton-block" style={{ width: '80%', height: 14, marginBottom: 6 }} />
                  <div className="skeleton-block" style={{ width: '50%', height: 11 }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// --- Alert Item ---
function AlertItem({ alert }: { alert: { id: string; severity: string; title: string; description: string; timestamp: string } }) {
  const icons: Record<string, React.ReactNode> = {
    critical: <PiWarningBold />,
    warning: <PiWarningCircleBold />,
    info: <PiInfoBold />,
    success: <PiCheckCircleBold />,
  }

  return (
    <div className={`exec-alert-item ${alert.severity}`}>
      <span className="exec-alert-icon">{icons[alert.severity] || <PiInfoBold />}</span>
      <div className="exec-alert-body">
        <div className="exec-alert-title">{alert.title}</div>
        <div className="exec-alert-desc">{alert.description}</div>
        <div className="exec-alert-time">{timeAgo(alert.timestamp)}</div>
      </div>
    </div>
  )
}

// --- Main Component ---
export default function ExecDashboard() {
  const [kpiSnapshots, setKpiSnapshots] = useState<KPISnapshot[]>([])
  const [sparklines, setSparklines] = useState<SparklineData[]>([])
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([])
  const [events, setEvents] = useState<MarketingEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [snapshots, sparks, tasks, eventsData] = await Promise.all([
        fetchLatestSnapshots(token).catch(() => []),
        fetchAllSparklines(token, 14).catch(() => []),
        fetchAgentTasks(token).catch(() => []),
        fetchAllEvents(token).catch(() => []),
      ])
      setKpiSnapshots(snapshots)
      setSparklines(sparks)
      setAgentTasks(tasks)
      setEvents(eventsData)
      setLoading(false)
    }
    load()
  }, [])

  // Top-level KPI cards (6 cards: MRR, Active Users, Deploys, Community, Content, Brand Score)
  const heroKpis = useMemo(() => {
    const kpiIcons: Record<string, React.ReactNode> = {
      mrr: <PiCurrencyDollarBold />,
      monthly_active_deployers: <PiRocketBold />,
      registered_users: <PiUsersThreeBold />,
      community_members: <PiUsersThreeBold />,
      blog_traffic: <PiArticleBold />,
      brand_compliance_score: <PiShieldCheckBold />,
    }
    const heroKeys = ['mrr', 'monthly_active_deployers', 'registered_users', 'community_members', 'blog_traffic', 'brand_compliance_score']
    return heroKeys.map((key) => {
      const snap = kpiSnapshots.find((s) => s.metricKey === key)
      const spark = sparklines.find((s) => s.metricKey === key)
      if (!snap) {
        const def = KPI_DEFINITIONS.find((d) => d.metricKey === key)
        return { key, label: def?.label || key, value: '--', trend: 'FLAT' as const, delta: '0%', sparkPoints: [], icon: kpiIcons[key] || <PiChartBarBold /> }
      }
      return {
        key,
        label: snap.label,
        value: formatKPIValue(snap.value, snap.unit),
        trend: snap.trend,
        delta: `${snap.deltaPercent > 0 ? '+' : ''}${snap.deltaPercent}%`,
        sparkPoints: spark?.points || [],
        icon: kpiIcons[key] || <PiChartBarBold />,
      }
    })
  }, [kpiSnapshots, sparklines])

  // Agent task stats
  const taskStats = useMemo(() => computeTaskStats(agentTasks), [agentTasks])

  // Recent agent activity
  const recentTasks = useMemo(() =>
    [...agentTasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6),
    [agentTasks],
  )

  // Alerts
  const alerts = useMemo(() => {
    const items: { id: string; severity: string; title: string; description: string; timestamp: string }[] = []
    const now = new Date().toISOString()

    // KPI alert thresholds
    for (const snap of kpiSnapshots) {
      const def = KPI_DEFINITIONS.find((d) => d.metricKey === snap.metricKey)
      if (def?.alertThreshold != null) {
        const inverted = ['cac', 'churn_rate'].includes(snap.metricKey)
        const breached = inverted ? snap.value > def.alertThreshold : snap.value < def.alertThreshold
        if (breached) {
          items.push({
            id: `kpi-alert-${snap.metricKey}`,
            severity: 'warning',
            title: `${snap.label} below threshold`,
            description: `Current: ${formatKPIValue(snap.value, snap.unit)}, threshold: ${formatKPIValue(def.alertThreshold, snap.unit)}`,
            timestamp: now,
          })
        }
      }
    }

    // Failed agent tasks
    if (taskStats.failed > 0) {
      items.push({
        id: 'failed-tasks',
        severity: 'critical',
        title: `${taskStats.failed} failed agent task${taskStats.failed > 1 ? 's' : ''}`,
        description: 'Review failed tasks in the agent activity feed.',
        timestamp: now,
      })
    }

    // Blocked tasks
    if (taskStats.blocked > 0) {
      items.push({
        id: 'blocked-tasks',
        severity: 'warning',
        title: `${taskStats.blocked} blocked task${taskStats.blocked > 1 ? 's' : ''}`,
        description: 'Tasks waiting on dependencies.',
        timestamp: now,
      })
    }

    if (items.length === 0) {
      items.push({ id: 'all-clear', severity: 'success', title: 'All systems nominal', description: 'No issues detected across operations.', timestamp: now })
    }

    return items
  }, [kpiSnapshots, taskStats])

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return events
      .filter((e) => new Date(e.startDate) >= now && e.status !== 'CANCELED')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5)
  }, [events])

  if (loading) return <DashboardSkeleton />

  return (
    <>
      {/* Header */}
      <div className="dashboard-admin-header">
        <ConstellationField />
        <h1>Executive Dashboard</h1>
      </div>

      {/* KPI Row — 6 cards with sparklines */}
      <div className="exec-kpi-row">
        {heroKpis.map((kpi) => (
          <div key={kpi.key} className="exec-kpi-card">
            <div className="exec-kpi-top">
              <span className="exec-kpi-label">{kpi.label}</span>
              <span className="exec-kpi-icon">{kpi.icon}</span>
            </div>
            <div className="exec-kpi-value">{kpi.value}</div>
            <div className="exec-kpi-sparkline-row">
              {kpi.sparkPoints.length > 1 && (
                <SparklineSVG points={kpi.sparkPoints} trend={kpi.trend} />
              )}
              <span className={`exec-kpi-trend ${kpi.trend.toLowerCase()}`}>
                <span className="exec-kpi-trend-icon">
                  {kpi.trend === 'UP' ? <PiTrendUpBold /> : kpi.trend === 'DOWN' ? <PiTrendDownBold /> : <PiEqualsBold />}
                </span>
                {kpi.delta} WoW
              </span>
            </div>
          </div>
        ))}
      </div>

      <WaveDivider variant="sky" />

      {/* Three-column grid */}
      <div className="exec-grid">
        {/* Column 1: Agent Activity Feed */}
        <div className="exec-section">
          <div className="exec-section-header">
            <h2>Agent Activity</h2>
            <Link href="/admin/dashboard/agents" className="exec-section-link">
              View all &rarr;
            </Link>
          </div>
          <div className="exec-section-body">
            {recentTasks.length === 0 ? (
              <div className="dashboard-admin-section-empty">
                No recent agent activity.
              </div>
            ) : (
              <div className="exec-activity-list">
                {recentTasks.map((task) => {
                  const profile = AGENT_PROFILES[task.assignedTo]
                  const statusColors: Record<string, { bg: string; color: string }> = {
                    COMPLETED: { bg: '#D1FAE5', color: '#065F46' },
                    IN_PROGRESS: { bg: '#DBEAFE', color: '#1E40AF' },
                    QUEUED: { bg: '#FEF3C7', color: '#92400E' },
                    FAILED: { bg: '#FEE2E2', color: '#991B1B' },
                    BLOCKED: { bg: '#F3E8FF', color: '#6B21A8' },
                    CANCELLED: { bg: '#F3F4F6', color: '#6B7280' },
                  }
                  const sc = statusColors[task.status] || statusColors.QUEUED
                  return (
                    <div key={task.id} className="exec-activity-item">
                      <div className="exec-activity-avatar" style={{ background: profile?.color || 'var(--af-stone-500)' }}>
                        {(profile?.name || task.assignedTo).slice(0, 2)}
                      </div>
                      <div className="exec-activity-body">
                        <div className="exec-activity-text">
                          <strong>{profile?.name || task.assignedTo}</strong>{' '}
                          {task.title}
                          <span className="exec-activity-badge" style={{ background: sc.bg, color: sc.color }}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="exec-activity-time">{timeAgo(task.updatedAt)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: GTM Milestones + Content Pipeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--af-space-arm)' }}>
          {/* GTM Milestones */}
          <div className="exec-section">
            <div className="exec-section-header">
              <h2>GTM Milestones — H1 2026</h2>
              <Link href="/admin/dashboard/gtm" className="exec-section-link">
                Full tracker &rarr;
              </Link>
            </div>
            <div className="exec-pipeline-list">
              {GTM_MILESTONES.map((m) => (
                <div key={m.id} className="exec-pipeline-item">
                  <span className="exec-pipeline-label">{m.label}</span>
                  <div className="exec-pipeline-bar-track">
                    <div
                      className="exec-pipeline-bar-fill"
                      style={{ width: `${m.progress}%`, background: m.color }}
                    />
                  </div>
                  <span className="exec-pipeline-count">{m.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="exec-section">
            <div className="exec-section-header">
              <h2>Upcoming Events</h2>
              <Link href="/admin/calendar" className="exec-section-link">
                View all &rarr;
              </Link>
            </div>
            <div className="exec-section-body">
              {upcomingEvents.length === 0 ? (
                <div className="dashboard-admin-section-empty">
                  No upcoming events scheduled.
                </div>
              ) : (
                <div className="dashboard-admin-events-list">
                  {upcomingEvents.map((evt) => (
                    <Link key={evt.id} href="/admin/calendar" className="dashboard-admin-event-item">
                      <div className="dashboard-admin-event-color" style={{ background: evt.color || getEventTypeColor(evt.eventType) }} />
                      <div className="dashboard-admin-event-info">
                        <div className="dashboard-admin-event-title">{evt.title}</div>
                        <div className="dashboard-admin-event-meta">
                          {formatDate(evt.startDate)} &middot; {getEventTypeLabel(evt.eventType)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Human Oversight + Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--af-space-arm)' }}>
          {/* Human Oversight — BF-SO-007 */}
          <div className="exec-section">
            <div className="exec-section-header">
              <h2>Pending Approvals</h2>
              <span className="exec-oversight-badge">{PENDING_APPROVALS.length}</span>
            </div>
            <div className="exec-section-body">
              {PENDING_APPROVALS.map((item) => {
                const profile = AGENT_PROFILES[item.agent]
                return (
                  <div key={item.id} className="exec-approval-item">
                    <div className="exec-approval-type" data-type={item.type}>
                      {item.type === 'content' ? <PiFileTextBold /> : item.type === 'brand' ? <PiShieldCheckBold /> : <PiUsersThreeBold />}
                    </div>
                    <div className="exec-approval-body">
                      <div className="exec-approval-title">{item.title}</div>
                      <div className="exec-approval-meta">
                        From {profile?.name || item.agent} &middot; {timeAgo(item.submittedAt)}
                      </div>
                    </div>
                    <PiCaretRightBold className="exec-approval-chevron" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* CEO Decision Log */}
          <div className="exec-section">
            <div className="exec-section-header">
              <h2>Recent Decisions</h2>
            </div>
            <div className="exec-section-body">
              {CEO_DECISIONS.map((d) => (
                <div key={d.id} className="exec-decision-item">
                  <span className={`exec-decision-dot ${d.decision.toLowerCase()}`} />
                  <div className="exec-decision-body">
                    <div className="exec-decision-text">
                      <span className={`exec-decision-badge ${d.decision.toLowerCase()}`}>{d.decision}</span>
                      {d.title}
                    </div>
                    <div className="exec-decision-time">{timeAgo(d.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="exec-section">
            <div className="exec-section-header">
              <h2>Alerts</h2>
            </div>
            <div className="exec-alert-list">
              {alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <WaveDivider variant="apricot" flip />

      {/* Quick Actions Row */}
      <div className="dashboard-admin-section" style={{ marginTop: 'var(--af-space-arm)' }}>
        <div className="dashboard-admin-section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="dashboard-admin-quick-actions">
          <Link href="/admin/dashboard/scorecards" className="dashboard-admin-quick-action">
            <span className="dashboard-admin-quick-icon"><PiChartBarBold /></span>
            KPI Scorecards
          </Link>
          <Link href="/admin/dashboard/agents" className="dashboard-admin-quick-action">
            <span className="dashboard-admin-quick-icon"><PiRobotBold /></span>
            Agent Tasks
          </Link>
          <Link href="/admin/dashboard/reports" className="dashboard-admin-quick-action">
            <span className="dashboard-admin-quick-icon"><PiClipboardTextBold /></span>
            Weekly Report
          </Link>
          <Link href="/admin/blog/new" className="dashboard-admin-quick-action">
            <span className="dashboard-admin-quick-icon"><PiPenNibBold /></span>
            New Blog Post
          </Link>
          <Link href="/admin/social/composer" className="dashboard-admin-quick-action">
            <span className="dashboard-admin-quick-icon"><PiPaperPlaneRightBold /></span>
            New Social Post
          </Link>
          <Link href="/admin/dashboard/gtm" className="dashboard-admin-quick-action">
            <span className="dashboard-admin-quick-icon"><PiFlagBold /></span>
            GTM Tracker
          </Link>
        </div>
      </div>
    </>
  )
}
