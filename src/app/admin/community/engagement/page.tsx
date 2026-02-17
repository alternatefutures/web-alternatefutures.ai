'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  fetchEngagementTrends,
  fetchEngagementCampaigns,
  fetchActivitySegments,
  fetchTopContributors,
  type EngagementTrend,
  type EngagementCampaign,
  type ActivitySegment,
  type TopContributor,
  type CommunityPlatform,
  type CampaignStatus,
  type CampaignType,
  type ActivityLevel,
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

const SEGMENT_COLORS: Record<ActivityLevel, string> = {
  'power-user': '#C85028',
  active: '#3B82F6',
  occasional: '#F59E0B',
  lurker: '#9CA3AF',
  inactive: '#D1D5DB',
}

const CAMPAIGN_STATUS_STYLES: Record<CampaignStatus, { bg: string; color: string }> = {
  draft: { bg: '#F3F4F6', color: '#6B7280' },
  active: { bg: '#D1FAE5', color: '#065F46' },
  completed: { bg: '#E0E7FF', color: '#3730A3' },
  paused: { bg: '#FEF3C7', color: '#92400E' },
}

const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  challenge: 'Challenge',
  ama: 'AMA',
  poll: 'Poll',
  contest: 'Contest',
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['6a', '9a', '12p', '3p', '6p', '9p']

