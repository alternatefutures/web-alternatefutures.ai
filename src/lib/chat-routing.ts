// ---------------------------------------------------------------------------
// BF-XX-009 — Page-to-Agent Routing
// Maps current page path to the most relevant agent for the contextual chat.
// Routing config is a manifest (not hardcoded per page) so new pages just add
// entries to AGENT_MANIFEST.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Agent Registry
// ---------------------------------------------------------------------------

export interface AgentProfile {
  agentId: string
  agentName: string
  agentHandle: string
  agentAvatar: string // 2-letter abbreviation for avatar circle
  role: string
  color: string
  greeting: string
}

const AGENTS: Record<string, AgentProfile> = {
  'content-writer': {
    agentId: 'content-writer',
    agentName: 'Lyra',
    agentHandle: 'content-writer',
    agentAvatar: 'Ly',
    role: 'Content Writer',
    color: '#C9A84C',
    greeting:
      'Content hub active. I can help draft posts, transform content across platforms, or review copy for voice consistency.',
  },
  'brand-guardian': {
    agentId: 'brand-guardian',
    agentName: 'Nori',
    agentHandle: 'brand-guardian',
    agentAvatar: 'No',
    role: 'Brand Guardian',
    color: '#8B5E3C',
    greeting:
      'Brand oversight engaged. I can check compliance scores, audit visual assets, or review terminology usage.',
  },
  'strategic-orchestrator': {
    agentId: 'strategic-orchestrator',
    agentName: 'Vera',
    agentHandle: 'strategic-orchestrator',
    agentAvatar: 'Ve',
    role: 'Strategic Orchestrator',
    color: '#BE4200',
    greeting:
      'Executive view ready. I can surface priorities, assess OKR progress, or coordinate tasks across the team.',
  },
  'growth-hacker': {
    agentId: 'growth-hacker',
    agentName: 'Kai',
    agentHandle: 'growth-hacker',
    agentAvatar: 'Ka',
    role: 'Growth Hacker',
    color: '#2D8659',
    greeting:
      'Growth metrics loaded. I can analyze funnels, propose experiments, or break down performance anomalies.',
  },
  'community-manager': {
    agentId: 'community-manager',
    agentName: 'Sol',
    agentHandle: 'community-manager',
    agentAvatar: 'So',
    role: 'Community Manager',
    color: '#5C7A6B',
    greeting:
      'Community pulse active. I can help with member profiles, engagement trends, or draft outreach messages.',
  },
  partnerships: {
    agentId: 'partnerships',
    agentName: 'Rio',
    agentHandle: 'partnerships',
    agentAvatar: 'Ri',
    role: 'Partnerships & Grants',
    color: '#6A5ACD',
    greeting:
      'Partnership pipeline ready. I can check grant deadlines, draft outreach, or assess partner health scores.',
  },
  'devrel-lead': {
    agentId: 'devrel-lead',
    agentName: 'Kit',
    agentHandle: 'devrel-lead',
    agentAvatar: 'Ki',
    role: 'DevRel Lead',
    color: '#3D5AFE',
    greeting:
      'Developer relations online. I can manage changelogs, sync docs, or check workshop registrations.',
  },
  'market-intel': {
    agentId: 'market-intel',
    agentName: 'Sage',
    agentHandle: 'market-intel',
    agentAvatar: 'Sa',
    role: 'Market Intelligence',
    color: '#4E8CA8',
    greeting:
      'Intelligence feeds active. I can generate battle cards, compare competitor pricing, or surface recent market shifts.',
  },
}

// ---------------------------------------------------------------------------
// Route Manifest
// ---------------------------------------------------------------------------

interface RouteEntry {
  /** Glob-like prefix — longest prefix wins */
  pattern: string
  primaryAgent: string
  secondaryAgents: string[]
  quickActions: string[]
}

/**
 * Ordered from most specific to least specific. The matching algorithm walks
 * this list and picks the first entry whose pattern is a prefix of the
 * current pathname.
 */
