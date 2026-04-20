'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useDialog } from '@/hooks/useDialog'
import {
  fetchAllEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getEventTypeColor,
  getEventTypeLabel,
  EVENT_TYPE_COLORS,
  type MarketingEvent,
  type MarketingEventType,
  type MarketingEventStatus,
  type CalendarView,
  type CreateCalendarEventInput,
  type UpdateCalendarEventInput,
} from '@/lib/calendar-api'
import {
  fetchScheduledSocialPosts,
  type SocialMediaPost,
} from '@/lib/social-api'
import Link from 'next/link'
import PlatformChip from '@/components/admin/PlatformChip'
import { getCookieValue } from '@/lib/cookies'
import { EmptyStateDecoration } from '@/components/admin/ShapeDecoration'
import './calendar-admin.css'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ALL_EVENT_TYPES: MarketingEventType[] = [
  'BLOG_PUBLISH',
  'SOCIAL_POST',
  'CAMPAIGN_LAUNCH',
  'HACKATHON',
  'WEBINAR',
  'PRODUCT_LAUNCH',
  'PRESS_RELEASE',
  'EMAIL_CAMPAIGN',
  'COMMUNITY_EVENT',
  'MILESTONE',
  'OTHER',
]

const ALL_STATUSES: MarketingEventStatus[] = [
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELED',
  'POSTPONED',
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDateRange(start: string, end: string | null, allDay: boolean): string {
  if (allDay) {
    const s = formatDate(start)
    return end ? `${s} - ${formatDate(end)}` : s
  }
  const s = `${formatDate(start)} ${formatTime(start)}`
  return end ? `${s} - ${formatTime(end)}` : s
}

function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function statusLabel(s: MarketingEventStatus): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date())
}

// ---------------------------------------------------------------------------
// Social post helpers
// ---------------------------------------------------------------------------

function postFallsOnDay(post: SocialMediaPost, day: Date): boolean {
  const dateStr = post.scheduledAt || post.publishedAt
  if (!dateStr) return false
  const postDate = new Date(dateStr)
  return isSameDay(postDate, day)
}

function socialStatusLabel(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase()
}

function truncateContent(content: string, max: number): string {
  if (content.length <= max) return content
  return content.slice(0, max) + '...'
}

// ---------------------------------------------------------------------------
// Calendar grid helpers
// ---------------------------------------------------------------------------

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
}

function getMonthGrid(year: number, month: number): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1)
  const startDow = firstOfMonth.getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: CalendarDay[] = []

  // Leading days from previous month
  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = startDow - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i)
    days.push({ date, isCurrentMonth: false, isToday: isToday(date) })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    days.push({ date, isCurrentMonth: true, isToday: isToday(date) })
  }

  // Trailing days to fill 6 rows (42 cells) or at minimum complete the last row
  const totalCells = days.length <= 35 ? 35 : 42
  const remaining = totalCells - days.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    days.push({ date, isCurrentMonth: false, isToday: isToday(date) })
  }

  return days
}

function getWeekDays(baseDate: Date): CalendarDay[] {
  const dow = baseDate.getDay()
  const sunday = new Date(baseDate)
  sunday.setDate(baseDate.getDate() - dow)

  const days: CalendarDay[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday)
    date.setDate(sunday.getDate() + i)
    days.push({
      date,
      isCurrentMonth: date.getMonth() === baseDate.getMonth(),
      isToday: isToday(date),
    })
  }
  return days
}

function eventFallsOnDay(event: MarketingEvent, day: Date): boolean {
  const start = new Date(event.startDate)
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())

  if (event.endDate) {
    const end = new Date(event.endDate)
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    return dayStart >= startDay && dayStart <= endDay
  }

  return isSameDay(startDay, dayStart)
}

// ---------------------------------------------------------------------------
// Blank event form state
// ---------------------------------------------------------------------------

interface EventFormState {
  title: string
  description: string
  eventType: MarketingEventType
  color: string
  startDate: string
  endDate: string
  allDay: boolean
  status: MarketingEventStatus
}

function blankForm(): EventFormState {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  return {
    title: '',
    description: '',
    eventType: 'OTHER',
    color: EVENT_TYPE_COLORS.OTHER,
    startDate: toLocalDatetimeValue(now.toISOString()),
    endDate: '',
    allDay: false,
    status: 'PLANNED',
  }
}

function blankFormForDate(date: Date): EventFormState {
  const d = new Date(date)
  d.setHours(9, 0, 0, 0)
  return {
    title: '',
    description: '',
    eventType: 'OTHER',
    color: EVENT_TYPE_COLORS.OTHER,
    startDate: toLocalDatetimeValue(d.toISOString()),
    endDate: '',
    allDay: false,
    status: 'PLANNED',
  }
}

