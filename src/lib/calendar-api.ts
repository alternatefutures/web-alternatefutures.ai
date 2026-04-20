const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MarketingEventType =
  | 'BLOG_PUBLISH'
  | 'SOCIAL_POST'
  | 'CAMPAIGN_LAUNCH'
  | 'HACKATHON'
  | 'WEBINAR'
  | 'PRODUCT_LAUNCH'
  | 'PRESS_RELEASE'
  | 'EMAIL_CAMPAIGN'
  | 'COMMUNITY_EVENT'
  | 'MILESTONE'
  | 'OTHER'

export type MarketingEventStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELED'
  | 'POSTPONED'

export type CalendarView = 'month' | 'week' | 'list'

export interface MarketingEvent {
  id: string
  title: string
  description: string | null
  eventType: MarketingEventType
  color: string | null
  startDate: string
  endDate: string | null
  allDay: boolean
  status: MarketingEventStatus
  blogPostId: string | null
  socialMediaPostId: string | null
  metadata: Record<string, unknown> | null
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface CreateCalendarEventInput {
  title: string
  description?: string
  eventType: MarketingEventType
  color?: string
  startDate: string
  endDate?: string
  allDay?: boolean
  status?: MarketingEventStatus
  blogPostId?: string
  socialMediaPostId?: string
  metadata?: Record<string, unknown>
}

export interface UpdateCalendarEventInput {
  title?: string
  description?: string
  eventType?: MarketingEventType
  color?: string
  startDate?: string
  endDate?: string
  allDay?: boolean
  status?: MarketingEventStatus
  blogPostId?: string
  socialMediaPostId?: string
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const EVENT_TYPE_COLORS: Record<MarketingEventType, string> = {
  BLOG_PUBLISH: '#0026FF',
  SOCIAL_POST: '#00BCD4',
  CAMPAIGN_LAUNCH: '#E91E63',
  HACKATHON: '#FFD600',
  WEBINAR: '#9C27B0',
  PRODUCT_LAUNCH: '#FF5722',
  PRESS_RELEASE: '#607D8B',
  EMAIL_CAMPAIGN: '#4CAF50',
  COMMUNITY_EVENT: '#FF9800',
  MILESTONE: '#F44336',
  OTHER: '#9E9E9E',
}

const EVENT_TYPE_LABELS: Record<MarketingEventType, string> = {
  BLOG_PUBLISH: 'Blog Publish',
  SOCIAL_POST: 'Social Post',
  CAMPAIGN_LAUNCH: 'Campaign Launch',
  HACKATHON: 'Hackathon',
  WEBINAR: 'Webinar',
  PRODUCT_LAUNCH: 'Product Launch',
  PRESS_RELEASE: 'Press Release',
  EMAIL_CAMPAIGN: 'Email Campaign',
  COMMUNITY_EVENT: 'Community Event',
  MILESTONE: 'Milestone',
  OTHER: 'Other',
}

// ---------------------------------------------------------------------------
// Seed data — used in development when the GraphQL API is unreachable
// ---------------------------------------------------------------------------

export const SEED_EVENTS: MarketingEvent[] = [
  {
    id: 'seed-event-1',
    title: 'AF Launch Blog Post',
    description:
      'Publish the "Introducing Alternate Futures" blog post and coordinate social media blitz.',
    eventType: 'BLOG_PUBLISH',
    color: '#0026FF',
    startDate: '2026-01-15T10:00:00Z',
    endDate: '2026-01-15T18:00:00Z',
    allDay: false,
    status: 'COMPLETED',
    blogPostId: 'post-1',
    socialMediaPostId: 'social-1',
    metadata: { campaign: 'launch-week' },
    createdById: 'mock-user-1',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-15T18:00:00Z',
  },
  {
    id: 'seed-event-2',
    title: 'AI Agent Tutorial Launch',
    description:
      'Publish tutorial blog post + social media posts about deploying first AI agent.',
    eventType: 'BLOG_PUBLISH',
    color: '#00BCD4',
    startDate: '2026-01-28T14:00:00Z',
    endDate: null,
    allDay: false,
    status: 'COMPLETED',
    blogPostId: 'post-2',
    socialMediaPostId: null,
    metadata: null,
    createdById: 'mock-user-1',
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-01-28T16:00:00Z',
  },
  {
    id: 'seed-event-3',
    title: 'ETHDenver 2026',
    description:
      'Major Ethereum conference. Plan booth, talks, and side events.',
    eventType: 'COMMUNITY_EVENT',
    color: '#9C27B0',
    startDate: '2026-02-23T00:00:00Z',
    endDate: '2026-03-02T00:00:00Z',
    allDay: true,
    status: 'PLANNED',
    blogPostId: null,
    socialMediaPostId: null,
    metadata: { location: 'Denver, CO', budget: 15000 },
    createdById: 'mock-user-1',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'seed-event-4',
    title: 'Web3 Hosting Vacuum Blog Post',
    description:
      'Publish competitive analysis post about the Web3 hosting market gap.',
    eventType: 'BLOG_PUBLISH',
    color: '#0026FF',
    startDate: '2026-02-12T10:00:00Z',
    endDate: null,
    allDay: false,
    status: 'PLANNED',
    blogPostId: 'post-3',
    socialMediaPostId: null,
    metadata: null,
    createdById: 'mock-user-1',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-05T16:30:00Z',
  },
  {
    id: 'seed-event-5',
    title: 'AI Agent Tutorial Social Blast',
    description:
      'Scheduled social media push for the AI agent tutorial across X and Bluesky.',
    eventType: 'SOCIAL_POST',
    color: '#00BCD4',
    startDate: '2026-02-10T15:00:00Z',
    endDate: null,
    allDay: false,
    status: 'PLANNED',
    blogPostId: null,
    socialMediaPostId: 'social-3',
    metadata: null,
    createdById: 'mock-user-1',
    createdAt: '2026-02-05T09:00:00Z',
    updatedAt: '2026-02-05T09:00:00Z',
  },
  {
    id: 'seed-event-6',
    title: 'Q1 Product Roadmap Publish',
    description: 'Finalize and publish Q1 2026 roadmap blog post.',
    eventType: 'BLOG_PUBLISH',
    color: '#0026FF',
    startDate: '2026-02-14T10:00:00Z',
    endDate: null,
    allDay: false,
    status: 'PLANNED',
    blogPostId: 'post-4',
    socialMediaPostId: null,
    metadata: null,
    createdById: 'mock-user-1',
    createdAt: '2026-02-03T09:00:00Z',
    updatedAt: '2026-02-06T14:00:00Z',
  },
  {
    id: 'seed-event-7',
    title: 'Akash Hackathon',
    description:
      'Akash Network hackathon -- submit AF as a deployment target project.',
    eventType: 'HACKATHON',
    color: '#FFD600',
    startDate: '2026-03-10T00:00:00Z',
    endDate: '2026-03-17T00:00:00Z',
    allDay: true,
    status: 'PLANNED',
    blogPostId: null,
    socialMediaPostId: null,
    metadata: { prize_pool: '$50,000', track: 'Infrastructure' },
    createdById: 'mock-user-1',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'seed-event-8',
    title: 'Press Kit Distribution',
    description:
      'Send updated press kit to crypto media outlets (CoinDesk, The Block, Decrypt).',
    eventType: 'PRESS_RELEASE',
    color: '#607D8B',
    startDate: '2026-02-18T09:00:00Z',
    endDate: null,
    allDay: false,
    status: 'PLANNED',
    blogPostId: null,
    socialMediaPostId: null,
    metadata: { outlets: ['CoinDesk', 'The Block', 'Decrypt', 'DL News'] },
    createdById: 'mock-user-1',
    createdAt: '2026-02-07T08:00:00Z',
    updatedAt: '2026-02-07T08:00:00Z',
  },
  {
    id: 'seed-event-9',
    title: 'Enterprise Features Beta Launch',
    description:
      'Internal milestone: ship enterprise features beta to design partners.',
    eventType: 'PRODUCT_LAUNCH',
    color: '#FF5722',
    startDate: '2026-03-31T00:00:00Z',
    endDate: null,
    allDay: true,
    status: 'PLANNED',
    blogPostId: null,
    socialMediaPostId: null,
    metadata: null,
    createdById: 'mock-user-1',
    createdAt: '2026-02-03T09:00:00Z',
    updatedAt: '2026-02-03T09:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useSeedData(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
  )
}

export function getEventTypeColor(type: MarketingEventType): string {
  return EVENT_TYPE_COLORS[type] || '#9E9E9E'
}

export function getEventTypeLabel(type: MarketingEventType): string {
  return EVENT_TYPE_LABELS[type] || type
}

// ---------------------------------------------------------------------------
// GraphQL queries & mutations
// ---------------------------------------------------------------------------

const EVENT_FIELDS = `
  id title description eventType color startDate endDate allDay
  status blogPostId socialMediaPostId metadata
  createdById createdAt updatedAt
`

const ALL_EVENTS_QUERY = `
  query MarketingEvents {
    marketingEvents {
      ${EVENT_FIELDS}
    }
  }
`

const EVENT_BY_ID_QUERY = `
  query MarketingEvent($id: ID!) {
    marketingEvent(id: $id) {
      ${EVENT_FIELDS}
    }
  }
`

const CREATE_EVENT_MUTATION = `
  mutation CreateMarketingEvent($input: CreateMarketingEventInput!) {
    createMarketingEvent(input: $input) {
      ${EVENT_FIELDS}
    }
  }
`

const UPDATE_EVENT_MUTATION = `
  mutation UpdateMarketingEvent($id: ID!, $input: UpdateMarketingEventInput!) {
    updateMarketingEvent(id: $id, input: $input) {
      ${EVENT_FIELDS}
    }
  }
`

const DELETE_EVENT_MUTATION = `
  mutation DeleteMarketingEvent($id: ID!) {
    deleteMarketingEvent(id: $id) { id }
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
// In-memory mock store for dev/seed mode
// ---------------------------------------------------------------------------

let mockEvents = [...SEED_EVENTS]

// ---------------------------------------------------------------------------
// CRUD functions
// ---------------------------------------------------------------------------

export async function fetchAllEvents(
  token: string,
): Promise<MarketingEvent[]> {
  try {
    const data = await authGraphqlFetch<{ marketingEvents: MarketingEvent[] }>(
      ALL_EVENTS_QUERY,
      {},
      token,
    )
    return data.marketingEvents
  } catch {
    if (useSeedData()) return [...mockEvents]
    return []
  }
}

export async function fetchEventById(
  token: string,
  id: string,
): Promise<MarketingEvent | null> {
  try {
    const data = await authGraphqlFetch<{ marketingEvent: MarketingEvent }>(
      EVENT_BY_ID_QUERY,
      { id },
      token,
    )
    return data.marketingEvent
  } catch {
    if (useSeedData()) return mockEvents.find((e) => e.id === id) || null
    return null
  }
}

export async function createCalendarEvent(
  token: string,
  input: CreateCalendarEventInput,
): Promise<MarketingEvent> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const event: MarketingEvent = {
      id: `seed-event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: input.title,
      description: input.description || null,
      eventType: input.eventType,
      color: input.color || getEventTypeColor(input.eventType),
      startDate: input.startDate,
      endDate: input.endDate || null,
      allDay: input.allDay ?? false,
      status: input.status || 'PLANNED',
      blogPostId: input.blogPostId || null,
      socialMediaPostId: input.socialMediaPostId || null,
      metadata: input.metadata || null,
      createdById: 'mock-user-1',
      createdAt: now,
      updatedAt: now,
    }
    mockEvents = [event, ...mockEvents]
    return event
  }

  const data = await authGraphqlFetch<{ createMarketingEvent: MarketingEvent }>(
    CREATE_EVENT_MUTATION,
    { input },
    token,
  )
  return data.createMarketingEvent
}

