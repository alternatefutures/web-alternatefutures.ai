'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PiWebhooksLogoBold,
  PiPlusBold,
  PiEyeBold,
  PiArrowsClockwiseBold,
  PiCopyBold,
} from 'react-icons/pi'
import {
  fetchWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  fetchWebhookDeliveries,
  rotateWebhookSecret,
  ALL_WEBHOOK_EVENTS,
  type WebhookEndpoint,
  type WebhookDelivery,
  type WebhookEventType,
  type CreateWebhookInput,
} from '@/lib/settings-api'
import { getCookieValue } from '@/lib/cookies'
import '../team-settings.css'
import '../settings-enterprise.css'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function successRateClass(rate: number): string {
  if (rate >= 95) return 'good'
  if (rate >= 70) return 'warning'
  return 'bad'
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WebhookEndpoint | null>(null)
  const [deliveryView, setDeliveryView] = useState<{ webhook: WebhookEndpoint; deliveries: WebhookDelivery[] } | null>(null)
  const [payloadPreview, setPayloadPreview] = useState<WebhookDelivery | null>(null)
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set())

  // Create form
  const [formUrl, setFormUrl] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formEvents, setFormEvents] = useState<WebhookEventType[]>([])
  const [formRetry, setFormRetry] = useState(true)
  const [formMaxRetries, setFormMaxRetries] = useState(3)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchWebhooks(token)
      setWebhooks(data)
      setLoading(false)
    }
    load()
  }, [])

  const toggleEvent = useCallback((event: WebhookEventType) => {
    setFormEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    )
  }, [])

  const resetForm = useCallback(() => {
    setFormUrl('')
    setFormDesc('')
    setFormEvents([])
    setFormRetry(true)
    setFormMaxRetries(3)
  }, [])

  const handleCreate = useCallback(async () => {
    setSubmitting(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const input: CreateWebhookInput = {
        url: formUrl.trim(),
        description: formDesc.trim(),
        events: formEvents,
        retryEnabled: formRetry,
        maxRetries: formMaxRetries,
      }
      const created = await createWebhook(token, input)
      setWebhooks((prev) => [created, ...prev])
      setStatusMsg({ type: 'success', text: 'Webhook endpoint created.' })
      setShowCreate(false)
      resetForm()
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to create webhook.' })
    } finally {
      setSubmitting(false)
    }
  }, [formUrl, formDesc, formEvents, formRetry, formMaxRetries, resetForm])

  const handleToggleStatus = useCallback(async (webhook: WebhookEndpoint) => {
    const token = getCookieValue('af_access_token')
    const newStatus = webhook.status === 'active' ? 'inactive' as const : 'active' as const
    try {
      const updated = await updateWebhook(token, webhook.id, { status: newStatus })
      setWebhooks((prev) => prev.map((w) => (w.id === webhook.id ? updated : w)))
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to update webhook.' })
    }
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteWebhook(token, deleteTarget.id)
      setWebhooks((prev) => prev.filter((w) => w.id !== deleteTarget.id))
      setStatusMsg({ type: 'success', text: 'Webhook endpoint removed.' })
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to delete webhook.' })
    } finally {
      setSubmitting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  const handleViewDeliveries = useCallback(async (webhook: WebhookEndpoint) => {
    const token = getCookieValue('af_access_token')
    const deliveries = await fetchWebhookDeliveries(token, webhook.id)
    setDeliveryView({ webhook, deliveries })
  }, [])

  const handleRotateSecret = useCallback(async (webhook: WebhookEndpoint) => {
    const token = getCookieValue('af_access_token')
    try {
      const newSecret = await rotateWebhookSecret(token, webhook.id)
      setWebhooks((prev) =>
        prev.map((w) => (w.id === webhook.id ? { ...w, signingSecret: newSecret } : w)),
      )
      setStatusMsg({ type: 'success', text: 'Signing secret rotated.' })
      setRevealedSecrets((prev) => new Set([...prev, webhook.id]))
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to rotate secret.' })
    }
  }, [])

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setStatusMsg({ type: 'success', text: 'Copied to clipboard.' })
  }, [])

  const eventCategories = [...new Set(ALL_WEBHOOK_EVENTS.map((e) => e.category))]

  return (
    <>
      <div className="team-admin-header">
        <div>
          <h1>Webhooks</h1>
          <p className="team-admin-subtitle">
            Register endpoints, select events, and monitor delivery logs.
          </p>
        </div>
        <button
          type="button"
          className="team-admin-primary-btn"
          onClick={() => { setShowCreate(true); resetForm() }}
        >
          <PiPlusBold style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Add Endpoint
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
          <div className="team-admin-stat-label">Endpoints</div>
          <div className="team-admin-stat-value">{webhooks.length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Active</div>
          <div className="team-admin-stat-value">{webhooks.filter((w) => w.status === 'active').length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Failing</div>
          <div className="team-admin-stat-value">{webhooks.filter((w) => w.status === 'failing').length}</div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="team-admin-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="team-skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="team-skeleton-block w-32" />
              <div className="team-skeleton-block w-24" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && webhooks.length === 0 && (
        <div className="team-admin-empty">
          <div className="team-admin-empty-icon"><PiWebhooksLogoBold /></div>
          <h2>No webhook endpoints</h2>
          <p>Register an endpoint to receive real-time event notifications via HTTP.</p>
        </div>
      )}

      {/* Webhook cards */}
      {!loading && webhooks.length > 0 && (
        <div className="webhook-list">
          {webhooks.map((wh) => (
            <div key={wh.id} className="webhook-card">
              <div className="webhook-card-header">
                <span className="webhook-url" title={wh.url}>{wh.url}</span>
                <span className={`webhook-status-badge ${wh.status}`}>
                  {wh.status === 'active' ? 'Active' : wh.status === 'failing' ? 'Failing' : 'Inactive'}
                </span>
              </div>

              <div className="webhook-desc">{wh.description}</div>

              <div className="webhook-events">
                {wh.events.map((evt) => (
                  <span key={evt} className="webhook-event-chip">{evt}</span>
                ))}
              </div>

              <div className="webhook-meta">
                <span>
                  <strong>Success rate:</strong>{' '}
                  <span className={`webhook-success-rate ${successRateClass(wh.successRate)}`}>
                    {wh.successRate.toFixed(1)}%
                  </span>
                </span>
                <span>
                  <strong>Retries:</strong> {wh.retryEnabled ? `Up to ${wh.maxRetries}` : 'Disabled'}
                </span>
                {wh.lastDeliveryAt && (
                  <span>
                    <strong>Last delivery:</strong> {formatDate(wh.lastDeliveryAt)}
                  </span>
                )}
              </div>

              {/* Signing secret */}
              <div className="webhook-secret-display">
                <span className="webhook-secret-value">
                  {revealedSecrets.has(wh.id) ? wh.signingSecret : '••••••••••••••••••••'}
                </span>
                <button
                  type="button"
                  className="team-action-btn"
                  onClick={() => setRevealedSecrets((prev) => {
                    const next = new Set(prev)
                    if (next.has(wh.id)) next.delete(wh.id)
                    else next.add(wh.id)
                    return next
                  })}
                  style={{ flexShrink: 0 }}
                >
                  <PiEyeBold style={{ verticalAlign: 'middle' }} />
                </button>
                <button
                  type="button"
                  className="team-action-btn"
                  onClick={() => copyToClipboard(wh.signingSecret)}
                  style={{ flexShrink: 0 }}
                >
                  <PiCopyBold style={{ verticalAlign: 'middle' }} />
                </button>
                <button
                  type="button"
                  className="team-action-btn"
                  onClick={() => handleRotateSecret(wh)}
                  style={{ flexShrink: 0 }}
                  title="Rotate signing secret"
                >
                  <PiArrowsClockwiseBold style={{ verticalAlign: 'middle' }} />
                </button>
              </div>

              <div className="webhook-card-actions">
                <label className="team-toggle-wrap">
                  <span className="team-toggle">
                    <input
                      type="checkbox"
                      checked={wh.status === 'active'}
                      onChange={() => handleToggleStatus(wh)}
                    />
                    <span className="team-toggle-track" />
                  </span>
                  <span className="team-toggle-label">{wh.status === 'active' ? 'Enabled' : 'Disabled'}</span>
                </label>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--af-space-breath)' }}>
                  <button
                    type="button"
                    className="team-action-btn"
                    onClick={() => handleViewDeliveries(wh)}
                  >
                    Delivery Log
                  </button>
                  <button
                    type="button"
                    className="team-action-btn danger"
                    onClick={() => setDeleteTarget(wh)}
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
            <h3>Add Webhook Endpoint</h3>
            <p>Register an HTTP endpoint to receive real-time event notifications.</p>

            <div className="team-form-group">
              <label className="team-form-label">Endpoint URL</label>
              <input
                type="url"
                className="team-form-input"
                placeholder="https://your-service.com/webhooks/af"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
              />
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Description</label>
              <input
                type="text"
                className="team-form-input"
                placeholder="e.g., Slack notifications for published posts"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Events</label>
              {eventCategories.map((cat) => (
                <div key={cat} style={{ marginBottom: 'var(--af-space-palm)' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--af-type-xs)', color: 'var(--af-stone-600)', marginBottom: 'var(--af-space-grain)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {cat}
                  </div>
                  <div className="team-platform-grid">
                    {ALL_WEBHOOK_EVENTS
                      .filter((e) => e.category === cat)
                      .map((evt) => (
                        <label
                          key={evt.value}
                          className={`team-platform-toggle${formEvents.includes(evt.value) ? ' selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={formEvents.includes(evt.value)}
                            onChange={() => toggleEvent(evt.value)}
                          />
                          {evt.label}
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="team-form-group">
              <label className="team-checkbox-item">
                <input
                  type="checkbox"
                  checked={formRetry}
                  onChange={(e) => setFormRetry(e.target.checked)}
                />
                Enable automatic retries
              </label>
              {formRetry && (
                <div style={{ marginTop: 'var(--af-space-palm)' }}>
                  <label className="team-form-label">Max Retries</label>
                  <input
                    type="number"
                    className="team-form-input"
                    min={1}
                    max={10}
                    value={formMaxRetries}
                    onChange={(e) => setFormMaxRetries(parseInt(e.target.value, 10) || 3)}
                    style={{ width: 120 }}
                  />
                </div>
              )}
            </div>

            <div className="team-admin-dialog-actions">
              <button type="button" className="team-admin-dialog-cancel" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="team-admin-primary-btn"
                onClick={handleCreate}
                disabled={submitting || !formUrl.trim() || formEvents.length === 0}
              >
                {submitting ? 'Creating...' : 'Create Endpoint'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery log dialog */}
      {deliveryView && (
        <div className="team-admin-dialog-overlay" onClick={() => { setDeliveryView(null); setPayloadPreview(null) }}>
          <div className="team-admin-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <h3>Delivery Log</h3>
            <p>Recent deliveries for <strong>{deliveryView.webhook.url}</strong></p>

            {deliveryView.deliveries.length === 0 && (
              <div className="team-admin-empty" style={{ padding: 'var(--af-space-arm)' }}>
                <p>No deliveries yet.</p>
              </div>
            )}

            {deliveryView.deliveries.length > 0 && (
              <div className="webhook-delivery-table-wrap">
                <table className="webhook-delivery-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Status</th>
                      <th>Attempt</th>
                      <th>Duration</th>
                      <th>Delivered</th>
                      <th>Payload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryView.deliveries.map((del) => (
                      <tr key={del.id}>
                        <td>
                          <span className="webhook-event-chip">{del.event}</span>
                        </td>
                        <td>
                          <span className={`delivery-status-code ${del.success ? 'success' : 'failure'}`}>
                            {del.statusCode ?? 'ERR'}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--af-font-machine)', fontSize: 'var(--af-type-xs)' }}>
                          #{del.attemptNumber}
                        </td>
                        <td style={{ fontFamily: 'var(--af-font-machine)', fontSize: 'var(--af-type-xs)' }}>
                          {del.duration}ms
                        </td>
                        <td>
                          <span className="audit-timestamp">{formatDate(del.deliveredAt)}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="team-action-btn"
                            onClick={() => setPayloadPreview(payloadPreview?.id === del.id ? null : del)}
                          >
                            <PiEyeBold style={{ verticalAlign: 'middle' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {payloadPreview && (
              <div style={{ marginTop: 'var(--af-space-hand)' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--af-type-xs)', color: 'var(--af-stone-600)', marginBottom: 'var(--af-space-breath)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Request Body
                </div>
                <div className="webhook-payload-preview">
                  {JSON.stringify(JSON.parse(payloadPreview.requestBody), null, 2)}
                </div>
                {payloadPreview.responseBody && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: 'var(--af-type-xs)', color: 'var(--af-stone-600)', marginBottom: 'var(--af-space-breath)', marginTop: 'var(--af-space-palm)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Response Body
                    </div>
                    <div className="webhook-payload-preview">
                      {payloadPreview.responseBody}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="team-admin-dialog-actions">
              <button type="button" className="team-admin-dialog-cancel" onClick={() => { setDeliveryView(null); setPayloadPreview(null) }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="team-admin-dialog-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="team-admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Webhook</h3>
            <p>
              Are you sure you want to delete the endpoint for <strong>{deleteTarget.url}</strong>?
              No further events will be delivered.
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
                {submitting ? 'Deleting...' : 'Delete Webhook'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
