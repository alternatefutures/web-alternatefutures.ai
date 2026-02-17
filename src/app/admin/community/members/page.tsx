'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchCommunityMembers,
  updateMemberStatus,
  updateMemberRole,
  type CommunityMember,
  type CommunityPlatform,
  type MemberRole,
  type MemberStatus,
  type Badge,
} from '@/lib/community-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import '../community-admin.css'

const PLATFORM_STYLES: Record<CommunityPlatform, { bg: string; color: string; label: string }> = {
  discord: { bg: '#ECEAFF', color: '#5865F2', label: 'Discord' },
  x: { bg: '#E8F4FD', color: '#1DA1F2', label: 'X' },
  github: { bg: '#F0F0F0', color: '#24292F', label: 'GitHub' },
  bluesky: { bg: '#E8F0FE', color: '#0085FF', label: 'Bluesky' },
  mastodon: { bg: '#ECEAFF', color: '#6364FF', label: 'Mastodon' },
  reddit: { bg: '#FFF0E8', color: '#FF4500', label: 'Reddit' },
}

const ROLE_STYLES: Record<MemberRole, { bg: string; color: string }> = {
  admin: { bg: '#FEE2E2', color: '#991B1B' },
  moderator: { bg: '#E0E7FF', color: '#3730A3' },
  contributor: { bg: '#D1FAE5', color: '#065F46' },
  member: { bg: '#F3F4F6', color: '#6B7280' },
}

const BADGE_STYLES: Record<Badge, { bg: string; color: string; label: string }> = {
  'early-adopter': { bg: '#FEF3C7', color: '#92400E', label: 'Early Adopter' },
  'top-contributor': { bg: '#D1FAE5', color: '#065F46', label: 'Top Contributor' },
  'bug-hunter': { bg: '#FEE2E2', color: '#991B1B', label: 'Bug Hunter' },
  'event-speaker': { bg: '#E0E7FF', color: '#3730A3', label: 'Speaker' },
  'beta-tester': { bg: '#DBEAFE', color: '#1E40AF', label: 'Beta Tester' },
  ambassador: { bg: '#ECEAFF', color: '#5865F2', label: 'Ambassador' },
}

