'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchAllProducts,
  deleteProduct,
  formatPrice,
  type Product,
  type ProductCategory,
  type ProductStatus,
} from '@/lib/commerce-api'
import { getCookieValue } from '@/lib/cookies'
import '../commerce.module.css'

type ViewMode = 'grid' | 'list'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | ''>('')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllProducts(token)
      setProducts(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = products
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter)
    }
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter)
    }
    return result
  }, [products, search, categoryFilter, statusFilter])

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((p) => p.id)))
    }
  }, [selected, filtered])

  const handleBulkDelete = useCallback(async () => {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} product(s)?`)) return
    const token = getCookieValue('af_access_token')
    for (const id of selected) {
      await deleteProduct(token, id)
    }
    setProducts((prev) => prev.filter((p) => !selected.has(p.id)))
    setSelected(new Set())
  }, [selected])

  function stockLabel(p: Product) {
    if (p.inventory < 0) return { text: 'Unlimited', cls: 'unlimited' }
    if (p.inventory < 20) return { text: `${p.inventory} left`, cls: 'low' }
    return { text: `${p.inventory} in stock`, cls: '' }
  }

  if (loading) {
    return (
      <div className="commerce-dashboard">
        <div className="commerce-header">
          <h1>Products</h1>
        </div>
        <div className="commerce-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
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
        <h1>Products</h1>
        <div className="commerce-header-actions">
          {selected.size > 0 && (
            <button className="commerce-btn-secondary commerce-btn-sm commerce-btn-danger" onClick={handleBulkDelete}>
              Delete ({selected.size})
            </button>
          )}
          <Link href="/admin/commerce/products/new" className="commerce-btn-primary">
            + New Product
          </Link>
        </div>
      </div>

      <div className="commerce-filters">
        <input
          type="text"
          className="commerce-search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="commerce-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | '')}
        >
          <option value="">All Categories</option>
          <option value="apparel">Apparel</option>
          <option value="merch">Merch</option>
          <option value="sticker">Stickers</option>
          <option value="digital-download">Digital Downloads</option>
          <option value="course">Courses</option>
          <option value="membership">Memberships</option>
        </select>
        <select
          className="commerce-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProductStatus | '')}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <div className="commerce-view-toggle">
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
            Grid
          </button>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
            List
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="commerce-empty">No products match your filters.</div>
      ) : viewMode === 'grid' ? (
        <div className="commerce-product-grid">
          {filtered.map((p) => {
            const stock = stockLabel(p)
            return (
              <Link key={p.id} href={`/admin/commerce/products/${p.id}`} className="commerce-product-card">
                {p.images[0] && (
                  <img src={p.images[0]} alt={p.name} className="commerce-product-card-img" />
                )}
                <div className="commerce-product-card-body">
                  <div className="commerce-product-card-name">{p.name}</div>
                  <div className="commerce-product-card-meta">
                    <div>
                      <span className="commerce-product-card-price">{formatPrice(p.price, p.currency)}</span>
                      {p.compareAtPrice && (
                        <span className="commerce-product-card-compare">{formatPrice(p.compareAtPrice, p.currency)}</span>
                      )}
                    </div>
                    <span className={`commerce-status-chip ${p.status}`}>{p.status}</span>
                  </div>
                  <div className={`commerce-product-card-stock ${stock.cls}`}>{stock.text}</div>
                  {p.tags.length > 0 && (
                    <div className="commerce-tags" style={{ marginTop: 6 }}>
                      {p.tags.slice(0, 3).map((t) => (
                        <span key={t} className="commerce-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="commerce-product-list">
          <div className="commerce-product-list-row" style={{ background: 'var(--af-stone-100)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--af-stone-600)' }}>
            <input
              type="checkbox"
              checked={selected.size === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
              style={{ width: 16, height: 16, accentColor: 'var(--af-ultra)' }}
            />
            <span className="commerce-product-list-img" style={{ visibility: 'hidden' }} />
            <span className="commerce-product-list-name">Product</span>
            <span className="commerce-product-list-price">Price</span>
            <span className="commerce-product-list-stock">Stock</span>
            <span style={{ width: 80, textAlign: 'center' }}>Status</span>
          </div>
          {filtered.map((p) => {
            const stock = stockLabel(p)
            return (
              <div key={p.id} className="commerce-product-list-row">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  style={{ width: 16, height: 16, accentColor: 'var(--af-ultra)' }}
                />
                {p.images[0] ? (
                  <img src={p.images[0]} alt={p.name} className="commerce-product-list-img" />
                ) : (
                  <span className="commerce-product-list-img" style={{ background: 'var(--af-stone-100)' }} />
                )}
                <Link href={`/admin/commerce/products/${p.id}`} className="commerce-product-list-name commerce-table-link">
                  {p.name}
                </Link>
                <span className="commerce-product-list-price">{formatPrice(p.price, p.currency)}</span>
                <span className={`commerce-product-list-stock ${stock.cls}`}>{stock.text}</span>
                <span style={{ width: 80, textAlign: 'center' }}>
                  <span className={`commerce-status-chip ${p.status}`}>{p.status}</span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
