'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchAllBudgetLines, computeBudgetSummary, createBudgetLine, updateBudgetLine, deleteBudgetLine,
  BUDGET_CATEGORY_STYLES, ALL_BUDGET_CATEGORIES, ALL_QUARTERS, ANNUAL_BUDGET, QUARTERLY_TARGETS,
  type BudgetLine, type BudgetCategory, type Quarter,
} from '@/lib/budget-api'
import {
  PiCurrencyDollarBold, PiChartPieBold, PiWarningBold,
  PiTrendUpBold, PiArrowLeftBold, PiPlusBold,
  PiPencilSimpleBold, PiTrashBold, PiFloppyDiskBold,
  PiXBold, PiArrowsLeftRightBold,
} from 'react-icons/pi'
import { getCookieValue } from '@/lib/cookies'
import './budget-admin.css'

function formatUSD(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
  return `$${n.toLocaleString()}`
}

function BurnRateChart({ lines }: { lines: BudgetLine[] }) {
  const monthlyData = useMemo(() => {
    const months: { label: string; planned: number; actual: number }[] = []
    for (const q of ALL_QUARTERS) {
      const qLines = lines.filter((l) => l.quarter === q)
      if (qLines.length === 0) continue
      const planned = qLines.reduce((s, l) => s + l.planned, 0)
      const actual = qLines.reduce((s, l) => s + l.actual, 0)
      months.push({ label: q, planned, actual })
    }
    return months
  }, [lines])

  if (monthlyData.length === 0) return null

  const maxVal = Math.max(...monthlyData.flatMap((m) => [m.planned, m.actual]))
  const barW = 40
  const gap = 24
  const chartH = 140
  const chartW = monthlyData.length * (barW * 2 + gap) + gap

  return (
    <div className="budget-chart-wrap">
      <svg width={chartW} height={chartH + 32} viewBox={`0 0 ${chartW} ${chartH + 32}`}
        style={{ display: 'block', width: '100%', maxWidth: chartW, height: 'auto' }}>
        {monthlyData.map((m, i) => {
          const x = gap + i * (barW * 2 + gap)
          const plannedH = maxVal > 0 ? (m.planned / maxVal) * chartH : 0
          const actualH = maxVal > 0 ? (m.actual / maxVal) * chartH : 0
          return (
            <g key={m.label}>
              {/* Planned bar */}
              <rect x={x} y={chartH - plannedH} width={barW} height={plannedH}
                fill="var(--af-stone-200)" rx={3} />
              {/* Actual bar */}
              <rect x={x + barW + 2} y={chartH - actualH} width={barW} height={actualH}
                fill={m.actual > m.planned ? 'var(--af-signal-stop)' : 'var(--af-ultra)'}
                rx={3} />
              {/* Label */}
              <text x={x + barW} y={chartH + 20} textAnchor="middle"
                fill="var(--af-stone-500)" fontSize={11} fontFamily="var(--af-font-machine)">
                {m.label}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="budget-chart-legend">
        <span className="budget-legend-item"><span className="budget-legend-swatch" style={{ background: 'var(--af-stone-200)' }} /> Planned</span>
        <span className="budget-legend-item"><span className="budget-legend-swatch" style={{ background: 'var(--af-ultra)' }} /> Actual</span>
      </div>
    </div>
  )
}

function CategoryDonut({ summary }: { summary: ReturnType<typeof computeBudgetSummary> }) {
  const cats = ALL_BUDGET_CATEGORIES.filter((c) => summary.byCategory[c].actual > 0)
  const total = summary.totalActual || 1
  let cumAngle = 0
  const size = 120
  const cx = size / 2
  const cy = size / 2
  const r = 44
  const inner = 28

  const arcs = cats.map((cat) => {
    const pct = summary.byCategory[cat].actual / total
    const startAngle = cumAngle
    const endAngle = cumAngle + pct * 360
    cumAngle = endAngle

    const toRad = (deg: number) => (deg - 90) * (Math.PI / 180)
    const x1 = cx + r * Math.cos(toRad(startAngle))
    const y1 = cy + r * Math.sin(toRad(startAngle))
    const x2 = cx + r * Math.cos(toRad(endAngle))
    const y2 = cy + r * Math.sin(toRad(endAngle))
    const ix1 = cx + inner * Math.cos(toRad(endAngle))
    const iy1 = cy + inner * Math.sin(toRad(endAngle))
    const ix2 = cx + inner * Math.cos(toRad(startAngle))
    const iy2 = cy + inner * Math.sin(toRad(startAngle))
    const largeArc = pct > 0.5 ? 1 : 0

    const d = [
      `M${x1},${y1}`,
      `A${r},${r} 0 ${largeArc} 1 ${x2},${y2}`,
      `L${ix1},${iy1}`,
      `A${inner},${inner} 0 ${largeArc} 0 ${ix2},${iy2}`,
      'Z',
    ].join(' ')

    return { cat, d, color: BUDGET_CATEGORY_STYLES[cat].color }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {arcs.map((a) => (
        <path key={a.cat} d={a.d} fill={a.color} opacity={0.8} />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--af-stone-800)"
        fontSize={14} fontWeight={700} fontFamily="var(--af-font-architect)">
        {formatUSD(summary.totalActual)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--af-stone-400)"
        fontSize={9} fontFamily="var(--af-font-machine)">
        spent
      </text>
    </svg>
  )
}

export default function BudgetTracker() {
  const [lines, setLines] = useState<BudgetLine[]>([])
  const [loading, setLoading] = useState(true)
  const [quarterFilter, setQuarterFilter] = useState<Quarter | 'ALL'>('ALL')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formCategory, setFormCategory] = useState<BudgetCategory>('content')
  const [formQuarter, setFormQuarter] = useState<Quarter>('Q1')
  const [formPlanned, setFormPlanned] = useState('')
  const [formActual, setFormActual] = useState('')
  const [formNotes, setFormNotes] = useState('')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllBudgetLines(token).catch(() => [])
      setLines(data)
      setLoading(false)
    }
    load()
  }, [])

  const filteredLines = useMemo(() => {
    if (quarterFilter === 'ALL') return lines
    return lines.filter((l) => l.quarter === quarterFilter)
  }, [lines, quarterFilter])

  const summary = useMemo(() => computeBudgetSummary(filteredLines), [filteredLines])

  const overspendAlerts = useMemo(() => {
    return filteredLines.filter((l) => l.actual > l.planned)
  }, [filteredLines])

  const resetForm = useCallback(() => {
    setFormCategory('content')
    setFormQuarter('Q1')
    setFormPlanned('')
    setFormActual('')
    setFormNotes('')
    setShowForm(false)
    setEditingId(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    const token = getCookieValue('af_access_token')
    if (editingId) {
      const updated = await updateBudgetLine(token, editingId, {
        category: formCategory,
        quarter: formQuarter,
        planned: Number(formPlanned),
        actual: Number(formActual),
        notes: formNotes,
      })
      setLines((prev) => prev.map((l) => l.id === editingId ? updated : l))
    } else {
      const created = await createBudgetLine(token, {
        category: formCategory,
        quarter: formQuarter,
        year: 2026,
        planned: Number(formPlanned),
        actual: Number(formActual) || 0,
        notes: formNotes,
      })
      setLines((prev) => [...prev, created])
    }
    resetForm()
  }, [editingId, formCategory, formQuarter, formPlanned, formActual, formNotes, resetForm])

  const handleEdit = useCallback((line: BudgetLine) => {
    setEditingId(line.id)
    setFormCategory(line.category)
    setFormQuarter(line.quarter)
    setFormPlanned(line.planned.toString())
    setFormActual(line.actual.toString())
    setFormNotes(line.notes)
    setShowForm(true)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const token = getCookieValue('af_access_token')
    await deleteBudgetLine(token, id)
    setLines((prev) => prev.filter((l) => l.id !== id))
  }, [])

  if (loading) {
    return (
      <>
        <div className="dash-sub-header">
          <Link href="/admin" className="dash-sub-back"><PiArrowLeftBold style={{ marginRight: 4 }} /> Dashboard</Link>
          <h1>Budget Tracker</h1>
        </div>
        <div className="budget-summary-row">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="budget-summary-card" style={{ pointerEvents: 'none' }}>
              <div className="skeleton-block" style={{ width: '50%', height: 12, marginBottom: 8 }} />
              <div className="skeleton-block" style={{ width: '60%', height: 28 }} />
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
        <h1>Budget Tracker</h1>
      </div>

      {/* Summary cards */}
      <div className="budget-summary-row">
        <div className="budget-summary-card">
          <div className="budget-summary-icon"><PiCurrencyDollarBold /></div>
          <div className="budget-summary-label">Annual Budget</div>
          <div className="budget-summary-value">{formatUSD(ANNUAL_BUDGET)}</div>
        </div>
        <div className="budget-summary-card">
          <div className="budget-summary-icon" style={{ color: 'var(--af-ultra)' }}><PiCurrencyDollarBold /></div>
          <div className="budget-summary-label">Total Planned</div>
          <div className="budget-summary-value">{formatUSD(summary.totalPlanned)}</div>
        </div>
        <div className="budget-summary-card">
          <div className="budget-summary-icon" style={{ color: 'var(--af-signal-go)' }}><PiTrendUpBold /></div>
          <div className="budget-summary-label">Total Spent</div>
          <div className="budget-summary-value">{formatUSD(summary.totalActual)}</div>
        </div>
        <div className="budget-summary-card">
          <div className="budget-summary-icon" style={{ color: summary.variance >= 0 ? 'var(--af-signal-go)' : 'var(--af-signal-stop)' }}>
            <PiChartPieBold />
          </div>
          <div className="budget-summary-label">Remaining</div>
          <div className="budget-summary-value" style={{ color: summary.variance >= 0 ? 'var(--af-signal-go)' : 'var(--af-signal-stop)' }}>
            {formatUSD(summary.variance)} <span className="budget-summary-pct">({summary.variancePercent}%)</span>
          </div>
        </div>
      </div>

      {/* Overspend alerts */}
      {overspendAlerts.length > 0 && (
        <div className="budget-alert-bar">
          <PiWarningBold />
          <span>{overspendAlerts.length} categor{overspendAlerts.length === 1 ? 'y' : 'ies'} over budget: {overspendAlerts.map((l) => BUDGET_CATEGORY_STYLES[l.category].label).join(', ')}</span>
        </div>
      )}

      {/* Filters + actions */}
      <div className="budget-toolbar">
        <select className="dash-sub-select" value={quarterFilter}
          onChange={(e) => setQuarterFilter(e.target.value as Quarter | 'ALL')}>
          <option value="ALL">All Quarters</option>
          {ALL_QUARTERS.map((q) => <option key={q} value={q}>{q} 2026</option>)}
        </select>
        <div className="budget-toolbar-actions">
          <Link href="/admin/budget/allocations" className="budget-btn-secondary">
            <PiArrowsLeftRightBold /> Allocations
          </Link>
          <button className="budget-btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>
            <PiPlusBold /> Add Budget Line
          </button>
        </div>
      </div>

      {/* Charts row */}
      <div className="budget-charts-row">
        <div className="budget-chart-card">
          <h3>Quarterly Burn Rate</h3>
          <BurnRateChart lines={filteredLines} />
        </div>
        <div className="budget-chart-card">
          <h3>Spend by Category</h3>
          <div className="budget-donut-wrap">
            <CategoryDonut summary={summary} />
            <div className="budget-cat-legend">
              {ALL_BUDGET_CATEGORIES.filter((c) => summary.byCategory[c].actual > 0).map((cat) => (
                <div key={cat} className="budget-cat-legend-item">
                  <span className="budget-cat-legend-swatch" style={{ background: BUDGET_CATEGORY_STYLES[cat].color }} />
                  <span>{BUDGET_CATEGORY_STYLES[cat].label}</span>
                  <span className="budget-cat-legend-val">{formatUSD(summary.byCategory[cat].actual)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="budget-table-card">
        <h3>Category Breakdown</h3>
        <div className="budget-table-wrap">
          <table className="budget-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Quarter</th>
                <th>Planned</th>
                <th>Actual</th>
                <th>Remaining</th>
                <th>%</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLines.map((line) => {
                const remaining = line.planned - line.actual
                const pct = line.planned > 0 ? Math.round((line.actual / line.planned) * 100) : 0
                const style = BUDGET_CATEGORY_STYLES[line.category]
                return (
                  <tr key={line.id} className={remaining < 0 ? 'budget-row-over' : ''}>
                    <td>
                      <span className="budget-cat-chip" style={{ background: style.bg, color: style.color }}>
                        {style.label}
                      </span>
                    </td>
                    <td className="budget-td-mono">{line.quarter}</td>
                    <td className="budget-td-mono">{formatUSD(line.planned)}</td>
                    <td className="budget-td-mono">{formatUSD(line.actual)}</td>
                    <td className={`budget-td-mono ${remaining < 0 ? 'budget-over' : ''}`}>
                      {formatUSD(remaining)}
                    </td>
                    <td>
                      <div className="budget-mini-bar">
                        <div className="budget-mini-bar-fill"
                          style={{ width: `${Math.min(pct, 100)}%`, background: pct > 100 ? 'var(--af-signal-stop)' : 'var(--af-ultra)' }} />
                      </div>
                      <span className="budget-td-pct">{pct}%</span>
                    </td>
                    <td className="budget-td-notes">{line.notes}</td>
                    <td className="budget-td-actions">
                      <button className="budget-action-btn" onClick={() => handleEdit(line)} title="Edit">
                        <PiPencilSimpleBold />
                      </button>
                      <button className="budget-action-btn budget-action-delete" onClick={() => handleDelete(line.id)} title="Delete">
                        <PiTrashBold />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="budget-modal-overlay" onClick={resetForm}>
          <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
            <div className="budget-modal-header">
              <h3>{editingId ? 'Edit Budget Line' : 'Add Budget Line'}</h3>
              <button className="sc-drilldown-close" onClick={resetForm}><PiXBold /></button>
            </div>
            <div className="budget-form">
              <label>
                Category
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as BudgetCategory)}>
                  {ALL_BUDGET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{BUDGET_CATEGORY_STYLES[c].label}</option>
                  ))}
                </select>
              </label>
              <label>
                Quarter
                <select value={formQuarter} onChange={(e) => setFormQuarter(e.target.value as Quarter)}>
                  {ALL_QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </label>
              <label>
                Planned ($)
                <input type="number" value={formPlanned} onChange={(e) => setFormPlanned(e.target.value)}
                  placeholder="e.g. 15000" />
              </label>
              <label>
                Actual ($)
                <input type="number" value={formActual} onChange={(e) => setFormActual(e.target.value)}
                  placeholder="e.g. 12000" />
              </label>
              <label>
                Notes
                <input type="text" value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Budget line description..." />
              </label>
              <div className="budget-form-actions">
                <button className="budget-btn-secondary" onClick={resetForm}>Cancel</button>
                <button className="budget-btn-primary" onClick={handleSubmit}
                  disabled={!formPlanned || Number(formPlanned) <= 0}>
                  <PiFloppyDiskBold /> {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
