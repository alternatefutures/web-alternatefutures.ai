'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { marked } from 'marked'
import StatusChip from '@/components/admin/StatusChip'
import { fetchPostById, type BlogPost } from '@/lib/blog-api'
import '../../../../blog/blog.css'
import { getCookieValue } from '@/lib/cookies'
import '../../blog-admin.css'

export default function PreviewPostPage() {
  const params = useParams<{ id: string }>()
  const postId = params.id

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchPostById(token, postId)
      setPost(data)
      setLoading(false)
    }
    load()
  }, [postId])

  if (loading) {
    return <div className="blog-admin-empty"><p>Loading preview...</p></div>
  }

  if (!post) {
    return (
      <div className="blog-admin-empty">
        <h2>Post not found</h2>
        <p>
          <Link href="/admin/blog" className="blog-editor-back">
            &larr; Back to posts
          </Link>
        </p>
      </div>
    )
  }

  function formatDate(iso: string | null) {
    if (!iso) return 'Not published'
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const htmlContent = (marked.parse(post.content) as string)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '')

  return (
    <>
      <div className="blog-editor-header">
        <div>
          <Link href={`/admin/blog/${postId}`} className="blog-editor-back">
            &larr; Back to editor
          </Link>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            Preview <StatusChip status={post.status} />
          </h1>
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-cream, #F8F5EE)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '40px 30px',
          maxWidth: 840,
        }}
      >
        <div className="blog-post-detail">
          {post.coverImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={post.coverImage}
              alt={post.title}
              className="blog-post-cover"
            />
          )}

          {post.tags.length > 0 && (
            <div className="blog-post-tags">
              {post.tags.map((tag) => (
                <span key={tag.id} className="blog-tag-chip">
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="blog-post-title">{post.title}</h1>

          <div className="blog-post-meta">
            <span className="blog-post-author">{post.authorName}</span>
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            {post.readingTimeMin && <span>{post.readingTimeMin} min read</span>}
          </div>

          <div
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </>
  )
}
