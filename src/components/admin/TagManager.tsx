'use client'

import { useState, useCallback, type FormEvent } from 'react'
import { useDialog } from '@/hooks/useDialog'
import type { BlogTag } from '@/lib/blog-api'

interface TagManagerProps {
  tags: BlogTag[]
  open: boolean
  onClose: () => void
  onCreateTag: (name: string, slug: string) => Promise<void>
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function TagManager({ tags, open, onClose, onCreateTag }: TagManagerProps) {
  const dialogRef = useDialog(open, onClose)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!name.trim()) return

      const slug = slugify(name)
      if (tags.some((t) => t.slug === slug)) {
        setError('A tag with this slug already exists')
        return
      }

      setError('')
      setLoading(true)
      try {
        await onCreateTag(name.trim(), slug)
        setName('')
      } catch {
        setError('Failed to create tag')
      } finally {
        setLoading(false)
      }
    },
    [name, tags, onCreateTag],
  )

  if (!open) return null

  return (
    <div className="tag-manager-overlay" onClick={onClose}>
      <div
        className="tag-manager-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tag-manager-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tag-manager-header">
          <h3 id="tag-manager-title">Manage Tags</h3>
          <button className="tag-manager-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form className="tag-manager-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="tag-manager-input"
            placeholder="New tag name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            aria-label="New tag name"
          />
          <button
            type="submit"
            className="tag-manager-add-btn"
            disabled={loading || !name.trim()}
          >
            {loading ? '...' : 'Add'}
          </button>
        </form>

        {error && <div className="tag-manager-error">{error}</div>}

        <div className="tag-manager-list">
          {tags.map((tag) => (
            <div key={tag.id} className="tag-manager-item">
              <span className="tag-manager-item-name">{tag.name}</span>
              <span className="tag-manager-item-slug">{tag.slug}</span>
            </div>
          ))}
          {tags.length === 0 && (
            <p className="tag-manager-empty">No tags yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
