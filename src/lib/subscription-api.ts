const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ===========================================================================
// Types
// ===========================================================================

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'cancelled'
  | 'paused'

export type BillingCycle = 'monthly' | 'annual'

export type PlanTier = 'starter' | 'builder' | 'pro' | 'enterprise'

export interface Plan {
  id: string
  name: string
  tier: PlanTier
  description: string
  priceMonthly: number
  priceAnnual: number
  currency: string
  features: string[]
  isPopular: boolean
}

export interface Subscription {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  planId: string
  planName: string
  planTier: PlanTier
  status: SubscriptionStatus
  billingCycle: BillingCycle
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd: string | null
  mrr: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface UpdateSubscriptionInput {
  status?: SubscriptionStatus
  billingCycle?: BillingCycle
  planId?: string
  cancelAtPeriodEnd?: boolean
}

export interface ChurnMetrics {
  totalActive: number
  totalChurned: number
  churnRate: number
  mrrCurrent: number
  mrrPrevious: number
  mrrGrowth: number
  trialConversionRate: number
}

// ===========================================================================
// Plans
// ===========================================================================

export const PLANS: Plan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    tier: 'starter',
    description: 'For hobbyists and personal projects. IPFS hosting with basic compute.',
    priceMonthly: 0,
    priceAnnual: 0,
    currency: 'USD',
    features: ['1 site', '1 GB IPFS storage', 'Community support', 'Shared compute'],
    isPopular: false,
  },
  {
    id: 'plan-builder',
    name: 'Builder',
    tier: 'builder',
    description: 'For indie developers and small teams. Priority support and 20% compute discount.',
    priceMonthly: 2900,
    priceAnnual: 26100,
    currency: 'USD',
    features: ['5 sites', '25 GB IPFS storage', 'Priority support', '20% compute discount', 'Custom domains'],
    isPopular: true,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    tier: 'pro',
    description: 'For growing teams. Advanced analytics, CI/CD integration, and dedicated resources.',
    priceMonthly: 7900,
    priceAnnual: 71100,
    currency: 'USD',
    features: ['Unlimited sites', '100 GB IPFS storage', 'Dedicated support', '40% compute discount', 'CI/CD pipelines', 'Team collaboration'],
    isPopular: false,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    tier: 'enterprise',
    description: 'Custom solutions for large organizations. SLA, SSO, and dedicated infrastructure.',
    priceMonthly: 29900,
    priceAnnual: 269100,
    currency: 'USD',
    features: ['Unlimited everything', 'Dedicated nodes', '99.9% SLA', 'SSO/SAML', 'Custom integrations', 'Dedicated account manager'],
    isPopular: false,
  },
]

// ===========================================================================
// Seed data — 18 subscriptions
// ===========================================================================

