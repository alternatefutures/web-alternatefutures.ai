'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useDialog } from '@/hooks/useDialog'
import { EmptyStateDecoration, WaveDivider } from '@/components/admin/ShapeDecoration'
import '../blog-admin.css'

type ContentBrief = {
  id: string
  title: string
  status: 'draft' | 'assigned' | 'in-progress' | 'review' | 'published'
  contentType: 'blog' | 'tutorial' | 'case-study' | 'whitepaper'
  targetKeywords: string[]
  assignedWriter: string
  assignedReviewer: string
  deadline: string
  wordCountTarget: number
  wordCountCurrent: number
  checklist: { label: string; done: boolean }[]
  createdAt: string
  updatedAt: string
}

const STATUS_STYLES: Record<ContentBrief['status'], { bg: string; color: string; label: string }> = {
  draft: { bg: '#FEF3C7', color: '#92400E', label: 'Draft' },
  assigned: { bg: '#E0E7FF', color: '#3730A3', label: 'Assigned' },
  'in-progress': { bg: '#DBEAFE', color: '#1E40AF', label: 'In Progress' },
  review: { bg: '#FDE68A', color: '#78350F', label: 'Review' },
  published: { bg: '#D1FAE5', color: '#065F46', label: 'Published' },
}

const TYPE_LABELS: Record<ContentBrief['contentType'], string> = {
  blog: 'Blog Post',
  tutorial: 'Tutorial',
  'case-study': 'Case Study',
  whitepaper: 'Whitepaper',
}

const SAMPLE_BRIEFS: ContentBrief[] = [
  {
    id: '1',
    title: 'Getting Started with Decentralized Hosting',
    status: 'published',
    contentType: 'tutorial',
    targetKeywords: ['decentralized hosting', 'IPFS deploy', 'web3 hosting'],
    assignedWriter: 'Content Team',
    assignedReviewer: 'DevRel Lead',
    deadline: '2026-02-01',
    wordCountTarget: 2000,
    wordCountCurrent: 2150,
    checklist: [
      { label: 'Research complete', done: true },
      { label: 'Outline approved', done: true },
      { label: 'First draft', done: true },
      { label: 'SEO review', done: true },
      { label: 'Final edit', done: true },
    ],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-01T14:30:00Z',
  },
  {
    id: '2',
    title: 'IPFS vs Traditional CDN Performance Benchmark',
    status: 'in-progress',
    contentType: 'blog',
    targetKeywords: ['IPFS performance', 'CDN comparison', 'decentralized CDN'],
    assignedWriter: 'DevRel',
    assignedReviewer: 'Content Lead',
    deadline: '2026-02-15',
    wordCountTarget: 1500,
    wordCountCurrent: 800,
    checklist: [
      { label: 'Research complete', done: true },
      { label: 'Outline approved', done: true },
      { label: 'First draft', done: false },
      { label: 'SEO review', done: false },
      { label: 'Final edit', done: false },
    ],
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
  },
  {
    id: '3',
    title: 'Migrating from Vercel to AlternateFutures',
    status: 'assigned',
    contentType: 'case-study',
    targetKeywords: ['migrate vercel', 'platform migration', 'decentralized alternative'],
    assignedWriter: 'Marketing',
    assignedReviewer: 'DevRel Lead',
    deadline: '2026-02-28',
    wordCountTarget: 2500,
    wordCountCurrent: 0,
    checklist: [
      { label: 'Research complete', done: false },
      { label: 'Outline approved', done: false },
      { label: 'First draft', done: false },
      { label: 'SEO review', done: false },
      { label: 'Final edit', done: false },
    ],
    createdAt: '2026-02-05T08:00:00Z',
    updatedAt: '2026-02-05T08:00:00Z',
  },
  {
    id: '4',
    title: 'AI Agent Deployment Architecture',
    status: 'review',
    contentType: 'whitepaper',
    targetKeywords: ['AI agent deploy', 'decentralized AI', 'agent architecture'],
    assignedWriter: 'Content Team',
    assignedReviewer: 'Technical Lead',
    deadline: '2026-02-20',
    wordCountTarget: 4000,
    wordCountCurrent: 3800,
    checklist: [
      { label: 'Research complete', done: true },
      { label: 'Outline approved', done: true },
      { label: 'First draft', done: true },
      { label: 'SEO review', done: true },
      { label: 'Final edit', done: false },
    ],
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-02-13T16:00:00Z',
  },
  {
    id: '5',
    title: 'Serverless Functions on Decentralized Infra',
    status: 'draft',
    contentType: 'blog',
    targetKeywords: ['serverless decentralized', 'edge functions', 'akash serverless'],
    assignedWriter: 'Unassigned',
    assignedReviewer: '',
    deadline: '2026-03-10',
    wordCountTarget: 1800,
    wordCountCurrent: 0,
    checklist: [
      { label: 'Research complete', done: false },
      { label: 'Outline approved', done: false },
      { label: 'First draft', done: false },
      { label: 'SEO review', done: false },
      { label: 'Final edit', done: false },
    ],
    createdAt: '2026-02-12T10:00:00Z',
    updatedAt: '2026-02-12T10:00:00Z',
  },
]

