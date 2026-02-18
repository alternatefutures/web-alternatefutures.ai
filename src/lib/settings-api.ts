const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types — RBAC
// ---------------------------------------------------------------------------

export interface Permission {
  id: string
  key: string
  label: string
  description: string
  category: string
}

export interface RoleDefinition {
  id: string
  name: string
  description: string
  isSystem: boolean
  permissions: string[]
  memberCount: number
  createdAt: string
  updatedAt: string
}

export interface RoleAssignment {
  memberId: string
  memberName: string
  memberEmail: string
  roleId: string
  roleName: string
  assignedAt: string
  assignedBy: string
}

export interface CreateRoleInput {
  name: string
  description: string
  permissions: string[]
}

export interface UpdateRoleInput {
  name?: string
  description?: string
  permissions?: string[]
}

// ---------------------------------------------------------------------------
// Types — SSO
// ---------------------------------------------------------------------------

export type SSOProtocol = 'saml' | 'oidc'
export type SSOStatus = 'active' | 'inactive' | 'pending_verification'

export interface SSOProvider {
  id: string
  name: string
  protocol: SSOProtocol
  status: SSOStatus
  domain: string
  domainVerified: boolean
  entityId: string | null
  metadataUrl: string | null
  clientId: string | null
  issuerUrl: string | null
  jitProvisioning: boolean
  defaultRole: string
  createdAt: string
  updatedAt: string
}

export interface CreateSSOProviderInput {
  name: string
  protocol: SSOProtocol
  domain: string
  entityId?: string
  metadataUrl?: string
  clientId?: string
  clientSecret?: string
  issuerUrl?: string
  jitProvisioning?: boolean
  defaultRole?: string
}

export interface UpdateSSOProviderInput {
  name?: string
  entityId?: string
  metadataUrl?: string
  clientId?: string
  clientSecret?: string
  issuerUrl?: string
  jitProvisioning?: boolean
  defaultRole?: string
  status?: SSOStatus
}

// ---------------------------------------------------------------------------
// Types — Webhooks
// ---------------------------------------------------------------------------

export type WebhookEventType =
  | 'post.created'
  | 'post.published'
  | 'post.deleted'
  | 'approval.requested'
  | 'approval.approved'
  | 'approval.rejected'
  | 'member.added'
  | 'member.removed'
  | 'deployment.started'
  | 'deployment.completed'
  | 'deployment.failed'

export type WebhookStatus = 'active' | 'inactive' | 'failing'

export interface WebhookEndpoint {
  id: string
  url: string
  description: string
  events: WebhookEventType[]
  status: WebhookStatus
  signingSecret: string
  retryEnabled: boolean
  maxRetries: number
  createdAt: string
  updatedAt: string
  lastDeliveryAt: string | null
  successRate: number
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: WebhookEventType
  url: string
  statusCode: number | null
  success: boolean
  requestBody: string
  responseBody: string | null
  attemptNumber: number
  deliveredAt: string
  duration: number
}

export interface CreateWebhookInput {
  url: string
  description: string
  events: WebhookEventType[]
  retryEnabled?: boolean
  maxRetries?: number
}

export interface UpdateWebhookInput {
  url?: string
  description?: string
  events?: WebhookEventType[]
  status?: WebhookStatus
  retryEnabled?: boolean
  maxRetries?: number
}

// ---------------------------------------------------------------------------
// Types — Audit
// ---------------------------------------------------------------------------

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.invite'
  | 'role.create'
  | 'role.update'
  | 'role.delete'
  | 'role.assign'
  | 'sso.configure'
  | 'sso.delete'
  | 'webhook.create'
  | 'webhook.update'
  | 'webhook.delete'
  | 'post.create'
  | 'post.publish'
  | 'post.delete'
  | 'approval.approve'
  | 'approval.reject'
  | 'settings.update'
  | 'deployment.create'
  | 'deployment.delete'
  | 'api_key.create'
  | 'api_key.revoke'

export interface AuditLogEntry {
  id: string
  action: AuditAction
  actorId: string
  actorName: string
  actorEmail: string
  targetType: string
  targetId: string
  targetLabel: string
  metadata: Record<string, string>
  ipAddress: string
  userAgent: string
  timestamp: string
}

export interface AuditExportOptions {
  format: 'csv' | 'json'
  dateFrom: string
  dateTo: string
  actions?: AuditAction[]
  actorIds?: string[]
}

// ---------------------------------------------------------------------------
// Seed data — RBAC
// ---------------------------------------------------------------------------

const ALL_PERMISSIONS: Permission[] = [
  { id: 'perm-1', key: 'posts.create', label: 'Create Posts', description: 'Create new content posts', category: 'Content' },
  { id: 'perm-2', key: 'posts.edit', label: 'Edit Posts', description: 'Edit existing posts', category: 'Content' },
  { id: 'perm-3', key: 'posts.delete', label: 'Delete Posts', description: 'Delete posts permanently', category: 'Content' },
  { id: 'perm-4', key: 'posts.publish', label: 'Publish Posts', description: 'Publish posts to live platforms', category: 'Content' },
  { id: 'perm-5', key: 'approvals.review', label: 'Review Approvals', description: 'Review and approve/reject content', category: 'Approvals' },
  { id: 'perm-6', key: 'approvals.bypass', label: 'Bypass Approvals', description: 'Publish without approval', category: 'Approvals' },
  { id: 'perm-7', key: 'team.view', label: 'View Team', description: 'View team member list', category: 'Team' },
  { id: 'perm-8', key: 'team.manage', label: 'Manage Team', description: 'Add, edit, remove team members', category: 'Team' },
  { id: 'perm-9', key: 'team.invite', label: 'Invite Members', description: 'Send team invitations', category: 'Team' },
  { id: 'perm-10', key: 'roles.manage', label: 'Manage Roles', description: 'Create and edit roles', category: 'Roles' },
  { id: 'perm-11', key: 'settings.view', label: 'View Settings', description: 'View workspace settings', category: 'Settings' },
  { id: 'perm-12', key: 'settings.manage', label: 'Manage Settings', description: 'Modify workspace settings', category: 'Settings' },
  { id: 'perm-13', key: 'webhooks.manage', label: 'Manage Webhooks', description: 'Create and configure webhooks', category: 'Integrations' },
  { id: 'perm-14', key: 'sso.manage', label: 'Manage SSO', description: 'Configure SSO providers', category: 'Security' },
  { id: 'perm-15', key: 'audit.view', label: 'View Audit Log', description: 'View audit trail', category: 'Security' },
  { id: 'perm-16', key: 'audit.export', label: 'Export Audit Log', description: 'Export audit data', category: 'Security' },
  { id: 'perm-17', key: 'deployments.manage', label: 'Manage Deployments', description: 'Create and manage deployments', category: 'Infrastructure' },
  { id: 'perm-18', key: 'billing.view', label: 'View Billing', description: 'View billing and usage', category: 'Billing' },
  { id: 'perm-19', key: 'billing.manage', label: 'Manage Billing', description: 'Update payment and plans', category: 'Billing' },
  { id: 'perm-20', key: 'api_keys.manage', label: 'Manage API Keys', description: 'Create and revoke API keys', category: 'Security' },
]