const SEED_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    customerId: 'cust-1',
    customerName: 'Sarah Chen',
    customerEmail: 'sarah.chen@example.com',
    planId: 'plan-builder',
    planName: 'Builder',
    planTier: 'builder',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-02-01T00:00:00Z',
    currentPeriodEnd: '2026-03-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 2900,
    currency: 'USD',
    createdAt: '2025-11-15T08:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'sub-2',
    customerId: 'cust-2',
    customerName: 'Marcus Williams',
    customerEmail: 'marcus.w@example.com',
    planId: 'plan-pro',
    planName: 'Pro',
    planTier: 'pro',
    status: 'active',
    billingCycle: 'annual',
    currentPeriodStart: '2026-01-10T00:00:00Z',
    currentPeriodEnd: '2027-01-10T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 5925,
    currency: 'USD',
    createdAt: '2025-10-10T08:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'sub-3',
    customerId: 'cust-3',
    customerName: 'Elena Rodriguez',
    customerEmail: 'elena.r@example.com',
    planId: 'plan-builder',
    planName: 'Builder',
    planTier: 'builder',
    status: 'active',
    billingCycle: 'annual',
    currentPeriodStart: '2026-01-20T00:00:00Z',
    currentPeriodEnd: '2027-01-20T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 2175,
    currency: 'USD',
    createdAt: '2025-12-20T08:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'sub-4',
    customerId: 'cust-4',
    customerName: 'James Park',
    customerEmail: 'jpark@example.com',
    planId: 'plan-builder',
    planName: 'Builder',
    planTier: 'builder',
    status: 'trialing',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-02-10T00:00:00Z',
    currentPeriodEnd: '2026-03-10T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: '2026-02-24T00:00:00Z',
    mrr: 0,
    currency: 'USD',
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 'sub-5',
    customerId: 'cust-5',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.s@example.com',
    planId: 'plan-pro',
    planName: 'Pro',
    planTier: 'pro',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-02-05T00:00:00Z',
    currentPeriodEnd: '2026-03-05T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 7900,
    currency: 'USD',
    createdAt: '2025-09-05T08:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'sub-6',
    customerId: 'cust-6',
    customerName: 'Alex Turner',
    customerEmail: 'alex.t@example.com',
    planId: 'plan-builder',
    planName: 'Builder',
    planTier: 'builder',
    status: 'cancelled',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-01-15T00:00:00Z',
    currentPeriodEnd: '2026-02-15T00:00:00Z',
    cancelAtPeriodEnd: true,
    trialEnd: null,
    mrr: 0,
    currency: 'USD',
    createdAt: '2025-11-15T08:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'sub-7',
    customerId: 'cust-7',
    customerName: 'Lisa Nakamura',
    customerEmail: 'lisa.n@example.com',
    planId: 'plan-enterprise',
    planName: 'Enterprise',
    planTier: 'enterprise',
    status: 'active',
    billingCycle: 'annual',
    currentPeriodStart: '2025-12-01T00:00:00Z',
    currentPeriodEnd: '2026-12-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 22425,
    currency: 'USD',
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2025-12-01T08:00:00Z',
  },
  {
    id: 'sub-8',
    customerId: 'cust-8',
    customerName: 'David Kim',
    customerEmail: 'david.kim@example.com',
    planId: 'plan-starter',
    planName: 'Starter',
    planTier: 'starter',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-02-01T00:00:00Z',
    currentPeriodEnd: '2026-03-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 0,
    currency: 'USD',
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'sub-9',
    customerId: 'cust-9',
    customerName: 'Omar Hassan',
    customerEmail: 'omar.h@example.com',
    planId: 'plan-pro',
    planName: 'Pro',
    planTier: 'pro',
    status: 'past_due',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-01-28T00:00:00Z',
    currentPeriodEnd: '2026-02-28T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 7900,
    currency: 'USD',
    createdAt: '2025-10-28T08:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'sub-10',
    customerId: 'cust-10',
    customerName: 'Mia Johnson',
    customerEmail: 'mia.j@example.com',
    planId: 'plan-builder',
    planName: 'Builder',
    planTier: 'builder',
    status: 'cancelled',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-01-08T00:00:00Z',
    currentPeriodEnd: '2026-02-08T00:00:00Z',
    cancelAtPeriodEnd: true,
    trialEnd: null,
    mrr: 0,
    currency: 'USD',
    createdAt: '2025-12-08T08:00:00Z',
    updatedAt: '2026-01-20T14:00:00Z',
  },
  {
    id: 'sub-11',
    customerId: 'cust-11',
    customerName: 'Chris Anderson',
    customerEmail: 'chris.a@example.com',
    planId: 'plan-builder',
    planName: 'Builder',
    planTier: 'builder',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-02-12T00:00:00Z',
    currentPeriodEnd: '2026-03-12T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 2900,
    currency: 'USD',
    createdAt: '2025-11-12T08:00:00Z',
    updatedAt: '2026-02-12T00:00:00Z',
  },
  {
    id: 'sub-12',
    customerId: 'cust-12',
    customerName: 'Sophie Müller',
    customerEmail: 'sophie.m@example.com',
    planId: 'plan-pro',
    planName: 'Pro',
    planTier: 'pro',
    status: 'trialing',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-02-13T00:00:00Z',
    currentPeriodEnd: '2026-03-13T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: '2026-02-27T00:00:00Z',
    mrr: 0,
    currency: 'USD',
    createdAt: '2026-02-13T08:00:00Z',
    updatedAt: '2026-02-13T08:00:00Z',
  },
  {
    id: 'sub-13',
    customerId: 'cust-13',
    customerName: 'Wei Zhang',
    customerEmail: 'wei.z@example.com',
    planId: 'plan-enterprise',
    planName: 'Enterprise',
    planTier: 'enterprise',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-02-01T00:00:00Z',
    currentPeriodEnd: '2026-03-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 29900,
    currency: 'USD',
    createdAt: '2025-08-01T08:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'sub-14',
    customerId: 'cust-14',
    customerName: 'Isabella Costa',
    customerEmail: 'isabella.c@example.com',
    planId: 'plan-builder',
    planName: 'Builder',
    planTier: 'builder',
    status: 'paused',
    billingCycle: 'annual',
    currentPeriodStart: '2025-12-15T00:00:00Z',
    currentPeriodEnd: '2026-12-15T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 0,
    currency: 'USD',
    createdAt: '2025-12-15T08:00:00Z',
    updatedAt: '2026-01-30T16:00:00Z',
  },
  {
    id: 'sub-15',
    customerId: 'cust-15',
    customerName: 'Tania Patel',
    customerEmail: 'tania.p@example.com',
    planId: 'plan-builder',
    planName: 'Builder',
    planTier: 'builder',
    status: 'active',
    billingCycle: 'annual',
    currentPeriodStart: '2026-01-03T00:00:00Z',
    currentPeriodEnd: '2027-01-03T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 2175,
    currency: 'USD',
    createdAt: '2025-10-03T08:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 'sub-16',
    customerId: 'cust-16',
    customerName: 'Roberto Silva',
    customerEmail: 'roberto.s@example.com',
    planId: 'plan-pro',
    planName: 'Pro',
    planTier: 'pro',
    status: 'cancelled',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-01-18T00:00:00Z',
    currentPeriodEnd: '2026-02-18T00:00:00Z',
    cancelAtPeriodEnd: true,
    trialEnd: null,
    mrr: 0,
    currency: 'USD',
    createdAt: '2025-09-18T08:00:00Z',
    updatedAt: '2026-02-02T09:00:00Z',
  },
  {
    id: 'sub-17',
    customerId: 'cust-17',
    customerName: 'Anna Johansson',
    customerEmail: 'anna.j@example.com',
    planId: 'plan-starter',
    planName: 'Starter',
    planTier: 'starter',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-02-08T00:00:00Z',
    currentPeriodEnd: '2026-03-08T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 0,
    currency: 'USD',
    createdAt: '2026-02-08T08:00:00Z',
    updatedAt: '2026-02-08T08:00:00Z',
  },
  {
    id: 'sub-18',
    customerId: 'cust-18',
    customerName: 'Kevin Lee',
    customerEmail: 'kevin.lee@example.com',
    planId: 'plan-builder',
    planName: 'Builder',
    planTier: 'builder',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-02-14T00:00:00Z',
    currentPeriodEnd: '2026-03-14T00:00:00Z',
    cancelAtPeriodEnd: false,
    trialEnd: null,
    mrr: 2900,
    currency: 'USD',
    createdAt: '2025-11-14T08:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
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

const SUBSCRIPTION_FIELDS = `
  id customerId customerName customerEmail
  planId planName planTier status billingCycle
  currentPeriodStart currentPeriodEnd cancelAtPeriodEnd
  trialEnd mrr currency createdAt updatedAt
`

const ALL_SUBSCRIPTIONS_QUERY = `
  query Subscriptions($limit: Int, $offset: Int) {
    subscriptions(limit: $limit, offset: $offset) {
      ${SUBSCRIPTION_FIELDS}
    }
  }
`

const SUBSCRIPTION_BY_ID_QUERY = `
  query Subscription($id: ID!) {
    subscription(id: $id) {
      ${SUBSCRIPTION_FIELDS}
    }
  }
`

const UPDATE_SUBSCRIPTION_MUTATION = `
  mutation UpdateSubscription($id: ID!, $input: UpdateSubscriptionInput!) {
    updateSubscription(id: $id, input: $input) {
      ${SUBSCRIPTION_FIELDS}
    }
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

let mockSubscriptions = [...SEED_SUBSCRIPTIONS]

// ===========================================================================
// CRUD Functions
// ===========================================================================

export async function fetchAllSubscriptions(
  token: string,
  limit = 100,
  offset = 0,
): Promise<Subscription[]> {
  try {
    const data = await authGraphqlFetch<{ subscriptions: Subscription[] }>(
      ALL_SUBSCRIPTIONS_QUERY,
      { limit, offset },
      token,
    )
    return data.subscriptions
  } catch {
    if (useSeedData()) return mockSubscriptions.slice(offset, offset + limit)
    return []
  }
}

export async function fetchSubscriptionById(
  token: string,
  id: string,
): Promise<Subscription | null> {
  try {
    const data = await authGraphqlFetch<{ subscription: Subscription }>(
      SUBSCRIPTION_BY_ID_QUERY,
      { id },
      token,
    )
    return data.subscription
  } catch {
    if (useSeedData()) return mockSubscriptions.find((s) => s.id === id) || null
    return null
  }
}

export async function updateSubscription(
  token: string,
  id: string,
  input: UpdateSubscriptionInput,
): Promise<Subscription> {
  if (useSeedData()) {
    const idx = mockSubscriptions.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error('Subscription not found')
    const updated: Subscription = {
      ...mockSubscriptions[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    } as Subscription
    mockSubscriptions[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateSubscription: Subscription }>(
    UPDATE_SUBSCRIPTION_MUTATION,
    { id, input },
    token,
  )
  return data.updateSubscription
}

// ===========================================================================
// Derived metrics
// ===========================================================================

export function computeChurnMetrics(subscriptions: Subscription[]): ChurnMetrics {
  const active = subscriptions.filter((s) => s.status === 'active')
  const churned = subscriptions.filter((s) => s.status === 'cancelled')
  const trialing = subscriptions.filter((s) => s.status === 'trialing')
  const mrrCurrent = active.reduce((sum, s) => sum + s.mrr, 0)
  const trialConverted = subscriptions.filter(
    (s) => s.status === 'active' && s.trialEnd !== null,
  ).length

  return {
    totalActive: active.length,
    totalChurned: churned.length,
    churnRate: subscriptions.length > 0
      ? Math.round((churned.length / subscriptions.length) * 100)
      : 0,
    mrrCurrent,
    mrrPrevious: Math.round(mrrCurrent * 0.92),
    mrrGrowth: 8.7,
    trialConversionRate: trialing.length + trialConverted > 0
      ? Math.round((trialConverted / (trialing.length + trialConverted)) * 100)
      : 0,
  }
}

// Formatting helpers
export function formatMrr(cents: number, currency = 'USD'): string {
  if (cents === 0) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

// Subscription status display
export const SUBSCRIPTION_STATUS_STYLES: Record<
  SubscriptionStatus,
  { bg: string; color: string; label: string }
> = {
  active: { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
  trialing: { bg: '#DBEAFE', color: '#1E40AF', label: 'Trialing' },
  past_due: { bg: '#FEF3C7', color: '#92400E', label: 'Past Due' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelled' },
  paused: { bg: '#E0E7FF', color: '#3730A3', label: 'Paused' },
}

// Re-export seed data
export { SEED_SUBSCRIPTIONS }