export default function MembersPage() {
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [platformFilter, setPlatformFilter] = useState('ALL')
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const data = await fetchCommunityMembers(token)
        setMembers(data)
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = members
    if (roleFilter !== 'ALL') result = result.filter((m) => m.role === roleFilter)
    if (statusFilter !== 'ALL') result = result.filter((m) => m.status === statusFilter)
    if (platformFilter !== 'ALL') result = result.filter((m) => m.platform === platformFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
      )
    }
    return result.sort((a, b) => b.activityScore - a.activityScore)
  }, [members, roleFilter, statusFilter, platformFilter, search])

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    muted: members.filter((m) => m.status === 'muted').length,
    banned: members.filter((m) => m.status === 'banned').length,
  }), [members])

  const handleStatusChange = useCallback(async (memberId: string, status: MemberStatus) => {
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateMemberStatus(token, memberId, status)
      setMembers((prev) => prev.map((m) => m.id === memberId ? updated : m))
      if (selectedMember?.id === memberId) setSelectedMember(updated)
    } catch {
      // silently handle
    }
  }, [selectedMember])

  const handleRoleChange = useCallback(async (memberId: string, role: MemberRole) => {
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateMemberRole(token, memberId, role)
      setMembers((prev) => prev.map((m) => m.id === memberId ? updated : m))
      if (selectedMember?.id === memberId) setSelectedMember(updated)
    } catch {
      // silently handle
    }
  }, [selectedMember])

  if (loading) {
    return <div className="community-admin-empty"><p>Loading members...</p></div>
  }

  return (
    <>
      <div className="community-admin-header">
        <h1>Member Directory</h1>
        <Link href="/admin/community" className="community-admin-action-btn">Inbox</Link>
      </div>

      <div className="community-subnav">
        <Link href="/admin/community" className="">Inbox</Link>
        <Link href="/admin/community/dashboard" className="">Growth</Link>
        <Link href="/admin/community/events" className="">Events</Link>
        <Link href="/admin/community/forums" className="">Forums</Link>
        <Link href="/admin/community/engagement" className="">Engagement</Link>
        <Link href="/admin/community/members" className="active">Members</Link>
      </div>

      <div className="community-admin-stats">
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Total Members</div>
          <div className="community-admin-stat-value">{stats.total}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Active</div>
          <div className="community-admin-stat-value">{stats.active}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Muted</div>
          <div className="community-admin-stat-value">{stats.muted}</div>
        </div>
        <div className="community-admin-stat-card">
          <div className="community-admin-stat-label">Banned</div>
          <div className="community-admin-stat-value">{stats.banned}</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <div className="community-admin-filters">
        <input
          type="text"
          className="community-admin-search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="community-admin-select" value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
          <option value="ALL">All platforms</option>
          <option value="discord">Discord</option>
          <option value="x">X</option>
          <option value="github">GitHub</option>
          <option value="bluesky">Bluesky</option>
          <option value="mastodon">Mastodon</option>
          <option value="reddit">Reddit</option>
        </select>
        <select className="community-admin-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="ALL">All roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="contributor">Contributor</option>
          <option value="member">Member</option>
        </select>
        <select className="community-admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="active">Active</option>
          <option value="muted">Muted</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="community-admin-empty">
          <h2>No members found</h2>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="community-member-list">
          {filtered.map((member) => {
            const ps = PLATFORM_STYLES[member.platform]
            const rs = ROLE_STYLES[member.role]
            return (
              <div
                key={member.id}
                className={`community-member-item${member.status === 'banned' ? ' banned' : ''}${member.status === 'muted' ? ' muted' : ''}`}
              >
                <div
                  className="community-member-avatar"
                  onClick={() => setSelectedMember(member)}
                  style={{ cursor: 'pointer' }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="community-member-info" onClick={() => setSelectedMember(member)} style={{ cursor: 'pointer' }}>
                  <div className="community-member-name">
                    {member.name}
                    <span className="community-admin-chip" style={{ background: ps.bg, color: ps.color, marginLeft: 6 }}>{ps.label}</span>
                    <span className="community-admin-chip" style={{ background: rs.bg, color: rs.color, marginLeft: 4 }}>{member.role}</span>
                    {member.status !== 'active' && (
                      <span className="community-admin-chip" style={{ background: member.status === 'banned' ? '#FEE2E2' : '#FEF3C7', color: member.status === 'banned' ? '#991B1B' : '#92400E', marginLeft: 4 }}>
                        {member.status}
                      </span>
                    )}
                  </div>
                  {member.bio && <div className="community-member-bio">{member.bio}</div>}
                  {member.badges.length > 0 && (
                    <div className="community-member-badges">
                      {member.badges.map((badge) => {
                        const bs = BADGE_STYLES[badge]
                        return (
                          <span key={badge} className="community-member-badge" style={{ background: bs.bg, color: bs.color }}>
                            {bs.label}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="community-member-stats">
                  <div>
                    <span className="community-member-stat-val">{member.activityScore}</span>
                    Score
                  </div>
                  <div>
                    <span className="community-member-stat-val">{member.messageCount}</span>
                    Msgs
                  </div>
                </div>
                <div className="community-member-actions">
                  {member.status === 'active' && (
                    <>
                      <button className="community-admin-action-btn" onClick={() => handleStatusChange(member.id, 'muted')}>Mute</button>
                      <button className="community-admin-action-btn danger" onClick={() => handleStatusChange(member.id, 'banned')}>Ban</button>
                    </>
                  )}
                  {member.status === 'muted' && (
                    <button className="community-admin-action-btn" onClick={() => handleStatusChange(member.id, 'active')}>Unmute</button>
                  )}
                  {member.status === 'banned' && (
                    <button className="community-admin-action-btn" onClick={() => handleStatusChange(member.id, 'active')}>Unban</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="community-member-detail-overlay" onClick={() => setSelectedMember(null)}>
          <div className="community-member-detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="community-member-detail-header">
              <div className="community-member-detail-avatar">
                {selectedMember.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="community-member-detail-name">{selectedMember.name}</div>
                <div className="community-member-detail-email">{selectedMember.email}</div>
              </div>
            </div>

            {selectedMember.bio && (
              <div style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>
                {selectedMember.bio}
              </div>
            )}

            <div className="community-member-detail-section">
              <div className="community-member-detail-section-title">Details</div>
              <div className="community-member-detail-row"><dt>Platform</dt><dd>{PLATFORM_STYLES[selectedMember.platform].label}</dd></div>
              <div className="community-member-detail-row"><dt>Joined</dt><dd>{new Date(selectedMember.joinDate).toLocaleDateString()}</dd></div>
              <div className="community-member-detail-row"><dt>Last Active</dt><dd>{new Date(selectedMember.lastActive).toLocaleDateString()}</dd></div>
              <div className="community-member-detail-row"><dt>Activity Score</dt><dd>{selectedMember.activityScore}</dd></div>
              <div className="community-member-detail-row"><dt>Messages</dt><dd>{selectedMember.messageCount}</dd></div>
            </div>

            <div className="community-member-detail-section">
              <div className="community-member-detail-section-title">Role</div>
              <select
                className="community-form-input"
                value={selectedMember.role}
                onChange={(e) => handleRoleChange(selectedMember.id, e.target.value as MemberRole)}
                style={{ marginBottom: 8 }}
              >
                <option value="member">Member</option>
                <option value="contributor">Contributor</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {selectedMember.badges.length > 0 && (
              <div className="community-member-detail-section">
                <div className="community-member-detail-section-title">Badges</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {selectedMember.badges.map((badge) => {
                    const bs = BADGE_STYLES[badge]
                    return (
                      <span key={badge} className="community-member-badge" style={{ background: bs.bg, color: bs.color }}>
                        {bs.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="community-member-detail-section">
              <div className="community-member-detail-section-title">Actions</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedMember.status === 'active' && (
                  <>
                    <button className="community-admin-action-btn" onClick={() => handleStatusChange(selectedMember.id, 'muted')}>Mute</button>
                    <button className="community-admin-action-btn danger" onClick={() => handleStatusChange(selectedMember.id, 'banned')}>Ban</button>
                  </>
                )}
                {selectedMember.status === 'muted' && (
                  <button className="community-admin-action-btn" onClick={() => handleStatusChange(selectedMember.id, 'active')}>Unmute</button>
                )}
                {selectedMember.status === 'banned' && (
                  <button className="community-admin-action-btn" onClick={() => handleStatusChange(selectedMember.id, 'active')}>Unban</button>
                )}
                <button className="community-admin-action-btn" onClick={() => setSelectedMember(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
