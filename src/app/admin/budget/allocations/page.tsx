'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchAllBudgetLines, computeBudgetSummary, createBudgetLine, updateBudgetLine,
  BUDGET_CATEGORY_STYLES, ALL_BUDGET_CATEGORIES, ALL_QUARTERS, QUARTERLY_TARGETS,
  type BudgetLine, type BudgetCategory, type Quarter,
} from '@/lib/budget-api'
import {
  PiArrowLeftBold, PiPlusBold, PiFloppyDiskBold, PiXBold,
  PiArrowsLeftRightBold, PiCheckCircleBold,
} from 'react-icons/pi'
import { getCookieValue } from '@/lib/cookies'
import '../budget-admin.css'

function formatUSD(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
  return `$${n.toLocaleString()}`
}

export default function BudgetAllocations() {
  const [lines, setLines] = useState<BudgetLine[]>([])
  const [loading, setLoading] = useState(true)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  // Transfer form
  const [fromCat, setFromCat] = useState<BudgetCategory>('content')
  const [toCat, setToCat] = useState<BudgetCategory>('ads')
  const [transferQuarter, setTransferQuarter] = useState<Quarter>('Q1')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferSuccess, setTransferSuccess] = useState(false)

  // Create form
  const [createCategory, setCreateCategory] = useState<BudgetCategory>('content')
  const [createQuarter, setCreateQuarter] = useState<Quarter>('Q1')
  const [createPlanned, setCreatePlanned] = useState('')
  const [createNotes, setCreateNotes] = useState('')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllBudgetLines(token).catch(() => [])
      setLines(data)
      setLoading(false)
    }
    load()
  }, [])

  const summary = useMemo(() => computeBudgetSummary(lines), [lines])

  // Group by category for the allocation table
  const allocationRows = useMemo(() => {
    return ALL_BUDGET_CATEGORIES.map((cat) => {
      const catLines = lines.filter((l) => l.category === cat)
      const allocated = catLines.reduce((s, l) => s + l.planned, 0)
      const spent = catLines.reduce((s, l) => s + l.actual, 0)
      const remaining = allocated - spent
      const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0
      return { category: cat, allocated, spent, remaining, pct, lineCount: catLines.length }
    }).filter((r) => r.lineCount > 0 || r.allocated > 0)
  }, [lines])

  // Monthly history
  const historyByQuarter = useMemo(() => {
    return ALL_QUARTERS.map((q) => {
      const qLines = lines.filter((l) => l.quarter === q)
      const planned = qLines.reduce((s, l) => s + l.planned, 0)
      const actual = qLines.reduce((s, l) => s + l.actual, 0)
      const target = QUARTERLY_TARGETS[q]
      return { quarter: q, planned, actual, target }
    }).filter((q) => q.planned > 0 || q.actual > 0)
  }, [lines])

  const handleTransfer = useCallback(async () => {
    const token = getCookieValue('af_access_token')
    const amount = Number(transferAmount)
    if (amount <= 0 || fromCat === toCat) return

    // Find source line and reduce planned
    const sourceLine = lines.find((l) => l.category === fromCat && l.quarter === transferQuarter)
    const destLine = lines.find((l) => l.category === toCat && l.quarter === transferQuarter)

    if (sourceLine) {
      const updated = await updateBudgetLine(token, sourceLine.id, {
        planned: sourceLine.planned - amount,
      })
      setLines((prev) => prev.map((l) => l.id === sourceLine.id ? updated : l))
    }

    if (destLine) {
      const updated = await updateBudgetLine(token, destLine.id, {
        planned: destLine.planned + amount,
      })
      setLines((prev) => prev.map((l) => l.id === destLine.id ? updated : l))
    } else {
      const created = await createBudgetLine(token, {
        category: toCat,
        quarter: transferQuarter,
        year: 2026,
        planned: amount,
        notes: `Transferred from ${BUDGET_CATEGORY_STYLES[fromCat].label}`,
      })
      setLines((prev) => [...prev, created])
    }

    setTransferSuccess(true)
    setTimeout(() => {
      setTransferSuccess(false)
      setShowTransfer(false)
      setTransferAmount('')
    }, 1500)
  }, [lines, fromCat, toCat, transferQuarter, transferAmount])

  const handleCreate = useCallback(async () => {
    const token = getCookieValue('af_access_token')
    const created = await createBudgetLine(token, {
      category: createCategory,
      quarter: createQuarter,
      year: 2026,
      planned: Number(createPlanned),
      notes: createNotes,
    })
    setLines((prev) => [...prev, created])
    setShowCreate(false)
    setCreatePlanned('')
    setCreateNotes('')
  }, [createCategory, createQuarter, createPlanned, createNotes])

  if (loading) {
    return (
      <>
        <div className="dash-sub-header">
          <Link href="/admin/budget" className="dash-sub-back"><PiArrowLeftBold style={{ marginRight: 4 }} /> Budget</Link>
          <h1>Allocations</h1>
        </div>
        <div className="budget-table-card" style={{ pointerEvents: 'none' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--af-stone-200)' }}>
              <div className="skeleton-block" style={{ width: '70%', height: 14, marginBottom: 6 }} />
              <div className="skeleton-block" style={{ width: '40%', height: 11 }} />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="dash-sub-header">
        <Link href="/admin/budget" className="dash-sub-back"><PiArrowLeftBold style={{ marginRight: 4 }} /> Budget</Link>
        <h1>Allocations</h1>
      </div>

      {/* Actions */}
      <div className="budget-toolbar">
        <div className="budget-toolbar-actions">
          <button className="budget-btn-secondary" onClick={() => setShowTransfer(true)}>
            <PiArrowsLeftRightBold /> Transfer Between Categories
          </button>
          <button className="budget-btn-primary" onClick={() => setShowCreate(true)}>
            <PiPlusBold /> Create Allocation
          </button>
        </div>
      </div>

      {/* Allocation table */}
      <div className="budget-table-card">
        <h3>Budget Allocations by Category</h3>
        <div className="budget-table-wrap">
          <table className="budget-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Allocated</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {allocationRows.map((row) => {
                const style = BUDGET_CATEGORY_STYLES[row.category]
                return (
                  <tr key={row.category} className={row.remaining < 0 ? 'budget-row-over' : ''}>
                    <td>
                      <span className="budget-cat-chip" style={{ background: style.bg, color: style.color }}>
                        {style.label}
                      </span>
                    </td>
                    <td className="budget-td-mono">{formatUSD(row.allocated)}</td>
                    <td className="budget-td-mono">{formatUSD(row.spent)}</td>
                    <td className={`budget-td-mono ${row.remaining < 0 ? 'budget-over' : ''}`}>
                      {formatUSD(row.remaining)}
                    </td>
                    <td>
                      <div className="budget-mini-bar">
                        <div className="budget-mini-bar-fill"
                          style={{ width: `${Math.min(row.pct, 100)}%`, background: row.pct > 100 ? 'var(--af-signal-stop)' : 'var(--af-ultra)' }} />
                      </div>
                      <span className="budget-td-pct">{row.pct}%</span>
                    </td>
                  </tr>
                )
              })}
              <tr className="budget-row-total">
                <td><strong>Total</strong></td>
                <td className="budget-td-mono"><strong>{formatUSD(summary.totalPlanned)}</strong></td>
                <td className="budget-td-mono"><strong>{formatUSD(summary.totalActual)}</strong></td>
                <td className="budget-td-mono"><strong>{formatUSD(summary.variance)}</strong></td>
                <td>
                  <strong>{summary.totalPlanned > 0 ? Math.round((summary.totalActual / summary.totalPlanned) * 100) : 0}%</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical spend by quarter */}
      <div className="budget-table-card">
        <h3>Historical Spend by Quarter</h3>
        <div className="budget-table-wrap">
          <table className="budget-table">
            <thead>
              <tr>
                <th>Quarter</th>
                <th>Target</th>
                <th>Planned</th>
                <th>Actual</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              {historyByQuarter.map((q) => {
                const variance = q.planned - q.actual
                return (
                  <tr key={q.quarter}>
                    <td className="budget-td-mono">{q.quarter} 2026</td>
                    <td className="budget-td-mono">{formatUSD(q.target)}</td>
                    <td className="budget-td-mono">{formatUSD(q.planned)}</td>
                    <td className="budget-td-mono">{formatUSD(q.actual)}</td>
                    <td className={`budget-td-mono ${variance < 0 ? 'budget-over' : ''}`}>
                      {variance >= 0 ? '+' : ''}{formatUSD(variance)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer modal */}
      {showTransfer && (
        <div className="budget-modal-overlay" onClick={() => setShowTransfer(false)}>
          <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
            <div className="budget-modal-header">
              <h3>Transfer Between Categories</h3>
              <button className="sc-drilldown-close" onClick={() => setShowTransfer(false)}><PiXBold /></button>
            </div>
            {transferSuccess ? (
              <div className="budget-transfer-success">
                <PiCheckCircleBold size={32} />
                <span>Transfer complete</span>
              </div>
            ) : (
              <div className="budget-form">
                <label>
                  From Category
                  <select value={fromCat} onChange={(e) => setFromCat(e.target.value as BudgetCategory)}>
                    {ALL_BUDGET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{BUDGET_CATEGORY_STYLES[c].label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  To Category
                  <select value={toCat} onChange={(e) => setToCat(e.target.value as BudgetCategory)}>
                    {ALL_BUDGET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{BUDGET_CATEGORY_STYLES[c].label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Quarter
                  <select value={transferQuarter} onChange={(e) => setTransferQuarter(e.target.value as Quarter)}>
                    {ALL_QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}
                  </select>
                </label>
                <label>
                  Amount ($)
                  <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="e.g. 5000" />
                </label>
                <div className="budget-form-actions">
                  <button className="budget-btn-secondary" onClick={() => setShowTransfer(false)}>Cancel</button>
                  <button className="budget-btn-primary" onClick={handleTransfer}
                    disabled={!transferAmount || Number(transferAmount) <= 0 || fromCat === toCat}>
                    <PiArrowsLeftRightBold /> Transfer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create allocation modal */}
      {showCreate && (
        <div className="budget-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
            <div className="budget-modal-header">
              <h3>Create Allocation</h3>
              <button className="sc-drilldown-close" onClick={() => setShowCreate(false)}><PiXBold /></button>
            </div>
            <div className="budget-form">
              <label>
                Category
                <select value={createCategory} onChange={(e) => setCreateCategory(e.target.value as BudgetCategory)}>
                  {ALL_BUDGET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{BUDGET_CATEGORY_STYLES[c].label}</option>
                  ))}
                </select>
              </label>
              <label>
                Quarter
                <select value={createQuarter} onChange={(e) => setCreateQuarter(e.target.value as Quarter)}>
                  {ALL_QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </label>
              <label>
                Planned Amount ($)
                <input type="number" value={createPlanned} onChange={(e) => setCreatePlanned(e.target.value)}
                  placeholder="e.g. 20000" />
              </label>
              <label>
                Notes
                <input type="text" value={createNotes} onChange={(e) => setCreateNotes(e.target.value)}
                  placeholder="Description..." />
              </label>
              <div className="budget-form-actions">
                <button className="budget-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="budget-btn-primary" onClick={handleCreate}
                  disabled={!createPlanned || Number(createPlanned) <= 0}>
                  <PiFloppyDiskBold /> Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
