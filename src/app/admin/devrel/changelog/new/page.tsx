'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createChangelogEntry,
  ALL_CHANGELOG_TYPES,
  CHANGELOG_TYPE_STYLES,
  type ChangelogEntryType,
  type CreateChangelogInput,
} from '@/lib/changelog-api'
import { getCookieValue } from '@/lib/cookies'
import '../../devrel-admin.css'

export default function NewChangelogEntry() {
  const router = useRouter()
  const [version, setVersion] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ChangelogEntryType>('feature')
  const [author, setAuthor] = useState('')
  const [relatedPRs, setRelatedPRs] = useState('')
  const [relatedIssues, setRelatedIssues] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!version.trim() || !title.trim() || !description.trim() || !author.trim()) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' })
      return
    }

    setSaving(true)
    setStatus(null)

    try {
      const token = getCookieValue('af_access_token')
      const input: CreateChangelogInput = {
        version: version.trim(),
        title: title.trim(),
        description: description.trim(),
        type,
        author: author.trim(),
        relatedPRs: relatedPRs.trim() ? relatedPRs.split(',').map((s) => s.trim()) : [],
        relatedIssues: relatedIssues.trim() ? relatedIssues.split(',').map((s) => s.trim()) : [],
        tags: tags.trim() ? tags.split(',').map((s) => s.trim()) : [],
      }
      await createChangelogEntry(token, input)
      setStatus({ type: 'success', message: 'Changelog entry created.' })
      setTimeout(() => router.push('/admin/devrel/changelog'), 1000)
    } catch {
      setStatus({ type: 'error', message: 'Failed to create entry. Please try again.' })
    } finally {
      setSaving(false)
    }
  }, [version, title, description, type, author, relatedPRs, relatedIssues, tags, router])

  return (
    <>
      <div className="devrel-admin-header">
        <div>
          <Link href="/admin/devrel/changelog" className="devrel-admin-back">
            &larr; Changelog
          </Link>
          <h1 style={{ marginTop: 8 }}>New Changelog Entry</h1>
        </div>
      </div>

      {status && (
        <div className={`devrel-form-status ${status.type}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="devrel-form-group">
          <label className="devrel-form-label">Version *</label>
          <input
            type="text"
            className="devrel-form-input"
            placeholder="e.g. 0.8.1"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>

        <div className="devrel-form-group">
          <label className="devrel-form-label">Title *</label>
          <input
            type="text"
            className="devrel-form-input"
            placeholder="e.g. Add WebSocket support for real-time deploy logs"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="devrel-form-group">
          <label className="devrel-form-label">Description *</label>
          <textarea
            className="devrel-form-textarea"
            placeholder="Describe the change in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="devrel-form-group">
          <label className="devrel-form-label">Type *</label>
          <select
            className="devrel-form-select"
            value={type}
            onChange={(e) => setType(e.target.value as ChangelogEntryType)}
          >
            {ALL_CHANGELOG_TYPES.map((t) => (
              <option key={t} value={t}>
                {CHANGELOG_TYPE_STYLES[t].label}
              </option>
            ))}
          </select>
        </div>

        <div className="devrel-form-group">
          <label className="devrel-form-label">Author *</label>
          <input
            type="text"
            className="devrel-form-input"
            placeholder="e.g. Senku"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        <div className="devrel-form-group">
          <label className="devrel-form-label">Related PRs (comma-separated)</label>
          <input
            type="text"
            className="devrel-form-input"
            placeholder="e.g. #142, #145"
            value={relatedPRs}
            onChange={(e) => setRelatedPRs(e.target.value)}
          />
        </div>

        <div className="devrel-form-group">
          <label className="devrel-form-label">Related Issues (comma-separated)</label>
          <input
            type="text"
            className="devrel-form-input"
            placeholder="e.g. #108, #112"
            value={relatedIssues}
            onChange={(e) => setRelatedIssues(e.target.value)}
          />
        </div>

        <div className="devrel-form-group">
          <label className="devrel-form-label">Tags (comma-separated)</label>
          <input
            type="text"
            className="devrel-form-input"
            placeholder="e.g. deploy, performance, cli"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="devrel-form-actions">
          <Link href="/admin/devrel/changelog" className="devrel-form-cancel">
            Cancel
          </Link>
          <button
            type="submit"
            className="devrel-form-submit"
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Entry'}
          </button>
        </div>
      </form>
    </>
  )
}
