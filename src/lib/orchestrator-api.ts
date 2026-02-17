const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OKRStatus = 'DRAFT' | 'ACTIVE' | 'AT_RISK' | 'ON_TRACK' | 'COMPLETED' | 'CANCELLED'

export type KRUnit = 'PERCENT' | 'COUNT' | 'CURRENCY' | 'SCORE' | 'RATIO'

export type BudgetCategory =
  | 'DEVELOPER_RELATIONS'
  | 'PAID_ADVERTISING'
  | 'CONTENT_MARKETING'
  | 'EVENTS'
  | 'PARTNERSHIPS'
  | 'COMMUNITY'
  | 'SEO'
  | 'CREATIVE_DESIGN'
  | 'TOOLS_SOFTWARE'
  | 'EMAIL_MARKETING'
  | 'CONTINGENCY'

export interface KeyResult {
  id: string
  okrId: string
  title: string
  description: string
  unit: KRUnit
  currentValue: number
  targetValue: number
  startValue: number
  progress: number // 0-100
  trend: 'UP' | 'DOWN' | 'FLAT'
  owner: string
  updatedAt: string
}

export interface OKR {
  id: string
  title: string
  description: string
  quarter: string // e.g. 'Q1-2026'
  status: OKRStatus
  progress: number // 0-100, computed from key results
  keyResults: KeyResult[]
  owner: string
  createdAt: string
  updatedAt: string
}

