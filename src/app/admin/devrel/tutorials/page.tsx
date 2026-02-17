'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useDialog } from '@/hooks/useDialog'
import { EmptyStateDecoration, WaveDivider } from '@/components/admin/ShapeDecoration'
import '../devrel-admin.css'

type TutorialStep = {
  title: string
  codeSnippet: string
  expectedOutput: string
}

type Tutorial = {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  series: string
  status: 'draft' | 'published' | 'archived'
  steps: TutorialStep[]
  views: number
  completionRate: number
  lastUpdated: string
  createdAt: string
}

const DIFFICULTY_STYLES: Record<Tutorial['difficulty'], { bg: string; color: string }> = {
  beginner: { bg: '#D1FAE5', color: '#065F46' },
  intermediate: { bg: '#DBEAFE', color: '#1E40AF' },
  advanced: { bg: '#FEE2E2', color: '#991B1B' },
}

const STATUS_STYLES: Record<Tutorial['status'], { bg: string; color: string; label: string }> = {
  draft: { bg: '#FEF3C7', color: '#92400E', label: 'Draft' },
  published: { bg: '#D1FAE5', color: '#065F46', label: 'Published' },
  archived: { bg: '#F3F4F6', color: '#6B7280', label: 'Archived' },
}

const SAMPLE_TUTORIALS: Tutorial[] = [
  {
    id: '1',
    title: 'Deploy Your First Site',
    difficulty: 'beginner',
    series: 'Getting Started',
    status: 'published',
    steps: [
      { title: 'Install the CLI', codeSnippet: 'npm install -g @alternatefutures/cli', expectedOutput: 'added 1 package' },
      { title: 'Login', codeSnippet: 'af login', expectedOutput: 'Successfully authenticated' },
      { title: 'Initialize Project', codeSnippet: 'af init', expectedOutput: 'Project initialized' },
      { title: 'Deploy', codeSnippet: 'af deploy', expectedOutput: 'Deployed to IPFS' },
    ],
    views: 2340,
    completionRate: 78,
    lastUpdated: '2026-02-10T10:00:00Z',
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: '2',
    title: 'Configure Custom Domain',
    difficulty: 'beginner',
    series: 'Getting Started',
    status: 'published',
    steps: [
      { title: 'Add Domain', codeSnippet: 'af domains add example.com', expectedOutput: 'Domain added' },
      { title: 'Verify DNS', codeSnippet: 'af domains verify example.com', expectedOutput: 'DNS verified' },
      { title: 'Enable SSL', codeSnippet: 'af domains ssl example.com', expectedOutput: 'SSL certificate issued' },
    ],
    views: 1560,
    completionRate: 85,
    lastUpdated: '2026-02-05T14:00:00Z',
    createdAt: '2026-01-10T12:00:00Z',
  },
  {
    id: '3',
    title: 'Serverless Functions with TypeScript',
    difficulty: 'intermediate',
    series: 'Serverless',
    status: 'published',
    steps: [
      { title: 'Create Function', codeSnippet: 'af functions create hello --runtime ts', expectedOutput: 'Function created' },
      { title: 'Write Handler', codeSnippet: 'export default (req: Request) => new Response("Hello")', expectedOutput: '' },
      { title: 'Deploy Function', codeSnippet: 'af functions deploy hello', expectedOutput: 'Function deployed' },
      { title: 'Test Function', codeSnippet: 'curl https://fn.alternatefutures.ai/hello', expectedOutput: 'Hello' },
    ],
    views: 980,
    completionRate: 62,
    lastUpdated: '2026-01-28T09:00:00Z',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '4',
    title: 'IPFS Pinning Strategies',
    difficulty: 'advanced',
    series: 'Storage Deep Dives',
    status: 'draft',
    steps: [
      { title: 'Understanding CIDs', codeSnippet: '', expectedOutput: '' },
      { title: 'Multi-provider Pinning', codeSnippet: '', expectedOutput: '' },
      { title: 'Garbage Collection', codeSnippet: '', expectedOutput: '' },
    ],
    views: 0,
    completionRate: 0,
    lastUpdated: '2026-02-12T16:00:00Z',
    createdAt: '2026-02-12T16:00:00Z',
  },
  {
    id: '5',
    title: 'Deploy AI Agent on Akash',
    difficulty: 'advanced',
    series: 'AI Agents',
    status: 'draft',
    steps: [
      { title: 'Write Agent SDL', codeSnippet: '', expectedOutput: '' },
      { title: 'Create Deployment', codeSnippet: '', expectedOutput: '' },
      { title: 'Monitor Agent', codeSnippet: '', expectedOutput: '' },
    ],
    views: 0,
    completionRate: 0,
    lastUpdated: '2026-02-14T10:00:00Z',
    createdAt: '2026-02-14T10:00:00Z',
  },
]

