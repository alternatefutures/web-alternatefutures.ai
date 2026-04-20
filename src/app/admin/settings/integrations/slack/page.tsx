'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  PiArrowLeftBold,
  PiSlackLogoBold,
  PiShieldCheckBold,
  PiWarningBold,
  PiEyeBold,
  PiEyeSlashBold,
  PiPlusBold,
  PiCheckCircleBold,
  PiClockBold,
  PiHashBold,
  PiLockBold,
  PiPaperPlaneTiltBold,
  PiFileBold,
  PiLinkBold,
  PiTrashBold,
} from 'react-icons/pi'
import {
  fetchSlackWorkspaces,
  fetchSlackChannels,
  fetchSlackScheduledPosts,
  fetchSlackTemplates,
  fetchSlackStats,
  connectSlackWorkspace,
  disconnectSlackWorkspace,
  updateSlackChannelMapping,
  type SlackWorkspace,
  type SlackChannel,
  type SlackScheduledPost,
  type SlackMessageTemplate,
  type SlackIntegrationStats,
} from '@/lib/scheduling-api'
import { getCookieValue } from '@/lib/cookies'
import '../../team-settings.css'
import '../../connections/connections-admin.css'

type ActiveTab = 'workspace' | 'channels' | 'scheduled' | 'templates'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const MAPPING_OPTIONS = [
  { value: '', label: 'No mapping' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'campaigns', label: 'Campaign Updates' },
  { value: 'deploys', label: 'Deploy Notifications' },
  { value: 'executive-updates', label: 'Executive Updates' },
  { value: 'alerts', label: 'Alerts & Incidents' },
  { value: 'digests', label: 'Weekly Digests' },
]

