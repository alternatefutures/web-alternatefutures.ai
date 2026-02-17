'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchAllMessages,
  updateMessage,
  type CommunityMessage,
  type CommunityPlatform,
  type MessageType,
  type MessagePriority,
} from '@/lib/community-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import './community-admin.css'

const PLATFORM_STYLES: Record<CommunityPlatform, { bg: string; color: string; label: string }> = {
  discord: { bg: '#ECEAFF', color: '#5865F2', label: 'Discord' },
  x: { bg: '#E8F4FD', color: '#1DA1F2', label: 'X' },
  github: { bg: '#F0F0F0', color: '#24292F', label: 'GitHub' },
  bluesky: { bg: '#E8F0FE', color: '#0085FF', label: 'Bluesky' },
  mastodon: { bg: '#ECEAFF', color: '#6364FF', label: 'Mastodon' },
  reddit: { bg: '#FFF0E8', color: '#FF4500', label: 'Reddit' },
}

const TYPE_STYLES: Record<MessageType, { bg: string; color: string; label: string }> = {
  question: { bg: '#DBEAFE', color: '#1E40AF', label: 'Question' },
  feedback: { bg: '#FEF3C7', color: '#92400E', label: 'Feedback' },
  'bug-report': { bg: '#FEE2E2', color: '#991B1B', label: 'Bug Report' },
  'feature-request': { bg: '#E0E7FF', color: '#3730A3', label: 'Feature Request' },
  praise: { bg: '#D1FAE5', color: '#065F46', label: 'Praise' },
  general: { bg: '#F3F4F6', color: '#6B7280', label: 'General' },
}

const PRIORITY_STYLES: Record<MessagePriority, { bg: string; color: string; label: string }> = {
  critical: { bg: '#FEE2E2', color: '#991B1B', label: 'Critical' },
  high: { bg: '#FFEDD5', color: '#C2410C', label: 'High' },
  medium: { bg: '#FEF3C7', color: '#92400E', label: 'Medium' },
  low: { bg: '#F3F4F6', color: '#6B7280', label: 'Low' },
}

