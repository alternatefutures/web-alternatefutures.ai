'use client'

import { useState, useEffect, useCallback } from 'react'
import { PiUsersBold, PiPlusBold } from 'react-icons/pi'
import {
  fetchTeamMembers,
  createTeamMember,
  updateTeamMember,
  removeTeamMember,
  ROLE_PERMISSIONS,
  type TeamMember,
  type TeamRole,
  type CreateTeamMemberInput,
  type NotificationChannel,
} from '@/lib/team-api'
import { getCookieValue } from '@/lib/cookies'
import '../team-settings.css'

function formatDate(iso: string | null) {
  if (!iso) return '--'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

type DialogMode = 'add' | 'edit' | 'remove' | null

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState<TeamRole>('editor')
  const [formNotifs, setFormNotifs] = useState<NotificationChannel[]>(['in_app'])

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchTeamMembers(token)
      setMembers(data)
      setLoading(false)
    }
    load()
  }, [])

  const openAdd = useCallback(() => {
    setDialogMode('add')
    setEditTarget(null)
    setFormName('')
    setFormEmail('')
    setFormRole('editor')
    setFormNotifs(['in_app'])
  }, [])

  const openEdit = useCallback((member: TeamMember) => {
    setDialogMode('edit')
    setEditTarget(member)
    setFormName(member.name)
    setFormEmail(member.email)
    setFormRole(member.role)
    setFormNotifs([...member.notifications])
  }, [])

  const openRemove = useCallback((member: TeamMember) => {
    setDialogMode('remove')
    setEditTarget(member)
  }, [])

  const closeDialog = useCallback(() => {
    setDialogMode(null)
    setEditTarget(null)
  }, [])

  const toggleNotif = useCallback((channel: NotificationChannel) => {
    setFormNotifs((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    )
  }, [])

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      if (dialogMode === 'add') {
        const input: CreateTeamMemberInput = {
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          notifications: formNotifs,
        }
        const created = await createTeamMember(token, input)
        setMembers((prev) => [created, ...prev])
        setStatusMsg({ type: 'success', text: `${created.name} added to the team.` })
      } else if (dialogMode === 'edit' && editTarget) {
        const updated = await updateTeamMember(token, editTarget.id, {
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          notifications: formNotifs,
        })
        setMembers((prev) => prev.map((m) => (m.id === editTarget.id ? updated : m)))
        setStatusMsg({ type: 'success', text: `${updated.name} updated.` })
      } else if (dialogMode === 'remove' && editTarget) {
        await removeTeamMember(token, editTarget.id)
        setMembers((prev) => prev.filter((m) => m.id !== editTarget.id))
        setStatusMsg({ type: 'success', text: `${editTarget.name} removed from team.` })
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
      closeDialog()
    }
  }, [dialogMode, editTarget, formName, formEmail, formRole, formNotifs, closeDialog])

  const admins = members.filter((m) => m.role === 'admin')
  const editors = members.filter((m) => m.role === 'editor')
  const reviewers = members.filter((m) => m.role === 'reviewer')

  return (
    <>
      <div className="team-admin-header">
        <div>
          <h1>Team</h1>
          <p className="team-admin-subtitle">Manage who can create, review, and publish content.</p>
        </div>
        <button type="button" className="team-admin-primary-btn" onClick={openAdd}>
          <PiPlusBold style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Add Member
        </button>
      </div>

      {statusMsg && (
        <div className={`team-status-msg ${statusMsg.type}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Stats */}
      <div className="team-admin-stats">
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Total</div>
          <div className="team-admin-stat-value">{members.length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Admins</div>
          <div className="team-admin-stat-value">{admins.length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Editors</div>
          <div className="team-admin-stat-value">{editors.length}</div>
        </div>
        <div className="team-admin-stat">
          <div className="team-admin-stat-label">Reviewers</div>
          <div className="team-admin-stat-value">{reviewers.length}</div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="team-admin-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="team-skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="team-skeleton-circle" />
              <div className="team-skeleton-block w-32" />
              <div className="team-skeleton-block w-20" />
              <div className="team-skeleton-block w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && members.length === 0 && (
        <div className="team-admin-empty">
          <div className="team-admin-empty-icon">
            <PiUsersBold />
          </div>
          <h2>No team members</h2>
          <p>Add team members to start managing content approval workflows.</p>
        </div>
      )}

      {/* Table */}
      {!loading && members.length > 0 && (
        <div className="team-admin-table-wrap">
          <table className="team-admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Notifications</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const perms = ROLE_PERMISSIONS[member.role]
                return (
                  <tr key={member.id}>
                    <td>
                      <div className="team-member-cell">
                        <div className="team-member-avatar">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="team-member-name">{member.name}</div>
                          <div className="team-member-email">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`team-role-chip ${member.role}`}>
                        {perms.label}
                      </span>
                    </td>
                    <td>
                      <div className="team-notif-chips">
                        {perms.canDraft && <span className="team-notif-chip">Draft</span>}
                        {perms.canApprove && <span className="team-notif-chip">Approve</span>}
                        {perms.canPublish && <span className="team-notif-chip">Publish</span>}
                        {perms.canManageTeam && <span className="team-notif-chip">Manage</span>}
                      </div>
                    </td>
                    <td>
                      <div className="team-notif-chips">
                        {member.notifications.map((n) => (
                          <span key={n} className="team-notif-chip">
                            {n === 'in_app' ? 'In-App' : n === 'email' ? 'Email' : 'Discord'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--af-font-machine)', fontSize: 'var(--af-type-xs)', color: 'var(--af-stone-400)' }}>
                      {formatDate(member.addedAt)}
                    </td>
                    <td>
                      <div className="team-action-btns">
                        <button type="button" className="team-action-btn" onClick={() => openEdit(member)}>
                          Edit
                        </button>
                        <button type="button" className="team-action-btn danger" onClick={() => openRemove(member)}>
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Role legend */}
      {!loading && (
        <div style={{ marginTop: 'var(--af-space-arm)' }}>
          <h2 style={{ fontFamily: 'var(--af-font-poet)', fontSize: 'var(--af-type-md)', fontWeight: 400, color: 'var(--af-stone-700)', marginBottom: 'var(--af-space-hand)' }}>
            Role Permissions
          </h2>
          <div className="team-rule-list">
            {(Object.entries(ROLE_PERMISSIONS) as [TeamRole, typeof ROLE_PERMISSIONS[TeamRole]][]).map(([key, perm]) => (
              <div key={key} className="team-rule-card">
                <div className="team-rule-card-header">
                  <span className="team-rule-card-name">{perm.label}</span>
                  <span className={`team-role-chip ${key}`}>{key}</span>
                </div>
                <p className="team-rule-card-meta">{perm.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      {(dialogMode === 'add' || dialogMode === 'edit') && (
        <div className="team-admin-dialog-overlay" onClick={closeDialog}>
          <div className="team-admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{dialogMode === 'add' ? 'Add Team Member' : 'Edit Team Member'}</h3>
            <p>
              {dialogMode === 'add'
                ? 'Add a new member to your content team.'
                : `Update ${editTarget?.name}'s details and role.`}
            </p>

            <div className="team-form-group">
              <label className="team-form-label">Name</label>
              <input
                type="text"
                className="team-form-input"
                placeholder="Enter name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Email</label>
              <input
                type="email"
                className="team-form-input"
                placeholder="name@alternatefutures.ai"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Role</label>
              <select
                className="team-form-select"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as TeamRole)}
              >
                <option value="admin">Admin — Full access, can publish directly</option>
                <option value="editor">Editor — Can draft and edit, requires approval</option>
                <option value="reviewer">Reviewer — Can review and approve content</option>
              </select>
              <p className="team-form-hint">{ROLE_PERMISSIONS[formRole].description}</p>
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Notifications</label>
              <div className="team-checkbox-group">
                {([['in_app', 'In-App'], ['email', 'Email'], ['discord', 'Discord']] as const).map(([ch, label]) => (
                  <label key={ch} className="team-checkbox-item">
                    <input
                      type="checkbox"
                      checked={formNotifs.includes(ch)}
                      onChange={() => toggleNotif(ch)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="team-admin-dialog-actions">
              <button type="button" className="team-admin-dialog-cancel" onClick={closeDialog}>
                Cancel
              </button>
              <button
                type="button"
                className="team-admin-primary-btn"
                onClick={handleSubmit}
                disabled={submitting || !formName.trim() || !formEmail.trim()}
              >
                {submitting ? 'Saving...' : dialogMode === 'add' ? 'Add Member' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Dialog */}
      {dialogMode === 'remove' && editTarget && (
        <div className="team-admin-dialog-overlay" onClick={closeDialog}>
          <div className="team-admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Team Member</h3>
            <p>
              Are you sure you want to remove <strong>{editTarget.name}</strong> from the team?
              They will lose all access to content management and approval workflows.
            </p>

            <div className="team-admin-dialog-actions">
              <button type="button" className="team-admin-dialog-cancel" onClick={closeDialog}>
                Cancel
              </button>
              <button
                type="button"
                className="team-action-btn danger"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: 'var(--af-space-breath) var(--af-space-hand)' }}
              >
                {submitting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
