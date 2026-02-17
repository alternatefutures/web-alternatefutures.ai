// ---------------------------------------------------------------------------
// Alerts API Service
// Automated alert system for competitor activity, market shifts, and thresholds
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AlertCategory = 'competitor' | 'market' | 'pricing' | 'technology' | 'sentiment' | 'threshold'
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'muted'

export interface Alert {
  id: string
  category: AlertCategory
  severity: AlertSeverity
  status: AlertStatus
  title: string
  description: string
  source: string
  sourceUrl: string
  triggeredAt: string
  acknowledgedAt: string | null
  resolvedAt: string | null
  relatedCompetitors: string[]
  tags: string[]
  metadata: Record<string, string | number>
}

export interface AlertRule {
  id: string
  name: string
  category: AlertCategory
  enabled: boolean
  condition: string
  threshold: number | null
  description: string
  lastTriggered: string | null
  triggerCount: number
  createdAt: string
}

export interface AlertStats {
  totalAlerts: number
  activeAlerts: number
  criticalAlerts: number
  alertsToday: number
  avgResponseTime: string
  topCategory: AlertCategory
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ALERT_SEVERITY_STYLES: Record<AlertSeverity, { bg: string; color: string; label: string }> = {
  critical: { bg: '#FEE2E2', color: '#991B1B', label: 'Critical' },
  high: { bg: '#FEF3C7', color: '#92400E', label: 'High' },
  medium: { bg: '#DBEAFE', color: '#1E40AF', label: 'Medium' },
  low: { bg: '#F3F4F6', color: '#6B7280', label: 'Low' },
}

export const ALERT_STATUS_STYLES: Record<AlertStatus, { bg: string; color: string; label: string }> = {
  active: { bg: '#FEE2E2', color: '#991B1B', label: 'Active' },
  acknowledged: { bg: '#FEF3C7', color: '#92400E', label: 'Acknowledged' },
  resolved: { bg: '#D1FAE5', color: '#065F46', label: 'Resolved' },
  muted: { bg: '#F3F4F6', color: '#9CA3AF', label: 'Muted' },
}

export const ALERT_CATEGORY_LABELS: Record<AlertCategory, string> = {
  competitor: 'Competitor',
  market: 'Market',
  pricing: 'Pricing',
  technology: 'Technology',
  sentiment: 'Sentiment',
  threshold: 'Threshold',
}

// ---------------------------------------------------------------------------
// Seed data — Alerts
// ---------------------------------------------------------------------------

const SEED_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    category: 'pricing',
    severity: 'high',
    status: 'active',
    title: 'Vercel Enterprise Price Increase Detected',
    description: 'Vercel raised enterprise minimum from $2,500 to $3,500/mo. This widens our pricing advantage in the enterprise segment.',
    source: 'Vercel Blog',
    sourceUrl: 'https://vercel.com/blog/enterprise-pricing-update',
    triggeredAt: '2026-02-15T10:30:00Z',
    acknowledgedAt: null,
    resolvedAt: null,
    relatedCompetitors: ['comp-vercel'],
    tags: ['pricing', 'enterprise', 'opportunity'],
    metadata: { oldPrice: 2500, newPrice: 3500, changePercent: 40 },
  },
  {
    id: 'alert-002',
    category: 'competitor',
    severity: 'critical',
    status: 'active',
    title: 'Netlify Workforce Reduction — 15% Layoffs',
    description: 'Netlify laid off ~75 employees (15% of workforce). Refocusing on enterprise. Potential to capture displaced developer mindshare.',
    source: 'The Verge',
    sourceUrl: 'https://theverge.com/2026/netlify-layoffs',
    triggeredAt: '2026-02-14T12:00:00Z',
    acknowledgedAt: null,
    resolvedAt: null,
    relatedCompetitors: ['comp-netlify'],
    tags: ['layoffs', 'opportunity', 'enterprise'],
    metadata: { layoffPercent: 15, estimatedAffected: 75 },
  },
  {
    id: 'alert-003',
    category: 'market',
    severity: 'medium',
    status: 'acknowledged',
    title: 'DePIN Revenue Grew 340% YoY in Q4 2025',
    description: 'Messari reports $180M in DePIN revenue for Q4 2025. Compute networks account for 45% of total. Strong tailwind for AF positioning.',
    source: 'Messari',
    sourceUrl: 'https://messari.io/report/depin-q4-2025',
    triggeredAt: '2026-02-13T09:00:00Z',
    acknowledgedAt: '2026-02-13T11:00:00Z',
    resolvedAt: null,
    relatedCompetitors: [],
    tags: ['depin', 'revenue', 'growth'],
    metadata: { revenue: 180000000, yoyGrowth: 340 },
  },
  {
    id: 'alert-004',
    category: 'sentiment',
    severity: 'high',
    status: 'active',
    title: 'Kelsey Hightower Endorses Decentralized Cloud',
    description: 'Former Google engineer compared decentralized cloud to "Kubernetes in 2015." Tweet got 12K likes. Major validation signal.',
    source: 'Twitter/X',
    sourceUrl: 'https://x.com/kelseyhightower/status/12345',
    triggeredAt: '2026-02-13T19:00:00Z',
    acknowledgedAt: null,
    resolvedAt: null,
    relatedCompetitors: [],
    tags: ['endorsement', 'influencer', 'decentralized'],
    metadata: { likes: 12000, retweets: 3000 },
  },
  {
    id: 'alert-005',
    category: 'technology',
    severity: 'medium',
    status: 'acknowledged',
    title: 'IPFS 3.0 Announced — 10x Faster Routing',
    description: 'Protocol Labs announced IPFS 3.0 with Accelerated DHT. 10x faster content routing directly benefits AF hosting performance.',
    source: 'IPFS Blog',
    sourceUrl: 'https://blog.ipfs.tech/2026-02-ipfs-3',
    triggeredAt: '2026-02-14T16:00:00Z',
    acknowledgedAt: '2026-02-14T17:00:00Z',
    resolvedAt: null,
    relatedCompetitors: [],
    tags: ['ipfs', 'performance', 'upgrade'],
    metadata: { speedup: 10 },
  },
  {
    id: 'alert-006',
    category: 'competitor',
    severity: 'medium',
    status: 'resolved',
    title: 'Render Exploring IPO at $2-3B Valuation',
    description: 'Bloomberg reports Render in early IPO talks for Q4 2026. Could increase marketing spend and competitive pressure.',
    source: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com/render-ipo-2026',
    triggeredAt: '2026-02-12T09:30:00Z',
    acknowledgedAt: '2026-02-12T10:00:00Z',
    resolvedAt: '2026-02-12T14:00:00Z',
    relatedCompetitors: ['comp-render'],
    tags: ['ipo', 'funding', 'render'],
    metadata: { valuationLow: 2000000000, valuationHigh: 3000000000 },
  },
  {
    id: 'alert-007',
    category: 'pricing',
    severity: 'low',
    status: 'resolved',
    title: 'DigitalOcean Drops App Platform to $3/mo',
    description: 'DO reduced basic container from $5 to $3/mo. Undercutting Railway and Render on entry-level pricing.',
    source: 'DigitalOcean Blog',
    sourceUrl: 'https://digitalocean.com/blog/app-platform-pricing-2026',
    triggeredAt: '2026-02-11T12:00:00Z',
    acknowledgedAt: '2026-02-11T13:00:00Z',
    resolvedAt: '2026-02-11T16:00:00Z',
    relatedCompetitors: ['comp-digitalocean'],
    tags: ['pricing', 'decrease', 'digitalocean'],
    metadata: { oldPrice: 5, newPrice: 3 },
  },
  {
    id: 'alert-008',
    category: 'threshold',
    severity: 'medium',
    status: 'active',
    title: 'Vercel Traffic 2x Netlify — Gap Widening',
    description: 'SimilarWeb: Vercel 18M visits vs Netlify 8.5M in Jan 2026. Gap widened from 1.5x to 2x. Vercel consolidating market leadership.',
    source: 'SimilarWeb',
    sourceUrl: 'https://similarweb.com/comparison/vercel-vs-netlify',
    triggeredAt: '2026-02-12T11:00:00Z',
    acknowledgedAt: null,
    resolvedAt: null,
    relatedCompetitors: ['comp-vercel', 'comp-netlify'],
    tags: ['traffic', 'market-share', 'comparison'],
    metadata: { vercelTraffic: 18000000, netlifyTraffic: 8500000, ratio: 2.12 },
  },
  {
    id: 'alert-009',
    category: 'sentiment',
    severity: 'high',
    status: 'acknowledged',
    title: 'Viral Vercel Bill Shock Post — 500+ HN Comments',
    description: 'Developer posted about $20→$4,200 Vercel bill. 500+ comments of shared frustration. Strong signal for cost-transparent messaging.',
    source: 'Hacker News',
    sourceUrl: 'https://news.ycombinator.com/item?id=39123456',
    triggeredAt: '2026-02-10T21:00:00Z',
    acknowledgedAt: '2026-02-10T22:00:00Z',
    resolvedAt: null,
    relatedCompetitors: ['comp-vercel'],
    tags: ['bill-shock', 'sentiment', 'opportunity'],
    metadata: { comments: 500, originalBill: 20, spikedBill: 4200 },
  },
  {
    id: 'alert-010',
    category: 'market',
    severity: 'low',
    status: 'resolved',
    title: 'Developer Survey: 62% Want Decentralized Hosting',
    description: 'Reddit r/webdev survey with 2,400 respondents. Key motivators: lower costs (78%), censorship resistance (45%), data sovereignty (52%).',
    source: 'Reddit r/webdev',
    sourceUrl: 'https://reddit.com/r/webdev/comments/xyz123',
    triggeredAt: '2026-02-10T09:00:00Z',
    acknowledgedAt: '2026-02-10T10:00:00Z',
    resolvedAt: '2026-02-10T12:00:00Z',
    relatedCompetitors: [],
    tags: ['survey', 'decentralized', 'developer-interest'],
    metadata: { respondents: 2400, interestPercent: 62 },
  },
  {
    id: 'alert-011',
    category: 'technology',
    severity: 'low',
    status: 'resolved',
    title: 'Cloudflare Workers AI Reaches GA',
    description: 'Serverless GPU inference at edge, 300+ locations. Pay-per-request. Competitive threat in AI workload hosting.',
    source: 'Cloudflare Blog',
    sourceUrl: 'https://blog.cloudflare.com/workers-ai-ga',
    triggeredAt: '2026-02-08T17:00:00Z',
    acknowledgedAt: '2026-02-08T18:00:00Z',
    resolvedAt: '2026-02-09T10:00:00Z',
    relatedCompetitors: ['comp-cloudflare'],
    tags: ['ai', 'cloudflare', 'edge'],
    metadata: { locations: 300 },
  },
  {
    id: 'alert-012',
    category: 'competitor',
    severity: 'low',
    status: 'muted',
    title: 'Fly.io Expands GPU to 12 Regions',
    description: 'A100 and L4 GPUs now in 12 regions. Targeting AI inference workloads with per-second billing.',
    source: 'Fly.io Blog',
    sourceUrl: 'https://fly.io/blog/gpus-anywhere',
    triggeredAt: '2026-02-07T16:00:00Z',
    acknowledgedAt: null,
    resolvedAt: null,
    relatedCompetitors: ['comp-flyio'],
    tags: ['gpu', 'expansion', 'flyio'],
    metadata: { regions: 12 },
  },
]

