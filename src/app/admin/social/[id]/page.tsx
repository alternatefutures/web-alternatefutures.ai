'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDialog } from '@/hooks/useDialog'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import PlatformChip from '@/components/admin/PlatformChip'
import {
  fetchSocialPostById,
  updateSocialPost,
  publishSocialPost,
  deleteSocialPost,
  createSocialPost,
  requestApproval,
  respondToApproval,
  PLATFORM_LIMITS,
  APPROVERS,
  type SocialMediaPost,
  type PlatformCharLimits,
  type SocialPlatform,
  type ApproverId,
  type ApprovalHistoryEntry,
  type ApprovalActionInput,
} from '@/lib/social-api'
import {
  transformContent,
  type ContentSourceType,
  type TransformOutput,
  PLATFORM_CHAR_LIMITS,
  PLATFORM_LABELS,
  ALL_PLATFORMS,
} from '@/lib/transformer-api'
import {
  fetchAllUtmPresets,
  incrementUtmPresetUsage,
  buildUtmUrl,
  PLATFORM_UTM_DEFAULTS,
  type UtmPreset,
} from '@/lib/utm-api'
import {
  validateContent as runBrandValidation,
  shouldBlockApproval,
  BRAND_APPROVAL_THRESHOLD,
  type BrandValidationResult,
} from '@/lib/brand-validation-api'
import type { ExpandedPlatform } from '@/lib/campaign-api'
import {
  addDecision,
  ALL_FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
  type ApprovalAction,
} from '@/lib/approval-analytics-api'
import { getCookieValue } from '@/lib/cookies'
import ModelSelector from '@/components/admin/ModelSelector'
import { getRecommendedModel, getModelById } from '@/lib/model-registry-api'
import '../social-admin.css'

type ToneOption = 'original' | 'professional' | 'casual' | 'technical' | 'playful'
type ApiTone = 'professional' | 'casual' | 'technical' | 'playful'

/** Simple heuristic tone detection — scores the content and returns the closest API tone.
 *  Uses word boundary matching to avoid substring false positives (e.g. "node" in "nodemon"). */
