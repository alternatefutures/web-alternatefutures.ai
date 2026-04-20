'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  PiArrowLeftBold,
  PiCheckCircleBold,
  PiXCircleBold,
  PiArrowsClockwiseBold,
  PiClockBold,
  PiLightbulbBold,
  PiWarningBold,
  PiTrendUpBold,
} from 'react-icons/pi'
import PlatformChip from '@/components/admin/PlatformChip'
import { APPROVERS } from '@/lib/social-api'
import {
  getApprovalRate,
  getTopRejectionReasons,
  getApprovalsByModel,
  getApprovalsByContentType,
  getApprovalsByReviewer,
  getApprovalsByPlatform,
  getApprovalTrend,
  getAvgTimeToApprove,
  getActionableInsights,
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
  type ApprovalTrendPoint,
} from '@/lib/approval-analytics-api'
import '../../social-admin.css'
import '../analytics.css'
import './approval-analytics.css'

// ---------------------------------------------------------------------------
// Chart components (CSS-only, matching existing analytics patterns)
// ---------------------------------------------------------------------------

function TrendLineChart({ data, height = 160 }: { data: ApprovalTrendPoint[]; height?: number }) {
  if (data.length < 2) return <p className="analytics-card-empty">Not enough data for trend.</p>

  const maxRate = 100
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (d.approvalRate / maxRate) * 100
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = pathD + ` L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`

  return (
    <div className="approval-trend-chart" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="approval-trend-svg">
        <path d={areaD} className="approval-trend-area" />
        <path d={pathD} className="approval-trend-line" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" className="approval-trend-dot">
            <title>{p.label}: {p.approvalRate}% ({p.approved}/{p.total})</title>
          </circle>
        ))}
      </svg>
      <div className="approval-trend-labels">
        {data.map((d, i) => (
          <span key={i} className="approval-trend-label">{d.label}</span>
        ))}
      </div>
    </div>
  )
}