// ---------------------------------------------------------------------------
// Seed data — Alert Rules
// ---------------------------------------------------------------------------

const SEED_RULES: AlertRule[] = [
  {
    id: 'rule-001',
    name: 'Competitor Pricing Change',
    category: 'pricing',
    enabled: true,
    condition: 'Any tracked competitor changes pricing by more than threshold',
    threshold: 10,
    description: 'Triggers when a competitor raises or lowers prices by more than 10%',
    lastTriggered: '2026-02-15T10:30:00Z',
    triggerCount: 4,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-002',
    name: 'Funding Round Alert',
    category: 'competitor',
    enabled: true,
    condition: 'Competitor raises funding (any round)',
    threshold: null,
    description: 'Triggers on any funding announcement from tracked competitors',
    lastTriggered: '2026-01-15T12:00:00Z',
    triggerCount: 2,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-003',
    name: 'Market Share Shift',
    category: 'threshold',
    enabled: true,
    condition: 'Any competitor gains or loses more than threshold market share points',
    threshold: 2,
    description: 'Triggers when market share shifts significantly',
    lastTriggered: '2026-02-12T11:00:00Z',
    triggerCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-004',
    name: 'Negative Sentiment Spike',
    category: 'sentiment',
    enabled: true,
    condition: 'Negative sentiment score exceeds threshold for any competitor',
    threshold: 75,
    description: 'Triggers when a competitor receives >75% negative sentiment in a 24h window',
    lastTriggered: '2026-02-10T21:00:00Z',
    triggerCount: 2,
    createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'rule-005',
    name: 'Product Launch Detection',
    category: 'technology',
    enabled: true,
    condition: 'Competitor announces new product or major feature',
    threshold: null,
    description: 'Monitors competitor blogs and news for product launch announcements',
    lastTriggered: '2026-02-08T17:00:00Z',
    triggerCount: 6,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-006',
    name: 'DePIN Revenue Milestone',
    category: 'market',
    enabled: true,
    condition: 'DePIN sector revenue exceeds threshold QoQ growth',
    threshold: 50,
    description: 'Triggers when DePIN quarterly revenue growth exceeds 50%',
    lastTriggered: '2026-02-13T09:00:00Z',
    triggerCount: 2,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'rule-007',
    name: 'Workforce Changes',
    category: 'competitor',
    enabled: true,
    condition: 'Competitor layoffs or major hiring announcements',
    threshold: null,
    description: 'Monitors news for significant workforce changes at competitors',
    lastTriggered: '2026-02-14T12:00:00Z',
    triggerCount: 1,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'rule-008',
    name: 'Influencer Endorsement',
    category: 'sentiment',
    enabled: false,
    condition: 'Tech influencer mentions decentralized cloud or AF',
    threshold: null,
    description: 'Monitors social feeds for endorsements from tracked influencers',
    lastTriggered: '2026-02-13T19:00:00Z',
    triggerCount: 3,
    createdAt: '2026-01-20T00:00:00Z',
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
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data
}

// ---------------------------------------------------------------------------
// In-memory mock stores
// ---------------------------------------------------------------------------

let mockAlerts = [...SEED_ALERTS]
let mockRules = [...SEED_RULES]

// ---------------------------------------------------------------------------
// Alert CRUD
// ---------------------------------------------------------------------------

export async function fetchAlerts(
  filters?: { category?: AlertCategory; severity?: AlertSeverity; status?: AlertStatus; search?: string },
): Promise<Alert[]> {
  try {
    const data = await graphqlFetch<{ alerts: Alert[] }>(
      `query Alerts($category: String, $severity: String, $status: String) {
        alerts(category: $category, severity: $severity, status: $status) {
          id category severity status title description source sourceUrl
          triggeredAt acknowledgedAt resolvedAt relatedCompetitors tags metadata
        }
      }`,
      filters,
    )
    return data.alerts
  } catch {
    if (useSeedData()) {
      let result = [...mockAlerts]
      if (filters?.category) result = result.filter((a) => a.category === filters.category)
      if (filters?.severity) result = result.filter((a) => a.severity === filters.severity)
      if (filters?.status) result = result.filter((a) => a.status === filters.status)
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        result = result.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q)),
        )
      }
      return result.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
    }
    return []
  }
}

