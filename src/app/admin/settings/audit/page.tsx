'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PiClipboardTextBold,
  PiDownloadBold,
  PiMagnifyingGlassBold,
} from 'react-icons/pi'
import {
  fetchAuditLog,
  exportAuditLog,
  downloadExport,
  ALL_AUDIT_ACTIONS,
  type AuditLogEntry,
  type AuditAction,
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

function actionCategory(action: AuditAction): string {
  if (action.startsWith('user.')) return 'auth'
  if (action.startsWith('role.')) return 'role'
  if (action.startsWith('post.') || action.startsWith('approval.')) return 'content'
  if (action.startsWith('deployment.')) return 'infra'
  if (action.startsWith('sso.') || action.startsWith('api_key.')) return 'security'
  if (action.startsWith('webhook.')) return 'infra'
  if (action.startsWith('settings.')) return 'role'
  return 'infra'
}

function actionLabel(action: AuditAction): string {
  const found = ALL_AUDIT_ACTIONS.find((a) => a.value === action)
  return found ? found.label : action
}

function metadataString(meta: Record<string, string>): string {
  return Object.entries(meta)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterActor, setFilterActor] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAuditLog(token)
      setEntries(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = entries.filter((entry) => {
    if (filterAction !== 'all' && entry.action !== filterAction) return false
    if (filterActor !== 'all' && entry.actorId !== filterActor) return false
    if (dateFrom && entry.timestamp < dateFrom) return false
    if (dateTo && entry.timestamp > dateTo + 'T23:59:59Z') return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        entry.actorName.toLowerCase().includes(q) ||
        entry.targetLabel.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.actorEmail.toLowerCase().includes(q)
      )
    }
    return true
  })

  const actors = [...new Map(entries.map((e) => [e.actorId, { id: e.actorId, name: e.actorName }])).values()]

  const handleExport = useCallback((format: 'csv' | 'json') => {
    const content = exportAuditLog(filtered, format)
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `audit-log-${timestamp}.${format}`
    const mimeType = format === 'csv' ? 'text/csv' : 'application/json'
    downloadExport(content, filename, mimeType)
    setStatusMsg({ type: 'success', text: `Exported ${filtered.length} entries as ${format.toUpperCase()}.` })
  }, [filtered])

  return (
    <>
      <div className="team-admin-header">
        <div>
          <h1>Audit Log</h1>
          <p className="team-admin-subtitle">
            Complete trail of all actions across your workspace. Filter, search, and export for compliance.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className={`team-status-msg ${statusMsg.type}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Stats */}
      <div className="team-admin-stats">
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Total Events</div>
          <div className="team-admin-stat-value">{entries.length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Filtered</div>
          <div className="team-admin-stat-value">{filtered.length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Actors</div>
          <div className="team-admin-stat-value">{actors.length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Action Types</div>
          <div className="team-admin-stat-value">{new Set(entries.map((e) => e.action)).size}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="audit-filters">
        <div className="audit-filter-group">
          <span className="audit-filter-label">Search</span>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="audit-filter-input"
              placeholder="Search actors, targets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 'var(--af-space-arm)', width: 220 }}
            />
            <PiMagnifyingGlassBold style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--af-stone-400)', fontSize: 14 }} />
          </div>
        </div>

        <div className="audit-filter-group">
          <span className="audit-filter-label">Action</span>
          <select
            className="audit-filter-input"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="all">All Actions</option>
            {ALL_AUDIT_ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div className="audit-filter-group">
          <span className="audit-filter-label">Actor</span>
          <select
            className="audit-filter-input"
            value={filterActor}
            onChange={(e) => setFilterActor(e.target.value)}
          >
            <option value="all">All Actors</option>
            {actors.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="audit-filter-group">
          <span className="audit-filter-label">From</span>
          <input
            type="date"
            className="audit-filter-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="audit-filter-group">
          <span className="audit-filter-label">To</span>
          <input
            type="date"
            className="audit-filter-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="audit-export-btns">
          <button
            type="button"
            className="audit-export-btn"
            onClick={() => handleExport('csv')}
            disabled={filtered.length === 0}
          >
            <PiDownloadBold style={{ marginRight: 4, verticalAlign: 'middle' }} />
            CSV
          </button>
          <button
            type="button"
            className="audit-export-btn"
            onClick={() => handleExport('json')}
            disabled={filtered.length === 0}
          >
            <PiDownloadBold style={{ marginRight: 4, verticalAlign: 'middle' }} />
            JSON
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="team-admin-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="team-skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="team-skeleton-block w-20" />
              <div className="team-skeleton-block w-32" />
              <div className="team-skeleton-block w-24" />
              <div className="team-skeleton-block w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="team-admin-empty">
          <div className="team-admin-empty-icon"><PiClipboardTextBold /></div>
          <h2>No audit entries</h2>
          <p>
            {entries.length > 0
              ? 'No entries match your current filters. Try adjusting your search criteria.'
              : 'Audit trail entries will appear here as actions are performed across your workspace.'}
          </p>
        </div>
      )}

      {/* Audit table */}
      {!loading && filtered.length > 0 && (
        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Target</th>
                <th>Details</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span className="audit-timestamp">{formatDate(entry.timestamp)}</span>
                  </td>
                  <td>
                    <span className={`audit-action-chip ${actionCategory(entry.action)}`}>
                      {actionLabel(entry.action)}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{entry.actorName}</div>
                    <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: 'var(--af-type-xs)', color: 'var(--af-stone-400)' }}>
                      {entry.actorEmail}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{entry.targetLabel}</div>
                    <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: 10, color: 'var(--af-stone-400)' }}>
                      {entry.targetType}/{entry.targetId}
                    </div>
                  </td>
                  <td>
                    <span className="audit-metadata" title={metadataString(entry.metadata)}>
                      {metadataString(entry.metadata)}
                    </span>
                  </td>
                  <td>
                    <span className="audit-ip">{entry.ipAddress}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