export default function SlackIntegrationPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workspace')
  const [loading, setLoading] = useState(true)
  const [workspaces, setWorkspaces] = useState<SlackWorkspace[]>([])
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [posts, setPosts] = useState<SlackScheduledPost[]>([])
  const [templates, setTemplates] = useState<SlackMessageTemplate[]>([])
  const [stats, setStats] = useState<SlackIntegrationStats | null>(null)

  // Connect dialog
  const [showConnect, setShowConnect] = useState(false)
  const [botToken, setBotToken] = useState('')
  const [tokenRevealed, setTokenRevealed] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [disconnectConfirm, setDisconnectConfirm] = useState<string | null>(null)

  // Channel mapping
  const [mappingEdit, setMappingEdit] = useState<string | null>(null)
  const [mappingValue, setMappingValue] = useState<string>('')

  // Template preview
  const [previewTemplate, setPreviewTemplate] = useState<SlackMessageTemplate | null>(null)

  const loadData = useCallback(async () => {
    const token = getCookieValue('af_access_token')
    const [ws, ch, sp, tpl, st] = await Promise.all([
      fetchSlackWorkspaces(token),
      fetchSlackChannels(token),
      fetchSlackScheduledPosts(token),
      fetchSlackTemplates(token),
      fetchSlackStats(token),
    ])
    setWorkspaces(ws)
    setChannels(ch)
    setPosts(sp)
    setTemplates(tpl)
    setStats(st)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleConnect = async () => {
    if (!botToken.trim()) {
      setFormError('Bot token is required.')
      return
    }
    if (!botToken.startsWith('xoxb-')) {
      setFormError('Bot token must start with xoxb-')
      return
    }

    setActionLoading(true)
    setFormError(null)
    try {
      await connectSlackWorkspace(getCookieValue('af_access_token'), botToken.trim())
      await loadData()
      setShowConnect(false)
      setBotToken('')
      setStatusMsg({ type: 'success', text: 'Slack workspace connected.' })
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDisconnect = async (id: string) => {
    setActionLoading(true)
    try {
      await disconnectSlackWorkspace(getCookieValue('af_access_token'), id)
      await loadData()
      setStatusMsg({ type: 'success', text: 'Workspace disconnected.' })
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to disconnect workspace.' })
    } finally {
      setActionLoading(false)
      setDisconnectConfirm(null)
    }
  }

  const handleSaveMapping = async (channelId: string) => {
    const token = getCookieValue('af_access_token')
    try {
      await updateSlackChannelMapping(token, channelId, mappingValue || null)
      await loadData()
      setMappingEdit(null)
      setStatusMsg({ type: 'success', text: 'Channel mapping updated.' })
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to update mapping.' })
    }
  }

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'workspace', label: 'Workspace', icon: <PiSlackLogoBold /> },
    { key: 'channels', label: 'Channels', icon: <PiHashBold /> },
    { key: 'scheduled', label: 'Scheduled', icon: <PiClockBold /> },
    { key: 'templates', label: 'Templates', icon: <PiFileBold /> },
  ]

  if (loading) {
    return (
      <>
        <div className="connections-header">
          <a href="/admin/settings" className="connections-back">
            <PiArrowLeftBold /> Settings
          </a>
          <h1>Slack Integration</h1>
        </div>
        <p className="connections-subtitle">Loading Slack configuration...</p>
      </>
    )
  }

  return (
    <>
      <div className="connections-header">
        <a href="/admin/settings" className="connections-back">
          <PiArrowLeftBold /> Settings
        </a>
        <h1>Slack Scheduling Integration</h1>
      </div>
      <p className="connections-subtitle">
        Connect Slack workspaces, map channels, schedule posts, and manage message templates.
      </p>

      {statusMsg && (
        <div className={`team-status-msg ${statusMsg.type}`}>
          {statusMsg.text}
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'var(--af-type-base)' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Stats bar */}
      {stats && (
        <div className="team-admin-stats">
          <div className="team-admin-stat">
            <div className="team-admin-stat-label">Workspaces</div>
            <div className="team-admin-stat-value">{stats.workspaces}</div>
          </div>
          <div className="team-admin-stat">
            <div className="team-admin-stat-label">Mapped Channels</div>
            <div className="team-admin-stat-value">{stats.mappedChannels}</div>
          </div>
          <div className="team-admin-stat">
            <div className="team-admin-stat-label">Scheduled</div>
            <div className="team-admin-stat-value">{stats.scheduledPosts}</div>
          </div>
          <div className="team-admin-stat">
            <div className="team-admin-stat-label">Sent</div>
            <div className="team-admin-stat-value">{stats.sentPosts}</div>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div style={{
        display: 'flex',
        gap: 'var(--af-space-breath)',
        marginBottom: 'var(--af-space-arm)',
        borderBottom: 'var(--af-border-visible) solid var(--af-stone-200)',
        paddingBottom: 'var(--af-space-breath)',
        flexWrap: 'wrap',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--af-space-grain)',
              fontFamily: 'var(--af-font-architect)',
              fontSize: 'var(--af-type-sm)',
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? 'var(--af-ultra)' : 'var(--af-stone-500)',
              background: activeTab === tab.key ? 'rgba(0, 10, 255, 0.06)' : 'transparent',
              border: activeTab === tab.key ? 'var(--af-border-hair) solid rgba(0, 10, 255, 0.2)' : 'var(--af-border-hair) solid transparent',
              borderRadius: 'var(--af-radius-chip)',
              padding: 'var(--af-space-breath) var(--af-space-hand)',
              cursor: 'pointer',
              transition: 'all var(--af-dur-quick) var(--af-ease-press)',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== WORKSPACE TAB ===== */}
      {activeTab === 'workspace' && (
        <>
          <div className="team-admin-header" style={{ marginBottom: 'var(--af-space-hand)' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-base)', fontWeight: 700, color: 'var(--af-stone-800)', margin: 0 }}>
                Workspace Connection
              </h2>
              <p className="team-admin-subtitle">Connect a Slack workspace using a bot token.</p>
            </div>
            {workspaces.length === 0 && (
              <button
                type="button"
                className="team-admin-primary-btn"
                onClick={() => { setShowConnect(true); setBotToken(''); setFormError(null); setTokenRevealed(false) }}
              >
                <PiPlusBold style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Connect Workspace
              </button>
            )}
          </div>

          {workspaces.length === 0 && (
            <div className="team-admin-empty">
              <div className="team-admin-empty-icon"><PiSlackLogoBold /></div>
              <h2>No Slack workspace connected</h2>
              <p>Connect a workspace to enable scheduled Slack posts and channel mapping.</p>
            </div>
          )}

          <div className="connections-grid">
            {workspaces.map((ws) => (
              <div key={ws.id} className="connection-card">
                <div className="connection-card-top">
                  <div className="connection-card-info">
                    <div className="connection-card-icon" style={{ background: '#ECEAFF', color: '#4A154B' }}>
                      <PiSlackLogoBold />
                    </div>
                    <div className="connection-card-name">
                      <h3>{ws.teamName}</h3>
                      <p>Team ID: {ws.teamId}</p>
                    </div>
                  </div>
                  <span className={`connection-status ${ws.status.toLowerCase()}`}>
                    <span className="connection-status-dot" />
                    {ws.status === 'CONNECTED' ? 'Connected' : ws.status === 'EXPIRED' ? 'Token Expired' : ws.status === 'ERROR' ? 'Error' : 'Disconnected'}
                  </span>
                </div>

                <div className="connection-card-details">
                  <div className="account-name">Installed by: {ws.installedBy}</div>
                  <div className="connected-date">Bot: {ws.botUserId}</div>
                  {ws.connectedAt && (
                    <div className="connected-date">Connected {formatDate(ws.connectedAt)}</div>
                  )}
                  <div className="connected-date" style={{ marginTop: 4 }}>
                    Scopes: {ws.scopes.join(', ')}
                  </div>
                </div>

                <div className="connection-card-actions">
                  {disconnectConfirm === ws.id ? (
                    <div className="disconnect-confirm">
                      <span>Remove this workspace?</span>
                      <button
                        className="connection-btn disconnect-yes"
                        onClick={() => handleDisconnect(ws.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Removing...' : 'Yes, disconnect'}
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
                      onClick={() => setDisconnectConfirm(ws.id)}
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                <div className="connection-env-hint">
                  Bot Token &middot; Slack Web API
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== CHANNELS TAB ===== */}
      {activeTab === 'channels' && (
        <>
          <h2 style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-base)', fontWeight: 700, color: 'var(--af-stone-800)', margin: '0 0 var(--af-space-breath)' }}>
            Channel Mapping
          </h2>
          <p className="connections-subtitle" style={{ marginBottom: 'var(--af-space-hand)' }}>
            Map Slack channels to notification categories. Scheduled posts and alerts will be routed to the mapped channel.
          </p>

          {channels.length === 0 ? (
            <div className="team-admin-empty">
              <div className="team-admin-empty-icon"><PiHashBold /></div>
              <h2>No channels available</h2>
              <p>Connect a workspace first, then channels will appear here.</p>
            </div>
          ) : (
            <div className="connections-grid">
              {channels.map((ch) => (
                <div key={ch.id} className="connection-card">
                  <div className="connection-card-top">
                    <div className="connection-card-info">
                      <div className="connection-card-icon" style={{
                        background: ch.isMapped ? 'rgba(45, 134, 89, 0.08)' : 'var(--af-stone-100)',
                        color: ch.isMapped ? 'var(--af-signal-go)' : 'var(--af-stone-500)',
                      }}>
                        {ch.isPrivate ? <PiLockBold /> : <PiHashBold />}
                      </div>
                      <div className="connection-card-name">
                        <h3>{ch.channelName}</h3>
                        <p>{ch.memberCount} members{ch.isPrivate ? ' (private)' : ''}</p>
                      </div>
                    </div>
                    <span className={`connection-status ${ch.isMapped ? 'connected' : 'disconnected'}`}>
                      <span className="connection-status-dot" />
                      {ch.isMapped ? 'Mapped' : 'Unmapped'}
                    </span>
                  </div>

                  {ch.isMapped && ch.mappedTo && (
                    <div className="connection-card-details">
                      <div className="account-name" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <PiLinkBold /> {ch.mappedTo}
                      </div>
                    </div>
                  )}

                  <div className="connection-card-actions">
                    {mappingEdit === ch.id ? (
                      <div style={{ display: 'flex', gap: 'var(--af-space-breath)', width: '100%', alignItems: 'center' }}>
                        <select
                          value={mappingValue}
                          onChange={(e) => setMappingValue(e.target.value)}
                          style={{
                            flex: 1,
                            padding: 'var(--af-space-breath) var(--af-space-palm)',
                            fontFamily: 'var(--af-font-architect)',
                            fontSize: 'var(--af-type-sm)',
                            border: 'var(--af-border-visible) solid var(--af-stone-300)',
                            borderRadius: 'var(--af-radius-chip)',
                            background: 'var(--af-stone-50)',
                            color: 'var(--af-stone-800)',
                            outline: 'none',
                          }}
                        >
                          {MAPPING_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <button
                          className="connection-btn connect"
                          style={{ flex: 0 }}
                          onClick={() => handleSaveMapping(ch.id)}
                        >
                          Save
                        </button>
                        <button
                          className="connection-btn cancel"
                          style={{ flex: 0 }}
                          onClick={() => setMappingEdit(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className={ch.isMapped ? 'connection-btn disconnect' : 'connection-btn connect'}
                        onClick={() => { setMappingEdit(ch.id); setMappingValue(ch.mappedTo || '') }}
                      >
                        {ch.isMapped ? 'Edit Mapping' : 'Set Mapping'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== SCHEDULED POSTS TAB ===== */}
      {activeTab === 'scheduled' && (
        <>
          <div className="team-admin-header" style={{ marginBottom: 'var(--af-space-hand)' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-base)', fontWeight: 700, color: 'var(--af-stone-800)', margin: 0 }}>
                Scheduled Slack Posts
              </h2>
              <p className="team-admin-subtitle">View and manage posts scheduled for Slack channels.</p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="team-admin-empty">
              <div className="team-admin-empty-icon"><PiPaperPlaneTiltBold /></div>
              <h2>No scheduled posts</h2>
              <p>Scheduled Slack posts will appear here once created.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--af-space-hand)' }}>
              {posts.map((post) => (
                <div key={post.id} className="connection-card">
                  <div className="connection-card-top">
                    <div className="connection-card-info">
                      <div
                        className="connection-card-icon"
                        style={{
                          background: post.status === 'SENT' ? 'rgba(45, 134, 89, 0.1)' :
                            post.status === 'SCHEDULED' ? 'rgba(0, 10, 255, 0.08)' :
                            post.status === 'FAILED' ? 'rgba(194, 59, 34, 0.08)' :
                            'var(--af-stone-100)',
                          color: post.status === 'SENT' ? 'var(--af-signal-go)' :
                            post.status === 'SCHEDULED' ? 'var(--af-ultra)' :
                            post.status === 'FAILED' ? 'var(--af-signal-stop)' :
                            'var(--af-stone-500)',
                        }}
                      >
                        {post.status === 'SENT' ? <PiCheckCircleBold /> :
                         post.status === 'SCHEDULED' ? <PiClockBold /> :
                         post.status === 'FAILED' ? <PiWarningBold /> :
                         <PiPaperPlaneTiltBold />}
                      </div>
                      <div className="connection-card-name">
                        <h3>{post.channelName}</h3>
                        <p style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {post.message}
                        </p>
                      </div>
                    </div>
                    <span className={`connection-status ${
                      post.status === 'SENT' ? 'connected' :
                      post.status === 'SCHEDULED' ? 'expired' :
                      post.status === 'FAILED' ? 'error' :
                      'disconnected'
                    }`}>
                      <span className="connection-status-dot" />
                      {post.status}
                    </span>
                  </div>

                  <div className="connection-card-details" style={{ display: 'flex', gap: 'var(--af-space-arm)', flexWrap: 'wrap' }}>
                    <div>
                      <div className="connected-date">Scheduled: {formatDate(post.scheduledAt)}</div>
                      {post.sentAt && <div className="connected-date">Sent: {formatDate(post.sentAt)}</div>}
                    </div>
                    <div>
                      <div className="connected-date">Created by: {post.createdBy}</div>
                      {post.templateId && (
                        <div className="connected-date" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <PiFileBold /> Uses template
                        </div>
                      )}
                    </div>
                  </div>

                  {post.status === 'FAILED' && (
                    <div className="connection-card-error" style={{ marginTop: 'var(--af-space-breath)' }}>
                      <PiWarningBold /> {post.message}
                    </div>
                  )}

                  <div className="connection-env-hint">
                    Created {formatDate(post.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== TEMPLATES TAB ===== */}
      {activeTab === 'templates' && (
        <>
          <h2 style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-base)', fontWeight: 700, color: 'var(--af-stone-800)', margin: '0 0 var(--af-space-hand)' }}>
            Message Templates
          </h2>

          {templates.length === 0 ? (
            <div className="team-admin-empty">
              <div className="team-admin-empty-icon"><PiFileBold /></div>
              <h2>No templates</h2>
              <p>Create message templates with variables to streamline scheduled posts.</p>
            </div>
          ) : (
            <div className="connections-grid">
              {templates.map((tpl) => (
                <div key={tpl.id} className="connection-card">
                  <div className="connection-card-top">
                    <div className="connection-card-info">
                      <div className="connection-card-icon" style={{
                        background: tpl.category === 'ANNOUNCEMENT' ? 'rgba(0, 10, 255, 0.08)' :
                          tpl.category === 'UPDATE' ? 'rgba(45, 134, 89, 0.08)' :
                          tpl.category === 'ALERT' ? 'rgba(194, 59, 34, 0.08)' :
                          tpl.category === 'DIGEST' ? 'rgba(196, 134, 10, 0.08)' :
                          'var(--af-stone-100)',
                        color: tpl.category === 'ANNOUNCEMENT' ? 'var(--af-ultra)' :
                          tpl.category === 'UPDATE' ? 'var(--af-signal-go)' :
                          tpl.category === 'ALERT' ? 'var(--af-signal-stop)' :
                          tpl.category === 'DIGEST' ? 'var(--af-signal-wait)' :
                          'var(--af-stone-500)',
                      }}>
                        <PiFileBold />
                      </div>
                      <div className="connection-card-name">
                        <h3>{tpl.name}</h3>
                        <p>{tpl.category}</p>
                      </div>
                    </div>
                    <span style={{
                      fontFamily: 'var(--af-font-machine)',
                      fontSize: '10px',
                      color: 'var(--af-stone-400)',
                    }}>
                      {tpl.usageCount} uses
                    </span>
                  </div>

                  <div style={{
                    fontFamily: 'var(--af-font-machine)',
                    fontSize: 'var(--af-type-xs)',
                    color: 'var(--af-stone-600)',
                    background: 'var(--af-stone-50)',
                    padding: 'var(--af-space-palm)',
                    borderRadius: 'var(--af-radius-chip)',
                    border: 'var(--af-border-hair) solid var(--af-stone-200)',
                    marginBottom: 'var(--af-space-palm)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.5,
                  }}>
                    {tpl.body}
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--af-space-grain)', flexWrap: 'wrap' }}>
                    {tpl.variables.map((v) => (
                      <span key={v} style={{
                        fontFamily: 'var(--af-font-machine)',
                        fontSize: '10px',
                        color: 'var(--af-ultra)',
                        background: 'rgba(0, 10, 255, 0.06)',
                        padding: '2px 8px',
                        borderRadius: 'var(--af-radius-chip)',
                        border: 'var(--af-border-hair) solid rgba(0, 10, 255, 0.15)',
                      }}>
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>

                  <div className="connection-env-hint">
                    Last used {formatDate(tpl.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== CONNECT DIALOG ===== */}
      {showConnect && (
        <div className="connect-dialog-overlay" onClick={() => setShowConnect(false)}>
          <div className="connect-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="connect-dialog-header">
              <div className="connection-card-icon" style={{ background: '#ECEAFF', color: '#4A154B' }}>
                <PiSlackLogoBold />
              </div>
              <div>
                <h2>Connect Slack Workspace</h2>
                <p>Enter your Slack bot token to enable scheduled messaging.</p>
              </div>
            </div>

            <div className="connect-dialog-fields">
              <div className="connect-field">
                <label>Bot Token</label>
                <div className="connect-field-input-wrap">
                  <input
                    type={tokenRevealed ? 'text' : 'password'}
                    placeholder="xoxb-1234567890-abcdefghij..."
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    className="connect-field-reveal"
                    onClick={() => setTokenRevealed(!tokenRevealed)}
                  >
                    {tokenRevealed ? <PiEyeSlashBold /> : <PiEyeBold />}
                  </button>
                </div>
                <span className="connect-field-help">
                  Create a Slack app at api.slack.com/apps, add bot scopes (chat:write, channels:read),
                  install to workspace, and copy the Bot User OAuth Token.
                </span>
              </div>

              <div className="connections-security-note">
                <PiShieldCheckBold />
                <span>
                  Required scopes: <strong>chat:write</strong>, <strong>channels:read</strong>,
                  <strong> channels:join</strong>, <strong>users:read</strong>.
                  Optional: <strong>chat:write.customize</strong> for custom bot names.
                </span>
              </div>
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
                disabled={actionLoading}
              >
                {actionLoading ? 'Connecting...' : 'Connect'}
              </button>
              <button
                className="connection-btn cancel"
                onClick={() => setShowConnect(false)}
              >
                Cancel
              </button>
            </div>

            <div className="connect-dialog-security">
              <PiShieldCheckBold />
              Bot tokens are encrypted and stored server-side. They are not accessible
              after this dialog is closed.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
