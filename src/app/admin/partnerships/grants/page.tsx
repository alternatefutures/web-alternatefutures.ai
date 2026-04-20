'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchPipeline,
  fetchPartners,
  getPipelineByStage,
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_COLORS,
  type PipelineEntry,
  type Partner,
} from '@/lib/partner-api'
import '../partnerships.module.css'

type GrantStatus = 'applied' | 'reviewing' | 'approved' | 'disbursed' | 'completed'

interface Grant {
  id: string
  program: string
  organization: string
  amount: string
  status: GrantStatus
  deadline: string
  submittedDate: string
  assignee: string
  notes: string
}

const SEED_GRANTS: Grant[] = [
  {
    id: 'grant-001',
    program: 'ICP Developer Grant',
    organization: 'DFINITY Foundation',
    amount: '$25,000',
    status: 'approved',
    deadline: '2026-03-15',
    submittedDate: '2026-01-10',
    assignee: 'Lain',
    notes: 'Milestone 1 completed. Building canister deployment adapter.',
  },
  {
    id: 'grant-002',
    program: 'Filecoin Dev Grant',
    organization: 'Protocol Labs',
    amount: '$50,000',
    status: 'reviewing',
    deadline: '2026-04-01',
    submittedDate: '2026-02-01',
    assignee: 'Senku',
    notes: 'Applied for FVM integration tooling grant.',
  },
  {
    id: 'grant-003',
    program: 'Akash Community Fund',
    organization: 'Akash Network',
    amount: '$15,000',
    status: 'disbursed',
    deadline: '2026-02-28',
    submittedDate: '2025-12-15',
    assignee: 'Atlas',
    notes: 'Developer tooling grant. Funds received, building documentation.',
  },
  {
    id: 'grant-004',
    program: 'Arweave Ecosystem Fund',
    organization: 'Arweave',
    amount: '$30,000',
    status: 'applied',
    deadline: '2026-05-01',
    submittedDate: '2026-02-10',
    assignee: 'Senku',
    notes: 'Applied for permanent deployment infrastructure grant.',
  },
  {
    id: 'grant-005',
    program: 'Livepeer Growth Grant',
    organization: 'Livepeer',
    amount: '$10,000',
    status: 'reviewing',
    deadline: '2026-03-30',
    submittedDate: '2026-02-05',
    assignee: 'Atlas',
    notes: 'Video transcoding integration for AF platform.',
  },
]