function eventToForm(e: MarketingEvent): EventFormState {
  return {
    title: e.title,
    description: e.description || '',
    eventType: e.eventType,
    color: e.color || getEventTypeColor(e.eventType),
    startDate: toLocalDatetimeValue(e.startDate),
    endDate: e.endDate ? toLocalDatetimeValue(e.endDate) : '',
    allDay: e.allDay,
    status: e.status,
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarAdminPage() {
  const [events, setEvents] = useState<MarketingEvent[]>([])
  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [view, setView] = useState<CalendarView>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Dialogs
  const [detailEvent, setDetailEvent] = useState<MarketingEvent | null>(null)
  const [detailPost, setDetailPost] = useState<SocialMediaPost | null>(null)
  const [editEvent, setEditEvent] = useState<MarketingEvent | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [form, setForm] = useState<EventFormState>(blankForm())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<MarketingEvent | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Close all dialogs — defined early so useDialog hooks can reference it
  const closeDialogs = useCallback(() => {
    setShowCreateDialog(false)
    setEditEvent(null)
    setDetailEvent(null)
    setDetailPost(null)
    setDeleteConfirm(null)
    setSaveError('')
  }, [])

  // Dialog a11y refs
  const formDialogRef = useDialog(showCreateDialog || !!editEvent, closeDialogs)
  const detailDialogRef = useDialog(!!detailEvent && !editEvent, closeDialogs)
  const postDetailDialogRef = useDialog(!!detailPost && !detailEvent && !editEvent, closeDialogs)
  const deleteDialogRef = useDialog(!!deleteConfirm, () => setDeleteConfirm(null))

  // ---------------------------------------------------------------------------
  // Load events + social posts
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [eventsData, postsData] = await Promise.all([
          fetchAllEvents(token),
          fetchScheduledSocialPosts(token),
        ])
        setEvents(eventsData)
        setSocialPosts(postsData)
      } catch {
        setLoadError('Failed to load calendar data. Please refresh to try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Build a lookup: socialMediaPostId -> SocialMediaPost for events with attached posts
  const postLookup = useMemo(() => {
    const map = new Map<string, SocialMediaPost>()
    for (const p of socialPosts) {
      map.set(p.id, p)
    }
    return map
  }, [socialPosts])

  // Identify which events have attached social posts
  const eventHasPost = useCallback(
    (event: MarketingEvent): SocialMediaPost | null => {
      if (!event.socialMediaPostId) return null
      return postLookup.get(event.socialMediaPostId) || null
    },
    [postLookup],
  )

  // Social posts that are NOT already represented by a calendar event
  const standalonePostsForDay = useCallback(
    (day: Date): SocialMediaPost[] => {
      const eventPostIds = new Set(
        events
          .filter((e) => e.socialMediaPostId)
          .map((e) => e.socialMediaPostId),
      )
      return socialPosts.filter(
        (p) => postFallsOnDay(p, day) && !eventPostIds.has(p.id),
      )
    },
    [socialPosts, events],
  )

  // ---------------------------------------------------------------------------
  // Filtered events
  // ---------------------------------------------------------------------------

  const filtered = useMemo(() => {
    let result = events
    if (typeFilter !== 'ALL') {
      result = result.filter((e) => e.eventType === typeFilter)
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((e) => e.status === statusFilter)
    }
    return result.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
  }, [events, typeFilter, statusFilter])

  // ---------------------------------------------------------------------------
  // Date navigation
  // ---------------------------------------------------------------------------

  const navigateLabel = useMemo(() => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    }
    const week = getWeekDays(currentDate)
    const first = week[0].date
    const last = week[6].date
    if (first.getMonth() === last.getMonth()) {
      return `${first.toLocaleDateString('en-US', { month: 'long' })} ${first.getDate()} - ${last.getDate()}, ${first.getFullYear()}`
    }
    return `${first.toLocaleDateString('en-US', { month: 'short' })} ${first.getDate()} - ${last.toLocaleDateString('en-US', { month: 'short' })} ${last.getDate()}, ${last.getFullYear()}`
  }, [currentDate, view])

  const navigatePrev = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      if (view === 'month') {
        // Pin to day 1 before changing month to avoid date-drift
        // (e.g. Mar 31 → setMonth(1) → Feb 31 → overflows to Mar 3)
        d.setDate(1)
        d.setMonth(d.getMonth() - 1)
      } else {
        d.setDate(d.getDate() - 7)
      }
      return d
    })
  }, [view])

  const navigateNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      if (view === 'month') {
        d.setDate(1)
        d.setMonth(d.getMonth() + 1)
      } else {
        d.setDate(d.getDate() + 7)
      }
      return d
    })
  }, [view])

  const goToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // ---------------------------------------------------------------------------
  // Month / Week grids
  // ---------------------------------------------------------------------------

  const monthDays = useMemo(
    () => getMonthGrid(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate],
  )

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])

  // ---------------------------------------------------------------------------
  // Create / Edit handlers
  // ---------------------------------------------------------------------------

  const openCreate = useCallback(() => {
    setForm(blankForm())
    setSaveError('')
    setShowCreateDialog(true)
  }, [])

  const openCreateForDate = useCallback((date: Date) => {
    setForm(blankFormForDate(date))
    setSaveError('')
    setShowCreateDialog(true)
  }, [])

  const openEdit = useCallback((event: MarketingEvent) => {
    setForm(eventToForm(event))
    setSaveError('')
    setEditEvent(event)
    setDetailEvent(null)
  }, [])

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) {
      setSaveError('Title is required.')
      return
    }
    if (!form.startDate) {
      setSaveError('Start date is required.')
      return
    }

    setSaving(true)
    setSaveError('')

    try {
      const token = getCookieValue('af_access_token')

      if (editEvent) {
        // Update
        const input: UpdateCalendarEventInput = {
          title: form.title,
          description: form.description || undefined,
          eventType: form.eventType,
          color: form.color || undefined,
          startDate: new Date(form.startDate).toISOString(),
          endDate: form.endDate
            ? new Date(form.endDate).toISOString()
            : undefined,
          allDay: form.allDay,
          status: form.status,
        }
        const updated = await updateCalendarEvent(token, editEvent.id, input)
        setEvents((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e)),
        )
        setEditEvent(null)
      } else {
        // Create
        const input: CreateCalendarEventInput = {
          title: form.title,
          description: form.description || undefined,
          eventType: form.eventType,
          color: form.color || undefined,
          startDate: new Date(form.startDate).toISOString(),
          endDate: form.endDate
            ? new Date(form.endDate).toISOString()
            : undefined,
          allDay: form.allDay,
          status: form.status,
        }
        const created = await createCalendarEvent(token, input)
        setEvents((prev) => [created, ...prev])
        setShowCreateDialog(false)
      }
    } catch {
      setSaveError('Failed to save event. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [form, editEvent])

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteCalendarEvent(token, deleteConfirm.id)
      setEvents((prev) => prev.filter((e) => e.id !== deleteConfirm.id))
      setDeleteConfirm(null)
      setEditEvent(null)
      setDetailEvent(null)
    } catch {
      setSaveError('Failed to delete event. Please try again.')
    } finally {
      setDeleting(false)
    }
  }, [deleteConfirm])

  const updateFormField = useCallback(
    <K extends keyof EventFormState>(field: K, value: EventFormState[K]) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value }
        // Auto-set color when event type changes
        if (field === 'eventType') {
          next.color = EVENT_TYPE_COLORS[value as MarketingEventType] || next.color
        }
        return next
      })
    },
    [],
  )

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function renderEventChip(event: MarketingEvent, compact = false) {
    const color = event.color || getEventTypeColor(event.eventType)
    const attachedPost = eventHasPost(event)
    return (
      <button
        key={event.id}
        className={`calendar-admin-event-chip ${compact ? 'compact' : ''} ${attachedPost ? 'has-post' : ''}`}
        style={{ '--event-color': color } as React.CSSProperties}
        onClick={(e) => {
          e.stopPropagation()
          setDetailEvent(event)
        }}
        title={event.title}
      >
        <span className="calendar-admin-event-dot" />
        {!compact && (
          <span className="calendar-admin-event-chip-label">{event.title}</span>
        )}
        {attachedPost && (
          <span className="calendar-admin-event-post-indicator" title="Has scheduled post" />
        )}
      </button>
    )
  }

  function renderPostChip(post: SocialMediaPost, compact = false) {
    return (
      <button
        key={post.id}
        className={`calendar-admin-event-chip calendar-admin-post-chip ${compact ? 'compact' : ''}`}
        style={{ '--event-color': '#BE4200' } as React.CSSProperties}
        onClick={(e) => {
          e.stopPropagation()
          setDetailPost(post)
        }}
        title={truncateContent(post.content, 60)}
      >
        <span className="calendar-admin-event-dot" />
        {!compact && (
          <span className="calendar-admin-event-chip-label">
            <span className="calendar-admin-post-chip-platform">{post.platform}</span>
            {' '}
            {truncateContent(post.content, 30)}
          </span>
        )}
      </button>
    )
  }

  function renderTypeChip(type: MarketingEventType) {
    const color = getEventTypeColor(type)
    return (
      <span
        className="calendar-admin-type-chip"
        style={{ '--chip-color': color } as React.CSSProperties}
      >
        {getEventTypeLabel(type)}
      </span>
    )
  }

  function renderStatusChip(status: MarketingEventStatus) {
    return (
      <span className={`calendar-admin-status-chip ${status.toLowerCase().replace('_', '-')}`}>
        {statusLabel(status)}
      </span>
    )
  }

  // ---------------------------------------------------------------------------
  // Event form dialog (shared for create & edit)
  // ---------------------------------------------------------------------------

  function renderEventFormDialog() {
    const isEdit = !!editEvent
    return (
      <div className="calendar-admin-dialog-overlay" onClick={closeDialogs}>
        <div
          className="calendar-admin-dialog calendar-admin-dialog--form"
          ref={formDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-form-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 id="calendar-form-dialog-title">{isEdit ? 'Edit Event' : 'New Event'}</h3>

          {saveError && (
            <div className="calendar-admin-form-error">{saveError}</div>
          )}

          <div className="calendar-admin-form-group">
            <label className="calendar-admin-form-label">Title</label>
            <input
              type="text"
              className="calendar-admin-form-input"
              value={form.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              placeholder="Event title"
            />
          </div>

          <div className="calendar-admin-form-group">
            <label className="calendar-admin-form-label">Description</label>
            <textarea
              className="calendar-admin-form-textarea"
              value={form.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="calendar-admin-form-row">
            <div className="calendar-admin-form-group calendar-admin-form-group--flex">
              <label className="calendar-admin-form-label">Event Type</label>
              <select
                className="calendar-admin-form-select"
                value={form.eventType}
                onChange={(e) =>
                  updateFormField('eventType', e.target.value as MarketingEventType)
                }
              >
                {ALL_EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {getEventTypeLabel(t)}
                  </option>
                ))}
              </select>
            </div>

            <div className="calendar-admin-form-group calendar-admin-form-group--flex">
              <label className="calendar-admin-form-label">Color</label>
              <div className="calendar-admin-color-row">
                <input
                  type="color"
                  className="calendar-admin-form-color"
                  value={form.color}
                  onChange={(e) => updateFormField('color', e.target.value)}
                />
                <span className="calendar-admin-color-hex">{form.color}</span>
              </div>
            </div>
          </div>

          <div className="calendar-admin-form-row">
            <div className="calendar-admin-form-group calendar-admin-form-group--flex">
              <label className="calendar-admin-form-label">Start Date</label>
              <input
                type="datetime-local"
                className="calendar-admin-form-input"
                value={form.startDate}
                onChange={(e) => updateFormField('startDate', e.target.value)}
              />
            </div>

            <div className="calendar-admin-form-group calendar-admin-form-group--flex">
              <label className="calendar-admin-form-label">End Date</label>
              <input
                type="datetime-local"
                className="calendar-admin-form-input"
                value={form.endDate}
                onChange={(e) => updateFormField('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="calendar-admin-form-row">
            <div className="calendar-admin-form-group calendar-admin-form-group--flex">
              <label className="calendar-admin-form-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.allDay}
                  onChange={(e) => updateFormField('allDay', e.target.checked)}
                />
                All Day
              </label>
            </div>

            <div className="calendar-admin-form-group calendar-admin-form-group--flex">
              <label className="calendar-admin-form-label">Status</label>
              <select
                className="calendar-admin-form-select"
                value={form.status}
                onChange={(e) =>
                  updateFormField('status', e.target.value as MarketingEventStatus)
                }
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="calendar-admin-dialog-actions">
            {isEdit && (
              <button
                className="calendar-admin-dialog-delete-btn"
                onClick={() => setDeleteConfirm(editEvent)}
              >
                Delete
              </button>
            )}
            <div className="calendar-admin-dialog-actions-right">
              <button
                className="calendar-admin-dialog-cancel"
                onClick={closeDialogs}
              >
                Cancel
              </button>
              <button
                className="calendar-admin-dialog-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Detail dialog (events) — now shows attached post info
  // ---------------------------------------------------------------------------

  function renderDetailDialog() {
    if (!detailEvent) return null
    const e = detailEvent
    const attachedPost = eventHasPost(e)
    return (
      <div className="calendar-admin-dialog-overlay" onClick={closeDialogs}>
        <div
          className="calendar-admin-dialog calendar-admin-dialog--detail"
          ref={detailDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-detail-dialog-title"
          onClick={(ev) => ev.stopPropagation()}
        >
          <div className="calendar-admin-detail-header">
            <div
              className="calendar-admin-detail-color-bar"
              style={{
                backgroundColor:
                  e.color || getEventTypeColor(e.eventType),
              }}
            />
            <h3 id="calendar-detail-dialog-title">{e.title}</h3>
          </div>

          <div className="calendar-admin-detail-meta">
            {renderTypeChip(e.eventType)}
            {renderStatusChip(e.status)}
          </div>

          <div className="calendar-admin-detail-row">
            <span className="calendar-admin-detail-label">Date</span>
            <span>{formatDateRange(e.startDate, e.endDate, e.allDay)}</span>
          </div>

          {e.description && (
            <div className="calendar-admin-detail-row">
              <span className="calendar-admin-detail-label">Description</span>
              <span>{e.description}</span>
            </div>
          )}

          {/* Attached social post section */}
          {attachedPost && (
            <div className="calendar-admin-detail-post-section">
              <span className="calendar-admin-detail-label">Attached Post</span>
              <div className="calendar-admin-detail-post-card">
                <div className="calendar-admin-detail-post-header">
                  <PlatformChip platform={attachedPost.platform} />
                  <span className={`calendar-admin-post-status-badge ${attachedPost.status.toLowerCase()}`}>
                    {socialStatusLabel(attachedPost.status)}
                  </span>
                </div>
                <p className="calendar-admin-detail-post-content">
                  {truncateContent(attachedPost.content, 200)}
                </p>
                {attachedPost.hashtags.length > 0 && (
                  <div className="calendar-admin-detail-post-hashtags">
                    {attachedPost.hashtags.map((tag, idx) => (
                      <span key={idx} className="calendar-admin-detail-post-tag">{tag}</span>
                    ))}
                  </div>
                )}
                {attachedPost.scheduledAt && (
                  <div className="calendar-admin-detail-post-schedule">
                    Scheduled: {formatDate(attachedPost.scheduledAt)} {formatTime(attachedPost.scheduledAt)}
                  </div>
                )}
                <Link
                  href={`/admin/social/${attachedPost.id}`}
                  className="calendar-admin-detail-post-link"
                >
                  {attachedPost.status === 'PUBLISHED' ? 'View Post' : 'Edit Post'}
                </Link>
              </div>
            </div>
          )}

          {e.metadata && Object.keys(e.metadata).length > 0 && (
            <div className="calendar-admin-detail-row">
              <span className="calendar-admin-detail-label">Metadata</span>
              <span className="calendar-admin-detail-metadata">
                {JSON.stringify(e.metadata, null, 2)}
              </span>
            </div>
          )}

          <div className="calendar-admin-detail-row">
            <span className="calendar-admin-detail-label">Created</span>
            <span>{formatDate(e.createdAt)}</span>
          </div>

          <div className="calendar-admin-dialog-actions">
            <button
              className="calendar-admin-dialog-delete-btn"
              onClick={() => setDeleteConfirm(e)}
            >
              Delete
            </button>
            <div className="calendar-admin-dialog-actions-right">
              <button
                className="calendar-admin-dialog-cancel"
                onClick={closeDialogs}
              >
                Close
              </button>
              <button
                className="calendar-admin-dialog-save"
                onClick={() => openEdit(e)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Social post detail dialog (for standalone posts on calendar)
  // ---------------------------------------------------------------------------

  function renderPostDetailDialog() {
    if (!detailPost) return null
    const p = detailPost
    return (
      <div className="calendar-admin-dialog-overlay" onClick={closeDialogs}>
        <div
          className="calendar-admin-dialog calendar-admin-dialog--detail"
          ref={postDetailDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-post-detail-title"
          onClick={(ev) => ev.stopPropagation()}
        >
          <div className="calendar-admin-detail-header">
            <div
              className="calendar-admin-detail-color-bar"
              style={{ backgroundColor: '#BE4200' }}
            />
            <h3 id="calendar-post-detail-title">Scheduled Post</h3>
          </div>

          <div className="calendar-admin-detail-meta">
            <PlatformChip platform={p.platform} />
            <span className={`calendar-admin-post-status-badge ${p.status.toLowerCase()}`}>
              {socialStatusLabel(p.status)}
            </span>
          </div>

          <div className="calendar-admin-detail-row">
            <span className="calendar-admin-detail-label">Content</span>
            <span className="calendar-admin-detail-post-content-full">{p.content}</span>
          </div>

          {p.scheduledAt && (
            <div className="calendar-admin-detail-row">
              <span className="calendar-admin-detail-label">Scheduled For</span>
              <span>{formatDate(p.scheduledAt)} {formatTime(p.scheduledAt)}</span>
            </div>
          )}

          {p.publishedAt && (
            <div className="calendar-admin-detail-row">
              <span className="calendar-admin-detail-label">Published</span>
              <span>{formatDate(p.publishedAt)} {formatTime(p.publishedAt)}</span>
            </div>
          )}

          {p.hashtags.length > 0 && (
            <div className="calendar-admin-detail-row">
              <span className="calendar-admin-detail-label">Hashtags</span>
              <div className="calendar-admin-detail-post-hashtags">
                {p.hashtags.map((tag, idx) => (
                  <span key={idx} className="calendar-admin-detail-post-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="calendar-admin-detail-row">
            <span className="calendar-admin-detail-label">Created</span>
            <span>{formatDate(p.createdAt)}</span>
          </div>

          <div className="calendar-admin-dialog-actions">
            <div className="calendar-admin-dialog-actions-right">
              <button
                className="calendar-admin-dialog-cancel"
                onClick={closeDialogs}
              >
                Close
              </button>
              <Link
                href={`/admin/social/${p.id}`}
                className="calendar-admin-dialog-save"
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                {p.status === 'PUBLISHED' ? 'View Post' : 'Edit Post'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Delete confirmation dialog
  // ---------------------------------------------------------------------------

  function renderDeleteDialog() {
    if (!deleteConfirm) return null
    return (
      <div
        className="calendar-admin-dialog-overlay"
        onClick={() => setDeleteConfirm(null)}
      >
        <div
          className="calendar-admin-dialog"
          ref={deleteDialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="calendar-delete-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 id="calendar-delete-dialog-title">Delete event?</h3>
          <p className="calendar-admin-dialog-text">
            Are you sure you want to delete &ldquo;{deleteConfirm.title}&rdquo;?
            This action cannot be undone.
          </p>
          <div className="calendar-admin-dialog-actions">
            <div className="calendar-admin-dialog-actions-right">
              <button
                className="calendar-admin-dialog-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="calendar-admin-dialog-confirm-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Month view
  // ---------------------------------------------------------------------------

  function renderMonthView() {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <div className="calendar-admin-month">
        <div className="calendar-admin-month-header">
          {dayNames.map((d) => (
            <div key={d} className="calendar-admin-month-day-name">
              {d}
            </div>
          ))}
        </div>
        <div className="calendar-admin-month-grid">
          {monthDays.map((day, i) => {
            const dayEvents = filtered.filter((e) =>
              eventFallsOnDay(e, day.date),
            )
            const dayPosts = standalonePostsForDay(day.date)
            const totalItems = dayEvents.length + dayPosts.length
            const classes = [
              'calendar-admin-month-cell',
              !day.isCurrentMonth && 'other-month',
              day.isToday && 'today',
              dayPosts.length > 0 && 'has-posts',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <div
                key={i}
                className={classes}
                onClick={() => openCreateForDate(day.date)}
              >
                <div className="calendar-admin-month-cell-number">
                  {day.date.getDate()}
                  {dayPosts.length > 0 && (
                    <span className="calendar-admin-month-post-badge" title={`${dayPosts.length} post${dayPosts.length > 1 ? 's' : ''}`}>
                      {dayPosts.length}
                    </span>
                  )}
                </div>
                <div className="calendar-admin-month-cell-events">
                  {dayEvents.slice(0, 2).map((ev) => renderEventChip(ev, totalItems > 3))}
                  {dayPosts.slice(0, totalItems > 3 ? 1 : 2).map((p) => renderPostChip(p, totalItems > 3))}
                  {totalItems > 3 && (
                    <span className="calendar-admin-month-more">
                      +{totalItems - 3} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Week view
  // ---------------------------------------------------------------------------

  function renderWeekView() {
    return (
      <div className="calendar-admin-week">
        <div className="calendar-admin-week-grid">
          {weekDays.map((day, i) => {
            const dayEvents = filtered.filter((e) =>
              eventFallsOnDay(e, day.date),
            )
            const dayPosts = standalonePostsForDay(day.date)
            const classes = [
              'calendar-admin-week-col',
              day.isToday && 'today',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <div key={i} className={classes}>
                <div
                  className="calendar-admin-week-day-header"
                  onClick={() => openCreateForDate(day.date)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="calendar-admin-week-day-name">
                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span
                    className={`calendar-admin-week-day-num ${day.isToday ? 'today' : ''}`}
                  >
                    {day.date.getDate()}
                  </span>
                </div>
                <div className="calendar-admin-week-day-events">
                  {dayEvents.map((ev) => {
                    const color =
                      ev.color || getEventTypeColor(ev.eventType)
                    const attachedPost = eventHasPost(ev)
                    return (
                      <button
                        key={ev.id}
                        className={`calendar-admin-week-event-card ${attachedPost ? 'has-post' : ''}`}
                        style={{ '--event-color': color } as React.CSSProperties}
                        onClick={() => setDetailEvent(ev)}
                      >
                        <span className="calendar-admin-week-event-title">
                          {ev.title}
                          {attachedPost && (
                            <span className="calendar-admin-week-post-indicator" />
                          )}
                        </span>
                        {!ev.allDay && (
                          <span className="calendar-admin-week-event-time">
                            {formatTime(ev.startDate)}
                          </span>
                        )}
                        {attachedPost && (
                          <span className="calendar-admin-week-post-preview">
                            <PlatformChip platform={attachedPost.platform} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                  {/* Standalone scheduled posts */}
                  {dayPosts.map((post) => (
                    <button
                      key={post.id}
                      className="calendar-admin-week-event-card calendar-admin-week-post-card"
                      style={{ '--event-color': '#BE4200' } as React.CSSProperties}
                      onClick={() => setDetailPost(post)}
                    >
                      <span className="calendar-admin-week-event-title">
                        <PlatformChip platform={post.platform} />
                      </span>
                      <span className="calendar-admin-week-post-content-preview">
                        {truncateContent(post.content, 60)}
                      </span>
                      {post.scheduledAt && (
                        <span className="calendar-admin-week-event-time">
                          {formatTime(post.scheduledAt)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // List view
  // ---------------------------------------------------------------------------

  function renderListView() {
    // Merge events and standalone posts for list view
    const allPostsForList = socialPosts.filter((p) => {
      const eventPostIds = new Set(
        events.filter((e) => e.socialMediaPostId).map((e) => e.socialMediaPostId),
      )
      return !eventPostIds.has(p.id) && (p.scheduledAt || p.publishedAt)
    })

    if (filtered.length === 0 && allPostsForList.length === 0) {
      return (
        <EmptyStateDecoration
          page="calendar"
          theme="brand"
          heading={events.length === 0 ? 'No events yet' : 'No events found'}
          message={events.length === 0 ? undefined : 'Try adjusting your filters.'}
        />
      )
    }

    return (
      <div className="calendar-admin-table-wrap">
        <table className="calendar-admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event) => {
              const attachedPost = eventHasPost(event)
              return (
                <tr key={event.id} className={attachedPost ? 'calendar-admin-table-row-has-post' : ''}>
                  <td className="calendar-admin-table-date">
                    {formatDate(event.startDate)}
                    {!event.allDay && (
                      <span className="calendar-admin-table-time">
                        {formatTime(event.startDate)}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="calendar-admin-table-title">
                      {event.title}
                      {attachedPost && (
                        <span className="calendar-admin-table-post-badge">
                          <PlatformChip platform={attachedPost.platform} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{renderTypeChip(event.eventType)}</td>
                  <td>{renderStatusChip(event.status)}</td>
                  <td>
                    <div className="calendar-admin-table-desc">
                      {event.description
                        ? event.description.length > 80
                          ? event.description.slice(0, 80) + '...'
                          : event.description
                        : '--'}
                    </div>
                  </td>
                  <td>
                    <div className="calendar-admin-table-actions">
                      <button
                        className="calendar-admin-action-btn"
                        onClick={() => setDetailEvent(event)}
                      >
                        View
                      </button>
                      <button
                        className="calendar-admin-action-btn"
                        onClick={() => openEdit(event)}
                      >
                        Edit
                      </button>
                      <button
                        className="calendar-admin-action-btn danger"
                        onClick={() => setDeleteConfirm(event)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {/* Standalone scheduled posts in list view */}
            {allPostsForList.map((post) => (
              <tr key={`post-${post.id}`} className="calendar-admin-table-row-post">
                <td className="calendar-admin-table-date">
                  {formatDate(post.scheduledAt || post.publishedAt || post.createdAt)}
                  <span className="calendar-admin-table-time">
                    {formatTime(post.scheduledAt || post.publishedAt || post.createdAt)}
                  </span>
                </td>
                <td>
                  <div className="calendar-admin-table-title">
                    <PlatformChip platform={post.platform} />
                  </div>
                </td>
                <td>
                  <span
                    className="calendar-admin-type-chip"
                    style={{ '--chip-color': '#BE4200' } as React.CSSProperties}
                  >
                    Social Post
                  </span>
                </td>
                <td>
                  <span className={`calendar-admin-post-status-badge ${post.status.toLowerCase()}`}>
                    {socialStatusLabel(post.status)}
                  </span>
                </td>
                <td>
                  <div className="calendar-admin-table-desc">
                    {truncateContent(post.content, 80)}
                  </div>
                </td>
                <td>
                  <div className="calendar-admin-table-actions">
                    <button
                      className="calendar-admin-action-btn"
                      onClick={() => setDetailPost(post)}
                    >
                      View
                    </button>
                    <Link
                      href={`/admin/social/${post.id}`}
                      className="calendar-admin-action-btn"
                    >
                      {post.status === 'PUBLISHED' ? 'View' : 'Edit'}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="calendar-admin-empty">
        <p>Loading calendar...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="calendar-admin-empty">
        <h2>Error</h2>
        <p>{loadError}</p>
        <button
          className="calendar-admin-new-btn"
          onClick={() => window.location.reload()}
          style={{ marginTop: 12 }}
        >
          Retry
        </button>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Header */}
      <div className="calendar-admin-header">
        <h1>Marketing Calendar</h1>
        <div className="calendar-admin-header-actions">
          <div className="calendar-admin-view-toggle">
            {(['month', 'week', 'list'] as CalendarView[]).map((v) => (
              <button
                key={v}
                className={`calendar-admin-view-btn ${view === v ? 'active' : ''}`}
                onClick={() => setView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button className="calendar-admin-new-btn" onClick={openCreate}>
            + New Event
          </button>
        </div>
      </div>

      {/* Date navigation (month & week views) */}
      {view !== 'list' && (
        <div className="calendar-admin-nav">
          <button className="calendar-admin-nav-btn" onClick={navigatePrev}>
            &lsaquo; Previous
          </button>
          <div className="calendar-admin-nav-center">
            <span className="calendar-admin-nav-label">{navigateLabel}</span>
            <button className="calendar-admin-nav-today" onClick={goToday}>
              Today
            </button>
          </div>
          <button className="calendar-admin-nav-btn" onClick={navigateNext}>
            Next &rsaquo;
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="calendar-admin-filters">
        <select
          className="calendar-admin-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All types</option>
          {ALL_EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {getEventTypeLabel(t)}
            </option>
          ))}
        </select>
        <select
          className="calendar-admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar views */}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'list' && renderListView()}

      {/* Mobile agenda fallback — visible only at <480px when month/week are hidden */}
      {view !== 'list' && (
        <div className="calendar-admin-mobile-agenda">
          <h3 className="calendar-admin-mobile-agenda-title">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          {(() => {
            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()
            const daysInMonth = new Date(year, month + 1, 0).getDate()
            const dayItems: React.ReactNode[] = []

            for (let d = 1; d <= daysInMonth; d++) {
              const date = new Date(year, month, d)
              const dayEvents = filtered.filter((e) => eventFallsOnDay(e, date))
              const dayPosts = standalonePostsForDay(date)
              if (dayEvents.length === 0 && dayPosts.length === 0) continue

              dayItems.push(
                <div key={d} className="calendar-admin-mobile-agenda-day">
                  <div className={`calendar-admin-mobile-agenda-date${isToday(date) ? ' today' : ''}`}>
                    <span className="calendar-admin-mobile-agenda-dayname">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="calendar-admin-mobile-agenda-daynum">{d}</span>
                  </div>
                  <div className="calendar-admin-mobile-agenda-items">
                    {dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        className="calendar-admin-mobile-agenda-item"
                        style={{ borderLeftColor: ev.color || getEventTypeColor(ev.eventType) }}
                        onClick={() => setDetailEvent(ev)}
                      >
                        <span className="calendar-admin-mobile-agenda-item-title">{ev.title}</span>
                        <span className="calendar-admin-mobile-agenda-item-meta">
                          {getEventTypeLabel(ev.eventType)}
                          {!ev.allDay && ` \u00B7 ${formatTime(ev.startDate)}`}
                        </span>
                      </button>
                    ))}
                    {dayPosts.map((post) => (
                      <button
                        key={post.id}
                        className="calendar-admin-mobile-agenda-item calendar-admin-mobile-agenda-item--post"
                        onClick={() => setDetailPost(post)}
                      >
                        <span className="calendar-admin-mobile-agenda-item-title">
                          {post.platform}: {truncateContent(post.content, 50)}
                        </span>
                        <span className="calendar-admin-mobile-agenda-item-meta">
                          Social Post{post.scheduledAt ? ` \u00B7 ${formatTime(post.scheduledAt)}` : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>,
              )
            }

            if (dayItems.length === 0) {
              return (
                <div className="calendar-admin-empty" style={{ padding: '24px 0' }}>
                  <p>No events this month.</p>
                </div>
              )
            }

            return dayItems
          })()}
        </div>
      )}

      {/* Dialogs */}
      {(showCreateDialog || editEvent) && renderEventFormDialog()}
      {detailEvent && !editEvent && renderDetailDialog()}
      {detailPost && !detailEvent && !editEvent && renderPostDetailDialog()}
      {deleteConfirm && renderDeleteDialog()}
    </>
  )
}
