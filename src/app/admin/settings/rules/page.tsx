'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PiLightningBold,
  PiPlusBold,
  PiTrashBold,
  PiClockBold,
  PiGearBold,
} from 'react-icons/pi'
import {
  fetchAutomationRules,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  AUTOMATION_TRIGGERS,
  AUTOMATION_ACTIONS,
  CONDITION_FIELDS,
  type AutomationRule,
  type AutomationTrigger,
  type AutomationAction,
  type AutomationCondition,
  type CreateAutomationRuleInput,
} from '@/lib/settings-api'
import { getCookieValue } from '@/lib/cookies'
import '../team-settings.css'

const TRIGGER_LABELS: Record<string, string> = Object.fromEntries(
  AUTOMATION_TRIGGERS.map((t) => [t.value, t.label]),
)

const ACTION_LABELS: Record<string, string> = Object.fromEntries(
  AUTOMATION_ACTIONS.map((a) => [a.value, a.label]),
)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AutomationRulesPage() {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AutomationRule | null>(null)

  // Create form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formTrigger, setFormTrigger] = useState<AutomationTrigger>('post.published')
  const [formAction, setFormAction] = useState<AutomationAction>('send_slack_notification')
  const [formConditions, setFormConditions] = useState<AutomationCondition[]>([])
  const [formActionConfig, setFormActionConfig] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAutomationRules(token)
      setRules(data)
      setLoading(false)
    }
    load()
  }, [])

  const resetForm = useCallback(() => {
    setFormName('')
    setFormDescription('')
    setFormTrigger('post.published')
    setFormAction('send_slack_notification')
    setFormConditions([])
    setFormActionConfig({})
  }, [])

  const addCondition = useCallback(() => {
    setFormConditions((prev) => [
      ...prev,
      { field: 'platform', operator: 'equals', value: '' },
    ])
  }, [])

  const removeCondition = useCallback((idx: number) => {
    setFormConditions((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const updateCondition = useCallback(
    (idx: number, updates: Partial<AutomationCondition>) => {
      setFormConditions((prev) =>
        prev.map((c, i) => (i === idx ? { ...c, ...updates } : c)),
      )
    },
    [],
  )

  const handleCreate = useCallback(async () => {
    setSubmitting(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const input: CreateAutomationRuleInput = {
        name: formName.trim(),
        description: formDescription.trim(),
        trigger: formTrigger,
        conditions: formConditions.filter((c) => c.value.trim() !== ''),
        action: formAction,
        actionConfig: formActionConfig,
      }
      const created = await createAutomationRule(token, input)
      setRules((prev) => [created, ...prev])
      setStatusMsg({ type: 'success', text: `Rule "${created.name}" created.` })
      setShowCreate(false)
      resetForm()
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to create rule.' })
    } finally {
      setSubmitting(false)
    }
  }, [formName, formDescription, formTrigger, formConditions, formAction, formActionConfig, resetForm])

  const handleToggleEnabled = useCallback(async (rule: AutomationRule) => {
    const token = getCookieValue('af_access_token')
    try {
      const updated = await updateAutomationRule(token, rule.id, { enabled: !rule.enabled })
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)))
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to update rule.' })
    }
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteAutomationRule(token, deleteTarget.id)
      setRules((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setStatusMsg({ type: 'success', text: `Rule "${deleteTarget.name}" deleted.` })
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to delete rule.' })
    } finally {
      setSubmitting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  const triggerCategories = [...new Set(AUTOMATION_TRIGGERS.map((t) => t.category))]

  return (
    <>
      <div className="team-admin-header">
        <div>
          <h1>Automation Rules</h1>
          <p className="team-admin-subtitle">
            Automate workflows with trigger-based rules. When an event occurs, run an action automatically.
          </p>
        </div>
        <button
          type="button"
          className="team-admin-primary-btn"
          onClick={() => { setShowCreate(true); resetForm() }}
        >
          <PiPlusBold style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Create Rule
        </button>
      </div>

      {statusMsg && (
        <div className={`team-status-msg ${statusMsg.type}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Stats */}
      <div className="team-admin-stats">
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Total Rules</div>
          <div className="team-admin-stat-value">{rules.length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Active</div>
          <div className="team-admin-stat-value">{rules.filter((r) => r.enabled).length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Total Triggers</div>
          <div className="team-admin-stat-value">{rules.reduce((sum, r) => sum + r.triggerCount, 0)}</div>
        </div>
      </div>

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
            <PiLightningBold />
          </div>
          <h2>No automation rules</h2>
          <p>Create rules to automate workflows based on events in your platform.</p>
        </div>
      )}

      {/* Rule cards */}
      {!loading && rules.length > 0 && (
        <div className="team-rule-list">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="team-rule-card"
              style={{ opacity: rule.enabled ? 1 : 0.5 }}
            >
              <div className="team-rule-card-header">
                <span className="team-rule-card-name">{rule.name}</span>
                <span className={`team-rule-type-chip ${rule.enabled ? 'require_review' : 'auto_approve'}`}>
                  {rule.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>

              {rule.description && (
                <div style={{
                  fontFamily: 'var(--af-font-architect)',
                  fontSize: 'var(--af-type-sm)',
                  color: 'var(--af-stone-500)',
                  marginBottom: 'var(--af-space-palm)',
                }}>
                  {rule.description}
                </div>
              )}

              <div className="team-rule-platforms" style={{ marginBottom: 'var(--af-space-palm)' }}>
                <span className="team-rule-platform-chip" style={{ background: 'rgba(0, 10, 255, 0.06)', color: 'var(--af-ultra)', borderColor: 'rgba(0, 10, 255, 0.15)' }}>
                  <PiLightningBold style={{ marginRight: 3, verticalAlign: 'middle', fontSize: 11 }} />
                  {TRIGGER_LABELS[rule.trigger] || rule.trigger}
                </span>
                <span style={{
                  fontFamily: 'var(--af-font-architect)',
                  fontSize: 'var(--af-type-xs)',
                  color: 'var(--af-stone-400)',
                  padding: '0 var(--af-space-grain)',
                }}>
                  &rarr;
                </span>
                <span className="team-rule-platform-chip" style={{ background: 'rgba(92, 122, 107, 0.06)', color: 'var(--af-patina)', borderColor: 'rgba(92, 122, 107, 0.15)' }}>
                  <PiGearBold style={{ marginRight: 3, verticalAlign: 'middle', fontSize: 11 }} />
                  {ACTION_LABELS[rule.action] || rule.action}
                </span>
              </div>

              {rule.conditions.length > 0 && (
                <div className="team-rule-card-meta">
                  <div>
                    <strong>Conditions:</strong>{' '}
                    {rule.conditions.map((c, i) => (
                      <span key={i} style={{ fontFamily: 'var(--af-font-machine)', fontSize: 'var(--af-type-xs)' }}>
                        {c.field} {c.operator} &quot;{c.value}&quot;
                        {i < rule.conditions.length - 1 ? ' AND ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(rule.actionConfig).length > 0 && (
                <div className="team-rule-card-meta">
                  {Object.entries(rule.actionConfig).map(([key, val]) => (
                    <div key={key}>
                      <strong>{key}:</strong>{' '}
                      <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 'var(--af-type-xs)' }}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="team-rule-card-meta" style={{ display: 'flex', gap: 'var(--af-space-hand)', flexWrap: 'wrap' }}>
                <div>
                  <PiLightningBold style={{ marginRight: 3, verticalAlign: 'middle', fontSize: 12, color: 'var(--af-stone-400)' }} />
                  <strong>Triggered:</strong> {rule.triggerCount} time{rule.triggerCount !== 1 ? 's' : ''}
                </div>
                {rule.lastTriggeredAt && (
                  <div>
                    <PiClockBold style={{ marginRight: 3, verticalAlign: 'middle', fontSize: 12, color: 'var(--af-stone-400)' }} />
                    <strong>Last:</strong> {formatDate(rule.lastTriggeredAt)}
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
                  <span className="team-toggle-label">{rule.enabled ? 'Active' : 'Inactive'}</span>
                </label>
                <div style={{ marginLeft: 'auto' }}>
                  <button
                    type="button"
                    className="team-action-btn danger"
                    onClick={() => setDeleteTarget(rule)}
                  >
                    <PiTrashBold style={{ marginRight: 4, verticalAlign: 'middle' }} />
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
          <div className="team-admin-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h3>Create Automation Rule</h3>
            <p>Define a trigger, optional conditions, and an action to automate.</p>

            <div className="team-form-group">
              <label className="team-form-label">Rule Name</label>
              <input
                type="text"
                className="team-form-input"
                placeholder="e.g., Notify Slack on publish"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Description</label>
              <input
                type="text"
                className="team-form-input"
                placeholder="Optional description of what this rule does"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Trigger</label>
              <select
                className="team-form-select"
                value={formTrigger}
                onChange={(e) => setFormTrigger(e.target.value as AutomationTrigger)}
              >
                {triggerCategories.map((cat) => (
                  <optgroup key={cat} label={cat}>
                    {AUTOMATION_TRIGGERS
                      .filter((t) => t.category === cat)
                      .map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Conditions */}
            <div className="team-form-group">
              <label className="team-form-label">Conditions (optional)</label>
              {formConditions.map((cond, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: 'var(--af-space-breath)',
                    alignItems: 'center',
                    marginBottom: 'var(--af-space-breath)',
                  }}
                >
                  <select
                    className="team-form-select"
                    value={cond.field}
                    onChange={(e) => updateCondition(idx, { field: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    {CONDITION_FIELDS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <select
                    className="team-form-select"
                    value={cond.operator}
                    onChange={(e) => updateCondition(idx, { operator: e.target.value as AutomationCondition['operator'] })}
                    style={{ flex: 1 }}
                  >
                    <option value="equals">equals</option>
                    <option value="not_equals">not equals</option>
                    <option value="contains">contains</option>
                    <option value="in">in</option>
                  </select>
                  <input
                    type="text"
                    className="team-form-input"
                    placeholder="Value"
                    value={cond.value}
                    onChange={(e) => updateCondition(idx, { value: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="team-action-btn danger"
                    onClick={() => removeCondition(idx)}
                    style={{ flexShrink: 0, padding: 'var(--af-space-grain) var(--af-space-breath)' }}
                  >
                    <PiTrashBold />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="team-action-btn"
                onClick={addCondition}
                style={{ fontSize: 'var(--af-type-xs)' }}
              >
                <PiPlusBold style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Add condition
              </button>
              <p className="team-form-hint">
                Conditions narrow when the rule fires. Leave empty to trigger on all matching events.
              </p>
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Action</label>
              <select
                className="team-form-select"
                value={formAction}
                onChange={(e) => {
                  setFormAction(e.target.value as AutomationAction)
                  setFormActionConfig({})
                }}
              >
                {AUTOMATION_ACTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
              <p className="team-form-hint">
                {AUTOMATION_ACTIONS.find((a) => a.value === formAction)?.description}
              </p>
            </div>

            {/* Action-specific config */}
            {(formAction === 'send_slack_notification' || formAction === 'send_discord_notification') && (
              <div className="team-form-group">
                <label className="team-form-label">Channel</label>
                <input
                  type="text"
                  className="team-form-input"
                  placeholder={formAction === 'send_slack_notification' ? '#channel-name' : '#discord-channel'}
                  value={formActionConfig.channel || ''}
                  onChange={(e) => setFormActionConfig((prev) => ({ ...prev, channel: e.target.value }))}
                />
              </div>
            )}

            {formAction === 'send_email_notification' && (
              <div className="team-form-group">
                <label className="team-form-label">Recipients</label>
                <input
                  type="text"
                  className="team-form-input"
                  placeholder="email@example.com, another@example.com"
                  value={formActionConfig.recipients || ''}
                  onChange={(e) => setFormActionConfig((prev) => ({ ...prev, recipients: e.target.value }))}
                />
              </div>
            )}

            {formAction === 'assign_reviewer' && (
              <div className="team-form-group">
                <label className="team-form-label">Reviewer</label>
                <input
                  type="text"
                  className="team-form-input"
                  placeholder="Team member name or ID"
                  value={formActionConfig.reviewer || ''}
                  onChange={(e) => setFormActionConfig((prev) => ({ ...prev, reviewer: e.target.value }))}
                />
              </div>
            )}

            {formAction === 'tag_post' && (
              <div className="team-form-group">
                <label className="team-form-label">Tags</label>
                <input
                  type="text"
                  className="team-form-input"
                  placeholder="tag1, tag2, tag3"
                  value={formActionConfig.tags || ''}
                  onChange={(e) => setFormActionConfig((prev) => ({ ...prev, tags: e.target.value }))}
                />
              </div>
            )}

            {formAction === 'run_webhook' && (
              <div className="team-form-group">
                <label className="team-form-label">Webhook URL</label>
                <input
                  type="url"
                  className="team-form-input"
                  placeholder="https://your-service.com/webhook"
                  value={formActionConfig.url || ''}
                  onChange={(e) => setFormActionConfig((prev) => ({ ...prev, url: e.target.value }))}
                />
              </div>
            )}

            {formAction === 'add_to_queue' && (
              <div className="team-form-group">
                <label className="team-form-label">Priority</label>
                <select
                  className="team-form-select"
                  value={formActionConfig.priority || 'normal'}
                  onChange={(e) => setFormActionConfig((prev) => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            )}

            <div className="team-admin-dialog-actions">
              <button
                type="button"
                className="team-admin-dialog-cancel"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="team-admin-primary-btn"
                onClick={handleCreate}
                disabled={submitting || !formName.trim()}
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
            <h3>Delete Automation Rule</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              This rule will stop running and cannot be recovered.
            </p>
            <div className="team-admin-dialog-actions">
              <button
                type="button"
                className="team-admin-dialog-cancel"
                onClick={() => setDeleteTarget(null)}
              >
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
