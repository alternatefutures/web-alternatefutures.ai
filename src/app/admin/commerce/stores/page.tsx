'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchAllConnections,
  createConnection,
  updateConnection,
  deleteConnection,
  PROVIDER_INFO,
  type StoreConnection,
  type StoreProvider,
  type ConnectionStatus,
  type CreateStoreConnectionInput,
} from '@/lib/store-connection-api'
import { getCookieValue } from '@/lib/cookies'
import '../commerce.module.css'

const ALL_PROVIDERS: StoreProvider[] = [
  'shopify',
  'gumroad',
  'printful',
  'gelato',
  'woocommerce',
  'lemon-squeezy',
]

const STATUS_STYLES: Record<ConnectionStatus, { label: string; cls: string }> = {
  connected: { label: 'Connected', cls: 'active' },
  disconnected: { label: 'Disconnected', cls: 'draft' },
  error: { label: 'Error', cls: 'archived' },
}

export default function StoreConnectionsPage() {
  const [connections, setConnections] = useState<StoreConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Form state
  const [formProvider, setFormProvider] = useState<StoreProvider>('shopify')
  const [formName, setFormName] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formApiKey, setFormApiKey] = useState('')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllConnections(token)
      setConnections(data)
      setLoading(false)
    }
    load()
  }, [])

  const resetForm = useCallback(() => {
    setFormProvider('shopify')
    setFormName('')
    setFormUrl('')
    setFormApiKey('')
    setShowAdd(false)
    setEditId(null)
  }, [])

  const openEdit = useCallback((conn: StoreConnection) => {
    setEditId(conn.id)
    setFormProvider(conn.provider)
    setFormName(conn.storeName)
    setFormUrl(conn.storeUrl)
    setFormApiKey('')
    setShowAdd(true)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!formName.trim() || !formUrl.trim()) return
    const token = getCookieValue('af_access_token')

    if (editId) {
      const updated = await updateConnection(token, editId, {
        storeName: formName,
        storeUrl: formUrl,
        ...(formApiKey ? { apiKey: formApiKey } : {}),
      })
      setConnections((prev) => prev.map((c) => (c.id === editId ? updated : c)))
    } else {
      if (!formApiKey.trim()) return
      const input: CreateStoreConnectionInput = {
        provider: formProvider,
        storeName: formName,
        storeUrl: formUrl,
        apiKey: formApiKey,
      }
      const created = await createConnection(token, input)
      setConnections((prev) => [created, ...prev])
    }
    resetForm()
  }, [editId, formProvider, formName, formUrl, formApiKey, resetForm])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Disconnect this store?')) return
    const token = getCookieValue('af_access_token')
    await deleteConnection(token, id)
    setConnections((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const handleSync = useCallback(async (conn: StoreConnection) => {
    const token = getCookieValue('af_access_token')
    const updated = await updateConnection(token, conn.id, {
      status: 'connected',
    })
    setConnections((prev) => prev.map((c) => (c.id === conn.id ? { ...updated, lastSyncAt: new Date().toISOString() } : c)))
  }, [])

  function formatSyncTime(iso: string | null): string {
    if (!iso) return 'Never synced'
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHrs = Math.floor(diffMs / 3600000)
    if (diffHrs < 1) return 'Just now'
    if (diffHrs < 24) return `${diffHrs}h ago`
    const diffDays = Math.floor(diffHrs / 24)
    if (diffDays === 1) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="commerce-dashboard">
        <div className="commerce-header">
          <h1>Store Connections</h1>
        </div>
        <div className="commerce-skeleton">
          {[1, 2, 3].map((i) => (
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

  // Group available providers (not yet connected)
  const connectedProviders = new Set(connections.map((c) => c.provider))
  const availableProviders = ALL_PROVIDERS.filter((p) => !connectedProviders.has(p))

  return (
    <div className="commerce-dashboard">
      <div className="commerce-header">
        <h1>Store Connections</h1>
        <div className="commerce-header-actions">
          <Link href="/admin/commerce" className="commerce-btn-secondary">
            &larr; Commerce Dashboard
          </Link>
          <button className="commerce-btn-primary" onClick={() => { resetForm(); setShowAdd(true) }}>
            + Connect Store
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="commerce-revenue-row">
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Connected</div>
          <div className="commerce-revenue-value">
            {connections.filter((c) => c.status === 'connected').length}
          </div>
          <div className="commerce-revenue-sub">active integrations</div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Total Products</div>
          <div className="commerce-revenue-value">
            {connections.reduce((s, c) => s + c.productCount, 0)}
          </div>
          <div className="commerce-revenue-sub">synced across stores</div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Providers</div>
          <div className="commerce-revenue-value">{connectedProviders.size}</div>
          <div className="commerce-revenue-sub">of {ALL_PROVIDERS.length} available</div>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      {showAdd && (
        <div className="commerce-section" style={{ border: '2px solid var(--af-ultra)', marginBottom: 'var(--af-space-arm)' }}>
          <h2>{editId ? 'Edit Connection' : 'Connect a New Store'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--af-space-hand)' }}>
            {!editId && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontFamily: 'var(--af-font-architect)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--af-stone-500)', marginBottom: 6 }}>
                  Provider
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ALL_PROVIDERS.map((p) => {
                    const info = PROVIDER_INFO[p]
                    const selected = formProvider === p
                    return (
                      <button
                        key={p}
                        onClick={() => setFormProvider(p)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--af-radius-worn)',
                          border: `2px solid ${selected ? info.color : 'var(--af-stone-200)'}`,
                          background: selected ? info.bg : 'var(--af-stone-50)',
                          color: selected ? info.color : 'var(--af-stone-600)',
                          fontFamily: 'var(--af-font-architect)',
                          fontSize: '13px',
                          fontWeight: selected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {info.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--af-font-architect)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--af-stone-500)', marginBottom: 6 }}>
                Store Name
              </label>
              <input
                type="text"
                className="commerce-search"
                placeholder="My Store"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--af-font-architect)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--af-stone-500)', marginBottom: 6 }}>
                Store URL
              </label>
              <input
                type="url"
                className="commerce-search"
                placeholder="https://my-store.example.com"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontFamily: 'var(--af-font-architect)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--af-stone-500)', marginBottom: 6 }}>
                API Key {editId && <span style={{ fontWeight: 400, color: 'var(--af-stone-400)' }}>(leave blank to keep current)</span>}
              </label>
              <input
                type="password"
                className="commerce-search"
                placeholder={editId ? '••••••••' : 'Enter API key or access token'}
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 'var(--af-space-hand)' }}>
            <button className="commerce-btn-primary" onClick={handleSubmit}>
              {editId ? 'Save Changes' : 'Connect'}
            </button>
            <button className="commerce-btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Connection Cards */}
      {connections.length === 0 ? (
        <div className="commerce-empty">
          No store connections yet. Connect your first e-commerce platform to start syncing products.
        </div>
      ) : (
        <div className="commerce-product-grid">
          {connections.map((conn) => {
            const info = PROVIDER_INFO[conn.provider]
            const sts = STATUS_STYLES[conn.status]
            return (
              <div
                key={conn.id}
                className="commerce-product-card"
                style={{ cursor: 'default', borderTop: `3px solid ${info.color}` }}
              >
                <div className="commerce-product-card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 'var(--af-radius-worn)',
                        background: info.bg,
                        color: info.color,
                        fontFamily: 'var(--af-font-architect)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        border: `1px solid ${info.color}30`,
                      }}
                    >
                      {info.label}
                    </span>
                    <span className={`commerce-status-chip ${sts.cls}`}>{sts.label}</span>
                  </div>

                  <div className="commerce-product-card-name">{conn.storeName}</div>

                  <div style={{
                    fontFamily: 'var(--af-font-machine)',
                    fontSize: '11px',
                    color: 'var(--af-stone-400)',
                    marginTop: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {conn.storeUrl}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginTop: 12,
                    padding: '10px 0',
                    borderTop: '1px solid var(--af-stone-100)',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--af-font-architect)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--af-stone-400)' }}>
                        Products
                      </div>
                      <div style={{ fontFamily: 'var(--af-font-architect)', fontSize: '18px', fontWeight: 700, color: 'var(--af-stone-800)' }}>
                        {conn.productCount}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--af-font-architect)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--af-stone-400)' }}>
                        Last Sync
                      </div>
                      <div style={{ fontFamily: 'var(--af-font-architect)', fontSize: '13px', fontWeight: 600, color: 'var(--af-stone-600)' }}>
                        {formatSyncTime(conn.lastSyncAt)}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontFamily: 'var(--af-font-machine)',
                    fontSize: '11px',
                    color: 'var(--af-stone-400)',
                    marginTop: 4,
                  }}>
                    Key: {conn.apiKey}
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    <button
                      className="commerce-btn-secondary commerce-btn-sm"
                      onClick={() => handleSync(conn)}
                    >
                      Sync Now
                    </button>
                    <button
                      className="commerce-btn-secondary commerce-btn-sm"
                      onClick={() => openEdit(conn)}
                    >
                      Edit
                    </button>
                    <button
                      className="commerce-btn-secondary commerce-btn-sm commerce-btn-danger"
                      onClick={() => handleDelete(conn.id)}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Available Providers */}
      {availableProviders.length > 0 && (
        <div className="commerce-section" style={{ marginTop: 'var(--af-space-arm)' }}>
          <h2>Available Integrations</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {availableProviders.map((p) => {
              const info = PROVIDER_INFO[p]
              return (
                <button
                  key={p}
                  className="commerce-product-card"
                  onClick={() => {
                    resetForm()
                    setFormProvider(p)
                    setShowAdd(true)
                  }}
                  style={{
                    cursor: 'pointer',
                    width: 180,
                    textAlign: 'center',
                    padding: 'var(--af-space-hand)',
                    border: `2px dashed ${info.color}40`,
                    background: info.bg,
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: info.color,
                  }}>
                    {info.label}
                  </div>
                  <div style={{
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: '11px',
                    color: 'var(--af-stone-500)',
                    marginTop: 4,
                  }}>
                    Click to connect
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