export async function fetchAlertById(id: string): Promise<Alert | null> {
  if (useSeedData()) return mockAlerts.find((a) => a.id === id) || null
  return null
}

export async function acknowledgeAlert(id: string): Promise<Alert> {
  if (useSeedData()) {
    const idx = mockAlerts.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Alert not found')
    mockAlerts[idx] = { ...mockAlerts[idx], status: 'acknowledged', acknowledgedAt: new Date().toISOString() }
    return mockAlerts[idx]
  }
  throw new Error('Not implemented')
}

export async function resolveAlert(id: string): Promise<Alert> {
  if (useSeedData()) {
    const idx = mockAlerts.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Alert not found')
    mockAlerts[idx] = { ...mockAlerts[idx], status: 'resolved', resolvedAt: new Date().toISOString() }
    return mockAlerts[idx]
  }
  throw new Error('Not implemented')
}

export async function muteAlert(id: string): Promise<Alert> {
  if (useSeedData()) {
    const idx = mockAlerts.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Alert not found')
    mockAlerts[idx] = { ...mockAlerts[idx], status: 'muted' }
    return mockAlerts[idx]
  }
  throw new Error('Not implemented')
}

export async function deleteAlert(id: string): Promise<void> {
  if (useSeedData()) {
    mockAlerts = mockAlerts.filter((a) => a.id !== id)
  }
}

