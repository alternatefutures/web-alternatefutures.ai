'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchCommunityMetrics,
  type CommunityMetrics,
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

export default function CommunityGrowthDashboard() {
  const [metrics, setMetrics] = useState<CommunityMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const data = await fetchCommunityMetrics(token)
        setMetrics(data)
      } catch {
        setLoadError('Failed to load community metrics.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totals = useMemo(() => {
    return {
      members: metrics.reduce((s, m) => s + m.memberCount, 0),
      active: metrics.reduce((s, m) => s + m.activeMembers, 0),
      messagesPerDay: metrics.reduce((s, m) => s + m.messagesPerDay, 0),
      avgGrowth:
        metrics.length > 0
          ? (metrics.reduce((s, m) => s + m.growthRate, 0) / metrics.length).toFixed(1)
          : '0',
    }
  }, [metrics])

  if (loading) {
    return <div className="community-admin-empty"><p>Loading metrics...</p></div>
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
        <h1>Community Growth</h1>
        <Link href="/admin/community" className="community-admin-action-btn">
          Back to Inbox
        </Link>
      </div>

      <div className="community-dashboard-summary">
        <div className="community-dashboard-summary-stat">
          <div className="community-dashboard-summary-value">{totals.members.toLocaleString()}</div>
          <div className="community-dashboard-summary-label">Total Members</div>
        </div>
        <div className="community-dashboard-summary-stat">
          <div className="community-dashboard-summary-value">{totals.active.toLocaleString()}</div>
          <div className="community-dashboard-summary-label">Active Members</div>
        </div>
        <div className="community-dashboard-summary-stat">
          <div className="community-dashboard-summary-value">{totals.messagesPerDay}</div>
          <div className="community-dashboard-summary-label">Messages / Day</div>
        </div>
        <div className="community-dashboard-summary-stat">
          <div className="community-dashboard-summary-value">{totals.avgGrowth}%</div>
          <div className="community-dashboard-summary-label">Avg Growth Rate</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

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
                {m.topContributors.slice(0, 5).map((c) => (
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
