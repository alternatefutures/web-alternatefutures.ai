'use client'

import { useState, useEffect, useCallback } from 'react'
import { PiBellBold } from 'react-icons/pi'
import {
  fetchTeamMembers,
  updateTeamMember,
  type TeamMember,
  type NotificationChannel,
} from '@/lib/team-api'
import { getCookieValue } from '@/lib/cookies'
import '../team-settings.css'

const CHANNELS: { id: NotificationChannel; label: string; description: string }[] = [
  { id: 'in_app', label: 'In-App', description: 'Notifications inside the admin dashboard' },
  { id: 'email', label: 'Email', description: 'Email alerts for approval requests' },
  { id: 'discord', label: 'Discord', description: 'DM or channel notifications via Discord bot' },
]

export default function NotificationsPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const data = await fetchTeamMembers(token)
      setMembers(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleToggleChannel = useCallback(async (memberId: string, channel: NotificationChannel) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return

    const newNotifs = member.notifications.includes(channel)
      ? member.notifications.filter((c) => c !== channel)
      : [...member.notifications, channel]

    setSaving(memberId)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateTeamMember(token, memberId, { notifications: newNotifs })
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)))
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to update notification preferences.' })
    } finally {
      setSaving(null)
    }
  }, [members])

  const handleDiscordId = useCallback(async (memberId: string, discordUserId: string) => {
    setSaving(memberId)
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateTeamMember(token, memberId, {
        discordUserId: discordUserId.trim() || undefined,
      })
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)))
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to update Discord ID.' })
    } finally {
      setSaving(null)
    }
  }, [])

  return (
    <>
      <div className="team-admin-header">
        <div>
          <h1>Notifications</h1>
          <p className="team-admin-subtitle">
            Configure how each team member receives approval notifications.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className={`team-status-msg ${statusMsg.type}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="team-admin-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="team-skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="team-skeleton-circle" />
              <div className="team-skeleton-block w-32" />
              <div className="team-skeleton-block w-24" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && members.length === 0 && (
        <div className="team-admin-empty">
          <div className="team-admin-empty-icon">
            <PiBellBold />
          </div>
          <h2>No team members</h2>
          <p>Add team members first to configure their notification preferences.</p>
        </div>
      )}

      {/* Member cards */}
      {!loading && members.length > 0 && (
        <div className="team-notif-members-list">
          {members.map((member) => (
            <div key={member.id} className="team-notif-member-card">
              <div className="team-notif-member-header">
                <div className="team-member-avatar">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="team-notif-member-name">{member.name}</div>
                  <div className="team-member-email">{member.email}</div>
                </div>
                <span className={`team-role-chip ${member.role}`} style={{ marginLeft: 'auto' }}>
                  {member.role}
                </span>
              </div>

              <div className="team-notif-channels">
                {CHANNELS.map((ch) => {
                  const isActive = member.notifications.includes(ch.id)
                  return (
                    <label
                      key={ch.id}
                      className={`team-notif-channel-toggle${isActive ? ' active' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handleToggleChannel(member.id, ch.id)}
                        disabled={saving === member.id}
                      />
                      <div>
                        <div className="team-notif-channel-label">{ch.label}</div>
                        <div className="team-notif-channel-desc">{ch.description}</div>
                      </div>
                    </label>
                  )
                })}
              </div>

              {member.notifications.includes('discord') && (
                <div className="team-notif-discord-row">
                  <span className="team-notif-discord-label">Discord User ID:</span>
                  <input
                    type="text"
                    className="team-notif-discord-input"
                    placeholder="e.g., 123456789012345678"
                    defaultValue={member.discordUserId || ''}
                    onBlur={(e) => handleDiscordId(member.id, e.target.value)}
                  />
                  <span className="team-form-hint" style={{ margin: 0 }}>
                    Used for @mentions in Discord notifications
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
