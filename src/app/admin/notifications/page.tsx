'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  PiArrowLeftBold, PiBellBold, PiCheckBold, PiChecksBold,
  PiFunnelBold, PiGearBold, PiWarningBold, PiInfoBold,
  PiMegaphoneBold, PiAtBold, PiStampBold,
  PiEnvelopeOpenBold, PiEnvelopeSimpleBold,
} from 'react-icons/pi'
import { getCookieValue } from '@/lib/cookies'
import './notifications-admin.css'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NotificationType = 'alert' | 'update' | 'mention' | 'approval'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  source: string
  read: boolean
  timestamp: string
  actionUrl?: string
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'n-01', type: 'alert', title: 'KPI Below Threshold', message: 'Activation Rate dropped to 22.1%, below the 20% alert threshold. Review onboarding funnel.', source: 'KPI Monitor', read: false, timestamp: '2026-02-15T09:30:00Z', actionUrl: '/admin/dashboard/scorecards' },
  { id: 'n-02', type: 'approval', title: 'Blog Post Pending Review', message: '"Decentralized AI Agents on AF" submitted by Content Writer for brand review.', source: 'Nori (Brand Guardian)', read: false, timestamp: '2026-02-15T08:30:00Z', actionUrl: '/admin/blog' },
  { id: 'n-03', type: 'mention', title: 'Tagged in Discord', message: 'Casey Orozco mentioned AlternateFutures in #showcase — "Just shipped my first AI agent deployment."', source: 'Discord', read: false, timestamp: '2026-02-14T14:00:00Z' },
  { id: 'n-04', type: 'update', title: 'Q1 Budget Report Ready', message: 'Q1 2026 budget summary has been generated. Total spend: $75.2K of $80K planned.', source: 'Budget Tracker', read: false, timestamp: '2026-02-14T12:00:00Z', actionUrl: '/admin/budget' },
  { id: 'n-05', type: 'alert', title: 'Failed Agent Task', message: 'Market Intel task "Competitor pricing analysis" failed due to API timeout. Retry recommended.', source: 'Agent Orchestrator', read: true, timestamp: '2026-02-14T10:00:00Z', actionUrl: '/admin/dashboard/agents' },
  { id: 'n-06', type: 'approval', title: 'Social Campaign Approval', message: 'Q1 launch batch social campaign submitted for brand compliance review.', source: 'Nori (Brand Guardian)', read: true, timestamp: '2026-02-14T07:00:00Z', actionUrl: '/admin/social' },
  { id: 'n-07', type: 'update', title: 'Deployment Successful', message: 'SSL Proxy updated to Pingap v0.12.4. Zero-downtime deployment completed.', source: 'Atlas (Infrastructure)', read: true, timestamp: '2026-02-13T22:00:00Z' },
  { id: 'n-08', type: 'mention', title: 'Reddit Thread Trending', message: '"AlternateFutures vs Railway vs Vercel" post on r/webdev reached 156 upvotes.', source: 'Social Monitor', read: true, timestamp: '2026-02-14T08:00:00Z' },
  { id: 'n-09', type: 'alert', title: 'Budget Overspend Warning', message: 'Partnerships category is $1,200 over Q1 planned budget.', source: 'Budget Tracker', read: true, timestamp: '2026-02-13T16:00:00Z', actionUrl: '/admin/budget' },
  { id: 'n-10', type: 'update', title: 'Weekly Report Generated', message: 'Feb 3 - Feb 9 weekly report is ready for review.', source: 'Report Generator', read: true, timestamp: '2026-02-10T08:00:00Z', actionUrl: '/admin/dashboard/reports' },
  { id: 'n-11', type: 'approval', title: 'Partnership Proposal', message: 'Akash co-marketing proposal ready for CEO review.', source: 'Bridge (Partnerships)', read: true, timestamp: '2026-02-13T14:00:00Z' },
  { id: 'n-12', type: 'mention', title: 'X Thread Viral', message: 'Jordan Chen\'s thread on decentralized hosting hit 8.9K impressions and 128 likes.', source: 'Social Monitor', read: true, timestamp: '2026-02-14T12:00:00Z' },
]

