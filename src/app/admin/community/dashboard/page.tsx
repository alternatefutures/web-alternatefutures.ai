'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  fetchCommunityMetrics,
  fetchAllMessages,
  type CommunityMetrics,
  type CommunityMessage,
  type CommunityPlatform,
} from '@/lib/community-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import '../community-admin.css'

const PLATFORM_STYLES: Record<CommunityPlatform, { bg: string; color: string; label: string }> = {
  discord: { bg: '#ECEAFF', color: '#5865F2', label: 'Discord' },
  x: { bg: '#E8F4FD', color: '#1DA1F2', label: 'X' },
  github: { bg: '#F0F0F0', color: '#24292F', label: 'GitHub' },
  bluesky: { bg: '#E8F0FE', color: '#0085FF', label: 'Bluesky' },
  mastodon: { bg: '#ECEAFF', color: '#6364FF', label: 'Mastodon' },
  reddit: { bg: '#FFF0E8', color: '#FF4500', label: 'Reddit' },
}

function GrowthChart({ metrics }: { metrics: CommunityMetrics[] }) {
  const maxMembers = Math.max(...metrics.map((m) => m.memberCount), 1)
  return (
    <div className="community-growth-chart">
      <div className="community-growth-chart-title">Member Count by Platform</div>
      <div className="community-growth-chart-bars">
        {metrics.map((m) => {
          const ps = PLATFORM_STYLES[m.platform]
          const pct = (m.memberCount / maxMembers) * 100
          return (
            <div key={m.platform} className="community-growth-chart-col">
              <div className="community-growth-chart-value">{m.memberCount.toLocaleString()}</div>
              <div className="community-growth-chart-bar-track">
                <div
                  className="community-growth-chart-bar-fill"
                  style={{ height: `${pct}%`, background: ps.color }}
                />
              </div>
              <div className="community-growth-chart-label" style={{ color: ps.color }}>{ps.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ActivityFeed({ messages }: { messages: CommunityMessage[] }) {
  const recent = messages.slice(0, 8)
  return (
    <div className="community-activity-feed">
      <div className="community-activity-feed-title">Recent Activity</div>
      {recent.map((msg) => {
        const ps = PLATFORM_STYLES[msg.platform]
        return (
          <div key={msg.id} className="community-activity-item">
            <span
              className="community-activity-dot"
              style={{ background: ps.color }}
            />
            <div className="community-activity-content">
              <span className="community-activity-author">{msg.authorName}</span>
              <span className="community-activity-text">
                {msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content}
              </span>
            </div>
            <span className="community-activity-time">{formatTimeAgo(msg.receivedAt)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function CommunityDashboardPage() {
  const [metrics, setMetrics] = useState<CommunityMetrics[]>([])
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [m, msgs] = await Promise.all([
          fetchCommunityMetrics(token),
          fetchAllMessages(token),
        ])
        setMetrics(m)
        setMessages(msgs.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()))
      } catch {
        setLoadError('Failed to load community metrics.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totals = useMemo(() => ({
    members: metrics.reduce((s, m) => s + m.memberCount, 0),
    active: metrics.reduce((s, m) => s + m.activeMembers, 0),
    messagesPerDay: metrics.reduce((s, m) => s + m.messagesPerDay, 0),
    avgGrowth:
      metrics.length > 0
        ? (metrics.reduce((s, m) => s + m.growthRate, 0) / metrics.length).toFixed(1)
        : '0',
  }), [metrics])

  const healthScore = useMemo(() => {
    if (!metrics.length) return 0
    const activeRatio = totals.active / Math.max(totals.members, 1)
    const growthBonus = parseFloat(String(totals.avgGrowth)) / 100
    return Math.min(100, Math.round((activeRatio * 70 + growthBonus * 30) * 100))
  }, [metrics, totals])

  if (loading) {
    return <div className="community-admin-empty"><p>Loading dashboard...</p></div>
  }

  if (loadError) {
    return (
      <div className="community-admin-empty">
        <h2>Error</h2>
        <p>{loadError}</p>
      </div>
    )
  }

  return (
    <>
      <div className="community-admin-header">
        <h1>Community Dashboard</h1>
      </div>

      <div className="community-admin-stats">
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Health Score</div>
          <div className="community-admin-stat-value">{healthScore}</div>
          <div className="community-health-bar">
            <div
              className="community-health-bar-fill"
              style={{
                width: `${healthScore}%`,
                background: healthScore > 60 ? '#065F46' : healthScore > 30 ? '#92400E' : '#991B1B',
              }}
            />
          </div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Total Members</div>
          <div className="community-admin-stat-value">{totals.members.toLocaleString()}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Active Members</div>
          <div className="community-admin-stat-value">{totals.active.toLocaleString()}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Msgs / Day</div>
          <div className="community-admin-stat-value">{totals.messagesPerDay}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Avg Growth</div>
          <div className="community-admin-stat-value" style={{ color: '#065F46' }}>+{totals.avgGrowth}%</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <div className="community-dashboard-two-col">
        <GrowthChart metrics={metrics} />
        <ActivityFeed messages={messages} />
      </div>

      <div className="community-dashboard-grid">
        {metrics.map((m) => {
          const ps = PLATFORM_STYLES[m.platform]
          return (
            <div key={m.platform} className="community-dashboard-card">
              <div className="community-dashboard-card-header">
                <span className="community-dashboard-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    className="community-admin-chip"
                    style={{ background: ps.bg, color: ps.color, fontSize: 13 }}
                  >
                    {ps.label}
                  </span>
                </span>
                <span className="community-dashboard-growth">+{m.growthRate}%</span>
              </div>

              <div className="community-dashboard-metrics">
                <div className="community-dashboard-metric">
                  <div className="community-dashboard-metric-value">{m.memberCount.toLocaleString()}</div>
                  <div className="community-dashboard-metric-label">Members</div>
                </div>
                <div className="community-dashboard-metric">
                  <div className="community-dashboard-metric-value">{m.activeMembers}</div>
                  <div className="community-dashboard-metric-label">Active</div>
                </div>
                <div className="community-dashboard-metric">
                  <div className="community-dashboard-metric-value">{m.messagesPerDay}</div>
                  <div className="community-dashboard-metric-label">Msgs/Day</div>
                </div>
              </div>

              <div className="community-dashboard-contributors">
                <div className="community-dashboard-contributors-title">Top Contributors</div>
                {m.topContributors.slice(0, 3).map((c) => (
                  <div key={c.name} className="community-dashboard-contributor">
                    <span className="community-dashboard-contributor-name">{c.name}</span>
                    <span className="community-dashboard-contributor-count">{c.messageCount} msgs</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