export async function updateCalendarEvent(
  token: string,
  id: string,
  input: UpdateCalendarEventInput,
): Promise<MarketingEvent> {
  if (useSeedData()) {
    const idx = mockEvents.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('Event not found')
    const existing = mockEvents[idx]
    const updated: MarketingEvent = {
      ...existing,
      ...input,
      color:
        input.color !== undefined
          ? input.color
          : input.eventType
            ? getEventTypeColor(input.eventType)
            : existing.color,
      description:
        input.description !== undefined ? input.description : existing.description,
      endDate: input.endDate !== undefined ? input.endDate : existing.endDate,
      metadata: input.metadata !== undefined ? input.metadata : existing.metadata,
      blogPostId:
        input.blogPostId !== undefined ? input.blogPostId : existing.blogPostId,
      socialMediaPostId:
        input.socialMediaPostId !== undefined
          ? input.socialMediaPostId
          : existing.socialMediaPostId,
      updatedAt: new Date().toISOString(),
    } as MarketingEvent
    mockEvents[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateMarketingEvent: MarketingEvent }>(
    UPDATE_EVENT_MUTATION,
    { id, input },
    token,
  )
  return data.updateMarketingEvent
}

export async function deleteCalendarEvent(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockEvents = mockEvents.filter((e) => e.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteMarketingEvent: { id: string } }>(
    DELETE_EVENT_MUTATION,
    { id },
    token,
  )
}
