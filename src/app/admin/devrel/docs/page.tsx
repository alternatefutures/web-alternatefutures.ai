'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useDialog } from '@/hooks/useDialog'
import { EmptyStateDecoration, WaveDivider } from '@/components/admin/ShapeDecoration'
import '../devrel-admin.css'

type DocPage = {
  id: string
  title: string
  path: string
  category: string
  status: 'current' | 'needs-update' | 'deprecated'
  lastUpdated: string
  linkedFeature: string
  wordCount: number
}

type DocFeature = {
  name: string
  hasDoc: boolean
}

const STATUS_STYLES: Record<DocPage['status'], { bg: string; color: string; label: string }> = {
  current: { bg: '#D1FAE5', color: '#065F46', label: 'Current' },
  'needs-update': { bg: '#FEF3C7', color: '#92400E', label: 'Needs Update' },
  deprecated: { bg: '#F3F4F6', color: '#6B7280', label: 'Deprecated' },
}

const SAMPLE_DOCS: DocPage[] = [
  { id: '1', title: 'Getting Started', path: '/docs/getting-started', category: 'Onboarding', status: 'current', lastUpdated: '2026-02-10T10:00:00Z', linkedFeature: 'Deployment', wordCount: 1200 },
  { id: '2', title: 'CLI Reference', path: '/docs/cli', category: 'CLI', status: 'current', lastUpdated: '2026-02-08T14:00:00Z', linkedFeature: 'CLI', wordCount: 3400 },
  { id: '3', title: 'IPFS Hosting Guide', path: '/docs/ipfs-hosting', category: 'Storage', status: 'needs-update', lastUpdated: '2026-01-15T09:00:00Z', linkedFeature: 'IPFS', wordCount: 1800 },
  { id: '4', title: 'Authentication API', path: '/docs/auth-api', category: 'Auth', status: 'current', lastUpdated: '2026-02-12T11:00:00Z', linkedFeature: 'Auth', wordCount: 2600 },
  { id: '5', title: 'Serverless Functions', path: '/docs/functions', category: 'Compute', status: 'needs-update', lastUpdated: '2025-12-20T16:00:00Z', linkedFeature: 'Functions', wordCount: 2100 },
  { id: '6', title: 'Arweave Storage', path: '/docs/arweave', category: 'Storage', status: 'deprecated', lastUpdated: '2025-11-01T08:00:00Z', linkedFeature: 'Arweave', wordCount: 900 },
  { id: '7', title: 'SDK Reference', path: '/docs/sdk', category: 'SDK', status: 'current', lastUpdated: '2026-02-05T13:00:00Z', linkedFeature: 'SDK', wordCount: 4200 },
  { id: '8', title: 'Custom Domains', path: '/docs/domains', category: 'Hosting', status: 'current', lastUpdated: '2026-01-28T15:00:00Z', linkedFeature: 'Domains', wordCount: 1100 },
  { id: '9', title: 'Environment Variables', path: '/docs/env-vars', category: 'Config', status: 'needs-update', lastUpdated: '2025-12-10T12:00:00Z', linkedFeature: 'Config', wordCount: 800 },
]

const FEATURE_COVERAGE: DocFeature[] = [
  { name: 'Deployment', hasDoc: true },
  { name: 'IPFS', hasDoc: true },
  { name: 'Arweave', hasDoc: true },
  { name: 'Auth', hasDoc: true },
  { name: 'CLI', hasDoc: true },
  { name: 'SDK', hasDoc: true },
  { name: 'Functions', hasDoc: true },
  { name: 'Domains', hasDoc: true },
  { name: 'AI Agents', hasDoc: false },
  { name: 'Billing', hasDoc: false },
  { name: 'Teams', hasDoc: false },
  { name: 'Webhooks', hasDoc: false },
  { name: 'Config', hasDoc: true },
  { name: 'Monitoring', hasDoc: false },
]

