const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ===========================================================================
// Types
// ===========================================================================

export type CommunityPlatform =
  | 'discord'
  | 'x'
  | 'github'
  | 'bluesky'
  | 'mastodon'
  | 'reddit'

export type MessageType =
  | 'question'
  | 'feedback'
  | 'bug-report'
  | 'feature-request'
  | 'praise'
  | 'general'

export type MessageSentiment = 'positive' | 'neutral' | 'negative'

export type MessagePriority = 'critical' | 'high' | 'medium' | 'low'

export interface CommunityMessage {
  id: string
  platform: CommunityPlatform
  authorId: string
  authorName: string
  authorAvatar: string | null
  content: string
  messageType: MessageType
  sentiment: MessageSentiment
  priority: MessagePriority
  responded: boolean
  responseId: string | null
  sourceUrl: string | null
  receivedAt: string
}

export interface CommunityMetrics {
  platform: CommunityPlatform
  memberCount: number
  activeMembers: number
  messagesPerDay: number
  growthRate: number
  topContributors: {
    name: string
    avatar: string | null
    messageCount: number
  }[]
}

// ===========================================================================
// Message Classification — BF-CM-003
// ===========================================================================

const TYPE_PATTERNS: { type: MessageType; patterns: RegExp[] }[] = [
  {
    type: 'bug-report',
    patterns: [
      /\bbug\b/i, /\bbroken\b/i, /\bcrash(es|ed|ing)?\b/i, /\berror\b/i,
      /\bnot working\b/i, /\bfailing\b/i, /\b500\b/, /\b404\b/,
      /\bdoesn'?t (work|load|respond)\b/i, /\bregression\b/i,
    ],
  },
  {
    type: 'feature-request',
    patterns: [
      /\bfeature request\b/i, /\bwould be (nice|great|cool)\b/i,
      /\bplease add\b/i, /\bcan you (add|support|implement)\b/i,
      /\bwish (list|there was)\b/i, /\bsuggestion\b/i, /\bproposal\b/i,
    ],
  },
  {
    type: 'question',
    patterns: [
      /\bhow (do|can|to)\b/i, /\bwhat (is|are|does)\b/i,
      /\bwhere (can|do|is)\b/i, /\bis (it|there)\b.*\?/i,
      /\bhelp\b/i, /\bdocs?\b/i, /\btutorial\b/i, /\bguide\b/i,
    ],
  },
  {
    type: 'praise',
    patterns: [
      /\bamazing\b/i, /\bawesome\b/i, /\bgreat (job|work)\b/i,
      /\blove (it|this)\b/i, /\bthank(s| you)\b/i, /\bfantastic\b/i,
      /\bincredible\b/i, /\bimpressive\b/i, /\bwell done\b/i,
    ],
  },
  {
    type: 'feedback',
    patterns: [
      /\bfeedback\b/i, /\bthought(s)?\b/i, /\bopinion\b/i,
      /\bexperience\b/i, /\bi (think|feel|noticed)\b/i,
      /\bcould (be|use) (better|improvement)\b/i,
    ],
  },
]

const NEGATIVE_PATTERNS = [
  /\bfrustrat(ed|ing)\b/i, /\bterrible\b/i, /\bawful\b/i,
  /\bdisappoint(ed|ing)\b/i, /\bhate\b/i, /\bworse\b/i,
  /\bunusable\b/i, /\bwaste of\b/i, /\bbug\b/i, /\bbroken\b/i,
]

const POSITIVE_PATTERNS = [
  /\bamazing\b/i, /\bawesome\b/i, /\bgreat\b/i, /\blove\b/i,
  /\bthank(s| you)\b/i, /\bfantastic\b/i, /\bexcellent\b/i,
  /\bimpressive\b/i, /\bsmooth\b/i, /\bperfect\b/i,
]

export function classifyMessage(content: string): {
  messageType: MessageType
  sentiment: MessageSentiment
  priority: MessagePriority
} {
  // Classify type
  let messageType: MessageType = 'general'
  for (const { type, patterns } of TYPE_PATTERNS) {
    if (patterns.some((p) => p.test(content))) {
      messageType = type
      break
    }
  }

  // Classify sentiment
  const negScore = NEGATIVE_PATTERNS.filter((p) => p.test(content)).length
  const posScore = POSITIVE_PATTERNS.filter((p) => p.test(content)).length
  let sentiment: MessageSentiment = 'neutral'
  if (negScore > posScore && negScore >= 1) sentiment = 'negative'
  else if (posScore > negScore && posScore >= 1) sentiment = 'positive'

  // Assign priority
  let priority: MessagePriority = 'low'
  if (messageType === 'bug-report') {
    priority = sentiment === 'negative' ? 'critical' : 'high'
  } else if (messageType === 'feature-request') {
    priority = 'medium'
  } else if (messageType === 'question') {
    priority = 'medium'
  } else if (messageType === 'feedback' && sentiment === 'negative') {
    priority = 'high'
  } else if (messageType === 'praise') {
    priority = 'low'
  }

  return { messageType, sentiment, priority }
}

// ===========================================================================
// Seed data — 30+ messages across platforms
// ===========================================================================

