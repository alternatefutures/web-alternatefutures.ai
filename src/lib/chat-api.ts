// ---------------------------------------------------------------------------
// BF-XX-008 — Contextual Agent Chat API
// Types, CRUD operations, and seed data for chat conversations.
// Follows the same pattern as social-api.ts / brand-api.ts.
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessageMetadata {
  /** Snapshot of the page context when the message was sent */
  pageContext?: ChatPageContext
  /** If the agent proposed an action, details live here */
  proposedAction?: {
    actionType: string
    description: string
    confirmed: boolean
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  agentId: string | null
  timestamp: string
  metadata?: ChatMessageMetadata
}

export interface ChatPageContext {
  route: string
  pageType: string
  visibleData?: Record<string, unknown>
  selectedItems?: string[]
  activeFilters?: Record<string, unknown>
}

export interface ChatConversation {
  id: string
  pageContext: ChatPageContext
  agentId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

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

  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`)

  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data
}

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------

const SEED_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-seed-dashboard-1',
    pageContext: {
      route: '/admin',
      pageType: 'dashboard',
    },
    agentId: 'strategic-orchestrator',
    messages: [
      {
        id: 'msg-seed-1a',
        role: 'system',
        content:
          'User is viewing the Executive Dashboard with KPI scorecards, OKR progress, and pending approvals.',
        agentId: null,
        timestamp: '2026-02-15T09:00:00Z',
      },
      {
        id: 'msg-seed-1b',
        role: 'user',
        content: 'What needs my attention today?',
        agentId: null,
        timestamp: '2026-02-15T09:00:12Z',
      },
      {
        id: 'msg-seed-1c',
        role: 'agent',
        content:
          'Three items need your attention this morning:\n\n1. **3 pending approvals** — two social posts (X, LinkedIn) and one blog draft are waiting for your review.\n2. **OKR Q1 progress** — "Increase developer signups by 40%" is at 18% with 6 weeks remaining. The Growth team flagged it as at-risk yesterday.\n3. **Budget alert** — Paid Advertising spend is at 87% of the monthly allocation with 15 days left.\n\nWant me to open any of these?',
        agentId: 'strategic-orchestrator',
        timestamp: '2026-02-15T09:00:15Z',
      },
    ],
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-15T09:00:15Z',
  },
  {
    id: 'conv-seed-social-1',
    pageContext: {
      route: '/admin/social',
      pageType: 'social-list',
    },
    agentId: 'content-writer',
    messages: [
      {
        id: 'msg-seed-2a',
        role: 'system',
        content:
          'User is viewing Social Post Management. 24 posts total: 8 published, 5 scheduled, 3 pending approval, 8 drafts.',
        agentId: null,
        timestamp: '2026-02-15T10:30:00Z',
      },
      {
        id: 'msg-seed-2b',
        role: 'user',
        content: 'Draft a thread about our new Akash deployment pipeline.',
        agentId: null,
        timestamp: '2026-02-15T10:30:45Z',
      },
      {
        id: 'msg-seed-2c',
        role: 'agent',
        content:
          'Here\'s a 3-part X thread draft:\n\n**1/3** We just shipped a new deployment pipeline on @akaborsh Network that cuts deploy times by 60%. Here\'s what changed and why it matters for decentralized hosting.\n\n**2/3** The pipeline now auto-selects the optimal provider based on region, GPU availability, and cost. No more manual bidding — our orchestrator handles it.\n\n**3/3** This is live today on AlternateFutures. Deploy your next project on decentralized infra that\'s faster and cheaper than centralized clouds.\n\nWant me to adjust the tone, add hashtags, or create LinkedIn/Bluesky variants?',
        agentId: 'content-writer',
        timestamp: '2026-02-15T10:30:50Z',
      },
    ],
    createdAt: '2026-02-15T10:30:00Z',
    updatedAt: '2026-02-15T10:30:50Z',
  },
  {
    id: 'conv-seed-intel-1',
    pageContext: {
      route: '/admin/intel',
      pageType: 'competitive-overview',
    },
    agentId: 'market-intel',
    messages: [
      {
        id: 'msg-seed-3a',
        role: 'system',
        content:
          'User is viewing the Market Intelligence dashboard. Tracking 6 competitors across pricing, features, and market positioning.',
        agentId: null,
        timestamp: '2026-02-14T14:00:00Z',
      },
      {
        id: 'msg-seed-3b',
        role: 'user',
        content: 'Any pricing changes from competitors this week?',
        agentId: null,
        timestamp: '2026-02-14T14:01:00Z',
      },
      {
        id: 'msg-seed-3c',
        role: 'agent',
        content:
          'One notable change detected this week:\n\n**Render** dropped their Starter plan from $19/mo to $14/mo (effective Feb 12). This undercuts our Pro tier by $5/mo. Their Team plan pricing is unchanged.\n\nNo changes from Vercel, Netlify, Railway, or Fly.io this cycle.\n\nRecommendation: consider a competitive response — either a blog post highlighting our decentralized advantage at similar pricing, or a temporary promotion. Want me to draft a battle card?',
        agentId: 'market-intel',
        timestamp: '2026-02-14T14:01:08Z',
      },
    ],
    createdAt: '2026-02-14T14:00:00Z',
    updatedAt: '2026-02-14T14:01:08Z',
  },
  {
    id: 'conv-seed-brand-1',
    pageContext: {
      route: '/admin/brand',
      pageType: 'brand-overview',
    },
    agentId: 'brand-guardian',
    messages: [
      {
        id: 'msg-seed-4a',
        role: 'system',
        content:
          'User is viewing the Brand Governance dashboard. Current brand health score: 87/100. 2 terminology violations flagged.',
        agentId: null,
        timestamp: '2026-02-15T08:00:00Z',
      },
      {
        id: 'msg-seed-4b',
        role: 'user',
        content: 'What are the terminology violations?',
        agentId: null,
        timestamp: '2026-02-15T08:01:00Z',
      },
      {
        id: 'msg-seed-4c',
        role: 'agent',
        content:
          'Two violations found in recent drafts:\n\n1. **Blog draft "Getting Started with AF"** — uses "serverless functions" instead of our preferred term "edge functions" (line 42). This is a minor voice inconsistency.\n2. **Social post seed-social-7** — uses "cloud hosting" without the "decentralized" qualifier. Our brand guidelines specify always pairing "hosting" with "decentralized" in public-facing copy.\n\nBoth are easy fixes. Want me to auto-correct them, or would you prefer to review first?',
        agentId: 'brand-guardian',
        timestamp: '2026-02-15T08:01:05Z',
      },
    ],
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-02-15T08:01:05Z',
  },
]

let mockConversations = [...SEED_CONVERSATIONS]

// ---------------------------------------------------------------------------
// GraphQL Queries
// ---------------------------------------------------------------------------

const CHAT_MESSAGE_FIELDS = `
  id role content agentId timestamp
  metadata { pageContext { route pageType } }
`

const CHAT_CONVERSATION_FIELDS = `
  id agentId createdAt updatedAt
  pageContext { route pageType }
  messages { ${CHAT_MESSAGE_FIELDS} }
`

const GET_CONVERSATION_QUERY = `
  query ChatConversation($id: ID!) {
    chatConversation(id: $id) { ${CHAT_CONVERSATION_FIELDS} }
  }
`

const GET_CONVERSATIONS_BY_ROUTE_QUERY = `
  query ChatConversationsByRoute($route: String!) {
    chatConversationsByRoute(route: $route) { ${CHAT_CONVERSATION_FIELDS} }
  }
`

const SEND_MESSAGE_MUTATION = `
  mutation SendChatMessage($conversationId: ID!, $content: String!, $role: String!, $agentId: String, $metadata: JSON) {
    sendChatMessage(conversationId: $conversationId, content: $content, role: $role, agentId: $agentId, metadata: $metadata) {
      ${CHAT_MESSAGE_FIELDS}
    }
  }
`

const CREATE_CONVERSATION_MUTATION = `
  mutation CreateChatConversation($agentId: String!, $pageContext: JSON!) {
    createChatConversation(agentId: $agentId, pageContext: $pageContext) {
      ${CHAT_CONVERSATION_FIELDS}
    }
  }
`

// ---------------------------------------------------------------------------
// CRUD Functions
// ---------------------------------------------------------------------------

/**
 * Get a conversation by its ID.
 */
export async function getConversation(
  id: string,
  token: string,
): Promise<ChatConversation | null> {
  try {
    const data = await authGraphqlFetch<{
      chatConversation: ChatConversation
    }>(GET_CONVERSATION_QUERY, { id }, token)
    return data.chatConversation
  } catch {
    if (useSeedData()) {
      return mockConversations.find((c) => c.id === id) ?? null
    }
    return null
  }
}

/**
 * Get all conversations for a given route (page path).
 * Returns the most recent conversation first.
 */
export async function getConversationsByRoute(
  route: string,
  token: string,
): Promise<ChatConversation[]> {
  try {
    const data = await authGraphqlFetch<{
      chatConversationsByRoute: ChatConversation[]
    }>(GET_CONVERSATIONS_BY_ROUTE_QUERY, { route }, token)
    return data.chatConversationsByRoute
  } catch {
    if (useSeedData()) {
      return mockConversations.filter((c) => c.pageContext.route === route)
    }
    return []
  }
}

/**
 * Create a new conversation.
 */
export async function createConversation(
  agentId: string,
  pageContext: ChatPageContext,
  token: string,
): Promise<ChatConversation> {
  try {
    const data = await authGraphqlFetch<{
      createChatConversation: ChatConversation
    }>(CREATE_CONVERSATION_MUTATION, { agentId, pageContext }, token)
    return data.createChatConversation
  } catch {
    // Seed fallback: create in-memory
    const conv: ChatConversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      agentId,
      pageContext,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    if (useSeedData()) {
      mockConversations.unshift(conv)
    }
    return conv
  }
}

/**
 * Send a message to a conversation. Returns the new message.
 * In seed-data mode, also generates a simulated agent response.
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  role: 'user' | 'agent' | 'system',
  agentId: string | null,
  token: string,
  metadata?: ChatMessageMetadata,
): Promise<ChatMessage> {
  try {
    const data = await authGraphqlFetch<{ sendChatMessage: ChatMessage }>(
      SEND_MESSAGE_MUTATION,
      { conversationId, content, role, agentId, metadata },
      token,
    )
    return data.sendChatMessage
  } catch {
    // Seed fallback
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role,
      content,
      agentId,
      timestamp: new Date().toISOString(),
      metadata,
    }
    if (useSeedData()) {
      const conv = mockConversations.find((c) => c.id === conversationId)
      if (conv) {
        conv.messages.push(msg)
        conv.updatedAt = msg.timestamp
      }
    }
    return msg
  }
}

/**
 * Delete a conversation (for cleanup / testing).
 */
export async function deleteConversation(
  id: string,
  token: string,
): Promise<boolean> {
  try {
    await authGraphqlFetch(
      `mutation DeleteChatConversation($id: ID!) { deleteChatConversation(id: $id) }`,
      { id },
      token,
    )
    return true
  } catch {
    if (useSeedData()) {
      mockConversations = mockConversations.filter((c) => c.id !== id)
      return true
    }
    return false
  }
}

// ---------------------------------------------------------------------------
// BF-XX-010 — Chat Context Injection
// ---------------------------------------------------------------------------

/**
 * Build a system message describing the current page context. This is
 * injected as the first message when a conversation opens so the agent
 * has full awareness of what the user is looking at.
 */
export function buildContextSystemMessage(
  pageContext: ChatPageContext,
  agentName: string,
): ChatMessage {
  const parts: string[] = []

  // Describe the page
  const pageName = pageContext.route
    .replace('/admin/', '')
    .replace(/\//g, ' > ')
    .replace(/-/g, ' ')
    || 'dashboard'

  parts.push(`User is viewing: ${pageName} (${pageContext.pageType || 'page'}).`)

  // Include visible data summary if present
  if (pageContext.visibleData && Object.keys(pageContext.visibleData).length > 0) {
    const dataEntries = Object.entries(pageContext.visibleData)
      .slice(0, 10) // cap at 10 fields to keep context concise
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(', ')
    parts.push(`On-screen data: ${dataEntries}.`)
  }

  // Active filters
  if (
    pageContext.activeFilters &&
    Object.keys(pageContext.activeFilters).length > 0
  ) {
    const filters = Object.entries(pageContext.activeFilters)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ')
    parts.push(`Active filters: ${filters}.`)
  }

  // Selected items
  if (pageContext.selectedItems && pageContext.selectedItems.length > 0) {
    parts.push(
      `Selected items: ${pageContext.selectedItems.join(', ')}.`,
    )
  }

  return {
    id: `sys-ctx-${Date.now()}`,
    role: 'system',
    content: parts.join(' '),
    agentId: null,
    timestamp: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Simulated Agent Response (development only)
// ---------------------------------------------------------------------------

/**
 * Generates a contextual placeholder response for development. This will be
 * replaced by the real NATS → agent pipeline in production.
 */
export function generateSimulatedResponse(
  userMessage: string,
  agentId: string,
  agentName: string,
  route: string,
): string {
  const lower = userMessage.toLowerCase()

  // Social / Content context
  if (route.includes('/social') || route.includes('/blog') || route.includes('/content')) {
    if (lower.includes('draft') || lower.includes('compose') || lower.includes('write'))
      return `I'll draft that for you. Which platform should we target first — X, LinkedIn, or Bluesky? I'll adjust tone, length, and hashtags accordingly.`
    if (lower.includes('schedule'))
      return `For optimal engagement, I recommend scheduling during peak hours: X (9-11am EST), LinkedIn (8-10am EST), or Bluesky (11am-1pm EST). Want me to queue this up?`
    if (lower.includes('analytic') || lower.includes('performance'))
      return `I'll pull engagement metrics for your recent posts. The Analytics tab has detailed breakdowns by platform and time period.`
  }

  // Brand context
  if (route.includes('/brand') || route.includes('/assets')) {
    if (lower.includes('compliance') || lower.includes('score'))
      return `I'll run a brand compliance check on the selected items. This evaluates terminology, visual guidelines, voice consistency, and required disclaimers.`
    if (lower.includes('terminolog') || lower.includes('violat'))
      return `Let me scan for terminology violations across recent content. I check against our brand glossary and flag non-standard usage.`
  }

  // Intelligence context
  if (route.includes('/intel') || route.includes('/intelligence')) {
    if (lower.includes('battle card') || lower.includes('comparison'))
      return `I'll generate a battle card with current data: pricing tiers, feature matrix, strengths/weaknesses, and recommended talk tracks. Which competitor should I focus on?`
    if (lower.includes('pricing') || lower.includes('price'))
      return `I'll pull the latest pricing intelligence. I track public pricing pages daily and flag any changes within 24 hours.`
  }

  // Analytics / Growth context
  if (route.includes('/analytics') || route.includes('/growth')) {
    if (lower.includes('funnel') || lower.includes('conversion'))
      return `I'll analyze the funnel metrics. I can break down drop-off rates by stage, identify the biggest bottleneck, and suggest experiments to improve conversion.`
    if (lower.includes('experiment') || lower.includes('test'))
      return `I can propose an A/B test for that. I'll define the hypothesis, success metrics, sample size, and expected runtime. What's the specific area you want to optimize?`
  }

  // Dashboard context
  if (route === '/admin' || route.includes('/dashboard')) {
    if (lower.includes('attention') || lower.includes('priority') || lower.includes('today'))
      return `Let me check across all systems for items requiring your attention. I'll prioritize by urgency and impact.`
    if (lower.includes('report') || lower.includes('summary'))
      return `I'll compile a summary covering: KPI highlights, pending approvals, OKR progress, budget status, and any alerts from the team.`
  }

  // Generic responses
  if (lower.includes('help'))
    return `I'm ${agentName}, here to help with this section of the admin panel. I can see what you're looking at and take actions on your behalf — just describe what you need.`

  if (lower.includes('status') || lower.includes('update'))
    return `Checking the current status across all systems. Everything appears nominal — no critical alerts at this time.`

  return `Understood. I'll work on that using the data visible on your current page. I'll surface results here as they're ready.`
}
