'use client'

import { useState, useEffect, useCallback } from 'react'
import { PiTreeStructureBold, PiPlusBold } from 'react-icons/pi'
import {
  fetchApprovalRules,
  fetchTeamMembers,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule,
  type ApprovalRule,
  type ApprovalRuleType,
  type TeamMember,
  type SocialPlatform,
  type CreateApprovalRuleInput,
} from '@/lib/team-api'
import { getCookieValue } from '@/lib/cookies'
import '../team-settings.css'

const ALL_PLATFORMS: SocialPlatform[] = [
  'X', 'BLUESKY', 'MASTODON', 'LINKEDIN', 'REDDIT',
  'DISCORD', 'TELEGRAM', 'THREADS', 'INSTAGRAM', 'FACEBOOK',
]

const RULE_TYPE_LABELS: Record<ApprovalRuleType, { label: string; description: string }> = {
  auto_approve: {
    label: 'Auto-Approve',
    description: 'Trusted editors can publish directly on selected platforms without review.',
  },
  require_review: {
    label: 'Require Review',
    description: 'Posts need at least one reviewer approval before publishing.',
  },
  require_admin: {
    label: 'Require Admin',
    description: 'Posts need admin-level approval. Highest security for sensitive platforms.',
  },
}

export default function RulesPage() {
  const [rules, setRules] = useState<ApprovalRule[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApprovalRule | null>(null)

  // Create form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<ApprovalRuleType>('require_review')
  const [formPlatforms, setFormPlatforms] = useState<SocialPlatform[]>([])
  const [formTrusted, setFormTrusted] = useState<string[]>([])
  const [formApprovers, setFormApprovers] = useState<string[]>([])
  const [formMinApprovals, setFormMinApprovals] = useState(1)
  const [formAutoHours, setFormAutoHours] = useState<string>('')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [rulesData, membersData] = await Promise.all([
        fetchApprovalRules(token),
        fetchTeamMembers(token),
      ])
      setRules(rulesData)
      setMembers(membersData)
      setLoading(false)
    }
    load()
  }, [])

  const togglePlatform = useCallback((p: SocialPlatform) => {
    setFormPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }, [])

  const toggleTrusted = useCallback((id: string) => {
    setFormTrusted((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }, [])

  const toggleApprover = useCallback((id: string) => {
    setFormApprovers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }, [])

  const resetForm = useCallback(() => {
    setFormName('')
    setFormType('require_review')
    setFormPlatforms([])
    setFormTrusted([])
    setFormApprovers([])
    setFormMinApprovals(1)
    setFormAutoHours('')
  }, [])

  const handleCreate = useCallback(async () => {
    setSubmitting(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const input: CreateApprovalRuleInput = {
        name: formName.trim(),
        type: formType,
        platforms: formPlatforms,
        trustedEditors: formTrusted,
        requiredApprovers: formApprovers,
        minApprovals: formMinApprovals,
        autoApproveAfterHours: formAutoHours ? parseInt(formAutoHours, 10) : null,
      }
      const created = await createApprovalRule(token, input)
      setRules((prev) => [created, ...prev])
      setStatusMsg({ type: 'success', text: `Rule "${created.name}" created.` })
      setShowCreate(false)
      resetForm()
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to create rule.' })
    } finally {
      setSubmitting(false)
    }
  }, [formName, formType, formPlatforms, formTrusted, formApprovers, formMinApprovals, formAutoHours, resetForm])

  const handleToggleEnabled = useCallback(async (rule: ApprovalRule) => {
    const token = getCookieValue('af_access_token')
    try {
      const updated = await updateApprovalRule(token, rule.id, { enabled: !rule.enabled })
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)))
    } catch {
      // silent
    }
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteApprovalRule(token, deleteTarget.id)
      setRules((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setStatusMsg({ type: 'success', text: `Rule "${deleteTarget.name}" deleted.` })
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to delete rule.' })
    } finally {
      setSubmitting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  const getMemberName = (id: string) => members.find((m) => m.id === id)?.name || id

  const editors = members.filter((m) => m.role === 'editor')
  const approvers = members.filter((m) => m.role === 'reviewer' || m.role === 'admin')

  return (
    <>
      <div className="team-admin-header">
        <div>
          <h1>Approval Rules</h1>
          <p className="team-admin-subtitle">
            Configure who can approve for which platforms and set auto-approve rules.
          </p>
        </div>
        <button
          type="button"
          className="team-admin-primary-btn"
          onClick={() => { setShowCreate(true); resetForm() }}
        >
          <PiPlusBold style={{ marginRight: 6, verticalAlign: 'middle' }} />
          New Rule
        </button>
      </div>

      {statusMsg && (
        <div className={`team-status-msg ${statusMsg.type}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="team-admin-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="team-skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="team-skeleton-block w-32" />
              <div className="team-skeleton-block w-24" />
              <div className="team-skeleton-block w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && rules.length === 0 && !showCreate && (
        <div className="team-admin-empty">
          <div className="team-admin-empty-icon">
            <PiTreeStructureBold />
          </div>
          <h2>No approval rules</h2>
          <p>Create rules to define who can approve content for which platforms.</p>
        </div>
      )}

      {/* Rule cards */}
      {!loading && rules.length > 0 && (
        <div className="team-rule-list">
          {rules.map((rule) => (
            <div key={rule.id} className="team-rule-card" style={{ opacity: rule.enabled ? 1 : 0.5 }}>
              <div className="team-rule-card-header">
                <span className="team-rule-card-name">{rule.name}</span>
                <span className={`team-rule-type-chip ${rule.type}`}>
                  {RULE_TYPE_LABELS[rule.type].label}
                </span>
              </div>

              <div className="team-rule-platforms">
                {rule.platforms.map((p) => (
                  <span key={p} className="team-rule-platform-chip">{p}</span>
                ))}
              </div>

              <div className="team-rule-card-meta">
                {rule.type === 'auto_approve' && rule.trustedEditors.length > 0 && (
                  <div>
                    <strong>Trusted editors:</strong>{' '}
                    {rule.trustedEditors.map(getMemberName).join(', ')}
                  </div>
                )}
                {(rule.type === 'require_review' || rule.type === 'require_admin') && rule.requiredApprovers.length > 0 && (
                  <div>
                    <strong>Required approvers:</strong>{' '}
                    {rule.requiredApprovers.map(getMemberName).join(', ')}
                  </div>
                )}
                {rule.minApprovals > 0 && (
                  <div>
                    <strong>Min approvals:</strong> {rule.minApprovals}
                  </div>
                )}
                {rule.autoApproveAfterHours && (
                  <div>
                    <strong>Auto-approve after:</strong> {rule.autoApproveAfterHours}h without response
                  </div>
                )}
              </div>

              <div className="team-rule-card-actions">
                <label className="team-toggle-wrap">
                  <span className="team-toggle">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggleEnabled(rule)}
                    />
                    <span className="team-toggle-track" />
                  </span>
                  <span className="team-toggle-label">{rule.enabled ? 'Enabled' : 'Disabled'}</span>
                </label>
                <div style={{ marginLeft: 'auto' }}>
                  <button
                    type="button"
                    className="team-action-btn danger"
                    onClick={() => setDeleteTarget(rule)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      {showCreate && (
        <div className="team-admin-dialog-overlay" onClick={() => setShowCreate(false)}>
          <div className="team-admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>New Approval Rule</h3>
            <p>Define who needs to approve content for specific platforms.</p>

            <div className="team-form-group">
              <label className="team-form-label">Rule Name</label>
              <input
                type="text"
                className="team-form-input"
                placeholder="e.g., Auto-approve Echo on X"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Rule Type</label>
              <select
                className="team-form-select"
                value={formType}
                onChange={(e) => setFormType(e.target.value as ApprovalRuleType)}
              >
                {(Object.entries(RULE_TYPE_LABELS) as [ApprovalRuleType, { label: string; description: string }][]).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <p className="team-form-hint">{RULE_TYPE_LABELS[formType].description}</p>
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Platforms</label>
              <div className="team-platform-grid">
                {ALL_PLATFORMS.map((p) => (
                  <label key={p} className={`team-platform-toggle${formPlatforms.includes(p) ? ' selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formPlatforms.includes(p)}
                      onChange={() => togglePlatform(p)}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            {formType === 'auto_approve' && (
              <div className="team-form-group">
                <label className="team-form-label">Trusted Editors</label>
                <div className="team-checkbox-group">
                  {editors.map((m) => (
                    <label key={m.id} className="team-checkbox-item">
                      <input
                        type="checkbox"
                        checked={formTrusted.includes(m.id)}
                        onChange={() => toggleTrusted(m.id)}
                      />
                      {m.name}
                    </label>
                  ))}
                </div>
                <p className="team-form-hint">These editors can publish without review on the selected platforms.</p>
              </div>
            )}

            {(formType === 'require_review' || formType === 'require_admin') && (
              <>
                <div className="team-form-group">
                  <label className="team-form-label">Required Approvers</label>
                  <div className="team-checkbox-group">
                    {approvers.map((m) => (
                      <label key={m.id} className="team-checkbox-item">
                        <input
                          type="checkbox"
                          checked={formApprovers.includes(m.id)}
                          onChange={() => toggleApprover(m.id)}
                        />
                        {m.name} ({m.role})
                      </label>
                    ))}
                  </div>
                </div>

                <div className="team-form-group">
                  <label className="team-form-label">Minimum Approvals</label>
                  <input
                    type="number"
                    className="team-form-input"
                    min={1}
                    max={10}
                    value={formMinApprovals}
                    onChange={(e) => setFormMinApprovals(parseInt(e.target.value, 10) || 1)}
                    style={{ width: 120 }}
                  />
                </div>

                <div className="team-form-group">
                  <label className="team-form-label">Auto-Approve After (hours)</label>
                  <input
                    type="number"
                    className="team-form-input"
                    placeholder="Leave empty to disable"
                    min={1}
                    value={formAutoHours}
                    onChange={(e) => setFormAutoHours(e.target.value)}
                    style={{ width: 200 }}
                  />
                  <p className="team-form-hint">
                    Auto-approve if no response within this time. Leave empty to require manual approval.
                  </p>
                </div>
              </>
            )}

            <div className="team-admin-dialog-actions">
              <button type="button" className="team-admin-dialog-cancel" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="team-admin-primary-btn"
                onClick={handleCreate}
                disabled={submitting || !formName.trim() || formPlatforms.length === 0}
              >
                {submitting ? 'Creating...' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="team-admin-dialog-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="team-admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Rule</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              This will remove the approval requirement for the associated platforms.
            </p>
            <div className="team-admin-dialog-actions">
              <button type="button" className="team-admin-dialog-cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="team-action-btn danger"
                onClick={handleDelete}
                disabled={submitting}
                style={{ padding: 'var(--af-space-breath) var(--af-space-hand)' }}
              >
                {submitting ? 'Deleting...' : 'Delete Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
