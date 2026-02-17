'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  fetchInitiativeById,
  getPriorityLabel,
  getStatusLabel,
  getTaskStatusLabel,
  type Initiative,
} from '@/lib/initiative-api'
import { getCookieValue } from '@/lib/cookies'

export default function InitiativeDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [initiative, setInitiative] = useState<Initiative | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchInitiativeById(token, id)
      setInitiative(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="strategy-page">
        <div className="strategy-header">
          <h1>Loading...</h1>
        </div>
        <div className="strategy-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="strategy-skeleton-row">
              <div className="strategy-skeleton-block w-40" />
              <div className="strategy-skeleton-block w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!initiative) {
    return (
      <div className="strategy-page">
        <div className="strategy-empty">
          <h2>Initiative not found</h2>
          <p>The initiative you&apos;re looking for doesn&apos;t exist.</p>
        </div>
        <Link href="/admin/strategy/initiatives" className="strategy-back-link">
          &larr; Back to Initiatives
        </Link>
      </div>
    )
  }

  const progressColor =
    initiative.progress >= 70 ? 'var(--af-signal-go)' :
    initiative.progress >= 40 ? 'var(--af-signal-wait)' :
    'var(--af-signal-stop)'

  const tasksByStatus = {
    done: initiative.tasks.filter((t) => t.status === 'done'),
    'in-progress': initiative.tasks.filter((t) => t.status === 'in-progress'),
    review: initiative.tasks.filter((t) => t.status === 'review'),
    todo: initiative.tasks.filter((t) => t.status === 'todo'),
    blocked: initiative.tasks.filter((t) => t.status === 'blocked'),
  }

  return (
    <div className="strategy-page">
      <Link href="/admin/strategy/initiatives" className="strategy-back-link">
        &larr; Back to Initiatives
      </Link>

      <div className="strategy-header" style={{ marginTop: 'var(--af-space-palm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--af-space-hand)' }}>
          <div className="strategy-owner-badge" style={{ background: initiative.ownerColor, width: 40, height: 40, fontSize: 14 }}>
            {initiative.owner.charAt(0)}
          </div>
          <div>
            <h1 style={{ marginBottom: 4 }}>{initiative.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--af-space-palm)', flexWrap: 'wrap' }}>
              <span className={`strategy-status-chip ${initiative.status}`}>
                {getStatusLabel(initiative.status)}
              </span>
              <span className={`strategy-priority-chip ${initiative.priority}`}>
                {getPriorityLabel(initiative.priority)}
              </span>
              <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: 'var(--af-type-xs)', color: 'var(--af-stone-500)' }}>
                {initiative.owner}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="strategy-detail-layout">
        <div className="strategy-detail-main">
          {/* Description */}
          <div className="strategy-section">
            <h2>Overview</h2>
            <p style={{
              fontFamily: 'var(--af-font-architect)',
              fontSize: 'var(--af-type-sm)',
              color: 'var(--af-stone-700)',
              lineHeight: 'var(--af-leading-body)',
              margin: 0,
            }}>
              {initiative.description}
            </p>
          </div>

          {/* Progress */}
          <div className="strategy-section">
            <h2>Progress</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--af-space-palm)' }}>
              <span className="strategy-progress-label" style={{ color: progressColor, fontSize: 'var(--af-type-2xl)' }}>
                {initiative.progress}%
              </span>
              <span style={{
                fontFamily: 'var(--af-font-machine)',
                fontSize: '11px',
                color: 'var(--af-stone-400)',
              }}>
                {initiative.tasks.filter((t) => t.status === 'done').length} of {initiative.tasks.length} tasks done
              </span>
            </div>
            <div className="strategy-progress-track" style={{ height: 8 }}>
              <div
                className="strategy-progress-fill"
                style={{ width: `${initiative.progress}%`, background: progressColor }}
              />
            </div>
          </div>

          {/* Tasks */}
          <div className="strategy-section">
            <h2>Tasks ({initiative.tasks.length})</h2>
            <div className="strategy-task-list">
              {initiative.tasks.map((task) => (
                <div key={task.id} className="strategy-task-item">
                  <span className={`strategy-task-indicator ${task.status}`} />
                  <span className={`strategy-task-title${task.status === 'done' ? ' done' : ''}`}>
                    {task.title}
                  </span>
                  <span className="strategy-task-assignee">{task.assignee}</span>
                  <span className={`strategy-status-chip ${task.status}`} style={{ fontSize: 10, padding: '1px 6px' }}>
                    {getTaskStatusLabel(task.status)}
                  </span>
                  <span className="strategy-task-due">
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          {initiative.metrics.length > 0 && (
            <div className="strategy-section">
              <h2>Metrics</h2>
              {initiative.metrics.map((metric) => {
                const pct = metric.target > 0 ? Math.round((metric.current / metric.target) * 100) : 0
                const color =
                  pct >= 80 ? 'var(--af-signal-go)' :
                  pct >= 50 ? 'var(--af-signal-wait)' :
                  'var(--af-signal-stop)'

                return (
                  <div key={metric.id} className="strategy-metric-row">
                    <span className="strategy-metric-label">{metric.label}</span>
                    <div className="strategy-metric-bar">
                      <div className="strategy-progress-track" style={{ height: 4 }}>
                        <div
                          className="strategy-progress-fill"
                          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
                        />
                      </div>
                    </div>
                    <span className="strategy-metric-value" style={{ color }}>
                      {metric.current} / {metric.target} {metric.unit}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Updates */}
          {initiative.updates.length > 0 && (
            <div className="strategy-section">
              <h2>Updates</h2>
              <div className="strategy-update-list">
                {initiative.updates.map((update) => (
                  <div key={update.id} className={`strategy-update-item ${update.type}`}>
                    <div className="strategy-update-meta">
                      <span className="strategy-update-author">{update.author}</span>
                      {' — '}
                      {new Date(update.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {' — '}
                      <span style={{ textTransform: 'capitalize' }}>{update.type}</span>
                    </div>
                    <div className="strategy-update-content">{update.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="strategy-detail-sidebar">
          <div className="strategy-sidebar-card">
            <h3>Details</h3>
            <div className="strategy-info-grid">
              <span className="strategy-info-label">Owner</span>
              <span className="strategy-info-value">{initiative.owner}</span>
              <span className="strategy-info-label">Priority</span>
              <span className="strategy-info-value">
                <span className={`strategy-priority-chip ${initiative.priority}`}>
                  {getPriorityLabel(initiative.priority)}
                </span>
              </span>
              <span className="strategy-info-label">Start</span>
              <span className="strategy-info-value">
                {new Date(initiative.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="strategy-info-label">End</span>
              <span className="strategy-info-value">
                {new Date(initiative.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="strategy-info-label">Created</span>
              <span className="strategy-info-value">
                {new Date(initiative.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="strategy-info-label">Updated</span>
              <span className="strategy-info-value">
                {new Date(initiative.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="strategy-sidebar-card">
            <h3>Team</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--af-space-grain)' }}>
              {initiative.teamMembers.map((member) => (
                <span key={member} className="strategy-tag">{member}</span>
              ))}
            </div>
          </div>

          {initiative.okrIds.length > 0 && (
            <div className="strategy-sidebar-card">
              <h3>Linked OKRs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--af-space-grain)' }}>
                {initiative.okrIds.map((okrId) => (
                  <Link
                    key={okrId}
                    href="/admin/strategy/okrs"
                    style={{
                      fontFamily: 'var(--af-font-architect)',
                      fontSize: 'var(--af-type-xs)',
                      color: 'var(--af-ultra)',
                      textDecoration: 'none',
                    }}
                  >
                    {okrId}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="strategy-sidebar-card">
            <h3>Task Summary</h3>
            <div className="strategy-info-grid">
              <span className="strategy-info-label">Done</span>
              <span className="strategy-info-value" style={{ color: 'var(--af-signal-go)' }}>
                {tasksByStatus.done.length}
              </span>
              <span className="strategy-info-label">In Progress</span>
              <span className="strategy-info-value" style={{ color: 'var(--af-ultra)' }}>
                {tasksByStatus['in-progress'].length}
              </span>
              <span className="strategy-info-label">Review</span>
              <span className="strategy-info-value" style={{ color: 'var(--af-signal-wait)' }}>
                {tasksByStatus.review.length}
              </span>
              <span className="strategy-info-label">To Do</span>
              <span className="strategy-info-value">{tasksByStatus.todo.length}</span>
              <span className="strategy-info-label">Blocked</span>
              <span className="strategy-info-value" style={{ color: 'var(--af-signal-stop)' }}>
                {tasksByStatus.blocked.length}
              </span>
            </div>
          </div>

          <div className="strategy-sidebar-card">
            <h3>Tags</h3>
            <div className="strategy-tags">
              {initiative.tags.map((tag) => (
                <span key={tag} className="strategy-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