const SEED_MESSAGES: CommunityMessage[] = [
  // ---- Discord ----
  {
    id: 'cm-1',
    platform: 'discord',
    authorId: 'u-discord-1',
    authorName: 'cryptodev_sarah',
    authorAvatar: null,
    content: 'How do I deploy a Next.js app on Alternate Futures? The docs mention af deploy but I get a config error.',
    messageType: 'question',
    sentiment: 'neutral',
    priority: 'medium',
    responded: true,
    responseId: 'resp-1',
    sourceUrl: 'https://discord.com/channels/1234/5678/msg-1',
    receivedAt: '2026-02-15T08:12:00Z',
  },
  {
    id: 'cm-2',
    platform: 'discord',
    authorId: 'u-discord-2',
    authorName: 'web3builder',
    authorAvatar: null,
    content: 'The deployment CLI is broken — I keep getting a 500 error on af deploy. This is really frustrating, I have a demo tomorrow.',
    messageType: 'bug-report',
    sentiment: 'negative',
    priority: 'critical',
    responded: false,
    responseId: null,
    sourceUrl: 'https://discord.com/channels/1234/5678/msg-2',
    receivedAt: '2026-02-15T09:30:00Z',
  },
  {
    id: 'cm-3',
    platform: 'discord',
    authorId: 'u-discord-3',
    authorName: 'depin_maxi',
    authorAvatar: null,
    content: 'Just deployed my first agent on AF — the whole experience was incredibly smooth. Love it!',
    messageType: 'praise',
    sentiment: 'positive',
    priority: 'low',
    responded: true,
    responseId: 'resp-3',
    sourceUrl: 'https://discord.com/channels/1234/5678/msg-3',
    receivedAt: '2026-02-15T10:05:00Z',
  },
  {
    id: 'cm-4',
    platform: 'discord',
    authorId: 'u-discord-4',
    authorName: 'agent_builder_42',
    authorAvatar: null,
    content: 'Can you add support for Llama 3.3 models in the agent SDK? Would be great for local inference.',
    messageType: 'feature-request',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://discord.com/channels/1234/5678/msg-4',
    receivedAt: '2026-02-14T22:15:00Z',
  },
  {
    id: 'cm-5',
    platform: 'discord',
    authorId: 'u-discord-5',
    authorName: 'nixos_enjoyer',
    authorAvatar: null,
    content: 'The IPFS pinning seems to drop after 24 hours. Is there a retention policy I am missing?',
    messageType: 'question',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://discord.com/channels/1234/5678/msg-5',
    receivedAt: '2026-02-14T18:45:00Z',
  },
  {
    id: 'cm-6',
    platform: 'discord',
    authorId: 'u-discord-6',
    authorName: 'fullstack_fiona',
    authorAvatar: null,
    content: 'I think the dashboard UX could use some improvement — the deploy logs are hard to read on mobile.',
    messageType: 'feedback',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://discord.com/channels/1234/5678/msg-6',
    receivedAt: '2026-02-14T15:20:00Z',
  },
  // ---- X (Twitter) ----
  {
    id: 'cm-7',
    platform: 'x',
    authorId: 'u-x-1',
    authorName: '@decentralize_now',
    authorAvatar: null,
    content: '@alternatefutures Amazing platform! Just migrated from Vercel and my costs dropped 70%. The future of cloud is here.',
    messageType: 'praise',
    sentiment: 'positive',
    priority: 'low',
    responded: true,
    responseId: 'resp-7',
    sourceUrl: 'https://x.com/decentralize_now/status/123456',
    receivedAt: '2026-02-15T11:00:00Z',
  },
  {
    id: 'cm-8',
    platform: 'x',
    authorId: 'u-x-2',
    authorName: '@devtools_weekly',
    authorAvatar: null,
    content: 'Has anyone tried @alternatefutures for deploying AI agents? How does it compare to Railway or Fly.io?',
    messageType: 'question',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://x.com/devtools_weekly/status/234567',
    receivedAt: '2026-02-15T07:30:00Z',
  },
  {
    id: 'cm-9',
    platform: 'x',
    authorId: 'u-x-3',
    authorName: '@web3_critic',
    authorAvatar: null,
    content: '@alternatefutures your docs are terrible. Spent 3 hours trying to figure out environment variables. Disappointing.',
    messageType: 'feedback',
    sentiment: 'negative',
    priority: 'high',
    responded: false,
    responseId: null,
    sourceUrl: 'https://x.com/web3_critic/status/345678',
    receivedAt: '2026-02-14T20:00:00Z',
  },
  {
    id: 'cm-10',
    platform: 'x',
    authorId: 'u-x-4',
    authorName: '@startup_cto',
    authorAvatar: null,
    content: 'Would be nice if @alternatefutures supported custom domains with wildcard SSL. Currently have to set up each subdomain manually.',
    messageType: 'feature-request',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://x.com/startup_cto/status/456789',
    receivedAt: '2026-02-14T16:30:00Z',
  },
  {
    id: 'cm-11',
    platform: 'x',
    authorId: 'u-x-5',
    authorName: '@eth_builder',
    authorAvatar: null,
    content: 'Thanks @alternatefutures team for the quick fix on the ENS integration! Great support.',
    messageType: 'praise',
    sentiment: 'positive',
    priority: 'low',
    responded: true,
    responseId: 'resp-11',
    sourceUrl: 'https://x.com/eth_builder/status/567890',
    receivedAt: '2026-02-14T12:15:00Z',
  },
  // ---- GitHub ----
  {
    id: 'cm-12',
    platform: 'github',
    authorId: 'u-gh-1',
    authorName: 'rustacean_dev',
    authorAvatar: null,
    content: 'Bug: CLI v0.9.2 crashes on `af logs --follow` when deployment has multiple services. Stack trace attached.',
    messageType: 'bug-report',
    sentiment: 'neutral',
    priority: 'high',
    responded: true,
    responseId: 'resp-12',
    sourceUrl: 'https://github.com/alternatefutures/cli/issues/42',
    receivedAt: '2026-02-15T06:00:00Z',
  },
  {
    id: 'cm-13',
    platform: 'github',
    authorId: 'u-gh-2',
    authorName: 'oss_contributor',
    authorAvatar: null,
    content: 'Feature request: Add `af rollback` command to quickly revert to a previous deployment version.',
    messageType: 'feature-request',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://github.com/alternatefutures/cli/issues/45',
    receivedAt: '2026-02-14T23:30:00Z',
  },
  {
    id: 'cm-14',
    platform: 'github',
    authorId: 'u-gh-3',
    authorName: 'monorepo_mike',
    authorAvatar: null,
    content: 'The Prisma schema migration workflow is not documented. How do I run migrations on the deployed database?',
    messageType: 'question',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://github.com/alternatefutures/admin/discussions/18',
    receivedAt: '2026-02-14T14:00:00Z',
  },
  {
    id: 'cm-15',
    platform: 'github',
    authorId: 'u-gh-4',
    authorName: 'k8s_migrator',
    authorAvatar: null,
    content: 'Error: Deployment fails with "insufficient resources" even though the provider shows available capacity. Possibly a race condition in the bidding system.',
    messageType: 'bug-report',
    sentiment: 'negative',
    priority: 'critical',
    responded: false,
    responseId: null,
    sourceUrl: 'https://github.com/alternatefutures/cli/issues/48',
    receivedAt: '2026-02-13T19:00:00Z',
  },
  {
    id: 'cm-16',
    platform: 'github',
    authorId: 'u-gh-5',
    authorName: 'security_first',
    authorAvatar: null,
    content: 'Great work on the auth service! The SIWE implementation is clean and well-tested. Opened a PR to add CSRF protection.',
    messageType: 'praise',
    sentiment: 'positive',
    priority: 'low',
    responded: true,
    responseId: 'resp-16',
    sourceUrl: 'https://github.com/alternatefutures/admin/pull/22',
    receivedAt: '2026-02-13T10:30:00Z',
  },
  // ---- Bluesky ----
  {
    id: 'cm-17',
    platform: 'bluesky',
    authorId: 'u-bsky-1',
    authorName: 'indie.hacker.bsky.social',
    authorAvatar: null,
    content: 'Just discovered @alternatefutures.ai — decentralized hosting that actually works. Deployed my portfolio in 2 minutes. Awesome experience!',
    messageType: 'praise',
    sentiment: 'positive',
    priority: 'low',
    responded: false,
    responseId: null,
    sourceUrl: 'https://bsky.app/profile/indie.hacker.bsky.social/post/abc123',
    receivedAt: '2026-02-15T12:30:00Z',
  },
  {
    id: 'cm-18',
    platform: 'bluesky',
    authorId: 'u-bsky-2',
    authorName: 'decentralweb.bsky.social',
    authorAvatar: null,
    content: 'Does alternatefutures.ai support Astro 5 deployments? Getting a build error with the latest version.',
    messageType: 'question',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://bsky.app/profile/decentralweb.bsky.social/post/def456',
    receivedAt: '2026-02-14T21:00:00Z',
  },
  {
    id: 'cm-19',
    platform: 'bluesky',
    authorId: 'u-bsky-3',
    authorName: 'ai.agents.bsky.social',
    authorAvatar: null,
    content: 'The agent deployment on Alternate Futures crashed 3 times today. Getting frustrated — is there a status page?',
    messageType: 'bug-report',
    sentiment: 'negative',
    priority: 'critical',
    responded: false,
    responseId: null,
    sourceUrl: 'https://bsky.app/profile/ai.agents.bsky.social/post/ghi789',
    receivedAt: '2026-02-14T17:45:00Z',
  },
  {
    id: 'cm-20',
    platform: 'bluesky',
    authorId: 'u-bsky-4',
    authorName: 'oss.builder.bsky.social',
    authorAvatar: null,
    content: 'Suggestion: it would be great if alternatefutures had a GitHub Actions integration for auto-deploy on push.',
    messageType: 'feature-request',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://bsky.app/profile/oss.builder.bsky.social/post/jkl012',
    receivedAt: '2026-02-13T08:20:00Z',
  },
  // ---- Mastodon ----
  {
    id: 'cm-21',
    platform: 'mastodon',
    authorId: 'u-masto-1',
    authorName: '@foss_advocate@fosstodon.org',
    authorAvatar: null,
    content: 'I think Alternate Futures could be better if it had a self-hosted option. Not everyone wants to use Akash for everything.',
    messageType: 'feedback',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://fosstodon.org/@foss_advocate/123456',
    receivedAt: '2026-02-15T05:00:00Z',
  },
  {
    id: 'cm-22',
    platform: 'mastodon',
    authorId: 'u-masto-2',
    authorName: '@privacy_first@infosec.exchange',
    authorAvatar: null,
    content: 'Love that @alternatefutures uses decentralized infra. Finally a cloud platform that aligns with FOSS values. Well done!',
    messageType: 'praise',
    sentiment: 'positive',
    priority: 'low',
    responded: false,
    responseId: null,
    sourceUrl: 'https://infosec.exchange/@privacy_first/234567',
    receivedAt: '2026-02-14T13:00:00Z',
  },
  {
    id: 'cm-23',
    platform: 'mastodon',
    authorId: 'u-masto-3',
    authorName: '@devops_daily@hachyderm.io',
    authorAvatar: null,
    content: 'How does Alternate Futures handle database persistence? Akash deployments are ephemeral by default, right?',
    messageType: 'question',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://hachyderm.io/@devops_daily/345678',
    receivedAt: '2026-02-13T16:30:00Z',
  },
  {
    id: 'cm-24',
    platform: 'mastodon',
    authorId: 'u-masto-4',
    authorName: '@web_standards@w3c.social',
    authorAvatar: null,
    content: 'Bug: the Alternate Futures docs site returns a 404 on /api-reference. Broken link from the homepage.',
    messageType: 'bug-report',
    sentiment: 'neutral',
    priority: 'high',
    responded: false,
    responseId: null,
    sourceUrl: 'https://w3c.social/@web_standards/456789',
    receivedAt: '2026-02-13T11:15:00Z',
  },
  // ---- Reddit ----
  {
    id: 'cm-25',
    platform: 'reddit',
    authorId: 'u-reddit-1',
    authorName: 'u/decentralized_dev',
    authorAvatar: null,
    content: 'Has anyone used Alternate Futures for production? Looking for alternatives to Vercel that are truly decentralized. How is the uptime?',
    messageType: 'question',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://reddit.com/r/webdev/comments/abc123',
    receivedAt: '2026-02-15T14:00:00Z',
  },
  {
    id: 'cm-26',
    platform: 'reddit',
    authorId: 'u-reddit-2',
    authorName: 'u/cloud_native_pro',
    authorAvatar: null,
    content: 'Alternate Futures is awesome for side projects but please add team collaboration features. Need shared deployments and role-based access.',
    messageType: 'feature-request',
    sentiment: 'positive',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://reddit.com/r/selfhosted/comments/def456',
    receivedAt: '2026-02-14T19:30:00Z',
  },
  {
    id: 'cm-27',
    platform: 'reddit',
    authorId: 'u-reddit-3',
    authorName: 'u/ai_agent_builder',
    authorAvatar: null,
    content: 'Terrible experience with AF agent deployment. Memory leaks crash the container after ~6 hours. Waste of time setting this up.',
    messageType: 'bug-report',
    sentiment: 'negative',
    priority: 'critical',
    responded: false,
    responseId: null,
    sourceUrl: 'https://reddit.com/r/machinelearning/comments/ghi789',
    receivedAt: '2026-02-14T11:00:00Z',
  },
  {
    id: 'cm-28',
    platform: 'reddit',
    authorId: 'u-reddit-4',
    authorName: 'u/ipfs_enthusiast',
    authorAvatar: null,
    content: 'The IPFS pinning on AF works great. Thank you for supporting Arweave too — permanent storage is underrated.',
    messageType: 'praise',
    sentiment: 'positive',
    priority: 'low',
    responded: false,
    responseId: null,
    sourceUrl: 'https://reddit.com/r/ipfs/comments/jkl012',
    receivedAt: '2026-02-13T22:00:00Z',
  },
  {
    id: 'cm-29',
    platform: 'reddit',
    authorId: 'u-reddit-5',
    authorName: 'u/startup_founder_88',
    authorAvatar: null,
    content: 'I noticed the AF pricing page doesn\'t mention bandwidth costs. Is egress really free or is there a hidden limit?',
    messageType: 'question',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://reddit.com/r/startups/comments/mno345',
    receivedAt: '2026-02-13T09:45:00Z',
  },
  {
    id: 'cm-30',
    platform: 'discord',
    authorId: 'u-discord-7',
    authorName: 'vue_developer',
    authorAvatar: null,
    content: 'The Vue template is outdated — still on Vue 3.3. Can you update it to Vue 3.5 with the new features?',
    messageType: 'feedback',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://discord.com/channels/1234/5678/msg-30',
    receivedAt: '2026-02-13T07:00:00Z',
  },
  {
    id: 'cm-31',
    platform: 'x',
    authorId: 'u-x-6',
    authorName: '@serverless_fan',
    authorAvatar: null,
    content: 'Can @alternatefutures handle serverless functions with cold starts under 100ms? That would be a game changer.',
    messageType: 'question',
    sentiment: 'neutral',
    priority: 'medium',
    responded: false,
    responseId: null,
    sourceUrl: 'https://x.com/serverless_fan/status/678901',
    receivedAt: '2026-02-12T20:30:00Z',
  },
  {
    id: 'cm-32',
    platform: 'github',
    authorId: 'u-gh-6',
    authorName: 'typescript_wizard',
    authorAvatar: null,
    content: 'The SDK types are missing generics for the deploy config. Makes it hard to type-check custom providers. See issue #51.',
    messageType: 'bug-report',
    sentiment: 'neutral',
    priority: 'high',
    responded: false,
    responseId: null,
    sourceUrl: 'https://github.com/alternatefutures/sdk/issues/51',
    receivedAt: '2026-02-12T15:00:00Z',
  },
]

