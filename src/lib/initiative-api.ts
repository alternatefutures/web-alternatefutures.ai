const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ===========================================================================
// Types
// ===========================================================================

export type InitiativeStatus = 'active' | 'paused' | 'completed' | 'cancelled' | 'draft'
export type InitiativePriority = 'critical' | 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked'

export interface InitiativeTask {
  id: string
  title: string
  assignee: string
  status: TaskStatus
  dueDate: string
}

export interface InitiativeUpdate {
  id: string
  date: string
  author: string
  content: string
  type: 'progress' | 'blocker' | 'decision' | 'note'
}

export interface InitiativeMetric {
  id: string
  label: string
  current: number
  target: number
  unit: string
}

export interface Initiative {
  id: string
  title: string
  description: string
  status: InitiativeStatus
  priority: InitiativePriority
  owner: string
  ownerColor: string
  teamMembers: string[]
  okrIds: string[]
  progress: number
  startDate: string
  endDate: string
  tasks: InitiativeTask[]
  metrics: InitiativeMetric[]
  updates: InitiativeUpdate[]
  tags: string[]
  milestoneIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateInitiativeInput {
  title: string
  description: string
  status?: InitiativeStatus
  priority: InitiativePriority
  owner: string
  ownerColor?: string
  teamMembers?: string[]
  okrIds?: string[]
  startDate: string
  endDate: string
  tags?: string[]
  milestoneIds?: string[]
}

export interface UpdateInitiativeInput {
  title?: string
  description?: string
  status?: InitiativeStatus
  priority?: InitiativePriority
  owner?: string
  ownerColor?: string
  teamMembers?: string[]
  okrIds?: string[]
  progress?: number
  startDate?: string
  endDate?: string
  tags?: string[]
  milestoneIds?: string[]
}

// ===========================================================================
// Seed data
// ===========================================================================

const SEED_INITIATIVES: Initiative[] = [
  {
    id: 'init-1',
    title: 'Platform Launch Campaign',
    description: 'Coordinate cross-team effort for public platform launch including marketing, PR, community, and technical readiness.',
    status: 'active',
    priority: 'critical',
    owner: 'Echo (Communications)',
    ownerColor: '#BE4200',
    teamMembers: ['Echo', 'Hana', 'Senku', 'Atlas'],
    okrIds: ['obj-1', 'obj-2'],
    progress: 58,
    startDate: '2026-01-15',
    endDate: '2026-03-31',
    tasks: [
      { id: 't-1a', title: 'Finalize launch messaging', assignee: 'Echo', status: 'done', dueDate: '2026-02-10' },
      { id: 't-1b', title: 'Create launch blog post series', assignee: 'Echo', status: 'in-progress', dueDate: '2026-03-01' },
      { id: 't-1c', title: 'Prepare press kit', assignee: 'Hana', status: 'in-progress', dueDate: '2026-03-05' },
      { id: 't-1d', title: 'Set up analytics tracking', assignee: 'Senku', status: 'todo', dueDate: '2026-03-10' },
      { id: 't-1e', title: 'Infrastructure load testing', assignee: 'Atlas', status: 'review', dueDate: '2026-03-12' },
    ],
    metrics: [
      { id: 'm-1a', label: 'Blog Posts Published', current: 14, target: 20, unit: 'posts' },
      { id: 'm-1b', label: 'Monthly Visitors', current: 3200, target: 5000, unit: 'visitors' },
      { id: 'm-1c', label: 'Media Mentions', current: 2, target: 3, unit: 'mentions' },
    ],
    updates: [
      { id: 'u-1a', date: '2026-02-14', author: 'Echo', content: 'Blog series on track. 14 of 20 posts published. Working on developer-focused content next.', type: 'progress' },
      { id: 'u-1b', date: '2026-02-12', author: 'Hana', content: 'Press kit design 80% complete. Need final brand assets from design system v2.', type: 'progress' },
      { id: 'u-1c', date: '2026-02-10', author: 'Senku', content: 'Holding on analytics until new dashboard components are merged. Should unblock by Feb 20.', type: 'blocker' },
    ],
    tags: ['launch', 'marketing', 'cross-team'],
    milestoneIds: ['ms-1', 'ms-4', 'ms-7'],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-02-14T14:00:00Z',
  },
  {
    id: 'init-2',
    title: 'Developer Experience Overhaul',
    description: 'Rebuild developer onboarding flow, improve CLI UX, update SDK docs, and create starter template gallery.',
    status: 'active',
    priority: 'high',
    owner: 'Senku (Technical Lead)',
    ownerColor: '#000AFF',
    teamMembers: ['Senku', 'Quinn', 'Echo'],
    okrIds: ['obj-2'],
    progress: 42,
    startDate: '2026-02-01',
    endDate: '2026-04-15',
    tasks: [
      { id: 't-2a', title: 'Redesign CLI quickstart flow', assignee: 'Senku', status: 'in-progress', dueDate: '2026-02-28' },
      { id: 't-2b', title: 'Write SDK API reference docs', assignee: 'Senku', status: 'in-progress', dueDate: '2026-03-15' },
      { id: 't-2c', title: 'Create interactive tutorial', assignee: 'Senku', status: 'todo', dueDate: '2026-03-30' },
      { id: 't-2d', title: 'QA test all templates', assignee: 'Quinn', status: 'todo', dueDate: '2026-04-01' },
      { id: 't-2e', title: 'Write template showcase page', assignee: 'Echo', status: 'todo', dueDate: '2026-04-05' },
    ],
    metrics: [
      { id: 'm-2a', label: 'Beta Developers', current: 180, target: 500, unit: 'developers' },
      { id: 'm-2b', label: 'SDK Doc Coverage', current: 72, target: 90, unit: '%' },
      { id: 'm-2c', label: 'Starter Templates', current: 5, target: 5, unit: 'templates' },
    ],
    updates: [
      { id: 'u-2a', date: '2026-02-14', author: 'Senku', content: 'CLI quickstart v2 prototype ready for internal testing. Reduced steps from 8 to 3.', type: 'progress' },
      { id: 'u-2b', date: '2026-02-11', author: 'Quinn', content: 'Found 4 bugs in Astro template during initial review. Filed issues.', type: 'note' },
    ],
    tags: ['devrel', 'dx', 'docs'],
    milestoneIds: ['ms-6'],
    createdAt: '2026-01-25T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'init-3',
    title: 'Infrastructure Cost Reduction',
    description: 'Optimize Akash deployments, consolidate services, implement auto-scaling to hit per-service cost targets.',
    status: 'active',
    priority: 'high',
    owner: 'Atlas (Infrastructure)',
    ownerColor: '#5C7A6B',
    teamMembers: ['Atlas', 'Argus', 'Senku'],
    okrIds: ['obj-3'],
    progress: 75,
    startDate: '2026-01-05',
    endDate: '2026-04-15',
    tasks: [
      { id: 't-3a', title: 'Audit current resource usage', assignee: 'Atlas', status: 'done', dueDate: '2026-01-20' },
      { id: 't-3b', title: 'Right-size all deployments', assignee: 'Atlas', status: 'done', dueDate: '2026-02-05' },
      { id: 't-3c', title: 'Implement deployment automation', assignee: 'Atlas', status: 'in-progress', dueDate: '2026-03-01' },
      { id: 't-3d', title: 'Security review of new configs', assignee: 'Argus', status: 'todo', dueDate: '2026-03-10' },
      { id: 't-3e', title: 'Set up monitoring & alerts', assignee: 'Atlas', status: 'in-progress', dueDate: '2026-03-15' },
    ],
    metrics: [
      { id: 'm-3a', label: 'Cost per Service', current: 12.40, target: 15, unit: '$/mo' },
      { id: 'm-3b', label: 'Uptime', current: 99.7, target: 99.5, unit: '%' },
      { id: 'm-3c', label: 'Manual Steps', current: 2, target: 0, unit: 'steps' },
    ],
    updates: [
      { id: 'u-3a', date: '2026-02-14', author: 'Atlas', content: 'Cost target achieved. $12.40/service vs $15 target. Continuing automation work.', type: 'progress' },
      { id: 'u-3b', date: '2026-02-08', author: 'Atlas', content: 'SSL proxy redeployment saved $3/month. Leet.haus provider performing well.', type: 'decision' },
    ],
    tags: ['infra', 'cost', 'akash'],
    milestoneIds: ['ms-5'],
    createdAt: '2026-01-02T08:00:00Z',
    updatedAt: '2026-02-14T11:00:00Z',
  },
  {
    id: 'init-4',
    title: 'Brand & Design System Delivery',
    description: 'Complete Pixel design system v2, finalize brand guidelines, deliver all visual assets for launch.',
    status: 'active',
    priority: 'high',
    owner: 'Hana (Visual Design)',
    ownerColor: '#C9A84C',
    teamMembers: ['Hana', 'Echo', 'Yusuke'],
    okrIds: ['obj-4'],
    progress: 90,
    startDate: '2026-01-10',
    endDate: '2026-03-15',
    tasks: [
      { id: 't-4a', title: 'Design system component library', assignee: 'Hana', status: 'done', dueDate: '2026-02-01' },
      { id: 't-4b', title: 'Brand guidelines document', assignee: 'Hana', status: 'done', dueDate: '2026-02-10' },
      { id: 't-4c', title: 'Create 50 branded assets', assignee: 'Hana', status: 'in-progress', dueDate: '2026-02-28' },
      { id: 't-4d', title: 'Pitch deck visual design', assignee: 'Hana', status: 'in-progress', dueDate: '2026-03-01' },
      { id: 't-4e', title: 'UI review with Yusuke', assignee: 'Yusuke', status: 'review', dueDate: '2026-03-05' },
    ],
    metrics: [
      { id: 'm-4a', label: 'Design System', current: 95, target: 100, unit: '%' },
      { id: 'm-4b', label: 'Pitch Deck Slides', current: 18, target: 20, unit: 'slides' },
      { id: 'm-4c', label: 'Branded Assets', current: 42, target: 50, unit: 'assets' },
    ],
    updates: [
      { id: 'u-4a', date: '2026-02-14', author: 'Hana', content: 'Design system v2 at 95%. Remaining: dark mode tokens and mobile overrides.', type: 'progress' },
      { id: 'u-4b', date: '2026-02-13', author: 'Hana', content: 'Pitch deck down to final 2 slides. Waiting on updated financials.', type: 'blocker' },
    ],
    tags: ['design', 'brand', 'visual'],
    milestoneIds: ['ms-3', 'ms-8'],
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-02-14T09:00:00Z',
  },
  {
    id: 'init-5',
    title: 'Fundraising Preparation',
    description: 'Prepare all materials for seed round: pitch deck, data room, financial model, competitive analysis.',
    status: 'active',
    priority: 'critical',
    owner: 'Echo (Communications)',
    ownerColor: '#BE4200',
    teamMembers: ['Echo', 'Hana', 'Atlas'],
    okrIds: ['obj-1', 'obj-4'],
    progress: 65,
    startDate: '2026-02-01',
    endDate: '2026-03-31',
    tasks: [
      { id: 't-5a', title: 'Financial model v2', assignee: 'Atlas', status: 'in-progress', dueDate: '2026-02-20' },
      { id: 't-5b', title: 'Competitive analysis report', assignee: 'Echo', status: 'done', dueDate: '2026-02-15' },
      { id: 't-5c', title: 'Data room setup', assignee: 'Echo', status: 'in-progress', dueDate: '2026-03-01' },
      { id: 't-5d', title: 'Investor target list', assignee: 'Echo', status: 'done', dueDate: '2026-02-12' },
    ],
    metrics: [
      { id: 'm-5a', label: 'Deck Readiness', current: 90, target: 100, unit: '%' },
      { id: 'm-5b', label: 'Data Room Docs', current: 8, target: 12, unit: 'docs' },
      { id: 'm-5c', label: 'Investor Contacts', current: 24, target: 30, unit: 'contacts' },
    ],
    updates: [
      { id: 'u-5a', date: '2026-02-14', author: 'Echo', content: 'Competitive analysis complete. Railway, Heroku, Cloudflare, DigitalOcean, and Fly.io covered.', type: 'progress' },
    ],
    tags: ['fundraising', 'investors', 'seed'],
    milestoneIds: ['ms-8', 'ms-11'],
    createdAt: '2026-01-28T08:00:00Z',
    updatedAt: '2026-02-14T16:00:00Z',
  },
  {
    id: 'init-6',
    title: 'Security Hardening Sprint',
    description: 'Comprehensive security review of all services. Prepare for third-party audit.',
    status: 'draft',
    priority: 'medium',
    owner: 'Argus (Security)',
    ownerColor: '#8B0000',
    teamMembers: ['Argus', 'Senku', 'Atlas'],
    okrIds: ['obj-3'],
    progress: 10,
    startDate: '2026-03-01',
    endDate: '2026-05-15',
    tasks: [
      { id: 't-6a', title: 'Threat model review', assignee: 'Argus', status: 'in-progress', dueDate: '2026-03-15' },
      { id: 't-6b', title: 'Dependency vulnerability scan', assignee: 'Argus', status: 'todo', dueDate: '2026-03-20' },
      { id: 't-6c', title: 'Pen test scope definition', assignee: 'Argus', status: 'todo', dueDate: '2026-04-01' },
    ],
    metrics: [
      { id: 'm-6a', label: 'Critical Vulns', current: 0, target: 0, unit: 'issues' },
      { id: 'm-6b', label: 'Scan Coverage', current: 40, target: 100, unit: '%' },
    ],
    updates: [
      { id: 'u-6a', date: '2026-02-14', author: 'Argus', content: 'Initial threat model draft in progress. Focusing on auth service and API gateway first.', type: 'progress' },
    ],
    tags: ['security', 'audit', 'compliance'],
    milestoneIds: ['ms-10'],
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'init-7',
    title: 'Community Growth Engine',
    description: 'Scale Discord community, establish ambassador program, create engagement loops.',
    status: 'active',
    priority: 'medium',
    owner: 'Echo (Communications)',
    ownerColor: '#BE4200',
    teamMembers: ['Echo', 'Hana'],
    okrIds: ['obj-1', 'obj-2'],
    progress: 45,
    startDate: '2026-02-05',
    endDate: '2026-04-30',
    tasks: [
      { id: 't-7a', title: 'Ambassador program framework', assignee: 'Echo', status: 'in-progress', dueDate: '2026-02-28' },
      { id: 't-7b', title: 'Community guidelines doc', assignee: 'Echo', status: 'done', dueDate: '2026-02-15' },
      { id: 't-7c', title: 'Weekly AMA schedule', assignee: 'Echo', status: 'todo', dueDate: '2026-03-01' },
      { id: 't-7d', title: 'Community dashboard metrics', assignee: 'Senku', status: 'todo', dueDate: '2026-03-15' },
    ],
    metrics: [
      { id: 'm-7a', label: 'Discord Members', current: 340, target: 1000, unit: 'members' },
      { id: 'm-7b', label: 'Weekly Active', current: 85, target: 250, unit: 'users' },
      { id: 'm-7c', label: 'Ambassadors', current: 0, target: 10, unit: 'people' },
    ],
    updates: [
      { id: 'u-7a', date: '2026-02-13', author: 'Echo', content: 'Community guidelines published. Ambassador program framework 60% done.', type: 'progress' },
    ],
    tags: ['community', 'growth', 'discord'],
    milestoneIds: ['ms-7'],
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-13T14:00:00Z',
  },
]

// ===========================================================================
// Helpers
// ===========================================================================

function useSeedData(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
  )
}

