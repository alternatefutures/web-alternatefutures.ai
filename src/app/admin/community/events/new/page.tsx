'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createEvent,
  type EventVenueType,
  type RegistrationType,
  type EventStatus,
  type EventSpeaker,
  type EventAgendaItem,
} from '@/lib/community-api'
import { getCookieValue } from '@/lib/cookies'
import '../../community-admin.css'

export default function CreateEventPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')
  const [duration, setDuration] = useState(120)
  const [venueType, setVenueType] = useState<EventVenueType>('online')
  const [venueAddress, setVenueAddress] = useState('')
  const [venueLink, setVenueLink] = useState('')
  const [capacity, setCapacity] = useState(100)
  const [registrationType, setRegistrationType] = useState<RegistrationType>('open')
  const [tags, setTags] = useState('')
  const [speakersRaw, setSpeakersRaw] = useState('')
  const [agendaItems, setAgendaItems] = useState<EventAgendaItem[]>([
    { time: '18:00', title: '', speaker: null },
  ])

  const addAgendaItem = useCallback(() => {
    setAgendaItems((prev) => [...prev, { time: '', title: '', speaker: null }])
  }, [])

  const updateAgendaItem = useCallback((idx: number, field: keyof EventAgendaItem, value: string) => {
    setAgendaItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: field === 'speaker' && value === '' ? null : value } : item,
      ),
    )
  }, [])

  const removeAgendaItem = useCallback((idx: number) => {
    setAgendaItems((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !date || !time) {
      setError('Name, date, and time are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const token = getCookieValue('af_access_token')
      const dateStr = `${date}T${time}:00Z`
      const endDate = new Date(new Date(dateStr).getTime() + duration * 60000).toISOString()

      const speakers: EventSpeaker[] = speakersRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ name: s, title: 'Speaker', avatar: null }))

      await createEvent(token, {
        name: name.trim(),
        description: description.trim(),
        date: dateStr,
        endDate,
        duration,
        venueType,
        venueAddress: venueAddress.trim() || null,
        venueLink: venueLink.trim() || null,
        capacity,
        registrationType,
        status: 'upcoming' as EventStatus,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        speakers,
        agenda: agendaItems.filter((a) => a.title.trim()),
      })
      router.push('/admin/community/events')
    } catch {
      setError('Failed to create event.')
    } finally {
      setSaving(false)
    }
  }, [name, description, date, time, duration, venueType, venueAddress, venueLink, capacity, registrationType, tags, speakersRaw, agendaItems, router])

  return (
    <>
      <div className="community-admin-header">
        <h1>Create Event</h1>
        <Link href="/admin/community/events" className="community-admin-action-btn">Back to Events</Link>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontFamily: '"Instrument Sans", sans-serif', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="community-form">
        <div className="community-form-group">
          <label className="community-form-label">Event Name</label>
          <input type="text" className="community-form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Deploy Day Workshop" />
        </div>

        <div className="community-form-group">
          <label className="community-form-label">Description</label>
          <textarea className="community-form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your event..." />
        </div>

        <div className="community-form-row">
          <div className="community-form-group">
            <label className="community-form-label">Date</label>
            <input type="date" className="community-form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="community-form-group">
            <label className="community-form-label">Start Time (UTC)</label>
            <input type="time" className="community-form-input" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="community-form-row-3">
          <div className="community-form-group">
            <label className="community-form-label">Duration (minutes)</label>
            <input type="number" className="community-form-input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={15} step={15} />
          </div>
          <div className="community-form-group">
            <label className="community-form-label">Capacity</label>
            <input type="number" className="community-form-input" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} min={1} />
          </div>
          <div className="community-form-group">
            <label className="community-form-label">Registration</label>
            <select className="community-form-input" value={registrationType} onChange={(e) => setRegistrationType(e.target.value as RegistrationType)}>
              <option value="open">Open</option>
              <option value="invite">Invite Only</option>
              <option value="waitlist">Waitlist</option>
            </select>
          </div>
        </div>

        <div className="community-form-group">
          <label className="community-form-label">Venue Type</label>
          <select className="community-form-input" value={venueType} onChange={(e) => setVenueType(e.target.value as EventVenueType)}>
            <option value="online">Online</option>
            <option value="physical">In-Person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {(venueType === 'physical' || venueType === 'hybrid') && (
          <div className="community-form-group">
            <label className="community-form-label">Venue Address</label>
            <input type="text" className="community-form-input" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="123 Main St, City, ST 12345" />
          </div>
        )}

        {(venueType === 'online' || venueType === 'hybrid') && (
          <div className="community-form-group">
            <label className="community-form-label">Virtual Link</label>
            <input type="url" className="community-form-input" value={venueLink} onChange={(e) => setVenueLink(e.target.value)} placeholder="https://meet.alternatefutures.ai/..." />
          </div>
        )}

        <div className="community-form-group">
          <label className="community-form-label">Tags (comma-separated)</label>
          <input type="text" className="community-form-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="workshop, ipfs, deployment" />
        </div>

        <div className="community-form-group">
          <label className="community-form-label">Speakers (comma-separated names)</label>
          <input type="text" className="community-form-input" value={speakersRaw} onChange={(e) => setSpeakersRaw(e.target.value)} placeholder="Senku Ishigami, Lain Iwakura" />
        </div>

        <div className="community-form-group">
          <label className="community-form-label">Agenda</label>
          {agendaItems.map((item, idx) => (
            <div key={idx} className="community-form-row" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                <input
                  type="time"
                  className="community-form-input"
                  style={{ width: 120, flex: 'none' }}
                  value={item.time}
                  onChange={(e) => updateAgendaItem(idx, 'time', e.target.value)}
                />
                <input
                  type="text"
                  className="community-form-input"
                  placeholder="Session title"
                  value={item.title}
                  onChange={(e) => updateAgendaItem(idx, 'title', e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                <input
                  type="text"
                  className="community-form-input"
                  placeholder="Speaker (optional)"
                  value={item.speaker || ''}
                  onChange={(e) => updateAgendaItem(idx, 'speaker', e.target.value)}
                />
                <button
                  type="button"
                  className="community-admin-action-btn danger"
                  onClick={() => removeAgendaItem(idx)}
                  style={{ flexShrink: 0 }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="community-admin-action-btn" onClick={addAgendaItem} style={{ marginTop: 4 }}>
            + Add Agenda Item
          </button>
        </div>

        <div className="community-form-actions">
          <button
            className="community-admin-action-btn primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Event'}
          </button>
          <Link href="/admin/community/events" className="community-admin-action-btn">
            Cancel
          </Link>
        </div>
      </div>
    </>
  )
}
