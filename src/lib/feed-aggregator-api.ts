const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types — RSS/API Feed Aggregator (BF-MI-012)
// ---------------------------------------------------------------------------

export type FeedType = 'rss' | 'atom' | 'json' | 'api'
export type FeedStatus = 'active' | 'paused' | 'error'

export interface FeedSource {
  id: string
  name: string
  url: string
  type: FeedType
  category: string
  status: FeedStatus
  lastFetched: string | null
  fetchInterval: number // minutes
  itemCount: number
  errorMessage: string | null
  createdAt: string
}

export interface FeedItem {
  id: string
  sourceId: string
  sourceName: string
  title: string
  content: string
  url: string
  author: string | null
  tags: string[]
  publishedAt: string
  ingestedAt: string
}

// ---------------------------------------------------------------------------
// Seed data — Feed Sources (10+ sources)
// ---------------------------------------------------------------------------

const SEED_SOURCES: FeedSource[] = [
  {
    id: 'feed-vercel-blog',
    name: 'Vercel Blog',
    url: 'https://vercel.com/atom',
    type: 'atom',
    category: 'competitor',
    status: 'active',
    lastFetched: '2026-02-15T08:00:00Z',
    fetchInterval: 60,
    itemCount: 142,
    errorMessage: null,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'feed-netlify-blog',
    name: 'Netlify Blog',
    url: 'https://www.netlify.com/blog/rss.xml',
    type: 'rss',
    category: 'competitor',
    status: 'active',
    lastFetched: '2026-02-15T07:30:00Z',
    fetchInterval: 60,
    itemCount: 98,
    errorMessage: null,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'feed-railway-blog',
    name: 'Railway Blog',
    url: 'https://blog.railway.app/feed',
    type: 'rss',
    category: 'competitor',
    status: 'active',
    lastFetched: '2026-02-15T07:45:00Z',
    fetchInterval: 120,
    itemCount: 56,
    errorMessage: null,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'feed-flyio-blog',
    name: 'Fly.io Blog',
    url: 'https://fly.io/blog/feed.xml',
    type: 'atom',
    category: 'competitor',
    status: 'active',
    lastFetched: '2026-02-15T07:15:00Z',
    fetchInterval: 120,
    itemCount: 73,
    errorMessage: null,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'feed-cloudflare-blog',
    name: 'Cloudflare Blog',
    url: 'https://blog.cloudflare.com/rss/',
    type: 'rss',
    category: 'competitor',
    status: 'active',
    lastFetched: '2026-02-15T08:10:00Z',
    fetchInterval: 60,
    itemCount: 320,
    errorMessage: null,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'feed-hn-front',
    name: 'Hacker News (Front Page)',
    url: 'https://hnrss.org/frontpage',
    type: 'rss',
    category: 'industry',
    status: 'active',
    lastFetched: '2026-02-15T08:05:00Z',
    fetchInterval: 15,
    itemCount: 2450,
    errorMessage: null,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'feed-akash-blog',
    name: 'Akash Network Blog',
    url: 'https://akash.network/blog/feed.xml',
    type: 'atom',
    category: 'ecosystem',
    status: 'active',
    lastFetched: '2026-02-15T06:00:00Z',
    fetchInterval: 240,
    itemCount: 45,
    errorMessage: null,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'feed-ipfs-blog',
    name: 'IPFS Blog',
    url: 'https://blog.ipfs.tech/index.xml',
    type: 'rss',
    category: 'ecosystem',
    status: 'active',
    lastFetched: '2026-02-14T12:00:00Z',
    fetchInterval: 480,
    itemCount: 28,
    errorMessage: null,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'feed-filecoin-blog',
    name: 'Filecoin Blog',
    url: 'https://filecoin.io/blog/feed/rss/',
    type: 'rss',
    category: 'ecosystem',
    status: 'active',
    lastFetched: '2026-02-14T18:00:00Z',
    fetchInterval: 480,
    itemCount: 34,
    errorMessage: null,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'feed-techcrunch-cloud',
    name: 'TechCrunch Cloud',
    url: 'https://techcrunch.com/category/cloud/feed/',
    type: 'rss',
    category: 'industry',
    status: 'active',
    lastFetched: '2026-02-15T07:50:00Z',
    fetchInterval: 30,
    itemCount: 890,
    errorMessage: null,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'feed-render-changelog',
    name: 'Render Changelog',
    url: 'https://render.com/changelog.rss',
    type: 'rss',
    category: 'competitor',
    status: 'active',
    lastFetched: '2026-02-15T06:30:00Z',
    fetchInterval: 360,
    itemCount: 67,
    errorMessage: null,
    createdAt: '2026-01-12T00:00:00Z',
  },
  {
    id: 'feed-devto-depin',
    name: 'Dev.to #depin',
    url: 'https://dev.to/feed/tag/depin',
    type: 'rss',
    category: 'ecosystem',
    status: 'active',
    lastFetched: '2026-02-15T05:00:00Z',
    fetchInterval: 120,
    itemCount: 112,
    errorMessage: null,
    createdAt: '2026-01-15T00:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Seed data — Feed Items (recent items)
// ---------------------------------------------------------------------------

const SEED_ITEMS: FeedItem[] = [
  {
    id: 'fi-001',
    sourceId: 'feed-vercel-blog',
    sourceName: 'Vercel Blog',
    title: 'Introducing Vercel AI SDK 4.0',
    content: 'The AI SDK 4.0 brings streaming support for Claude 4 models, improved tool calling, and a new React hooks library for building AI-powered interfaces.',
    url: 'https://vercel.com/blog/ai-sdk-4',
    author: 'Guillermo Rauch',
    tags: ['ai', 'sdk', 'react'],
    publishedAt: '2026-02-14T16:00:00Z',
    ingestedAt: '2026-02-14T16:30:00Z',
  },
  {
    id: 'fi-002',
    sourceId: 'feed-cloudflare-blog',
    sourceName: 'Cloudflare Blog',
    title: 'Workers AI: Now Supporting 200+ Models',
    content: 'We\'re excited to announce that Workers AI now supports over 200 models from leading providers including Meta, Mistral, and Google.',
    url: 'https://blog.cloudflare.com/workers-ai-200-models',
    author: 'Cloudflare Team',
    tags: ['ai', 'workers', 'models'],
    publishedAt: '2026-02-14T14:00:00Z',
    ingestedAt: '2026-02-14T14:15:00Z',
  },
  {
    id: 'fi-003',
    sourceId: 'feed-hn-front',
    sourceName: 'Hacker News',
    title: 'Show HN: I Built a Decentralized Hosting Platform',
    content: 'After years of dealing with Vercel bill shock and vendor lock-in, I built an open-source platform for deploying to decentralized infrastructure.',
    url: 'https://news.ycombinator.com/item?id=39200001',
    author: 'depin_dev',
    tags: ['show-hn', 'decentralized', 'hosting'],
    publishedAt: '2026-02-14T12:00:00Z',
    ingestedAt: '2026-02-14T12:05:00Z',
  },
  {
    id: 'fi-004',
    sourceId: 'feed-akash-blog',
    sourceName: 'Akash Network Blog',
    title: 'Akash Network Surpasses 10,000 Active Deployments',
    content: 'The Akash Network has reached a major milestone with over 10,000 active deployments running on the decentralized compute marketplace.',
    url: 'https://akash.network/blog/10k-deployments',
    author: 'Akash Team',
    tags: ['akash', 'milestone', 'growth'],
    publishedAt: '2026-02-13T10:00:00Z',
    ingestedAt: '2026-02-13T10:30:00Z',
  },
  {
    id: 'fi-005',
    sourceId: 'feed-railway-blog',
    sourceName: 'Railway Blog',
    title: 'Railway Templates: One-Click Deploy for 500+ Apps',
    content: 'Our template library has grown to over 500 one-click deploy templates covering everything from databases to AI models.',
    url: 'https://blog.railway.app/p/500-templates',
    author: 'Railway Team',
    tags: ['railway', 'templates', 'dx'],
    publishedAt: '2026-02-13T09:00:00Z',
    ingestedAt: '2026-02-13T09:15:00Z',
  },
  {
    id: 'fi-006',
    sourceId: 'feed-flyio-blog',
    sourceName: 'Fly.io Blog',
    title: 'Why We Built Our Own Container Runtime',
    content: 'A deep dive into why Fly.io built a custom container runtime from scratch and the performance gains it unlocked.',
    url: 'https://fly.io/blog/custom-runtime',
    author: 'Thomas Ptacek',
    tags: ['flyio', 'infrastructure', 'containers'],
    publishedAt: '2026-02-12T15:00:00Z',
    ingestedAt: '2026-02-12T15:30:00Z',
  },
  {
    id: 'fi-007',
    sourceId: 'feed-techcrunch-cloud',
    sourceName: 'TechCrunch Cloud',
    title: 'The Rise of Decentralized Cloud Computing',
    content: 'A new wave of startups is challenging AWS and Google Cloud by building decentralized alternatives that promise lower costs and better reliability.',
    url: 'https://techcrunch.com/2026/02/decentralized-cloud',
    author: 'Sarah Perez',
    tags: ['depin', 'cloud', 'startups'],
    publishedAt: '2026-02-12T10:00:00Z',
    ingestedAt: '2026-02-12T10:10:00Z',
  },
  {
    id: 'fi-008',
    sourceId: 'feed-ipfs-blog',
    sourceName: 'IPFS Blog',
    title: 'IPFS 3.0: What Developers Need to Know',
    content: 'A comprehensive guide to the changes in IPFS 3.0 and how to migrate your applications.',
    url: 'https://blog.ipfs.tech/2026-02-ipfs-3-migration',
    author: 'Protocol Labs',
    tags: ['ipfs', 'migration', 'guide'],
    publishedAt: '2026-02-11T14:00:00Z',
    ingestedAt: '2026-02-11T14:30:00Z',
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

let mockSources = [...SEED_SOURCES]
let mockItems = [...SEED_ITEMS]

// ---------------------------------------------------------------------------
// Feed Source CRUD
// ---------------------------------------------------------------------------

export async function fetchFeedSources(): Promise<FeedSource[]> {
  try {
    const data = await graphqlFetch<{ feedSources: FeedSource[] }>(
      `query FeedSources { feedSources { id name url type category status lastFetched fetchInterval itemCount errorMessage createdAt } }`,
    )
    return data.feedSources
  } catch {
    if (useSeedData()) return mockSources
    return []
  }
}

export async function fetchFeedSourceById(id: string): Promise<FeedSource | null> {
  if (useSeedData()) return mockSources.find((s) => s.id === id) || null
  return null
}

export interface CreateFeedSourceInput {
  name: string
  url: string
  type: FeedType
  category: string
  fetchInterval: number
}

export async function createFeedSource(input: CreateFeedSourceInput): Promise<FeedSource> {
  const source: FeedSource = {
    id: `feed-${Date.now()}`,
    ...input,
    status: 'active',
    lastFetched: null,
    itemCount: 0,
    errorMessage: null,
    createdAt: new Date().toISOString(),
  }
  if (useSeedData()) {
    mockSources = [source, ...mockSources]
    return source
  }
  return source
}

export async function updateFeedSource(id: string, updates: Partial<FeedSource>): Promise<FeedSource> {
  if (useSeedData()) {
    const idx = mockSources.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error('Feed source not found')
    mockSources[idx] = { ...mockSources[idx], ...updates }
    return mockSources[idx]
  }
  throw new Error('Not implemented')
}

export async function deleteFeedSource(id: string): Promise<void> {
  if (useSeedData()) {
    mockSources = mockSources.filter((s) => s.id !== id)
    mockItems = mockItems.filter((i) => i.sourceId !== id)
  }
}

// ---------------------------------------------------------------------------
// Feed Items
// ---------------------------------------------------------------------------

export async function fetchFeedItems(
  limit = 50,
  offset = 0,
  filters?: { sourceId?: string; category?: string; search?: string },
): Promise<FeedItem[]> {
  try {
    const data = await graphqlFetch<{ feedItems: FeedItem[] }>(
      `query FeedItems($limit: Int, $offset: Int) { feedItems(limit: $limit, offset: $offset) { id sourceId sourceName title content url author tags publishedAt ingestedAt } }`,
      { limit, offset },
    )
    return data.feedItems
  } catch {
    if (useSeedData()) {
      let result = [...mockItems]
      if (filters?.sourceId) {
        result = result.filter((i) => i.sourceId === filters.sourceId)
      }
      if (filters?.category) {
        const sourcesInCategory = mockSources
          .filter((s) => s.category === filters.category)
          .map((s) => s.id)
        result = result.filter((i) => sourcesInCategory.includes(i.sourceId))
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        result = result.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.content.toLowerCase().includes(q),
        )
      }
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      return result.slice(offset, offset + limit)
    }
    return []
  }
}

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

export function getFeedSourcesByCategory(sources: FeedSource[]): Record<string, FeedSource[]> {
  const groups: Record<string, FeedSource[]> = {}
  for (const source of sources) {
    if (!groups[source.category]) groups[source.category] = []
    groups[source.category].push(source)
  }
  return groups
}

export { SEED_SOURCES, SEED_ITEMS }
