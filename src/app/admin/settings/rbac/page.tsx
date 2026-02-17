'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PiShieldCheckBold,
  PiPlusBold,
  PiUsersBold,
  PiGridFourBold,
} from 'react-icons/pi'
import {
  fetchRoles,
  fetchPermissions,
  fetchRoleAssignments,
  createRole,
  updateRole,
  deleteRole,
  assignRole,
  type RoleDefinition,
  type Permission,
  type RoleAssignment,
  type CreateRoleInput,
} from '@/lib/settings-api'
import { getCookieValue } from '@/lib/cookies'
import '../team-settings.css'
import '../settings-enterprise.css'

type TabView = 'roles' | 'matrix' | 'assignments'

export default function RBACPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [assignments, setAssignments] = useState<RoleAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabView>('roles')
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoleDefinition | null>(null)
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null)

  // Create form state
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPerms, setFormPerms] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [rolesData, permsData, assignData] = await Promise.all([
        fetchRoles(token),
        fetchPermissions(token),
        fetchRoleAssignments(token),
      ])
      setRoles(rolesData)
      setPermissions(permsData)
      setAssignments(assignData)
      setLoading(false)
    }
    load()
  }, [])

  const togglePerm = useCallback((key: string) => {
    setFormPerms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }, [])

  const resetForm = useCallback(() => {
    setFormName('')
    setFormDesc('')
    setFormPerms([])
  }, [])

  const handleCreate = useCallback(async () => {
    setSubmitting(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const input: CreateRoleInput = {
        name: formName.trim(),
        description: formDesc.trim(),
        permissions: formPerms,
      }
      const created = await createRole(token, input)
      setRoles((prev) => [created, ...prev])
      setStatusMsg({ type: 'success', text: `Role "${created.name}" created.` })
      setShowCreate(false)
      resetForm()
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to create role.' })
    } finally {
      setSubmitting(false)
    }
  }, [formName, formDesc, formPerms, resetForm])

  const handleUpdatePermission = useCallback(async (roleId: string, permKey: string, checked: boolean) => {
    const role = roles.find((r) => r.id === roleId)
    if (!role || role.isSystem) return
    const token = getCookieValue('af_access_token')
    const newPerms = checked
      ? [...role.permissions, permKey]
      : role.permissions.filter((p) => p !== permKey)
    try {
      const updated = await updateRole(token, roleId, { permissions: newPerms })
      setRoles((prev) => prev.map((r) => (r.id === roleId ? updated : r)))
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to update permissions.' })
    }
  }, [roles])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteRole(token, deleteTarget.id)
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setStatusMsg({ type: 'success', text: `Role "${deleteTarget.name}" deleted.` })
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to delete role.' })
    } finally {
      setSubmitting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  const handleAssign = useCallback(async (memberId: string, roleId: string) => {
    const token = getCookieValue('af_access_token')
    try {
      const updated = await assignRole(token, memberId, roleId)
      setAssignments((prev) =>
        prev.map((a) => (a.memberId === memberId ? updated : a)),
      )
      setStatusMsg({ type: 'success', text: `Role updated for ${updated.memberName}.` })
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to assign role.' })
    }
  }, [])

  const permCategories = [...new Set(permissions.map((p) => p.category))]

  return (
    <>
      <div className="team-admin-header">
        <div>
          <h1>Access Control</h1>
          <p className="team-admin-subtitle">
            Define roles, manage permission matrices, and assign access levels to team members.
          </p>
        </div>
        <button
          type="button"
          className="team-admin-primary-btn"
          onClick={() => { setShowCreate(true); resetForm() }}
        >
          <PiPlusBold style={{ marginRight: 6, verticalAlign: 'middle' }} />
          New Role
        </button>
      </div>

      {statusMsg && (
        <div className={`team-status-msg ${statusMsg.type}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Section tabs */}
      <div className="settings-section-tabs">
        <button
          type="button"
          className={`settings-section-tab${activeTab === 'roles' ? ' active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <PiShieldCheckBold style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Roles
        </button>
        <button
          type="button"
          className={`settings-section-tab${activeTab === 'matrix' ? ' active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          <PiGridFourBold style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Permission Matrix
        </button>
        <button
          type="button"
          className={`settings-section-tab${activeTab === 'assignments' ? ' active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <PiUsersBold style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Assignments
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="team-admin-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="team-skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="team-skeleton-block w-32" />
              <div className="team-skeleton-block w-24" />
              <div className="team-skeleton-block w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Roles tab */}
      {!loading && activeTab === 'roles' && (
        <>
          {roles.length === 0 && (
            <div className="team-admin-empty">
              <div className="team-admin-empty-icon"><PiShieldCheckBold /></div>
              <h2>No roles defined</h2>
              <p>Create roles to control what team members can do.</p>
            </div>
          )}

          <div className="rbac-role-cards">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`rbac-role-card${selectedRole?.id === role.id ? ' selected' : ''}`}
                onClick={() => setSelectedRole(role)}
              >
                <div className="rbac-role-card-header">
                  <span className="rbac-role-card-name">{role.name}</span>
                  <span className={`rbac-role-card-badge${role.isSystem ? ' system' : ''}`}>
                    {role.isSystem ? 'System' : 'Custom'}
                  </span>
                </div>
                <div className="rbac-role-card-desc">{role.description}</div>
                <div className="rbac-role-card-footer">
                  <span className="rbac-role-card-count">
                    {role.memberCount} member{role.memberCount !== 1 ? 's' : ''}
                  </span>
                  <span className="rbac-role-card-perms">
                    {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {!role.isSystem && (
                  <div style={{ marginTop: 'var(--af-space-palm)' }}>
                    <button
                      type="button"
                      className="team-action-btn danger"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(role) }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Permission matrix tab */}
      {!loading && activeTab === 'matrix' && (
        <div className="rbac-permission-matrix">
          <table className="rbac-matrix-table">
            <thead>
              <tr>
                <th>Permission</th>
                {roles.map((role) => (
                  <th key={role.id}>{role.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permCategories.map((cat) => (
                <>
                  <tr key={`cat-${cat}`} className="rbac-category-row">
                    <td colSpan={roles.length + 1}>{cat}</td>
                  </tr>
                  {permissions
                    .filter((p) => p.category === cat)
                    .map((perm) => (
                      <tr key={perm.key}>
                        <td>
                          <div className="rbac-perm-label">{perm.label}</div>
                          <div className="rbac-perm-desc">{perm.description}</div>
                        </td>
                        {roles.map((role) => (
                          <td key={role.id}>
                            <input
                              type="checkbox"
                              className="rbac-perm-check"
                              checked={role.permissions.includes(perm.key)}
                              disabled={role.isSystem}
                              onChange={(e) => handleUpdatePermission(role.id, perm.key, e.target.checked)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignments tab */}
      {!loading && activeTab === 'assignments' && (
        <>
          {assignments.length === 0 && (
            <div className="team-admin-empty">
              <div className="team-admin-empty-icon"><PiUsersBold /></div>
              <h2>No assignments</h2>
              <p>Role assignments will appear here as you add team members.</p>
            </div>
          )}

          <div className="rbac-assignment-list">
            {assignments.map((a) => (
              <div key={a.memberId} className="rbac-assignment-row">
                <div className="team-member-avatar">
                  {a.memberName.charAt(0).toUpperCase()}
                </div>
                <span className="rbac-assignment-name">{a.memberName}</span>
                <span className="rbac-assignment-email">{a.memberEmail}</span>
                <select
                  className="rbac-assignment-select"
                  value={a.roleId}
                  onChange={(e) => handleAssign(a.memberId, e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create role dialog */}
      {showCreate && (
        <div className="team-admin-dialog-overlay" onClick={() => setShowCreate(false)}>
          <div className="team-admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>New Custom Role</h3>
            <p>Define a custom role with specific permissions for your team.</p>

            <div className="team-form-group">
              <label className="team-form-label">Role Name</label>
              <input
                type="text"
                className="team-form-input"
                placeholder="e.g., Content Manager"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Description</label>
              <textarea
                className="team-form-textarea"
                placeholder="Describe what this role can do..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>

            <div className="team-form-group">
              <label className="team-form-label">Permissions</label>
              {permCategories.map((cat) => (
                <div key={cat} style={{ marginBottom: 'var(--af-space-palm)' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--af-type-xs)', color: 'var(--af-stone-600)', marginBottom: 'var(--af-space-grain)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {cat}
                  </div>
                  <div className="team-platform-grid">
                    {permissions
                      .filter((p) => p.category === cat)
                      .map((perm) => (
                        <label
                          key={perm.key}
                          className={`team-platform-toggle${formPerms.includes(perm.key) ? ' selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={formPerms.includes(perm.key)}
                            onChange={() => togglePerm(perm.key)}
                          />
                          {perm.label}
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="team-admin-dialog-actions">
              <button type="button" className="team-admin-dialog-cancel" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="team-admin-primary-btn"
                onClick={handleCreate}
                disabled={submitting || !formName.trim() || formPerms.length === 0}
              >
                {submitting ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="team-admin-dialog-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="team-admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Role</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              Members with this role will lose their permissions.
            </p>
            <div className="team-admin-dialog-actions">
              <button type="button" className="team-admin-dialog-cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="team-action-btn danger"
                onClick={handleDelete}
                disabled={submitting}
                style={{ padding: 'var(--af-space-breath) var(--af-space-hand)' }}
              >
                {submitting ? 'Deleting...' : 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