const AGENT_MANIFEST: RouteEntry[] = [
  // Social / Content
  {
    pattern: '/admin/social',
    primaryAgent: 'content-writer',
    secondaryAgents: ['brand-guardian'],
    quickActions: ['Draft a post about...', 'Transform this content', 'Check brand compliance'],
  },
  {
    pattern: '/admin/blog',
    primaryAgent: 'content-writer',
    secondaryAgents: ['brand-guardian'],
    quickActions: ['Draft a post about...', 'Transform this content', 'Check brand compliance'],
  },
  {
    pattern: '/admin/content',
    primaryAgent: 'content-writer',
    secondaryAgents: ['brand-guardian'],
    quickActions: ['Draft a post about...', 'Transform this content', 'Check brand compliance'],
  },

  // Brand
  {
    pattern: '/admin/brand',
    primaryAgent: 'brand-guardian',
    secondaryAgents: ['content-writer'],
    quickActions: ['Check brand compliance', 'Audit terminology', 'Review visual assets'],
  },
  {
    pattern: '/admin/assets',
    primaryAgent: 'brand-guardian',
    secondaryAgents: ['content-writer'],
    quickActions: ['Check brand compliance', 'Find assets for...'],
  },

  // Intelligence
  {
    pattern: '/admin/intel',
    primaryAgent: 'market-intel',
    secondaryAgents: ['strategic-orchestrator', 'content-writer'],
    quickActions: ['Generate battle card', 'Compare pricing', 'Draft competitive response'],
  },
  {
    pattern: '/admin/intelligence',
    primaryAgent: 'market-intel',
    secondaryAgents: ['strategic-orchestrator', 'content-writer'],
    quickActions: ['Generate battle card', 'Compare pricing', 'Draft competitive response'],
  },

  // Growth & Analytics
  {
    pattern: '/admin/analytics',
    primaryAgent: 'growth-hacker',
    secondaryAgents: ['strategic-orchestrator'],
    quickActions: ['Explain this trend', 'What drove this metric?', 'Propose experiment'],
  },
  {
    pattern: '/admin/growth',
    primaryAgent: 'growth-hacker',
    secondaryAgents: ['strategic-orchestrator'],
    quickActions: ['Analyze this funnel', 'Propose experiment', 'Explain this anomaly'],
  },

  // AI Search / AEO
  {
    pattern: '/admin/ai-search/schema',
    primaryAgent: 'devrel-lead',
    secondaryAgents: ['content-writer'],
    quickActions: ['Validate all schema', 'Which pages missing schema?', 'Auto-generate FAQ schema'],
  },
  {
    pattern: '/admin/ai-search/crawlers',
    primaryAgent: 'devrel-lead',
    secondaryAgents: ['growth-hacker'],
    quickActions: ['Is GPTBot blocked?', 'Crawl frequency this week', 'Update llms.txt'],
  },
  {
    pattern: '/admin/ai-search/competitors',
    primaryAgent: 'market-intel',
    secondaryAgents: ['growth-hacker'],
    quickActions: ['AI visibility comparison', 'Who gained SOV?', 'Sentiment comparison'],
  },
  {
    pattern: '/admin/ai-search',
    primaryAgent: 'growth-hacker',
    secondaryAgents: ['market-intel', 'content-writer', 'devrel-lead'],
    quickActions: ['How is our AI visibility?', 'Where are we cited?', 'What gaps to fill?'],
  },

  // Community & People
  {
    pattern: '/admin/community',
    primaryAgent: 'community-manager',
    secondaryAgents: ['devrel-lead'],
    quickActions: ['Draft a response', 'Escalate this thread', 'Create ticket'],
  },
  {
    pattern: '/admin/people',
    primaryAgent: 'community-manager',
    secondaryAgents: ['partnerships', 'market-intel'],
    quickActions: ['Summarize this person', 'Find related people', 'Draft outreach'],
  },

  // Partnerships & Grants
  {
    pattern: '/admin/partnerships',
    primaryAgent: 'partnerships',
    secondaryAgents: ['community-manager', 'market-intel'],
    quickActions: ['Draft outreach', 'Check grant deadline', 'Assess partner health'],
  },

  // DevRel & Workshops
  {
    pattern: '/admin/devrel',
    primaryAgent: 'devrel-lead',
    secondaryAgents: ['community-manager', 'growth-hacker'],
    quickActions: ['Sync docs', 'Check workshop registrations', 'Generate promotion campaign'],
  },
  {
    pattern: '/admin/workshops/analytics',
    primaryAgent: 'growth-hacker',
    secondaryAgents: ['devrel-lead', 'strategic-orchestrator'],
    quickActions: ['Workshops driving signups?', 'Attendance trends', 'Revenue this quarter'],
  },
  {
    pattern: '/admin/workshops',
    primaryAgent: 'devrel-lead',
    secondaryAgents: ['community-manager', 'growth-hacker'],
    quickActions: ['Create a workshop about...', 'Registration status', 'Generate promotion campaign'],
  },

  // Scheduling
  {
    pattern: '/admin/scheduling/analytics',
    primaryAgent: 'growth-hacker',
    secondaryAgents: ['community-manager', 'strategic-orchestrator'],
    quickActions: ['Utilization heatmap', 'Revenue by service', 'Cancellation trends'],
  },
  {
    pattern: '/admin/scheduling',
    primaryAgent: 'community-manager',
    secondaryAgents: ['growth-hacker', 'strategic-orchestrator'],
    quickActions: ['Create a coaching service', 'What is booked this week?', 'Revenue by service'],
  },

  // Commerce
  {
    pattern: '/admin/commerce',
    primaryAgent: 'growth-hacker',
    secondaryAgents: ['brand-guardian', 'community-manager'],
    quickActions: ['Create swag drop campaign', 'Check inventory', 'Generate discount code'],
  },

  // Strategy & OKRs
  {
    pattern: '/admin/strategy',
    primaryAgent: 'strategic-orchestrator',
    secondaryAgents: ['growth-hacker'],
    quickActions: ['Update OKR progress', 'Assess risks', 'Generate weekly report'],
  },

  // Budget
  {
    pattern: '/admin/budget',
    primaryAgent: 'strategic-orchestrator',
    secondaryAgents: ['growth-hacker'],
    quickActions: ['Project burn rate', 'Suggest reallocation'],
  },

  // Agents management
  {
    pattern: '/admin/agents',
    primaryAgent: 'strategic-orchestrator',
    secondaryAgents: [],
    quickActions: ['Check agent workload', 'Reassign task'],
  },

  // Calendar
  {
    pattern: '/admin/calendar',
    primaryAgent: 'strategic-orchestrator',
    secondaryAgents: ['content-writer'],
    quickActions: ['What is scheduled this week?', 'Find conflicts'],
  },

  // Trending
  {
    pattern: '/admin/trending',
    primaryAgent: 'content-writer',
    secondaryAgents: ['market-intel'],
    quickActions: ['Explore top trends', 'Draft response to trend'],
  },

  // Settings
  {
    pattern: '/admin/settings',
    primaryAgent: 'strategic-orchestrator',
    secondaryAgents: [],
    quickActions: ['Review current config'],
  },

  // Dashboard (fallback for /admin)
  {
    pattern: '/admin',
    primaryAgent: 'strategic-orchestrator',
    secondaryAgents: [],
    quickActions: ['Summarize today', 'What needs my attention?'],
  },
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface AgentRouteResult {
  agentId: string
  agentName: string
  agentHandle: string
  agentAvatar: string
  role: string
  color: string
  greeting: string
  secondaryAgents: AgentProfile[]
  quickActions: string[]
}

/**
 * Returns the most relevant agent for the given pathname, plus secondary
 * agents and quick actions. Uses longest-prefix matching.
 */
export function getAgentForPage(pathname: string): AgentRouteResult {
  // Sort by pattern length descending so longest prefix wins
  const sorted = [...AGENT_MANIFEST].sort(
    (a, b) => b.pattern.length - a.pattern.length,
  )

  const match = sorted.find((entry) => pathname.startsWith(entry.pattern))
  const entry = match ?? AGENT_MANIFEST[AGENT_MANIFEST.length - 1] // fallback to dashboard

  const primary = AGENTS[entry.primaryAgent] ?? AGENTS['strategic-orchestrator']
  const secondaries = entry.secondaryAgents
    .map((id) => AGENTS[id])
    .filter(Boolean)

  return {
    ...primary,
    secondaryAgents: secondaries,
    quickActions: entry.quickActions,
  }
}

/**
 * Returns the full agent profile for a given agentId.
 */
export function getAgentById(agentId: string): AgentProfile | undefined {
  return AGENTS[agentId]
}

/**
 * Returns all registered agents (for agent-picker UI).
 */
export function getAllAgents(): AgentProfile[] {
  return Object.values(AGENTS)
}