const GRANT_STATUSES: GrantStatus[] = ['applied', 'reviewing', 'approved', 'disbursed', 'completed']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function GrantTrackerPage() {
  const [grants] = useState<Grant[]>(SEED_GRANTS)
  const [pipeline, setPipeline] = useState<PipelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'table' | 'pipeline'>('table')
  const [statusFilter, setStatusFilter] = useState<GrantStatus | ''>('')

  useEffect(() => {
    async function load() {
      const pipe = await fetchPipeline()
      setPipeline(pipe)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!statusFilter) return grants
    return grants.filter((g) => g.status === statusFilter)
  }, [grants, statusFilter])

  const totalSecured = useMemo(() => {
    return grants
      .filter((g) => g.status === 'approved' || g.status === 'disbursed' || g.status === 'completed')
      .reduce((sum, g) => {
        const num = parseInt(g.amount.replace(/[^0-9]/g, ''), 10)
        return sum + (isNaN(num) ? 0 : num)
      }, 0)
  }, [grants])

  const totalPipeline = useMemo(() => {
    return grants
      .filter((g) => g.status === 'applied' || g.status === 'reviewing')
      .reduce((sum, g) => {
        const num = parseInt(g.amount.replace(/[^0-9]/g, ''), 10)
        return sum + (isNaN(num) ? 0 : num)
      }, 0)
  }, [grants])

  const pipelineByStage = useMemo(() => getPipelineByStage(pipeline), [pipeline])

  if (loading) {
    return (
      <div className="partnerships-dashboard">
        <div className="partnerships-header">
          <h1>Grant Tracker</h1>
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
        <h1>Grant Tracker</h1>
        <div className="partnerships-header-actions">
          <Link href="/admin/partnerships/grants/new" className="partnerships-btn-primary">
            + New Application
          </Link>
          <Link href="/admin/partnerships" className="partnerships-btn-secondary">
            &larr; Dashboard
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="partnerships-stats-row">
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">Total Secured</div>
          <div className="partnerships-stat-value">${totalSecured.toLocaleString()}</div>
          <div className="partnerships-stat-sub">approved + disbursed</div>
        </div>
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">In Pipeline</div>
          <div className="partnerships-stat-value">${totalPipeline.toLocaleString()}</div>
          <div className="partnerships-stat-sub">applied + reviewing</div>
        </div>
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">Applications</div>
          <div className="partnerships-stat-value">{grants.length}</div>
          <div className="partnerships-stat-sub">total submitted</div>
        </div>
        <div className="partnerships-stat-card">
          <div className="partnerships-stat-label">Success Rate</div>
          <div className="partnerships-stat-value">
            {grants.length > 0
              ? Math.round(
                  (grants.filter((g) => g.status === 'approved' || g.status === 'disbursed' || g.status === 'completed').length /
                    grants.length) *
                    100,
                )
              : 0}%
          </div>
          <div className="partnerships-stat-sub">approved or funded</div>
        </div>
      </div>

      {/* View Toggle + Filters */}
      <div className="partnerships-filters">
        <select
          className="partnerships-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as GrantStatus | '')}
        >
          <option value="">All Status</option>
          {GRANT_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button
            className={`partnerships-btn-secondary partnerships-btn-sm${view === 'table' ? '' : ''}`}
            style={view === 'table' ? { background: 'var(--af-terra)', color: 'white', borderColor: 'var(--af-terra)' } : {}}
            onClick={() => setView('table')}
          >
            Table
          </button>
          <button
            className="partnerships-btn-secondary partnerships-btn-sm"
            style={view === 'pipeline' ? { background: 'var(--af-terra)', color: 'white', borderColor: 'var(--af-terra)' } : {}}
            onClick={() => setView('pipeline')}
          >
            Pipeline
          </button>
        </div>
      </div>

      {view === 'table' ? (
        /* Table View */
        <div className="partnerships-table-wrap">
          <table className="partnerships-table">
            <thead>
              <tr>
                <th>Program</th>
                <th>Organization</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Submitted</th>
                <th>Assignee</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((grant) => (
                <tr key={grant.id}>
                  <td>
                    <span className="partnerships-table-link">{grant.program}</span>
                  </td>
                  <td>{grant.organization}</td>
                  <td style={{ fontWeight: 600, color: 'var(--af-terra)' }}>{grant.amount}</td>
                  <td>
                    <span className={`partnerships-grant-status ${grant.status}`}>
                      {grant.status}
                    </span>
                  </td>
                  <td>{formatDate(grant.deadline)}</td>
                  <td>{formatDate(grant.submittedDate)}</td>
                  <td>{grant.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Pipeline View */
        <div className="partnerships-pipeline">
          {PIPELINE_STAGES.map((stage) => {
            const entries = pipelineByStage[stage]
            return (
              <div key={stage} className="partnerships-pipeline-col">
                <div
                  className="partnerships-pipeline-header"
                  style={{ background: PIPELINE_STAGE_COLORS[stage] }}
                >
                  {PIPELINE_STAGE_LABELS[stage]}
                  <span className="partnerships-pipeline-count">({entries.length})</span>
                </div>
                {entries.map((entry) => (
                  <div key={entry.id} className="partnerships-pipeline-card">
                    <div className="partnerships-pipeline-card-name">{entry.partnerName}</div>
                    <div className="partnerships-pipeline-card-value">{entry.value}</div>
                    <div className="partnerships-pipeline-card-meta">{entry.nextAction}</div>
                    <div className="partnerships-pipeline-card-assignee">{entry.assignee}</div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
