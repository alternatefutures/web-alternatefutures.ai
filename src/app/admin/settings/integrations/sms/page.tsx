'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  PiArrowLeftBold,
  PiChatTextBold,
  PiPhoneBold,
  PiShieldCheckBold,
  PiWarningBold,
  PiEyeBold,
  PiEyeSlashBold,
  PiPlusBold,
  PiProhibitBold,
  PiCheckCircleBold,
  PiClockBold,
  PiPaperPlaneTiltBold,
  PiChartBarBold,
  PiTrashBold,
  PiPencilBold,
} from 'react-icons/pi'
import {
  fetchSMSProviders,
  fetchSMSPhoneNumbers,
  fetchSMSOptRecords,
  fetchSMSCampaigns,
  fetchSMSDeliveryReports,
  fetchSMSStats,
  connectSMSProvider,
  disconnectSMSProvider,
  type SMSProviderConfig,
  type SMSPhoneNumber,
  type SMSOptRecord,
  type SMSCampaign,
  type SMSDeliveryReport,
  type SMSIntegrationStats,
  type SMSProvider,
} from '@/lib/scheduling-api'
import { getCookieValue } from '@/lib/cookies'
import '../../team-settings.css'
import '../../connections/connections-admin.css'

type ActiveTab = 'provider' | 'numbers' | 'compliance' | 'campaigns' | 'reports'

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

