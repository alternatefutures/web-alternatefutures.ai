// ---------------------------------------------------------------------------
// Trending Topics API Service
// Aggregates trending content from multiple platforms and scores relevance
// to AlternateFutures GTM verticals.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TrendingSource =
  | 'HACKER_NEWS'
  | 'REDDIT'
  | 'PRODUCT_HUNT'
  | 'DEV_TO'
  | 'X'

export type GTMVertical =
  | 'AI_STARTUPS'
  | 'WEB3'
  | 'CLOUD_INFRASTRUCTURE'
  | 'INDIE_GAMING'
  | 'LOW_CODE'

export interface TrendingItem {
  id: string
  title: string
  url: string
  source: TrendingSource
  sourceUrl: string
  author: string | null
  score: number
  commentCount: number
  velocity: number // engagement per hour
  postedAt: string
  fetchedAt: string
  relevanceScore: number // 0-100
  matchedVerticals: GTMVertical[]
  suggestedResponse: string
  tags: string[]
}

export interface TrendingFilters {
  verticals?: GTMVertical[]
  sources?: TrendingSource[]
  minRelevance?: number
  maxAge?: 'hour' | 'day' | 'week'
}

// ---------------------------------------------------------------------------
// Vertical keywords used for relevance scoring
// ---------------------------------------------------------------------------

export const VERTICAL_KEYWORDS: Record<GTMVertical, string[]> = {
  AI_STARTUPS: [
    'ai agent', 'llm', 'gpt', 'claude', 'langchain', 'openai', 'anthropic',
    'machine learning', 'gpu compute', 'inference', 'vector database', 'rag',
    'fine-tuning', 'model deployment', 'ai hosting', 'ml ops', 'mlops',
    'ai startup', 'ai infrastructure', 'embedding', 'transformer',
    'large language model', 'foundation model', 'ai api', 'chatbot',
    'autonomous agent', 'ai cost', 'gpu pricing', 'serverless ai',
    'evaluation workbench', 'model comparison', 'a/b testing models',
  ],
  WEB3: [
    'web3', 'ipfs', 'arweave', 'filecoin', 'decentralized', 'dapp',
    'blockchain', 'ethereum', 'solidity', 'smart contract', 'nft',
    'dao', 'defi', 'siwe', 'metamask', 'walletconnect', 'ens',
    'censorship resistant', 'on-chain', 'token', 'crypto',
    'decentralized hosting', 'decentralized storage', 'depin',
    'farcaster', 'lens protocol', 'web3 auth', 'wallet auth',
  ],
  CLOUD_INFRASTRUCTURE: [
    'cloud hosting', 'vercel', 'netlify', 'aws', 'cloud costs',
    'infrastructure', 'serverless', 'deployment', 'cdn', 'devops',
    'kubernetes', 'docker', 'ci/cd', 'hosting costs', 'migration',
    'cloud bill', 'vendor lock-in', 'edge computing', 'saas costs',
    'unit economics', 'akash', 'decentralized compute',
    'cloud savings', 'infrastructure costs', 'hosting alternative',
  ],
  INDIE_GAMING: [
    'indie game', 'game dev', 'unity', 'godot', 'unreal',
    'indie developer', 'game hosting', 'multiplayer', 'game server',
    'steam', 'itch.io', 'console', 'playstation', 'xbox', 'switch',
    'game assets', 'game backend', 'leaderboard', 'webgl',
    'pixel art', 'retro game', 'game jam', 'solo dev',
  ],
  LOW_CODE: [
    'no-code', 'low-code', 'webflow', 'bubble', 'framer',
    'zapier', 'airtable', 'no code', 'low code', 'visual builder',
    'drag and drop', 'website builder', 'nocode', 'maker',
    'citizen developer', 'automation', 'custom domain',
  ],
}

export const VERTICAL_LABELS: Record<GTMVertical, string> = {
  AI_STARTUPS: 'AI Startups',
  WEB3: 'Web3',
  CLOUD_INFRASTRUCTURE: 'Cloud Infra',
  INDIE_GAMING: 'Indie Gaming',
  LOW_CODE: 'Low-Code',
}

export const SOURCE_LABELS: Record<TrendingSource, string> = {
  HACKER_NEWS: 'Hacker News',
  REDDIT: 'Reddit',
  PRODUCT_HUNT: 'Product Hunt',
  DEV_TO: 'dev.to',
  X: 'X / Twitter',
}

// ---------------------------------------------------------------------------
// Relevance scoring
// ---------------------------------------------------------------------------

