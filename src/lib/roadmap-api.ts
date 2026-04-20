const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ===========================================================================
// Types
// ===========================================================================

export type MilestoneStatus = 'completed' | 'in-progress' | 'planned' | 'at-risk' | 'blocked'
export type InitiativePhase = 'discovery' | 'design' | 'build' | 'launch' | 'scale'

export interface Dependency {
  id: string
  sourceId: string
  targetId: string
  type: 'blocks' | 'informs' | 'requires'
}

export interface Milestone {
  id: string
  title: string
  description: string
  phase: InitiativePhase
  status: MilestoneStatus
  owner: string
  ownerColor: string
  startDate: string
  endDate: string
  progress: number
  okrIds: string[]
  dependencies: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface RoadmapQuarter {
  label: string
  startDate: string
  endDate: string
}

export interface CreateMilestoneInput {
  title: string
  description: string
  phase: InitiativePhase
  status?: MilestoneStatus
  owner: string
  ownerColor?: string
  startDate: string
  endDate: string
  progress?: number
  okrIds?: string[]
  dependencies?: string[]
  tags?: string[]
}

export interface UpdateMilestoneInput {
  title?: string
  description?: string
  phase?: InitiativePhase
  status?: MilestoneStatus
  owner?: string
  ownerColor?: string
  startDate?: string
  endDate?: string
  progress?: number
  okrIds?: string[]
  dependencies?: string[]
  tags?: string[]
}

// ===========================================================================
// Seed data
// ===========================================================================

export const ROADMAP_QUARTERS: RoadmapQuarter[] = [
  { label: 'Q1 2026', startDate: '2026-01-01', endDate: '2026-03-31' },
  { label: 'Q2 2026', startDate: '2026-04-01', endDate: '2026-06-30' },
  { label: 'Q3 2026', startDate: '2026-07-01', endDate: '2026-09-30' },
  { label: 'Q4 2026', startDate: '2026-10-01', endDate: '2026-12-31' },
]

const SEED_MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    title: 'Platform MVP Launch',
    description: 'Ship core platform with IPFS hosting, CLI deploy, and dashboard. First public users onboarded.',
    phase: 'launch',
    status: 'in-progress',
    owner: 'Senku (Technical Lead)',
    ownerColor: '#000AFF',
    startDate: '2026-01-15',
    endDate: '2026-03-15',
    progress: 72,
    okrIds: ['obj-1', 'obj-2'],
    dependencies: [],
    tags: ['platform', 'mvp', 'critical'],
    createdAt: '2026-01-02T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'ms-2',
    title: 'Auth Service v2 — OAuth + Web3',
    description: 'Complete authentication rewrite supporting magic links, OAuth providers, and SIWE wallet login.',
    phase: 'build',
    status: 'completed',
    owner: 'Senku (Technical Lead)',
    ownerColor: '#000AFF',
    startDate: '2026-01-08',
    endDate: '2026-02-10',
    progress: 100,
    okrIds: ['obj-2'],
    dependencies: [],
    tags: ['auth', 'security', 'core'],
    createdAt: '2026-01-02T08:00:00Z',
    updatedAt: '2026-02-10T16:00:00Z',
  },
  {
    id: 'ms-3',
    title: 'Brand Identity & Design System v2',
    description: 'Finalize brand guidelines, Pixel design system, and all visual assets for launch.',
    phase: 'launch',
    status: 'in-progress',
    owner: 'Hana (Visual Design)',
    ownerColor: '#C9A84C',
    startDate: '2026-01-10',
    endDate: '2026-03-01',
    progress: 88,
    okrIds: ['obj-4'],
    dependencies: [],
    tags: ['brand', 'design', 'visual'],
    createdAt: '2026-01-02T08:00:00Z',
    updatedAt: '2026-02-14T09:00:00Z',
  },
  {
    id: 'ms-4',
    title: 'Content & SEO Engine',
    description: 'Launch blog, establish content pipeline, achieve initial organic traffic targets.',
    phase: 'build',
    status: 'in-progress',
    owner: 'Echo (Communications)',
    ownerColor: '#BE4200',
    startDate: '2026-01-20',
    endDate: '2026-03-30',
    progress: 65,
    okrIds: ['obj-1'],
    dependencies: ['ms-3'],
    tags: ['content', 'seo', 'marketing'],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-02-13T14:00:00Z',
  },
  {
    id: 'ms-5',
    title: 'Akash Infrastructure Optimization',
    description: 'Reduce per-service costs, achieve 99.5% uptime, automate deployment pipeline.',
    phase: 'scale',
    status: 'in-progress',
    owner: 'Atlas (Infrastructure)',
    ownerColor: '#5C7A6B',
    startDate: '2026-01-05',
    endDate: '2026-04-15',
    progress: 78,
    okrIds: ['obj-3'],
    dependencies: ['ms-1'],
    tags: ['infra', 'akash', 'cost'],
    createdAt: '2026-01-02T08:00:00Z',
    updatedAt: '2026-02-14T11:00:00Z',
  },
  {
    id: 'ms-6',
    title: 'Developer Onboarding Flow',
    description: 'CLI quickstart, interactive tutorials, SDK docs, and starter template gallery.',
    phase: 'build',
    status: 'at-risk',
    owner: 'Senku (Technical Lead)',
    ownerColor: '#000AFF',
    startDate: '2026-02-01',
    endDate: '2026-04-01',
    progress: 35,
    okrIds: ['obj-2'],
    dependencies: ['ms-1', 'ms-2'],
    tags: ['devrel', 'onboarding', 'docs'],
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'ms-7',
    title: 'Community Launch & Discord Setup',
    description: 'Launch public Discord, onboard agent swarm, establish community governance.',
    phase: 'launch',
    status: 'completed',
    owner: 'Echo (Communications)',
    ownerColor: '#BE4200',
    startDate: '2026-01-12',
    endDate: '2026-02-05',
    progress: 100,
    okrIds: ['obj-1', 'obj-2'],
    dependencies: [],
    tags: ['community', 'discord', 'social'],
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-02-05T18:00:00Z',
  },
  {
    id: 'ms-8',
    title: 'Pitch Deck & Investor Materials',
    description: 'Investor-ready pitch deck, financial model, competitive analysis documentation.',
    phase: 'build',
    status: 'in-progress',
    owner: 'Hana (Visual Design)',
    ownerColor: '#C9A84C',
    startDate: '2026-02-01',
    endDate: '2026-03-15',
    progress: 80,
    okrIds: ['obj-4'],
    dependencies: ['ms-3'],
    tags: ['fundraising', 'pitch', 'investors'],
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-02-14T15:00:00Z',
  },
  {
    id: 'ms-9',
    title: 'AI Agent Marketplace Beta',
    description: 'Launch beta marketplace for deploying AI agents on decentralized compute.',
    phase: 'discovery',
    status: 'planned',
    owner: 'Senku (Technical Lead)',
    ownerColor: '#000AFF',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    progress: 5,
    okrIds: [],
    dependencies: ['ms-1', 'ms-5'],
    tags: ['ai-agents', 'marketplace', 'q2'],
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'ms-10',
    title: 'Security Audit & Compliance',
    description: 'Third-party security audit, SOC2 preparation, penetration testing.',
    phase: 'discovery',
    status: 'planned',
    owner: 'Argus (Security)',
    ownerColor: '#8B0000',
    startDate: '2026-03-15',
    endDate: '2026-05-30',
    progress: 0,
    okrIds: ['obj-3'],
    dependencies: ['ms-1', 'ms-2'],
    tags: ['security', 'compliance', 'audit'],
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'ms-11',
    title: 'Partnership Pipeline',
    description: 'Establish partnerships with DePIN projects, AI frameworks, and hosting providers.',
    phase: 'discovery',
    status: 'in-progress',
    owner: 'Echo (Communications)',
    ownerColor: '#BE4200',
    startDate: '2026-02-10',
    endDate: '2026-05-15',
    progress: 20,
    okrIds: ['obj-1'],
    dependencies: ['ms-8'],
    tags: ['partnerships', 'bizdev', 'growth'],
    createdAt: '2026-02-05T08:00:00Z',
    updatedAt: '2026-02-14T12:00:00Z',
  },
  {
    id: 'ms-12',
    title: 'Serverless Functions v1',
    description: 'Launch serverless function execution on Akash compute with edge caching.',
    phase: 'design',
    status: 'planned',
    owner: 'Senku (Technical Lead)',
    ownerColor: '#000AFF',
    startDate: '2026-04-15',
    endDate: '2026-07-15',
    progress: 0,
    okrIds: [],
    dependencies: ['ms-1', 'ms-5', 'ms-10'],
    tags: ['serverless', 'compute', 'q2-q3'],
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
]

