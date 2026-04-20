const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AgentId =
  | 'brand-guardian'
  | 'content-writer'
  | 'growth-hacker'
  | 'market-intel'
  | 'community-manager'
  | 'devrel-lead'
  | 'partnerships'
  | 'orchestrator'

export type TaskStatus =
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'BLOCKED'

export type TaskPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'

export type TaskCategory =
  | 'CONTENT_CREATION'
  | 'CONTENT_REVIEW'
  | 'BRAND_VALIDATION'
  | 'MARKET_RESEARCH'
  | 'COMMUNITY_RESPONSE'
  | 'GROWTH_EXPERIMENT'
  | 'PARTNER_OUTREACH'
  | 'STRATEGIC_PLANNING'
  | 'REPORTING'
  | 'MONITORING'
  | 'MAINTENANCE'

export interface AgentTask {
  id: string
  title: string
  description: string
  assignedTo: AgentId
  createdBy: string
  category: TaskCategory
  status: TaskStatus
  priority: TaskPriority
  dependsOn: string[]
  blockedBy: string[]
  natsSubject: string | null
  input: Record<string, unknown> | null
  output: Record<string, unknown> | null
  error: string | null
  startedAt: string | null
  completedAt: string | null
  dueAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAgentTaskInput {
  title: string
  description: string
  assignedTo: AgentId
  category: TaskCategory
  priority?: TaskPriority
  dependsOn?: string[]
  dueAt?: string
  input?: Record<string, unknown>
}

export interface UpdateAgentTaskInput {
  status?: TaskStatus
  priority?: TaskPriority
  output?: Record<string, unknown>
  error?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const AGENT_PROFILES: Record<AgentId, { name: string; role: string; natsPrefix: string; color: string }> = {
  'brand-guardian': { name: 'Nori', role: 'Brand Guardian', natsPrefix: 'marketing.tasks.brand-guardian', color: 'var(--af-kintsugi-bright)' },
  'content-writer': { name: 'Muse', role: 'Content Writer', natsPrefix: 'marketing.tasks.content-writer', color: 'var(--af-ultra)' },
  'growth-hacker': { name: 'Surge', role: 'Growth Hacker', natsPrefix: 'marketing.tasks.growth-hacker', color: 'var(--af-signal-go)' },
  'market-intel': { name: 'Cipher', role: 'Market Intel', natsPrefix: 'marketing.tasks.market-intel', color: 'var(--af-aizome-500)' },
  'community-manager': { name: 'Pulse', role: 'Community Manager', natsPrefix: 'marketing.tasks.community-manager', color: 'var(--af-terra)' },
  'devrel-lead': { name: 'Relay', role: 'DevRel Lead', natsPrefix: 'marketing.tasks.devrel-lead', color: 'var(--af-patina)' },
  'partnerships': { name: 'Bridge', role: 'Partnerships & Grants', natsPrefix: 'marketing.tasks.partnerships', color: 'var(--af-ultra-deep)' },
  'orchestrator': { name: 'Axis', role: 'Strategic Orchestrator', natsPrefix: 'marketing.tasks.orchestrator', color: 'var(--af-stone-700)' },
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_TASKS: AgentTask[] = [
  {
    id: 'seed-task-1',
    title: 'Generate weekly social content calendar',
    description: 'Create 15 social posts for the week across X, LinkedIn, Bluesky, and Discord covering product updates and community highlights.',
    assignedTo: 'content-writer',
    createdBy: 'orchestrator',
    category: 'CONTENT_CREATION',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.content-writer.weekly-calendar',
    input: { weekOf: '2026-02-17', platforms: ['X', 'LINKEDIN', 'BLUESKY', 'DISCORD'], postCount: 15 },
    output: null,
    error: null,
    startedAt: '2026-02-15T08:00:00Z',
    completedAt: null,
    dueAt: '2026-02-16T17:00:00Z',
    createdAt: '2026-02-15T07:30:00Z',
    updatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'seed-task-2',
    title: 'Brand compliance review: Q1 campaign batch',
    description: 'Review all 23 scheduled Q1 campaign posts for brand voice compliance, terminology, and partner positioning.',
    assignedTo: 'brand-guardian',
    createdBy: 'orchestrator',
    category: 'BRAND_VALIDATION',
    status: 'QUEUED',
    priority: 'URGENT',
    dependsOn: ['seed-task-1'],
    blockedBy: ['seed-task-1'],
    natsSubject: 'marketing.tasks.brand-guardian.batch-review',
    input: { campaignId: 'seed-campaign-q1', postCount: 23 },
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    dueAt: '2026-02-17T12:00:00Z',
    createdAt: '2026-02-15T07:30:00Z',
    updatedAt: '2026-02-15T07:30:00Z',
  },
  {
    id: 'seed-task-3',
    title: 'Competitor pricing page diff: Railway + Render',
    description: 'Scrape and compare current pricing pages for Railway and Render against our last recorded snapshot. Generate battle card update if changes detected.',
    assignedTo: 'market-intel',
    createdBy: 'orchestrator',
    category: 'MARKET_RESEARCH',
    status: 'COMPLETED',
    priority: 'NORMAL',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.market-intel.pricing-diff',
    input: { competitors: ['railway', 'render'], lastSnapshot: '2026-02-08' },
    output: { changesDetected: true, railway: { newFreeTier: true, priceChange: '-15% on Pro' }, render: { noChange: true } },
    error: null,
    startedAt: '2026-02-14T22:00:00Z',
    completedAt: '2026-02-14T22:12:00Z',
    dueAt: '2026-02-15T09:00:00Z',
    createdAt: '2026-02-14T20:00:00Z',
    updatedAt: '2026-02-14T22:12:00Z',
  },
  {
    id: 'seed-task-4',
    title: 'Community sentiment weekly digest',
    description: 'Aggregate and score sentiment from Discord, X mentions, and Reddit threads from the past 7 days.',
    assignedTo: 'community-manager',
    createdBy: 'orchestrator',
    category: 'MONITORING',
    status: 'COMPLETED',
    priority: 'NORMAL',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.community-manager.sentiment-digest',
    input: { period: '7d', sources: ['discord', 'x', 'reddit'] },
    output: { overallSentiment: 0.72, totalMessages: 347, positivePct: 65, neutralPct: 28, negativePct: 7, topTopics: ['deploy speed', 'pricing', 'IPFS reliability'] },
    error: null,
    startedAt: '2026-02-15T06:00:00Z',
    completedAt: '2026-02-15T06:08:00Z',
    dueAt: '2026-02-15T09:00:00Z',
    createdAt: '2026-02-15T05:00:00Z',
    updatedAt: '2026-02-15T06:08:00Z',
  },
  {
    id: 'seed-task-5',
    title: 'Growth experiment: Onboarding flow A/B test setup',
    description: 'Configure A/B test for new onboarding flow variant with guided deploy wizard vs. current freeform approach. Set traffic allocation to 50/50.',
    assignedTo: 'growth-hacker',
    createdBy: 'seed-user-1',
    category: 'GROWTH_EXPERIMENT',
    status: 'QUEUED',
    priority: 'HIGH',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.growth-hacker.ab-test',
    input: { experimentId: 'onboarding-wizard-v2', trafficSplit: 50, variants: ['control', 'wizard'] },
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    dueAt: '2026-02-18T17:00:00Z',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'seed-task-6',
    title: 'Changelog blog post: CLI v2.3.0 release',
    description: 'Generate a blog post and social announcement thread for the CLI v2.3.0 release featuring new deploy hooks and improved error messages.',
    assignedTo: 'devrel-lead',
    createdBy: 'orchestrator',
    category: 'CONTENT_CREATION',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.devrel-lead.changelog-post',
    input: { package: '@alternatefutures/cli', version: '2.3.0', features: ['deploy hooks', 'improved error messages', 'init --template flag'] },
    output: null,
    error: null,
    startedAt: '2026-02-15T10:00:00Z',
    completedAt: null,
    dueAt: '2026-02-16T12:00:00Z',
    createdAt: '2026-02-15T09:30:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'seed-task-7',
    title: 'Akash Network partnership co-marketing proposal',
    description: 'Draft co-marketing proposal for Akash Network: joint webinar, cross-promotion posts, integration case study.',
    assignedTo: 'partnerships',
    createdBy: 'seed-user-1',
    category: 'PARTNER_OUTREACH',
    status: 'FAILED',
    priority: 'HIGH',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.partnerships.co-marketing',
    input: { partner: 'Akash Network', proposalType: 'co-marketing' },
    output: null,
    error: 'Rate limited by partner API. Retry after 2026-02-16T00:00:00Z.',
    startedAt: '2026-02-14T14:00:00Z',
    completedAt: null,
    dueAt: '2026-02-17T17:00:00Z',
    createdAt: '2026-02-14T13:00:00Z',
    updatedAt: '2026-02-14T14:05:00Z',
  },
  {
    id: 'seed-task-8',
    title: 'Update Q1 OKR progress scores',
    description: 'Pull latest metric values and update all Q1 OKR key results with current progress percentages.',
    assignedTo: 'orchestrator',
    createdBy: 'orchestrator',
    category: 'REPORTING',
    status: 'COMPLETED',
    priority: 'LOW',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.orchestrator.okr-update',
    input: { quarter: 'Q1-2026' },
    output: { okrsUpdated: 4, keyResultsUpdated: 12, avgProgress: 34 },
    error: null,
    startedAt: '2026-02-15T06:00:00Z',
    completedAt: '2026-02-15T06:02:00Z',
    dueAt: '2026-02-15T09:00:00Z',
    createdAt: '2026-02-15T05:55:00Z',
    updatedAt: '2026-02-15T06:02:00Z',
  },
  {
    id: 'seed-task-9',
    title: 'Draft partnership proposal: deSEC DNS integration',
    description: 'Create technical proposal for deSEC DNS integration partnership including co-branded documentation and shared API.',
    assignedTo: 'partnerships',
    createdBy: 'seed-user-1',
    category: 'PARTNER_OUTREACH',
    status: 'QUEUED',
    priority: 'NORMAL',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.partnerships.partner_outreach',
    input: { partner: 'deSEC', integrationType: 'DNS', proposalType: 'technical-partnership' },
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    dueAt: '2026-02-20T17:00:00Z',
    createdAt: '2026-02-15T11:00:00Z',
    updatedAt: '2026-02-15T11:00:00Z',
  },
  {
    id: 'seed-task-10',
    title: 'AEO audit: Perplexity and ChatGPT coverage',
    description: 'Run answer-engine-optimization audit queries against Perplexity and ChatGPT to measure AF brand visibility and accuracy in AI-generated answers.',
    assignedTo: 'growth-hacker',
    createdBy: 'orchestrator',
    category: 'MONITORING',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.growth-hacker.monitoring',
    input: { engines: ['perplexity', 'chatgpt'], queries: 25, verticals: ['decentralized-hosting', 'ipfs-deployment'] },
    output: null,
    error: null,
    startedAt: '2026-02-15T09:30:00Z',
    completedAt: null,
    dueAt: '2026-02-15T18:00:00Z',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-15T09:30:00Z',
  },
  {
    id: 'seed-task-11',
    title: 'Write deploy guide: SvelteKit on Arweave',
    description: 'Create end-to-end tutorial for deploying a SvelteKit app on Arweave via AlternateFutures, including build config, environment variables, and DNS setup.',
    assignedTo: 'devrel-lead',
    createdBy: 'seed-user-1',
    category: 'CONTENT_CREATION',
    status: 'QUEUED',
    priority: 'HIGH',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.devrel-lead.content_creation',
    input: { framework: 'SvelteKit', storage: 'Arweave', templateRepo: 'template-cloud-svelte' },
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    dueAt: '2026-02-19T17:00:00Z',
    createdAt: '2026-02-15T10:30:00Z',
    updatedAt: '2026-02-15T10:30:00Z',
  },
  {
    id: 'seed-task-12',
    title: 'Community Discord event: February town hall',
    description: 'Plan and announce the February community town hall in Discord. Prepare agenda, speaker lineup, and Q&A topics.',
    assignedTo: 'community-manager',
    createdBy: 'orchestrator',
    category: 'COMMUNITY_RESPONSE',
    status: 'QUEUED',
    priority: 'HIGH',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.community-manager.community_response',
    input: { eventDate: '2026-02-21T18:00:00Z', format: 'discord-stage', expectedAttendees: 150 },
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    dueAt: '2026-02-19T12:00:00Z',
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'seed-task-13',
    title: 'Competitive battle card update: Vercel vs AF',
    description: 'Update the Vercel competitive battle card with latest pricing changes, feature gaps, and AF differentiators.',
    assignedTo: 'market-intel',
    createdBy: 'orchestrator',
    category: 'MARKET_RESEARCH',
    status: 'COMPLETED',
    priority: 'NORMAL',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.market-intel.market_research',
    input: { competitor: 'vercel', lastUpdated: '2026-01-20' },
    output: { keyDifferences: 5, pricingGap: '62% cheaper at scale', newFeatures: ['edge functions v3', 'blob storage GA'] },
    error: null,
    startedAt: '2026-02-14T16:00:00Z',
    completedAt: '2026-02-14T16:45:00Z',
    dueAt: '2026-02-15T17:00:00Z',
    createdAt: '2026-02-14T15:00:00Z',
    updatedAt: '2026-02-14T16:45:00Z',
  },
  {
    id: 'seed-task-14',
    title: 'Brand voice certification: Content Writer agent',
    description: 'Run brand voice certification test for the Content Writer agent. Validate 20 sample outputs against brand guidelines.',
    assignedTo: 'brand-guardian',
    createdBy: 'orchestrator',
    category: 'BRAND_VALIDATION',
    status: 'BLOCKED',
    priority: 'NORMAL',
    dependsOn: ['seed-task-2'],
    blockedBy: ['seed-task-2'],
    natsSubject: 'marketing.tasks.brand-guardian.brand_validation',
    input: { agentId: 'content-writer', sampleCount: 20 },
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    dueAt: '2026-02-18T17:00:00Z',
    createdAt: '2026-02-15T07:45:00Z',
    updatedAt: '2026-02-15T07:45:00Z',
  },
  {
    id: 'seed-task-15',
    title: 'Weekly KPI snapshot collection',
    description: 'Collect all weekly KPI values from data sources (Stripe, GitHub, npm, analytics) and generate snapshots for the executive dashboard.',
    assignedTo: 'orchestrator',
    createdBy: 'orchestrator',
    category: 'REPORTING',
    status: 'COMPLETED',
    priority: 'NORMAL',
    dependsOn: [],
    blockedBy: [],
    natsSubject: 'marketing.tasks.orchestrator.reporting',
    input: { weekOf: '2026-02-10', metrics: 16 },
    output: { snapshotsCreated: 16, alertsTriggered: 2, alertMetrics: ['churn_rate', 'cac'] },
    error: null,
    startedAt: '2026-02-15T05:00:00Z',
    completedAt: '2026-02-15T05:15:00Z',
    dueAt: '2026-02-15T06:00:00Z',
    createdAt: '2026-02-15T04:55:00Z',
    updatedAt: '2026-02-15T05:15:00Z',
  },
  {
    id: 'seed-task-16',
    title: 'Strategic content calendar: March planning',
    description: 'Generate strategic content calendar for March 2026 aligned with Q1 OKRs, upcoming product releases, and community events.',
    assignedTo: 'orchestrator',
    createdBy: 'seed-user-1',
    category: 'STRATEGIC_PLANNING',
    status: 'QUEUED',
    priority: 'LOW',
    dependsOn: ['seed-task-1', 'seed-task-8'],
    blockedBy: [],
    natsSubject: 'marketing.tasks.orchestrator.strategic_planning',
    input: { month: 'March 2026', pillars: ['product-launches', 'community', 'thought-leadership', 'partnerships'] },
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    dueAt: '2026-02-25T17:00:00Z',
    createdAt: '2026-02-15T12:00:00Z',
    updatedAt: '2026-02-15T12:00:00Z',
  },
]

let mockTasks = [...SEED_TASKS]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
// GraphQL queries
// ---------------------------------------------------------------------------

const AGENT_TASK_FIELDS = `
  id title description assignedTo createdBy category status priority
  dependsOn blockedBy natsSubject input output error
  startedAt completedAt dueAt createdAt updatedAt
`

const AGENT_TASKS_QUERY = `
  query AgentTasks($limit: Int, $offset: Int, $status: String, $assignedTo: String, $priority: String, $category: String) {
    agentTasks(limit: $limit, offset: $offset, status: $status, assignedTo: $assignedTo, priority: $priority, category: $category) {
      ${AGENT_TASK_FIELDS}
    }
  }
`

const CREATE_AGENT_TASK_MUTATION = `
  mutation CreateAgentTask($input: CreateAgentTaskInput!) {
    createAgentTask(input: $input) {
      ${AGENT_TASK_FIELDS}
    }
  }
`

const UPDATE_AGENT_TASK_MUTATION = `
  mutation UpdateAgentTask($id: ID!, $input: UpdateAgentTaskInput!) {
    updateAgentTask(id: $id, input: $input) {
      ${AGENT_TASK_FIELDS}
    }
  }
`

// ---------------------------------------------------------------------------
// CRUD functions
// ---------------------------------------------------------------------------

export async function fetchAgentTasks(
  token: string,
  options?: { limit?: number; offset?: number; status?: TaskStatus; assignedTo?: AgentId; priority?: TaskPriority; category?: TaskCategory },
): Promise<AgentTask[]> {
  try {
    const data = await authGraphqlFetch<{ agentTasks: AgentTask[] }>(
      AGENT_TASKS_QUERY,
      {
        limit: options?.limit ?? 100,
        offset: options?.offset ?? 0,
        status: options?.status ?? null,
        assignedTo: options?.assignedTo ?? null,
        priority: options?.priority ?? null,
        category: options?.category ?? null,
      },
      token,
    )
    return data.agentTasks
  } catch {
    if (useSeedData()) {
      let filtered = [...mockTasks]
      if (options?.status) filtered = filtered.filter((t) => t.status === options.status)
      if (options?.assignedTo) filtered = filtered.filter((t) => t.assignedTo === options.assignedTo)
      if (options?.priority) filtered = filtered.filter((t) => t.priority === options.priority)
      if (options?.category) filtered = filtered.filter((t) => t.category === options.category)
      const offset = options?.offset ?? 0
      const limit = options?.limit ?? 100
      return filtered.slice(offset, offset + limit)
    }
    return []
  }
}

export async function fetchAgentTaskById(
  token: string,
  id: string,
): Promise<AgentTask | null> {
  try {
    const data = await authGraphqlFetch<{ agentTask: AgentTask }>(
      `query AgentTask($id: ID!) { agentTask(id: $id) { ${AGENT_TASK_FIELDS} } }`,
      { id },
      token,
    )
    return data.agentTask
  } catch {
    if (useSeedData()) return mockTasks.find((t) => t.id === id) || null
    return null
  }
}

export async function createAgentTask(
  token: string,
  input: CreateAgentTaskInput,
): Promise<AgentTask> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const profile = AGENT_PROFILES[input.assignedTo]
    const task: AgentTask = {
      id: `seed-task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: input.title,
      description: input.description,
      assignedTo: input.assignedTo,
      createdBy: 'seed-user-1',
      category: input.category,
      status: 'QUEUED',
      priority: input.priority || 'NORMAL',
      dependsOn: input.dependsOn || [],
      blockedBy: [],
      natsSubject: `${profile.natsPrefix}.${input.category.toLowerCase()}`,
      input: input.input || null,
      output: null,
      error: null,
      startedAt: null,
      completedAt: null,
      dueAt: input.dueAt || null,
      createdAt: now,
      updatedAt: now,
    }
    mockTasks = [task, ...mockTasks]
    return task
  }

  const data = await authGraphqlFetch<{ createAgentTask: AgentTask }>(
    CREATE_AGENT_TASK_MUTATION,
    { input },
    token,
  )
  return data.createAgentTask
}

export async function updateAgentTask(
  token: string,
  id: string,
  input: UpdateAgentTaskInput,
): Promise<AgentTask> {
  if (useSeedData()) {
    const idx = mockTasks.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Task not found')
    const now = new Date().toISOString()
    const existing = mockTasks[idx]
    const updated: AgentTask = {
      ...existing,
      status: input.status !== undefined ? input.status : existing.status,
      priority: input.priority !== undefined ? input.priority : existing.priority,
      output: input.output !== undefined ? input.output : existing.output,
      error: input.error !== undefined ? input.error : existing.error,
      startedAt: input.status === 'IN_PROGRESS' && !existing.startedAt ? now : existing.startedAt,
      completedAt: input.status === 'COMPLETED' || input.status === 'FAILED' ? now : existing.completedAt,
      updatedAt: now,
    }
    mockTasks[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateAgentTask: AgentTask }>(
    UPDATE_AGENT_TASK_MUTATION,
    { id, input },
    token,
  )
  return data.updateAgentTask
}

export async function cancelAgentTask(
  token: string,
  id: string,
): Promise<AgentTask> {
  return updateAgentTask(token, id, { status: 'CANCELLED' })
}

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

export interface AgentTaskStats {
  total: number
  queued: number
  inProgress: number
  completed: number
  failed: number
  blocked: number
  byAgent: Record<AgentId, { total: number; active: number; completed: number; failed: number }>
}

export function computeTaskStats(tasks: AgentTask[]): AgentTaskStats {
  const byAgent = {} as AgentTaskStats['byAgent']
  for (const agentId of Object.keys(AGENT_PROFILES) as AgentId[]) {
    byAgent[agentId] = { total: 0, active: 0, completed: 0, failed: 0 }
  }

  for (const task of tasks) {
    const agent = byAgent[task.assignedTo]
    if (agent) {
      agent.total++
      if (task.status === 'IN_PROGRESS' || task.status === 'QUEUED') agent.active++
      if (task.status === 'COMPLETED') agent.completed++
      if (task.status === 'FAILED') agent.failed++
    }
  }

  return {
    total: tasks.length,
    queued: tasks.filter((t) => t.status === 'QUEUED').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    failed: tasks.filter((t) => t.status === 'FAILED').length,
    blocked: tasks.filter((t) => t.status === 'BLOCKED').length,
    byAgent,
  }
}

// ---------------------------------------------------------------------------
// UI style constants
// ---------------------------------------------------------------------------

export const TASK_STATUS_STYLES: Record<TaskStatus, { bg: string; color: string; label: string }> = {
  QUEUED: { bg: '#F3F4F6', color: '#6B7280', label: 'Queued' },
  IN_PROGRESS: { bg: '#DBEAFE', color: '#1E40AF', label: 'In Progress' },
  COMPLETED: { bg: '#D1FAE5', color: '#065F46', label: 'Completed' },
  FAILED: { bg: '#FEE2E2', color: '#991B1B', label: 'Failed' },
  CANCELLED: { bg: '#FEF3C7', color: '#92400E', label: 'Cancelled' },
  BLOCKED: { bg: '#FCE7F3', color: '#9D174D', label: 'Blocked' },
}

export const TASK_PRIORITY_STYLES: Record<TaskPriority, { bg: string; color: string; label: string }> = {
  URGENT: { bg: '#FEE2E2', color: '#991B1B', label: 'Urgent' },
  HIGH: { bg: '#FEF3C7', color: '#92400E', label: 'High' },
  NORMAL: { bg: '#DBEAFE', color: '#1E40AF', label: 'Normal' },
  LOW: { bg: '#F3F4F6', color: '#6B7280', label: 'Low' },
}

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  CONTENT_CREATION: 'Content Creation',
  CONTENT_REVIEW: 'Content Review',
  BRAND_VALIDATION: 'Brand Validation',
  MARKET_RESEARCH: 'Market Research',
  COMMUNITY_RESPONSE: 'Community',
  GROWTH_EXPERIMENT: 'Growth Experiment',
  PARTNER_OUTREACH: 'Partner Outreach',
  STRATEGIC_PLANNING: 'Strategic Planning',
  REPORTING: 'Reporting',
  MONITORING: 'Monitoring',
  MAINTENANCE: 'Maintenance',
}

// Re-export seed data
export { SEED_TASKS }
