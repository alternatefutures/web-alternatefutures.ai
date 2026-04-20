'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PiShieldCheckBold } from 'react-icons/pi'
import PlatformChip from '@/components/admin/PlatformChip'
import {
  fetchPendingApprovals,
  respondToApproval,
  APPROVERS,
  type SocialMediaPost,
  type ApprovalActionInput,
} from '@/lib/social-api'
import { fetchTeamMembers, type TeamMember } from '@/lib/team-api'
import { getCookieValue } from '@/lib/cookies'
import '../team-settings.css'

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

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  return text.slice(0, max) + '...'
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<SocialMediaPost[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [actionTarget, setActionTarget] = useState<SocialMediaPost | null>(null)
  const [actionType, setActionType] = useState<ApprovalActionInput['action'] | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'CHANGES_REQUESTED'>('all')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [approvalsData, membersData] = await Promise.all([
        fetchPendingApprovals(token),
        fetchTeamMembers(token),
      ])
      setApprovals(approvalsData)
      setMembers(membersData)
      setLoading(false)
    }
    load()
  }, [])

  const handleAction = useCallback(async () => {
    if (!actionTarget || !actionType) return
    setSubmitting(true)
    try {
      const token = getCookieValue('af_access_token')
      const updated = await respondToApproval(token, actionTarget.id, {
        action: actionType,
        feedback: feedback.trim() || undefined,
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
    }
  }, [actionTarget, actionType, feedback])

  const openAction = useCallback((post: SocialMediaPost, action: ApprovalActionInput['action']) => {
    setActionTarget(post)
    setActionType(action)
    setFeedback('')
  }, [])

  const getReviewerName = (id: string | null) => {
    if (!id) return null
    const member = members.find((m) => m.agentId === id)
    if (member) return { name: member.name, role: member.role }
    const approver = APPROVERS.find((a) => a.id === id)
    if (approver) return { name: approver.name, role: approver.role }
    return null
  }

  const filteredApprovals = filterStatus === 'all'
    ? approvals
    : approvals.filter((p) => p.approvalStatus === filterStatus)

  const pendingCount = approvals.filter((p) => p.approvalStatus === 'PENDING').length
  const changesCount = approvals.filter((p) => p.approvalStatus === 'CHANGES_REQUESTED').length

  return (
    <>
      <div className="team-admin-header">
        <div>
          <h1>Approval Queue</h1>
          <p className="team-admin-subtitle">
            Review and approve pending content across all platforms.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="team-admin-stats">
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Total Pending</div>
          <div className="team-admin-stat-value">{approvals.length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Awaiting Review</div>
          <div className="team-admin-stat-value">{pendingCount}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Changes Requested</div>
          <div className="team-admin-stat-value">{changesCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="team-filters">
        <select
          className="team-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
        >
          <option value="all">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CHANGES_REQUESTED">Changes Requested</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="team-admin-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="team-skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="team-skeleton-block w-32" />
              <div className="team-skeleton-block w-24" />
              <div className="team-skeleton-block w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filteredApprovals.length === 0 && (
        <div className="team-admin-empty">
          <div className="team-admin-empty-icon">
            <PiShieldCheckBold />
          </div>
          <h2>All caught up</h2>
          <p>No posts waiting for approval.</p>
        </div>
      )}

      {/* Queue cards */}
      {!loading && filteredApprovals.length > 0 && (
        <div className="team-queue-list">
          {filteredApprovals.map((post) => {
            const reviewer = getReviewerName(post.requestedApprovalFrom)
            return (
              <div key={post.id} className="team-queue-card">
                <div className="team-queue-card-header">
                  <PlatformChip platform={post.platform} />
                  <span className={`team-approval-badge ${post.approvalStatus.toLowerCase().replace('_', '-')}`}>
                    {post.approvalStatus === 'PENDING' ? 'Pending' : 'Changes Requested'}
                  </span>
                  <span className="team-queue-card-date">
                    {formatDate(post.approvalRequestedAt)}
                  </span>
                </div>

                <p className="team-queue-card-content">{truncate(post.content, 200)}</p>

                {post.approvalNote && (
                  <div className="team-queue-card-note">
                    <strong>Note:</strong> {post.approvalNote}
                  </div>
                )}

                {post.approvalFeedback && (
                  <div className="team-queue-card-note" style={{ borderLeftColor: 'var(--af-signal-wait)' }}>
                    <strong style={{ color: 'var(--af-signal-wait)' }}>Previous feedback:</strong> {post.approvalFeedback}
                  </div>
                )}

                {reviewer && (
                  <p className="team-queue-card-reviewer">
                    Requested reviewer: {reviewer.name} ({reviewer.role})
                  </p>
                )}

                <div className="team-queue-card-actions">
                  <button
                    type="button"
                    className="team-approval-action-btn approve"
                    onClick={() => openAction(post, 'APPROVE')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="team-approval-action-btn changes"
                    onClick={() => openAction(post, 'REQUEST_CHANGES')}
                  >
                    Request Changes
                  </button>
                  <button
                    type="button"
                    className="team-approval-action-btn reject"
                    onClick={() => openAction(post, 'REJECT')}
                  >
                    Reject
                  </button>
                  <Link
                    href={`/admin/social/${post.id}`}
                    className="team-action-btn"
                    style={{ marginLeft: 'auto' }}
                  >
                    View Post
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Action dialog */}
      {actionTarget && actionType && (
        <div
          className="team-admin-dialog-overlay"
          onClick={() => { setActionTarget(null); setActionType(null) }}
        >
          <div
            className="team-admin-dialog"
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

            <div className="team-form-group">
              <label className="team-form-label">
                Feedback {actionType === 'APPROVE' ? '(optional)' : ''}
              </label>
              <textarea
                className="team-form-textarea"
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

            <div className="team-admin-dialog-actions">
              <button
                type="button"
                className="team-admin-dialog-cancel"
                onClick={() => { setActionTarget(null); setActionType(null) }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`team-approval-action-btn ${actionType === 'APPROVE' ? 'approve' : actionType === 'REQUEST_CHANGES' ? 'changes' : 'reject'}`}
                onClick={handleAction}
                disabled={submitting || (actionType === 'REQUEST_CHANGES' && !feedback.trim())}
              >
                {submitting
                  ? 'Submitting...'
                  : actionType === 'APPROVE'
                    ? 'Approve'
                    : actionType === 'REQUEST_CHANGES'
                      ? 'Request Changes'
                      : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
