const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IdentityPlatform =
  | 'DISCORD'
  | 'X'
  | 'GITHUB'
  | 'BLUESKY'
  | 'MASTODON'
  | 'LINKEDIN'
  | 'REDDIT'
  | 'FARCASTER'
  | 'LENS'
  | 'TELEGRAM'
  | 'EMAIL'
  | 'WALLET'
  | 'CUSTOM'

export type LifecycleStage =
  | 'UNKNOWN'
  | 'IDENTIFIED'
  | 'ENGAGED'
  | 'ACTIVATED'
  | 'CUSTOMER'
  | 'ADVOCATE'
  | 'CHAMPION'

export type OrgType =
  | 'CUSTOMER'
  | 'PROSPECT'
  | 'PARTNER'
  | 'COMPETITOR'
  | 'OTHER'

export type ActivityType =
  | 'MESSAGE'
  | 'MENTION'
  | 'REPLY'
  | 'PR'
  | 'ISSUE'
  | 'STAR'
  | 'COMMENT'
  | 'REACTION'
  | 'EMAIL'
  | 'MEETING'
  | 'EVENT'
  | 'DEPLOY'
  | 'SIGNUP'
  | 'PURCHASE'
  | 'CUSTOM'

export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'CRITICAL'

export type MergeSuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface PersonNote {
  id: string
  content: string
  createdBy: string
  createdAt: string
}

