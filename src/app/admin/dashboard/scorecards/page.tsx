'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchLatestSnapshots, fetchAllSparklines, fetchKPITimeSeries,
  formatKPIValue, calculateWoWTrend, calculateMoMTrend,
  KPI_DEFINITIONS, SEED_TIME_SERIES,
  type KPISnapshot, type SparklineData, type KPICategory, type KPITrend,
} from '@/lib/kpi-api'
import {
  PiTrendUpBold, PiTrendDownBold, PiEqualsBold,
  PiCaretRightBold, PiXBold, PiTargetBold,
  PiChartLineUpBold, PiArrowLeftBold,
} from 'react-icons/pi'
import { getCookieValue } from '@/lib/cookies'
import '../dashboard-sub.css'

type TimePeriod = '7d' | '30d' | '90d' | 'ytd'

const CATEGORY_LABELS: Record<KPICategory, string> = {
  REVENUE: 'Revenue',
  GROWTH: 'Growth',
  ENGAGEMENT: 'Engagement',
  CONTENT: 'Content',
  COMMUNITY: 'Community',
  DEVELOPER: 'Developer',
  BRAND: 'Brand',
  INFRASTRUCTURE: 'Infrastructure',
}

const PERIOD_LABELS: Record<TimePeriod, string> = {
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
  'ytd': 'Year to Date',
}

function getPeriodDays(period: TimePeriod): number {
  if (period === '7d') return 7
  if (period === '30d') return 30
  if (period === '90d') return 90
  // YTD
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  return Math.ceil((now.getTime() - jan1.getTime()) / 86400000)
}

