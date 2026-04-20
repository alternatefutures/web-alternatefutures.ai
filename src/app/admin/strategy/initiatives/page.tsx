'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchAllInitiatives,
  getPriorityLabel,
  getStatusLabel,
  computeTaskProgress,
  type Initiative,
} from '@/lib/initiative-api'
import { getCookieValue } from '@/lib/cookies'

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllInitiatives(token)
      setInitiatives(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = initiatives
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.owner.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    if (filterStatus !== 'all') result = result.filter((i) => i.status === filterStatus)
    if (filterPriority !== 'all') result = result.filter((i) => i.priority === filterPriority)
    return result
  }, [initiatives, search, filterStatus, filterPriority])

  const stats = useMemo(() => {
    const total = initiatives.length
    const active = initiatives.filter((i) => i.status === 'active').length
    const avgProgress = total > 0
      ? Math.round(initiatives.reduce((s, i) => s + i.progress, 0) / total)
      : 0
    const totalTasks = initiatives.reduce((s, i) => s + i.tasks.length, 0)
    const doneTasks = initiatives.reduce(
      (s, i) => s + i.tasks.filter((t) => t.status === 'done').length,
      0,
    )
    return { total, active, avgProgress, totalTasks, doneTasks }
  }, [initiatives])

  if (loading) {
    return (
      <div className="strategy-page">
        <div className="strategy-header">
          <h1>Initiatives</h1>
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
        <h1>Initiatives</h1>
        <div className="strategy-header-actions">
          <span style={{
            fontFamily: 'var(--af-font-machine)',
            fontSize: 'var(--af-type-xs)',
            color: 'var(--af-stone-400)',
          }}>
            {filtered.length} of {initiatives.length}
          </span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="strategy-kpi-row">
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">Total</div>
          <div className="strategy-kpi-value">{stats.total}</div>
          <div className="strategy-kpi-sub">initiatives</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">Active</div>
          <div className="strategy-kpi-value" style={{ color: 'var(--af-ultra)' }}>{stats.active}</div>
          <div className="strategy-kpi-sub">in flight</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">Avg Progress</div>
          <div className="strategy-kpi-value">{stats.avgProgress}%</div>
          <div className="strategy-kpi-sub">across all</div>
        </div>
        <div className="strategy-kpi-card">
          <div className="strategy-kpi-label">Tasks Done</div>
          <div className="strategy-kpi-value" style={{ color: 'var(--af-signal-go)' }}>{stats.doneTasks}</div>
          <div className="strategy-kpi-sub">of {stats.totalTasks} total</div>
        </div>
      </div>

      {/* Filters */}
      <div className="strategy-filters">
        <input
          className="strategy-search"
          placeholder="Search initiatives..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="strategy-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="strategy-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Initiative List */}
      <div className="strategy-initiative-list">
        {filtered.map((init) => {
          const taskPct = computeTaskProgress(init.tasks)
          const progressColor =
            init.progress >= 70 ? 'var(--af-signal-go)' :
            init.progress >= 40 ? 'var(--af-signal-wait)' :
            'var(--af-signal-stop)'

          return (
            <Link
              key={init.id}
              href={`/admin/strategy/initiatives/${init.id}`}
              className="strategy-initiative-row"
            >
              <div className="strategy-owner-badge" style={{ background: init.ownerColor }}>
                {init.owner.charAt(0)}
              </div>
              <div className="strategy-initiative-info">
                <div className="strategy-initiative-title">{init.title}</div>
                <div className="strategy-initiative-meta">
                  <span className="strategy-initiative-owner">{init.owner}</span>
                  <span className={`strategy-status-chip ${init.status}`}>
                    {getStatusLabel(init.status)}
                  </span>
                  <span className={`strategy-priority-chip ${init.priority}`}>
                    {getPriorityLabel(init.priority)}
                  </span>
                  <span style={{
                    fontFamily: 'var(--af-font-machine)',
                    fontSize: '11px',
                    color: 'var(--af-stone-400)',
                  }}>
                    {init.tasks.filter((t) => t.status === 'done').length}/{init.tasks.length} tasks
                  </span>
                </div>
              </div>
              <div className="strategy-initiative-progress">
                <div className="strategy-progress-label" style={{ color: progressColor, marginBottom: 4 }}>
                  {init.progress}%
                </div>
                <div className="strategy-progress-track">
                  <div
                    className="strategy-progress-fill"
                    style={{ width: `${init.progress}%`, background: progressColor }}
                  />
                </div>
              </div>
            </Link>
          )
        })}

        {filtered.length === 0 && (
          <div className="strategy-empty">
            <h2>No initiatives found</h2>
            <p>Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  )
}