export default function TutorialManager() {
  const [tutorials, setTutorials] = useState<Tutorial[]>(SAMPLE_TUTORIALS)
  const [search, setSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('ALL')
  const [seriesFilter, setSeriesFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDifficulty, setNewDifficulty] = useState<Tutorial['difficulty']>('beginner')
  const [newSeries, setNewSeries] = useState('')
  const [newSteps, setNewSteps] = useState<TutorialStep[]>([{ title: '', codeSnippet: '', expectedOutput: '' }])
  const [deleteTarget, setDeleteTarget] = useState<Tutorial | null>(null)
  const [deleting, setDeleting] = useState(false)
  const deleteDialogRef = useDialog(!!deleteTarget, () => setDeleteTarget(null))

  const seriesList = useMemo(() => {
    const set = new Set(tutorials.map((t) => t.series))
    return Array.from(set).sort()
  }, [tutorials])

  const filtered = useMemo(() => {
    let result = tutorials
    if (difficultyFilter !== 'ALL') {
      result = result.filter((t) => t.difficulty === difficultyFilter)
    }
    if (seriesFilter) {
      result = result.filter((t) => t.series === seriesFilter)
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.series.toLowerCase().includes(q),
      )
    }
    return result.sort(
      (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    )
  }, [tutorials, difficultyFilter, seriesFilter, statusFilter, search])

  const stats = useMemo(() => ({
    total: tutorials.length,
    published: tutorials.filter((t) => t.status === 'published').length,
    totalViews: tutorials.reduce((sum, t) => sum + t.views, 0),
    avgCompletion: tutorials.filter((t) => t.status === 'published').length > 0
      ? Math.round(
          tutorials
            .filter((t) => t.status === 'published')
            .reduce((sum, t) => sum + t.completionRate, 0) /
          tutorials.filter((t) => t.status === 'published').length,
        )
      : 0,
  }), [tutorials])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setTutorials((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }, [deleteTarget])

  const handleCreateTutorial = useCallback(() => {
    if (!newTitle.trim()) return
    const newTutorial: Tutorial = {
      id: Math.random().toString(36).slice(2, 11),
      title: newTitle.trim(),
      difficulty: newDifficulty,
      series: newSeries || 'Uncategorized',
      status: 'draft',
      steps: newSteps.filter((s) => s.title.trim()),
      views: 0,
      completionRate: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    setTutorials((prev) => [newTutorial, ...prev])
    setNewTitle('')
    setNewDifficulty('beginner')
    setNewSeries('')
    setNewSteps([{ title: '', codeSnippet: '', expectedOutput: '' }])
    setShowCreateForm(false)
  }, [newTitle, newDifficulty, newSeries, newSteps])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function formatNumber(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return n.toLocaleString()
  }

  return (
    <>
      <div className="devrel-admin-header">
        <div>
          <Link href="/admin/devrel" className="devrel-admin-back">
            &larr; DevRel
          </Link>
          <h1 style={{ marginTop: 8 }}>Tutorials</h1>
        </div>
        <button
          className="devrel-admin-new-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Tutorial'}
        </button>
      </div>

      <div className="devrel-admin-stats">
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Total Tutorials</div>
          <div className="devrel-admin-stat-value">{stats.total}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Published</div>
          <div className="devrel-admin-stat-value">{stats.published}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Total Views</div>
          <div className="devrel-admin-stat-value">{formatNumber(stats.totalViews)}</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Avg Completion</div>
          <div className="devrel-admin-stat-value">{stats.avgCompletion}%</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      {/* Series grouping overview */}
      <h2 className="devrel-admin-section-title">Series</h2>
      <div className="devrel-admin-nav-cards" style={{ marginBottom: 24 }}>
        {seriesList.map((series) => {
          const count = tutorials.filter((t) => t.series === series).length
          const views = tutorials.filter((t) => t.series === series).reduce((s, t) => s + t.views, 0)
          return (
            <div
              key={series}
              className="devrel-admin-nav-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setSeriesFilter(seriesFilter === series ? '' : series)}
            >
              <div className="devrel-admin-nav-card-title">{series}</div>
              <div className="devrel-admin-nav-card-desc">
                {count} tutorial{count !== 1 ? 's' : ''} &middot; {formatNumber(views)} views
              </div>
            </div>
          )
        })}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div style={{
          background: 'var(--color-white, #fff)',
          border: '1px solid var(--color-blue, #000AFF)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: 24,
          marginBottom: 24,
        }}>
          <h3 style={{
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--color-text-dark, #1F2937)',
            margin: '0 0 16px',
          }}>
            Create Tutorial
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="devrel-form-group">
              <label className="devrel-form-label">Title</label>
              <input
                type="text"
                className="devrel-form-input"
                placeholder="Tutorial title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="devrel-form-group">
              <label className="devrel-form-label">Difficulty</label>
              <select
                className="devrel-form-select"
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as Tutorial['difficulty'])}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="devrel-form-group">
              <label className="devrel-form-label">Series</label>
              <input
                type="text"
                className="devrel-form-input"
                placeholder="e.g., Getting Started"
                value={newSeries}
                onChange={(e) => setNewSeries(e.target.value)}
              />
            </div>
          </div>

          <label className="devrel-form-label">Steps</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {newSteps.map((step, idx) => (
              <div key={idx} style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 1fr 1fr auto',
                gap: 8,
                alignItems: 'start',
              }}>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  color: 'var(--color-text-gray, #6B7280)',
                  paddingTop: 12,
                  textAlign: 'center',
                }}>
                  {idx + 1}
                </span>
                <input
                  type="text"
                  className="devrel-form-input"
                  placeholder="Step title"
                  value={step.title}
                  onChange={(e) => {
                    const next = [...newSteps]
                    next[idx] = { ...next[idx], title: e.target.value }
                    setNewSteps(next)
                  }}
                />
                <input
                  type="text"
                  className="devrel-form-input"
                  placeholder="Code snippet"
                  value={step.codeSnippet}
                  onChange={(e) => {
                    const next = [...newSteps]
                    next[idx] = { ...next[idx], codeSnippet: e.target.value }
                    setNewSteps(next)
                  }}
                  style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12 }}
                />
                <input
                  type="text"
                  className="devrel-form-input"
                  placeholder="Expected output"
                  value={step.expectedOutput}
                  onChange={(e) => {
                    const next = [...newSteps]
                    next[idx] = { ...next[idx], expectedOutput: e.target.value }
                    setNewSteps(next)
                  }}
                  style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12 }}
                />
                {newSteps.length > 1 && (
                  <button
                    className="devrel-admin-action-btn danger"
                    onClick={() => setNewSteps((prev) => prev.filter((_, i) => i !== idx))}
                    style={{ padding: '8px 10px', fontSize: 12 }}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            className="devrel-admin-action-btn"
            onClick={() => setNewSteps((prev) => [...prev, { title: '', codeSnippet: '', expectedOutput: '' }])}
            style={{ marginBottom: 16 }}
          >
            + Add Step
          </button>

          <div className="devrel-form-actions">
            <button className="devrel-form-cancel" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
            <button
              className="devrel-form-submit"
              onClick={handleCreateTutorial}
              disabled={!newTitle.trim()}
            >
              Create Tutorial
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="devrel-admin-filters">
        <input
          type="text"
          className="devrel-admin-search"
          placeholder="Search tutorials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="devrel-admin-select"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="ALL">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          className="devrel-admin-select"
          value={seriesFilter}
          onChange={(e) => setSeriesFilter(e.target.value)}
        >
          <option value="">All series</option>
          {seriesList.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="devrel-admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyStateDecoration
          page="devrel"
          theme="warm"
          heading={tutorials.length === 0 ? 'No tutorials yet' : 'No tutorials found'}
          message={tutorials.length === 0 ? 'Create your first tutorial to help developers.' : 'Try adjusting your search or filters.'}
        />
      ) : (
        <div className="devrel-admin-table-wrap">
          <table className="devrel-admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Series</th>
                <th>Status</th>
                <th>Steps</th>
                <th>Views</th>
                <th>Completion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tutorial) => {
                const ds = DIFFICULTY_STYLES[tutorial.difficulty]
                const ss = STATUS_STYLES[tutorial.status]
                const isExpanded = expandedTutorial === tutorial.id

                return (
                  <>
                    <tr key={tutorial.id}>
                      <td>
                        <div style={{ fontWeight: 600, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {tutorial.title}
                        </div>
                      </td>
                      <td>
                        <span
                          className="devrel-type-chip"
                          style={{ background: ds.bg, color: ds.color, textTransform: 'capitalize' }}
                        >
                          {tutorial.difficulty}
                        </span>
                      </td>
                      <td>
                        <span className="devrel-admin-tag-chip">{tutorial.series}</span>
                      </td>
                      <td>
                        <span
                          className="devrel-type-chip"
                          style={{ background: ss.bg, color: ss.color }}
                        >
                          {ss.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                          {tutorial.steps.length}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                          {formatNumber(tutorial.views)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 50,
                            height: 6,
                            background: 'var(--color-border, #E5E7EB)',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${tutorial.completionRate}%`,
                              height: '100%',
                              background: tutorial.completionRate >= 70 ? '#10B981' : tutorial.completionRate >= 40 ? '#F59E0B' : '#EF4444',
                              borderRadius: 3,
                            }} />
                          </div>
                          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'var(--color-text-gray, #6B7280)' }}>
                            {tutorial.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="devrel-admin-actions">
                          <button
                            className="devrel-admin-action-btn"
                            onClick={() => setExpandedTutorial(isExpanded ? null : tutorial.id)}
                          >
                            {isExpanded ? 'Close' : 'Steps'}
                          </button>
                          <button
                            className="devrel-admin-action-btn danger"
                            onClick={() => setDeleteTarget(tutorial)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${tutorial.id}-steps`}>
                        <td colSpan={8} style={{ padding: '16px 24px', background: 'var(--color-bg-light, #F9FAFB)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {tutorial.steps.map((step, idx) => (
                              <div key={idx} style={{
                                display: 'grid',
                                gridTemplateColumns: '32px 1fr',
                                gap: 12,
                                alignItems: 'start',
                              }}>
                                <div style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  background: 'var(--color-blue, #000AFF)',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}>
                                  {idx + 1}
                                </div>
                                <div>
                                  <div style={{
                                    fontFamily: '"Instrument Sans", sans-serif',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: 'var(--color-text-dark, #1F2937)',
                                    marginBottom: 4,
                                  }}>
                                    {step.title}
                                  </div>
                                  {step.codeSnippet && (
                                    <pre style={{
                                      background: '#1a1a2e',
                                      color: '#f8f5ee',
                                      padding: '8px 12px',
                                      borderRadius: 6,
                                      fontFamily: '"JetBrains Mono", monospace',
                                      fontSize: 12,
                                      margin: '4px 0',
                                      overflow: 'auto',
                                    }}>
                                      {step.codeSnippet}
                                    </pre>
                                  )}
                                  {step.expectedOutput && (
                                    <div style={{
                                      fontFamily: '"JetBrains Mono", monospace',
                                      fontSize: 11,
                                      color: '#10B981',
                                      marginTop: 2,
                                    }}>
                                      &rarr; {step.expectedOutput}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
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
          className="devrel-admin-dialog-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="devrel-admin-dialog"
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="tutorial-delete-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="tutorial-delete-dialog-title">Delete tutorial?</h3>
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