export interface PlatformIdentity {
  id: string
  personId: string
  platform: IdentityPlatform
  handle: string
  platformUserId: string | null
  profileUrl: string | null
  avatarUrl: string | null
  verified: boolean
  followerCount: number | null
  lastActiveAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface PersonActivity {
  id: string
  personId: string
  platformIdentityId: string
  activityType: ActivityType
  platform: IdentityPlatform
  content: string | null
  url: string | null
  sentiment: Sentiment | null
  weight: number
  occurredAt: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface Person {
  id: string
  displayName: string
  primaryEmail: string | null
  avatarUrl: string | null
  bio: string | null
  locationCity: string | null
  locationCountry: string | null
  organizationId: string | null
  lifecycleStage: LifecycleStage
  orbitLevel: number
  loveScore: number
  reachScore: number
  gravityScore: number
  identities: PlatformIdentity[]
  tags: string[]
  notes: PersonNote[]
  firstSeenAt: string
  lastActiveAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Organization {
  id: string
  name: string
  domain: string | null
  logoUrl: string | null
  industry: string | null
  size: string | null
  type: OrgType
  partnerRecordId: string | null
  memberCount: number
  aggregateLoveScore: number
  createdAt: string
  updatedAt: string
}

export interface IdentityMergeSuggestion {
  id: string
  personAId: string
  personBId: string
  personA: Pick<Person, 'id' | 'displayName' | 'avatarUrl' | 'primaryEmail'>
  personB: Pick<Person, 'id' | 'displayName' | 'avatarUrl' | 'primaryEmail'>
  confidence: number
  reason: string
  status: MergeSuggestionStatus
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface IdentityMergeHistory {
  id: string
  survivingPersonId: string
  mergedPersonId: string
  mergedBy: string
  fieldsResolved: Record<string, unknown>
  undoneAt: string | null
  createdAt: string
}

export interface CreatePersonInput {
  displayName: string
  primaryEmail?: string
  avatarUrl?: string
  bio?: string
  locationCity?: string
  locationCountry?: string
  organizationId?: string
  lifecycleStage?: LifecycleStage
  tags?: string[]
}

export interface UpdatePersonInput {
  displayName?: string
  primaryEmail?: string
  avatarUrl?: string
  bio?: string
  locationCity?: string
  locationCountry?: string
  organizationId?: string
  lifecycleStage?: LifecycleStage
  tags?: string[]
}

export interface LinkIdentityInput {
  platform: IdentityPlatform
  handle: string
  platformUserId?: string
  profileUrl?: string
  avatarUrl?: string
  followerCount?: number
}

export interface CreateOrganizationInput {
  name: string
  domain?: string
  logoUrl?: string
  industry?: string
  size?: string
  type?: OrgType
}

export interface UpdateOrganizationInput {
  name?: string
  domain?: string
  logoUrl?: string
  industry?: string
  size?: string
  type?: OrgType
}

export interface PersonSearchParams {
  query?: string
  lifecycleStage?: LifecycleStage
  platform?: IdentityPlatform
  organizationId?: string
  tags?: string[]
  minLoveScore?: number
  minOrbitLevel?: number
  limit?: number
  offset?: number
}

// ---------------------------------------------------------------------------
// Seed data — used in development when the GraphQL API is unreachable
// ---------------------------------------------------------------------------

const SEED_PERSONS: Person[] = [
  {
    id: 'seed-person-1',
    displayName: 'Alice Chen',
    primaryEmail: 'alice@example.com',
    avatarUrl: 'https://placehold.co/100x100/6366F1/FFFFFF?text=AC',
    bio: 'Full-stack developer, Web3 enthusiast. Building on decentralized infra.',
    locationCity: 'San Francisco',
    locationCountry: 'US',
    organizationId: 'seed-org-1',
    lifecycleStage: 'CHAMPION',
    orbitLevel: 1,
    loveScore: 92.5,
    reachScore: 78.0,
    gravityScore: 72.15,
    identities: [
      {
        id: 'seed-ident-1a',
        personId: 'seed-person-1',
        platform: 'GITHUB',
        handle: 'alicechen-dev',
        platformUserId: '12345',
        profileUrl: 'https://github.com/alicechen-dev',
        avatarUrl: null,
        verified: true,
        followerCount: 1240,
        lastActiveAt: '2026-02-14T09:30:00Z',
        metadata: null,
        createdAt: '2025-06-01T00:00:00Z',
      },
      {
        id: 'seed-ident-1b',
        personId: 'seed-person-1',
        platform: 'X',
        handle: '@alicechen_web3',
        platformUserId: '98765',
        profileUrl: 'https://x.com/alicechen_web3',
        avatarUrl: null,
        verified: true,
        followerCount: 3400,
        lastActiveAt: '2026-02-14T11:00:00Z',
        metadata: null,
        createdAt: '2025-06-01T00:00:00Z',
      },
      {
        id: 'seed-ident-1c',
        personId: 'seed-person-1',
        platform: 'DISCORD',
        handle: 'alice#1234',
        platformUserId: '111222333',
        profileUrl: null,
        avatarUrl: null,
        verified: true,
        followerCount: null,
        lastActiveAt: '2026-02-13T22:15:00Z',
        metadata: null,
        createdAt: '2025-07-10T00:00:00Z',
      },
    ],
    tags: ['early-adopter', 'contributor', 'web3-dev'],
    notes: [
      {
        id: 'note-1',
        content: 'Submitted 3 PRs to template repos. Potential ambassador.',
        createdBy: 'senku',
        createdAt: '2026-01-20T10:00:00Z',
      },
    ],
    firstSeenAt: '2025-06-01T00:00:00Z',
    lastActiveAt: '2026-02-14T11:00:00Z',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-02-14T11:00:00Z',
  },
  {
    id: 'seed-person-2',
    displayName: 'Marcus Rivera',
    primaryEmail: 'marcus@devstudio.io',
    avatarUrl: 'https://placehold.co/100x100/EC4899/FFFFFF?text=MR',
    bio: 'DevOps lead at DevStudio. Evaluating decentralized hosting for client projects.',
    locationCity: 'Austin',
    locationCountry: 'US',
    organizationId: 'seed-org-2',
    lifecycleStage: 'ACTIVATED',
    orbitLevel: 2,
    loveScore: 65.0,
    reachScore: 45.0,
    gravityScore: 29.25,
    identities: [
      {
        id: 'seed-ident-2a',
        personId: 'seed-person-2',
        platform: 'GITHUB',
        handle: 'marcusrivera',
        platformUserId: '54321',
        profileUrl: 'https://github.com/marcusrivera',
        avatarUrl: null,
        verified: true,
        followerCount: 890,
        lastActiveAt: '2026-02-12T14:00:00Z',
        metadata: null,
        createdAt: '2025-09-15T00:00:00Z',
      },
      {
        id: 'seed-ident-2b',
        personId: 'seed-person-2',
        platform: 'LINKEDIN',
        handle: 'marcus-rivera-devops',
        platformUserId: null,
        profileUrl: 'https://linkedin.com/in/marcus-rivera-devops',
        avatarUrl: null,
        verified: false,
        followerCount: 2100,
        lastActiveAt: '2026-02-10T08:00:00Z',
        metadata: null,
        createdAt: '2025-10-01T00:00:00Z',
      },
    ],
    tags: ['devops', 'evaluator', 'agency'],
    notes: [],
    firstSeenAt: '2025-09-15T00:00:00Z',
    lastActiveAt: '2026-02-12T14:00:00Z',
    createdAt: '2025-09-15T00:00:00Z',
    updatedAt: '2026-02-12T14:00:00Z',
  },
  {
    id: 'seed-person-3',
    displayName: 'Yuki Tanaka',
    primaryEmail: null,
    avatarUrl: 'https://placehold.co/100x100/10B981/FFFFFF?text=YT',
    bio: null,
    locationCity: 'Tokyo',
    locationCountry: 'JP',
    organizationId: null,
    lifecycleStage: 'ENGAGED',
    orbitLevel: 3,
    loveScore: 38.0,
    reachScore: 120.0,
    gravityScore: 45.6,
    identities: [
      {
        id: 'seed-ident-3a',
        personId: 'seed-person-3',
        platform: 'X',
        handle: '@yukibuilds',
        platformUserId: '77788',
        profileUrl: 'https://x.com/yukibuilds',
        avatarUrl: null,
        verified: true,
        followerCount: 12800,
        lastActiveAt: '2026-02-14T06:00:00Z',
        metadata: null,
        createdAt: '2025-11-20T00:00:00Z',
      },
      {
        id: 'seed-ident-3b',
        personId: 'seed-person-3',
        platform: 'FARCASTER',
        handle: 'yuki.eth',
        platformUserId: '445566',
        profileUrl: 'https://warpcast.com/yuki.eth',
        avatarUrl: null,
        verified: true,
        followerCount: 5600,
        lastActiveAt: '2026-02-13T18:00:00Z',
        metadata: null,
        createdAt: '2025-12-01T00:00:00Z',
      },
    ],
    tags: ['influencer', 'web3-native'],
    notes: [],
    firstSeenAt: '2025-11-20T00:00:00Z',
    lastActiveAt: '2026-02-14T06:00:00Z',
    createdAt: '2025-11-20T00:00:00Z',
    updatedAt: '2026-02-14T06:00:00Z',
  },
  {
    id: 'seed-person-4',
    displayName: 'Sarah O\'Brien',
    primaryEmail: 'sarah@blockhorizon.xyz',
    avatarUrl: 'https://placehold.co/100x100/F59E0B/FFFFFF?text=SO',
    bio: 'Grants lead at BlockHorizon. Interested in infrastructure partnerships.',
    locationCity: 'Dublin',
    locationCountry: 'IE',
    organizationId: 'seed-org-3',
    lifecycleStage: 'IDENTIFIED',
    orbitLevel: 4,
    loveScore: 15.0,
    reachScore: 55.0,
    gravityScore: 8.25,
    identities: [
      {
        id: 'seed-ident-4a',
        personId: 'seed-person-4',
        platform: 'EMAIL',
        handle: 'sarah@blockhorizon.xyz',
        platformUserId: null,
        profileUrl: null,
        avatarUrl: null,
        verified: true,
        followerCount: null,
        lastActiveAt: '2026-02-08T16:00:00Z',
        metadata: null,
        createdAt: '2026-01-05T00:00:00Z',
      },
    ],
    tags: ['partnerships', 'grants'],
    notes: [
      {
        id: 'note-4',
        content: 'Met at ETHDenver. Interested in co-marketing partnership.',
        createdBy: 'echo',
        createdAt: '2026-02-01T12:00:00Z',
      },
    ],
    firstSeenAt: '2026-01-05T00:00:00Z',
    lastActiveAt: '2026-02-08T16:00:00Z',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-02-08T16:00:00Z',
  },
  {
    id: 'seed-person-5',
    displayName: 'Priya Sharma',
    primaryEmail: 'priya@cloudnative.dev',
    avatarUrl: 'https://placehold.co/100x100/8B5CF6/FFFFFF?text=PS',
    bio: 'Cloud infrastructure architect. Migrating workloads to decentralized compute.',
    locationCity: 'Bangalore',
    locationCountry: 'IN',
    organizationId: 'seed-org-2',
    lifecycleStage: 'CUSTOMER',
    orbitLevel: 2,
    loveScore: 71.0,
    reachScore: 35.0,
    gravityScore: 24.85,
    identities: [
      {
        id: 'seed-ident-5a',
        personId: 'seed-person-5',
        platform: 'GITHUB',
        handle: 'priya-infra',
        platformUserId: '33445',
        profileUrl: 'https://github.com/priya-infra',
        avatarUrl: null,
        verified: true,
        followerCount: 620,
        lastActiveAt: '2026-02-14T12:00:00Z',
        metadata: null,
        createdAt: '2025-08-20T00:00:00Z',
      },
      {
        id: 'seed-ident-5b',
        personId: 'seed-person-5',
        platform: 'X',
        handle: '@priya_cloud',
        platformUserId: '55678',
        profileUrl: 'https://x.com/priya_cloud',
        avatarUrl: null,
        verified: true,
        followerCount: 1850,
        lastActiveAt: '2026-02-13T09:00:00Z',
        metadata: null,
        createdAt: '2025-09-01T00:00:00Z',
      },
      {
        id: 'seed-ident-5c',
        personId: 'seed-person-5',
        platform: 'DISCORD',
        handle: 'priya_dev#5678',
        platformUserId: '444555666',
        profileUrl: null,
        avatarUrl: null,
        verified: true,
        followerCount: null,
        lastActiveAt: '2026-02-14T19:00:00Z',
        metadata: null,
        createdAt: '2025-09-15T00:00:00Z',
      },
    ],
    tags: ['cloud-architect', 'paying-customer', 'devops'],
    notes: [
      {
        id: 'note-5',
        content: 'Deployed 12 production services on AF. Excellent feedback on Akash cost savings.',
        createdBy: 'atlas',
        createdAt: '2026-02-01T08:00:00Z',
      },
    ],
    firstSeenAt: '2025-08-20T00:00:00Z',
    lastActiveAt: '2026-02-14T19:00:00Z',
    createdAt: '2025-08-20T00:00:00Z',
    updatedAt: '2026-02-14T19:00:00Z',
  },
  {
    id: 'seed-person-6',
    displayName: 'Liam O\'Connor',
    primaryEmail: 'liam@indie-game.studio',
    avatarUrl: 'https://placehold.co/100x100/EF4444/FFFFFF?text=LO',
    bio: 'Indie game developer. Using decentralized hosting for game asset delivery.',
    locationCity: 'Berlin',
    locationCountry: 'DE',
    organizationId: null,
    lifecycleStage: 'ACTIVATED',
    orbitLevel: 3,
    loveScore: 45.0,
    reachScore: 28.0,
    gravityScore: 12.6,
    identities: [
      {
        id: 'seed-ident-6a',
        personId: 'seed-person-6',
        platform: 'GITHUB',
        handle: 'liam-gamedev',
        platformUserId: '67890',
        profileUrl: 'https://github.com/liam-gamedev',
        avatarUrl: null,
        verified: true,
        followerCount: 340,
        lastActiveAt: '2026-02-12T20:00:00Z',
        metadata: null,
        createdAt: '2025-12-01T00:00:00Z',
      },
      {
        id: 'seed-ident-6b',
        personId: 'seed-person-6',
        platform: 'BLUESKY',
        handle: '@liamgames.bsky.social',
        platformUserId: null,
        profileUrl: 'https://bsky.app/profile/liamgames.bsky.social',
        avatarUrl: null,
        verified: false,
        followerCount: 890,
        lastActiveAt: '2026-02-11T15:00:00Z',
        metadata: null,
        createdAt: '2025-12-10T00:00:00Z',
      },
    ],
    tags: ['indie-gaming', 'ipfs-user', 'berlin'],
    notes: [],
    firstSeenAt: '2025-12-01T00:00:00Z',
    lastActiveAt: '2026-02-12T20:00:00Z',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-12T20:00:00Z',
  },
  {
    id: 'seed-person-7',
    displayName: 'Amara Osei',
    primaryEmail: 'amara@web3collective.org',
    avatarUrl: 'https://placehold.co/100x100/14B8A6/FFFFFF?text=AO',
    bio: 'Web3 community organizer. Runs meetups in Accra and Lagos focused on decentralized infrastructure.',
    locationCity: 'Accra',
    locationCountry: 'GH',
    organizationId: null,
    lifecycleStage: 'ADVOCATE',
    orbitLevel: 2,
    loveScore: 82.0,
    reachScore: 95.0,
    gravityScore: 77.9,
    identities: [
      {
        id: 'seed-ident-7a',
        personId: 'seed-person-7',
        platform: 'X',
        handle: '@amaraweb3',
        platformUserId: '111222',
        profileUrl: 'https://x.com/amaraweb3',
        avatarUrl: null,
        verified: true,
        followerCount: 8200,
        lastActiveAt: '2026-02-14T08:00:00Z',
        metadata: null,
        createdAt: '2025-10-15T00:00:00Z',
      },
      {
        id: 'seed-ident-7b',
        personId: 'seed-person-7',
        platform: 'TELEGRAM',
        handle: 'amara_osei',
        platformUserId: null,
        profileUrl: 'https://t.me/amara_osei',
        avatarUrl: null,
        verified: false,
        followerCount: null,
        lastActiveAt: '2026-02-13T14:00:00Z',
        metadata: null,
        createdAt: '2025-11-01T00:00:00Z',
      },
      {
        id: 'seed-ident-7c',
        personId: 'seed-person-7',
        platform: 'DISCORD',
        handle: 'amara_web3#9012',
        platformUserId: '777888999',
        profileUrl: null,
        avatarUrl: null,
        verified: true,
        followerCount: null,
        lastActiveAt: '2026-02-14T16:00:00Z',
        metadata: null,
        createdAt: '2025-10-20T00:00:00Z',
      },
    ],
    tags: ['community-leader', 'advocate', 'africa', 'meetup-organizer'],
    notes: [
      {
        id: 'note-7',
        content: 'Organized AF demo at Accra Web3 Meetup. 40+ attendees. Great ambassador potential.',
        createdBy: 'echo',
        createdAt: '2026-01-15T10:00:00Z',
      },
    ],
    firstSeenAt: '2025-10-15T00:00:00Z',
    lastActiveAt: '2026-02-14T16:00:00Z',
    createdAt: '2025-10-15T00:00:00Z',
    updatedAt: '2026-02-14T16:00:00Z',
  },
  {
    id: 'seed-person-8',
    displayName: 'Dmitri Volkov',
    primaryEmail: 'dmitri@scaleway.cloud',
    avatarUrl: 'https://placehold.co/100x100/3B82F6/FFFFFF?text=DV',
    bio: 'Solutions architect. Evaluating AF for enterprise decentralized hosting.',
    locationCity: 'Prague',
    locationCountry: 'CZ',
    organizationId: 'seed-org-2',
    lifecycleStage: 'ENGAGED',
    orbitLevel: 3,
    loveScore: 30.0,
    reachScore: 42.0,
    gravityScore: 12.6,
    identities: [
      {
        id: 'seed-ident-8a',
        personId: 'seed-person-8',
        platform: 'LINKEDIN',
        handle: 'dmitri-volkov-architect',
        platformUserId: null,
        profileUrl: 'https://linkedin.com/in/dmitri-volkov-architect',
        avatarUrl: null,
        verified: false,
        followerCount: 4500,
        lastActiveAt: '2026-02-10T11:00:00Z',
        metadata: null,
        createdAt: '2026-01-10T00:00:00Z',
      },
      {
        id: 'seed-ident-8b',
        personId: 'seed-person-8',
        platform: 'GITHUB',
        handle: 'dvolkov',
        platformUserId: '88899',
        profileUrl: 'https://github.com/dvolkov',
        avatarUrl: null,
        verified: true,
        followerCount: 290,
        lastActiveAt: '2026-02-09T16:00:00Z',
        metadata: null,
        createdAt: '2026-01-10T00:00:00Z',
      },
    ],
    tags: ['enterprise', 'evaluator', 'solutions-architect'],
    notes: [],
    firstSeenAt: '2026-01-10T00:00:00Z',
    lastActiveAt: '2026-02-10T11:00:00Z',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
  },
  {
    id: 'seed-person-9',
    displayName: 'Sofia Martinez',
    primaryEmail: 'sofia@defi-builder.xyz',
    avatarUrl: 'https://placehold.co/100x100/F97316/FFFFFF?text=SM',
    bio: 'DeFi protocol engineer. Building on-chain frontends with permanent hosting.',
    locationCity: 'Mexico City',
    locationCountry: 'MX',
    organizationId: null,
    lifecycleStage: 'CUSTOMER',
    orbitLevel: 2,
    loveScore: 68.0,
    reachScore: 52.0,
    gravityScore: 35.36,
    identities: [
      {
        id: 'seed-ident-9a',
        personId: 'seed-person-9',
        platform: 'GITHUB',
        handle: 'sofia-defi',
        platformUserId: '99100',
        profileUrl: 'https://github.com/sofia-defi',
        avatarUrl: null,
        verified: true,
        followerCount: 1100,
        lastActiveAt: '2026-02-14T22:00:00Z',
        metadata: null,
        createdAt: '2025-11-01T00:00:00Z',
      },
      {
        id: 'seed-ident-9b',
        personId: 'seed-person-9',
        platform: 'FARCASTER',
        handle: 'sofia.eth',
        platformUserId: '778899',
        profileUrl: 'https://warpcast.com/sofia.eth',
        avatarUrl: null,
        verified: true,
        followerCount: 3200,
        lastActiveAt: '2026-02-14T18:00:00Z',
        metadata: null,
        createdAt: '2025-11-10T00:00:00Z',
      },
      {
        id: 'seed-ident-9c',
        personId: 'seed-person-9',
        platform: 'WALLET',
        handle: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
        platformUserId: null,
        profileUrl: null,
        avatarUrl: null,
        verified: true,
        followerCount: null,
        lastActiveAt: '2026-02-14T20:00:00Z',
        metadata: { chain: 'ethereum', ens: 'sofia.eth' },
        createdAt: '2025-11-01T00:00:00Z',
      },
    ],
    tags: ['defi', 'web3-native', 'paying-customer', 'arweave-user'],
    notes: [
      {
        id: 'note-9',
        content: 'Deployed 3 DeFi frontends on Arweave via AF. Wrote a positive thread about the experience.',
        createdBy: 'senku',
        createdAt: '2026-02-10T14:00:00Z',
      },
    ],
    firstSeenAt: '2025-11-01T00:00:00Z',
    lastActiveAt: '2026-02-14T22:00:00Z',
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-02-14T22:00:00Z',
  },
  {
    id: 'seed-person-10',
    displayName: 'James Wright',
    primaryEmail: 'james@lowcode.app',
    avatarUrl: 'https://placehold.co/100x100/6366F1/FFFFFF?text=JW',
    bio: 'Low-code platform founder. Exploring decentralized hosting for customer apps.',
    locationCity: 'London',
    locationCountry: 'GB',
    organizationId: null,
    lifecycleStage: 'IDENTIFIED',
    orbitLevel: 4,
    loveScore: 12.0,
    reachScore: 68.0,
    gravityScore: 8.16,
    identities: [
      {
        id: 'seed-ident-10a',
        personId: 'seed-person-10',
        platform: 'X',
        handle: '@jameswright_lc',
        platformUserId: '334455',
        profileUrl: 'https://x.com/jameswright_lc',
        avatarUrl: null,
        verified: false,
        followerCount: 5600,
        lastActiveAt: '2026-02-13T10:00:00Z',
        metadata: null,
        createdAt: '2026-02-01T00:00:00Z',
      },
      {
        id: 'seed-ident-10b',
        personId: 'seed-person-10',
        platform: 'REDDIT',
        handle: 'u/jameswright_dev',
        platformUserId: null,
        profileUrl: 'https://reddit.com/u/jameswright_dev',
        avatarUrl: null,
        verified: false,
        followerCount: null,
        lastActiveAt: '2026-02-11T20:00:00Z',
        metadata: null,
        createdAt: '2026-02-05T00:00:00Z',
      },
      {
        id: 'seed-ident-10c',
        personId: 'seed-person-10',
        platform: 'MASTODON',
        handle: '@james@mastodon.social',
        platformUserId: null,
        profileUrl: 'https://mastodon.social/@james',
        avatarUrl: null,
        verified: false,
        followerCount: 920,
        lastActiveAt: '2026-02-12T14:00:00Z',
        metadata: null,
        createdAt: '2026-02-05T00:00:00Z',
      },
    ],
    tags: ['low-code', 'founder', 'prospect'],
    notes: [],
    firstSeenAt: '2026-02-01T00:00:00Z',
    lastActiveAt: '2026-02-13T10:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-13T10:00:00Z',
  },
]

const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: 'seed-org-1',
    name: 'Independent',
    domain: null,
    logoUrl: null,
    industry: 'Technology',
    size: '1',
    type: 'OTHER',
    partnerRecordId: null,
    memberCount: 1,
    aggregateLoveScore: 92.5,
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'seed-org-2',
    name: 'DevStudio',
    domain: 'devstudio.io',
    logoUrl: 'https://placehold.co/40x40/3B82F6/FFFFFF?text=DS',
    industry: 'Software Development',
    size: '11-50',
    type: 'PROSPECT',
    partnerRecordId: null,
    memberCount: 1,
    aggregateLoveScore: 65.0,
    createdAt: '2025-09-15T00:00:00Z',
    updatedAt: '2025-09-15T00:00:00Z',
  },
  {
    id: 'seed-org-3',
    name: 'BlockHorizon',
    domain: 'blockhorizon.xyz',
    logoUrl: 'https://placehold.co/40x40/8B5CF6/FFFFFF?text=BH',
    industry: 'Blockchain',
    size: '51-200',
    type: 'PARTNER',
    partnerRecordId: 'seed-partner-1',
    memberCount: 1,
    aggregateLoveScore: 15.0,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
]

const SEED_ACTIVITIES: PersonActivity[] = [
  {
    id: 'seed-activity-1',
    personId: 'seed-person-1',
    platformIdentityId: 'seed-ident-1a',
    activityType: 'PR',
    platform: 'GITHUB',
    content: 'Opened PR #42: Add Astro template with IPFS deployment',
    url: 'https://github.com/alternatefutures/template-cloud-astro/pull/42',
    sentiment: 'POSITIVE',
    weight: 5.0,
    occurredAt: '2026-02-13T10:00:00Z',
    metadata: null,
    createdAt: '2026-02-13T10:00:00Z',
  },
  {
    id: 'seed-activity-2',
    personId: 'seed-person-1',
    platformIdentityId: 'seed-ident-1b',
    activityType: 'MENTION',
    platform: 'X',
    content: 'Just deployed my first AI agent on @AltFutures -- the DX is incredible compared to centralized alternatives.',
    url: 'https://x.com/alicechen_web3/status/123456789',
    sentiment: 'POSITIVE',
    weight: 3.0,
    occurredAt: '2026-02-14T11:00:00Z',
    metadata: null,
    createdAt: '2026-02-14T11:00:00Z',
  },
  {
    id: 'seed-activity-3',
    personId: 'seed-person-3',
    platformIdentityId: 'seed-ident-3a',
    activityType: 'MENTION',
    platform: 'X',
    content: 'Thread: Comparing decentralized cloud platforms in 2026. @AltFutures stands out for IPFS + Arweave support.',
    url: 'https://x.com/yukibuilds/status/987654321',
    sentiment: 'POSITIVE',
    weight: 4.0,
    occurredAt: '2026-02-12T06:30:00Z',
    metadata: null,
    createdAt: '2026-02-12T06:30:00Z',
  },
  {
    id: 'seed-activity-4',
    personId: 'seed-person-2',
    platformIdentityId: 'seed-ident-2a',
    activityType: 'STAR',
    platform: 'GITHUB',
    content: 'Starred alternatefutures/service-cloud-api',
    url: 'https://github.com/alternatefutures/service-cloud-api',
    sentiment: 'POSITIVE',
    weight: 1.0,
    occurredAt: '2026-02-10T15:00:00Z',
    metadata: null,
    createdAt: '2026-02-10T15:00:00Z',
  },
  {
    id: 'seed-activity-5',
    personId: 'seed-person-4',
    platformIdentityId: 'seed-ident-4a',
    activityType: 'EMAIL',
    platform: 'EMAIL',
    content: 'Re: Partnership inquiry -- Would love to explore co-marketing opportunities.',
    url: null,
    sentiment: 'POSITIVE',
    weight: 2.0,
    occurredAt: '2026-02-08T16:00:00Z',
    metadata: null,
    createdAt: '2026-02-08T16:00:00Z',
  },
  {
    id: 'seed-activity-6',
    personId: 'seed-person-5',
    platformIdentityId: 'seed-ident-5a',
    activityType: 'DEPLOY',
    platform: 'GITHUB',
    content: 'Deployed production microservice: user-auth-gateway',
    url: null,
    sentiment: 'POSITIVE',
    weight: 4.0,
    occurredAt: '2026-02-14T12:00:00Z',
    metadata: { service: 'user-auth-gateway', storage: 'IPFS' },
    createdAt: '2026-02-14T12:00:00Z',
  },
  {
    id: 'seed-activity-7',
    personId: 'seed-person-7',
    platformIdentityId: 'seed-ident-7a',
    activityType: 'MENTION',
    platform: 'X',
    content: 'Just hosted an @AltFutures demo at Accra Web3 Meetup. 40+ developers showed up! The IPFS deploy flow blew everyone away.',
    url: 'https://x.com/amaraweb3/status/445566778',
    sentiment: 'POSITIVE',
    weight: 5.0,
    occurredAt: '2026-01-15T20:00:00Z',
    metadata: null,
    createdAt: '2026-01-15T20:00:00Z',
  },
  {
    id: 'seed-activity-8',
    personId: 'seed-person-9',
    platformIdentityId: 'seed-ident-9a',
    activityType: 'PR',
    platform: 'GITHUB',
    content: 'Opened PR #18: Fix Arweave upload retry logic for large bundles',
    url: 'https://github.com/alternatefutures/service-cloud-api/pull/18',
    sentiment: 'POSITIVE',
    weight: 5.0,
    occurredAt: '2026-02-14T22:00:00Z',
    metadata: null,
    createdAt: '2026-02-14T22:00:00Z',
  },
  {
    id: 'seed-activity-9',
    personId: 'seed-person-6',
    platformIdentityId: 'seed-ident-6b',
    activityType: 'MENTION',
    platform: 'BLUESKY',
    content: 'Interesting use case: hosting game assets on IPFS via @alternatefutures. CDN costs dropped to basically zero.',
    url: 'https://bsky.app/profile/liamgames.bsky.social/post/abcdef',
    sentiment: 'POSITIVE',
    weight: 3.0,
    occurredAt: '2026-02-11T15:00:00Z',
    metadata: null,
    createdAt: '2026-02-11T15:00:00Z',
  },
  {
    id: 'seed-activity-10',
    personId: 'seed-person-10',
    platformIdentityId: 'seed-ident-10b',
    activityType: 'COMMENT',
    platform: 'REDDIT',
    content: 'Has anyone tried AlternateFutures for hosting low-code app builds? Curious about the Arweave permanence angle.',
    url: 'https://reddit.com/r/webdev/comments/xyz/decentralized_hosting',
    sentiment: 'NEUTRAL',
    weight: 2.0,
    occurredAt: '2026-02-11T20:00:00Z',
    metadata: null,
    createdAt: '2026-02-11T20:00:00Z',
  },
  {
    id: 'seed-activity-11',
    personId: 'seed-person-8',
    platformIdentityId: 'seed-ident-8a',
    activityType: 'COMMENT',
    platform: 'LINKEDIN',
    content: 'Interesting approach to decentralized hosting. Would love to see enterprise SLA guarantees and SOC 2 compliance.',
    url: 'https://linkedin.com/feed/update/urn:li:activity:123456789',
    sentiment: 'NEUTRAL',
    weight: 2.0,
    occurredAt: '2026-02-10T11:00:00Z',
    metadata: null,
    createdAt: '2026-02-10T11:00:00Z',
  },
]

const SEED_MERGE_SUGGESTIONS: IdentityMergeSuggestion[] = [
  {
    id: 'seed-merge-1',
    personAId: 'seed-person-3',
    personBId: 'seed-person-1',
    personA: {
      id: 'seed-person-3',
      displayName: 'Yuki Tanaka',
      avatarUrl: 'https://placehold.co/100x100/10B981/FFFFFF?text=YT',
      primaryEmail: null,
    },
    personB: {
      id: 'seed-person-1',
      displayName: 'Alice Chen',
      avatarUrl: 'https://placehold.co/100x100/6366F1/FFFFFF?text=AC',
      primaryEmail: 'alice@example.com',
    },
    confidence: 0.35,
    reason: 'Both interacted in the same GitHub issue thread and share similar tags.',
    status: 'PENDING',
    reviewedBy: null,
    reviewedAt: null,
    createdAt: '2026-02-14T00:00:00Z',
  },
]

function useSeedData(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
  )
}

// ---------------------------------------------------------------------------
// GraphQL queries & mutations
// ---------------------------------------------------------------------------

const PERSON_FIELDS = `
  id displayName primaryEmail avatarUrl bio locationCity locationCountry
  organizationId lifecycleStage orbitLevel loveScore reachScore gravityScore
  tags firstSeenAt lastActiveAt createdAt updatedAt
  identities {
    id personId platform handle platformUserId profileUrl avatarUrl
    verified followerCount lastActiveAt createdAt
  }
  notes { id content createdBy createdAt }
`

const ORGANIZATION_FIELDS = `
  id name domain logoUrl industry size type partnerRecordId
  memberCount aggregateLoveScore createdAt updatedAt
`

const ACTIVITY_FIELDS = `
  id personId platformIdentityId activityType platform content url
  sentiment weight occurredAt createdAt
`

const MERGE_SUGGESTION_FIELDS = `
  id personAId personBId confidence reason status reviewedBy reviewedAt createdAt
  personA { id displayName avatarUrl primaryEmail }
  personB { id displayName avatarUrl primaryEmail }
`

const PERSONS_QUERY = `
  query Persons($limit: Int, $offset: Int, $query: String, $lifecycleStage: LifecycleStage, $platform: IdentityPlatform, $organizationId: ID, $tags: [String!], $minLoveScore: Float, $minOrbitLevel: Int) {
    persons(limit: $limit, offset: $offset, query: $query, lifecycleStage: $lifecycleStage, platform: $platform, organizationId: $organizationId, tags: $tags, minLoveScore: $minLoveScore, minOrbitLevel: $minOrbitLevel) {
      ${PERSON_FIELDS}
    }
  }
`

const PERSON_BY_ID_QUERY = `
  query PersonById($id: ID!) {
    personById(id: $id) {
      ${PERSON_FIELDS}
    }
  }
`

const CREATE_PERSON_MUTATION = `
  mutation CreatePerson($input: CreatePersonInput!) {
    createPerson(input: $input) {
      ${PERSON_FIELDS}
    }
  }
`

const UPDATE_PERSON_MUTATION = `
  mutation UpdatePerson($id: ID!, $input: UpdatePersonInput!) {
    updatePerson(id: $id, input: $input) {
      ${PERSON_FIELDS}
    }
  }
`

const DELETE_PERSON_MUTATION = `
  mutation DeletePerson($id: ID!) {
    deletePerson(id: $id) { id }
  }
`

const LINK_IDENTITY_MUTATION = `
  mutation LinkIdentity($personId: ID!, $input: LinkIdentityInput!) {
    linkIdentity(personId: $personId, input: $input) {
      id personId platform handle platformUserId profileUrl avatarUrl
      verified followerCount lastActiveAt createdAt
    }
  }
`

const UNLINK_IDENTITY_MUTATION = `
  mutation UnlinkIdentity($personId: ID!, $identityId: ID!) {
    unlinkIdentity(personId: $personId, identityId: $identityId) { id }
  }
`

const PERSON_TIMELINE_QUERY = `
  query PersonTimeline($personId: ID!, $limit: Int, $offset: Int) {
    personTimeline(personId: $personId, limit: $limit, offset: $offset) {
      ${ACTIVITY_FIELDS}
    }
  }
`

const MERGE_PERSONS_MUTATION = `
  mutation MergePersons($survivingId: ID!, $mergedId: ID!) {
    mergePersons(survivingId: $survivingId, mergedId: $mergedId) {
      ${PERSON_FIELDS}
    }
  }
`

const MERGE_SUGGESTIONS_QUERY = `
  query MergeSuggestions($limit: Int, $offset: Int) {
    identityMergeSuggestions(limit: $limit, offset: $offset) {
      ${MERGE_SUGGESTION_FIELDS}
    }
  }
`

const RESPOND_MERGE_SUGGESTION_MUTATION = `
  mutation RespondMergeSuggestion($id: ID!, $status: MergeSuggestionStatus!) {
    respondMergeSuggestion(id: $id, status: $status) {
      ${MERGE_SUGGESTION_FIELDS}
    }
  }
`

const ORGANIZATIONS_QUERY = `
  query Organizations($limit: Int, $offset: Int) {
    organizations(limit: $limit, offset: $offset) {
      ${ORGANIZATION_FIELDS}
    }
  }
`

const ORGANIZATION_BY_ID_QUERY = `
  query OrganizationById($id: ID!) {
    organizationById(id: $id) {
      ${ORGANIZATION_FIELDS}
    }
  }
`

const CREATE_ORGANIZATION_MUTATION = `
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      ${ORGANIZATION_FIELDS}
    }
  }
`

const UPDATE_ORGANIZATION_MUTATION = `
  mutation UpdateOrganization($id: ID!, $input: UpdateOrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      ${ORGANIZATION_FIELDS}
    }
  }
`

const ADD_PERSON_NOTE_MUTATION = `
  mutation AddPersonNote($personId: ID!, $content: String!) {
    addPersonNote(personId: $personId, content: $content) {
      id content createdBy createdAt
    }
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
// In-memory mock stores for dev mode
// ---------------------------------------------------------------------------

let mockPersons = [...SEED_PERSONS]
let mockOrganizations = [...SEED_ORGANIZATIONS]
let mockActivities = [...SEED_ACTIVITIES]
let mockMergeSuggestions = [...SEED_MERGE_SUGGESTIONS]

// ---------------------------------------------------------------------------
// CRUD functions — Person
// ---------------------------------------------------------------------------

export async function fetchPersons(
  token: string,
  params: PersonSearchParams = {},
): Promise<Person[]> {
  try {
    const data = await authGraphqlFetch<{ persons: Person[] }>(
      PERSONS_QUERY,
      params as unknown as Record<string, unknown>,
      token,
    )
    return data.persons
  } catch {
    if (useSeedData()) {
      let result = [...mockPersons]
      if (params.query) {
        const q = params.query.toLowerCase()
        result = result.filter(
          (p) =>
            p.displayName.toLowerCase().includes(q) ||
            p.primaryEmail?.toLowerCase().includes(q) ||
            p.identities.some((i) => i.handle.toLowerCase().includes(q)),
        )
      }
      if (params.lifecycleStage) {
        result = result.filter((p) => p.lifecycleStage === params.lifecycleStage)
      }
      if (params.platform) {
        result = result.filter((p) =>
          p.identities.some((i) => i.platform === params.platform),
        )
      }
      if (params.organizationId) {
        result = result.filter((p) => p.organizationId === params.organizationId)
      }
      if (params.tags?.length) {
        result = result.filter((p) =>
          params.tags!.some((t) => p.tags.includes(t)),
        )
      }
      if (params.minLoveScore !== undefined) {
        result = result.filter((p) => p.loveScore >= params.minLoveScore!)
      }
      if (params.minOrbitLevel !== undefined) {
        result = result.filter((p) => p.orbitLevel <= params.minOrbitLevel!)
      }
      const offset = params.offset ?? 0
      const limit = params.limit ?? 100
      return result.slice(offset, offset + limit)
    }
    return []
  }
}

export async function fetchPersonById(
  token: string,
  id: string,
): Promise<Person | null> {
  try {
    const data = await authGraphqlFetch<{ personById: Person }>(
      PERSON_BY_ID_QUERY,
      { id },
      token,
    )
    return data.personById
  } catch {
    if (useSeedData()) return mockPersons.find((p) => p.id === id) || null
    return null
  }
}

export async function createPerson(
  token: string,
  input: CreatePersonInput,
): Promise<Person> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const person: Person = {
      id: `seed-person-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      displayName: input.displayName,
      primaryEmail: input.primaryEmail || null,
      avatarUrl: input.avatarUrl || null,
      bio: input.bio || null,
      locationCity: input.locationCity || null,
      locationCountry: input.locationCountry || null,
      organizationId: input.organizationId || null,
      lifecycleStage: input.lifecycleStage || 'UNKNOWN',
      orbitLevel: 4,
      loveScore: 0,
      reachScore: 0,
      gravityScore: 0,
      identities: [],
      tags: input.tags || [],
      notes: [],
      firstSeenAt: now,
      lastActiveAt: null,
      createdAt: now,
      updatedAt: now,
    }
    mockPersons = [person, ...mockPersons]
    return person
  }

  const data = await authGraphqlFetch<{ createPerson: Person }>(
    CREATE_PERSON_MUTATION,
    { input },
    token,
  )
  return data.createPerson
}

