const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types — Partner Directory (BF-PG-001)
// ---------------------------------------------------------------------------

export type PartnerTier = 'ecosystem' | 'technology' | 'community'
export type PartnerStatus = 'prospect' | 'active' | 'inactive'

export interface Partner {
  id: string
  name: string
  website: string
  logo: string
  tier: PartnerTier
  status: PartnerStatus
  category: string
  contactName: string
  contactEmail: string
  agreementSummary: string
  startDate: string | null
  renewalDate: string | null
  healthScore: number
  notes: string
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Types — Partnership Pipeline (BF-PG-002)
// ---------------------------------------------------------------------------

export type PipelineStage = 'identified' | 'contacted' | 'proposal' | 'negotiation' | 'active' | 'churned'

export interface PipelineEntry {
  id: string
  partnerId: string
  partnerName: string
  stage: PipelineStage
  value: string
  probability: number
  nextAction: string
  nextActionDate: string
  assignee: string
  notes: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Seed data — Partners (8+ partners)
// ---------------------------------------------------------------------------

const SEED_PARTNERS: Partner[] = [
  {
    id: 'partner-akash',
    name: 'Akash Network',
    website: 'https://akash.network',
    logo: 'https://akash.network/favicon.ico',
    tier: 'ecosystem',
    status: 'active',
    category: 'Decentralized Compute',
    contactName: 'Greg Osuri',
    contactEmail: 'partnerships@akash.network',
    agreementSummary: 'Primary compute provider. AF deploys all services on Akash. Joint marketing and developer content collaboration.',
    startDate: '2025-11-01T00:00:00Z',
    renewalDate: '2026-11-01T00:00:00Z',
    healthScore: 95,
    notes: 'Strong partnership. Weekly sync calls. Co-authored 3 blog posts.',
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'partner-icp',
    name: 'Internet Computer (ICP)',
    website: 'https://internetcomputer.org',
    logo: 'https://internetcomputer.org/favicon.ico',
    tier: 'ecosystem',
    status: 'active',
    category: 'Decentralized Compute',
    contactName: 'Dominic Williams',
    contactEmail: 'partnerships@dfinity.org',
    agreementSummary: 'Integration partner for canister deployment. AF provides simplified ICP deployment UX. Grant-funded collaboration.',
    startDate: '2026-01-15T00:00:00Z',
    renewalDate: '2027-01-15T00:00:00Z',
    healthScore: 82,
    notes: 'ICP Developer Grant awarded. Building AF adapter for canister deployment.',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-02-08T00:00:00Z',
  },
  {
    id: 'partner-livepeer',
    name: 'Livepeer',
    website: 'https://livepeer.org',
    logo: 'https://livepeer.org/favicon.ico',
    tier: 'technology',
    status: 'active',
    category: 'Decentralized Video',
    contactName: 'Doug Petkanics',
    contactEmail: 'partnerships@livepeer.org',
    agreementSummary: 'Video transcoding integration. AF users can access Livepeer for video processing on decentralized GPU infrastructure.',
    startDate: '2026-01-20T00:00:00Z',
    renewalDate: '2026-07-20T00:00:00Z',
    healthScore: 75,
    notes: 'SDK integration in progress. Technical review planned for March.',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'partner-phala',
    name: 'Phala Network',
    website: 'https://phala.network',
    logo: 'https://phala.network/favicon.ico',
    tier: 'technology',
    status: 'active',
    category: 'Confidential Computing',
    contactName: 'Marvin Tong',
    contactEmail: 'partnerships@phala.network',
    agreementSummary: 'TEE compute integration. AF offers Phala as a confidential computing option for sensitive AI workloads.',
    startDate: '2026-02-01T00:00:00Z',
    renewalDate: '2026-08-01T00:00:00Z',
    healthScore: 70,
    notes: 'Early-stage integration. POC completed for confidential AI agent deployment.',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-12T00:00:00Z',
  },
  {
    id: 'partner-filecoin',
    name: 'Filecoin',
    website: 'https://filecoin.io',
    logo: 'https://filecoin.io/favicon.ico',
    tier: 'ecosystem',
    status: 'active',
    category: 'Decentralized Storage',
    contactName: 'Juan Benet',
    contactEmail: 'partnerships@protocol.ai',
    agreementSummary: 'Storage integration partner. AF uses Filecoin for long-term data persistence alongside IPFS pinning.',
    startDate: '2025-12-01T00:00:00Z',
    renewalDate: '2026-12-01T00:00:00Z',
    healthScore: 88,
    notes: 'Deep integration. FVM+ compute layer opens new deployment possibilities.',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-11T00:00:00Z',
  },
  {
    id: 'partner-ionet',
    name: 'io.net',
    website: 'https://io.net',
    logo: 'https://io.net/favicon.ico',
    tier: 'technology',
    status: 'prospect',
    category: 'GPU Compute',
    contactName: 'Ahmad Shadid',
    contactEmail: 'partnerships@io.net',
    agreementSummary: 'Exploring GPU compute aggregation partnership. io.net could provide additional GPU capacity for AF AI workloads.',
    startDate: null,
    renewalDate: null,
    healthScore: 45,
    notes: 'Initial conversations started. They are focused on enterprise GPU market.',
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-02-13T00:00:00Z',
  },
  {
    id: 'partner-arweave',
    name: 'Arweave',
    website: 'https://arweave.org',
    logo: 'https://arweave.org/favicon.ico',
    tier: 'ecosystem',
    status: 'active',
    category: 'Permanent Storage',
    contactName: 'Sam Williams',
    contactEmail: 'partnerships@arweave.org',
    agreementSummary: 'Permanent storage integration via Turbo SDK. AF offers Arweave as storage option for permanent deployments.',
    startDate: '2025-12-15T00:00:00Z',
    renewalDate: '2026-12-15T00:00:00Z',
    healthScore: 85,
    notes: 'Turbo SDK integration complete. AO compute opens interesting co-deployment opportunities.',
    createdAt: '2025-12-15T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
  },
  {
    id: 'partner-fleek-network',
    name: 'Fleek Network (Lightning)',
    website: 'https://fleek.network',
    logo: 'https://fleek.network/favicon.ico',
    tier: 'technology',
    status: 'prospect',
    category: 'CDN / Edge',
    contactName: 'Harrison Hines',
    contactEmail: 'partnerships@fleek.co',
    agreementSummary: 'Exploring decentralized CDN integration. Fleek Network\'s Lightning CDN could serve AF static assets.',
    startDate: null,
    renewalDate: null,
    healthScore: 30,
    notes: 'Competitive relationship complicates partnership. Monitoring their CDN development.',
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Seed data — Pipeline
// ---------------------------------------------------------------------------

const SEED_PIPELINE: PipelineEntry[] = [
  {
    id: 'pipe-001',
    partnerId: 'partner-ionet',
    partnerName: 'io.net',
    stage: 'contacted',
    value: '$50K/yr compute credits',
    probability: 30,
    nextAction: 'Schedule technical deep-dive call',
    nextActionDate: '2026-02-20T00:00:00Z',
    assignee: 'Atlas',
    notes: 'They responded positively. Interested in AF as a deployment layer for their GPU network.',
    updatedAt: '2026-02-13T00:00:00Z',
  },
  {
    id: 'pipe-002',
    partnerId: 'partner-fleek-network',
    partnerName: 'Fleek Network',
    stage: 'identified',
    value: 'CDN integration',
    probability: 15,
    nextAction: 'Research competitive overlap',
    nextActionDate: '2026-02-25T00:00:00Z',
    assignee: 'Atlas',
    notes: 'Need to evaluate if CDN-only partnership is viable given competitive dynamics.',
    updatedAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'pipe-003',
    partnerId: 'partner-akash',
    partnerName: 'Akash Network',
    stage: 'active',
    value: 'Core infra partnership',
    probability: 100,
    nextAction: 'Q1 joint content review',
    nextActionDate: '2026-03-01T00:00:00Z',
    assignee: 'Senku',
    notes: 'Active partnership. Next milestone: joint case study publication.',
    updatedAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'pipe-004',
    partnerId: 'partner-icp',
    partnerName: 'ICP',
    stage: 'active',
    value: '$25K grant + integration',
    probability: 90,
    nextAction: 'Submit milestone 2 deliverables',
    nextActionDate: '2026-02-28T00:00:00Z',
    assignee: 'Lain',
    notes: 'Grant milestone 1 completed. Building canister deployment adapter.',
    updatedAt: '2026-02-08T00:00:00Z',
  },
  {
    id: 'pipe-005',
    partnerId: 'partner-phala',
    partnerName: 'Phala Network',
    stage: 'proposal',
    value: 'TEE compute integration',
    probability: 60,
    nextAction: 'Submit integration proposal',
    nextActionDate: '2026-02-22T00:00:00Z',
    assignee: 'Argus',
    notes: 'POC successful. Need to formalize integration agreement.',
    updatedAt: '2026-02-12T00:00:00Z',
  },
  {
    id: 'pipe-006',
    partnerId: 'partner-livepeer',
    partnerName: 'Livepeer',
    stage: 'negotiation',
    value: 'Video transcoding credits',
    probability: 70,
    nextAction: 'Review SDK integration terms',
    nextActionDate: '2026-02-18T00:00:00Z',
    assignee: 'Atlas',
    notes: 'Technical integration reviewed. Negotiating credit allocation for AF users.',
    updatedAt: '2026-02-05T00:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

async function graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
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
// In-memory mock stores
// ---------------------------------------------------------------------------

let mockPartners = [...SEED_PARTNERS]
let mockPipeline = [...SEED_PIPELINE]

// ---------------------------------------------------------------------------
// Partner CRUD
// ---------------------------------------------------------------------------

export async function fetchPartners(filters?: {
  status?: PartnerStatus
  tier?: PartnerTier
  search?: string
}): Promise<Partner[]> {
  try {
    const data = await graphqlFetch<{ partners: Partner[] }>(
      `query Partners { partners { id name website logo tier status category contactName contactEmail agreementSummary startDate renewalDate healthScore notes createdAt updatedAt } }`,
    )
    return data.partners
  } catch {
    if (useSeedData()) {
      let result = [...mockPartners]
      if (filters?.status) {
        result = result.filter((p) => p.status === filters.status)
      }
      if (filters?.tier) {
        result = result.filter((p) => p.tier === filters.tier)
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q),
        )
      }
      return result.sort((a, b) => b.healthScore - a.healthScore)
    }
    return []
  }
}

export async function fetchPartnerById(id: string): Promise<Partner | null> {
  if (useSeedData()) return mockPartners.find((p) => p.id === id) || null
  return null
}

export interface CreatePartnerInput {
  name: string
  website: string
  logo: string
  tier: PartnerTier
  status: PartnerStatus
  category: string
  contactName: string
  contactEmail: string
  agreementSummary: string
  notes: string
}

export async function createPartner(input: CreatePartnerInput): Promise<Partner> {
  const now = new Date().toISOString()
  const partner: Partner = {
    id: `partner-${Date.now()}`,
    ...input,
    startDate: input.status === 'active' ? now : null,
    renewalDate: null,
    healthScore: 50,
    createdAt: now,
    updatedAt: now,
  }
  if (useSeedData()) {
    mockPartners = [partner, ...mockPartners]
    return partner
  }
  return partner
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<Partner> {
  if (useSeedData()) {
    const idx = mockPartners.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Partner not found')
    mockPartners[idx] = { ...mockPartners[idx], ...updates, updatedAt: new Date().toISOString() }
    return mockPartners[idx]
  }
  throw new Error('Not implemented')
}

export async function deletePartner(id: string): Promise<void> {
  if (useSeedData()) {
    mockPartners = mockPartners.filter((p) => p.id !== id)
    mockPipeline = mockPipeline.filter((e) => e.partnerId !== id)
  }
}

// ---------------------------------------------------------------------------
// Pipeline CRUD
// ---------------------------------------------------------------------------

export async function fetchPipeline(): Promise<PipelineEntry[]> {
  try {
    const data = await graphqlFetch<{ pipeline: PipelineEntry[] }>(
      `query Pipeline { pipeline { id partnerId partnerName stage value probability nextAction nextActionDate assignee notes updatedAt } }`,
    )
    return data.pipeline
  } catch {
    if (useSeedData()) return mockPipeline.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return []
  }
}

export async function updatePipelineEntry(id: string, updates: Partial<PipelineEntry>): Promise<PipelineEntry> {
  if (useSeedData()) {
    const idx = mockPipeline.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('Pipeline entry not found')
    mockPipeline[idx] = { ...mockPipeline[idx], ...updates, updatedAt: new Date().toISOString() }
    return mockPipeline[idx]
  }
  throw new Error('Not implemented')
}

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

export const PIPELINE_STAGES: PipelineStage[] = ['identified', 'contacted', 'proposal', 'negotiation', 'active', 'churned']

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  identified: 'Identified',
  contacted: 'Contacted',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  active: 'Active',
  churned: 'Churned',
}

export const PIPELINE_STAGE_COLORS: Record<PipelineStage, string> = {
  identified: '#9CA3AF',
  contacted: '#3B82F6',
  proposal: '#8B5CF6',
  negotiation: '#F59E0B',
  active: '#10B981',
  churned: '#EF4444',
}

export function getPipelineByStage(entries: PipelineEntry[]): Record<PipelineStage, PipelineEntry[]> {
  const groups: Record<PipelineStage, PipelineEntry[]> = {
    identified: [],
    contacted: [],
    proposal: [],
    negotiation: [],
    active: [],
    churned: [],
  }
  for (const entry of entries) {
    groups[entry.stage].push(entry)
  }
  return groups
}

export function getPartnersByTier(partners: Partner[]): Record<PartnerTier, Partner[]> {
  const groups: Record<PartnerTier, Partner[]> = {
    ecosystem: [],
    technology: [],
    community: [],
  }
  for (const partner of partners) {
    groups[partner.tier].push(partner)
  }
  return groups
}

export { SEED_PARTNERS, SEED_PIPELINE }
