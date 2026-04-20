'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDialog } from '@/hooks/useDialog'
import Link from 'next/link'
import { EmptyStateDecoration, WaveDivider } from '@/components/admin/ShapeDecoration'
import {
  fetchAllChangelog,
  deleteChangelogEntry,
  CHANGELOG_TYPE_STYLES,
  ALL_CHANGELOG_TYPES,
  type ChangelogEntry,
  type ChangelogEntryType,
} from '@/lib/changelog-api'
import { getCookieValue } from '@/lib/cookies'
import '../devrel-admin.css'

export default function ChangelogManagement() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [versionFilter, setVersionFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ChangelogEntry | null>(null)
  const [deleting, setDeleting] = useState(false)
  const deleteDialogRef = useDialog(!!deleteTarget, () => setDeleteTarget(null))

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const data = await fetchAllChangelog(token)
        setEntries(data)
      } catch {
        setLoadError('Failed to load changelog. Please refresh to try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const versions = useMemo(() => {
    const set = new Set(entries.map((e) => e.version))
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [entries])

  const filtered = useMemo(() => {
    let result = entries
    if (typeFilter !== 'ALL') {
      result = result.filter((e) => e.type === typeFilter)
    }
    if (versionFilter) {
      result = result.filter((e) => e.version === versionFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.author.toLowerCase().includes(q),
      )
    }
    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [entries, typeFilter, versionFilter, search])

  const stats = useMemo(
    () => ({
      total: entries.length,
      features: entries.filter((e) => e.type === 'feature').length,
      fixes: entries.filter((e) => e.type === 'fix').length,
      breaking: entries.filter((e) => e.type === 'breaking').length,
    }),
    [entries],
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteChangelogEntry(token, deleteTarget.id)
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    } catch {
      setLoadError('Failed to delete entry. Please try again.')
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
    return <div className="devrel-admin-empty"><p>Loading changelog...</p></div>
  }

  if (loadError) {
    return (
      <div className="devrel-admin-empty">
        <h2>Error</h2>
        <p>{loadError}</p>
        <button
          className="devrel-admin-new-btn"
          onClick={() => window.location.reload()}
          style={{ marginTop: 12 }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="devrel-admin-header">
        <div>
          <Link href="/admin/devrel" className="devrel-admin-back">
            &larr; DevRel
          </Link>
          <h1 style={{ marginTop: 8 }}>Changelog</h1>
        </div>
        <Link href="/admin/devrel/changelog/new" className="devrel-admin-new-btn">
          + New Entry
        </Link>
      </div>

      <div className="devrel-admin-stats">
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Total Entries</div>
          <div className="devrel-admin-stat-value">{stats.total}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Features</div>
          <div className="devrel-admin-stat-value">{stats.features}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Fixes</div>
          <div className="devrel-admin-stat-value">{stats.fixes}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Breaking</div>
          <div className="devrel-admin-stat-value">{stats.breaking}</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <div className="devrel-admin-filters">
        <input
          type="text"
          className="devrel-admin-search"
          placeholder="Search changelog..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="devrel-admin-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All types</option>
          {ALL_CHANGELOG_TYPES.map((t) => (
            <option key={t} value={t}>
              {CHANGELOG_TYPE_STYLES[t].label}
            </option>
          ))}
        </select>
        <select
          className="devrel-admin-select"
          value={versionFilter}
          onChange={(e) => setVersionFilter(e.target.value)}
        >
          <option value="">All versions</option>
          {versions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyStateDecoration
          page="devrel"
          theme="warm"
          heading={entries.length === 0 ? 'No changelog entries yet' : 'No entries found'}
          message={entries.length === 0 ? undefined : 'Try adjusting your search or filters.'}
        />
      ) : (
        <div className="devrel-admin-table-wrap">
          <table className="devrel-admin-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Title</th>
                <th>Type</th>
                <th>Author</th>
                <th>PRs</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const style = CHANGELOG_TYPE_STYLES[entry.type as ChangelogEntryType]
                return (
                  <tr key={entry.id}>
                    <td>
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                        {entry.version}
                      </span>
                    </td>
                    <td style={{ maxWidth: 300 }}>{entry.title}</td>
                    <td>
                      <span
                        className="devrel-type-chip"
                        style={{ background: style.bg, color: style.color }}
                      >
                        {style.label}
                      </span>
                    </td>
                    <td>{entry.author}</td>
                    <td>
                      <div className="devrel-admin-tags-cell">
                        {entry.relatedPRs.map((pr) => (
                          <span key={pr} className="devrel-admin-tag-chip">{pr}</span>
                        ))}
                      </div>
                    </td>
                    <td>{formatDate(entry.date)}</td>
                    <td>
                      <div className="devrel-admin-actions">
                        <button
                          className="devrel-admin-action-btn danger"
                          onClick={() => setDeleteTarget(entry)}
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
          className="devrel-admin-dialog-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="devrel-admin-dialog"
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cl-delete-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="cl-delete-dialog-title">Delete changelog entry?</h3>
            <p>
              Are you sure you want to delete &ldquo;{deleteTarget.title}&rdquo;?
              This action cannot be undone.
            </p>
            <div className="devrel-admin-dialog-actions">
              <button
                className="devrel-admin-dialog-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="devrel-admin-dialog-delete"
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
