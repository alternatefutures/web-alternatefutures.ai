'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import '../blog-admin.css'

type CalendarBrief = {
  id: string
  title: string
  status: 'draft' | 'review' | 'scheduled' | 'published'
  date: string
  author: string
  contentType: string
}

const STATUS_COLORS: Record<CalendarBrief['status'], { bg: string; color: string; border: string }> = {
  draft: { bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' },
  review: { bg: '#DBEAFE', color: '#1E40AF', border: '#3B82F6' },
  scheduled: { bg: '#E0E7FF', color: '#3730A3', border: '#6366F1' },
  published: { bg: '#D1FAE5', color: '#065F46', border: '#10B981' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const SAMPLE_BRIEFS: CalendarBrief[] = [
  { id: '1', title: 'Getting Started with Decentralized Hosting', status: 'published', date: '2026-02-03', author: 'Content Team', contentType: 'tutorial' },
  { id: '2', title: 'IPFS vs Traditional CDN Performance', status: 'scheduled', date: '2026-02-10', author: 'Content Team', contentType: 'blog' },
  { id: '3', title: 'Serverless Functions on AlternateFutures', status: 'review', date: '2026-02-14', author: 'DevRel', contentType: 'tutorial' },
  { id: '4', title: 'AI Agent Deployment Guide', status: 'draft', date: '2026-02-20', author: 'Content Team', contentType: 'blog' },
  { id: '5', title: 'Case Study: Migrating from Vercel', status: 'draft', date: '2026-02-25', author: 'Marketing', contentType: 'case-study' },
  { id: '6', title: 'Arweave Permanent Storage Deep Dive', status: 'scheduled', date: '2026-03-05', author: 'DevRel', contentType: 'blog' },
]

export default function EditorialCalendar() {
  const [briefs, setBriefs] = useState<CalendarBrief[]>(SAMPLE_BRIEFS)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1))
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [dragItem, setDragItem] = useState<string | null>(null)
  const [quickCreate, setQuickCreate] = useState<string | null>(null)
  const [quickTitle, setQuickTitle] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    while (days.length % 7 !== 0) days.push(null)
    return days
  }, [year, month])

  const weekDays = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - dayOfWeek)
    const days: { date: Date; key: string }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push({ date: d, key: formatDateKey(d.getFullYear(), d.getMonth(), d.getDate()) })
    }
    return days
  }, [])

  const briefsByDate = useMemo(() => {
    const map: Record<string, CalendarBrief[]> = {}
    briefs.forEach((b) => {
      if (!map[b.date]) map[b.date] = []
      map[b.date].push(b)
    })
    return map
  }, [briefs])

  const stats = useMemo(() => ({
    total: briefs.length,
    draft: briefs.filter((b) => b.status === 'draft').length,
    review: briefs.filter((b) => b.status === 'review').length,
    scheduled: briefs.filter((b) => b.status === 'scheduled').length,
    published: briefs.filter((b) => b.status === 'published').length,
  }), [briefs])

  const navigateMonth = useCallback((delta: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta))
  }, [])

  const handleDragStart = useCallback((id: string) => {
    setDragItem(id)
  }, [])

  const handleDrop = useCallback((dateKey: string) => {
    if (!dragItem) return
    setBriefs((prev) =>
      prev.map((b) => (b.id === dragItem ? { ...b, date: dateKey } : b))
    )
    setDragItem(null)
  }, [dragItem])

  const handleQuickCreate = useCallback((dateKey: string) => {
    if (!quickTitle.trim()) return
    const newBrief: CalendarBrief = {
      id: generateId(),
      title: quickTitle.trim(),
      status: 'draft',
      date: dateKey,
      author: 'Unassigned',
      contentType: 'blog',
    }
    setBriefs((prev) => [...prev, newBrief])
    setQuickTitle('')
    setQuickCreate(null)
  }, [quickTitle])

  const today = new Date()
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <>
      <div className="blog-admin-header">
        <div>
          <Link href="/admin/blog" className="blog-editor-back">
            &larr; Blog
          </Link>
          <h1 style={{ marginTop: 8 }}>Editorial Calendar</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
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
          <div className="blog-admin-stat-label">In Review</div>
          <div className="blog-admin-stat-value">{stats.review}</div>
        </div>
        <div className="blog-admin-stat-card">
          <div className="blog-admin-stat-label">Scheduled</div>
          <div className="blog-admin-stat-value">{stats.scheduled}</div>
        </div>
        <div className="blog-admin-stat-card">
          <div className="blog-admin-stat-label">Published</div>
          <div className="blog-admin-stat-value">{stats.published}</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      {/* Calendar controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigateMonth(-1)}
            className="blog-admin-action-btn"
          >
            &larr;
          </button>
          <h2 style={{
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-text-dark, #1F2937)',
            margin: 0,
            minWidth: 180,
            textAlign: 'center',
          }}>
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="blog-admin-action-btn"
          >
            &rarr;
          </button>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="blog-admin-action-btn"
            onClick={() => setViewMode('month')}
            style={viewMode === 'month' ? {
              background: 'var(--color-blue, #000AFF)',
              color: '#fff',
              borderColor: 'var(--color-blue, #000AFF)',
            } : undefined}
          >
            Month
          </button>
          <button
            className="blog-admin-action-btn"
            onClick={() => setViewMode('week')}
            style={viewMode === 'week' ? {
              background: 'var(--color-blue, #000AFF)',
              color: '#fff',
              borderColor: 'var(--color-blue, #000AFF)',
            } : undefined}
          >
            Week
          </button>
        </div>
      </div>

      {/* Status legend */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}>
        {(Object.entries(STATUS_COLORS) as [CalendarBrief['status'], typeof STATUS_COLORS[CalendarBrief['status']]][]).map(([status, style]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: style.bg,
              border: `2px solid ${style.border}`,
            }} />
            <span style={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: 12,
              color: 'var(--color-text-gray, #6B7280)',
              textTransform: 'capitalize',
            }}>
              {status}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {viewMode === 'month' ? (
        <div style={{
          background: 'var(--color-white, #fff)',
          border: '1px solid var(--color-border, #E5E7EB)',
          borderRadius: 'var(--radius-lg, 12px)',
          overflow: 'hidden',
        }}>
          {/* Day headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid var(--color-border, #E5E7EB)',
          }}>
            {DAYS.map((day) => (
              <div key={day} style={{
                padding: '10px 8px',
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-gray, #6B7280)',
                textAlign: 'center',
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
          }}>
            {calendarDays.map((day, idx) => {
              const dateKey = day ? formatDateKey(year, month, day) : ''
              const dayBriefs = dateKey ? (briefsByDate[dateKey] || []) : []
              const isToday = dateKey === todayKey

              return (
                <div
                  key={idx}
                  onDragOver={(e) => { if (day) e.preventDefault() }}
                  onDrop={() => { if (day) handleDrop(dateKey) }}
                  onClick={() => { if (day && dayBriefs.length === 0) setQuickCreate(dateKey) }}
                  style={{
                    minHeight: 100,
                    padding: 6,
                    borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--color-border, #E5E7EB)' : undefined,
                    borderBottom: idx < calendarDays.length - 7 ? '1px solid var(--color-border, #E5E7EB)' : undefined,
                    background: day ? (isToday ? 'rgba(0, 10, 255, 0.03)' : undefined) : 'var(--color-bg-light, #F9FAFB)',
                    cursor: day ? 'pointer' : undefined,
                  }}
                >
                  {day && (
                    <>
                      <div style={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontSize: 13,
                        fontWeight: isToday ? 700 : 400,
                        color: isToday ? 'var(--color-blue, #000AFF)' : 'var(--color-text-dark, #1F2937)',
                        marginBottom: 4,
                        padding: '2px 6px',
                        borderRadius: isToday ? 'var(--radius-full, 50px)' : undefined,
                        background: isToday ? 'rgba(0, 10, 255, 0.08)' : undefined,
                        display: 'inline-block',
                      }}>
                        {day}
                      </div>
                      {dayBriefs.map((brief) => {
                        const s = STATUS_COLORS[brief.status]
                        return (
                          <div
                            key={brief.id}
                            draggable
                            onDragStart={() => handleDragStart(brief.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              padding: '3px 6px',
                              marginBottom: 2,
                              borderRadius: 4,
                              background: s.bg,
                              borderLeft: `3px solid ${s.border}`,
                              cursor: 'grab',
                            }}
                          >
                            <Link
                              href="/admin/blog/briefs"
                              style={{
                                fontFamily: '"Instrument Sans", sans-serif',
                                fontSize: 11,
                                fontWeight: 500,
                                color: s.color,
                                textDecoration: 'none',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {brief.title}
                            </Link>
                          </div>
                        )
                      })}
                      {quickCreate === dateKey && (
                        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 4 }}>
                          <input
                            autoFocus
                            type="text"
                            placeholder="Brief title..."
                            value={quickTitle}
                            onChange={(e) => setQuickTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleQuickCreate(dateKey)
                              if (e.key === 'Escape') { setQuickCreate(null); setQuickTitle('') }
                            }}
                            onBlur={() => { setQuickCreate(null); setQuickTitle('') }}
                            style={{
                              width: '100%',
                              padding: '3px 6px',
                              fontSize: 11,
                              fontFamily: '"Instrument Sans", sans-serif',
                              border: '1px solid var(--color-blue, #000AFF)',
                              borderRadius: 4,
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Week view */
        <div style={{
          background: 'var(--color-white, #fff)',
          border: '1px solid var(--color-border, #E5E7EB)',
          borderRadius: 'var(--radius-lg, 12px)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
          }}>
            {weekDays.map((wd, idx) => {
              const dayBriefs = briefsByDate[wd.key] || []
              const isToday = wd.key === todayKey
              return (
                <div
                  key={wd.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(wd.key)}
                  onClick={() => { if (dayBriefs.length === 0) setQuickCreate(wd.key) }}
                  style={{
                    minHeight: 300,
                    padding: 10,
                    borderRight: idx < 6 ? '1px solid var(--color-border, #E5E7EB)' : undefined,
                    background: isToday ? 'rgba(0, 10, 255, 0.03)' : undefined,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isToday ? 'var(--color-blue, #000AFF)' : 'var(--color-text-gray, #6B7280)',
                    marginBottom: 4,
                  }}>
                    {DAYS[wd.date.getDay()]}
                  </div>
                  <div style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontSize: 20,
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? 'var(--color-blue, #000AFF)' : 'var(--color-text-dark, #1F2937)',
                    marginBottom: 12,
                  }}>
                    {wd.date.getDate()}
                  </div>
                  {dayBriefs.map((brief) => {
                    const s = STATUS_COLORS[brief.status]
                    return (
                      <div
                        key={brief.id}
                        draggable
                        onDragStart={() => handleDragStart(brief.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '6px 8px',
                          marginBottom: 6,
                          borderRadius: 6,
                          background: s.bg,
                          borderLeft: `3px solid ${s.border}`,
                          cursor: 'grab',
                        }}
                      >
                        <div style={{
                          fontFamily: '"Instrument Sans", sans-serif',
                          fontSize: 12,
                          fontWeight: 600,
                          color: s.color,
                          marginBottom: 2,
                        }}>
                          {brief.title}
                        </div>
                        <div style={{
                          fontFamily: '"Instrument Sans", sans-serif',
                          fontSize: 11,
                          color: 'var(--color-text-gray, #6B7280)',
                        }}>
                          {brief.author}
                        </div>
                      </div>
                    )
                  })}
                  {quickCreate === wd.key && (
                    <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 4 }}>
                      <input
                        autoFocus
                        type="text"
                        placeholder="Brief title..."
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQuickCreate(wd.key)
                          if (e.key === 'Escape') { setQuickCreate(null); setQuickTitle('') }
                        }}
                        onBlur={() => { setQuickCreate(null); setQuickTitle('') }}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: 12,
                          fontFamily: '"Instrument Sans", sans-serif',
                          border: '1px solid var(--color-blue, #000AFF)',
                          borderRadius: 4,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