export async function updatePerson(
  token: string,
  id: string,
  input: UpdatePersonInput,
): Promise<Person> {
  if (useSeedData()) {
    const idx = mockPersons.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Person not found')
    const existing = mockPersons[idx]
    const updated: Person = {
      ...existing,
      displayName: input.displayName ?? existing.displayName,
      primaryEmail: input.primaryEmail !== undefined ? input.primaryEmail : existing.primaryEmail,
      avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : existing.avatarUrl,
      bio: input.bio !== undefined ? input.bio : existing.bio,
      locationCity: input.locationCity !== undefined ? input.locationCity : existing.locationCity,
      locationCountry: input.locationCountry !== undefined ? input.locationCountry : existing.locationCountry,
      organizationId: input.organizationId !== undefined ? input.organizationId : existing.organizationId,
      lifecycleStage: input.lifecycleStage ?? existing.lifecycleStage,
      tags: input.tags ?? existing.tags,
      updatedAt: new Date().toISOString(),
    }
    mockPersons[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updatePerson: Person }>(
    UPDATE_PERSON_MUTATION,
    { id, input },
    token,
  )
  return data.updatePerson
}

export async function deletePerson(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockPersons = mockPersons.filter((p) => p.id !== id)
    return
  }

  await authGraphqlFetch<{ deletePerson: { id: string } }>(
    DELETE_PERSON_MUTATION,
    { id },
    token,
  )
}