// ===========================================================================
// GraphQL
// ===========================================================================

const INITIATIVE_FIELDS = `
  id title description status priority owner ownerColor
  teamMembers okrIds progress startDate endDate
  tasks { id title assignee status dueDate }
  metrics { id label current target unit }
  updates { id date author content type }
  tags milestoneIds createdAt updatedAt
`

const ALL_INITIATIVES_QUERY = `
  query Initiatives($limit: Int, $offset: Int) {
    initiatives(limit: $limit, offset: $offset) {
      ${INITIATIVE_FIELDS}
    }
  }
`

const INITIATIVE_BY_ID_QUERY = `
  query Initiative($id: ID!) {
    initiative(id: $id) {
      ${INITIATIVE_FIELDS}
    }
  }
`

const CREATE_INITIATIVE_MUTATION = `
  mutation CreateInitiative($input: CreateInitiativeInput!) {
    createInitiative(input: $input) {
      ${INITIATIVE_FIELDS}
    }
  }
`

const UPDATE_INITIATIVE_MUTATION = `
  mutation UpdateInitiative($id: ID!, $input: UpdateInitiativeInput!) {
    updateInitiative(id: $id, input: $input) {
      ${INITIATIVE_FIELDS}
    }
  }
`

const DELETE_INITIATIVE_MUTATION = `
  mutation DeleteInitiative($id: ID!) {
    deleteInitiative(id: $id) { id }
  }
`

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

