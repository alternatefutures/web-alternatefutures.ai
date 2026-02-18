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
  PiThreadsLogoBold,
  PiInstagramLogoBold,
  PiFacebookLogoBold,
  PiTiktokLogoBold,
  PiYoutubeLogoBold,
  PiMediumLogoBold,
  PiNewspaperBold,
  PiGhostBold,
  PiCastleTurretBold,
  PiShieldCheckBold,
  PiWarningBold,
  PiEyeBold,
  PiEyeSlashBold,
  PiPlugsConnectedBold,
  PiLinkBold,
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
  THREADS: <PiThreadsLogoBold />,
  INSTAGRAM: <PiInstagramLogoBold />,
  FACEBOOK: <PiFacebookLogoBold />,
  TIKTOK: <PiTiktokLogoBold />,
  YOUTUBE: <PiYoutubeLogoBold />,
  MEDIUM: <PiMediumLogoBold />,
  SUBSTACK: <PiNewspaperBold />,
  GHOST: <PiGhostBold />,
  FARCASTER: <PiCastleTurretBold />,
}

const PLATFORM_ICON_STYLES: Record<ConnectablePlatform, { bg: string; color: string }> = {
  X: { bg: '#E8F4FD', color: '#1DA1F2' },
  BLUESKY: { bg: '#E8F0FE', color: '#0085FF' },
  MASTODON: { bg: '#ECEAFF', color: '#6364FF' },
  LINKEDIN: { bg: '#E8F0FE', color: '#0A66C2' },
  REDDIT: { bg: '#FFF0E6', color: '#FF4500' },
  DISCORD: { bg: '#ECEAFF', color: '#5865F2' },
  TELEGRAM: { bg: '#E8F4FD', color: '#26A5E4' },
  THREADS: { bg: '#F3F3F3', color: '#000000' },
  INSTAGRAM: { bg: '#FFF0F6', color: '#E1306C' },
  FACEBOOK: { bg: '#E8F0FE', color: '#1877F2' },
  TIKTOK: { bg: '#F3F3F3', color: '#010101' },
  YOUTUBE: { bg: '#FFECE8', color: '#FF0000' },
  MEDIUM: { bg: '#F3F3F3', color: '#000000' },
  SUBSTACK: { bg: '#FFF5E6', color: '#FF6719' },
  GHOST: { bg: '#F0F3F5', color: '#15171A' },
  FARCASTER: { bg: '#ECEAFF', color: '#855DCD' },
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
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
      setStatusMsg({ type: 'success', text: `${PLATFORM_CONFIGS.find((c) => c.platform === connectDialog)?.label} connected.` })
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
      setStatusMsg({ type: 'success', text: `${PLATFORM_CONFIGS.find((c) => c.platform === platform)?.label} disconnected.` })
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to disconnect.' })
    } finally {
      setActionLoading(null)
      setDisconnectConfirm(null)
    }
  }

  const handleConnectAll = () => {
    const disconnected = PLATFORM_CONFIGS.filter((config) => {
      const conn = getConnection(config.platform)
      return !conn || conn.status === 'DISCONNECTED'
    })
    if (disconnected.length > 0) {
      openConnectDialog(disconnected[0].platform)
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

  const connectedCount = connections.filter((c) => c.status === 'CONNECTED').length
  const disconnectedCount = PLATFORM_CONFIGS.length - connectedCount

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
        {disconnectedCount > 0 && (
          <button
            type="button"
            className="connections-connect-all-btn"
            onClick={handleConnectAll}
          >
            <PiPlugsConnectedBold style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Connect All
          </button>
        )}
      </div>
      <p className="connections-subtitle">
        Connect your social media accounts for direct publishing from the admin dashboard.
        Credentials are stored securely and never exposed to the browser.
      </p>

      {statusMsg && (
        <div className={`connections-status-msg ${statusMsg.type}`}>
          {statusMsg.text}
          <button
            type="button"
            className="connections-status-dismiss"
            onClick={() => setStatusMsg(null)}
          >
            &times;
          </button>
        </div>
      )}

      <div className="connections-stats">
        <div className="connections-stat">
          <div className="connections-stat-value">{PLATFORM_CONFIGS.length}</div>
          <div className="connections-stat-label">Platforms</div>
        </div>
        <div className="connections-stat">
          <div className="connections-stat-value connections-stat-connected">{connectedCount}</div>
          <div className="connections-stat-label">Connected</div>
        </div>
        <div className="connections-stat">
          <div className="connections-stat-value">{disconnectedCount}</div>
          <div className="connections-stat-label">Disconnected</div>
        </div>
        <div className="connections-stat">
          <div className="connections-stat-value connections-stat-error">
            {connections.filter((c) => c.status === 'EXPIRED' || c.status === 'ERROR').length}
          </div>
          <div className="connections-stat-label">Needs Attention</div>
        </div>
      </div>

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
            <div key={config.platform} className={`connection-card ${status.toLowerCase()}`}>
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
                  <div className="account-name">
                    <PiLinkBold style={{ marginRight: 4, verticalAlign: 'middle', fontSize: 13 }} />
                    {conn.accountName}
                  </div>
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
                 config.authType === 'api_key' ? 'App Password / API Key' :
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
