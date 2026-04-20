'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PiLinkBold,
  PiCopyBold,
  PiUsersBold,
  PiCurrencyDollarBold,
  PiChartLineUpBold,
  PiTrophyBold,
} from 'react-icons/pi'
import {
  fetchReferrals,
  fetchReferralStats,
  generateReferralLink,
  type Referral,
  type ReferralStats,
  REFERRAL_STATUS_STYLES,
  DEFAULT_REWARD_TIERS,
} from '@/lib/growth-api'
import '../growth-admin.css'

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailInput, setEmailInput] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [r, s] = await Promise.all([fetchReferrals(), fetchReferralStats()])
      setReferrals(r)
      setStats(s)
      setLoading(false)
    }
    load()
  }, [])

  function showToastMsg(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleGenerate() {
    if (!emailInput) return
    const link = await generateReferralLink(emailInput)
    setGeneratedLink(link)
    showToastMsg('Referral link generated')
  }

  async function handleCopyLink() {
    if (!generatedLink) return
    await navigator.clipboard.writeText(generatedLink)
    showToastMsg('Link copied to clipboard')
  }

  return (
    <>
      <div className="growth-header">
        <h1>Referral Program</h1>
      </div>

      <div className="growth-subnav">
        <Link href="/admin/growth">Overview</Link>
        <Link href="/admin/growth/experiments">Experiments</Link>
        <Link href="/admin/growth/referrals" className="active">Referrals</Link>
        <Link href="/admin/growth/funnels">Funnels</Link>
        <Link href="/admin/growth/analytics">Analytics</Link>
        <Link href="/admin/growth/automation">Automation</Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="growth-stats">
          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiUsersBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">{stats.totalReferrals}</div>
              <div className="growth-stat-label">Total Referrals</div>
            </div>
          </div>
          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiChartLineUpBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">{stats.conversionRate}%</div>
              <div className="growth-stat-label">Conversion Rate</div>
            </div>
          </div>
          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiCurrencyDollarBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">${stats.totalRewards}</div>
              <div className="growth-stat-label">Total Rewards</div>
            </div>
          </div>
          <div className="growth-stat-card">
            <div className="growth-stat-icon"><PiTrophyBold /></div>
            <div className="growth-stat-info">
              <div className="growth-stat-value">{stats.activeReferrers}</div>
              <div className="growth-stat-label">Active Referrers</div>
            </div>
          </div>
        </div>
      )}

      {/* Referral Link Generator */}
      <div className="growth-section" style={{ marginBottom: 20 }}>
        <div className="growth-section-header">
          <h3 className="growth-section-title">
            <PiLinkBold style={{ marginRight: 6, verticalAlign: -2 }} />
            Generate Referral Link
          </h3>
        </div>
        <div className="growth-section-body">
          <div className="growth-ref-generator">
            <input
              className="growth-ref-input"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="referrer@email.com"
              type="email"
            />
            <button className="growth-btn growth-btn--primary" onClick={handleGenerate}>
              Generate Link
            </button>
          </div>
          {generatedLink && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="growth-ref-input"
                value={generatedLink}
                readOnly
                style={{ fontFamily: 'var(--af-font-machine)', fontSize: 13 }}
              />
              <button className="growth-btn" onClick={handleCopyLink}>
                <PiCopyBold /> Copy
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="growth-grid">
        {/* Referral Tracking Table */}
        <div className="growth-section" style={{ gridColumn: '1 / -1' }}>
          <div className="growth-section-header">
            <h3 className="growth-section-title">Referral Tracking</h3>
          </div>
          <div className="growth-section-body" style={{ overflowX: 'auto' }}>
            <table className="growth-referral-table">
              <thead>
                <tr>
                  <th>Referrer</th>
                  <th>Referee</th>
                  <th>Status</th>
                  <th>Code</th>
                  <th>Reward</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => {
                  const status = REFERRAL_STATUS_STYLES[ref.status]
                  return (
                    <tr key={ref.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ref.referrerName}</div>
                        <div style={{ fontSize: 11, color: 'var(--af-stone-400)' }}>{ref.referrerEmail}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{ref.refereeName}</div>
                        <div style={{ fontSize: 11, color: 'var(--af-stone-400)' }}>{ref.refereeEmail}</div>
                      </td>
                      <td>
                        <span
                          className="growth-badge"
                          style={{ background: status.bg, color: status.color }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12 }}>
                          {ref.referralCode}
                        </span>
                      </td>
                      <td>{ref.reward || '—'}</td>
                      <td style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12, color: 'var(--af-stone-400)' }}>
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Referrers */}
        <div className="growth-section">
          <div className="growth-section-header">
            <h3 className="growth-section-title">
              <PiTrophyBold style={{ marginRight: 6, verticalAlign: -2 }} />
              Top Referrers
            </h3>
          </div>
          <div className="growth-section-body">
            {stats?.topReferrers.map((ref, i) => (
              <div key={ref.email} className="growth-top-referrer">
                <span className="growth-top-referrer-rank">#{i + 1}</span>
                <div className="growth-top-referrer-info">
                  <div className="growth-top-referrer-name">{ref.name}</div>
                  <div className="growth-top-referrer-count">{ref.count} referrals</div>
                </div>
                <span className="growth-top-referrer-earned">{ref.earned}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reward Tiers */}
        <div className="growth-section">
          <div className="growth-section-header">
            <h3 className="growth-section-title">Reward Tiers</h3>
          </div>
          <div className="growth-section-body">
            <div className="growth-tier-cards">
              {DEFAULT_REWARD_TIERS.map((tier) => (
                <div key={tier.id} className="growth-tier-card" style={{ borderTop: `3px solid ${tier.color}` }}>
                  <h4 className="growth-tier-name" style={{ color: tier.color }}>{tier.name}</h4>
                  <p className="growth-tier-req">{tier.minReferrals}+ referrals</p>
                  <p className="growth-tier-reward">{tier.reward}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="growth-toast">{toast}</div>}
    </>
  )
}