// ---------------------------------------------------------------------------
// Identity linking
// ---------------------------------------------------------------------------

export async function linkIdentity(
  token: string,
  personId: string,
  input: LinkIdentityInput,
): Promise<PlatformIdentity> {
  if (useSeedData()) {
    const idx = mockPersons.findIndex((p) => p.id === personId)
    if (idx === -1) throw new Error('Person not found')
    const identity: PlatformIdentity = {
      id: `seed-ident-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      personId,
      platform: input.platform,
      handle: input.handle,
      platformUserId: input.platformUserId || null,
      profileUrl: input.profileUrl || null,
      avatarUrl: input.avatarUrl || null,
      verified: false,
      followerCount: input.followerCount ?? null,
      lastActiveAt: null,
      metadata: null,
      createdAt: new Date().toISOString(),
    }
    mockPersons[idx] = {
      ...mockPersons[idx],
      identities: [...mockPersons[idx].identities, identity],
      updatedAt: new Date().toISOString(),
    }
    return identity
  }

  const data = await authGraphqlFetch<{ linkIdentity: PlatformIdentity }>(
    LINK_IDENTITY_MUTATION,
    { personId, input },
    token,
  )
  return data.linkIdentity
}

export async function unlinkIdentity(
  token: string,
  personId: string,
  identityId: string,
): Promise<void> {
  if (useSeedData()) {
    const idx = mockPersons.findIndex((p) => p.id === personId)
    if (idx === -1) throw new Error('Person not found')
    mockPersons[idx] = {
      ...mockPersons[idx],
      identities: mockPersons[idx].identities.filter((i) => i.id !== identityId),
      updatedAt: new Date().toISOString(),
    }
    return
  }

  await authGraphqlFetch<{ unlinkIdentity: { id: string } }>(
    UNLINK_IDENTITY_MUTATION,
    { personId, identityId },
    token,
  )
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export async function fetchPersonTimeline(
  token: string,
  personId: string,
  limit = 50,
  offset = 0,
): Promise<PersonActivity[]> {
  try {
    const data = await authGraphqlFetch<{ personTimeline: PersonActivity[] }>(
      PERSON_TIMELINE_QUERY,
      { personId, limit, offset },
      token,
    )
    return data.personTimeline
  } catch {
    if (useSeedData()) {
      return mockActivities
        .filter((a) => a.personId === personId)
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
        .slice(offset, offset + limit)
    }
    return []
  }
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export async function addPersonNote(
  token: string,
  personId: string,
  content: string,
): Promise<PersonNote> {
  if (useSeedData()) {
    const idx = mockPersons.findIndex((p) => p.id === personId)
    if (idx === -1) throw new Error('Person not found')
    const note: PersonNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      content,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
    }
    mockPersons[idx] = {
      ...mockPersons[idx],
      notes: [...mockPersons[idx].notes, note],
      updatedAt: new Date().toISOString(),
    }
    return note
  }

  const data = await authGraphqlFetch<{ addPersonNote: PersonNote }>(
    ADD_PERSON_NOTE_MUTATION,
    { personId, content },
    token,
  )
  return data.addPersonNote
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

export async function mergePersons(
  token: string,
  survivingId: string,
  mergedId: string,
): Promise<Person> {
  if (useSeedData()) {
    const survivingIdx = mockPersons.findIndex((p) => p.id === survivingId)
    const mergedIdx = mockPersons.findIndex((p) => p.id === mergedId)
    if (survivingIdx === -1 || mergedIdx === -1) throw new Error('Person not found')

    const surviving = mockPersons[survivingIdx]
    const merged = mockPersons[mergedIdx]
    const now = new Date().toISOString()

    const result: Person = {
      ...surviving,
      identities: [
        ...surviving.identities,
        ...merged.identities.map((i) => ({ ...i, personId: survivingId })),
      ],
      tags: Array.from(new Set([...surviving.tags, ...merged.tags])),
      notes: [...surviving.notes, ...merged.notes],
      loveScore: surviving.loveScore + merged.loveScore,
      reachScore: Math.max(surviving.reachScore, merged.reachScore),
      gravityScore: (surviving.loveScore + merged.loveScore) * Math.max(surviving.reachScore, merged.reachScore) / 100,
      updatedAt: now,
    }

    mockPersons[survivingIdx] = result
    mockPersons = mockPersons.filter((p) => p.id !== mergedId)
    // Reassign activities
    mockActivities = mockActivities.map((a) =>
      a.personId === mergedId ? { ...a, personId: survivingId } : a,
    )
    return result
  }

  const data = await authGraphqlFetch<{ mergePersons: Person }>(
    MERGE_PERSONS_MUTATION,
    { survivingId, mergedId },
    token,
  )
  return data.mergePersons
}

export async function fetchMergeSuggestions(
  token: string,
  limit = 50,
  offset = 0,
): Promise<IdentityMergeSuggestion[]> {
  try {
    const data = await authGraphqlFetch<{
      identityMergeSuggestions: IdentityMergeSuggestion[]
    }>(MERGE_SUGGESTIONS_QUERY, { limit, offset }, token)
    return data.identityMergeSuggestions
  } catch {
    if (useSeedData()) {
      return mockMergeSuggestions
        .filter((s) => s.status === 'PENDING')
        .slice(offset, offset + limit)
    }
    return []
  }
}

export async function respondToMergeSuggestion(
  token: string,
  id: string,
  status: 'ACCEPTED' | 'REJECTED',
): Promise<IdentityMergeSuggestion> {
  if (useSeedData()) {
    const idx = mockMergeSuggestions.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error('Merge suggestion not found')
    const now = new Date().toISOString()
    const updated: IdentityMergeSuggestion = {
      ...mockMergeSuggestions[idx],
      status,
      reviewedBy: 'current-user',
      reviewedAt: now,
    }
    mockMergeSuggestions[idx] = updated

    if (status === 'ACCEPTED') {
      await mergePersons(token, updated.personAId, updated.personBId)
    }
    return updated
  }

  const data = await authGraphqlFetch<{
    respondMergeSuggestion: IdentityMergeSuggestion
  }>(RESPOND_MERGE_SUGGESTION_MUTATION, { id, status }, token)
  return data.respondMergeSuggestion
}

// ---------------------------------------------------------------------------
// CRUD functions — Organization
// ---------------------------------------------------------------------------

export async function fetchOrganizations(
  token: string,
  limit = 100,
  offset = 0,
): Promise<Organization[]> {
  try {
    const data = await authGraphqlFetch<{ organizations: Organization[] }>(
      ORGANIZATIONS_QUERY,
      { limit, offset },
      token,
    )
    return data.organizations
  } catch {
    if (useSeedData()) return mockOrganizations.slice(offset, offset + limit)
    return []
  }
}

export async function fetchOrganizationById(
  token: string,
  id: string,
): Promise<Organization | null> {
  try {
    const data = await authGraphqlFetch<{ organizationById: Organization }>(
      ORGANIZATION_BY_ID_QUERY,
      { id },
      token,
    )
    return data.organizationById
  } catch {
    if (useSeedData()) return mockOrganizations.find((o) => o.id === id) || null
    return null
  }
}

export async function createOrganization(
  token: string,
  input: CreateOrganizationInput,
): Promise<Organization> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const org: Organization = {
      id: `seed-org-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name,
      domain: input.domain || null,
      logoUrl: input.logoUrl || null,
      industry: input.industry || null,
      size: input.size || null,
      type: input.type || 'OTHER',
      partnerRecordId: null,
      memberCount: 0,
      aggregateLoveScore: 0,
      createdAt: now,
      updatedAt: now,
    }
    mockOrganizations = [org, ...mockOrganizations]
    return org
  }

  const data = await authGraphqlFetch<{ createOrganization: Organization }>(
    CREATE_ORGANIZATION_MUTATION,
    { input },
    token,
  )
  return data.createOrganization
}