export default function ContentBriefsManager() {
  const [briefs, setBriefs] = useState<ContentBrief[]>(SAMPLE_BRIEFS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [expandedBrief, setExpandedBrief] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContentBrief | null>(null)
  const [deleting, setDeleting] = useState(false)
  const deleteDialogRef = useDialog(!!deleteTarget, () => setDeleteTarget(null))

  const filtered = useMemo(() => {
    let result = briefs
    if (statusFilter !== 'ALL') {
      result = result.filter((b) => b.status === statusFilter)
    }
    if (typeFilter !== 'ALL') {
      result = result.filter((b) => b.contentType === typeFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.assignedWriter.toLowerCase().includes(q) ||
          b.targetKeywords.some((k) => k.toLowerCase().includes(q)),
      )
    }
    return result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }, [briefs, statusFilter, typeFilter, search])

  const stats = useMemo(() => ({
    total: briefs.length,
    draft: briefs.filter((b) => b.status === 'draft').length,
    inProgress: briefs.filter((b) => b.status === 'in-progress' || b.status === 'assigned').length,
    review: briefs.filter((b) => b.status === 'review').length,
    published: briefs.filter((b) => b.status === 'published').length,
  }), [briefs])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setBriefs((prev) => prev.filter((b) => b.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }, [deleteTarget])

  const toggleChecklist = useCallback((briefId: string, idx: number) => {
    setBriefs((prev) =>
      prev.map((b) => {
        if (b.id !== briefId) return b
        const checklist = b.checklist.map((c, i) =>
          i === idx ? { ...c, done: !c.done } : c
        )
        return { ...b, checklist }
      })
    )
  }, [])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function checklistProgress(checklist: ContentBrief['checklist']) {
    const done = checklist.filter((c) => c.done).length
    return { done, total: checklist.length, pct: Math.round((done / checklist.length) * 100) }
  }

  return (
    <>
      <div className="blog-admin-header">
        <div>
          <Link href="/admin/blog" className="blog-editor-back">
            &larr; Blog
          </Link>
          <h1 style={{ marginTop: 8 }}>Content Briefs</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/blog/calendar" className="blog-admin-action-btn">
            Calendar
          </Link>
          <Link href="/admin/blog/briefs/new" className="blog-admin-new-btn">
            + New Brief
          </Link>
        </div>
      </div>

      <div className="blog-admin-stats">
        <div className="blog-admin-stat-card">
          <div className="blog-admin-stat-label">Total Briefs</div>
          <div className="blog-admin-stat-value">{stats.total}</div>
        </div>
        <div className="blog-admin-stat-card">
          <div className="blog-admin-stat-label">Drafts</div>
          <div className="blog-admin-stat-value">{stats.draft}</div>
        </div>
        <div className="blog-admin-stat-card">
          <div className="blog-admin-stat-label">In Progress</div>
          <div className="blog-admin-stat-value">{stats.inProgress}</div>
        </div>
        <div className="blog-admin-stat-card">
          <div className="blog-admin-stat-label">In Review</div>
          <div className="blog-admin-stat-value">{stats.review}</div>
        </div>
        <div className="blog-admin-stat-card">
          <div className="blog-admin-stat-label">Published</div>
          <div className="blog-admin-stat-value">{stats.published}</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <div className="blog-admin-filters">
        <input
          type="text"
          className="blog-admin-search"
          placeholder="Search briefs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="blog-admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="draft">Draft</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="published">Published</option>
        </select>
        <select
          className="blog-admin-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All types</option>
          <option value="blog">Blog Post</option>
          <option value="tutorial">Tutorial</option>
          <option value="case-study">Case Study</option>
          <option value="whitepaper">Whitepaper</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyStateDecoration
          page="blog"
          theme="warm"
          heading={briefs.length === 0 ? 'No content briefs yet' : 'No briefs found'}
          message={briefs.length === 0 ? 'Create your first content brief to get started.' : 'Try adjusting your search or filters.'}
        />
      ) : (
        <div className="blog-admin-table-wrap">
          <table className="blog-admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Type</th>
                <th>Writer</th>
                <th>Progress</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((brief) => {
                const s = STATUS_STYLES[brief.status]
                const progress = checklistProgress(brief.checklist)
                const isExpanded = expandedBrief === brief.id

                return (
                  <>
                    <tr key={brief.id}>
                      <td>
                        <div className="blog-admin-post-title">{brief.title}</div>
                        <div className="blog-admin-tags-cell" style={{ marginTop: 4 }}>
                          {brief.targetKeywords.slice(0, 2).map((kw) => (
                            <span key={kw} className="blog-admin-tag-chip">{kw}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '50px',
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: '"Instrument Sans", sans-serif',
                            background: s.bg,
                            color: s.color,
                          }}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontFamily: '"Instrument Sans", sans-serif',
                          fontSize: 13,
                        }}>
                          {TYPE_LABELS[brief.contentType]}
                        </span>
                      </td>
                      <td>{brief.assignedWriter}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            flex: 1,
                            height: 6,
                            background: 'var(--color-border, #E5E7EB)',
                            borderRadius: 3,
                            overflow: 'hidden',
                            minWidth: 60,
                          }}>
                            <div style={{
                              width: `${progress.pct}%`,
                              height: '100%',
                              background: progress.pct === 100 ? '#10B981' : 'var(--color-blue, #000AFF)',
                              borderRadius: 3,
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                          <span style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: 11,
                            color: 'var(--color-text-gray, #6B7280)',
                            whiteSpace: 'nowrap',
                          }}>
                            {progress.done}/{progress.total}
                          </span>
                        </div>
                      </td>
                      <td>{formatDate(brief.deadline)}</td>
                      <td>
                        <div className="blog-admin-actions">
                          <button
                            className="blog-admin-action-btn"
                            onClick={() => setExpandedBrief(isExpanded ? null : brief.id)}
                          >
                            {isExpanded ? 'Close' : 'Details'}
                          </button>
                          <button
                            className="blog-admin-action-btn danger"
                            onClick={() => setDeleteTarget(brief)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${brief.id}-detail`}>
                        <td colSpan={7} style={{ padding: '16px 24px', background: 'var(--color-bg-light, #F9FAFB)' }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: 24,
                          }}>
                            <div>
                              <div style={{
                                fontFamily: '"Instrument Sans", sans-serif',
                                fontSize: 12,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--color-text-gray, #6B7280)',
                                marginBottom: 8,
                              }}>
                                Keywords
                              </div>
                              <div className="blog-admin-tags-cell" style={{ gap: 6 }}>
                                {brief.targetKeywords.map((kw) => (
                                  <span key={kw} className="blog-admin-tag-chip">{kw}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div style={{
                                fontFamily: '"Instrument Sans", sans-serif',
                                fontSize: 12,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--color-text-gray, #6B7280)',
                                marginBottom: 8,
                              }}>
                                Word Count
                              </div>
                              <div style={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: 14,
                                color: 'var(--color-text-dark, #1F2937)',
                              }}>
                                {brief.wordCountCurrent.toLocaleString()} / {brief.wordCountTarget.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div style={{
                                fontFamily: '"Instrument Sans", sans-serif',
                                fontSize: 12,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--color-text-gray, #6B7280)',
                                marginBottom: 8,
                              }}>
                                Reviewer
                              </div>
                              <div style={{
                                fontFamily: '"Instrument Sans", sans-serif',
                                fontSize: 14,
                                color: 'var(--color-text-dark, #1F2937)',
                              }}>
                                {brief.assignedReviewer || 'Unassigned'}
                              </div>
                            </div>
                          </div>
                          <div style={{ marginTop: 16 }}>
                            <div style={{
                              fontFamily: '"Instrument Sans", sans-serif',
                              fontSize: 12,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              color: 'var(--color-text-gray, #6B7280)',
                              marginBottom: 8,
                            }}>
                              Checklist
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {brief.checklist.map((item, idx) => (
                                <label
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontFamily: '"Instrument Sans", sans-serif',
                                    fontSize: 13,
                                    color: item.done ? 'var(--color-text-gray, #6B7280)' : 'var(--color-text-dark, #1F2937)',
                                    textDecoration: item.done ? 'line-through' : 'none',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.done}
                                    onChange={() => toggleChecklist(brief.id, idx)}
                                    style={{ accentColor: 'var(--color-blue, #000AFF)' }}
                                  />
                                  {item.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
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
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="brief-delete-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="brief-delete-dialog-title">Delete content brief?</h3>
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