function HorizontalBarChartSimple({
  items,
}: {
  items: { label: string; count: number; color?: string }[]
}) {
  const maxCount = Math.max(...items.map((i) => i.count), 1)

  return (
    <div className="approval-hbar-chart">
      {items.map((item) => (
        <div key={item.label} className="approval-hbar-row">
          <span className="approval-hbar-label">{item.label}</span>
          <div className="approval-hbar-track">
            <div
              className="approval-hbar-fill"
              style={{
                width: `${(item.count / maxCount) * 100}%`,
                background: item.color || 'var(--af-terra)',
              }}
            />
          </div>
          <span className="approval-hbar-count">{item.count}</span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type TrendRange = '7d' | '14d' | '28d'

export default function ApprovalAnalyticsPage() {
  const [trendRange, setTrendRange] = useState<TrendRange>('28d')

  const rates = useMemo(() => getApprovalRate(), [])
  const rejectionReasons = useMemo(() => getTopRejectionReasons(), [])
  const modelPerf = useMemo(() => getApprovalsByModel(), [])
  const contentTypes = useMemo(() => getApprovalsByContentType(), [])
  const reviewerPatterns = useMemo(() => getApprovalsByReviewer(), [])
  const platformBreakdown = useMemo(() => getApprovalsByPlatform(), [])
  const avgTime = useMemo(() => getAvgTimeToApprove(), [])
  const insights = useMemo(() => getActionableInsights(), [])

  const trendDays = trendRange === '7d' ? 7 : trendRange === '14d' ? 14 : 28
  const trendData = useMemo(() => getApprovalTrend(trendDays), [trendDays])

  const topRejectionLabel = rejectionReasons.length > 0 ? rejectionReasons[0].label : 'N/A'

  return (
    <>
      <div className="social-admin-header">
        <div>
          <Link href="/admin/social/analytics" className="social-editor-back">
            <PiArrowLeftBold style={{ marginRight: 4 }} />
            Back to Analytics
          </Link>
          <h1>Approval Analytics</h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="social-admin-stats">
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Total Decisions</div>
          <div className="social-admin-stat-value">{rates.total}</div>
        </div>
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Approval Rate</div>
          <div className="social-admin-stat-value" style={{ color: rates.approvalRate >= 70 ? 'var(--af-signal-go)' : 'var(--af-signal-stop)' }}>
            {rates.approvalRate}%
          </div>
        </div>
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Avg Time to Approve</div>
          <div className="social-admin-stat-value">{avgTime}</div>
        </div>
        <div className="social-admin-stat-card">
          <div className="social-admin-stat-label">Top Rejection Reason</div>
          <div className="social-admin-stat-value" style={{ fontSize: 'var(--af-type-sm)' }}>{topRejectionLabel}</div>
        </div>
      </div>

      <div className="analytics-grid">

        {/* Rejection Reasons Chart */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">Rejection Reasons</h3>
          {rejectionReasons.length === 0 ? (
            <p className="analytics-card-empty">No rejection data yet.</p>
          ) : (
            <HorizontalBarChartSimple
              items={rejectionReasons.map((r) => ({
                label: r.label,
                count: r.count,
                color: r.category === 'FACTUAL_ERROR' ? 'var(--af-signal-stop)' :
                       r.category === 'AI_SOUNDING' ? 'var(--af-ultra)' :
                       r.category === 'OFF_BRAND' ? 'var(--af-signal-wait)' :
                       'var(--af-terra)',
              }))}
            />
          )}
        </div>

        {/* Approval Trend */}
        <div className="analytics-card">
          <div className="approval-trend-header">
            <h3 className="analytics-card-title">Approval Trend</h3>
            <div className="analytics-range-toggle" style={{ marginLeft: 'auto' }}>
              {(['7d', '14d', '28d'] as TrendRange[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`analytics-range-btn${trendRange === r ? ' active' : ''}`}
                  onClick={() => setTrendRange(r)}
                >
                  {r === '7d' ? '7d' : r === '14d' ? '14d' : '28d'}
                </button>
              ))}
            </div>
          </div>
          <TrendLineChart data={trendData} />
        </div>

        {/* Model Performance Table */}
        <div className="analytics-card analytics-card--wide">
          <h3 className="analytics-card-title">Model Performance</h3>
          <div className="social-admin-table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="social-admin-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Posts</th>
                  <th>Approved</th>
                  <th>Rejected</th>
                  <th>Changes</th>
                  <th>Approval Rate</th>
                  <th>Top Rejection</th>
                  <th>Avg Rounds</th>
                </tr>
              </thead>
              <tbody>
                {modelPerf.map((m) => (
                  <tr key={m.model}>
                    <td>
                      <code className="approval-model-name">{m.model}</code>
                    </td>
                    <td>{m.postsGenerated}</td>
                    <td style={{ color: 'var(--af-signal-go)' }}>{m.approved}</td>
                    <td style={{ color: m.rejected > 0 ? 'var(--af-signal-stop)' : undefined }}>{m.rejected}</td>
                    <td style={{ color: m.changesRequested > 0 ? 'var(--af-signal-wait)' : undefined }}>{m.changesRequested}</td>
                    <td>
                      <span className={`approval-rate-badge ${m.approvalRate >= 70 ? 'good' : m.approvalRate >= 50 ? 'okay' : 'bad'}`}>
                        {m.approvalRate}%
                      </span>
                    </td>
                    <td className="approval-rejection-reason">
                      {m.topRejectionReason || <span style={{ color: 'var(--af-stone-400)' }}>—</span>}
                    </td>
                    <td>{m.avgRevisionRounds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reviewer Patterns */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">Reviewer Patterns</h3>
          <div className="approval-reviewer-list">
            {reviewerPatterns.map((r) => {
              const approverInfo = APPROVERS.find((a) => a.id === r.reviewer)
              const name = approverInfo?.name || r.reviewer
              const role = approverInfo?.role || ''
              return (
                <div key={r.reviewer} className="approval-reviewer-row">
                  <div className="approval-reviewer-info">
                    <span className="approval-reviewer-name">{name}</span>
                    <span className="approval-reviewer-role">{role}</span>
                  </div>
                  <div className="approval-reviewer-stats">
                    <span className="approval-reviewer-stat">
                      <PiCheckCircleBold style={{ color: 'var(--af-signal-go)' }} />
                      {r.approved}
                    </span>
                    <span className="approval-reviewer-stat">
                      <PiXCircleBold style={{ color: 'var(--af-signal-stop)' }} />
                      {r.rejected}
                    </span>
                    <span className="approval-reviewer-stat">
                      <PiArrowsClockwiseBold style={{ color: 'var(--af-signal-wait)' }} />
                      {r.changesRequested}
                    </span>
                    <span className={`approval-rate-badge ${r.approvalRate >= 70 ? 'good' : r.approvalRate >= 50 ? 'okay' : 'bad'}`}>
                      {r.approvalRate}%
                    </span>
                  </div>
                  {r.topRejectionCategory && (
                    <span className="approval-reviewer-top-reason">
                      Top issue: {FEEDBACK_CATEGORY_LABELS[r.topRejectionCategory]}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content Type Breakdown */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">Content Type Breakdown</h3>
          <div className="analytics-status-list">
            {contentTypes.map((ct) => (
              <div key={ct.contentType} className="analytics-status-row">
                <span
                  className="analytics-status-dot"
                  style={{
                    background: ct.approvalRate >= 70 ? 'var(--af-signal-go)' :
                                ct.approvalRate >= 50 ? 'var(--af-signal-wait)' :
                                'var(--af-signal-stop)',
                  }}
                />
                <span className="analytics-status-label">{ct.label}</span>
                <span className="analytics-status-count">{ct.approvalRate}%</span>
                <div className="analytics-status-bar-track">
                  <div
                    className="analytics-status-bar-fill"
                    style={{
                      width: `${ct.approvalRate}%`,
                      background: ct.approvalRate >= 70 ? 'var(--af-signal-go)' :
                                  ct.approvalRate >= 50 ? 'var(--af-signal-wait)' :
                                  'var(--af-signal-stop)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="analytics-card analytics-card--wide">
          <h3 className="analytics-card-title">Platform Breakdown</h3>
          <div className="approval-platform-grid">
            {platformBreakdown.map((p) => (
              <div key={p.platform} className="approval-platform-card">
                <PlatformChip platform={p.platform} />
                <div className="approval-platform-stats">
                  <span className="approval-platform-total">{p.total} posts</span>
                  <span className={`approval-rate-badge ${p.approvalRate >= 70 ? 'good' : p.approvalRate >= 50 ? 'okay' : 'bad'}`}>
                    {p.approvalRate}%
                  </span>
                </div>
                <div className="approval-platform-bar-track">
                  <div
                    className="approval-platform-bar-fill"
                    style={{
                      width: `${p.approvalRate}%`,
                      background: p.approvalRate >= 70 ? 'var(--af-signal-go)' :
                                  p.approvalRate >= 50 ? 'var(--af-signal-wait)' :
                                  'var(--af-signal-stop)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="analytics-card analytics-card--wide">
          <h3 className="analytics-card-title">Actionable Insights</h3>
          {insights.length === 0 ? (
            <p className="analytics-card-empty">Not enough data to generate insights.</p>
          ) : (
            <div className="approval-insights-list">
              {insights.map((insight) => (
                <div key={insight.id} className={`approval-insight-row approval-insight-row--${insight.type}`}>
                  <span className="approval-insight-icon">
                    {insight.type === 'warning' && <PiWarningBold />}
                    {insight.type === 'info' && <PiLightbulbBold />}
                    {insight.type === 'success' && <PiTrendUpBold />}
                  </span>
                  <p className="approval-insight-text">{insight.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
