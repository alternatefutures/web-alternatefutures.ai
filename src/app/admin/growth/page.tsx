'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PiChartLineUpBold,
  PiCurrencyDollarBold,
  PiUsersBold,
  PiArrowsClockwiseBold,
  PiTrendUpBold,
  PiHeartBold,
  PiTargetBold,
  PiFlaskBold,
  PiLinkBold,
  PiFunnelBold,
} from 'react-icons/pi'
import {
  fetchGrowthMetrics,
  fetchFunnelStages,
  fetchExperiments,
  type GrowthMetrics,
  type FunnelStage,
  type Experiment,
  EXPERIMENT_STATUS_STYLES,
} from '@/lib/growth-api'
import './growth-admin.css'

export default function GrowthDashboardPage() {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null)
  const [stages, setStages] = useState<FunnelStage[]>([])
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [m, s, e] = await Promise.all([
        fetchGrowthMetrics(),
        fetchFunnelStages(),
        fetchExperiments(),
      ])
      setMetrics(m)
      setStages(s)
      setExperiments(e)
      setLoading(false)
    }
    load()
  }, [])

  function formatDelta(val: number, invert = false): { text: string; cls: string } {
    const positive = invert ? val < 0 : val > 0
    const sign = val > 0 ? '+' : ''
    return {
      text: `${sign}${val}%`,
      cls: positive ? 'positive' : 'negative',
    }
  }

  const maxStageValue = stages.length > 0 ? stages[0].value : 1
  const activeExperiments = experiments.filter((e) => e.status === 'RUNNING')

  function renderSparkline(data: number[], color: string, invert = false) {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    return (
      <div className="growth-sparkline">
        {data.map((val, i) => {
          const height = ((val - min) / range) * 100
          const barHeight = invert ? 100 - height : height
          return (
            <div
              key={i}
              className="growth-sparkline-bar"
              style={{
                height: `${Math.max(8, barHeight)}%`,
                background: color,
                opacity: i === data.length - 1 ? 1 : 0.5 + (i / data.length) * 0.5,
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="growth-header">
        <h1>Growth Dashboard</h1>
        <div className="growth-header-actions">
          <button
            className="growth-btn"
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            <PiArrowsClockwiseBold /> Refresh
          </button>
        </div>
      </div>

      {/* Subnav */}
      <div className="growth-subnav">
        <Link href="/admin/growth" className="active">Overview</Link>
        <Link href="/admin/growth/experiments">Experiments</Link>
        <Link href="/admin/growth/referrals">Referrals</Link>
        <Link href="/admin/growth/funnels">Funnels</Link>
        <Link href="/admin/growth/analytics">Analytics</Link>
        <Link href="/admin/growth/automation">Automation</Link>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="growth-stats">
          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiCurrencyDollarBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">${metrics.mrr.toLocaleString()}</div>
              <div className="growth-stat-label">MRR</div>
              <div className={`growth-stat-delta ${formatDelta(metrics.mrrGrowth).cls}`}>
                {formatDelta(metrics.mrrGrowth).text}
              </div>
              {renderSparkline(metrics.sparklines.mrr, 'var(--af-ultra)')}
            </div>
          </div>

          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiArrowsClockwiseBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">{metrics.churnRate}%</div>
              <div className="growth-stat-label">Churn Rate</div>
              <div className={`growth-stat-delta ${formatDelta(metrics.churnDelta, true).cls}`}>
                {formatDelta(metrics.churnDelta, true).text}
              </div>
              {renderSparkline(metrics.sparklines.churn, 'var(--af-signal-go)', true)}
            </div>
          </div>

          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiTrendUpBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">{metrics.viralCoefficient}</div>
              <div className="growth-stat-label">Viral Coefficient</div>
              <div className={`growth-stat-delta ${formatDelta(metrics.viralDelta * 100).cls}`}>
                {metrics.viralDelta > 0 ? '+' : ''}{metrics.viralDelta}
              </div>
              {renderSparkline(metrics.sparklines.viral, 'var(--af-terra)')}
            </div>
          </div>

          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiTargetBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">${metrics.cac}</div>
              <div className="growth-stat-label">CAC</div>
              <div className={`growth-stat-delta ${formatDelta(metrics.cacDelta, true).cls}`}>
                ${metrics.cacDelta}
              </div>
              {renderSparkline(metrics.sparklines.cac, 'var(--af-patina)', true)}
            </div>
          </div>

          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiHeartBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">${metrics.ltv}</div>
              <div className="growth-stat-label">LTV</div>
              <div className={`growth-stat-delta ${formatDelta(metrics.ltvDelta).cls}`}>
                +${metrics.ltvDelta}
              </div>
              {renderSparkline(metrics.sparklines.ltv, 'var(--af-kin-repair)')}
            </div>
          </div>

          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiUsersBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">{metrics.activeUsers.toLocaleString()}</div>
              <div className="growth-stat-label">Active Users</div>
              <div className={`growth-stat-delta ${formatDelta(metrics.activeUsersGrowth).cls}`}>
                {formatDelta(metrics.activeUsersGrowth).text}
              </div>
              {renderSparkline(metrics.sparklines.users, 'var(--af-ultra-deep)')}
            </div>
          </div>
        </div>
      )}

      {/* Funnel Visualization */}
      <div className="growth-funnel">
        <h3 className="growth-funnel-title">Conversion Funnel</h3>
        <div className="growth-funnel-stages">
          {stages.map((stage, i) => {
            const width = (stage.value / maxStageValue) * 100
            return (
              <div key={stage.name} className="growth-funnel-stage">
                <span className="growth-funnel-stage-label">{stage.name}</span>
                <div className="growth-funnel-stage-bar-wrap">
                  <div
                    className="growth-funnel-stage-bar"
                    style={{ width: `${width}%`, background: stage.color }}
                  >
                    {width > 15 && (
                      <span className="growth-funnel-stage-value">
                        {stage.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <span className="growth-funnel-stage-count">
                  {width < 15 && stage.value.toLocaleString()}
                  {i > 0 && (
                    <> ({((stage.value / stages[i - 1].value) * 100).toFixed(1)}%)</>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Two column grid */}
      <div className="growth-grid">
        {/* Active Experiments Summary */}
        <div className="growth-section">
          <div className="growth-section-header">
            <h3 className="growth-section-title">
              <PiFlaskBold style={{ marginRight: 6, verticalAlign: -2 }} />
              Active Experiments ({activeExperiments.length})
            </h3>
            <Link href="/admin/growth/experiments" className="growth-btn" style={{ fontSize: 12, padding: '3px 10px' }}>
              View All
            </Link>
          </div>
          <div className="growth-section-body">
            {activeExperiments.length === 0 ? (
              <div className="growth-empty">
                <div className="growth-empty-sub">No active experiments running</div>
              </div>
            ) : (
              <div className="growth-exp-list">
                {activeExperiments.slice(0, 3).map((exp) => {
                  const best = [...exp.variants].sort((a, b) => b.conversionRate - a.conversionRate)[0]
                  const sigClass = exp.significance >= 95 ? 'high' : exp.significance >= 80 ? 'medium' : 'low'

                  return (
                    <Link key={exp.id} href="/admin/growth/experiments" className="growth-exp-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="growth-exp-card-header">
                        <h4 className="growth-exp-name">{exp.name}</h4>
                        <span
                          className="growth-badge"
                          style={{
                            background: EXPERIMENT_STATUS_STYLES[exp.status].bg,
                            color: EXPERIMENT_STATUS_STYLES[exp.status].color,
                          }}
                        >
                          {EXPERIMENT_STATUS_STYLES[exp.status].label}
                        </span>
                      </div>
                      <div className="growth-exp-meta">
                        <span className="growth-exp-meta-item">
                          {exp.variants.length} variants
                        </span>
                        <span className="growth-exp-meta-item">
                          {exp.totalTraffic.toLocaleString()} impressions
                        </span>
                        <span className={`growth-significance ${sigClass}`}>
                          {exp.significance}% significance
                        </span>
                      </div>
                      {best && best.conversionRate > 0 && (
                        <div className="growth-variants" style={{ marginTop: 8 }}>
                          {exp.variants.map((v) => (
                            <div key={v.id} className={`growth-variant${exp.winner === v.id ? ' winner' : ''}`}>
                              <span className="growth-variant-name">{v.name}</span>
                              <span className="growth-variant-rate" style={{ color: v.id === best.id ? 'var(--af-signal-go)' : 'var(--af-stone-600)' }}>
                                {v.conversionRate.toFixed(2)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="growth-section">
          <div className="growth-section-header">
            <h3 className="growth-section-title">Growth Tools</h3>
          </div>
          <div className="growth-section-body">
            <div className="growth-exp-list">
              <Link href="/admin/growth/experiments" className="growth-exp-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="growth-exp-card-header">
                  <h4 className="growth-exp-name">
                    <PiFlaskBold style={{ marginRight: 8, verticalAlign: -2, color: 'var(--af-ultra)' }} />
                    A/B Testing Manager
                  </h4>
                </div>
                <p className="growth-exp-hypothesis">
                  Create and manage experiments to optimize conversion rates and user experience.
                </p>
              </Link>

              <Link href="/admin/growth/referrals" className="growth-exp-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="growth-exp-card-header">
                  <h4 className="growth-exp-name">
                    <PiLinkBold style={{ marginRight: 8, verticalAlign: -2, color: 'var(--af-terra)' }} />
                    Referral Program
                  </h4>
                </div>
                <p className="growth-exp-hypothesis">
                  Generate referral links, track conversions, and manage reward tiers.
                </p>
              </Link>

              <Link href="/admin/growth/funnels" className="growth-exp-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="growth-exp-card-header">
                  <h4 className="growth-exp-name">
                    <PiFunnelBold style={{ marginRight: 8, verticalAlign: -2, color: 'var(--af-patina)' }} />
                    Funnel Analysis
                  </h4>
                </div>
                <p className="growth-exp-hypothesis">
                  Define custom funnels, visualize drop-off, and compare performance over time.
                </p>
              </Link>

              <Link href="/admin/intel" className="growth-exp-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="growth-exp-card-header">
                  <h4 className="growth-exp-name">
                    <PiChartLineUpBold style={{ marginRight: 8, verticalAlign: -2, color: 'var(--af-signal-go)' }} />
                    Market Intelligence
                  </h4>
                </div>
                <p className="growth-exp-hypothesis">
                  Monitor competitors, track market trends, and get alerts on industry changes.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
