'use client'

import { useState, useEffect, useCallback } from 'react'
import { PiClockCounterClockwiseBold } from 'react-icons/pi'
import PlatformChip from '@/components/admin/PlatformChip'
import { fetchApprovalHistory, type ApprovalHistoryEntry } from '@/lib/team-api'
import { getCookieValue } from '@/lib/cookies'
import '../team-settings.css'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function actionLabel(action: ApprovalHistoryEntry['action']): string {
  switch (action) {
    case 'APPROVED': return 'Approved'
    case 'REJECTED': return 'Rejected'
    case 'CHANGES_REQUESTED': return 'Changes Requested'
    case 'REQUESTED': return 'Requested'
    case 'AUTO_APPROVED': return 'Auto-Approved'
  }
}

function actionBadgeClass(action: ApprovalHistoryEntry['action']): string {
  switch (action) {
    case 'APPROVED': return 'approved'
    case 'REJECTED': return 'rejected'
    case 'CHANGES_REQUESTED': return 'changes-requested'
    case 'REQUESTED': return 'requested'
    case 'AUTO_APPROVED': return 'auto-approved'
  }
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ApprovalHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchApprovalHistory(token)
      setHistory(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = history.filter((entry) => {
    if (filterAction !== 'all' && entry.action !== filterAction) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        entry.actorName.toLowerCase().includes(q) ||
        entry.postContent.toLowerCase().includes(q) ||
        (entry.comment || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <>
      <div className="team-admin-header">
        <div>
          <h1>Approval History</h1>
          <p className="team-admin-subtitle">
            Complete log of all approval actions — who approved what, when, and with what feedback.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="team-filters">
        <select
          className="team-filter-select"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="all">All Actions</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CHANGES_REQUESTED">Changes Requested</option>
          <option value="REQUESTED">Requested</option>
          <option value="AUTO_APPROVED">Auto-Approved</option>
        </select>
        <input
          type="text"
          className="team-filter-search"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="team-admin-skeleton">
          {[1, 2, 3, 4].map((i) => (
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
          <div className="team-admin-empty-icon">
            <PiClockCounterClockwiseBold />
          </div>
          <h2>No history</h2>
          <p>Approval actions will appear here as your team reviews content.</p>
        </div>
      )}

      {/* History table */}
      {!loading && filtered.length > 0 && (
        <div className="team-history-table-wrap">
          <table className="team-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Platform</th>
                <th>Post</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span className="team-history-timestamp">{formatDate(entry.timestamp)}</span>
                  </td>
                  <td>
                    <span className={`team-approval-badge ${actionBadgeClass(entry.action)}`}>
                      {actionLabel(entry.action)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{entry.actorName}</span>
                  </td>
                  <td>
                    <PlatformChip platform={entry.platform} />
                  </td>
                  <td>
                    <span className="team-history-content" title={entry.postContent}>
                      {entry.postContent}
                    </span>
                  </td>
                  <td>
                    {entry.comment ? (
                      <span className="team-history-comment" title={entry.comment}>
                        {entry.comment}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--af-stone-300)', fontSize: 'var(--af-type-xs)' }}>--</span>
                    )}
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
