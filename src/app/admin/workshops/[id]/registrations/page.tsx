'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PiArrowLeftBold, PiDownloadSimpleBold } from 'react-icons/pi'
import {
  fetchWorkshopById,
  fetchRegistrations,
  updateRegistration,
  formatPrice,
  type Workshop,
  type Registration,
  type RegistrationStatus,
} from '@/lib/workshop-api'
import { getCookieValue } from '@/lib/cookies'
import '../../workshops.css'

const STATUS_OPTIONS: { value: RegistrationStatus; label: string }[] = [
  { value: 'REGISTERED', label: 'Registered' },
  { value: 'WAITLISTED', label: 'Waitlisted' },
  { value: 'ATTENDED', label: 'Attended' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'NO_SHOW', label: 'No Show' },
]

export default function RegistrationsPage() {
  const params = useParams<{ id: string }>()
  const workshopId = params.id

  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [ws, regs] = await Promise.all([
          fetchWorkshopById(token, workshopId),
          fetchRegistrations(token, workshopId),
        ])
        setWorkshop(ws)
        setRegistrations(regs)
      } catch {
        setLoadError('Failed to load registrations.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [workshopId])

  const filtered = useMemo(() => {
    let result = registrations
    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q),
      )
    }
    return result.sort(
      (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime(),
    )
  }, [registrations, statusFilter, search])

  const stats = useMemo(
    () => ({
      total: registrations.length,
      registered: registrations.filter((r) => r.status === 'REGISTERED').length,
      waitlisted: registrations.filter((r) => r.status === 'WAITLISTED').length,
      attended: registrations.filter((r) => r.status === 'ATTENDED').length,
      cancelled: registrations.filter((r) => r.status === 'CANCELLED' || r.status === 'REFUNDED').length,
      revenue: registrations
        .filter((r) => r.status !== 'REFUNDED')
        .reduce((sum, r) => sum + r.amountPaid - r.refundAmount, 0),
    }),
    [registrations],
  )

  const handleStatusChange = useCallback(
    async (regId: string, newStatus: RegistrationStatus) => {
      try {
        const token = getCookieValue('af_access_token')
        const updated = await updateRegistration(token, regId, { status: newStatus })
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? updated : r)),
        )
      } catch {
        setLoadError('Failed to update registration status.')
      }
    },
    [],
  )

  const handleCheckIn = useCallback(
    async (regId: string) => {
      try {
        const token = getCookieValue('af_access_token')
        const updated = await updateRegistration(token, regId, {
          attendanceCheckedIn: true,
          status: 'ATTENDED',
        })
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? updated : r)),
        )
      } catch {
        setLoadError('Failed to check in.')
      }
    },
    [],
  )

  const handleExport = useCallback(() => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Paid', 'Completion %', 'Feedback', 'Registered At']
    const rows = filtered.map((r) => [
      r.name,
      r.email,
      r.phone || '',
      r.status,
      (r.amountPaid / 100).toFixed(2),
      String(r.completionPercentage),
      r.feedbackScore ? `${r.feedbackScore}/5` : '',
      r.registeredAt,
    ])
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registrations-${workshopId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered, workshopId])

  if (loading) {
    return (
      <div className="ws-skeleton">
        <div className="ws-skeleton-card" style={{ height: 60 }} />
        <div className="ws-skeleton-card" style={{ height: 300 }} />
      </div>
    )
  }

  if (loadError && !workshop) {
    return (
      <div className="ws-admin-empty">
        <h2>Error</h2>
        <p>{loadError}</p>
        <Link href="/admin/workshops" className="ws-btn-secondary">Back to Workshops</Link>
      </div>
    )
  }

  return (
    <>
      <Link href={`/admin/workshops/${workshopId}`} className="ws-back-link">
        <PiArrowLeftBold /> Back to {workshop?.title || 'Workshop'}
      </Link>

      <div className="ws-admin-header">
        <h1>Registrations</h1>
        <div className="ws-admin-header-actions">
          <button className="ws-btn-secondary" onClick={handleExport}>
            <PiDownloadSimpleBold /> Export CSV
          </button>
        </div>
      </div>

      {loadError && (
        <div
          style={{
            padding: '12px 16px',
            background: '#FEE2E2',
            border: '2px solid #FECACA',
            borderRadius: '8px 12px 10px 6px',
            color: '#991B1B',
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          {loadError}
        </div>
      )}

      <div className="ws-admin-stats">
        <div className="ws-stat-card">
          <div className="ws-stat-label">Total</div>
          <div className="ws-stat-value">{stats.total}</div>
        </div>
        <div className="ws-stat-card">
          <div className="ws-stat-label">Registered</div>
          <div className="ws-stat-value">{stats.registered}</div>
        </div>
        <div className="ws-stat-card">
          <div className="ws-stat-label">Waitlisted</div>
          <div className="ws-stat-value">{stats.waitlisted}</div>
        </div>
        <div className="ws-stat-card">
          <div className="ws-stat-label">Attended</div>
          <div className="ws-stat-value patina">{stats.attended}</div>
        </div>
        <div className="ws-stat-card">
          <div className="ws-stat-label">Revenue</div>
          <div className="ws-stat-value terra">{formatPrice(stats.revenue)}</div>
        </div>
      </div>

      <div className="ws-admin-filters">
        <input
          type="text"
          className="ws-admin-search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="ws-admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="ws-admin-empty">
          <h2>No registrations found</h2>
          <p>
            {registrations.length === 0
              ? 'No one has registered for this workshop yet.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="ws-section" style={{ padding: 0, overflow: 'auto' }}>
          <table className="ws-reg-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Checked In</th>
                <th>Completion</th>
                <th>Feedback</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg.id}>
                  <td style={{ fontWeight: 600 }}>{reg.name}</td>
                  <td style={{ fontSize: 13 }}>{reg.email}</td>
                  <td>
                    <span className={`ws-chip reg-${reg.status.toLowerCase()}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td>{formatPrice(reg.amountPaid)}</td>
                  <td>
                    {reg.attendanceCheckedIn ? (
                      <span style={{ color: 'var(--af-patina, #6B8F71)', fontWeight: 600 }}>Yes</span>
                    ) : (
                      <button className="ws-btn-small" onClick={() => handleCheckIn(reg.id)}>
                        Check In
                      </button>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="ws-progress-bar">
                        <div className="ws-progress-fill" style={{ width: `${reg.completionPercentage}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--color-text-gray)' }}>
                        {reg.completionPercentage}%
                      </span>
                    </div>
                  </td>
                  <td>
                    {reg.feedbackScore ? (
                      <span title={reg.feedbackComment || ''}>
                        {reg.feedbackScore}/5
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-gray)' }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-gray)' }}>
                    {new Date(reg.registeredAt).toLocaleDateString()}
                  </td>
                  <td>
                    <select
                      className="ws-form-select"
                      style={{ fontSize: 12, padding: '4px 8px' }}
                      value={reg.status}
                      onChange={(e) => handleStatusChange(reg.id, e.target.value as RegistrationStatus)}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
