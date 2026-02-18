'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchAllProducts,
  formatPrice,
  type Product,
} from '@/lib/commerce-api'
import {
  fetchAllOrders,
  formatOrderTotal,
  type Order,
} from '@/lib/order-api'
import { getCookieValue } from '@/lib/cookies'
import './commerce.module.css'

export default function CommerceDashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [prods, ords] = await Promise.all([
        fetchAllProducts(token),
        fetchAllOrders(token),
      ])
      setProducts(prods)
      setOrders(ords)
      setLoading(false)
    }
    load()
  }, [])

  // Revenue calculations
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const paidOrders = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded'),
    [orders],
  )

  const revenueToday = useMemo(
    () => paidOrders.filter((o) => new Date(o.createdAt) >= todayStart).reduce((s, o) => s + o.total, 0),
    [paidOrders, todayStart],
  )

  const revenueWeek = useMemo(
    () => paidOrders.filter((o) => new Date(o.createdAt) >= weekStart).reduce((s, o) => s + o.total, 0),
    [paidOrders, weekStart],
  )

  const revenueMonth = useMemo(
    () => paidOrders.filter((o) => new Date(o.createdAt) >= monthStart).reduce((s, o) => s + o.total, 0),
    [paidOrders, monthStart],
  )

  const revenueAll = useMemo(
    () => paidOrders.reduce((s, o) => s + o.total, 0),
    [paidOrders],
  )

  // Recent orders (last 5)
  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [orders],
  )

  // Top products by order frequency
  const topProducts = useMemo(() => {
    const freq: Record<string, { name: string; revenue: number; image: string }> = {}
    for (const order of paidOrders) {
      for (const item of order.items) {
        if (!freq[item.sku]) {
          const prod = products.find((p) => p.sku === item.sku || p.variants.some((v) => v.sku === item.sku))
          freq[item.sku] = { name: item.productName, revenue: 0, image: prod?.images[0] || '' }
        }
        freq[item.sku].revenue += item.unitPrice * item.quantity
      }
    }
    return Object.values(freq).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [paidOrders, products])

  // Low stock alerts (physical products with inventory < 50)
  const lowStock = useMemo(
    () => products.filter((p) => p.inventory >= 0 && p.inventory < 50 && p.status === 'active')
      .sort((a, b) => a.inventory - b.inventory)
      .slice(0, 5),
    [products],
  )

  if (loading) {
    return (
      <div className="commerce-dashboard">
        <div className="commerce-header">
          <h1>Commerce</h1>
        </div>
        <div className="commerce-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="commerce-skeleton-row">
              <div className="commerce-skeleton-block w-40" />
              <div className="commerce-skeleton-block w-20" />
              <div className="commerce-skeleton-block w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="commerce-dashboard">
      <div className="commerce-header">
        <h1>Commerce</h1>
        <div className="commerce-header-actions">
          <Link href="/admin/commerce/products/new" className="commerce-btn-primary">
            + New Product
          </Link>
          <Link href="/admin/commerce/orders" className="commerce-btn-secondary">
            All Orders
          </Link>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="commerce-revenue-row">
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Today</div>
          <div className="commerce-revenue-value">{formatPrice(revenueToday)}</div>
          <div className="commerce-revenue-sub">
            {paidOrders.filter((o) => new Date(o.createdAt) >= todayStart).length} orders
          </div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">This Week</div>
          <div className="commerce-revenue-value">{formatPrice(revenueWeek)}</div>
          <div className="commerce-revenue-sub">
            {paidOrders.filter((o) => new Date(o.createdAt) >= weekStart).length} orders
          </div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">This Month</div>
          <div className="commerce-revenue-value">{formatPrice(revenueMonth)}</div>
          <div className="commerce-revenue-sub">
            {paidOrders.filter((o) => new Date(o.createdAt) >= monthStart).length} orders
          </div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">All Time</div>
          <div className="commerce-revenue-value">{formatPrice(revenueAll)}</div>
          <div className="commerce-revenue-sub">{paidOrders.length} orders</div>
        </div>
      </div>

      <div className="commerce-section-grid">
        {/* Recent Orders */}
        <div className="commerce-section">
          <h2>Recent Orders</h2>
          {recentOrders.map((order) => (
            <div key={order.id} className="commerce-low-stock-item">
              <div>
                <Link href={`/admin/commerce/orders/${order.id}`} className="commerce-table-link">
                  {order.orderId}
                </Link>
                <span style={{ marginLeft: 8, fontFamily: 'var(--af-font-architect)', fontSize: '12px', color: 'var(--af-stone-500)' }}>
                  {order.customerName}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`commerce-status-chip ${order.status}`}>
                  {order.status}
                </span>
                <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: '13px', fontWeight: 600, color: 'var(--af-stone-800)' }}>
                  {formatOrderTotal(order.total, order.currency)}
                </span>
              </div>
            </div>
          ))}
          <div style={{ paddingTop: 'var(--af-space-palm)' }}>
            <Link href="/admin/commerce/orders" className="commerce-back-link">
              View all orders &rarr;
            </Link>
          </div>
        </div>

        {/* Top Products */}
        <div className="commerce-section">
          <h2>Top Products</h2>
          {topProducts.map((p, i) => (
            <div key={p.name} className="commerce-top-product">
              <span className="commerce-top-product-rank">#{i + 1}</span>
              {p.image && (
                <img src={p.image} alt={p.name} className="commerce-top-product-img" />
              )}
              <span className="commerce-top-product-name">{p.name}</span>
              <span className="commerce-top-product-revenue">{formatPrice(p.revenue)}</span>
            </div>
          ))}
          <div style={{ paddingTop: 'var(--af-space-palm)' }}>
            <Link href="/admin/commerce/products" className="commerce-back-link">
              View all products &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Low Stock + Quick Actions */}
      <div className="commerce-section-grid">
        <div className="commerce-section">
          <h2>Low Stock Alerts</h2>
          {lowStock.length === 0 ? (
            <div className="commerce-empty">All products are well-stocked.</div>
          ) : (
            lowStock.map((p) => (
              <div key={p.id} className="commerce-low-stock-item">
                <Link href={`/admin/commerce/products/${p.id}`} className="commerce-low-stock-name">
                  {p.name}
                </Link>
                <span className="commerce-low-stock-count">{p.inventory} left</span>
              </div>
            ))
          )}
        </div>

        <div className="commerce-section">
          <h2>Quick Actions</h2>
          <div className="commerce-quick-actions">
            <Link href="/admin/commerce/products/new" className="commerce-btn-secondary commerce-btn-sm">
              + Add Product
            </Link>
            <Link href="/admin/commerce/products" className="commerce-btn-secondary commerce-btn-sm">
              Manage Products
            </Link>
            <Link href="/admin/commerce/orders" className="commerce-btn-secondary commerce-btn-sm">
              Process Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
