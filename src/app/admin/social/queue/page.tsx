'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  PiQueueBold,
  PiMagnifyingGlassBold,
} from 'react-icons/pi'
import PlatformChip from '@/components/admin/PlatformChip'
import {
  fetchAllSocialPosts,
  deleteSocialPost,
  APPROVERS,
  type SocialMediaPost,
  type SocialPlatform,
  type SocialPostStatus,
  type ApprovalStatus,
} from '@/lib/social-api'
import { fetchAllCampaigns, type Campaign } from '@/lib/campaign-api'
import { getCookieValue } from '@/lib/cookies'
import { EmptyStateDecoration, WaveDivider } from '@/components/admin/ShapeDecoration'
import '../social-admin.css'

const ALL_PLATFORMS: SocialPlatform[] = [
  'X', 'BLUESKY', 'LINKEDIN', 'REDDIT', 'DISCORD',
  'TELEGRAM', 'THREADS', 'INSTAGRAM', 'FACEBOOK',
]

const ALL_STATUSES: SocialPostStatus[] = [
  'PENDING', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'SCHEDULED', 'DRAFT',
  'PENDING_APPROVAL', 'CHANGES_REQUESTED',
]

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  PUBLISHING: { bg: '#DBEAFE', color: '#1E40AF', label: 'Publishing' },
  PUBLISHED: { bg: '#D1FAE5', color: '#065F46', label: 'Published' },
  FAILED: { bg: '#FEE2E2', color: '#991B1B', label: 'Failed' },
  SCHEDULED: { bg: '#E0E7FF', color: '#3730A3', label: 'Scheduled' },
  DRAFT: { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  PENDING_APPROVAL: { bg: '#FEF3C7', color: '#92400E', label: 'Pending Approval' },
  CHANGES_REQUESTED: { bg: '#FEF3C7', color: '#92400E', label: 'Changes Requested' },
}

