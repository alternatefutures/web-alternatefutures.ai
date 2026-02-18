'use client'

import { useState, useMemo, useCallback, useRef, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PlatformChip from '@/components/admin/PlatformChip'
import {
  createSocialPost,
  requestApproval,
  publishSocialPost,
  PLATFORM_LIMITS,
  APPROVERS,
  type SocialPlatform,
  type ApproverId,
} from '@/lib/social-api'
import {
  transformContent,
  type TransformOutput,
} from '@/lib/transformer-api'
import {
  ALL_EXPANDED_PLATFORMS,
  EXPANDED_PLATFORM_LABELS,
  EXPANDED_PLATFORM_LIMITS,
  PLATFORM_COLORS,
  type ExpandedPlatform,
} from '@/lib/campaign-api'
import ModelSelector from '@/components/admin/ModelSelector'
import { getRecommendedModel } from '@/lib/model-registry-api'
import { getCookieValue } from '@/lib/cookies'
import '../social-admin.css'
import './new-post.css'

const ALL_PLATFORMS: SocialPlatform[] = [
  'X', 'BLUESKY', 'MASTODON', 'LINKEDIN', 'REDDIT', 'DISCORD',
  'TELEGRAM', 'THREADS', 'INSTAGRAM', 'FACEBOOK',
]

interface MediaFile {
  id: string
  file: File
  previewUrl: string
  type: 'image' | 'video'
}

type ScheduleMode = 'now' | 'schedule'
type SubmitAction = 'draft' | 'approval' | 'publish'

export default function NewPostPage() {
  const router = useRouter()

  // Platform selection (multi-select)
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([])

  // Content
  const [content, setContent] = useState('')

  // Media
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Scheduling
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  // Preview
  const [previewPlatform, setPreviewPlatform] = useState<SocialPlatform | null>(null)

  // Transform
  const [transforming, setTransforming] = useState(false)
  const [perPlatformContent, setPerPlatformContent] = useState<Record<string, string>>({})
  const [transformError, setTransformError] = useState('')

  // Model
  const [selectedModel, setSelectedModel] = useState<string | null>(() => getRecommendedModel().id)

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Approval dialog
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [selectedApprover, setSelectedApprover] = useState<ApproverId>(APPROVERS[0].id)
  const [approvalNote, setApprovalNote] = useState('')

  // ── Platform toggle ──
  const togglePlatform = useCallback((p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }, [])

  // ── Character counts per platform ──
  const charInfoMap = useMemo(() => {
    const map: Record<string, { count: number; max: number; over: boolean }> = {}
    for (const p of selectedPlatforms) {
      const limit = PLATFORM_LIMITS.find((pl) => pl.platform === p)
      if (!limit) continue
      const text = perPlatformContent[p] || content
      map[p] = {
        count: text.length,
        max: limit.maxChars,
        over: text.length > limit.maxChars,
      }
    }
    return map
  }, [selectedPlatforms, content, perPlatformContent])

  const hasOverLimit = useMemo(
    () => Object.values(charInfoMap).some((c) => c.over),
    [charInfoMap],
  )

  // ── Media handling ──
  function addFiles(files: FileList | File[]) {
    const newMedia: MediaFile[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map((f) => ({
        id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        type: f.type.startsWith('video/') ? 'video' as const : 'image' as const,
      }))
    setMediaFiles((prev) => [...prev, ...newMedia])
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(true)
  }

  function removeMedia(id: string) {
    setMediaFiles((prev) => {
      const item = prev.find((m) => m.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((m) => m.id !== id)
    })
  }

  // ── Content transformer ──
  const handleTransform = useCallback(async () => {
    if (!content.trim() || selectedPlatforms.length === 0) return
    setTransforming(true)
    setTransformError('')

    try {
      const token = getCookieValue('af_access_token')
      const result = await transformContent(token, {
        title: 'Single post adaptation',
        sourceContent: content.trim(),
        sourceType: 'FREEFORM',
        targetPlatforms: selectedPlatforms,
        tone: 'professional',
        includeHashtags: true,
        includeEmojis: false,
      })

      const adapted: Record<string, string> = {}
      for (const output of result.outputs) {
        adapted[output.platform] = output.content
      }
      setPerPlatformContent(adapted)
    } catch {
      setTransformError('Failed to adapt content. You can still edit manually.')
    } finally {
      setTransforming(false)
    }
  }, [content, selectedPlatforms])

  // ── Get effective content for a platform ──
  function getContentForPlatform(p: SocialPlatform): string {
    return perPlatformContent[p] || content
  }

  // ── Schedule helpers ──
  const scheduledAt = useMemo(() => {
    if (scheduleMode !== 'schedule' || !scheduledDate) return null
    const time = scheduledTime || '12:00'
    return `${scheduledDate}T${time}:00`
  }, [scheduleMode, scheduledDate, scheduledTime])

  // ── Submit ──
  const handleSubmit = useCallback(async (action: SubmitAction) => {
    if (selectedPlatforms.length === 0) {
      setError('Select at least one platform')
      return
    }
    if (!content.trim()) {
      setError('Content is required')
      return
    }
    if (hasOverLimit) {
      setError('Content exceeds character limit on one or more platforms')
      return
    }

    if (action === 'approval') {
      setApprovalOpen(true)
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const token = getCookieValue('af_access_token')
      const mediaUrls = mediaFiles.map((m) => m.previewUrl)

      // Create a post for each selected platform
      const createdIds: string[] = []
      for (const platform of selectedPlatforms) {
        const platformContent = getContentForPlatform(platform)
        const status = action === 'publish'
          ? (scheduledAt ? 'SCHEDULED' as const : 'DRAFT' as const)
          : 'DRAFT' as const

        const post = await createSocialPost(token, {
          platform,
          content: platformContent.trim(),
          status,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
          scheduledAt: scheduledAt || undefined,
          model_used: selectedModel || undefined,
        })
        createdIds.push(post.id)

        if (action === 'publish' && !scheduledAt) {
          await publishSocialPost(token, post.id)
        }
      }

      if (createdIds.length === 1) {
        setSuccess('Post created!')
        setTimeout(() => router.push(`/admin/social/${createdIds[0]}`), 1000)
      } else {
        setSuccess(`${createdIds.length} posts created!`)
        setTimeout(() => router.push('/admin/social/queue'), 1000)
      }
    } catch {
      setError('Failed to create post(s)')
    } finally {
      setSubmitting(false)
    }
  }, [selectedPlatforms, content, hasOverLimit, mediaFiles, scheduledAt, selectedModel, perPlatformContent, router])

  // ── Submit for approval ──
  const handleSubmitApproval = useCallback(async () => {
    setSubmitting(true)
    setError('')
    setSuccess('')
    setApprovalOpen(false)

    try {
      const token = getCookieValue('af_access_token')
      const mediaUrls = mediaFiles.map((m) => m.previewUrl)

      for (const platform of selectedPlatforms) {
        const platformContent = getContentForPlatform(platform)
        const post = await createSocialPost(token, {
          platform,
          content: platformContent.trim(),
          status: 'DRAFT',
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
          scheduledAt: scheduledAt || undefined,
          model_used: selectedModel || undefined,
        })

        await requestApproval(token, post.id, {
          approver: selectedApprover,
          note: approvalNote.trim() || undefined,
        })
      }

      setSuccess('Posts created and sent for approval!')
      setTimeout(() => router.push('/admin/social/queue'), 1500)
    } catch {
      setError('Failed to submit for approval')
    } finally {
      setSubmitting(false)
    }
  }, [selectedPlatforms, content, mediaFiles, scheduledAt, selectedModel, selectedApprover, approvalNote, perPlatformContent, router])

  // ── Min date for scheduler ──
  const minDate = useMemo(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  }, [])

  // ── Render ──
  return (
    <>
      <div className="social-editor-header">
        <div>
          <Link href="/admin/social/queue" className="social-editor-back">
            &larr; Back to queue
          </Link>
          <h1>Create Post</h1>
        </div>
      </div>

      <div className="new-post-layout">
        {/* ===== LEFT: Editor ===== */}
        <div className="new-post-editor">

          {/* 1. Platform Selector */}
          <div className="social-composer-card">
            <h3>Platforms</h3>
            <p className="new-post-hint">Select one or more platforms to post to.</p>
            <div className="new-post-platform-grid">
              {ALL_PLATFORMS.map((p) => {
                const color = PLATFORM_COLORS[p as ExpandedPlatform] || '#6B7280'
                const selected = selectedPlatforms.includes(p)
                return (
                  <label
                    key={p}
                    className={`new-post-platform-item${selected ? ' selected' : ''}`}
                    style={{
                      borderColor: selected ? color : undefined,
                      background: selected ? `${color}0D` : undefined,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => togglePlatform(p)}
                    />
                    <span className="new-post-platform-name">
                      {EXPANDED_PLATFORM_LABELS[p as ExpandedPlatform] || p}
                    </span>
                    <span className="new-post-platform-limit">
                      {EXPANDED_PLATFORM_LIMITS[p as ExpandedPlatform]?.toLocaleString()}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 2. Content Editor */}
          <div className="social-composer-card">
            <h3>Content</h3>
            <textarea
              className="social-composer-textarea"
              placeholder={selectedPlatforms.length > 0
                ? 'Write your post content...'
                : 'Select platforms above, then write your post...'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
            {selectedPlatforms.length > 0 && content.length > 0 && (
              <div className="social-composer-char-counts">
                {selectedPlatforms.map((p) => {
                  const info = charInfoMap[p]
                  if (!info) return null
                  return (
                    <span
                      key={p}
                      className={`social-composer-char-count${info.over ? ' over' : ''}`}
                    >
                      {EXPANDED_PLATFORM_LABELS[p as ExpandedPlatform] || p}: {info.count}/{info.max}
                    </span>
                  )
                })}
              </div>
            )}

            {/* Per-platform adapted content (if transformed) */}
            {Object.keys(perPlatformContent).length > 0 && (
              <div className="new-post-adapted-list">
                <h4 className="new-post-adapted-title">Platform-Adapted Versions</h4>
                {selectedPlatforms.map((p) => {
                  const adapted = perPlatformContent[p]
                  if (!adapted) return null
                  const limit = EXPANDED_PLATFORM_LIMITS[p as ExpandedPlatform] || 5000
                  const isOver = adapted.length > limit
                  return (
                    <div key={p} className="new-post-adapted-card">
                      <div className="new-post-adapted-header">
                        <PlatformChip platform={p} />
                        <span className={`social-composer-char-count${isOver ? ' over' : ''}`}>
                          {adapted.length}/{limit}
                        </span>
                      </div>
                      <textarea
                        className="social-composer-textarea"
                        value={adapted}
                        onChange={(e) =>
                          setPerPlatformContent((prev) => ({ ...prev, [p]: e.target.value }))
                        }
                        rows={Math.max(3, Math.ceil(adapted.length / 80))}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 6. Content Transformer Button */}
          {selectedPlatforms.length > 1 && content.trim().length > 0 && (
            <div className="social-composer-card">
              <h3>Content Transformer</h3>
              <p className="new-post-hint">
                Auto-adapt your content for each selected platform&apos;s format, tone, and character limits.
              </p>
              <button
                type="button"
                className="social-admin-new-btn"
                style={{ width: '100%', textAlign: 'center' }}
                disabled={transforming}
                onClick={handleTransform}
              >
                {transforming ? 'Adapting...' : `Adapt for ${selectedPlatforms.length} Platforms`}
              </button>
              {transformError && (
                <div className="social-editor-status error" style={{ marginTop: 8 }}>
                  {transformError}
                </div>
              )}
            </div>
          )}

          {/* 3. Media Attachments */}
          <div className="social-composer-card">
            <h3>Media</h3>
            <div
              className={`new-post-dropzone${dragOver ? ' active' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              <span className="new-post-dropzone-icon">+</span>
              <span className="new-post-dropzone-text">
                Drop images or videos here, or click to browse
              </span>
            </div>
            {mediaFiles.length > 0 && (
              <div className="new-post-media-grid">
                {mediaFiles.map((m) => (
                  <div key={m.id} className="new-post-media-thumb">
                    {m.type === 'image' ? (
                      <img src={m.previewUrl} alt={m.file.name} />
                    ) : (
                      <video src={m.previewUrl} />
                    )}
                    <button
                      type="button"
                      className="new-post-media-remove"
                      onClick={() => removeMedia(m.id)}
                      aria-label={`Remove ${m.file.name}`}
                    >
                      &times;
                    </button>
                    <span className="new-post-media-name">{m.file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Scheduling */}
          <div className="social-composer-card">
            <h3>Schedule</h3>
            <div className="new-post-schedule-toggle">
              <button
                type="button"
                className={`new-post-schedule-btn${scheduleMode === 'now' ? ' selected' : ''}`}
                onClick={() => setScheduleMode('now')}
              >
                Post Now
              </button>
              <button
                type="button"
                className={`new-post-schedule-btn${scheduleMode === 'schedule' ? ' selected' : ''}`}
                onClick={() => setScheduleMode('schedule')}
              >
                Schedule
              </button>
            </div>
            {scheduleMode === 'schedule' && (
              <div className="new-post-schedule-picker">
                <div>
                  <label className="new-post-label">Date</label>
                  <input
                    type="date"
                    className="social-composer-input"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={minDate}
                  />
                </div>
                <div>
                  <label className="new-post-label">Time</label>
                  <input
                    type="time"
                    className="social-composer-input"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Model Selector */}
          <div className="social-composer-card">
            <ModelSelector
              value={selectedModel}
              onChange={setSelectedModel}
              expanded={false}
            />
          </div>

          {/* Status messages */}
          {error && <div className="social-editor-status error">{error}</div>}
          {success && <div className="social-editor-status success">{success}</div>}

          {/* 7. Submit Actions */}
          <div className="new-post-submit-actions">
            <button
              type="button"
              className="social-editor-save-btn"
              disabled={submitting}
              onClick={() => handleSubmit('draft')}
            >
              {submitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              className="social-editor-schedule-btn"
              disabled={submitting}
              onClick={() => handleSubmit('approval')}
            >
              Submit for Approval
            </button>
            <button
              type="button"
              className="social-editor-publish-btn"
              disabled={submitting}
              onClick={() => handleSubmit('publish')}
            >
              {scheduleMode === 'schedule' && scheduledAt
                ? 'Schedule'
                : 'Publish Now'}
            </button>
          </div>
        </div>

        {/* ===== RIGHT: Preview Panel ===== */}
        <div className="new-post-preview">
          <div className="social-editor-sidebar-card">
            <h3>Preview</h3>
            {selectedPlatforms.length === 0 && (
              <p className="new-post-hint">Select a platform to see a preview.</p>
            )}
            {selectedPlatforms.length > 0 && (
              <>
                <div className="new-post-preview-tabs">
                  {selectedPlatforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`new-post-preview-tab${(previewPlatform || selectedPlatforms[0]) === p ? ' active' : ''}`}
                      onClick={() => setPreviewPlatform(p)}
                    >
                      {EXPANDED_PLATFORM_LABELS[p as ExpandedPlatform] || p}
                    </button>
                  ))}
                </div>
                {(() => {
                  const platform = previewPlatform || selectedPlatforms[0]
                  const previewContent = getContentForPlatform(platform)
                  const color = PLATFORM_COLORS[platform as ExpandedPlatform] || '#6B7280'
                  const limit = EXPANDED_PLATFORM_LIMITS[platform as ExpandedPlatform] || 5000
                  const isOver = previewContent.length > limit
                  return (
                    <div className="new-post-preview-card" style={{ borderColor: color }}>
                      <div className="new-post-preview-chrome">
                        <div
                          className="new-post-preview-avatar"
                          style={{ background: color }}
                        >
                          AF
                        </div>
                        <div>
                          <div className="new-post-preview-author">Alternate Futures</div>
                          <div className="new-post-preview-handle">@altfutures</div>
                        </div>
                      </div>
                      <div className="new-post-preview-content">
                        {previewContent || 'Your post content will appear here...'}
                      </div>
                      {mediaFiles.length > 0 && (
                        <div className="new-post-preview-media">
                          {mediaFiles.slice(0, 4).map((m) => (
                            <div key={m.id} className="new-post-preview-media-item">
                              {m.type === 'image' ? (
                                <img src={m.previewUrl} alt="" />
                              ) : (
                                <video src={m.previewUrl} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="new-post-preview-footer">
                        <PlatformChip platform={platform} />
                        <span className={`social-composer-char-count${isOver ? ' over' : ''}`}>
                          {previewContent.length}/{limit}
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </>
            )}
          </div>

          {/* Summary sidebar card */}
          <div className="social-editor-sidebar-card">
            <h3>Summary</h3>
            <div className="new-post-summary-grid">
              <span className="new-post-summary-label">Platforms</span>
              <span className="new-post-summary-value">{selectedPlatforms.length || '--'}</span>
              <span className="new-post-summary-label">Schedule</span>
              <span className="new-post-summary-value">
                {scheduleMode === 'now'
                  ? 'Immediate'
                  : scheduledAt
                    ? new Date(scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'Not set'}
              </span>
              <span className="new-post-summary-label">Media</span>
              <span className="new-post-summary-value">{mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''}</span>
              <span className="new-post-summary-label">Adapted</span>
              <span className="new-post-summary-value">
                {Object.keys(perPlatformContent).length > 0 ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Dialog */}
      {approvalOpen && (
        <div
          className="social-admin-dialog-overlay"
          onClick={() => setApprovalOpen(false)}
        >
          <div
            className="social-admin-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-post-approval-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="new-post-approval-title">Submit for Approval</h3>
            <p>Select a reviewer for your post{selectedPlatforms.length > 1 ? 's' : ''}.</p>

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
                onClick={handleSubmitApproval}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Send for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
