'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import StatusChip from '@/components/admin/StatusChip'
import TagManager from '@/components/admin/TagManager'
import {
  fetchTags,
  createBlogPost,
  createBlogTag,
  type BlogTag,
} from '@/lib/blog-api'
import { getCookieValue } from '@/lib/cookies'
import '../blog-admin.css'

const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="tiptap-loading">Loading editor...</div>,
})

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function NewPostPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  const [tags, setTags] = useState<BlogTag[]>([])
  const [tagManagerOpen, setTagManagerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    fetchTags().then(setTags)
  }, [])

  // Auto-slug from title
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title))
    }
  }, [title, slugManuallyEdited])

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    )
  }, [])

  const handleSave = useCallback(
    async (publishStatus?: 'DRAFT' | 'PUBLISHED') => {
      if (!title.trim()) {
        setStatusMsg({ type: 'error', text: 'Title is required' })
        return
      }

      setSaving(true)
      setStatusMsg(null)

      try {
        const token = getCookieValue('af_access_token')
        const post = await createBlogPost(token, {
          title: title.trim(),
          slug: slug || slugify(title),
          excerpt: excerpt || undefined,
          content,
          coverImage: coverImage || undefined,
          status: publishStatus || status,
          tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
        })

        setStatusMsg({ type: 'success', text: 'Post created!' })
        setTimeout(() => router.push(`/admin/blog/${post.id}`), 600)
      } catch {
        setStatusMsg({ type: 'error', text: 'Failed to save post' })
      } finally {
        setSaving(false)
      }
    },
    [title, slug, excerpt, content, coverImage, status, selectedTagIds, seoTitle, seoDescription, router],
  )

  const handleCreateTag = useCallback(
    async (name: string, tagSlug: string) => {
      const token = getCookieValue('af_access_token')
      const tag = await createBlogTag(token, name, tagSlug)
      setTags((prev) => [...prev, tag])
    },
    [],
  )

  return (
    <>
      <div className="blog-editor-header">
        <div>
          <Link href="/admin/blog" className="blog-editor-back">
            &larr; Back to posts
          </Link>
          <h1>New Post</h1>
        </div>
      </div>

      <div className="blog-editor-layout">
        {/* Main editor */}
        <div className="blog-editor-main">
          <input
            type="text"
            className="blog-editor-title-input"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="blog-editor-excerpt-input"
            placeholder="Write a short excerpt..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />

          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Write your post content here..."
          />
        </div>

        {/* Sidebar */}
        <div className="blog-editor-sidebar">
          {/* Status & actions */}
          <div className="blog-editor-sidebar-card">
            <h3>Publish</h3>
            <div style={{ marginBottom: 12 }}>
              <StatusChip status={status} />
            </div>
            <div className="blog-editor-actions">
              <button
                className="blog-editor-save-btn"
                disabled={saving}
                onClick={() => handleSave('DRAFT')}
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                className="blog-editor-publish-btn"
                disabled={saving}
                onClick={() => handleSave('PUBLISHED')}
              >
                Publish
              </button>
            </div>
            {statusMsg && (
              <div className={`blog-editor-status ${statusMsg.type}`} style={{ marginTop: 8 }}>
                {statusMsg.text}
              </div>
            )}
          </div>

          {/* Slug */}
          <div className="blog-editor-sidebar-card">
            <h3>URL Slug</h3>
            <input
              type="text"
              className="blog-editor-sidebar-input"
              value={slug}
              onChange={(e) => {
                setSlugManuallyEdited(true)
                setSlug(e.target.value)
              }}
              placeholder="post-url-slug"
            />
          </div>

          {/* Cover image */}
          <div className="blog-editor-sidebar-card">
            <h3>Cover Image</h3>
            <input
              type="text"
              className="blog-editor-sidebar-input"
              placeholder="https://..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
            {coverImage && (
              <div className="blog-editor-cover-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="Cover preview" />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="blog-editor-sidebar-card">
            <h3>Tags</h3>
            <div className="blog-editor-tag-list">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`blog-editor-tag-chip${selectedTagIds.includes(tag.id) ? ' selected' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="blog-editor-manage-tags-btn"
              onClick={() => setTagManagerOpen(true)}
            >
              + Manage tags
            </button>
          </div>

          {/* SEO */}
          <div className="blog-editor-sidebar-card">
            <h3>SEO</h3>
            <label className="blog-editor-sidebar-label">SEO Title</label>
            <input
              type="text"
              className="blog-editor-sidebar-input"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title || 'SEO title'}
            />
            <label className="blog-editor-sidebar-label" style={{ marginTop: 12 }}>
              Meta Description
            </label>
            <textarea
              className="blog-editor-sidebar-textarea"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder={excerpt || 'Meta description'}
            />
          </div>
        </div>
      </div>

      <TagManager
        tags={tags}
        open={tagManagerOpen}
        onClose={() => setTagManagerOpen(false)}
        onCreateTag={handleCreateTag}
      />
    </>
  )
}
