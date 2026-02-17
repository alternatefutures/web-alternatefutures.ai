// ---------------------------------------------------------------------------
// BF-SO-009: Campaign ROI Tracker
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AttributionModel = 'first-touch' | 'last-touch' | 'linear' | 'time-decay'

export interface CampaignROI {
  id: string
  campaignId: string
  campaignName: string
  spend: number
  revenue: number
  impressions: number
  clicks: number
  conversions: number
  cpa: number // cost per acquisition
  roas: number // return on ad spend
  attribution: AttributionModel
  startDate: string
  endDate: string
  channel: string
  notes: string
}

export interface ROISummary {
  totalSpend: number
  totalRevenue: number
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  avgCPA: number
  avgROAS: number
  overallCTR: number
  overallConversionRate: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ATTRIBUTION_LABELS: Record<AttributionModel, string> = {
  'first-touch': 'First Touch',
  'last-touch': 'Last Touch',
  'linear': 'Linear',
  'time-decay': 'Time Decay',
}

export const CHANNEL_STYLES: Record<string, { bg: string; color: string }> = {
  'Organic Social': { bg: '#D1FAE5', color: '#065F46' },
  'Paid Social': { bg: '#DBEAFE', color: '#1E40AF' },
  'Search': { bg: '#FEF3C7', color: '#92400E' },
  'Email': { bg: '#EDE9FE', color: '#5B21B6' },
  'Content': { bg: '#FCE7F3', color: '#9D174D' },
  'Events': { bg: '#FEE2E2', color: '#991B1B' },
  'Partnerships': { bg: '#F3F4F6', color: '#6B7280' },
  'Referral': { bg: '#CCFBF1', color: '#134E4A' },
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
// Seed data — 8 campaigns with ROI data
// ---------------------------------------------------------------------------

const SEED_CAMPAIGN_ROI: CampaignROI[] = [
  {
    id: 'roi-001',
    campaignId: 'seed-campaign-1',
    campaignName: 'AF Launch Announcement',
    spend: 5200,
    revenue: 18400,
    impressions: 245000,
    clicks: 8200,
    conversions: 312,
    cpa: 16.67,
    roas: 3.54,
    attribution: 'linear',
    startDate: '2026-01-14T00:00:00Z',
    endDate: '2026-01-28T00:00:00Z',
    channel: 'Organic Social',
    notes: 'Multi-platform launch campaign across X, LinkedIn, and Bluesky',
  },
  {
    id: 'roi-002',
    campaignId: 'seed-campaign-3',
    campaignName: 'Framework Deploy Guides',
    spend: 3800,
    revenue: 12600,
    impressions: 180000,
    clicks: 6400,
    conversions: 245,
    cpa: 15.51,
    roas: 3.32,
    attribution: 'last-touch',
    startDate: '2026-02-01T00:00:00Z',
    endDate: '2026-02-15T00:00:00Z',
    channel: 'Content',
    notes: 'Technical content driving developer sign-ups',
  },
  {
    id: 'roi-003',
    campaignId: 'camp-google-ads-q1',
    campaignName: 'Google Ads — Web3 Hosting',
    spend: 8500,
    revenue: 21200,
    impressions: 520000,
    clicks: 12800,
    conversions: 480,
    cpa: 17.71,
    roas: 2.49,
    attribution: 'last-touch',
    startDate: '2026-01-05T00:00:00Z',
    endDate: '2026-02-15T00:00:00Z',
    channel: 'Search',
    notes: 'Google Search ads targeting "decentralized hosting" and "IPFS hosting" keywords',
  },
  {
    id: 'roi-004',
    campaignId: 'camp-ethdenver-2026',
    campaignName: 'ETHDenver 2026 Sponsorship',
    spend: 12000,
    revenue: 28500,
    impressions: 85000,
    clicks: 3200,
    conversions: 189,
    cpa: 63.49,
    roas: 2.38,
    attribution: 'first-touch',
    startDate: '2026-02-23T00:00:00Z',
    endDate: '2026-03-02T00:00:00Z',
    channel: 'Events',
    notes: 'Booth, workshop session, and after-party sponsorship',
  },
  {
    id: 'roi-005',
    campaignId: 'camp-newsletter-launch',
    campaignName: 'Developer Newsletter Launch',
    spend: 1200,
    revenue: 8900,
    impressions: 42000,
    clicks: 5600,
    conversions: 380,
    cpa: 3.16,
    roas: 7.42,
    attribution: 'linear',
    startDate: '2026-01-20T00:00:00Z',
    endDate: '2026-02-15T00:00:00Z',
    channel: 'Email',
    notes: 'Weekly dev newsletter with platform updates and tutorials',
  },
  {
    id: 'roi-006',
    campaignId: 'camp-twitter-ads-q1',
    campaignName: 'X Ads — DePIN Developer',
    spend: 6200,
    revenue: 14800,
    impressions: 380000,
    clicks: 9500,
    conversions: 290,
    cpa: 21.38,
    roas: 2.39,
    attribution: 'time-decay',
    startDate: '2026-01-10T00:00:00Z',
    endDate: '2026-02-10T00:00:00Z',
    channel: 'Paid Social',
    notes: 'X promoted tweets targeting DePIN and Web3 developer audiences',
  },
  {
    id: 'roi-007',
    campaignId: 'camp-akash-comarketing',
    campaignName: 'Akash Network Co-Marketing',
    spend: 4000,
    revenue: 15200,
    impressions: 120000,
    clicks: 4800,
    conversions: 210,
    cpa: 19.05,
    roas: 3.80,
    attribution: 'linear',
    startDate: '2026-01-15T00:00:00Z',
    endDate: '2026-02-15T00:00:00Z',
    channel: 'Partnerships',
    notes: 'Joint blog posts, shared webinar, and cross-promotion with Akash',
  },
  {
    id: 'roi-008',
    campaignId: 'camp-referral-program',
    campaignName: 'Developer Referral Program',
    spend: 2800,
    revenue: 22100,
    impressions: 65000,
    clicks: 3800,
    conversions: 420,
    cpa: 6.67,
    roas: 7.89,
    attribution: 'first-touch',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-02-15T00:00:00Z',
    channel: 'Referral',
    notes: '$25 credit per referred developer who deploys a project',
  },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// In-memory mock store
// ---------------------------------------------------------------------------

let mockROI = [...SEED_CAMPAIGN_ROI]

// ---------------------------------------------------------------------------
// Summary computation
// ---------------------------------------------------------------------------

export function computeROISummary(campaigns: CampaignROI[]): ROISummary {
  if (campaigns.length === 0) {
    return {
      totalSpend: 0, totalRevenue: 0, totalImpressions: 0,
      totalClicks: 0, totalConversions: 0, avgCPA: 0,
      avgROAS: 0, overallCTR: 0, overallConversionRate: 0,
    }
  }

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0)
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0)
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)