function scoreRelevance(
  title: string,
  tags: string[],
): { score: number; verticals: GTMVertical[] } {
  const text = `${title} ${tags.join(' ')}`.toLowerCase()
  const matched: GTMVertical[] = []
  let totalHits = 0

  for (const [vertical, keywords] of Object.entries(VERTICAL_KEYWORDS)) {
    let hits = 0
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) hits++
    }
    if (hits > 0) {
      matched.push(vertical as GTMVertical)
      totalHits += hits
    }
  }

  // Score: 0-100 based on keyword density and vertical match breadth
  const densityScore = Math.min(totalHits * 12, 70)
  const breadthScore = matched.length * 10
  const score = Math.min(densityScore + breadthScore, 100)

  return { score, verticals: matched }
}

// ---------------------------------------------------------------------------
// AI suggested response generation
// ---------------------------------------------------------------------------

function generateSuggestedResponse(item: {
  title: string
  source: TrendingSource
  matchedVerticals: GTMVertical[]
}): string {
  const verticalHooks: Record<GTMVertical, string[]> = {
    AI_STARTUPS: [
      `This is exactly why we built Alternate Futures — deploy AI agents for 70% less than traditional cloud. No GPU sticker shock.`,
      `Great discussion. For teams shipping LLM apps, our decentralized compute drops inference costs dramatically while scaling on demand.`,
      `Worth noting: the cost gap between centralized and decentralized GPU compute keeps widening. We're seeing 60-70% savings on Akash vs AWS.`,
    ],
    WEB3: [
      `True decentralization means your dApp has no single point of failure. Deploy to IPFS/Arweave with built-in SIWE auth on Alternate Futures.`,
      `With both major Web3 hosting players having pivoted away, there's a real gap here. We're filling it with first-class IPFS + Arweave support.`,
      `Censorship-resistant hosting isn't just ideology — it's infrastructure resilience. Content-addressed storage means your site is permanent.`,
    ],
    CLOUD_INFRASTRUCTURE: [
      `This resonates. We've helped teams cut their Vercel/Netlify bill by 60% without sacrificing DX. Zero-downtime migration in ~15 minutes.`,
      `Cloud cost optimization is becoming a survival skill. Decentralized infra offers real savings — our users see 50-80% reduction consistently.`,
      `Interesting trend. The shift from vendor lock-in to portable infrastructure is accelerating. No reason to pay premium for what's become commodity.`,
    ],
    INDIE_GAMING: [
      `Indie devs shouldn't need a AAA budget for backend infra. Console-ready backend at $29/mo flat, game assets on IPFS for pennies per GB.`,
      `Game hosting costs are brutal for small teams. IPFS for assets + Akash for servers = 10x cheaper than traditional hosting.`,
      `Love seeing indie devs push boundaries. If hosting costs are a pain point, check out decentralized alternatives — the savings are real.`,
    ],
    LOW_CODE: [
      `No-code builders deserve professional hosting without the markup. Export from Webflow/Framer and deploy to IPFS — own your site, not your platform.`,
      `Great for the no-code community. We make it possible to deploy Webflow/Framer exports to decentralized hosting with custom domains, no terminal needed.`,
    ],
  }

  // Pick a response based on the highest-priority matched vertical
  const primary = item.matchedVerticals[0]
  if (primary && verticalHooks[primary]) {
    const options = verticalHooks[primary]
    // Deterministic pick based on title length for consistency
    return options[item.title.length % options.length]
  }

  // Generic fallback
  return `Interesting trend in ${SOURCE_LABELS[item.source]}. This aligns with the shift toward decentralized infrastructure — lower costs, true ownership, no vendor lock-in.`
}

// ---------------------------------------------------------------------------
// Seed data — used in development when external APIs are unreachable
// ---------------------------------------------------------------------------

