'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { fetchAllInitiatives, type Initiative } from '@/lib/initiative-api'
import { fetchAllMilestones, type Milestone } from '@/lib/roadmap-api'
import { getCookieValue } from '@/lib/cookies'

// OKR definitions matching the OKR page
const OBJECTIVES = [
  { id: 'obj-1', title: 'Establish market presence in decentralized cloud hosting', owner: 'Echo', color: '#BE4200' },
  { id: 'obj-2', title: 'Build developer community and adoption pipeline', owner: 'Senku', color: '#000AFF' },
  { id: 'obj-3', title: 'Achieve infrastructure cost efficiency on Akash', owner: 'Atlas', color: '#5C7A6B' },
  { id: 'obj-4', title: 'Build brand identity and visual language', owner: 'Hana', color: '#C9A84C' },
]

export default function AlignmentPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [inits, ms] = await Promise.all([
        fetchAllInitiatives(token),
        fetchAllMilestones(token),
      ])
      setInitiatives(inits)
      setMilestones(ms)
      setLoading(false)
    }
    load()
  }, [])

  // Build alignment matrix: initiatives x objectives
  const alignmentMatrix = useMemo(() => {
    return initiatives.map((init) => ({
      initiative: init,
      alignments: OBJECTIVES.map((obj) => ({
        objective: obj,
        aligned: init.okrIds.includes(obj.id),
        linkedMilestones: milestones.filter(
          (m) => init.milestoneIds.includes(m.id) && m.okrIds.includes(obj.id),
        ),
      })),
    }))
  }, [initiatives, milestones])

  // Cross-team dependencies
  const crossTeamDeps = useMemo(() => {
    const deps: { from: Initiative; to: Initiative; sharedOkrs: string[] }[] = []
    for (let i = 0; i < initiatives.length; i++) {
      for (let j = i + 1; j < initiatives.length; j++) {
        const shared = initiatives[i].okrIds.filter((id) =>
          initiatives[j].okrIds.includes(id),
        )
        if (shared.length > 0 && initiatives[i].owner !== initiatives[j].owner) {
          deps.push({
            from: initiatives[i],
            to: initiatives[j],
            sharedOkrs: shared,
          })
        }
      }
    }
    return deps
  }, [initiatives])

  // Coverage stats
  const coverageStats = useMemo(() => {
    return OBJECTIVES.map((obj) => {
      const linkedInits = initiatives.filter((i) => i.okrIds.includes(obj.id))
      const linkedMs = milestones.filter((m) => m.okrIds.includes(obj.id))
      const avgProgress = linkedInits.length > 0
        ? Math.round(linkedInits.reduce((s, i) => s + i.progress, 0) / linkedInits.length)
        : 0
      return {
        objective: obj,
        initiativeCount: linkedInits.length,
        milestoneCount: linkedMs.length,
        avgProgress,
      }
    })
  }, [initiatives, milestones])

  if (loading) {
    return (
      <div className="strategy-page">
        <div className="strategy-header">
          <h1>Alignment Matrix</h1>
        </div>
        <div className="strategy-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="strategy-skeleton-row">
              <div className="strategy-skeleton-block w-40" />
              <div className="strategy-skeleton-block w-20" />
              <div className="strategy-skeleton-block w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="strategy-page">
      <div className="strategy-header">
        <h1>Alignment Matrix</h1>
        <div className="strategy-header-actions">
          <span style={{
            fontFamily: 'var(--af-font-machine)',
            fontSize: 'var(--af-type-xs)',
            color: 'var(--af-stone-400)',
          }}>
            {initiatives.length} initiatives &times; {OBJECTIVES.length} objectives
          </span>
        </div>
      </div>

      {/* OKR Coverage Cards */}
      <div className="strategy-kpi-row">
        {coverageStats.map((stat) => {
          const progressColor =
            stat.avgProgress >= 70 ? 'var(--af-signal-go)' :
            stat.avgProgress >= 40 ? 'var(--af-signal-wait)' :
            'var(--af-signal-stop)'

          return (
            <div key={stat.objective.id} className="strategy-kpi-card">
              <div className="strategy-kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--af-space-grain)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: stat.objective.color, display: 'inline-block' }} />
                {stat.objective.owner}
              </div>
              <div className="strategy-kpi-value" style={{ color: progressColor }}>{stat.avgProgress}%</div>
              <div className="strategy-kpi-sub">{stat.initiativeCount} initiatives, {stat.milestoneCount} milestones</div>
            </div>
          )
        })}
      </div>

      {/* Alignment Matrix Table */}
      <div className="strategy-matrix">
        <table className="strategy-matrix-table">
          <thead>
            <tr>
              <th style={{ minWidth: 200 }}>Initiative</th>
              {OBJECTIVES.map((obj) => (
                <th key={obj.id} style={{ textAlign: 'center', minWidth: 120 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: obj.color, display: 'inline-block' }} />
                    <span>{obj.owner}</span>
                  </div>
                </th>
              ))}
              <th style={{ textAlign: 'center' }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {alignmentMatrix.map((row) => {
              const progressColor =
                row.initiative.progress >= 70 ? 'var(--af-signal-go)' :
                row.initiative.progress >= 40 ? 'var(--af-signal-wait)' :
                'var(--af-signal-stop)'

              return (
                <tr key={row.initiative.id}>
                  <td>
                    <Link
                      href={`/admin/strategy/initiatives/${row.initiative.id}`}
                      style={{
                        fontWeight: 600,
                        color: 'var(--af-stone-800)',
                        textDecoration: 'none',
                      }}
                    >
                      {row.initiative.title}
                    </Link>
                    <div style={{
                      fontFamily: 'var(--af-font-machine)',
                      fontSize: '11px',
                      color: 'var(--af-stone-400)',
                      marginTop: 2,
                    }}>
                      {row.initiative.owner}
                    </div>
                  </td>
                  {row.alignments.map((alignment) => (
                    <td key={alignment.objective.id} style={{ textAlign: 'center' }}>
                      {alignment.aligned ? (
                        <div className="strategy-matrix-cell" style={{ justifyContent: 'center' }}>
                          <div
                            className="strategy-matrix-dot filled"
                            style={{ background: alignment.objective.color }}
                            title={`Aligned with ${alignment.objective.title}`}
                          />
                          {alignment.linkedMilestones.length > 0 && (
                            <span style={{
                              fontFamily: 'var(--af-font-machine)',
                              fontSize: '10px',
                              color: 'var(--af-stone-400)',
                            }}>
                              +{alignment.linkedMilestones.length}ms
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="strategy-matrix-cell" style={{ justifyContent: 'center' }}>
                          <div className="strategy-matrix-dot empty" />
                        </div>
                      )}
                    </td>
                  ))}
                  <td style={{ textAlign: 'center' }}>
                    <span className="strategy-progress-label" style={{ color: progressColor }}>
                      {row.initiative.progress}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Cross-Team Dependencies */}
      {crossTeamDeps.length > 0 && (
        <div className="strategy-section">
          <h2>Cross-Team Dependencies</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--af-space-palm)' }}>
            {crossTeamDeps.map((dep, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--af-space-hand)',
                  padding: 'var(--af-space-palm)',
                  background: 'var(--af-stone-50)',
                  border: 'var(--af-border-hair) solid var(--af-stone-200)',
                  borderRadius: 'var(--af-radius-worn)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/admin/strategy/initiatives/${dep.from.id}`}
                    style={{
                      fontFamily: 'var(--af-font-architect)',
                      fontSize: 'var(--af-type-sm)',
                      fontWeight: 600,
                      color: 'var(--af-stone-800)',
                      textDecoration: 'none',
                    }}
                  >
                    {dep.from.title}
                  </Link>
                  <div style={{
                    fontFamily: 'var(--af-font-machine)',
                    fontSize: '11px',
                    color: 'var(--af-stone-400)',
                  }}>
                    {dep.from.owner}
                  </div>
                </div>
                <span style={{
                  fontFamily: 'var(--af-font-machine)',
                  fontSize: '10px',
                  color: 'var(--af-stone-400)',
                  flexShrink: 0,
                  padding: '2px 8px',
                  background: 'var(--af-ultra-ghost)',
                  borderRadius: 'var(--af-radius-chip)',
                  border: 'var(--af-border-hair) solid var(--af-ultra-ink)',
                }}>
                  {dep.sharedOkrs.length} shared OKR{dep.sharedOkrs.length !== 1 ? 's' : ''}
                </span>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <Link
                    href={`/admin/strategy/initiatives/${dep.to.id}`}
                    style={{
                      fontFamily: 'var(--af-font-architect)',
                      fontSize: 'var(--af-type-sm)',
                      fontWeight: 600,
                      color: 'var(--af-stone-800)',
                      textDecoration: 'none',
                    }}
                  >
                    {dep.to.title}
                  </Link>
                  <div style={{
                    fontFamily: 'var(--af-font-machine)',
                    fontSize: '11px',
                    color: 'var(--af-stone-400)',
                  }}>
                    {dep.to.owner}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objective Breakdown */}
      <div className="strategy-section-grid">
        {coverageStats.map((stat) => (
          <div key={stat.objective.id} className="strategy-section">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--af-space-grain)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: stat.objective.color, display: 'inline-block' }} />
              {stat.objective.title}
            </h2>
            {initiatives
              .filter((i) => i.okrIds.includes(stat.objective.id))
              .map((init) => (
                <div key={init.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--af-space-palm) 0',
                  borderBottom: 'var(--af-border-hair) solid var(--af-stone-200)',
                }}>
                  <Link
                    href={`/admin/strategy/initiatives/${init.id}`}
                    style={{
                      fontFamily: 'var(--af-font-architect)',
                      fontSize: 'var(--af-type-sm)',
                      fontWeight: 500,
                      color: 'var(--af-stone-700)',
                      textDecoration: 'none',
                    }}
                  >
                    {init.title}
                  </Link>
                  <span className="strategy-progress-label" style={{
                    color: init.progress >= 70 ? 'var(--af-signal-go)' : init.progress >= 40 ? 'var(--af-signal-wait)' : 'var(--af-signal-stop)',
                  }}>
                    {init.progress}%
                  </span>
                </div>
              ))}
            {initiatives.filter((i) => i.okrIds.includes(stat.objective.id)).length === 0 && (
              <div style={{
                fontFamily: 'var(--af-font-poet)',
                fontStyle: 'italic',
                fontSize: 'var(--af-type-sm)',
                color: 'var(--af-stone-400)',
                padding: 'var(--af-space-palm) 0',
              }}>
                No initiatives aligned yet.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
