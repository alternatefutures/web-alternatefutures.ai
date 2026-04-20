'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PiKeyBold,
  PiPlusBold,
  PiShieldCheckBold,
  PiCheckCircleBold,
} from 'react-icons/pi'
import {
  fetchSSOProviders,
  createSSOProvider,
  updateSSOProvider,
  deleteSSOProvider,
  verifyDomain,
  type SSOProvider,
  type SSOProtocol,
  type SSOStatus,
  type CreateSSOProviderInput,
} from '@/lib/settings-api'
import { getCookieValue } from '@/lib/cookies'
import '../team-settings.css'
import '../settings-enterprise.css'

const STATUS_LABELS: Record<SSOStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending_verification: 'Pending Verification',
}

export default function SSOPage() {
  const [providers, setProviders] = useState<SSOProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SSOProvider | null>(null)

  // Create form
  const [formName, setFormName] = useState('')
  const [formProtocol, setFormProtocol] = useState<SSOProtocol>('oidc')
  const [formDomain, setFormDomain] = useState('')
  const [formEntityId, setFormEntityId] = useState('')
  const [formMetadataUrl, setFormMetadataUrl] = useState('')
  const [formClientId, setFormClientId] = useState('')
  const [formClientSecret, setFormClientSecret] = useState('')
  const [formIssuerUrl, setFormIssuerUrl] = useState('')
  const [formJIT, setFormJIT] = useState(false)
  const [formDefaultRole, setFormDefaultRole] = useState('editor')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchSSOProviders(token)
      setProviders(data)
      setLoading(false)
    }
    load()
  }, [])

  const resetForm = useCallback(() => {
    setFormName('')
    setFormProtocol('oidc')
    setFormDomain('')
    setFormEntityId('')
    setFormMetadataUrl('')
    setFormClientId('')
    setFormClientSecret('')
    setFormIssuerUrl('')
    setFormJIT(false)
    setFormDefaultRole('editor')
  }, [])

  const handleCreate = useCallback(async () => {
    setSubmitting(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const input: CreateSSOProviderInput = {
        name: formName.trim(),
        protocol: formProtocol,
        domain: formDomain.trim(),
        jitProvisioning: formJIT,
        defaultRole: formDefaultRole,
      }
      if (formProtocol === 'saml') {
        input.entityId = formEntityId.trim() || undefined
        input.metadataUrl = formMetadataUrl.trim() || undefined
      } else {
        input.clientId = formClientId.trim() || undefined
        input.clientSecret = formClientSecret.trim() || undefined
        input.issuerUrl = formIssuerUrl.trim() || undefined
      }
      const created = await createSSOProvider(token, input)
      setProviders((prev) => [created, ...prev])
      setStatusMsg({ type: 'success', text: `Provider "${created.name}" added. Verify your domain to activate.` })
      setShowCreate(false)
      resetForm()
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to add SSO provider.' })
    } finally {
      setSubmitting(false)
    }
  }, [formName, formProtocol, formDomain, formEntityId, formMetadataUrl, formClientId, formClientSecret, formIssuerUrl, formJIT, formDefaultRole, resetForm])

  const handleVerifyDomain = useCallback(async (provider: SSOProvider) => {
    const token = getCookieValue('af_access_token')
    try {
      const updated = await verifyDomain(token, provider.id)
      setProviders((prev) => prev.map((p) => (p.id === provider.id ? updated : p)))
      setStatusMsg({ type: 'success', text: `Domain "${provider.domain}" verified. SSO is now active.` })
    } catch {
      setStatusMsg({ type: 'error', text: 'Domain verification failed.' })
    }
  }, [])

  const handleToggleStatus = useCallback(async (provider: SSOProvider) => {
    const token = getCookieValue('af_access_token')
    const newStatus: SSOStatus = provider.status === 'active' ? 'inactive' : 'active'
    try {
      const updated = await updateSSOProvider(token, provider.id, { status: newStatus })
      setProviders((prev) => prev.map((p) => (p.id === provider.id ? updated : p)))
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to update provider status.' })
    }
  }, [])

  const handleToggleJIT = useCallback(async (provider: SSOProvider) => {
    const token = getCookieValue('af_access_token')
    try {
      const updated = await updateSSOProvider(token, provider.id, { jitProvisioning: !provider.jitProvisioning })
      setProviders((prev) => prev.map((p) => (p.id === provider.id ? updated : p)))
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to update JIT provisioning.' })
    }
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteSSOProvider(token, deleteTarget.id)
      setProviders((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setStatusMsg({ type: 'success', text: `Provider "${deleteTarget.name}" removed.` })
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to remove provider.' })
    } finally {
      setSubmitting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  return (
    <>
      <div className="team-admin-header">
        <div>
          <h1>Single Sign-On</h1>
          <p className="team-admin-subtitle">
            Configure SAML or OIDC identity providers for enterprise authentication.
          </p>
        </div>
        <button
          type="button"
          className="team-admin-primary-btn"
          onClick={() => { setShowCreate(true); resetForm() }}
        >
          <PiPlusBold style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Add Provider
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
          <div className="team-admin-stat-label">Providers</div>
          <div className="team-admin-stat-value">{providers.length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Active</div>
          <div className="team-admin-stat-value">{providers.filter((p) => p.status === 'active').length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Domains Verified</div>
          <div className="team-admin-stat-value">{providers.filter((p) => p.domainVerified).length}</div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="team-admin-skeleton">
          {[1, 2].map((i) => (
            <div key={i} className="team-skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="team-skeleton-block w-32" />
              <div className="team-skeleton-block w-24" />
              <div className="team-skeleton-block w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && providers.length === 0 && (
        <div className="team-admin-empty">
          <div className="team-admin-empty-icon"><PiKeyBold /></div>
          <h2>No SSO providers</h2>
          <p>Add a SAML or OIDC provider to enable enterprise single sign-on.</p>
        </div>
      )}

      {/* Provider cards */}
      {!loading && providers.length > 0 && (
        <div className="sso-provider-list">
          {providers.map((provider) => (
            <div key={provider.id} className="sso-provider-card">
              <div className="sso-provider-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--af-space-palm)' }}>
                  <span className="sso-provider-name">{provider.name}</span>
                  <span className={`sso-protocol-chip ${provider.protocol}`}>
                    {provider.protocol.toUpperCase()}
                  </span>
                </div>
                <span className={`sso-status-badge ${provider.status}`}>
                  <span className="sso-status-dot" />
                  {STATUS_LABELS[provider.status]}
                </span>
              </div>

              <div className="sso-provider-details">
                <div className="sso-detail-item">
                  <div className="sso-detail-label">Domain</div>
                  <div className="sso-detail-value mono">{provider.domain}</div>
                </div>
                <div className="sso-detail-item">
                  <div className="sso-detail-label">Domain Verified</div>
                  <div className="sso-detail-value">
                    {provider.domainVerified ? (
                      <span style={{ color: 'var(--af-signal-go)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <PiCheckCircleBold /> Verified
                      </span>
                    ) : (
                      <span style={{ color: 'var(--af-signal-wait)' }}>Not verified</span>
                    )}
                  </div>
                </div>
                {provider.protocol === 'saml' && (
                  <>
                    <div className="sso-detail-item">
                      <div className="sso-detail-label">Entity ID</div>
                      <div className="sso-detail-value mono">{provider.entityId || '—'}</div>
                    </div>
                    <div className="sso-detail-item">
                      <div className="sso-detail-label">Metadata URL</div>
                      <div className="sso-detail-value mono">{provider.metadataUrl || '—'}</div>
                    </div>
                  </>
                )}
                {provider.protocol === 'oidc' && (
                  <>
                    <div className="sso-detail-item">
                      <div className="sso-detail-label">Client ID</div>
                      <div className="sso-detail-value mono">{provider.clientId || '—'}</div>
                    </div>
                    <div className="sso-detail-item">
                      <div className="sso-detail-label">Issuer URL</div>
                      <div className="sso-detail-value mono">{provider.issuerUrl || '—'}</div>
                    </div>
                  </>
                )}
                <div className="sso-detail-item">
                  <div className="sso-detail-label">JIT Provisioning</div>
                  <div className="sso-detail-value">{provider.jitProvisioning ? 'Enabled' : 'Disabled'}</div>
                </div>
                <div className="sso-detail-item">
                  <div className="sso-detail-label">Default Role</div>
                  <div className="sso-detail-value" style={{ textTransform: 'capitalize' }}>{provider.defaultRole}</div>
                </div>
              </div>

              <div className="sso-provider-actions">
                <label className="team-toggle-wrap">
                  <span className="team-toggle">
                    <input
                      type="checkbox"
                      checked={provider.status === 'active'}
                      onChange={() => handleToggleStatus(provider)}
                      disabled={!provider.domainVerified}
                    />
                    <span className="team-toggle-track" />
                  </span>
                  <span className="team-toggle-label">{provider.status === 'active' ? 'Active' : 'Inactive'}</span>
                </label>

                <label className="team-toggle-wrap" style={{ marginLeft: 'var(--af-space-hand)' }}>
                  <span className="team-toggle">
                    <input
                      type="checkbox"
                      checked={provider.jitProvisioning}
                      onChange={() => handleToggleJIT(provider)}
                    />
                    <span className="team-toggle-track" />
                  </span>
                  <span className="team-toggle-label">JIT Provisioning</span>
                </label>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--af-space-breath)' }}>
                  {!provider.domainVerified && (
                    <button
                      type="button"
                      className="team-action-btn"
                      onClick={() => handleVerifyDomain(provider)}
                      style={{ color: 'var(--af-signal-go)', borderColor: 'var(--af-signal-go)' }}
                    >
                      <PiShieldCheckBold style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      Verify Domain
                    </button>
                  )}
                  <button
                    type="button"
                    className="team-action-btn danger"
                    onClick={() => setDeleteTarget(provider)}
                  >
                    Remove
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
            <h3>Add Identity Provider</h3>
            <p>Connect a SAML or OIDC identity provider for single sign-on.</p>

            <div className="team-form-group">
              <label className="team-form-label">Provider Name</label>
              <input
                type="text"
                className="team-form-input"
                placeholder="e.g., Google Workspace, Okta, Azure AD"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Protocol</label>
              <select
                className="team-form-select"
                value={formProtocol}
                onChange={(e) => setFormProtocol(e.target.value as SSOProtocol)}
              >
                <option value="oidc">OpenID Connect (OIDC)</option>
                <option value="saml">SAML 2.0</option>
              </select>
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Domain</label>
              <input
                type="text"
                className="team-form-input"
                placeholder="e.g., company.com"
                value={formDomain}
                onChange={(e) => setFormDomain(e.target.value)}
              />
              <p className="team-form-hint">Users with this email domain will be prompted to use SSO.</p>
            </div>

            {formProtocol === 'saml' && (
              <>
                <div className="team-form-group">
                  <label className="team-form-label">Entity ID / Issuer</label>
                  <input
                    type="text"
                    className="team-form-input"
                    placeholder="https://idp.company.com/saml/metadata"
                    value={formEntityId}
                    onChange={(e) => setFormEntityId(e.target.value)}
                  />
                </div>
                <div className="team-form-group">
                  <label className="team-form-label">Metadata URL</label>
                  <input
                    type="text"
                    className="team-form-input"
                    placeholder="https://idp.company.com/app/metadata"
                    value={formMetadataUrl}
                    onChange={(e) => setFormMetadataUrl(e.target.value)}
                  />
                </div>
              </>
            )}

            {formProtocol === 'oidc' && (
              <>
                <div className="team-form-group">
                  <label className="team-form-label">Client ID</label>
                  <input
                    type="text"
                    className="team-form-input"
                    placeholder="Client ID from your identity provider"
                    value={formClientId}
                    onChange={(e) => setFormClientId(e.target.value)}
                  />
                </div>
                <div className="team-form-group">
                  <label className="team-form-label">Client Secret</label>
                  <input
                    type="password"
                    className="team-form-input"
                    placeholder="Client secret from your identity provider"
                    value={formClientSecret}
                    onChange={(e) => setFormClientSecret(e.target.value)}
                  />
                </div>
                <div className="team-form-group">
                  <label className="team-form-label">Issuer URL</label>
                  <input
                    type="text"
                    className="team-form-input"
                    placeholder="https://accounts.google.com"
                    value={formIssuerUrl}
                    onChange={(e) => setFormIssuerUrl(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="team-form-group">
              <label className="team-form-label">Default Role for New Users</label>
              <select
                className="team-form-select"
                value={formDefaultRole}
                onChange={(e) => setFormDefaultRole(e.target.value)}
              >
                <option value="editor">Editor</option>
                <option value="reviewer">Reviewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="team-form-group">
              <label className="team-checkbox-item">
                <input
                  type="checkbox"
                  checked={formJIT}
                  onChange={(e) => setFormJIT(e.target.checked)}
                />
                Enable Just-In-Time provisioning
              </label>
              <p className="team-form-hint">Automatically create accounts for users who sign in via SSO for the first time.</p>
            </div>

            <div className="team-admin-dialog-actions">
              <button type="button" className="team-admin-dialog-cancel" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="team-admin-primary-btn"
                onClick={handleCreate}
                disabled={submitting || !formName.trim() || !formDomain.trim()}
              >
                {submitting ? 'Adding...' : 'Add Provider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="team-admin-dialog-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="team-admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Remove SSO Provider</h3>
            <p>
              Are you sure you want to remove <strong>{deleteTarget.name}</strong>?
              Users who authenticate via this provider will need to use an alternative sign-in method.
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
                {submitting ? 'Removing...' : 'Remove Provider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
