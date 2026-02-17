'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  PiPlusBold,
  PiPencilSimpleBold,
  PiTrashBold,
  PiCopyBold,
  PiChartBarBold,
  PiLinkBold,
  PiMagnifyingGlassBold,
} from 'react-icons/pi'
import {
  fetchAllUtmPresets,
  createUtmPreset,
  updateUtmPreset,
  deleteUtmPreset,
  buildUtmUrl,
  isValidUtmParam,
  PLATFORM_UTM_DEFAULTS,
  type UtmPreset,
} from '@/lib/utm-api'
import { EXPANDED_PLATFORM_LABELS, type ExpandedPlatform } from '@/lib/campaign-api'
import { getCookieValue } from '@/lib/cookies'
import './utm-settings.css'

type DialogMode = 'create' | 'edit' | null

export default function UtmSettingsPage() {
  const [presets, setPresets] = useState<UtmPreset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Dialog state
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editTarget, setEditTarget] = useState<UtmPreset | null>(null)
  const [formName, setFormName] = useState('')
  const [formSource, setFormSource] = useState('')
  const [formMedium, setFormMedium] = useState('')
  const [formCampaign, setFormCampaign] = useState('')
  const [formTerm, setFormTerm] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<UtmPreset | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Preview state
  const [previewPreset, setPreviewPreset] = useState<UtmPreset | null>(null)
  const [previewUrl, setPreviewUrl] = useState('https://alternatefutures.ai')

  // Status
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllUtmPresets(token)
      setPresets(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return presets
    const q = search.toLowerCase()
    return presets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.utm_source.toLowerCase().includes(q) ||
        p.utm_medium.toLowerCase().includes(q) ||
        p.utm_campaign.toLowerCase().includes(q),
    )
  }, [presets, search])

  // Stats
  const totalUsage = useMemo(() => presets.reduce((s, p) => s + p.usageCount, 0), [presets])
  const topPreset = useMemo(() => {
    if (presets.length === 0) return null
    return [...presets].sort((a, b) => b.usageCount - a.usageCount)[0]
  }, [presets])

  const openCreate = useCallback(() => {
    setDialogMode('create')
    setEditTarget(null)
    setFormName('')
    setFormSource('social')
    setFormMedium('organic')
    setFormCampaign('')
    setFormTerm('')
    setFormContent('')
    setFormError('')
  }, [])

  const openEdit = useCallback((preset: UtmPreset) => {
    setDialogMode('edit')
    setEditTarget(preset)
    setFormName(preset.name)
    setFormSource(preset.utm_source)
    setFormMedium(preset.utm_medium)
    setFormCampaign(preset.utm_campaign)
    setFormTerm(preset.utm_term)
    setFormContent(preset.utm_content)
    setFormError('')
  }, [])

  const closeDialog = useCallback(() => {
    setDialogMode(null)
    setEditTarget(null)
    setFormError('')
  }, [])

  const handleSave = useCallback(async () => {
    if (!formName.trim()) {
      setFormError('Name is required')
      return
    }
    if (!formSource.trim()) {
      setFormError('Source is required')
      return
    }
    if (!formMedium.trim()) {
      setFormError('Medium is required')
      return
    }
    if (!formCampaign.trim()) {
      setFormError('Campaign is required')
      return
    }

    // Validate UTM parameter format (no spaces, URL-safe chars only)
    const utmFields = [
      { name: 'utm_source', value: formSource.trim() },
      { name: 'utm_medium', value: formMedium.trim() },
      { name: 'utm_campaign', value: formCampaign.trim() },
      { name: 'utm_term', value: formTerm.trim() },
      { name: 'utm_content', value: formContent.trim() },
    ]
    for (const field of utmFields) {
      if (field.value && !isValidUtmParam(field.value)) {
        setFormError(
          `${field.name} contains invalid characters. Use only letters, numbers, hyphens, underscores, dots, and plus signs (no spaces).`,
        )
        return
      }
    }

    setFormSaving(true)
    setFormError('')

    try {
      const token = getCookieValue('af_access_token')
      if (dialogMode === 'create') {
        const created = await createUtmPreset(token, {
          name: formName.trim(),
          utm_source: formSource.trim(),
          utm_medium: formMedium.trim(),
          utm_campaign: formCampaign.trim(),
          utm_term: formTerm.trim(),
          utm_content: formContent.trim(),
        })
        setPresets((prev) => [created, ...prev])
        setStatusMsg({ type: 'success', text: `Preset "${created.name}" created` })
      } else if (editTarget) {
        const updated = await updateUtmPreset(token, editTarget.id, {
          name: formName.trim(),
          utm_source: formSource.trim(),
          utm_medium: formMedium.trim(),
          utm_campaign: formCampaign.trim(),
          utm_term: formTerm.trim(),
          utm_content: formContent.trim(),
        })
        setPresets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setStatusMsg({ type: 'success', text: `Preset "${updated.name}" updated` })
      }
      closeDialog()
      setTimeout(() => setStatusMsg(null), 3000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setFormSaving(false)
    }
  }, [dialogMode, editTarget, formName, formSource, formMedium, formCampaign, formTerm, formContent, closeDialog])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteUtmPreset(token, deleteTarget.id)
      setPresets((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setStatusMsg({ type: 'success', text: `Preset "${deleteTarget.name}" deleted` })
      setDeleteTarget(null)
      setTimeout(() => setStatusMsg(null), 3000)
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to delete preset' })
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget])

  const copyParams = useCallback((preset: UtmPreset) => {
    const parts = [
      `utm_source=${preset.utm_source}`,
      `utm_medium=${preset.utm_medium}`,
      `utm_campaign=${preset.utm_campaign}`,
      preset.utm_term && `utm_term=${preset.utm_term}`,
      preset.utm_content && `utm_content=${preset.utm_content}`,
    ].filter(Boolean).join('&')
    navigator.clipboard.writeText(parts).catch(() => {})
    setStatusMsg({ type: 'success', text: 'UTM parameters copied' })
    setTimeout(() => setStatusMsg(null), 2000)
  }, [])

  return (
    <>
      <div className="utm-header">
        <div>
          <h1>UTM Presets</h1>
          <p className="utm-subtitle">
            Reusable UTM parameter sets for consistent campaign tracking
          </p>
        </div>
        <button className="utm-create-btn" onClick={openCreate}>
          <PiPlusBold /> New Preset
        </button>
      </div>

      {statusMsg && (
        <div className={`utm-status utm-status--${statusMsg.type}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Stats row */}
      <div className="utm-stats">
        <div className="utm-stat-card">
          <span className="utm-stat-value">{presets.length}</span>
          <span className="utm-stat-label">Presets</span>
        </div>
        <div className="utm-stat-card">
          <span className="utm-stat-value">{totalUsage}</span>
          <span className="utm-stat-label">Total Uses</span>
        </div>
        <div className="utm-stat-card">
          <span className="utm-stat-value">{topPreset?.name || '--'}</span>
          <span className="utm-stat-label">Top Preset</span>
        </div>
        <div className="utm-stat-card">
          <span className="utm-stat-value">{Object.keys(PLATFORM_UTM_DEFAULTS).length}</span>
          <span className="utm-stat-label">Platform Defaults</span>
        </div>
      </div>

      {/* Search */}
      <div className="utm-toolbar">
        <div className="utm-search-wrap">
          <PiMagnifyingGlassBold className="utm-search-icon" />
          <input
            type="text"
            className="utm-search"
            placeholder="Search presets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Presets table */}
      {loading ? (
        <div className="utm-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="utm-skeleton-row">
              <div className="utm-skeleton-block" style={{ width: '25%' }} />
              <div className="utm-skeleton-block" style={{ width: '15%' }} />
              <div className="utm-skeleton-block" style={{ width: '15%' }} />
              <div className="utm-skeleton-block" style={{ width: '20%' }} />
              <div className="utm-skeleton-block" style={{ width: '10%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="utm-empty">
          <div className="utm-empty-icon"><PiLinkBold /></div>
          <h2>{search ? 'No matching presets' : 'No UTM presets yet'}</h2>
          <p>{search ? 'Try a different search term.' : 'Create your first preset to start tracking campaign links.'}</p>
          {!search && (
            <button className="utm-create-btn" onClick={openCreate}>
              <PiPlusBold /> Create First Preset
            </button>
          )}
        </div>
      ) : (
        <div className="utm-table-wrap">
          <table className="utm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Source</th>
                <th>Medium</th>
                <th>Campaign</th>
                <th>Term</th>
                <th>Content</th>
                <th>Uses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((preset) => (
                <tr key={preset.id}>
                  <td className="utm-cell-name">{preset.name}</td>
                  <td><code className="utm-param-code">{preset.utm_source}</code></td>
                  <td><code className="utm-param-code">{preset.utm_medium}</code></td>
                  <td><code className="utm-param-code">{preset.utm_campaign}</code></td>
                  <td>{preset.utm_term ? <code className="utm-param-code">{preset.utm_term}</code> : <span className="utm-cell-empty">--</span>}</td>
                  <td>{preset.utm_content ? <code className="utm-param-code">{preset.utm_content}</code> : <span className="utm-cell-empty">--</span>}</td>
                  <td>
                    <span className="utm-usage-badge">
                      <PiChartBarBold /> {preset.usageCount}
                    </span>
                  </td>
                  <td>
                    <div className="utm-actions">
                      <button
                        className="utm-action-btn"
                        title="Preview URL"
                        onClick={() => setPreviewPreset(preset)}
                      >
                        <PiLinkBold />
                      </button>
                      <button
                        className="utm-action-btn"
                        title="Copy parameters"
                        onClick={() => copyParams(preset)}
                      >
                        <PiCopyBold />
                      </button>
                      <button
                        className="utm-action-btn"
                        title="Edit"
                        onClick={() => openEdit(preset)}
                      >
                        <PiPencilSimpleBold />
                      </button>
                      <button
                        className="utm-action-btn utm-action-btn--danger"
                        title="Delete"
                        onClick={() => setDeleteTarget(preset)}
                      >
                        <PiTrashBold />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Platform defaults reference */}
      <div className="utm-section">
        <h2 className="utm-section-title">Platform Defaults</h2>
        <p className="utm-section-desc">
          When no preset is selected, these defaults auto-populate based on the target platform.
          Preset values override these when applied.
        </p>
        <div className="utm-defaults-grid">
          {(Object.entries(PLATFORM_UTM_DEFAULTS) as [ExpandedPlatform, { utm_source: string; utm_medium: string }][]).map(
            ([platform, defaults]) => (
              <div key={platform} className="utm-default-chip">
                <span className="utm-default-platform">
                  {EXPANDED_PLATFORM_LABELS[platform]}
                </span>
                <code className="utm-param-code">{defaults.utm_source}</code>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {dialogMode && (
        <div className="utm-dialog-overlay" onClick={closeDialog}>
          <div className="utm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{dialogMode === 'create' ? 'New UTM Preset' : `Edit: ${editTarget?.name}`}</h3>

            <label className="utm-form-label">Preset Name</label>
            <input
              type="text"
              className="utm-form-input"
              placeholder="e.g. Launch Campaign"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />

            <div className="utm-form-grid">
              <div>
                <label className="utm-form-label">
                  utm_source <span className="utm-form-required">*</span>
                </label>
                <input
                  type="text"
                  className="utm-form-input"
                  placeholder="social"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                />
              </div>
              <div>
                <label className="utm-form-label">
                  utm_medium <span className="utm-form-required">*</span>
                </label>
                <input
                  type="text"
                  className="utm-form-input"
                  placeholder="organic"
                  value={formMedium}
                  onChange={(e) => setFormMedium(e.target.value)}
                />
              </div>
            </div>

            <label className="utm-form-label">
              utm_campaign <span className="utm-form-required">*</span>
            </label>
            <input
              type="text"
              className="utm-form-input"
              placeholder="launch-2026"
              value={formCampaign}
              onChange={(e) => setFormCampaign(e.target.value)}
            />

            <div className="utm-form-grid">
              <div>
                <label className="utm-form-label">utm_term</label>
                <input
                  type="text"
                  className="utm-form-input"
                  placeholder="optional"
                  value={formTerm}
                  onChange={(e) => setFormTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="utm-form-label">utm_content</label>
                <input
                  type="text"
                  className="utm-form-input"
                  placeholder="optional"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                />
              </div>
            </div>

            {/* Live preview */}
            <div className="utm-form-preview">
              <span className="utm-form-preview-label">Preview</span>
              <code className="utm-form-preview-url">
                {buildUtmUrl('https://alternatefutures.ai', {
                  utm_source: formSource || undefined,
                  utm_medium: formMedium || undefined,
                  utm_campaign: formCampaign || undefined,
                  utm_term: formTerm || undefined,
                  utm_content: formContent || undefined,
                })}
              </code>
            </div>

            {formError && <div className="utm-form-error">{formError}</div>}

            <div className="utm-dialog-actions">
              <button className="utm-dialog-cancel" onClick={closeDialog}>
                Cancel
              </button>
              <button
                className="utm-dialog-save"
                onClick={handleSave}
                disabled={formSaving}
              >
                {formSaving ? 'Saving...' : dialogMode === 'create' ? 'Create Preset' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <div className="utm-dialog-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="utm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Preset?</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              This preset has been used {deleteTarget.usageCount} time{deleteTarget.usageCount !== 1 ? 's' : ''}.
            </p>
            <div className="utm-dialog-actions">
              <button className="utm-dialog-cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                className="utm-dialog-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URL Preview Dialog */}
      {previewPreset && (
        <div className="utm-dialog-overlay" onClick={() => setPreviewPreset(null)}>
          <div className="utm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>URL Preview: {previewPreset.name}</h3>

            <label className="utm-form-label">Base URL</label>
            <input
              type="text"
              className="utm-form-input"
              placeholder="https://alternatefutures.ai"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
            />

            <div className="utm-preview-result">
              <code className="utm-preview-url">
                {buildUtmUrl(previewUrl, {
                  utm_source: previewPreset.utm_source,
                  utm_medium: previewPreset.utm_medium,
                  utm_campaign: previewPreset.utm_campaign,
                  utm_term: previewPreset.utm_term || undefined,
                  utm_content: previewPreset.utm_content || undefined,
                })}
              </code>
              <button
                className="utm-preview-copy"
                onClick={() => {
                  const url = buildUtmUrl(previewUrl, {
                    utm_source: previewPreset.utm_source,
                    utm_medium: previewPreset.utm_medium,
                    utm_campaign: previewPreset.utm_campaign,
                    utm_term: previewPreset.utm_term || undefined,
                    utm_content: previewPreset.utm_content || undefined,
                  })
                  navigator.clipboard.writeText(url).catch(() => {})
                  setStatusMsg({ type: 'success', text: 'URL copied' })
                  setTimeout(() => setStatusMsg(null), 2000)
                }}
              >
                <PiCopyBold /> Copy URL
              </button>
            </div>

            <div className="utm-preview-breakdown">
              <div className="utm-preview-param">
                <span className="utm-preview-param-key">utm_source</span>
                <span className="utm-preview-param-val">{previewPreset.utm_source}</span>
              </div>
              <div className="utm-preview-param">
                <span className="utm-preview-param-key">utm_medium</span>
                <span className="utm-preview-param-val">{previewPreset.utm_medium}</span>
              </div>
              <div className="utm-preview-param">
                <span className="utm-preview-param-key">utm_campaign</span>
                <span className="utm-preview-param-val">{previewPreset.utm_campaign}</span>
              </div>
              {previewPreset.utm_term && (
                <div className="utm-preview-param">
                  <span className="utm-preview-param-key">utm_term</span>
                  <span className="utm-preview-param-val">{previewPreset.utm_term}</span>
                </div>
              )}
              {previewPreset.utm_content && (
                <div className="utm-preview-param">
                  <span className="utm-preview-param-key">utm_content</span>
                  <span className="utm-preview-param-val">{previewPreset.utm_content}</span>
                </div>
              )}
            </div>

            <div className="utm-dialog-actions">
              <button className="utm-dialog-cancel" onClick={() => setPreviewPreset(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
