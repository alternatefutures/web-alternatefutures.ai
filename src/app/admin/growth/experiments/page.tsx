'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PiFlaskBold,
  PiPlusBold,
  PiPlayBold,
  PiPauseBold,
  PiTrashBold,
  PiCheckCircleBold,
  PiTrophyBold,
} from 'react-icons/pi'
import {
  fetchExperiments,
  createExperiment,
  updateExperimentStatus,
  deleteExperiment,
  type Experiment,
  type ExperimentStatus,
  type CreateExperimentInput,
  EXPERIMENT_STATUS_STYLES,
} from '@/lib/growth-api'
import '../growth-admin.css'

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<ExperimentStatus | 'ALL'>('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Create form state
  const [formName, setFormName] = useState('')
  const [formHypothesis, setFormHypothesis] = useState('')
  const [formMetric, setFormMetric] = useState('')
  const [formDuration, setFormDuration] = useState(14)
  const [formVariants, setFormVariants] = useState([
    { name: 'Control', trafficPercent: 50 },
    { name: 'Variant A', trafficPercent: 50 },
  ])

  useEffect(() => {
    loadExperiments()
  }, [])

  async function loadExperiments() {
    setLoading(true)
    const data = await fetchExperiments()
    setExperiments(data)
    setLoading(false)
  }

  const filtered = filterStatus === 'ALL'
    ? experiments
    : experiments.filter((e) => e.status === filterStatus)

  function showToastMsg(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleCreate() {
    if (!formName || !formHypothesis || !formMetric) return

    const input: CreateExperimentInput = {
      name: formName,
      hypothesis: formHypothesis,
      successMetric: formMetric,
      variants: formVariants,
      durationDays: formDuration,
    }
    const exp = await createExperiment(input)
    setExperiments((prev) => [exp, ...prev])
    setShowCreate(false)
    setFormName('')
    setFormHypothesis('')
    setFormMetric('')
    setFormDuration(14)
    setFormVariants([
      { name: 'Control', trafficPercent: 50 },
      { name: 'Variant A', trafficPercent: 50 },
    ])
    showToastMsg('Experiment created')
  }

  async function handleStatusChange(id: string, status: ExperimentStatus) {
    const updated = await updateExperimentStatus(id, status)
    setExperiments((prev) => prev.map((e) => (e.id === id ? updated : e)))
    showToastMsg(`Experiment ${EXPERIMENT_STATUS_STYLES[status].label.toLowerCase()}`)
  }

  async function handleDelete(id: string) {
    await deleteExperiment(id)
    setExperiments((prev) => prev.filter((e) => e.id !== id))
    showToastMsg('Experiment deleted')
  }

  function addVariant() {
    const idx = formVariants.length
    const even = Math.floor(100 / (idx + 1))
    setFormVariants([
      ...formVariants.map((v) => ({ ...v, trafficPercent: even })),
      { name: `Variant ${String.fromCharCode(64 + idx)}`, trafficPercent: 100 - even * idx },
    ])
  }

  function removeVariant(i: number) {
    if (formVariants.length <= 2) return
    const next = formVariants.filter((_, idx) => idx !== i)
    const even = Math.floor(100 / next.length)
    setFormVariants(next.map((v, idx) => ({ ...v, trafficPercent: idx === next.length - 1 ? 100 - even * (next.length - 1) : even })))
  }

  function significanceClass(sig: number): string {
    if (sig >= 95) return 'high'
    if (sig >= 80) return 'medium'
    return 'low'
  }

  return (
    <>
      <div className="growth-header">
        <h1>A/B Testing Manager</h1>
        <div className="growth-header-actions">
          <button className="growth-btn growth-btn--primary" onClick={() => setShowCreate(true)}>
            <PiPlusBold /> New Experiment
          </button>
        </div>
      </div>

      <div className="growth-subnav">
        <Link href="/admin/growth">Overview</Link>
        <Link href="/admin/growth/experiments" className="active">Experiments</Link>
        <Link href="/admin/growth/referrals">Referrals</Link>
        <Link href="/admin/growth/funnels">Funnels</Link>
        <Link href="/admin/growth/analytics">Analytics</Link>
        <Link href="/admin/growth/automation">Automation</Link>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['ALL', 'RUNNING', 'DRAFT', 'PAUSED', 'COMPLETED', 'ARCHIVED'] as const).map((s) => (
          <button
            key={s}
            className={`growth-chip${filterStatus === s ? ' active' : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === 'ALL' ? 'All' : EXPERIMENT_STATUS_STYLES[s].label}
          </button>
        ))}
      </div>

      {/* Experiments List */}
      <div className="growth-exp-list">
        {filtered.map((exp) => {
          const best = [...exp.variants].sort((a, b) => b.conversionRate - a.conversionRate)[0]
          const sigClass = significanceClass(exp.significance)
          const startDate = new Date(exp.startDate).toLocaleDateString()
          const endDate = exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Ongoing'

          return (
            <div key={exp.id} className="growth-exp-card">
              <div className="growth-exp-card-header">
                <h4 className="growth-exp-name">{exp.name}</h4>
                <span
                  className="growth-badge"
                  style={{
                    background: EXPERIMENT_STATUS_STYLES[exp.status].bg,
                    color: EXPERIMENT_STATUS_STYLES[exp.status].color,
                  }}
                >
                  {EXPERIMENT_STATUS_STYLES[exp.status].label}
                </span>
              </div>

              <p className="growth-exp-hypothesis">{exp.hypothesis}</p>

              <div className="growth-exp-meta">
                <span className="growth-exp-meta-item">
                  <PiFlaskBold style={{ fontSize: 12 }} />
                  {exp.variants.length} variants
                </span>
                <span className="growth-exp-meta-item">
                  Metric: {exp.successMetric.replace(/_/g, ' ')}
                </span>
                <span className="growth-exp-meta-item">
                  {startDate} — {endDate}
                </span>
                <span className="growth-exp-meta-item">
                  {exp.totalTraffic.toLocaleString()} impressions
                </span>
                {exp.significance > 0 && (
                  <span className={`growth-significance ${sigClass}`}>
                    {exp.significance}% significance
                  </span>
                )}
              </div>

              {/* Variants with bars */}
              <div className="growth-variants">
                {exp.variants.map((v) => {
                  const maxRate = best?.conversionRate || 1
                  const barWidth = maxRate > 0 ? (v.conversionRate / maxRate) * 100 : 0
                  const isWinner = exp.winner === v.id

                  return (
                    <div key={v.id} className={`growth-variant${isWinner ? ' winner' : ''}`}>
                      <span className="growth-variant-name">
                        {isWinner && <PiTrophyBold style={{ color: 'var(--af-signal-go)', marginRight: 4, verticalAlign: -2 }} />}
                        {v.name}
                      </span>
                      <span className="growth-variant-traffic">{v.trafficPercent}%</span>
                      <div className="growth-variant-bar-wrap">
                        <div
                          className="growth-variant-bar"
                          style={{
                            width: `${barWidth}%`,
                            background: isWinner ? 'var(--af-signal-go)' : 'var(--af-ultra)',
                          }}
                        />
                      </div>
                      <span
                        className="growth-variant-rate"
                        style={{ color: isWinner ? 'var(--af-signal-go)' : 'var(--af-stone-700)' }}
                      >
                        {v.conversionRate > 0 ? `${v.conversionRate.toFixed(2)}%` : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                {exp.status === 'DRAFT' && (
                  <button className="growth-btn" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => handleStatusChange(exp.id, 'RUNNING')}>
                    <PiPlayBold /> Start
                  </button>
                )}
                {exp.status === 'RUNNING' && (
                  <>
                    <button className="growth-btn" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => handleStatusChange(exp.id, 'PAUSED')}>
                      <PiPauseBold /> Pause
                    </button>
                    <button className="growth-btn" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => handleStatusChange(exp.id, 'COMPLETED')}>
                      <PiCheckCircleBold /> Complete
                    </button>
                  </>
                )}
                {exp.status === 'PAUSED' && (
                  <button className="growth-btn" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => handleStatusChange(exp.id, 'RUNNING')}>
                    <PiPlayBold /> Resume
                  </button>
                )}
                {(exp.status === 'DRAFT' || exp.status === 'ARCHIVED') && (
                  <button className="growth-btn" style={{ fontSize: 12, padding: '3px 10px', color: 'var(--af-signal-stop)' }} onClick={() => handleDelete(exp.id)}>
                    <PiTrashBold /> Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && !loading && (
          <div className="growth-empty">
            <div className="growth-empty-title">No experiments found</div>
            <div className="growth-empty-sub">
              Create your first experiment to start optimizing conversion rates.
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="growth-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="growth-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="growth-modal-title">New Experiment</h2>

            <div className="growth-form-group">
              <label className="growth-form-label">Experiment Name</label>
              <input
                className="growth-form-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Hero CTA Copy Test"
              />
            </div>

            <div className="growth-form-group">
              <label className="growth-form-label">Hypothesis</label>
              <textarea
                className="growth-form-textarea"
                value={formHypothesis}
                onChange={(e) => setFormHypothesis(e.target.value)}
                placeholder="e.g., Changing CTA to 'Deploy Free' will increase signups by 15%"
              />
            </div>

            <div className="growth-form-group">
              <label className="growth-form-label">Success Metric</label>
              <input
                className="growth-form-input"
                value={formMetric}
                onChange={(e) => setFormMetric(e.target.value)}
                placeholder="e.g., signup_rate, bounce_rate"
              />
            </div>

            <div className="growth-form-group">
              <label className="growth-form-label">Duration (days)</label>
              <input
                className="growth-form-input"
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                min={1}
                max={90}
              />
            </div>

            <div className="growth-form-group">
              <label className="growth-form-label">Variants</label>
              {formVariants.map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input
                    className="growth-form-input"
                    style={{ flex: 1 }}
                    value={v.name}
                    onChange={(e) => {
                      const next = [...formVariants]
                      next[i] = { ...next[i], name: e.target.value }
                      setFormVariants(next)
                    }}
                    placeholder="Variant name"
                  />
                  <input
                    className="growth-form-input"
                    style={{ width: 70 }}
                    type="number"
                    value={v.trafficPercent}
                    onChange={(e) => {
                      const next = [...formVariants]
                      next[i] = { ...next[i], trafficPercent: Number(e.target.value) }
                      setFormVariants(next)
                    }}
                    min={1}
                    max={99}
                  />
                  <span style={{ fontSize: 12, color: 'var(--af-stone-500)' }}>%</span>
                  {formVariants.length > 2 && (
                    <button
                      className="growth-btn"
                      style={{ fontSize: 11, padding: '2px 8px' }}
                      onClick={() => removeVariant(i)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {formVariants.length < 4 && (
                <button className="growth-btn" style={{ fontSize: 12, padding: '3px 10px' }} onClick={addVariant}>
                  <PiPlusBold /> Add Variant
                </button>
              )}
            </div>

            <div className="growth-modal-actions">
              <button className="growth-btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button
                className="growth-btn growth-btn--primary"
                onClick={handleCreate}
                disabled={!formName || !formHypothesis || !formMetric}
              >
                Create Experiment
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="growth-toast">{toast}</div>}
    </>
  )
}
