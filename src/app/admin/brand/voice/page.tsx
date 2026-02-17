'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDialog } from '@/hooks/useDialog'
import {
  fetchAllVoiceProfiles,
  createVoiceProfile,
  updateVoiceProfile,
  deleteVoiceProfile,
  type BrandVoiceProfile,
  type CreateVoiceProfileInput,
} from '@/lib/brand-api'
import { validateContent } from '@/lib/brand-validation-api'
import { getCookieValue } from '@/lib/cookies'
import '../brand-admin.css'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FORMALITY_OPTIONS: BrandVoiceProfile['formality'][] = ['CASUAL', 'NEUTRAL', 'FORMAL']

function formalityLabel(f: string): string {
  return f.charAt(0) + f.slice(1).toLowerCase()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VoiceProfilePage() {
  const [profiles, setProfiles] = useState<BrandVoiceProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit/Create dialog
  const [showDialog, setShowDialog] = useState(false)
  const [editProfile, setEditProfile] = useState<BrandVoiceProfile | null>(null)
  const [formName, setFormName] = useState('')
  const [formTone, setFormTone] = useState('')
  const [formFormality, setFormFormality] = useState<BrandVoiceProfile['formality']>('NEUTRAL')
  const [formTraits, setFormTraits] = useState('')
  const [formDo, setFormDo] = useState('')
  const [formDont, setFormDont] = useState('')
  const [formGood, setFormGood] = useState('')
  const [formBad, setFormBad] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<BrandVoiceProfile | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Voice validation
  const [validateText, setValidateText] = useState('')
  const [validatePlatform, setValidatePlatform] = useState('MARKETING')
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{ score: number; violations: { id: string; message: string; severity: string; suggestion: string | null }[] } | null>(null)

  const closeDialogs = useCallback(() => {
    setShowDialog(false)
    setEditProfile(null)
    setDeleteTarget(null)
    setSaveError('')
  }, [])

  const dialogRef = useDialog(showDialog || !!editProfile, closeDialogs)
  const deleteDialogRef = useDialog(!!deleteTarget, () => setDeleteTarget(null))

  // ---------------------------------------------------------------------------
  // Load
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const data = await fetchAllVoiceProfiles(token)
        setProfiles(data)
      } catch {
        setError('Failed to load voice profiles.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ---------------------------------------------------------------------------
  // Create/Edit
  // ---------------------------------------------------------------------------

  function splitLines(s: string): string[] {
    return s.split('\n').map((l) => l.trim()).filter(Boolean)
  }

  const openCreate = useCallback(() => {
    setFormName('')
    setFormTone('')
    setFormFormality('NEUTRAL')
    setFormTraits('')
    setFormDo('')
    setFormDont('')
    setFormGood('')
    setFormBad('')
    setSaveError('')
    setEditProfile(null)
    setShowDialog(true)
  }, [])

  const openEdit = useCallback((p: BrandVoiceProfile) => {
    setFormName(p.name)
    setFormTone(p.tone.join(', '))
    setFormFormality(p.formality)
    setFormTraits(p.personalityTraits.join('\n'))
    setFormDo(p.doList.join('\n'))
    setFormDont(p.dontList.join('\n'))
    setFormGood(p.exampleGood.join('\n---\n'))
    setFormBad(p.exampleBad.join('\n---\n'))
    setSaveError('')
    setEditProfile(p)
    setShowDialog(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formName.trim()) {
      setSaveError('Name is required.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      const token = getCookieValue('af_access_token')
      const toneArr = formTone.split(',').map((s) => s.trim()).filter(Boolean)
      const traitsArr = splitLines(formTraits)
      const doArr = splitLines(formDo)
      const dontArr = splitLines(formDont)
      const goodArr = formGood.split('---').map((s) => s.trim()).filter(Boolean)
      const badArr = formBad.split('---').map((s) => s.trim()).filter(Boolean)

      if (editProfile) {
        const updated = await updateVoiceProfile(token, editProfile.id, {
          name: formName,
          tone: toneArr,
          formality: formFormality,
          personalityTraits: traitsArr,
          doList: doArr,
          dontList: dontArr,
          exampleGood: goodArr,
          exampleBad: badArr,
        })
        setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      } else {
        const input: CreateVoiceProfileInput = {
          name: formName,
          tone: toneArr,
          formality: formFormality,
          personalityTraits: traitsArr,
          doList: doArr,
          dontList: dontArr,
          exampleGood: goodArr,
          exampleBad: badArr,
        }
        const created = await createVoiceProfile(token, input)
        setProfiles((prev) => [created, ...prev])
      }
      closeDialogs()
    } catch {
      setSaveError('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }, [formName, formTone, formFormality, formTraits, formDo, formDont, formGood, formBad, editProfile, closeDialogs])

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteVoiceProfile(token, deleteTarget.id)
      setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      setSaveError('Failed to delete profile.')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget])

  // ---------------------------------------------------------------------------
  // Voice validation
  // ---------------------------------------------------------------------------

  const handleValidate = useCallback(async () => {
    if (!validateText.trim()) return
    setValidating(true)
    setValidationResult(null)
    try {
      const token = getCookieValue('af_access_token')
      const result = await validateContent(validateText, validatePlatform, token)
      setValidationResult({
        score: result.voiceConsistencyScore,
        violations: result.violations
          .filter((v) => v.category === 'VOICE' || v.category === 'TONE')
          .map((v) => ({
            id: v.id,
            message: v.message,
            severity: v.severity,
            suggestion: v.suggestion,
          })),
      })
    } catch {
      setValidationResult({ score: 0, violations: [] })
    } finally {
      setValidating(false)
    }
  }, [validateText, validatePlatform])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="brand-admin-empty">
        <p>Loading voice profiles...</p>
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
          <h1>Voice Profiles</h1>
          <p className="brand-admin-subtitle">Define and validate brand voice across content</p>
        </div>
        <button className="brand-admin-new-btn" onClick={openCreate}>
          + New Profile
        </button>
      </div>

      {/* Voice validation tool */}
      <div className="brand-admin-card">
        <h3>Voice Validation</h3>
        <textarea
          className="brand-admin-textarea"
          rows={4}
          value={validateText}
          onChange={(e) => setValidateText(e.target.value)}
          placeholder="Paste content to check against voice profiles..."
        />
        <div className="brand-admin-voice-validate-row">
          <select
            className="brand-admin-select"
            value={validatePlatform}
            onChange={(e) => setValidatePlatform(e.target.value)}
          >
            <option value="X">X / Twitter</option>
            <option value="BLUESKY">Bluesky</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="BLOG">Blog</option>
            <option value="DISCORD">Discord</option>
            <option value="DOCUMENTATION">Documentation</option>
            <option value="MARKETING">Marketing</option>
          </select>
          <button
            className="brand-admin-new-btn"
            onClick={handleValidate}
            disabled={validating || !validateText.trim()}
          >
            {validating ? 'Checking...' : 'Check Voice'}
          </button>
        </div>

        {validationResult && (
          <div style={{ marginTop: 'var(--af-space-hand)' }}>
            <div className={`brand-admin-score-ring ${validationResult.score >= 80 ? 'pass' : validationResult.score >= 60 ? 'warn' : 'fail'}`}>
              {validationResult.score}
            </div>
            {validationResult.violations.length === 0 ? (
              <div className="brand-admin-scan-pass">Voice check passed.</div>
            ) : (
              validationResult.violations.map((v) => (
                <div
                  key={v.id}
                  className={`brand-admin-violation brand-admin-violation--${v.severity.toLowerCase()}`}
                >
                  <div className="brand-admin-violation-header">
                    <span className={`brand-admin-chip brand-admin-chip--${v.severity.toLowerCase()}`}>
                      {v.severity}
                    </span>
                  </div>
                  <p className="brand-admin-violation-message">{v.message}</p>
                  {v.suggestion && (
                    <p className="brand-admin-violation-suggestion">{v.suggestion}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Profile cards */}
      {profiles.length === 0 ? (
        <div className="brand-admin-empty">
          <h2>No voice profiles yet</h2>
          <p>Create your first voice profile to define your brand tone.</p>
        </div>
      ) : (
        profiles.map((profile) => (
          <div key={profile.id} className="brand-admin-card">
            <div className="brand-admin-voice-card-header">
              <div>
                <div className="brand-admin-card-title">{profile.name}</div>
                <span className="brand-admin-chip brand-admin-chip--info">
                  {formalityLabel(profile.formality)}
                </span>
              </div>
              <div className="brand-admin-actions">
                <button className="brand-admin-action-btn" onClick={() => openEdit(profile)}>
                  Edit
                </button>
                <button className="brand-admin-action-btn danger" onClick={() => setDeleteTarget(profile)}>
                  Delete
                </button>
              </div>
            </div>

            {/* Tone tags */}
            <div style={{ margin: 'var(--af-space-palm) 0' }}>
              {profile.tone.map((t) => (
                <span key={t} className="brand-admin-tone-tag">{t}</span>
              ))}
            </div>

            {/* Personality traits */}
            {profile.personalityTraits.length > 0 && (
              <div style={{ marginBottom: 'var(--af-space-hand)' }}>
                <h3>Personality</h3>
                <ul className="brand-admin-list">
                  {profile.personalityTraits.map((trait, i) => (
                    <li key={i}>{trait}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="brand-admin-grid-2">
              {/* Do list */}
              {profile.doList.length > 0 && (
                <div>
                  <h3>Do</h3>
                  <ul className="brand-admin-list brand-admin-list--do">
                    {profile.doList.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Don't list */}
              {profile.dontList.length > 0 && (
                <div>
                  <h3>Don&apos;t</h3>
                  <ul className="brand-admin-list brand-admin-list--dont">
                    {profile.dontList.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Examples */}
            {(profile.exampleGood.length > 0 || profile.exampleBad.length > 0) && (
              <div style={{ marginTop: 'var(--af-space-hand)' }}>
                <h3>Examples</h3>
                {profile.exampleGood.map((ex, i) => (
                  <div key={`good-${i}`} className="brand-admin-example brand-admin-example--good">
                    {ex}
                  </div>
                ))}
                {profile.exampleBad.map((ex, i) => (
                  <div key={`bad-${i}`} className="brand-admin-example brand-admin-example--bad">
                    {ex}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Create/Edit dialog */}
      {(showDialog || editProfile) && (
        <div className="brand-admin-dialog-overlay" onClick={closeDialogs}>
          <div
            className="brand-admin-dialog brand-admin-dialog--wide"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{editProfile ? 'Edit Voice Profile' : 'New Voice Profile'}</h3>

            {saveError && <div className="brand-admin-form-error">{saveError}</div>}

            <div className="brand-admin-form-group">
              <label className="brand-admin-form-label">Name</label>
              <input
                type="text"
                className="brand-admin-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Primary Voice"
              />
            </div>

            <div className="brand-admin-grid-2">
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Tone (comma-separated)</label>
                <input
                  type="text"
                  className="brand-admin-input"
                  value={formTone}
                  onChange={(e) => setFormTone(e.target.value)}
                  placeholder="confident, direct, warm"
                />
              </div>
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Formality</label>
                <select
                  className="brand-admin-select"
                  value={formFormality}
                  onChange={(e) => setFormFormality(e.target.value as BrandVoiceProfile['formality'])}
                  style={{ width: '100%' }}
                >
                  {FORMALITY_OPTIONS.map((f) => (
                    <option key={f} value={f}>{formalityLabel(f)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="brand-admin-form-group">
              <label className="brand-admin-form-label">Personality Traits (one per line)</label>
              <textarea
                className="brand-admin-textarea"
                rows={3}
                value={formTraits}
                onChange={(e) => setFormTraits(e.target.value)}
                placeholder="Builder mentality&#10;Quiet confidence&#10;Community-first"
              />
            </div>

            <div className="brand-admin-grid-2">
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Do (one per line)</label>
                <textarea
                  className="brand-admin-textarea"
                  rows={4}
                  value={formDo}
                  onChange={(e) => setFormDo(e.target.value)}
                  placeholder='Use "we" to represent the team&#10;Be specific with numbers'
                />
              </div>
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Don&apos;t (one per line)</label>
                <textarea
                  className="brand-admin-textarea"
                  rows={4}
                  value={formDont}
                  onChange={(e) => setFormDont(e.target.value)}
                  placeholder="Use hype words&#10;Make claims without evidence"
                />
              </div>
            </div>

            <div className="brand-admin-grid-2">
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Good Examples (separate with ---)</label>
                <textarea
                  className="brand-admin-textarea"
                  rows={4}
                  value={formGood}
                  onChange={(e) => setFormGood(e.target.value)}
                  placeholder="Deploy your AI agent to decentralized infrastructure in under 2 minutes."
                />
              </div>
              <div className="brand-admin-form-group">
                <label className="brand-admin-form-label">Bad Examples (separate with ---)</label>
                <textarea
                  className="brand-admin-textarea"
                  rows={4}
                  value={formBad}
                  onChange={(e) => setFormBad(e.target.value)}
                  placeholder="We are REVOLUTIONIZING the cloud industry!!!"
                />
              </div>
            </div>

            <div className="brand-admin-dialog-actions">
              <button className="brand-admin-secondary-btn" onClick={closeDialogs}>
                Cancel
              </button>
              <button className="brand-admin-new-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editProfile ? 'Update' : 'Create'}
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
            <h3>Delete voice profile?</h3>
            <p style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-sm)', color: 'var(--af-stone-600)' }}>
              Are you sure you want to delete &ldquo;{deleteTarget.name}&rdquo;?
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
