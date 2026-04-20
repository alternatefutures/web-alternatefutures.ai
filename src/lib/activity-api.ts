const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActivityPlatform =
  | 'DISCORD'
  | 'GITHUB'
  | 'X'
  | 'BLUESKY'
  | 'LINKEDIN'
  | 'MASTODON'
  | 'REDDIT'
  | 'TELEGRAM'
  | 'THREADS'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'WEBSITE'

export type ActivityType =
  | 'post'
  | 'comment'
  | 'reply'
  | 'reaction'
  | 'follow'
  | 'star'
  | 'fork'
  | 'mention'
  | 'deploy'
  | 'signup'

export interface Activity {
  id: string
  personId: string
  platform: ActivityPlatform
  activityType: ActivityType
  content: string
  sourceUrl: string | null
  sourceId: string | null
  metadata: Record<string, unknown>
  timestamp: string
  ingestedAt: string
}

export interface ActivityFeed {
  activities: Activity[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface CreateActivityInput {
  personId: string
  platform: ActivityPlatform
  activityType: ActivityType
  content: string
  sourceUrl?: string
  sourceId?: string
  metadata?: Record<string, unknown>
  timestamp?: string
}

export interface BatchIngestInput {
  activities: CreateActivityInput[]
}

export interface ActivityAggregation {
  key: string
  count: number
  latestTimestamp: string
}

// ---------------------------------------------------------------------------
// Person reference (inline mock — depends on BF-UI-001)
// ---------------------------------------------------------------------------

export interface PersonRef {
  id: string
  name: string
  handle: string
  avatar: { initials: string; color: string }
}

const SEED_PERSONS: PersonRef[] = [
  { id: 'p1', name: 'Alex Rivera', handle: '@arivera', avatar: { initials: 'AR', color: '#BE4200' } },
  { id: 'p2', name: 'Jordan Chen', handle: '@jchen_dev', avatar: { initials: 'JC', color: '#000AFF' } },
  { id: 'p3', name: 'Sam Nakamura', handle: '@sam_naka', avatar: { initials: 'SN', color: '#5C7A6B' } },
  { id: 'p4', name: 'Morgan Blake', handle: '@mblake', avatar: { initials: 'MB', color: '#C9A84C' } },
  { id: 'p5', name: 'Casey Orozco', handle: '@corozco', avatar: { initials: 'CO', color: '#4E8CA8' } },
  { id: 'p6', name: 'Taylor Kim', handle: '@tkim', avatar: { initials: 'TK', color: '#264348' } },
  { id: 'p7', name: 'Riley Voss', handle: '@rvoss', avatar: { initials: 'RV', color: '#7B2D8B' } },
  { id: 'p8', name: 'Quinn Torres', handle: '@qtorres', avatar: { initials: 'QT', color: '#D4460B' } },
  { id: 'p9', name: 'Avery Patel', handle: '@apatel', avatar: { initials: 'AP', color: '#2D8659' } },
  { id: 'p10', name: 'Jamie Luo', handle: '@jluo', avatar: { initials: 'JL', color: '#3D5AFE' } },
]

export function getPersonRef(personId: string): PersonRef | undefined {
  return SEED_PERSONS.find((p) => p.id === personId)
}

export function getAllPersonRefs(): PersonRef[] {
  return SEED_PERSONS
}

// ---------------------------------------------------------------------------
// Seed data — 50+ activities across 10 persons, multiple platforms
// ---------------------------------------------------------------------------

const SEED_ACTIVITIES: Activity[] = [
  // p1 — Alex Rivera (Discord, GitHub, X)
  { id: 'act-001', personId: 'p1', platform: 'DISCORD', activityType: 'comment', content: 'Has anyone tried deploying a Next.js app on AF yet? The IPFS pinning is instant.', sourceUrl: null, sourceId: 'disc-msg-001', metadata: { channel: '#general', server: 'AlternateFutures' }, timestamp: '2026-02-14T18:30:00Z', ingestedAt: '2026-02-14T18:31:00Z' },
  { id: 'act-002', personId: 'p1', platform: 'GITHUB', activityType: 'star', content: 'Starred alternatefutures/web-app', sourceUrl: 'https://github.com/alternatefutures/web-app', sourceId: 'gh-star-001', metadata: { repo: 'alternatefutures/web-app' }, timestamp: '2026-02-14T16:00:00Z', ingestedAt: '2026-02-14T16:01:00Z' },
  { id: 'act-003', personId: 'p1', platform: 'GITHUB', activityType: 'fork', content: 'Forked alternatefutures/template-cloud-next', sourceUrl: 'https://github.com/arivera/template-cloud-next', sourceId: 'gh-fork-001', metadata: { repo: 'alternatefutures/template-cloud-next', forkTo: 'arivera/template-cloud-next' }, timestamp: '2026-02-13T22:00:00Z', ingestedAt: '2026-02-13T22:01:00Z' },
  { id: 'act-004', personId: 'p1', platform: 'X', activityType: 'mention', content: '@altfutures just deployed my portfolio in under a minute. The decentralized hosting future is here.', sourceUrl: 'https://x.com/arivera/status/9876543210', sourceId: 'x-mention-001', metadata: { likes: 42, retweets: 8 }, timestamp: '2026-02-13T14:30:00Z', ingestedAt: '2026-02-13T14:31:00Z' },
  { id: 'act-005', personId: 'p1', platform: 'DISCORD', activityType: 'reaction', content: 'Reacted with :rocket: to announcement post', sourceUrl: null, sourceId: 'disc-react-001', metadata: { channel: '#announcements', emoji: ':rocket:' }, timestamp: '2026-02-12T10:00:00Z', ingestedAt: '2026-02-12T10:01:00Z' },

  // p2 — Jordan Chen (X, LinkedIn, GitHub)
  { id: 'act-006', personId: 'p2', platform: 'X', activityType: 'post', content: 'Thread: Why decentralized hosting matters for AI agents.\n\n1/ Data sovereignty — your agents own their compute.\n2/ Cost — 50-80% less than AWS.\n3/ Resilience — no single point of failure.', sourceUrl: 'https://x.com/jchen_dev/status/1111111111', sourceId: 'x-post-001', metadata: { likes: 128, retweets: 34, impressions: 8900 }, timestamp: '2026-02-14T12:00:00Z', ingestedAt: '2026-02-14T12:01:00Z' },
  { id: 'act-007', personId: 'p2', platform: 'LINKEDIN', activityType: 'post', content: 'Excited to share my deep dive on decentralized cloud economics. AlternateFutures is doing something fundamentally different from the centralized giants.', sourceUrl: 'https://linkedin.com/feed/update/123456', sourceId: 'li-post-001', metadata: { reactions: 89, comments: 12 }, timestamp: '2026-02-14T09:00:00Z', ingestedAt: '2026-02-14T09:01:00Z' },
  { id: 'act-008', personId: 'p2', platform: 'GITHUB', activityType: 'comment', content: 'Great PR! One suggestion — the error handling in the deploy pipeline could use retry logic for transient IPFS gateway failures.', sourceUrl: 'https://github.com/alternatefutures/web-app/pull/42#comment-001', sourceId: 'gh-comment-001', metadata: { repo: 'alternatefutures/web-app', pr: 42 }, timestamp: '2026-02-13T20:00:00Z', ingestedAt: '2026-02-13T20:01:00Z' },
  { id: 'act-009', personId: 'p2', platform: 'GITHUB', activityType: 'star', content: 'Starred alternatefutures/package-cloud-sdk', sourceUrl: 'https://github.com/alternatefutures/package-cloud-sdk', sourceId: 'gh-star-002', metadata: { repo: 'alternatefutures/package-cloud-sdk' }, timestamp: '2026-02-12T15:00:00Z', ingestedAt: '2026-02-12T15:01:00Z' },
  { id: 'act-010', personId: 'p2', platform: 'X', activityType: 'reply', content: '@altfutures When are you adding Arweave permanent storage support? Would be killer for archival projects.', sourceUrl: 'https://x.com/jchen_dev/status/2222222222', sourceId: 'x-reply-001', metadata: { likes: 15, inReplyTo: '1234567890' }, timestamp: '2026-02-11T17:00:00Z', ingestedAt: '2026-02-11T17:01:00Z' },

  // p3 — Sam Nakamura (Discord, Telegram)
  { id: 'act-011', personId: 'p3', platform: 'DISCORD', activityType: 'comment', content: 'The CLI is smooth. Just did `af deploy` and it picked up my astro.config.mts automatically.', sourceUrl: null, sourceId: 'disc-msg-002', metadata: { channel: '#dev-help', server: 'AlternateFutures' }, timestamp: '2026-02-14T20:00:00Z', ingestedAt: '2026-02-14T20:01:00Z' },
  { id: 'act-012', personId: 'p3', platform: 'DISCORD', activityType: 'reply', content: 'That error usually means the IPFS gateway timed out. Try setting PINATA_TIMEOUT=60000 in your .env.', sourceUrl: null, sourceId: 'disc-msg-003', metadata: { channel: '#dev-help', server: 'AlternateFutures', inReplyTo: 'disc-msg-098' }, timestamp: '2026-02-14T15:00:00Z', ingestedAt: '2026-02-14T15:01:00Z' },
  { id: 'act-013', personId: 'p3', platform: 'TELEGRAM', activityType: 'comment', content: 'Anyone in the AF Telegram group interested in a co-working session to build templates?', sourceUrl: null, sourceId: 'tg-msg-001', metadata: { group: 'AF Community' }, timestamp: '2026-02-13T11:00:00Z', ingestedAt: '2026-02-13T11:01:00Z' },
  { id: 'act-014', personId: 'p3', platform: 'DISCORD', activityType: 'reaction', content: 'Reacted with :heart: to deploy guide post', sourceUrl: null, sourceId: 'disc-react-002', metadata: { channel: '#resources', emoji: ':heart:' }, timestamp: '2026-02-12T08:00:00Z', ingestedAt: '2026-02-12T08:01:00Z' },
  { id: 'act-015', personId: 'p3', platform: 'TELEGRAM', activityType: 'reply', content: 'The docs for serverless functions are at docs.alternatefutures.ai/functions. Super clear.', sourceUrl: null, sourceId: 'tg-msg-002', metadata: { group: 'AF Community', inReplyTo: 'tg-msg-090' }, timestamp: '2026-02-11T13:00:00Z', ingestedAt: '2026-02-11T13:01:00Z' },

  // p4 — Morgan Blake (X, Bluesky, LinkedIn)
  { id: 'act-016', personId: 'p4', platform: 'X', activityType: 'mention', content: 'Just compared hosting costs: @altfutures is 60% cheaper than Vercel for my portfolio sites. Not even close.', sourceUrl: 'https://x.com/mblake/status/3333333333', sourceId: 'x-mention-002', metadata: { likes: 67, retweets: 19 }, timestamp: '2026-02-14T11:00:00Z', ingestedAt: '2026-02-14T11:01:00Z' },
  { id: 'act-017', personId: 'p4', platform: 'BLUESKY', activityType: 'post', content: 'Decentralized cloud is hitting its stride. Between IPFS improvements and networks like Akash for compute, the infra is finally mature enough for production workloads.', sourceUrl: 'https://bsky.app/profile/mblake/post/abc123', sourceId: 'bsky-post-001', metadata: { likes: 34, reposts: 8 }, timestamp: '2026-02-13T19:00:00Z', ingestedAt: '2026-02-13T19:01:00Z' },
  { id: 'act-018', personId: 'p4', platform: 'LINKEDIN', activityType: 'comment', content: 'Great analysis. The cost comparison table really drives home how much we overpay for centralized hosting.', sourceUrl: 'https://linkedin.com/feed/update/789012#comment-001', sourceId: 'li-comment-001', metadata: { postAuthor: 'jchen_dev' }, timestamp: '2026-02-13T10:00:00Z', ingestedAt: '2026-02-13T10:01:00Z' },
  { id: 'act-019', personId: 'p4', platform: 'BLUESKY', activityType: 'reply', content: 'Agreed. The IPNS resolution speed is the last bottleneck — once that is <500ms consistently, it is game over for traditional hosting.', sourceUrl: 'https://bsky.app/profile/mblake/post/def456', sourceId: 'bsky-reply-001', metadata: { likes: 12, inReplyTo: 'bsky-post-external-001' }, timestamp: '2026-02-12T14:00:00Z', ingestedAt: '2026-02-12T14:01:00Z' },
  { id: 'act-020', personId: 'p4', platform: 'X', activityType: 'follow', content: 'Followed @altfutures', sourceUrl: null, sourceId: 'x-follow-001', metadata: {}, timestamp: '2026-02-10T08:00:00Z', ingestedAt: '2026-02-10T08:01:00Z' },

  // p5 — Casey Orozco (GitHub, Discord, X, LinkedIn)
  { id: 'act-021', personId: 'p5', platform: 'GITHUB', activityType: 'fork', content: 'Forked alternatefutures/package-cloud-sdk', sourceUrl: 'https://github.com/corozco/package-cloud-sdk', sourceId: 'gh-fork-002', metadata: { repo: 'alternatefutures/package-cloud-sdk', forkTo: 'corozco/package-cloud-sdk' }, timestamp: '2026-02-14T21:00:00Z', ingestedAt: '2026-02-14T21:01:00Z' },
  { id: 'act-022', personId: 'p5', platform: 'GITHUB', activityType: 'comment', content: 'This SDK structure is clean. Would love to see a Python binding too — ML teams would eat it up.', sourceUrl: 'https://github.com/alternatefutures/package-cloud-sdk/issues/15#comment-001', sourceId: 'gh-comment-002', metadata: { repo: 'alternatefutures/package-cloud-sdk', issue: 15 }, timestamp: '2026-02-14T17:00:00Z', ingestedAt: '2026-02-14T17:01:00Z' },
  { id: 'act-023', personId: 'p5', platform: 'DISCORD', activityType: 'comment', content: 'Just shipped my first AI agent deployment using the AF CLI. The Akash integration is *chef kiss*.', sourceUrl: null, sourceId: 'disc-msg-004', metadata: { channel: '#showcase', server: 'AlternateFutures' }, timestamp: '2026-02-14T14:00:00Z', ingestedAt: '2026-02-14T14:01:00Z' },
  { id: 'act-024', personId: 'p5', platform: 'X', activityType: 'post', content: 'Shipped: AI agent running on decentralized compute via @altfutures + Akash.\n\nCost per month: $4.80\nEquivalent on AWS: ~$35\n\nDecentralized cloud is not just cheaper — it is structurally better.', sourceUrl: 'https://x.com/corozco/status/4444444444', sourceId: 'x-post-002', metadata: { likes: 203, retweets: 56, impressions: 15600 }, timestamp: '2026-02-14T13:00:00Z', ingestedAt: '2026-02-14T13:01:00Z' },
  { id: 'act-025', personId: 'p5', platform: 'LINKEDIN', activityType: 'post', content: 'My new guide: "Deploying AI Agents on Decentralized Infrastructure" — covers cost analysis, architecture patterns, and step-by-step deployment with AlternateFutures.', sourceUrl: 'https://linkedin.com/feed/update/555666', sourceId: 'li-post-002', metadata: { reactions: 145, comments: 28 }, timestamp: '2026-02-13T08:00:00Z', ingestedAt: '2026-02-13T08:01:00Z' },
  { id: 'act-026', personId: 'p5', platform: 'GITHUB', activityType: 'star', content: 'Starred alternatefutures/web-docs', sourceUrl: 'https://github.com/alternatefutures/web-docs', sourceId: 'gh-star-003', metadata: { repo: 'alternatefutures/web-docs' }, timestamp: '2026-02-12T09:00:00Z', ingestedAt: '2026-02-12T09:01:00Z' },

  // p6 — Taylor Kim (Telegram)
  { id: 'act-027', personId: 'p6', platform: 'TELEGRAM', activityType: 'comment', content: 'Is the AF testnet open yet? I want to try deploying a bot.', sourceUrl: null, sourceId: 'tg-msg-003', metadata: { group: 'AF Community' }, timestamp: '2026-02-14T06:00:00Z', ingestedAt: '2026-02-14T06:01:00Z' },
  { id: 'act-028', personId: 'p6', platform: 'TELEGRAM', activityType: 'reply', content: 'Thanks for the link! Got it running.', sourceUrl: null, sourceId: 'tg-msg-004', metadata: { group: 'AF Community', inReplyTo: 'tg-msg-003' }, timestamp: '2026-02-14T07:00:00Z', ingestedAt: '2026-02-14T07:01:00Z' },
  { id: 'act-029', personId: 'p6', platform: 'TELEGRAM', activityType: 'reaction', content: 'Reacted with thumbs up to roadmap update', sourceUrl: null, sourceId: 'tg-react-001', metadata: { group: 'AF Community', emoji: '👍' }, timestamp: '2026-02-13T16:00:00Z', ingestedAt: '2026-02-13T16:01:00Z' },

  // p7 — Riley Voss (X, GitHub, Discord)
  { id: 'act-030', personId: 'p7', platform: 'X', activityType: 'post', content: 'Hot take: within 3 years, decentralized hosting will capture 15% of the static site hosting market. Projects like @altfutures are making it seamless.', sourceUrl: 'https://x.com/rvoss/status/5555555555', sourceId: 'x-post-003', metadata: { likes: 89, retweets: 21 }, timestamp: '2026-02-14T10:00:00Z', ingestedAt: '2026-02-14T10:01:00Z' },
  { id: 'act-031', personId: 'p7', platform: 'GITHUB', activityType: 'star', content: 'Starred alternatefutures/template-cloud-astro', sourceUrl: 'https://github.com/alternatefutures/template-cloud-astro', sourceId: 'gh-star-004', metadata: { repo: 'alternatefutures/template-cloud-astro' }, timestamp: '2026-02-13T21:00:00Z', ingestedAt: '2026-02-13T21:01:00Z' },
  { id: 'act-032', personId: 'p7', platform: 'DISCORD', activityType: 'comment', content: 'The Astro template is a great starting point. Added my own custom adapter in about 20 lines.', sourceUrl: null, sourceId: 'disc-msg-005', metadata: { channel: '#templates', server: 'AlternateFutures' }, timestamp: '2026-02-13T18:00:00Z', ingestedAt: '2026-02-13T18:01:00Z' },
  { id: 'act-033', personId: 'p7', platform: 'GITHUB', activityType: 'fork', content: 'Forked alternatefutures/template-cloud-astro', sourceUrl: 'https://github.com/rvoss/template-cloud-astro', sourceId: 'gh-fork-003', metadata: { repo: 'alternatefutures/template-cloud-astro', forkTo: 'rvoss/template-cloud-astro' }, timestamp: '2026-02-13T17:00:00Z', ingestedAt: '2026-02-13T17:01:00Z' },
  { id: 'act-034', personId: 'p7', platform: 'X', activityType: 'follow', content: 'Followed @altfutures', sourceUrl: null, sourceId: 'x-follow-002', metadata: {}, timestamp: '2026-02-12T20:00:00Z', ingestedAt: '2026-02-12T20:01:00Z' },

  // p8 — Quinn Torres (X, Discord, Reddit)
  { id: 'act-035', personId: 'p8', platform: 'REDDIT', activityType: 'post', content: '[Discussion] AlternateFutures vs Railway vs Vercel — cost and feature comparison for indie devs', sourceUrl: 'https://reddit.com/r/webdev/comments/abc123', sourceId: 'reddit-post-001', metadata: { subreddit: 'r/webdev', upvotes: 156, comments: 43 }, timestamp: '2026-02-14T08:00:00Z', ingestedAt: '2026-02-14T08:01:00Z' },
  { id: 'act-036', personId: 'p8', platform: 'X', activityType: 'mention', content: 'Wrote a comparison post on r/webdev about @altfutures vs centralized platforms. TL;DR: decentralized wins on cost, loses on DX maturity (for now).', sourceUrl: 'https://x.com/qtorres/status/6666666666', sourceId: 'x-mention-003', metadata: { likes: 55, retweets: 14 }, timestamp: '2026-02-14T08:30:00Z', ingestedAt: '2026-02-14T08:31:00Z' },
  { id: 'act-037', personId: 'p8', platform: 'DISCORD', activityType: 'comment', content: 'Feature request: can we get a `af status` command that shows deployment health? Right now I have to check the dashboard.', sourceUrl: null, sourceId: 'disc-msg-006', metadata: { channel: '#feature-requests', server: 'AlternateFutures' }, timestamp: '2026-02-13T15:00:00Z', ingestedAt: '2026-02-13T15:01:00Z' },
  { id: 'act-038', personId: 'p8', platform: 'REDDIT', activityType: 'comment', content: 'OP here — to answer the DX question: the CLI is surprisingly good. `af deploy` auto-detects your framework and Just Works.', sourceUrl: 'https://reddit.com/r/webdev/comments/abc123/comment/xyz', sourceId: 'reddit-comment-001', metadata: { subreddit: 'r/webdev', upvotes: 38 }, timestamp: '2026-02-14T10:00:00Z', ingestedAt: '2026-02-14T10:01:00Z' },

  // p9 — Avery Patel (GitHub, X, Discord)
  { id: 'act-039', personId: 'p9', platform: 'GITHUB', activityType: 'star', content: 'Starred alternatefutures/adapter-cloud-next', sourceUrl: 'https://github.com/alternatefutures/adapter-cloud-next', sourceId: 'gh-star-005', metadata: { repo: 'alternatefutures/adapter-cloud-next' }, timestamp: '2026-02-14T19:00:00Z', ingestedAt: '2026-02-14T19:01:00Z' },
  { id: 'act-040', personId: 'p9', platform: 'WEBSITE', activityType: 'deploy', content: 'Deployed site patel-portfolio.af.app to IPFS', sourceUrl: 'https://patel-portfolio.af.app', sourceId: 'deploy-001', metadata: { framework: 'next', storage: 'ipfs', buildTime: '23s', size: '4.2MB' }, timestamp: '2026-02-14T16:00:00Z', ingestedAt: '2026-02-14T16:01:00Z' },
  { id: 'act-041', personId: 'p9', platform: 'WEBSITE', activityType: 'signup', content: 'Signed up for AlternateFutures', sourceUrl: 'https://alternatefutures.ai', sourceId: 'signup-001', metadata: { referrer: 'x.com', plan: 'free' }, timestamp: '2026-02-14T15:00:00Z', ingestedAt: '2026-02-14T15:01:00Z' },
  { id: 'act-042', personId: 'p9', platform: 'X', activityType: 'mention', content: 'Signed up for @altfutures and deployed my first site in 90 seconds. The IPFS workflow is chef-kiss good.', sourceUrl: 'https://x.com/apatel/status/7777777777', sourceId: 'x-mention-004', metadata: { likes: 31, retweets: 7 }, timestamp: '2026-02-14T16:30:00Z', ingestedAt: '2026-02-14T16:31:00Z' },
  { id: 'act-043', personId: 'p9', platform: 'DISCORD', activityType: 'comment', content: 'Joined the server! Excited to start building on AF.', sourceUrl: null, sourceId: 'disc-msg-007', metadata: { channel: '#introductions', server: 'AlternateFutures' }, timestamp: '2026-02-14T15:30:00Z', ingestedAt: '2026-02-14T15:31:00Z' },
  { id: 'act-044', personId: 'p9', platform: 'WEBSITE', activityType: 'deploy', content: 'Redeployed patel-portfolio.af.app with updated content', sourceUrl: 'https://patel-portfolio.af.app', sourceId: 'deploy-002', metadata: { framework: 'next', storage: 'ipfs', buildTime: '18s', size: '4.3MB' }, timestamp: '2026-02-14T22:00:00Z', ingestedAt: '2026-02-14T22:01:00Z' },

  // p10 — Jamie Luo (X, Bluesky, GitHub, Mastodon)
  { id: 'act-045', personId: 'p10', platform: 'X', activityType: 'post', content: 'Web3 hosting comparison (2026):\n\n- AlternateFutures: Active, shipping, great CLI\n- Fleek: Pivoted to infrastructure\n- Spheron: Pivoted to compute\n\nIf you need IPFS hosting, AF is the clear choice right now.', sourceUrl: 'https://x.com/jluo/status/8888888888', sourceId: 'x-post-004', metadata: { likes: 178, retweets: 45, impressions: 12400 }, timestamp: '2026-02-14T07:00:00Z', ingestedAt: '2026-02-14T07:01:00Z' },
  { id: 'act-046', personId: 'p10', platform: 'BLUESKY', activityType: 'post', content: 'Published my guide to deploying Vue apps on decentralized infrastructure. Step by step with the AF CLI.', sourceUrl: 'https://bsky.app/profile/jluo/post/ghi789', sourceId: 'bsky-post-002', metadata: { likes: 22, reposts: 6 }, timestamp: '2026-02-13T12:00:00Z', ingestedAt: '2026-02-13T12:01:00Z' },
  { id: 'act-047', personId: 'p10', platform: 'GITHUB', activityType: 'star', content: 'Starred alternatefutures/template-cloud-vue', sourceUrl: 'https://github.com/alternatefutures/template-cloud-vue', sourceId: 'gh-star-006', metadata: { repo: 'alternatefutures/template-cloud-vue' }, timestamp: '2026-02-13T11:00:00Z', ingestedAt: '2026-02-13T11:01:00Z' },
  { id: 'act-048', personId: 'p10', platform: 'MASTODON', activityType: 'post', content: 'Been testing decentralized hosting alternatives. @altfutures@infosec.exchange has the best DX I have found so far. IPFS + Arweave + serverless in one CLI.', sourceUrl: 'https://mastodon.social/@jluo/109876543210', sourceId: 'masto-post-001', metadata: { favorites: 28, boosts: 9 }, timestamp: '2026-02-12T18:00:00Z', ingestedAt: '2026-02-12T18:01:00Z' },
  { id: 'act-049', personId: 'p10', platform: 'GITHUB', activityType: 'comment', content: 'The Vue template works perfectly. One note — the build output path needs to match the AF deploy target. Added a note in my fork.', sourceUrl: 'https://github.com/alternatefutures/template-cloud-vue/issues/3#comment-001', sourceId: 'gh-comment-003', metadata: { repo: 'alternatefutures/template-cloud-vue', issue: 3 }, timestamp: '2026-02-12T16:00:00Z', ingestedAt: '2026-02-12T16:01:00Z' },
  { id: 'act-050', personId: 'p10', platform: 'X', activityType: 'reply', content: 'Confirmed — the AF CLI v0.8 handles Vue SSR properly now. The earlier issues were fixed in the last release.', sourceUrl: 'https://x.com/jluo/status/9999999999', sourceId: 'x-reply-002', metadata: { likes: 8, inReplyTo: '8888888888' }, timestamp: '2026-02-14T09:00:00Z', ingestedAt: '2026-02-14T09:01:00Z' },

  // Additional activities to push past 50
  { id: 'act-051', personId: 'p2', platform: 'GITHUB', activityType: 'fork', content: 'Forked alternatefutures/web-app', sourceUrl: 'https://github.com/jchen/web-app', sourceId: 'gh-fork-004', metadata: { repo: 'alternatefutures/web-app', forkTo: 'jchen/web-app' }, timestamp: '2026-02-11T10:00:00Z', ingestedAt: '2026-02-11T10:01:00Z' },
  { id: 'act-052', personId: 'p5', platform: 'DISCORD', activityType: 'reply', content: 'You can configure custom domains through the dashboard or via `af domains add`. Both work great.', sourceUrl: null, sourceId: 'disc-msg-008', metadata: { channel: '#dev-help', server: 'AlternateFutures', inReplyTo: 'disc-msg-099' }, timestamp: '2026-02-12T11:00:00Z', ingestedAt: '2026-02-12T11:01:00Z' },
  { id: 'act-053', personId: 'p3', platform: 'DISCORD', activityType: 'comment', content: 'Just used the SDK to build a deploy bot for our team. The API surface is really well-designed.', sourceUrl: null, sourceId: 'disc-msg-009', metadata: { channel: '#showcase', server: 'AlternateFutures' }, timestamp: '2026-02-11T19:00:00Z', ingestedAt: '2026-02-11T19:01:00Z' },
  { id: 'act-054', personId: 'p8', platform: 'X', activityType: 'follow', content: 'Followed @altfutures', sourceUrl: null, sourceId: 'x-follow-003', metadata: {}, timestamp: '2026-02-10T12:00:00Z', ingestedAt: '2026-02-10T12:01:00Z' },
  { id: 'act-055', personId: 'p1', platform: 'WEBSITE', activityType: 'deploy', content: 'Deployed rivera-blog.af.app to Arweave', sourceUrl: 'https://rivera-blog.af.app', sourceId: 'deploy-003', metadata: { framework: 'astro', storage: 'arweave', buildTime: '15s', size: '2.1MB' }, timestamp: '2026-02-14T23:00:00Z', ingestedAt: '2026-02-14T23:01:00Z' },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// GraphQL queries & mutations
// ---------------------------------------------------------------------------

const ACTIVITY_FIELDS = `
  id personId platform activityType content sourceUrl sourceId
  metadata timestamp ingestedAt
`

const ACTIVITIES_QUERY = `
  query Activities($limit: Int, $offset: Int, $personId: String, $platform: String, $activityType: String) {
    activities(limit: $limit, offset: $offset, personId: $personId, platform: $platform, activityType: $activityType) {
      activities {
        ${ACTIVITY_FIELDS}
      }
      total
      limit
      offset
      hasMore
    }
  }
`

const ACTIVITY_BY_ID_QUERY = `
  query ActivityById($id: ID!) {
    activityById(id: $id) {
      ${ACTIVITY_FIELDS}
    }
  }
`

const CREATE_ACTIVITY_MUTATION = `
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) {
      ${ACTIVITY_FIELDS}
    }
  }
`

const BATCH_INGEST_MUTATION = `
  mutation BatchIngestActivities($input: BatchIngestInput!) {
    batchIngestActivities(input: $input) {
      activities {
        ${ACTIVITY_FIELDS}
      }
      total
      limit
      offset
      hasMore
    }
  }
`

const DELETE_ACTIVITY_MUTATION = `
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id) { id }
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

let mockActivities = [...SEED_ACTIVITIES]

// ---------------------------------------------------------------------------
// CRUD functions
// ---------------------------------------------------------------------------

export async function fetchActivities(
  token: string,
  options: {
    limit?: number
    offset?: number
    personId?: string
    platform?: ActivityPlatform
    activityType?: ActivityType
  } = {},
): Promise<ActivityFeed> {
  const { limit = 50, offset = 0, personId, platform, activityType } = options

  try {
    const data = await authGraphqlFetch<{ activities: ActivityFeed }>(
      ACTIVITIES_QUERY,
      { limit, offset, personId, platform, activityType },
      token,
    )
    return data.activities
  } catch {
    if (useSeedData()) {
      let filtered = mockActivities
      if (personId) filtered = filtered.filter((a) => a.personId === personId)
      if (platform) filtered = filtered.filter((a) => a.platform === platform)
      if (activityType) filtered = filtered.filter((a) => a.activityType === activityType)

      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      const sliced = filtered.slice(offset, offset + limit)
      return {
        activities: sliced,
        total: filtered.length,
        limit,
        offset,
        hasMore: offset + limit < filtered.length,
      }
    }
    return { activities: [], total: 0, limit, offset, hasMore: false }
  }
}

export async function fetchActivityById(
  token: string,
  id: string,
): Promise<Activity | null> {
  try {
    const data = await authGraphqlFetch<{ activityById: Activity }>(
      ACTIVITY_BY_ID_QUERY,
      { id },
      token,
    )
    return data.activityById
  } catch {
    if (useSeedData()) return mockActivities.find((a) => a.id === id) || null
    return null
  }
}

export async function createActivity(
  token: string,
  input: CreateActivityInput,
): Promise<Activity> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const activity: Activity = {
      id: `seed-act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      personId: input.personId,
      platform: input.platform,
      activityType: input.activityType,
      content: input.content,
      sourceUrl: input.sourceUrl || null,
      sourceId: input.sourceId || null,
      metadata: input.metadata || {},
      timestamp: input.timestamp || now,
      ingestedAt: now,
    }
    mockActivities = [activity, ...mockActivities]
    return activity
  }