const SEED_ROLES: RoleDefinition[] = [
  {
    id: 'role-owner',
    name: 'Owner',
    description: 'Full workspace access. Cannot be deleted.',
    isSystem: true,
    permissions: ALL_PERMISSIONS.map((p) => p.key),
    memberCount: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Full access except ownership transfer and billing management.',
    isSystem: true,
    permissions: ALL_PERMISSIONS.filter((p) => p.key !== 'billing.manage').map((p) => p.key),
    memberCount: 2,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role-editor',
    name: 'Editor',
    description: 'Can create, edit, and manage content. Requires approval to publish.',
    isSystem: true,
    permissions: ['posts.create', 'posts.edit', 'posts.delete', 'team.view', 'settings.view'],
    memberCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role-reviewer',
    name: 'Reviewer',
    description: 'Can review and approve content. Cannot create or publish directly.',
    isSystem: true,
    permissions: ['approvals.review', 'team.view', 'settings.view'],
    memberCount: 2,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role-custom-1',
    name: 'Content Manager',
    description: 'Full content control with team visibility. Custom role for senior editors.',
    isSystem: false,
    permissions: ['posts.create', 'posts.edit', 'posts.delete', 'posts.publish', 'approvals.review', 'approvals.bypass', 'team.view', 'team.invite'],
    memberCount: 1,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
  },
]

const SEED_ASSIGNMENTS: RoleAssignment[] = [
  { memberId: 'member-senku', memberName: 'Senku', memberEmail: 'senku@alternatefutures.ai', roleId: 'role-owner', roleName: 'Owner', assignedAt: '2026-01-01T00:00:00Z', assignedBy: 'System' },
  { memberId: 'member-echo', memberName: 'Echo', memberEmail: 'echo@alternatefutures.ai', roleId: 'role-editor', roleName: 'Editor', assignedAt: '2026-01-01T00:00:00Z', assignedBy: 'Senku' },
  { memberId: 'member-hana', memberName: 'Hana', memberEmail: 'hana@alternatefutures.ai', roleId: 'role-editor', roleName: 'Editor', assignedAt: '2026-01-05T00:00:00Z', assignedBy: 'Senku' },
  { memberId: 'member-yusuke', memberName: 'Yusuke', memberEmail: 'yusuke@alternatefutures.ai', roleId: 'role-reviewer', roleName: 'Reviewer', assignedAt: '2026-01-05T00:00:00Z', assignedBy: 'Senku' },
  { memberId: 'member-aria', memberName: 'Aria', memberEmail: 'aria@alternatefutures.ai', roleId: 'role-reviewer', roleName: 'Reviewer', assignedAt: '2026-01-10T00:00:00Z', assignedBy: 'Senku' },
  { memberId: 'member-lain', memberName: 'Lain', memberEmail: 'lain@alternatefutures.ai', roleId: 'role-admin', roleName: 'Admin', assignedAt: '2026-01-01T00:00:00Z', assignedBy: 'Senku' },
  { memberId: 'member-atlas', memberName: 'Atlas', memberEmail: 'atlas@alternatefutures.ai', roleId: 'role-admin', roleName: 'Admin', assignedAt: '2026-01-01T00:00:00Z', assignedBy: 'Senku' },
  { memberId: 'member-argus', memberName: 'Argus', memberEmail: 'argus@alternatefutures.ai', roleId: 'role-custom-1', roleName: 'Content Manager', assignedAt: '2026-02-01T00:00:00Z', assignedBy: 'Senku' },
]

// ---------------------------------------------------------------------------
// Seed data — SSO
// ---------------------------------------------------------------------------

