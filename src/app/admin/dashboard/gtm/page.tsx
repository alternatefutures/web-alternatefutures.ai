'use client'

import Link from 'next/link'
import '../dashboard-sub.module.css'

interface Milestone {
  id: string
  title: string
  progress: number
  color: string
  owner: string
  dueDate: string
  status: 'on-track' | 'at-risk' | 'behind' | 'completed'
  blockers?: string[]
}

interface Phase {
  title: string
  dateRange: string
  milestones: Milestone[]
}

const GTM_PHASES: Phase[] = [
  {
    title: 'H1 2026 — Go-to-Market',
    dateRange: 'Jan — Jun 2026',
    milestones: [
      {
        id: 'dev-tools',
        title: 'Developer Tools Vertical',
        progress: 65,
        color: 'var(--af-ultra)',
        owner: 'Senku',
        dueDate: '2026-03-31',
        status: 'on-track',
      },
      {
        id: 'web3-depin',
        title: 'Web3 & DePIN Vertical',
        progress: 45,
        color: 'var(--af-patina)',
        owner: 'Atlas',
        dueDate: '2026-04-30',
        status: 'on-track',
      },
      {
        id: 'ai-agents',
        title: 'AI Agent Hosting Vertical',
        progress: 30,
        color: 'var(--af-terra)',
        owner: 'Lain',
        dueDate: '2026-05-31',
        status: 'at-risk',
        blockers: ['GPU provider pricing negotiations pending'],
      },
      {
        id: 'enterprise',
        title: 'Enterprise Onboarding',
        progress: 15,
        color: 'var(--af-ai-hanada)',
        owner: 'Echo',
        dueDate: '2026-06-30',
        status: 'on-track',
      },
      {
        id: 'marketplace',
        title: 'Template Marketplace',
        progress: 10,
        color: 'var(--af-kin-repair)',
        owner: 'Yusuke',
        dueDate: '2026-06-30',
        status: 'behind',
        blockers: ['Template submission API not started', 'Design system tokens incomplete'],
      },
    ],
  },
  {
    title: 'H2 2026 — Enterprise Expansion',
    dateRange: 'Jul — Dec 2026',
    milestones: [
      {
        id: 'enterprise-sso',
        title: 'Enterprise SSO & Team Management',
        progress: 0,
        color: 'var(--af-ultra-deep)',
        owner: 'Argus',
        dueDate: '2026-08-31',
        status: 'on-track',
      },
      {
        id: 'sla-support',
        title: 'SLA-backed Support Tiers',
        progress: 0,
        color: 'var(--af-terra)',
        owner: 'Quinn',
        dueDate: '2026-09-30',
        status: 'on-track',
      },
      {
        id: 'compliance',
        title: 'SOC 2 Compliance',
        progress: 5,
        color: 'var(--af-signal-go)',
        owner: 'Argus',
        dueDate: '2026-10-31',
        status: 'on-track',
      },
      {
        id: 'multi-region',
        title: 'Multi-Region Deployments',
        progress: 0,
        color: 'var(--af-patina)',
        owner: 'Lain',
        dueDate: '2026-12-31',
        status: 'on-track',
      },
    ],
  },
]

const statusStyles: Record<string, { bg: string; color: string }> = {
  'on-track': { bg: '#D1FAE5', color: '#065F46' },
  'at-risk': { bg: '#FEF3C7', color: '#92400E' },
  'behind': { bg: '#FEE2E2', color: '#991B1B' },
  'completed': { bg: '#DBEAFE', color: '#1E40AF' },
}

export default function GTMTracker() {
  return (
    <>
      <div className="dash-sub-header">
        <Link href="/admin" className="dash-sub-back">&larr; Dashboard</Link>
        <h1>GTM 2026 Milestone Tracker</h1>
      </div>

      <div className="gtm-timeline">
        {GTM_PHASES.map((phase) => (
          <div key={phase.title} className="gtm-phase">
            <div className="gtm-phase-header">
              <h2>{phase.title}</h2>
              <span className="gtm-phase-date">{phase.dateRange}</span>
            </div>
            <div className="gtm-milestones-grid">
              {phase.milestones.map((m) => {
                const style = statusStyles[m.status]
                return (
                  <div key={m.id} className="gtm-milestone-card">
                    <div className="gtm-milestone-top">
                      <span className="gtm-milestone-title">{m.title}</span>
                      <span className="gtm-milestone-progress" style={{ color: m.color }}>
                        {m.progress}%
                      </span>
                    </div>
                    <div className="gtm-progress-bar">
                      <div className="gtm-progress-fill" style={{ width: `${m.progress}%`, background: m.color }} />
                    </div>
                    <div className="gtm-milestone-meta">
                      <span
                        className="gtm-milestone-status"
                        style={{ background: style.bg, color: style.color }}
                      >
                        {m.status.replace('-', ' ')}
                      </span>
                      <span className="gtm-milestone-owner">Owner: {m.owner}</span>
                      <span className="gtm-milestone-due">Due {m.dueDate}</span>
                    </div>
                    {m.blockers && m.blockers.length > 0 && (
                      <div className="gtm-milestone-blockers">
                        Blockers: {m.blockers.join(' | ')}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
