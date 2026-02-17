const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KPICategory =
  | 'REVENUE'
  | 'GROWTH'
  | 'ENGAGEMENT'
  | 'CONTENT'
  | 'COMMUNITY'
  | 'DEVELOPER'
  | 'BRAND'
  | 'INFRASTRUCTURE'

export type KPITrend = 'UP' | 'DOWN' | 'FLAT'

export interface KPISnapshot {
  id: string
  metricKey: string
  label: string
  category: KPICategory
  value: number
  previousValue: number | null
  target: number | null
  unit: string
  trend: KPITrend
  deltaPercent: number
  snapshotDate: string
  createdAt: string
}

export interface KPIDefinition {
  metricKey: string
  label: string
  category: KPICategory
  unit: string
  description: string
  target: number | null
  alertThreshold: number | null
  source: string
}

export interface KPITimeSeries {
  metricKey: string
  label: string
  unit: string
  dataPoints: { date: string; value: number }[]
}

export interface CreateKPISnapshotInput {
  metricKey: string
  value: number
  snapshotDate?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const KPI_DEFINITIONS: KPIDefinition[] = [
  { metricKey: 'mrr', label: 'Monthly Recurring Revenue', category: 'REVENUE', unit: 'USD', description: 'Total MRR from all paying customers', target: 50000, alertThreshold: 30000, source: 'stripe' },
  { metricKey: 'registered_users', label: 'Registered Users', category: 'GROWTH', unit: 'count', description: 'Total registered platform users', target: 10000, alertThreshold: null, source: 'auth-service' },
  { metricKey: 'paying_customers', label: 'Paying Customers', category: 'REVENUE', unit: 'count', description: 'Users on paid plans', target: 2000, alertThreshold: null, source: 'stripe' },
  { metricKey: 'monthly_active_deployers', label: 'Monthly Active Deployers', category: 'GROWTH', unit: 'count', description: 'North Star metric: unique users who deployed in last 30 days', target: 5000, alertThreshold: 1000, source: 'cloud-api' },
  { metricKey: 'activation_rate', label: 'Activation Rate', category: 'GROWTH', unit: 'percent', description: 'Signup to first deploy within 7 days', target: 40, alertThreshold: 20, source: 'cloud-api' },
  { metricKey: 'cac', label: 'Customer Acquisition Cost', category: 'REVENUE', unit: 'USD', description: 'Average cost to acquire a paying customer', target: 25, alertThreshold: 50, source: 'stripe+analytics' },
  { metricKey: 'ltv', label: 'Customer Lifetime Value', category: 'REVENUE', unit: 'USD', description: 'Predicted lifetime revenue per customer', target: 500, alertThreshold: null, source: 'stripe' },
  { metricKey: 'churn_rate', label: 'Monthly Churn Rate', category: 'REVENUE', unit: 'percent', description: 'Percentage of customers lost monthly', target: 3, alertThreshold: 8, source: 'stripe' },
  { metricKey: 'social_followers', label: 'Social Followers (Total)', category: 'ENGAGEMENT', unit: 'count', description: 'Combined followers across all social platforms', target: 25000, alertThreshold: null, source: 'social-api' },
  { metricKey: 'social_engagement_rate', label: 'Social Engagement Rate', category: 'ENGAGEMENT', unit: 'percent', description: 'Average engagement rate across platforms', target: 5, alertThreshold: 2, source: 'social-api' },
  { metricKey: 'blog_traffic', label: 'Blog Monthly Traffic', category: 'CONTENT', unit: 'count', description: 'Monthly blog page views', target: 50000, alertThreshold: null, source: 'analytics' },
  { metricKey: 'community_members', label: 'Community Members', category: 'COMMUNITY', unit: 'count', description: 'Total Discord + forum members', target: 5000, alertThreshold: null, source: 'discord-api' },
  { metricKey: 'github_stars', label: 'GitHub Stars', category: 'DEVELOPER', unit: 'count', description: 'Stars across all AF repos', target: 2000, alertThreshold: null, source: 'github-api' },
  { metricKey: 'npm_downloads', label: 'npm Monthly Downloads', category: 'DEVELOPER', unit: 'count', description: 'Monthly downloads of @alternatefutures packages', target: 10000, alertThreshold: null, source: 'npm-api' },
  { metricKey: 'brand_compliance_score', label: 'Brand Compliance Score', category: 'BRAND', unit: 'score', description: 'Average brand compliance across published content', target: 90, alertThreshold: 70, source: 'brand-api' },
  { metricKey: 'deploy_success_rate', label: 'Deploy Success Rate', category: 'INFRASTRUCTURE', unit: 'percent', description: 'Percentage of successful deployments', target: 99, alertThreshold: 95, source: 'cloud-api' },
]

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

function generateTimeSeriesData(
  metricKey: string,
  baseValue: number,
  volatility: number,
  trendDirection: number,
  days: number,
): { date: string; value: number }[] {
  const points: { date: string; value: number }[] = []
  let current = baseValue
  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    current = Math.max(0, current + (Math.random() - 0.5 + trendDirection * 0.15) * volatility)
    points.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(current * 100) / 100,
    })
  }
  return points
}

