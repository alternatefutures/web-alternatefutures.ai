'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchAllOrders,
  updateOrder,
  formatOrderTotal,
  ORDER_STATUS_STYLES,
  type Order,
  type OrderStatus,
} from '@/lib/order-api'
import { getCookieValue } from '@/lib/cookies'
import '../commerce.css'

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllOrders(token)
      setOrders(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q),
      )
    }
    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter)
    }
    return result
  }, [orders, search, statusFilter])

  const handleStatusChange = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    const token = getCookieValue('af_access_token')
    const updated = await updateOrder(token, orderId, { status: newStatus })
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
  }, [])

  // Status counts
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1
    return c
  }, [orders])

  if (loading) {
    return (
      <div className="commerce-dashboard">
        <div className="commerce-header">
          <h1>Orders</h1>
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
        <h1>Orders</h1>
        <Link href="/admin/commerce" className="commerce-btn-secondary">
          &larr; Commerce Dashboard
        </Link>
      </div>

      {/* Status summary */}
      <div className="commerce-revenue-row">
        {STATUS_OPTIONS.map((s) => {
          const style = ORDER_STATUS_STYLES[s]
          return (
            <div
              key={s}
              className="commerce-revenue-card"
              style={{ cursor: 'pointer', borderColor: statusFilter === s ? style.color : undefined }}
              onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
            >
              <div className="commerce-revenue-label">{style.label}</div>
              <div className="commerce-revenue-value">{counts[s] || 0}</div>
            </div>
          )
        })}
      </div>

      <div className="commerce-filters">
        <input
          type="text"
          className="commerce-search"
          placeholder="Search by order ID, customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="commerce-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_STYLES[s].label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="commerce-empty">No orders match your filters.</div>
      ) : (
        <div className="commerce-table-wrap">
          <table className="commerce-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const transitions = STATUS_TRANSITIONS[order.status]
                return (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/commerce/orders/${order.id}`} className="commerce-table-link">
                        {order.orderId}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--af-stone-800)' }}>{order.customerName}</div>
                      <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px', color: 'var(--af-stone-400)' }}>{order.customerEmail}</div>
                    </td>
                    <td>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ fontSize: '12px', lineHeight: 1.4 }}>
                          {item.productName}{item.variant ? ` (${item.variant})` : ''} &times;{item.quantity}
                        </div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {formatOrderTotal(order.total, order.currency)}
                    </td>
                    <td>
                      <span className={`commerce-status-chip ${order.status}`}>
                        {ORDER_STATUS_STYLES[order.status].label}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--af-font-machine)', fontSize: '12px', color: 'var(--af-stone-400)', whiteSpace: 'nowrap' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {transitions.map((next) => (
                          <button
                            key={next}
                            className="commerce-btn-secondary commerce-btn-sm"
                            onClick={() => handleStatusChange(order.id, next)}
                          >
                            {ORDER_STATUS_STYLES[next].label}
                          </button>
                        ))}
                        <Link href={`/admin/commerce/orders/${order.id}`} className="commerce-btn-secondary commerce-btn-sm">
                          View
                        </Link>
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
