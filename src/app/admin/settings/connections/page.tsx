'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  PiArrowLeftBold,
  PiXLogoBold,
  PiButterflyBold,
  PiMastodonLogoBold,
  PiLinkedinLogoBold,
  PiRedditLogoBold,
  PiDiscordLogoBold,
  PiTelegramLogoBold,
  PiShieldCheckBold,
  PiWarningBold,
  PiEyeBold,
  PiEyeSlashBold,
} from 'react-icons/pi'
import {
  fetchPlatformConnections,
  connectPlatform,
  disconnectPlatform,
  PLATFORM_CONFIGS,
  PLATFORM_CREDENTIAL_FIELDS,
  type PlatformConnection,
  type ConnectablePlatform,
  type CredentialField,
} from '@/lib/platform-auth'
import './connections-admin.css'

const PLATFORM_ICONS: Record<ConnectablePlatform, React.ReactNode> = {
  X: <PiXLogoBold />,
  BLUESKY: <PiButterflyBold />,
  MASTODON: <PiMastodonLogoBold />,
  LINKEDIN: <PiLinkedinLogoBold />,
  REDDIT: <PiRedditLogoBold />,
  DISCORD: <PiDiscordLogoBold />,
  TELEGRAM: <PiTelegramLogoBold />,
}

const PLATFORM_ICON_STYLES: Record<ConnectablePlatform, { bg: string; color: string }> = {
  X: { bg: '#E8F4FD', color: '#1DA1F2' },
  BLUESKY: { bg: '#E8F0FE', color: '#0085FF' },
  MASTODON: { bg: '#ECEAFF', color: '#6364FF' },
  LINKEDIN: { bg: '#E8F0FE', color: '#0A66C2' },
  REDDIT: { bg: '#FFF0E6', color: '#FF4500' },
  DISCORD: { bg: '#ECEAFF', color: '#5865F2' },
  TELEGRAM: { bg: '#E8F4FD', color: '#26A5E4' },
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [connectDialog, setConnectDialog] = useState<ConnectablePlatform | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set())
  const [disconnectConfirm, setDisconnectConfirm] = useState<ConnectablePlatform | null>(null)

  const loadConnections = useCallback(async () => {
    try {
      const data = await fetchPlatformConnections('')
      setConnections(data)
    } catch {
      // Fall back to empty
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConnections()
  }, [loadConnections])

  const openConnectDialog = (platform: ConnectablePlatform) => {
    setConnectDialog(platform)
    setFormValues({})
    setFormError(null)
    setRevealedFields(new Set())
  }

  const handleConnect = async () => {
    if (!connectDialog) return

    const fields = PLATFORM_CREDENTIAL_FIELDS[connectDialog]
    const missing = fields.filter((f) => !formValues[f.key]?.trim())
    if (missing.length > 0) {
      setFormError(`Required: ${missing.map((f) => f.label).join(', ')}`)
      return
    }

    setActionLoading(connectDialog)
    setFormError(null)
    try {
      await connectPlatform('', connectDialog, formValues)
      await loadConnections()
      setConnectDialog(null)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDisconnect = async (platform: ConnectablePlatform) => {
    setActionLoading(platform)
    try {
      await disconnectPlatform('', platform)
      await loadConnections()
    } catch {
      // Handle error
    } finally {
      setActionLoading(null)
      setDisconnectConfirm(null)
    }
  }

  const toggleReveal = (fieldKey: string) => {
    setRevealedFields((prev) => {
      const next = new Set(prev)
      if (next.has(fieldKey)) {
        next.delete(fieldKey)
      } else {
        next.add(fieldKey)
      }
      return next
    })
  }

  const getConnection = (platform: ConnectablePlatform): PlatformConnection | undefined => {
    return connections.find((c) => c.platform === platform)
  }

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <>
        <div className="connections-header">
          <a href="/admin/settings" className="connections-back">
            <PiArrowLeftBold /> Settings
          </a>
          <h1>Social Connections</h1>
        </div>
        <p className="connections-subtitle">Loading connections...</p>
      </>
    )
  }

  return (
    <>
      <div className="connections-header">
        <a href="/admin/settings" className="connections-back">
          <PiArrowLeftBold /> Settings
        </a>
        <h1>Social Connections</h1>
      </div>
      <p className="connections-subtitle">
        Connect your social media accounts for direct publishing from the admin dashboard.
        Credentials are stored securely and never exposed to the browser.
      </p>

      <div className="connections-security-note">
        <PiShieldCheckBold />
        <span>
          All tokens and passwords are encrypted at rest and transmitted over TLS.
          They are stored server-side and never sent to the client after connection.
        </span>
      </div>

      <div className="connections-grid">
        {PLATFORM_CONFIGS.map((config) => {
          const conn = getConnection(config.platform)
          const status = conn?.status || 'DISCONNECTED'
          const isLoading = actionLoading === config.platform
          const iconStyle = PLATFORM_ICON_STYLES[config.platform]

          return (
            <div key={config.platform} className="connection-card">
              <div className="connection-card-top">
                <div className="connection-card-info">
                  <div
                    className="connection-card-icon"
                    style={{ background: iconStyle.bg, color: iconStyle.color }}
                  >
                    {PLATFORM_ICONS[config.platform]}
                  </div>
                  <div className="connection-card-name">
                    <h3>{config.label}</h3>
                    <p>{config.description}</p>
                  </div>
                </div>
                <span className={`connection-status ${status.toLowerCase()}`}>
                  <span className="connection-status-dot" />
                  {status === 'CONNECTED' ? 'Connected' :
                   status === 'EXPIRED' ? 'Expired' :
                   status === 'ERROR' ? 'Error' :
                   'Not connected'}
                </span>
              </div>

              {status === 'CONNECTED' && conn && (
                <div className="connection-card-details">
                  <div className="account-name">{conn.accountName}</div>
                  {conn.connectedAt && (
                    <div className="connected-date">
                      Connected {formatDate(conn.connectedAt)}
                    </div>
                  )}
                  {conn.expiresAt && (
                    <div className="connected-date">
                      {new Date(conn.expiresAt) <= new Date()
                        ? 'Token expired'
                        : `Expires ${formatDate(conn.expiresAt)}`}
                      {config.refreshable && ' (auto-refresh enabled)'}
                    </div>
                  )}
                </div>
              )}

              {status === 'EXPIRED' && conn?.error && (
                <div className="connection-card-error">
                  <PiWarningBold /> {conn.error}
                </div>
              )}

              {status === 'ERROR' && conn?.error && (
                <div className="connection-card-error">
                  <PiWarningBold /> {conn.error}
                </div>
              )}

              <div className="connection-card-actions">
                {status === 'DISCONNECTED' && (
                  <button
                    className="connection-btn connect"
                    onClick={() => openConnectDialog(config.platform)}
                    disabled={isLoading}
                  >
                    Connect
                  </button>
                )}
                {status === 'CONNECTED' && (
                  disconnectConfirm === config.platform ? (
                    <div className="disconnect-confirm">
                      <span>Remove this connection?</span>
                      <button
                        className="connection-btn disconnect-yes"
                        onClick={() => handleDisconnect(config.platform)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Removing...' : 'Yes, disconnect'}
                      </button>
                      <button
                        className="connection-btn cancel"
                        onClick={() => setDisconnectConfirm(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="connection-btn disconnect"
                      onClick={() => setDisconnectConfirm(config.platform)}
                      disabled={isLoading}
                    >
                      Disconnect
                    </button>
                  )
                )}
                {(status === 'EXPIRED' || status === 'ERROR') && (
                  <>
                    <button
                      className="connection-btn reconnect"
                      onClick={() => openConnectDialog(config.platform)}
                      disabled={isLoading}
                    >
                      Reconnect
                    </button>
                    <button
                      className="connection-btn disconnect"
                      onClick={() => handleDisconnect(config.platform)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Removing...' : 'Remove'}
                    </button>
                  </>
                )}
              </div>

              <div className="connection-env-hint">
                {config.authType === 'oauth2' ? 'OAuth 2.0' :
                 config.authType === 'api_key' ? 'App Password' :
                 'Bot Token / Webhook'}
                {config.refreshable && ' \u00b7 Auto-refresh'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Connect dialog */}
      {connectDialog && (
        <div className="connect-dialog-overlay" onClick={() => setConnectDialog(null)}>
          <div className="connect-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="connect-dialog-header">
              <div
                className="connection-card-icon"
                style={{
                  background: PLATFORM_ICON_STYLES[connectDialog].bg,
                  color: PLATFORM_ICON_STYLES[connectDialog].color,
                }}
              >
                {PLATFORM_ICONS[connectDialog]}
              </div>
              <div>
                <h2>Connect {PLATFORM_CONFIGS.find((c) => c.platform === connectDialog)?.label}</h2>
                <p>{PLATFORM_CONFIGS.find((c) => c.platform === connectDialog)?.description}</p>
              </div>
            </div>

            <div className="connect-dialog-fields">
              {PLATFORM_CREDENTIAL_FIELDS[connectDialog].map((field: CredentialField) => (
                <div key={field.key} className="connect-field">
                  <label htmlFor={`field-${field.key}`}>{field.label}</label>
                  <div className="connect-field-input-wrap">
                    <input
                      id={`field-${field.key}`}
                      type={
                        field.type === 'password' && !revealedFields.has(field.key)
                          ? 'password'
                          : 'text'
                      }
                      placeholder={field.placeholder}
                      value={formValues[field.key] || ''}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        className="connect-field-reveal"
                        onClick={() => toggleReveal(field.key)}
                        aria-label={revealedFields.has(field.key) ? 'Hide' : 'Show'}
                      >
                        {revealedFields.has(field.key) ? <PiEyeSlashBold /> : <PiEyeBold />}
                      </button>
                    )}
                  </div>
                  {field.helpText && (
                    <span className="connect-field-help">{field.helpText}</span>
                  )}
                </div>
              ))}
            </div>

            {formError && (
              <div className="connect-dialog-error">
                <PiWarningBold /> {formError}
              </div>
            )}

            <div className="connect-dialog-actions">
              <button
                className="connection-btn connect"
                onClick={handleConnect}
                disabled={actionLoading === connectDialog}
              >
                {actionLoading === connectDialog ? 'Connecting...' : 'Connect'}
              </button>
              <button
                className="connection-btn cancel"
                onClick={() => setConnectDialog(null)}
              >
                Cancel
              </button>
            </div>

            <div className="connect-dialog-security">
              <PiShieldCheckBold />
              Credentials are encrypted and stored server-side. They are not accessible
              after this dialog is closed.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
