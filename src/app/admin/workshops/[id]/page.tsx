'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PiArrowLeftBold,
  PiPlusBold,
  PiTrashBold,
  PiCalendarBlankBold,
  PiClockBold,
  PiMapPinBold,
  PiVideoCameraBold,
} from 'react-icons/pi'
import {
  fetchWorkshopById,
  fetchSessions,
  fetchRegistrations,
  fetchInstructors,
  updateWorkshop,
  createSession,
  deleteSession,
  formatPrice,
  formatDuration,
  type Workshop,
  type Session,
  type Registration,
  type Instructor,
  type WorkshopFormat,
  type CreateSessionInput,
} from '@/lib/workshop-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import '../workshops.module.css'

export default function WorkshopDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const workshopId = params.id

  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editShortDesc, setEditShortDesc] = useState('')
  const [editCapacity, setEditCapacity] = useState(0)
  const [editPrice, setEditPrice] = useState(0)
  const [editFormat, setEditFormat] = useState<WorkshopFormat>('ONLINE')
  const [editLevel, setEditLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER')

  // New session form
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [newSessionDate, setNewSessionDate] = useState('')
  const [newSessionStart, setNewSessionStart] = useState('10:00')
  const [newSessionEnd, setNewSessionEnd] = useState('12:00')
  const [newSessionTz, setNewSessionTz] = useState('America/Los_Angeles')
  const [newSessionVenue, setNewSessionVenue] = useState('')
  const [newSessionLink, setNewSessionLink] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [ws, sess, regs, insts] = await Promise.all([
          fetchWorkshopById(token, workshopId),
          fetchSessions(token, workshopId),
          fetchRegistrations(token, workshopId),
          fetchInstructors(token),
        ])
        if (!ws) {
          setLoadError('Workshop not found.')
          return
        }
        setWorkshop(ws)
        setSessions(sess)
        setRegistrations(regs)
        setInstructors(insts)

        // Populate edit form
        setEditTitle(ws.title)
        setEditDescription(ws.description)
        setEditShortDesc(ws.shortDescription)
        setEditCapacity(ws.capacity)
        setEditPrice(ws.price / 100)
        setEditFormat(ws.format)
        setEditLevel(ws.level)
      } catch {
        setLoadError('Failed to load workshop details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [workshopId])

  const handleSaveEdit = useCallback(async () => {
    if (!workshop) return
    setSaving(true)
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateWorkshop(token, workshop.id, {
        title: editTitle,
        description: editDescription,
        shortDescription: editShortDesc,
        capacity: editCapacity,
        price: Math.round(editPrice * 100),
        format: editFormat,
        level: editLevel,
      })
      setWorkshop(updated)
      setEditing(false)
    } catch {
      setLoadError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }, [workshop, editTitle, editDescription, editShortDesc, editCapacity, editPrice, editFormat, editLevel])

  const handleStatusChange = useCallback(
    async (newStatus: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => {
      if (!workshop) return
      try {
        const token = getCookieValue('af_access_token')
        const updated = await updateWorkshop(token, workshop.id, { status: newStatus })
        setWorkshop(updated)
      } catch {
        setLoadError('Failed to update status.')
      }
    },
    [workshop],
  )

  const handleAddSession = useCallback(async () => {
    if (!newSessionTitle || !newSessionDate) return
    try {
      const token = getCookieValue('af_access_token')
      const input: CreateSessionInput = {
        workshopId,
        title: newSessionTitle,
        date: newSessionDate,
        startTime: newSessionStart,
        endTime: newSessionEnd,
        timezone: newSessionTz,
        format: editFormat,
        venue: newSessionVenue || undefined,
        onlineLink: newSessionLink || undefined,
      }
      const sess = await createSession(token, input)
      setSessions((prev) => [...prev, sess].sort((a, b) => a.date.localeCompare(b.date)))
      setShowNewSession(false)
      setNewSessionTitle('')
      setNewSessionDate('')
      setNewSessionVenue('')
      setNewSessionLink('')
    } catch {
      setLoadError('Failed to add session.')
    }
  }, [workshopId, newSessionTitle, newSessionDate, newSessionStart, newSessionEnd, newSessionTz, newSessionVenue, newSessionLink, editFormat])

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      const token = getCookieValue('af_access_token')
      await deleteSession(token, sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch {
      setLoadError('Failed to delete session.')
    }
  }, [])

  if (loading) {
    return (
      <div className="ws-skeleton">
        <div className="ws-skeleton-card" style={{ height: 200 }} />
        <div className="ws-skeleton-card" />
        <div className="ws-skeleton-card" />
      </div>
    )
  }

  if (loadError && !workshop) {
    return (
      <div className="ws-admin-empty">
        <h2>Error</h2>
        <p>{loadError}</p>
        <Link href="/admin/workshops" className="ws-btn-secondary">
          Back to Workshops
        </Link>
      </div>
    )
  }

  if (!workshop) return null

  const instructor = instructors.find((i) => i.id === workshop.instructorId)
  const activeRegs = registrations.filter(
    (r) => r.status === 'REGISTERED' || r.status === 'ATTENDED',
  )
  const waitlisted = registrations.filter((r) => r.status === 'WAITLISTED')

  return (
    <>
      <Link href="/admin/workshops" className="ws-back-link">
        <PiArrowLeftBold /> Back to Workshops
      </Link>

      {loadError && (
        <div
          style={{
            padding: '12px 16px',
            background: '#FEE2E2',
            border: '2px solid #FECACA',
            borderRadius: '8px 12px 10px 6px',
            color: '#991B1B',
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          {loadError}
        </div>
      )}

      {/* Workshop Info */}
      <div className="ws-section">
        <div className="ws-section-header">
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{workshop.title}</h1>
              <span className={`ws-chip status-${workshop.status.toLowerCase()}`}>
                {workshop.status}
              </span>
              <span className={`ws-chip level-${workshop.level.toLowerCase()}`}>
                {workshop.level}
              </span>
              <span className={`ws-chip format-${workshop.format.toLowerCase()}`}>
                {workshop.format.replace('_', ' ')}
              </span>
            </div>
            <p style={{ margin: 0, color: 'var(--color-text-gray, #6B7280)', fontSize: 14 }}>
              {workshop.shortDescription}
            </p>
          </div>
          <div className="ws-admin-header-actions">
            {workshop.status === 'DRAFT' && (
              <button className="ws-btn-primary" onClick={() => handleStatusChange('PUBLISHED')}>
                Publish
              </button>
            )}
            {workshop.status === 'PUBLISHED' && (
              <button className="ws-btn-secondary" onClick={() => handleStatusChange('ARCHIVED')}>
                Archive
              </button>
            )}
            <button
              className="ws-btn-secondary"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel Edit' : 'Edit'}
            </button>
          </div>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            <div className="ws-form-group full">
              <label className="ws-form-label">Title</label>
              <input className="ws-form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="ws-form-group full">
              <label className="ws-form-label">Short Description</label>
              <input className="ws-form-input" value={editShortDesc} onChange={(e) => setEditShortDesc(e.target.value)} />
            </div>
            <div className="ws-form-group full">
              <label className="ws-form-label">Full Description</label>
              <textarea className="ws-form-textarea" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="ws-form-row">
              <div className="ws-form-group">
                <label className="ws-form-label">Capacity</label>
                <input type="number" className="ws-form-input" min={1} value={editCapacity} onChange={(e) => setEditCapacity(Number(e.target.value))} />
              </div>
              <div className="ws-form-group">
                <label className="ws-form-label">Price (USD)</label>
                <input type="number" className="ws-form-input" min={0} step={0.01} value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} />
              </div>
              <div className="ws-form-group">
                <label className="ws-form-label">Format</label>
                <select className="ws-form-select" value={editFormat} onChange={(e) => setEditFormat(e.target.value as WorkshopFormat)}>
                  <option value="ONLINE">Online</option>
                  <option value="IN_PERSON">In Person</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div className="ws-form-group">
                <label className="ws-form-label">Level</label>
                <select className="ws-form-select" value={editLevel} onChange={(e) => setEditLevel(e.target.value as typeof editLevel)}>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>
            <div className="ws-form-actions">
              <button className="ws-btn-primary" disabled={saving} onClick={handleSaveEdit}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="ws-btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div className="ws-admin-stats" style={{ marginBottom: 16 }}>
              <div className="ws-stat-card">
                <div className="ws-stat-label">Price</div>
                <div className="ws-stat-value terra">{formatPrice(workshop.price, workshop.currency)}</div>
              </div>
              <div className="ws-stat-card">
                <div className="ws-stat-label">Duration</div>
                <div className="ws-stat-value">{formatDuration(workshop.duration)}</div>
              </div>
              <div className="ws-stat-card">
                <div className="ws-stat-label">Enrolled</div>
                <div className="ws-stat-value">{workshop.enrolledCount}/{workshop.capacity}</div>
              </div>
              <div className="ws-stat-card">
                <div className="ws-stat-label">Waitlisted</div>
                <div className="ws-stat-value">{workshop.waitlistCount}</div>
              </div>
              <div className="ws-stat-card">
                <div className="ws-stat-label">Instructor</div>
                <div className="ws-stat-value" style={{ fontSize: 16 }}>
                  {instructor?.name || 'Unknown'}
                </div>
              </div>
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-dark)' }}>
              {workshop.description}
            </p>

            {workshop.prerequisites.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <strong style={{ fontSize: 13, color: 'var(--color-text-gray)' }}>Prerequisites:</strong>
                <ul style={{ margin: '4px 0 0 20px', fontSize: 14 }}>
                  {workshop.prerequisites.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {workshop.learningOutcomes.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <strong style={{ fontSize: 13, color: 'var(--color-text-gray)' }}>Learning Outcomes:</strong>
                <ul style={{ margin: '4px 0 0 20px', fontSize: 14 }}>
                  {workshop.learningOutcomes.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
            )}

            {workshop.tags.length > 0 && (
              <div className="ws-tags" style={{ marginTop: 12 }}>
                {workshop.tags.map((tag) => (
                  <span key={tag} className="ws-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <WaveDivider variant="apricot" />

      {/* Sessions */}
      <div className="ws-section">
        <div className="ws-section-header">
          <h3 className="ws-section-title">Sessions ({sessions.length})</h3>
          <button className="ws-btn-secondary" onClick={() => setShowNewSession(!showNewSession)}>
            <PiPlusBold /> Add Session
          </button>
        </div>

        {showNewSession && (
          <div className="ws-session-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12, marginBottom: 16 }}>
            <div className="ws-form-row">
              <div className="ws-form-group">
                <label className="ws-form-label">Title</label>
                <input className="ws-form-input" value={newSessionTitle} onChange={(e) => setNewSessionTitle(e.target.value)} placeholder="Session title" />
              </div>
              <div className="ws-form-group">
                <label className="ws-form-label">Date</label>
                <input type="date" className="ws-form-input" value={newSessionDate} onChange={(e) => setNewSessionDate(e.target.value)} />
              </div>
            </div>
            <div className="ws-form-row">
              <div className="ws-form-group">
                <label className="ws-form-label">Start</label>
                <input type="time" className="ws-form-input" value={newSessionStart} onChange={(e) => setNewSessionStart(e.target.value)} />
              </div>
              <div className="ws-form-group">
                <label className="ws-form-label">End</label>
                <input type="time" className="ws-form-input" value={newSessionEnd} onChange={(e) => setNewSessionEnd(e.target.value)} />
              </div>
              <div className="ws-form-group">
                <label className="ws-form-label">Timezone</label>
                <select className="ws-form-select" value={newSessionTz} onChange={(e) => setNewSessionTz(e.target.value)}>
                  <option value="America/Los_Angeles">Pacific (PT)</option>
                  <option value="America/New_York">Eastern (ET)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Yerevan">Yerevan (AMT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
            <div className="ws-form-row">
              <div className="ws-form-group">
                <label className="ws-form-label">Venue</label>
                <input className="ws-form-input" value={newSessionVenue} onChange={(e) => setNewSessionVenue(e.target.value)} placeholder="Optional" />
              </div>
              <div className="ws-form-group">
                <label className="ws-form-label">Online Link</label>
                <input className="ws-form-input" value={newSessionLink} onChange={(e) => setNewSessionLink(e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div className="ws-form-actions">
              <button className="ws-btn-primary" onClick={handleAddSession}>Add Session</button>
              <button className="ws-btn-secondary" onClick={() => setShowNewSession(false)}>Cancel</button>
            </div>
          </div>
        )}

        {sessions.length === 0 ? (
          <p style={{ color: 'var(--color-text-gray)', fontSize: 14 }}>
            No sessions scheduled yet.
          </p>
        ) : (
          <div className="ws-session-list">
            {sessions.map((sess) => (
              <div key={sess.id} className="ws-session-row">
                <span className="ws-session-title">{sess.title}</span>
                <span className="ws-session-detail">
                  <PiCalendarBlankBold /> {sess.date}
                </span>
                <span className="ws-session-detail">
                  <PiClockBold /> {sess.startTime}–{sess.endTime} ({sess.timezone.split('/').pop()})
                </span>
                {sess.venue && (
                  <span className="ws-session-detail">
                    <PiMapPinBold /> {sess.venue}
                  </span>
                )}
                {sess.onlineLink && (
                  <span className="ws-session-detail">
                    <PiVideoCameraBold /> Online
                  </span>
                )}
                <div className="ws-session-actions">
                  <button
                    className="ws-btn-small danger"
                    onClick={() => handleDeleteSession(sess.id)}
                    title="Delete session"
                  >
                    <PiTrashBold />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registrations preview */}
      <div className="ws-section">
        <div className="ws-section-header">
          <h3 className="ws-section-title">
            Registrations ({activeRegs.length} active, {waitlisted.length} waitlisted)
          </h3>
          <Link href={`/admin/workshops/${workshopId}/registrations`} className="ws-btn-secondary">
            View All
          </Link>
        </div>

        {registrations.length === 0 ? (
          <p style={{ color: 'var(--color-text-gray)', fontSize: 14 }}>
            No registrations yet.
          </p>
        ) : (
          <table className="ws-reg-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {registrations.slice(0, 5).map((reg) => (
                <tr key={reg.id}>
                  <td style={{ fontWeight: 600 }}>{reg.name}</td>
                  <td>{reg.email}</td>
                  <td>
                    <span className={`ws-chip reg-${reg.status.toLowerCase()}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td>{formatPrice(reg.amountPaid)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="ws-progress-bar">
                        <div
                          className="ws-progress-fill"
                          style={{ width: `${reg.completionPercentage}%` }}
                        />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--color-text-gray)' }}>
                        {reg.completionPercentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {registrations.length > 5 && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link href={`/admin/workshops/${workshopId}/registrations`} className="ws-btn-small">
              View all {registrations.length} registrations
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