function ActivityHeatmap({ trends }: { trends: EngagementTrend[] }) {
  const cells: { day: number; hour: number; intensity: number }[] = []
  for (let d = 0; d < 7; d++) {
    const trend = trends[d] || trends[0]
    const baseScore = trend ? trend.score : 50
    for (let h = 0; h < 6; h++) {
      const hourMultiplier = h === 0 ? 0.3 : h === 1 ? 0.7 : h === 2 ? 1.0 : h === 3 ? 0.9 : h === 4 ? 0.6 : 0.4
      const noise = 0.8 + Math.sin(d * 3 + h * 7) * 0.2
      cells.push({ day: d, hour: h, intensity: Math.round(baseScore * hourMultiplier * noise) })
    }
  }
  const maxIntensity = Math.max(...cells.map((c) => c.intensity), 1)

  return (
    <div className="community-engagement-card" style={{ gridColumn: 'span 2' }}>
      <div className="community-engagement-card-title">Activity Heatmap</div>
      <div className="community-heatmap">
        <div className="community-heatmap-header">
          <div className="community-heatmap-corner" />
          {HOURS.map((h) => (
            <div key={h} className="community-heatmap-hour-label">{h}</div>
          ))}
        </div>
        {DAYS_OF_WEEK.map((day, d) => (
          <div key={day} className="community-heatmap-row">
            <div className="community-heatmap-day-label">{day}</div>
            {cells.filter((c) => c.day === d).map((cell) => {
              const opacity = 0.1 + (cell.intensity / maxIntensity) * 0.9
              return (
                <div
                  key={`${cell.day}-${cell.hour}`}
                  className="community-heatmap-cell"
                  style={{ background: `rgba(200, 80, 40, ${opacity})` }}
                  title={`${day} ${HOURS[cell.hour]}: ${cell.intensity}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="community-heatmap-legend">
        <span>Less active</span>
        <div className="community-heatmap-legend-scale">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
            <div key={o} className="community-heatmap-legend-cell" style={{ background: `rgba(200, 80, 40, ${o})` }} />
          ))}
        </div>
        <span>More active</span>
      </div>
    </div>
  )
}

export default function EngagementPage() {
  const [trends, setTrends] = useState<EngagementTrend[]>([])
  const [campaigns, setCampaigns] = useState<EngagementCampaign[]>([])
  const [segments, setSegments] = useState<ActivitySegment[]>([])
  const [contributors, setContributors] = useState<TopContributor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [t, c, s, tc] = await Promise.all([
          fetchEngagementTrends(token),
          fetchEngagementCampaigns(token),
          fetchActivitySegments(token),
          fetchTopContributors(token),
        ])
        setTrends(t)
        setCampaigns(c)
        setSegments(s)
        setContributors(tc)
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const latestTrend = useMemo(() => trends[trends.length - 1] || null, [trends])
  const maxScore = useMemo(() => Math.max(...trends.map((t) => t.score), 1), [trends])

  const totalMembers = useMemo(() => segments.reduce((s, seg) => s + seg.count, 0), [segments])
  const activeRatio = useMemo(() => {
    const active = segments.filter((s) => s.level === 'power-user' || s.level === 'active').reduce((sum, s) => sum + s.count, 0)
    return totalMembers > 0 ? Math.round((active / totalMembers) * 100) : 0
  }, [segments, totalMembers])

  if (loading) {
    return <div className="community-admin-empty"><p>Loading engagement data...</p></div>
  }

  return (
    <>
      <div className="community-admin-header">
        <h1>Engagement Tools</h1>
      </div>

      <div className="community-admin-stats">
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Engagement Score</div>
          <div className="community-admin-stat-value">{latestTrend?.score ?? '—'}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Active Users</div>
          <div className="community-admin-stat-value">{latestTrend?.activeUsers?.toLocaleString() ?? '—'}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Active Ratio</div>
          <div className="community-admin-stat-value">{activeRatio}%</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Campaigns</div>
          <div className="community-admin-stat-value">{campaigns.filter((c) => c.status === 'active').length}</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <div className="community-engagement-grid">
        <div className="community-engagement-card">
          <div className="community-engagement-card-title">Top Contributors</div>
          {contributors.map((tc, idx) => {
            const ps = PLATFORM_STYLES[tc.platform]
            const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : ''
            return (
              <div key={tc.id} className="community-leaderboard-item">
                <span className={`community-leaderboard-rank ${rankClass}`}>#{idx + 1}</span>
                <div className="community-leaderboard-info">
                  <div className="community-leaderboard-name">{tc.name}</div>
                  <div className="community-leaderboard-detail">
                    <span className="community-admin-chip" style={{ background: ps.bg, color: ps.color, fontSize: 10, padding: '1px 6px' }}>{ps.label}</span>
                    {' '}{tc.helpfulAnswers} helpful &middot; {tc.streak}d streak
                  </div>
                </div>
                <span className="community-leaderboard-score">{tc.score}</span>
              </div>
            )
          })}
        </div>

        <div className="community-engagement-card">
          <div className="community-engagement-card-title">Score Trend (7 Days)</div>
          <div className="community-trend-row">
            {trends.map((t) => (
              <div key={t.date} className="community-trend-bar" style={{ height: `${(t.score / maxScore) * 100}%` }} title={`${t.date}: ${t.score}`} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Instrument Sans", sans-serif', fontSize: 10, color: '#6B7280', marginTop: 4 }}>
            {trends.map((t) => <span key={t.date}>{t.date.slice(8)}</span>)}
          </div>
          <div style={{ marginTop: 12 }}>
            {trends.map((t) => (
              <div key={t.date} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Instrument Sans", sans-serif', fontSize: 12, padding: '2px 0', color: '#6B7280' }}>
                <span>{t.date}</span>
                <span>{t.activeUsers} active</span>
                <span>{t.newMessages} msgs</span>
                <span style={{ fontWeight: 600, color: '#1F2937' }}>{t.score}</span>
              </div>
            ))}
          </div>
        </div>

        <ActivityHeatmap trends={trends} />

        <div className="community-engagement-card">
          <div className="community-engagement-card-title">Member Segments</div>
          {segments.map((seg) => (
            <div key={seg.level} className="community-segment-bar">
              <span className="community-segment-label">{seg.level.replace('-', ' ')}</span>
              <div className="community-segment-track">
                <div className="community-segment-fill" style={{ width: `${seg.percentage}%`, background: SEGMENT_COLORS[seg.level] }} />
              </div>
              <span className="community-segment-value">{seg.count} ({seg.percentage}%)</span>
            </div>
          ))}
          <div style={{ marginTop: 12, fontFamily: '"Instrument Sans", sans-serif', fontSize: 12, color: '#6B7280' }}>
            Active vs lurker ratio: <strong style={{ color: '#1F2937' }}>{activeRatio}%</strong> active
          </div>
        </div>

        <div className="community-engagement-card">
          <div className="community-engagement-card-title">Campaigns</div>
          {campaigns.map((cmp) => {
            const cs = CAMPAIGN_STATUS_STYLES[cmp.status]
            return (
              <div key={cmp.id} className="community-campaign-item">
                <div className="community-campaign-header">
                  <span className="community-campaign-name">{cmp.name}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span className="community-admin-chip" style={{ background: '#F3F4F6', color: '#6B7280' }}>{CAMPAIGN_TYPE_LABELS[cmp.type]}</span>
                    <span className="community-admin-chip" style={{ background: cs.bg, color: cs.color }}>{cmp.status}</span>
                  </div>
                </div>
                <div style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: 12, color: '#6B7280' }}>{cmp.goal}</div>
                <div className="community-campaign-progress-track">
                  <div className="community-campaign-progress-fill" style={{ width: `${cmp.progress}%` }} />
                </div>
                <div className="community-campaign-meta">
                  <span>{cmp.participants} participants</span>
                  <span>{cmp.progress}% complete</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