const SEED_TIME_SERIES: Record<string, { date: string; value: number }[]> = {
  mrr: generateTimeSeriesData('mrr', 8200, 1200, 1, 90),
  registered_users: generateTimeSeriesData('registered_users', 1200, 150, 1, 90),
  paying_customers: generateTimeSeriesData('paying_customers', 85, 12, 1, 90),
  monthly_active_deployers: generateTimeSeriesData('monthly_active_deployers', 340, 50, 1, 90),
  activation_rate: generateTimeSeriesData('activation_rate', 28, 5, 0.5, 90),
  cac: generateTimeSeriesData('cac', 42, 8, -0.3, 90),
  ltv: generateTimeSeriesData('ltv', 280, 30, 0.5, 90),
  churn_rate: generateTimeSeriesData('churn_rate', 6.5, 1.5, -0.2, 90),
  social_followers: generateTimeSeriesData('social_followers', 3800, 200, 1, 90),
  social_engagement_rate: generateTimeSeriesData('social_engagement_rate', 3.2, 0.8, 0.3, 90),
  blog_traffic: generateTimeSeriesData('blog_traffic', 8500, 2000, 0.8, 90),
  community_members: generateTimeSeriesData('community_members', 620, 40, 1, 90),
  github_stars: generateTimeSeriesData('github_stars', 340, 20, 1, 90),
  npm_downloads: generateTimeSeriesData('npm_downloads', 1800, 400, 0.8, 90),
  brand_compliance_score: generateTimeSeriesData('brand_compliance_score', 78, 5, 0.4, 90),
  deploy_success_rate: generateTimeSeriesData('deploy_success_rate', 97.2, 1.5, 0.1, 90),
}

function buildSeedSnapshots(): KPISnapshot[] {
  const snapshots: KPISnapshot[] = []
  for (const def of KPI_DEFINITIONS) {
    const series = SEED_TIME_SERIES[def.metricKey]
    if (!series || series.length < 2) continue
    const latest = series[series.length - 1]
    const previous = series[series.length - 2]
    const delta = previous.value !== 0
      ? ((latest.value - previous.value) / previous.value) * 100
      : 0
    snapshots.push({
      id: `seed-kpi-${def.metricKey}`,
      metricKey: def.metricKey,
      label: def.label,
      category: def.category,
      value: latest.value,
      previousValue: previous.value,
      target: def.target,
      unit: def.unit,
      trend: delta > 1 ? 'UP' : delta < -1 ? 'DOWN' : 'FLAT',
      deltaPercent: Math.round(delta * 100) / 100,
      snapshotDate: latest.date,
      createdAt: new Date().toISOString(),
    })
  }
  return snapshots
}

let mockSnapshots: KPISnapshot[] = buildSeedSnapshots()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
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
// GraphQL queries
// ---------------------------------------------------------------------------

const KPI_SNAPSHOT_FIELDS = `
  id metricKey label category value previousValue target unit
  trend deltaPercent snapshotDate createdAt
`

