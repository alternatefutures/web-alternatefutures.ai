'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  fetchAllSchemaMarkups,
  createSchemaMarkup,
  updateSchemaMarkup,
  deleteSchemaMarkup,
  SCHEMA_TYPE_LABELS,
  type SchemaMarkup,
  type SchemaType,
  type SchemaValidationStatus,
  type CreateSchemaMarkupInput,
  type UpdateSchemaMarkupInput,
} from '@/lib/aeo-api'
import { getCookieValue } from '@/lib/cookies'
import Link from 'next/link'
import '../aeo.css'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ALL_SCHEMA_TYPES: SchemaType[] = [
  'FAQ_PAGE', 'HOW_TO', 'ARTICLE', 'BLOG_POSTING', 'ORGANIZATION',
  'SOFTWARE_APPLICATION', 'PRODUCT', 'BREADCRUMB_LIST', 'PERSON',
]

function formatDate(iso: string | null): string {
  if (!iso) return '--'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function validationLabel(status: SchemaValidationStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function prettyJsonLd(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

function generateTemplate(type: SchemaType, url: string): string {
  const templates: Record<SchemaType, object> = {
    FAQ_PAGE: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Your question here',
          acceptedAnswer: { '@type': 'Answer', text: 'Your answer here' },
        },
      ],
    },
    HOW_TO: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to...',
      step: [
        { '@type': 'HowToStep', text: 'Step 1' },
        { '@type': 'HowToStep', text: 'Step 2' },
      ],
    },
    ARTICLE: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Article title',
      author: { '@type': 'Organization', name: 'Alternate Futures' },
      datePublished: new Date().toISOString().slice(0, 10),
    },
    BLOG_POSTING: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: 'Blog post title',
      author: { '@type': 'Organization', name: 'Alternate Futures' },
      datePublished: new Date().toISOString().slice(0, 10),
    },
    ORGANIZATION: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Alternate Futures',
      url: 'https://alternatefutures.ai',
      logo: 'https://alternatefutures.ai/logo.png',
    },
    SOFTWARE_APPLICATION: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Application name',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
    },
    PRODUCT: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Product name',
      description: 'Product description',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    BREADCRUMB_LIST: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://alternatefutures.ai' },
        { '@type': 'ListItem', position: 2, name: 'Page', item: url || 'https://alternatefutures.ai/page' },
      ],
    },
    PERSON: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Person name',
      jobTitle: 'Title',
      worksFor: { '@type': 'Organization', name: 'Alternate Futures' },
    },
  }
  return JSON.stringify(templates[type], null, 2)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SchemaEditorPage() {
  const [schemas, setSchemas] = useState<SchemaMarkup[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [editingSchema, setEditingSchema] = useState<SchemaMarkup | null>(null)
  const [formUrl, setFormUrl] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState<SchemaType>('FAQ_PAGE')
  const [formJsonLd, setFormJsonLd] = useState('')
  const [formAuto, setFormAuto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Preview panel
  const [previewSchema, setPreviewSchema] = useState<SchemaMarkup | null>(null)

  // Scanner
  const [scanUrl, setScanUrl] = useState('')
  const [scanning, setScanning] = useState(false)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<SchemaMarkup | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllSchemaMarkups(token)
      setSchemas(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = schemas
    if (filterType !== 'ALL') {
      result = result.filter((s) => s.schemaType === filterType)
    }
    if (filterStatus !== 'ALL') {
      result = result.filter((s) => s.validationStatus === filterStatus)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.pageTitle.toLowerCase().includes(q) ||
          s.pageUrl.toLowerCase().includes(q),
      )
    }
    return result
  }, [schemas, filterType, filterStatus, searchQuery])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of schemas) {
      counts[s.schemaType] = (counts[s.schemaType] || 0) + 1
    }
    return counts
  }, [schemas])

  const openCreate = useCallback(() => {
    setEditingSchema(null)
    setFormUrl('')
    setFormTitle('')
    setFormType('FAQ_PAGE')
    setFormJsonLd(generateTemplate('FAQ_PAGE', ''))
    setFormAuto(false)
    setSaveError('')
    setShowDialog(true)
  }, [])

  const openEdit = useCallback((schema: SchemaMarkup) => {
    setEditingSchema(schema)
    setFormUrl(schema.pageUrl)
    setFormTitle(schema.pageTitle)
    setFormType(schema.schemaType)
    setFormJsonLd(prettyJsonLd(schema.jsonLd))
    setFormAuto(schema.isAutoGenerated)
    setSaveError('')
    setShowDialog(true)
  }, [])

  const handleTypeChange = useCallback((type: SchemaType) => {
    setFormType(type)
    if (!editingSchema) {
      setFormJsonLd(generateTemplate(type, formUrl))
    }
  }, [editingSchema, formUrl])

  const handleSave = useCallback(async () => {
    if (!formUrl.trim() || !formTitle.trim()) {
      setSaveError('URL and Title are required.')
      return
    }
    // Validate JSON-LD
    try {
      JSON.parse(formJsonLd)
    } catch {
      setSaveError('Invalid JSON-LD. Please fix the JSON syntax.')
      return
    }

    setSaving(true)
    setSaveError('')

    try {
      const token = getCookieValue('af_access_token')

      if (editingSchema) {
        const input: UpdateSchemaMarkupInput = {
          pageTitle: formTitle,
          schemaType: formType,
          jsonLd: formJsonLd,
        }
        const updated = await updateSchemaMarkup(token, editingSchema.id, input)
        setSchemas((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      } else {
        const input: CreateSchemaMarkupInput = {
          pageUrl: formUrl,
          pageTitle: formTitle,
          schemaType: formType,
          jsonLd: formJsonLd,
          isAutoGenerated: formAuto,
        }
        const created = await createSchemaMarkup(token, input)
        setSchemas((prev) => [created, ...prev])
      }

      setShowDialog(false)
    } catch {
      setSaveError('Failed to save schema. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [formUrl, formTitle, formType, formJsonLd, formAuto, editingSchema])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteSchemaMarkup(token, deleteTarget.id)
      setSchemas((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      setDeleteTarget(null)
      if (previewSchema?.id === deleteTarget.id) setPreviewSchema(null)
    } catch {
      // silent
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, previewSchema])

  const handleScan = useCallback(async () => {
    if (!scanUrl.trim()) return
    setScanning(true)
    // Simulate URL scanning delay
    await new Promise((r) => setTimeout(r, 1200))
    setFormUrl(scanUrl)
    setFormTitle(scanUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''))
    setScanUrl('')
    setScanning(false)
    setShowDialog(true)
  }, [scanUrl])

  if (loading) {
    return <div className="aeo-loading">Loading schema markup data...</div>
  }

  return (
    <>
      {/* Header */}
      <div className="aeo-header">
        <h1>Schema Markup Editor</h1>
        <div className="aeo-header-actions">
          <Link href="/admin/aeo" className="aeo-btn-secondary">
            Dashboard
          </Link>
          <button className="aeo-btn-primary" onClick={openCreate}>
            + New Schema
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="aeo-stats">
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Total Schemas</div>
          <div className="aeo-stat-value">{schemas.length}</div>
        </div>
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Valid</div>
          <div className="aeo-stat-value">
            {schemas.filter((s) => s.validationStatus === 'VALID').length}
          </div>
        </div>
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Warnings</div>
          <div className="aeo-stat-value">
            {schemas.filter((s) => s.validationStatus === 'WARNING').length}
          </div>
        </div>
        <div className="aeo-stat-card">
          <div className="aeo-stat-label">Deployed</div>
          <div className="aeo-stat-value">
            {schemas.filter((s) => s.injectedAt).length}
          </div>
        </div>
      </div>

      {/* URL Scanner */}
      <div className="aeo-section">
        <h3>URL Scanner</h3>
        <div style={{ display: 'flex', gap: 'var(--af-space-palm)' }}>
          <input
            className="aeo-search"
            placeholder="Enter a URL to scan and generate schema..."
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
          <button
            className="aeo-btn-primary"
            onClick={handleScan}
            disabled={scanning || !scanUrl.trim()}
          >
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="aeo-filters">
        <input
          className="aeo-search"
          placeholder="Search by page title or URL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="aeo-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="ALL">All Types</option>
          {ALL_SCHEMA_TYPES.map((t) => (
            <option key={t} value={t}>
              {SCHEMA_TYPE_LABELS[t]} ({typeCounts[t] || 0})
            </option>
          ))}
        </select>
        <select
          className="aeo-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="VALID">Valid</option>
          <option value="WARNING">Warning</option>
          <option value="ERROR">Error</option>
        </select>
      </div>

      {/* Schema List */}
      <div className="aeo-section">
        <div className="aeo-table-wrap">
          <table className="aeo-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Type</th>
                <th>Status</th>
                <th>Auto</th>
                <th>Deployed</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="aeo-empty">No schema entries found.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((schema) => (
                  <tr key={schema.id}>
                    <td>
                      <div className="aeo-card-title">{schema.pageTitle}</div>
                      <div className="aeo-card-url" style={{ fontSize: '11px' }}>
                        {schema.pageUrl}
                      </div>
                    </td>
                    <td>
                      <span className="aeo-schema-type-chip">
                        {SCHEMA_TYPE_LABELS[schema.schemaType]}
                      </span>
                    </td>
                    <td>
                      <span className={`aeo-validation-chip ${schema.validationStatus.toLowerCase()}`}>
                        {schema.validationStatus === 'VALID' && '\u2713 '}
                        {schema.validationStatus === 'WARNING' && '\u26A0 '}
                        {schema.validationStatus === 'ERROR' && '\u2717 '}
                        {validationLabel(schema.validationStatus)}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--af-font-architect)',
                        fontSize: '11px',
                        color: schema.isAutoGenerated ? 'var(--af-ultra)' : 'var(--af-stone-500)',
                      }}>
                        {schema.isAutoGenerated ? 'Auto' : 'Manual'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--af-font-architect)',
                        fontSize: '11px',
                        color: schema.injectedAt ? 'var(--af-signal-go)' : 'var(--af-stone-400)',
                      }}>
                        {schema.injectedAt ? formatDate(schema.injectedAt) : 'Not deployed'}
                      </span>
                    </td>
                    <td style={{
                      fontFamily: 'var(--af-font-architect)',
                      fontSize: '11px',
                    }}>
                      {formatDate(schema.updatedAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="aeo-action-btn"
                          onClick={() => setPreviewSchema(previewSchema?.id === schema.id ? null : schema)}
                        >
                          {previewSchema?.id === schema.id ? 'Hide' : 'Preview'}
                        </button>
                        <button
                          className="aeo-action-btn"
                          onClick={() => openEdit(schema)}
                        >
                          Edit
                        </button>
                        <button
                          className="aeo-action-btn danger"
                          onClick={() => setDeleteTarget(schema)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON-LD Preview Panel */}
      {previewSchema && (
        <div className="aeo-section">
          <h2>JSON-LD Preview: {previewSchema.pageTitle}</h2>
          <pre className="aeo-json-preview">
            {prettyJsonLd(previewSchema.jsonLd)}
          </pre>
        </div>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="aeo-dialog-overlay" onClick={() => setShowDialog(false)}>
          <div
            className="aeo-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '720px' }}
          >
            <h3>{editingSchema ? 'Edit Schema' : 'New Schema Markup'}</h3>

            {saveError && (
              <div style={{
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                borderRadius: 'var(--af-radius-chip)',
                padding: 'var(--af-space-palm) var(--af-space-hand)',
                fontFamily: 'var(--af-font-architect)',
                fontSize: '13px',
                color: 'var(--af-signal-stop)',
                marginBottom: 'var(--af-space-hand)',
              }}>
                {saveError}
              </div>
            )}

            <div className="aeo-form-row">
              <div className="aeo-form-group">
                <label className="aeo-label">Page URL</label>
                <input
                  className="aeo-input"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://alternatefutures.ai/page"
                  disabled={!!editingSchema}
                />
              </div>
              <div className="aeo-form-group">
                <label className="aeo-label">Page Title</label>
                <input
                  className="aeo-input"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Page title"
                />
              </div>
            </div>

            <div className="aeo-form-row">
              <div className="aeo-form-group">
                <label className="aeo-label">Schema Type</label>
                <select
                  className="aeo-select"
                  value={formType}
                  onChange={(e) => handleTypeChange(e.target.value as SchemaType)}
                  style={{ width: '100%' }}
                >
                  {ALL_SCHEMA_TYPES.map((t) => (
                    <option key={t} value={t}>{SCHEMA_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div className="aeo-form-group">
                <label className="aeo-label">Source</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--af-space-palm)',
                  marginTop: 'var(--af-space-palm)',
                }}>
                  <label style={{
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: '13px',
                    color: 'var(--af-stone-700)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={formAuto}
                      onChange={(e) => setFormAuto(e.target.checked)}
                    />
                    Auto-generated
                  </label>
                </div>
              </div>
            </div>

            <div className="aeo-form-group">
              <label className="aeo-label">JSON-LD</label>
              <textarea
                className="aeo-textarea"
                value={formJsonLd}
                onChange={(e) => setFormJsonLd(e.target.value)}
                rows={14}
              />
            </div>

            {/* Live preview */}
            {formJsonLd.trim() && (
              <div className="aeo-form-group">
                <label className="aeo-label">Preview</label>
                <pre className="aeo-json-preview" style={{ maxHeight: '180px' }}>
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(formJsonLd), null, 2)
                    } catch {
                      return 'Invalid JSON'
                    }
                  })()}
                </pre>
              </div>
            )}

            <div className="aeo-dialog-actions">
              <button
                className="aeo-btn-secondary"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>
              <button
                className="aeo-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : editingSchema ? 'Update Schema' : 'Create Schema'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <div className="aeo-dialog-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="aeo-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px' }}
          >
            <h3>Delete Schema?</h3>
            <p style={{
              fontFamily: 'var(--af-font-architect)',
              fontSize: '14px',
              color: 'var(--af-stone-700)',
              margin: '0 0 var(--af-space-hand)',
            }}>
              Delete schema for &ldquo;{deleteTarget.pageTitle}&rdquo;? This cannot be undone.
            </p>
            <div className="aeo-dialog-actions">
              <button className="aeo-btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                className="aeo-btn-primary"
                onClick={handleDelete}
                disabled={deleting}
                style={{ background: 'var(--af-signal-stop)', borderColor: 'var(--af-signal-stop)' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