export default function CommunityInboxPage() {
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [respondedFilter, setRespondedFilter] = useState('ALL')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const data = await fetchAllMessages(token)
        setMessages(data)
      } catch {
        setLoadError('Failed to load messages. Please refresh to try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = messages
    if (platformFilter !== 'ALL') {
      result = result.filter((m) => m.platform === platformFilter)
    }
    if (typeFilter !== 'ALL') {
      result = result.filter((m) => m.messageType === typeFilter)
    }
    if (priorityFilter !== 'ALL') {
      result = result.filter((m) => m.priority === priorityFilter)
    }
    if (respondedFilter !== 'ALL') {
      const responded = respondedFilter === 'responded'
      result = result.filter((m) => m.responded === responded)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          m.authorName.toLowerCase().includes(q),
      )
    }
    return result.sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    )
  }, [messages, platformFilter, typeFilter, priorityFilter, respondedFilter, search])

  const stats = useMemo(
    () => ({
      total: messages.length,
      unanswered: messages.filter((m) => !m.responded).length,
      critical: messages.filter((m) => m.priority === 'critical').length,
      questions: messages.filter((m) => m.messageType === 'question').length,
    }),
    [messages],
  )

  const handleMarkResponded = useCallback(async (id: string) => {
    try {
      const token = getCookieValue('af_access_token')
      await updateMessage(token, id, { responded: true, responseId: `resp-${Date.now()}` })
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, responded: true, responseId: `resp-${Date.now()}` } : m,
        ),
      )
    } catch {
      setLoadError('Failed to update message.')
    }
  }, [])

  if (loading) {
    return <div className="community-admin-empty"><p>Loading messages...</p></div>
  }

  if (loadError) {
    return (
      <div className="community-admin-empty">
        <h2>Error</h2>
        <p>{loadError}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 12 }}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="community-admin-header">
        <h1>Community Inbox</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/admin/community/dashboard" className="community-admin-action-btn">Growth</Link>
          <Link href="/admin/community/events" className="community-admin-action-btn">Events</Link>
          <Link href="/admin/community/forums" className="community-admin-action-btn">Forums</Link>
          <Link href="/admin/community/engagement" className="community-admin-action-btn">Engagement</Link>
          <Link href="/admin/community/members" className="community-admin-action-btn">Members</Link>
        </div>
      </div>

      <div className="community-admin-stats">
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Total Messages</div>
          <div className="community-admin-stat-value">{stats.total}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Unanswered</div>
          <div className="community-admin-stat-value">{stats.unanswered}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Critical</div>
          <div className="community-admin-stat-value">{stats.critical}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Questions</div>
          <div className="community-admin-stat-value">{stats.questions}</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <div className="community-admin-filters">
        <input
          type="text"
          className="community-admin-search"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="community-admin-select"
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
        >
          <option value="ALL">All platforms</option>
          <option value="discord">Discord</option>
          <option value="x">X</option>
          <option value="github">GitHub</option>
          <option value="bluesky">Bluesky</option>
          <option value="mastodon">Mastodon</option>
          <option value="reddit">Reddit</option>
        </select>
        <select
          className="community-admin-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All types</option>
          <option value="question">Question</option>
          <option value="feedback">Feedback</option>
          <option value="bug-report">Bug Report</option>
          <option value="feature-request">Feature Request</option>
          <option value="praise">Praise</option>
          <option value="general">General</option>
        </select>
        <select
          className="community-admin-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          className="community-admin-select"
          value={respondedFilter}
          onChange={(e) => setRespondedFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="unanswered">Unanswered</option>
          <option value="responded">Responded</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="community-admin-empty">
          <h2>{messages.length === 0 ? 'No messages yet' : 'No messages found'}</h2>
          <p>{messages.length === 0 ? 'Messages from your community will appear here.' : 'Try adjusting your search or filters.'}</p>
        </div>
      ) : (
        <div className="community-admin-message-list">
          {filtered.map((msg) => {
            const ps = PLATFORM_STYLES[msg.platform]
            const ts = TYPE_STYLES[msg.messageType]
            const pr = PRIORITY_STYLES[msg.priority]
            return (
              <div
                key={msg.id}
                className={`community-admin-message-card${!msg.responded ? ' unresponded' : ''}${msg.priority === 'critical' ? ' critical' : ''}`}
              >
                <div className="community-admin-message-body">
                  <div className="community-admin-message-meta">
                    <span className="community-admin-author">{msg.authorName}</span>
                    <span className="community-admin-chip" style={{ background: ps.bg, color: ps.color }}>{ps.label}</span>
                    <span className="community-admin-time">{formatTimeAgo(msg.receivedAt)}</span>
                  </div>
                  <div className="community-admin-message-content">{msg.content}</div>
                  <div className="community-admin-message-chips">
                    <span className="community-admin-chip" style={{ background: ts.bg, color: ts.color }}>{ts.label}</span>
                    <span className="community-admin-chip" style={{ background: pr.bg, color: pr.color }}>{pr.label}</span>
                    {msg.sentiment === 'negative' && (
                      <span className="community-admin-chip" style={{ background: '#FEE2E2', color: '#991B1B' }}>Negative</span>
                    )}
                    {msg.sentiment === 'positive' && (
                      <span className="community-admin-chip" style={{ background: '#D1FAE5', color: '#065F46' }}>Positive</span>
                    )}
                    {msg.sourceUrl && (
                      <a href={msg.sourceUrl} target="_blank" rel="noopener noreferrer" className="community-admin-source-link">
                        View source
                      </a>
                    )}
                  </div>
                </div>
                <div className="community-admin-message-actions">
                  {msg.responded ? (
                    <span className="community-admin-action-btn responded">Responded</span>
                  ) : (
                    <button
                      className="community-admin-action-btn"
                      onClick={() => handleMarkResponded(msg.id)}
                    >
                      Mark Responded
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
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