export default function SMSIntegrationPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('provider')
  const [loading, setLoading] = useState(true)
  const [providers, setProviders] = useState<SMSProviderConfig[]>([])
  const [phoneNumbers, setPhoneNumbers] = useState<SMSPhoneNumber[]>([])
  const [optRecords, setOptRecords] = useState<SMSOptRecord[]>([])
  const [campaigns, setCampaigns] = useState<SMSCampaign[]>([])
  const [stats, setStats] = useState<SMSIntegrationStats | null>(null)
  const [deliveryReports, setDeliveryReports] = useState<SMSDeliveryReport[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<SMSCampaign | null>(null)

  // Connect dialog state
  const [showConnect, setShowConnect] = useState(false)
  const [connectProvider, setConnectProvider] = useState<SMSProvider>('TWILIO')
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set())
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [disconnectConfirm, setDisconnectConfirm] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const token = getCookieValue('af_access_token')
    const [p, n, o, c, s] = await Promise.all([
      fetchSMSProviders(token),
      fetchSMSPhoneNumbers(token),
      fetchSMSOptRecords(token),
      fetchSMSCampaigns(token),
      fetchSMSStats(token),
    ])
    setProviders(p)
    setPhoneNumbers(n)
    setOptRecords(o)
    setCampaigns(c)
    setStats(s)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleConnect = async () => {
    const requiredFields = connectProvider === 'TWILIO'
      ? ['accountSid', 'authToken', 'defaultFromNumber']
      : ['apiKey', 'defaultFromNumber']

    const missing = requiredFields.filter((f) => !formValues[f]?.trim())
    if (missing.length > 0) {
      setFormError(`Required: ${missing.join(', ')}`)
      return
    }

    setActionLoading(true)
    setFormError(null)
    try {
      await connectSMSProvider(getCookieValue('af_access_token'), {
        provider: connectProvider,
        accountSid: formValues.accountSid || '',
        authToken: formValues.authToken || formValues.apiKey || '',
        messagingServiceSid: formValues.messagingServiceSid || null,
        defaultFromNumber: formValues.defaultFromNumber || '',
      })
      await loadData()
      setShowConnect(false)
      setFormValues({})
      setStatusMsg({ type: 'success', text: `${connectProvider} connected successfully.` })
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDisconnect = async (id: string) => {
    setActionLoading(true)
    try {
      await disconnectSMSProvider(getCookieValue('af_access_token'), id)
      await loadData()
      setStatusMsg({ type: 'success', text: 'Provider disconnected.' })
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to disconnect provider.' })
    } finally {
      setActionLoading(false)
      setDisconnectConfirm(null)
    }
  }

  const handleViewReports = async (campaign: SMSCampaign) => {
    const token = getCookieValue('af_access_token')
    const reports = await fetchSMSDeliveryReports(token, campaign.id)
    setDeliveryReports(reports)
    setSelectedCampaign(campaign)
  }

  const toggleReveal = (key: string) => {
    setRevealedFields((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'provider', label: 'Provider', icon: <PiChatTextBold /> },
    { key: 'numbers', label: 'Numbers', icon: <PiPhoneBold /> },
    { key: 'compliance', label: 'Compliance', icon: <PiShieldCheckBold /> },
    { key: 'campaigns', label: 'Campaigns', icon: <PiPaperPlaneTiltBold /> },
    { key: 'reports', label: 'Reports', icon: <PiChartBarBold /> },
  ]

  if (loading) {
    return (
      <>
        <div className="connections-header">
          <a href="/admin/settings" className="connections-back">
            <PiArrowLeftBold /> Settings
          </a>
          <h1>SMS Integration</h1>
        </div>
        <p className="connections-subtitle">Loading SMS configuration...</p>
      </>
    )
  }

  return (
    <>
      <div className="connections-header">
        <a href="/admin/settings" className="connections-back">
          <PiArrowLeftBold /> Settings
        </a>
        <h1>SMS Scheduling Integration</h1>
      </div>
      <p className="connections-subtitle">
        Configure SMS providers, manage phone numbers, handle opt-in/opt-out compliance,
        schedule campaigns, and view delivery reports.
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
            <div className="team-admin-stat-label">Campaigns</div>
            <div className="team-admin-stat-value">{stats.totalCampaigns}</div>
          </div>
          <div className="team-admin-stat">
            <div className="team-admin-stat-label">Messages Sent</div>
            <div className="team-admin-stat-value">{stats.totalMessagesSent.toLocaleString()}</div>
          </div>
          <div className="team-admin-stat">
            <div className="team-admin-stat-label">Delivery Rate</div>
            <div className="team-admin-stat-value">{stats.deliveryRate}%</div>
          </div>
          <div className="team-admin-stat">
            <div className="team-admin-stat-label">Opt-ins</div>
            <div className="team-admin-stat-value">{stats.optInCount}</div>
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

      {/* ===== PROVIDER TAB ===== */}
      {activeTab === 'provider' && (
        <>
          <div className="team-admin-header" style={{ marginBottom: 'var(--af-space-hand)' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-base)', fontWeight: 700, color: 'var(--af-stone-800)', margin: 0 }}>
                SMS Provider Configuration
              </h2>
              <p className="team-admin-subtitle">Connect Twilio or MessageBird for SMS delivery.</p>
            </div>
            {providers.length === 0 && (
              <button
                type="button"
                className="team-admin-primary-btn"
                onClick={() => { setShowConnect(true); setFormValues({}); setFormError(null); setRevealedFields(new Set()) }}
              >
                <PiPlusBold style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Connect Provider
              </button>
            )}
          </div>

          {providers.length === 0 && (
            <div className="team-admin-empty">
              <div className="team-admin-empty-icon"><PiChatTextBold /></div>
              <h2>No SMS provider connected</h2>
              <p>Connect a Twilio or MessageBird account to start sending scheduled SMS campaigns.</p>
            </div>
          )}

          <div className="connections-grid">
            {providers.map((prov) => (
              <div key={prov.id} className="connection-card">
                <div className="connection-card-top">
                  <div className="connection-card-info">
                    <div
                      className="connection-card-icon"
                      style={{ background: prov.provider === 'TWILIO' ? '#FEE8E8' : '#E8F0FE', color: prov.provider === 'TWILIO' ? '#F22F46' : '#2481D7' }}
                    >
                      <PiChatTextBold />
                    </div>
                    <div className="connection-card-name">
                      <h3>{prov.provider === 'TWILIO' ? 'Twilio' : 'MessageBird'}</h3>
                      <p>Account: {prov.accountSid}</p>
                    </div>
                  </div>
                  <span className={`connection-status ${prov.status.toLowerCase()}`}>
                    <span className="connection-status-dot" />
                    {prov.status === 'CONNECTED' ? 'Connected' : prov.status === 'ERROR' ? 'Error' : 'Disconnected'}
                  </span>
                </div>

                <div className="connection-card-details">
                  <div className="account-name">Default: {prov.defaultFromNumber}</div>
                  {prov.connectedAt && (
                    <div className="connected-date">Connected {formatDate(prov.connectedAt)}</div>
                  )}
                  {prov.lastTestedAt && (
                    <div className="connected-date">Last tested {formatDate(prov.lastTestedAt)}</div>
                  )}
                  {prov.messagingServiceSid && (
                    <div className="connected-date">Messaging SID: {prov.messagingServiceSid}</div>
                  )}
                </div>

                <div className="connection-card-actions">
                  {disconnectConfirm === prov.id ? (
                    <div className="disconnect-confirm">
                      <span>Remove this provider?</span>
                      <button
                        className="connection-btn disconnect-yes"
                        onClick={() => handleDisconnect(prov.id)}
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
                      onClick={() => setDisconnectConfirm(prov.id)}
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                <div className="connection-env-hint">
                  {prov.provider === 'TWILIO' ? 'Twilio REST API' : 'MessageBird API'} &middot; SMS/MMS
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== NUMBERS TAB ===== */}
      {activeTab === 'numbers' && (
        <>
          <h2 style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-base)', fontWeight: 700, color: 'var(--af-stone-800)', margin: '0 0 var(--af-space-hand)' }}>
            Phone Number Management
          </h2>

          {phoneNumbers.length === 0 && (
            <div className="team-admin-empty">
              <div className="team-admin-empty-icon"><PiPhoneBold /></div>
              <h2>No phone numbers</h2>
              <p>Connect a provider first, then phone numbers will appear here.</p>
            </div>
          )}

          <div className="connections-grid">
            {phoneNumbers.map((num) => (
              <div key={num.id} className="connection-card">
                <div className="connection-card-top">
                  <div className="connection-card-info">
                    <div className="connection-card-icon" style={{ background: '#E8F4FD', color: '#0284C7' }}>
                      <PiPhoneBold />
                    </div>
                    <div className="connection-card-name">
                      <h3>{num.number}</h3>
                      <p>{num.friendlyName}</p>
                    </div>
                  </div>
                  <span className={`connection-status ${num.status === 'ACTIVE' ? 'connected' : num.status === 'PENDING' ? 'expired' : 'disconnected'}`}>
                    <span className="connection-status-dot" />
                    {num.status}
                  </span>
                </div>
                <div className="connection-card-details">
                  <div className="account-name">
                    Capabilities: {num.capabilities.join(', ').toUpperCase()}
                  </div>
                  <div className="connected-date">
                    {num.monthlyMessages.toLocaleString()} messages this month
                  </div>
                </div>
                <div className="connection-env-hint">
                  Added {formatDate(num.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== COMPLIANCE TAB ===== */}
      {activeTab === 'compliance' && (
        <>
          <h2 style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-base)', fontWeight: 700, color: 'var(--af-stone-800)', margin: '0 0 var(--af-space-breath)' }}>
            Opt-in / Opt-out Compliance
          </h2>
          <div className="connections-security-note" style={{ marginBottom: 'var(--af-space-hand)' }}>
            <PiShieldCheckBold />
            <span>
              All SMS campaigns require explicit opt-in consent. Recipients can opt out at any time
              by replying STOP. Records are retained for TCPA/GDPR compliance.
            </span>
          </div>

          <div className="team-admin-stats" style={{ marginBottom: 'var(--af-space-hand)' }}>
            <div className="team-admin-stat">
              <div className="team-admin-stat-label">Opted In</div>
              <div className="team-admin-stat-value">{optRecords.filter((r) => r.status === 'OPTED_IN').length}</div>
            </div>
            <div className="team-admin-stat">
              <div className="team-admin-stat-label">Opted Out</div>
              <div className="team-admin-stat-value">{optRecords.filter((r) => r.status === 'OPTED_OUT').length}</div>
            </div>
          </div>

          {optRecords.length === 0 ? (
            <div className="team-admin-empty">
              <div className="team-admin-empty-icon"><PiProhibitBold /></div>
              <h2>No opt records</h2>
              <p>Opt-in/opt-out records will appear here as contacts subscribe.</p>
            </div>
          ) : (
            <div style={{
              background: 'var(--af-surface-card)',
              border: 'var(--af-border-visible) solid var(--af-stone-300)',
              borderRadius: 'var(--af-radius-stone)',
              boxShadow: 'var(--af-shadow-rest)',
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--af-font-architect)' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'var(--af-stone-50)', fontSize: 'var(--af-type-xs)', fontWeight: 700, color: 'var(--af-stone-600)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: 'var(--af-space-palm) var(--af-space-hand)', textAlign: 'left', borderBottom: 'var(--af-border-visible) solid var(--af-stone-300)' }}>
                      Phone Number
                    </th>
                    <th style={{ background: 'var(--af-stone-50)', fontSize: 'var(--af-type-xs)', fontWeight: 700, color: 'var(--af-stone-600)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: 'var(--af-space-palm) var(--af-space-hand)', textAlign: 'center', borderBottom: 'var(--af-border-visible) solid var(--af-stone-300)' }}>
                      Status
                    </th>
                    <th style={{ background: 'var(--af-stone-50)', fontSize: 'var(--af-type-xs)', fontWeight: 700, color: 'var(--af-stone-600)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: 'var(--af-space-palm) var(--af-space-hand)', textAlign: 'left', borderBottom: 'var(--af-border-visible) solid var(--af-stone-300)' }}>
                      Method
                    </th>
                    <th style={{ background: 'var(--af-stone-50)', fontSize: 'var(--af-type-xs)', fontWeight: 700, color: 'var(--af-stone-600)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: 'var(--af-space-palm) var(--af-space-hand)', textAlign: 'left', borderBottom: 'var(--af-border-visible) solid var(--af-stone-300)' }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {optRecords.map((rec) => (
                    <tr key={rec.id} style={{ borderBottom: 'var(--af-border-hair) solid var(--af-stone-200)' }}>
                      <td style={{ padding: 'var(--af-space-breath) var(--af-space-hand)', fontSize: 'var(--af-type-sm)', fontFamily: 'var(--af-font-machine)' }}>
                        {rec.phoneNumber}
                      </td>
                      <td style={{ padding: 'var(--af-space-breath) var(--af-space-hand)', textAlign: 'center' }}>
                        <span className={`connection-status ${rec.status === 'OPTED_IN' ? 'connected' : 'error'}`}>
                          <span className="connection-status-dot" />
                          {rec.status === 'OPTED_IN' ? 'Opted In' : 'Opted Out'}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--af-space-breath) var(--af-space-hand)', fontSize: 'var(--af-type-xs)', color: 'var(--af-stone-600)' }}>
                        {rec.method.replace('_', ' ')}
                      </td>
                      <td style={{ padding: 'var(--af-space-breath) var(--af-space-hand)', fontSize: 'var(--af-type-xs)', color: 'var(--af-stone-400)' }}>
                        {formatDate(rec.status === 'OPTED_IN' ? rec.optedInAt : rec.optedOutAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ===== CAMPAIGNS TAB ===== */}
      {activeTab === 'campaigns' && (
        <>
          <div className="team-admin-header" style={{ marginBottom: 'var(--af-space-hand)' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-base)', fontWeight: 700, color: 'var(--af-stone-800)', margin: 0 }}>
                Scheduled SMS Campaigns
              </h2>
              <p className="team-admin-subtitle">Create and manage SMS campaign sends.</p>
            </div>
          </div>

          {campaigns.length === 0 ? (
            <div className="team-admin-empty">
              <div className="team-admin-empty-icon"><PiPaperPlaneTiltBold /></div>
              <h2>No campaigns</h2>
              <p>Connect a provider and create your first SMS campaign.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--af-space-hand)' }}>
              {campaigns.map((camp) => (
                <div key={camp.id} className="connection-card">
                  <div className="connection-card-top">
                    <div className="connection-card-info">
                      <div
                        className="connection-card-icon"
                        style={{
                          background: camp.status === 'SENT' ? 'rgba(45, 134, 89, 0.1)' :
                            camp.status === 'SCHEDULED' ? 'rgba(0, 10, 255, 0.08)' :
                            camp.status === 'FAILED' ? 'rgba(194, 59, 34, 0.08)' :
                            'var(--af-stone-100)',
                          color: camp.status === 'SENT' ? 'var(--af-signal-go)' :
                            camp.status === 'SCHEDULED' ? 'var(--af-ultra)' :
                            camp.status === 'FAILED' ? 'var(--af-signal-stop)' :
                            'var(--af-stone-500)',
                        }}
                      >
                        {camp.status === 'SENT' ? <PiCheckCircleBold /> :
                         camp.status === 'SCHEDULED' ? <PiClockBold /> :
                         camp.status === 'FAILED' ? <PiWarningBold /> :
                         <PiPencilBold />}
                      </div>
                      <div className="connection-card-name">
                        <h3>{camp.name}</h3>
                        <p style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {camp.message}
                        </p>
                      </div>
                    </div>
                    <span className={`connection-status ${
                      camp.status === 'SENT' ? 'connected' :
                      camp.status === 'SCHEDULED' ? 'expired' :
                      camp.status === 'FAILED' ? 'error' :
                      'disconnected'
                    }`}>
                      <span className="connection-status-dot" />
                      {camp.status}
                    </span>
                  </div>

                  <div className="connection-card-details" style={{ display: 'flex', gap: 'var(--af-space-arm)', flexWrap: 'wrap' }}>
                    <div>
                      <div className="connected-date">Recipients: {camp.recipientCount}</div>
                      {camp.sentCount > 0 && (
                        <div className="connected-date">
                          Delivered: {camp.deliveredCount}/{camp.sentCount}
                          {camp.failedCount > 0 && ` (${camp.failedCount} failed)`}
                        </div>
                      )}
                    </div>
                    <div>
                      {camp.scheduledAt && <div className="connected-date">Scheduled: {formatDate(camp.scheduledAt)}</div>}
                      {camp.sentAt && <div className="connected-date">Sent: {formatDate(camp.sentAt)}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--af-space-breath)', flexWrap: 'wrap', marginTop: 'var(--af-space-breath)' }}>
                    {camp.tags.map((tag) => (
                      <span key={tag} style={{
                        fontFamily: 'var(--af-font-machine)',
                        fontSize: '10px',
                        color: 'var(--af-stone-500)',
                        background: 'var(--af-stone-100)',
                        padding: '2px 8px',
                        borderRadius: 'var(--af-radius-chip)',
                        border: 'var(--af-border-hair) solid var(--af-stone-200)',
                      }}>
                        {tag}
                      </span>
                    ))}
                    <span className={`connection-status ${camp.complianceStatus === 'COMPLIANT' ? 'connected' : camp.complianceStatus === 'PENDING_REVIEW' ? 'expired' : 'error'}`}
                      style={{ marginLeft: 'auto', fontSize: '10px' }}>
                      <span className="connection-status-dot" />
                      {camp.complianceStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {camp.status === 'SENT' && (
                    <div className="connection-card-actions" style={{ marginTop: 'var(--af-space-palm)' }}>
                      <button
                        className="connection-btn connect"
                        onClick={() => handleViewReports(camp)}
                      >
                        View Delivery Report
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== REPORTS TAB ===== */}
      {activeTab === 'reports' && (
        <>
          <h2 style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-base)', fontWeight: 700, color: 'var(--af-stone-800)', margin: '0 0 var(--af-space-hand)' }}>
            Delivery Reports
          </h2>
          <p className="connections-subtitle">
            Select a sent campaign from the Campaigns tab to view its delivery report,
            or view aggregate statistics above.
          </p>

          {stats && (
            <div className="team-admin-stats">
              <div className="team-admin-stat">
                <div className="team-admin-stat-label">Active Numbers</div>
                <div className="team-admin-stat-value">{stats.activeNumbers}</div>
              </div>
              <div className="team-admin-stat">
                <div className="team-admin-stat-label">Monthly Spend</div>
                <div className="team-admin-stat-value">${stats.monthlySpend.toFixed(2)}</div>
              </div>
              <div className="team-admin-stat">
                <div className="team-admin-stat-label">Delivery Rate</div>
                <div className="team-admin-stat-value">{stats.deliveryRate}%</div>
              </div>
              <div className="team-admin-stat">
                <div className="team-admin-stat-label">Opt-outs</div>
                <div className="team-admin-stat-value">{stats.optOutCount}</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== CONNECT DIALOG ===== */}
      {showConnect && (
        <div className="connect-dialog-overlay" onClick={() => setShowConnect(false)}>
          <div className="connect-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="connect-dialog-header">
              <div className="connection-card-icon" style={{ background: '#FEE8E8', color: '#F22F46' }}>
                <PiChatTextBold />
              </div>
              <div>
                <h2>Connect SMS Provider</h2>
                <p>Enter your API credentials to enable SMS sending.</p>
              </div>
            </div>

            {/* Provider selector */}
            <div style={{ display: 'flex', gap: 'var(--af-space-breath)', marginBottom: 'var(--af-space-arm)' }}>
              {(['TWILIO', 'MESSAGEBIRD'] as SMSProvider[]).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => { setConnectProvider(prov); setFormValues({}); setFormError(null) }}
                  style={{
                    flex: 1,
                    padding: 'var(--af-space-palm)',
                    border: `var(--af-border-visible) solid ${connectProvider === prov ? 'var(--af-ultra)' : 'var(--af-stone-300)'}`,
                    borderRadius: 'var(--af-radius-chip)',
                    background: connectProvider === prov ? 'rgba(0, 10, 255, 0.06)' : 'var(--af-surface-card)',
                    color: connectProvider === prov ? 'var(--af-ultra)' : 'var(--af-stone-600)',
                    fontFamily: 'var(--af-font-architect)',
                    fontWeight: 600,
                    fontSize: 'var(--af-type-sm)',
                    cursor: 'pointer',
                    transition: 'all var(--af-dur-quick) var(--af-ease-press)',
                  }}
                >
                  {prov === 'TWILIO' ? 'Twilio' : 'MessageBird'}
                </button>
              ))}
            </div>

            <div className="connect-dialog-fields">
              {connectProvider === 'TWILIO' ? (
                <>
                  <div className="connect-field">
                    <label>Account SID</label>
                    <div className="connect-field-input-wrap">
                      <input
                        type={revealedFields.has('accountSid') ? 'text' : 'password'}
                        placeholder="AC1234567890abcdef..."
                        value={formValues.accountSid || ''}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, accountSid: e.target.value }))}
                        autoComplete="off"
                      />
                      <button type="button" className="connect-field-reveal" onClick={() => toggleReveal('accountSid')}>
                        {revealedFields.has('accountSid') ? <PiEyeSlashBold /> : <PiEyeBold />}
                      </button>
                    </div>
                  </div>
                  <div className="connect-field">
                    <label>Auth Token</label>
                    <div className="connect-field-input-wrap">
                      <input
                        type={revealedFields.has('authToken') ? 'text' : 'password'}
                        placeholder="your_auth_token"
                        value={formValues.authToken || ''}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, authToken: e.target.value }))}
                        autoComplete="off"
                      />
                      <button type="button" className="connect-field-reveal" onClick={() => toggleReveal('authToken')}>
                        {revealedFields.has('authToken') ? <PiEyeSlashBold /> : <PiEyeBold />}
                      </button>
                    </div>
                  </div>
                  <div className="connect-field">
                    <label>Messaging Service SID (optional)</label>
                    <div className="connect-field-input-wrap">
                      <input
                        type="text"
                        placeholder="MG1234567890abcdef..."
                        value={formValues.messagingServiceSid || ''}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, messagingServiceSid: e.target.value }))}
                        autoComplete="off"
                      />
                    </div>
                    <span className="connect-field-help">Required for A2P 10DLC compliance in the US.</span>
                  </div>
                </>
              ) : (
                <div className="connect-field">
                  <label>API Key</label>
                  <div className="connect-field-input-wrap">
                    <input
                      type={revealedFields.has('apiKey') ? 'text' : 'password'}
                      placeholder="your_messagebird_api_key"
                      value={formValues.apiKey || ''}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, apiKey: e.target.value }))}
                      autoComplete="off"
                    />
                    <button type="button" className="connect-field-reveal" onClick={() => toggleReveal('apiKey')}>
                      {revealedFields.has('apiKey') ? <PiEyeSlashBold /> : <PiEyeBold />}
                    </button>
                  </div>
                </div>
              )}

              <div className="connect-field">
                <label>Default From Number</label>
                <div className="connect-field-input-wrap">
                  <input
                    type="text"
                    placeholder="+14155551234"
                    value={formValues.defaultFromNumber || ''}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, defaultFromNumber: e.target.value }))}
                    autoComplete="off"
                  />
                </div>
                <span className="connect-field-help">The phone number messages will be sent from. Must be verified with your provider.</span>
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
              Credentials are encrypted and stored server-side. They are not accessible
              after this dialog is closed.
            </div>
          </div>
        </div>
      )}

      {/* ===== DELIVERY REPORT DIALOG ===== */}
      {selectedCampaign && (
        <div className="connect-dialog-overlay" onClick={() => { setSelectedCampaign(null); setDeliveryReports([]) }}>
          <div className="connect-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="connect-dialog-header">
              <div className="connection-card-icon" style={{ background: 'rgba(45, 134, 89, 0.1)', color: 'var(--af-signal-go)' }}>
                <PiChartBarBold />
              </div>
              <div>
                <h2>Delivery Report</h2>
                <p>{selectedCampaign.name}</p>
              </div>
            </div>

            <div className="team-admin-stats" style={{ marginBottom: 'var(--af-space-hand)' }}>
              <div className="team-admin-stat">
                <div className="team-admin-stat-label">Sent</div>
                <div className="team-admin-stat-value">{selectedCampaign.sentCount}</div>
              </div>
              <div className="team-admin-stat">
                <div className="team-admin-stat-label">Delivered</div>
                <div className="team-admin-stat-value">{selectedCampaign.deliveredCount}</div>
              </div>
              <div className="team-admin-stat">
                <div className="team-admin-stat-label">Failed</div>
                <div className="team-admin-stat-value">{selectedCampaign.failedCount}</div>
              </div>
            </div>

            {deliveryReports.length > 0 && (
              <div style={{
                background: 'var(--af-surface-card)',
                border: 'var(--af-border-visible) solid var(--af-stone-300)',
                borderRadius: 'var(--af-radius-worn)',
                overflow: 'hidden',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--af-font-architect)' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'var(--af-stone-50)', fontSize: 'var(--af-type-xs)', fontWeight: 700, color: 'var(--af-stone-600)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: 'var(--af-space-palm) var(--af-space-hand)', textAlign: 'left', borderBottom: 'var(--af-border-visible) solid var(--af-stone-300)' }}>
                        To
                      </th>
                      <th style={{ background: 'var(--af-stone-50)', fontSize: 'var(--af-type-xs)', fontWeight: 700, color: 'var(--af-stone-600)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: 'var(--af-space-palm) var(--af-space-hand)', textAlign: 'center', borderBottom: 'var(--af-border-visible) solid var(--af-stone-300)' }}>
                        Status
                      </th>
                      <th style={{ background: 'var(--af-stone-50)', fontSize: 'var(--af-type-xs)', fontWeight: 700, color: 'var(--af-stone-600)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: 'var(--af-space-palm) var(--af-space-hand)', textAlign: 'right', borderBottom: 'var(--af-border-visible) solid var(--af-stone-300)' }}>
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryReports.map((r) => (
                      <tr key={r.id} style={{ borderBottom: 'var(--af-border-hair) solid var(--af-stone-200)' }}>
                        <td style={{ padding: 'var(--af-space-breath) var(--af-space-hand)', fontFamily: 'var(--af-font-machine)', fontSize: 'var(--af-type-xs)' }}>
                          {r.to}
                        </td>
                        <td style={{ padding: 'var(--af-space-breath) var(--af-space-hand)', textAlign: 'center' }}>
                          <span className={`connection-status ${r.status === 'DELIVERED' ? 'connected' : r.status === 'SENT' || r.status === 'QUEUED' ? 'expired' : 'error'}`} style={{ fontSize: '10px' }}>
                            <span className="connection-status-dot" />
                            {r.status}
                          </span>
                          {r.errorMessage && (
                            <div style={{ fontSize: '10px', color: 'var(--af-signal-stop)', marginTop: 2 }}>
                              {r.errorCode}: {r.errorMessage}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: 'var(--af-space-breath) var(--af-space-hand)', fontFamily: 'var(--af-font-machine)', fontSize: 'var(--af-type-xs)', textAlign: 'right', color: 'var(--af-stone-500)' }}>
                          {r.price != null ? `$${r.price.toFixed(4)}` : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="connect-dialog-actions" style={{ marginTop: 'var(--af-space-hand)' }}>
              <button
                className="connection-btn cancel"
                onClick={() => { setSelectedCampaign(null); setDeliveryReports([]) }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