export default function QueuePage() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [deleteTarget, setDeleteTarget] = useState<SocialMediaPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [postsData, campaignsData] = await Promise.all([
        fetchAllSocialPosts(token),
        fetchAllCampaigns(token),
      ])
      setPosts(postsData)
      setCampaigns(campaignsData)
      setLoading(false)
    }
    load()
  }, [])

  const campaignMap = useMemo(() => {
    const map: Record<string, Campaign> = {}
    for (const c of campaigns) {
      map[c.id] = c
    }
    return map
  }, [campaigns])

  const filtered = useMemo(() => {
    let result = posts
    if (platformFilter !== 'ALL') {
      result = result.filter((p) => p.platform === platformFilter)
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.hashtags.some((h) => h.toLowerCase().includes(q)),
      )
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [posts, platformFilter, statusFilter, search])

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((p) => p.status === 'PUBLISHED').length,
      scheduled: posts.filter((p) => p.status === 'SCHEDULED').length,
      drafts: posts.filter((p) => p.status === 'DRAFT').length,
      pendingApproval: posts.filter((p) => p.status === 'PENDING_APPROVAL').length,
    }),
    [posts],
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteSocialPost(token, deleteTarget.id)
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    } catch {
      // silent
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function truncate(text: string, max: number) {
    if (text.length <= max) return text
    return text.slice(0, max) + '...'
  }

  if (loading) {
    return (
      <>
        <div className="social-admin-header">
          <h1>Post Queue</h1>
        </div>
        <div className="skeleton-stat-row">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-stat-card" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <div className="social-admin-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="skeleton-block w-40" />
              <div className="skeleton-chip" />
              <div className="skeleton-block w-16" />
              <div className="skeleton-chip" />
              <div className="skeleton-block w-12" />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="social-admin-header">
        <h1>Post Queue</h1>
        <div style={{ display: 'flex', gap: 'var(--af-space-palm)' }}>
          <Link href="/admin/social/new" className="social-admin-new-btn social-admin-new-btn-secondary">
            + New Post
          </Link>
          <Link href="/admin/social/composer" className="social-admin-new-btn">
            + New Campaign
          </Link>
        </div>
      </div>

      <div className="social-admin-stats">
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Total Posts</div>
          <div className="social-admin-stat-value">{stats.total}</div>
        </div>
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Published</div>
          <div className="social-admin-stat-value">{stats.published}</div>
        </div>
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Scheduled</div>
          <div className="social-admin-stat-value">{stats.scheduled}</div>
        </div>
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Drafts</div>
          <div className="social-admin-stat-value">{stats.drafts}</div>
        </div>
        <div className="social-admin-stat-card social-admin-stat-card--approval">
          <div className="social-admin-stat-label">
            Pending Approval
            {stats.pendingApproval > 0 && (
              <span className="social-admin-stat-badge">{stats.pendingApproval}</span>
            )}
          </div>
          <div className="social-admin-stat-value">{stats.pendingApproval}</div>
        </div>
      </div>

      <WaveDivider variant="terracotta" />

      <div className="social-admin-filters">
        <input
          type="text"
          className="social-admin-search"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="social-admin-select"
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
        >
          <option value="ALL">All platforms</option>
          {ALL_PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          className="social-admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyStateDecoration
          page="social"
          theme="warm"
          heading={posts.length === 0 ? 'No posts yet' : 'No posts found'}
          message={posts.length === 0 ? undefined : 'Try adjusting your search or filters.'}
        />
      ) : (
        <div className="social-admin-table-wrap">
          <table className="social-admin-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Platform</th>
                <th>Campaign</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Hashtags</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => {
                const st = STATUS_STYLES[post.status] || STATUS_STYLES.DRAFT
                const campaign = post.campaignId ? campaignMap[post.campaignId] : null
                return (
                  <tr key={post.id}>
                    <td>
                      <div className="social-admin-post-content">
                        {truncate(post.content, 80)}
                      </div>
                    </td>
                    <td>
                      <PlatformChip platform={post.platform} />
                    </td>
                    <td>
                      {campaign ? (
                        <Link
                          href={`/admin/social/campaigns/${campaign.id}`}
                          style={{
                            fontFamily: '"Instrument Sans", sans-serif',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--color-blue, #000AFF)',
                            textDecoration: 'none',
                          }}
                        >
                          {campaign.name}
                        </Link>
                      ) : (
                        <span style={{
                          fontFamily: '"Instrument Sans", sans-serif',
                          fontSize: '13px',
                          color: 'var(--color-text-gray, #6B7280)',
                        }}>
                          --
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '50px',
                          fontSize: '12px',
                          fontWeight: 600,
                          fontFamily: '"Instrument Sans", sans-serif',
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td>
                      {post.approvalStatus !== 'NONE' && (
                        <span className={`social-approval-badge social-approval-badge--${post.approvalStatus.toLowerCase().replace('_', '-')}`}>
                          {post.approvalStatus === 'PENDING' && 'Pending'}
                          {post.approvalStatus === 'APPROVED' && 'Approved'}
                          {post.approvalStatus === 'REJECTED' && 'Rejected'}
                          {post.approvalStatus === 'CHANGES_REQUESTED' && 'Changes'}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="social-admin-hashtags-cell">
                        {post.hashtags.slice(0, 3).map((h) => (
                          <span key={h} className="social-admin-hashtag-chip">
                            {h}
                          </span>
                        ))}
                        {post.hashtags.length > 3 && (
                          <span className="social-admin-hashtag-chip">
                            +{post.hashtags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(post.publishedAt || post.scheduledAt || post.createdAt)}</td>
                    <td>
                      <div className="social-admin-actions">
                        {post.status === 'PUBLISHED' ? (
                          <Link
                            href={`/admin/social/${post.id}`}
                            className="social-admin-action-btn social-admin-action-btn--view"
                          >
                            View
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/social/${post.id}`}
                            className="social-admin-action-btn"
                          >
                            Edit
                          </Link>
                        )}
                        <button
                          className="social-admin-action-btn danger"
                          onClick={() => setDeleteTarget(post)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div
          className="social-admin-dialog-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="social-admin-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete post?</h3>
            <p>
              Are you sure you want to delete this {deleteTarget.platform} post?
              This action cannot be undone.
            </p>
            <div className="social-admin-dialog-actions">
              <button
                className="social-admin-dialog-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="social-admin-dialog-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