const TYPE_CONFIG: Record<NotificationType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  alert: { label: 'Alert', icon: <PiWarningBold />, color: '#991B1B', bg: '#FEE2E2' },
  update: { label: 'Update', icon: <PiInfoBold />, color: '#1E40AF', bg: '#DBEAFE' },
  mention: { label: 'Mention', icon: <PiAtBold />, color: '#5B21B6', bg: '#EDE9FE' },
  approval: { label: 'Approval', icon: <PiStampBold />, color: '#92400E', bg: '#FEF3C7' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'ALL'>('ALL')
  const [readFilter, setReadFilter] = useState<'ALL' | 'unread' | 'read'>('ALL')

  useEffect(() => {
    // Simulate API load
    const timer = setTimeout(() => {
      setNotifications([...SEED_NOTIFICATIONS])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => {
    let items = notifications
    if (typeFilter !== 'ALL') {
      items = items.filter((n) => n.type === typeFilter)
    }
    if (readFilter === 'unread') {
      items = items.filter((n) => !n.read)
    } else if (readFilter === 'read') {
      items = items.filter((n) => n.read)
    }
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [notifications, typeFilter, readFilter])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const toggleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, read: !n.read } : n)
    )
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  return (
    <>
      <div className="dash-sub-header">
        <Link href="/admin" className="dash-sub-back"><PiArrowLeftBold style={{ marginRight: 4 }} /> Dashboard</Link>
        <h1>Notifications</h1>
        {unreadCount > 0 && <span className="notif-unread-badge">{unreadCount}</span>}
      </div>

      {/* Toolbar */}
      <div className="notif-toolbar">
        <div className="notif-filters">
          <select className="dash-sub-select" value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'ALL')}>
            <option value="ALL">All Types</option>
            <option value="alert">Alerts</option>
            <option value="update">Updates</option>
            <option value="mention">Mentions</option>
            <option value="approval">Approvals</option>
          </select>
          <select className="dash-sub-select" value={readFilter}
            onChange={(e) => setReadFilter(e.target.value as 'ALL' | 'unread' | 'read')}>
            <option value="ALL">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        <div className="notif-actions">
          {unreadCount > 0 && (
            <button className="budget-btn-secondary" onClick={markAllRead}>
              <PiChecksBold /> Mark all read
            </button>
          )}
          <Link href="/admin/settings/notifications" className="budget-btn-secondary">
            <PiGearBold /> Preferences
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="notif-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="notif-item" style={{ pointerEvents: 'none' }}>
              <div className="skeleton-block" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-block" style={{ width: '60%', height: 14, marginBottom: 6 }} />
                <div className="skeleton-block" style={{ width: '80%', height: 11 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="notif-empty">
          <PiBellBold size={32} />
          <p>No notifications match your filters.</p>
        </div>
      ) : (
        <div className="notif-list">
          {filtered.map((notif) => {
            const config = TYPE_CONFIG[notif.type]
            return (
              <div key={notif.id}
                className={`notif-item${notif.read ? '' : ' notif-unread'}`}
              >
                <div className="notif-type-icon" style={{ background: config.bg, color: config.color }}>
                  {config.icon}
                </div>
                <div className="notif-body">
                  <div className="notif-header-row">
                    <span className="notif-title">{notif.title}</span>
                    <span className="notif-type-chip" style={{ background: config.bg, color: config.color }}>
                      {config.label}
                    </span>
                  </div>
                  <p className="notif-message">{notif.message}</p>
                  <div className="notif-meta">
                    <span className="notif-source">{notif.source}</span>
                    <span className="notif-time">{timeAgo(notif.timestamp)}</span>
                    {notif.actionUrl && (
                      <Link href={notif.actionUrl} className="notif-action-link">
                        View &rarr;
                      </Link>
                    )}
                  </div>
                </div>
                <button
                  className="notif-read-toggle"
                  onClick={() => toggleRead(notif.id)}
                  title={notif.read ? 'Mark as unread' : 'Mark as read'}
                >
                  {notif.read ? <PiEnvelopeSimpleBold /> : <PiEnvelopeOpenBold />}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
