'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  fetchPartnerById,
  updatePartner,
  fetchPipeline,
  type Partner,
  type PipelineEntry,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_COLORS,
} from '@/lib/partner-api'
import '../../partnerships.css'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PartnerDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [partner, setPartner] = useState<Partner | null>(null)
  const [pipeline, setPipeline] = useState<PipelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const [editNotes, setEditNotes] = useState('')
  const [editAgreement, setEditAgreement] = useState('')
  const [editContact, setEditContact] = useState('')
  const [editEmail, setEditEmail] = useState('')

  useEffect(() => {
    async function load() {
      const [p, pipe] = await Promise.all([
        fetchPartnerById(id),
        fetchPipeline(),
      ])
      setPartner(p)
      setPipeline(pipe.filter((e) => e.partnerId === id))
      if (p) {
        setEditNotes(p.notes)
        setEditAgreement(p.agreementSummary)
        setEditContact(p.contactName)
        setEditEmail(p.contactEmail)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave() {
    if (!partner) return
    setSaving(true)
    try {
      const updated = await updatePartner(partner.id, {
        notes: editNotes,
        agreementSummary: editAgreement,
        contactName: editContact,
        contactEmail: editEmail,
      })
      setPartner(updated)
      setEditing(false)
      setStatusMsg('Partner updated.')
      setTimeout(() => setStatusMsg(''), 3000)
    } catch {
      setStatusMsg('Failed to save.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="partnerships-dashboard">
        <div className="partnerships-header">
          <h1>Partner Detail</h1>
        </div>
        <div className="partnerships-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="partnerships-skeleton-row">
              <div className="partnerships-skeleton-block w-40" />
              <div className="partnerships-skeleton-block w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="partnerships-dashboard">
        <div className="partnerships-header">
          <h1>Partner Not Found</h1>
        </div>
        <div className="partnerships-empty">This partner does not exist.</div>
        <Link href="/admin/partnerships/partners" className="partnerships-back-link">
          &larr; Back to directory
        </Link>
      </div>
    )
  }

  return (
    <div className="partnerships-dashboard">
      <div className="partnerships-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={partner.logo}
            alt=""
            className="partnerships-partner-logo"
            style={{ width: 36, height: 36 }}
          />
          {partner.name}
        </h1>
        <div className="partnerships-header-actions">
          <Link href="/admin/partnerships/partners" className="partnerships-btn-secondary">
            &larr; Directory
          </Link>
          {!editing && (
            <button
              className="partnerships-btn-primary"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className={`partnerships-status-msg ${statusMsg.includes('Failed') ? 'error' : 'success'}`}>
          {statusMsg}
        </div>
      )}

      <div className="partnerships-detail-layout">
        <div className="partnerships-detail-main">
          {/* Partner Info */}
          <div className="partnerships-section">
            <h2>Partner Information</h2>
            {editing ? (
              <div className="partnerships-form">
                <div className="partnerships-form-row">
                  <div className="partnerships-form-group">
                    <label className="partnerships-label">Contact Name</label>
                    <input
                      className="partnerships-input"
                      value={editContact}
                      onChange={(e) => setEditContact(e.target.value)}
                    />
                  </div>
                  <div className="partnerships-form-group">
                    <label className="partnerships-label">Contact Email</label>
                    <input
                      className="partnerships-input"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="partnerships-form-group">
                  <label className="partnerships-label">Agreement Summary</label>
                  <textarea
                    className="partnerships-textarea"
                    rows={3}
                    value={editAgreement}
                    onChange={(e) => setEditAgreement(e.target.value)}
                  />
                </div>
                <div className="partnerships-form-group">
                  <label className="partnerships-label">Notes</label>
                  <textarea
                    className="partnerships-textarea"
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>
                <div className="partnerships-form-actions">
                  <button
                    className="partnerships-btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    className="partnerships-btn-secondary"
                    onClick={() => {
                      setEditing(false)
                      setEditNotes(partner.notes)
                      setEditAgreement(partner.agreementSummary)
                      setEditContact(partner.contactName)
                      setEditEmail(partner.contactEmail)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="partnerships-info-grid">
                <span className="partnerships-info-label">Category</span>
                <span className="partnerships-info-value">{partner.category}</span>
                <span className="partnerships-info-label">Website</span>
                <span className="partnerships-info-value">
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="partnerships-table-link">
                    {partner.website}
                  </a>
                </span>
                <span className="partnerships-info-label">Contact</span>
                <span className="partnerships-info-value">{partner.contactName}</span>
                <span className="partnerships-info-label">Email</span>
                <span className="partnerships-info-value">{partner.contactEmail}</span>
                <span className="partnerships-info-label">Start Date</span>
                <span className="partnerships-info-value">{formatDate(partner.startDate)}</span>
                <span className="partnerships-info-label">Renewal Date</span>
                <span className="partnerships-info-value">{formatDate(partner.renewalDate)}</span>
              </div>
            )}
          </div>

          {/* Agreement */}
          {!editing && (
            <div className="partnerships-section">
              <h2>Agreement Summary</h2>
              <p style={{
                fontFamily: 'var(--af-font-architect)',
                fontSize: 'var(--af-type-sm)',
                color: 'var(--af-stone-700)',
                lineHeight: 'var(--af-leading-body)',
                margin: 0,
              }}>
                {partner.agreementSummary}
              </p>
            </div>
          )}

          {/* Pipeline Activity */}
          {pipeline.length > 0 && (
            <div className="partnerships-section">
              <h2>Pipeline Activity</h2>
              {pipeline.map((entry) => (
                <div key={entry.id} className="partnerships-activity-item">
                  <div
                    className="partnerships-activity-dot"
                    style={{ background: PIPELINE_STAGE_COLORS[entry.stage] }}
                  />
                  <div className="partnerships-activity-content">
                    <div className="partnerships-activity-text">
                      <strong>{PIPELINE_STAGE_LABELS[entry.stage]}</strong>
                      {' — '}
                      {entry.nextAction}
                    </div>
                    <div className="partnerships-activity-time">
                      {entry.value} &middot; {entry.assignee} &middot; Due {formatDate(entry.nextActionDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes Timeline */}
          {!editing && (
            <div className="partnerships-section">
              <h2>Notes</h2>
              <div className="partnerships-notes-timeline">
                <div className="partnerships-note-item">
                  <div className="partnerships-note-dot" />
                  <div className="partnerships-note-content">
                    <div className="partnerships-note-text">{partner.notes}</div>
                    <div className="partnerships-note-date">{formatDate(partner.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="partnerships-detail-sidebar">
          <div className="partnerships-sidebar-card">
            <h3>Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`partnerships-status-chip ${partner.status}`}>
                  {partner.status}
                </span>
                <span className={`partnerships-tier-chip ${partner.tier}`}>
                  {partner.tier}
                </span>
              </div>
            </div>
          </div>

          <div className="partnerships-sidebar-card">
            <h3>Health Score</h3>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                fontFamily: 'var(--af-font-architect)',
                fontSize: 36,
                fontWeight: 700,
                color: partner.healthScore >= 80 ? '#10B981' : partner.healthScore >= 50 ? '#F59E0B' : '#EF4444',
              }}>
                {partner.healthScore}
              </div>
              <div className="partnerships-health-bar" style={{ marginTop: 8 }}>
                <div
                  className="partnerships-health-fill"
                  style={{
                    width: `${partner.healthScore}%`,
                    background: partner.healthScore >= 80 ? '#10B981' : partner.healthScore >= 50 ? '#F59E0B' : '#EF4444',
                  }}
                />
              </div>
              <div style={{
                fontFamily: 'var(--af-font-machine)',
                fontSize: 11,
                color: 'var(--af-stone-400)',
                marginTop: 4,
              }}>
                {partner.healthScore >= 80 ? 'Healthy' : partner.healthScore >= 50 ? 'Needs Attention' : 'At Risk'}
              </div>
            </div>
          </div>

          <div className="partnerships-sidebar-card">
            <h3>Key Dates</h3>
            <div className="partnerships-info-grid" style={{ gridTemplateColumns: '90px 1fr' }}>
              <span className="partnerships-info-label">Created</span>
              <span className="partnerships-info-value">{formatDate(partner.createdAt)}</span>
              <span className="partnerships-info-label">Updated</span>
              <span className="partnerships-info-value">{formatDate(partner.updatedAt)}</span>
              <span className="partnerships-info-label">Started</span>
              <span className="partnerships-info-value">{formatDate(partner.startDate)}</span>
              <span className="partnerships-info-label">Renewal</span>
              <span className="partnerships-info-value">{formatDate(partner.renewalDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
