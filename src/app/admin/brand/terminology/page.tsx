'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDialog } from '@/hooks/useDialog'
import {
  fetchAllTerminology,
  createTerminology,
  updateTerminology,
  deleteTerminology,
  scanTerminology,
  type BrandTerminology,
  type TerminologyStatus,
  type CreateTerminologyInput,
  type BrandViolation,
} from '@/lib/brand-api'
import { getCookieValue } from '@/lib/cookies'
import '../brand-admin.css'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: TerminologyStatus[] = ['REQUIRED', 'FORBIDDEN', 'PREFERRED']

function statusChipClass(s: TerminologyStatus): string {
  return `brand-admin-chip brand-admin-chip--${s.toLowerCase()}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TerminologyPage() {
  const [terms, setTerms] = useState<BrandTerminology[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Create/Edit dialog
  const [showDialog, setShowDialog] = useState(false)
  const [editTerm, setEditTerm] = useState<BrandTerminology | null>(null)
  const [formTerm, setFormTerm] = useState('')
  const [formStatus, setFormStatus] = useState<TerminologyStatus>('FORBIDDEN')
  const [formReplacement, setFormReplacement] = useState('')
  const [formContext, setFormContext] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<BrandTerminology | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Scan
  const [scanContent, setScanContent] = useState('')
  const [scanResults, setScanResults] = useState<BrandViolation[] | null>(null)
  const [scanning, setScanning] = useState(false)

  const closeDialogs = useCallback(() => {
    setShowDialog(false)
    setEditTerm(null)
    setDeleteTarget(null)
    setSaveError('')
  }, [])

  const dialogRef = useDialog(showDialog || !!editTerm, closeDialogs)
  const deleteDialogRef = useDialog(!!deleteTarget, () => setDeleteTarget(null))

  // ---------------------------------------------------------------------------
  // Load
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const data = await fetchAllTerminology(token)
        setTerms(data)
      } catch {
        setError('Failed to load terminology.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ---------------------------------------------------------------------------
  // Filtered terms
  // ---------------------------------------------------------------------------

  const filtered = useMemo(() => {
    let result = terms
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.context.toLowerCase().includes(q),
      )
    }
    return result
  }, [terms, statusFilter, search])

  // ---------------------------------------------------------------------------
  // Create/Edit
  // ---------------------------------------------------------------------------

  const openCreate = useCallback(() => {
    setFormTerm('')
    setFormStatus('FORBIDDEN')
    setFormReplacement('')
    setFormContext('')
    setSaveError('')
    setEditTerm(null)
    setShowDialog(true)
  }, [])

  const openEdit = useCallback((t: BrandTerminology) => {
    setFormTerm(t.term)
    setFormStatus(t.status)
    setFormReplacement(t.replacement || '')
    setFormContext(t.context)
    setSaveError('')
    setEditTerm(t)
    setShowDialog(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formTerm.trim()) {
      setSaveError('Term is required.')
      return
    }
    if (!formContext.trim()) {
      setSaveError('Context is required.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      const token = getCookieValue('af_access_token')
      if (editTerm) {
        const updated = await updateTerminology(token, editTerm.id, {
          term: formTerm,
          status: formStatus,
          replacement: formReplacement || null,
          context: formContext,
        })
        setTerms((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      } else {
        const input: CreateTerminologyInput = {
          term: formTerm,
          status: formStatus,
          replacement: formReplacement || undefined,
          context: formContext,
        }
        const created = await createTerminology(token, input)
        setTerms((prev) => [created, ...prev])
      }
      closeDialogs()
    } catch {
      setSaveError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [formTerm, formStatus, formReplacement, formContext, editTerm, closeDialogs])

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteTerminology(token, deleteTarget.id)
      setTerms((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      setSaveError('Failed to delete.')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget])

  // ---------------------------------------------------------------------------
  // Scan
  // ---------------------------------------------------------------------------

  const handleScan = useCallback(async () => {
    if (!scanContent.trim()) return
    setScanning(true)
    try {
      const token = getCookieValue('af_access_token')
      const violations = await scanTerminology(token, scanContent)
      setScanResults(violations)
    } catch {
      setScanResults([])
    } finally {
      setScanning(false)
    }
  }, [scanContent])

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  const handleExport = useCallback(() => {
    const data = JSON.stringify(terms, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'brand-terminology.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [terms])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="brand-admin-empty">
        <p>Loading terminology...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="brand-admin-empty">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="brand-admin-header">
        <div>
          <h1>Terminology Scanner</h1>
          <p className="brand-admin-subtitle">Approved, preferred, and forbidden terms</p>
        </div>
        <div className="brand-admin-actions">
          <button className="brand-admin-secondary-btn" onClick={handleExport}>
            Export JSON
          </button>
          <button className="brand-admin-new-btn" onClick={openCreate}>
            + Add Term
          </button>
        </div>
      </div>

      {/* Scan section */}
      <div className="brand-admin-card">
        <h3>Scan Content</h3>
        <textarea
          className="brand-admin-textarea"
          rows={4}
          value={scanContent}
          onChange={(e) => setScanContent(e.target.value)}
          placeholder="Paste content here to scan for terminology violations..."
        />
        <div style={{ marginTop: 'var(--af-space-palm)' }}>
          <button
            className="brand-admin-new-btn"
            onClick={handleScan}
            disabled={scanning || !scanContent.trim()}
          >
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>

        {scanResults !== null && (
          <div style={{ marginTop: 'var(--af-space-hand)' }}>
            {scanResults.length === 0 ? (
              <div className="brand-admin-scan-pass">No terminology violations found.</div>
            ) : (
              <>
                <div className="brand-admin-scan-fail">
                  {scanResults.length} violation{scanResults.length > 1 ? 's' : ''} found
                </div>
                {scanResults.map((v) => (
                  <div
                    key={v.id}
                    className={`brand-admin-violation brand-admin-violation--${v.severity.toLowerCase()}`}
                  >
                    <div className="brand-admin-violation-header">
                      <span className={`brand-admin-chip brand-admin-chip--${v.severity.toLowerCase()}`}>
                        {v.severity}
                      </span>
                    </div>
                    <p className="brand-admin-violation-message">
                      Found &ldquo;{v.original}&rdquo; at {v.location}
                    </p>
                    {v.suggestion && (
                      <p className="brand-admin-violation-suggestion">{v.suggestion}</p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="brand-admin-stats">
        <div className="brand-admin-stat-card">
          <div className="brand-admin-stat-label">Total Terms</div>
          <div className="brand-admin-stat-value">{terms.length}</div>
        </div>
        <div className="brand-admin-stat-card">
          <div className="brand-admin-stat-label">Required</div>
          <div className="brand-admin-stat-value">{terms.filter((t) => t.status === 'REQUIRED').length}</div>
        </div>
        <div className="brand-admin-stat-card">
          <div className="brand-admin-stat-label">Forbidden</div>
          <div className="brand-admin-stat-value">{terms.filter((t) => t.status === 'FORBIDDEN').length}</div>
        </div>
        <div className="brand-admin-stat-card">
          <div className="brand-admin-stat-label">Preferred</div>
          <div className="brand-admin-stat-value">{terms.filter((t) => t.status === 'PREFERRED').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="brand-admin-filters">
        <input
          type="text"
          className="brand-admin-search"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="brand-admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Terms table */}
      {filtered.length === 0 ? (
        <div className="brand-admin-empty">
          <h2>No terms found</h2>
          <p>{terms.length === 0 ? 'Add your first terminology rule.' : 'Try adjusting your search or filters.'}</p>
        </div>
      ) : (
        <div className="brand-admin-table-wrap">
          <table className="brand-admin-table">
            <thead>
              <tr>
                <th>Term</th>
                <th>Status</th>
                <th>Replacement</th>
                <th>Context</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.term}</td>
                  <td>
                    <span className={statusChipClass(t.status)}>{t.status}</span>
                  </td>
                  <td>{t.replacement || '--'}</td>
                  <td>
                    <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.context}
                    </div>
                  </td>
                  <td>
                    <div className="brand-admin-actions">
                      <button className="brand-admin-action-btn" onClick={() => openEdit(t)}>
                        Edit
                      </button>
                      <button className="brand-admin-action-btn danger" onClick={() => setDeleteTarget(t)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit dialog */}
      {(showDialog || editTerm) && (
        <div className="brand-admin-dialog-overlay" onClick={closeDialogs}>
          <div
            className="brand-admin-dialog"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{editTerm ? 'Edit Term' : 'Add Term'}</h3>

            {saveError && <div className="brand-admin-form-error">{saveError}</div>}

            <div className="brand-admin-form-group">
              <label className="brand-admin-form-label">Term</label>
              <input
                type="text"
                className="brand-admin-input"
                value={formTerm}
                onChange={(e) => setFormTerm(e.target.value)}
                placeholder="e.g. Alternate Futures"
              />
            </div>

            <div className="brand-admin-form-group">
              <label className="brand-admin-form-label">Status</label>
              <select
                className="brand-admin-select"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as TerminologyStatus)}
                style={{ width: '100%' }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="brand-admin-form-group">
              <label className="brand-admin-form-label">Replacement (optional)</label>
              <input
                type="text"
                className="brand-admin-input"
                value={formReplacement}
                onChange={(e) => setFormReplacement(e.target.value)}
                placeholder="Suggested replacement..."
              />
            </div>

            <div className="brand-admin-form-group">
              <label className="brand-admin-form-label">Context</label>
              <textarea
                className="brand-admin-textarea"
                rows={3}
                value={formContext}
                onChange={(e) => setFormContext(e.target.value)}
                placeholder="Explain why this term rule exists..."
              />
            </div>

            <div className="brand-admin-dialog-actions">
              <button className="brand-admin-secondary-btn" onClick={closeDialogs}>
                Cancel
              </button>
              <button className="brand-admin-new-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editTerm ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete dialog */}
      {deleteTarget && (
        <div className="brand-admin-dialog-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="brand-admin-dialog"
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete term?</h3>
            <p style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-sm)', color: 'var(--af-stone-600)' }}>
              Are you sure you want to delete &ldquo;{deleteTarget.term}&rdquo;?
              This action cannot be undone.
            </p>
            <div className="brand-admin-dialog-actions">
              <button className="brand-admin-secondary-btn" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="brand-admin-action-btn danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
