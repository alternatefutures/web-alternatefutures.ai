'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { PiArrowLeftBold } from 'react-icons/pi'
import {
  fetchCertificates,
  fetchWorkshops,
  type Certificate,
  type Workshop,
} from '@/lib/workshop-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import '../workshops.module.css'

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [workshopFilter, setWorkshopFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [certs, ws] = await Promise.all([
          fetchCertificates(token),
          fetchWorkshops(token),
        ])
        setCertificates(certs)
        setWorkshops(ws)
      } catch {
        setLoadError('Failed to load certificates.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = certificates
    if (workshopFilter !== 'ALL') {
      result = result.filter((c) => c.workshopId === workshopFilter)
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.recipientName.toLowerCase().includes(q) ||
          c.recipientEmail.toLowerCase().includes(q) ||
          c.certificateId.toLowerCase().includes(q) ||
          c.courseTitle.toLowerCase().includes(q),
      )
    }
    return result.sort(
      (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
    )
  }, [certificates, workshopFilter, statusFilter, search])

  const stats = useMemo(
    () => ({
      total: certificates.length,
      issued: certificates.filter((c) => c.status === 'ISSUED').length,
      revoked: certificates.filter((c) => c.status === 'REVOKED').length,
      templates: [...new Set(certificates.map((c) => c.templateName))].length,
    }),
    [certificates],
  )

  if (loading) {
    return (
      <div className="ws-skeleton">
        {[1, 2, 3].map((i) => (
          <div key={i} className="ws-skeleton-card" />
        ))}
      </div>
    )
  }

  if (loadError && certificates.length === 0) {
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
      <Link href="/admin/workshops" className="ws-back-link">
        <PiArrowLeftBold /> Back to Workshops
      </Link>

      <div className="ws-admin-header">
        <h1>Certificates</h1>
      </div>

      <div className="ws-admin-stats">
        <div className="ws-stat-card">
          <div className="ws-stat-label">Total Issued</div>
          <div className="ws-stat-value">{stats.total}</div>
        </div>
        <div className="ws-stat-card">
          <div className="ws-stat-label">Active</div>
          <div className="ws-stat-value patina">{stats.issued}</div>
        </div>
        <div className="ws-stat-card">
          <div className="ws-stat-label">Revoked</div>
          <div className="ws-stat-value" style={{ color: 'var(--af-signal-stop, #D83B3B)' }}>
            {stats.revoked}
          </div>
        </div>
        <div className="ws-stat-card">
          <div className="ws-stat-label">Templates</div>
          <div className="ws-stat-value">{stats.templates}</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <div className="ws-admin-filters">
        <input
          type="text"
          className="ws-admin-search"
          placeholder="Search certificates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="ws-admin-select"
          value={workshopFilter}
          onChange={(e) => setWorkshopFilter(e.target.value)}
        >
          <option value="ALL">All workshops</option>
          {workshops.map((ws) => (
            <option key={ws.id} value={ws.id}>{ws.title}</option>
          ))}
        </select>
        <select
          className="ws-admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="ISSUED">Issued</option>
          <option value="REVOKED">Revoked</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="ws-admin-empty">
          <h2>{certificates.length === 0 ? 'No certificates issued yet' : 'No certificates found'}</h2>
          <p>
            {certificates.length === 0
              ? 'Certificates are issued when participants complete a workshop.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="ws-cert-grid">
          {filtered.map((cert) => (
            <div key={cert.id} className="ws-cert-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="ws-cert-id">{cert.certificateId}</div>
                <span className={`ws-chip cert-${cert.status.toLowerCase()}`}>
                  {cert.status}
                </span>
              </div>
              <div className="ws-cert-recipient">{cert.recipientName}</div>
              <div className="ws-cert-course">{cert.courseTitle}</div>
              <div className="ws-cert-meta">
                <span>Template: {cert.templateName}</span>
                <span>Completed: {new Date(cert.completionDate).toLocaleDateString()}</span>
                <span>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-gray)' }}>
                {cert.recipientEmail}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