  const data = await authGraphqlFetch<{ createActivity: Activity }>(
    CREATE_ACTIVITY_MUTATION,
    { input },
    token,
  )
  return data.createActivity
}

export async function batchIngestActivities(
  token: string,
  input: BatchIngestInput,
): Promise<ActivityFeed> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const newActivities: Activity[] = input.activities.map((a, i) => ({
      id: `seed-act-batch-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      personId: a.personId,
      platform: a.platform,
      activityType: a.activityType,
      content: a.content,
      sourceUrl: a.sourceUrl || null,
      sourceId: a.sourceId || null,
      metadata: a.metadata || {},
      timestamp: a.timestamp || now,
      ingestedAt: now,
    }))
    mockActivities = [...newActivities, ...mockActivities]
    return {
      activities: newActivities,
      total: mockActivities.length,
      limit: newActivities.length,
      offset: 0,
      hasMore: false,
    }
  }

  const data = await authGraphqlFetch<{ batchIngestActivities: ActivityFeed }>(
    BATCH_INGEST_MUTATION,
    { input },
    token,
  )
  return data.batchIngestActivities
}

export async function deleteActivity(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockActivities = mockActivities.filter((a) => a.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteActivity: { id: string } }>(
    DELETE_ACTIVITY_MUTATION,
    { id },
    token,
  )
}

// ---------------------------------------------------------------------------
// Aggregation functions
// ---------------------------------------------------------------------------

export async function aggregateByPerson(
  token: string,
): Promise<ActivityAggregation[]> {
  const feed = await fetchActivities(token, { limit: 1000 })
  const map = new Map<string, { count: number; latestTimestamp: string }>()

  for (const act of feed.activities) {
    const existing = map.get(act.personId)
    if (!existing) {
      map.set(act.personId, { count: 1, latestTimestamp: act.timestamp })
    } else {
      existing.count++
      if (act.timestamp > existing.latestTimestamp) {
        existing.latestTimestamp = act.timestamp
      }
    }
  }

  return Array.from(map.entries())
    .map(([key, val]) => ({ key, count: val.count, latestTimestamp: val.latestTimestamp }))
    .sort((a, b) => b.count - a.count)
}

export async function aggregateByPlatform(
  token: string,
): Promise<ActivityAggregation[]> {
  const feed = await fetchActivities(token, { limit: 1000 })
  const map = new Map<string, { count: number; latestTimestamp: string }>()

  for (const act of feed.activities) {
    const existing = map.get(act.platform)
    if (!existing) {
      map.set(act.platform, { count: 1, latestTimestamp: act.timestamp })
    } else {
      existing.count++
      if (act.timestamp > existing.latestTimestamp) {
        existing.latestTimestamp = act.timestamp
      }
    }
  }

  return Array.from(map.entries())
    .map(([key, val]) => ({ key, count: val.count, latestTimestamp: val.latestTimestamp }))
    .sort((a, b) => b.count - a.count)
}

export async function aggregateByType(
  token: string,
): Promise<ActivityAggregation[]> {
  const feed = await fetchActivities(token, { limit: 1000 })
  const map = new Map<string, { count: number; latestTimestamp: string }>()

  for (const act of feed.activities) {
    const existing = map.get(act.activityType)
    if (!existing) {
      map.set(act.activityType, { count: 1, latestTimestamp: act.timestamp })
    } else {
      existing.count++
      if (act.timestamp > existing.latestTimestamp) {
        existing.latestTimestamp = act.timestamp
      }
    }
  }

  return Array.from(map.entries())
    .map(([key, val]) => ({ key, count: val.count, latestTimestamp: val.latestTimestamp }))
    .sort((a, b) => b.count - a.count)
}

export async function aggregateByTimePeriod(
  token: string,
  periodDays: 1 | 7 | 30 = 7,
): Promise<ActivityAggregation[]> {
  const feed = await fetchActivities(token, { limit: 1000 })
  const now = Date.now()
  const cutoff = now - periodDays * 24 * 60 * 60 * 1000

  const recent = feed.activities.filter(
    (a) => new Date(a.timestamp).getTime() >= cutoff,
  )

  const map = new Map<string, { count: number; latestTimestamp: string }>()
  for (const act of recent) {
    const dateKey = act.timestamp.split('T')[0]
    const existing = map.get(dateKey)
    if (!existing) {
      map.set(dateKey, { count: 1, latestTimestamp: act.timestamp })
    } else {
      existing.count++
      if (act.timestamp > existing.latestTimestamp) {
        existing.latestTimestamp = act.timestamp
      }
    }
  }

  return Array.from(map.entries())
    .map(([key, val]) => ({ key, count: val.count, latestTimestamp: val.latestTimestamp }))
    .sort((a, b) => a.key.localeCompare(b.key))
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PLATFORM_LABELS: Record<ActivityPlatform, string> = {
  DISCORD: 'Discord',
  GITHUB: 'GitHub',
  X: 'X',
  BLUESKY: 'Bluesky',
  LINKEDIN: 'LinkedIn',
  MASTODON: 'Mastodon',
  REDDIT: 'Reddit',
  TELEGRAM: 'Telegram',
  THREADS: 'Threads',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  WEBSITE: 'Website',
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  post: 'Post',
  comment: 'Comment',
  reply: 'Reply',
  reaction: 'Reaction',
  follow: 'Follow',
  star: 'Star',
  fork: 'Fork',
  mention: 'Mention',
  deploy: 'Deploy',
  signup: 'Signup',
}

export const PLATFORM_COLORS: Record<ActivityPlatform, string> = {
  DISCORD: '#5865F2',
  GITHUB: '#24292e',
  X: '#000000',
  BLUESKY: '#0085FF',
  LINKEDIN: '#0A66C2',
  MASTODON: '#6364FF',
  REDDIT: '#FF5700',
  TELEGRAM: '#26A5E4',
  THREADS: '#000000',
  INSTAGRAM: '#E4405F',
  FACEBOOK: '#1877F2',
  WEBSITE: '#BE4200',
}

export { SEED_ACTIVITIES, SEED_PERSONS }
