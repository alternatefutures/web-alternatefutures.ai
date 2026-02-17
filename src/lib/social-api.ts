const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SocialPlatform =
  | 'X'
  | 'BLUESKY'
  | 'MASTODON'
  | 'LINKEDIN'
  | 'REDDIT'
  | 'DISCORD'
  | 'TELEGRAM'
  | 'THREADS'
  | 'INSTAGRAM'
  | 'FACEBOOK'

export type SocialPostStatus =
  | 'PENDING'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'SCHEDULED'
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'CHANGES_REQUESTED'

export type ApprovalStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'

export interface ApprovalHistoryEntry {
  id: string
  action: 'REQUEST' | 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT'
  actor: string
  timestamp: string
  comment: string | null
}

export interface SocialMediaPost {
  id: string
  createdBy: string | null
  blogPostId: string | null
  campaignId: string | null
  platform: SocialPlatform
  postId: string | null
  url: string | null
  content: string
  status: SocialPostStatus
  error: string | null
  scheduledAt: string | null
  publishedAt: string | null
  mediaUrls: string[]
  hashtags: string[]
  threadParts: string[]
  createdAt: string
  approvalStatus: ApprovalStatus
  approvedBy: string | null
  requestedApprovalFrom: string | null
  approvalNote: string | null
  approvalFeedback: string | null
  approvalRequestedAt: string | null
  approvalRespondedAt: string | null
  approvalHistory: ApprovalHistoryEntry[]
  model_used: string | null
}

export interface PlatformCharLimits {
  platform: SocialPlatform
  maxChars: number
  supportsMedia: boolean
  supportsThreads: boolean
  maxMediaCount: number
}

export interface CreateSocialPostInput {
  platform: SocialPlatform
  content: string
  blogPostId?: string
  campaignId?: string
  hashtags?: string[]
  mediaUrls?: string[]
  scheduledAt?: string
  status?: SocialPostStatus
  model_used?: string
}

