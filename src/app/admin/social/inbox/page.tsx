'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PiTrayBold, PiCheckCircleBold, PiChatTextBold, PiAtBold, PiArrowBendUpLeftBold, PiArchiveBold } from 'react-icons/pi'
import PlatformChip from '@/components/admin/PlatformChip'
import {
  fetchPendingApprovals,
  fetchAllSocialPosts,
  respondToApproval,
  APPROVERS,
  type SocialMediaPost,
  type SocialPlatform,
  type ApprovalActionInput,
} from '@/lib/social-api'
import {
  addDecision,
  ALL_FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
  type ApprovalAction,
} from '@/lib/approval-analytics-api'
import { getCookieValue } from '@/lib/cookies'
import '../social-admin.css'

// ---------------------------------------------------------------------------
// Types for inbox messages
// ---------------------------------------------------------------------------

type InboxTab = 'messages' | 'approvals'
type MessageType = 'mention' | 'reply' | 'dm'

interface InboxMessage {
  id: string
  type: MessageType
  platform: SocialPlatform
  from: string
  content: string
  postId: string | null
  postPreview: string | null
  timestamp: string
  read: boolean
}

// ---------------------------------------------------------------------------
// Seed messages for development
// ---------------------------------------------------------------------------

const SEED_MESSAGES: InboxMessage[] = [
  {
    id: 'msg-1',
    type: 'mention',
    platform: 'X',
    from: '@vitalik.eth',
    content: 'Interesting approach to decentralized hosting. How does @AlternateFutures handle data persistence across IPFS pinning providers?',
    postId: 'seed-social-1',
    postPreview: 'Introducing Alternate Futures -- the decentralized cloud...',
    timestamp: '2026-02-10T14:23:00Z',
    read: false,
  },
  {
    id: 'msg-2',
    type: 'reply',
    platform: 'LINKEDIN',
    from: 'Sarah Chen',
    content: 'Great post! We have been evaluating decentralized hosting for our startup. Would love to learn more about the pricing model compared to AWS.',
    postId: 'seed-social-2',
    postPreview: 'Excited to announce Alternate Futures...',
    timestamp: '2026-02-09T11:45:00Z',
    read: false,
  },
  {
    id: 'msg-3',
    type: 'dm',
    platform: 'X',
    from: '@web3builder',
    content: 'Hey, are you accepting beta testers? Our team builds AI agents and we need reliable decentralized infra.',
    postId: null,
    postPreview: null,
    timestamp: '2026-02-09T09:12:00Z',
    read: true,
  },
  {
    id: 'msg-4',
    type: 'mention',
    platform: 'BLUESKY',
    from: '@depin.dev',
    content: 'The DePIN space is heating up. @alternatefutures just shipped deploy guides for Next.js, React, and Astro. Competition for the incumbent clouds is real.',
    postId: 'seed-social-5',
    postPreview: 'Hey everyone! We just shipped a new batch...',
    timestamp: '2026-02-08T18:30:00Z',
    read: true,
  },
  {
    id: 'msg-5',
    type: 'reply',
    platform: 'DISCORD',
    from: 'nodejskid',
    content: 'Just tried the Astro deploy guide. Worked perfectly. One question though - can I set up custom domains with SSL?',
    postId: 'seed-social-5',
    postPreview: 'Hey everyone! We just shipped a new batch...',
    timestamp: '2026-02-08T17:15:00Z',
    read: true,
  },
  {
    id: 'msg-6',
    type: 'dm',
    platform: 'LINKEDIN',
    from: 'Marcus Rivera',
    content: 'We\'re organizing a Web3 infrastructure panel at ETHDenver. Would love to have someone from AF on stage to discuss decentralized hosting.',
    postId: null,
    postPreview: null,
    timestamp: '2026-02-07T15:00:00Z',
    read: true,
  },
]

