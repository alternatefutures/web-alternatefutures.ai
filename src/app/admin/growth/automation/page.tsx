'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  PiLightningBold,
  PiPlusBold,
  PiPlayBold,
  PiPauseBold,
  PiTrashBold,
  PiEnvelopeBold,
  PiFlaskBold,
  PiClockBold,
  PiArrowsClockwiseBold,
  PiGearBold,
  PiCheckCircleBold,
  PiUsersBold,
  PiBellBold,
} from 'react-icons/pi'
import '../growth-admin.css'

// ---------------------------------------------------------------------------
// Types — Automation Workflows
// ---------------------------------------------------------------------------

type WorkflowStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'COMPLETED'
type TriggerType = 'event' | 'schedule' | 'threshold' | 'segment'
type ActionType = 'email' | 'notification' | 'ab_test' | 'segment_update' | 'webhook'

interface WorkflowStep {
  id: string
  type: ActionType
  name: string
  config: Record<string, string | number | boolean>
  delay: string | null
}

interface Workflow {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  triggerType: TriggerType
  triggerCondition: string
  steps: WorkflowStep[]
  totalTriggered: number
  conversions: number
  conversionRate: number
  createdAt: string
  updatedAt: string
}

interface DripSequence {
  id: string
  name: string
  status: WorkflowStatus
  emails: { subject: string; delay: string; openRate: number; clickRate: number }[]
  totalRecipients: number
  completionRate: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WORKFLOW_STATUS_STYLES: Record<WorkflowStatus, { bg: string; color: string; label: string }> = {
  ACTIVE: { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
  PAUSED: { bg: '#FEF3C7', color: '#92400E', label: 'Paused' },
  DRAFT: { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  COMPLETED: { bg: '#DBEAFE', color: '#1E40AF', label: 'Completed' },
}

const TRIGGER_LABELS: Record<TriggerType, string> = {
  event: 'Event-Based',
  schedule: 'Scheduled',
  threshold: 'Threshold',
  segment: 'Segment Entry',
}

const ACTION_ICONS: Record<ActionType, typeof PiEnvelopeBold> = {
  email: PiEnvelopeBold,
  notification: PiBellBold,
  ab_test: PiFlaskBold,
  segment_update: PiUsersBold,
  webhook: PiGearBold,
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-001',
    name: 'New User Onboarding Drip',
    description: 'Automated email sequence for new signups: welcome, first deploy guide, feature highlights, upgrade prompt.',
    status: 'ACTIVE',
    triggerType: 'event',
    triggerCondition: 'user.signup_completed',
    steps: [
      { id: 's1', type: 'email', name: 'Welcome Email', config: { subject: 'Welcome to AlternateFutures!', template: 'onboarding-welcome' }, delay: null },
      { id: 's2', type: 'email', name: 'First Deploy Guide', config: { subject: 'Deploy your first site in 2 minutes', template: 'onboarding-deploy' }, delay: '1 day' },
      { id: 's3', type: 'notification', name: 'In-App Tip', config: { message: 'Try connecting a GitHub repo for auto deploys', position: 'bottom-right' }, delay: '3 days' },
      { id: 's4', type: 'email', name: 'Feature Highlights', config: { subject: 'Features you haven\'t tried yet', template: 'onboarding-features' }, delay: '5 days' },
      { id: 's5', type: 'email', name: 'Upgrade Prompt', config: { subject: 'Unlock pro features for your growing project', template: 'upgrade-prompt' }, delay: '14 days' },
    ],
    totalTriggered: 2840,
    conversions: 426,
    conversionRate: 15.0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'wf-002',
    name: 'Churn Prevention Flow',
    description: 'Triggered when user shows churn signals: no deploys in 14 days, billing page visit, or support ticket about alternatives.',
    status: 'ACTIVE',
    triggerType: 'threshold',
    triggerCondition: 'user.days_since_deploy > 14',
    steps: [
      { id: 's1', type: 'email', name: 'We Miss You', config: { subject: 'Your projects are waiting for you', template: 'churn-reengagement' }, delay: null },
      { id: 's2', type: 'notification', name: 'Feature Announcement', config: { message: 'New: AI Agent Deployment is now available!', highlight: true }, delay: '3 days' },
      { id: 's3', type: 'email', name: 'Discount Offer', config: { subject: 'Special offer: 30% off Pro for 3 months', template: 'churn-discount' }, delay: '7 days' },
      { id: 's4', type: 'segment_update', name: 'Mark At-Risk', config: { segment: 'churn-risk', action: 'add' }, delay: '14 days' },
    ],
    totalTriggered: 620,
    conversions: 186,
    conversionRate: 30.0,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'wf-003',
    name: 'Trial-to-Paid Conversion',
    description: 'Automated A/B testing of upgrade prompts based on user activity level and feature usage.',
    status: 'ACTIVE',
    triggerType: 'segment',
    triggerCondition: 'user.plan == "free" && user.deploys > 3',
    steps: [
      { id: 's1', type: 'ab_test', name: 'Upgrade CTA Test', config: { variants: 2, metric: 'upgrade_rate', duration: 7 }, delay: null },
      { id: 's2', type: 'email', name: 'Usage Report', config: { subject: 'Your monthly usage summary', template: 'usage-report' }, delay: '7 days' },
      { id: 's3', type: 'email', name: 'Case Study', config: { subject: 'How teams save 60% with AlternateFutures', template: 'case-study' }, delay: '14 days' },
    ],
    totalTriggered: 1240,
    conversions: 248,
    conversionRate: 20.0,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-02-14T12:00:00Z',
  },
  {
    id: 'wf-004',
    name: 'Referral Engagement Loop',
    description: 'Automatically nudge users to refer after positive actions (successful deploy, upgrade, milestone).',
    status: 'PAUSED',
    triggerType: 'event',
    triggerCondition: 'user.deploy_success && user.deploy_count % 5 == 0',
    steps: [
      { id: 's1', type: 'notification', name: 'Referral Nudge', config: { message: 'Love AF? Share with a friend and get a free month!', cta: 'Share Now' }, delay: null },
      { id: 's2', type: 'email', name: 'Referral Reminder', config: { subject: 'Share the love — earn free hosting', template: 'referral-nudge' }, delay: '3 days' },
    ],
    totalTriggered: 340,
    conversions: 51,
    conversionRate: 15.0,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-12T09:00:00Z',
  },
  {
    id: 'wf-005',
    name: 'Weekly Digest Campaign',
    description: 'Scheduled weekly email with platform updates, new features, and community highlights.',
    status: 'ACTIVE',
    triggerType: 'schedule',
    triggerCondition: 'Every Monday 9:00 AM UTC',
    steps: [
      { id: 's1', type: 'email', name: 'Weekly Digest', config: { subject: 'This Week at AlternateFutures', template: 'weekly-digest', dynamic: true }, delay: null },
    ],
    totalTriggered: 18400,
    conversions: 920,
    conversionRate: 5.0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'wf-006',
    name: 'Enterprise Outreach Sequence',
    description: 'Multi-touch outreach for users who match enterprise signals: team size > 5, high deploy volume, custom domain usage.',
    status: 'DRAFT',
    triggerType: 'segment',
    triggerCondition: 'user.team_size > 5 && user.monthly_deploys > 50',
    steps: [
      { id: 's1', type: 'email', name: 'Enterprise Intro', config: { subject: 'Enterprise features built for your team', template: 'enterprise-intro' }, delay: null },
      { id: 's2', type: 'email', name: 'Case Study', config: { subject: 'How Company X saves 60% with AF Enterprise', template: 'enterprise-case-study' }, delay: '5 days' },
      { id: 's3', type: 'email', name: 'Demo Invite', config: { subject: 'Book a personalized demo with our team', template: 'enterprise-demo' }, delay: '10 days' },
      { id: 's4', type: 'webhook', name: 'CRM Update', config: { url: '/api/crm/update', action: 'create_lead' }, delay: '15 days' },
    ],
    totalTriggered: 0,
    conversions: 0,
    conversionRate: 0,
    createdAt: '2026-02-14T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
  },
]

const SEED_DRIPS: DripSequence[] = [
  {
    id: 'drip-001',
    name: 'Onboarding Series',
    status: 'ACTIVE',
    emails: [
      { subject: 'Welcome to AlternateFutures!', delay: 'Immediate', openRate: 72, clickRate: 28 },
      { subject: 'Deploy your first site in 2 minutes', delay: '+1 day', openRate: 58, clickRate: 22 },
      { subject: 'Features you haven\'t tried yet', delay: '+5 days', openRate: 45, clickRate: 18 },
      { subject: 'Unlock pro features', delay: '+14 days', openRate: 38, clickRate: 15 },
    ],
    totalRecipients: 2840,
    completionRate: 62,
  },
  {
    id: 'drip-002',
    name: 'Re-engagement Series',
    status: 'ACTIVE',
    emails: [
      { subject: 'Your projects are waiting', delay: 'On trigger', openRate: 42, clickRate: 12 },
      { subject: 'New feature announcement', delay: '+3 days', openRate: 35, clickRate: 10 },
      { subject: 'Special discount offer', delay: '+7 days', openRate: 48, clickRate: 22 },
    ],
    totalRecipients: 620,
    completionRate: 45,
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GrowthAutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(SEED_WORKFLOWS)
  const [drips] = useState<DripSequence[]>(SEED_DRIPS)
  const [filterStatus, setFilterStatus] = useState<WorkflowStatus | 'ALL'>('ALL')
  const [activeTab, setActiveTab] = useState<'workflows' | 'drips'>('workflows')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const filtered = filterStatus === 'ALL'
    ? workflows
    : workflows.filter((w) => w.status === filterStatus)

  const totalTriggered = workflows.reduce((acc, w) => acc + w.totalTriggered, 0)
  const totalConversions = workflows.reduce((acc, w) => acc + w.conversions, 0)
  const activeWorkflows = workflows.filter((w) => w.status === 'ACTIVE').length

  function showToastMsg(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleStatusChange(id: string, status: WorkflowStatus) {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status, updatedAt: new Date().toISOString() } : w,
      ),
    )
    showToastMsg(`Workflow ${WORKFLOW_STATUS_STYLES[status].label.toLowerCase()}`)
  }

  function handleDelete(id: string) {
    setWorkflows((prev) => prev.filter((w) => w.id !== id))
    showToastMsg('Workflow deleted')
  }

  return (
    <>
      <div className="growth-header">
        <h1>Growth Automation</h1>
        <button className="growth-btn" onClick={() => window.location.reload()}>
          <PiArrowsClockwiseBold /> Refresh
        </button>
      </div>

      <div className="growth-subnav">
        <Link href="/admin/growth">Overview</Link>
        <Link href="/admin/growth/experiments">Experiments</Link>
        <Link href="/admin/growth/referrals">Referrals</Link>
        <Link href="/admin/growth/funnels">Funnels</Link>
        <Link href="/admin/growth/analytics">Analytics</Link>
        <Link href="/admin/growth/automation" className="active">Automation</Link>
      </div>

      {/* Stats */}
      <div className="growth-stats">
        <div className="growth-stat-card">
          <div className="growth-stat-icon"><PiLightningBold /></div>
          <div className="growth-stat-info">
            <div className="growth-stat-value">{activeWorkflows}</div>
            <div className="growth-stat-label">Active Workflows</div>
          </div>
        </div>
        <div className="growth-stat-card">
          <div className="growth-stat-icon"><PiUsersBold /></div>
          <div className="growth-stat-info">
            <div className="growth-stat-value">{totalTriggered.toLocaleString()}</div>
            <div className="growth-stat-label">Total Triggered</div>
          </div>
        </div>
        <div className="growth-stat-card">
          <div className="growth-stat-icon"><PiCheckCircleBold /></div>
          <div className="growth-stat-info">
            <div className="growth-stat-value">{totalConversions.toLocaleString()}</div>
            <div className="growth-stat-label">Conversions</div>
          </div>
        </div>
        <div className="growth-stat-card">
          <div className="growth-stat-icon"><PiFlaskBold /></div>
          <div className="growth-stat-info">
            <div className="growth-stat-value">{totalTriggered > 0 ? ((totalConversions / totalTriggered) * 100).toFixed(1) : 0}%</div>
            <div className="growth-stat-label">Avg Conv. Rate</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button className={`growth-chip${activeTab === 'workflows' ? ' active' : ''}`} onClick={() => setActiveTab('workflows')}>
          Workflows ({workflows.length})
        </button>
        <button className={`growth-chip${activeTab === 'drips' ? ' active' : ''}`} onClick={() => setActiveTab('drips')}>
          Drip Sequences ({drips.length})
        </button>
      </div>

      {activeTab === 'workflows' && (
        <>
          {/* Status filters */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {(['ALL', 'ACTIVE', 'PAUSED', 'DRAFT', 'COMPLETED'] as const).map((s) => (
              <button
                key={s}
                className={`growth-chip${filterStatus === s ? ' active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'ALL' ? 'All' : WORKFLOW_STATUS_STYLES[s].label}
              </button>
            ))}
          </div>

          {/* Workflows List */}
          <div className="growth-exp-list">
            {filtered.map((wf) => {
              const isExpanded = selectedWorkflow === wf.id

              return (
                <div key={wf.id} className="growth-exp-card" onClick={() => setSelectedWorkflow(isExpanded ? null : wf.id)}>
                  <div className="growth-exp-card-header">
                    <h4 className="growth-exp-name">{wf.name}</h4>
                    <span
                      className="growth-badge"
                      style={{
                        background: WORKFLOW_STATUS_STYLES[wf.status].bg,
                        color: WORKFLOW_STATUS_STYLES[wf.status].color,
                      }}
                    >
                      {WORKFLOW_STATUS_STYLES[wf.status].label}
                    </span>
                  </div>

                  <p className="growth-exp-hypothesis">{wf.description}</p>

                  <div className="growth-exp-meta">
                    <span className="growth-exp-meta-item">
                      <PiLightningBold style={{ fontSize: 12 }} />
                      {TRIGGER_LABELS[wf.triggerType]}
                    </span>
                    <span className="growth-exp-meta-item">
                      {wf.steps.length} steps
                    </span>
                    <span className="growth-exp-meta-item">
                      {wf.totalTriggered.toLocaleString()} triggered
                    </span>
                    {wf.conversionRate > 0 && (
                      <span className={`growth-significance ${wf.conversionRate >= 20 ? 'high' : wf.conversionRate >= 10 ? 'medium' : 'low'}`}>
                        {wf.conversionRate}% conversion
                      </span>
                    )}
                  </div>

                  {/* Expanded: Show steps */}
                  {isExpanded && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--af-stone-200)' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--af-stone-500)', letterSpacing: '0.04em' }}>
                          Trigger: <span style={{ color: 'var(--af-ultra)' }}>{wf.triggerCondition}</span>
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {wf.steps.map((step, i) => {
                          const Icon = ACTION_ICONS[step.type]
                          return (
                            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {/* Step connector */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                                <div style={{
                                  width: 24, height: 24, borderRadius: '50%',
                                  background: 'var(--af-ultra)', color: 'white',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: 'var(--af-font-machine)', fontSize: 11, fontWeight: 700,
                                }}>
                                  {i + 1}
                                </div>
                                {i < wf.steps.length - 1 && (
                                  <div style={{ width: 2, height: 16, background: 'var(--af-stone-200)' }} />
                                )}
                              </div>

                              <div className="growth-variant" style={{ flex: 1, margin: 0 }}>
                                <Icon style={{ fontSize: 16, color: 'var(--af-ultra)', flexShrink: 0 }} />
                                <span className="growth-variant-name">{step.name}</span>
                                {step.delay && (
                                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 11, color: 'var(--af-stone-400)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <PiClockBold style={{ fontSize: 12 }} />
                                    {step.delay}
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                        {wf.status === 'DRAFT' && (
                          <button className="growth-btn" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => handleStatusChange(wf.id, 'ACTIVE')}>
                            <PiPlayBold /> Activate
                          </button>
                        )}
                        {wf.status === 'ACTIVE' && (
                          <button className="growth-btn" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => handleStatusChange(wf.id, 'PAUSED')}>
                            <PiPauseBold /> Pause
                          </button>
                        )}
                        {wf.status === 'PAUSED' && (
                          <button className="growth-btn" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => handleStatusChange(wf.id, 'ACTIVE')}>
                            <PiPlayBold /> Resume
                          </button>
                        )}
                        {(wf.status === 'DRAFT' || wf.status === 'COMPLETED') && (
                          <button className="growth-btn" style={{ fontSize: 12, padding: '3px 10px', color: 'var(--af-signal-stop)' }} onClick={() => handleDelete(wf.id)}>
                            <PiTrashBold /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="growth-empty">
                <div className="growth-empty-title">No workflows found</div>
                <div className="growth-empty-sub">
                  No workflows match your current filter. Try selecting a different status.
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'drips' && (
        <div className="growth-exp-list">
          {drips.map((drip) => (
            <div key={drip.id} className="growth-section" style={{ marginBottom: 16 }}>
              <div className="growth-section-header">
                <h3 className="growth-section-title">
                  <PiEnvelopeBold style={{ marginRight: 6, verticalAlign: -2 }} />
                  {drip.name}
                </h3>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span
                    className="growth-badge"
                    style={{
                      background: WORKFLOW_STATUS_STYLES[drip.status].bg,
                      color: WORKFLOW_STATUS_STYLES[drip.status].color,
                    }}
                  >
                    {WORKFLOW_STATUS_STYLES[drip.status].label}
                  </span>
                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12, color: 'var(--af-stone-500)' }}>
                    {drip.totalRecipients.toLocaleString()} recipients
                  </span>
                  <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12, color: 'var(--af-signal-go)', fontWeight: 600 }}>
                    {drip.completionRate}% completion
                  </span>
                </div>
              </div>
              <div className="growth-section-body">
                <table className="growth-referral-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subject</th>
                      <th>Delay</th>
                      <th>Open Rate</th>
                      <th>Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drip.emails.map((email, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'var(--af-font-machine)', fontWeight: 600, color: 'var(--af-stone-400)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 500 }}>{email.subject}</td>
                        <td style={{ fontFamily: 'var(--af-font-machine)', color: 'var(--af-stone-500)' }}>{email.delay}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 60, height: 6, background: 'var(--af-stone-200)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${email.openRate}%`, height: '100%', background: 'var(--af-ultra)', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12, fontWeight: 600 }}>{email.openRate}%</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 60, height: 6, background: 'var(--af-stone-200)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${email.clickRate}%`, height: '100%', background: 'var(--af-signal-go)', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 12, fontWeight: 600 }}>{email.clickRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className="growth-toast">{toast}</div>}
    </>
  )
}
