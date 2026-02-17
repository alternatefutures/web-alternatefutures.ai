'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchAgentTasks, computeTaskStats, AGENT_PROFILES,
  type AgentTask, type AgentId, type TaskStatus, type TaskPriority,
} from '@/lib/agent-tasks-api'
import { getCookieValue } from '@/lib/cookies'
import '../dashboard-sub.css'

const statusColors: Record<string, { bg: string; color: string }> = {
  COMPLETED: { bg: '#D1FAE5', color: '#065F46' },
  IN_PROGRESS: { bg: '#DBEAFE', color: '#1E40AF' },
  QUEUED: { bg: '#FEF3C7', color: '#92400E' },
  FAILED: { bg: '#FEE2E2', color: '#991B1B' },
  BLOCKED: { bg: '#F3E8FF', color: '#6B21A8' },
  CANCELLED: { bg: '#F3F4F6', color: '#6B7280' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function AgentActivityFeed() {
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [loading, setLoading] = useState(true)
  const [agentFilter, setAgentFilter] = useState<AgentId | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAgentTasks(token).catch(() => [])
      setTasks(data)
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => computeTaskStats(tasks), [tasks])

  const filtered = useMemo(() => {
    let items = [...tasks]
    if (agentFilter !== 'ALL') items = items.filter((t) => t.assignedTo === agentFilter)
    if (statusFilter !== 'ALL') items = items.filter((t) => t.status === statusFilter)
    if (priorityFilter !== 'ALL') items = items.filter((t) => t.priority === priorityFilter)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    }
    return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [tasks, agentFilter, statusFilter, priorityFilter, search])

  return (
    <>
      <div className="dash-sub-header">
        <Link href="/admin" className="dash-sub-back">&larr; Dashboard</Link>
        <h1>Agent Activity Feed</h1>
      </div>

      {/* Stats Row */}
      <div className="agent-feed-stats">
        <div className="agent-feed-stat">
          <div className="agent-feed-stat-value">{stats.total}</div>
          <div className="agent-feed-stat-label">Total</div>
        </div>
        <div className="agent-feed-stat">
          <div className="agent-feed-stat-value" style={{ color: 'var(--af-ultra)' }}>{stats.inProgress}</div>
          <div className="agent-feed-stat-label">In Progress</div>
        </div>
        <div className="agent-feed-stat">
          <div className="agent-feed-stat-value" style={{ color: 'var(--af-signal-go)' }}>{stats.completed}</div>
          <div className="agent-feed-stat-label">Completed</div>
        </div>
        <div className="agent-feed-stat">
          <div className="agent-feed-stat-value" style={{ color: 'var(--af-signal-stop)' }}>{stats.failed}</div>
          <div className="agent-feed-stat-label">Failed</div>
        </div>
        <div className="agent-feed-stat">
          <div className="agent-feed-stat-value" style={{ color: 'var(--af-signal-wait)' }}>{stats.queued}</div>
          <div className="agent-feed-stat-label">Queued</div>
        </div>
      </div>

      {/* Filters */}
      <div className="dash-sub-filters">
        <select className="dash-sub-select" value={agentFilter} onChange={(e) => setAgentFilter(e.target.value as AgentId | 'ALL')}>
          <option value="ALL">All Agents</option>
          {(Object.entries(AGENT_PROFILES) as [AgentId, { name: string; role: string }][]).map(([id, profile]) => (
            <option key={id} value={id}>{profile.name} ({profile.role})</option>
          ))}
        </select>
        <select className="dash-sub-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}>
          <option value="ALL">All Statuses</option>
          <option value="QUEUED">Queued</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="BLOCKED">Blocked</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select className="dash-sub-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'ALL')}>
          <option value="ALL">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="NORMAL">Normal</option>
          <option value="LOW">Low</option>
        </select>
        <input
          className="dash-sub-search"
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Task Feed */}
      {loading ? (
        <div className="agent-feed-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="agent-feed-item" style={{ pointerEvents: 'none' }}>
              <div className="skeleton-block" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-block" style={{ width: '70%', height: 14, marginBottom: 8 }} />
                <div className="skeleton-block" style={{ width: '90%', height: 11, marginBottom: 6 }} />
                <div className="skeleton-block" style={{ width: '40%', height: 11 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="agent-feed-list">
          {filtered.map((task) => {
            const profile = AGENT_PROFILES[task.assignedTo]
            const sc = statusColors[task.status] || statusColors.QUEUED
            const expanded = expandedTask === task.id

            return (
              <div
                key={task.id}
                className="agent-feed-item"
                onClick={() => setExpandedTask(expanded ? null : task.id)}
                style={{ flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', gap: 'var(--af-space-palm)', width: '100%' }}>
                  <div
                    className="agent-feed-avatar"
                    style={{ background: profile?.color || 'var(--af-stone-500)' }}
                  >
                    {(profile?.name || task.assignedTo).slice(0, 2)}
                  </div>
                  <div className="agent-feed-body">
                    <div className="agent-feed-title">{task.title}</div>
                    <div className="agent-feed-desc">{task.description}</div>
                    <div className="agent-feed-meta">
                      <span className="agent-feed-agent">{profile?.name || task.assignedTo}</span>
                      <span className="agent-feed-status" style={{ background: sc.bg, color: sc.color }}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="agent-feed-priority" data-priority={task.priority}>
                        {task.priority}
                      </span>
                      <span className="agent-feed-time">{timeAgo(task.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {expanded && (
                  <div className="agent-feed-detail">
                    <div className="agent-feed-detail-row">
                      <span className="agent-feed-detail-label">Category</span>
                      <span className="agent-feed-detail-value">{task.category.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="agent-feed-detail-row">
                      <span className="agent-feed-detail-label">Created</span>
                      <span className="agent-feed-detail-value">{new Date(task.createdAt).toLocaleString()}</span>
                    </div>
                    {task.startedAt && (
                      <div className="agent-feed-detail-row">
                        <span className="agent-feed-detail-label">Started</span>
                        <span className="agent-feed-detail-value">{new Date(task.startedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {task.completedAt && (
                      <div className="agent-feed-detail-row">
                        <span className="agent-feed-detail-label">Completed</span>
                        <span className="agent-feed-detail-value">{new Date(task.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {task.dueAt && (
                      <div className="agent-feed-detail-row">
                        <span className="agent-feed-detail-label">Due</span>
                        <span className="agent-feed-detail-value">{new Date(task.dueAt).toLocaleString()}</span>
                      </div>
                    )}
                    {task.natsSubject && (
                      <div className="agent-feed-detail-row">
                        <span className="agent-feed-detail-label">NATS</span>
                        <span className="agent-feed-detail-value">{task.natsSubject}</span>
                      </div>
                    )}
                    {task.error && (
                      <div className="agent-feed-detail-row">
                        <span className="agent-feed-detail-label">Error</span>
                        <span className="agent-feed-detail-value" style={{ color: 'var(--af-signal-stop)' }}>{task.error}</span>
                      </div>
                    )}
                    {task.output && (
                      <div className="agent-feed-detail-row">
                        <span className="agent-feed-detail-label">Output</span>
                        <span className="agent-feed-detail-value">
                          <pre style={{ margin: 0, fontSize: 11, whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(task.output, null, 2)}
                          </pre>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="dashboard-admin-section-empty">
              No tasks match your filters.
            </div>
          )}
        </div>
      )}
    </>
  )
}