export interface UpdateSocialPostInput {
  content?: string
  hashtags?: string[]
  mediaUrls?: string[]
  scheduledAt?: string
  status?: SocialPostStatus
  model_used?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PLATFORM_LIMITS: PlatformCharLimits[] = [
  { platform: 'X', maxChars: 280, supportsMedia: true, supportsThreads: true, maxMediaCount: 4 },
  { platform: 'BLUESKY', maxChars: 300, supportsMedia: true, supportsThreads: true, maxMediaCount: 4 },
  { platform: 'MASTODON', maxChars: 500, supportsMedia: true, supportsThreads: true, maxMediaCount: 4 },
  { platform: 'LINKEDIN', maxChars: 3000, supportsMedia: true, supportsThreads: false, maxMediaCount: 9 },
  { platform: 'REDDIT', maxChars: 40000, supportsMedia: true, supportsThreads: false, maxMediaCount: 20 },
  { platform: 'DISCORD', maxChars: 2000, supportsMedia: true, supportsThreads: false, maxMediaCount: 10 },
  { platform: 'TELEGRAM', maxChars: 4096, supportsMedia: true, supportsThreads: false, maxMediaCount: 10 },
  { platform: 'THREADS', maxChars: 500, supportsMedia: true, supportsThreads: true, maxMediaCount: 10 },
  { platform: 'INSTAGRAM', maxChars: 2200, supportsMedia: true, supportsThreads: false, maxMediaCount: 10 },
  { platform: 'FACEBOOK', maxChars: 63206, supportsMedia: true, supportsThreads: false, maxMediaCount: 10 },
]

// ---------------------------------------------------------------------------
// Seed data — used in development when the GraphQL API is unreachable
// ---------------------------------------------------------------------------

const SEED_POSTS: SocialMediaPost[] = [
  {
    id: 'seed-social-1',
    createdBy: 'seed-user-1',
    blogPostId: 'post-1',
    campaignId: 'seed-campaign-1',
    platform: 'X',
    postId: '1234567890',
    url: 'https://x.com/altfutures/status/1234567890',
    content: 'Introducing Alternate Futures -- the decentralized cloud for AI agents, websites, and serverless functions.\n\nDeploy to IPFS, Filecoin, or Arweave with one click.\n\nThe future of hosting is decentralized.',
    status: 'PUBLISHED',
    error: null,
    scheduledAt: null,
    publishedAt: '2026-01-15T10:30:00Z',
    mediaUrls: ['https://placehold.co/1200x630/0026FF/FFFFFF?text=AF+Launch'],
    hashtags: ['#Web3', '#DePIN', '#DecentralizedCloud', '#AIAgents'],
    threadParts: [],
    createdAt: '2026-01-15T10:00:00Z',
    approvalStatus: 'APPROVED',
    approvedBy: 'echo',
    requestedApprovalFrom: 'echo',
    approvalNote: null,
    approvalFeedback: 'Looks great, ship it!',
    approvalRequestedAt: '2026-01-15T09:30:00Z',
    approvalRespondedAt: '2026-01-15T09:45:00Z',
    approvalHistory: [
      { id: 'ah-1a', action: 'REQUEST', actor: 'seed-user-1', timestamp: '2026-01-15T09:30:00Z', comment: null },
      { id: 'ah-1b', action: 'APPROVE', actor: 'echo', timestamp: '2026-01-15T09:45:00Z', comment: 'Looks great, ship it!' },
    ],
    model_used: 'claude-sonnet-4-5',
  },
  {
    id: 'seed-social-2',
    createdBy: 'seed-user-1',
    blogPostId: 'post-1',
    campaignId: 'seed-campaign-1',
    platform: 'LINKEDIN',
    postId: null,
    url: 'https://linkedin.com/feed/12345',
    content: 'Excited to announce Alternate Futures - the decentralized cloud platform designed for AI agents, modern web apps, and serverless functions.\n\nWhy decentralized cloud?\n- 50-80% lower compute costs\n- No single point of failure\n- True data sovereignty\n- Censorship resistant\n\nWe support IPFS, Filecoin, and Arweave for permanent, distributed hosting.\n\nRequest early access: alternatefutures.ai',
    status: 'PUBLISHED',
    error: null,
    scheduledAt: null,
    publishedAt: '2026-01-15T11:00:00Z',
    mediaUrls: [],
    hashtags: ['#Web3', '#CloudComputing', '#AI', '#Startups'],
    threadParts: [],
    createdAt: '2026-01-15T10:30:00Z',
    approvalStatus: 'APPROVED',
    approvedBy: 'echo',
    requestedApprovalFrom: 'echo',
    approvalNote: null,
    approvalFeedback: null,
    approvalRequestedAt: '2026-01-15T10:00:00Z',
    approvalRespondedAt: '2026-01-15T10:15:00Z',
    approvalHistory: [
      { id: 'ah-2a', action: 'REQUEST', actor: 'seed-user-1', timestamp: '2026-01-15T10:00:00Z', comment: null },
      { id: 'ah-2b', action: 'APPROVE', actor: 'echo', timestamp: '2026-01-15T10:15:00Z', comment: null },
    ],
    model_used: 'llama3.3-70b',
  },
  {
    id: 'seed-social-3',
    createdBy: 'seed-user-1',
    blogPostId: null,
    campaignId: 'seed-campaign-3',
    platform: 'X',
    postId: null,
    url: null,
    content: 'Just published: "How to Deploy Your First AI Agent on Decentralized Infrastructure"\n\nFull tutorial with code examples. Deploy in under 2 minutes.\n\nalternatefutures.ai/blog/deploy-first-ai-agent',
    status: 'SCHEDULED',
    error: null,
    scheduledAt: '2026-02-10T15:00:00Z',
    publishedAt: null,
    mediaUrls: [],
    hashtags: ['#AIAgents', '#Tutorial', '#DePIN'],
    threadParts: [],
    createdAt: '2026-02-05T09:00:00Z',
    approvalStatus: 'PENDING',
    approvedBy: null,
    requestedApprovalFrom: 'echo',
    approvalNote: 'Please review the tutorial announcement before it goes live',
    approvalFeedback: null,
    approvalRequestedAt: '2026-02-05T09:15:00Z',
    approvalRespondedAt: null,
    approvalHistory: [
      { id: 'ah-3a', action: 'REQUEST', actor: 'seed-user-1', timestamp: '2026-02-05T09:15:00Z', comment: 'Please review the tutorial announcement before it goes live' },
    ],
    model_used: 'gemma2-9b',
  },
  {
    id: 'seed-social-4',
    createdBy: 'seed-user-1',
    blogPostId: null,
    campaignId: 'seed-campaign-2',
    platform: 'BLUESKY',
    postId: null,
    url: null,
    content: 'Web3 hosting update: Both Fleek and Spheron have pivoted away from hosting.\n\nThis creates a massive opportunity for projects that need decentralized deployment.\n\nWe\'re filling that gap. Thread incoming.',
    status: 'DRAFT',
    error: null,
    scheduledAt: null,
    publishedAt: null,
    mediaUrls: [],
    hashtags: ['#Web3', '#DecentralizedHosting'],
    threadParts: [],
    createdAt: '2026-02-08T14:00:00Z',
    approvalStatus: 'NONE',
    approvedBy: null,
    requestedApprovalFrom: null,
    approvalNote: null,
    approvalFeedback: null,
    approvalRequestedAt: null,
    approvalRespondedAt: null,
    approvalHistory: [],
    model_used: null,
  },
  {
    id: 'seed-social-5',
    createdBy: 'seed-user-1',
    blogPostId: null,
    campaignId: 'seed-campaign-3',
    platform: 'DISCORD',
    postId: null,
    url: null,
    content: 'Hey everyone! We just shipped a new batch of framework deploy guides:\n\n- Next.js deploy guide\n- React SPA deploy guide\n- Astro deploy guide\n\nCheck them out at docs.alternatefutures.ai and let us know what framework you want next!',
    status: 'PUBLISHED',
    error: null,
    scheduledAt: null,
    publishedAt: '2026-02-08T16:00:00Z',
    mediaUrls: [],
    hashtags: [],
    threadParts: [],
    createdAt: '2026-02-08T15:30:00Z',
    approvalStatus: 'CHANGES_REQUESTED',
    approvedBy: null,
    requestedApprovalFrom: 'echo',
    approvalNote: 'Review framework guides announcement',
    approvalFeedback: 'Can we add links to each individual guide?',
    approvalRequestedAt: '2026-02-08T15:00:00Z',
    approvalRespondedAt: '2026-02-08T15:20:00Z',
    approvalHistory: [
      { id: 'ah-5a', action: 'REQUEST', actor: 'seed-user-1', timestamp: '2026-02-08T15:00:00Z', comment: 'Review framework guides announcement' },
      { id: 'ah-5b', action: 'REQUEST_CHANGES', actor: 'echo', timestamp: '2026-02-08T15:20:00Z', comment: 'Can we add links to each individual guide?' },
    ],
    model_used: 'qwen2.5-7b',
  },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// GraphQL queries & mutations
// ---------------------------------------------------------------------------

const SOCIAL_POST_FIELDS = `
  id createdBy blogPostId campaignId platform postId url content status error
  scheduledAt publishedAt mediaUrls hashtags threadParts createdAt
  approvalStatus approvedBy requestedApprovalFrom approvalNote
  approvalFeedback approvalRequestedAt approvalRespondedAt
  approvalHistory { id action actor timestamp comment }
  model_used
`

const SOCIAL_MEDIA_POSTS_QUERY = `
  query SocialMediaPosts($limit: Int, $offset: Int) {
    socialMediaPosts(limit: $limit, offset: $offset) {
      ${SOCIAL_POST_FIELDS}
    }
  }
`

const SOCIAL_MEDIA_POST_BY_ID_QUERY = `
  query SocialMediaPostById($id: ID!) {
    socialMediaPostById(id: $id) {
      ${SOCIAL_POST_FIELDS}
    }
  }
`

const CREATE_SOCIAL_MEDIA_POST_MUTATION = `
  mutation CreateSocialMediaPost($input: CreateSocialMediaPostInput!) {
    createSocialMediaPost(input: $input) {
      ${SOCIAL_POST_FIELDS}
    }
  }
`

const UPDATE_SOCIAL_MEDIA_POST_MUTATION = `
  mutation UpdateSocialMediaPost($id: ID!, $input: UpdateSocialMediaPostInput!) {
    updateSocialMediaPost(id: $id, input: $input) {
      ${SOCIAL_POST_FIELDS}
    }
  }
`

const PUBLISH_SOCIAL_MEDIA_POST_MUTATION = `
  mutation PublishSocialMediaPost($id: ID!) {
    publishSocialMediaPost(id: $id) {
      ${SOCIAL_POST_FIELDS}
    }
  }
`

const DELETE_SOCIAL_MEDIA_POST_MUTATION = `
  mutation DeleteSocialMediaPost($id: ID!) {
    deleteSocialMediaPost(id: $id) { id }
  }
`

// ---------------------------------------------------------------------------
// GraphQL client (authenticated)
// ---------------------------------------------------------------------------

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
// In-memory mock store for dev mode
// ---------------------------------------------------------------------------

let mockPosts = [...SEED_POSTS]

// ---------------------------------------------------------------------------
// CRUD functions
// ---------------------------------------------------------------------------

export async function fetchAllSocialPosts(
  token: string,
  limit = 100,
  offset = 0,
): Promise<SocialMediaPost[]> {
  try {
    const data = await authGraphqlFetch<{ socialMediaPosts: SocialMediaPost[] }>(
      SOCIAL_MEDIA_POSTS_QUERY,
      { limit, offset },
      token,
    )
    return data.socialMediaPosts
  } catch {
    if (useSeedData()) return mockPosts.slice(offset, offset + limit)
    return []
  }
}

export async function fetchSocialPostById(
  token: string,
  id: string,
): Promise<SocialMediaPost | null> {
  try {
    const data = await authGraphqlFetch<{ socialMediaPostById: SocialMediaPost }>(
      SOCIAL_MEDIA_POST_BY_ID_QUERY,
      { id },
      token,
    )
    return data.socialMediaPostById
  } catch {
    if (useSeedData()) return mockPosts.find((p) => p.id === id) || null
    return null
  }
}

export async function createSocialPost(
  token: string,
  input: CreateSocialPostInput,
): Promise<SocialMediaPost> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const post: SocialMediaPost = {
      id: `seed-social-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdBy: 'seed-user-1',
      blogPostId: input.blogPostId || null,
      campaignId: input.campaignId || null,
      platform: input.platform,
      postId: null,
      url: null,
      content: input.content,
      status: input.status || 'DRAFT',
      error: null,
      scheduledAt: input.scheduledAt || null,
      publishedAt: null,
      mediaUrls: input.mediaUrls || [],
      hashtags: input.hashtags || [],
      threadParts: [],
      createdAt: now,
      approvalStatus: 'NONE',
      approvedBy: null,
      requestedApprovalFrom: null,
      approvalNote: null,
      approvalFeedback: null,
      approvalRequestedAt: null,
      approvalRespondedAt: null,
      approvalHistory: [],
      model_used: input.model_used || null,
    }
    mockPosts = [post, ...mockPosts]
    return post
  }

  const data = await authGraphqlFetch<{ createSocialMediaPost: SocialMediaPost }>(
    CREATE_SOCIAL_MEDIA_POST_MUTATION,
    { input },
    token,
  )
  return data.createSocialMediaPost
}

export async function updateSocialPost(
  token: string,
  id: string,
  input: UpdateSocialPostInput,
): Promise<SocialMediaPost> {
  if (useSeedData()) {
    const idx = mockPosts.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Post not found')
    const existing = mockPosts[idx]
    const updated: SocialMediaPost = {
      ...existing,
      content: input.content !== undefined ? input.content : existing.content,
      hashtags: input.hashtags !== undefined ? input.hashtags : existing.hashtags,
      mediaUrls: input.mediaUrls !== undefined ? input.mediaUrls : existing.mediaUrls,
      scheduledAt: input.scheduledAt !== undefined ? input.scheduledAt : existing.scheduledAt,
      status: input.status !== undefined ? input.status : existing.status,
      model_used: input.model_used !== undefined ? input.model_used : existing.model_used,
    }
    mockPosts[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateSocialMediaPost: SocialMediaPost }>(
    UPDATE_SOCIAL_MEDIA_POST_MUTATION,
    { id, input },
    token,
  )
  return data.updateSocialMediaPost
}

export async function publishSocialPost(
  token: string,
  id: string,
): Promise<SocialMediaPost> {
  if (useSeedData()) {
    const idx = mockPosts.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Post not found')
    const existing = mockPosts[idx]
    const updated: SocialMediaPost = {
      ...existing,
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
    }
    mockPosts[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ publishSocialMediaPost: SocialMediaPost }>(
    PUBLISH_SOCIAL_MEDIA_POST_MUTATION,
    { id },
    token,
  )
  return data.publishSocialMediaPost
}

export async function deleteSocialPost(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockPosts = mockPosts.filter((p) => p.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteSocialMediaPost: { id: string } }>(
    DELETE_SOCIAL_MEDIA_POST_MUTATION,
    { id },
    token,
  )
}

// ---------------------------------------------------------------------------
// Calendar integration helpers
// ---------------------------------------------------------------------------

/** Fetch all social posts that have a scheduledAt or publishedAt date (for calendar display). */
export async function fetchScheduledSocialPosts(
  token: string,
): Promise<SocialMediaPost[]> {
  const all = await fetchAllSocialPosts(token, 500, 0)
  return all.filter((p) => p.scheduledAt || p.publishedAt)
}

// ---------------------------------------------------------------------------
// Approval workflow
// ---------------------------------------------------------------------------

export const APPROVERS = [
  { id: 'echo', name: 'Echo', role: 'Communications' },
  { id: 'hana', name: 'Hana', role: 'Visual Design' },
  { id: 'yusuke', name: 'Yusuke', role: 'Design' },
  { id: 'senku', name: 'Senku', role: 'Technical Lead' },
  { id: 'aria', name: 'Aria', role: 'Motion Design' },
] as const

export type ApproverId = (typeof APPROVERS)[number]['id']

export interface RequestApprovalInput {
  approver: ApproverId
  note?: string
}

export interface ApprovalActionInput {
  action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT'
  feedback?: string
}

const REQUEST_APPROVAL_MUTATION = `
  mutation RequestApproval($id: ID!, $input: RequestApprovalInput!) {
    requestApproval(id: $id, input: $input) {
      ${SOCIAL_POST_FIELDS}
    }
  }
`

const RESPOND_APPROVAL_MUTATION = `
  mutation RespondApproval($id: ID!, $input: ApprovalActionInput!) {
    respondApproval(id: $id, input: $input) {
      ${SOCIAL_POST_FIELDS}
    }
  }
`

export async function requestApproval(
  token: string,
  id: string,
  input: RequestApprovalInput,
): Promise<SocialMediaPost> {
  if (useSeedData()) {
    const idx = mockPosts.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Post not found')
    const now = new Date().toISOString()
    const historyEntry: ApprovalHistoryEntry = {
      id: `ah-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      action: 'REQUEST',
      actor: mockPosts[idx].createdBy || 'unknown',
      timestamp: now,
      comment: input.note || null,
    }
    const updated: SocialMediaPost = {
      ...mockPosts[idx],
      status: 'PENDING_APPROVAL',
      approvalStatus: 'PENDING',
      requestedApprovalFrom: input.approver,
      approvalNote: input.note || null,
      approvalFeedback: null,
      approvedBy: null,
      approvalRequestedAt: now,
      approvalRespondedAt: null,
      approvalHistory: [...mockPosts[idx].approvalHistory, historyEntry],
    }
    mockPosts[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ requestApproval: SocialMediaPost }>(
    REQUEST_APPROVAL_MUTATION,
    { id, input },
    token,
  )
  return data.requestApproval
}

export async function respondToApproval(
  token: string,
  id: string,
  input: ApprovalActionInput,
): Promise<SocialMediaPost> {
  if (useSeedData()) {
    const idx = mockPosts.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Post not found')
    const now = new Date().toISOString()

    let newStatus: SocialPostStatus
    let newApprovalStatus: ApprovalStatus
    if (input.action === 'APPROVE') {
      newStatus = 'SCHEDULED'
      newApprovalStatus = 'APPROVED'
    } else if (input.action === 'REQUEST_CHANGES') {
      newStatus = 'CHANGES_REQUESTED'
      newApprovalStatus = 'CHANGES_REQUESTED'
    } else {
      newStatus = 'DRAFT'
      newApprovalStatus = 'REJECTED'
    }

    const historyEntry: ApprovalHistoryEntry = {
      id: `ah-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      action: input.action,
      actor: mockPosts[idx].requestedApprovalFrom || 'unknown',
      timestamp: now,
      comment: input.feedback || null,
    }
    const updated: SocialMediaPost = {
      ...mockPosts[idx],
      status: newStatus,
      approvalStatus: newApprovalStatus,
      approvedBy: input.action === 'APPROVE' ? mockPosts[idx].requestedApprovalFrom : null,
      approvalFeedback: input.feedback || null,
      approvalRespondedAt: now,
      approvalHistory: [...mockPosts[idx].approvalHistory, historyEntry],
    }
    mockPosts[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ respondApproval: SocialMediaPost }>(
    RESPOND_APPROVAL_MUTATION,
    { id, input },
    token,
  )
  return data.respondApproval
}

/** Fetch posts that are pending approval (for the inbox Approvals tab) */
export async function fetchPendingApprovals(
  token: string,
): Promise<SocialMediaPost[]> {
  const all = await fetchAllSocialPosts(token, 500, 0)
  return all.filter(
    (p) => p.approvalStatus === 'PENDING' || p.approvalStatus === 'CHANGES_REQUESTED',
  )
}

// Re-export seed data for use in mock mode
export { SEED_POSTS }
