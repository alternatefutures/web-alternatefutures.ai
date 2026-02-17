'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchForumCategories,
  fetchForumThreads,
  fetchUserReports,
  updateThreadStatus,
  resolveReport,
  type ForumCategory,
  type ForumThread,
  type ForumThreadStatus,
  type UserReport,
} from '@/lib/community-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import '../community-admin.css'

const STATUS_STYLES: Record<ForumThreadStatus, { bg: string; color: string; label: string }> = {
  open: { bg: '#D1FAE5', color: '#065F46', label: 'Open' },
  closed: { bg: '#F3F4F6', color: '#6B7280', label: 'Closed' },
  pinned: { bg: '#DBEAFE', color: '#1E40AF', label: 'Pinned' },
  flagged: { bg: '#FEE2E2', color: '#991B1B', label: 'Flagged' },
  removed: { bg: '#FEF3C7', color: '#92400E', label: 'Removed' },
}

export default function ForumsPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [reports, setReports] = useState<UserReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showReports, setShowReports] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [cats, thrs, rpts] = await Promise.all([
          fetchForumCategories(token),
          fetchForumThreads(token),
          fetchUserReports(token),
        ])
        setCategories(cats)
        setThreads(thrs)
        setReports(rpts)
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = threads
    if (selectedCategory !== 'ALL') {
      result = result.filter((t) => t.categoryId === selectedCategory)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.authorName.toLowerCase().includes(q),
      )
    }
    return result.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
  }, [threads, selectedCategory, search])

  const flaggedCount = useMemo(() => threads.filter((t) => t.status === 'flagged').length, [threads])
  const unresolvedReports = useMemo(() => reports.filter((r) => !r.resolved).length, [reports])

  const handleThreadAction = useCallback(async (threadId: string, status: ForumThreadStatus) => {
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateThreadStatus(token, threadId, status)
      setThreads((prev) => prev.map((t) => t.id === threadId ? updated : t))
    } catch {
      // silently handle
    }
  }, [])

  const handleResolveReport = useCallback(async (reportId: string) => {
    try {
      const token = getCookieValue('af_access_token')
      const updated = await resolveReport(token, reportId)
      setReports((prev) => prev.map((r) => r.id === reportId ? updated : r))
    } catch {
      // silently handle
    }
  }, [])

  if (loading) {
    return <div className="community-admin-empty"><p>Loading forums...</p></div>
  }

  return (
    <>
      <div className="community-admin-header">
        <h1>Forum Moderation</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/community" className="community-admin-action-btn">Inbox</Link>
          <button
            className={`community-admin-action-btn${showReports ? ' primary' : ''}`}
            onClick={() => setShowReports(!showReports)}
          >
            Reports ({unresolvedReports})
          </button>
        </div>
      </div>

      <div className="community-subnav">
        <Link href="/admin/community" className="">Inbox</Link>
        <Link href="/admin/community/dashboard" className="">Growth</Link>
        <Link href="/admin/community/events" className="">Events</Link>
        <Link href="/admin/community/forums" className="active">Forums</Link>
        <Link href="/admin/community/engagement" className="">Engagement</Link>
        <Link href="/admin/community/members" className="">Members</Link>
      </div>

      <div className="community-admin-stats">
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Categories</div>
          <div className="community-admin-stat-value">{categories.length}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Threads</div>
          <div className="community-admin-stat-value">{threads.length}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Flagged</div>
          <div className="community-admin-stat-value">{flaggedCount}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Open Reports</div>
          <div className="community-admin-stat-value">{unresolvedReports}</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      {/* Reports panel */}
      {showReports && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            User Reports
          </h3>
          {reports.filter((r) => !r.resolved).length === 0 ? (
            <div style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: 13, color: '#6B7280', padding: '12px 0' }}>
              No unresolved reports.
            </div>
          ) : (
            reports.filter((r) => !r.resolved).map((rpt) => (
              <div key={rpt.id} className="community-report-item">
                <div className="community-report-body">
                  <div className="community-report-thread">{rpt.threadTitle}</div>
                  <div className="community-report-reason">
                    Reported by {rpt.reporterName}: {rpt.reason}
                  </div>
                </div>
                <div className="community-report-meta">
                  {formatTimeAgo(rpt.createdAt)}
                </div>
                <button
                  className="community-admin-action-btn"
                  onClick={() => handleResolveReport(rpt.id)}
                >
                  Resolve
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div className="community-forums-layout">
        {/* Categories sidebar */}
        <div className="community-forums-sidebar">
          <button
            className={`community-forum-cat-item${selectedCategory === 'ALL' ? ' active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All Categories
            <span className="community-forum-cat-count">{threads.length}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`community-forum-cat-item${selectedCategory === cat.id ? ' active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="community-forum-cat-dot" style={{ background: cat.color }} />
              {cat.name}
              <span className="community-forum-cat-count">{cat.threadCount}</span>
            </button>
          ))}
        </div>

        {/* Thread list */}
        <div>
          <div className="community-admin-filters" style={{ marginBottom: 12 }}>
            <input
              type="text"
              className="community-admin-search"
              placeholder="Search threads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="community-thread-list">
            {filtered.length === 0 ? (
              <div className="community-admin-empty" style={{ padding: 40 }}>
                <h2>No threads found</h2>
                <p>Try adjusting your search or category filter.</p>
              </div>
            ) : (
              filtered.map((thread) => {
                const ts = STATUS_STYLES[thread.status]
                return (
                  <div
                    key={thread.id}
                    className={`community-thread-item${thread.status === 'flagged' ? ' flagged' : ''}${thread.status === 'pinned' ? ' pinned' : ''}`}
                  >
                    <div className="community-thread-body">
                      <div className="community-thread-title">
                        {thread.title}
                      </div>
                      <div className="community-thread-excerpt">
                        by {thread.authorName} &middot; {formatTimeAgo(thread.lastActivityAt)}
                        {thread.reportCount > 0 && (
                          <span style={{ color: '#EF4444', marginLeft: 8 }}>{thread.reportCount} reports</span>
                        )}
                      </div>
                    </div>
                    <div className="community-thread-stats">
                      <span>{thread.replies} replies</span>
                      <span>{thread.views} views</span>
                    </div>
                    <span className="community-admin-chip" style={{ background: ts.bg, color: ts.color }}>{ts.label}</span>
                    <div className="community-thread-actions">
                      {thread.status !== 'pinned' && (
                        <button className="community-admin-action-btn" onClick={() => handleThreadAction(thread.id, 'pinned')} title="Pin">
                          Pin
                        </button>
                      )}
                      {thread.status === 'flagged' && (
                        <button className="community-admin-action-btn" onClick={() => handleThreadAction(thread.id, 'open')} title="Approve">
                          Approve
                        </button>
                      )}
                      {thread.status !== 'removed' && (
                        <button className="community-admin-action-btn danger" onClick={() => handleThreadAction(thread.id, 'removed')} title="Remove">
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
