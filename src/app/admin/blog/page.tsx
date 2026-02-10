'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import StatusChip from '@/components/admin/StatusChip'
import {
  fetchAllPosts,
  fetchTags,
  deleteBlogPost,
  type BlogPost,
  type BlogTag,
} from '@/lib/blog-api'
import './blog-admin.css'

function getCookieValue(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

export default function BlogAdminDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [tagFilter, setTagFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [postsData, tagsData] = await Promise.all([
        fetchAllPosts(token),
        fetchTags(),
      ])
      setPosts(postsData)
      setTags(tagsData)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = posts
    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter)
    }
    if (tagFilter) {
      result = result.filter((p) => p.tags.some((t) => t.slug === tagFilter))
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q),
      )
    }
    return result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }, [posts, statusFilter, tagFilter, search])

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((p) => p.status === 'PUBLISHED').length,
      drafts: posts.filter((p) => p.status === 'DRAFT').length,
    }),
    [posts],
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteBlogPost(token, deleteTarget.id)
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    } catch {
      // silent — TODO: toast
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

  if (loading) {
    return <div className="blog-admin-empty"><p>Loading posts...</p></div>
  }

  return (
    <>
      <div className="blog-admin-header">
        <h1>Blog Posts</h1>
        <Link href="/admin/blog/new" className="blog-admin-new-btn">
          + New Post
        </Link>
      </div>

      <div className="blog-admin-stats">
        <div className="blog-admin-stat-card">
          <div className="blog-admin-stat-label">Total Posts</div>
          <div className="blog-admin-stat-value">{stats.total}</div>
        </div>
        <div className="blog-admin-stat-card">
          <div className="blog-admin-stat-label">Published</div>
          <div className="blog-admin-stat-value">{stats.published}</div>
        </div>
        <div className="blog-admin-stat-card">
          <div className="blog-admin-stat-label">Drafts</div>
          <div className="blog-admin-stat-value">{stats.drafts}</div>
        </div>
      </div>

      <div className="blog-admin-filters">
        <input
          type="text"
          className="blog-admin-search"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="blog-admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select
          className="blog-admin-select"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="blog-admin-empty">
          <h2>No posts found</h2>
          <p>
            {posts.length === 0
              ? 'Create your first blog post to get started.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="blog-admin-table-wrap">
          <table className="blog-admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Author</th>
                <th>Tags</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="blog-admin-post-title">{post.title}</div>
                  </td>
                  <td>
                    <StatusChip status={post.status} />
                  </td>
                  <td>{post.authorName}</td>
                  <td>
                    <div className="blog-admin-tags-cell">
                      {post.tags.slice(0, 3).map((t) => (
                        <span key={t.id} className="blog-admin-tag-chip">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{formatDate(post.updatedAt)}</td>
                  <td>
                    <div className="blog-admin-actions">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="blog-admin-action-btn"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/blog/${post.id}/preview`}
                        className="blog-admin-action-btn"
                      >
                        Preview
                      </Link>
                      <button
                        className="blog-admin-action-btn danger"
                        onClick={() => setDeleteTarget(post)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div
          className="blog-admin-dialog-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="blog-admin-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete post?</h3>
            <p>
              Are you sure you want to delete &ldquo;{deleteTarget.title}&rdquo;?
              This action cannot be undone.
            </p>
            <div className="blog-admin-dialog-actions">
              <button
                className="blog-admin-dialog-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="blog-admin-dialog-delete"
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