function useSeedData(): boolean {
  return typeof process !== 'undefined' && (
    process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string | null) {
  if (!iso) return '--'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function relativeTime(iso: string): string {
  const now = new Date()
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(iso)
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  return text.slice(0, max) + '...'
}

const MESSAGE_TYPE_LABELS: Record<MessageType, { label: string; icon: React.ReactNode }> = {
  mention: { label: 'Mention', icon: <PiAtBold /> },
  reply: { label: 'Reply', icon: <PiArrowBendUpLeftBold /> },
  dm: { label: 'DM', icon: <PiChatTextBold /> },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InboxPage() {
  const router = useRouter()
  const [tab, setTab] = useState<InboxTab>('messages')
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [approvals, setApprovals] = useState<SocialMediaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [msgFilter, setMsgFilter] = useState<'all' | MessageType>('all')
  const [selectedMsg, setSelectedMsg] = useState<InboxMessage | null>(null)

  // Approval state
  const [actionTarget, setActionTarget] = useState<SocialMediaPost | null>(null)
  const [actionType, setActionType] = useState<ApprovalActionInput['action'] | null>(null)
  const [feedback, setFeedback] = useState('')
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory | ''>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [approvalsData] = await Promise.all([
        fetchPendingApprovals(token),
      ])
      setApprovals(approvalsData)

      // Load messages — seed data in dev, empty in prod until social accounts connected
      if (useSeedData()) {
        setMessages(SEED_MESSAGES)
      }

      setLoading(false)
    }
    load()
  }, [])

  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages])

  const filteredMessages = useMemo(() => {
    if (msgFilter === 'all') return messages
    return messages.filter((m) => m.type === msgFilter)
  }, [messages, msgFilter])

  const markAsRead = useCallback((msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => m.id === msgId ? { ...m, read: true } : m),
    )
  }, [])

  const handleSelectMessage = useCallback((msg: InboxMessage) => {
    setSelectedMsg(msg)
    if (!msg.read) markAsRead(msg.id)
  }, [markAsRead])

  const handleAction = useCallback(async () => {
    if (!actionTarget || !actionType) return
    setSubmitting(true)
    try {
      const token = getCookieValue('af_access_token')
      const updated = await respondToApproval(token, actionTarget.id, {
        action: actionType,
        feedback: feedback.trim() || undefined,
      })

      // Log decision to approval analytics
      const analyticsAction: ApprovalAction = actionType === 'REQUEST_CHANGES' ? 'CHANGES_REQUESTED' : actionType
      addDecision({
        id: `ad-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        postId: actionTarget.id,
        action: analyticsAction,
        reviewer: actionTarget.requestedApprovalFrom || 'unknown',
        timestamp: new Date().toISOString(),
        feedback: feedback.trim() || null,
        feedbackCategory: feedbackCategory || null,
        contentType: 'social',
        platform: actionTarget.platform,
        model_used: 'llama-3.3-70b',
        tone: 'professional',
        wordCount: actionTarget.content.split(/\s+/).length,
      })

      setApprovals((prev) =>
        actionType === 'APPROVE' || actionType === 'REJECT'
          ? prev.filter((p) => p.id !== actionTarget.id)
          : prev.map((p) => (p.id === actionTarget.id ? updated : p)),
      )
    } catch {
      // silent
    } finally {
      setSubmitting(false)
      setActionTarget(null)
      setActionType(null)
      setFeedback('')
      setFeedbackCategory('')
    }
  }, [actionTarget, actionType, feedback, feedbackCategory])

  const openAction = useCallback((post: SocialMediaPost, action: ApprovalActionInput['action']) => {
    setActionTarget(post)
    setActionType(action)
    setFeedback('')
    setFeedbackCategory('')
  }, [])

  const handleReply = useCallback((msg: InboxMessage) => {
    const replyPrefix = msg.type === 'dm' ? '' : `@${msg.from.replace('@', '')} `
    const params = new URLSearchParams({
      platform: msg.platform,
      content: replyPrefix,
      replyTo: msg.id,
    })
    router.push(`/admin/social/new?${params.toString()}`)
  }, [router])

  const handleArchive = useCallback((msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId))
    if (selectedMsg?.id === msgId) setSelectedMsg(null)
  }, [selectedMsg])

  return (
    <>
      <div className="social-admin-header">
        <h1>Inbox</h1>
      </div>

      <div className="social-inbox-tabs">
        <button
          type="button"
          className={`social-inbox-tab${tab === 'messages' ? ' active' : ''}`}
          onClick={() => setTab('messages')}
        >
          Messages
          {unreadCount > 0 && (
            <span className="social-inbox-tab-badge">{unreadCount}</span>
          )}
        </button>
        <button
          type="button"
          className={`social-inbox-tab${tab === 'approvals' ? ' active' : ''}`}
          onClick={() => setTab('approvals')}
        >
          Approvals
          {approvals.length > 0 && (
            <span className="social-inbox-tab-badge">{approvals.length}</span>
          )}
        </button>
      </div>

      {/* ============================================= */}
      {/* Messages Tab                                  */}
      {/* ============================================= */}

      {tab === 'messages' && loading && (
        <div className="social-admin-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="skeleton-chip" />
              <div className="skeleton-block w-40" />
              <div className="skeleton-block w-20" />
            </div>
          ))}
        </div>
      )}

      {tab === 'messages' && !loading && messages.length === 0 && (
        <div className="social-admin-empty">
          <div className="social-admin-empty-icon">
            <PiTrayBold />
          </div>
          <h2>No messages yet</h2>
          <p>
            Mentions, replies, and DMs from connected social accounts will appear here.
            Connect your accounts in Settings to get started.
          </p>
        </div>
      )}

      {tab === 'messages' && !loading && messages.length > 0 && (
        <>
          {/* Message filters */}
          <div className="social-admin-filters" style={{ marginBottom: 'var(--af-space-hand)' }}>
            {(['all', 'mention', 'reply', 'dm'] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`social-inbox-filter-btn${msgFilter === f ? ' active' : ''}`}
                onClick={() => setMsgFilter(f)}
              >
                {f === 'all' ? 'All' : MESSAGE_TYPE_LABELS[f].label + 's'}
                {f !== 'all' && (
                  <span className="social-inbox-filter-count">
                    {messages.filter((m) => m.type === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="inbox-message-layout">
            {/* Message list */}
            <div className="inbox-message-list">
              {filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  type="button"
                  className={`inbox-message-card${!msg.read ? ' unread' : ''}${selectedMsg?.id === msg.id ? ' selected' : ''}`}
                  onClick={() => handleSelectMessage(msg)}
                >
                  <div className="inbox-message-card-header">
                    <PlatformChip platform={msg.platform} />
                    <span className="inbox-message-type-chip">
                      {MESSAGE_TYPE_LABELS[msg.type].icon}
                      {MESSAGE_TYPE_LABELS[msg.type].label}
                    </span>
                    <span className="inbox-message-time">{relativeTime(msg.timestamp)}</span>
                  </div>
                  <div className="inbox-message-from">{msg.from}</div>
                  <p className="inbox-message-preview">{truncate(msg.content, 120)}</p>
                  {!msg.read && <span className="inbox-message-unread-dot" />}
                </button>
              ))}
            </div>

            {/* Message detail panel */}
            <div className="inbox-message-detail">
              {!selectedMsg ? (
                <div className="inbox-message-detail-empty">
                  <PiChatTextBold style={{ fontSize: 32, color: 'var(--af-stone-300)' }} />
                  <p>Select a message to view details</p>
                </div>
              ) : (
                <>
                  <div className="inbox-detail-header">
                    <div className="inbox-detail-header-row">
                      <PlatformChip platform={selectedMsg.platform} />
                      <span className="inbox-message-type-chip">
                        {MESSAGE_TYPE_LABELS[selectedMsg.type].icon}
                        {MESSAGE_TYPE_LABELS[selectedMsg.type].label}
                      </span>
                    </div>
                    <span className="inbox-detail-time">{formatDate(selectedMsg.timestamp)}</span>
                  </div>
                  <div className="inbox-detail-from">
                    <span className="inbox-detail-from-label">From</span>
                    <span className="inbox-detail-from-value">{selectedMsg.from}</span>
                  </div>
                  <div className="inbox-detail-content">
                    {selectedMsg.content}
                  </div>
                  {selectedMsg.postId && selectedMsg.postPreview && (
                    <div className="inbox-detail-post-ref">
                      <span className="inbox-detail-post-ref-label">In reply to</span>
                      <p className="inbox-detail-post-ref-preview">{truncate(selectedMsg.postPreview, 200)}</p>
                      <Link
                        href={`/admin/social/${selectedMsg.postId}`}
                        className="inbox-detail-post-link"
                      >
                        View original post
                      </Link>
                    </div>
                  )}
                  <div className="inbox-detail-actions">
                    <button
                      type="button"
                      className="social-admin-action-btn"
                      onClick={() => handleReply(selectedMsg)}
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      className="social-admin-action-btn"
                      onClick={() => handleArchive(selectedMsg.id)}
                    >
                      <PiArchiveBold style={{ marginRight: 4 }} />
                      Archive
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ============================================= */}
      {/* Approvals Tab                                 */}
      {/* ============================================= */}

      {tab === 'approvals' && loading && (
        <div className="social-admin-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="skeleton-block w-40" />
              <div className="skeleton-chip" />
              <div className="skeleton-block w-20" />
              <div className="skeleton-block w-16" />
            </div>
          ))}
        </div>
      )}

      {tab === 'approvals' && !loading && approvals.length === 0 && (
        <div className="social-admin-empty">
          <div className="social-admin-empty-icon">
            <PiCheckCircleBold />
          </div>
          <h2>All caught up</h2>
          <p>No posts waiting for approval.</p>
        </div>
      )}

      {tab === 'approvals' && !loading && approvals.length > 0 && (
        <div className="social-approval-list">
          {approvals.map((post) => {
            const approver = APPROVERS.find((a) => a.id === post.requestedApprovalFrom)
            return (
              <div key={post.id} className="social-approval-card">
                <div className="social-approval-card-header">
                  <PlatformChip platform={post.platform} />
                  <span className={`social-approval-badge social-approval-badge--${post.approvalStatus.toLowerCase().replace('_', '-')}`}>
                    {post.approvalStatus === 'PENDING' ? 'Pending' : 'Changes Requested'}
                  </span>
                  <span className="social-approval-card-date">
                    {formatDate(post.approvalRequestedAt)}
                  </span>
                </div>

                <p className="social-approval-card-content">{truncate(post.content, 200)}</p>

                {post.approvalNote && (
                  <div className="social-approval-note">
                    <span className="social-approval-note-label">Note:</span> {post.approvalNote}
                  </div>
                )}

                {post.approvalFeedback && (
                  <div className="social-approval-feedback" style={{ marginTop: 'var(--af-space-breath)' }}>
                    <p className="social-approval-feedback-label">Previous feedback</p>
                    <p className="social-approval-feedback-text">{post.approvalFeedback}</p>
                  </div>
                )}

                {approver && (
                  <p className="social-approval-card-reviewer">
                    Requested reviewer: {approver.name} ({approver.role})
                  </p>
                )}

                <div className="social-approval-card-actions">
                  <button
                    type="button"
                    className="social-approval-action-btn approve"
                    onClick={() => openAction(post, 'APPROVE')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="social-approval-action-btn changes"
                    onClick={() => openAction(post, 'REQUEST_CHANGES')}
                  >
                    Request Changes
                  </button>
                  <button
                    type="button"
                    className="social-approval-action-btn reject"
                    onClick={() => openAction(post, 'REJECT')}
                  >
                    Reject
                  </button>
                  <Link
                    href={`/admin/social/${post.id}`}
                    className="social-admin-action-btn"
                  >
                    View
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Approval action dialog */}
      {actionTarget && actionType && (
        <div
          className="social-admin-dialog-overlay"
          onClick={() => { setActionTarget(null); setActionType(null) }}
        >
          <div
            className="social-admin-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {actionType === 'APPROVE' && 'Approve Post'}
              {actionType === 'REQUEST_CHANGES' && 'Request Changes'}
              {actionType === 'REJECT' && 'Reject Post'}
            </h3>
            <p>
              {actionType === 'APPROVE' && 'This will move the post to Scheduled status.'}
              {actionType === 'REQUEST_CHANGES' && 'The author will be notified to revise the content.'}
              {actionType === 'REJECT' && 'This will move the post back to Draft and clear the approval request.'}
            </p>

            <div style={{ marginBottom: 'var(--af-space-hand)' }}>
              <label className="social-transform-label">
                Feedback {actionType === 'APPROVE' ? '(optional)' : ''}
              </label>
              <textarea
                className="social-composer-textarea"
                placeholder={
                  actionType === 'APPROVE'
                    ? 'Any notes for the author...'
                    : 'Describe what needs to change...'
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>

            {actionType !== 'APPROVE' && (
              <div style={{ marginBottom: 'var(--af-space-hand)' }}>
                <label className="social-transform-label">Feedback Category</label>
                <select
                  className="social-admin-select approval-category-select"
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value as FeedbackCategory | '')}
                >
                  <option value="">-- Select a category --</option>
                  {ALL_FEEDBACK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{FEEDBACK_CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="social-admin-dialog-actions">
              <button
                className="social-admin-dialog-cancel"
                onClick={() => { setActionTarget(null); setActionType(null) }}
              >
                Cancel
              </button>
              <button
                className={`social-approval-action-btn ${actionType === 'APPROVE' ? 'approve' : actionType === 'REQUEST_CHANGES' ? 'changes' : 'reject'}`}
                onClick={handleAction}
                disabled={submitting || (actionType === 'REQUEST_CHANGES' && !feedback.trim())}
              >
                {submitting ? 'Submitting...' : actionType === 'APPROVE' ? 'Approve' : actionType === 'REQUEST_CHANGES' ? 'Request Changes' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
