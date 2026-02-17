'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PlatformChip from '@/components/admin/PlatformChip'
import {
  createSocialPost,
  PLATFORM_LIMITS,
  type SocialPlatform,
} from '@/lib/social-api'
import { getCookieValue } from '@/lib/cookies'
import ModelSelector from '@/components/admin/ModelSelector'
import { getRecommendedModel } from '@/lib/model-registry-api'
import '../social-admin.css'

const ALL_PLATFORMS: SocialPlatform[] = [
  'X', 'BLUESKY', 'MASTODON', 'LINKEDIN', 'REDDIT', 'DISCORD',
  'TELEGRAM', 'THREADS', 'INSTAGRAM', 'FACEBOOK',
]

export default function NewQuickPostPage() {
  const router = useRouter()
  const [platform, setPlatform] = useState<SocialPlatform | null>(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedModel, setSelectedModel] = useState<string | null>(() => getRecommendedModel().id)

  const charInfo = useMemo(() => {
    if (!platform) return null
    const limit = PLATFORM_LIMITS.find((pl) => pl.platform === platform)
    if (!limit) return null
    return {
      count: content.length,
      max: limit.maxChars,
      over: content.length > limit.maxChars,
    }
  }, [platform, content])

  async function handleSave() {
    if (!platform) {
      setError('Pick a platform first')
      return
    }
    if (!content.trim()) {
      setError('Content is required')
      return
    }
    if (charInfo && charInfo.over) {
      setError(`Content exceeds ${charInfo.max} character limit for ${platform}`)
      return
    }

    setSaving(true)
    setError('')

    try {
      const token = getCookieValue('af_access_token')
      const post = await createSocialPost(token, {
        platform,
        content: content.trim(),
        status: 'DRAFT',
        model_used: selectedModel || undefined,
      })
      router.push(`/admin/social/${post.id}`)
    } catch {
      setError('Failed to create post')
      setSaving(false)
    }
  }

  return (
    <>
      <div className="social-editor-header">
        <div>
          <Link href="/admin/social/queue" className="social-editor-back">
            &larr; Back to queue
          </Link>
          <h1>New Post</h1>
        </div>
      </div>

      <div className="social-composer-layout">
        <div className="social-composer-card">
          <h3>Platform</h3>
          <div className="social-quickpost-platform-grid">
            {ALL_PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                className={`social-quickpost-platform-btn${platform === p ? ' selected' : ''}`}
                onClick={() => setPlatform(p)}
              >
                <PlatformChip platform={p} />
              </button>
            ))}
          </div>
        </div>

        <div className="social-composer-card">
          <h3>Content</h3>
          <textarea
            className="social-composer-textarea"
            placeholder={platform ? `Write your ${platform} post...` : 'Pick a platform first, then write your post...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />
          {charInfo && (
            <div className="social-composer-char-counts">
              <span className={`social-composer-char-count${charInfo.over ? ' over' : ''}`}>
                {charInfo.count}/{charInfo.max}
              </span>
            </div>
          )}
        </div>

        <div className="social-composer-card">
          <ModelSelector
            value={selectedModel}
            onChange={setSelectedModel}
            expanded={false}
          />
        </div>

        {error && (
          <div className="social-editor-status error">{error}</div>
        )}

        <button
          className="social-admin-new-btn"
          style={{ width: '100%', textAlign: 'center' }}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? 'Saving...' : 'Save as Draft'}
        </button>
      </div>
    </>
  )
}
