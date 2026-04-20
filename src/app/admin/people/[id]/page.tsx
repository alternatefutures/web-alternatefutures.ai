'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  PiCheckCircleBold, PiMapPinBold, PiCalendarBlankBold,
  PiEnvelopeBold, PiGlobeSimpleBold,
} from 'react-icons/pi'
import '../people-admin.css'

// --- Types ---

interface PlatformIdentity {
  platform: string
  handle: string
  verified: boolean
  color: string
  bg: string
}

interface TimelineEvent {
  id: string
  type: 'content' | 'social' | 'engagement' | 'system'
  action: string
  detail: string
  timestamp: string
}

interface PersonProfile {
  id: string
  name: string
  bio: string
  avatar: { initials: string; color: string }
  email: string
  location: string
  joinedAt: string
  website: string
  loveScore: number
  loveChange: string
  orbitScore: number
  orbitLabel: string
  identities: PlatformIdentity[]
  timeline: TimelineEvent[]
  tags: string[]
  stats: { label: string; value: string }[]
}

// --- Mock Data (replace with API) ---

const MOCK_PROFILES: Record<string, PersonProfile> = {
  p1: {
    id: 'p1',
    name: 'Alex Rivera',
    bio: 'Full-stack developer building decentralized applications. Early adopter of IPFS and Akash Network.',
    avatar: { initials: 'AR', color: '#BE4200' },
    email: 'alex@example.com',
    location: 'San Francisco, CA',
    joinedAt: '2025-11-15',
    website: 'alexrivera.dev',
    loveScore: 87,
    loveChange: '+12 this month',
    orbitScore: 4,
    orbitLabel: 'Community Member',
    identities: [
      { platform: 'X', handle: '@arivera', verified: true, color: '#000000', bg: '#F7F7F7' },
      { platform: 'GitHub', handle: 'arivera-dev', verified: true, color: '#24292F', bg: '#F6F8FA' },
      { platform: 'Discord', handle: 'alex.rivera#1234', verified: true, color: '#5865F2', bg: '#EBEFFE' },
    ],
    timeline: [
      { id: 't1', type: 'engagement', action: 'Shared blog post', detail: '"Getting Started with IPFS Hosting" on X', timestamp: '2026-02-14T10:30:00Z' },
      { id: 't2', type: 'content', action: 'Opened issue', detail: '#142 — SDK type definitions incomplete', timestamp: '2026-02-13T15:20:00Z' },
      { id: 't3', type: 'social', action: 'Mentioned @alternatefutures', detail: 'Positive review of deployment speed on X', timestamp: '2026-02-12T09:15:00Z' },
      { id: 't4', type: 'engagement', action: 'Joined Discord', detail: 'Active in #general and #developers channels', timestamp: '2026-02-10T14:00:00Z' },
      { id: 't5', type: 'system', action: 'Profile created', detail: 'Auto-discovered from X follower list', timestamp: '2025-11-15T08:00:00Z' },
    ],
    tags: ['Developer', 'Early Adopter', 'IPFS', 'Open Source'],
    stats: [
      { label: 'Posts mentioning AF', value: '12' },
      { label: 'Issues opened', value: '3' },
      { label: 'PRs merged', value: '1' },
      { label: 'Discord messages', value: '47' },
      { label: 'Last active', value: '2 days ago' },
      { label: 'Engagement rate', value: '8.2%' },
    ],
  },
  p2: {
    id: 'p2',
    name: 'Jordan Chen',
    bio: 'DevRel engineer. Writing about Web3 infrastructure, serverless, and the decentralized web.',
    avatar: { initials: 'JC', color: '#000AFF' },
    email: 'jordan@example.com',
    location: 'Toronto, CA',
    joinedAt: '2025-10-01',
    website: 'jordanchen.io',
    loveScore: 92,
    loveChange: '+8 this month',
    orbitScore: 3,
    orbitLabel: 'Advocate',
    identities: [
      { platform: 'X', handle: '@jchen_dev', verified: true, color: '#000000', bg: '#F7F7F7' },
      { platform: 'LinkedIn', handle: 'jordan-chen-dev', verified: true, color: '#0A66C2', bg: '#E8F0FE' },
      { platform: 'GitHub', handle: 'jchen-dev', verified: true, color: '#24292F', bg: '#F6F8FA' },
    ],
    timeline: [
      { id: 't1', type: 'content', action: 'Published article', detail: '"Why Decentralized Hosting Matters" — linked AF tutorial', timestamp: '2026-02-15T08:00:00Z' },
      { id: 't2', type: 'social', action: 'Thread on X', detail: '12-tweet thread comparing AF vs competitors — 2.4k impressions', timestamp: '2026-02-14T16:30:00Z' },
      { id: 't3', type: 'engagement', action: 'Spoke at meetup', detail: 'Toronto Web3 Dev Meetup — mentioned AF platform', timestamp: '2026-02-11T19:00:00Z' },
      { id: 't4', type: 'system', action: 'Orbit level upgraded', detail: 'Moved from Level 4 to Level 3 (Advocate)', timestamp: '2026-02-10T00:00:00Z' },
    ],
    tags: ['DevRel', 'Advocate', 'Writer', 'Speaker', 'Web3'],
    stats: [
      { label: 'Posts mentioning AF', value: '28' },
      { label: 'Articles published', value: '4' },
      { label: 'Impressions generated', value: '12.5k' },
      { label: 'Referral signups', value: '8' },
      { label: 'Last active', value: 'Today' },
      { label: 'Engagement rate', value: '12.1%' },
    ],
  },
}

