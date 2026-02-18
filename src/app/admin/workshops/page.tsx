'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { PiPlusBold, PiCertificateBold } from 'react-icons/pi'
import {
  fetchWorkshops,
  fetchWorkshopAnalytics,
  formatPrice,
  formatDuration,
  type Workshop,
  type WorkshopAnalytics,
} from '@/lib/workshop-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import './workshops.module.css'

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [analytics, setAnalytics] = useState<WorkshopAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [formatFilter, setFormatFilter] = useState('ALL')
  const [levelFilter, setLevelFilter] = useState('ALL')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [ws, stats] = await Promise.all([
          fetchWorkshops(token),
          fetchWorkshopAnalytics(token),
        ])
        setWorkshops(ws)
        setAnalytics(stats)
      } catch {
        setLoadError('Failed to load workshops. Please refresh to try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = workshops
    if (statusFilter !== 'ALL') {
      result = result.filter((w) => w.status === statusFilter)
    }
    if (formatFilter !== 'ALL') {
      result = result.filter((w) => w.format === formatFilter)
    }
    if (levelFilter !== 'ALL') {
      result = result.filter((w) => w.level === levelFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    return result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }, [workshops, statusFilter, formatFilter, levelFilter, search])

  if (loading) {
    return (
      <div className="ws-skeleton">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="ws-skeleton-card" />
        ))}
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="ws-admin-empty">
        <h2>Error</h2>
        <p>{loadError}</p>
        <button onClick={() => window.location.reload()} className="ws-btn-secondary">
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="ws-admin-header">
        <h1>Workshops</h1>
        <div className="ws-admin-header-actions">
          <Link href="/admin/workshops/certificates" className="ws-btn-secondary">
            <PiCertificateBold /> Certificates
          </Link>
          <Link href="/admin/workshops/new" className="ws-btn-primary">
            <PiPlusBold /> New Workshop
          </Link>
        </div>
      </div>

      {analytics && (
        <div className="ws-admin-stats">
          <div className="ws-stat-card">
            <div className="ws-stat-label">Total Workshops</div>
            <div className="ws-stat-value">{analytics.totalWorkshops}</div>
          </div>
          <div className="ws-stat-card">
            <div className="ws-stat-label">Enrollments</div>
            <div className="ws-stat-value">{analytics.totalEnrollments}</div>
          </div>
          <div className="ws-stat-card">
            <div className="ws-stat-label">Revenue</div>
            <div className="ws-stat-value terra">{formatPrice(analytics.totalRevenue)}</div>
          </div>
          <div className="ws-stat-card">
            <div className="ws-stat-label">Avg Completion</div>
            <div className="ws-stat-value patina">{analytics.avgCompletionRate}%</div>
          </div>
          <div className="ws-stat-card">
            <div className="ws-stat-label">Satisfaction</div>
            <div className="ws-stat-value">{analytics.avgSatisfactionScore}/5</div>
          </div>
          <div className="ws-stat-card">
            <div className="ws-stat-label">Certificates</div>
            <div className="ws-stat-value">{analytics.certificatesIssued}</div>
          </div>
        </div>
      )}

      <WaveDivider variant="apricot" />

      <div className="ws-admin-filters">
        <input
          type="text"
          className="ws-admin-search"
          placeholder="Search workshops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="ws-admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          className="ws-admin-select"
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
        >
          <option value="ALL">All formats</option>
          <option value="ONLINE">Online</option>
          <option value="IN_PERSON">In Person</option>
          <option value="HYBRID">Hybrid</option>
        </select>
        <select
          className="ws-admin-select"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="ALL">All levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="ws-admin-empty">
          <h2>{workshops.length === 0 ? 'No workshops yet' : 'No workshops found'}</h2>
          <p>
            {workshops.length === 0
              ? 'Create your first workshop to get started.'
              : 'Try adjusting your search or filters.'}
          </p>
          {workshops.length === 0 && (
            <Link href="/admin/workshops/new" className="ws-btn-primary">
              <PiPlusBold /> Create Workshop
            </Link>
          )}
        </div>
      ) : (
        <div className="ws-card-list">
          {filtered.map((ws) => (
            <Link
              key={ws.id}
              href={`/admin/workshops/${ws.id}`}
              className={`ws-card ${ws.status.toLowerCase()}`}
            >
              <div className="ws-card-body">
                <div className="ws-card-title">{ws.title}</div>
                <div className="ws-card-desc">{ws.shortDescription}</div>
                <div className="ws-card-meta">
                  <span className={`ws-chip status-${ws.status.toLowerCase()}`}>
                    {ws.status}
                  </span>
                  <span className={`ws-chip level-${ws.level.toLowerCase()}`}>
                    {ws.level}
                  </span>
                  <span className={`ws-chip format-${ws.format.toLowerCase()}`}>
                    {ws.format.replace('_', ' ')}
                  </span>
                  <span className="ws-card-meta-item">
                    {formatDuration(ws.duration)}
                  </span>
                </div>
                {ws.tags.length > 0 && (
                  <div className="ws-tags">
                    {ws.tags.slice(0, 5).map((tag) => (
                      <span key={tag} className="ws-tag">{tag}</span>
                    ))}
                    {ws.tags.length > 5 && (
                      <span className="ws-tag">+{ws.tags.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="ws-card-stats">
                <div className="ws-card-price">{formatPrice(ws.price, ws.currency)}</div>
                <div className="ws-card-enrollment">
                  {ws.enrolledCount}/{ws.capacity} enrolled
                </div>
                {ws.waitlistCount > 0 && (
                  <div className="ws-card-enrollment">
                    +{ws.waitlistCount} waitlisted
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