// ===========================================================================
// Community Growth Seed Data — BF-CM-011
// ===========================================================================

const SEED_METRICS: CommunityMetrics[] = [
  {
    platform: 'discord',
    memberCount: 2847,
    activeMembers: 412,
    messagesPerDay: 89,
    growthRate: 12.3,
    topContributors: [
      { name: 'cryptodev_sarah', avatar: null, messageCount: 145 },
      { name: 'depin_maxi', avatar: null, messageCount: 98 },
      { name: 'agent_builder_42', avatar: null, messageCount: 76 },
      { name: 'web3builder', avatar: null, messageCount: 63 },
      { name: 'fullstack_fiona', avatar: null, messageCount: 51 },
    ],
  },
  {
    platform: 'x',
    memberCount: 5420,
    activeMembers: 890,
    messagesPerDay: 34,
    growthRate: 8.7,
    topContributors: [
      { name: '@decentralize_now', avatar: null, messageCount: 28 },
      { name: '@eth_builder', avatar: null, messageCount: 22 },
      { name: '@startup_cto', avatar: null, messageCount: 18 },
      { name: '@devtools_weekly', avatar: null, messageCount: 15 },
      { name: '@serverless_fan', avatar: null, messageCount: 12 },
    ],
  },
  {
    platform: 'github',
    memberCount: 1203,
    activeMembers: 187,
    messagesPerDay: 15,
    growthRate: 18.2,
    topContributors: [
      { name: 'rustacean_dev', avatar: null, messageCount: 34 },
      { name: 'oss_contributor', avatar: null, messageCount: 29 },
      { name: 'security_first', avatar: null, messageCount: 21 },
      { name: 'typescript_wizard', avatar: null, messageCount: 17 },
      { name: 'monorepo_mike', avatar: null, messageCount: 14 },
    ],
  },
  {
    platform: 'bluesky',
    memberCount: 892,
    activeMembers: 156,
    messagesPerDay: 11,
    growthRate: 24.5,
    topContributors: [
      { name: 'indie.hacker.bsky.social', avatar: null, messageCount: 19 },
      { name: 'oss.builder.bsky.social', avatar: null, messageCount: 14 },
      { name: 'decentralweb.bsky.social', avatar: null, messageCount: 11 },
      { name: 'ai.agents.bsky.social', avatar: null, messageCount: 8 },
    ],
  },
  {
    platform: 'reddit',
    memberCount: 1650,
    activeMembers: 230,
    messagesPerDay: 22,
    growthRate: 6.1,
    topContributors: [
      { name: 'u/decentralized_dev', avatar: null, messageCount: 31 },
      { name: 'u/ipfs_enthusiast', avatar: null, messageCount: 24 },
      { name: 'u/cloud_native_pro', avatar: null, messageCount: 18 },
      { name: 'u/startup_founder_88', avatar: null, messageCount: 12 },
      { name: 'u/ai_agent_builder', avatar: null, messageCount: 9 },
    ],
  },
  {
    platform: 'mastodon',
    memberCount: 438,
    activeMembers: 67,
    messagesPerDay: 5,
    growthRate: 31.2,
    topContributors: [
      { name: '@foss_advocate@fosstodon.org', avatar: null, messageCount: 12 },
      { name: '@privacy_first@infosec.exchange', avatar: null, messageCount: 9 },
      { name: '@devops_daily@hachyderm.io', avatar: null, messageCount: 7 },
    ],
  },
]

