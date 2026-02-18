'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  fetchProductById,
  updateProduct,
  deleteProduct,
  formatPrice,
  type Product,
  type ProductType,
  type ProductCategory,
  type ProductStatus,
  type UpdateProductInput,
} from '@/lib/commerce-api'
import {
  fetchAllOrders,
  formatOrderTotal,
  type Order,
} from '@/lib/order-api'
import { getCookieValue } from '@/lib/cookies'
import '../../commerce.module.css'

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [product, setProduct] = useState<Product | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Edit fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ProductType>('physical')
  const [category, setCategory] = useState<ProductCategory>('merch')
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [sku, setSku] = useState('')
  const [inventory, setInventory] = useState('')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<ProductStatus>('draft')
  const [fulfillmentProvider, setFulfillmentProvider] = useState('')

  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [prod, allOrders] = await Promise.all([
        fetchProductById(token, id),
        fetchAllOrders(token),
      ])
      if (prod) {
        setProduct(prod)
        setName(prod.name)
        setSlug(prod.slug)
        setDescription(prod.description)
        setType(prod.type)
        setCategory(prod.category)
        setPrice((prod.price / 100).toFixed(2))
        setCompareAtPrice(prod.compareAtPrice ? (prod.compareAtPrice / 100).toFixed(2) : '')
        setSku(prod.sku)
        setInventory(String(prod.inventory))
        setTags(prod.tags.join(', '))
        setImageUrl(prod.images[0] || '')
        setStatus(prod.status)
        setFulfillmentProvider(prod.fulfillmentProvider || '')
      }
      // Filter orders containing this product
      const productOrders = allOrders.filter((o) =>
        o.items.some((item) => item.sku === prod?.sku || prod?.variants.some((v) => v.sku === item.sku)),
      )
      setOrders(productOrders)
      setLoading(false)
    }
    load()
  }, [id])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const input: UpdateProductInput = {
        name: name.trim(),
        slug,
        description: description.trim(),
        type,
        category,
        price: Math.round(parseFloat(price || '0') * 100),
        compareAtPrice: compareAtPrice ? Math.round(parseFloat(compareAtPrice) * 100) : null,
        sku: sku.trim(),
        inventory: parseInt(inventory, 10),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
        status,
        fulfillmentProvider: fulfillmentProvider.trim() || null,
      }
      const updated = await updateProduct(token, id, input)
      setProduct(updated)
      setStatusMsg({ type: 'success', text: 'Product saved.' })
    } catch (err) {
      setStatusMsg({ type: 'error', text: err instanceof Error ? err.message : 'Save failed' })
    } finally {
      setSaving(false)
    }
  }, [id, name, slug, description, type, category, price, compareAtPrice, sku, inventory, tags, imageUrl, status, fulfillmentProvider])

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this product permanently?')) return
    const token = getCookieValue('af_access_token')
    await deleteProduct(token, id)
    router.push('/admin/commerce/products')
  }, [id, router])

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

  if (!product) {
    return (
      <div className="commerce-dashboard">
        <div className="commerce-header">
          <h1>Product not found</h1>
        </div>
        <Link href="/admin/commerce/products" className="commerce-back-link">
          &larr; Back to Products
        </Link>
      </div>
    )
  }

  // Sales analytics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => {
      const items = o.items.filter((i) => i.sku === product.sku || product.variants.some((v) => v.sku === i.sku))
      return sum + items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    }, 0)

  const totalUnitsSold = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => {
      const items = o.items.filter((i) => i.sku === product.sku || product.variants.some((v) => v.sku === i.sku))
      return sum + items.reduce((s, i) => s + i.quantity, 0)
    }, 0)

  return (
    <div className="commerce-dashboard">
      <div className="commerce-header">
        <div>
          <Link href="/admin/commerce/products" className="commerce-back-link">
            &larr; Back to Products
          </Link>
          <h1 style={{ marginTop: 8 }}>{product.name}</h1>
        </div>
      </div>

      <div className="commerce-detail-layout">
        <div className="commerce-detail-main">
          {/* Edit form */}
          <div className="commerce-section">
            <h2>Edit Product</h2>
            <div className="commerce-form">
              <div className="commerce-form-group">
                <label className="commerce-label">Name</label>
                <input type="text" className="commerce-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="commerce-form-group">
                <label className="commerce-label">Slug</label>
                <input type="text" className="commerce-input" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
              <div className="commerce-form-group">
                <label className="commerce-label">Description</label>
                <textarea className="commerce-textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
              <div className="commerce-form-row">
                <div className="commerce-form-group">
                  <label className="commerce-label">Type</label>
                  <select className="commerce-select" value={type} onChange={(e) => setType(e.target.value as ProductType)}>
                    <option value="physical">Physical</option>
                    <option value="digital">Digital</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div className="commerce-form-group">
                  <label className="commerce-label">Category</label>
                  <select className="commerce-select" value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}>
                    <option value="merch">Merch</option>
                    <option value="apparel">Apparel</option>
                    <option value="sticker">Sticker</option>
                    <option value="digital-download">Digital Download</option>
                    <option value="course">Course</option>
                    <option value="membership">Membership</option>
                  </select>
                </div>
              </div>
              <div className="commerce-form-row three">
                <div className="commerce-form-group">
                  <label className="commerce-label">Price ($)</label>
                  <input type="number" className="commerce-input" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="commerce-form-group">
                  <label className="commerce-label">Compare-at ($)</label>
                  <input type="number" className="commerce-input" step="0.01" min="0" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
                </div>
                <div className="commerce-form-group">
                  <label className="commerce-label">Status</label>
                  <select className="commerce-select" value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="commerce-form-row three">
                <div className="commerce-form-group">
                  <label className="commerce-label">SKU</label>
                  <input type="text" className="commerce-input" value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
                <div className="commerce-form-group">
                  <label className="commerce-label">Inventory</label>
                  <input type="number" className="commerce-input" min="-1" value={inventory} onChange={(e) => setInventory(e.target.value)} />
                </div>
                <div className="commerce-form-group">
                  <label className="commerce-label">Fulfillment</label>
                  <input type="text" className="commerce-input" value={fulfillmentProvider} onChange={(e) => setFulfillmentProvider(e.target.value)} />
                </div>
              </div>
              <div className="commerce-form-group">
                <label className="commerce-label">Image URL</label>
                <input type="text" className="commerce-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>
              {imageUrl.trim() && (
                <img src={imageUrl.trim()} alt="Preview" className="commerce-image-preview" />
              )}
              <div className="commerce-form-group">
                <label className="commerce-label">Tags (comma-separated)</label>
                <input type="text" className="commerce-input" value={tags} onChange={(e) => setTags(e.target.value)} />
                {tags.trim() && (
                  <div className="commerce-tags" style={{ marginTop: 4 }}>
                    {tags.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                      <span key={t} className="commerce-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="commerce-section">
            <h2>Order History ({orders.length})</h2>
            {orders.length === 0 ? (
              <div className="commerce-empty">No orders for this product yet.</div>
            ) : (
              <div className="commerce-table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="commerce-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((o) => (
                      <tr key={o.id}>
                        <td>
                          <Link href={`/admin/commerce/orders/${o.id}`} className="commerce-table-link">
                            {o.orderId}
                          </Link>
                        </td>
                        <td>{o.customerName}</td>
                        <td><span className={`commerce-status-chip ${o.status}`}>{o.status}</span></td>
                        <td>{formatOrderTotal(o.total, o.currency)}</td>
                        <td style={{ fontFamily: 'var(--af-font-machine)', fontSize: '12px', color: 'var(--af-stone-400)' }}>
                          {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="commerce-detail-sidebar">
          <div className="commerce-sidebar-card">
            <h3>Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="commerce-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="commerce-btn-secondary commerce-btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleDelete}
              >
                Delete Product
              </button>
            </div>
            {statusMsg && (
              <div className={`commerce-status-msg ${statusMsg.type}`} style={{ marginTop: 8 }}>
                {statusMsg.text}
              </div>
            )}
          </div>

          <div className="commerce-sidebar-card">
            <h3>Sales Analytics</h3>
            <div className="commerce-info-grid">
              <span className="commerce-info-label">Revenue</span>
              <span className="commerce-info-value" style={{ fontWeight: 700, color: 'var(--af-terra)' }}>{formatPrice(totalRevenue)}</span>
              <span className="commerce-info-label">Units Sold</span>
              <span className="commerce-info-value">{totalUnitsSold}</span>
              <span className="commerce-info-label">Orders</span>
              <span className="commerce-info-value">{orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded').length}</span>
            </div>
          </div>

          <div className="commerce-sidebar-card">
            <h3>Product Info</h3>
            <div className="commerce-info-grid">
              <span className="commerce-info-label">ID</span>
              <span className="commerce-info-value" style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px' }}>{product.id}</span>
              <span className="commerce-info-label">Status</span>
              <span className="commerce-info-value"><span className={`commerce-status-chip ${product.status}`}>{product.status}</span></span>
              <span className="commerce-info-label">Brand OK</span>
              <span className="commerce-info-value">{product.brandCompliant ? 'Yes' : 'No'}</span>
              <span className="commerce-info-label">Created</span>
              <span className="commerce-info-value" style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px' }}>
                {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="commerce-info-label">Updated</span>
              <span className="commerce-info-value" style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px' }}>
                {new Date(product.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {product.variants.length > 0 && (
            <div className="commerce-sidebar-card">
              <h3>Variants ({product.variants.length})</h3>
              {product.variants.map((v) => (
                <div key={v.id} className="commerce-low-stock-item">
                  <span className="commerce-low-stock-name">{v.name}</span>
                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px', color: 'var(--af-stone-500)' }}>
                    {v.inventory} in stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
