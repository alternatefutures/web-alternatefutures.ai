// ---------------------------------------------------------------------------
// BF-SO-010: Budget Tracker
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BudgetCategory = 'content' | 'ads' | 'tools' | 'events' | 'partnerships' | 'swag' | 'infra'

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface BudgetLine {
  id: string
  category: BudgetCategory
  quarter: Quarter
  year: number
  planned: number
  actual: number
  currency: string
  notes: string
}

export interface CreateBudgetLineInput {
  category: BudgetCategory
  quarter: Quarter
  year: number
  planned: number
  actual?: number
  currency?: string
  notes?: string
}

export interface UpdateBudgetLineInput {
  category?: BudgetCategory
  quarter?: Quarter
  year?: number
  planned?: number
  actual?: number
  currency?: string
  notes?: string
}

export interface BudgetSummary {
  totalPlanned: number
  totalActual: number
  variance: number
  variancePercent: number
  byCategory: Record<BudgetCategory, { planned: number; actual: number }>
  byQuarter: Record<Quarter, { planned: number; actual: number }>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BUDGET_CATEGORY_STYLES: Record<BudgetCategory, { bg: string; color: string; label: string }> = {
  content: { bg: '#DBEAFE', color: '#1E40AF', label: 'Content' },
  ads: { bg: '#FEE2E2', color: '#991B1B', label: 'Ads' },
  tools: { bg: '#F3F4F6', color: '#6B7280', label: 'Tools' },
  events: { bg: '#FEF3C7', color: '#92400E', label: 'Events' },
  partnerships: { bg: '#D1FAE5', color: '#065F46', label: 'Partnerships' },
  swag: { bg: '#EDE9FE', color: '#5B21B6', label: 'Swag' },
  infra: { bg: '#FCE7F3', color: '#9D174D', label: 'Infrastructure' },
}

export const ALL_BUDGET_CATEGORIES: BudgetCategory[] = [
  'content', 'ads', 'tools', 'events', 'partnerships', 'swag', 'infra',
]

export const ALL_QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']

export const ANNUAL_BUDGET = 600_000
export const QUARTERLY_TARGETS: Record<Quarter, number> = {
  Q1: 80_000,
  Q2: 150_000,
  Q3: 200_000,
  Q4: 170_000,
}

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
// Seed data — Q1 and Q2 2026 budget allocations
// ---------------------------------------------------------------------------

const SEED_BUDGET: BudgetLine[] = [
  // Q1 2026 — $80K budget
  { id: 'bl-q1-content', category: 'content', quarter: 'Q1', year: 2026, planned: 20000, actual: 18500, currency: 'USD', notes: 'Blog posts, tutorials, documentation refresh' },
  { id: 'bl-q1-ads', category: 'ads', quarter: 'Q1', year: 2026, planned: 15000, actual: 14200, currency: 'USD', notes: 'Google Ads, Twitter Ads for launch campaign' },
  { id: 'bl-q1-tools', category: 'tools', quarter: 'Q1', year: 2026, planned: 8000, actual: 7800, currency: 'USD', notes: 'Analytics, monitoring, design tools' },
  { id: 'bl-q1-events', category: 'events', quarter: 'Q1', year: 2026, planned: 12000, actual: 9500, currency: 'USD', notes: 'ETHDenver sponsorship, meetup hosting' },
  { id: 'bl-q1-partnerships', category: 'partnerships', quarter: 'Q1', year: 2026, planned: 10000, actual: 11200, currency: 'USD', notes: 'Integration partner co-marketing' },
  { id: 'bl-q1-swag', category: 'swag', quarter: 'Q1', year: 2026, planned: 5000, actual: 4800, currency: 'USD', notes: 'Launch merch, sticker packs' },
  { id: 'bl-q1-infra', category: 'infra', quarter: 'Q1', year: 2026, planned: 10000, actual: 9200, currency: 'USD', notes: 'Akash deployments, CDN, domains' },

  // Q2 2026 — $150K budget
  { id: 'bl-q2-content', category: 'content', quarter: 'Q2', year: 2026, planned: 35000, actual: 12000, currency: 'USD', notes: 'Video series, case studies, migration guides' },
  { id: 'bl-q2-ads', category: 'ads', quarter: 'Q2', year: 2026, planned: 35000, actual: 8500, currency: 'USD', notes: 'Scaling digital ads, Reddit, Hacker News' },
  { id: 'bl-q2-tools', category: 'tools', quarter: 'Q2', year: 2026, planned: 12000, actual: 4200, currency: 'USD', notes: 'Marketing automation, CRM upgrade' },
  { id: 'bl-q2-events', category: 'events', quarter: 'Q2', year: 2026, planned: 25000, actual: 5000, currency: 'USD', notes: 'Consensus sponsorship, developer workshops' },
  { id: 'bl-q2-partnerships', category: 'partnerships', quarter: 'Q2', year: 2026, planned: 20000, actual: 3000, currency: 'USD', notes: 'Protocol partnerships, grant-funded co-marketing' },
  { id: 'bl-q2-swag', category: 'swag', quarter: 'Q2', year: 2026, planned: 8000, actual: 1500, currency: 'USD', notes: 'Conference swag, premium items for partners' },
  { id: 'bl-q2-infra', category: 'infra', quarter: 'Q2', year: 2026, planned: 15000, actual: 6800, currency: 'USD', notes: 'Scaling infrastructure, multi-region deployment' },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// In-memory mock store
// ---------------------------------------------------------------------------

let mockBudget = [...SEED_BUDGET]

// ---------------------------------------------------------------------------
// Summary computation
// ---------------------------------------------------------------------------

export function computeBudgetSummary(lines: BudgetLine[]): BudgetSummary {
  const totalPlanned = lines.reduce((s, l) => s + l.planned, 0)
  const totalActual = lines.reduce((s, l) => s + l.actual, 0)
  const variance = totalPlanned - totalActual
  const variancePercent = totalPlanned > 0 ? Math.round((variance / totalPlanned) * 100) : 0

  const byCategory = {} as Record<BudgetCategory, { planned: number; actual: number }>
  for (const cat of ALL_BUDGET_CATEGORIES) {
    const catLines = lines.filter((l) => l.category === cat)
    byCategory[cat] = {
      planned: catLines.reduce((s, l) => s + l.planned, 0),
      actual: catLines.reduce((s, l) => s + l.actual, 0),
    }
  }

  const byQuarter = {} as Record<Quarter, { planned: number; actual: number }>
  for (const q of ALL_QUARTERS) {
    const qLines = lines.filter((l) => l.quarter === q)
    byQuarter[q] = {
      planned: qLines.reduce((s, l) => s + l.planned, 0),
      actual: qLines.reduce((s, l) => s + l.actual, 0),
    }
  }

  return { totalPlanned, totalActual, variance, variancePercent, byCategory, byQuarter }
}

// ---------------------------------------------------------------------------
// CRUD functions
// ---------------------------------------------------------------------------

export async function fetchAllBudgetLines(token: string): Promise<BudgetLine[]> {
  if (useSeedData()) {
    return [...mockBudget].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return ALL_QUARTERS.indexOf(a.quarter) - ALL_QUARTERS.indexOf(b.quarter)
    })
  }
  const data = await authGraphqlFetch<{ budgetLines: BudgetLine[] }>(
    `query FetchAllBudgetLines {
      budgetLines {
        id category quarter year planned actual currency notes
      }
    }`,
    {},
    token,
  )
  return data.budgetLines
}

