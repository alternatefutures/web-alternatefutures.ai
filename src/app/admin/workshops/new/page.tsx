'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PiArrowLeftBold } from 'react-icons/pi'
import {
  createWorkshop,
  createSession,
  fetchInstructors,
  type Instructor,
  type WorkshopFormat,
  type CreateWorkshopInput,
  type CreateSessionInput,
} from '@/lib/workshop-api'
import { getCookieValue } from '@/lib/cookies'
import '../workshops.module.css'

interface SessionDraft {
  key: string
  title: string
  date: string
  startTime: string
  endTime: string
  timezone: string
  venue: string
  onlineLink: string
  format: WorkshopFormat
}

export default function NewWorkshopPage() {
  const router = useRouter()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Workshop form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [instructorId, setInstructorId] = useState('')
  const [capacity, setCapacity] = useState(20)
  const [duration, setDuration] = useState(120)
  const [price, setPrice] = useState(0)
  const [format, setFormat] = useState<WorkshopFormat>('ONLINE')
  const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER')
  const [tagsInput, setTagsInput] = useState('')
  const [prerequisitesInput, setPrerequisitesInput] = useState('')
  const [outcomesInput, setOutcomesInput] = useState('')

  // Sessions
  const [sessions, setSessions] = useState<SessionDraft[]>([])

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchInstructors(token)
      setInstructors(data)
      if (data.length > 0) setInstructorId(data[0].id)
    }
    load()
  }, [])

  const generateSlug = useCallback((t: string) => {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }, [])

  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val)
      setSlug(generateSlug(val))
    },
    [generateSlug],
  )

  const addSession = useCallback(() => {
    setSessions((prev) => [
      ...prev,
      {
        key: `session-${Date.now()}`,
        title: `Session ${prev.length + 1}`,
        date: '',
        startTime: '10:00',
        endTime: '12:00',
        timezone: 'America/Los_Angeles',
        venue: '',
        onlineLink: '',
        format,
      },
    ])
  }, [format])

  const updateSession = useCallback(
    (key: string, field: keyof SessionDraft, value: string) => {
      setSessions((prev) =>
        prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)),
      )
    },
    [],
  )

  const removeSession = useCallback((key: string) => {
    setSessions((prev) => prev.filter((s) => s.key !== key))
  }, [])

  const handleSubmit = useCallback(
    async (publishNow: boolean) => {
      if (!title.trim()) {
        setError('Title is required.')
        return
      }
      if (!instructorId) {
        setError('Please select an instructor.')
        return
      }

      setSaving(true)
      setError('')

      try {
        const token = getCookieValue('af_access_token')

        const input: CreateWorkshopInput = {
          title: title.trim(),
          slug: slug || generateSlug(title),
          description: description.trim(),
          shortDescription: shortDescription.trim(),
          instructorId,
          capacity,
          duration,
          price: Math.round(price * 100), // convert dollars to cents
          format,
          level,
          tags: tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          prerequisites: prerequisitesInput
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean),
          learningOutcomes: outcomesInput
            .split('\n')
            .map((o) => o.trim())
            .filter(Boolean),
          status: publishNow ? 'PUBLISHED' : 'DRAFT',
        }

        const workshop = await createWorkshop(token, input)

        // Create sessions
        for (const sess of sessions) {
          if (!sess.date) continue
          const sessionInput: CreateSessionInput = {
            workshopId: workshop.id,
            title: sess.title,
            date: sess.date,
            startTime: sess.startTime,
            endTime: sess.endTime,
            timezone: sess.timezone,
            format: sess.format as WorkshopFormat,
            venue: sess.venue || undefined,
            onlineLink: sess.onlineLink || undefined,
          }
          await createSession(token, sessionInput)
        }

        router.push(`/admin/workshops/${workshop.id}`)
      } catch {
        setError('Failed to create workshop. Please try again.')
      } finally {
        setSaving(false)
      }
    },
    [
      title, slug, description, shortDescription, instructorId,
      capacity, duration, price, format, level, tagsInput,
      prerequisitesInput, outcomesInput, sessions, generateSlug, router,
    ],
  )

  return (
    <>
      <Link href="/admin/workshops" className="ws-back-link">
        <PiArrowLeftBold /> Back to Workshops
      </Link>

      <div className="ws-admin-header">
        <h1>Create Workshop</h1>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: '#FEE2E2',
            border: '2px solid #FECACA',
            borderRadius: '8px 12px 10px 6px',
            color: '#991B1B',
            fontFamily: 'var(--af-font-architect, "Instrument Sans", sans-serif)',
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      <div className="ws-form">
        {/* Basic Info */}
        <div className="ws-section">
          <h3 className="ws-section-title">Workshop Details</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            <div className="ws-form-group full">
              <label className="ws-form-label">Title</label>
              <input
                type="text"
                className="ws-form-input"
                placeholder="e.g. Decentralized Hosting Masterclass"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="ws-form-group full">
              <label className="ws-form-label">Slug</label>
              <input
                type="text"
                className="ws-form-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <span className="ws-form-hint">URL-friendly identifier, auto-generated from title.</span>
            </div>

            <div className="ws-form-group full">
              <label className="ws-form-label">Short Description</label>
              <input
                type="text"
                className="ws-form-input"
                placeholder="One-line summary for cards and listings"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>

            <div className="ws-form-group full">
              <label className="ws-form-label">Full Description</label>
              <textarea
                className="ws-form-textarea"
                placeholder="Detailed workshop description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="ws-form-row">
              <div className="ws-form-group">
                <label className="ws-form-label">Instructor</label>
                <select
                  className="ws-form-select"
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                >
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} — {inst.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ws-form-group">
                <label className="ws-form-label">Level</label>
                <select
                  className="ws-form-select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as typeof level)}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div className="ws-form-group">
                <label className="ws-form-label">Format</label>
                <select
                  className="ws-form-select"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as WorkshopFormat)}
                >
                  <option value="ONLINE">Online</option>
                  <option value="IN_PERSON">In Person</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="ws-form-row">
              <div className="ws-form-group">
                <label className="ws-form-label">Capacity</label>
                <input
                  type="number"
                  className="ws-form-input"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </div>

              <div className="ws-form-group">
                <label className="ws-form-label">Duration (minutes)</label>
                <input
                  type="number"
                  className="ws-form-input"
                  min={15}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>

              <div className="ws-form-group">
                <label className="ws-form-label">Price (USD)</label>
                <input
                  type="number"
                  className="ws-form-input"
                  min={0}
                  step={0.01}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
                <span className="ws-form-hint">Enter 0 for free workshops.</span>
              </div>
            </div>

            <div className="ws-form-group full">
              <label className="ws-form-label">Tags</label>
              <input
                type="text"
                className="ws-form-input"
                placeholder="web3, ipfs, akash (comma-separated)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div className="ws-form-group full">
              <label className="ws-form-label">Prerequisites</label>
              <textarea
                className="ws-form-textarea"
                placeholder="One prerequisite per line"
                value={prerequisitesInput}
                onChange={(e) => setPrerequisitesInput(e.target.value)}
              />
            </div>

            <div className="ws-form-group full">
              <label className="ws-form-label">Learning Outcomes</label>
              <textarea
                className="ws-form-textarea"
                placeholder="One outcome per line"
                value={outcomesInput}
                onChange={(e) => setOutcomesInput(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="ws-section">
          <div className="ws-section-header">
            <h3 className="ws-section-title">Sessions</h3>
            <button type="button" className="ws-btn-secondary" onClick={addSession}>
              + Add Session
            </button>
          </div>

          {sessions.length === 0 ? (
            <p style={{ color: 'var(--color-text-gray, #6B7280)', fontSize: 14 }}>
              No sessions added yet. You can add them now or after creating the workshop.
            </p>
          ) : (
            <div className="ws-session-list">
              {sessions.map((sess) => (
                <div key={sess.key} className="ws-session-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
                  <div className="ws-form-row">
                    <div className="ws-form-group">
                      <label className="ws-form-label">Session Title</label>
                      <input
                        type="text"
                        className="ws-form-input"
                        value={sess.title}
                        onChange={(e) => updateSession(sess.key, 'title', e.target.value)}
                      />
                    </div>
                    <div className="ws-form-group">
                      <label className="ws-form-label">Date</label>
                      <input
                        type="date"
                        className="ws-form-input"
                        value={sess.date}
                        onChange={(e) => updateSession(sess.key, 'date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="ws-form-row">
                    <div className="ws-form-group">
                      <label className="ws-form-label">Start Time</label>
                      <input
                        type="time"
                        className="ws-form-input"
                        value={sess.startTime}
                        onChange={(e) => updateSession(sess.key, 'startTime', e.target.value)}
                      />
                    </div>
                    <div className="ws-form-group">
                      <label className="ws-form-label">End Time</label>
                      <input
                        type="time"
                        className="ws-form-input"
                        value={sess.endTime}
                        onChange={(e) => updateSession(sess.key, 'endTime', e.target.value)}
                      />
                    </div>
                    <div className="ws-form-group">
                      <label className="ws-form-label">Timezone</label>
                      <select
                        className="ws-form-select"
                        value={sess.timezone}
                        onChange={(e) => updateSession(sess.key, 'timezone', e.target.value)}
                      >
                        <option value="America/Los_Angeles">Pacific (PT)</option>
                        <option value="America/New_York">Eastern (ET)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Berlin">Berlin (CET)</option>
                        <option value="Asia/Yerevan">Yerevan (AMT)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                  <div className="ws-form-row">
                    <div className="ws-form-group">
                      <label className="ws-form-label">Venue (optional)</label>
                      <input
                        type="text"
                        className="ws-form-input"
                        placeholder="Physical location"
                        value={sess.venue}
                        onChange={(e) => updateSession(sess.key, 'venue', e.target.value)}
                      />
                    </div>
                    <div className="ws-form-group">
                      <label className="ws-form-label">Online Link (optional)</label>
                      <input
                        type="url"
                        className="ws-form-input"
                        placeholder="https://zoom.us/j/..."
                        value={sess.onlineLink}
                        onChange={(e) => updateSession(sess.key, 'onlineLink', e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="ws-btn-small danger"
                      onClick={() => removeSession(sess.key)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="ws-form-actions">
          <button
            className="ws-btn-primary"
            disabled={saving}
            onClick={() => handleSubmit(false)}
          >
            {saving ? 'Creating...' : 'Save as Draft'}
          </button>
          <button
            className="ws-btn-secondary"
            disabled={saving}
            onClick={() => handleSubmit(true)}
          >
            Publish Now
          </button>
          <Link href="/admin/workshops" className="ws-btn-secondary">
            Cancel
          </Link>
        </div>
      </div>
    </>
  )
}