const SEED_SSO_PROVIDERS: SSOProvider[] = [
  {
    id: 'sso-1',
    name: 'Google Workspace',
    protocol: 'oidc',
    status: 'active',
    domain: 'alternatefutures.ai',
    domainVerified: true,
    entityId: null,
    metadataUrl: null,
    clientId: 'af-google-client-id',
    issuerUrl: 'https://accounts.google.com',
    jitProvisioning: true,
    defaultRole: 'editor',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'sso-2',
    name: 'Okta',
    protocol: 'saml',
    status: 'inactive',
    domain: 'alternatefutures.okta.com',
    domainVerified: false,
    entityId: 'https://alternatefutures.okta.com/saml/metadata',
    metadataUrl: 'https://alternatefutures.okta.com/app/metadata',
    clientId: null,
    issuerUrl: null,
    jitProvisioning: false,
    defaultRole: 'reviewer',
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Seed data — Webhooks
// ---------------------------------------------------------------------------

const SEED_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'wh-1',
    url: 'https://hooks.slack.com/services/T0XXX/B0YYY/zzzz',
    description: 'Slack notifications for published posts',
    events: ['post.published', 'approval.approved', 'approval.rejected'],
    status: 'active',
    signingSecret: 'whsec_af1a2b3c4d5e6f7890abcdef',
    retryEnabled: true,
    maxRetries: 3,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
    lastDeliveryAt: '2026-02-14T18:30:00Z',
    successRate: 98.5,
  },
  {
    id: 'wh-2',
    url: 'https://api.example.com/webhooks/af-events',
    description: 'Analytics pipeline — all events',
    events: ['post.created', 'post.published', 'post.deleted', 'member.added', 'member.removed', 'deployment.started', 'deployment.completed', 'deployment.failed'],
    status: 'active',
    signingSecret: 'whsec_9876543210fedcba',
    retryEnabled: true,
    maxRetries: 5,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    lastDeliveryAt: '2026-02-14T19:15:00Z',
    successRate: 100,
  },
  {
    id: 'wh-3',
    url: 'https://old-service.internal/callback',
    description: 'Legacy deployment monitor (deprecated)',
    events: ['deployment.completed', 'deployment.failed'],
    status: 'failing',
    signingSecret: 'whsec_legacy_endpoint_abc',
    retryEnabled: false,
    maxRetries: 0,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-02-12T00:00:00Z',
    lastDeliveryAt: '2026-02-12T04:00:00Z',
    successRate: 23.1,
  },
]

const SEED_DELIVERIES: WebhookDelivery[] = [
  {
    id: 'del-1',
    webhookId: 'wh-1',
    event: 'post.published',
    url: 'https://hooks.slack.com/services/T0XXX/B0YYY/zzzz',
    statusCode: 200,
    success: true,
    requestBody: '{"event":"post.published","data":{"id":"post-42","title":"New blog post"}}',
    responseBody: '{"ok":true}',
    attemptNumber: 1,
    deliveredAt: '2026-02-14T18:30:00Z',
    duration: 245,
  },
  {
    id: 'del-2',
    webhookId: 'wh-1',
    event: 'approval.approved',
    url: 'https://hooks.slack.com/services/T0XXX/B0YYY/zzzz',
    statusCode: 200,
    success: true,
    requestBody: '{"event":"approval.approved","data":{"postId":"post-41","approver":"Senku"}}',
    responseBody: '{"ok":true}',
    attemptNumber: 1,
    deliveredAt: '2026-02-14T16:10:00Z',
    duration: 189,
  },
  {
    id: 'del-3',
    webhookId: 'wh-2',
    event: 'deployment.completed',
    url: 'https://api.example.com/webhooks/af-events',
    statusCode: 200,
    success: true,
    requestBody: '{"event":"deployment.completed","data":{"dseq":24758214,"service":"proxy"}}',
    responseBody: '{"received":true}',
    attemptNumber: 1,
    deliveredAt: '2026-02-14T19:15:00Z',
    duration: 320,
  },
  {
    id: 'del-4',
    webhookId: 'wh-3',
    event: 'deployment.failed',
    url: 'https://old-service.internal/callback',
    statusCode: null,
    success: false,
    requestBody: '{"event":"deployment.failed","data":{"dseq":24672527,"error":"timeout"}}',
    responseBody: null,
    attemptNumber: 3,
    deliveredAt: '2026-02-12T04:00:00Z',
    duration: 30000,
  },
  {
    id: 'del-5',
    webhookId: 'wh-1',
    event: 'post.published',
    url: 'https://hooks.slack.com/services/T0XXX/B0YYY/zzzz',
    statusCode: 500,
    success: false,
    requestBody: '{"event":"post.published","data":{"id":"post-39","title":"Platform update"}}',
    responseBody: '{"error":"internal server error"}',
    attemptNumber: 1,
    deliveredAt: '2026-02-13T10:00:00Z',
    duration: 1200,
  },
  {
    id: 'del-6',
    webhookId: 'wh-1',
    event: 'post.published',
    url: 'https://hooks.slack.com/services/T0XXX/B0YYY/zzzz',
    statusCode: 200,
    success: true,
    requestBody: '{"event":"post.published","data":{"id":"post-39","title":"Platform update"}}',
    responseBody: '{"ok":true}',
    attemptNumber: 2,
    deliveredAt: '2026-02-13T10:01:00Z',
    duration: 210,
  },
]

// ---------------------------------------------------------------------------
// Seed data — Audit
// ---------------------------------------------------------------------------

