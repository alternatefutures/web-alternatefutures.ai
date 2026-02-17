'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PiFunnelBold,
  PiCaretDownBold,
  PiArrowDownBold,
} from 'react-icons/pi'
import {
  fetchCustomFunnels,
  type CustomFunnel,
} from '@/lib/growth-api'
import '../growth-admin.css'

const FUNNEL_COLORS = [
  'var(--af-ultra)',
  'var(--af-patina)',
  'var(--af-terra)',
  'var(--af-signal-go)',
  'var(--af-kin-repair)',
]

export default function FunnelsPage() {
  const [funnels, setFunnels] = useState<CustomFunnel[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await fetchCustomFunnels()
      setFunnels(data)
      if (data.length > 0) setSelectedFunnel(data[0].id)
      setLoading(false)
    }
    load()
  }, [])

  const active = funnels.find((f) => f.id === selectedFunnel)

  return (
    <>
      <div className="growth-header">
        <h1>Funnel Analysis</h1>
      </div>

      <div className="growth-subnav">
        <Link href="/admin/growth">Overview</Link>
        <Link href="/admin/growth/experiments">Experiments</Link>
        <Link href="/admin/growth/referrals">Referrals</Link>
        <Link href="/admin/growth/funnels" className="active">Funnels</Link>
        <Link href="/admin/growth/analytics">Analytics</Link>
        <Link href="/admin/growth/automation">Automation</Link>
      </div>

      {/* Funnel selector cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 24 }}>
        {funnels.map((funnel) => {
          const isSelected = selectedFunnel === funnel.id
          return (
            <div
              key={funnel.id}
              className="growth-funnel-card"
              onClick={() => setSelectedFunnel(funnel.id)}
              style={{
                borderColor: isSelected ? 'var(--af-ultra)' : undefined,
                borderWidth: isSelected ? 2 : undefined,
              }}
            >
              <h4 className="growth-funnel-card-name">
                <PiFunnelBold style={{ marginRight: 6, verticalAlign: -2 }} />
                {funnel.name}
              </h4>
              <div className="growth-funnel-card-meta">
                <span>{funnel.steps.length} steps</span>
                <span>{funnel.overallConversion.toFixed(1)}% conversion</span>
              </div>
              <div className="growth-funnel-mini-bars">
                {funnel.steps.map((step, i) => {
                  const height = (step.count / funnel.totalEntries) * 40
                  return (
                    <div
                      key={step.eventKey}
                      className="growth-funnel-mini-bar"
                      style={{
                        height: Math.max(4, height),
                        background: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Active funnel detail */}
      {active && (
        <div className="growth-funnel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="growth-funnel-title" style={{ margin: 0 }}>{active.name}</h3>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12, color: 'var(--af-stone-500)' }}>
                {active.period}
              </span>
              <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12, color: 'var(--af-signal-go)', fontWeight: 600 }}>
                {active.overallConversion.toFixed(1)}% overall
              </span>
            </div>
          </div>

          {/* Full funnel visualization */}
          <div className="growth-funnel-stages">
            {active.steps.map((step, i) => {
              const width = (step.count / active.totalEntries) * 100
              const color = FUNNEL_COLORS[i % FUNNEL_COLORS.length]

              return (
                <div key={step.eventKey}>
                  <div className="growth-funnel-stage">
                    <span className="growth-funnel-stage-label">{step.name}</span>
                    <div className="growth-funnel-stage-bar-wrap">
                      <div
                        className="growth-funnel-stage-bar"
                        style={{ width: `${width}%`, background: color }}
                      >
                        {width > 12 && (
                          <span className="growth-funnel-stage-value">
                            {step.count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="growth-funnel-stage-count">
                      {width <= 12 && step.count.toLocaleString()}
                      {' '}({width.toFixed(1)}%)
                    </span>
                  </div>

                  {/* Drop-off indicator between steps */}
                  {i < active.steps.length - 1 && step.dropoffPercent > 0 && (
                    <div className="growth-dropoff" style={{ margin: '2px 0 2px 120px' }}>
                      <PiArrowDownBold className="growth-dropoff-arrow" />
                      <span>-{active.steps[i + 1].dropoffPercent.toFixed(1)}% drop-off</span>
                      <span style={{ color: 'var(--af-stone-400)', marginLeft: 4 }}>
                        ({(step.count - active.steps[i + 1].count).toLocaleString()} lost)
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Summary row */}
          <div style={{ display: 'flex', gap: 24, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--af-stone-200)' }}>
            <div>
              <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: 22, fontWeight: 700, color: 'var(--af-stone-800)' }}>
                {active.totalEntries.toLocaleString()}
              </div>
              <div style={{ fontFamily: 'var(--af-font-architect)', fontSize: 11, color: 'var(--af-stone-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Entries
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: 22, fontWeight: 700, color: 'var(--af-signal-go)' }}>
                {active.totalCompletions.toLocaleString()}
              </div>
              <div style={{ fontFamily: 'var(--af-font-architect)', fontSize: 11, color: 'var(--af-stone-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Completions
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: 22, fontWeight: 700, color: 'var(--af-ultra)' }}>
                {active.overallConversion.toFixed(2)}%
              </div>
              <div style={{ fontFamily: 'var(--af-font-architect)', fontSize: 11, color: 'var(--af-stone-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Conversion Rate
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--af-font-machine)', fontSize: 22, fontWeight: 700, color: 'var(--af-terra)' }}>
                {active.steps.length}
              </div>
              <div style={{ fontFamily: 'var(--af-font-architect)', fontSize: 11, color: 'var(--af-stone-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Steps
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All funnels comparison table */}
      <div className="growth-section" style={{ marginTop: 20 }}>
        <div className="growth-section-header">
          <h3 className="growth-section-title">Funnel Comparison</h3>
        </div>
        <div className="growth-section-body" style={{ overflowX: 'auto' }}>
          <table className="growth-referral-table">
            <thead>
              <tr>
                <th>Funnel</th>
                <th>Steps</th>
                <th>Entries</th>
                <th>Completions</th>
                <th>Conversion</th>
                <th>Biggest Drop-off</th>
              </tr>
            </thead>
            <tbody>
              {funnels.map((funnel) => {
                const worstStep = [...funnel.steps].sort((a, b) => b.dropoffPercent - a.dropoffPercent)[0]
                return (
                  <tr key={funnel.id}>
                    <td style={{ fontWeight: 600 }}>{funnel.name}</td>
                    <td>{funnel.steps.length}</td>
                    <td>{funnel.totalEntries.toLocaleString()}</td>
                    <td>{funnel.totalCompletions.toLocaleString()}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--af-font-machine)', fontWeight: 700, color: funnel.overallConversion > 20 ? 'var(--af-signal-go)' : 'var(--af-terra)' }}>
                        {funnel.overallConversion.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ color: 'var(--af-signal-stop)' }}>
                      {worstStep?.dropoffPercent > 0 ? (
                        <>
                          {worstStep.name}: -{worstStep.dropoffPercent.toFixed(1)}%
                        </>
                      ) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
