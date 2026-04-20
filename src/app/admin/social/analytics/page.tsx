'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  PiChartBarBold,
  PiArrowUpBold,
  PiArrowDownBold,
  PiCheckCircleBold,
} from 'react-icons/pi'
import PlatformChip from '@/components/admin/PlatformChip'
import {
  fetchAllSocialPosts,
  type SocialMediaPost,
  type SocialPlatform,
} from '@/lib/social-api'
import { getCookieValue } from '@/lib/cookies'
import { getApprovalRate, getTopRejectionReasons } from '@/lib/approval-analytics-api'
import '../social-admin.css'
import './analytics.css'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlatformStats {
  platform: SocialPlatform
  total: number
  published: number
  scheduled: number
  drafts: number
  failed: number
  avgContentLength: number
  hashtagCount: number
  approvalRate: number
}

interface TimelinePoint {
  label: string
  count: number
  published: number
}

type DateRange = '7d' | '30d' | '90d' | 'all'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isWithinRange(dateStr: string, range: DateRange): boolean {
  if (range === 'all') return true
  const date = new Date(dateStr)
  const now = new Date()
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return date >= cutoff
}

function getPostDate(post: SocialMediaPost): string {
  return post.publishedAt || post.scheduledAt || post.createdAt
}

function groupByWeek(posts: SocialMediaPost[]): TimelinePoint[] {
  const weeks = new Map<string, { count: number; published: number }>()

  for (const post of posts) {
    const d = new Date(getPostDate(post))
    // Normalize to start of week (Sunday)
    const sunday = new Date(d)
    sunday.setDate(d.getDate() - d.getDay())
    const key = sunday.toISOString().slice(0, 10)

    const existing = weeks.get(key) || { count: 0, published: 0 }
    existing.count++
    if (post.status === 'PUBLISHED') existing.published++
    weeks.set(key, existing)
  }

  return Array.from(weeks.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, val]) => ({
      label: new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: val.count,
      published: val.published,
    }))
}

// ---------------------------------------------------------------------------
// Bar chart component (pure CSS, no external dependencies)
// ---------------------------------------------------------------------------

