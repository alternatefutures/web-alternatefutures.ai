'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchPartners,
  type Partner,
} from '@/lib/partner-api'
import '../partnerships.css'

interface PartnerROI {
  partner: Partner
  revenue: number
  cost: number
  roi: number
  healthScore: number
  recommendation: 'renew' | 'review' | 'at-risk'
}

function computeROI(partner: Partner): PartnerROI {
  // Simulated ROI data based on partner health score and tier
  const baseCost = partner.tier === 'ecosystem' ? 5000 : partner.tier === 'technology' ? 3000 : 1500
  const baseRevenue = Math.round(baseCost * (partner.healthScore / 50) * (1 + Math.random() * 0.5))
  const cost = baseCost + Math.round(Math.random() * 2000)
  const revenue = baseRevenue
  const roi = cost > 0 ? Math.round(((revenue - cost) / cost) * 100) : 0

  let recommendation: 'renew' | 'review' | 'at-risk' = 'renew'
  if (partner.healthScore < 50 || roi < 0) recommendation = 'at-risk'
  else if (partner.healthScore < 70 || roi < 50) recommendation = 'review'

  return {
    partner,
    revenue,
    cost,
    roi,
    healthScore: partner.healthScore,
    recommendation,
  }
}

export default function PartnershipROIPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await fetchPartners({ status: 'active' })
      setPartners(data)
      setLoading(false)
    }
    load()
  }, [])

  const roiData = useMemo(
    () => partners.map(computeROI).sort((a, b) => b.roi - a.roi),
    [partners],
  )

  const totalRevenue = useMemo(
    () => roiData.reduce((s, r) => s + r.revenue, 0),
    [roiData],
  )

  const totalCost = useMemo(
    () => roiData.reduce((s, r) => s + r.cost, 0),
    [roiData],
  )

  const avgROI = useMemo(() => {
    if (roiData.length === 0) return 0
    return Math.round(roiData.reduce((s, r) => s + r.roi, 0) / roiData.length)
  }, [roiData])

  const renewCount = useMemo(
    () => roiData.filter((r) => r.recommendation === 'renew').length,
    [roiData],
  )

  if (loading) {
    return (
      <div className="partnerships-dashboard">
        <div className="partnerships-header">
          <h1>Partnership ROI</h1>
        </div>
        <div className="partnerships-skeleton">
          {[1, 2, 3].map((i) => (
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
        <h1>Partnership ROI</h1>
        <div className="partnerships-header-actions">
          <Link href="/admin/partnerships" className="partnerships-btn-secondary">
            &larr; Dashboard
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="partnerships-stats-row">
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">Total Revenue</div>
          <div className="partnerships-stat-value">${totalRevenue.toLocaleString()}</div>
          <div className="partnerships-stat-sub">attributed to partners</div>
        </div>
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">Total Cost</div>
          <div className="partnerships-stat-value">${totalCost.toLocaleString()}</div>
          <div className="partnerships-stat-sub">partnership investment</div>
        </div>
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">Avg ROI</div>
          <div className="partnerships-stat-value">{avgROI}%</div>
          <div className="partnerships-stat-sub">across active partners</div>
        </div>
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">Renew Ready</div>
          <div className="partnerships-stat-value">{renewCount}/{roiData.length}</div>
          <div className="partnerships-stat-sub">recommended for renewal</div>
        </div>
      </div>

      {/* ROI Cards */}
      <div className="partnerships-roi-grid">
        {roiData.map((item) => (
          <div key={item.partner.id} className="partnerships-roi-card">
            <div className="partnerships-roi-card-header">
              <img
                src={item.partner.logo}
                alt=""
                className="partnerships-roi-card-logo"
              />
              <div>
                <div className="partnerships-roi-card-name">{item.partner.name}</div>
                <span className={`partnerships-tier-chip ${item.partner.tier}`} style={{ marginTop: 2 }}>
                  {item.partner.tier}
                </span>
              </div>
            </div>

            <div className="partnerships-roi-metrics">
              <div className="partnerships-roi-metric">
                <div className="partnerships-roi-metric-value">${item.revenue.toLocaleString()}</div>
                <div className="partnerships-roi-metric-label">Revenue</div>
              </div>
              <div className="partnerships-roi-metric">
                <div className="partnerships-roi-metric-value">${item.cost.toLocaleString()}</div>
                <div className="partnerships-roi-metric-label">Cost</div>
              </div>
              <div className="partnerships-roi-metric">
                <div className="partnerships-roi-metric-value" style={{
                  color: item.roi >= 100 ? '#10B981' : item.roi >= 0 ? '#F59E0B' : '#EF4444',
                }}>
                  {item.roi}%
                </div>
                <div className="partnerships-roi-metric-label">ROI</div>
              </div>
              <div className="partnerships-roi-metric">
                <div className="partnerships-roi-metric-value" style={{
                  color: item.healthScore >= 80 ? '#10B981' : item.healthScore >= 50 ? '#F59E0B' : '#EF4444',
                }}>
                  {item.healthScore}
                </div>
                <div className="partnerships-roi-metric-label">Health</div>
              </div>
            </div>

            <div className={`partnerships-roi-recommendation ${item.recommendation}`}>
              {item.recommendation === 'renew' && 'Recommended for renewal'}
              {item.recommendation === 'review' && 'Needs review before renewal'}
              {item.recommendation === 'at-risk' && 'At risk — reassess partnership'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