// Fallback for unknown IDs
function getProfile(id: string): PersonProfile {
  return MOCK_PROFILES[id] || {
    ...MOCK_PROFILES.p1,
    id,
    name: 'Unknown Person',
    bio: 'Profile not found.',
    timeline: [],
    stats: [],
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

// --- Component ---

export default function PersonProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const profile = getProfile(id)

  return (
    <>
      <Link href="/admin/people" className="profile-back">
        &larr; Back to People
      </Link>

      {/* Profile Header */}
      <div className="profile-header">
        <div
          className="profile-avatar"
          style={{ background: profile.avatar.color }}
        >
          {profile.avatar.initials}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-bio">{profile.bio}</p>
          <div className="profile-meta">
            {profile.email && (
              <span className="profile-meta-item">
                <PiEnvelopeBold className="profile-meta-icon" />
                {profile.email}
              </span>
            )}
            {profile.location && (
              <span className="profile-meta-item">
                <PiMapPinBold className="profile-meta-icon" />
                {profile.location}
              </span>
            )}
            {profile.joinedAt && (
              <span className="profile-meta-item">
                <PiCalendarBlankBold className="profile-meta-icon" />
                Joined {formatDate(profile.joinedAt)}
              </span>
            )}
            {profile.website && (
              <span className="profile-meta-item">
                <PiGlobeSimpleBold className="profile-meta-icon" />
                {profile.website}
              </span>
            )}
          </div>
        </div>

        {/* Score Cards */}
        <div className="profile-scores">
          <div className="profile-score-card">
            <div className="profile-score-value love">{profile.loveScore}</div>
            <div className="profile-score-label">Love Score</div>
            <div className="profile-score-sub">{profile.loveChange}</div>
          </div>
          <div className="profile-score-card">
            <div className="profile-score-value orbit">{profile.orbitScore}</div>
            <div className="profile-score-label">Orbit Level</div>
            <div className="profile-score-sub">{profile.orbitLabel}</div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="profile-grid">
        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--af-space-arm)' }}>
          {/* Platform Identities */}
          <div className="profile-identities">
            <div className="profile-section-header">
              <h2>Platform Identities</h2>
            </div>
            <div className="profile-identity-list">
              {profile.identities.map((identity) => (
                <div key={identity.platform} className="profile-identity-item">
                  <div
                    className="profile-identity-icon"
                    style={{ background: identity.bg, color: identity.color }}
                  >
                    {identity.platform.charAt(0)}
                  </div>
                  <div className="profile-identity-info">
                    <div className="profile-identity-platform">{identity.platform}</div>
                    <div className="profile-identity-handle">{identity.handle}</div>
                  </div>
                  {identity.verified && (
                    <span className="profile-identity-verified">
                      <PiCheckCircleBold />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="profile-timeline">
            <div className="profile-section-header">
              <h2>Activity Timeline</h2>
            </div>
            <div className="profile-timeline-list">
              {profile.timeline.map((event) => (
                <div key={event.id} className="profile-timeline-item">
                  <span className={`profile-timeline-dot ${event.type}`} />
                  <div className="profile-timeline-body">
                    <div className="profile-timeline-action">
                      <strong>{event.action}</strong> &mdash; {event.detail}
                    </div>
                    <div className="profile-timeline-time">{timeAgo(event.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="profile-sidebar">
          {/* Engagement Stats */}
          <div className="profile-sidebar-card">
            <h3>Engagement</h3>
            {profile.stats.map((stat) => (
              <div key={stat.label} className="profile-stat-row">
                <span className="profile-stat-label">{stat.label}</span>
                <span className="profile-stat-value">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="profile-sidebar-card">
            <h3>Tags</h3>
            <div className="profile-tags">
              {profile.tags.map((tag) => (
                <span key={tag} className="profile-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