// ===========================================================================
// In-memory mock store
// ===========================================================================

let mockInitiatives = [...SEED_INITIATIVES]

// ===========================================================================
// CRUD Functions
// ===========================================================================

export async function fetchAllInitiatives(
  token: string,
  limit = 100,
  offset = 0,
): Promise<Initiative[]> {
  try {
    const data = await authGraphqlFetch<{ initiatives: Initiative[] }>(
      ALL_INITIATIVES_QUERY,
      { limit, offset },
      token,
    )
    return data.initiatives
  } catch {
    if (useSeedData()) return mockInitiatives.slice(offset, offset + limit)
    return []
  }
}

export async function fetchInitiativeById(
  token: string,
  id: string,
): Promise<Initiative | null> {
  try {
    const data = await authGraphqlFetch<{ initiative: Initiative }>(
      INITIATIVE_BY_ID_QUERY,
      { id },
      token,
    )
    return data.initiative
  } catch {
    if (useSeedData()) return mockInitiatives.find((i) => i.id === id) || null
    return null
  }
}

export async function createInitiative(
  token: string,
  input: CreateInitiativeInput,
): Promise<Initiative> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const initiative: Initiative = {
      id: `init-${Date.now()}`,
      title: input.title,
      description: input.description,
      status: input.status || 'draft',
      priority: input.priority,
      owner: input.owner,
      ownerColor: input.ownerColor || '#666666',
      teamMembers: input.teamMembers || [],
      okrIds: input.okrIds || [],
      progress: 0,
      startDate: input.startDate,
      endDate: input.endDate,
      tasks: [],
      metrics: [],
      updates: [],
      tags: input.tags || [],
      milestoneIds: input.milestoneIds || [],
      createdAt: now,
      updatedAt: now,
    }
    mockInitiatives = [initiative, ...mockInitiatives]
    return initiative
  }

  const data = await authGraphqlFetch<{ createInitiative: Initiative }>(
    CREATE_INITIATIVE_MUTATION,
    { input },
    token,
  )
  return data.createInitiative
}

