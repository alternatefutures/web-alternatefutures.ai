'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '../../partnerships.css'

interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'req-1', label: 'Project proposal document', checked: false },
  { id: 'req-2', label: 'Team bios and qualifications', checked: false },
  { id: 'req-3', label: 'Technical architecture diagram', checked: false },
  { id: 'req-4', label: 'Budget breakdown', checked: false },
  { id: 'req-5', label: 'Timeline with milestones', checked: false },
  { id: 'req-6', label: 'KPIs and success metrics', checked: false },
]

export default function NewGrantApplicationPage() {
  const router = useRouter()
  const [programName, setProgramName] = useState('')
  const [organization, setOrganization] = useState('')
  const [amount, setAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [assignee, setAssignee] = useState('')
  const [description, setDescription] = useState('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  function toggleChecklist(id: string) {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!programName || !organization || !amount) {
      setStatusMsg('Please fill in all required fields.')
      return
    }
    setSaving(true)
    // Simulate save
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    setStatusMsg('Grant application saved.')
    setTimeout(() => {
      router.push('/admin/partnerships/grants')
    }, 1000)
  }

  return (
    <div className="partnerships-dashboard">
      <div className="partnerships-header">
        <h1>New Grant Application</h1>
        <div className="partnerships-header-actions">
          <Link href="/admin/partnerships/grants" className="partnerships-btn-secondary">
            &larr; Grant Tracker
          </Link>
        </div>
      </div>

      {statusMsg && (
        <div className={`partnerships-status-msg ${statusMsg.includes('required') ? 'error' : 'success'}`}>
          {statusMsg}
        </div>
      )}

      <div className="partnerships-section">
        <h2>Application Details</h2>
        <form className="partnerships-form" onSubmit={handleSubmit}>
          <div className="partnerships-form-row">
            <div className="partnerships-form-group">
              <label className="partnerships-label">Program Name *</label>
              <input
                className="partnerships-input"
                placeholder="e.g. ICP Developer Grant"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
              />
            </div>
            <div className="partnerships-form-group">
              <label className="partnerships-label">Granting Organization *</label>
              <input
                className="partnerships-input"
                placeholder="e.g. DFINITY Foundation"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
          </div>

          <div className="partnerships-form-row three">
            <div className="partnerships-form-group">
              <label className="partnerships-label">Amount *</label>
              <input
                className="partnerships-input"
                placeholder="$25,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="partnerships-form-group">
              <label className="partnerships-label">Deadline</label>
              <input
                className="partnerships-input"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="partnerships-form-group">
              <label className="partnerships-label">Team Assignment</label>
              <select
                className="partnerships-select"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Select assignee</option>
                <option value="Senku">Senku</option>
                <option value="Lain">Lain</option>
                <option value="Atlas">Atlas</option>
                <option value="Argus">Argus</option>
                <option value="Quinn">Quinn</option>
              </select>
            </div>
          </div>

          <div className="partnerships-form-group">
            <label className="partnerships-label">Description / Notes</label>
            <textarea
              className="partnerships-textarea"
              rows={4}
              placeholder="Describe the grant program, requirements, and what we're applying for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Requirements Checklist */}
          <div className="partnerships-form-group">
            <label className="partnerships-label">Requirements Checklist</label>
            <div className="partnerships-checklist">
              {checklist.map((item) => (
                <div key={item.id} className="partnerships-checklist-item">
                  <input
                    type="checkbox"
                    id={item.id}
                    checked={item.checked}
                    onChange={() => toggleChecklist(item.id)}
                  />
                  <label htmlFor={item.id}>{item.label}</label>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{
                fontFamily: 'var(--af-font-machine)',
                fontSize: 11,
                color: 'var(--af-stone-400)',
              }}>
                {checklist.filter((c) => c.checked).length}/{checklist.length} completed
              </span>
            </div>
          </div>

          <div className="partnerships-form-actions">
            <button
              type="submit"
              className="partnerships-btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Submit Application'}
            </button>
            <Link href="/admin/partnerships/grants" className="partnerships-btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