export default function DocumentationManager() {
  const [docs, setDocs] = useState<DocPage[]>(SAMPLE_DOCS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPath, setNewPath] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DocPage | null>(null)
  const [deleting, setDeleting] = useState(false)
  const deleteDialogRef = useDialog(!!deleteTarget, () => setDeleteTarget(null))

  const categories = useMemo(() => {
    const set = new Set(docs.map((d) => d.category))
    return Array.from(set).sort()
  }, [docs])

  const filtered = useMemo(() => {
    let result = docs
    if (statusFilter !== 'ALL') {
      result = result.filter((d) => d.status === statusFilter)
    }
    if (categoryFilter) {
      result = result.filter((d) => d.category === categoryFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.path.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q),
      )
    }
    return result.sort(
      (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    )
  }, [docs, statusFilter, categoryFilter, search])

  const stats = useMemo(() => ({
    total: docs.length,
    current: docs.filter((d) => d.status === 'current').length,
    needsUpdate: docs.filter((d) => d.status === 'needs-update').length,
    deprecated: docs.filter((d) => d.status === 'deprecated').length,
  }), [docs])

  const coverage = useMemo(() => {
    const covered = FEATURE_COVERAGE.filter((f) => f.hasDoc).length
    return { covered, total: FEATURE_COVERAGE.length, pct: Math.round((covered / FEATURE_COVERAGE.length) * 100) }
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDocs((prev) => prev.filter((d) => d.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }, [deleteTarget])

  const handleCreateDoc = useCallback(() => {
    if (!newTitle.trim() || !newPath.trim()) return
    const newDoc: DocPage = {
      id: Math.random().toString(36).slice(2, 11),
      title: newTitle.trim(),
      path: newPath.trim(),
      category: newCategory || 'General',
      status: 'current',
      lastUpdated: new Date().toISOString(),
      linkedFeature: newFeature,
      wordCount: 0,
    }
    setDocs((prev) => [newDoc, ...prev])
    setNewTitle('')
    setNewPath('')
    setNewCategory('')
    setNewFeature('')
    setShowCreateForm(false)
  }, [newTitle, newPath, newCategory, newFeature])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function daysSince(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <>
      <div className="devrel-admin-header">
        <div>
          <Link href="/admin/devrel" className="devrel-admin-back">
            &larr; DevRel
          </Link>
          <h1 style={{ marginTop: 8 }}>Documentation Manager</h1>
        </div>
        <button
          className="devrel-admin-new-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Doc Page'}
        </button>
      </div>

      <div className="devrel-admin-stats">
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Total Pages</div>
          <div className="devrel-admin-stat-value">{stats.total}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Current</div>
          <div className="devrel-admin-stat-value">{stats.current}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Needs Update</div>
          <div className="devrel-admin-stat-value">{stats.needsUpdate}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Deprecated</div>
          <div className="devrel-admin-stat-value">{stats.deprecated}</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      {/* Coverage report */}
      <h2 className="devrel-admin-section-title">Feature Coverage</h2>
      <div style={{
        background: 'var(--color-white, #fff)',
        border: '1px solid var(--color-border, #E5E7EB)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: 20,
        marginBottom: 24,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 16,
        }}>
          <div style={{
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: 14,
            color: 'var(--color-text-dark, #1F2937)',
          }}>
            {coverage.covered} of {coverage.total} features documented
          </div>
          <div style={{
            flex: 1,
            height: 8,
            background: 'var(--color-border, #E5E7EB)',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${coverage.pct}%`,
              height: '100%',
              background: coverage.pct >= 80 ? '#10B981' : coverage.pct >= 50 ? '#F59E0B' : '#EF4444',
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-text-dark, #1F2937)',
          }}>
            {coverage.pct}%
          </span>
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          {FEATURE_COVERAGE.map((f) => (
            <span
              key={f.name}
              style={{
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: 12,
                fontWeight: 500,
                padding: '4px 12px',
                borderRadius: 50,
                background: f.hasDoc ? '#D1FAE5' : '#FEF2F2',
                color: f.hasDoc ? '#065F46' : '#DC2626',
              }}
            >
              {f.hasDoc ? '\u2713' : '\u2717'} {f.name}
            </span>
          ))}
        </div>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div style={{
          background: 'var(--color-white, #fff)',
          border: '1px solid var(--color-blue, #000AFF)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: 24,
          marginBottom: 24,
        }}>
          <h3 style={{
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--color-text-dark, #1F2937)',
            margin: '0 0 16px',
          }}>
            Create New Documentation Page
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="devrel-form-group">
              <label className="devrel-form-label">Page Title</label>
              <input
                type="text"
                className="devrel-form-input"
                placeholder="e.g., Webhooks Reference"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="devrel-form-group">
              <label className="devrel-form-label">URL Path</label>
              <input
                type="text"
                className="devrel-form-input"
                placeholder="e.g., /docs/webhooks"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
              />
            </div>
            <div className="devrel-form-group">
              <label className="devrel-form-label">Category</label>
              <input
                type="text"
                className="devrel-form-input"
                placeholder="e.g., API, Hosting, Config"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div className="devrel-form-group">
              <label className="devrel-form-label">Linked Feature</label>
              <input
                type="text"
                className="devrel-form-input"
                placeholder="e.g., Webhooks"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
              />
            </div>
          </div>
          <div className="devrel-form-actions">
            <button
              className="devrel-form-cancel"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
            <button
              className="devrel-form-submit"
              onClick={handleCreateDoc}
              disabled={!newTitle.trim() || !newPath.trim()}
            >
              Create Page
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="devrel-admin-filters">
        <input
          type="text"
          className="devrel-admin-search"
          placeholder="Search docs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="devrel-admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="current">Current</option>
          <option value="needs-update">Needs Update</option>
          <option value="deprecated">Deprecated</option>
        </select>
        <select
          className="devrel-admin-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyStateDecoration
          page="devrel"
          theme="warm"
          heading={docs.length === 0 ? 'No documentation pages yet' : 'No pages found'}
          message={docs.length === 0 ? undefined : 'Try adjusting your search or filters.'}
        />
      ) : (
        <div className="devrel-admin-table-wrap">
          <table className="devrel-admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Path</th>
                <th>Category</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const s = STATUS_STYLES[doc.status]
                const age = daysSince(doc.lastUpdated)
                return (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.title}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'var(--color-text-gray, #6B7280)' }}>
                        {doc.path}
                      </span>
                    </td>
                    <td>
                      <span className="devrel-admin-tag-chip">{doc.category}</span>
                    </td>
                    <td>
                      <span
                        className="devrel-type-chip"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td>{formatDate(doc.lastUpdated)}</td>
                    <td>
                      <span style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 12,
                        color: age > 60 ? '#EF4444' : age > 30 ? '#F59E0B' : 'var(--color-text-gray, #6B7280)',
                        fontWeight: age > 30 ? 600 : 400,
                      }}>
                        {age}d ago
                      </span>
                    </td>
                    <td>
                      <div className="devrel-admin-actions">
                        <button className="devrel-admin-action-btn">Edit</button>
                        <button
                          className="devrel-admin-action-btn danger"
                          onClick={() => setDeleteTarget(doc)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div
          className="devrel-admin-dialog-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="devrel-admin-dialog"
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="doc-delete-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="doc-delete-dialog-title">Delete documentation page?</h3>
            <p>
              Are you sure you want to delete &ldquo;{deleteTarget.title}&rdquo;?
              This action cannot be undone.
            </p>
            <div className="devrel-admin-dialog-actions">
              <button
                className="devrel-admin-dialog-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="devrel-admin-dialog-delete"
                onClick={handleDelete}
                disabled={deleting}
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
