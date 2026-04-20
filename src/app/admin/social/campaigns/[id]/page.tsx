'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import PlatformChip from '@/components/admin/PlatformChip'
import {
  fetchCampaignById,
  updateCampaign,
  deleteCampaign,
  CAMPAIGN_STATUS_STYLES,
  type Campaign,
  type CampaignStatus,
} from '@/lib/campaign-api'
import {
  fetchAllSocialPosts,
  publishSocialPost,
  deleteSocialPost,
  type SocialMediaPost,
} from '@/lib/social-api'
import '../campaigns.css'
import { getCookieValue } from '@/lib/cookies'
import '../../social-admin.css'

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  PUBLISHING: { bg: '#DBEAFE', color: '#1E40AF', label: 'Publishing' },
  PUBLISHED: { bg: '#D1FAE5', color: '#065F46', label: 'Published' },
  FAILED: { bg: '#FEE2E2', color: '#991B1B', label: 'Failed' },
  SCHEDULED: { bg: '#E0E7FF', color: '#3730A3', label: 'Scheduled' },
  DRAFT: { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
}

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const campaignId = params.id

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [posts, setPosts] = useState<SocialMediaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [campaignData, allPosts] = await Promise.all([
        fetchCampaignById(token, campaignId),
        fetchAllSocialPosts(token),
      ])
      setCampaign(campaignData)
      if (campaignData) {
        setPosts(allPosts.filter((p) => campaignData.postIds.includes(p.id)))
      }
      setLoading(false)
    }
    load()
  }, [campaignId])

  const stats = useMemo(() => {
    const total = posts.length
    const published = posts.filter((p) => p.status === 'PUBLISHED').length
    const scheduled = posts.filter((p) => p.status === 'SCHEDULED').length
    const drafts = posts.filter((p) => p.status === 'DRAFT').length
    const failed = posts.filter((p) => p.status === 'FAILED').length
    return { total, published, scheduled, drafts, failed }
  }, [posts])

  const progress = stats.total > 0 ? (stats.published / stats.total) * 100 : 0

  const handlePublishPost = useCallback(async (postId: string) => {
    try {
      const token = getCookieValue('af_access_token')
      const updated = await publishSocialPost(token, postId)
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)))
    } catch {
      // silent
    }
  }, [])

  const handleDeleteCampaign = useCallback(async () => {
    if (!campaign) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteCampaign(token, campaign.id)
      router.push('/admin/social/campaigns')
    } catch {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }, [campaign, router])

  function formatDate(iso: string | null) {
    if (!iso) return '--'
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return <div className="campaigns-empty"><p>Loading campaign...</p></div>
  }

  if (!campaign) {
    return (
      <div className="campaigns-empty">
        <h2>Campaign not found</h2>
        <p>
          <Link href="/admin/social/campaigns" className="campaign-detail-back">
            &larr; Back to campaigns
          </Link>
        </p>
      </div>
    )
  }

  const st = CAMPAIGN_STATUS_STYLES[campaign.status]

  return (
    <>
      <div className="campaign-detail-header">
        <div>
          <Link href="/admin/social/campaigns" className="campaign-detail-back">
            &larr; Back to campaigns
          </Link>
          <h1>{campaign.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/admin/social/composer" className="social-admin-new-btn" style={{ fontSize: '13px', padding: '8px 16px' }}>
            Resume Wizard
          </Link>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: '"Instrument Sans", sans-serif',
            background: st.bg,
            color: st.color,
          }}>
            {st.label}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '6px',
          fontFamily: '"Instrument Sans", sans-serif',
          fontSize: '13px',
          color: 'var(--color-text-gray, #6B7280)',
        }}>
          <span>{stats.published} of {stats.total} published</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="campaign-progress-bar" style={{ height: '6px' }}>
          <div
            className="campaign-progress-fill"
            style={{
              width: `${progress}%`,
              background: progress === 100 ? '#10B981' : 'var(--color-blue, #000AFF)',
            }}
          />
        </div>
      </div>

      <div className="campaign-detail-layout">
        {/* Posts list */}
        <div className="campaign-detail-posts">
          <h2 style={{
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-text-dark, #1F2937)',
            margin: '0 0 12px',
          }}>
            Posts ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="campaigns-empty" style={{ padding: '40px 20px' }}>
              <p>No posts in this campaign yet.</p>
            </div>
          ) : (
            posts.map((post) => {
              const postSt = STATUS_STYLES[post.status] || STATUS_STYLES.DRAFT
              return (
                <div key={post.id} className="campaign-post-card">
                  <div className="campaign-post-header">
                    <PlatformChip platform={post.platform} />
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '50px',
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: '"Instrument Sans", sans-serif',
                      background: postSt.bg,
                      color: postSt.color,
                    }}>
                      {postSt.label}
                    </span>
                    {post.scheduledAt && post.status === 'SCHEDULED' && (
                      <span style={{
                        fontSize: '12px',
                        fontFamily: '"Instrument Sans", sans-serif',
                        color: '#3730A3',
                        marginLeft: 'auto',
                      }}>
                        {formatDate(post.scheduledAt)}
                      </span>
                    )}
                  </div>
                  <div className="campaign-post-content">{post.content}</div>
                  <div className="campaign-post-actions">
                    <Link
                      href={`/admin/social/${post.id}`}
                      className={`social-admin-action-btn${post.status === 'PUBLISHED' ? ' social-admin-action-btn--view' : ''}`}
                    >
                      {post.status === 'PUBLISHED' ? 'View' : 'Edit'}
                    </Link>
                    {post.status !== 'PUBLISHED' && post.status !== 'PUBLISHING' && (
                      <button
                        className="social-admin-action-btn"
                        style={{ borderColor: '#10B981', color: '#10B981' }}
                        onClick={() => handlePublishPost(post.id)}
                      >
                        Publish
                      </button>
                    )}
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-admin-action-btn"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Sidebar */}
        <div className="campaign-detail-sidebar">
          <div className="campaign-detail-sidebar-card">
            <h3>Details</h3>
            {campaign.description && (
              <p style={{
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: '13px',
                color: 'var(--color-text-dark, #1F2937)',
                lineHeight: 1.5,
                margin: '0 0 12px',
              }}>
                {campaign.description}
              </p>
            )}
            <div className="campaign-detail-meta-row">
              <span className="campaign-detail-meta-label">Source Type</span>
              <span className="campaign-detail-meta-value">{campaign.sourceType}</span>
            </div>
            <div className="campaign-detail-meta-row">
              <span className="campaign-detail-meta-label">Tone</span>
              <span className="campaign-detail-meta-value" style={{ textTransform: 'capitalize' }}>{campaign.tone}</span>
            </div>
            <div className="campaign-detail-meta-row">
              <span className="campaign-detail-meta-label">Created</span>
              <span className="campaign-detail-meta-value">{formatDate(campaign.createdAt)}</span>
            </div>
          </div>

          <div className="campaign-detail-sidebar-card">
            <h3>Stats</h3>
            <div className="campaign-detail-meta-row">
              <span className="campaign-detail-meta-label">Total</span>
              <span className="campaign-detail-meta-value">{stats.total}</span>
            </div>
            <div className="campaign-detail-meta-row">
              <span className="campaign-detail-meta-label">Published</span>
              <span className="campaign-detail-meta-value" style={{ color: '#10B981' }}>{stats.published}</span>
            </div>
            <div className="campaign-detail-meta-row">
              <span className="campaign-detail-meta-label">Scheduled</span>
              <span className="campaign-detail-meta-value" style={{ color: '#3730A3' }}>{stats.scheduled}</span>
            </div>
            <div className="campaign-detail-meta-row">
              <span className="campaign-detail-meta-label">Drafts</span>
              <span className="campaign-detail-meta-value">{stats.drafts}</span>
            </div>
            {stats.failed > 0 && (
              <div className="campaign-detail-meta-row">
                <span className="campaign-detail-meta-label">Failed</span>
                <span className="campaign-detail-meta-value" style={{ color: '#EF4444' }}>{stats.failed}</span>
              </div>
            )}
          </div>

          {campaign.hashtags.length > 0 && (
            <div className="campaign-detail-sidebar-card">
              <h3>Hashtags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {campaign.hashtags.map((h) => (
                  <span key={h} className="social-admin-hashtag-chip">{h}</span>
                ))}
              </div>
            </div>
          )}

          {(campaign.utmSource || campaign.utmMedium || campaign.utmCampaign) && (
            <div className="campaign-detail-sidebar-card">
              <h3>UTM</h3>
              {campaign.utmSource && (
                <div className="campaign-detail-meta-row">
                  <span className="campaign-detail-meta-label">Source</span>
                  <span className="campaign-detail-meta-value">{campaign.utmSource}</span>
                </div>
              )}
              {campaign.utmMedium && (
                <div className="campaign-detail-meta-row">
                  <span className="campaign-detail-meta-label">Medium</span>
                  <span className="campaign-detail-meta-value">{campaign.utmMedium}</span>
                </div>
              )}
              {campaign.utmCampaign && (
                <div className="campaign-detail-meta-row">
                  <span className="campaign-detail-meta-label">Campaign</span>
                  <span className="campaign-detail-meta-value">{campaign.utmCampaign}</span>
                </div>
              )}
            </div>
          )}

          <div className="campaign-detail-sidebar-card">
            <h3>Actions</h3>
            <button
              className="social-editor-delete-btn"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Campaign
            </button>
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <div
          className="social-admin-dialog-overlay"
          onClick={() => setShowDeleteDialog(false)}
        >
          <div
            className="social-admin-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete campaign?</h3>
            <p>
              Are you sure you want to delete &quot;{campaign.name}&quot;?
              Posts will not be deleted.
            </p>
            <div className="social-admin-dialog-actions">
              <button
                className="social-admin-dialog-cancel"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                className="social-admin-dialog-delete"
                onClick={handleDeleteCampaign}
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
