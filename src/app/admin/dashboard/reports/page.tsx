'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchLatestSnapshots, fetchAllSparklines, formatKPIValue,
  KPI_DEFINITIONS, SEED_TIME_SERIES,
  type KPISnapshot, type KPICategory, type SparklineData,
} from '@/lib/kpi-api'
import {
  fetchAgentTasks, computeTaskStats, AGENT_PROFILES,
  type AgentTask,
} from '@/lib/agent-tasks-api'
import {
  PiArrowLeftBold, PiDownloadSimpleBold, PiPrinterBold,
  PiFloppyDiskBold, PiCalendarBlankBold, PiPlusBold,
  PiTrashBold, PiClockBold,
} from 'react-icons/pi'
import { getCookieValue } from '@/lib/cookies'
import '../dashboard-sub.module.css'

type ReportMetric = {
  key: string
  label: string
  selected: boolean
}

type DateRange = '1w' | '2w' | '1m' | '3m' | 'custom'
type Grouping = 'category' | 'none' | 'status'

interface SavedTemplate {
  id: string
  name: string
  metrics: string[]
  dateRange: DateRange
  grouping: Grouping
  createdAt: string
}

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  '1w': 'Last Week',
  '2w': 'Last 2 Weeks',
  '1m': 'Last Month',
  '3m': 'Last Quarter',
  'custom': 'Custom',
}

const CATEGORY_LABELS: Record<string, string> = {
  REVENUE: 'Revenue Metrics',
  GROWTH: 'Growth Metrics',
  ENGAGEMENT: 'Engagement',
  CONTENT: 'Content Performance',
  COMMUNITY: 'Community Growth',
  DEVELOPER: 'Developer Metrics',
  BRAND: 'Brand Health',
  INFRASTRUCTURE: 'Infrastructure',
}

function getDateRange(range: DateRange): { start: string; end: string; label: string } {
  const now = new Date()
  const end = now.toISOString().split('T')[0]
  let start: Date

  switch (range) {
    case '1w':
      start = new Date(now.getTime() - 7 * 86400000)
      break
    case '2w':
      start = new Date(now.getTime() - 14 * 86400000)
      break
    case '1m':
      start = new Date(now.getTime() - 30 * 86400000)
      break
    case '3m':
      start = new Date(now.getTime() - 90 * 86400000)
      break
    default:
      start = new Date(now.getTime() - 7 * 86400000)
  }

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return {
    start: start.toISOString().split('T')[0],
    end,
    label: `${fmt(start)} — ${fmt(now)}, ${now.getFullYear()}`,
  }
}

const SEED_TEMPLATES: SavedTemplate[] = [
  { id: 'tpl-1', name: 'Weekly Executive Summary', metrics: ['mrr', 'monthly_active_deployers', 'registered_users', 'activation_rate', 'churn_rate'], dateRange: '1w', grouping: 'category', createdAt: '2026-02-01' },
  { id: 'tpl-2', name: 'Growth Dashboard', metrics: ['registered_users', 'monthly_active_deployers', 'activation_rate', 'community_members', 'social_followers'], dateRange: '1m', grouping: 'none', createdAt: '2026-02-05' },
  { id: 'tpl-3', name: 'Revenue Report', metrics: ['mrr', 'paying_customers', 'cac', 'ltv', 'churn_rate'], dateRange: '1m', grouping: 'category', createdAt: '2026-02-08' },
]