const SEED_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'audit-1', action: 'user.login', actorId: 'member-senku', actorName: 'Senku', actorEmail: 'senku@alternatefutures.ai',
    targetType: 'session', targetId: 'session-1', targetLabel: 'Web Login',
    metadata: { method: 'magic_link' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', timestamp: '2026-02-15T08:00:00Z',
  },
  {
    id: 'audit-2', action: 'role.create', actorId: 'member-senku', actorName: 'Senku', actorEmail: 'senku@alternatefutures.ai',
    targetType: 'role', targetId: 'role-custom-1', targetLabel: 'Content Manager',
    metadata: { permissions: '8' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', timestamp: '2026-02-01T10:30:00Z',
  },
  {
    id: 'audit-3', action: 'role.assign', actorId: 'member-senku', actorName: 'Senku', actorEmail: 'senku@alternatefutures.ai',
    targetType: 'member', targetId: 'member-argus', targetLabel: 'Argus → Content Manager',
    metadata: { previousRole: 'reviewer', newRole: 'Content Manager' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', timestamp: '2026-02-01T10:35:00Z',
  },
  {
    id: 'audit-4', action: 'sso.configure', actorId: 'member-senku', actorName: 'Senku', actorEmail: 'senku@alternatefutures.ai',
    targetType: 'sso_provider', targetId: 'sso-1', targetLabel: 'Google Workspace (OIDC)',
    metadata: { domain: 'alternatefutures.ai' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', timestamp: '2026-01-15T14:00:00Z',
  },
  {
    id: 'audit-5', action: 'webhook.create', actorId: 'member-lain', actorName: 'Lain', actorEmail: 'lain@alternatefutures.ai',
    targetType: 'webhook', targetId: 'wh-1', targetLabel: 'Slack notifications',
    metadata: { events: '3' }, ipAddress: '10.0.0.5', userAgent: 'Mozilla/5.0', timestamp: '2026-01-20T09:00:00Z',
  },
  {
    id: 'audit-6', action: 'post.publish', actorId: 'member-echo', actorName: 'Echo', actorEmail: 'echo@alternatefutures.ai',
    targetType: 'post', targetId: 'post-42', targetLabel: 'Introducing Alternate Futures',
    metadata: { platform: 'X' }, ipAddress: '172.16.0.10', userAgent: 'Mozilla/5.0', timestamp: '2026-02-14T18:25:00Z',
  },
  {
    id: 'audit-7', action: 'approval.approve', actorId: 'member-yusuke', actorName: 'Yusuke', actorEmail: 'yusuke@alternatefutures.ai',
    targetType: 'post', targetId: 'post-41', targetLabel: 'AI Agent Deployment Guide',
    metadata: { platform: 'LINKEDIN' }, ipAddress: '172.16.0.12', userAgent: 'Mozilla/5.0', timestamp: '2026-02-14T16:05:00Z',
  },
  {
    id: 'audit-8', action: 'deployment.create', actorId: 'member-atlas', actorName: 'Atlas', actorEmail: 'atlas@alternatefutures.ai',
    targetType: 'deployment', targetId: 'dseq-24758214', targetLabel: 'SSL Proxy (leet.haus)',
    metadata: { provider: 'leet.haus' }, ipAddress: '10.0.0.8', userAgent: 'curl/8.4.0', timestamp: '2026-02-08T06:00:00Z',
  },
  {
    id: 'audit-9', action: 'user.invite', actorId: 'member-senku', actorName: 'Senku', actorEmail: 'senku@alternatefutures.ai',
    targetType: 'invite', targetId: 'invite-1', targetLabel: 'quinn@alternatefutures.ai',
    metadata: { role: 'reviewer' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', timestamp: '2026-02-12T11:00:00Z',
  },
  {
    id: 'audit-10', action: 'api_key.create', actorId: 'member-lain', actorName: 'Lain', actorEmail: 'lain@alternatefutures.ai',
    targetType: 'api_key', targetId: 'key-1', targetLabel: 'CI/CD Pipeline Key',
    metadata: { scope: 'deployments' }, ipAddress: '10.0.0.5', userAgent: 'Mozilla/5.0', timestamp: '2026-02-10T15:00:00Z',
  },
  {
    id: 'audit-11', action: 'settings.update', actorId: 'member-senku', actorName: 'Senku', actorEmail: 'senku@alternatefutures.ai',
    targetType: 'settings', targetId: 'workspace', targetLabel: 'Workspace Settings',
    metadata: { field: 'default_branch', value: 'main' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', timestamp: '2026-02-05T09:00:00Z',
  },
  {
    id: 'audit-12', action: 'approval.reject', actorId: 'member-aria', actorName: 'Aria', actorEmail: 'aria@alternatefutures.ai',
    targetType: 'post', targetId: 'post-38', targetLabel: 'Community Update Draft',
    metadata: { reason: 'Tone does not match brand voice' }, ipAddress: '172.16.0.14', userAgent: 'Mozilla/5.0', timestamp: '2026-02-13T14:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// In-memory mock stores
// ---------------------------------------------------------------------------

let mockRoles = [...SEED_ROLES]
let mockAssignments = [...SEED_ASSIGNMENTS]
let mockSSOProviders = [...SEED_SSO_PROVIDERS]
let mockWebhooks = [...SEED_WEBHOOKS]
const mockDeliveries = [...SEED_DELIVERIES]
const mockAuditLog = [...SEED_AUDIT_LOG]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

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
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data
}

// ---------------------------------------------------------------------------
// RBAC API
// ---------------------------------------------------------------------------

export async function fetchPermissions(_token: string): Promise<Permission[]> {
  return [...ALL_PERMISSIONS]
}

export async function fetchRoles(token: string): Promise<RoleDefinition[]> {
  try {
    const data = await authGraphqlFetch<{ roles: RoleDefinition[] }>(
      `query { roles { id name description isSystem permissions memberCount createdAt updatedAt } }`,
      {},
      token,
    )
    return data.roles
  } catch {
    if (useSeedData()) return [...mockRoles]
    return []
  }
}

export async function createRole(token: string, input: CreateRoleInput): Promise<RoleDefinition> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const role: RoleDefinition = {
      id: `role-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name,
      description: input.description,
      isSystem: false,
      permissions: input.permissions,
      memberCount: 0,
      createdAt: now,
      updatedAt: now,
    }
    mockRoles = [role, ...mockRoles]
    return role
  }
  const data = await authGraphqlFetch<{ createRole: RoleDefinition }>(
    `mutation CreateRole($input: CreateRoleInput!) { createRole(input: $input) { id name description isSystem permissions memberCount createdAt updatedAt } }`,
    { input },
    token,
  )
  return data.createRole
}

export async function updateRole(token: string, id: string, input: UpdateRoleInput): Promise<RoleDefinition> {
  if (useSeedData()) {
    const idx = mockRoles.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Role not found')
    const updated = { ...mockRoles[idx], ...input, updatedAt: new Date().toISOString() }
    mockRoles[idx] = updated
    return updated
  }
  const data = await authGraphqlFetch<{ updateRole: RoleDefinition }>(
    `mutation UpdateRole($id: ID!, $input: UpdateRoleInput!) { updateRole(id: $id, input: $input) { id name description isSystem permissions memberCount createdAt updatedAt } }`,
    { id, input },
    token,
  )
  return data.updateRole
}

export async function deleteRole(token: string, id: string): Promise<void> {
  if (useSeedData()) {
    mockRoles = mockRoles.filter((r) => r.id !== id)
    return
  }
  await authGraphqlFetch<{ deleteRole: { id: string } }>(
    `mutation DeleteRole($id: ID!) { deleteRole(id: $id) { id } }`,
    { id },
    token,
  )
}

export async function fetchRoleAssignments(token: string): Promise<RoleAssignment[]> {
  try {
    const data = await authGraphqlFetch<{ roleAssignments: RoleAssignment[] }>(
      `query { roleAssignments { memberId memberName memberEmail roleId roleName assignedAt assignedBy } }`,
      {},
      token,
    )
    return data.roleAssignments
  } catch {
    if (useSeedData()) return [...mockAssignments]
    return []
  }
}

export async function assignRole(token: string, memberId: string, roleId: string): Promise<RoleAssignment> {
  if (useSeedData()) {
    const role = mockRoles.find((r) => r.id === roleId)
    const existing = mockAssignments.find((a) => a.memberId === memberId)
    const assignment: RoleAssignment = {
      memberId,
      memberName: existing?.memberName || memberId,
      memberEmail: existing?.memberEmail || '',
      roleId,
      roleName: role?.name || roleId,
      assignedAt: new Date().toISOString(),
      assignedBy: 'Current User',
    }
    mockAssignments = mockAssignments.map((a) =>
      a.memberId === memberId ? assignment : a,
    )
    return assignment
  }
  const data = await authGraphqlFetch<{ assignRole: RoleAssignment }>(
    `mutation AssignRole($memberId: ID!, $roleId: ID!) { assignRole(memberId: $memberId, roleId: $roleId) { memberId memberName memberEmail roleId roleName assignedAt assignedBy } }`,
    { memberId, roleId },
    token,
  )
  return data.assignRole
}

// ---------------------------------------------------------------------------
// SSO API
// ---------------------------------------------------------------------------

export async function fetchSSOProviders(token: string): Promise<SSOProvider[]> {
  try {
    const data = await authGraphqlFetch<{ ssoProviders: SSOProvider[] }>(
      `query { ssoProviders { id name protocol status domain domainVerified entityId metadataUrl clientId issuerUrl jitProvisioning defaultRole createdAt updatedAt } }`,
      {},
      token,
    )
    return data.ssoProviders
  } catch {
    if (useSeedData()) return [...mockSSOProviders]
    return []
  }
}

export async function createSSOProvider(token: string, input: CreateSSOProviderInput): Promise<SSOProvider> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const provider: SSOProvider = {
      id: `sso-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name,
      protocol: input.protocol,
      status: 'pending_verification',
      domain: input.domain,
      domainVerified: false,
      entityId: input.entityId || null,
      metadataUrl: input.metadataUrl || null,
      clientId: input.clientId || null,
      issuerUrl: input.issuerUrl || null,
      jitProvisioning: input.jitProvisioning ?? false,
      defaultRole: input.defaultRole || 'editor',
      createdAt: now,
      updatedAt: now,
    }
    mockSSOProviders = [provider, ...mockSSOProviders]
    return provider
  }
  const data = await authGraphqlFetch<{ createSSOProvider: SSOProvider }>(
    `mutation CreateSSOProvider($input: CreateSSOProviderInput!) { createSSOProvider(input: $input) { id name protocol status domain domainVerified entityId metadataUrl clientId issuerUrl jitProvisioning defaultRole createdAt updatedAt } }`,
    { input },
    token,
  )
  return data.createSSOProvider
}

export async function updateSSOProvider(token: string, id: string, input: UpdateSSOProviderInput): Promise<SSOProvider> {
  if (useSeedData()) {
    const idx = mockSSOProviders.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('SSO provider not found')
    const updated = { ...mockSSOProviders[idx], ...input, updatedAt: new Date().toISOString() }
    mockSSOProviders[idx] = updated
    return updated
  }
  const data = await authGraphqlFetch<{ updateSSOProvider: SSOProvider }>(
    `mutation UpdateSSOProvider($id: ID!, $input: UpdateSSOProviderInput!) { updateSSOProvider(id: $id, input: $input) { id name protocol status domain domainVerified entityId metadataUrl clientId issuerUrl jitProvisioning defaultRole createdAt updatedAt } }`,
    { id, input },
    token,
  )
  return data.updateSSOProvider
}

export async function deleteSSOProvider(token: string, id: string): Promise<void> {
  if (useSeedData()) {
    mockSSOProviders = mockSSOProviders.filter((p) => p.id !== id)
    return
  }
  await authGraphqlFetch<{ deleteSSOProvider: { id: string } }>(
    `mutation DeleteSSOProvider($id: ID!) { deleteSSOProvider(id: $id) { id } }`,
    { id },
    token,
  )
}

export async function verifyDomain(token: string, id: string): Promise<SSOProvider> {
  if (useSeedData()) {
    const idx = mockSSOProviders.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('SSO provider not found')
    const updated = { ...mockSSOProviders[idx], domainVerified: true, status: 'active' as SSOStatus, updatedAt: new Date().toISOString() }
    mockSSOProviders[idx] = updated
    return updated
  }
  const data = await authGraphqlFetch<{ verifyDomain: SSOProvider }>(
    `mutation VerifyDomain($id: ID!) { verifyDomain(id: $id) { id name protocol status domain domainVerified } }`,
    { id },
    token,
  )
  return data.verifyDomain
}

// ---------------------------------------------------------------------------
// Webhooks API
// ---------------------------------------------------------------------------

export async function fetchWebhooks(token: string): Promise<WebhookEndpoint[]> {
  try {
    const data = await authGraphqlFetch<{ webhooks: WebhookEndpoint[] }>(
      `query { webhooks { id url description events status signingSecret retryEnabled maxRetries createdAt updatedAt lastDeliveryAt successRate } }`,
      {},
      token,
    )
    return data.webhooks
  } catch {
    if (useSeedData()) return [...mockWebhooks]
    return []
  }
}

export async function createWebhook(token: string, input: CreateWebhookInput): Promise<WebhookEndpoint> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const webhook: WebhookEndpoint = {
      id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: input.url,
      description: input.description,
      events: input.events,
      status: 'active',
      signingSecret: `whsec_${Math.random().toString(36).slice(2, 26)}`,
      retryEnabled: input.retryEnabled ?? true,
      maxRetries: input.maxRetries ?? 3,
      createdAt: now,
      updatedAt: now,
      lastDeliveryAt: null,
      successRate: 100,
    }
    mockWebhooks = [webhook, ...mockWebhooks]
    return webhook
  }
  const data = await authGraphqlFetch<{ createWebhook: WebhookEndpoint }>(
    `mutation CreateWebhook($input: CreateWebhookInput!) { createWebhook(input: $input) { id url description events status signingSecret retryEnabled maxRetries createdAt updatedAt lastDeliveryAt successRate } }`,
    { input },
    token,
  )
  return data.createWebhook
}

export async function updateWebhook(token: string, id: string, input: UpdateWebhookInput): Promise<WebhookEndpoint> {
  if (useSeedData()) {
    const idx = mockWebhooks.findIndex((w) => w.id === id)
    if (idx === -1) throw new Error('Webhook not found')
    const updated = { ...mockWebhooks[idx], ...input, updatedAt: new Date().toISOString() }
    mockWebhooks[idx] = updated
    return updated
  }
  const data = await authGraphqlFetch<{ updateWebhook: WebhookEndpoint }>(
    `mutation UpdateWebhook($id: ID!, $input: UpdateWebhookInput!) { updateWebhook(id: $id, input: $input) { id url description events status signingSecret retryEnabled maxRetries createdAt updatedAt lastDeliveryAt successRate } }`,
    { id, input },
    token,
  )
  return data.updateWebhook
}

export async function deleteWebhook(token: string, id: string): Promise<void> {
  if (useSeedData()) {
    mockWebhooks = mockWebhooks.filter((w) => w.id !== id)
    return
  }
  await authGraphqlFetch<{ deleteWebhook: { id: string } }>(
    `mutation DeleteWebhook($id: ID!) { deleteWebhook(id: $id) { id } }`,
    { id },
    token,
  )
}

export async function fetchWebhookDeliveries(token: string, webhookId: string): Promise<WebhookDelivery[]> {
  try {
    const data = await authGraphqlFetch<{ webhookDeliveries: WebhookDelivery[] }>(
      `query WebhookDeliveries($webhookId: ID!) { webhookDeliveries(webhookId: $webhookId) { id webhookId event url statusCode success requestBody responseBody attemptNumber deliveredAt duration } }`,
      { webhookId },
      token,
    )
    return data.webhookDeliveries
  } catch {
    if (useSeedData()) return mockDeliveries.filter((d) => d.webhookId === webhookId)
    return []
  }
}

export async function rotateWebhookSecret(token: string, id: string): Promise<string> {
  if (useSeedData()) {
    const idx = mockWebhooks.findIndex((w) => w.id === id)
    if (idx === -1) throw new Error('Webhook not found')
    const newSecret = `whsec_${Math.random().toString(36).slice(2, 26)}`
    mockWebhooks[idx] = { ...mockWebhooks[idx], signingSecret: newSecret, updatedAt: new Date().toISOString() }
    return newSecret
  }
  const data = await authGraphqlFetch<{ rotateWebhookSecret: { signingSecret: string } }>(
    `mutation RotateWebhookSecret($id: ID!) { rotateWebhookSecret(id: $id) { signingSecret } }`,
    { id },
    token,
  )
  return data.rotateWebhookSecret.signingSecret
}

// ---------------------------------------------------------------------------
// Audit API
// ---------------------------------------------------------------------------

export async function fetchAuditLog(
  token: string,
  options?: {
    dateFrom?: string
    dateTo?: string
    actions?: AuditAction[]
    actorIds?: string[]
    search?: string
    limit?: number
    offset?: number
  },
): Promise<AuditLogEntry[]> {
  try {
    const data = await authGraphqlFetch<{ auditLog: AuditLogEntry[] }>(
      `query AuditLog($options: AuditLogOptions) { auditLog(options: $options) { id action actorId actorName actorEmail targetType targetId targetLabel metadata ipAddress userAgent timestamp } }`,
      { options },
      token,
    )
    return data.auditLog
  } catch {
    if (useSeedData()) {
      let entries = [...mockAuditLog]
      if (options?.dateFrom) {
        entries = entries.filter((e) => e.timestamp >= options.dateFrom!)
      }
      if (options?.dateTo) {
        entries = entries.filter((e) => e.timestamp <= options.dateTo!)
      }
      if (options?.actions?.length) {
        entries = entries.filter((e) => options.actions!.includes(e.action))
      }
      if (options?.actorIds?.length) {
        entries = entries.filter((e) => options.actorIds!.includes(e.actorId))
      }
      if (options?.search) {
        const q = options.search.toLowerCase()
        entries = entries.filter(
          (e) =>
            e.actorName.toLowerCase().includes(q) ||
            e.targetLabel.toLowerCase().includes(q) ||
            e.action.toLowerCase().includes(q),
        )
      }
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      const offset = options?.offset || 0
      const limit = options?.limit || 50
      return entries.slice(offset, offset + limit)
    }
    return []
  }
}

export function exportAuditLog(entries: AuditLogEntry[], format: 'csv' | 'json'): string {
  if (format === 'json') {
    return JSON.stringify(entries, null, 2)
  }
  const headers = ['Timestamp', 'Action', 'Actor', 'Actor Email', 'Target', 'Target ID', 'IP Address', 'User Agent']
  const rows = entries.map((e) => [
    e.timestamp,
    e.action,
    e.actorName,
    e.actorEmail,
    e.targetLabel,
    e.targetId,
    e.ipAddress,
    e.userAgent,
  ])
  return [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n')
}

export function downloadExport(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ALL_WEBHOOK_EVENTS: { value: WebhookEventType; label: string; category: string }[] = [
  { value: 'post.created', label: 'Post Created', category: 'Content' },
  { value: 'post.published', label: 'Post Published', category: 'Content' },
  { value: 'post.deleted', label: 'Post Deleted', category: 'Content' },
  { value: 'approval.requested', label: 'Approval Requested', category: 'Approvals' },
  { value: 'approval.approved', label: 'Approval Approved', category: 'Approvals' },
  { value: 'approval.rejected', label: 'Approval Rejected', category: 'Approvals' },
  { value: 'member.added', label: 'Member Added', category: 'Team' },
  { value: 'member.removed', label: 'Member Removed', category: 'Team' },
  { value: 'deployment.started', label: 'Deployment Started', category: 'Infrastructure' },
  { value: 'deployment.completed', label: 'Deployment Completed', category: 'Infrastructure' },
  { value: 'deployment.failed', label: 'Deployment Failed', category: 'Infrastructure' },
]

export const ALL_AUDIT_ACTIONS: { value: AuditAction; label: string }[] = [
  { value: 'user.login', label: 'User Login' },
  { value: 'user.logout', label: 'User Logout' },
  { value: 'user.invite', label: 'User Invite' },
  { value: 'role.create', label: 'Role Created' },
  { value: 'role.update', label: 'Role Updated' },
  { value: 'role.delete', label: 'Role Deleted' },
  { value: 'role.assign', label: 'Role Assigned' },
  { value: 'sso.configure', label: 'SSO Configured' },
  { value: 'sso.delete', label: 'SSO Deleted' },
  { value: 'webhook.create', label: 'Webhook Created' },
  { value: 'webhook.update', label: 'Webhook Updated' },
  { value: 'webhook.delete', label: 'Webhook Deleted' },
  { value: 'post.create', label: 'Post Created' },
  { value: 'post.publish', label: 'Post Published' },
  { value: 'post.delete', label: 'Post Deleted' },
  { value: 'approval.approve', label: 'Approval Approved' },
  { value: 'approval.reject', label: 'Approval Rejected' },
  { value: 'settings.update', label: 'Settings Updated' },
  { value: 'deployment.create', label: 'Deployment Created' },
  { value: 'deployment.delete', label: 'Deployment Deleted' },
  { value: 'api_key.create', label: 'API Key Created' },
  { value: 'api_key.revoke', label: 'API Key Revoked' },
]

export { ALL_PERMISSIONS }

// ---------------------------------------------------------------------------
// Types — Automation Rules
// ---------------------------------------------------------------------------

export type AutomationTrigger =
  | 'post.published'
  | 'post.scheduled'
  | 'approval.requested'
  | 'approval.approved'
  | 'approval.rejected'
  | 'campaign.started'
  | 'campaign.ended'
  | 'member.joined'
  | 'member.removed'
  | 'deployment.created'
  | 'deployment.failed'
  | 'webhook.failed'

export type AutomationAction =
  | 'send_slack_notification'
  | 'send_email_notification'
  | 'send_discord_notification'
  | 'auto_approve'
  | 'add_to_queue'
  | 'assign_reviewer'
  | 'tag_post'
  | 'create_task'
  | 'run_webhook'

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'in'
  value: string
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  action: AutomationAction
  actionConfig: Record<string, string>
  enabled: boolean
  lastTriggeredAt: string | null
  triggerCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateAutomationRuleInput {
  name: string
  description: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  action: AutomationAction
  actionConfig: Record<string, string>
}

export interface UpdateAutomationRuleInput {
  name?: string
  description?: string
  trigger?: AutomationTrigger
  conditions?: AutomationCondition[]
  action?: AutomationAction
  actionConfig?: Record<string, string>
  enabled?: boolean
}

export const AUTOMATION_TRIGGERS: { value: AutomationTrigger; label: string; category: string }[] = [
  { value: 'post.published', label: 'Post published', category: 'Content' },
  { value: 'post.scheduled', label: 'Post scheduled', category: 'Content' },
  { value: 'approval.requested', label: 'Approval requested', category: 'Approvals' },
  { value: 'approval.approved', label: 'Post approved', category: 'Approvals' },
  { value: 'approval.rejected', label: 'Post rejected', category: 'Approvals' },
  { value: 'campaign.started', label: 'Campaign started', category: 'Campaigns' },
  { value: 'campaign.ended', label: 'Campaign ended', category: 'Campaigns' },
  { value: 'member.joined', label: 'Team member joined', category: 'Team' },
  { value: 'member.removed', label: 'Team member removed', category: 'Team' },
  { value: 'deployment.created', label: 'Deployment created', category: 'Infrastructure' },
  { value: 'deployment.failed', label: 'Deployment failed', category: 'Infrastructure' },
  { value: 'webhook.failed', label: 'Webhook delivery failed', category: 'Infrastructure' },
]

export const AUTOMATION_ACTIONS: { value: AutomationAction; label: string; description: string }[] = [
  { value: 'send_slack_notification', label: 'Send Slack notification', description: 'Post a message to a Slack channel' },
  { value: 'send_email_notification', label: 'Send email notification', description: 'Send an email to specified recipients' },
  { value: 'send_discord_notification', label: 'Send Discord notification', description: 'Post to a Discord channel via webhook' },
  { value: 'auto_approve', label: 'Auto-approve', description: 'Automatically approve the content' },
  { value: 'add_to_queue', label: 'Add to queue', description: 'Add the item to the publishing queue' },
  { value: 'assign_reviewer', label: 'Assign reviewer', description: 'Assign a team member to review' },
  { value: 'tag_post', label: 'Tag post', description: 'Add tags or labels to the post' },
  { value: 'create_task', label: 'Create task', description: 'Create a task in the task board' },
  { value: 'run_webhook', label: 'Run webhook', description: 'Send an HTTP request to a custom endpoint' },
]

export const CONDITION_FIELDS: { value: string; label: string }[] = [
  { value: 'platform', label: 'Platform' },
  { value: 'author', label: 'Author' },
  { value: 'status', label: 'Status' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'tag', label: 'Tag' },
  { value: 'content_type', label: 'Content type' },
]

// ---------------------------------------------------------------------------
// Seed — Automation Rules
// ---------------------------------------------------------------------------

const SEED_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'auto-rule-1',
    name: 'Notify Slack on publish',
    description: 'Send a Slack notification whenever a post is published to any platform.',
    trigger: 'post.published',
    conditions: [],
    action: 'send_slack_notification',
    actionConfig: { channel: '#social-updates' },
    enabled: true,
    lastTriggeredAt: '2026-02-17T14:30:00Z',
    triggerCount: 47,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-02-17T14:30:00Z',
  },
  {
    id: 'auto-rule-2',
    name: 'Auto-approve trusted editors on X',
    description: 'Automatically approve posts from trusted editors targeting X.',
    trigger: 'approval.requested',
    conditions: [
      { field: 'platform', operator: 'equals', value: 'X' },
    ],
    action: 'auto_approve',
    actionConfig: {},
    enabled: true,
    lastTriggeredAt: '2026-02-16T09:15:00Z',
    triggerCount: 12,
    createdAt: '2026-01-25T11:00:00Z',
    updatedAt: '2026-02-16T09:15:00Z',
  },
  {
    id: 'auto-rule-3',
    name: 'Queue campaign posts',
    description: 'Add posts to the publishing queue when a campaign starts.',
    trigger: 'campaign.started',
    conditions: [],
    action: 'add_to_queue',
    actionConfig: { priority: 'high' },
    enabled: false,
    lastTriggeredAt: '2026-02-10T08:00:00Z',
    triggerCount: 3,
    createdAt: '2026-02-01T14:00:00Z',
    updatedAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 'auto-rule-4',
    name: 'Discord alert on deployment failure',
    description: 'Ping the ops channel when a deployment fails.',
    trigger: 'deployment.failed',
    conditions: [],
    action: 'send_discord_notification',
    actionConfig: { channel: '#ops-alerts', mention: '@here' },
    enabled: true,
    lastTriggeredAt: null,
    triggerCount: 0,
    createdAt: '2026-02-05T16:00:00Z',
    updatedAt: '2026-02-05T16:00:00Z',
  },
  {
    id: 'auto-rule-5',
    name: 'Assign reviewer for LinkedIn posts',
    description: 'Auto-assign Echo as reviewer for all LinkedIn content.',
    trigger: 'approval.requested',
    conditions: [
      { field: 'platform', operator: 'equals', value: 'LINKEDIN' },
    ],
    action: 'assign_reviewer',
    actionConfig: { reviewer: 'echo' },
    enabled: true,
    lastTriggeredAt: '2026-02-15T11:00:00Z',
    triggerCount: 8,
    createdAt: '2026-02-03T09:00:00Z',
    updatedAt: '2026-02-15T11:00:00Z',
  },
]

let mockAutomationRules = [...SEED_AUTOMATION_RULES]

// ---------------------------------------------------------------------------
// CRUD — Automation Rules
// ---------------------------------------------------------------------------

export async function fetchAutomationRules(token: string): Promise<AutomationRule[]> {
  try {
    const data = await authGraphqlFetch<{ automationRules: AutomationRule[] }>(
      `query AutomationRules { automationRules { id name description trigger conditions { field operator value } action actionConfig enabled lastTriggeredAt triggerCount createdAt updatedAt } }`,
      {},
      token,
    )
    return data.automationRules
  } catch {
    if (useSeedData()) return mockAutomationRules
    return []
  }
}

export async function createAutomationRule(
  token: string,
  input: CreateAutomationRuleInput,
): Promise<AutomationRule> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const rule: AutomationRule = {
      id: `auto-rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name,
      description: input.description,
      trigger: input.trigger,
      conditions: input.conditions,
      action: input.action,
      actionConfig: input.actionConfig,
      enabled: true,
      lastTriggeredAt: null,
      triggerCount: 0,
      createdAt: now,
      updatedAt: now,
    }
    mockAutomationRules = [rule, ...mockAutomationRules]
    return rule
  }

  const data = await authGraphqlFetch<{ createAutomationRule: AutomationRule }>(
    `mutation CreateAutomationRule($input: CreateAutomationRuleInput!) { createAutomationRule(input: $input) { id name description trigger conditions { field operator value } action actionConfig enabled lastTriggeredAt triggerCount createdAt updatedAt } }`,
    { input },
    token,
  )
  return data.createAutomationRule
}

export async function updateAutomationRule(
  token: string,
  id: string,
  input: UpdateAutomationRuleInput,
): Promise<AutomationRule> {
  if (useSeedData()) {
    const idx = mockAutomationRules.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Rule not found')
    const updated: AutomationRule = {
      ...mockAutomationRules[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    }
    mockAutomationRules[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateAutomationRule: AutomationRule }>(
    `mutation UpdateAutomationRule($id: ID!, $input: UpdateAutomationRuleInput!) { updateAutomationRule(id: $id, input: $input) { id name description trigger conditions { field operator value } action actionConfig enabled lastTriggeredAt triggerCount createdAt updatedAt } }`,
    { id, input },
    token,
  )
  return data.updateAutomationRule
}

export async function deleteAutomationRule(token: string, id: string): Promise<void> {
  if (useSeedData()) {
    mockAutomationRules = mockAutomationRules.filter((r) => r.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteAutomationRule: { id: string } }>(
    `mutation DeleteAutomationRule($id: ID!) { deleteAutomationRule(id: $id) { id } }`,
    { id },
    token,
  )
}
