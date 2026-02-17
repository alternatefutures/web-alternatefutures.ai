'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PiChartLineUpBold,
  PiUsersBold,
  PiCurrencyDollarBold,
  PiArrowsClockwiseBold,
  PiCalendarBold,
  PiHeartBold,
  PiTargetBold,
  PiPathBold,
  PiTrendUpBold,
} from 'react-icons/pi'
import {
  fetchGrowthMetrics,
  type GrowthMetrics,
} from '@/lib/growth-api'
import '../growth-admin.css'

// ---------------------------------------------------------------------------
// Types — Advanced Analytics
// ---------------------------------------------------------------------------

interface CohortRow {
  cohort: string
  users: number
  retention: number[]
}

interface RetentionPoint {
  day: number
  rate: number
}

interface LTVSegment {
  segment: string
  ltv: number
  count: number
  churnRate: number
  avgRevenue: number
  color: string
}

interface AttributionChannel {
  channel: string
  visitors: number
  signups: number
  conversions: number
  revenue: number
  conversionRate: number
  costPerAcquisition: number
  color: string
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_COHORTS: CohortRow[] = [
  { cohort: 'Jan W1', users: 320, retention: [100, 68, 52, 41, 35, 30, 28] },
  { cohort: 'Jan W2', users: 285, retention: [100, 72, 55, 43, 37, 32, 29] },
  { cohort: 'Jan W3', users: 410, retention: [100, 65, 48, 38, 33, 28, 0] },
  { cohort: 'Jan W4', users: 375, retention: [100, 70, 54, 42, 36, 0, 0] },
  { cohort: 'Feb W1', users: 440, retention: [100, 74, 58, 45, 0, 0, 0] },
  { cohort: 'Feb W2', users: 510, retention: [100, 71, 53, 0, 0, 0, 0] },
]

const SEED_RETENTION: RetentionPoint[] = [
  { day: 0, rate: 100 },
  { day: 1, rate: 72 },
  { day: 3, rate: 58 },
  { day: 7, rate: 45 },
  { day: 14, rate: 36 },
  { day: 30, rate: 28 },
  { day: 60, rate: 22 },
  { day: 90, rate: 19 },
]

const SEED_LTV: LTVSegment[] = [
  { segment: 'Enterprise', ltv: 2850, count: 42, churnRate: 1.8, avgRevenue: 320, color: 'var(--af-ultra)' },
  { segment: 'Pro Teams', ltv: 980, count: 186, churnRate: 3.2, avgRevenue: 85, color: 'var(--af-terra)' },
  { segment: 'Pro Solo', ltv: 420, count: 520, churnRate: 4.5, avgRevenue: 25, color: 'var(--af-patina)' },
  { segment: 'Free→Paid', ltv: 180, count: 340, churnRate: 8.2, avgRevenue: 15, color: 'var(--af-signal-wait)' },
  { segment: 'Free Active', ltv: 0, count: 3192, churnRate: 12.0, avgRevenue: 0, color: 'var(--af-stone-400)' },
]

const SEED_ATTRIBUTION: AttributionChannel[] = [
  { channel: 'Organic Search', visitors: 12400, signups: 1240, conversions: 186, revenue: 9300, conversionRate: 15.0, costPerAcquisition: 0, color: 'var(--af-signal-go)' },
  { channel: 'Twitter/X', visitors: 8200, signups: 820, conversions: 98, revenue: 4900, conversionRate: 12.0, costPerAcquisition: 12, color: 'var(--af-ultra)' },
  { channel: 'GitHub', visitors: 5600, signups: 672, conversions: 134, revenue: 8040, conversionRate: 20.0, costPerAcquisition: 0, color: 'var(--af-stone-700)' },
  { channel: 'Dev.to / Hashnode', visitors: 3400, signups: 340, conversions: 51, revenue: 2550, conversionRate: 15.0, costPerAcquisition: 8, color: 'var(--af-patina)' },
  { channel: 'YouTube', visitors: 2800, signups: 196, conversions: 29, revenue: 1450, conversionRate: 14.8, costPerAcquisition: 22, color: 'var(--af-signal-stop)' },
  { channel: 'Referral Program', visitors: 1800, signups: 360, conversions: 72, revenue: 5040, conversionRate: 20.0, costPerAcquisition: 15, color: 'var(--af-terra)' },
  { channel: 'Hacker News', visitors: 4200, signups: 294, conversions: 35, revenue: 1750, conversionRate: 11.9, costPerAcquisition: 0, color: 'var(--af-kin-repair)' },
  { channel: 'Paid Ads', visitors: 6800, signups: 408, conversions: 41, revenue: 2050, conversionRate: 10.0, costPerAcquisition: 48, color: 'var(--af-signal-wait)' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GrowthAnalyticsPage() {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null)
  const [cohorts] = useState<CohortRow[]>(SEED_COHORTS)
  const [retention] = useState<RetentionPoint[]>(SEED_RETENTION)
  const [ltvSegments] = useState<LTVSegment[]>(SEED_LTV)
  const [attribution] = useState<AttributionChannel[]>(SEED_ATTRIBUTION)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'cohorts' | 'retention' | 'ltv' | 'attribution'>('cohorts')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const m = await fetchGrowthMetrics()
      setMetrics(m)
      setLoading(false)
    }
    load()
  }, [])

  const maxLTV = Math.max(...ltvSegments.map((s) => s.ltv))
  const totalRevenue = attribution.reduce((acc, c) => acc + c.revenue, 0)
  const totalConversions = attribution.reduce((acc, c) => acc + c.conversions, 0)

  function retentionColor(rate: number): string {
    if (rate >= 60) return 'var(--af-signal-go)'
    if (rate >= 40) return 'var(--af-patina)'
    if (rate >= 25) return 'var(--af-signal-wait)'
    if (rate > 0) return 'var(--af-signal-stop)'
    return 'transparent'
  }

  function retentionBg(rate: number): string {
    if (rate >= 60) return 'color-mix(in srgb, var(--af-signal-go) 15%, white)'
    if (rate >= 40) return 'color-mix(in srgb, var(--af-patina) 15%, white)'
    if (rate >= 25) return 'color-mix(in srgb, var(--af-signal-wait) 15%, white)'
    if (rate > 0) return 'color-mix(in srgb, var(--af-signal-stop) 10%, white)'
    return 'var(--af-stone-50)'
  }

  return (
    <>
      <div className="growth-header">
        <h1>Growth Analytics</h1>
        <button className="growth-btn" onClick={() => window.location.reload()} disabled={loading}>
          <PiArrowsClockwiseBold /> Refresh
        </button>
      </div>

      <div className="growth-subnav">
        <Link href="/admin/growth">Overview</Link>
        <Link href="/admin/growth/experiments">Experiments</Link>
        <Link href="/admin/growth/referrals">Referrals</Link>
        <Link href="/admin/growth/funnels">Funnels</Link>
        <Link href="/admin/growth/analytics" className="active">Analytics</Link>
        <Link href="/admin/growth/automation">Automation</Link>
      </div>

      {/* Stats */}
      {metrics && (
        <div className="growth-stats">
          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiCurrencyDollarBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">${metrics.ltv}</div>
              <div className="growth-stat-label">Avg LTV</div>
            </div>
          </div>
          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiHeartBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">{retention[3]?.rate}%</div>
              <div className="growth-stat-label">D7 Retention</div>
            </div>
          </div>
          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiTargetBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">${metrics.cac}</div>
              <div className="growth-stat-label">Avg CAC</div>
            </div>
          </div>
          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiTrendUpBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">{(metrics.ltv / metrics.cac).toFixed(1)}x</div>
              <div className="growth-stat-label">LTV:CAC Ratio</div>
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className={`growth-chip${activeView === 'cohorts' ? ' active' : ''}`} onClick={() => setActiveView('cohorts')}>
          Cohort Analysis
        </button>
        <button className={`growth-chip${activeView === 'retention' ? ' active' : ''}`} onClick={() => setActiveView('retention')}>
          Retention Curves
        </button>
        <button className={`growth-chip${activeView === 'ltv' ? ' active' : ''}`} onClick={() => setActiveView('ltv')}>
          LTV Segments
        </button>
        <button className={`growth-chip${activeView === 'attribution' ? ' active' : ''}`} onClick={() => setActiveView('attribution')}>
          Attribution
        </button>
      </div>

      {/* Cohort Analysis */}
      {activeView === 'cohorts' && (
        <div className="growth-section">
          <div className="growth-section-header">
            <h3 className="growth-section-title">
              <PiCalendarBold style={{ marginRight: 6, verticalAlign: -2 }} />
              Cohort Retention Matrix
            </h3>
          </div>
          <div className="growth-section-body" style={{ overflowX: 'auto' }}>
            <table className="growth-data-table">
              <thead>
                <tr>
                  <th>Cohort</th>
                  <th>Users</th>
                  <th>Week 0</th>
                  <th>Week 1</th>
                  <th>Week 2</th>
                  <th>Week 3</th>
                  <th>Week 4</th>
                  <th>Week 5</th>
                  <th>Week 6</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((row) => (
                  <tr key={row.cohort}>
                    <td style={{ fontWeight: 600 }}>{row.cohort}</td>
                    <td style={{ fontFamily: 'var(--af-font-machine)', fontWeight: 600 }}>{row.users}</td>
                    {row.retention.map((rate, i) => (
                      <td
                        key={i}
                        style={{
                          background: retentionBg(rate),
                          color: rate > 0 ? retentionColor(rate) : 'var(--af-stone-300)',
                          fontFamily: 'var(--af-font-machine)',
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {rate > 0 ? `${rate}%` : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Retention Curves */}
      {activeView === 'retention' && (
        <div className="growth-section">
          <div className="growth-section-header">
            <h3 className="growth-section-title">
              <PiPathBold style={{ marginRight: 6, verticalAlign: -2 }} />
              Retention Curve
            </h3>
          </div>
          <div className="growth-section-body">
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 200, padding: '0 20px' }}>
              {retention.map((point, i) => (
                <div key={point.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 11, fontWeight: 600, color: retentionColor(point.rate) }}>
                    {point.rate}%
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 48,
                      height: `${(point.rate / 100) * 160}px`,
                      background: retentionColor(point.rate),
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.6s var(--af-ease-drift)',
                      opacity: 0.8,
                    }}
                  />
                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 10, color: 'var(--af-stone-400)' }}>
                    D{point.day}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: '16px', background: 'var(--af-stone-50)', borderRadius: 'var(--af-radius-worn)', border: '1px solid var(--af-stone-200)' }}>
              <h4 style={{ fontFamily: 'var(--af-font-architect)', fontSize: 13, fontWeight: 600, color: 'var(--af-stone-700)', margin: '0 0 8px' }}>Key Insights</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: 13, color: 'var(--af-stone-600)' }}>
                  • D1→D3 drop (72%→58%) indicates onboarding friction — target with guided wizard
                </span>
                <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: 13, color: 'var(--af-stone-600)' }}>
                  • D30 retention (28%) is above industry average (20%) for PaaS platforms
                </span>
                <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: 13, color: 'var(--af-stone-600)' }}>
                  • D60→D90 plateau suggests retained users become sticky long-term
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LTV Segments */}
      {activeView === 'ltv' && (
        <div className="growth-section">
          <div className="growth-section-header">
            <h3 className="growth-section-title">
              <PiCurrencyDollarBold style={{ marginRight: 6, verticalAlign: -2 }} />
              Lifetime Value by Segment
            </h3>
          </div>
          <div className="growth-section-body">
            {ltvSegments.map((seg) => (
              <div key={seg.segment} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: 14, fontWeight: 600, color: 'var(--af-stone-800)' }}>
                      {seg.segment}
                    </span>
                    <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 11, color: 'var(--af-stone-500)' }}>
                      {seg.count.toLocaleString()} users
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12, color: 'var(--af-stone-500)' }}>
                      Churn: {seg.churnRate}%
                    </span>
                    <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 14, fontWeight: 700, color: seg.color }}>
                      ${seg.ltv.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="growth-hbar" style={{ height: 20 }}>
                  <div
                    className="growth-hbar-fill"
                    style={{
                      width: maxLTV > 0 ? `${(seg.ltv / maxLTV) * 100}%` : '0%',
                      background: seg.color,
                      fontSize: 10,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 11, color: 'var(--af-stone-400)' }}>
                    Avg MRR: ${seg.avgRevenue}/mo
                  </span>
                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 11, color: 'var(--af-stone-400)' }}>
                    LTV:CAC ratio: {seg.ltv > 0 ? (seg.ltv / 42).toFixed(1) : '0'}x
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attribution Modeling */}
      {activeView === 'attribution' && (
        <div className="growth-section">
          <div className="growth-section-header">
            <h3 className="growth-section-title">
              <PiChartLineUpBold style={{ marginRight: 6, verticalAlign: -2 }} />
              Channel Attribution
            </h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12, color: 'var(--af-stone-500)' }}>
                Total Revenue: <strong style={{ color: 'var(--af-signal-go)' }}>${totalRevenue.toLocaleString()}</strong>
              </span>
              <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12, color: 'var(--af-stone-500)' }}>
                Total Conversions: <strong style={{ color: 'var(--af-ultra)' }}>{totalConversions}</strong>
              </span>
            </div>
          </div>
          <div className="growth-section-body" style={{ overflowX: 'auto' }}>
            <table className="growth-data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Channel</th>
                  <th>Visitors</th>
                  <th>Signups</th>
                  <th>Conversions</th>
                  <th>Revenue</th>
                  <th>Conv. Rate</th>
                  <th>CPA</th>
                </tr>
              </thead>
              <tbody>
                {attribution
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((ch) => (
                    <tr key={ch.channel}>
                      <td style={{ fontWeight: 600 }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: ch.color, marginRight: 8 }} />
                        {ch.channel}
                      </td>
                      <td style={{ fontFamily: 'var(--af-font-machine)' }}>{ch.visitors.toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--af-font-machine)' }}>{ch.signups.toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--af-font-machine)', fontWeight: 600 }}>{ch.conversions}</td>
                      <td style={{ fontFamily: 'var(--af-font-machine)', fontWeight: 600, color: 'var(--af-signal-go)' }}>${ch.revenue.toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--af-font-machine)' }}>{ch.conversionRate}%</td>
                      <td style={{ fontFamily: 'var(--af-font-machine)', color: ch.costPerAcquisition === 0 ? 'var(--af-signal-go)' : 'var(--af-stone-600)' }}>
                        {ch.costPerAcquisition === 0 ? 'Organic' : `$${ch.costPerAcquisition}`}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