const LATEST_KPI_SNAPSHOTS_QUERY = `
  query LatestKPISnapshots {
    latestKPISnapshots {
      ${KPI_SNAPSHOT_FIELDS}
    }
  }
`

const KPI_TIME_SERIES_QUERY = `
  query KPITimeSeries($metricKey: String!, $startDate: String!, $endDate: String!) {
    kpiTimeSeries(metricKey: $metricKey, startDate: $startDate, endDate: $endDate) {
      metricKey label unit
      dataPoints { date value }
    }
  }
`

const CREATE_KPI_SNAPSHOT_MUTATION = `
  mutation CreateKPISnapshot($input: CreateKPISnapshotInput!) {
    createKPISnapshot(input: $input) {
      ${KPI_SNAPSHOT_FIELDS}
    }
  }
`

// ---------------------------------------------------------------------------
// CRUD functions
// ---------------------------------------------------------------------------

export async function fetchLatestSnapshots(
  token: string,
): Promise<KPISnapshot[]> {
  try {
    const data = await authGraphqlFetch<{ latestKPISnapshots: KPISnapshot[] }>(
      LATEST_KPI_SNAPSHOTS_QUERY,
      {},
      token,
    )
    return data.latestKPISnapshots
  } catch {
    if (useSeedData()) return mockSnapshots
    return []
  }
}

export async function fetchKPITimeSeries(
  token: string,
  metricKey: string,
  startDate: string,
  endDate: string,
): Promise<KPITimeSeries | null> {
  try {
    const data = await authGraphqlFetch<{ kpiTimeSeries: KPITimeSeries }>(
      KPI_TIME_SERIES_QUERY,
      { metricKey, startDate, endDate },
      token,
    )
    return data.kpiTimeSeries
  } catch {
    if (useSeedData()) {
      const series = SEED_TIME_SERIES[metricKey]
      const def = KPI_DEFINITIONS.find((d) => d.metricKey === metricKey)
      if (!series || !def) return null
      const filtered = series.filter(
        (p) => p.date >= startDate && p.date <= endDate,
      )
      return {
        metricKey,
        label: def.label,
        unit: def.unit,
        dataPoints: filtered,
      }
    }
    return null
  }
}

export async function fetchSnapshotsByCategory(
  token: string,
  category: KPICategory,
): Promise<KPISnapshot[]> {
  const all = await fetchLatestSnapshots(token)
  return all.filter((s) => s.category === category)
}

