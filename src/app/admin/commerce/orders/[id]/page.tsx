'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  fetchOrderById,
  updateOrder,
  formatOrderTotal,
  ORDER_STATUS_STYLES,
  type Order,
  type OrderStatus,
} from '@/lib/order-api'
import { getCookieValue } from '@/lib/cookies'
import '../../commerce.css'

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackingInput, setTrackingInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchOrderById(token, id)
      if (data) {
        setOrder(data)
        setTrackingInput(data.trackingNumber || '')
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleStatusChange = useCallback(async (newStatus: OrderStatus) => {
    if (!order) return
    setSaving(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateOrder(token, order.id, { status: newStatus })
      setOrder(updated)
      setStatusMsg({ type: 'success', text: `Status updated to ${ORDER_STATUS_STYLES[newStatus].label}` })
    } catch (err) {
      setStatusMsg({ type: 'error', text: err instanceof Error ? err.message : 'Update failed' })
    } finally {
      setSaving(false)
    }
  }, [order])

  const handleSaveTracking = useCallback(async () => {
    if (!order) return
    setSaving(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateOrder(token, order.id, { trackingNumber: trackingInput.trim() })
      setOrder(updated)
      setStatusMsg({ type: 'success', text: 'Tracking number saved.' })
    } catch (err) {
      setStatusMsg({ type: 'error', text: err instanceof Error ? err.message : 'Save failed' })
    } finally {
      setSaving(false)
    }
  }, [order, trackingInput])

  if (loading) {
    return (
      <div className="commerce-dashboard">
        <div className="commerce-header">
          <h1>Loading...</h1>
        </div>
        <div className="commerce-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="commerce-skeleton-row">
              <div className="commerce-skeleton-block w-40" />
              <div className="commerce-skeleton-block w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="commerce-dashboard">
        <div className="commerce-header">
          <h1>Order not found</h1>
        </div>
        <Link href="/admin/commerce/orders" className="commerce-back-link">
          &larr; Back to Orders
        </Link>
      </div>
    )
  }

  const transitions = STATUS_TRANSITIONS[order.status]
  const subtotal = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  return (
    <div className="commerce-dashboard">
      <div className="commerce-header">
        <div>
          <Link href="/admin/commerce/orders" className="commerce-back-link">
            &larr; Back to Orders
          </Link>
          <h1 style={{ marginTop: 8 }}>Order {order.orderId}</h1>
        </div>
        <span className={`commerce-status-chip ${order.status}`} style={{ fontSize: 14, padding: '4px 16px' }}>
          {ORDER_STATUS_STYLES[order.status].label}
        </span>
      </div>

      <div className="commerce-detail-layout">
        <div className="commerce-detail-main">
          {/* Line Items */}
          <div className="commerce-section">
            <h2>Items ({order.items.length})</h2>
            <div className="commerce-order-items">
              {order.items.map((item, i) => (
                <div key={i} className="commerce-order-item">
                  <div>
                    <span className="commerce-order-item-name">{item.productName}</span>
                    {item.variant && (
                      <span className="commerce-order-item-variant">({item.variant})</span>
                    )}
                    <span className="commerce-order-item-qty" style={{ marginLeft: 8 }}>
                      &times;{item.quantity}
                    </span>
                  </div>
                  <span className="commerce-order-item-price">
                    {formatOrderTotal(item.unitPrice * item.quantity, order.currency)}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--af-space-palm)', borderTop: 'var(--af-border-visible) solid var(--af-stone-200)', marginTop: 'var(--af-space-palm)' }}>
              <div className="commerce-info-grid" style={{ gridTemplateColumns: '80px 1fr' }}>
                <span className="commerce-info-label">Subtotal</span>
                <span className="commerce-info-value">{formatOrderTotal(subtotal, order.currency)}</span>
                <span className="commerce-info-label" style={{ fontWeight: 700 }}>Total</span>
                <span className="commerce-info-value" style={{ fontWeight: 700, fontSize: 16 }}>{formatOrderTotal(order.total, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="commerce-section">
            <h2>Customer</h2>
            <div className="commerce-info-grid">
              <span className="commerce-info-label">Name</span>
              <span className="commerce-info-value">{order.customerName}</span>
              <span className="commerce-info-label">Email</span>
              <span className="commerce-info-value">{order.customerEmail}</span>
            </div>
          </div>

          {/* Shipping */}
          {order.shippingAddress && (
            <div className="commerce-section">
              <h2>Shipping Address</h2>
              <div className="commerce-shipping-block">
                <div>{order.shippingAddress.name}</div>
                <div>{order.shippingAddress.line1}</div>
                {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                <div>
                  {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.postalCode}
                </div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </div>
          )}

          {/* Tracking */}
          <div className="commerce-section">
            <h2>Tracking</h2>
            <div className="commerce-form" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 'var(--af-space-palm)' }}>
              <div className="commerce-form-group" style={{ flex: 1 }}>
                <label className="commerce-label">Tracking Number</label>
                <input
                  type="text"
                  className="commerce-input"
                  placeholder="Enter tracking number..."
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                />
              </div>
              <button
                className="commerce-btn-secondary"
                disabled={saving || trackingInput === (order.trackingNumber || '')}
                onClick={handleSaveTracking}
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="commerce-detail-sidebar">
          <div className="commerce-sidebar-card">
            <h3>Status Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transitions.length === 0 ? (
                <div className="commerce-empty" style={{ padding: 'var(--af-space-palm)' }}>No further actions available.</div>
              ) : (
                transitions.map((next) => {
                  const style = ORDER_STATUS_STYLES[next]
                  return (
                    <button
                      key={next}
                      className="commerce-btn-secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={saving}
                      onClick={() => handleStatusChange(next)}
                    >
                      Mark as {style.label}
                    </button>
                  )
                })
              )}
              {order.status === 'delivered' && (
                <button
                  className="commerce-btn-secondary commerce-btn-danger"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={saving}
                  onClick={() => handleStatusChange('refunded')}
                >
                  Issue Refund
                </button>
              )}
            </div>
            {statusMsg && (
              <div className={`commerce-status-msg ${statusMsg.type}`} style={{ marginTop: 8 }}>
                {statusMsg.text}
              </div>
            )}
          </div>

          <div className="commerce-sidebar-card">
            <h3>Order Info</h3>
            <div className="commerce-info-grid">
              <span className="commerce-info-label">Order ID</span>
              <span className="commerce-info-value">{order.orderId}</span>
              <span className="commerce-info-label">Internal ID</span>
              <span className="commerce-info-value" style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px' }}>{order.id}</span>
              <span className="commerce-info-label">Provider</span>
              <span className="commerce-info-value">{order.storeProvider}</span>
              <span className="commerce-info-label">Currency</span>
              <span className="commerce-info-value">{order.currency}</span>
              <span className="commerce-info-label">Date</span>
              <span className="commerce-info-value" style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px' }}>
                {new Date(order.createdAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="commerce-sidebar-card">
            <h3>Payment</h3>
            <div className="commerce-info-grid">
              <span className="commerce-info-label">Status</span>
              <span className="commerce-info-value">
                {order.status === 'refunded' ? (
                  <span className="commerce-status-chip refunded">Refunded</span>
                ) : order.status === 'cancelled' ? (
                  <span className="commerce-status-chip cancelled">Cancelled</span>
                ) : (
                  <span className="commerce-status-chip delivered">Paid</span>
                )}
              </span>
              <span className="commerce-info-label">Amount</span>
              <span className="commerce-info-value" style={{ fontWeight: 700, color: 'var(--af-terra)' }}>
                {formatOrderTotal(order.total, order.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
