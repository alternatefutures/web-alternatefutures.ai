'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { fetchAllEvents, type CommunityEvent, type EventStatus } from '@/lib/community-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import '../community-admin.css'

const STATUS_STYLES: Record<EventStatus, { bg: string; color: string; label: string }> = {
  draft: { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  upcoming: { bg: '#DBEAFE', color: '#1E40AF', label: 'Upcoming' },
  live: { bg: '#D1FAE5', color: '#065F46', label: 'Live' },
  completed: { bg: '#E0E7FF', color: '#3730A3', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
}

const VENUE_LABELS: Record<string, string> = {
  online: 'Online',
  physical: 'In-Person',
  hybrid: 'Hybrid',
}

function RsvpBar({ registrations, capacity }: { registrations: number; capacity: number }) {
  const pct = Math.min(100, Math.round((registrations / capacity) * 100))
  const color = pct > 80 ? '#991B1B' : pct > 50 ? '#92400E' : '#065F46'
  return (
    <div className="community-rsvp-bar">
      <div className="community-rsvp-track">
        <div className="community-rsvp-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="community-rsvp-label">{pct}% filled</span>
    </div>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [venueFilter, setVenueFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const data = await fetchAllEvents(token)
        setEvents(data)
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = events
    if (statusFilter !== 'ALL') result = result.filter((e) => e.status === statusFilter)
    if (venueFilter !== 'ALL') result = result.filter((e) => e.venueType === venueFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events, statusFilter, venueFilter, search])

  const stats = useMemo(() => ({
    total: events.length,
    upcoming: events.filter((e) => e.status === 'upcoming').length,
    completed: events.filter((e) => e.status === 'completed').length,
    totalRegistrations: events.reduce((s, e) => s + e.registrations, 0),
  }), [events])

  if (loading) {
    return <div className="community-admin-empty"><p>Loading events...</p></div>
  }

  return (
    <>
      <div className="community-admin-header">
        <h1>Event Manager</h1>
        <Link href="/admin/community/events/new" className="community-admin-action-btn primary">Create Event</Link>
      </div>

      <div className="community-admin-stats">
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Total Events</div>
          <div className="community-admin-stat-value">{stats.total}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Upcoming</div>
          <div className="community-admin-stat-value">{stats.upcoming}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Completed</div>
          <div className="community-admin-stat-value">{stats.completed}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Total Registrations</div>
          <div className="community-admin-stat-value">{stats.totalRegistrations}</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <div className="community-admin-filters">
        <input type="text" className="community-admin-search" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="community-admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="community-admin-select" value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)}>
          <option value="ALL">All venues</option>
          <option value="online">Online</option>
          <option value="physical">In-Person</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="community-admin-empty">
          <h2>No events found</h2>
          <p>{events.length === 0 ? 'Create your first community event.' : 'Try adjusting your filters.'}</p>
        </div>
      ) : (
        <div className="community-events-grid">
          {filtered.map((evt) => {
            const ss = STATUS_STYLES[evt.status]
            return (
              <Link key={evt.id} href={`/admin/community/events/${evt.id}`} className="community-event-card">
                <div className="community-event-card-meta">
                  <span className="community-admin-chip" style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                  <span className="community-admin-chip" style={{ background: '#F3F4F6', color: '#6B7280' }}>{VENUE_LABELS[evt.venueType]}</span>
                  {evt.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="community-admin-chip" style={{ background: '#E0E7FF', color: '#3730A3' }}>{tag}</span>
                  ))}
                </div>
                <div className="community-event-card-title">{evt.name}</div>
                <div className="community-event-card-desc">{evt.description}</div>
                <div className="community-event-card-meta">
                  <span className="community-admin-time">
                    {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="community-admin-time">
                    {new Date(evt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="community-admin-time">{evt.duration}min</span>
                </div>
                <RsvpBar registrations={evt.registrations} capacity={evt.capacity} />
                <div className="community-event-card-footer">
                  <span className="community-event-card-attendees">{evt.registrations} / {evt.capacity}</span>
                  {evt.satisfactionScore && (
                    <span className="community-admin-chip" style={{ background: '#D1FAE5', color: '#065F46' }}>{evt.satisfactionScore}/5</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