// ===========================================================================
// Helpers
// ===========================================================================

function useSeedData(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
  )
}

// ===========================================================================
// GraphQL
// ===========================================================================

const MESSAGE_FIELDS = `
  id platform authorId authorName authorAvatar content
  messageType sentiment priority responded responseId
  sourceUrl receivedAt
`

const ALL_MESSAGES_QUERY = `
  query CommunityMessages($limit: Int, $offset: Int) {
    communityMessages(limit: $limit, offset: $offset) {
      ${MESSAGE_FIELDS}
    }
  }
`

const MESSAGE_BY_ID_QUERY = `
  query CommunityMessage($id: ID!) {
    communityMessage(id: $id) {
      ${MESSAGE_FIELDS}
    }
  }
`

const UPDATE_MESSAGE_MUTATION = `
  mutation UpdateCommunityMessage($id: ID!, $input: UpdateCommunityMessageInput!) {
    updateCommunityMessage(id: $id, input: $input) {
      ${MESSAGE_FIELDS}
    }
  }
`

const METRICS_QUERY = `
  query CommunityMetrics {
    communityMetrics {
      platform memberCount activeMembers messagesPerDay
      growthRate topContributors { name avatar messageCount }
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

// ===========================================================================
// In-memory mock store
// ===========================================================================

let mockMessages = [...SEED_MESSAGES]

// ===========================================================================
// CRUD Functions
// ===========================================================================

export async function fetchAllMessages(
  token: string,
  limit = 100,
  offset = 0,
): Promise<CommunityMessage[]> {
  try {
    const data = await authGraphqlFetch<{ communityMessages: CommunityMessage[] }>(
      ALL_MESSAGES_QUERY,
      { limit, offset },
      token,
    )
    return data.communityMessages
  } catch {
    if (useSeedData()) return mockMessages.slice(offset, offset + limit)
    return []
  }
}

export async function fetchMessageById(
  token: string,
  id: string,
): Promise<CommunityMessage | null> {
  try {
    const data = await authGraphqlFetch<{ communityMessage: CommunityMessage }>(
      MESSAGE_BY_ID_QUERY,
      { id },
      token,
    )
    return data.communityMessage
  } catch {
    if (useSeedData()) return mockMessages.find((m) => m.id === id) || null
    return null
  }
}

export interface UpdateMessageInput {
  responded?: boolean
  responseId?: string
  messageType?: MessageType
  priority?: MessagePriority
  sentiment?: MessageSentiment
}

export async function updateMessage(
  token: string,
  id: string,
  input: UpdateMessageInput,
): Promise<CommunityMessage> {
  if (useSeedData()) {
    const idx = mockMessages.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('Message not found')
    const updated: CommunityMessage = { ...mockMessages[idx], ...input }
    mockMessages[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateCommunityMessage: CommunityMessage }>(
    UPDATE_MESSAGE_MUTATION,
    { id, input },
    token,
  )
  return data.updateCommunityMessage
}

export async function fetchCommunityMetrics(
  token: string,
): Promise<CommunityMetrics[]> {
  try {
    const data = await authGraphqlFetch<{ communityMetrics: CommunityMetrics[] }>(
      METRICS_QUERY,
      {},
      token,
    )
    return data.communityMetrics
  } catch {
    if (useSeedData()) return SEED_METRICS
    return []
  }
}

// Re-export seed data
export { SEED_MESSAGES, SEED_METRICS }

// ===========================================================================
// Events — Types & Seed Data
// ===========================================================================

export type EventStatus = 'draft' | 'upcoming' | 'live' | 'completed' | 'cancelled'
export type EventVenueType = 'online' | 'physical' | 'hybrid'
export type RegistrationType = 'open' | 'invite' | 'waitlist'

export interface EventSpeaker {
  name: string
  title: string
  avatar: string | null
}

export interface EventAgendaItem {
  time: string
  title: string
  speaker: string | null
}

export interface EventAttendee {
  id: string
  name: string
  email: string
  registeredAt: string
  checkedIn: boolean
  checkedInAt: string | null
}

export interface CommunityEvent {
  id: string
  name: string
  description: string
  date: string
  endDate: string
  duration: number
  venueType: EventVenueType
  venueAddress: string | null
  venueLink: string | null
  capacity: number
  registrationType: RegistrationType
  status: EventStatus
  tags: string[]
  speakers: EventSpeaker[]
  agenda: EventAgendaItem[]
  attendees: EventAttendee[]
  registrations: number
  attendanceRate: number
  satisfactionScore: number | null
}

const SEED_EVENTS: CommunityEvent[] = [
  {
    id: 'evt-1',
    name: 'Decentralized Deploy Day',
    description: 'Live workshop showing how to deploy full-stack apps on Alternate Futures using IPFS, Arweave, and Akash compute.',
    date: '2026-03-01T18:00:00Z',
    endDate: '2026-03-01T20:00:00Z',
    duration: 120,
    venueType: 'online',
    venueAddress: null,
    venueLink: 'https://meet.alternatefutures.ai/deploy-day',
    capacity: 200,
    registrationType: 'open',
    status: 'upcoming',
    tags: ['workshop', 'deployment', 'ipfs'],
    speakers: [
      { name: 'Senku Ishigami', title: 'Technical Lead', avatar: null },
      { name: 'Lain Iwakura', title: 'Infrastructure Engineer', avatar: null },
    ],
    agenda: [
      { time: '18:00', title: 'Welcome & Platform Overview', speaker: 'Senku Ishigami' },
      { time: '18:30', title: 'Live Deploy: Next.js on IPFS', speaker: 'Senku Ishigami' },
      { time: '19:00', title: 'Akash Compute Deep Dive', speaker: 'Lain Iwakura' },
      { time: '19:30', title: 'Q&A', speaker: null },
    ],
    attendees: [
      { id: 'att-1', name: 'cryptodev_sarah', email: 'sarah@dev.io', registeredAt: '2026-02-10T12:00:00Z', checkedIn: false, checkedInAt: null },
      { id: 'att-2', name: 'web3builder', email: 'w3b@mail.com', registeredAt: '2026-02-11T09:00:00Z', checkedIn: false, checkedInAt: null },
      { id: 'att-3', name: 'depin_maxi', email: 'depin@crypto.xyz', registeredAt: '2026-02-12T14:00:00Z', checkedIn: false, checkedInAt: null },
    ],
    registrations: 87,
    attendanceRate: 0,
    satisfactionScore: null,
  },
  {
    id: 'evt-2',
    name: 'AI Agent Builders Meetup',
    description: 'Monthly community meetup for developers building autonomous AI agents on the AF platform.',
    date: '2026-02-20T17:00:00Z',
    endDate: '2026-02-20T19:00:00Z',
    duration: 120,
    venueType: 'hybrid',
    venueAddress: '123 Innovation Way, San Francisco, CA 94105',
    venueLink: 'https://meet.alternatefutures.ai/agent-meetup',
    capacity: 50,
    registrationType: 'open',
    status: 'upcoming',
    tags: ['meetup', 'ai-agents', 'community'],
    speakers: [
      { name: 'agent_builder_42', title: 'Community Developer', avatar: null },
    ],
    agenda: [
      { time: '17:00', title: 'Networking & Introductions', speaker: null },
      { time: '17:30', title: 'Building Multi-Agent Systems on AF', speaker: 'agent_builder_42' },
      { time: '18:15', title: 'Lightning Talks', speaker: null },
      { time: '18:45', title: 'Open Discussion', speaker: null },
    ],
    attendees: [
      { id: 'att-4', name: 'agent_builder_42', email: 'ab42@agents.ai', registeredAt: '2026-02-05T08:00:00Z', checkedIn: false, checkedInAt: null },
      { id: 'att-5', name: 'nixos_enjoyer', email: 'nix@os.dev', registeredAt: '2026-02-06T10:00:00Z', checkedIn: false, checkedInAt: null },
    ],
    registrations: 38,
    attendanceRate: 0,
    satisfactionScore: null,
  },
  {
    id: 'evt-3',
    name: 'IPFS Pinning Workshop',
    description: 'Hands-on technical session covering IPFS pinning strategies, retention policies, and gateway optimization.',
    date: '2026-02-08T16:00:00Z',
    endDate: '2026-02-08T17:30:00Z',
    duration: 90,
    venueType: 'online',
    venueAddress: null,
    venueLink: 'https://meet.alternatefutures.ai/ipfs-workshop',
    capacity: 100,
    registrationType: 'open',
    status: 'completed',
    tags: ['workshop', 'ipfs', 'storage'],
    speakers: [
      { name: 'Lain Iwakura', title: 'Infrastructure Engineer', avatar: null },
    ],
    agenda: [
      { time: '16:00', title: 'IPFS Fundamentals Refresher', speaker: 'Lain Iwakura' },
      { time: '16:30', title: 'Pinning Strategies & Retention', speaker: 'Lain Iwakura' },
      { time: '17:00', title: 'Gateway Optimization Tips', speaker: 'Lain Iwakura' },
    ],
    attendees: [
      { id: 'att-6', name: 'nixos_enjoyer', email: 'nix@os.dev', registeredAt: '2026-02-01T12:00:00Z', checkedIn: true, checkedInAt: '2026-02-08T15:55:00Z' },
      { id: 'att-7', name: 'ipfs_enthusiast', email: 'ipfs@fan.org', registeredAt: '2026-02-02T08:00:00Z', checkedIn: true, checkedInAt: '2026-02-08T16:02:00Z' },
      { id: 'att-8', name: 'cryptodev_sarah', email: 'sarah@dev.io', registeredAt: '2026-02-03T14:00:00Z', checkedIn: true, checkedInAt: '2026-02-08T15:58:00Z' },
    ],
    registrations: 72,
    attendanceRate: 84,
    satisfactionScore: 4.6,
  },
  {
    id: 'evt-4',
    name: 'AF Launch Party: v1.0',
    description: 'Celebrate the official v1.0 launch of Alternate Futures with live demos, prizes, and community spotlight.',
    date: '2026-01-25T19:00:00Z',
    endDate: '2026-01-25T22:00:00Z',
    duration: 180,
    venueType: 'physical',
    venueAddress: '456 Blockchain Blvd, Austin, TX 78701',
    venueLink: null,
    capacity: 150,
    registrationType: 'invite',
    status: 'completed',
    tags: ['launch', 'party', 'milestone'],
    speakers: [],
    agenda: [
      { time: '19:00', title: 'Doors Open & Reception', speaker: null },
      { time: '19:30', title: 'v1.0 Feature Showcase', speaker: 'Senku Ishigami' },
      { time: '20:15', title: 'Community Awards', speaker: null },
      { time: '21:00', title: 'Open Networking', speaker: null },
    ],
    attendees: [
      { id: 'att-9', name: 'startup_founder', email: 'founder@startup.com', registeredAt: '2026-01-15T10:00:00Z', checkedIn: true, checkedInAt: '2026-01-25T19:05:00Z' },
      { id: 'att-10', name: 'eth_builder', email: 'eth@builder.dev', registeredAt: '2026-01-16T12:00:00Z', checkedIn: true, checkedInAt: '2026-01-25T19:12:00Z' },
    ],
    registrations: 142,
    attendanceRate: 91,
    satisfactionScore: 4.8,
  },
  {
    id: 'evt-5',
    name: 'Web3 Security AMA',
    description: 'Ask-me-anything session with the security team covering smart contract audits, SIWE auth, and threat modeling.',
    date: '2026-03-10T20:00:00Z',
    endDate: '2026-03-10T21:30:00Z',
    duration: 90,
    venueType: 'online',
    venueAddress: null,
    venueLink: 'https://discord.gg/alternatefutures',
    capacity: 500,
    registrationType: 'open',
    status: 'upcoming',
    tags: ['ama', 'security', 'web3'],
    speakers: [
      { name: 'Argus', title: 'Security Lead', avatar: null },
    ],
    agenda: [
      { time: '20:00', title: 'Security Overview & Recent Audits', speaker: 'Argus' },
      { time: '20:30', title: 'Open Q&A', speaker: null },
    ],
    attendees: [],
    registrations: 156,
    attendanceRate: 0,
    satisfactionScore: null,
  },
]

let mockEvents = [...SEED_EVENTS]

export async function fetchAllEvents(token: string): Promise<CommunityEvent[]> {
  if (useSeedData()) return mockEvents
  try {
    const data = await authGraphqlFetch<{ communityEvents: CommunityEvent[] }>(
      `query { communityEvents { id name description date endDate duration venueType venueAddress venueLink capacity registrationType status tags speakers { name title avatar } agenda { time title speaker } registrations attendanceRate satisfactionScore attendees { id name email registeredAt checkedIn checkedInAt } } }`,
      {},
      token,
    )
    return data.communityEvents
  } catch {
    return mockEvents
  }
}

export async function fetchEventById(token: string, id: string): Promise<CommunityEvent | null> {
  if (useSeedData()) return mockEvents.find((e) => e.id === id) || null
  try {
    const data = await authGraphqlFetch<{ communityEvent: CommunityEvent }>(
      `query($id: ID!) { communityEvent(id: $id) { id name description date endDate duration venueType venueAddress venueLink capacity registrationType status tags speakers { name title avatar } agenda { time title speaker } registrations attendanceRate satisfactionScore attendees { id name email registeredAt checkedIn checkedInAt } } }`,
      { id },
      token,
    )
    return data.communityEvent
  } catch {
    return mockEvents.find((e) => e.id === id) || null
  }
}

export async function createEvent(token: string, event: Omit<CommunityEvent, 'id' | 'attendees' | 'registrations' | 'attendanceRate' | 'satisfactionScore'>): Promise<CommunityEvent> {
  const newEvent: CommunityEvent = {
    ...event,
    id: `evt-${Date.now()}`,
    attendees: [],
    registrations: 0,
    attendanceRate: 0,
    satisfactionScore: null,
  }
  if (useSeedData()) {
    mockEvents = [newEvent, ...mockEvents]
    return newEvent
  }
  return newEvent
}

export async function updateEvent(token: string, id: string, updates: Partial<CommunityEvent>): Promise<CommunityEvent> {
  if (useSeedData()) {
    const idx = mockEvents.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('Event not found')
    mockEvents[idx] = { ...mockEvents[idx], ...updates }
    return mockEvents[idx]
  }
  throw new Error('Not implemented')
}

export { SEED_EVENTS }

// ===========================================================================
// Forums — Types & Seed Data
// ===========================================================================

export type ForumThreadStatus = 'open' | 'closed' | 'pinned' | 'flagged' | 'removed'

export interface ForumCategory {
  id: string
  name: string
  description: string
  threadCount: number
  postCount: number
  color: string
}

export interface ForumThread {
  id: string
  categoryId: string
  title: string
  authorName: string
  authorAvatar: string | null
  content: string
  status: ForumThreadStatus
  replies: number
  views: number
  lastActivityAt: string
  createdAt: string
  flagReason: string | null
  reportCount: number
}

export interface UserReport {
  id: string
  threadId: string
  threadTitle: string
  reporterName: string
  reason: string
  createdAt: string
  resolved: boolean
}

const SEED_CATEGORIES: ForumCategory[] = [
  { id: 'cat-1', name: 'General Discussion', description: 'Chat about anything related to Alternate Futures.', threadCount: 48, postCount: 312, color: '#000AFF' },
  { id: 'cat-2', name: 'Deployment Help', description: 'Get help deploying your apps.', threadCount: 93, postCount: 567, color: '#F97316' },
  { id: 'cat-3', name: 'Feature Requests', description: 'Suggest new features and vote on ideas.', threadCount: 67, postCount: 234, color: '#8B5CF6' },
  { id: 'cat-4', name: 'Bug Reports', description: 'Report issues and track fixes.', threadCount: 31, postCount: 189, color: '#EF4444' },
  { id: 'cat-5', name: 'Showcase', description: 'Share what you have built on AF.', threadCount: 24, postCount: 156, color: '#10B981' },
  { id: 'cat-6', name: 'AI Agents', description: 'Discuss building and deploying AI agents.', threadCount: 56, postCount: 401, color: '#EC4899' },
]

const SEED_THREADS: ForumThread[] = [
  { id: 'thr-1', categoryId: 'cat-2', title: 'Next.js 15 deployment fails with config error', authorName: 'cryptodev_sarah', authorAvatar: null, content: 'I followed the docs but keep getting a config error when running af deploy with Next.js 15...', status: 'open', replies: 8, views: 234, lastActivityAt: '2026-02-15T10:30:00Z', createdAt: '2026-02-14T08:00:00Z', flagReason: null, reportCount: 0 },
  { id: 'thr-2', categoryId: 'cat-4', title: 'CLI crashes on af logs --follow with multiple services', authorName: 'rustacean_dev', authorAvatar: null, content: 'CLI v0.9.2 crashes with a stack overflow when tailing logs from a deployment with 3+ services...', status: 'flagged', replies: 12, views: 456, lastActivityAt: '2026-02-15T09:00:00Z', createdAt: '2026-02-13T15:00:00Z', flagReason: 'Contains debug output with potential secrets', reportCount: 2 },
  { id: 'thr-3', categoryId: 'cat-3', title: 'Add af rollback command for quick reverts', authorName: 'oss_contributor', authorAvatar: null, content: 'It would be great to have a one-command rollback to previous deployment versions...', status: 'pinned', replies: 23, views: 789, lastActivityAt: '2026-02-15T08:00:00Z', createdAt: '2026-02-10T12:00:00Z', flagReason: null, reportCount: 0 },
  { id: 'thr-4', categoryId: 'cat-6', title: 'Best practices for multi-agent orchestration', authorName: 'agent_builder_42', authorAvatar: null, content: 'Looking for patterns on how to orchestrate multiple AI agents that need to communicate...', status: 'open', replies: 15, views: 567, lastActivityAt: '2026-02-14T22:00:00Z', createdAt: '2026-02-12T09:00:00Z', flagReason: null, reportCount: 0 },
  { id: 'thr-5', categoryId: 'cat-1', title: 'Introduce yourself! New member thread', authorName: 'community_admin', authorAvatar: null, content: 'Welcome to the Alternate Futures community! Share what you are working on.', status: 'pinned', replies: 89, views: 2340, lastActivityAt: '2026-02-15T12:00:00Z', createdAt: '2026-01-01T00:00:00Z', flagReason: null, reportCount: 0 },
  { id: 'thr-6', categoryId: 'cat-5', title: 'My decentralized portfolio site on AF', authorName: 'indie_hacker', authorAvatar: null, content: 'Just launched my portfolio on IPFS via Alternate Futures — here is how I set it up...', status: 'open', replies: 6, views: 178, lastActivityAt: '2026-02-13T16:00:00Z', createdAt: '2026-02-13T10:00:00Z', flagReason: null, reportCount: 0 },
  { id: 'thr-7', categoryId: 'cat-2', title: 'SPAM: Buy cheap tokens NOW!!!', authorName: 'spam_bot_99', authorAvatar: null, content: 'Buy tokens at discount price visit scam-site dot com for amazing deals!!!', status: 'flagged', replies: 0, views: 12, lastActivityAt: '2026-02-14T03:00:00Z', createdAt: '2026-02-14T03:00:00Z', flagReason: 'Spam / scam content', reportCount: 5 },
  { id: 'thr-8', categoryId: 'cat-4', title: 'Memory leak in agent container after 6 hours', authorName: 'ai_agent_builder', authorAvatar: null, content: 'Agent deployments crash after ~6 hours due to memory leaks. Heap snapshots attached...', status: 'open', replies: 4, views: 321, lastActivityAt: '2026-02-14T18:00:00Z', createdAt: '2026-02-14T11:00:00Z', flagReason: null, reportCount: 0 },
]

const SEED_REPORTS: UserReport[] = [
  { id: 'rpt-1', threadId: 'thr-7', threadTitle: 'SPAM: Buy cheap tokens NOW!!!', reporterName: 'cryptodev_sarah', reason: 'Spam/scam content promoting fraudulent token sales', createdAt: '2026-02-14T03:15:00Z', resolved: false },
  { id: 'rpt-2', threadId: 'thr-7', threadTitle: 'SPAM: Buy cheap tokens NOW!!!', reporterName: 'web3builder', reason: 'Obvious spam bot', createdAt: '2026-02-14T03:30:00Z', resolved: false },
  { id: 'rpt-3', threadId: 'thr-2', threadTitle: 'CLI crashes on af logs --follow with multiple services', reporterName: 'security_first', reason: 'Contains debug output that may include API keys', createdAt: '2026-02-14T16:00:00Z', resolved: false },
  { id: 'rpt-4', threadId: 'thr-7', threadTitle: 'SPAM: Buy cheap tokens NOW!!!', reporterName: 'depin_maxi', reason: 'Spam', createdAt: '2026-02-14T04:00:00Z', resolved: false },
]

let mockThreads = [...SEED_THREADS]
let mockReports = [...SEED_REPORTS]

export async function fetchForumCategories(token: string): Promise<ForumCategory[]> {
  if (useSeedData()) return SEED_CATEGORIES
  return SEED_CATEGORIES
}

export async function fetchForumThreads(token: string): Promise<ForumThread[]> {
  if (useSeedData()) return mockThreads
  return mockThreads
}

export async function fetchUserReports(token: string): Promise<UserReport[]> {
  if (useSeedData()) return mockReports
  return mockReports
}

export async function updateThreadStatus(token: string, threadId: string, status: ForumThreadStatus): Promise<ForumThread> {
  const idx = mockThreads.findIndex((t) => t.id === threadId)
  if (idx === -1) throw new Error('Thread not found')
  mockThreads[idx] = { ...mockThreads[idx], status }
  return mockThreads[idx]
}

export async function resolveReport(token: string, reportId: string): Promise<UserReport> {
  const idx = mockReports.findIndex((r) => r.id === reportId)
  if (idx === -1) throw new Error('Report not found')
  mockReports[idx] = { ...mockReports[idx], resolved: true }
  return mockReports[idx]
}

export { SEED_CATEGORIES, SEED_THREADS, SEED_REPORTS }

// ===========================================================================
// Engagement — Types & Seed Data
// ===========================================================================

export type ActivityLevel = 'power-user' | 'active' | 'occasional' | 'lurker' | 'inactive'
export type CampaignStatus = 'draft' | 'active' | 'completed' | 'paused'
export type CampaignType = 'challenge' | 'ama' | 'poll' | 'contest'

export interface EngagementTrend {
  date: string
  score: number
  activeUsers: number
  newMessages: number
}

export interface EngagementCampaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  startDate: string
  endDate: string
  participants: number
  goal: string
  progress: number
}

export interface ActivitySegment {
  level: ActivityLevel
  count: number
  percentage: number
}

export interface TopContributor {
  id: string
  name: string
  platform: CommunityPlatform
  score: number
  messages: number
  helpfulAnswers: number
  streak: number
}

const SEED_ENGAGEMENT_TRENDS: EngagementTrend[] = [
  { date: '2026-02-09', score: 72, activeUsers: 1420, newMessages: 145 },
  { date: '2026-02-10', score: 75, activeUsers: 1480, newMessages: 162 },
  { date: '2026-02-11', score: 71, activeUsers: 1390, newMessages: 138 },
  { date: '2026-02-12', score: 78, activeUsers: 1560, newMessages: 178 },
  { date: '2026-02-13', score: 82, activeUsers: 1650, newMessages: 198 },
  { date: '2026-02-14', score: 79, activeUsers: 1590, newMessages: 172 },
  { date: '2026-02-15', score: 84, activeUsers: 1710, newMessages: 205 },
]

const SEED_CAMPAIGNS: EngagementCampaign[] = [
  { id: 'cmp-1', name: 'Deploy Challenge: Ship in 24h', type: 'challenge', status: 'active', startDate: '2026-02-14T00:00:00Z', endDate: '2026-02-21T00:00:00Z', participants: 34, goal: 'Get 50 users to deploy their first app', progress: 68 },
  { id: 'cmp-2', name: 'Weekly AMA: Infrastructure Team', type: 'ama', status: 'active', startDate: '2026-02-15T20:00:00Z', endDate: '2026-02-15T21:30:00Z', participants: 89, goal: 'Answer top community questions live', progress: 100 },
  { id: 'cmp-3', name: 'Feature Priority Poll: Q2 2026', type: 'poll', status: 'draft', startDate: '2026-02-20T00:00:00Z', endDate: '2026-02-27T00:00:00Z', participants: 0, goal: 'Gather community input on Q2 feature priorities', progress: 0 },
  { id: 'cmp-4', name: 'Best Agent Demo Contest', type: 'contest', status: 'completed', startDate: '2026-01-20T00:00:00Z', endDate: '2026-02-03T00:00:00Z', participants: 18, goal: 'Showcase the most creative AI agent built on AF', progress: 100 },
]

const SEED_SEGMENTS: ActivitySegment[] = [
  { level: 'power-user', count: 142, percentage: 4 },
  { level: 'active', count: 890, percentage: 24 },
  { level: 'occasional', count: 1240, percentage: 33 },
  { level: 'lurker', count: 1050, percentage: 28 },
  { level: 'inactive', count: 428, percentage: 11 },
]

const SEED_TOP_CONTRIBUTORS: TopContributor[] = [
  { id: 'tc-1', name: 'cryptodev_sarah', platform: 'discord', score: 945, messages: 145, helpfulAnswers: 42, streak: 21 },
  { id: 'tc-2', name: 'rustacean_dev', platform: 'github', score: 890, messages: 34, helpfulAnswers: 28, streak: 45 },
  { id: 'tc-3', name: 'depin_maxi', platform: 'discord', score: 780, messages: 98, helpfulAnswers: 31, streak: 14 },
  { id: 'tc-4', name: '@decentralize_now', platform: 'x', score: 720, messages: 28, helpfulAnswers: 15, streak: 30 },
  { id: 'tc-5', name: 'oss_contributor', platform: 'github', score: 695, messages: 29, helpfulAnswers: 22, streak: 18 },
  { id: 'tc-6', name: 'agent_builder_42', platform: 'discord', score: 650, messages: 76, helpfulAnswers: 19, streak: 9 },
  { id: 'tc-7', name: 'u/decentralized_dev', platform: 'reddit', score: 580, messages: 31, helpfulAnswers: 12, streak: 7 },
  { id: 'tc-8', name: 'indie.hacker.bsky.social', platform: 'bluesky', score: 520, messages: 19, helpfulAnswers: 8, streak: 12 },
  { id: 'tc-9', name: '@foss_advocate@fosstodon.org', platform: 'mastodon', score: 490, messages: 12, helpfulAnswers: 6, streak: 5 },
  { id: 'tc-10', name: 'typescript_wizard', platform: 'github', score: 465, messages: 17, helpfulAnswers: 14, streak: 22 },
]

export async function fetchEngagementTrends(token: string): Promise<EngagementTrend[]> {
  if (useSeedData()) return SEED_ENGAGEMENT_TRENDS
  return SEED_ENGAGEMENT_TRENDS
}

export async function fetchEngagementCampaigns(token: string): Promise<EngagementCampaign[]> {
  if (useSeedData()) return SEED_CAMPAIGNS
  return SEED_CAMPAIGNS
}

export async function fetchActivitySegments(token: string): Promise<ActivitySegment[]> {
  if (useSeedData()) return SEED_SEGMENTS
  return SEED_SEGMENTS
}

export async function fetchTopContributors(token: string): Promise<TopContributor[]> {
  if (useSeedData()) return SEED_TOP_CONTRIBUTORS
  return SEED_TOP_CONTRIBUTORS
}

export { SEED_ENGAGEMENT_TRENDS, SEED_CAMPAIGNS, SEED_SEGMENTS, SEED_TOP_CONTRIBUTORS }

// ===========================================================================
// Members — Types & Seed Data
// ===========================================================================

export type MemberRole = 'admin' | 'moderator' | 'contributor' | 'member'
export type MemberStatus = 'active' | 'muted' | 'banned'
export type Badge = 'early-adopter' | 'top-contributor' | 'bug-hunter' | 'event-speaker' | 'beta-tester' | 'ambassador'

export interface CommunityMember {
  id: string
  name: string
  email: string
  avatar: string | null
  platform: CommunityPlatform
  role: MemberRole
  status: MemberStatus
  joinDate: string
  lastActive: string
  activityScore: number
  messageCount: number
  badges: Badge[]
  bio: string | null
}

const SEED_MEMBERS: CommunityMember[] = [
  { id: 'mem-1', name: 'cryptodev_sarah', email: 'sarah@dev.io', avatar: null, platform: 'discord', role: 'contributor', status: 'active', joinDate: '2025-09-15T00:00:00Z', lastActive: '2026-02-15T08:12:00Z', activityScore: 945, messageCount: 145, badges: ['early-adopter', 'top-contributor'], bio: 'Full-stack dev, crypto enthusiast. Building on AF since day one.' },
  { id: 'mem-2', name: 'web3builder', email: 'w3b@mail.com', avatar: null, platform: 'discord', role: 'member', status: 'active', joinDate: '2025-11-02T00:00:00Z', lastActive: '2026-02-15T09:30:00Z', activityScore: 520, messageCount: 63, badges: ['beta-tester'], bio: 'Web3 developer. Into DeFi and decentralized hosting.' },
  { id: 'mem-3', name: 'depin_maxi', email: 'depin@crypto.xyz', avatar: null, platform: 'discord', role: 'contributor', status: 'active', joinDate: '2025-10-10T00:00:00Z', lastActive: '2026-02-15T10:05:00Z', activityScore: 780, messageCount: 98, badges: ['early-adopter', 'top-contributor', 'event-speaker'], bio: 'DePIN researcher and evangelist.' },
  { id: 'mem-4', name: 'agent_builder_42', email: 'ab42@agents.ai', avatar: null, platform: 'discord', role: 'contributor', status: 'active', joinDate: '2025-12-01T00:00:00Z', lastActive: '2026-02-14T22:15:00Z', activityScore: 650, messageCount: 76, badges: ['top-contributor', 'event-speaker'], bio: 'Building autonomous AI agent systems.' },
  { id: 'mem-5', name: 'rustacean_dev', email: 'rust@dev.rs', avatar: null, platform: 'github', role: 'contributor', status: 'active', joinDate: '2025-08-20T00:00:00Z', lastActive: '2026-02-15T06:00:00Z', activityScore: 890, messageCount: 34, badges: ['early-adopter', 'bug-hunter', 'top-contributor'], bio: 'Rust developer. OSS contributor. Loves systems programming.' },
  { id: 'mem-6', name: 'oss_contributor', email: 'oss@github.dev', avatar: null, platform: 'github', role: 'moderator', status: 'active', joinDate: '2025-09-01T00:00:00Z', lastActive: '2026-02-14T23:30:00Z', activityScore: 695, messageCount: 29, badges: ['early-adopter', 'top-contributor', 'ambassador'], bio: 'Open source advocate. Community moderator.' },
  { id: 'mem-7', name: '@decentralize_now', email: 'decnow@x.com', avatar: null, platform: 'x', role: 'member', status: 'active', joinDate: '2025-11-15T00:00:00Z', lastActive: '2026-02-15T11:00:00Z', activityScore: 720, messageCount: 28, badges: ['top-contributor'], bio: 'Decentralization maximalist. Tweeting about the future of cloud.' },
  { id: 'mem-8', name: 'nixos_enjoyer', email: 'nix@os.dev', avatar: null, platform: 'discord', role: 'member', status: 'active', joinDate: '2025-12-20T00:00:00Z', lastActive: '2026-02-14T18:45:00Z', activityScore: 380, messageCount: 41, badges: ['beta-tester'], bio: 'NixOS user. Infrastructure nerd.' },
  { id: 'mem-9', name: 'spam_bot_99', email: 'spam@bot.net', avatar: null, platform: 'discord', role: 'member', status: 'banned', joinDate: '2026-02-14T02:50:00Z', lastActive: '2026-02-14T03:00:00Z', activityScore: 0, messageCount: 1, badges: [], bio: null },
  { id: 'mem-10', name: 'fullstack_fiona', email: 'fiona@stack.dev', avatar: null, platform: 'discord', role: 'member', status: 'active', joinDate: '2025-10-25T00:00:00Z', lastActive: '2026-02-14T15:20:00Z', activityScore: 440, messageCount: 51, badges: ['beta-tester'], bio: 'Full-stack developer. Mobile-first advocate.' },
  { id: 'mem-11', name: '@web3_critic', email: 'critic@x.com', avatar: null, platform: 'x', role: 'member', status: 'muted', joinDate: '2026-01-05T00:00:00Z', lastActive: '2026-02-14T20:00:00Z', activityScore: 120, messageCount: 8, badges: [], bio: 'Keeping web3 honest.' },
  { id: 'mem-12', name: 'security_first', email: 'sec@audit.io', avatar: null, platform: 'github', role: 'contributor', status: 'active', joinDate: '2025-09-10T00:00:00Z', lastActive: '2026-02-13T10:30:00Z', activityScore: 610, messageCount: 21, badges: ['early-adopter', 'bug-hunter'], bio: 'Security researcher. Pen tester. OWASP contributor.' },
]

let mockMembers = [...SEED_MEMBERS]

export async function fetchCommunityMembers(token: string): Promise<CommunityMember[]> {
  if (useSeedData()) return mockMembers
  return mockMembers
}

export async function updateMemberStatus(token: string, memberId: string, status: MemberStatus): Promise<CommunityMember> {
  const idx = mockMembers.findIndex((m) => m.id === memberId)
  if (idx === -1) throw new Error('Member not found')
  mockMembers[idx] = { ...mockMembers[idx], status }
  return mockMembers[idx]
}

export async function updateMemberRole(token: string, memberId: string, role: MemberRole): Promise<CommunityMember> {
  const idx = mockMembers.findIndex((m) => m.id === memberId)
  if (idx === -1) throw new Error('Member not found')
  mockMembers[idx] = { ...mockMembers[idx], role }
  return mockMembers[idx]
}

export { SEED_MEMBERS }
