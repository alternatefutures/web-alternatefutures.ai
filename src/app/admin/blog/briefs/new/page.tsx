'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import '../../blog-admin.css'

type OutlineItem = {
  id: string
  text: string
}

const CONTENT_TYPES = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'whitepaper', label: 'Whitepaper' },
]

const AUDIENCE_PERSONAS = [
  'Web Developers',
  'DevOps Engineers',
  'Startup Founders',
  'Enterprise Architects',
  'Blockchain Developers',
  'Full-Stack Engineers',
]

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

export default function CreateContentBrief() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState('blog')
  const [keywords, setKeywords] = useState('')
  const [audiencePersona, setAudiencePersona] = useState('')
  const [customAudience, setCustomAudience] = useState('')
  const [outline, setOutline] = useState<OutlineItem[]>([
    { id: generateId(), text: '' },
  ])
  const [referenceLinks, setReferenceLinks] = useState('')
  const [assignedWriter, setAssignedWriter] = useState('')
  const [assignedReviewer, setAssignedReviewer] = useState('')
  const [deadline, setDeadline] = useState('')
  const [wordCountTarget, setWordCountTarget] = useState(1500)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const addOutlineItem = useCallback(() => {
    setOutline((prev) => [...prev, { id: generateId(), text: '' }])
  }, [])

  const removeOutlineItem = useCallback((id: string) => {
    setOutline((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateOutlineItem = useCallback((id: string, text: string) => {
    setOutline((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    )
  }, [])

  const moveOutlineItem = useCallback((id: string, direction: 'up' | 'down') => {
    setOutline((prev) => {
      const idx = prev.findIndex((item) => item.id === id)
      if (idx < 0) return prev
      const target = direction === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setStatusMsg({ type: 'error', text: 'Title is required.' })
      return
    }
    if (!deadline) {
      setStatusMsg({ type: 'error', text: 'Deadline is required.' })
      return
    }

    setSaving(true)
    setStatusMsg(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    setStatusMsg({ type: 'success', text: 'Content brief created successfully.' })
    setSaving(false)

    setTimeout(() => {
      router.push('/admin/blog/briefs')
    }, 1200)
  }, [title, deadline, router])

  return (
    <>
      <div className="blog-admin-header">
        <div>
          <Link href="/admin/blog/briefs" className="blog-editor-back">
            &larr; Content Briefs
          </Link>
          <h1 style={{ marginTop: 8 }}>Create Content Brief</h1>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      {statusMsg && (
        <div className={`blog-editor-status ${statusMsg.type}`} style={{ marginBottom: 16 }}>
          {statusMsg.text}
        </div>
      )}

      <div className="blog-editor-layout">
        {/* Main form */}
        <div className="blog-editor-main">
          <div>
            <label className="blog-editor-sidebar-label">Topic / Title</label>
            <input
              type="text"
              className="blog-editor-title-input"
              placeholder="Enter brief title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ fontSize: 22 }}
            />
          </div>

          <div>
            <label className="blog-editor-sidebar-label">Target SEO Keywords</label>
            <textarea
              className="blog-editor-excerpt-input"
              placeholder="Enter keywords separated by commas (e.g., decentralized hosting, IPFS deploy, web3 hosting)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <div style={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: 12,
              color: 'var(--color-text-gray, #6B7280)',
              marginTop: 4,
            }}>
              Separate keywords with commas
            </div>
          </div>

          <div>
            <label className="blog-editor-sidebar-label">Content Outline</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {outline.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    color: 'var(--color-text-gray, #6B7280)',
                    minWidth: 24,
                    textAlign: 'right',
                  }}>
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    className="blog-editor-sidebar-input"
                    placeholder={`Section ${idx + 1}...`}
                    value={item.text}
                    onChange={(e) => updateOutlineItem(item.id, e.target.value)}
                  />
                  <button
                    className="blog-admin-action-btn"
                    onClick={() => moveOutlineItem(item.id, 'up')}
                    disabled={idx === 0}
                    style={{ padding: '4px 8px', fontSize: 12, opacity: idx === 0 ? 0.3 : 1 }}
                  >
                    &uarr;
                  </button>
                  <button
                    className="blog-admin-action-btn"
                    onClick={() => moveOutlineItem(item.id, 'down')}
                    disabled={idx === outline.length - 1}
                    style={{ padding: '4px 8px', fontSize: 12, opacity: idx === outline.length - 1 ? 0.3 : 1 }}
                  >
                    &darr;
                  </button>
                  {outline.length > 1 && (
                    <button
                      className="blog-admin-action-btn danger"
                      onClick={() => removeOutlineItem(item.id)}
                      style={{ padding: '4px 8px', fontSize: 12 }}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              className="blog-admin-action-btn"
              onClick={addOutlineItem}
              style={{ marginTop: 8 }}
            >
              + Add Section
            </button>
          </div>

          <div>
            <label className="blog-editor-sidebar-label">Reference Links</label>
            <textarea
              className="blog-editor-excerpt-input"
              placeholder="Add reference URLs, one per line"
              value={referenceLinks}
              onChange={(e) => setReferenceLinks(e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>

          <div>
            <label className="blog-editor-sidebar-label">Additional Notes</label>
            <textarea
              className="blog-editor-excerpt-input"
              placeholder="Any additional notes, tone guidance, or special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="blog-editor-sidebar">
          <div className="blog-editor-sidebar-card">
            <h3>Brief Settings</h3>

            <label className="blog-editor-sidebar-label">Content Type</label>
            <select
              className="blog-editor-sidebar-select"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              {CONTENT_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>{ct.label}</option>
              ))}
            </select>

            <label className="blog-editor-sidebar-label" style={{ marginTop: 12 }}>
              Target Audience
            </label>
            <select
              className="blog-editor-sidebar-select"
              value={audiencePersona}
              onChange={(e) => setAudiencePersona(e.target.value)}
            >
              <option value="">Select audience...</option>
              {AUDIENCE_PERSONAS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
              <option value="custom">Custom...</option>
            </select>
            {audiencePersona === 'custom' && (
              <input
                type="text"
                className="blog-editor-sidebar-input"
                placeholder="Describe target audience..."
                value={customAudience}
                onChange={(e) => setCustomAudience(e.target.value)}
                style={{ marginTop: 8 }}
              />
            )}

            <label className="blog-editor-sidebar-label" style={{ marginTop: 12 }}>
              Word Count Target
            </label>
            <input
              type="number"
              className="blog-editor-sidebar-input"
              value={wordCountTarget}
              onChange={(e) => setWordCountTarget(Number(e.target.value))}
              min={100}
              step={100}
            />
          </div>

          <div className="blog-editor-sidebar-card">
            <h3>Assignment</h3>

            <label className="blog-editor-sidebar-label">Writer</label>
            <input
              type="text"
              className="blog-editor-sidebar-input"
              placeholder="Assign a writer..."
              value={assignedWriter}
              onChange={(e) => setAssignedWriter(e.target.value)}
            />

            <label className="blog-editor-sidebar-label" style={{ marginTop: 12 }}>
              Reviewer
            </label>
            <input
              type="text"
              className="blog-editor-sidebar-input"
              placeholder="Assign a reviewer..."
              value={assignedReviewer}
              onChange={(e) => setAssignedReviewer(e.target.value)}
            />

            <label className="blog-editor-sidebar-label" style={{ marginTop: 12 }}>
              Deadline
            </label>
            <input
              type="date"
              className="blog-editor-sidebar-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="blog-editor-sidebar-card">
            <div className="blog-editor-actions">
              <button
                className="blog-editor-save-btn"
                onClick={() => router.push('/admin/blog/briefs')}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="blog-editor-publish-btn"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Create Brief'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