export default function ReportBuilder() {
  const [snapshots, setSnapshots] = useState<KPISnapshot[]>([])
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [loading, setLoading] = useState(true)

  // Builder state
  const [dateRange, setDateRange] = useState<DateRange>('1w')
  const [grouping, setGrouping] = useState<Grouping>('category')
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(['mrr', 'monthly_active_deployers', 'registered_users', 'activation_rate', 'churn_rate', 'community_members']))
  const [includeAgents, setIncludeAgents] = useState(true)
  const [includeActions, setIncludeActions] = useState(true)

  // Templates
  const [templates, setTemplates] = useState<SavedTemplate[]>(SEED_TEMPLATES)
  const [templateName, setTemplateName] = useState('')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)

  // View mode
  const [viewMode, setViewMode] = useState<'builder' | 'preview'>('builder')

  const range = useMemo(() => getDateRange(dateRange), [dateRange])

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [snaps, tasksData] = await Promise.all([
        fetchLatestSnapshots(token).catch(() => []),
        fetchAgentTasks(token).catch(() => []),
      ])
      setSnapshots(snaps)
      setTasks(tasksData)
      setLoading(false)
    }
    load()
  }, [])

  const taskStats = useMemo(() => computeTaskStats(tasks), [tasks])

  const availableMetrics: ReportMetric[] = useMemo(() =>
    KPI_DEFINITIONS.map((d) => ({
      key: d.metricKey,
      label: d.label,
      selected: selectedMetrics.has(d.metricKey),
    })),
    [selectedMetrics],
  )

  const filteredSnapshots = useMemo(() =>
    snapshots.filter((s) => selectedMetrics.has(s.metricKey)),
    [snapshots, selectedMetrics],
  )

  const kpisByCategory = useMemo(() => {
    if (grouping !== 'category') return { 'All Metrics': filteredSnapshots }
    const groups: Record<string, KPISnapshot[]> = {}
    for (const snap of filteredSnapshots) {
      const label = CATEGORY_LABELS[snap.category] || snap.category
      if (!groups[label]) groups[label] = []
      groups[label].push(snap)
    }
    return groups
  }, [filteredSnapshots, grouping])

  const actionItems = useMemo(() => {
    const items: string[] = []
    for (const snap of filteredSnapshots) {
      const def = KPI_DEFINITIONS.find((d) => d.metricKey === snap.metricKey)
      if (def?.alertThreshold != null) {
        const inverted = ['cac', 'churn_rate'].includes(snap.metricKey)
        const breached = inverted ? snap.value > def.alertThreshold : snap.value < def.alertThreshold
        if (breached) {
          items.push(`${snap.label} is ${inverted ? 'above' : 'below'} threshold (${formatKPIValue(snap.value, snap.unit)} vs ${formatKPIValue(def.alertThreshold, snap.unit)}).`)
        }
      }
    }
    if (taskStats.failed > 0) items.push(`Review ${taskStats.failed} failed agent task(s).`)
    if (taskStats.blocked > 0) items.push(`Unblock ${taskStats.blocked} blocked task(s).`)
    if (items.length === 0) {
      items.push('All selected KPIs on track. Continue current trajectory.')
    }
    return items
  }, [filteredSnapshots, taskStats])

  const toggleMetric = useCallback((key: string) => {
    setSelectedMetrics((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const selectAllMetrics = useCallback(() => {
    setSelectedMetrics(new Set(KPI_DEFINITIONS.map((d) => d.metricKey)))
  }, [])

  const clearAllMetrics = useCallback(() => {
    setSelectedMetrics(new Set())
  }, [])

  const loadTemplate = useCallback((tpl: SavedTemplate) => {
    setSelectedMetrics(new Set(tpl.metrics))
    setDateRange(tpl.dateRange)
    setGrouping(tpl.grouping)
    setViewMode('preview')
  }, [])

  const saveTemplate = useCallback(() => {
    if (!templateName.trim()) return
    const tpl: SavedTemplate = {
      id: `tpl-${Date.now()}`,
      name: templateName.trim(),
      metrics: Array.from(selectedMetrics),
      dateRange,
      grouping,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setTemplates((prev) => [tpl, ...prev])
    setTemplateName('')
    setShowSaveTemplate(false)
  }, [templateName, selectedMetrics, dateRange, grouping])

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleExportCSV = useCallback(() => {
    let csv = 'Metric,Value,Change %,Category,Status\n'
    for (const snap of filteredSnapshots) {
      const status = snap.target
        ? (snap.value >= snap.target * 0.9 ? 'On Track' : snap.value >= snap.target * 0.7 ? 'At Risk' : 'Behind')
        : '-'
      csv += `"${snap.label}","${formatKPIValue(snap.value, snap.unit)}","${snap.deltaPercent > 0 ? '+' : ''}${snap.deltaPercent}%","${snap.category}","${status}"\n`
    }
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${range.start}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredSnapshots, range])

  const handleExportMarkdown = useCallback(() => {
    let md = `# Report\n\n**Period:** ${range.label}\n\n`
    for (const [group, snaps] of Object.entries(kpisByCategory)) {
      md += `## ${group}\n\n| Metric | Value | Change | Status |\n|--------|-------|--------|--------|\n`
      for (const snap of snaps) {
        const status = snap.target
          ? (snap.value >= snap.target * 0.9 ? 'On Track' : snap.value >= snap.target * 0.7 ? 'At Risk' : 'Behind')
          : '-'
        md += `| ${snap.label} | ${formatKPIValue(snap.value, snap.unit)} | ${snap.deltaPercent > 0 ? '+' : ''}${snap.deltaPercent}% | ${status} |\n`
      }
      md += '\n'
    }
    if (includeAgents) {
      md += `## Agent Activity\n\n- Total: ${taskStats.total}\n- Completed: ${taskStats.completed}\n- Failed: ${taskStats.failed}\n\n`
    }
    if (includeActions) {
      md += `## Action Items\n\n`
      for (const item of actionItems) md += `- [ ] ${item}\n`
    }
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${range.start}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [kpisByCategory, taskStats, actionItems, range, includeAgents, includeActions])

  if (loading) {
    return (
      <>
        <div className="dash-sub-header">
          <Link href="/admin" className="dash-sub-back"><PiArrowLeftBold style={{ marginRight: 4 }} /> Dashboard</Link>
          <h1>Reports</h1>
        </div>
        <div className="report-container">
          {[1, 2, 3].map((i) => (
            <div key={i} className="report-section" style={{ pointerEvents: 'none' }}>
              <div className="report-section-header">
                <div className="skeleton-block" style={{ width: '40%', height: 12 }} />
              </div>
              <div className="report-section-body">
                {[1, 2, 3].map((j) => (
                  <div key={j} style={{ padding: '10px 0', borderBottom: '1px solid var(--af-stone-200)' }}>
                    <div className="skeleton-block" style={{ width: '80%', height: 14, marginBottom: 6 }} />
                    <div className="skeleton-block" style={{ width: '40%', height: 11 }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="dash-sub-header">
        <Link href="/admin" className="dash-sub-back"><PiArrowLeftBold style={{ marginRight: 4 }} /> Dashboard</Link>
        <h1>Reports</h1>
      </div>

      {/* Mode tabs */}
      <div className="rpt-mode-tabs">
        <button className={`rpt-mode-tab${viewMode === 'builder' ? ' active' : ''}`}
          onClick={() => setViewMode('builder')}>
          Report Builder
        </button>
        <button className={`rpt-mode-tab${viewMode === 'preview' ? ' active' : ''}`}
          onClick={() => setViewMode('preview')}>
          Preview & Export
        </button>
      </div>

      {viewMode === 'builder' ? (
        <div className="rpt-builder-layout">
          {/* Builder panel */}
          <div className="rpt-builder-panel">
            <div className="rpt-builder-section">
              <h3>Date Range</h3>
              <div className="rpt-range-options">
                {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).filter((r) => r !== 'custom').map((r) => (
                  <button key={r}
                    className={`rpt-range-btn${dateRange === r ? ' active' : ''}`}
                    onClick={() => setDateRange(r)}>
                    {DATE_RANGE_LABELS[r]}
                  </button>
                ))}
              </div>
              <div className="rpt-range-label">
                <PiCalendarBlankBold /> {range.label}
              </div>
            </div>

            <div className="rpt-builder-section">
              <div className="rpt-section-header-row">
                <h3>Metrics</h3>
                <div className="rpt-metric-toggles">
                  <button className="rpt-toggle-btn" onClick={selectAllMetrics}>Select All</button>
                  <button className="rpt-toggle-btn" onClick={clearAllMetrics}>Clear</button>
                </div>
              </div>
              <div className="rpt-metric-list">
                {availableMetrics.map((m) => (
                  <label key={m.key} className="rpt-metric-check">
                    <input type="checkbox" checked={m.selected}
                      onChange={() => toggleMetric(m.key)} />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rpt-builder-section">
              <h3>Grouping</h3>
              <select className="dash-sub-select" value={grouping}
                onChange={(e) => setGrouping(e.target.value as Grouping)}>
                <option value="category">By Category</option>
                <option value="none">No Grouping</option>
              </select>
            </div>

            <div className="rpt-builder-section">
              <h3>Include</h3>
              <label className="rpt-metric-check">
                <input type="checkbox" checked={includeAgents}
                  onChange={() => setIncludeAgents(!includeAgents)} />
                <span>Agent Activity Summary</span>
              </label>
              <label className="rpt-metric-check">
                <input type="checkbox" checked={includeActions}
                  onChange={() => setIncludeActions(!includeActions)} />
                <span>Action Items</span>
              </label>
            </div>

            <button className="budget-btn-primary" onClick={() => setViewMode('preview')}
              disabled={selectedMetrics.size === 0}>
              Generate Report
            </button>
          </div>

          {/* Templates sidebar */}
          <div className="rpt-templates-panel">
            <div className="rpt-templates-header">
              <h3>Saved Templates</h3>
              <button className="rpt-toggle-btn" onClick={() => setShowSaveTemplate(true)}>
                <PiPlusBold /> Save Current
              </button>
            </div>

            {showSaveTemplate && (
              <div className="rpt-save-template-form">
                <input type="text" value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name..." className="dash-sub-search" />
                <div className="rpt-save-btns">
                  <button className="budget-btn-secondary" onClick={() => setShowSaveTemplate(false)}>Cancel</button>
                  <button className="budget-btn-primary" onClick={saveTemplate} disabled={!templateName.trim()}>
                    <PiFloppyDiskBold /> Save
                  </button>
                </div>
              </div>
            )}

            <div className="rpt-template-list">
              {templates.map((tpl) => (
                <div key={tpl.id} className="rpt-template-item">
                  <button className="rpt-template-load" onClick={() => loadTemplate(tpl)}>
                    <span className="rpt-template-name">{tpl.name}</span>
                    <span className="rpt-template-meta">{tpl.metrics.length} metrics &middot; {DATE_RANGE_LABELS[tpl.dateRange]}</span>
                  </button>
                  <button className="rpt-template-delete" onClick={() => deleteTemplate(tpl.id)} title="Delete">
                    <PiTrashBold />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Preview + Export */}
          <div className="report-export-bar">
            <button className="report-export-btn" onClick={handleExportCSV}>
              <PiDownloadSimpleBold /> Export CSV
            </button>
            <button className="report-export-btn" onClick={handleExportMarkdown}>
              <PiDownloadSimpleBold /> Export Markdown
            </button>
            <button className="report-export-btn" onClick={() => window.print()}>
              <PiPrinterBold /> Print / PDF
            </button>
            <span className="report-date-range">{range.label}</span>
          </div>

          <div className="report-container">
            {Object.entries(kpisByCategory).map(([group, snaps]) => (
              <div key={group} className="report-section">
                <div className="report-section-header">
                  <h2>{group}</h2>
                </div>
                <div className="report-section-body">
                  {snaps.map((snap) => {
                    const trendClass = snap.trend === 'UP' ? 'up' : snap.trend === 'DOWN' ? 'down' : 'flat'
                    const inverted = ['cac', 'churn_rate'].includes(snap.metricKey)
                    const displayClass = inverted
                      ? (snap.trend === 'UP' ? 'down' : snap.trend === 'DOWN' ? 'up' : 'flat')
                      : trendClass
                    return (
                      <div key={snap.id} className="report-metric-row">
                        <span className="report-metric-name">{snap.label}</span>
                        <div className="report-metric-values">
                          <span className="report-metric-value">{formatKPIValue(snap.value, snap.unit)}</span>
                          <span className={`report-metric-change ${displayClass}`}>
                            {snap.deltaPercent > 0 ? '+' : ''}{snap.deltaPercent}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {includeAgents && (
              <div className="report-section">
                <div className="report-section-header"><h2>Agent Activity Summary</h2></div>
                <div className="report-section-body">
                  <div className="report-metric-row">
                    <span className="report-metric-name">Total Tasks</span>
                    <span className="report-metric-value">{taskStats.total}</span>
                  </div>
                  <div className="report-metric-row">
                    <span className="report-metric-name">Completed</span>
                    <span className="report-metric-value" style={{ color: 'var(--af-signal-go)' }}>{taskStats.completed}</span>
                  </div>
                  <div className="report-metric-row">
                    <span className="report-metric-name">In Progress</span>
                    <span className="report-metric-value" style={{ color: 'var(--af-ultra)' }}>{taskStats.inProgress}</span>
                  </div>
                  <div className="report-metric-row">
                    <span className="report-metric-name">Failed</span>
                    <span className="report-metric-value" style={{ color: 'var(--af-signal-stop)' }}>{taskStats.failed}</span>
                  </div>
                  {(Object.entries(taskStats.byAgent) as [string, { total: number; completed: number; failed: number }][]).map(([agentId, stats]) => {
                    const profile = AGENT_PROFILES[agentId as keyof typeof AGENT_PROFILES]
                    if (!profile || stats.total === 0) return null
                    return (
                      <div key={agentId} className="report-metric-row">
                        <span className="report-metric-name">{profile.name}</span>
                        <div className="report-metric-values">
                          <span className="report-metric-value">{stats.total}</span>
                          <span className={`report-metric-change ${stats.failed > 0 ? 'down' : 'up'}`}>
                            {stats.completed} done, {stats.failed} failed
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {includeActions && (
              <div className="report-section">
                <div className="report-section-header"><h2>Action Items</h2></div>
                <div className="report-section-body">
                  {actionItems.map((item, i) => (
                    <div key={i} className="report-action-item">
                      <span className="report-action-bullet" />
                      <span className="report-action-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
