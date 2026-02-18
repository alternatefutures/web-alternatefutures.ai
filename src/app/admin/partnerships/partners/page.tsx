'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchPartners,
  type Partner,
  type PartnerStatus,
  type PartnerTier,
} from '@/lib/partner-api'
import '../partnerships.module.css'

export default function PartnersDirectoryPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | ''>('')
  const [tierFilter, setTierFilter] = useState<PartnerTier | ''>('')

  useEffect(() => {
    async function load() {
      const data = await fetchPartners()
      setPartners(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = [...partners]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.contactName.toLowerCase().includes(q),
      )
    }
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter)
    }
    if (tierFilter) {
      result = result.filter((p) => p.tier === tierFilter)
    }
    return result.sort((a, b) => b.healthScore - a.healthScore)
  }, [partners, search, statusFilter, tierFilter])

  if (loading) {
    return (
      <div className="partnerships-dashboard">
        <div className="partnerships-header">
          <h1>Partner Directory</h1>
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
        <h1>Partner Directory</h1>
        <div className="partnerships-header-actions">
          <Link href="/admin/partnerships" className="partnerships-btn-secondary">
            &larr; Dashboard
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="partnerships-filters">
        <input
          type="text"
          className="partnerships-search"
          placeholder="Search partners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="partnerships-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PartnerStatus | '')}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="prospect">Prospect</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          className="partnerships-select"
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as PartnerTier | '')}
        >
          <option value="">All Tiers</option>
          <option value="ecosystem">Ecosystem</option>
          <option value="technology">Technology</option>
          <option value="community">Community</option>
        </select>
      </div>

      {/* Partner Grid */}
      {filtered.length === 0 ? (
        <div className="partnerships-empty">No partners match your filters.</div>
      ) : (
        <div className="partnerships-partner-grid">
          {filtered.map((partner) => (
            <Link
              key={partner.id}
              href={`/admin/partnerships/partners/${partner.id}`}
              className="partnerships-partner-card"
            >
              <div className="partnerships-partner-card-top">
                <img
                  src={partner.logo}
                  alt=""
                  className="partnerships-partner-logo"
                />
                <div className="partnerships-partner-info">
                  <div className="partnerships-partner-name">{partner.name}</div>
                  <div className="partnerships-partner-category">{partner.category}</div>
                </div>
                <span className={`partnerships-status-chip ${partner.status}`}>
                  {partner.status}
                </span>
              </div>

              <div className="partnerships-partner-agreement">
                {partner.agreementSummary}
              </div>

              <div className="partnerships-partner-card-footer">
                <span className={`partnerships-tier-chip ${partner.tier}`}>
                  {partner.tier}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, marginLeft: 12 }}>
                  <div className="partnerships-health-bar">
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