// ---------------------------------------------------------------------------
// Alert Rules CRUD
// ---------------------------------------------------------------------------

export async function fetchAlertRules(): Promise<AlertRule[]> {
  if (useSeedData()) return [...mockRules]
  return []
}

export async function toggleAlertRule(id: string): Promise<AlertRule> {
  if (useSeedData()) {
    const idx = mockRules.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Rule not found')
    mockRules[idx] = { ...mockRules[idx], enabled: !mockRules[idx].enabled }
    return mockRules[idx]
  }
  throw new Error('Not implemented')
}

export async function createAlertRule(rule: Omit<AlertRule, 'id' | 'lastTriggered' | 'triggerCount' | 'createdAt'>): Promise<AlertRule> {
  const newRule: AlertRule = {
    ...rule,
    id: `rule-${Date.now()}`,
    lastTriggered: null,
    triggerCount: 0,
    createdAt: new Date().toISOString(),
  }
  if (useSeedData()) mockRules = [newRule, ...mockRules]
  return newRule
}

export async function deleteAlertRule(id: string): Promise<void> {
  if (useSeedData()) {
    mockRules = mockRules.filter((r) => r.id !== id)
  }
}

// ---------------------------------------------------------------------------
// Alert Stats
// ---------------------------------------------------------------------------

export async function fetchAlertStats(): Promise<AlertStats> {
  if (useSeedData()) {
    const today = new Date().toISOString().split('T')[0]
    return {
      totalAlerts: mockAlerts.length,
      activeAlerts: mockAlerts.filter((a) => a.status === 'active').length,
      criticalAlerts: mockAlerts.filter((a) => a.severity === 'critical' && a.status === 'active').length,
      alertsToday: mockAlerts.filter((a) => a.triggeredAt.startsWith(today)).length,
      avgResponseTime: '2.4h',
      topCategory: 'competitor',
    }
  }
  return { totalAlerts: 0, activeAlerts: 0, criticalAlerts: 0, alertsToday: 0, avgResponseTime: '—', topCategory: 'competitor' }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { SEED_ALERTS, SEED_RULES }
