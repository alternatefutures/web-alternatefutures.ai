'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchLatestSnapshots, fetchAllSparklines, formatKPIValue,
  KPI_DEFINITIONS,
  type KPISnapshot, type SparklineData,
} from '@/lib/kpi-api'
import {
  fetchAgentTasks, computeTaskStats, AGENT_PROFILES,
  type AgentTask, type AgentId,
} from '@/lib/agent-tasks-api'
import { fetchOKRs, type OKR } from '@/lib/orchestrator-api'
import { fetchAllInitiatives, type Initiative } from '@/lib/initiative-api'
import {
  PiChartBarBold, PiRobotBold, PiClipboardTextBold,
  PiFlagBold, PiTargetBold, PiMapPinBold,
  PiTrendUpBold, PiTrendDownBold, PiEqualsBold,
  PiArrowRightBold,
} from 'react-icons/pi'
import { getCookieValue } from '@/lib/cookies'
import './dashboard-sub.module.css'

function SparklineSVG({ points, trend, width = 64, height = 24 }: {
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

export default function DashboardIndex() {
  const [snapshots, setSnapshots] = useState<KPISnapshot[]>([])
  const [sparklines, setSparklines] = useState<SparklineData[]>([])
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [okrs, setOkrs] = useState<OKR[]>([])
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [snaps, sparks, tasksData, okrsData, initsData] = await Promise.all([
        fetchLatestSnapshots(token).catch(() => []),
        fetchAllSparklines(token, 14).catch(() => []),
        fetchAgentTasks(token).catch(() => []),
        fetchOKRs(token, { quarter: 'Q1-2026' }).catch(() => []),
        fetchAllInitiatives(token).catch(() => []),
      ])
      setSnapshots(snaps)
      setSparklines(sparks)
      setTasks(tasksData)
      setOkrs(okrsData)
      setInitiatives(initsData)
      setLoading(false)
    }
    load()
  }, [])

  const taskStats = useMemo(() => computeTaskStats(tasks), [tasks])

  const heroKpis = useMemo(() => {
    const keys = ['mrr', 'monthly_active_deployers', 'registered_users', 'community_members']
    return keys.map((key) => {
      const snap = snapshots.find((s) => s.metricKey === key)
      const spark = sparklines.find((s) => s.metricKey === key)
      if (!snap) {
        const def = KPI_DEFINITIONS.find((d) => d.metricKey === key)
        return { key, label: def?.label || key, value: '--', trend: 'FLAT' as const, delta: '0%', sparkPoints: [] }
      }
      return {
        key,
        label: snap.label,
        value: formatKPIValue(snap.value, snap.unit),
        trend: snap.trend,
        delta: `${snap.deltaPercent > 0 ? '+' : ''}${snap.deltaPercent}%`,
        sparkPoints: spark?.points || [],
      }
    })
  }, [snapshots, sparklines])

  const okrSummary = useMemo(() => {
    const total = okrs.length
    const avgProgress = total > 0 ? Math.round(okrs.reduce((s, o) => s + o.progress, 0) / total) : 0
    const atRisk = okrs.filter((o) => o.status === 'AT_RISK').length
    return { total, avgProgress, atRisk }
  }, [okrs])

  const initiativeSummary = useMemo(() => {
    const active = initiatives.filter((i) => i.status === 'active').length
    const avgProgress = initiatives.length > 0
      ? Math.round(initiatives.reduce((s, i) => s + i.progress, 0) / initiatives.length)
      : 0
    return { total: initiatives.length, active, avgProgress }
  }, [initiatives])

  if (loading) {
    return (
      <>
        <div className="dash-sub-header">
          <h1>Dashboards</h1>
        </div>
        <div className="scorecard-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="scorecard-card" style={{ pointerEvents: 'none' }}>
              <div className="skeleton-block" style={{ width: '60%', height: 14, marginBottom: 12 }} />
              <div className="skeleton-block" style={{ width: '40%', height: 28, marginBottom: 8 }} />
              <div className="skeleton-block" style={{ width: '50%', height: 12 }} />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="dash-sub-header">
        <Link href="/admin" className="dash-sub-back">&larr; Executive Dashboard</Link>
        <h1>Dashboards</h1>
      </div>

      {/* Top KPI Strip */}
      <div className="sc-summary-row">
        {heroKpis.map((kpi) => (
          <div key={kpi.key} className="sc-summary-item">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--af-space-breath)', marginBottom: 'var(--af-space-grain)' }}>
              {kpi.sparkPoints.length > 1 && (
                <SparklineSVG points={kpi.sparkPoints} trend={kpi.trend} />
              )}
            </div>
            <span className="sc-summary-count">{kpi.value}</span>
            <span className="sc-summary-label">{kpi.label}</span>
            <div style={{
              fontFamily: 'var(--af-font-machine)',
              fontSize: 11,
              color: kpi.trend === 'UP' ? 'var(--af-signal-go)' : kpi.trend === 'DOWN' ? 'var(--af-signal-stop)' : 'var(--af-stone-400)',
              marginTop: 2,
            }}>
              {kpi.trend === 'UP' ? <PiTrendUpBold style={{ verticalAlign: 'middle', marginRight: 2 }} /> :
               kpi.trend === 'DOWN' ? <PiTrendDownBold style={{ verticalAlign: 'middle', marginRight: 2 }} /> :
               <PiEqualsBold style={{ verticalAlign: 'middle', marginRight: 2 }} />}
              {kpi.delta} WoW
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Cards Grid */}
      <div className="scorecard-grid" style={{ marginBottom: 'var(--af-space-arm)' }}>
        {/* KPI Scorecards */}
        <Link href="/admin/dashboard/scorecards" className="scorecard-card scorecard-card-clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="scorecard-top">
            <span className="scorecard-label"><PiChartBarBold style={{ marginRight: 4 }} /> KPI Scorecards</span>
            <PiArrowRightBold style={{ color: 'var(--af-stone-400)' }} />
          </div>
          <div className="scorecard-value">{snapshots.length}</div>
          <div className="scorecard-target">metrics tracked across {new Set(snapshots.map((s) => s.category)).size} categories</div>
          <div className="scorecard-trend-row">
            <span className="scorecard-category-badge" style={{ marginLeft: 0 }}>
              {snapshots.filter((s) => s.target != null && s.value >= s.target * 0.9).length} on track
            </span>
          </div>
        </Link>

        {/* Agent Tasks */}
        <Link href="/admin/dashboard/agents" className="scorecard-card scorecard-card-clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="scorecard-top">
            <span className="scorecard-label"><PiRobotBold style={{ marginRight: 4 }} /> Agent Activity</span>
            <PiArrowRightBold style={{ color: 'var(--af-stone-400)' }} />
          </div>
          <div className="scorecard-value">{taskStats.total}</div>
          <div className="scorecard-target">
            {taskStats.inProgress} in progress, {taskStats.completed} completed
          </div>
          <div className="scorecard-trend-row">
            {taskStats.failed > 0 && (
              <span style={{ fontSize: 11, fontFamily: 'var(--af-font-machine)', color: 'var(--af-signal-stop)' }}>
                {taskStats.failed} failed
              </span>
            )}
            <span className="scorecard-category-badge" style={{ marginLeft: taskStats.failed > 0 ? 'auto' : 0 }}>
              {Object.values(taskStats.byAgent).filter((a) => a.active > 0).length} active agents
            </span>
          </div>
        </Link>

        {/* GTM Tracker */}
        <Link href="/admin/dashboard/gtm" className="scorecard-card scorecard-card-clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="scorecard-top">
            <span className="scorecard-label"><PiFlagBold style={{ marginRight: 4 }} /> GTM Tracker</span>
            <PiArrowRightBold style={{ color: 'var(--af-stone-400)' }} />
          </div>
          <div className="scorecard-value">H1 2026</div>
          <div className="scorecard-target">Go-to-market milestones and launch phases</div>
          <div className="scorecard-trend-row">
            <span className="scorecard-category-badge" style={{ marginLeft: 0 }}>
              9 milestones
            </span>
          </div>
        </Link>

        {/* Reports */}
        <Link href="/admin/dashboard/reports" className="scorecard-card scorecard-card-clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="scorecard-top">
            <span className="scorecard-label"><PiClipboardTextBold style={{ marginRight: 4 }} /> Reports</span>
            <PiArrowRightBold style={{ color: 'var(--af-stone-400)' }} />
          </div>
          <div className="scorecard-value">Builder</div>
          <div className="scorecard-target">Custom reports with metric selection and export</div>
          <div className="scorecard-trend-row">
            <span className="scorecard-category-badge" style={{ marginLeft: 0 }}>
              CSV / Markdown / PDF
            </span>
          </div>
        </Link>

        {/* OKRs */}
        <Link href="/admin/strategy/okrs" className="scorecard-card scorecard-card-clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="scorecard-top">
            <span className="scorecard-label"><PiTargetBold style={{ marginRight: 4 }} /> OKRs</span>
            <PiArrowRightBold style={{ color: 'var(--af-stone-400)' }} />
          </div>
          <div className="scorecard-value">{okrSummary.avgProgress}%</div>
          <div className="scorecard-target">
            {okrSummary.total} objectives for Q1 2026
          </div>
          <div className="scorecard-trend-row">
            {okrSummary.atRisk > 0 && (
              <span style={{ fontSize: 11, fontFamily: 'var(--af-font-machine)', color: 'var(--af-signal-wait)' }}>
                {okrSummary.atRisk} at risk
              </span>
            )}
            <span className="scorecard-category-badge" style={{ marginLeft: okrSummary.atRisk > 0 ? 'auto' : 0 }}>
              avg progress
            </span>
          </div>
        </Link>

        {/* Initiatives */}
        <Link href="/admin/strategy/initiatives" className="scorecard-card scorecard-card-clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="scorecard-top">
            <span className="scorecard-label"><PiMapPinBold style={{ marginRight: 4 }} /> Initiatives</span>
            <PiArrowRightBold style={{ color: 'var(--af-stone-400)' }} />
          </div>
          <div className="scorecard-value">{initiativeSummary.active}</div>
          <div className="scorecard-target">
            active of {initiativeSummary.total} total, {initiativeSummary.avgProgress}% avg progress
          </div>
          <div className="scorecard-trend-row">
            <span className="scorecard-category-badge" style={{ marginLeft: 0 }}>
              strategic
            </span>
          </div>
        </Link>
      </div>
    </>
  )
}