function detectTone(text: string): ApiTone {
  const lower = text.toLowerCase()
  const words = lower.split(/\s+/)
  const scores = { professional: 0, casual: 0, technical: 0, playful: 0 }

  function matchWord(word: string): boolean {
    // Multi-word phrases use plain includes (they're specific enough)
    if (word.includes(' ')) return lower.includes(word)
    // Single words use word-boundary regex to prevent substring matches
    return new RegExp(`\\b${word}\\b`).test(lower)
  }

  // Professional signals
  const proWords = ['announce', 'excited', 'launch', 'introducing', 'pleased', 'proud', 'strategic', 'enterprise', 'solution', 'platform', 'deliver', 'partnership', 'milestone']
  for (const w of proWords) if (matchWord(w)) scores.professional += 2

  // Casual signals
  const casualWords = ['hey', 'just', 'cool', 'awesome', 'check out', 'yo', 'btw', 'tbh', 'lol', 'vibes', 'drop', 'shipped', 'ngl']
  for (const w of casualWords) if (matchWord(w)) scores.casual += 2
  // Exclamation density
  const exclamations = (text.match(/!/g) || []).length
  if (exclamations > 2) scores.casual += 2

  // Technical signals
  const techWords = ['api', 'sdk', 'deploy', 'infrastructure', 'node', 'protocol', 'ipfs', 'docker', 'kubernetes', 'config', 'endpoint', 'latency', 'throughput', 'gpu', 'container']
  for (const w of techWords) if (matchWord(w)) scores.technical += 2
  // Code-like patterns
  if (/`[^`]+`/.test(text) || /\b(https?:\/\/|localhost)\b/.test(text)) scores.technical += 2

  // Playful signals
  const playfulWords = ['guess what', 'wild', 'crazy', 'magic', 'secret', 'sneak peek', 'mind blown', 'game changer', 'plot twist']
  for (const w of playfulWords) if (matchWord(w)) scores.playful += 2
  // Emoji density (rough check for emoji-like patterns)
  const emojiCount = (text.match(/[\u{1F300}-\u{1FAD6}]/gu) || []).length
  if (emojiCount > 2) scores.playful += 2

  // Short, punchy sentences lean casual/playful
  const avgWordLen = words.length > 0 ? text.length / words.length : 5
  if (avgWordLen < 4) scores.casual += 1

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  // If no strong signal, default to professional
  if (best[1] === 0) return 'professional'
  return best[0] as ApiTone
}

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

const APPROVAL_BADGE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  NONE: { bg: '#F3F4F6', color: '#6B7280', label: 'No Approval' },
  PENDING: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  APPROVED: { bg: '#D1FAE5', color: '#065F46', label: 'Approved' },
  REJECTED: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
  CHANGES_REQUESTED: { bg: '#FEF3C7', color: '#92400E', label: 'Changes Requested' },
}

export default function EditSocialPostPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const postId = params.id

  const [post, setPost] = useState<SocialMediaPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [content, setContent] = useState('')
  const [hashtagsInput, setHashtagsInput] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [mediaUrlsInput, setMediaUrlsInput] = useState('')

  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Transform state
  const [transformOpen, setTransformOpen] = useState(false)
  const [sourceType, setSourceType] = useState<ContentSourceType>('FREEFORM')
  const [tone, setTone] = useState<ToneOption>('original')
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(false)
  const [extraPlatforms, setExtraPlatforms] = useState<SocialPlatform[]>([])
  const [transforming, setTransforming] = useState(false)
  const [transformOutputs, setTransformOutputs] = useState<TransformOutput[]>([])
  const [transformError, setTransformError] = useState('')
  const [createdLinks, setCreatedLinks] = useState<Record<string, string>>({})
  const [transformModel, setTransformModel] = useState<string | null>(() => getRecommendedModel().id)

  // Approval state
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [selectedApprover, setSelectedApprover] = useState<ApproverId>(APPROVERS[0].id)
  const [approvalNote, setApprovalNote] = useState('')
  const [requestingApproval, setRequestingApproval] = useState(false)

  // Brand validation state (BF-BG-004)
  const [brandValidation, setBrandValidation] = useState<BrandValidationResult | null>(null)
  const [brandValidating, setBrandValidating] = useState(false)

  // Review/respond state (for reviewers acting on pending posts)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<ApprovalActionInput['action']>('APPROVE')
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [reviewCategory, setReviewCategory] = useState<FeedbackCategory | ''>('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  // Dialog a11y refs
  const deleteDialogRef = useDialog(deleteTarget, () => setDeleteTarget(false))
  const approvalDialogRef = useDialog(approvalOpen, () => setApprovalOpen(false))
  const reviewDialogRef = useDialog(reviewOpen, () => setReviewOpen(false))

  // UTM state
  const [utmOpen, setUtmOpen] = useState(false)
  const [utmPresets, setUtmPresets] = useState<UtmPreset[]>([])
  const [selectedPresetId, setSelectedPresetId] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [utmTerm, setUtmTerm] = useState('')
  const [utmContent, setUtmContent] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [postData, presets] = await Promise.all([
          fetchSocialPostById(token, postId),
          fetchAllUtmPresets(token),
        ])
        if (postData) {
          setPost(postData)
          setContent(postData.content)
          setHashtagsInput(postData.hashtags.map((h) => h.replace(/^#/, '')).join(', '))
          setScheduledAt(postData.scheduledAt ? postData.scheduledAt.slice(0, 16) : '')
          setMediaUrlsInput(postData.mediaUrls.join('\n'))
          // Set platform UTM defaults
          const defaults = PLATFORM_UTM_DEFAULTS[postData.platform as ExpandedPlatform]
          if (defaults) {
            setUtmSource(defaults.utm_source)
            setUtmMedium(defaults.utm_medium)
          }
        }
        setUtmPresets(presets)
      } catch {
        setLoadError('Failed to load post. Please refresh to try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [postId])

  const platformLimit = useMemo((): PlatformCharLimits | null => {
    if (!post) return null
    return PLATFORM_LIMITS.find((pl) => pl.platform === post.platform) || null
  }, [post])

  const charCount = useMemo(() => {
    if (!platformLimit) return null
    return {
      count: content.length,
      max: platformLimit.maxChars,
      over: content.length > platformLimit.maxChars,
    }
  }, [content, platformLimit])

  const hashtags = useMemo(() => {
    if (!hashtagsInput.trim()) return []
    return hashtagsInput
      .split(',')
      .map((h) => h.trim())
      .filter((h) => h.length > 0)
      .map((h) => (h.startsWith('#') ? h : `#${h}`))
  }, [hashtagsInput])

  const mediaUrls = useMemo(() => {
    if (!mediaUrlsInput.trim()) return []
    return mediaUrlsInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0)
  }, [mediaUrlsInput])

  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      setStatusMsg({ type: 'error', text: 'Content is required' })
      return
    }
    if (charCount && charCount.over) {
      setStatusMsg({ type: 'error', text: `Content exceeds ${charCount.max} character limit for ${post?.platform}` })
      return
    }

    setSaving(true)
    setStatusMsg(null)

    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateSocialPost(token, postId, {
        content: content.trim(),
        hashtags: hashtags.length > 0 ? hashtags : [],
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : [],
        scheduledAt: scheduledAt || undefined,
      })

      setPost(updated)
      setStatusMsg({ type: 'success', text: 'Saved!' })
      setTimeout(() => setStatusMsg(null), 3000)
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }, [content, hashtags, mediaUrls, scheduledAt, postId])

  const handlePublish = useCallback(async () => {
    setSaving(true)
    setStatusMsg(null)

    try {
      const token = getCookieValue('af_access_token')
      const updated = await publishSocialPost(token, postId)
      setPost(updated)
      setStatusMsg({ type: 'success', text: 'Published!' })
      setTimeout(() => setStatusMsg(null), 3000)
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to publish' })
    } finally {
      setSaving(false)
    }
  }, [postId])

  const handleDelete = useCallback(async () => {
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteSocialPost(token, postId)
      router.push('/admin/social')
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to delete' })
      setDeleting(false)
      setDeleteTarget(false)
    }
  }, [postId, router])

  // Auto-run brand validation when approval dialog opens (BF-BG-004)
  useEffect(() => {
    if (!approvalOpen || !content.trim() || !post) return
    let cancelled = false
    setBrandValidating(true)
    runBrandValidation(content, post.platform).then((result) => {
      if (!cancelled) {
        setBrandValidation(result)
        setBrandValidating(false)
      }
    }).catch(() => {
      if (!cancelled) setBrandValidating(false)
    })
    return () => { cancelled = true }
  }, [approvalOpen, content, post])

  const handleRequestApproval = useCallback(async () => {
    // Block if brand score is below threshold (BF-BG-004)
    if (brandValidation && shouldBlockApproval(brandValidation)) {
      setStatusMsg({ type: 'error', text: `Brand score ${brandValidation.overallScore}/100 is below the ${BRAND_APPROVAL_THRESHOLD} threshold. Fix violations before requesting approval.` })
      return
    }

    setRequestingApproval(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const updated = await requestApproval(token, postId, {
        approver: selectedApprover,
        note: approvalNote.trim() || undefined,
      })
      setPost(updated)
      setApprovalOpen(false)
      setApprovalNote('')
      setBrandValidation(null)
      setStatusMsg({ type: 'success', text: 'Approval requested!' })
      setTimeout(() => setStatusMsg(null), 3000)
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to request approval' })
    } finally {
      setRequestingApproval(false)
    }
  }, [postId, selectedApprover, approvalNote, brandValidation])

  const handleReviewAction = useCallback(async () => {
    if (!post) return
    setReviewSubmitting(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const updated = await respondToApproval(token, postId, {
        action: reviewAction,
        feedback: reviewFeedback.trim() || undefined,
      })

      // Log decision to approval analytics
      const analyticsAction: ApprovalAction = reviewAction === 'REQUEST_CHANGES' ? 'CHANGES_REQUESTED' : reviewAction
      addDecision({
        id: `ad-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        postId,
        action: analyticsAction,
        reviewer: post.requestedApprovalFrom || 'unknown',
        timestamp: new Date().toISOString(),
        feedback: reviewFeedback.trim() || null,
        feedbackCategory: reviewCategory || null,
        contentType: 'social',
        platform: post.platform,
        model_used: 'llama-3.3-70b',
        tone: 'professional',
        wordCount: content.split(/\s+/).length,
      })

      setPost(updated)
      setReviewOpen(false)
      setReviewFeedback('')
      setReviewCategory('')
      setStatusMsg({ type: 'success', text: reviewAction === 'APPROVE' ? 'Approved!' : reviewAction === 'REJECT' ? 'Rejected.' : 'Changes requested.' })
      setTimeout(() => setStatusMsg(null), 3000)
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to submit review' })
    } finally {
      setReviewSubmitting(false)
    }
  }, [postId, post, reviewAction, reviewFeedback, reviewCategory, content])

  const handleGenerate = useCallback(async () => {
    if (!post || !content.trim()) return

    setTransforming(true)
    setTransformError('')
    setTransformOutputs([])
    setCreatedLinks({})

    try {
      const token = getCookieValue('af_access_token')
      const targetPlatforms: SocialPlatform[] = [
        post.platform as SocialPlatform,
        ...extraPlatforms.filter((p) => p !== post.platform),
      ]
      const resolvedTone: ApiTone = tone === 'original'
        ? detectTone(content)
        : tone
      const result = await transformContent(token, {
        title: `Transform: ${post.platform} post`,
        sourceContent: content.trim(),
        sourceType,
        targetPlatforms,
        tone: resolvedTone,
        includeHashtags,
        includeEmojis,
      })
      setTransformOutputs(result.outputs)
    } catch {
      setTransformError('Failed to generate variants')
    } finally {
      setTransforming(false)
    }
  }, [post, content, sourceType, tone, includeHashtags, includeEmojis, extraPlatforms])

  const handleUseVariant = useCallback((variantContent: string) => {
    setContent(variantContent)
    setStatusMsg({ type: 'success', text: 'Content replaced with variant' })
    setTimeout(() => setStatusMsg(null), 3000)
  }, [])

  const handleCreateAsNewPost = useCallback(async (output: TransformOutput) => {
    try {
      const token = getCookieValue('af_access_token')
      const newPost = await createSocialPost(token, {
        platform: output.platform,
        content: output.content,
        status: 'DRAFT',
      })
      setCreatedLinks((prev) => ({ ...prev, [output.id]: newPost.id }))
    } catch {
      setTransformError('Failed to create post from variant')
    }
  }, [])

  const toggleExtraPlatform = useCallback((p: SocialPlatform) => {
    setExtraPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }, [])

  const handleSelectUtmPreset = useCallback((presetId: string) => {
    setSelectedPresetId(presetId)
    if (!presetId) return
    const preset = utmPresets.find((p) => p.id === presetId)
    if (preset) {
      setUtmSource(preset.utm_source)
      setUtmMedium(preset.utm_medium)
      setUtmCampaign(preset.utm_campaign)
      setUtmTerm(preset.utm_term)
      setUtmContent(preset.utm_content)
    }
  }, [utmPresets])

  // Detect URLs in content for UTM preview
  const detectedUrl = useMemo(() => {
    const match = content.match(/https?:\/\/[^\s]+/)
    return match ? match[0] : null
  }, [content])

  const utmPreviewUrl = useMemo(() => {
    const base = detectedUrl || 'https://alternatefutures.ai'
    return buildUtmUrl(base, {
      utm_source: utmSource || undefined,
      utm_medium: utmMedium || undefined,
      utm_campaign: utmCampaign || undefined,
      utm_term: utmTerm || undefined,
      utm_content: utmContent || undefined,
    })
  }, [detectedUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent])

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

  if (loading) {
    return <div className="social-admin-empty"><p>Loading post...</p></div>
  }

  if (loadError) {
    return (
      <div className="social-admin-empty">
        <h2>Error</h2>
        <p>{loadError}</p>
        <p>
          <Link href="/admin/social" className="social-editor-back">
            &larr; Back to posts
          </Link>
        </p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="social-admin-empty">
        <h2>Post not found</h2>
        <p>
          <Link href="/admin/social" className="social-editor-back">
            &larr; Back to posts
          </Link>
        </p>
      </div>
    )
  }

  const st = STATUS_STYLES[post.status] || STATUS_STYLES.DRAFT
  const isPublished = post.status === 'PUBLISHED'

  return (
    <>
      <div className="social-editor-header">
        <div>
          <Link href="/admin/social" className="social-editor-back">
            &larr; Back to posts
          </Link>
          <h1>{isPublished ? 'View Social Post' : 'Edit Social Post'}</h1>
        </div>
      </div>

      {isPublished && (
        <div className="social-editor-locked-banner">
          <span className="social-editor-locked-icon">&#x1F512;</span>
          <div>
            <strong>This post has been published and cannot be edited.</strong>
            <span className="social-editor-locked-sub">
              Published content is locked to preserve integrity. You can still delete this record if needed.
            </span>
          </div>
        </div>
      )}

      <div className="social-editor-layout">
        {/* Main column */}
        <div className="social-editor-main">
          <div className="social-composer-card">
            <h3>Content</h3>
            <textarea
              className={`social-composer-textarea${isPublished ? ' locked' : ''}`}
              placeholder="Write your post content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              disabled={isPublished}
            />
            {charCount && (
              <div className="social-composer-char-counts">
                <span className={`social-composer-char-count${charCount.over ? ' over' : ''}`}>
                  {post.platform}: {charCount.count}/{charCount.max}
                </span>
              </div>
            )}
          </div>

          <div className="social-composer-card">
            <h3>Hashtags</h3>
            <input
              type="text"
              className={`social-composer-input${isPublished ? ' locked' : ''}`}
              placeholder="Web3, AI, DePIN (comma-separated)"
              value={hashtagsInput}
              onChange={(e) => setHashtagsInput(e.target.value)}
              disabled={isPublished}
            />
            {hashtags.length > 0 && (
              <div className="social-composer-hashtag-preview">
                {hashtags.map((h) => (
                  <span key={h} className="social-admin-hashtag-chip">{h}</span>
                ))}
              </div>
            )}
          </div>

          <div className="social-composer-card">
            <h3>Schedule</h3>
            <input
              type="datetime-local"
              className={`social-composer-input${isPublished ? ' locked' : ''}`}
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              disabled={isPublished}
            />
          </div>

          <div className="social-composer-card">
            <h3>Media URLs (one per line)</h3>
            <textarea
              className={`social-composer-textarea${isPublished ? ' locked' : ''}`}
              placeholder="https://example.com/image1.png"
              value={mediaUrlsInput}
              onChange={(e) => setMediaUrlsInput(e.target.value)}
              rows={3}
              disabled={isPublished}
            />
          </div>

          {/* UTM Parameters — hidden for published posts */}
          {!isPublished && (
          <div className="social-composer-card">
            <button
              type="button"
              className="social-transform-toggle"
              onClick={() => setUtmOpen(!utmOpen)}
            >
              {utmOpen ? '▾' : '▸'} UTM Parameters
            </button>

            {utmOpen && (
              <div className="social-transform-body">
                <div style={{ marginBottom: 'var(--af-space-palm)' }}>
                  <label className="social-transform-label">Quick Apply Preset</label>
                  <select
                    className="social-admin-select"
                    style={{ width: '100%' }}
                    value={selectedPresetId}
                    onChange={(e) => handleSelectUtmPreset(e.target.value)}
                  >
                    <option value="">-- Select a preset --</option>
                    {utmPresets.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--af-space-palm)', marginBottom: 'var(--af-space-palm)' }}>
                  <div>
                    <label className="social-transform-label">Source</label>
                    <input
                      type="text"
                      className="social-composer-input"
                      placeholder="social"
                      value={utmSource}
                      onChange={(e) => { setUtmSource(e.target.value); setSelectedPresetId('') }}
                    />
                  </div>
                  <div>
                    <label className="social-transform-label">Medium</label>
                    <input
                      type="text"
                      className="social-composer-input"
                      placeholder="organic"
                      value={utmMedium}
                      onChange={(e) => { setUtmMedium(e.target.value); setSelectedPresetId('') }}
                    />
                  </div>
                  <div>
                    <label className="social-transform-label">Campaign</label>
                    <input
                      type="text"
                      className="social-composer-input"
                      placeholder="launch-2026"
                      value={utmCampaign}
                      onChange={(e) => { setUtmCampaign(e.target.value); setSelectedPresetId('') }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--af-space-palm)', marginBottom: 'var(--af-space-palm)' }}>
                  <div>
                    <label className="social-transform-label">Term (optional)</label>
                    <input
                      type="text"
                      className="social-composer-input"
                      placeholder="keyword"
                      value={utmTerm}
                      onChange={(e) => { setUtmTerm(e.target.value); setSelectedPresetId('') }}
                    />
                  </div>
                  <div>
                    <label className="social-transform-label">Content (optional)</label>
                    <input
                      type="text"
                      className="social-composer-input"
                      placeholder="variant-a"
                      value={utmContent}
                      onChange={(e) => { setUtmContent(e.target.value); setSelectedPresetId('') }}
                    />
                  </div>
                </div>

                {(utmSource || utmCampaign) && (
                  <div style={{
                    background: 'var(--af-stone-800)',
                    borderRadius: 'var(--af-radius-worn)',
                    padding: 'var(--af-space-palm) var(--af-space-hand)',
                  }}>
                    <span style={{
                      display: 'block',
                      fontFamily: 'var(--af-font-architect)',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--af-stone-400)',
                      marginBottom: 'var(--af-space-grain)',
                    }}>URL Preview</span>
                    <code style={{
                      display: 'block',
                      fontFamily: 'var(--af-font-machine)',
                      fontSize: '12px',
                      color: 'var(--af-terra-glow)',
                      wordBreak: 'break-all',
                      lineHeight: 'var(--af-leading-body)',
                    }}>{utmPreviewUrl}</code>
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {/* Transform Section — hidden for published posts */}
          {!isPublished && (
          <div className="social-composer-card">
            <button
              type="button"
              className="social-transform-toggle"
              onClick={() => setTransformOpen(!transformOpen)}
            >
              {transformOpen ? '▾' : '▸'} Transform Content
            </button>

            {transformOpen && (
              <div className="social-transform-body">
                <div className="social-transform-controls">
                  <div>
                    <label className="social-transform-label">Source Type</label>
                    <select
                      className="social-admin-select"
                      value={sourceType}
                      onChange={(e) => setSourceType(e.target.value as ContentSourceType)}
                    >
                      <option value="FREEFORM">Freeform</option>
                      <option value="BLOG_POST">Blog Post</option>
                      <option value="PRESS_RELEASE">Press Release</option>
                      <option value="CHANGELOG">Changelog</option>
                      <option value="DOCUMENTATION">Documentation</option>
                    </select>
                  </div>

                  <div>
                    <label className="social-transform-label">Tone</label>
                    <div className="social-transform-tone-group">
                      {(['original', 'professional', 'casual', 'technical', 'playful'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`social-transform-tone-btn${tone === t ? ' selected' : ''}`}
                          onClick={() => setTone(t)}
                        >
                          {t === 'original' ? 'Keep Original' : t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                    {tone === 'original' && content.trim() && (
                      <div className="social-transform-tone-detected">
                        Detected: {detectTone(content)}
                      </div>
                    )}
                  </div>

                  <div className="social-transform-options">
                    <label className="social-composer-platform-checkbox">
                      <input
                        type="checkbox"
                        checked={includeHashtags}
                        onChange={(e) => setIncludeHashtags(e.target.checked)}
                      />
                      <span className="social-composer-platform-label">Include hashtags</span>
                    </label>
                    <label className="social-composer-platform-checkbox">
                      <input
                        type="checkbox"
                        checked={includeEmojis}
                        onChange={(e) => setIncludeEmojis(e.target.checked)}
                      />
                      <span className="social-composer-platform-label">Include emojis</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="social-transform-label">Also generate for</label>
                  <div className="social-transform-platforms">
                    {ALL_PLATFORMS.filter((p) => p !== post.platform).map((p) => (
                      <label key={p} className="social-composer-platform-checkbox">
                        <input
                          type="checkbox"
                          checked={extraPlatforms.includes(p)}
                          onChange={() => toggleExtraPlatform(p)}
                        />
                        <span className={`social-composer-platform-label${extraPlatforms.includes(p) ? ' selected' : ''}`}>
                          {PLATFORM_LABELS[p]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 'var(--af-space-palm)' }}>
                  <ModelSelector
                    value={transformModel}
                    onChange={setTransformModel}
                    expanded={false}
                  />
                </div>

                <button
                  type="button"
                  className="social-admin-new-btn"
                  style={{ width: '100%', textAlign: 'center', marginTop: 'var(--af-space-palm)' }}
                  disabled={transforming || !content.trim()}
                  onClick={handleGenerate}
                >
                  {transforming ? 'Generating...' : 'Generate Variants'}
                </button>

                {transformError && (
                  <div className="social-editor-status error" style={{ marginTop: 'var(--af-space-palm)' }}>
                    {transformError}
                  </div>
                )}

                {transformOutputs.length > 0 && (
                  <div className="social-transform-results">
                    {transformOutputs.map((output) => {
                      const isSamePlatform = output.platform === post.platform
                      const isCreated = !!createdLinks[output.id]
                      return (
                        <div key={output.id} className="social-transform-output">
                          <div className="social-transform-output-header">
                            <PlatformChip platform={output.platform} />
                            <span className="social-composer-char-count">
                              {output.charCount}/{PLATFORM_CHAR_LIMITS[output.platform]}
                            </span>
                            {output.variant !== 'default' && (
                              <span className="social-admin-hashtag-chip">{output.variant}</span>
                            )}
                          </div>
                          <pre className="social-transform-output-content">{output.content}</pre>
                          <div className="social-transform-output-actions">
                            {isSamePlatform && (
                              <button
                                type="button"
                                className="social-transform-use-btn"
                                onClick={() => handleUseVariant(output.content)}
                              >
                                Use This
                              </button>
                            )}
                            {!isSamePlatform && !isCreated && (
                              <button
                                type="button"
                                className="social-transform-create-btn"
                                onClick={() => handleCreateAsNewPost(output)}
                              >
                                Create as New Post
                              </button>
                            )}
                            {isCreated && (
                              <Link
                                href={`/admin/social/${createdLinks[output.id]}`}
                                className="social-transform-created-link"
                              >
                                View created post &rarr;
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="social-editor-sidebar">
          {/* Platform */}
          <div className="social-editor-sidebar-card">
            <h3>Platform</h3>
            <PlatformChip platform={post.platform} />
          </div>

          {/* Model Used */}
          {post.model_used && (
            <div className="social-editor-sidebar-card">
              <h3>Model Used</h3>
              <span style={{
                fontFamily: 'var(--af-font-machine)',
                fontSize: 'var(--af-type-xs)',
                color: 'var(--af-text-body)',
              }}>
                {getModelById(post.model_used)?.name || post.model_used}
              </span>
            </div>
          )}

          {/* Status */}
          <div className="social-editor-sidebar-card">
            <h3>Status</h3>
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
          </div>

          {/* Approval Status */}
          {post.approvalStatus !== 'NONE' && (
            <div className="social-editor-sidebar-card">
              <h3>Approval</h3>
              <span className={`social-approval-badge social-approval-badge--${post.approvalStatus.toLowerCase().replace('_', '-')}`}>
                {APPROVAL_BADGE_STYLES[post.approvalStatus]?.label || post.approvalStatus}
              </span>
              {post.requestedApprovalFrom && (
                <p className="social-editor-sidebar-value" style={{ marginTop: 'var(--af-space-breath)' }}>
                  Reviewer: {APPROVERS.find((a) => a.id === post.requestedApprovalFrom)?.name || post.requestedApprovalFrom}
                </p>
              )}
              {post.approvalFeedback && (
                <div className="social-approval-feedback">
                  <p className="social-approval-feedback-label">Feedback</p>
                  <p className="social-approval-feedback-text">{post.approvalFeedback}</p>
                </div>
              )}
              {post.approvalRequestedAt && (
                <p className="social-editor-sidebar-value" style={{ marginTop: 'var(--af-space-breath)', fontSize: '11px', color: 'var(--af-stone-500)' }}>
                  Requested {formatDate(post.approvalRequestedAt)}
                </p>
              )}
            </div>
          )}

          {/* Approval History */}
          {post.approvalHistory.length > 0 && (
            <div className="social-editor-sidebar-card">
              <h3>Approval History</h3>
              <div className="social-approval-history">
                {post.approvalHistory.map((entry) => {
                  const actorName = APPROVERS.find((a) => a.id === entry.actor)?.name || entry.actor
                  const actionLabels: Record<ApprovalHistoryEntry['action'], string> = {
                    REQUEST: 'Requested approval',
                    APPROVE: 'Approved',
                    REQUEST_CHANGES: 'Requested changes',
                    REJECT: 'Rejected',
                  }
                  const actionClass: Record<ApprovalHistoryEntry['action'], string> = {
                    REQUEST: 'request',
                    APPROVE: 'approve',
                    REQUEST_CHANGES: 'changes',
                    REJECT: 'reject',
                  }
                  return (
                    <div key={entry.id} className={`social-approval-history-entry social-approval-history-entry--${actionClass[entry.action]}`}>
                      <div className="social-approval-history-dot" />
                      <div className="social-approval-history-body">
                        <span className="social-approval-history-action">{actionLabels[entry.action]}</span>
                        <span className="social-approval-history-actor">{actorName}</span>
                        <span className="social-approval-history-time">{formatDate(entry.timestamp)}</span>
                        {entry.comment && (
                          <p className="social-approval-history-comment">{entry.comment}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Published info */}
          {post.publishedAt && (
            <div className="social-editor-sidebar-card">
              <h3>Published</h3>
              <p className="social-editor-sidebar-value">{formatDate(post.publishedAt)}</p>
              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-editor-sidebar-link"
                >
                  View on {post.platform}
                </a>
              )}
            </div>
          )}

          {/* Scheduled info */}
          {post.scheduledAt && !post.publishedAt && (
            <div className="social-editor-sidebar-card">
              <h3>Scheduled For</h3>
              <p className="social-editor-sidebar-value">{formatDate(post.scheduledAt)}</p>
            </div>
          )}

          {/* Created */}
          <div className="social-editor-sidebar-card">
            <h3>Created</h3>
            <p className="social-editor-sidebar-value">{formatDate(post.createdAt)}</p>
          </div>

          {/* Error */}
          {post.error && (
            <div className="social-editor-sidebar-card">
              <h3>Error</h3>
              <p className="social-editor-sidebar-error">{post.error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="social-editor-sidebar-card">
            <h3>Actions</h3>
            {!isPublished && (
              <div className="social-editor-actions">
                <button
                  className="social-editor-save-btn"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                {post.status !== 'PUBLISHED' && (
                  <button
                    className="social-editor-publish-btn"
                    disabled={saving}
                    onClick={handlePublish}
                  >
                    Publish
                  </button>
                )}
              </div>
            )}
            {!isPublished && (post.status === 'DRAFT' || post.status === 'CHANGES_REQUESTED') && (
              <button
                className="social-approval-request-btn"
                onClick={() => setApprovalOpen(true)}
              >
                Request Approval
              </button>
            )}
            {post.approvalStatus === 'PENDING' && (
              <div className="social-editor-review-actions">
                <button
                  className="social-approval-action-btn approve"
                  onClick={() => { setReviewAction('APPROVE'); setReviewOpen(true) }}
                >
                  Approve
                </button>
                <button
                  className="social-approval-action-btn changes"
                  onClick={() => { setReviewAction('REQUEST_CHANGES'); setReviewOpen(true) }}
                >
                  Request Changes
                </button>
                <button
                  className="social-approval-action-btn reject"
                  onClick={() => { setReviewAction('REJECT'); setReviewOpen(true) }}
                >
                  Reject
                </button>
              </div>
            )}
            <button
              className="social-editor-delete-btn"
              onClick={() => setDeleteTarget(true)}
            >
              Delete Post
            </button>
            {statusMsg && (
              <div className={`social-editor-status ${statusMsg.type}`} style={{ marginTop: 8 }}>
                {statusMsg.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div
          className="social-admin-dialog-overlay"
          onClick={() => setDeleteTarget(false)}
        >
          <div
            className="social-admin-dialog"
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="social-delete-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="social-delete-dialog-title">Delete post?</h3>
            <p>
              Are you sure you want to delete this {post.platform} post?
              This action cannot be undone.
            </p>
            <div className="social-admin-dialog-actions">
              <button
                className="social-admin-dialog-cancel"
                onClick={() => setDeleteTarget(false)}
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

      {approvalOpen && (
        <div
          className="social-admin-dialog-overlay"
          onClick={() => setApprovalOpen(false)}
        >
          <div
            className="social-admin-dialog"
            ref={approvalDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="social-approval-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="social-approval-dialog-title">Request Approval</h3>
            <p>Select a reviewer and optionally add a note.</p>

            {/* Brand Score Display (BF-BG-004) */}
            {brandValidating && (
              <div style={{
                padding: 'var(--af-space-palm)',
                background: 'var(--af-stone-50)',
                borderRadius: 'var(--af-radius-chip)',
                marginBottom: 'var(--af-space-hand)',
                fontFamily: 'var(--af-font-architect)',
                fontSize: 'var(--af-type-xs)',
                color: 'var(--af-stone-500)',
              }}>
                Running brand validation...
              </div>
            )}
            {brandValidation && !brandValidating && (
              <div style={{
                padding: 'var(--af-space-palm)',
                background: brandValidation.overallScore >= BRAND_APPROVAL_THRESHOLD ? 'rgba(45, 134, 89, 0.08)' : 'rgba(194, 59, 34, 0.08)',
                border: `1px solid ${brandValidation.overallScore >= BRAND_APPROVAL_THRESHOLD ? 'rgba(45, 134, 89, 0.25)' : 'rgba(194, 59, 34, 0.25)'}`,
                borderRadius: 'var(--af-radius-chip)',
                marginBottom: 'var(--af-space-hand)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--af-space-breath)',
                }}>
                  <span style={{
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: 'var(--af-type-xs)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: brandValidation.overallScore >= BRAND_APPROVAL_THRESHOLD ? 'var(--af-signal-go)' : 'var(--af-signal-stop)',
                  }}>
                    Brand Score
                  </span>
                  <span style={{
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: brandValidation.overallScore >= BRAND_APPROVAL_THRESHOLD ? 'var(--af-signal-go)' : 'var(--af-signal-stop)',
                  }}>
                    {brandValidation.overallScore}/100
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--af-space-palm)', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px', color: 'var(--af-stone-500)' }}>
                    Terminology: {brandValidation.terminologyScore}
                  </span>
                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px', color: 'var(--af-stone-500)' }}>
                    Voice: {brandValidation.voiceConsistencyScore}
                  </span>
                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px', color: 'var(--af-stone-500)' }}>
                    Tone: {brandValidation.toneScore}
                  </span>
                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px', color: 'var(--af-stone-500)' }}>
                    Platform: {brandValidation.platformFitScore}
                  </span>
                </div>
                {brandValidation.violations.length > 0 && (
                  <div style={{ marginTop: 'var(--af-space-breath)' }}>
                    {brandValidation.violations.slice(0, 3).map((v) => (
                      <div key={v.id} style={{
                        fontFamily: 'var(--af-font-architect)',
                        fontSize: '11px',
                        color: v.severity === 'BLOCKING' ? 'var(--af-signal-stop)' : 'var(--af-stone-600)',
                        marginTop: 'var(--af-space-grain)',
                      }}>
                        {v.severity === 'BLOCKING' ? '\u2716' : '\u26A0'} {v.message}
                      </div>
                    ))}
                    {brandValidation.violations.length > 3 && (
                      <div style={{
                        fontFamily: 'var(--af-font-architect)',
                        fontSize: '11px',
                        color: 'var(--af-stone-400)',
                        marginTop: 'var(--af-space-grain)',
                      }}>
                        +{brandValidation.violations.length - 3} more violations
                      </div>
                    )}
                  </div>
                )}
                {shouldBlockApproval(brandValidation) && (
                  <div style={{
                    marginTop: 'var(--af-space-breath)',
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: 'var(--af-type-xs)',
                    fontWeight: 600,
                    color: 'var(--af-signal-stop)',
                  }}>
                    Approval blocked: score below {BRAND_APPROVAL_THRESHOLD} or blocking violations present.
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: 'var(--af-space-hand)' }}>
              <label className="social-transform-label">Approver</label>
              <select
                className="social-admin-select"
                style={{ width: '100%' }}
                value={selectedApprover}
                onChange={(e) => setSelectedApprover(e.target.value as ApproverId)}
              >
                {APPROVERS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.role}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 'var(--af-space-hand)' }}>
              <label className="social-transform-label">Note (optional)</label>
              <textarea
                className="social-composer-textarea"
                placeholder="Any context for the reviewer..."
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="social-admin-dialog-actions">
              <button
                className="social-admin-dialog-cancel"
                onClick={() => setApprovalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="social-approval-submit-btn"
                onClick={handleRequestApproval}
                disabled={requestingApproval || brandValidating || (brandValidation !== null && shouldBlockApproval(brandValidation))}
              >
                {requestingApproval ? 'Sending...' : brandValidating ? 'Validating...' : 'Send for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewOpen && (
        <div
          className="social-admin-dialog-overlay"
          onClick={() => setReviewOpen(false)}
        >
          <div
            className="social-admin-dialog"
            ref={reviewDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="social-review-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="social-review-dialog-title">
              {reviewAction === 'APPROVE' && 'Approve Post'}
              {reviewAction === 'REQUEST_CHANGES' && 'Request Changes'}
              {reviewAction === 'REJECT' && 'Reject Post'}
            </h3>
            <p>
              {reviewAction === 'APPROVE' && 'This will move the post to Scheduled status.'}
              {reviewAction === 'REQUEST_CHANGES' && 'The author will be notified to revise the content.'}
              {reviewAction === 'REJECT' && 'This will move the post back to Draft and clear the approval request.'}
            </p>

            <div style={{ marginBottom: 'var(--af-space-hand)' }}>
              <label className="social-transform-label">
                Feedback {reviewAction === 'APPROVE' ? '(optional)' : ''}
              </label>
              <textarea
                className="social-composer-textarea"
                placeholder={
                  reviewAction === 'APPROVE'
                    ? 'Any notes for the author...'
                    : 'Describe what needs to change...'
                }
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                rows={3}
              />
            </div>

            {reviewAction !== 'APPROVE' && (
              <div style={{ marginBottom: 'var(--af-space-hand)' }}>
                <label className="social-transform-label">Feedback Category</label>
                <select
                  className="social-admin-select approval-category-select"
                  value={reviewCategory}
                  onChange={(e) => setReviewCategory(e.target.value as FeedbackCategory | '')}
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
                onClick={() => setReviewOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`social-approval-action-btn ${reviewAction === 'APPROVE' ? 'approve' : reviewAction === 'REQUEST_CHANGES' ? 'changes' : 'reject'}`}
                onClick={handleReviewAction}
                disabled={reviewSubmitting || (reviewAction === 'REQUEST_CHANGES' && !reviewFeedback.trim())}
              >
                {reviewSubmitting ? 'Submitting...' : reviewAction === 'APPROVE' ? 'Approve' : reviewAction === 'REQUEST_CHANGES' ? 'Request Changes' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
