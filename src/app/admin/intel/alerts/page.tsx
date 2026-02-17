'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PiBellBold,
  PiShieldWarningBold,
  PiCheckCircleBold,
  PiEyeSlashBold,
  PiTrashBold,
  PiGearBold,
  PiArrowsClockwiseBold,
  PiPlusBold,
  PiLightningBold,
  PiWarningBold,
} from 'react-icons/pi'
import {
  fetchAlerts,
  fetchAlertRules,
  fetchAlertStats,
  acknowledgeAlert,
  resolveAlert,
  muteAlert,
  deleteAlert,
  toggleAlertRule,
  createAlertRule,
  deleteAlertRule,
  type Alert,
  type AlertRule,
  type AlertStats,
  type AlertCategory,
  type AlertSeverity,
  type AlertStatus,
  ALERT_SEVERITY_STYLES,
  ALERT_STATUS_STYLES,
  ALERT_CATEGORY_LABELS,
} from '@/lib/alerts-api'
import '../intel-admin.css'

export default function IntelAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [rules, setRules] = useState<AlertRule[]>([])
  const [stats, setStats] = useState<AlertStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'ALL'>('ALL')
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'ALL'>('ALL')
  const [showRules, setShowRules] = useState(false)
  const [showCreateRule, setShowCreateRule] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Create rule form
  const [ruleName, setRuleName] = useState('')
  const [ruleCategory, setRuleCategory] = useState<AlertCategory>('competitor')
  const [ruleCondition, setRuleCondition] = useState('')
  const [ruleThreshold, setRuleThreshold] = useState<string>('')
  const [ruleDescription, setRuleDescription] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [a, r, s] = await Promise.all([
      fetchAlerts(),
      fetchAlertRules(),
      fetchAlertStats(),
    ])
    setAlerts(a)
    setRules(r)
    setStats(s)
    setLoading(false)
  }

  const filtered = alerts
    .filter((a) => filterStatus === 'ALL' || a.status === filterStatus)
    .filter((a) => filterSeverity === 'ALL' || a.severity === filterSeverity)

  function showToastMsg(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleAcknowledge(id: string) {
    const updated = await acknowledgeAlert(id)
    setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)))
    showToastMsg('Alert acknowledged')
  }

  async function handleResolve(id: string) {
    const updated = await resolveAlert(id)
    setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)))
    showToastMsg('Alert resolved')
  }

  async function handleMute(id: string) {
    const updated = await muteAlert(id)
    setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)))
    showToastMsg('Alert muted')
  }

  async function handleDeleteAlert(id: string) {
    await deleteAlert(id)
    setAlerts((prev) => prev.filter((a) => a.id !== id))
    showToastMsg('Alert deleted')
  }

  async function handleToggleRule(id: string) {
    const updated = await toggleAlertRule(id)
    setRules((prev) => prev.map((r) => (r.id === id ? updated : r)))
  }

  async function handleDeleteRule(id: string) {
    await deleteAlertRule(id)
    setRules((prev) => prev.filter((r) => r.id !== id))
    showToastMsg('Rule deleted')
  }

  async function handleCreateRule() {
    if (!ruleName || !ruleCondition) return
    const rule = await createAlertRule({
      name: ruleName,
      category: ruleCategory,
      enabled: true,
      condition: ruleCondition,
      threshold: ruleThreshold ? Number(ruleThreshold) : null,
      description: ruleDescription,
    })
    setRules((prev) => [rule, ...prev])
    setShowCreateRule(false)
    setRuleName('')
    setRuleCondition('')
    setRuleThreshold('')
    setRuleDescription('')
    showToastMsg('Rule created')
  }

  function timeSince(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <>
      <div className="intel-header">
        <h1>Alert Center</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="intel-btn" onClick={() => setShowRules(!showRules)}>
            <PiGearBold /> {showRules ? 'View Alerts' : 'Alert Rules'}
          </button>
          <button className="intel-btn" onClick={() => loadData()} disabled={loading}>
            <PiArrowsClockwiseBold /> Refresh
          </button>
        </div>
      </div>

      <div className="intel-subnav">
        <Link href="/admin/intel">Overview</Link>
        <Link href="/admin/intel/competitors">Competitors</Link>
        <Link href="/admin/intel/alerts" className="active">Alerts</Link>
        <Link href="/admin/intel/signals">Signals</Link>
        <Link href="/admin/intel/predictions">Predictions</Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="intel-stats">
          <div className="intel-stat-card">
            <div className="intel-stat-icon"><PiBellBold /></div>
            <div className="intel-stat-info">
              <div className="intel-stat-value">{stats.totalAlerts}</div>
              <div className="intel-stat-label">Total Alerts</div>
            </div>
          </div>
          <div className="intel-stat-card">
            <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-signal-stop) 10%, white)', color: 'var(--af-signal-stop)' }}>
              <PiShieldWarningBold />
            </div>
            <div className="intel-stat-info">
              <div className="intel-stat-value">{stats.activeAlerts}</div>
              <div className="intel-stat-label">Active</div>
            </div>
          </div>
          <div className="intel-stat-card">
            <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-signal-stop) 10%, white)', color: 'var(--af-signal-stop)' }}>
              <PiWarningBold />
            </div>
            <div className="intel-stat-info">
              <div className="intel-stat-value">{stats.criticalAlerts}</div>
              <div className="intel-stat-label">Critical</div>
            </div>
          </div>
          <div className="intel-stat-card">
            <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-patina) 10%, white)', color: 'var(--af-patina)' }}>
              <PiLightningBold />
            </div>
            <div className="intel-stat-info">
              <div className="intel-stat-value">{stats.avgResponseTime}</div>
              <div className="intel-stat-label">Avg Response</div>
            </div>
          </div>
        </div>
      )}

      {showRules ? (
        /* -------- Alert Rules View -------- */
        <div className="intel-section">
          <div className="intel-section-header">
            <h3 className="intel-section-title">Alert Rules</h3>
            <button className="intel-btn intel-btn--primary" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => setShowCreateRule(true)}>
              <PiPlusBold /> New Rule
            </button>
          </div>
          <div className="intel-section-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rules.map((rule) => (
                <div key={rule.id} className="intel-timeline-item" style={{ alignItems: 'center' }}>
                  <button
                    className={`intel-alert-toggle${rule.enabled ? ' active' : ''}`}
                    onClick={() => handleToggleRule(rule.id)}
                    style={{ flexShrink: 0 }}
                  />
                  <div className="intel-timeline-content">
                    <h4 className="intel-timeline-title">{rule.name}</h4>
                    <p className="intel-timeline-summary">{rule.description}</p>
                    <div className="intel-timeline-meta">
                      <span className={`intel-sentiment ${rule.enabled ? 'positive' : 'neutral'}`}>
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </span>
                      <span>{ALERT_CATEGORY_LABELS[rule.category]}</span>
                      {rule.threshold !== null && <span>Threshold: {rule.threshold}%</span>}
                      <span>{rule.triggerCount} triggers</span>
                      {rule.lastTriggered && <span>Last: {timeSince(rule.lastTriggered)}</span>}
                    </div>
                  </div>
                  <button
                    className="intel-btn"
                    style={{ fontSize: 11, padding: '2px 8px', color: 'var(--af-signal-stop)', flexShrink: 0 }}
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <PiTrashBold />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* -------- Alerts List View -------- */
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['ALL', 'active', 'acknowledged', 'resolved', 'muted'] as const).map((s) => (
                <button
                  key={s}
                  className={`intel-chip${filterStatus === s ? ' active' : ''}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s === 'ALL' ? 'All' : ALERT_STATUS_STYLES[s].label}
                </button>
              ))}
            </div>
            <div style={{ width: 1, height: 20, background: 'var(--af-stone-300)' }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['ALL', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
                <button
                  key={s}
                  className={`intel-chip${filterSeverity === s ? ' active' : ''}`}
                  onClick={() => setFilterSeverity(s)}
                >
                  {s === 'ALL' ? 'All Severity' : ALERT_SEVERITY_STYLES[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts Timeline */}
          <div className="intel-timeline">
            {filtered.map((alert) => (
              <div key={alert.id} className="intel-timeline-item" style={{ borderLeftWidth: 3, borderLeftColor: ALERT_SEVERITY_STYLES[alert.severity].color }}>
                <div className={`intel-timeline-dot ${alert.category}`} />
                <div className="intel-timeline-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h4 className="intel-timeline-title" style={{ margin: 0 }}>{alert.title}</h4>
                    <span
                      className="growth-badge"
                      style={{
                        background: ALERT_SEVERITY_STYLES[alert.severity].bg,
                        color: ALERT_SEVERITY_STYLES[alert.severity].color,
                        fontSize: 10,
                        padding: '1px 6px',
                      }}
                    >
                      {ALERT_SEVERITY_STYLES[alert.severity].label}
                    </span>
                    <span
                      className="growth-badge"
                      style={{
                        background: ALERT_STATUS_STYLES[alert.status].bg,
                        color: ALERT_STATUS_STYLES[alert.status].color,
                        fontSize: 10,
                        padding: '1px 6px',
                      }}
                    >
                      {ALERT_STATUS_STYLES[alert.status].label}
                    </span>
                  </div>
                  <p className="intel-timeline-summary">{alert.description}</p>
                  <div className="intel-timeline-meta">
                    <span>{alert.source}</span>
                    <span>{timeSince(alert.triggeredAt)}</span>
                    <span className={`intel-sentiment neutral`}>{ALERT_CATEGORY_LABELS[alert.category]}</span>
                    {alert.tags.slice(0, 3).map((tag) => (
                      <span key={tag} style={{ color: 'var(--af-ultra)' }}>#{tag}</span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {alert.status === 'active' && (
                      <>
                        <button className="intel-btn" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => handleAcknowledge(alert.id)}>
                          <PiCheckCircleBold /> Acknowledge
                        </button>
                        <button className="intel-btn" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => handleResolve(alert.id)}>
                          Resolve
                        </button>
                        <button className="intel-btn" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => handleMute(alert.id)}>
                          <PiEyeSlashBold /> Mute
                        </button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button className="intel-btn" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => handleResolve(alert.id)}>
                        <PiCheckCircleBold /> Resolve
                      </button>
                    )}
                    {(alert.status === 'resolved' || alert.status === 'muted') && (
                      <button className="intel-btn" style={{ fontSize: 11, padding: '2px 8px', color: 'var(--af-signal-stop)' }} onClick={() => handleDeleteAlert(alert.id)}>
                        <PiTrashBold /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="growth-empty">
                <div className="growth-empty-title">No alerts found</div>
                <div className="growth-empty-sub">
                  No alerts match your current filters. Adjust filters or check back later.
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Rule Modal */}
      {showCreateRule && (
        <div className="growth-modal-overlay" onClick={() => setShowCreateRule(false)}>
          <div className="growth-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="growth-modal-title">New Alert Rule</h2>

            <div className="growth-form-group">
              <label className="growth-form-label">Rule Name</label>
              <input className="growth-form-input" value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="e.g., Competitor Pricing Change" />
            </div>

            <div className="growth-form-group">
              <label className="growth-form-label">Category</label>
              <select
                className="growth-form-input"
                value={ruleCategory}
                onChange={(e) => setRuleCategory(e.target.value as AlertCategory)}
              >
                {Object.entries(ALERT_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="growth-form-group">
              <label className="growth-form-label">Condition</label>
              <textarea className="growth-form-textarea" value={ruleCondition} onChange={(e) => setRuleCondition(e.target.value)} placeholder="Describe the trigger condition" />
            </div>

            <div className="growth-form-group">
              <label className="growth-form-label">Threshold (optional)</label>
              <input className="growth-form-input" type="number" value={ruleThreshold} onChange={(e) => setRuleThreshold(e.target.value)} placeholder="e.g., 10" />
            </div>

            <div className="growth-form-group">
              <label className="growth-form-label">Description</label>
              <input className="growth-form-input" value={ruleDescription} onChange={(e) => setRuleDescription(e.target.value)} placeholder="Brief description of what this rule monitors" />
            </div>

            <div className="growth-modal-actions">
              <button className="intel-btn" onClick={() => setShowCreateRule(false)}>Cancel</button>
              <button className="intel-btn intel-btn--primary" onClick={handleCreateRule} disabled={!ruleName || !ruleCondition}>
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="growth-toast">{toast}</div>}
    </>
  )
}
