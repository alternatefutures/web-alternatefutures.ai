'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  PiDownloadBold,
  PiUsersBold,
  PiLightningBold,
  PiChartBarBold,
  PiClockBold,
} from 'react-icons/pi'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import './activity-admin.css'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionType =
  | 'post_published'
  | 'campaign_created'
  | 'campaign_launched'
  | 'content_approved'
  | 'content_rejected'
  | 'comment_added'
  | 'asset_uploaded'
  | 'settings_changed'
  | 'member_invited'
  | 'member_removed'
  | 'report_generated'
  | 'integration_connected'
  | 'deployment_triggered'
  | 'brand_rule_updated'

type Domain =
  | 'social'
  | 'content'
  | 'intel'
  | 'settings'
  | 'assets'
  | 'campaigns'
  | 'devrel'
  | 'brand'
  | 'infrastructure'

interface TeamActivity {
  id: string
  userId: string
  userName: string
  userAvatar: { initials: string; color: string }
  actionType: ActionType
  description: string
  targetName: string
  targetUrl: string | null
  domain: Domain
  timestamp: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTION_LABELS: Record<ActionType, string> = {
  post_published: 'Post Published',
  campaign_created: 'Campaign Created',
  campaign_launched: 'Campaign Launched',
  content_approved: 'Content Approved',
  content_rejected: 'Content Rejected',
  comment_added: 'Comment Added',
  asset_uploaded: 'Asset Uploaded',
  settings_changed: 'Settings Changed',
  member_invited: 'Member Invited',
  member_removed: 'Member Removed',
  report_generated: 'Report Generated',
  integration_connected: 'Integration Connected',
  deployment_triggered: 'Deployment Triggered',
  brand_rule_updated: 'Brand Rule Updated',
}

const ACTION_VERBS: Record<ActionType, string> = {
  post_published: 'published',
  campaign_created: 'created',
  campaign_launched: 'launched',
  content_approved: 'approved',
  content_rejected: 'rejected',
  comment_added: 'commented on',
  asset_uploaded: 'uploaded',
  settings_changed: 'changed',
  member_invited: 'invited',
  member_removed: 'removed',
  report_generated: 'generated',
  integration_connected: 'connected',
  deployment_triggered: 'triggered deployment for',
  brand_rule_updated: 'updated brand rule',
}

const DOMAIN_LABELS: Record<Domain, string> = {
  social: 'Social',
  content: 'Content',
  intel: 'Intel',
  settings: 'Settings',
  assets: 'Assets',
  campaigns: 'Campaigns',
  devrel: 'DevRel',
  brand: 'Brand',
  infrastructure: 'Infrastructure',
}

const DOMAIN_COLORS: Record<Domain, string> = {
  social: '#5865F2',
  content: '#BE4200',
  intel: '#2D8659',
  settings: '#264348',
  assets: '#C9A84C',
  campaigns: '#000AFF',
  devrel: '#4E8CA8',
  brand: '#7B2D8B',
  infrastructure: '#D4460B',
}

// ---------------------------------------------------------------------------
// Seed data — realistic internal team operations
// ---------------------------------------------------------------------------

const TEAM_MEMBERS = [
  { id: 'tm1', name: 'Senku Ishigami', avatar: { initials: 'SI', color: '#BE4200' } },
  { id: 'tm2', name: 'Lain Iwakura', avatar: { initials: 'LI', color: '#000AFF' } },
  { id: 'tm3', name: 'Atlas Stone', avatar: { initials: 'AS', color: '#5C7A6B' } },
  { id: 'tm4', name: 'Argus Panoptes', avatar: { initials: 'AP', color: '#264348' } },
  { id: 'tm5', name: 'Quinn Morgendorffer', avatar: { initials: 'QM', color: '#4E8CA8' } },
  { id: 'tm6', name: 'Yusuke Kitagawa', avatar: { initials: 'YK', color: '#7B2D8B' } },
  { id: 'tm7', name: 'Echo Amari', avatar: { initials: 'EA', color: '#C9A84C' } },
  { id: 'tm8', name: 'Hana Uzaki', avatar: { initials: 'HU', color: '#D4460B' } },
]

const SEED_ACTIVITIES: TeamActivity[] = [
  // Today
  { id: 'ta-001', userId: 'tm7', userName: 'Echo Amari', userAvatar: { initials: 'EA', color: '#C9A84C' }, actionType: 'post_published', description: 'Published blog post about decentralized AI hosting', targetName: 'AI Agents on Decentralized Compute', targetUrl: '/admin/blog/ai-agents-decentral', domain: 'content', timestamp: '2026-02-18T14:30:00Z' },
  { id: 'ta-002', userId: 'tm5', userName: 'Quinn Morgendorffer', userAvatar: { initials: 'QM', color: '#4E8CA8' }, actionType: 'content_approved', description: 'Approved social post for X campaign', targetName: 'Launch Week Post #3', targetUrl: '/admin/social/queue', domain: 'social', timestamp: '2026-02-18T13:45:00Z' },
  { id: 'ta-003', userId: 'tm1', userName: 'Senku Ishigami', userAvatar: { initials: 'SI', color: '#BE4200' }, actionType: 'deployment_triggered', description: 'Triggered production deployment for web app', targetName: 'web-app v2.4.1', targetUrl: null, domain: 'infrastructure', timestamp: '2026-02-18T13:15:00Z' },
  { id: 'ta-004', userId: 'tm6', userName: 'Yusuke Kitagawa', userAvatar: { initials: 'YK', color: '#7B2D8B' }, actionType: 'asset_uploaded', description: 'Uploaded new brand hero image for landing page', targetName: 'hero-decentral-v3.png', targetUrl: '/admin/assets', domain: 'assets', timestamp: '2026-02-18T12:00:00Z' },
  { id: 'ta-005', userId: 'tm4', userName: 'Argus Panoptes', userAvatar: { initials: 'AP', color: '#264348' }, actionType: 'settings_changed', description: 'Updated API rate limits for public endpoints', targetName: 'Rate Limiting Config', targetUrl: '/admin/settings', domain: 'settings', timestamp: '2026-02-18T11:30:00Z' },
  { id: 'ta-006', userId: 'tm3', userName: 'Atlas Stone', userAvatar: { initials: 'AS', color: '#5C7A6B' }, actionType: 'report_generated', description: 'Generated competitor analysis report', targetName: 'Q1 Competitor Landscape', targetUrl: '/admin/intel', domain: 'intel', timestamp: '2026-02-18T10:45:00Z' },
  { id: 'ta-007', userId: 'tm2', userName: 'Lain Iwakura', userAvatar: { initials: 'LI', color: '#000AFF' }, actionType: 'integration_connected', description: 'Connected Slack webhook for deploy notifications', targetName: 'Slack Integration', targetUrl: '/admin/settings/integrations/slack', domain: 'settings', timestamp: '2026-02-18T10:00:00Z' },
  { id: 'ta-008', userId: 'tm7', userName: 'Echo Amari', userAvatar: { initials: 'EA', color: '#C9A84C' }, actionType: 'campaign_created', description: 'Created launch week social campaign', targetName: 'Launch Week Feb 2026', targetUrl: '/admin/social/campaigns', domain: 'campaigns', timestamp: '2026-02-18T09:30:00Z' },

  // Yesterday
  { id: 'ta-009', userId: 'tm8', userName: 'Hana Uzaki', userAvatar: { initials: 'HU', color: '#D4460B' }, actionType: 'asset_uploaded', description: 'Uploaded pitch deck slides batch', targetName: 'pitch-deck-v4-slides.zip', targetUrl: '/admin/assets', domain: 'assets', timestamp: '2026-02-17T17:00:00Z' },
  { id: 'ta-010', userId: 'tm5', userName: 'Quinn Morgendorffer', userAvatar: { initials: 'QM', color: '#4E8CA8' }, actionType: 'content_rejected', description: 'Rejected blog draft — needs technical accuracy review', targetName: 'IPFS vs Arweave Deep Dive', targetUrl: '/admin/blog', domain: 'content', timestamp: '2026-02-17T16:30:00Z' },
  { id: 'ta-011', userId: 'tm1', userName: 'Senku Ishigami', userAvatar: { initials: 'SI', color: '#BE4200' }, actionType: 'comment_added', description: 'Left review comment on SDK documentation', targetName: 'SDK Quickstart Guide', targetUrl: '/admin/devrel/docs', domain: 'devrel', timestamp: '2026-02-17T15:45:00Z' },
  { id: 'ta-012', userId: 'tm7', userName: 'Echo Amari', userAvatar: { initials: 'EA', color: '#C9A84C' }, actionType: 'campaign_launched', description: 'Launched developer advocacy Twitter Spaces campaign', targetName: 'Dev Spaces Series', targetUrl: '/admin/social/campaigns', domain: 'campaigns', timestamp: '2026-02-17T14:00:00Z' },
  { id: 'ta-013', userId: 'tm6', userName: 'Yusuke Kitagawa', userAvatar: { initials: 'YK', color: '#7B2D8B' }, actionType: 'brand_rule_updated', description: 'Updated color palette — added new accent colors', targetName: 'Brand Color System', targetUrl: '/admin/brand/rules', domain: 'brand', timestamp: '2026-02-17T13:00:00Z' },
  { id: 'ta-014', userId: 'tm4', userName: 'Argus Panoptes', userAvatar: { initials: 'AP', color: '#264348' }, actionType: 'member_invited', description: 'Invited new team member to workspace', targetName: 'dev-ops@alternatefutures.ai', targetUrl: '/admin/settings/team', domain: 'settings', timestamp: '2026-02-17T11:00:00Z' },
  { id: 'ta-015', userId: 'tm3', userName: 'Atlas Stone', userAvatar: { initials: 'AS', color: '#5C7A6B' }, actionType: 'deployment_triggered', description: 'Triggered staging deployment for auth service', targetName: 'auth-service v1.8.0', targetUrl: null, domain: 'infrastructure', timestamp: '2026-02-17T10:30:00Z' },

  // 2 days ago
  { id: 'ta-016', userId: 'tm2', userName: 'Lain Iwakura', userAvatar: { initials: 'LI', color: '#000AFF' }, actionType: 'settings_changed', description: 'Configured SSO SAML provider for enterprise accounts', targetName: 'SSO Configuration', targetUrl: '/admin/settings/sso', domain: 'settings', timestamp: '2026-02-16T16:00:00Z' },
  { id: 'ta-017', userId: 'tm7', userName: 'Echo Amari', userAvatar: { initials: 'EA', color: '#C9A84C' }, actionType: 'post_published', description: 'Published changelog entry for CLI v0.9', targetName: 'CLI v0.9 Release Notes', targetUrl: '/admin/devrel/changelog', domain: 'devrel', timestamp: '2026-02-16T14:30:00Z' },
  { id: 'ta-018', userId: 'tm5', userName: 'Quinn Morgendorffer', userAvatar: { initials: 'QM', color: '#4E8CA8' }, actionType: 'content_approved', description: 'Approved landing page copy revisions', targetName: 'Homepage Hero Section', targetUrl: null, domain: 'content', timestamp: '2026-02-16T13:00:00Z' },
  { id: 'ta-019', userId: 'tm8', userName: 'Hana Uzaki', userAvatar: { initials: 'HU', color: '#D4460B' }, actionType: 'asset_uploaded', description: 'Uploaded social media template pack', targetName: 'social-templates-feb.zip', targetUrl: '/admin/assets', domain: 'assets', timestamp: '2026-02-16T11:30:00Z' },
  { id: 'ta-020', userId: 'tm1', userName: 'Senku Ishigami', userAvatar: { initials: 'SI', color: '#BE4200' }, actionType: 'comment_added', description: 'Reviewed and commented on API gateway proposal', targetName: 'Gateway Architecture RFC', targetUrl: '/admin/strategy/initiatives', domain: 'infrastructure', timestamp: '2026-02-16T10:00:00Z' },

  // 3 days ago
  { id: 'ta-021', userId: 'tm3', userName: 'Atlas Stone', userAvatar: { initials: 'AS', color: '#5C7A6B' }, actionType: 'report_generated', description: 'Generated Akash cost optimization report', targetName: 'Infra Cost Analysis Feb', targetUrl: '/admin/budget', domain: 'infrastructure', timestamp: '2026-02-15T17:00:00Z' },
  { id: 'ta-022', userId: 'tm6', userName: 'Yusuke Kitagawa', userAvatar: { initials: 'YK', color: '#7B2D8B' }, actionType: 'asset_uploaded', description: 'Uploaded new logo variations for dark mode', targetName: 'af-logo-dark-variants.svg', targetUrl: '/admin/assets', domain: 'brand', timestamp: '2026-02-15T15:30:00Z' },
  { id: 'ta-023', userId: 'tm7', userName: 'Echo Amari', userAvatar: { initials: 'EA', color: '#C9A84C' }, actionType: 'post_published', description: 'Published tutorial on deploying Vue apps', targetName: 'Vue on AF Tutorial', targetUrl: '/admin/devrel/tutorials', domain: 'devrel', timestamp: '2026-02-15T13:00:00Z' },
  { id: 'ta-024', userId: 'tm4', userName: 'Argus Panoptes', userAvatar: { initials: 'AP', color: '#264348' }, actionType: 'settings_changed', description: 'Enabled webhook signature verification', targetName: 'Webhook Security Config', targetUrl: '/admin/settings/webhooks', domain: 'settings', timestamp: '2026-02-15T11:00:00Z' },
  { id: 'ta-025', userId: 'tm5', userName: 'Quinn Morgendorffer', userAvatar: { initials: 'QM', color: '#4E8CA8' }, actionType: 'content_approved', description: 'Approved partner co-marketing post', targetName: 'Akash x AF Collab Post', targetUrl: '/admin/social/queue', domain: 'social', timestamp: '2026-02-15T09:30:00Z' },

  // 4–5 days ago
  { id: 'ta-026', userId: 'tm2', userName: 'Lain Iwakura', userAvatar: { initials: 'LI', color: '#000AFF' }, actionType: 'deployment_triggered', description: 'Triggered CDN edge cache purge', targetName: 'Global CDN Purge', targetUrl: null, domain: 'infrastructure', timestamp: '2026-02-14T16:00:00Z' },
  { id: 'ta-027', userId: 'tm1', userName: 'Senku Ishigami', userAvatar: { initials: 'SI', color: '#BE4200' }, actionType: 'comment_added', description: 'Reviewed PR for GraphQL rate limiter', targetName: 'PR #127 — Rate Limiter', targetUrl: null, domain: 'infrastructure', timestamp: '2026-02-14T14:00:00Z' },
  { id: 'ta-028', userId: 'tm8', userName: 'Hana Uzaki', userAvatar: { initials: 'HU', color: '#D4460B' }, actionType: 'brand_rule_updated', description: 'Added new illustration guidelines to brand book', targetName: 'Illustration Style Guide', targetUrl: '/admin/brand/rules', domain: 'brand', timestamp: '2026-02-14T12:00:00Z' },
  { id: 'ta-029', userId: 'tm3', userName: 'Atlas Stone', userAvatar: { initials: 'AS', color: '#5C7A6B' }, actionType: 'report_generated', description: 'Generated market signal report on AI hosting trends', targetName: 'AI Hosting Signals Q1', targetUrl: '/admin/intel/signals', domain: 'intel', timestamp: '2026-02-13T15:00:00Z' },
  { id: 'ta-030', userId: 'tm7', userName: 'Echo Amari', userAvatar: { initials: 'EA', color: '#C9A84C' }, actionType: 'campaign_created', description: 'Created referral program announcement campaign', targetName: 'Referral Launch Campaign', targetUrl: '/admin/social/campaigns', domain: 'campaigns', timestamp: '2026-02-13T11:00:00Z' },
]

const ALL_ACTIONS: ActionType[] = Object.keys(ACTION_LABELS) as ActionType[]
const ALL_DOMAINS: Domain[] = Object.keys(DOMAIN_LABELS) as Domain[]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function exportToCsv(activities: TeamActivity[]): void {
  const headers = ['Timestamp', 'Team Member', 'Action', 'Description', 'Target', 'Domain']
  const rows = activities.map((a) => [
    a.timestamp,
    a.userName,
    ACTION_LABELS[a.actionType],
    a.description,
    a.targetName,
    DOMAIN_LABELS[a.domain],
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `team-activity-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TeamActivityPage() {
  const [search, setSearch] = useState('')
  const [memberFilter, setMemberFilter] = useState<string>('ALL')
  const [actionFilter, setActionFilter] = useState<string>('ALL')
  const [domainFilter, setDomainFilter] = useState<string>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => {
    let result = SEED_ACTIVITIES as TeamActivity[]

    if (memberFilter !== 'ALL') result = result.filter((a) => a.userId === memberFilter)
    if (actionFilter !== 'ALL') result = result.filter((a) => a.actionType === actionFilter)
    if (domainFilter !== 'ALL') result = result.filter((a) => a.domain === domainFilter)
    if (dateFrom) result = result.filter((a) => a.timestamp >= dateFrom)
    if (dateTo) result = result.filter((a) => a.timestamp <= dateTo + 'T23:59:59Z')
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.userName.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.targetName.toLowerCase().includes(q),
      )
    }

    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [search, memberFilter, actionFilter, domainFilter, dateFrom, dateTo])

  // Stats
  const todayStr = '2026-02-18'
  const todayCount = useMemo(
    () => SEED_ACTIVITIES.filter((a) => a.timestamp.startsWith(todayStr)).length,
    [],
  )

  const mostActiveMember = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of SEED_ACTIVITIES) {
      counts.set(a.userName, (counts.get(a.userName) || 0) + 1)
    }
    let max = 0
    let name = '-'
    counts.forEach((count, n) => {
      if (count > max) { max = count; name = n }
    })
    return name
  }, [])

  const busiestDomain = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of SEED_ACTIVITIES) {
      counts.set(a.domain, (counts.get(a.domain) || 0) + 1)
    }
    let max = 0
    let domain = '-'
    counts.forEach((count, d) => {
      if (count > max) { max = count; domain = DOMAIN_LABELS[d as Domain] || d }
    })
    return domain
  }, [])

  const handleExport = useCallback(() => {
    exportToCsv(filtered)
  }, [filtered])

  return (
    <>
      <Link href="/admin/people" className="activity-back">
        &larr; Back to People
      </Link>

      <div className="activity-admin-header">
        <h1>Team Activity</h1>
        <button
          type="button"
          className="activity-export-btn"
          onClick={handleExport}
          disabled={filtered.length === 0}
        >
          <PiDownloadBold style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Export CSV
        </button>
      </div>

      <div className="activity-admin-stats">
        <div className="activity-stat-card">
          <div className="activity-stat-icon"><PiLightningBold /></div>
          <div>
            <div className="activity-stat-value ultra">{todayCount}</div>
            <div className="activity-stat-label">Actions Today</div>
          </div>
        </div>
        <div className="activity-stat-card">
          <div className="activity-stat-icon"><PiUsersBold /></div>
          <div>
            <div className="activity-stat-value terra">{mostActiveMember}</div>
            <div className="activity-stat-label">Most Active</div>
          </div>
        </div>
        <div className="activity-stat-card">
          <div className="activity-stat-icon"><PiChartBarBold /></div>
          <div>
            <div className="activity-stat-value patina">{busiestDomain}</div>
            <div className="activity-stat-label">Busiest Domain</div>
          </div>
        </div>
        <div className="activity-stat-card">
          <div className="activity-stat-icon"><PiClockBold /></div>
          <div>
            <div className="activity-stat-value gold">{SEED_ACTIVITIES.length}</div>
            <div className="activity-stat-label">Total Actions</div>
          </div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <div className="activity-admin-filters">
        <input
          type="text"
          className="activity-admin-search"
          placeholder="Search activity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="activity-admin-select"
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
        >
          <option value="ALL">All Members</option>
          {TEAM_MEMBERS.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <select
          className="activity-admin-select"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="ALL">All Actions</option>
          {ALL_ACTIONS.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a]}</option>
          ))}
        </select>
        <select
          className="activity-admin-select"
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
        >
          <option value="ALL">All Domains</option>
          {ALL_DOMAINS.map((d) => (
            <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>
          ))}
        </select>
        <input
          type="date"
          className="activity-admin-select"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          title="From date"
        />
        <input
          type="date"
          className="activity-admin-select"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          title="To date"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="activity-admin-empty">
          <h2>No activity found</h2>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="activity-timeline">
          {filtered.map((activity) => (
            <div key={activity.id} className="activity-timeline-item">
              <div className="activity-timeline-line" />
              <div
                className="activity-item-avatar"
                style={{ background: activity.userAvatar.color }}
              >
                {activity.userAvatar.initials}
              </div>
              <div className="activity-item-body">
                <div className="activity-item-meta">
                  <span className="activity-item-name">{activity.userName}</span>
                  <span className="activity-item-action">
                    {ACTION_VERBS[activity.actionType]}
                  </span>
                  {activity.targetUrl ? (
                    <Link href={activity.targetUrl} className="activity-target-link">
                      {activity.targetName}
                    </Link>
                  ) : (
                    <span className="activity-target-text">{activity.targetName}</span>
                  )}
                </div>
                <div className="activity-item-content">
                  {activity.description}
                </div>
                <div className="activity-item-footer">
                  <span
                    className="activity-domain-chip"
                    style={{ background: DOMAIN_COLORS[activity.domain] }}
                  >
                    {DOMAIN_LABELS[activity.domain]}
                  </span>
                  <span className="activity-type-chip">
                    {ACTION_LABELS[activity.actionType]}
                  </span>
                  <span className="activity-item-time">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