const SEED_TRENDING: TrendingItem[] = [
  {
    id: 'hn-1',
    title: 'Show HN: Open-source AI agent framework that deploys to any cloud',
    url: 'https://news.ycombinator.com/item?id=39012345',
    source: 'HACKER_NEWS',
    sourceUrl: 'https://news.ycombinator.com',
    author: 'agent_builder',
    score: 342,
    commentCount: 127,
    velocity: 42.8,
    postedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['ai', 'agents', 'open-source', 'cloud', 'deployment'],
  },
  {
    id: 'reddit-1',
    title: 'Our Vercel bill hit $12K/month. Time to look at alternatives.',
    url: 'https://reddit.com/r/webdev/comments/abc123',
    source: 'REDDIT',
    sourceUrl: 'https://reddit.com/r/webdev',
    author: 'cloud_migrator',
    score: 891,
    commentCount: 234,
    velocity: 89.1,
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['vercel', 'hosting', 'cloud costs', 'saas', 'infrastructure'],
  },
  {
    id: 'ph-1',
    title: 'LangChain Studio 2.0 — Visual builder for AI agent workflows',
    url: 'https://producthunt.com/posts/langchain-studio-2',
    source: 'PRODUCT_HUNT',
    sourceUrl: 'https://producthunt.com',
    author: 'langchain_team',
    score: 567,
    commentCount: 89,
    velocity: 70.9,
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['langchain', 'ai', 'agents', 'no-code', 'workflow'],
  },
  {
    id: 'devto-1',
    title: 'How I deployed my dApp to IPFS and saved $400/month',
    url: 'https://dev.to/web3dev/ipfs-deployment-savings',
    source: 'DEV_TO',
    sourceUrl: 'https://dev.to',
    author: 'web3dev',
    score: 156,
    commentCount: 34,
    velocity: 19.5,
    postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['ipfs', 'web3', 'dapp', 'decentralized', 'hosting', 'cost savings'],
  },
  {
    id: 'reddit-2',
    title: 'Godot 5 announced: built-in multiplayer, web export improvements',
    url: 'https://reddit.com/r/gamedev/comments/def456',
    source: 'REDDIT',
    sourceUrl: 'https://reddit.com/r/gamedev',
    author: 'godot_fan',
    score: 2340,
    commentCount: 456,
    velocity: 195.0,
    postedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['godot', 'game dev', 'multiplayer', 'indie game', 'web export'],
  },
  {
    id: 'hn-2',
    title: 'Why we moved from AWS to decentralized compute (and saved 65%)',
    url: 'https://news.ycombinator.com/item?id=39023456',
    source: 'HACKER_NEWS',
    sourceUrl: 'https://news.ycombinator.com',
    author: 'depin_startup',
    score: 512,
    commentCount: 198,
    velocity: 64.0,
    postedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['aws', 'decentralized', 'cloud', 'cost savings', 'depin', 'infrastructure'],
  },
  {
    id: 'ph-2',
    title: 'Framer AI — Generate production-ready sites from a prompt',
    url: 'https://producthunt.com/posts/framer-ai-2',
    source: 'PRODUCT_HUNT',
    sourceUrl: 'https://producthunt.com',
    author: 'framer_team',
    score: 834,
    commentCount: 112,
    velocity: 104.3,
    postedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['framer', 'no-code', 'ai', 'website builder', 'low code'],
  },
  {
    id: 'x-1',
    title: 'GPU prices on Akash Network just dropped another 30%. Decentralized compute is eating cloud.',
    url: 'https://x.com/akaborsh/status/1234567890',
    source: 'X',
    sourceUrl: 'https://x.com',
    author: '@akaborsh',
    score: 1245,
    commentCount: 89,
    velocity: 155.6,
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['gpu', 'akash', 'decentralized compute', 'cloud', 'ai', 'depin'],
  },
  {
    id: 'reddit-3',
    title: 'PSA: Ethereum dApp hosting — Fleek shut down, Spheron pivoted. What are the alternatives?',
    url: 'https://reddit.com/r/ethdev/comments/ghi789',
    source: 'REDDIT',
    sourceUrl: 'https://reddit.com/r/ethdev',
    author: 'eth_builder',
    score: 423,
    commentCount: 167,
    velocity: 52.9,
    postedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['ethereum', 'dapp', 'hosting', 'web3', 'decentralized', 'ipfs'],
  },
  {
    id: 'devto-2',
    title: 'Building a RAG pipeline with LangChain and deploying it serverless',
    url: 'https://dev.to/aibuilder/rag-langchain-serverless',
    source: 'DEV_TO',
    sourceUrl: 'https://dev.to',
    author: 'aibuilder',
    score: 203,
    commentCount: 45,
    velocity: 25.4,
    postedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['rag', 'langchain', 'ai', 'serverless', 'llm', 'vector database'],
  },
  {
    id: 'hn-3',
    title: 'Show HN: Console backend for indie games — leaderboards, saves, matchmaking',
    url: 'https://news.ycombinator.com/item?id=39034567',
    source: 'HACKER_NEWS',
    sourceUrl: 'https://news.ycombinator.com',
    author: 'indie_infra',
    score: 278,
    commentCount: 92,
    velocity: 34.8,
    postedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['indie game', 'console', 'backend', 'leaderboard', 'multiplayer'],
  },
  {
    id: 'x-2',
    title: 'The Webflow-to-IPFS pipeline is underrated. Own your site, not your platform.',
    url: 'https://x.com/nocode_builder/status/9876543210',
    source: 'X',
    sourceUrl: 'https://x.com',
    author: '@nocode_builder',
    score: 456,
    commentCount: 34,
    velocity: 57.0,
    postedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    relevanceScore: 0,
    matchedVerticals: [],
    suggestedResponse: '',
    tags: ['webflow', 'ipfs', 'no-code', 'decentralized', 'hosting'],
  },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// Enrich seed items with relevance scores and suggested responses
// ---------------------------------------------------------------------------

function enrichItems(items: TrendingItem[]): TrendingItem[] {
  return items.map((item) => {
    const { score, verticals } = scoreRelevance(item.title, item.tags)
    const enriched = {
      ...item,
      relevanceScore: score,
      matchedVerticals: verticals,
    }
    return {
      ...enriched,
      suggestedResponse: generateSuggestedResponse(enriched),
    }
  })
}

// ---------------------------------------------------------------------------
// API route handler types (for /api/trending)
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

const TRENDING_QUERY = `
  query TrendingTopics($filters: TrendingFiltersInput) {
    trendingTopics(filters: $filters) {
      id title url source sourceUrl author score commentCount
      velocity postedAt fetchedAt relevanceScore matchedVerticals
      suggestedResponse tags
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

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

export async function fetchTrendingTopics(
  token: string,
  filters?: TrendingFilters,
): Promise<TrendingItem[]> {
  try {
    const data = await authGraphqlFetch<{ trendingTopics: TrendingItem[] }>(
      TRENDING_QUERY,
      { filters },
      token,
    )
    return data.trendingTopics
  } catch {
    if (useSeedData()) {
      let items = enrichItems(SEED_TRENDING)

      // Apply filters
      if (filters?.verticals?.length) {
        items = items.filter((item) =>
          item.matchedVerticals.some((v) => filters.verticals!.includes(v)),
        )
      }
      if (filters?.sources?.length) {
        items = items.filter((item) => filters.sources!.includes(item.source))
      }
      if (filters?.minRelevance) {
        items = items.filter((item) => item.relevanceScore >= filters.minRelevance!)
      }
      if (filters?.maxAge) {
        const now = Date.now()
        const cutoffs: Record<string, number> = {
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
        }
        const cutoff = cutoffs[filters.maxAge]
        items = items.filter(
          (item) => now - new Date(item.postedAt).getTime() < cutoff,
        )
      }

      // Sort by relevance score then by velocity
      items.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore
        return b.velocity - a.velocity
      })

      return items
    }
    return []
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatVelocity(velocity: number): string {
  if (velocity >= 100) return `${Math.round(velocity)}/hr`
  if (velocity >= 10) return `${velocity.toFixed(1)}/hr`
  return `${velocity.toFixed(1)}/hr`
}

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function getSourceColor(source: TrendingSource): string {
  const colors: Record<TrendingSource, string> = {
    HACKER_NEWS: '#FF6600',
    REDDIT: '#FF4500',
    PRODUCT_HUNT: '#DA552F',
    DEV_TO: '#0A0A0A',
    X: '#1DA1F2',
  }
  return colors[source]
}

export function getVerticalColor(vertical: GTMVertical): string {
  const colors: Record<GTMVertical, string> = {
    AI_STARTUPS: 'var(--af-ultra)',
    WEB3: 'var(--af-patina)',
    CLOUD_INFRASTRUCTURE: 'var(--af-terra)',
    INDIE_GAMING: 'var(--af-kin-repair)',
    LOW_CODE: 'var(--af-ai-hanada)',
  }
  return colors[vertical]
}

export function getRelevanceTier(score: number): {
  label: string
  color: string
} {
  if (score >= 70) return { label: 'High', color: 'var(--af-signal-go)' }
  if (score >= 40) return { label: 'Medium', color: 'var(--af-signal-wait)' }
  if (score > 0) return { label: 'Low', color: 'var(--af-stone-400)' }
  return { label: 'None', color: 'var(--af-stone-300)' }
}

export const ALL_VERTICALS: GTMVertical[] = [
  'AI_STARTUPS',
  'WEB3',
  'CLOUD_INFRASTRUCTURE',
  'INDIE_GAMING',
  'LOW_CODE',
]

export const ALL_SOURCES: TrendingSource[] = [
  'HACKER_NEWS',
  'REDDIT',
  'PRODUCT_HUNT',
  'DEV_TO',
  'X',
]
