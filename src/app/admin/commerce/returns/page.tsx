'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchAllReturns,
  updateReturn,
  formatRefundAmount,
  RETURN_STATUS_STYLES,
  RETURN_REASON_LABELS,
  type ReturnRequest,
  type ReturnStatus,
  type ReturnReason,
} from '@/lib/fulfillment-api'
import { getCookieValue } from '@/lib/cookies'
import '../commerce.module.css'

const STATUS_OPTIONS: ReturnStatus[] = ['requested', 'approved', 'item_received', 'refund_issued', 'denied', 'closed']

const STATUS_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  requested: ['approved', 'denied'],
  approved: ['item_received', 'denied'],
  item_received: ['refund_issued'],
  refund_issued: ['closed'],
  denied: ['closed'],
  closed: [],
}

const REASON_OPTIONS: ReturnReason[] = ['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'arrived_late', 'other']

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | ''>('')
  const [reasonFilter, setReasonFilter] = useState<ReturnReason | ''>('')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllReturns(token)
      setReturns(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = [...returns].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.rmaNumber.toLowerCase().includes(q) ||
          r.orderRef.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.customerEmail.toLowerCase().includes(q),
      )
    }
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter)
    }
    if (reasonFilter) {
      result = result.filter((r) => r.reason === reasonFilter)
    }
    return result
  }, [returns, search, statusFilter, reasonFilter])

  const handleStatusChange = useCallback(async (retId: string, newStatus: ReturnStatus) => {
    const token = getCookieValue('af_access_token')
    const input: { status: ReturnStatus; approvedBy?: string } = { status: newStatus }
    if (newStatus === 'approved') {
      input.approvedBy = 'admin@alternatefutures.ai'
    }
    const updated = await updateReturn(token, retId, input)
    setReturns((prev) => prev.map((r) => (r.id === retId ? updated : r)))
  }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const r of returns) c[r.status] = (c[r.status] || 0) + 1
    return c
  }, [returns])

  const reasonCounts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const r of returns) c[r.reason] = (c[r.reason] || 0) + 1
    return c
  }, [returns])

  const refundSummary = useMemo(() => {
    const totalRefunded = returns
      .filter((r) => r.status === 'refund_issued' || r.status === 'closed')
      .reduce((sum, r) => sum + r.refundAmount, 0)
    const pendingRefunds = returns
      .filter((r) => ['requested', 'approved', 'item_received'].includes(r.status))
      .reduce((sum, r) => sum + r.refundAmount, 0)
    const awaitingApproval = returns.filter((r) => r.status === 'requested').length
    return { totalRefunded, pendingRefunds, awaitingApproval }
  }, [returns])

  if (loading) {
    return (
      <div className="commerce-dashboard">
        <div className="commerce-header">
          <h1>Returns &amp; Refunds</h1>
        </div>
        <div className="commerce-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="commerce-skeleton-row">
              <div className="commerce-skeleton-block w-16" />
              <div className="commerce-skeleton-block w-40" />
              <div className="commerce-skeleton-block w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="commerce-dashboard">
      <div className="commerce-header">
        <h1>Returns &amp; Refunds</h1>
        <Link href="/admin/commerce" className="commerce-btn-secondary">
          &larr; Commerce Dashboard
        </Link>
      </div>

      {/* Summary cards */}
      <div className="commerce-revenue-row">
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Total Returns</div>
          <div className="commerce-revenue-value">{returns.length}</div>
          <div className="commerce-revenue-sub">{counts['closed'] || 0} closed</div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Awaiting Approval</div>
          <div className="commerce-revenue-value" style={{ color: refundSummary.awaitingApproval > 0 ? 'var(--af-signal-stop)' : undefined }}>
            {refundSummary.awaitingApproval}
          </div>
          <div className="commerce-revenue-sub">need review</div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Refunds Issued</div>
          <div className="commerce-revenue-value">{formatRefundAmount(refundSummary.totalRefunded)}</div>
          <div className="commerce-revenue-sub">all time</div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Pending Refunds</div>
          <div className="commerce-revenue-value">{formatRefundAmount(refundSummary.pendingRefunds)}</div>
          <div className="commerce-revenue-sub">in pipeline</div>
        </div>
      </div>

      {/* Return reasons analytics */}
      <div className="commerce-section">
        <h2>Return Reasons</h2>
        <div style={{ display: 'flex', gap: 'var(--af-space-palm)', flexWrap: 'wrap' }}>
          {REASON_OPTIONS.map((reason) => (
            <div
              key={reason}
              className="commerce-revenue-card"
              style={{
                flex: '1 1 120px',
                cursor: 'pointer',
                borderColor: reasonFilter === reason ? 'var(--af-ultra)' : undefined,
                padding: 'var(--af-space-palm) var(--af-space-hand)',
              }}
              onClick={() => setReasonFilter(reasonFilter === reason ? '' : reason)}
            >
              <div className="commerce-revenue-label" style={{ fontSize: '10px' }}>
                {RETURN_REASON_LABELS[reason]}
              </div>
              <div className="commerce-revenue-value" style={{ fontSize: '22px' }}>
                {reasonCounts[reason] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            className={`commerce-status-chip ${s === statusFilter ? s : ''}`}
            style={{
              cursor: 'pointer',
              background: s === statusFilter ? RETURN_STATUS_STYLES[s].bg : undefined,
              color: s === statusFilter ? RETURN_STATUS_STYLES[s].color : 'var(--af-stone-500)',
              borderColor: s === statusFilter ? RETURN_STATUS_STYLES[s].color : 'var(--af-stone-300)',
            }}
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
          >
            {RETURN_STATUS_STYLES[s].label} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="commerce-filters">
        <input
          type="text"
          className="commerce-search"
          placeholder="Search by RMA, order ref, customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="commerce-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReturnStatus | '')}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{RETURN_STATUS_STYLES[s].label}</option>
          ))}
        </select>
        <select
          className="commerce-select"
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value as ReturnReason | '')}
        >
          <option value="">All Reasons</option>
          {REASON_OPTIONS.map((r) => (
            <option key={r} value={r}>{RETURN_REASON_LABELS[r]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="commerce-empty">No returns match your filters.</div>
      ) : (
        <div className="commerce-table-wrap">
          <table className="commerce-table">
            <thead>
              <tr>
                <th>RMA</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Reason</th>
                <th>Refund</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ret) => {
                const transitions = STATUS_TRANSITIONS[ret.status]
                return (
                  <tr key={ret.id}>
                    <td>
                      <span className="commerce-table-link" style={{ fontWeight: 600, fontFamily: 'var(--af-font-machine)', fontSize: '12px' }}>
                        {ret.rmaNumber}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: 'var(--af-stone-700)', fontSize: '13px' }}>
                        {ret.orderRef}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--af-stone-800)' }}>{ret.customerName}</div>
                      <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px', color: 'var(--af-stone-400)' }}>
                        {ret.customerEmail}
                      </div>
                    </td>
                    <td>
                      {ret.items.map((item, i) => (
                        <div key={i} style={{ fontSize: '12px', lineHeight: 1.4 }}>
                          {item.productName}{item.variant ? ` (${item.variant})` : ''} &times;{item.quantity}
                          <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: '10px', color: 'var(--af-stone-400)', marginLeft: 4 }}>
                            [{item.condition}]
                          </span>
                        </div>
                      ))}
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--af-stone-700)' }}>
                        {RETURN_REASON_LABELS[ret.reason]}
                      </span>
                      {ret.reasonDetail && (
                        <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: '10px', color: 'var(--af-stone-400)', marginTop: 2, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={ret.reasonDetail}
                        >
                          {ret.reasonDetail}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap', color: ret.refundAmount > 0 ? 'var(--af-terra)' : 'var(--af-stone-400)' }}>
                      {formatRefundAmount(ret.refundAmount, ret.currency)}
                    </td>
                    <td>
                      <span className={`commerce-status-chip ${ret.status}`}>
                        {RETURN_STATUS_STYLES[ret.status].label}
                      </span>
                      {ret.approvedBy && (
                        <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: '10px', color: 'var(--af-stone-400)', marginTop: 2 }}>
                          by {ret.approvedBy.split('@')[0]}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--af-font-machine)', fontSize: '12px', color: 'var(--af-stone-400)', whiteSpace: 'nowrap' }}>
                      {new Date(ret.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {transitions.map((next) => (
                          <button
                            key={next}
                            className={`commerce-btn-secondary commerce-btn-sm ${next === 'denied' ? 'commerce-btn-danger' : ''}`}
                            onClick={() => handleStatusChange(ret.id, next)}
                          >
                            {RETURN_STATUS_STYLES[next].label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
