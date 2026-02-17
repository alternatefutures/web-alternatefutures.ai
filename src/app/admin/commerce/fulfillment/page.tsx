'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchAllFulfillments,
  updateFulfillment,
  formatShippingCost,
  formatWeight,
  FULFILLMENT_STATUS_STYLES,
  type FulfillmentRecord,
  type FulfillmentStatus,
  type FulfillmentProvider,
} from '@/lib/fulfillment-api'
import { getCookieValue } from '@/lib/cookies'
import '../commerce.css'

const STATUS_OPTIONS: FulfillmentStatus[] = [
  'awaiting_pick',
  'picking',
  'packing',
  'label_printed',
  'shipped',
  'delivered',
  'exception',
]

const STATUS_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  awaiting_pick: ['picking', 'exception'],
  picking: ['packing', 'exception'],
  packing: ['label_printed', 'exception'],
  label_printed: ['shipped', 'exception'],
  shipped: ['delivered', 'exception'],
  delivered: [],
  exception: ['awaiting_pick'],
}

const PROVIDER_LABELS: Record<FulfillmentProvider, string> = {
  printful: 'Printful',
  gelato: 'Gelato',
  shipstation: 'ShipStation',
  manual: 'Manual',
}

export default function FulfillmentPage() {
  const [fulfillments, setFulfillments] = useState<FulfillmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FulfillmentStatus | ''>('')
  const [providerFilter, setProviderFilter] = useState<FulfillmentProvider | ''>('')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllFulfillments(token)
      setFulfillments(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = [...fulfillments].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (f) =>
          f.orderRef.toLowerCase().includes(q) ||
          f.customerName.toLowerCase().includes(q) ||
          f.customerEmail.toLowerCase().includes(q) ||
          (f.trackingNumber && f.trackingNumber.toLowerCase().includes(q)),
      )
    }
    if (statusFilter) {
      result = result.filter((f) => f.status === statusFilter)
    }
    if (providerFilter) {
      result = result.filter((f) => f.provider === providerFilter)
    }
    return result
  }, [fulfillments, search, statusFilter, providerFilter])

  const handleStatusChange = useCallback(async (fulId: string, newStatus: FulfillmentStatus) => {
    const token = getCookieValue('af_access_token')
    const updated = await updateFulfillment(token, fulId, { status: newStatus })
    setFulfillments((prev) => prev.map((f) => (f.id === fulId ? updated : f)))
  }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const f of fulfillments) c[f.status] = (c[f.status] || 0) + 1
    return c
  }, [fulfillments])

  const pipelineSummary = useMemo(() => {
    const actionable = fulfillments.filter(
      (f) => !['delivered', 'exception'].includes(f.status),
    ).length
    const overdue = fulfillments.filter((f) => {
      if (f.status === 'delivered' || f.status === 'exception') return false
      return new Date(f.shipByDate) < new Date()
    }).length
    const totalShippingCost = fulfillments.reduce((sum, f) => sum + f.shippingCost, 0)
    return { actionable, overdue, totalShippingCost }
  }, [fulfillments])

  if (loading) {
    return (
      <div className="commerce-dashboard">
        <div className="commerce-header">
          <h1>Fulfillment</h1>
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
        <h1>Fulfillment</h1>
        <Link href="/admin/commerce" className="commerce-btn-secondary">
          &larr; Commerce Dashboard
        </Link>
      </div>

      {/* Pipeline summary */}
      <div className="commerce-revenue-row">
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Total Shipments</div>
          <div className="commerce-revenue-value">{fulfillments.length}</div>
          <div className="commerce-revenue-sub">{counts['delivered'] || 0} delivered</div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">In Pipeline</div>
          <div className="commerce-revenue-value">{pipelineSummary.actionable}</div>
          <div className="commerce-revenue-sub">need action</div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Overdue</div>
          <div className="commerce-revenue-value" style={{ color: pipelineSummary.overdue > 0 ? 'var(--af-signal-stop)' : undefined }}>
            {pipelineSummary.overdue}
          </div>
          <div className="commerce-revenue-sub">past ship-by date</div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Shipping Costs</div>
          <div className="commerce-revenue-value">{formatShippingCost(pipelineSummary.totalShippingCost)}</div>
          <div className="commerce-revenue-sub">{counts['exception'] || 0} exceptions</div>
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="commerce-revenue-row" style={{ gridTemplateColumns: `repeat(${STATUS_OPTIONS.length}, 1fr)` }}>
        {STATUS_OPTIONS.map((s) => {
          const style = FULFILLMENT_STATUS_STYLES[s]
          return (
            <div
              key={s}
              className="commerce-revenue-card"
              style={{
                cursor: 'pointer',
                borderColor: statusFilter === s ? style.color : undefined,
                padding: 'var(--af-space-palm) var(--af-space-hand)',
              }}
              onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
            >
              <div className="commerce-revenue-label" style={{ fontSize: '10px' }}>{style.label}</div>
              <div className="commerce-revenue-value" style={{ fontSize: '22px' }}>{counts[s] || 0}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="commerce-filters">
        <input
          type="text"
          className="commerce-search"
          placeholder="Search by order ref, customer, tracking..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="commerce-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FulfillmentStatus | '')}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{FULFILLMENT_STATUS_STYLES[s].label}</option>
          ))}
        </select>
        <select
          className="commerce-select"
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value as FulfillmentProvider | '')}
        >
          <option value="">All Providers</option>
          <option value="printful">Printful</option>
          <option value="gelato">Gelato</option>
          <option value="shipstation">ShipStation</option>
          <option value="manual">Manual</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="commerce-empty">No fulfillments match your filters.</div>
      ) : (
        <div className="commerce-table-wrap">
          <table className="commerce-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Provider</th>
                <th>Weight</th>
                <th>Ship Cost</th>
                <th>Status</th>
                <th>Ship By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ful) => {
                const transitions = STATUS_TRANSITIONS[ful.status]
                const isOverdue =
                  !['delivered', 'exception'].includes(ful.status) &&
                  new Date(ful.shipByDate) < new Date()
                return (
                  <tr key={ful.id}>
                    <td>
                      <span className="commerce-table-link" style={{ fontWeight: 600 }}>
                        {ful.orderRef}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--af-stone-800)' }}>{ful.customerName}</div>
                      <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px', color: 'var(--af-stone-400)' }}>
                        {ful.customerEmail}
                      </div>
                    </td>
                    <td>
                      {ful.items.map((item, i) => (
                        <div key={i} style={{ fontSize: '12px', lineHeight: 1.4 }}>
                          {item.productName}{item.variant ? ` (${item.variant})` : ''} &times;{item.quantity}
                        </div>
                      ))}
                    </td>
                    <td style={{ fontFamily: 'var(--af-font-machine)', fontSize: '12px', color: 'var(--af-stone-600)' }}>
                      {PROVIDER_LABELS[ful.provider]}
                    </td>
                    <td style={{ fontFamily: 'var(--af-font-machine)', fontSize: '12px', whiteSpace: 'nowrap', color: 'var(--af-stone-500)' }}>
                      {formatWeight(ful.totalWeight)}
                    </td>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {formatShippingCost(ful.shippingCost, ful.currency)}
                    </td>
                    <td>
                      <span className={`commerce-status-chip ${ful.status}`}>
                        {FULFILLMENT_STATUS_STYLES[ful.status].label}
                      </span>
                      {ful.trackingNumber && (
                        <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: '10px', color: 'var(--af-stone-400)', marginTop: 2, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ful.carrier?.toUpperCase()} {ful.trackingNumber}
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        fontFamily: 'var(--af-font-machine)',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        color: isOverdue ? 'var(--af-signal-stop)' : 'var(--af-stone-400)',
                        fontWeight: isOverdue ? 600 : 400,
                      }}
                    >
                      {new Date(ful.shipByDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {isOverdue && ' (overdue)'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {transitions.map((next) => (
                          <button
                            key={next}
                            className={`commerce-btn-secondary commerce-btn-sm ${next === 'exception' ? 'commerce-btn-danger' : ''}`}
                            onClick={() => handleStatusChange(ful.id, next)}
                          >
                            {FULFILLMENT_STATUS_STYLES[next].label}
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
