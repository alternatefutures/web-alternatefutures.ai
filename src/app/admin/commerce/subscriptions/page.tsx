'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchAllSubscriptions,
  updateSubscription,
  computeChurnMetrics,
  formatMrr,
  SUBSCRIPTION_STATUS_STYLES,
  PLANS,
  type Subscription,
  type SubscriptionStatus,
  type PlanTier,
  type BillingCycle,
} from '@/lib/subscription-api'
import { getCookieValue } from '@/lib/cookies'
import '../commerce.css'

const STATUS_OPTIONS: SubscriptionStatus[] = ['active', 'trialing', 'past_due', 'cancelled', 'paused']

const STATUS_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  active: ['paused', 'cancelled'],
  trialing: ['active', 'cancelled'],
  past_due: ['active', 'cancelled'],
  cancelled: [],
  paused: ['active', 'cancelled'],
}

const TIER_LABELS: Record<PlanTier, string> = {
  starter: 'Starter',
  builder: 'Builder',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | ''>('')
  const [tierFilter, setTierFilter] = useState<PlanTier | ''>('')
  const [cycleFilter, setCycleFilter] = useState<BillingCycle | ''>('')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllSubscriptions(token)
      setSubscriptions(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = [...subscriptions].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.customerName.toLowerCase().includes(q) ||
          s.customerEmail.toLowerCase().includes(q) ||
          s.planName.toLowerCase().includes(q),
      )
    }
    if (statusFilter) {
      result = result.filter((s) => s.status === statusFilter)
    }
    if (tierFilter) {
      result = result.filter((s) => s.planTier === tierFilter)
    }
    if (cycleFilter) {
      result = result.filter((s) => s.billingCycle === cycleFilter)
    }
    return result
  }, [subscriptions, search, statusFilter, tierFilter, cycleFilter])

  const metrics = useMemo(() => computeChurnMetrics(subscriptions), [subscriptions])

  const handleStatusChange = useCallback(async (subId: string, newStatus: SubscriptionStatus) => {
    const token = getCookieValue('af_access_token')
    const updated = await updateSubscription(token, subId, { status: newStatus })
    setSubscriptions((prev) => prev.map((s) => (s.id === subId ? updated : s)))
  }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const s of subscriptions) c[s.status] = (c[s.status] || 0) + 1
    return c
  }, [subscriptions])

  if (loading) {
    return (
      <div className="commerce-dashboard">
        <div className="commerce-header">
          <h1>Subscriptions</h1>
        </div>
        <div className="commerce-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="commerce-skeleton-row">
              <div className="commerce-skeleton-block w-16" />
              <div className="commerce-skeleton-block w-40" />
              <div className="commerce-skeleton-block w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="commerce-dashboard">
      <div className="commerce-header">
        <h1>Subscriptions</h1>
        <Link href="/admin/commerce" className="commerce-btn-secondary">
          &larr; Commerce Dashboard
        </Link>
      </div>

      {/* MRR & Churn summary */}
      <div className="commerce-revenue-row">
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Monthly Recurring Revenue</div>
          <div className="commerce-revenue-value">{formatMrr(metrics.mrrCurrent)}</div>
          <div className="commerce-revenue-sub">+{metrics.mrrGrowth}% vs last month</div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Active Subscribers</div>
          <div className="commerce-revenue-value">{metrics.totalActive}</div>
          <div className="commerce-revenue-sub">{counts['trialing'] || 0} trialing</div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Churn Rate</div>
          <div className="commerce-revenue-value">{metrics.churnRate}%</div>
          <div className="commerce-revenue-sub">{metrics.totalChurned} cancelled total</div>
        </div>
        <div className="commerce-revenue-card">
          <div className="commerce-revenue-label">Trial Conversion</div>
          <div className="commerce-revenue-value">{metrics.trialConversionRate}%</div>
          <div className="commerce-revenue-sub">{counts['past_due'] || 0} past due</div>
        </div>
      </div>

      {/* Plan breakdown */}
      <div className="commerce-section">
        <h2>Plans</h2>
        <div className="commerce-revenue-row">
          {PLANS.map((plan) => {
            const planSubs = subscriptions.filter(
              (s) => s.planTier === plan.tier && s.status === 'active',
            ).length
            return (
              <div
                key={plan.id}
                className="commerce-revenue-card"
                style={{
                  cursor: 'pointer',
                  borderColor: tierFilter === plan.tier ? 'var(--af-ultra)' : undefined,
                }}
                onClick={() => setTierFilter(tierFilter === plan.tier ? '' : plan.tier)}
              >
                <div className="commerce-revenue-label">{plan.name}</div>
                <div className="commerce-revenue-value">{planSubs}</div>
                <div className="commerce-revenue-sub">
                  {formatMrr(plan.priceMonthly)}/mo &middot; {formatMrr(plan.priceAnnual)}/yr
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="commerce-filters">
        <input
          type="text"
          className="commerce-search"
          placeholder="Search by name, email, plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="commerce-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SubscriptionStatus | '')}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{SUBSCRIPTION_STATUS_STYLES[s].label}</option>
          ))}
        </select>
        <select
          className="commerce-select"
          value={cycleFilter}
          onChange={(e) => setCycleFilter(e.target.value as BillingCycle | '')}
        >
          <option value="">All Cycles</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </div>

      {/* Status chips row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            className={`commerce-status-chip ${s === statusFilter ? s : ''}`}
            style={{
              cursor: 'pointer',
              background: s === statusFilter ? SUBSCRIPTION_STATUS_STYLES[s].bg : undefined,
              color: s === statusFilter ? SUBSCRIPTION_STATUS_STYLES[s].color : 'var(--af-stone-500)',
              borderColor: s === statusFilter ? SUBSCRIPTION_STATUS_STYLES[s].color : 'var(--af-stone-300)',
            }}
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
          >
            {SUBSCRIPTION_STATUS_STYLES[s].label} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="commerce-empty">No subscriptions match your filters.</div>
      ) : (
        <div className="commerce-table-wrap">
          <table className="commerce-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Cycle</th>
                <th>MRR</th>
                <th>Status</th>
                <th>Period End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => {
                const transitions = STATUS_TRANSITIONS[sub.status]
                return (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--af-stone-800)' }}>{sub.customerName}</div>
                      <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: '11px', color: 'var(--af-stone-400)' }}>
                        {sub.customerEmail}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--af-stone-800)' }}>{TIER_LABELS[sub.planTier]}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--af-font-machine)', fontSize: '12px', color: 'var(--af-stone-600)', textTransform: 'capitalize' }}>
                      {sub.billingCycle}
                    </td>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap', color: sub.mrr > 0 ? 'var(--af-terra)' : 'var(--af-stone-400)' }}>
                      {formatMrr(sub.mrr, sub.currency)}
                    </td>
                    <td>
                      <span className={`commerce-status-chip ${sub.status}`}>
                        {SUBSCRIPTION_STATUS_STYLES[sub.status].label}
                      </span>
                      {sub.cancelAtPeriodEnd && sub.status !== 'cancelled' && (
                        <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: '10px', color: 'var(--af-signal-stop)', marginTop: 2 }}>
                          Cancels at period end
                        </div>
                      )}
                      {sub.trialEnd && sub.status === 'trialing' && (
                        <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: '10px', color: 'var(--af-stone-400)', marginTop: 2 }}>
                          Trial ends {new Date(sub.trialEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--af-font-machine)', fontSize: '12px', color: 'var(--af-stone-400)', whiteSpace: 'nowrap' }}>
                      {new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {transitions.map((next) => (
                          <button
                            key={next}
                            className={`commerce-btn-secondary commerce-btn-sm ${next === 'cancelled' ? 'commerce-btn-danger' : ''}`}
                            onClick={() => handleStatusChange(sub.id, next)}
                          >
                            {SUBSCRIPTION_STATUS_STYLES[next].label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