const SEED_DEPENDENCIES: Dependency[] = [
  { id: 'dep-1', sourceId: 'ms-3', targetId: 'ms-4', type: 'informs' },
  { id: 'dep-2', sourceId: 'ms-1', targetId: 'ms-5', type: 'requires' },
  { id: 'dep-3', sourceId: 'ms-1', targetId: 'ms-6', type: 'blocks' },
  { id: 'dep-4', sourceId: 'ms-2', targetId: 'ms-6', type: 'requires' },
  { id: 'dep-5', sourceId: 'ms-3', targetId: 'ms-8', type: 'informs' },
  { id: 'dep-6', sourceId: 'ms-8', targetId: 'ms-11', type: 'informs' },
  { id: 'dep-7', sourceId: 'ms-1', targetId: 'ms-9', type: 'blocks' },
  { id: 'dep-8', sourceId: 'ms-5', targetId: 'ms-9', type: 'requires' },
  { id: 'dep-9', sourceId: 'ms-1', targetId: 'ms-10', type: 'requires' },
  { id: 'dep-10', sourceId: 'ms-2', targetId: 'ms-10', type: 'requires' },
  { id: 'dep-11', sourceId: 'ms-1', targetId: 'ms-12', type: 'blocks' },
  { id: 'dep-12', sourceId: 'ms-5', targetId: 'ms-12', type: 'requires' },
  { id: 'dep-13', sourceId: 'ms-10', targetId: 'ms-12', type: 'blocks' },
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

const MILESTONE_FIELDS = `
  id title description phase status owner ownerColor
  startDate endDate progress okrIds dependencies tags
  createdAt updatedAt
`

const ALL_MILESTONES_QUERY = `
  query Milestones($limit: Int, $offset: Int) {
    milestones(limit: $limit, offset: $offset) {
      ${MILESTONE_FIELDS}
    }
  }
`

const MILESTONE_BY_ID_QUERY = `
  query Milestone($id: ID!) {
    milestone(id: $id) {
      ${MILESTONE_FIELDS}
    }
  }
`

const CREATE_MILESTONE_MUTATION = `
  mutation CreateMilestone($input: CreateMilestoneInput!) {
    createMilestone(input: $input) {
      ${MILESTONE_FIELDS}
    }
  }
`

const UPDATE_MILESTONE_MUTATION = `
  mutation UpdateMilestone($id: ID!, $input: UpdateMilestoneInput!) {
    updateMilestone(id: $id, input: $input) {
      ${MILESTONE_FIELDS}
    }
  }
`

const DELETE_MILESTONE_MUTATION = `
  mutation DeleteMilestone($id: ID!) {
    deleteMilestone(id: $id) { id }
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

let mockMilestones = [...SEED_MILESTONES]
let mockDependencies = [...SEED_DEPENDENCIES]

// ===========================================================================
// CRUD Functions
// ===========================================================================

export async function fetchAllMilestones(
  token: string,
  limit = 100,
  offset = 0,
): Promise<Milestone[]> {
  try {
    const data = await authGraphqlFetch<{ milestones: Milestone[] }>(
      ALL_MILESTONES_QUERY,
      { limit, offset },
      token,
    )
    return data.milestones
  } catch {
    if (useSeedData()) return mockMilestones.slice(offset, offset + limit)
    return []
  }
}

export async function fetchMilestoneById(
  token: string,
  id: string,
): Promise<Milestone | null> {
  try {
    const data = await authGraphqlFetch<{ milestone: Milestone }>(
      MILESTONE_BY_ID_QUERY,
      { id },
      token,
    )
    return data.milestone
  } catch {
    if (useSeedData()) return mockMilestones.find((m) => m.id === id) || null
    return null
  }
}

export async function createMilestone(
  token: string,
  input: CreateMilestoneInput,
): Promise<Milestone> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const milestone: Milestone = {
      id: `ms-${Date.now()}`,
      title: input.title,
      description: input.description,
      phase: input.phase,
      status: input.status || 'planned',
      owner: input.owner,
      ownerColor: input.ownerColor || '#666666',
      startDate: input.startDate,
      endDate: input.endDate,
      progress: input.progress ?? 0,
      okrIds: input.okrIds || [],
      dependencies: input.dependencies || [],
      tags: input.tags || [],
      createdAt: now,
      updatedAt: now,
    }
    mockMilestones = [milestone, ...mockMilestones]
    return milestone
  }

  const data = await authGraphqlFetch<{ createMilestone: Milestone }>(
    CREATE_MILESTONE_MUTATION,
    { input },
    token,
  )
  return data.createMilestone
}

export async function updateMilestone(
  token: string,
  id: string,
  input: UpdateMilestoneInput,
): Promise<Milestone> {
  if (useSeedData()) {
    const idx = mockMilestones.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('Milestone not found')
    const updated: Milestone = {
      ...mockMilestones[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    } as Milestone
    mockMilestones[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateMilestone: Milestone }>(
    UPDATE_MILESTONE_MUTATION,
    { id, input },
    token,
  )
  return data.updateMilestone
}

export async function deleteMilestone(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockMilestones = mockMilestones.filter((m) => m.id !== id)
    mockDependencies = mockDependencies.filter(
      (d) => d.sourceId !== id && d.targetId !== id,
    )
    return
  }

  await authGraphqlFetch<{ deleteMilestone: { id: string } }>(
    DELETE_MILESTONE_MUTATION,
    { id },
    token,
  )
}

export async function fetchDependencies(token: string): Promise<Dependency[]> {
  if (useSeedData()) return mockDependencies
  return []
}

// ===========================================================================
// Formatting helpers
// ===========================================================================

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(s)} — ${fmt(e)}`
}

export function daysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function getPhaseLabel(phase: InitiativePhase): string {
  const labels: Record<InitiativePhase, string> = {
    discovery: 'Discovery',
    design: 'Design',
    build: 'Build',
    launch: 'Launch',
    scale: 'Scale',
  }
  return labels[phase]
}

export function getStatusLabel(status: MilestoneStatus): string {
  const labels: Record<MilestoneStatus, string> = {
    completed: 'Completed',
    'in-progress': 'In Progress',
    planned: 'Planned',
    'at-risk': 'At Risk',
    blocked: 'Blocked',
  }
  return labels[status]
}

export { SEED_MILESTONES, SEED_DEPENDENCIES }
