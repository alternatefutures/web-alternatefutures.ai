const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TeamRole = 'admin' | 'editor' | 'reviewer'

export type NotificationChannel = 'in_app' | 'email' | 'discord'

export type ApprovalRuleType = 'auto_approve' | 'require_review' | 'require_admin'

export type SocialPlatform =
  | 'X'
  | 'BLUESKY'
  | 'MASTODON'
  | 'LINKEDIN'
  | 'REDDIT'
  | 'DISCORD'
  | 'TELEGRAM'
  | 'THREADS'
  | 'INSTAGRAM'
  | 'FACEBOOK'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  avatar: string | null
  agentId: string | null
  notifications: NotificationChannel[]
  discordUserId: string | null
  addedAt: string
  lastActiveAt: string | null
}

export interface ApprovalRule {
  id: string
  name: string
  type: ApprovalRuleType
  platforms: SocialPlatform[]
  trustedEditors: string[]
  requiredApprovers: string[]
  minApprovals: number
  autoApproveAfterHours: number | null
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ApprovalHistoryEntry {
  id: string
  postId: string
  postContent: string
  platform: SocialPlatform
  action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'REQUESTED' | 'AUTO_APPROVED'
  actorId: string
  actorName: string
  comment: string | null
  timestamp: string
}

export interface CreateTeamMemberInput {
  name: string
  email: string
  role: TeamRole
  agentId?: string
  notifications?: NotificationChannel[]
  discordUserId?: string
}

export interface UpdateTeamMemberInput {
  name?: string
  email?: string
  role?: TeamRole
  notifications?: NotificationChannel[]
  discordUserId?: string
}

export interface CreateApprovalRuleInput {
  name: string
  type: ApprovalRuleType
  platforms: SocialPlatform[]
  trustedEditors?: string[]
  requiredApprovers?: string[]
  minApprovals?: number
  autoApproveAfterHours?: number | null
}

export interface UpdateApprovalRuleInput {
  name?: string
  type?: ApprovalRuleType
  platforms?: SocialPlatform[]
  trustedEditors?: string[]
  requiredApprovers?: string[]
  minApprovals?: number
  autoApproveAfterHours?: number | null
  enabled?: boolean
}

// ---------------------------------------------------------------------------
// Role permissions
// ---------------------------------------------------------------------------

export const ROLE_PERMISSIONS: Record<TeamRole, {
  label: string
  description: string
  canDraft: boolean
  canEdit: boolean
  canApprove: boolean
  canPublish: boolean
  canManageTeam: boolean
  canManageRules: boolean
}> = {
  admin: {
    label: 'Admin',
    description: 'Full access — can draft, approve, publish directly, and manage team settings.',
    canDraft: true,
    canEdit: true,
    canApprove: true,
    canPublish: true,
    canManageTeam: true,
    canManageRules: true,
  },
  editor: {
    label: 'Editor',
    description: 'Can create and edit drafts. Requires approval to publish unless auto-approved.',
    canDraft: true,
    canEdit: true,
    canApprove: false,
    canPublish: false,
    canManageTeam: false,
    canManageRules: false,
  },
  reviewer: {
    label: 'Reviewer',
    description: 'Can review and approve content. Cannot create new posts or publish directly.',
    canDraft: false,
    canEdit: false,
    canApprove: true,
    canPublish: false,
    canManageTeam: false,
    canManageRules: false,
  },
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_TEAM: TeamMember[] = [
  {
    id: 'member-senku',
    name: 'Senku',
    email: 'senku@alternatefutures.ai',
    role: 'admin',
    avatar: null,
    agentId: 'senku',
    notifications: ['in_app', 'discord'],
    discordUserId: null,
    addedAt: '2026-01-01T00:00:00Z',
    lastActiveAt: '2026-02-11T08:00:00Z',
  },
  {
    id: 'member-echo',
    name: 'Echo',
    email: 'echo@alternatefutures.ai',
    role: 'editor',
    avatar: null,
    agentId: 'echo',
    notifications: ['in_app', 'email', 'discord'],
    discordUserId: null,
    addedAt: '2026-01-01T00:00:00Z',
    lastActiveAt: '2026-02-11T07:30:00Z',
  },
  {
    id: 'member-hana',
    name: 'Hana',
    email: 'hana@alternatefutures.ai',
    role: 'editor',
    avatar: null,
    agentId: 'hana',
    notifications: ['in_app'],
    discordUserId: null,
    addedAt: '2026-01-05T00:00:00Z',
    lastActiveAt: '2026-02-10T16:00:00Z',
  },
  {
    id: 'member-yusuke',
    name: 'Yusuke',
    email: 'yusuke@alternatefutures.ai',
    role: 'reviewer',
    avatar: null,
    agentId: 'yusuke',
    notifications: ['in_app', 'discord'],
    discordUserId: null,
    addedAt: '2026-01-05T00:00:00Z',
    lastActiveAt: '2026-02-10T14:00:00Z',
  },
  {
    id: 'member-aria',
    name: 'Aria',
    email: 'aria@alternatefutures.ai',
    role: 'reviewer',
    avatar: null,
    agentId: 'aria',
    notifications: ['in_app', 'email'],
    discordUserId: null,
    addedAt: '2026-01-10T00:00:00Z',
    lastActiveAt: '2026-02-09T12:00:00Z',
  },
]

const SEED_RULES: ApprovalRule[] = [
  {
    id: 'rule-1',
    name: 'Auto-approve Echo on X',
    type: 'auto_approve',
    platforms: ['X', 'BLUESKY'],
    trustedEditors: ['member-echo'],
    requiredApprovers: [],
    minApprovals: 0,
    autoApproveAfterHours: null,
    enabled: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'rule-2',
    name: 'LinkedIn requires admin review',
    type: 'require_admin',
    platforms: ['LINKEDIN'],
    trustedEditors: [],
    requiredApprovers: ['member-senku'],
    minApprovals: 1,
    autoApproveAfterHours: 48,
    enabled: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'rule-3',
    name: 'Standard review for all platforms',
    type: 'require_review',
    platforms: ['X', 'BLUESKY', 'MASTODON', 'DISCORD', 'TELEGRAM', 'THREADS', 'REDDIT', 'INSTAGRAM', 'FACEBOOK'],
    trustedEditors: [],
    requiredApprovers: ['member-yusuke', 'member-aria'],
    minApprovals: 1,
    autoApproveAfterHours: null,
    enabled: true,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
]

const SEED_HISTORY: ApprovalHistoryEntry[] = [
  {
    id: 'hist-1',
    postId: 'seed-social-1',
    postContent: 'Introducing Alternate Futures -- the decentralized cloud for AI agents...',
    platform: 'X',
    action: 'APPROVED',
    actorId: 'member-echo',
    actorName: 'Echo',
    comment: 'Looks great, ship it!',
    timestamp: '2026-01-15T09:45:00Z',
  },
  {
    id: 'hist-2',
    postId: 'seed-social-2',
    postContent: 'Excited to announce Alternate Futures - the decentralized cloud platform...',
    platform: 'LINKEDIN',
    action: 'APPROVED',
    actorId: 'member-echo',
    actorName: 'Echo',
    comment: null,
    timestamp: '2026-01-15T10:15:00Z',
  },
  {
    id: 'hist-3',
    postId: 'seed-social-3',
    postContent: 'Just published: "How to Deploy Your First AI Agent on Decentralized Infrastructure"',
    platform: 'X',
    action: 'REQUESTED',
    actorId: 'member-echo',
    actorName: 'Echo',
    comment: 'Please review the tutorial announcement before it goes live',
    timestamp: '2026-02-05T09:15:00Z',
  },
  {
    id: 'hist-4',
    postId: 'seed-social-5',
    postContent: 'Hey everyone! We just shipped a new batch of framework deploy guides...',
    platform: 'DISCORD',
    action: 'CHANGES_REQUESTED',
    actorId: 'member-echo',
    actorName: 'Echo',
    comment: 'Can we add links to each individual guide?',
    timestamp: '2026-02-08T15:20:00Z',
  },
  {
    id: 'hist-5',
    postId: 'seed-social-1',
    postContent: 'Introducing Alternate Futures -- the decentralized cloud for AI agents...',
    platform: 'X',
    action: 'REQUESTED',
    actorId: 'member-hana',
    actorName: 'Hana',
    comment: null,
    timestamp: '2026-01-15T09:30:00Z',
  },
  {
    id: 'hist-6',
    postId: 'seed-social-6',
    postContent: 'New milestone: 100+ projects deployed on Alternate Futures in the first month.',
    platform: 'X',
    action: 'AUTO_APPROVED',
    actorId: 'system',
    actorName: 'System',
    comment: 'Auto-approved: Echo trusted on X (rule: Auto-approve Echo on X)',
    timestamp: '2026-02-10T11:00:00Z',
  },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// GraphQL client (authenticated)
// ---------------------------------------------------------------------------

async function authGraphqlFetch<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status}`)
  }

  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0].message)
  }
  return json.data
}

// ---------------------------------------------------------------------------
// In-memory mock store for dev mode
// ---------------------------------------------------------------------------

let mockTeam = [...SEED_TEAM]
let mockRules = [...SEED_RULES]
let mockHistory = [...SEED_HISTORY]

// ---------------------------------------------------------------------------
// Team CRUD
// ---------------------------------------------------------------------------

const TEAM_FIELDS = `id name email role avatar agentId notifications discordUserId addedAt lastActiveAt`

export async function fetchTeamMembers(token: string): Promise<TeamMember[]> {
  try {
    const data = await authGraphqlFetch<{ teamMembers: TeamMember[] }>(
      `query { teamMembers { ${TEAM_FIELDS} } }`,
      {},
      token,
    )
    return data.teamMembers
  } catch {
    if (useSeedData()) return [...mockTeam]
    return []
  }
}

export async function fetchTeamMember(token: string, id: string): Promise<TeamMember | null> {
  try {
    const data = await authGraphqlFetch<{ teamMember: TeamMember }>(
      `query TeamMember($id: ID!) { teamMember(id: $id) { ${TEAM_FIELDS} } }`,
      { id },
      token,
    )
    return data.teamMember
  } catch {
    if (useSeedData()) return mockTeam.find((m) => m.id === id) || null
    return null
  }
}

export async function createTeamMember(
  token: string,
  input: CreateTeamMemberInput,
): Promise<TeamMember> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const member: TeamMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name,
      email: input.email,
      role: input.role,
      avatar: null,
      agentId: input.agentId || null,
      notifications: input.notifications || ['in_app'],
      discordUserId: input.discordUserId || null,
      addedAt: now,
      lastActiveAt: null,
    }
    mockTeam = [member, ...mockTeam]
    return member
  }

  const data = await authGraphqlFetch<{ createTeamMember: TeamMember }>(
    `mutation CreateTeamMember($input: CreateTeamMemberInput!) { createTeamMember(input: $input) { ${TEAM_FIELDS} } }`,
    { input },
    token,
  )
  return data.createTeamMember
}

export async function updateTeamMember(
  token: string,
  id: string,
  input: UpdateTeamMemberInput,
): Promise<TeamMember> {
  // Prevent demoting the last admin
  if (input.role && input.role !== 'admin') {
    const members = await fetchTeamMembers(token)
    const target = members.find((m) => m.id === id)
    if (target?.role === 'admin') {
      const adminCount = members.filter((m) => m.role === 'admin').length
      if (adminCount <= 1) {
        throw new Error('Cannot change role: this is the last admin on the team.')
      }
    }
  }

  if (useSeedData()) {
    const idx = mockTeam.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('Member not found')
    const updated = { ...mockTeam[idx], ...input }
    mockTeam[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateTeamMember: TeamMember }>(
    `mutation UpdateTeamMember($id: ID!, $input: UpdateTeamMemberInput!) { updateTeamMember(id: $id, input: $input) { ${TEAM_FIELDS} } }`,
    { id, input },
    token,
  )
  return data.updateTeamMember
}

export async function removeTeamMember(token: string, id: string): Promise<void> {
  // Prevent removing the last admin
  const members = await fetchTeamMembers(token)
  const target = members.find((m) => m.id === id)
  if (target?.role === 'admin') {
    const adminCount = members.filter((m) => m.role === 'admin').length
    if (adminCount <= 1) {
      throw new Error('Cannot remove the last admin from the team.')
    }
  }

  if (useSeedData()) {
    mockTeam = mockTeam.filter((m) => m.id !== id)
    return
  }

  await authGraphqlFetch<{ removeTeamMember: { id: string } }>(
    `mutation RemoveTeamMember($id: ID!) { removeTeamMember(id: $id) { id } }`,
    { id },
    token,
  )
}

// ---------------------------------------------------------------------------
// Team invitations
// ---------------------------------------------------------------------------

export interface TeamInvite {
  id: string
  email: string
  role: TeamRole
  invitedBy: string
  status: 'pending' | 'accepted' | 'expired'
  createdAt: string
  expiresAt: string
}

export async function inviteTeamMember(
  token: string,
  email: string,
  role: TeamRole,
  invitedBy: string,
): Promise<TeamInvite> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const invite: TeamInvite = {
    id: `invite-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    email,
    role,
    invitedBy,
    status: 'pending',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }

  if (useSeedData()) {
    // In dev mode, just return the invite object (no email sent)
    return invite
  }

  // Send invite email via Resend (if configured)
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Alternate Futures <team@alternatefutures.ai>',
          to: [email],
          subject: `You've been invited to the Alternate Futures team`,
          html: `<p>You've been invited to join the Alternate Futures team as a <strong>${role}</strong>.</p>
<p>Sign in at <a href="https://alternatefutures.ai/admin">alternatefutures.ai/admin</a> to accept your invitation.</p>
<p>This invitation expires on ${expiresAt.toLocaleDateString()}.</p>`,
        }),
      })
    } catch {
      // Email delivery is best-effort — invite still created
    }
  }

  // Persist via GraphQL
  const data = await authGraphqlFetch<{ inviteTeamMember: TeamInvite }>(
    `mutation InviteTeamMember($email: String!, $role: String!, $invitedBy: String!) {
      inviteTeamMember(email: $email, role: $role, invitedBy: $invitedBy) {
        id email role invitedBy status createdAt expiresAt
      }
    }`,
    { email, role, invitedBy },
    token,
  )
  return data.inviteTeamMember
}