export async function createKPISnapshot(
  token: string,
  input: CreateKPISnapshotInput,
): Promise<KPISnapshot> {
  if (useSeedData()) {
    const def = KPI_DEFINITIONS.find((d) => d.metricKey === input.metricKey)
    if (!def) throw new Error(`Unknown metric key: ${input.metricKey}`)
    const existing = mockSnapshots.find((s) => s.metricKey === input.metricKey)
    const now = new Date().toISOString()
    const delta = existing && existing.value !== 0
      ? ((input.value - existing.value) / existing.value) * 100
      : 0
    const snapshot: KPISnapshot = {
      id: `seed-kpi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      metricKey: input.metricKey,
      label: def.label,
      category: def.category,
      value: input.value,
      previousValue: existing?.value ?? null,
      target: def.target,
      unit: def.unit,
      trend: delta > 1 ? 'UP' : delta < -1 ? 'DOWN' : 'FLAT',
      deltaPercent: Math.round(delta * 100) / 100,
      snapshotDate: input.snapshotDate || now.split('T')[0],
      createdAt: now,
    }
    mockSnapshots = mockSnapshots.filter((s) => s.metricKey !== input.metricKey)
    mockSnapshots = [snapshot, ...mockSnapshots]
    return snapshot
  }

  const data = await authGraphqlFetch<{ createKPISnapshot: KPISnapshot }>(
    CREATE_KPI_SNAPSHOT_MUTATION,
    { input },
    token,
  )
  return data.createKPISnapshot
}

// ---------------------------------------------------------------------------
// Utility: format KPI value for display
// ---------------------------------------------------------------------------

export function formatKPIValue(value: number, unit: string): string {
  switch (unit) {
    case 'USD':
      return value >= 1000
        ? `$${(value / 1000).toFixed(1)}K`
        : `$${value.toFixed(0)}`
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'score':
      return `${value.toFixed(0)}/100`
    case 'count':
      return value >= 1000
        ? `${(value / 1000).toFixed(1)}K`
        : value.toFixed(0)
    default:
      return value.toFixed(0)
  }
}

export function getTrendColor(trend: KPITrend, metricKey: string): string {
  const invertedMetrics = ['cac', 'churn_rate']
  const isInverted = invertedMetrics.includes(metricKey)
  if (trend === 'FLAT') return 'var(--af-stone-500)'
  if (trend === 'UP') return isInverted ? 'var(--af-signal-stop)' : 'var(--af-signal-go)'
  return isInverted ? 'var(--af-signal-go)' : 'var(--af-signal-stop)'
}

export function getTrendArrow(trend: KPITrend): string {
  if (trend === 'UP') return '\u2191'
  if (trend === 'DOWN') return '\u2193'
  return '\u2192'
}

// ---------------------------------------------------------------------------
// Trend calculation: week-over-week and month-over-month
// ---------------------------------------------------------------------------

export interface TrendResult {
  currentValue: number
  previousValue: number
  absoluteChange: number
  percentChange: number
  direction: KPITrend
}

export function calculateWoWTrend(
  dataPoints: { date: string; value: number }[],
): TrendResult | null {
  if (dataPoints.length < 8) return null
  const sorted = [...dataPoints].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted.slice(-7)
  const previous = sorted.slice(-14, -7)
  if (previous.length < 7) return null

  const currentAvg = latest.reduce((s, p) => s + p.value, 0) / latest.length
  const previousAvg = previous.reduce((s, p) => s + p.value, 0) / previous.length
  const absoluteChange = currentAvg - previousAvg
  const percentChange = previousAvg !== 0 ? (absoluteChange / previousAvg) * 100 : 0

  return {
    currentValue: Math.round(currentAvg * 100) / 100,
    previousValue: Math.round(previousAvg * 100) / 100,
    absoluteChange: Math.round(absoluteChange * 100) / 100,
    percentChange: Math.round(percentChange * 100) / 100,
    direction: percentChange > 1 ? 'UP' : percentChange < -1 ? 'DOWN' : 'FLAT',
  }
}

export function calculateMoMTrend(
  dataPoints: { date: string; value: number }[],
): TrendResult | null {
  if (dataPoints.length < 31) return null
  const sorted = [...dataPoints].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted.slice(-30)
  const previous = sorted.slice(-60, -30)
  if (previous.length < 30) return null

  const currentAvg = latest.reduce((s, p) => s + p.value, 0) / latest.length
  const previousAvg = previous.reduce((s, p) => s + p.value, 0) / previous.length
  const absoluteChange = currentAvg - previousAvg
  const percentChange = previousAvg !== 0 ? (absoluteChange / previousAvg) * 100 : 0

  return {
    currentValue: Math.round(currentAvg * 100) / 100,
    previousValue: Math.round(previousAvg * 100) / 100,
    absoluteChange: Math.round(absoluteChange * 100) / 100,
    percentChange: Math.round(percentChange * 100) / 100,
    direction: percentChange > 1 ? 'UP' : percentChange < -1 ? 'DOWN' : 'FLAT',
  }
}

// ---------------------------------------------------------------------------
// Sparkline data generation
// ---------------------------------------------------------------------------

export interface SparklineData {
  metricKey: string
  points: number[]
  min: number
  max: number
  trend: KPITrend
}

export function generateSparkline(
  dataPoints: { date: string; value: number }[],
  metricKey: string,
  numPoints = 14,
): SparklineData {
  const sorted = [...dataPoints].sort((a, b) => a.date.localeCompare(b.date))
  const recent = sorted.slice(-numPoints)
  const values = recent.map((p) => p.value)

  if (values.length === 0) {
    return { metricKey, points: [], min: 0, max: 0, trend: 'FLAT' }
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  // Normalize to 0-1 range for rendering
  const range = max - min || 1
  const points = values.map((v) => (v - min) / range)

  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length
  const pctChange = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0
  const trend: KPITrend = pctChange > 1 ? 'UP' : pctChange < -1 ? 'DOWN' : 'FLAT'

  return { metricKey, points, min, max, trend }
}

export async function fetchAllSparklines(
  token: string,
  numPoints = 14,
): Promise<SparklineData[]> {
  const sparklines: SparklineData[] = []
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - numPoints * 2 * 86400000).toISOString().split('T')[0]

  for (const def of KPI_DEFINITIONS) {
    const series = await fetchKPITimeSeries(token, def.metricKey, startDate, endDate)
    if (series) {
      sparklines.push(generateSparkline(series.dataPoints, def.metricKey, numPoints))
    }
  }
  return sparklines
}

// ---------------------------------------------------------------------------
// Metric definition CRUD (in-memory for dev, GraphQL for prod)
// ---------------------------------------------------------------------------

let mockDefinitions = [...KPI_DEFINITIONS]

export async function fetchMetricDefinitions(
  token: string,
): Promise<KPIDefinition[]> {
  try {
    const data = await authGraphqlFetch<{ kpiDefinitions: KPIDefinition[] }>(
      `query KPIDefinitions { kpiDefinitions { metricKey label category unit description target alertThreshold source } }`,
      {},
      token,
    )
    return data.kpiDefinitions
  } catch {
    if (useSeedData()) return [...mockDefinitions]
    return []
  }
}

export async function createMetricDefinition(
  token: string,
  input: Omit<KPIDefinition, 'alertThreshold'> & { alertThreshold?: number | null },
): Promise<KPIDefinition> {
  if (useSeedData()) {
    const def: KPIDefinition = {
      ...input,
      alertThreshold: input.alertThreshold ?? null,
    }
    mockDefinitions = [def, ...mockDefinitions]
    return def
  }

  const data = await authGraphqlFetch<{ createKPIDefinition: KPIDefinition }>(
    `mutation CreateKPIDefinition($input: CreateKPIDefinitionInput!) {
      createKPIDefinition(input: $input) {
        metricKey label category unit description target alertThreshold source
      }
    }`,
    { input },
    token,
  )
  return data.createKPIDefinition
}

export async function updateMetricDefinition(
  token: string,
  metricKey: string,
  input: Partial<Pick<KPIDefinition, 'label' | 'target' | 'alertThreshold' | 'description'>>,
): Promise<KPIDefinition> {
  if (useSeedData()) {
    const idx = mockDefinitions.findIndex((d) => d.metricKey === metricKey)
    if (idx === -1) throw new Error(`Unknown metric key: ${metricKey}`)
    const updated: KPIDefinition = {
      ...mockDefinitions[idx],
      label: input.label ?? mockDefinitions[idx].label,
      target: input.target !== undefined ? input.target : mockDefinitions[idx].target,
      alertThreshold: input.alertThreshold !== undefined ? input.alertThreshold : mockDefinitions[idx].alertThreshold,
      description: input.description ?? mockDefinitions[idx].description,
    }
    mockDefinitions[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateKPIDefinition: KPIDefinition }>(
    `mutation UpdateKPIDefinition($metricKey: String!, $input: UpdateKPIDefinitionInput!) {
      updateKPIDefinition(metricKey: $metricKey, input: $input) {
        metricKey label category unit description target alertThreshold source
      }
    }`,
    { metricKey, input },
    token,
  )
  return data.updateKPIDefinition
}

export async function deleteMetricDefinition(
  token: string,
  metricKey: string,
): Promise<void> {
  if (useSeedData()) {
    mockDefinitions = mockDefinitions.filter((d) => d.metricKey !== metricKey)
    mockSnapshots = mockSnapshots.filter((s) => s.metricKey !== metricKey)
    return
  }

  await authGraphqlFetch<{ deleteKPIDefinition: boolean }>(
    `mutation DeleteKPIDefinition($metricKey: String!) { deleteKPIDefinition(metricKey: $metricKey) }`,
    { metricKey },
    token,
  )
}

// Re-export seed data
export { SEED_TIME_SERIES }