export interface BudgetLineItem {
  id: string
  category: BudgetCategory
  label: string
  description: string
  quarterlyBudgets: { q1: number; q2: number; q3: number; q4: number }
  yearlyTotal: number
  ytdSpend: number
  ytdCommitted: number
  lastTransactionAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateOKRInput {
  title: string
  description: string
  quarter: string
  owner: string
  keyResults: {
    title: string
    description: string
    unit: KRUnit
    targetValue: number
    startValue?: number
    owner?: string
  }[]
}

export interface UpdateOKRInput {
  title?: string
  description?: string
  status?: OKRStatus
  owner?: string
}

export interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  totalCommitted: number
  remainingBudget: number
  burnRate: number // monthly
  projectedOverUnder: number
  byCategory: Record<BudgetCategory, { budget: number; spent: number; committed: number }>
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_OKRS: OKR[] = [
  {
    id: 'seed-okr-1',
    title: 'Achieve Public Beta Launch Excellence',
    description: 'Drive a successful public beta launch with strong user acquisition, activation, and satisfaction metrics to validate product-market fit.',
    quarter: 'Q1-2026',
    status: 'ACTIVE',
    progress: 45,
    keyResults: [
      {
        id: 'seed-kr-1a',
        okrId: 'seed-okr-1',
        title: 'Beta waitlist signups',
        description: 'Grow the beta waitlist to 2,000 signups through organic and paid channels.',
        unit: 'COUNT',
        currentValue: 1350,
        targetValue: 2000,
        startValue: 0,
        progress: 67.5,
        trend: 'UP',
        owner: 'growth-hacker',
        updatedAt: '2026-02-15T06:00:00Z',
      },
      {
        id: 'seed-kr-1b',
        okrId: 'seed-okr-1',
        title: 'Active beta users',
        description: 'Convert waitlist signups to active beta users who have completed at least one deployment.',
        unit: 'COUNT',
        currentValue: 280,
        targetValue: 800,
        startValue: 0,
        progress: 35,
        trend: 'UP',
        owner: 'community-manager',
        updatedAt: '2026-02-15T06:00:00Z',
      },
      {
        id: 'seed-kr-1c',
        okrId: 'seed-okr-1',
        title: 'NPS score',
        description: 'Achieve a Net Promoter Score of 45+ from beta users surveyed.',
        unit: 'SCORE',
        currentValue: 42,
        targetValue: 45,
        startValue: 0,
        progress: 93.3,
        trend: 'UP',
        owner: 'community-manager',
        updatedAt: '2026-02-14T12:00:00Z',
      },
      {
        id: 'seed-kr-1d',
        okrId: 'seed-okr-1',
        title: 'Deploy success rate',
        description: 'Maintain a deployment success rate of 85% or higher across all supported frameworks.',
        unit: 'PERCENT',
        currentValue: 82,
        targetValue: 85,
        startValue: 72,
        progress: 76.9,
        trend: 'UP',
        owner: 'devrel-lead',
        updatedAt: '2026-02-15T04:00:00Z',
      },
    ],
    owner: 'orchestrator',
    createdAt: '2025-12-15T00:00:00Z',
    updatedAt: '2026-02-15T06:00:00Z',
  },
  {
    id: 'seed-okr-2',
    title: 'Establish Multi-Vertical Growth Engine',
    description: 'Build targeted acquisition funnels for four key verticals: AI Agent Startups, Cost-Optimizing SaaS, Web3 Indie Builders, and Indie Game Devs.',
    quarter: 'Q1-2026',
    status: 'AT_RISK',
    progress: 28,
    keyResults: [
      {
        id: 'seed-kr-2a',
        okrId: 'seed-okr-2',
        title: 'AI Agent Startup signups',
        description: 'Acquire 300 signups from the AI Agent Startup vertical through targeted outreach and content.',
        unit: 'COUNT',
        currentValue: 85,
        targetValue: 300,
        startValue: 0,
        progress: 28.3,
        trend: 'UP',
        owner: 'growth-hacker',
        updatedAt: '2026-02-15T06:00:00Z',
      },
      {
        id: 'seed-kr-2b',
        okrId: 'seed-okr-2',
        title: 'Cost-Opt SaaS evaluations',
        description: 'Drive 200 evaluation signups from SaaS companies looking to optimize infrastructure costs.',
        unit: 'COUNT',
        currentValue: 45,
        targetValue: 200,
        startValue: 0,
        progress: 22.5,
        trend: 'FLAT',
        owner: 'content-writer',
        updatedAt: '2026-02-14T18:00:00Z',
      },
      {
        id: 'seed-kr-2c',
        okrId: 'seed-okr-2',
        title: 'Web3 Indie Builder signups',
        description: 'Acquire 150 signups from independent Web3 builders through community and developer relations.',
        unit: 'COUNT',
        currentValue: 52,
        targetValue: 150,
        startValue: 0,
        progress: 34.7,
        trend: 'UP',
        owner: 'devrel-lead',
        updatedAt: '2026-02-15T06:00:00Z',
      },
      {
        id: 'seed-kr-2d',
        okrId: 'seed-okr-2',
        title: 'Indie Game Dev signups',
        description: 'Acquire 100 signups from indie game developers interested in decentralized hosting for game assets.',
        unit: 'COUNT',
        currentValue: 18,
        targetValue: 100,
        startValue: 0,
        progress: 18,
        trend: 'DOWN',
        owner: 'growth-hacker',
        updatedAt: '2026-02-13T12:00:00Z',
      },
    ],
    owner: 'growth-hacker',
    createdAt: '2025-12-15T00:00:00Z',
    updatedAt: '2026-02-15T06:00:00Z',
  },
  {
    id: 'seed-okr-3',
    title: 'Build Brand Authority in Decentralized Cloud',
    description: 'Establish AlternateFutures as a thought leader in decentralized cloud infrastructure through consistent content, social presence, and community building.',
    quarter: 'Q1-2026',
    status: 'ON_TRACK',
    progress: 55,
    keyResults: [
      {
        id: 'seed-kr-3a',
        okrId: 'seed-okr-3',
        title: 'Blog posts published',
        description: 'Publish 25 high-quality blog posts covering tutorials, comparisons, and thought leadership.',
        unit: 'COUNT',
        currentValue: 14,
        targetValue: 25,
        startValue: 0,
        progress: 56,
        trend: 'UP',
        owner: 'content-writer',
        updatedAt: '2026-02-15T06:00:00Z',
      },
      {
        id: 'seed-kr-3b',
        okrId: 'seed-okr-3',
        title: 'Monthly blog visitors',
        description: 'Grow monthly unique blog visitors to 5,000 through SEO and content distribution.',
        unit: 'COUNT',
        currentValue: 3200,
        targetValue: 5000,
        startValue: 800,
        progress: 57.1,
        trend: 'UP',
        owner: 'content-writer',
        updatedAt: '2026-02-15T06:00:00Z',
      },
      {
        id: 'seed-kr-3c',
        okrId: 'seed-okr-3',
        title: 'Social media followers',
        description: 'Grow combined social media following (X, LinkedIn, Bluesky) to 500.',
        unit: 'COUNT',
        currentValue: 340,
        targetValue: 500,
        startValue: 50,
        progress: 64.4,
        trend: 'UP',
        owner: 'community-manager',
        updatedAt: '2026-02-15T06:00:00Z',
      },
      {
        id: 'seed-kr-3d',
        okrId: 'seed-okr-3',
        title: 'Discord community members',
        description: 'Grow Discord community to 300 members with active daily engagement.',
        unit: 'COUNT',
        currentValue: 180,
        targetValue: 300,
        startValue: 20,
        progress: 57.1,
        trend: 'UP',
        owner: 'community-manager',
        updatedAt: '2026-02-15T06:00:00Z',
      },
    ],
    owner: 'content-writer',
    createdAt: '2025-12-15T00:00:00Z',
    updatedAt: '2026-02-15T06:00:00Z',
  },
  {
    id: 'seed-okr-4',
    title: 'Revenue Foundation',
    description: 'Build the revenue engine with paying customers, healthy unit economics, and low churn to demonstrate business viability.',
    quarter: 'Q1-2026',
    status: 'ACTIVE',
    progress: 35,
    keyResults: [
      {
        id: 'seed-kr-4a',
        okrId: 'seed-okr-4',
        title: 'Monthly recurring revenue',
        description: 'Reach $10K MRR from subscription and usage-based revenue.',
        unit: 'CURRENCY',
        currentValue: 3500,
        targetValue: 10000,
        startValue: 0,
        progress: 35,
        trend: 'UP',
        owner: 'growth-hacker',
        updatedAt: '2026-02-15T06:00:00Z',
      },
      {
        id: 'seed-kr-4b',
        okrId: 'seed-okr-4',
        title: 'Paying customers',
        description: 'Acquire 100 paying customers across all plan tiers.',
        unit: 'COUNT',
        currentValue: 32,
        targetValue: 100,
        startValue: 0,
        progress: 32,
        trend: 'UP',
        owner: 'growth-hacker',
        updatedAt: '2026-02-15T06:00:00Z',
      },
      {
        id: 'seed-kr-4c',
        okrId: 'seed-okr-4',
        title: 'LTV:CAC ratio',
        description: 'Achieve a lifetime value to customer acquisition cost ratio of 5:1.',
        unit: 'RATIO',
        currentValue: 3.2,
        targetValue: 5.0,
        startValue: 0,
        progress: 64,
        trend: 'UP',
        owner: 'growth-hacker',
        updatedAt: '2026-02-14T18:00:00Z',
      },
      {
        id: 'seed-kr-4d',
        okrId: 'seed-okr-4',
        title: 'Monthly churn rate',
        description: 'Reduce monthly churn rate to below 8%.',
        unit: 'PERCENT',
        currentValue: 9.5,
        targetValue: 8,
        startValue: 15,
        progress: 78.6,
        trend: 'DOWN',
        owner: 'community-manager',
        updatedAt: '2026-02-15T06:00:00Z',
      },
    ],
    owner: 'orchestrator',
    createdAt: '2025-12-15T00:00:00Z',
    updatedAt: '2026-02-15T06:00:00Z',
  },
  {
    id: 'seed-okr-5',
    title: 'Secure Strategic Partnerships',
    description: 'Establish partnerships with key ecosystem players and secure grant funding to accelerate growth and validate market positioning.',
    quarter: 'Q1-2026',
    status: 'ON_TRACK',
    progress: 60,
    keyResults: [
      {
        id: 'seed-kr-5a',
        okrId: 'seed-okr-5',
        title: 'Signed partnership agreements',
        description: 'Close 3 signed partnership agreements with complementary Web3/cloud infrastructure providers.',
        unit: 'COUNT',
        currentValue: 2,
        targetValue: 3,
        startValue: 0,
        progress: 66.7,
        trend: 'UP',
        owner: 'partnerships',
        updatedAt: '2026-02-12T16:00:00Z',
      },
      {
        id: 'seed-kr-5b',
        okrId: 'seed-okr-5',
        title: 'Grant applications submitted',
        description: 'Submit 2 grant applications to blockchain ecosystem funds.',
        unit: 'COUNT',
        currentValue: 2,
        targetValue: 2,
        startValue: 0,
        progress: 100,
        trend: 'FLAT',
        owner: 'partnerships',
        updatedAt: '2026-02-08T14:00:00Z',
      },
      {
        id: 'seed-kr-5c',
        okrId: 'seed-okr-5',
        title: 'Co-marketing campaigns launched',
        description: 'Launch 1 co-marketing campaign with a signed partner.',
        unit: 'COUNT',
        currentValue: 0,
        targetValue: 1,
        startValue: 0,
        progress: 0,
        trend: 'FLAT',
        owner: 'partnerships',
        updatedAt: '2026-02-15T06:00:00Z',
      },
    ],
    owner: 'partnerships',
    createdAt: '2025-12-15T00:00:00Z',
    updatedAt: '2026-02-15T06:00:00Z',
  },
]

const SEED_BUDGET: BudgetLineItem[] = [
  {
    id: 'seed-budget-1',
    category: 'DEVELOPER_RELATIONS',
    label: 'Developer Relations',
    description: 'DevRel programs including hackathons, developer advocates, documentation sprints, and community-driven tutorials.',
    quarterlyBudgets: { q1: 25000, q2: 32000, q3: 35000, q4: 28000 },
    yearlyTotal: 120000,
    ytdSpend: 8200,
    ytdCommitted: 14500,
    lastTransactionAt: '2026-02-14T10:30:00Z',
    notes: 'Hackathon sponsorship budget front-loaded in Q2.',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-14T10:30:00Z',
  },
  {
    id: 'seed-budget-2',
    category: 'PAID_ADVERTISING',
    label: 'Paid Advertising',
    description: 'Paid channels including Google Ads, X/Twitter ads, LinkedIn sponsored content, and Reddit promoted posts.',
    quarterlyBudgets: { q1: 20000, q2: 50000, q3: 60000, q4: 45000 },
    yearlyTotal: 175000,
    ytdSpend: 4800,
    ytdCommitted: 12000,
    lastTransactionAt: '2026-02-13T09:15:00Z',
    notes: 'Heavy ramp in Q2/Q3 aligned with product launch milestones.',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-13T09:15:00Z',
  },
  {
    id: 'seed-budget-3',
    category: 'CONTENT_MARKETING',
    label: 'Content Marketing',
    description: 'Blog production, video content, case studies, whitepapers, and guest posting.',
    quarterlyBudgets: { q1: 15000, q2: 20000, q3: 22000, q4: 18000 },
    yearlyTotal: 75000,
    ytdSpend: 6100,
    ytdCommitted: 9200,
    lastTransactionAt: '2026-02-15T07:00:00Z',
    notes: null,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-15T07:00:00Z',
  },
  {
    id: 'seed-budget-4',
    category: 'EVENTS',
    label: 'Events & Conferences',
    description: 'Conference sponsorships, booth design, travel, meetup hosting, and virtual event production.',
    quarterlyBudgets: { q1: 8000, q2: 15000, q3: 22000, q4: 15000 },
    yearlyTotal: 60000,
    ytdSpend: 3400,
    ytdCommitted: 8000,
    lastTransactionAt: '2026-02-10T14:00:00Z',
    notes: 'ETHDenver 2026 booth sponsorship committed.',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
  },
  {
    id: 'seed-budget-5',
    category: 'PARTNERSHIPS',
    label: 'Partnerships',
    description: 'Partnership development costs, co-marketing contributions, and integration bounties.',
    quarterlyBudgets: { q1: 8000, q2: 10000, q3: 12000, q4: 10000 },
    yearlyTotal: 40000,
    ytdSpend: 2100,
    ytdCommitted: 5000,
    lastTransactionAt: '2026-02-08T16:00:00Z',
    notes: 'Akash Network co-marketing contribution pending.',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-08T16:00:00Z',
  },
  {
    id: 'seed-budget-6',
    category: 'COMMUNITY',
    label: 'Community',
    description: 'Discord bot hosting, community rewards, ambassador program, and community management tools.',
    quarterlyBudgets: { q1: 8000, q2: 10000, q3: 10000, q4: 7000 },
    yearlyTotal: 35000,
    ytdSpend: 3800,
    ytdCommitted: 6500,
    lastTransactionAt: '2026-02-14T22:00:00Z',
    notes: null,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-14T22:00:00Z',
  },
  {
    id: 'seed-budget-7',
    category: 'SEO',
    label: 'SEO',
    description: 'SEO tooling, keyword research, technical SEO audits, backlink outreach, and schema markup.',
    quarterlyBudgets: { q1: 7000, q2: 8000, q3: 8000, q4: 7000 },
    yearlyTotal: 30000,
    ytdSpend: 2900,
    ytdCommitted: 5200,
    lastTransactionAt: '2026-02-12T11:00:00Z',
    notes: null,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-12T11:00:00Z',
  },
  {
    id: 'seed-budget-8',
    category: 'CREATIVE_DESIGN',
    label: 'Creative & Design',
    description: 'Brand assets, pitch deck design, social media graphics, video thumbnails, and UI illustrations.',
    quarterlyBudgets: { q1: 6000, q2: 8000, q3: 8000, q4: 6000 },
    yearlyTotal: 28000,
    ytdSpend: 2200,
    ytdCommitted: 4100,
    lastTransactionAt: '2026-02-14T08:00:00Z',
    notes: null,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-14T08:00:00Z',
  },
  {
    id: 'seed-budget-9',
    category: 'TOOLS_SOFTWARE',
    label: 'Tools & Software',
    description: 'SaaS subscriptions for analytics, email marketing, social scheduling, monitoring, and CRM.',
    quarterlyBudgets: { q1: 7000, q2: 6000, q3: 6000, q4: 6000 },
    yearlyTotal: 25000,
    ytdSpend: 4500,
    ytdCommitted: 7000,
    lastTransactionAt: '2026-02-15T00:00:00Z',
    notes: 'Annual licenses for Posthog and Linear prepaid in Q1.',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'seed-budget-10',
    category: 'EMAIL_MARKETING',
    label: 'Email Marketing',
    description: 'Email platform costs, list management, drip campaign tools, and transactional email services.',
    quarterlyBudgets: { q1: 3000, q2: 3000, q3: 3000, q4: 3000 },
    yearlyTotal: 12000,
    ytdSpend: 1200,
    ytdCommitted: 2400,
    lastTransactionAt: '2026-02-01T00:00:00Z',
    notes: null,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'seed-budget-11',
    category: 'CONTINGENCY',
    label: 'Contingency',
    description: 'Reserve funds allocated from Q3/Q4 for unexpected opportunities or overruns.',
    quarterlyBudgets: { q1: 0, q2: 0, q3: 25000, q4: 25000 },
    yearlyTotal: 50000,
    ytdSpend: 0,
    ytdCommitted: 0,
    lastTransactionAt: null,
    notes: 'Held in reserve. Requires orchestrator approval for drawdown.',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useSeedData(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
  )
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
// GraphQL queries & mutations
// ---------------------------------------------------------------------------

const OKR_FIELDS = `
  id title description quarter status progress owner createdAt updatedAt
  keyResults {
    id okrId title description unit currentValue targetValue startValue
    progress trend owner updatedAt
  }
`

const BUDGET_FIELDS = `
  id category label description yearlyTotal ytdSpend ytdCommitted
  lastTransactionAt notes createdAt updatedAt
  quarterlyBudgets { q1 q2 q3 q4 }
`

const OKRS_QUERY = `
  query OKRs($quarter: String, $status: OKRStatus, $limit: Int, $offset: Int) {
    okrs(quarter: $quarter, status: $status, limit: $limit, offset: $offset) {
      ${OKR_FIELDS}
    }
  }
`

const OKR_BY_ID_QUERY = `
  query OKRById($id: ID!) {
    okrById(id: $id) { ${OKR_FIELDS} }
  }
`

const CREATE_OKR_MUTATION = `
  mutation CreateOKR($input: CreateOKRInput!) {
    createOKR(input: $input) { ${OKR_FIELDS} }
  }
`

const UPDATE_OKR_MUTATION = `
  mutation UpdateOKR($id: ID!, $input: UpdateOKRInput!) {
    updateOKR(id: $id, input: $input) { ${OKR_FIELDS} }
  }
`

const BUDGET_QUERY = `
  query BudgetLineItems($category: BudgetCategory, $limit: Int, $offset: Int) {
    budgetLineItems(category: $category, limit: $limit, offset: $offset) {
      ${BUDGET_FIELDS}
    }
  }
`

// ---------------------------------------------------------------------------
// In-memory mock stores
// ---------------------------------------------------------------------------

let mockOkrs = [...SEED_OKRS]
let mockBudgetItems = [...SEED_BUDGET]

// ---------------------------------------------------------------------------
// CRUD — OKRs
// ---------------------------------------------------------------------------

export async function fetchOKRs(
  token: string,
  options?: { quarter?: string; status?: OKRStatus; limit?: number; offset?: number },
): Promise<OKR[]> {
  try {
    const data = await authGraphqlFetch<{ okrs: OKR[] }>(
      OKRS_QUERY,
      {
        quarter: options?.quarter ?? null,
        status: options?.status ?? null,
        limit: options?.limit ?? 100,
        offset: options?.offset ?? 0,
      },
      token,
    )
    return data.okrs
  } catch {
    if (useSeedData()) {
      let result = [...mockOkrs]
      if (options?.quarter) result = result.filter((o) => o.quarter === options.quarter)
      if (options?.status) result = result.filter((o) => o.status === options.status)
      const offset = options?.offset ?? 0
      const limit = options?.limit ?? 100
      return result.slice(offset, offset + limit)
    }
    return []
  }
}

export async function fetchOKRById(
  token: string,
  id: string,
): Promise<OKR | null> {
  try {
    const data = await authGraphqlFetch<{ okrById: OKR }>(
      OKR_BY_ID_QUERY,
      { id },
      token,
    )
    return data.okrById
  } catch {
    if (useSeedData()) return mockOkrs.find((o) => o.id === id) || null
    return null
  }
}

export async function createOKR(
  token: string,
  input: CreateOKRInput,
): Promise<OKR> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const okrId = `seed-okr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const okr: OKR = {
      id: okrId,
      title: input.title,
      description: input.description,
      quarter: input.quarter,
      status: 'DRAFT',
      progress: 0,
      keyResults: input.keyResults.map((kr, idx) => ({
        id: `seed-kr-${Date.now()}-${idx}`,
        okrId,
        title: kr.title,
        description: kr.description,
        unit: kr.unit,
        currentValue: 0,
        targetValue: kr.targetValue,
        startValue: kr.startValue ?? 0,
        progress: 0,
        trend: 'FLAT' as const,
        owner: kr.owner ?? input.owner,
        updatedAt: now,
      })),
      owner: input.owner,
      createdAt: now,
      updatedAt: now,
    }
    mockOkrs = [okr, ...mockOkrs]
    return okr
  }

  const data = await authGraphqlFetch<{ createOKR: OKR }>(
    CREATE_OKR_MUTATION,
    { input },
    token,
  )
  return data.createOKR
}

export async function updateOKR(
  token: string,
  id: string,
  input: UpdateOKRInput,
): Promise<OKR> {
  if (useSeedData()) {
    const idx = mockOkrs.findIndex((o) => o.id === id)
    if (idx === -1) throw new Error('OKR not found')
    const existing = mockOkrs[idx]
    const updated: OKR = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      status: input.status ?? existing.status,
      owner: input.owner ?? existing.owner,
      updatedAt: new Date().toISOString(),
    }
    mockOkrs[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateOKR: OKR }>(
    UPDATE_OKR_MUTATION,
    { id, input },
    token,
  )
  return data.updateOKR
}

// ---------------------------------------------------------------------------
// CRUD — Budget
// ---------------------------------------------------------------------------

export async function fetchBudgetItems(
  token: string,
  category?: BudgetCategory,
  limit = 100,
  offset = 0,
): Promise<BudgetLineItem[]> {
  try {
    const data = await authGraphqlFetch<{ budgetLineItems: BudgetLineItem[] }>(
      BUDGET_QUERY,
      { category, limit, offset },
      token,
    )
    return data.budgetLineItems
  } catch {
    if (useSeedData()) {
      let result = [...mockBudgetItems]
      if (category) result = result.filter((b) => b.category === category)
      return result.slice(offset, offset + limit)
    }
    return []
  }
}

export function computeBudgetSummary(items: BudgetLineItem[]): BudgetSummary {
  const byCategory = {} as BudgetSummary['byCategory']
  const allCategories: BudgetCategory[] = [
    'DEVELOPER_RELATIONS',
    'PAID_ADVERTISING',
    'CONTENT_MARKETING',
    'EVENTS',
    'PARTNERSHIPS',
    'COMMUNITY',
    'SEO',
    'CREATIVE_DESIGN',
    'TOOLS_SOFTWARE',
    'EMAIL_MARKETING',
    'CONTINGENCY',
  ]

  for (const cat of allCategories) {
    byCategory[cat] = { budget: 0, spent: 0, committed: 0 }
  }

  let totalBudget = 0
  let totalSpent = 0
  let totalCommitted = 0

  for (const item of items) {
    totalBudget += item.yearlyTotal
    totalSpent += item.ytdSpend
    totalCommitted += item.ytdCommitted

    const catEntry = byCategory[item.category]
    if (catEntry) {
      catEntry.budget += item.yearlyTotal
      catEntry.spent += item.ytdSpend
      catEntry.committed += item.ytdCommitted
    }
  }

  const remainingBudget = totalBudget - totalSpent
  // Assume ~1.5 months elapsed in Q1-2026 (mid-February)
  const monthsElapsed = 1.5
  const burnRate = monthsElapsed > 0 ? Math.round(totalSpent / monthsElapsed) : 0
  const monthsRemaining = 12 - monthsElapsed
  const projectedTotal = totalSpent + burnRate * monthsRemaining
  const projectedOverUnder = totalBudget - projectedTotal

  return {
    totalBudget,
    totalSpent,
    totalCommitted,
    remainingBudget,
    burnRate,
    projectedOverUnder,
    byCategory,
  }
}

// ---------------------------------------------------------------------------
// Re-export seed data
// ---------------------------------------------------------------------------

export { SEED_OKRS, SEED_BUDGET }
