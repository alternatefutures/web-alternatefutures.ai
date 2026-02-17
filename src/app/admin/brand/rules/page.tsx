'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDialog } from '@/hooks/useDialog'
import {
  fetchBrandGuide,
  createBrandRule,
  updateBrandRule,
  deleteBrandRule,
  type BrandRule,
  type BrandRuleCategory,
  type ViolationSeverity,
  type CreateBrandRuleInput,
} from '@/lib/brand-api'
import { getCookieValue } from '@/lib/cookies'
import '../brand-admin.css'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: BrandRuleCategory[] = [
  'TERMINOLOGY',
  'VOICE',
  'POSITIONING',
  'VISUAL',
  'COMPETITOR',
  'PARTNER',
]

const SEVERITIES: ViolationSeverity[] = ['BLOCKING', 'WARNING', 'INFO']

function categoryLabel(c: BrandRuleCategory): string {
  return c.charAt(0) + c.slice(1).toLowerCase()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BrandRulesPage() {
  const [rules, setRules] = useState<BrandRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')

  // Create/Edit
  const [showDialog, setShowDialog] = useState(false)
  const [editRule, setEditRule] = useState<BrandRule | null>(null)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<BrandRuleCategory>('TERMINOLOGY')
  const [formDescription, setFormDescription] = useState('')
  const [formPattern, setFormPattern] = useState('')
  const [formReplacement, setFormReplacement] = useState('')
  const [formSeverity, setFormSeverity] = useState<ViolationSeverity>('WARNING')
  const [formExamples, setFormExamples] = useState('')
  const [formActive, setFormActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<BrandRule | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Detail view
  const [detailRule, setDetailRule] = useState<BrandRule | null>(null)

  const closeDialogs = useCallback(() => {
    setShowDialog(false)
    setEditRule(null)
    setDeleteTarget(null)
    setDetailRule(null)
    setSaveError('')
  }, [])

  const dialogRef = useDialog(showDialog || !!editRule, closeDialogs)
  const deleteDialogRef = useDialog(!!deleteTarget, () => setDeleteTarget(null))
  const detailDialogRef = useDialog(!!detailRule && !editRule, closeDialogs)

  // ---------------------------------------------------------------------------
  // Load
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const guide = await fetchBrandGuide(token)
        setRules(guide.rules)
      } catch {
        setError('Failed to load brand rules.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ---------------------------------------------------------------------------
  // Filtered
  // ---------------------------------------------------------------------------

  const filtered = useMemo(() => {
    let result = rules
    if (categoryFilter !== 'ALL') {
      result = result.filter((r) => r.category === categoryFilter)
    }
    if (severityFilter !== 'ALL') {
      result = result.filter((r) => r.severity === severityFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q),
      )
    }
    return result
  }, [rules, categoryFilter, severityFilter, search])

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {}
    for (const r of rules) {
      stats[r.category] = (stats[r.category] || 0) + 1
    }
    return stats
  }, [rules])

  // ---------------------------------------------------------------------------
  // Create/Edit
  // ---------------------------------------------------------------------------

  const openCreate = useCallback(() => {
    setFormName('')
    setFormCategory('TERMINOLOGY')
    setFormDescription('')
    setFormPattern('')
    setFormReplacement('')
    setFormSeverity('WARNING')
    setFormExamples('')
    setFormActive(true)
    setSaveError('')
    setEditRule(null)
    setShowDialog(true)
  }, [])

  const openEdit = useCallback((r: BrandRule) => {
    setFormName(r.name)
    setFormCategory(r.category)
    setFormDescription(r.description)
    setFormPattern(r.pattern || '')
    setFormReplacement(r.replacement || '')
    setFormSeverity(r.severity)
    setFormExamples(r.examples.join('\n'))
    setFormActive(r.active)
    setSaveError('')
    setEditRule(r)
    setDetailRule(null)
    setShowDialog(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formName.trim()) {
      setSaveError('Name is required.')
      return
    }
    if (!formDescription.trim()) {
      setSaveError('Description is required.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      const token = getCookieValue('af_access_token')
      const examples = formExamples.split('\n').map((s) => s.trim()).filter(Boolean)

      if (editRule) {
        const updated = await updateBrandRule(token, editRule.id, {
          name: formName,
          category: formCategory,
          description: formDescription,
          pattern: formPattern || null,
          replacement: formReplacement || null,
          severity: formSeverity,
          active: formActive,
          examples,
        })
        setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      } else {
        const input: CreateBrandRuleInput = {
          name: formName,
          category: formCategory,
          description: formDescription,
          pattern: formPattern || undefined,
          replacement: formReplacement || undefined,
          severity: formSeverity,
          examples,
        }
        const created = await createBrandRule(token, input)
        setRules((prev) => [created, ...prev])
      }
      closeDialogs()
    } catch {
      setSaveError('Failed to save rule.')
    } finally {
      setSaving(false)
    }
  }, [formName, formCategory, formDescription, formPattern, formReplacement, formSeverity, formExamples, formActive, editRule, closeDialogs])

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteBrandRule(token, deleteTarget.id)
      setRules((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setDeleteTarget(null)
      setDetailRule(null)
    } catch {
      setSaveError('Failed to delete rule.')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget])

  // ---------------------------------------------------------------------------
  // Toggle active
  // ---------------------------------------------------------------------------

  const toggleActive = useCallback(async (rule: BrandRule) => {
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateBrandRule(token, rule.id, { active: !rule.active })
      setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } catch {
      // silent
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="brand-admin-empty">
        <p>Loading brand rules...</p>
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
          <h1>Brand Rules</h1>
          <p className="brand-admin-subtitle">Manage enforcement rules by category</p>
        </div>
        <button className="brand-admin-new-btn" onClick={openCreate}>
          + New Rule
        </button>
      </div>

      {/* Category stats */}
      <div className="brand-admin-stats">
        {CATEGORIES.map((cat) => (
          <div
            key={cat}
            className={`brand-admin-stat-card brand-admin-stat-card--clickable ${categoryFilter === cat ? 'brand-admin-stat-card--selected' : ''}`}
            onClick={() => setCategoryFilter(categoryFilter === cat ? 'ALL' : cat)}
          >
            <div className="brand-admin-stat-label">{categoryLabel(cat)}</div>
            <div className="brand-admin-stat-value">{categoryStats[cat] || 0}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="brand-admin-filters">
        <input
          type="text"
          className="brand-admin-search"
          placeholder="Search rules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="brand-admin-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{categoryLabel(c)}</option>
          ))}
        </select>
        <select
          className="brand-admin-select"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="ALL">All severities</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Rules table */}
      {filtered.length === 0 ? (
        <div className="brand-admin-empty">
          <h2>No rules found</h2>
          <p>{rules.length === 0 ? 'Create your first brand rule.' : 'Try adjusting your filters.'}</p>
        </div>
      ) : (
        <div className="brand-admin-table-wrap">
          <table className="brand-admin-table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Active</th>
                <th>Pattern</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rule) => (
                <tr key={rule.id} style={{ opacity: rule.active ? 1 : 0.5 }}>
                  <td>
                    <button
                      className="brand-admin-rule-name-btn"
                      onClick={() => setDetailRule(rule)}
                    >
                      {rule.name}
                    </button>
                  </td>
                  <td>
                    <span className="brand-admin-category-chip">{rule.category}</span>
                  </td>
                  <td>
                    <span className={`brand-admin-chip brand-admin-chip--${rule.severity.toLowerCase()}`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`brand-admin-toggle ${rule.active ? 'brand-admin-toggle--on' : ''}`}
                      onClick={() => toggleActive(rule)}
                      title={rule.active ? 'Disable' : 'Enable'}
                    >
                      <span className="brand-admin-toggle-knob" />
                    </button>
                  </td>
                  <td>
                    <code className="brand-admin-pattern-code">
                      {rule.pattern ? rule.pattern.slice(0, 30) + (rule.pattern.length > 30 ? '...' : '') : '--'}
                    </code>
                  </td>
                  <td>
                    <div className="brand-admin-actions">
                      <button className="brand-admin-action-btn" onClick={() => openEdit(rule)}>
                        Edit
                      </button>
                      <button className="brand-admin-action-btn danger" onClick={() => setDeleteTarget(rule)}>
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

      {/* Detail dialog */}
      {detailRule && !editRule && (
        <div className="brand-admin-dialog-overlay" onClick={closeDialogs}>
          <div
            className="brand-admin-dialog brand-admin-dialog--wide"
            ref={detailDialogRef}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="brand-admin-rule-detail-header">
              <h3>{detailRule.name}</h3>
              <div>
                <span className="brand-admin-category-chip">{detailRule.category}</span>
                <span className={`brand-admin-chip brand-admin-chip--${detailRule.severity.toLowerCase()}`} style={{ marginLeft: 8 }}>
                  {detailRule.severity}
                </span>
              </div>
            </div>

            <p style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-sm)', color: 'var(--af-stone-700)', lineHeight: 'var(--af-leading-body)' }}>
              {detailRule.description}
            </p>

            {detailRule.pattern && (
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Pattern</label>
                <code className="brand-admin-pattern-code brand-admin-pattern-code--block">
                  {detailRule.pattern}
                </code>
              </div>
            )}

            {detailRule.replacement && (
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Replacement</label>
                <span style={{ fontFamily: 'var(--af-font-architect)', color: 'var(--af-signal-go)' }}>
                  {detailRule.replacement}
                </span>
              </div>
            )}

            {detailRule.examples.length > 0 && (
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Examples</label>
                {detailRule.examples.map((ex, i) => (
                  <div key={i} className="brand-admin-example brand-admin-example--good">
                    {ex}
                  </div>
                ))}
              </div>
            )}

            <div className="brand-admin-dialog-actions">
              <button className="brand-admin-action-btn danger" onClick={() => { setDeleteTarget(detailRule); setDetailRule(null); }}>
                Delete
              </button>
              <div style={{ display: 'flex', gap: 'var(--af-space-palm)' }}>
                <button className="brand-admin-secondary-btn" onClick={closeDialogs}>
                  Close
                </button>
                <button className="brand-admin-new-btn" onClick={() => openEdit(detailRule)}>
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit dialog */}
      {(showDialog || editRule) && (
        <div className="brand-admin-dialog-overlay" onClick={closeDialogs}>
          <div
            className="brand-admin-dialog brand-admin-dialog--wide"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{editRule ? 'Edit Rule' : 'New Rule'}</h3>

            {saveError && <div className="brand-admin-form-error">{saveError}</div>}

            <div className="brand-admin-form-group">
              <label className="brand-admin-form-label">Name</label>
              <input
                type="text"
                className="brand-admin-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Platform name consistency"
              />
            </div>

            <div className="brand-admin-grid-2">
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Category</label>
                <select
                  className="brand-admin-select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as BrandRuleCategory)}
                  style={{ width: '100%' }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{categoryLabel(c)}</option>
                  ))}
                </select>
              </div>
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Severity</label>
                <select
                  className="brand-admin-select"
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value as ViolationSeverity)}
                  style={{ width: '100%' }}
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="brand-admin-form-group">
              <label className="brand-admin-form-label">Description</label>
              <textarea
                className="brand-admin-textarea"
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Explain what this rule enforces..."
              />
            </div>

            <div className="brand-admin-grid-2">
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Regex Pattern (optional)</label>
                <input
                  type="text"
                  className="brand-admin-input"
                  value={formPattern}
                  onChange={(e) => setFormPattern(e.target.value)}
                  placeholder="\\bFleek\\b"
                />
              </div>
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Replacement (optional)</label>
                <input
                  type="text"
                  className="brand-admin-input"
                  value={formReplacement}
                  onChange={(e) => setFormReplacement(e.target.value)}
                  placeholder="Alternate Futures"
                />
              </div>
            </div>

            <div className="brand-admin-form-group">
              <label className="brand-admin-form-label">Examples (one per line)</label>
              <textarea
                className="brand-admin-textarea"
                rows={3}
                value={formExamples}
                onChange={(e) => setFormExamples(e.target.value)}
                placeholder="Correct usage example&#10;Another correct example"
              />
            </div>

            {editRule && (
              <div className="brand-admin-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-sm)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                  />
                  Active
                </label>
              </div>
            )}

            <div className="brand-admin-dialog-actions">
              <button className="brand-admin-secondary-btn" onClick={closeDialogs}>
                Cancel
              </button>
              <button className="brand-admin-new-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editRule ? 'Update' : 'Create'}
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
            <h3>Delete rule?</h3>
            <p style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-sm)', color: 'var(--af-stone-600)' }}>
              Are you sure you want to delete &ldquo;{deleteTarget.name}&rdquo;?
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