function SparklineSVG({ points, trend, width = 64, height = 24 }: {
  points: number[]
  trend: KPITrend
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

function AreaChartSVG({ dataPoints, unit, width = 560, height = 180 }: {
  dataPoints: { date: string; value: number }[]
  unit: string
  width?: number
  height?: number
}) {
  if (dataPoints.length < 2) return null
  const values = dataPoints.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = { top: 20, right: 16, bottom: 32, left: 60 }
  const w = width - pad.left - pad.right
  const h = height - pad.top - pad.bottom
  const step = w / (dataPoints.length - 1)

  const pathPoints = dataPoints.map((p, i) => ({
    x: pad.left + i * step,
    y: pad.top + h - ((p.value - min) / range) * h,
  }))

  const linePath = pathPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`).join(' ')
  const areaPath = `${linePath} L${pathPoints[pathPoints.length - 1].x},${pad.top + h} L${pathPoints[0].x},${pad.top + h} Z`

  // Y-axis labels (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = min + (range * i) / 4
    const y = pad.top + h - (i / 4) * h
    return { val, y }
  })

  // X-axis labels (first, middle, last)
  const xLabels = [0, Math.floor(dataPoints.length / 2), dataPoints.length - 1].map((i) => ({
    label: new Date(dataPoints[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    x: pad.left + i * step,
  }))

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--af-ultra)" stopOpacity={0.15} />
          <stop offset="100%" stopColor="var(--af-ultra)" stopOpacity={0.01} />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <line key={i} x1={pad.left} y1={t.y} x2={width - pad.right} y2={t.y}
          stroke="var(--af-stone-200)" strokeWidth={0.5} />
      ))}
      {/* Y-axis labels */}
      {yTicks.map((t, i) => (
        <text key={i} x={pad.left - 8} y={t.y + 4} textAnchor="end"
          fill="var(--af-stone-400)" fontSize={10} fontFamily="var(--af-font-machine)">
          {formatKPIValue(t.val, unit)}
        </text>
      ))}
      {/* X-axis labels */}
      {xLabels.map((l, i) => (
        <text key={i} x={l.x} y={height - 8} textAnchor="middle"
          fill="var(--af-stone-400)" fontSize={10} fontFamily="var(--af-font-machine)">
          {l.label}
        </text>
      ))}
      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="var(--af-ultra)" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots at start and end */}
      <circle cx={pathPoints[0].x} cy={pathPoints[0].y} r={3} fill="var(--af-ultra)" />
      <circle cx={pathPoints[pathPoints.length - 1].x} cy={pathPoints[pathPoints.length - 1].y}
        r={3} fill="var(--af-ultra)" />
    </svg>
  )
}

function ProgressBar({ value, target, unit }: { value: number; target: number; unit: string }) {
  const inverted = ['cac', 'churn_rate'].includes(unit)
  const ratio = inverted ? target / value : value / target
  const pct = Math.min(Math.max(ratio * 100, 0), 120)
  const color = pct >= 90 ? 'var(--af-signal-go)' : pct >= 70 ? 'var(--af-signal-wait)' : 'var(--af-signal-stop)'

  return (
    <div className="sc-progress-wrap">
      <div className="sc-progress-track">
        <div className="sc-progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
        {/* Target marker at 100% */}
        <div className="sc-progress-marker" />
      </div>
      <div className="sc-progress-labels">
        <span>{Math.round(pct)}% of target</span>
      </div>
    </div>
  )
}

function getStatus(snap: KPISnapshot): 'on-track' | 'at-risk' | 'behind' {
  if (!snap.target) return 'on-track'
  const inverted = ['cac', 'churn_rate'].includes(snap.metricKey)
  const ratio = inverted ? snap.target / snap.value : snap.value / snap.target
  if (ratio >= 0.9) return 'on-track'
  if (ratio >= 0.7) return 'at-risk'
  return 'behind'
}

// ---- Drill-Down Drawer ----
function DrillDownPanel({ snap, sparkData, onClose }: {
  snap: KPISnapshot
  sparkData: SparklineData | undefined
  onClose: () => void
}) {
  const [period, setPeriod] = useState<TimePeriod>('30d')
  const def = KPI_DEFINITIONS.find((d) => d.metricKey === snap.metricKey)
  const status = getStatus(snap)

  const timeSeries = useMemo(() => {
    const series = SEED_TIME_SERIES[snap.metricKey]
    if (!series) return []
    const days = getPeriodDays(period)
    return series.slice(-days)
  }, [snap.metricKey, period])

  const wowTrend = useMemo(() => calculateWoWTrend(timeSeries), [timeSeries])
  const momTrend = useMemo(() => calculateMoMTrend(timeSeries), [timeSeries])

  return (
    <div className="sc-drilldown-overlay" onClick={onClose}>
      <div className="sc-drilldown-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sc-drilldown-header">
          <div>
            <span className="scorecard-status-chip" data-status={status} style={{ marginRight: 8 }}>
              {status.replace('-', ' ')}
            </span>
            <h2>{snap.label}</h2>
            {def && <p className="sc-drilldown-desc">{def.description}</p>}
          </div>
          <button className="sc-drilldown-close" onClick={onClose}><PiXBold /></button>
        </div>

        {/* Period selector */}
        <div className="sc-period-tabs">
          {(Object.keys(PERIOD_LABELS) as TimePeriod[]).map((p) => (
            <button key={p}
              className={`sc-period-tab${period === p ? ' active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Big value + comparison */}
        <div className="sc-drilldown-hero">
          <div className="sc-drilldown-value">{formatKPIValue(snap.value, snap.unit)}</div>
          {snap.target != null && (
            <div className="sc-drilldown-target">
              <PiTargetBold style={{ marginRight: 4 }} />
              Target: {formatKPIValue(snap.target, snap.unit)}
            </div>
          )}
        </div>

        {/* Target progress bar */}
        {snap.target != null && (
          <ProgressBar value={snap.value} target={snap.target} unit={snap.metricKey} />
        )}

        {/* Area chart */}
        {timeSeries.length > 1 && (
          <div className="sc-drilldown-chart">
            <AreaChartSVG dataPoints={timeSeries} unit={snap.unit} />
          </div>
        )}

        {/* Trend comparisons */}
        <div className="sc-drilldown-trends">
          {wowTrend && (
            <div className="sc-trend-card">
              <div className="sc-trend-card-label">Week over Week</div>
              <div className={`sc-trend-card-value ${wowTrend.direction.toLowerCase()}`}>
                {wowTrend.percentChange > 0 ? '+' : ''}{wowTrend.percentChange}%
              </div>
              <div className="sc-trend-card-detail">
                {formatKPIValue(wowTrend.previousValue, snap.unit)} &rarr; {formatKPIValue(wowTrend.currentValue, snap.unit)}
              </div>
            </div>
          )}
          {momTrend && (
            <div className="sc-trend-card">
              <div className="sc-trend-card-label">Month over Month</div>
              <div className={`sc-trend-card-value ${momTrend.direction.toLowerCase()}`}>
                {momTrend.percentChange > 0 ? '+' : ''}{momTrend.percentChange}%
              </div>
              <div className="sc-trend-card-detail">
                {formatKPIValue(momTrend.previousValue, snap.unit)} &rarr; {formatKPIValue(momTrend.currentValue, snap.unit)}
              </div>
            </div>
          )}
          <div className="sc-trend-card">
            <div className="sc-trend-card-label">Category</div>
            <div className="sc-trend-card-value" style={{ color: 'var(--af-ultra)' }}>
              {CATEGORY_LABELS[snap.category]}
            </div>
            <div className="sc-trend-card-detail">
              Source: {def?.source || 'internal'}
            </div>
          </div>
        </div>

        {/* Alert threshold info */}
        {def?.alertThreshold != null && (
          <div className="sc-drilldown-alert-info">
            Alert threshold: {formatKPIValue(def.alertThreshold, snap.unit)}
            {snap.value < def.alertThreshold && !['cac', 'churn_rate'].includes(snap.metricKey) && (
              <span className="sc-alert-breached"> — Currently below threshold</span>
            )}
            {snap.value > def.alertThreshold && ['cac', 'churn_rate'].includes(snap.metricKey) && (
              <span className="sc-alert-breached"> — Currently above threshold</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function KPIScorecards() {
  const [snapshots, setSnapshots] = useState<KPISnapshot[]>([])
  const [sparklines, setSparklines] = useState<SparklineData[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<KPICategory | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')
  const [selectedKPI, setSelectedKPI] = useState<KPISnapshot | null>(null)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [snaps, sparks] = await Promise.all([
        fetchLatestSnapshots(token).catch(() => []),
        fetchAllSparklines(token, getPeriodDays(timePeriod)).catch(() => []),
      ])
      setSnapshots(snaps)
      setSparklines(sparks)
      setLoading(false)
    }
    load()
  }, [timePeriod])

  const filtered = useMemo(() => {
    let items = snapshots
    if (categoryFilter !== 'ALL') {
      items = items.filter((s) => s.category === categoryFilter)
    }
    if (statusFilter !== 'ALL') {
      items = items.filter((s) => getStatus(s) === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((s) => s.label.toLowerCase().includes(q) || s.metricKey.toLowerCase().includes(q))
    }
    return items
  }, [snapshots, categoryFilter, statusFilter, search])

  // Summary stats
  const summaryStats = useMemo(() => {
    const total = snapshots.length
    const onTrack = snapshots.filter((s) => getStatus(s) === 'on-track').length
    const atRisk = snapshots.filter((s) => getStatus(s) === 'at-risk').length
    const behind = snapshots.filter((s) => getStatus(s) === 'behind').length
    return { total, onTrack, atRisk, behind }
  }, [snapshots])

  return (
    <>
      <div className="dash-sub-header">
        <Link href="/admin" className="dash-sub-back"><PiArrowLeftBold style={{ marginRight: 4 }} /> Dashboard</Link>
        <h1>KPI Scorecards</h1>
      </div>

      {/* Summary row */}
      {!loading && (
        <div className="sc-summary-row">
          <div className="sc-summary-item">
            <span className="sc-summary-count">{summaryStats.total}</span>
            <span className="sc-summary-label">Total Metrics</span>
          </div>
          <div className="sc-summary-item" data-status="on-track">
            <span className="sc-summary-count">{summaryStats.onTrack}</span>
            <span className="sc-summary-label">On Track</span>
          </div>
          <div className="sc-summary-item" data-status="at-risk">
            <span className="sc-summary-count">{summaryStats.atRisk}</span>
            <span className="sc-summary-label">At Risk</span>
          </div>
          <div className="sc-summary-item" data-status="behind">
            <span className="sc-summary-count">{summaryStats.behind}</span>
            <span className="sc-summary-label">Behind</span>
          </div>
        </div>
      )}

      <div className="dash-sub-filters">
        <select
          className="dash-sub-select"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
        >
          {(Object.keys(PERIOD_LABELS) as TimePeriod[]).map((p) => (
            <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
          ))}
        </select>
        <select
          className="dash-sub-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as KPICategory | 'ALL')}
        >
          <option value="ALL">All Categories</option>
          {(Object.keys(CATEGORY_LABELS) as KPICategory[]).map((cat) => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
        <select
          className="dash-sub-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="on-track">On Track</option>
          <option value="at-risk">At Risk</option>
          <option value="behind">Behind</option>
        </select>
        <input
          className="dash-sub-search"
          type="text"
          placeholder="Search metrics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="scorecard-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="scorecard-card" style={{ pointerEvents: 'none' }}>
              <div className="skeleton-block" style={{ width: '60%', height: 12, marginBottom: 12 }} />
              <div className="skeleton-block" style={{ width: '40%', height: 32, marginBottom: 8 }} />
              <div className="skeleton-block" style={{ width: '50%', height: 12 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="scorecard-grid">
          {filtered.map((snap) => {
            const status = getStatus(snap)
            const spark = sparklines.find((s) => s.metricKey === snap.metricKey)
            return (
              <div key={snap.id}
                className="scorecard-card scorecard-card-clickable"
                data-status={status}
                onClick={() => setSelectedKPI(snap)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelectedKPI(snap) }}
              >
                <div className="scorecard-top">
                  <span className="scorecard-label">{snap.label}</span>
                  <span className="scorecard-status-chip" data-status={status}>
                    {status.replace('-', ' ')}
                  </span>
                </div>
                <div className="scorecard-value">{formatKPIValue(snap.value, snap.unit)}</div>
                {snap.target != null && (
                  <>
                    <div className="scorecard-target">
                      Target: {formatKPIValue(snap.target, snap.unit)}
                    </div>
                    <ProgressBar value={snap.value} target={snap.target} unit={snap.metricKey} />
                  </>
                )}
                <div className="scorecard-trend-row">
                  {spark && spark.points.length > 1 && (
                    <SparklineSVG points={spark.points} trend={snap.trend} />
                  )}
                  <span className={`scorecard-trend ${snap.trend.toLowerCase()}`}>
                    <span style={{ fontSize: 14, lineHeight: 1 }}>
                      {snap.trend === 'UP' ? <PiTrendUpBold /> : snap.trend === 'DOWN' ? <PiTrendDownBold /> : <PiEqualsBold />}
                    </span>
                    {snap.deltaPercent > 0 ? '+' : ''}{snap.deltaPercent}%
                  </span>
                  <span className="scorecard-category-badge">{CATEGORY_LABELS[snap.category]}</span>
                  <PiCaretRightBold className="scorecard-drill-icon" />
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="dashboard-admin-section-empty" style={{ gridColumn: '1 / -1' }}>
              No metrics match your filters.
            </div>
          )}
        </div>
      )}

      {/* Drill-down panel */}
      {selectedKPI && (
        <DrillDownPanel
          snap={selectedKPI}
          sparkData={sparklines.find((s) => s.metricKey === selectedKPI.metricKey)}
          onClose={() => setSelectedKPI(null)}
        />
      )}
    </>
  )
}