export async function fetchBudgetByQuarter(
  token: string,
  quarter: Quarter,
  year: number,
): Promise<BudgetLine[]> {
  if (useSeedData()) {
    return mockBudget.filter((l) => l.quarter === quarter && l.year === year)
  }
  const data = await authGraphqlFetch<{ budgetByQuarter: BudgetLine[] }>(
    `query FetchBudgetByQuarter($quarter: String!, $year: Int!) {
      budgetByQuarter(quarter: $quarter, year: $year) {
        id category quarter year planned actual currency notes
      }
    }`,
    { quarter, year },
    token,
  )
  return data.budgetByQuarter
}

export async function createBudgetLine(
  token: string,
  input: CreateBudgetLineInput,
): Promise<BudgetLine> {
  if (useSeedData()) {
    const line: BudgetLine = {
      id: `bl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: input.category,
      quarter: input.quarter,
      year: input.year,
      planned: input.planned,
      actual: input.actual || 0,
      currency: input.currency || 'USD',
      notes: input.notes || '',
    }
    mockBudget = [...mockBudget, line]
    return line
  }
  const data = await authGraphqlFetch<{ createBudgetLine: BudgetLine }>(
    `mutation CreateBudgetLine($input: CreateBudgetLineInput!) {
      createBudgetLine(input: $input) {
        id category quarter year planned actual currency notes
      }
    }`,
    { input },
    token,
  )
  return data.createBudgetLine
}

export async function updateBudgetLine(
  token: string,
  id: string,
  input: UpdateBudgetLineInput,
): Promise<BudgetLine> {
  if (useSeedData()) {
    const idx = mockBudget.findIndex((l) => l.id === id)
    if (idx === -1) throw new Error('Budget line not found')
    const existing = mockBudget[idx]
    const updated: BudgetLine = {
      ...existing,
      category: input.category !== undefined ? input.category : existing.category,
      quarter: input.quarter !== undefined ? input.quarter : existing.quarter,
      year: input.year !== undefined ? input.year : existing.year,
      planned: input.planned !== undefined ? input.planned : existing.planned,
      actual: input.actual !== undefined ? input.actual : existing.actual,
      currency: input.currency !== undefined ? input.currency : existing.currency,
      notes: input.notes !== undefined ? input.notes : existing.notes,
    }
    mockBudget[idx] = updated
    return updated
  }
  const data = await authGraphqlFetch<{ updateBudgetLine: BudgetLine }>(
    `mutation UpdateBudgetLine($id: ID!, $input: UpdateBudgetLineInput!) {
      updateBudgetLine(id: $id, input: $input) {
        id category quarter year planned actual currency notes
      }
    }`,
    { id, input },
    token,
  )
  return data.updateBudgetLine
}

export async function deleteBudgetLine(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockBudget = mockBudget.filter((l) => l.id !== id)
    return
  }
  await authGraphqlFetch<{ deleteBudgetLine: boolean }>(
    `mutation DeleteBudgetLine($id: ID!) {
      deleteBudgetLine(id: $id)
    }`,
    { id },
    token,
  )
}

export { SEED_BUDGET }