// ---------------------------------------------------------------------------
// Approval rules CRUD
// ---------------------------------------------------------------------------

const RULE_FIELDS = `id name type platforms trustedEditors requiredApprovers minApprovals autoApproveAfterHours enabled createdAt updatedAt`

export async function fetchApprovalRules(token: string): Promise<ApprovalRule[]> {
  try {
    const data = await authGraphqlFetch<{ approvalRules: ApprovalRule[] }>(
      `query { approvalRules { ${RULE_FIELDS} } }`,
      {},
      token,
    )
    return data.approvalRules
  } catch {
    if (useSeedData()) return [...mockRules]
    return []
  }
}

export async function createApprovalRule(
  token: string,
  input: CreateApprovalRuleInput,
): Promise<ApprovalRule> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const rule: ApprovalRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name,
      type: input.type,
      platforms: input.platforms,
      trustedEditors: input.trustedEditors || [],
      requiredApprovers: input.requiredApprovers || [],
      minApprovals: input.minApprovals || 1,
      autoApproveAfterHours: input.autoApproveAfterHours ?? null,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    }
    mockRules = [rule, ...mockRules]
    return rule
  }

  const data = await authGraphqlFetch<{ createApprovalRule: ApprovalRule }>(
    `mutation CreateApprovalRule($input: CreateApprovalRuleInput!) { createApprovalRule(input: $input) { ${RULE_FIELDS} } }`,
    { input },
    token,
  )
  return data.createApprovalRule
}