export async function updateInitiative(
  token: string,
  id: string,
  input: UpdateInitiativeInput,
): Promise<Initiative> {
  if (useSeedData()) {
    const idx = mockInitiatives.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error('Initiative not found')
    const updated: Initiative = {
      ...mockInitiatives[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    } as Initiative
    mockInitiatives[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateInitiative: Initiative }>(
    UPDATE_INITIATIVE_MUTATION,
    { id, input },
    token,
  )
  return data.updateInitiative
}

export async function deleteInitiative(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockInitiatives = mockInitiatives.filter((i) => i.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteInitiative: { id: string } }>(
    DELETE_INITIATIVE_MUTATION,
    { id },
    token,
  )
}

// ===========================================================================
// Formatting helpers
// ===========================================================================

export function getPriorityLabel(priority: InitiativePriority): string {
  const labels: Record<InitiativePriority, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  }
  return labels[priority]
}

export function getStatusLabel(status: InitiativeStatus): string {
  const labels: Record<InitiativeStatus, string> = {
    active: 'Active',
    paused: 'Paused',
    completed: 'Completed',
    cancelled: 'Cancelled',
    draft: 'Draft',
  }
  return labels[status]
}

export function getTaskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    review: 'In Review',
    done: 'Done',
    blocked: 'Blocked',
  }
  return labels[status]
}

export function computeTaskProgress(tasks: InitiativeTask[]): number {
  if (tasks.length === 0) return 0
  const done = tasks.filter((t) => t.status === 'done').length
  return Math.round((done / tasks.length) * 100)
}

export { SEED_INITIATIVES }
