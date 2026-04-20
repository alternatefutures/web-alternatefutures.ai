'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  fetchEventById,
  updateEvent,
  type CommunityEvent,
  type EventStatus,
} from '@/lib/community-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import '../../community-admin.css'

const STATUS_STYLES: Record<EventStatus, { bg: string; color: string; label: string }> = {
  draft: { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  upcoming: { bg: '#DBEAFE', color: '#1E40AF', label: 'Upcoming' },
  live: { bg: '#D1FAE5', color: '#065F46', label: 'Live' },
  completed: { bg: '#E0E7FF', color: '#3730A3', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>()
  const eventId = params.id
  const [event, setEvent] = useState<CommunityEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [announcementSent, setAnnouncementSent] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const data = await fetchEventById(token, eventId)
        setEvent(data)
        if (data) {
          setEditName(data.name)
          setEditDesc(data.description)
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [eventId])

  const handleSave = useCallback(async () => {
    if (!event) return
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateEvent(token, event.id, {
        name: editName,
        description: editDesc,
      })
      setEvent(updated)
      setEditing(false)
    } catch {
      // silently handle
    }
  }, [event, editName, editDesc])

  const handleStatusChange = useCallback(async (status: EventStatus) => {
    if (!event) return
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateEvent(token, event.id, { status })
      setEvent(updated)
    } catch {
      // silently handle
    }
  }, [event])

  const handleSendAnnouncement = useCallback(() => {
    if (!announcement.trim()) return
    setAnnouncementSent(true)
    setAnnouncement('')
    setTimeout(() => setAnnouncementSent(false), 3000)
  }, [announcement])

  const attendeeStats = useMemo(() => {
    if (!event) return { total: 0, checkedIn: 0, rate: 0 }
    const checkedIn = event.attendees.filter((a) => a.checkedIn).length
    return {
      total: event.attendees.length,
      checkedIn,
      rate: event.attendees.length > 0 ? Math.round((checkedIn / event.attendees.length) * 100) : 0,
    }
  }, [event])

  if (loading) {
    return <div className="community-admin-empty"><p>Loading event...</p></div>
  }

  if (!event) {
    return (
      <div className="community-admin-empty">
        <h2>Event not found</h2>
        <Link href="/admin/community/events" className="community-admin-action-btn" style={{ marginTop: 12, display: 'inline-block' }}>
          Back to Events
        </Link>
      </div>
    )
  }

  const ss = STATUS_STYLES[event.status]

  return (
    <>
      <div className="community-admin-header">
        <h1>{editing ? 'Edit Event' : event.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/community/events" className="community-admin-action-btn">Back to Events</Link>
          {!editing && (
            <button className="community-admin-action-btn primary" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Status + Quick Actions */}
      <div className="community-admin-stats">
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span className="community-admin-chip" style={{ background: ss.bg, color: ss.color, fontSize: 13 }}>{ss.label}</span>
            <select
              className="community-admin-select"
              value={event.status}
              onChange={(e) => handleStatusChange(e.target.value as EventStatus)}
              style={{ padding: '4px 8px', fontSize: 12 }}
            >
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Registrations</div>
          <div className="community-admin-stat-value">{event.registrations}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Attendance Rate</div>
          <div className="community-admin-stat-value">{event.attendanceRate}%</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Satisfaction</div>
          <div className="community-admin-stat-value">{event.satisfactionScore ?? '—'}</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      {/* Edit form */}
      {editing && (
        <div className="community-event-section" style={{ marginBottom: 20 }}>
          <div className="community-form-group">
            <label className="community-form-label">Event Name</label>
            <input type="text" className="community-form-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div className="community-form-group">
            <label className="community-form-label">Description</label>
            <textarea className="community-form-input" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
          </div>
          <div className="community-form-actions" style={{ marginTop: 12 }}>
            <button className="community-admin-action-btn primary" onClick={handleSave}>Save Changes</button>
            <button className="community-admin-action-btn" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="community-event-detail-grid">
        {/* Left column */}
        <div>
          {/* Event Info */}
          <div className="community-event-section">
            <div className="community-event-section-title">Event Details</div>
            <div style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: 13, lineHeight: 1.8 }}>
              <div><strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div><strong>Time:</strong> {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} — {new Date(event.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({event.duration}min)</div>
              <div><strong>Venue:</strong> {event.venueType === 'online' ? 'Online' : event.venueType === 'hybrid' ? 'Hybrid' : 'In-Person'}</div>
              {event.venueAddress && <div><strong>Address:</strong> {event.venueAddress}</div>}
              {event.venueLink && <div><strong>Link:</strong> <a href={event.venueLink} target="_blank" rel="noopener noreferrer" style={{ color: '#000AFF' }}>{event.venueLink}</a></div>}
              <div><strong>Capacity:</strong> {event.registrations} / {event.capacity}</div>
              <div><strong>Registration:</strong> {event.registrationType}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {event.tags.map((tag) => (
                  <span key={tag} className="community-admin-chip" style={{ background: '#E0E7FF', color: '#3730A3' }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Agenda */}
          {event.agenda.length > 0 && (
            <div className="community-event-section">
              <div className="community-event-section-title">Agenda</div>
              {event.agenda.map((item, idx) => (
                <div key={idx} className="community-event-agenda-item">
                  <span className="community-event-agenda-time">{item.time}</span>
                  <div>
                    <div className="community-event-agenda-title">{item.title}</div>
                    {item.speaker && <div className="community-event-agenda-speaker">{item.speaker}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Attendees */}
          <div className="community-event-section">
            <div className="community-event-section-title">
              Attendees ({attendeeStats.total}) — {attendeeStats.checkedIn} checked in ({attendeeStats.rate}%)
            </div>
            {event.attendees.length === 0 ? (
              <div style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: 13, color: '#6B7280' }}>No attendees registered yet.</div>
            ) : (
              <table className="community-attendee-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Check-in</th>
                  </tr>
                </thead>
                <tbody>
                  {event.attendees.map((att) => (
                    <tr key={att.id}>
                      <td>{att.name}</td>
                      <td>{att.email}</td>
                      <td>{new Date(att.registeredAt).toLocaleDateString()}</td>
                      <td>
                        {att.checkedIn ? (
                          <span className="community-admin-chip" style={{ background: '#D1FAE5', color: '#065F46' }}>Checked In</span>
                        ) : (
                          <span className="community-admin-chip" style={{ background: '#F3F4F6', color: '#6B7280' }}>Not yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Speakers */}
          {event.speakers.length > 0 && (
            <div className="community-event-section">
              <div className="community-event-section-title">Speakers</div>
              {event.speakers.map((spk, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontFamily: '"Instrument Sans", sans-serif', fontSize: 13 }}>
                  <div className="community-member-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                    {spk.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1F2937' }}>{spk.name}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{spk.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Send Announcement */}
          <div className="community-event-section">
            <div className="community-event-section-title">Send Announcement</div>
            <textarea
              className="community-form-input"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Write an announcement to all registrants..."
              style={{ minHeight: 80 }}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="community-admin-action-btn primary" onClick={handleSendAnnouncement} disabled={!announcement.trim()}>
                Send to All
              </button>
              {announcementSent && (
                <span style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: 12, color: '#065F46' }}>Announcement sent</span>
              )}
            </div>
          </div>

          {/* Post-Event Survey */}
          {event.status === 'completed' && (
            <div className="community-event-section">
              <div className="community-event-section-title">Post-Event Survey</div>
              <div style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
                {event.satisfactionScore
                  ? `Average satisfaction: ${event.satisfactionScore}/5`
                  : 'No survey responses yet.'}
              </div>
              <button className="community-admin-action-btn">Send Survey</button>
            </div>
          )}

          {/* Analytics */}
          <div className="community-event-section">
            <div className="community-event-section-title">Event Analytics</div>
            <div style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: 13, lineHeight: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Registrations</span>
                <span style={{ fontWeight: 600 }}>{event.registrations}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Capacity Used</span>
                <span style={{ fontWeight: 600 }}>{Math.round((event.registrations / event.capacity) * 100)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Attendance Rate</span>
                <span style={{ fontWeight: 600 }}>{event.attendanceRate}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Satisfaction</span>
                <span style={{ fontWeight: 600 }}>{event.satisfactionScore ?? 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
