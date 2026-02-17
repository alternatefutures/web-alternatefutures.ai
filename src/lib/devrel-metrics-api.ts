// ---------------------------------------------------------------------------
// BF-DR-012: Developer Community Metrics Dashboard
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DevRelMetrics {
  id: string
  period: string // YYYY-MM format
  npmDownloads: number
  githubStars: number
  githubForks: number
  openIssues: number
  closedIssues: number
  prMergeTime: number // hours
  docsPageviews: number
  cliInstalls: number
  sdkDownloads: number
  tutorialCompletions: number
  communityQuestions: number
  communityAnswers: number
}

export interface DevRelMetricsSummary {
  totalNpmDownloads: number
  totalGithubStars: number
  totalDocPageviews: number
  avgPrMergeTime: number
  totalCommunityQuestions: number
  answerRate: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const METRIC_LABELS: Record<keyof Omit<DevRelMetrics, 'id' | 'period'>, string> = {
  npmDownloads: 'npm Downloads',
  githubStars: 'GitHub Stars',
  githubForks: 'GitHub Forks',
  openIssues: 'Open Issues',
  closedIssues: 'Closed Issues',
  prMergeTime: 'PR Merge Time (hrs)',
  docsPageviews: 'Docs Pageviews',
  cliInstalls: 'CLI Installs',
  sdkDownloads: 'SDK Downloads',
  tutorialCompletions: 'Tutorial Completions',
  communityQuestions: 'Community Questions',
  communityAnswers: 'Community Answers',
}

export const METRIC_COLORS: Record<string, string> = {
  npmDownloads: '#CB3837',
  githubStars: '#FFC107',
  githubForks: '#6366F1',
  openIssues: '#EF4444',
  closedIssues: '#22C55E',
  prMergeTime: '#3B82F6',
  docsPageviews: '#000AFF',
  cliInstalls: '#BE4200',
  sdkDownloads: '#8B5CF6',
  tutorialCompletions: '#14B8A6',
  communityQuestions: '#F97316',
  communityAnswers: '#2D8659',
}

// ---------------------------------------------------------------------------
// GraphQL client (authenticated)
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/graphql'

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
// Seed data — 6 months of metrics (Sep 2025 – Feb 2026)
// ---------------------------------------------------------------------------

const SEED_METRICS: DevRelMetrics[] = [
  {
    id: 'dm-202509',
    period: '2025-09',
    npmDownloads: 1240,
    githubStars: 312,
    githubForks: 45,
    openIssues: 28,
    closedIssues: 15,
    prMergeTime: 72,
    docsPageviews: 8500,
    cliInstalls: 380,
    sdkDownloads: 620,
    tutorialCompletions: 85,
    communityQuestions: 42,
    communityAnswers: 31,
  },
  {
    id: 'dm-202510',
    period: '2025-10',
    npmDownloads: 1890,
    githubStars: 487,
    githubForks: 62,
    openIssues: 35,
    closedIssues: 22,
    prMergeTime: 64,
    docsPageviews: 12400,
    cliInstalls: 520,
    sdkDownloads: 890,
    tutorialCompletions: 128,
    communityQuestions: 67,
    communityAnswers: 48,
  },
  {
    id: 'dm-202511',
    period: '2025-11',
    npmDownloads: 2650,
    githubStars: 680,
    githubForks: 89,
    openIssues: 41,
    closedIssues: 38,
    prMergeTime: 48,
    docsPageviews: 18200,
    cliInstalls: 710,
    sdkDownloads: 1340,
    tutorialCompletions: 195,
    communityQuestions: 98,
    communityAnswers: 76,
  },
  {
    id: 'dm-202512',
    period: '2025-12',
    npmDownloads: 3420,
    githubStars: 920,
    githubForks: 112,
    openIssues: 52,
    closedIssues: 45,
    prMergeTime: 42,
    docsPageviews: 22800,
    cliInstalls: 890,
    sdkDownloads: 1780,
    tutorialCompletions: 260,
    communityQuestions: 135,
    communityAnswers: 108,
  },
  {
    id: 'dm-202601',
    period: '2026-01',
    npmDownloads: 4810,
    githubStars: 1280,
    githubForks: 148,
    openIssues: 64,
    closedIssues: 58,
    prMergeTime: 36,
    docsPageviews: 31500,
    cliInstalls: 1240,
    sdkDownloads: 2450,
    tutorialCompletions: 340,
    communityQuestions: 178,
    communityAnswers: 152,
  },
  {
    id: 'dm-202602',
    period: '2026-02',
    npmDownloads: 5630,
    githubStars: 1580,
    githubForks: 175,
    openIssues: 58,
    closedIssues: 72,
    prMergeTime: 28,
    docsPageviews: 38200,
    cliInstalls: 1580,
    sdkDownloads: 3100,
    tutorialCompletions: 415,
    communityQuestions: 210,
    communityAnswers: 189,
  },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// In-memory mock store
// ---------------------------------------------------------------------------

const mockMetrics = [...SEED_METRICS]

// ---------------------------------------------------------------------------
// Read functions
// ---------------------------------------------------------------------------

export async function fetchAllDevRelMetrics(token: string): Promise<DevRelMetrics[]> {
  if (useSeedData()) {
    return [...mockMetrics].sort((a, b) => a.period.localeCompare(b.period))
  }
  const data = await authGraphqlFetch<{ devRelMetrics: DevRelMetrics[] }>(
    `query FetchAllDevRelMetrics {
      devRelMetrics {
        id period npmDownloads githubStars githubForks openIssues closedIssues
        prMergeTime docsPageviews cliInstalls sdkDownloads tutorialCompletions
        communityQuestions communityAnswers
      }
    }`,
    {},
    token,
  )
  return data.devRelMetrics
}

export async function fetchDevRelMetricsByPeriod(
  token: string,
  period: string,
): Promise<DevRelMetrics | null> {
  if (useSeedData()) {
    return mockMetrics.find((m) => m.period === period) || null
  }
  const data = await authGraphqlFetch<{ devRelMetricsByPeriod: DevRelMetrics | null }>(
    `query FetchDevRelMetricsByPeriod($period: String!) {
      devRelMetricsByPeriod(period: $period) {
        id period npmDownloads githubStars githubForks openIssues closedIssues
        prMergeTime docsPageviews cliInstalls sdkDownloads tutorialCompletions
        communityQuestions communityAnswers
      }
    }`,
    { period },
    token,
  )
  return data.devRelMetricsByPeriod
}

export function computeMetricsSummary(metrics: DevRelMetrics[]): DevRelMetricsSummary {
  if (metrics.length === 0) {
    return {
      totalNpmDownloads: 0,
      totalGithubStars: 0,
      totalDocPageviews: 0,
      avgPrMergeTime: 0,
      totalCommunityQuestions: 0,
      answerRate: 0,
    }
  }

  const latest = metrics[metrics.length - 1]
  const totalQuestions = metrics.reduce((s, m) => s + m.communityQuestions, 0)
  const totalAnswers = metrics.reduce((s, m) => s + m.communityAnswers, 0)

  return {
    totalNpmDownloads: metrics.reduce((s, m) => s + m.npmDownloads, 0),
    totalGithubStars: latest.githubStars,
    totalDocPageviews: metrics.reduce((s, m) => s + m.docsPageviews, 0),
    avgPrMergeTime: Math.round(metrics.reduce((s, m) => s + m.prMergeTime, 0) / metrics.length),
    totalCommunityQuestions: totalQuestions,
    answerRate: totalQuestions > 0 ? Math.round((totalAnswers / totalQuestions) * 100) : 0,
  }
}

export function computeMonthOverMonthGrowth(
  metrics: DevRelMetrics[],
  field: keyof Omit<DevRelMetrics, 'id' | 'period'>,
): number | null {
  if (metrics.length < 2) return null
  const current = metrics[metrics.length - 1][field] as number
  const previous = metrics[metrics.length - 2][field] as number
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

export { SEED_METRICS }
