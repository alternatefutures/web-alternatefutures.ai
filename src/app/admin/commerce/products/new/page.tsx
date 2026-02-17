'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createProduct,
  type CreateProductInput,
  type ProductType,
  type ProductCategory,
  type ProductStatus,
} from '@/lib/commerce-api'
import { getCookieValue } from '@/lib/cookies'
import '../../commerce.css'

export default function CreateProductPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ProductType>('physical')
  const [category, setCategory] = useState<ProductCategory>('merch')
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [imageUrl, setImageUrl] = useState('')
  const [sku, setSku] = useState('')
  const [inventory, setInventory] = useState('')
  const [tags, setTags] = useState('')
  const [fulfillmentProvider, setFulfillmentProvider] = useState('')
  const [status, setStatus] = useState<ProductStatus>('draft')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-slug from name
  const handleNameChange = useCallback((val: string) => {
    setName(val)
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val))
    }
  }, [name, slug])

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleSubmit = useCallback(async (publishStatus: ProductStatus) => {
    if (!name.trim() || !sku.trim()) {
      setError('Name and SKU are required.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const token = getCookieValue('af_access_token')
      const priceInCents = Math.round(parseFloat(price || '0') * 100)
      const compareInCents = compareAtPrice ? Math.round(parseFloat(compareAtPrice) * 100) : undefined

      const input: CreateProductInput = {
        name: name.trim(),
        slug: slug || slugify(name),
        description: description.trim(),
        type,
        category,
        price: priceInCents,
        compareAtPrice: compareInCents,
        currency,
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        status: publishStatus,
        sku: sku.trim(),
        inventory: inventory ? parseInt(inventory, 10) : type === 'digital' ? -1 : 0,
        fulfillmentProvider: fulfillmentProvider.trim() || undefined,
      }

      const product = await createProduct(token, input)
      router.push(`/admin/commerce/products/${product.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }, [name, slug, description, type, category, price, compareAtPrice, currency, imageUrl, sku, inventory, tags, fulfillmentProvider, router])

  return (
    <div className="commerce-dashboard">
      <div className="commerce-header">
        <div>
          <Link href="/admin/commerce/products" className="commerce-back-link">
            &larr; Back to Products
          </Link>
          <h1 style={{ marginTop: 8 }}>Create Product</h1>
        </div>
      </div>

      <div className="commerce-detail-layout">
        <div className="commerce-detail-main">
          {/* Basic Info */}
          <div className="commerce-section">
            <h2>Basic Information</h2>
            <div className="commerce-form">
              <div className="commerce-form-group">
                <label className="commerce-label">Product Name *</label>
                <input
                  type="text"
                  className="commerce-input"
                  placeholder="AF Classic Tee — Terracotta"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="commerce-form-group">
                <label className="commerce-label">URL Slug</label>
                <input
                  type="text"
                  className="commerce-input"
                  placeholder="af-classic-tee-terracotta"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
              <div className="commerce-form-group">
                <label className="commerce-label">Description</label>
                <textarea
                  className="commerce-textarea"
                  placeholder="Describe this product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
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
            </div>
          </div>

          {/* Pricing */}
          <div className="commerce-section">
            <h2>Pricing</h2>
            <div className="commerce-form">
              <div className="commerce-form-row three">
                <div className="commerce-form-group">
                  <label className="commerce-label">Price ($)</label>
                  <input
                    type="number"
                    className="commerce-input"
                    placeholder="29.99"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="commerce-form-group">
                  <label className="commerce-label">Compare-at Price ($)</label>
                  <input
                    type="number"
                    className="commerce-input"
                    placeholder="39.99"
                    step="0.01"
                    min="0"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                  />
                </div>
                <div className="commerce-form-group">
                  <label className="commerce-label">Currency</label>
                  <select className="commerce-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="commerce-section">
            <h2>Inventory</h2>
            <div className="commerce-form">
              <div className="commerce-form-row three">
                <div className="commerce-form-group">
                  <label className="commerce-label">SKU *</label>
                  <input
                    type="text"
                    className="commerce-input"
                    placeholder="TEE-TERRA"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
                <div className="commerce-form-group">
                  <label className="commerce-label">Quantity</label>
                  <input
                    type="number"
                    className="commerce-input"
                    placeholder={type === 'digital' ? '-1 (unlimited)' : '100'}
                    min="-1"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                  />
                </div>
                <div className="commerce-form-group">
                  <label className="commerce-label">Fulfillment Provider</label>
                  <input
                    type="text"
                    className="commerce-input"
                    placeholder="Printful, Gelato..."
                    value={fulfillmentProvider}
                    onChange={(e) => setFulfillmentProvider(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="commerce-section">
            <h2>Media</h2>
            <div className="commerce-form">
              <div className="commerce-form-group">
                <label className="commerce-label">Image URL</label>
                <input
                  type="text"
                  className="commerce-input"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              {imageUrl.trim() && (
                <img src={imageUrl.trim()} alt="Preview" className="commerce-image-preview" />
              )}
            </div>
          </div>

          {/* Tags & SEO */}
          <div className="commerce-section">
            <h2>Tags &amp; SEO</h2>
            <div className="commerce-form">
              <div className="commerce-form-group">
                <label className="commerce-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="commerce-input"
                  placeholder="apparel, bestseller, unisex"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                {tags.trim() && (
                  <div className="commerce-tags" style={{ marginTop: 4 }}>
                    {tags.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                      <span key={t} className="commerce-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="commerce-form-group">
                <label className="commerce-label">SEO Title</label>
                <input
                  type="text"
                  className="commerce-input"
                  placeholder="Page title for search engines"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div className="commerce-form-group">
                <label className="commerce-label">SEO Description</label>
                <textarea
                  className="commerce-textarea"
                  placeholder="Meta description..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="commerce-detail-sidebar">
          <div className="commerce-sidebar-card">
            <h3>Publish</h3>
            <div className="commerce-form-actions" style={{ borderTop: 'none', paddingTop: 0, flexDirection: 'column' }}>
              <button
                className="commerce-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={saving}
                onClick={() => handleSubmit('active')}
              >
                {saving ? 'Saving...' : 'Publish'}
              </button>
              <button
                className="commerce-btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={saving}
                onClick={() => handleSubmit('draft')}
              >
                Save as Draft
              </button>
            </div>
          </div>

          <div className="commerce-sidebar-card">
            <h3>Summary</h3>
            <div className="commerce-info-grid">
              <span className="commerce-info-label">Type</span>
              <span className="commerce-info-value">{type}</span>
              <span className="commerce-info-label">Category</span>
              <span className="commerce-info-value">{category}</span>
              <span className="commerce-info-label">Price</span>
              <span className="commerce-info-value">{price ? `$${price}` : '—'}</span>
              <span className="commerce-info-label">SKU</span>
              <span className="commerce-info-value">{sku || '—'}</span>
            </div>
          </div>

          {error && (
            <div className="commerce-status-msg error">{error}</div>
          )}
        </div>
      </div>
    </div>
  )
}
