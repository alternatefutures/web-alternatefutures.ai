// ---------------------------------------------------------------------------
// BF-DR-001: Changelog-to-Content Automation
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChangelogEntryType = 'feature' | 'fix' | 'improvement' | 'breaking' | 'deprecation'

export interface ChangelogEntry {
  id: string
  version: string
  title: string
  description: string
  type: ChangelogEntryType
  relatedPRs: string[]
  relatedIssues: string[]
  date: string
  author: string
  tags: string[]
}

export interface CreateChangelogInput {
  version: string
  title: string
  description: string
  type: ChangelogEntryType
  relatedPRs?: string[]
  relatedIssues?: string[]
  date?: string
  author: string
  tags?: string[]
}

export interface UpdateChangelogInput {
  version?: string
  title?: string
  description?: string
  type?: ChangelogEntryType
  relatedPRs?: string[]
  relatedIssues?: string[]
  date?: string
  author?: string
  tags?: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CHANGELOG_TYPE_STYLES: Record<ChangelogEntryType, { bg: string; color: string; label: string }> = {
  feature: { bg: '#DBEAFE', color: '#1E40AF', label: 'Feature' },
  fix: { bg: '#D1FAE5', color: '#065F46', label: 'Fix' },
  improvement: { bg: '#FEF3C7', color: '#92400E', label: 'Improvement' },
  breaking: { bg: '#FEE2E2', color: '#991B1B', label: 'Breaking' },
  deprecation: { bg: '#F3F4F6', color: '#6B7280', label: 'Deprecation' },
}

export const ALL_CHANGELOG_TYPES: ChangelogEntryType[] = [
  'feature', 'fix', 'improvement', 'breaking', 'deprecation',
]

// ---------------------------------------------------------------------------
// GraphQL client (authenticated)
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/graphql'

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
// Seed data — 15+ changelog entries for recent AF releases
// ---------------------------------------------------------------------------

const SEED_CHANGELOG: ChangelogEntry[] = [
  {
    id: 'cl-001',
    version: '0.8.0',
    title: 'AI Agent Deployment Support',
    description: 'Added first-class support for deploying AI agents on decentralized infrastructure. Agents can be deployed with persistent storage, scheduled execution, and auto-scaling across Akash Network providers.',
    type: 'feature',
    relatedPRs: ['#142', '#145'],
    relatedIssues: ['#108', '#112'],
    date: '2026-02-14T10:00:00Z',
    author: 'Senku',
    tags: ['ai-agents', 'akash', 'deployment'],
  },
  {
    id: 'cl-002',
    version: '0.8.0',
    title: 'SvelteKit 2 + Svelte 5 Dashboard Migration',
    description: 'Migrated the main dashboard to SvelteKit 2.0 with Svelte 5 runes-based reactivity. Improved initial load time by 40% and reduced bundle size by 25%.',
    type: 'improvement',
    relatedPRs: ['#138', '#139', '#141'],
    relatedIssues: ['#105'],
    date: '2026-02-13T14:00:00Z',
    author: 'Yusuke',
    tags: ['dashboard', 'svelte', 'performance'],
  },
  {
    id: 'cl-003',
    version: '0.7.5',
    title: 'Arweave Permanent Storage Integration',
    description: 'Full Arweave integration via Turbo SDK. Users can now deploy sites with permanent storage guarantees. Content is bundled and uploaded to Arweave with automatic gateway routing.',
    type: 'feature',
    relatedPRs: ['#134'],
    relatedIssues: ['#98'],
    date: '2026-02-10T09:00:00Z',
    author: 'Lain',
    tags: ['arweave', 'storage', 'turbo-sdk'],
  },
  {
    id: 'cl-004',
    version: '0.7.5',
    title: 'CLI Deploy Speed Improvement',
    description: 'Optimized the `af deploy` command with parallel chunk uploads and improved diff detection. Deploy times reduced by 60% for incremental updates.',
    type: 'improvement',
    relatedPRs: ['#133'],
    relatedIssues: ['#95'],
    date: '2026-02-09T16:00:00Z',
    author: 'Senku',
    tags: ['cli', 'performance', 'deploy'],
  },
  {
    id: 'cl-005',
    version: '0.7.4',
    title: 'Fix IPNS Resolution Timeout',
    description: 'Fixed an issue where IPNS name resolution would timeout on certain gateway configurations. Added fallback resolution through multiple IPFS nodes.',
    type: 'fix',
    relatedPRs: ['#130'],
    relatedIssues: ['#92', '#93'],
    date: '2026-02-07T11:00:00Z',
    author: 'Lain',
    tags: ['ipns', 'gateway', 'bug'],
  },
  {
    id: 'cl-006',
    version: '0.7.4',
    title: 'GraphQL Depth Limiting',
    description: 'Added query depth limiting and complexity analysis to the GraphQL API gateway. Prevents deeply nested queries from causing performance issues.',
    type: 'improvement',
    relatedPRs: ['#129'],
    relatedIssues: ['#89'],
    date: '2026-02-06T15:00:00Z',
    author: 'Argus',
    tags: ['api', 'security', 'graphql'],
  },
  {
    id: 'cl-007',
    version: '0.7.3',
    title: 'Web3 Wallet Authentication (SIWE)',
    description: 'Sign-In with Ethereum support added. Users can authenticate with MetaMask, WalletConnect, and Phantom wallets. Supports account linking with existing email/social accounts.',
    type: 'feature',
    relatedPRs: ['#125', '#126'],
    relatedIssues: ['#80', '#82'],
    date: '2026-02-03T10:00:00Z',
    author: 'Atlas',
    tags: ['auth', 'web3', 'siwe', 'wallet'],
  },
  {
    id: 'cl-008',
    version: '0.7.3',
    title: 'Deprecate Legacy Upload Endpoint',
    description: 'The /api/v1/upload endpoint is deprecated in favor of /api/v2/deploy. The legacy endpoint will be removed in v0.9.0. Migration guide available in docs.',
    type: 'deprecation',
    relatedPRs: ['#124'],
    relatedIssues: ['#78'],
    date: '2026-02-02T09:00:00Z',
    author: 'Senku',
    tags: ['api', 'migration', 'upload'],
  },
  {
    id: 'cl-009',
    version: '0.7.2',
    title: 'SDK v2 with Tree Shaking',
    description: 'Released @alternatefutures/sdk v2 with full ESM support and tree-shakeable exports. Bundle size reduced by 70% when importing individual modules.',
    type: 'feature',
    relatedPRs: ['#120'],
    relatedIssues: ['#75'],
    date: '2026-01-28T14:00:00Z',
    author: 'Senku',
    tags: ['sdk', 'esm', 'bundle-size'],
  },
  {
    id: 'cl-010',
    version: '0.7.2',
    title: 'Fix Prisma Connection Pool Exhaustion',
    description: 'Resolved connection pool exhaustion under high concurrent load by implementing connection pooling with PgBouncer and adjusting Prisma pool settings.',
    type: 'fix',
    relatedPRs: ['#119'],
    relatedIssues: ['#73'],
    date: '2026-01-27T16:00:00Z',
    author: 'Lain',
    tags: ['database', 'prisma', 'performance'],
  },
  {
    id: 'cl-011',
    version: '0.7.1',
    title: 'Next.js Adapter for AF Hosting',
    description: 'Released adapter-cloud-next for seamless Next.js deployment on AF infrastructure. Supports SSR, API routes, and ISR with automatic edge function deployment.',
    type: 'feature',
    relatedPRs: ['#115', '#116'],
    relatedIssues: ['#68'],
    date: '2026-01-22T10:00:00Z',
    author: 'Senku',
    tags: ['nextjs', 'adapter', 'ssr'],
  },
  {
    id: 'cl-012',
    version: '0.7.1',
    title: 'Breaking: Auth Token Format Change',
    description: 'JWT tokens now use RS256 signing instead of HS256. All existing tokens will be invalidated. Users must re-authenticate after this update.',
    type: 'breaking',
    relatedPRs: ['#114'],
    relatedIssues: ['#67'],
    date: '2026-01-21T09:00:00Z',
    author: 'Argus',
    tags: ['auth', 'security', 'jwt'],
  },
  {
    id: 'cl-013',
    version: '0.7.0',
    title: 'Stripe Billing Integration',
    description: 'Full Stripe billing integration with tiered pricing plans. Supports monthly and annual subscriptions, usage-based add-ons, and automated invoicing.',
    type: 'feature',
    relatedPRs: ['#110', '#111'],
    relatedIssues: ['#60', '#62'],
    date: '2026-01-15T14:00:00Z',
    author: 'Atlas',
    tags: ['billing', 'stripe', 'subscriptions'],
  },
  {
    id: 'cl-014',
    version: '0.7.0',
    title: 'Fix Filecoin CAR File Assembly',
    description: 'Fixed incorrect CAR file assembly that caused some large deployments to fail on Filecoin storage. Improved chunking algorithm for files larger than 32GB.',
    type: 'fix',
    relatedPRs: ['#109'],
    relatedIssues: ['#58'],
    date: '2026-01-14T11:00:00Z',
    author: 'Lain',
    tags: ['filecoin', 'storage', 'bug'],
  },
  {
    id: 'cl-015',
    version: '0.6.9',
    title: 'Personal Access Token Support',
    description: 'Users can now generate Personal Access Tokens (PATs) for API and CLI authentication. Supports scoped permissions and configurable expiration.',
    type: 'feature',
    relatedPRs: ['#105'],
    relatedIssues: ['#55'],
    date: '2026-01-10T10:00:00Z',
    author: 'Argus',
    tags: ['auth', 'pat', 'api'],
  },
  {
    id: 'cl-016',
    version: '0.6.9',
    title: 'Rate Limiting on GraphQL API',
    description: 'Implemented per-user and per-IP rate limiting on the GraphQL API with configurable thresholds. Protects against abuse while allowing burst traffic for legitimate users.',
    type: 'improvement',
    relatedPRs: ['#104'],
    relatedIssues: ['#53'],
    date: '2026-01-09T15:00:00Z',
    author: 'Argus',
    tags: ['api', 'security', 'rate-limiting'],
  },
  {
    id: 'cl-017',
    version: '0.6.8',
    title: 'Astro, Vue, and Hugo Starter Templates',
    description: 'Added starter templates for Astro, Vue, and Hugo frameworks. Users can initialize projects with `af init` and select from available templates.',
    type: 'feature',
    relatedPRs: ['#100', '#101', '#102'],
    relatedIssues: ['#48'],
    date: '2026-01-05T10:00:00Z',
    author: 'Quinn',
    tags: ['templates', 'astro', 'vue', 'hugo'],
  },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// In-memory mock store
// ---------------------------------------------------------------------------

let mockChangelog = [...SEED_CHANGELOG]

// ---------------------------------------------------------------------------
// CRUD functions
// ---------------------------------------------------------------------------

export async function fetchAllChangelog(token: string): Promise<ChangelogEntry[]> {
  if (useSeedData()) {
    return [...mockChangelog].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }
  const data = await authGraphqlFetch<{ changelogEntries: ChangelogEntry[] }>(
    `query FetchAllChangelog {
      changelogEntries {
        id version title description type relatedPRs relatedIssues
        date author tags
      }
    }`,
    {},
    token,
  )
  return data.changelogEntries
}

export async function fetchChangelogById(
  token: string,
  id: string,
): Promise<ChangelogEntry | null> {
  if (useSeedData()) {
    return mockChangelog.find((e) => e.id === id) || null
  }
  const data = await authGraphqlFetch<{ changelogEntry: ChangelogEntry | null }>(
    `query FetchChangelogById($id: ID!) {
      changelogEntry(id: $id) {
        id version title description type relatedPRs relatedIssues
        date author tags
      }
    }`,
    { id },
    token,
  )
  return data.changelogEntry
}

export async function fetchChangelogByVersion(
  token: string,
  version: string,
): Promise<ChangelogEntry[]> {
  if (useSeedData()) {
    return mockChangelog
      .filter((e) => e.version === version)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  const data = await authGraphqlFetch<{ changelogByVersion: ChangelogEntry[] }>(
    `query FetchChangelogByVersion($version: String!) {
      changelogByVersion(version: $version) {
        id version title description type relatedPRs relatedIssues
        date author tags
      }
    }`,
    { version },
    token,
  )
  return data.changelogByVersion
}

export async function fetchChangelogByType(
  token: string,
  type: ChangelogEntryType,
): Promise<ChangelogEntry[]> {
  if (useSeedData()) {
    return mockChangelog
      .filter((e) => e.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  const data = await authGraphqlFetch<{ changelogByType: ChangelogEntry[] }>(
    `query FetchChangelogByType($type: String!) {
      changelogByType(type: $type) {
        id version title description type relatedPRs relatedIssues
        date author tags
      }
    }`,
    { type },
    token,
  )
  return data.changelogByType
}

export async function fetchChangelogByDateRange(
  token: string,
  startDate: string,
  endDate: string,
): Promise<ChangelogEntry[]> {
  if (useSeedData()) {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    return mockChangelog
      .filter((e) => {
        const d = new Date(e.date).getTime()
        return d >= start && d <= end
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  const data = await authGraphqlFetch<{ changelogByDateRange: ChangelogEntry[] }>(
    `query FetchChangelogByDateRange($startDate: String!, $endDate: String!) {
      changelogByDateRange(startDate: $startDate, endDate: $endDate) {
        id version title description type relatedPRs relatedIssues
        date author tags
      }
    }`,
    { startDate, endDate },
    token,
  )
  return data.changelogByDateRange
}

export async function createChangelogEntry(
  token: string,
  input: CreateChangelogInput,
): Promise<ChangelogEntry> {
  if (useSeedData()) {
    const entry: ChangelogEntry = {
      id: `cl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      version: input.version,
      title: input.title,
      description: input.description,
      type: input.type,
      relatedPRs: input.relatedPRs || [],
      relatedIssues: input.relatedIssues || [],
      date: input.date || new Date().toISOString(),
      author: input.author,
      tags: input.tags || [],
    }
    mockChangelog = [entry, ...mockChangelog]
    return entry
  }
  const data = await authGraphqlFetch<{ createChangelogEntry: ChangelogEntry }>(
    `mutation CreateChangelogEntry($input: CreateChangelogInput!) {
      createChangelogEntry(input: $input) {
        id version title description type relatedPRs relatedIssues
        date author tags
      }
    }`,
    { input },
    token,
  )
  return data.createChangelogEntry
}

export async function updateChangelogEntry(
  token: string,
  id: string,
  input: UpdateChangelogInput,
): Promise<ChangelogEntry> {
  if (useSeedData()) {
    const idx = mockChangelog.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('Changelog entry not found')
    const existing = mockChangelog[idx]
    const updated: ChangelogEntry = {
      ...existing,
      version: input.version !== undefined ? input.version : existing.version,
      title: input.title !== undefined ? input.title : existing.title,
      description: input.description !== undefined ? input.description : existing.description,
      type: input.type !== undefined ? input.type : existing.type,
      relatedPRs: input.relatedPRs !== undefined ? input.relatedPRs : existing.relatedPRs,
      relatedIssues: input.relatedIssues !== undefined ? input.relatedIssues : existing.relatedIssues,
      date: input.date !== undefined ? input.date : existing.date,
      author: input.author !== undefined ? input.author : existing.author,
      tags: input.tags !== undefined ? input.tags : existing.tags,
    }
    mockChangelog[idx] = updated
    return updated
  }
  const data = await authGraphqlFetch<{ updateChangelogEntry: ChangelogEntry }>(
    `mutation UpdateChangelogEntry($id: ID!, $input: UpdateChangelogInput!) {
      updateChangelogEntry(id: $id, input: $input) {
        id version title description type relatedPRs relatedIssues
        date author tags
      }
    }`,
    { id, input },
    token,
  )
  return data.updateChangelogEntry
}

export async function deleteChangelogEntry(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockChangelog = mockChangelog.filter((e) => e.id !== id)
    return
  }
  await authGraphqlFetch<{ deleteChangelogEntry: boolean }>(
    `mutation DeleteChangelogEntry($id: ID!) {
      deleteChangelogEntry(id: $id)
    }`,
    { id },
    token,
  )
}

// ---------------------------------------------------------------------------
// GitHub PR auto-generation (mock implementation with seed data)
// ---------------------------------------------------------------------------

export interface GitHubPRSummary {
  number: number
  title: string
  mergedAt: string
  author: string
  labels: string[]
}

export async function fetchRecentMergedPRs(token: string): Promise<GitHubPRSummary[]> {
  if (useSeedData()) {
    return SEED_GITHUB_PRS
  }
  const data = await authGraphqlFetch<{ recentMergedPRs: GitHubPRSummary[] }>(
    `query FetchRecentMergedPRs {
      recentMergedPRs {
        number title mergedAt author labels
      }
    }`,
    {},
    token,
  )
  return data.recentMergedPRs
}

export function inferChangelogType(labels: string[]): ChangelogEntryType {
  if (labels.includes('breaking-change') || labels.includes('breaking')) return 'breaking'
  if (labels.includes('deprecation') || labels.includes('deprecated')) return 'deprecation'
  if (labels.includes('bug') || labels.includes('fix') || labels.includes('bugfix')) return 'fix'
  if (labels.includes('feature') || labels.includes('enhancement')) return 'feature'
  return 'improvement'
}

export function generateChangelogFromPR(pr: GitHubPRSummary): CreateChangelogInput {
  return {
    version: 'UNRELEASED',
    title: pr.title,
    description: `Auto-generated from PR #${pr.number}: ${pr.title}`,
    type: inferChangelogType(pr.labels),
    relatedPRs: [`#${pr.number}`],
    relatedIssues: [],
    date: pr.mergedAt,
    author: pr.author,
    tags: pr.labels.filter((l) => !['bug', 'feature', 'enhancement', 'breaking-change', 'deprecation'].includes(l)),
  }
}

const SEED_GITHUB_PRS: GitHubPRSummary[] = [
  { number: 148, title: 'Add WebSocket support for real-time deploy logs', mergedAt: '2026-02-15T08:00:00Z', author: 'Lain', labels: ['feature', 'websocket'] },
  { number: 147, title: 'Fix memory leak in IPFS pinning worker', mergedAt: '2026-02-14T16:00:00Z', author: 'Senku', labels: ['bug', 'ipfs'] },
  { number: 146, title: 'Upgrade Prisma to v6 with improved query engine', mergedAt: '2026-02-14T10:00:00Z', author: 'Lain', labels: ['enhancement', 'database'] },
  { number: 144, title: 'Add OpenTelemetry tracing to API gateway', mergedAt: '2026-02-13T09:00:00Z', author: 'Argus', labels: ['feature', 'observability'] },
  { number: 143, title: 'Remove legacy v1 deployment API', mergedAt: '2026-02-12T14:00:00Z', author: 'Senku', labels: ['breaking-change', 'api'] },
]

export { SEED_CHANGELOG }
