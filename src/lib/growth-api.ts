// ---------------------------------------------------------------------------
// Growth Hacking API Service
// Experiments, referrals, funnels, and growth metrics
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types — Growth Metrics
// ---------------------------------------------------------------------------

export interface GrowthMetrics {
  mrr: number
  mrrGrowth: number
  churnRate: number
  churnDelta: number
  viralCoefficient: number
  viralDelta: number
  cac: number
  cacDelta: number
  ltv: number
  ltvDelta: number
  trialToConversion: number
  activeUsers: number
  activeUsersGrowth: number
  sparklines: {
    mrr: number[]
    churn: number[]
    viral: number[]
    cac: number[]
    ltv: number[]
    users: number[]
  }
}

export interface FunnelStage {
  name: string
  value: number
  color: string
}

// ---------------------------------------------------------------------------
// Types — Experiments
// ---------------------------------------------------------------------------

export type ExperimentStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'

export interface ExperimentVariant {
  id: string
  name: string
  trafficPercent: number
  conversions: number
  impressions: number
  conversionRate: number
}

export interface Experiment {
  id: string
  name: string
  hypothesis: string
  status: ExperimentStatus
  successMetric: string
  variants: ExperimentVariant[]
  totalTraffic: number
  startDate: string
  endDate: string | null
  durationDays: number
  significance: number
  winner: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateExperimentInput {
  name: string
  hypothesis: string
  successMetric: string
  variants: { name: string; trafficPercent: number }[]
  durationDays: number
}

// ---------------------------------------------------------------------------
// Types — Referrals
// ---------------------------------------------------------------------------

export type ReferralStatus = 'PENDING' | 'SIGNED_UP' | 'CONVERTED' | 'REWARDED' | 'EXPIRED'

export interface Referral {
  id: string
  referrerEmail: string
  referrerName: string
  refereeEmail: string
  refereeName: string
  status: ReferralStatus
  reward: string
  rewardTier: string
  referralCode: string
  createdAt: string
  convertedAt: string | null
}

export interface ReferralStats {
  totalReferrals: number
  conversionRate: number
  totalRewards: number
  activeReferrers: number
  topReferrers: { name: string; email: string; count: number; earned: string }[]
}

export interface RewardTier {
  id: string
  name: string
  minReferrals: number
  reward: string
  description: string
  color: string
}

// ---------------------------------------------------------------------------
// Types — Funnels
// ---------------------------------------------------------------------------

export interface FunnelStep {
  name: string
  eventKey: string
  count: number
  dropoffPercent: number
}

export interface CustomFunnel {
  id: string
  name: string
  steps: FunnelStep[]
  totalEntries: number
  totalCompletions: number
  overallConversion: number
  period: string
  source: string | null
  createdAt: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const EXPERIMENT_STATUS_STYLES: Record<ExperimentStatus, { bg: string; color: string; label: string }> = {
  DRAFT: { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  RUNNING: { bg: '#DBEAFE', color: '#1E40AF', label: 'Running' },
  PAUSED: { bg: '#FEF3C7', color: '#92400E', label: 'Paused' },
  COMPLETED: { bg: '#D1FAE5', color: '#065F46', label: 'Completed' },
  ARCHIVED: { bg: '#F3F4F6', color: '#9CA3AF', label: 'Archived' },
}

export const REFERRAL_STATUS_STYLES: Record<ReferralStatus, { bg: string; color: string; label: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  SIGNED_UP: { bg: '#DBEAFE', color: '#1E40AF', label: 'Signed Up' },
  CONVERTED: { bg: '#D1FAE5', color: '#065F46', label: 'Converted' },
  REWARDED: { bg: '#EDE9FE', color: '#5B21B6', label: 'Rewarded' },
  EXPIRED: { bg: '#F3F4F6', color: '#9CA3AF', label: 'Expired' },
}

export const DEFAULT_REWARD_TIERS: RewardTier[] = [
  { id: 'tier-1', name: 'Starter', minReferrals: 1, reward: '1 month free', description: 'First referral bonus', color: 'var(--af-patina)' },
  { id: 'tier-2', name: 'Builder', minReferrals: 5, reward: '3 months free', description: 'Growing network', color: 'var(--af-ultra)' },
  { id: 'tier-3', name: 'Ambassador', minReferrals: 15, reward: '6 months free + swag', description: 'Community champion', color: 'var(--af-terra)' },
  { id: 'tier-4', name: 'Legend', minReferrals: 50, reward: '1 year free + revenue share', description: 'Top referrer', color: 'var(--af-signal-go)' },
]

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_METRICS: GrowthMetrics = {
  mrr: 12450,
  mrrGrowth: 18.3,
  churnRate: 3.2,
  churnDelta: -0.8,
  viralCoefficient: 1.24,
  viralDelta: 0.12,
  cac: 42,
  cacDelta: -5,
  ltv: 580,
  ltvDelta: 45,
  trialToConversion: 23.5,
  activeUsers: 4280,
  activeUsersGrowth: 12.7,
  sparklines: {
    mrr: [8200, 8800, 9400, 9900, 10300, 10800, 11200, 11500, 11800, 12100, 12300, 12450],
    churn: [5.1, 4.8, 4.5, 4.2, 4.0, 3.8, 3.6, 3.5, 3.4, 3.3, 3.2, 3.2],
    viral: [0.82, 0.88, 0.92, 0.96, 1.01, 1.04, 1.08, 1.12, 1.16, 1.19, 1.22, 1.24],
    cac: [62, 58, 55, 52, 50, 48, 47, 46, 45, 44, 43, 42],
    ltv: [380, 400, 420, 440, 460, 480, 500, 520, 540, 555, 570, 580],
    users: [2400, 2600, 2850, 3050, 3250, 3400, 3550, 3700, 3850, 4000, 4150, 4280],
  },
}

const SEED_FUNNEL_STAGES: FunnelStage[] = [
  { name: 'Awareness', value: 24500, color: 'var(--af-ultra)' },
  { name: 'Interest', value: 8200, color: 'var(--af-patina)' },
  { name: 'Trial', value: 3100, color: 'var(--af-terra)' },
  { name: 'Conversion', value: 728, color: 'var(--af-signal-go)' },
  { name: 'Retention', value: 612, color: 'var(--af-kin-repair)' },
]

const SEED_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-001',
    name: 'Hero CTA Copy Test',
    hypothesis: 'Changing CTA from "Get Started" to "Deploy Free" will increase signups by 15%',
    status: 'RUNNING',
    successMetric: 'signup_rate',
    variants: [
      { id: 'v-001a', name: 'Control: Get Started', trafficPercent: 50, conversions: 342, impressions: 5200, conversionRate: 6.58 },
      { id: 'v-001b', name: 'Variant: Deploy Free', trafficPercent: 50, conversions: 418, impressions: 5180, conversionRate: 8.07 },
    ],
    totalTraffic: 10380,
    startDate: '2026-02-01T00:00:00Z',
    endDate: null,
    durationDays: 14,
    significance: 94.2,
    winner: null,
    createdAt: '2026-01-30T10:00:00Z',
    updatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'exp-002',
    name: 'Pricing Page Layout',
    hypothesis: 'A comparison-first layout will reduce bounce rate by 20%',
    status: 'COMPLETED',
    successMetric: 'bounce_rate',
    variants: [
      { id: 'v-002a', name: 'Control: Card Grid', trafficPercent: 33, conversions: 890, impressions: 4200, conversionRate: 21.19 },
      { id: 'v-002b', name: 'Variant A: Comparison Table', trafficPercent: 33, conversions: 1120, impressions: 4180, conversionRate: 26.79 },
      { id: 'v-002c', name: 'Variant B: Calculator First', trafficPercent: 34, conversions: 980, impressions: 4250, conversionRate: 23.06 },
    ],
    totalTraffic: 12630,
    startDate: '2026-01-15T00:00:00Z',
    endDate: '2026-02-01T00:00:00Z',
    durationDays: 17,
    significance: 98.7,
    winner: 'v-002b',
    createdAt: '2026-01-14T08:00:00Z',
    updatedAt: '2026-02-01T12:00:00Z',
  },
  {
    id: 'exp-003',
    name: 'Onboarding Flow',
    hypothesis: 'Guided deploy wizard will increase first-deploy rate by 25%',
    status: 'RUNNING',
    successMetric: 'first_deploy_rate',
    variants: [
      { id: 'v-003a', name: 'Control: Dashboard Landing', trafficPercent: 50, conversions: 156, impressions: 820, conversionRate: 19.02 },
      { id: 'v-003b', name: 'Variant: Guided Wizard', trafficPercent: 50, conversions: 198, impressions: 810, conversionRate: 24.44 },
    ],
    totalTraffic: 1630,
    startDate: '2026-02-10T00:00:00Z',
    endDate: null,
    durationDays: 21,
    significance: 78.5,
    winner: null,
    createdAt: '2026-02-09T14:00:00Z',
    updatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'exp-004',
    name: 'Email Subject Line A/B',
    hypothesis: 'Personalized subject lines will increase open rate by 10%',
    status: 'DRAFT',
    successMetric: 'email_open_rate',
    variants: [
      { id: 'v-004a', name: 'Control: Generic', trafficPercent: 50, conversions: 0, impressions: 0, conversionRate: 0 },
      { id: 'v-004b', name: 'Variant: Personalized', trafficPercent: 50, conversions: 0, impressions: 0, conversionRate: 0 },
    ],
    totalTraffic: 0,
    startDate: '2026-02-20T00:00:00Z',
    endDate: null,
    durationDays: 7,
    significance: 0,
    winner: null,
    createdAt: '2026-02-14T16:00:00Z',
    updatedAt: '2026-02-14T16:00:00Z',
  },
  {
    id: 'exp-005',
    name: 'Free Tier Limits',
    hypothesis: 'Increasing free tier from 3 to 5 sites will boost trial-to-paid by 8%',
    status: 'PAUSED',
    successMetric: 'trial_to_paid',
    variants: [
      { id: 'v-005a', name: 'Control: 3 free sites', trafficPercent: 50, conversions: 45, impressions: 620, conversionRate: 7.26 },
      { id: 'v-005b', name: 'Variant: 5 free sites', trafficPercent: 50, conversions: 52, impressions: 610, conversionRate: 8.52 },
    ],
    totalTraffic: 1230,
    startDate: '2026-02-05T00:00:00Z',
    endDate: null,
    durationDays: 30,
    significance: 62.3,
    winner: null,
    createdAt: '2026-02-04T11:00:00Z',
    updatedAt: '2026-02-12T09:00:00Z',
  },
]

const SEED_REFERRALS: Referral[] = [
  { id: 'ref-001', referrerEmail: 'alex@devstudio.com', referrerName: 'Alex Chen', refereeEmail: 'jamie@startup.io', refereeName: 'Jamie Park', status: 'REWARDED', reward: '1 month free', rewardTier: 'Starter', referralCode: 'ALEXC-2026', createdAt: '2026-01-20T10:00:00Z', convertedAt: '2026-01-28T14:00:00Z' },
  { id: 'ref-002', referrerEmail: 'alex@devstudio.com', referrerName: 'Alex Chen', refereeEmail: 'sam@agency.co', refereeName: 'Sam Rivera', status: 'CONVERTED', reward: '1 month free', rewardTier: 'Starter', referralCode: 'ALEXC-2026', createdAt: '2026-01-25T08:00:00Z', convertedAt: '2026-02-02T11:00:00Z' },
  { id: 'ref-003', referrerEmail: 'alex@devstudio.com', referrerName: 'Alex Chen', refereeEmail: 'pat@builder.dev', refereeName: 'Pat Torres', status: 'SIGNED_UP', reward: '', rewardTier: '', referralCode: 'ALEXC-2026', createdAt: '2026-02-05T16:00:00Z', convertedAt: null },
  { id: 'ref-004', referrerEmail: 'maria@web3lab.xyz', referrerName: 'Maria Gonzalez', refereeEmail: 'dev@neonlabs.io', refereeName: 'Neon Labs', status: 'REWARDED', reward: '1 month free', rewardTier: 'Starter', referralCode: 'MARIAG-2026', createdAt: '2026-01-18T09:00:00Z', convertedAt: '2026-01-24T13:00:00Z' },
  { id: 'ref-005', referrerEmail: 'maria@web3lab.xyz', referrerName: 'Maria Gonzalez', refereeEmail: 'ops@chainstack.dev', refereeName: 'Chainstack Dev', status: 'SIGNED_UP', reward: '', rewardTier: '', referralCode: 'MARIAG-2026', createdAt: '2026-02-08T14:00:00Z', convertedAt: null },
  { id: 'ref-006', referrerEmail: 'kai@indie.games', referrerName: 'Kai Nakamura', refereeEmail: 'studio@pixelcraft.gg', refereeName: 'PixelCraft Studios', status: 'CONVERTED', reward: '1 month free', rewardTier: 'Starter', referralCode: 'KAIN-2026', createdAt: '2026-02-01T11:00:00Z', convertedAt: '2026-02-10T16:00:00Z' },
  { id: 'ref-007', referrerEmail: 'kai@indie.games', referrerName: 'Kai Nakamura', refereeEmail: 'art@retrovibe.dev', refereeName: 'RetroVibe Dev', status: 'PENDING', reward: '', rewardTier: '', referralCode: 'KAIN-2026', createdAt: '2026-02-12T10:00:00Z', convertedAt: null },
  { id: 'ref-008', referrerEmail: 'dev@hashnode.blog', referrerName: 'Chris Dev', refereeEmail: 'hello@microservices.co', refereeName: 'Microservices Co', status: 'EXPIRED', reward: '', rewardTier: '', referralCode: 'CHRISD-2026', createdAt: '2025-12-15T08:00:00Z', convertedAt: null },
  { id: 'ref-009', referrerEmail: 'alex@devstudio.com', referrerName: 'Alex Chen', refereeEmail: 'team@nextwave.io', refereeName: 'NextWave Team', status: 'CONVERTED', reward: '1 month free', rewardTier: 'Starter', referralCode: 'ALEXC-2026', createdAt: '2026-02-03T09:00:00Z', convertedAt: '2026-02-11T15:00:00Z' },
  { id: 'ref-010', referrerEmail: 'alex@devstudio.com', referrerName: 'Alex Chen', refereeEmail: 'eng@scalable.app', refereeName: 'Scalable App', status: 'REWARDED', reward: '3 months free', rewardTier: 'Builder', referralCode: 'ALEXC-2026', createdAt: '2026-02-06T12:00:00Z', convertedAt: '2026-02-13T10:00:00Z' },
]

const SEED_REFERRAL_STATS: ReferralStats = {
  totalReferrals: 10,
  conversionRate: 50,
  totalRewards: 845,
  activeReferrers: 4,
  topReferrers: [
    { name: 'Alex Chen', email: 'alex@devstudio.com', count: 5, earned: '$420' },
    { name: 'Maria Gonzalez', email: 'maria@web3lab.xyz', count: 2, earned: '$180' },
    { name: 'Kai Nakamura', email: 'kai@indie.games', count: 2, earned: '$145' },
    { name: 'Chris Dev', email: 'dev@hashnode.blog', count: 1, earned: '$0' },
  ],
}

const SEED_FUNNELS: CustomFunnel[] = [
  {
    id: 'funnel-signup',
    name: 'Signup Flow',
    steps: [
      { name: 'Landing Page', eventKey: 'page_view_landing', count: 24500, dropoffPercent: 0 },
      { name: 'Signup Click', eventKey: 'signup_click', count: 8200, dropoffPercent: 66.5 },
      { name: 'Email Entered', eventKey: 'signup_email', count: 5400, dropoffPercent: 34.1 },
      { name: 'Verification', eventKey: 'email_verified', count: 4100, dropoffPercent: 24.1 },
      { name: 'Onboarding Complete', eventKey: 'onboarding_done', count: 3100, dropoffPercent: 24.4 },
    ],
    totalEntries: 24500,
    totalCompletions: 3100,
    overallConversion: 12.65,
    period: '2026-02-01 to 2026-02-15',
    source: null,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'funnel-deploy',
    name: 'First Deploy',
    steps: [
      { name: 'Dashboard Visit', eventKey: 'dashboard_view', count: 3100, dropoffPercent: 0 },
      { name: 'Create Project', eventKey: 'project_create', count: 2200, dropoffPercent: 29.0 },
      { name: 'Connect Repo', eventKey: 'repo_connect', count: 1650, dropoffPercent: 25.0 },
      { name: 'Deploy Triggered', eventKey: 'deploy_trigger', count: 1280, dropoffPercent: 22.4 },
      { name: 'Deploy Success', eventKey: 'deploy_success', count: 1100, dropoffPercent: 14.1 },
    ],
    totalEntries: 3100,
    totalCompletions: 1100,
    overallConversion: 35.48,
    period: '2026-02-01 to 2026-02-15',
    source: null,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'funnel-upgrade',
    name: 'Free to Paid',
    steps: [
      { name: 'Active Free User', eventKey: 'free_active', count: 4280, dropoffPercent: 0 },
      { name: 'Pricing Page View', eventKey: 'pricing_view', count: 1420, dropoffPercent: 66.8 },
      { name: 'Plan Selected', eventKey: 'plan_select', count: 860, dropoffPercent: 39.4 },
      { name: 'Checkout Started', eventKey: 'checkout_start', count: 520, dropoffPercent: 39.5 },
      { name: 'Payment Complete', eventKey: 'payment_done', count: 380, dropoffPercent: 26.9 },
    ],
    totalEntries: 4280,
    totalCompletions: 380,
    overallConversion: 8.88,
    period: '2026-02-01 to 2026-02-15',
    source: null,
    createdAt: '2026-01-20T08:00:00Z',
  },
  {
    id: 'funnel-referral',
    name: 'Referral Loop',
    steps: [
      { name: 'Referral Page View', eventKey: 'referral_view', count: 890, dropoffPercent: 0 },
      { name: 'Link Copied', eventKey: 'referral_copy', count: 420, dropoffPercent: 52.8 },
      { name: 'Link Clicked (by referee)', eventKey: 'referral_click', count: 180, dropoffPercent: 57.1 },
      { name: 'Referee Signup', eventKey: 'referral_signup', count: 95, dropoffPercent: 47.2 },
      { name: 'Referee Activated', eventKey: 'referral_activate', count: 42, dropoffPercent: 55.8 },
    ],
    totalEntries: 890,
    totalCompletions: 42,
    overallConversion: 4.72,
    period: '2026-02-01 to 2026-02-15',
    source: null,
    createdAt: '2026-02-01T10:00:00Z',
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
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data
}

// ---------------------------------------------------------------------------
// In-memory mock stores
// ---------------------------------------------------------------------------

let mockExperiments = [...SEED_EXPERIMENTS]
let mockReferrals = [...SEED_REFERRALS]

// ---------------------------------------------------------------------------
// Growth Metrics
// ---------------------------------------------------------------------------

export async function fetchGrowthMetrics(): Promise<GrowthMetrics> {
  try {
    const data = await graphqlFetch<{ growthMetrics: GrowthMetrics }>(
      `query GrowthMetrics { growthMetrics { mrr mrrGrowth churnRate churnDelta viralCoefficient viralDelta cac cacDelta ltv ltvDelta trialToConversion activeUsers activeUsersGrowth } }`,
    )
    return data.growthMetrics
  } catch {
    if (useSeedData()) return SEED_METRICS
    return SEED_METRICS
  }
}

export async function fetchFunnelStages(): Promise<FunnelStage[]> {
  try {
    const data = await graphqlFetch<{ funnelStages: FunnelStage[] }>(
      `query FunnelStages { funnelStages { name value color } }`,
    )
    return data.funnelStages
  } catch {
    if (useSeedData()) return SEED_FUNNEL_STAGES
    return SEED_FUNNEL_STAGES
  }
}

// ---------------------------------------------------------------------------
// Experiments CRUD
// ---------------------------------------------------------------------------

export async function fetchExperiments(): Promise<Experiment[]> {
  try {
    const data = await graphqlFetch<{ experiments: Experiment[] }>(
      `query Experiments { experiments { id name hypothesis status successMetric variants { id name trafficPercent conversions impressions conversionRate } totalTraffic startDate endDate durationDays significance winner createdAt updatedAt } }`,
    )
    return data.experiments
  } catch {
    if (useSeedData()) return [...mockExperiments].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return []
  }
}

export async function fetchExperimentById(id: string): Promise<Experiment | null> {
  if (useSeedData()) return mockExperiments.find((e) => e.id === id) || null
  return null
}

export async function createExperiment(input: CreateExperimentInput): Promise<Experiment> {
  const now = new Date().toISOString()
  const exp: Experiment = {
    id: `exp-${Date.now()}`,
    name: input.name,
    hypothesis: input.hypothesis,
    status: 'DRAFT',
    successMetric: input.successMetric,
    variants: input.variants.map((v, i) => ({
      id: `v-${Date.now()}-${i}`,
      name: v.name,
      trafficPercent: v.trafficPercent,
      conversions: 0,
      impressions: 0,
      conversionRate: 0,
    })),
    totalTraffic: 0,
    startDate: now,
    endDate: null,
    durationDays: input.durationDays,
    significance: 0,
    winner: null,
    createdAt: now,
    updatedAt: now,
  }
  if (useSeedData()) mockExperiments = [exp, ...mockExperiments]
  return exp
}

export async function updateExperimentStatus(id: string, status: ExperimentStatus): Promise<Experiment> {
  if (useSeedData()) {
    const idx = mockExperiments.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('Experiment not found')
    mockExperiments[idx] = { ...mockExperiments[idx], status, updatedAt: new Date().toISOString() }
    return mockExperiments[idx]
  }
  throw new Error('Not implemented')
}

export async function deleteExperiment(id: string): Promise<void> {
  if (useSeedData()) {
    mockExperiments = mockExperiments.filter((e) => e.id !== id)
  }
}

// ---------------------------------------------------------------------------
// Referrals
// ---------------------------------------------------------------------------

export async function fetchReferrals(): Promise<Referral[]> {
  if (useSeedData()) return [...mockReferrals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return []
}

export async function fetchReferralStats(): Promise<ReferralStats> {
  if (useSeedData()) return SEED_REFERRAL_STATS
  return SEED_REFERRAL_STATS
}

export async function generateReferralLink(email: string): Promise<string> {
  const code = email.split('@')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8) + '-2026'
  return `https://alternatefutures.ai/ref/${code}`
}

// ---------------------------------------------------------------------------
// Custom Funnels
// ---------------------------------------------------------------------------

export async function fetchCustomFunnels(): Promise<CustomFunnel[]> {
  if (useSeedData()) return SEED_FUNNELS
  return []
}

export async function fetchFunnelById(id: string): Promise<CustomFunnel | null> {
  if (useSeedData()) return SEED_FUNNELS.find((f) => f.id === id) || null
  return null
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { SEED_EXPERIMENTS, SEED_REFERRALS, SEED_FUNNELS, SEED_FUNNEL_STAGES, SEED_METRICS }