function BarChart({ data, maxHeight = 160 }: { data: TimelinePoint[]; maxHeight?: number }) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="analytics-bar-chart" style={{ height: maxHeight + 32 }}>
      <div className="analytics-bar-chart-bars">
        {data.map((point, i) => (
          <div key={i} className="analytics-bar-chart-col">
            <div className="analytics-bar-chart-bar-wrap" style={{ height: maxHeight }}>
              <div
                className="analytics-bar-chart-bar"
                style={{ height: `${(point.count / max) * 100}%` }}
                title={`${point.label}: ${point.count} posts (${point.published} published)`}
              >
                {point.published > 0 && (
                  <div
                    className="analytics-bar-chart-bar-published"
                    style={{ height: `${(point.published / point.count) * 100}%` }}
                  />
                )}
              </div>
            </div>
            <span className="analytics-bar-chart-label">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Horizontal bar chart for platform breakdown
// ---------------------------------------------------------------------------

function HorizontalBarChart({ stats }: { stats: PlatformStats[] }) {
  const maxTotal = Math.max(...stats.map((s) => s.total), 1)

  return (
    <div className="analytics-hbar-chart">
      {stats.map((stat) => (
        <div key={stat.platform} className="analytics-hbar-row">
          <div className="analytics-hbar-platform">
            <PlatformChip platform={stat.platform} />
          </div>
          <div className="analytics-hbar-track">
            <div
              className="analytics-hbar-fill"
              style={{ width: `${(stat.total / maxTotal) * 100}%` }}
            >
              {stat.published > 0 && (
                <div
                  className="analytics-hbar-published"
                  style={{ width: `${(stat.published / stat.total) * 100}%` }}
                />
              )}
            </div>
          </div>
          <span className="analytics-hbar-count">{stat.total}</span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<DateRange>('30d')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllSocialPosts(token)
      setPosts(data)
      setLoading(false)
    }
    load()
  }, [])

  // Filter posts by date range
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => isWithinRange(getPostDate(p), range))
  }, [posts, range])

  // Overall stats
  const overallStats = useMemo(() => {
    const total = filteredPosts.length
    const published = filteredPosts.filter((p) => p.status === 'PUBLISHED').length
    const scheduled = filteredPosts.filter((p) => p.status === 'SCHEDULED').length
    const drafts = filteredPosts.filter((p) => p.status === 'DRAFT').length
    const failed = filteredPosts.filter((p) => p.status === 'FAILED').length
    const pendingApproval = filteredPosts.filter((p) => p.status === 'PENDING_APPROVAL').length
    const approved = filteredPosts.filter((p) => p.approvalStatus === 'APPROVED').length
    const approvalRequested = filteredPosts.filter((p) => p.approvalStatus !== 'NONE').length
    const approvalRate = approvalRequested > 0 ? Math.round((approved / approvalRequested) * 100) : 0
    const avgContentLength = total > 0
      ? Math.round(filteredPosts.reduce((sum, p) => sum + p.content.length, 0) / total)
      : 0
    const totalHashtags = filteredPosts.reduce((sum, p) => sum + p.hashtags.length, 0)
    const withMedia = filteredPosts.filter((p) => p.mediaUrls.length > 0).length
    const publishRate = total > 0 ? Math.round((published / total) * 100) : 0

    return {
      total,
      published,
      scheduled,
      drafts,
      failed,
      pendingApproval,
      approvalRate,
      avgContentLength,
      totalHashtags,
      withMedia,
      publishRate,
    }
  }, [filteredPosts])

  // Per-platform stats
  const platformStats = useMemo((): PlatformStats[] => {
    const map = new Map<SocialPlatform, SocialMediaPost[]>()
    for (const p of filteredPosts) {
      const existing = map.get(p.platform) || []
      existing.push(p)
      map.set(p.platform, existing)
    }

    return Array.from(map.entries())
      .map(([platform, platformPosts]) => {
        const published = platformPosts.filter((p) => p.status === 'PUBLISHED').length
        const approved = platformPosts.filter((p) => p.approvalStatus === 'APPROVED').length
        const requested = platformPosts.filter((p) => p.approvalStatus !== 'NONE').length
        return {
          platform,
          total: platformPosts.length,
          published,
          scheduled: platformPosts.filter((p) => p.status === 'SCHEDULED').length,
          drafts: platformPosts.filter((p) => p.status === 'DRAFT').length,
          failed: platformPosts.filter((p) => p.status === 'FAILED').length,
          avgContentLength: Math.round(
            platformPosts.reduce((sum, p) => sum + p.content.length, 0) / platformPosts.length,
          ),
          hashtagCount: platformPosts.reduce((sum, p) => sum + p.hashtags.length, 0),
          approvalRate: requested > 0 ? Math.round((approved / requested) * 100) : 0,
        }
      })
      .sort((a, b) => b.total - a.total)
  }, [filteredPosts])

  // Timeline data
  const timelineData = useMemo(() => groupByWeek(filteredPosts), [filteredPosts])

  // Top hashtags
  const topHashtags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of filteredPosts) {
      for (const tag of post.hashtags) {
        const normalized = tag.startsWith('#') ? tag : `#${tag}`
        counts.set(normalized, (counts.get(normalized) || 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [filteredPosts])

  // Status distribution for donut visual
  const statusDistribution = useMemo(() => {
    const statuses = [
      { key: 'PUBLISHED', label: 'Published', color: 'var(--af-signal-go)' },
      { key: 'SCHEDULED', label: 'Scheduled', color: 'var(--af-ultra)' },
      { key: 'DRAFT', label: 'Draft', color: 'var(--af-stone-400)' },
      { key: 'PENDING_APPROVAL', label: 'Pending Approval', color: 'var(--af-signal-wait)' },
      { key: 'FAILED', label: 'Failed', color: 'var(--af-signal-stop)' },
      { key: 'CHANGES_REQUESTED', label: 'Changes Requested', color: 'var(--af-terra)' },
    ] as const

    return statuses
      .map((s) => ({
        ...s,
        count: filteredPosts.filter((p) => p.status === s.key).length,
      }))
      .filter((s) => s.count > 0)
  }, [filteredPosts])

  if (loading) {
    return (
      <>
        <div className="social-admin-header">
          <h1>Analytics</h1>
        </div>
        <div className="skeleton-stat-row">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-stat-card" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <div className="social-admin-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="skeleton-block w-40" />
              <div className="skeleton-block w-20" />
              <div className="skeleton-block w-16" />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="social-admin-header">
        <h1>Analytics</h1>
        <div className="analytics-range-toggle">
          {(['7d', '30d', '90d', 'all'] as DateRange[]).map((r) => (
            <button
              key={r}
              type="button"
              className={`analytics-range-btn${range === r ? ' active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r === 'all' ? 'All Time' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="social-admin-stats">
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Total Posts</div>
          <div className="social-admin-stat-value">{overallStats.total}</div>
        </div>
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Published</div>
          <div className="social-admin-stat-value">{overallStats.published}</div>
        </div>
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Publish Rate</div>
          <div className="social-admin-stat-value">
            {overallStats.publishRate}%
          </div>
        </div>
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Avg Length</div>
          <div className="social-admin-stat-value">{overallStats.avgContentLength}</div>
        </div>
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Approval Rate</div>
          <div className="social-admin-stat-value">{overallStats.approvalRate}%</div>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="social-admin-empty">
          <div className="social-admin-empty-icon">
            <PiChartBarBold />
          </div>
          <h2>No data for this period</h2>
          <p>Try selecting a wider date range to see analytics.</p>
        </div>
      ) : (
        <div className="analytics-grid">
          {/* Post Activity Timeline */}
          <div className="analytics-card analytics-card--wide">
            <h3 className="analytics-card-title">Post Activity</h3>
            <div className="analytics-chart-legend">
              <span className="analytics-legend-item">
                <span className="analytics-legend-swatch" style={{ background: 'var(--af-ultra-wash)' }} />
                Total
              </span>
              <span className="analytics-legend-item">
                <span className="analytics-legend-swatch" style={{ background: 'var(--af-ultra)' }} />
                Published
              </span>
            </div>
            {timelineData.length > 0 ? (
              <BarChart data={timelineData} />
            ) : (
              <p className="analytics-card-empty">Not enough data for timeline.</p>
            )}
          </div>

          {/* Platform Breakdown */}
          <div className="analytics-card">
            <h3 className="analytics-card-title">Platform Breakdown</h3>
            <HorizontalBarChart stats={platformStats} />
          </div>

          {/* Status Distribution */}
          <div className="analytics-card">
            <h3 className="analytics-card-title">Status Distribution</h3>
            <div className="analytics-status-list">
              {statusDistribution.map((s) => (
                <div key={s.key} className="analytics-status-row">
                  <span
                    className="analytics-status-dot"
                    style={{ background: s.color }}
                  />
                  <span className="analytics-status-label">{s.label}</span>
                  <span className="analytics-status-count">{s.count}</span>
                  <div className="analytics-status-bar-track">
                    <div
                      className="analytics-status-bar-fill"
                      style={{
                        width: `${(s.count / overallStats.total) * 100}%`,
                        background: s.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Hashtags */}
          <div className="analytics-card">
            <h3 className="analytics-card-title">Top Hashtags</h3>
            {topHashtags.length === 0 ? (
              <p className="analytics-card-empty">No hashtags used yet.</p>
            ) : (
              <div className="analytics-hashtag-list">
                {topHashtags.map(([tag, count]) => (
                  <div key={tag} className="analytics-hashtag-row">
                    <span className="social-admin-hashtag-chip">{tag}</span>
                    <span className="analytics-hashtag-count">{count} post{count > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Per-Platform Performance Table */}
          <div className="analytics-card analytics-card--wide">
            <h3 className="analytics-card-title">Platform Performance</h3>
            <div className="social-admin-table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="social-admin-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>Total</th>
                    <th>Published</th>
                    <th>Scheduled</th>
                    <th>Drafts</th>
                    <th>Failed</th>
                    <th>Avg Length</th>
                    <th>Hashtags</th>
                    <th>Approval Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {platformStats.map((stat) => (
                    <tr key={stat.platform}>
                      <td><PlatformChip platform={stat.platform} /></td>
                      <td>{stat.total}</td>
                      <td>{stat.published}</td>
                      <td>{stat.scheduled}</td>
                      <td>{stat.drafts}</td>
                      <td>
                        {stat.failed > 0 ? (
                          <span style={{ color: 'var(--af-signal-stop)', fontWeight: 600 }}>{stat.failed}</span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td>{stat.avgContentLength}</td>
                      <td>{stat.hashtagCount}</td>
                      <td>{stat.approvalRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Content Insights */}
          <div className="analytics-card">
            <h3 className="analytics-card-title">Content Insights</h3>
            <div className="analytics-insight-list">
              <div className="analytics-insight-row">
                <span className="analytics-insight-label">Posts with media</span>
                <span className="analytics-insight-value">
                  {overallStats.withMedia}
                  <span className="analytics-insight-pct">
                    ({overallStats.total > 0 ? Math.round((overallStats.withMedia / overallStats.total) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="analytics-insight-row">
                <span className="analytics-insight-label">Total hashtags used</span>
                <span className="analytics-insight-value">{overallStats.totalHashtags}</span>
              </div>
              <div className="analytics-insight-row">
                <span className="analytics-insight-label">Avg content length</span>
                <span className="analytics-insight-value">{overallStats.avgContentLength} chars</span>
              </div>
              <div className="analytics-insight-row">
                <span className="analytics-insight-label">Platforms used</span>
                <span className="analytics-insight-value">{platformStats.length}</span>
              </div>
              <div className="analytics-insight-row">
                <span className="analytics-insight-label">Pending approval</span>
                <span className="analytics-insight-value">{overallStats.pendingApproval}</span>
              </div>
            </div>
          </div>

          {/* Approval Analytics Link */}
          <div className="analytics-card analytics-approval-link-card">
            <Link href="/admin/social/analytics/approvals" className="analytics-approval-link">
              <div className="analytics-approval-link-icon">
                <PiCheckCircleBold />
              </div>
              <div className="analytics-approval-link-body">
                <h3 className="analytics-card-title" style={{ margin: 0 }}>Approval Analytics</h3>
                <p className="analytics-approval-link-desc">
                  Track approval rates, rejection reasons, model performance, and reviewer patterns.
                  The feedback loop that makes the system smarter.
                </p>
                <div className="analytics-approval-link-stats">
                  <span>{getApprovalRate().total} decisions</span>
                  <span>{getApprovalRate().approvalRate}% approval rate</span>
                  <span>{getTopRejectionReasons()[0]?.label || 'N/A'} top issue</span>
                </div>
              </div>
              <span className="analytics-approval-link-arrow">&rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
