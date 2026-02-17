import type { SocialMediaPost, SocialPlatform, CreateSocialPostInput } from './social-api'
import { createSocialPost } from './social-api'
import type { ContentSourceType, TransformRequest } from './transformer-api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CampaignStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'

export interface Campaign {
  id: string
  name: string
  description: string
  status: CampaignStatus
  sourceContent: string
  sourceType: ContentSourceType
  tone: TransformRequest['tone']
  hashtags: string[]
  includeEmojis: boolean
  contentTransformationId: string | null
  utmSource: string
  utmMedium: string
  utmCampaign: string
  postIds: string[]
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface CreateCampaignInput {
  name: string
  description?: string
  sourceContent: string
  sourceType: ContentSourceType
  tone: TransformRequest['tone']
  hashtags?: string[]
  includeEmojis?: boolean
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  posts: CreateSocialPostInput[]
}

export interface UpdateCampaignInput {
  name?: string
  description?: string
  status?: CampaignStatus
  hashtags?: string[]
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CAMPAIGN_STATUS_STYLES: Record<CampaignStatus, { bg: string; color: string; label: string }> = {
  DRAFT: { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  IN_PROGRESS: { bg: '#DBEAFE', color: '#1E40AF', label: 'In Progress' },
  COMPLETED: { bg: '#D1FAE5', color: '#065F46', label: 'Completed' },
  ARCHIVED: { bg: '#FEF3C7', color: '#92400E', label: 'Archived' },
}

// ---------------------------------------------------------------------------
// Expanded platform list (16 platforms for wizard)
// ---------------------------------------------------------------------------

export type ExpandedPlatform =
  | SocialPlatform
  | 'PINTEREST'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'GOOGLE_BUSINESS'
  | 'FARCASTER'
  | 'LENS'
  | 'MASTODON'

export const EXPANDED_PLATFORM_LIMITS: Record<ExpandedPlatform, number> = {
  X: 280,
  BLUESKY: 300,
  LINKEDIN: 3000,
  REDDIT: 40000,
  DISCORD: 2000,
  TELEGRAM: 4096,
  THREADS: 500,
  INSTAGRAM: 2200,
  FACEBOOK: 63206,
  PINTEREST: 500,
  TIKTOK: 2200,
  YOUTUBE: 5000,
  GOOGLE_BUSINESS: 1500,
  FARCASTER: 1024,
  LENS: 5000,
  MASTODON: 500,
}

export const EXPANDED_PLATFORM_LABELS: Record<ExpandedPlatform, string> = {
  X: 'X (Twitter)',
  BLUESKY: 'Bluesky',
  LINKEDIN: 'LinkedIn',
  REDDIT: 'Reddit',
  DISCORD: 'Discord',
  TELEGRAM: 'Telegram',
  THREADS: 'Threads',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  PINTEREST: 'Pinterest',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  GOOGLE_BUSINESS: 'Google Business',
  FARCASTER: 'Farcaster',
  LENS: 'Lens',
  MASTODON: 'Mastodon',
}

export const ALL_EXPANDED_PLATFORMS: ExpandedPlatform[] = [
  'X', 'BLUESKY', 'LINKEDIN', 'MASTODON', 'REDDIT', 'DISCORD',
  'TELEGRAM', 'THREADS', 'INSTAGRAM', 'FACEBOOK', 'PINTEREST',
  'TIKTOK', 'YOUTUBE', 'GOOGLE_BUSINESS', 'FARCASTER', 'LENS',
]

export const PLATFORM_ICONS: Record<ExpandedPlatform, string> = {
  X: 'X',
  BLUESKY: 'BS',
  LINKEDIN: 'in',
  REDDIT: 'R',
  DISCORD: 'D',
  TELEGRAM: 'T',
  THREADS: '@',
  INSTAGRAM: 'IG',
  FACEBOOK: 'f',
  PINTEREST: 'P',
  TIKTOK: 'TT',
  YOUTUBE: 'YT',
  GOOGLE_BUSINESS: 'GB',
  FARCASTER: 'FC',
  LENS: 'L',
  MASTODON: 'M',
}

export const PLATFORM_COLORS: Record<ExpandedPlatform, string> = {
  X: '#1DA1F2',
  BLUESKY: '#0085FF',
  LINKEDIN: '#0A66C2',
  REDDIT: '#FF4500',
  DISCORD: '#5865F2',
  TELEGRAM: '#26A5E4',
  THREADS: '#000000',
  INSTAGRAM: '#E4405F',
  FACEBOOK: '#1877F2',
  PINTEREST: '#BD081C',
  TIKTOK: '#010101',
  YOUTUBE: '#FF0000',
  GOOGLE_BUSINESS: '#4285F4',
  FARCASTER: '#855DCD',
  LENS: '#00501E',
  MASTODON: '#6364FF',
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
// Seed data
// ---------------------------------------------------------------------------

const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'seed-campaign-1',
    name: 'AF Launch Announcement',
    description: 'Multi-platform launch campaign for Alternate Futures decentralized cloud platform',
    status: 'COMPLETED',
    sourceContent: 'Alternate Futures is a decentralized cloud platform that enables developers to deploy AI agents, full-stack applications, and static websites on truly decentralized infrastructure.',
    sourceType: 'FREEFORM',
    tone: 'professional',
    hashtags: ['#Web3', '#DePIN', '#DecentralizedCloud', '#AIAgents'],
    includeEmojis: false,
    contentTransformationId: 'seed-transform-1',
    utmSource: 'social',
    utmMedium: 'organic',
    utmCampaign: 'launch-2026',
    postIds: ['seed-social-1', 'seed-social-2'],
    createdById: 'mock-user-1',
    createdAt: '2026-01-14T16:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'seed-campaign-2',
    name: 'Web3 Hosting Vacuum',
    description: 'Capitalize on Fleek and Spheron exiting Web3 hosting space',
    status: 'DRAFT',
    sourceContent: 'Both Fleek and Spheron have pivoted away from Web3 hosting, creating a massive opportunity. Alternate Futures is the primary remaining player offering decentralized hosting for IPFS, Filecoin, and Arweave.',
    sourceType: 'PRESS_RELEASE',
    tone: 'professional',
    hashtags: ['#Web3', '#DecentralizedHosting'],
    includeEmojis: false,
    contentTransformationId: null,
    utmSource: 'social',
    utmMedium: 'organic',
    utmCampaign: 'web3-vacuum',
    postIds: ['seed-social-4'],
    createdById: 'mock-user-1',
    createdAt: '2026-02-08T14:00:00Z',
    updatedAt: '2026-02-08T14:00:00Z',
  },
  {
    id: 'seed-campaign-3',
    name: 'Framework Deploy Guides',
    description: 'Promote new Next.js, React, and Astro deployment guides',
    status: 'IN_PROGRESS',
    sourceContent: 'We just shipped framework deploy guides for Next.js, React SPA, and Astro. Deploy your favorite framework in under 2 minutes on decentralized infrastructure.',
    sourceType: 'DOCUMENTATION',
    tone: 'casual',
    hashtags: ['#NextJS', '#React', '#Astro', '#Web3'],
    includeEmojis: true,
    contentTransformationId: null,
    utmSource: 'social',
    utmMedium: 'organic',
    utmCampaign: 'deploy-guides',
    postIds: ['seed-social-3', 'seed-social-5'],
    createdById: 'mock-user-1',
    createdAt: '2026-02-08T15:00:00Z',
    updatedAt: '2026-02-08T16:00:00Z',
  },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// In-memory mock store
// ---------------------------------------------------------------------------

let mockCampaigns = [...SEED_CAMPAIGNS]

// ---------------------------------------------------------------------------
// CRUD functions
// ---------------------------------------------------------------------------

export async function fetchAllCampaigns(token: string): Promise<Campaign[]> {
  if (useSeedData()) {
    return [...mockCampaigns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }
  const data = await authGraphqlFetch<{ campaigns: Campaign[] }>(
    `query FetchAllCampaigns {
      campaigns {
        id name description status sourceContent sourceType tone
        hashtags includeEmojis contentTransformationId
        utmSource utmMedium utmCampaign postIds createdById
        createdAt updatedAt
      }
    }`,
    {},
    token,
  )
  return data.campaigns
}

export async function fetchCampaignById(
  token: string,
  id: string,
): Promise<Campaign | null> {
  if (useSeedData()) {
    return mockCampaigns.find((c) => c.id === id) || null
  }
  const data = await authGraphqlFetch<{ campaign: Campaign | null }>(
    `query FetchCampaignById($id: ID!) {
      campaign(id: $id) {
        id name description status sourceContent sourceType tone
        hashtags includeEmojis contentTransformationId
        utmSource utmMedium utmCampaign postIds createdById
        createdAt updatedAt
      }
    }`,
    { id },
    token,
  )
  return data.campaign
}

export async function createCampaign(
  token: string,
  input: CreateCampaignInput,
): Promise<{ campaign: Campaign; posts: SocialMediaPost[] }> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const campaignId = `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    // Create posts
    const createdPosts: SocialMediaPost[] = []
    for (const postInput of input.posts) {
      const post = await createSocialPost(token, {
        ...postInput,
        campaignId,
      })
      createdPosts.push(post)
    }

    const campaign: Campaign = {
      id: campaignId,
      name: input.name,
      description: input.description || '',
      status: 'DRAFT',
      sourceContent: input.sourceContent,
      sourceType: input.sourceType,
      tone: input.tone,
      hashtags: input.hashtags || [],
      includeEmojis: input.includeEmojis || false,
      contentTransformationId: null,
      utmSource: input.utmSource || '',
      utmMedium: input.utmMedium || '',
      utmCampaign: input.utmCampaign || '',
      postIds: createdPosts.map((p) => p.id),
      createdById: 'mock-user-1',
      createdAt: now,
      updatedAt: now,
    }
    mockCampaigns = [campaign, ...mockCampaigns]
    return { campaign, posts: createdPosts }
  }
  const data = await authGraphqlFetch<{
    createCampaign: { campaign: Campaign; posts: SocialMediaPost[] }
  }>(
    `mutation CreateCampaign($input: CreateCampaignInput!) {
      createCampaign(input: $input) {
        campaign {
          id name description status sourceContent sourceType tone
          hashtags includeEmojis contentTransformationId
          utmSource utmMedium utmCampaign postIds createdById
          createdAt updatedAt
        }
        posts {
          id platform content status scheduledFor
          createdAt updatedAt
        }
      }
    }`,
    { input },
    token,
  )
  return data.createCampaign
}

export async function updateCampaign(
  token: string,
  id: string,
  input: UpdateCampaignInput,
): Promise<Campaign> {
  if (useSeedData()) {
    const idx = mockCampaigns.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Campaign not found')
    const existing = mockCampaigns[idx]
    const updated: Campaign = {
      ...existing,
      name: input.name !== undefined ? input.name : existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      status: input.status !== undefined ? input.status : existing.status,
      hashtags: input.hashtags !== undefined ? input.hashtags : existing.hashtags,
      utmSource: input.utmSource !== undefined ? input.utmSource : existing.utmSource,
      utmMedium: input.utmMedium !== undefined ? input.utmMedium : existing.utmMedium,
      utmCampaign: input.utmCampaign !== undefined ? input.utmCampaign : existing.utmCampaign,
      updatedAt: new Date().toISOString(),
    }
    mockCampaigns[idx] = updated
    return updated
  }
  const data = await authGraphqlFetch<{ updateCampaign: Campaign }>(
    `mutation UpdateCampaign($id: ID!, $input: UpdateCampaignInput!) {
      updateCampaign(id: $id, input: $input) {
        id name description status sourceContent sourceType tone
        hashtags includeEmojis contentTransformationId
        utmSource utmMedium utmCampaign postIds createdById
        createdAt updatedAt
      }
    }`,
    { id, input },
    token,
  )
  return data.updateCampaign
}

export async function deleteCampaign(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockCampaigns = mockCampaigns.filter((c) => c.id !== id)
    return
  }
  await authGraphqlFetch<{ deleteCampaign: boolean }>(
    `mutation DeleteCampaign($id: ID!) {
      deleteCampaign(id: $id)
    }`,
    { id },
    token,
  )
}

export { SEED_CAMPAIGNS }
