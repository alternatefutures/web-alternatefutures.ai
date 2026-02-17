'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchActivities,
  getPersonRef,
  getAllPersonRefs,
  PLATFORM_LABELS,
  PLATFORM_COLORS,
  ACTIVITY_TYPE_LABELS,
  type Activity,
  type ActivityPlatform,
  type ActivityType,
} from '@/lib/activity-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import './activity-admin.css'

function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getActionVerb(type: ActivityType): string {
  const verbs: Record<ActivityType, string> = {
    post: 'posted',
    comment: 'commented',
    reply: 'replied',
    reaction: 'reacted',
    follow: 'followed',
    star: 'starred',
    fork: 'forked',
    mention: 'mentioned',
    deploy: 'deployed',
    signup: 'signed up',
  }
  return verbs[type]
}

const ALL_PLATFORMS: ActivityPlatform[] = [
  'DISCORD', 'GITHUB', 'X', 'BLUESKY', 'LINKEDIN', 'MASTODON',
  'REDDIT', 'TELEGRAM', 'THREADS', 'INSTAGRAM', 'FACEBOOK', 'WEBSITE',
]

const ALL_TYPES: ActivityType[] = [
  'post', 'comment', 'reply', 'reaction', 'follow',
  'star', 'fork', 'mention', 'deploy', 'signup',
]

export default function ActivityFeedPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [personFilter, setPersonFilter] = useState<string>('ALL')

  const persons = getAllPersonRefs()

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const feed = await fetchActivities(token, { limit: 200 })
        setActivities(feed.activities)
      } catch {
        // seed data will handle it
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = activities
    if (platformFilter !== 'ALL') result = result.filter((a) => a.platform === platformFilter)
    if (typeFilter !== 'ALL') result = result.filter((a) => a.activityType === typeFilter)
    if (personFilter !== 'ALL') result = result.filter((a) => a.personId === personFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.content.toLowerCase().includes(q) ||
          (getPersonRef(a.personId)?.name || '').toLowerCase().includes(q) ||
          (getPersonRef(a.personId)?.handle || '').toLowerCase().includes(q),
      )
    }
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [activities, platformFilter, typeFilter, personFilter, search])

  // Stats
  const platformCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of activities) {
      map.set(a.platform, (map.get(a.platform) || 0) + 1)
    }
    return map
  }, [activities])

  const topPlatform = useMemo(() => {
    let max = 0
    let name = '-'
    platformCounts.forEach((count, platform) => {
      if (count > max) { max = count; name = PLATFORM_LABELS[platform as ActivityPlatform] || platform }
    })
    return name
  }, [platformCounts])

  const uniquePersons = useMemo(() => {
    return new Set(activities.map((a) => a.personId)).size
  }, [activities])

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return activities.filter((a) => a.timestamp.startsWith(today)).length
  }, [activities])

  if (loading) {
    return (
      <div className="activity-admin-empty">
        <p>Loading activity feed...</p>
      </div>
    )
  }

  return (
    <>
      <Link href="/admin/people" className="activity-back">
        &larr; Back to People
      </Link>

      <div className="activity-admin-header">
        <h1>Activity Feed</h1>
      </div>

      <div className="activity-admin-stats">
        <div className="activity-stat-card">
          <div className="activity-stat-value ultra">{activities.length}</div>
          <div className="activity-stat-label">Total Activities</div>
        </div>
        <div className="activity-stat-card">
          <div className="activity-stat-value terra">{uniquePersons}</div>
          <div className="activity-stat-label">Active People</div>
        </div>
        <div className="activity-stat-card">
          <div className="activity-stat-value patina">{todayCount}</div>
          <div className="activity-stat-label">Today</div>
        </div>
        <div className="activity-stat-card">
          <div className="activity-stat-value gold">{topPlatform}</div>
          <div className="activity-stat-label">Top Platform</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <div className="activity-admin-filters">
        <input
          type="text"
          className="activity-admin-search"
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="activity-admin-select"
          value={personFilter}
          onChange={(e) => setPersonFilter(e.target.value)}
        >
          <option value="ALL">All People</option>
          {persons.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          className="activity-admin-select"
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
        >
          <option value="ALL">All Platforms</option>
          {ALL_PLATFORMS.map((p) => (
            <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
          ))}
        </select>
        <select
          className="activity-admin-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Types</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>{ACTIVITY_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="activity-admin-empty">
          <h2>No activities found</h2>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="activity-admin-list">
          {filtered.map((activity) => {
            const person = getPersonRef(activity.personId)
            return (
              <div key={activity.id} className="activity-admin-item">
                <div
                  className="activity-item-avatar"
                  style={{ background: person?.avatar.color || '#999' }}
                >
                  {person?.avatar.initials || '??'}
                </div>
                <div className="activity-item-body">
                  <div className="activity-item-meta">
                    <span className="activity-item-name">{person?.name || 'Unknown'}</span>
                    <span className="activity-item-action">
                      {getActionVerb(activity.activityType)} on {PLATFORM_LABELS[activity.platform]}
                    </span>
                  </div>
                  <div className="activity-item-content">
                    {activity.content}
                  </div>
                  <div className="activity-item-footer">
                    <span
                      className="activity-platform-chip"
                      style={{ background: PLATFORM_COLORS[activity.platform] }}
                    >
                      {PLATFORM_LABELS[activity.platform]}
                    </span>
                    <span className="activity-type-chip">
                      {ACTIVITY_TYPE_LABELS[activity.activityType]}
                    </span>
                    {activity.sourceUrl && (
                      <a
                        href={activity.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="activity-item-link"
                      >
                        View source
                      </a>
                    )}
                    <span className="activity-item-time">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
