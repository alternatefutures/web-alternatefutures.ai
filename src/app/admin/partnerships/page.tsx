'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchPartners,
  fetchPipeline,
  PIPELINE_STAGE_COLORS,
  PIPELINE_STAGE_LABELS,
  type Partner,
  type PipelineEntry,
} from '@/lib/partner-api'
import './partnerships.module.css'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export default function PartnershipsDashboardPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [pipeline, setPipeline] = useState<PipelineEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [p, pipe] = await Promise.all([
        fetchPartners(),
        fetchPipeline(),
      ])
      setPartners(p)
      setPipeline(pipe)
      setLoading(false)
    }
    load()
  }, [])

  const activePartners = useMemo(
    () => partners.filter((p) => p.status === 'active'),
    [partners],
  )

  const avgHealth = useMemo(() => {
    if (activePartners.length === 0) return 0
    return Math.round(
      activePartners.reduce((s, p) => s + p.healthScore, 0) / activePartners.length,
    )
  }, [activePartners])

  const pipelineCount = useMemo(
    () => pipeline.filter((e) => e.stage !== 'active' && e.stage !== 'churned').length,
    [pipeline],
  )

  const recentActivity = useMemo(() => {
    const items: { text: string; time: string; color: string }[] = []
    for (const entry of pipeline.slice(0, 6)) {
      items.push({
        text: `${entry.partnerName} — ${entry.nextAction}`,
        time: entry.updatedAt,
        color: PIPELINE_STAGE_COLORS[entry.stage],
      })
    }
    return items
  }, [pipeline])

  if (loading) {
    return (
      <div className="partnerships-dashboard">
        <div className="partnerships-header">
          <h1>Partnerships</h1>
        </div>
        <div className="partnerships-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="partnerships-skeleton-row">
              <div className="partnerships-skeleton-block w-40" />
              <div className="partnerships-skeleton-block w-20" />
              <div className="partnerships-skeleton-block w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="partnerships-dashboard">
      <div className="partnerships-header">
        <h1>Partnerships</h1>
        <div className="partnerships-header-actions">
          <Link href="/admin/partnerships/grants/new" className="partnerships-btn-primary">
            + New Application
          </Link>
          <Link href="/admin/partnerships/grants" className="partnerships-btn-secondary">
            Track Grants
          </Link>
          <Link href="/admin/partnerships/partners" className="partnerships-btn-secondary">
            Partner Directory
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="partnerships-stats-row">
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">Active Partners</div>
          <div className="partnerships-stat-value">{activePartners.length}</div>
          <div className="partnerships-stat-sub">{partners.length} total in directory</div>
        </div>
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">Avg Health Score</div>
          <div className="partnerships-stat-value">{avgHealth}</div>
          <div className="partnerships-stat-sub">across active partners</div>
        </div>
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">Pipeline</div>
          <div className="partnerships-stat-value">{pipelineCount}</div>
          <div className="partnerships-stat-sub">deals in progress</div>
        </div>
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">Prospects</div>
          <div className="partnerships-stat-value">
            {partners.filter((p) => p.status === 'prospect').length}
          </div>
          <div className="partnerships-stat-sub">awaiting outreach</div>
        </div>
      </div>

      <div className="partnerships-section-grid">
        {/* Recent Activity */}
        <div className="partnerships-section">
          <h2>Recent Activity</h2>
          {recentActivity.map((item, i) => (
            <div key={i} className="partnerships-activity-item">
              <div
                className="partnerships-activity-dot"
                style={{ background: item.color }}
              />
              <div className="partnerships-activity-content">
                <div className="partnerships-activity-text">{item.text}</div>
                <div className="partnerships-activity-time">{timeAgo(item.time)}</div>
              </div>
            </div>
          ))}
          <div style={{ paddingTop: 'var(--af-space-palm)' }}>
            <Link href="/admin/partnerships/partners" className="partnerships-back-link">
              View all partners &rarr;
            </Link>
          </div>
        </div>

        {/* Quick Actions + Top Partners */}
        <div className="partnerships-section">
          <h2>Top Partners by Health</h2>
          {activePartners.slice(0, 5).map((partner) => (
            <div key={partner.id} className="partnerships-activity-item">
              <img
                src={partner.logo}
                alt=""
                className="partnerships-partner-logo"
                style={{ width: 28, height: 28, marginTop: 2 }}
              />
              <div className="partnerships-activity-content">
                <div className="partnerships-activity-text">
                  <strong>{partner.name}</strong>
                  {' — '}
                  <span style={{ color: 'var(--af-stone-500)' }}>{partner.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <div className="partnerships-health-bar" style={{ maxWidth: 120 }}>
                    <div
                      className="partnerships-health-fill"
                      style={{
                        width: `${partner.healthScore}%`,
                        background: partner.healthScore >= 80 ? '#10B981' : partner.healthScore >= 50 ? '#F59E0B' : '#EF4444',
                      }}
                    />
                  </div>
                  <span
                    className="partnerships-health-score"
                    style={{
                      color: partner.healthScore >= 80 ? '#10B981' : partner.healthScore >= 50 ? '#F59E0B' : '#EF4444',
                    }}
                  >
                    {partner.healthScore}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ paddingTop: 'var(--af-space-palm)' }}>
            <Link href="/admin/partnerships/roi" className="partnerships-back-link">
              View ROI analysis &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="partnerships-section">
        <h2>Quick Actions</h2>
        <div className="partnerships-quick-actions">
          <Link href="/admin/partnerships/grants/new" className="partnerships-btn-secondary partnerships-btn-sm">
            + New Grant Application
          </Link>
          <Link href="/admin/partnerships/grants" className="partnerships-btn-secondary partnerships-btn-sm">
            Grant Tracker
          </Link>
          <Link href="/admin/partnerships/partners" className="partnerships-btn-secondary partnerships-btn-sm">
            Add Partner
          </Link>
          <Link href="/admin/partnerships/roi" className="partnerships-btn-secondary partnerships-btn-sm">
            ROI Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