export async function updateApprovalRule(
  token: string,
  id: string,
  input: UpdateApprovalRuleInput,
): Promise<ApprovalRule> {
  if (useSeedData()) {
    const idx = mockRules.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Rule not found')
    const updated = { ...mockRules[idx], ...input, updatedAt: new Date().toISOString() }
    mockRules[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateApprovalRule: ApprovalRule }>(
    `mutation UpdateApprovalRule($id: ID!, $input: UpdateApprovalRuleInput!) { updateApprovalRule(id: $id, input: $input) { ${RULE_FIELDS} } }`,
    { id, input },
    token,
  )
  return data.updateApprovalRule
}

export async function deleteApprovalRule(token: string, id: string): Promise<void> {
  if (useSeedData()) {
    mockRules = mockRules.filter((r) => r.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteApprovalRule: { id: string } }>(
    `mutation DeleteApprovalRule($id: ID!) { deleteApprovalRule(id: $id) { id } }`,
    { id },
    token,
  )
}

// ---------------------------------------------------------------------------
// Approval history
// ---------------------------------------------------------------------------

export async function fetchApprovalHistory(
  token: string,
  limit = 50,
  offset = 0,
): Promise<ApprovalHistoryEntry[]> {
  try {
    const data = await authGraphqlFetch<{ approvalHistory: ApprovalHistoryEntry[] }>(
      `query ApprovalHistory($limit: Int, $offset: Int) { approvalHistory(limit: $limit, offset: $offset) { id postId postContent platform action actorId actorName comment timestamp } }`,
      { limit, offset },
      token,
    )
    return data.approvalHistory
  } catch {
    if (useSeedData()) {
      const sorted = [...mockHistory].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      return sorted.slice(offset, offset + limit)
    }
    return []
  }
}

// Re-export seed data for tests
export { SEED_TEAM, SEED_RULES, SEED_HISTORY }