export async function updateOrganization(
  token: string,
  id: string,
  input: UpdateOrganizationInput,
): Promise<Organization> {
  if (useSeedData()) {
    const idx = mockOrganizations.findIndex((o) => o.id === id)
    if (idx === -1) throw new Error('Organization not found')
    const existing = mockOrganizations[idx]
    const updated: Organization = {
      ...existing,
      name: input.name ?? existing.name,
      domain: input.domain !== undefined ? input.domain : existing.domain,
      logoUrl: input.logoUrl !== undefined ? input.logoUrl : existing.logoUrl,
      industry: input.industry !== undefined ? input.industry : existing.industry,
      size: input.size !== undefined ? input.size : existing.size,
      type: input.type ?? existing.type,
      updatedAt: new Date().toISOString(),
    }
    mockOrganizations[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateOrganization: Organization }>(
    UPDATE_ORGANIZATION_MUTATION,
    { id, input },
    token,
  )
  return data.updateOrganization
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get all persons in an organization */
export async function fetchOrganizationMembers(
  token: string,
  organizationId: string,
): Promise<Person[]> {
  return fetchPersons(token, { organizationId })
}

/** Get lifecycle stage distribution for dashboard */
export async function fetchLifecycleStageCounts(
  token: string,
): Promise<Record<LifecycleStage, number>> {
  const all = await fetchPersons(token, { limit: 10000 })
  const counts: Record<LifecycleStage, number> = {
    UNKNOWN: 0,
    IDENTIFIED: 0,
    ENGAGED: 0,
    ACTIVATED: 0,
    CUSTOMER: 0,
    ADVOCATE: 0,
    CHAMPION: 0,
  }
  for (const p of all) {
    counts[p.lifecycleStage]++
  }
  return counts
}

// Re-export seed data for use in mock mode
export { SEED_PERSONS, SEED_ORGANIZATIONS, SEED_ACTIVITIES, SEED_MERGE_SUGGESTIONS }