  return {
    totalSpend,
    totalRevenue,
    totalImpressions,
    totalClicks,
    totalConversions,
    avgCPA: totalConversions > 0 ? Math.round((totalSpend / totalConversions) * 100) / 100 : 0,
    avgROAS: totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) / 100 : 0,
    overallCTR: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
    overallConversionRate: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 10000) / 100 : 0,
  }
}

// ---------------------------------------------------------------------------
// CRUD functions
// ---------------------------------------------------------------------------

export async function fetchAllCampaignROI(token: string): Promise<CampaignROI[]> {
  if (useSeedData()) {
    return [...mockROI].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    )
  }
  const data = await authGraphqlFetch<{ campaignROI: CampaignROI[] }>(
    `query FetchAllCampaignROI {
      campaignROI {
        id campaignId campaignName spend revenue impressions clicks
        conversions cpa roas attribution startDate endDate channel notes
      }
    }`,
    {},
    token,
  )
  return data.campaignROI
}

export async function fetchCampaignROIById(
  token: string,
  id: string,
): Promise<CampaignROI | null> {
  if (useSeedData()) {
    return mockROI.find((r) => r.id === id) || null
  }
  const data = await authGraphqlFetch<{ campaignROIById: CampaignROI | null }>(
    `query FetchCampaignROIById($id: ID!) {
      campaignROIById(id: $id) {
        id campaignId campaignName spend revenue impressions clicks
        conversions cpa roas attribution startDate endDate channel notes
      }
    }`,
    { id },
    token,
  )
  return data.campaignROIById
}

export async function deleteCampaignROI(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockROI = mockROI.filter((r) => r.id !== id)
    return
  }
  await authGraphqlFetch<{ deleteCampaignROI: boolean }>(
    `mutation DeleteCampaignROI($id: ID!) {
      deleteCampaignROI(id: $id)
    }`,
    { id },
    token,
  )
}

export { SEED_CAMPAIGN_ROI }
