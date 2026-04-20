const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QACheckType =
  | 'screenshot'
  | 'lighthouse'
  | 'console-errors'
  | 'accessibility'

export type QACheckStatus = 'pass' | 'fail' | 'warning' | 'running' | 'pending'

export interface QACheck {
  id: string
  pageUrl: string
  checkType: QACheckType
  status: QACheckStatus
  result: string
  screenshot: string | null
  score: number | null
  timestamp: string
}

export interface QAReport {
  id: string
  buildId: string
  siteUrl: string
  siteName: string
  checks: QACheck[]
  overallStatus: QACheckStatus
  createdAt: string
  completedAt: string | null
}

export interface ScreenshotComparison {
  before: string
  after: string
  diffPercent: number
  diffImageUrl: string | null
  status: QACheckStatus
}

// ---------------------------------------------------------------------------
// Seed data — sample QA reports with realistic results
// ---------------------------------------------------------------------------

const SEED_QA_CHECKS: QACheck[] = [
  // Report 1 — alternatefutures.ai homepage
  { id: 'qc-001', pageUrl: 'https://alternatefutures.ai', checkType: 'lighthouse', status: 'pass', result: 'Performance: 94, Accessibility: 98, Best Practices: 100, SEO: 95', screenshot: null, score: 94, timestamp: '2026-02-14T22:00:00Z' },
  { id: 'qc-002', pageUrl: 'https://alternatefutures.ai', checkType: 'screenshot', status: 'pass', result: 'Screenshot captured. No visual regressions detected.', screenshot: '/qa/screenshots/homepage-2026-02-14.png', score: null, timestamp: '2026-02-14T22:01:00Z' },
  { id: 'qc-003', pageUrl: 'https://alternatefutures.ai', checkType: 'console-errors', status: 'pass', result: '0 console errors, 0 warnings', screenshot: null, score: 100, timestamp: '2026-02-14T22:02:00Z' },
  { id: 'qc-004', pageUrl: 'https://alternatefutures.ai', checkType: 'accessibility', status: 'pass', result: 'WCAG 2.1 AA compliant. No violations found. 42 elements tested.', screenshot: null, score: 98, timestamp: '2026-02-14T22:03:00Z' },

  // Report 1 — docs page
  { id: 'qc-005', pageUrl: 'https://docs.alternatefutures.ai', checkType: 'lighthouse', status: 'pass', result: 'Performance: 91, Accessibility: 96, Best Practices: 95, SEO: 92', screenshot: null, score: 91, timestamp: '2026-02-14T22:05:00Z' },
  { id: 'qc-006', pageUrl: 'https://docs.alternatefutures.ai', checkType: 'console-errors', status: 'warning', result: '0 errors, 2 warnings: deprecated API usage in search widget', screenshot: null, score: 85, timestamp: '2026-02-14T22:06:00Z' },

  // Report 2 — app dashboard
  { id: 'qc-007', pageUrl: 'https://app.alternatefutures.ai/admin', checkType: 'lighthouse', status: 'warning', result: 'Performance: 78, Accessibility: 92, Best Practices: 90, SEO: 88', screenshot: null, score: 78, timestamp: '2026-02-13T18:00:00Z' },
  { id: 'qc-008', pageUrl: 'https://app.alternatefutures.ai/admin', checkType: 'screenshot', status: 'pass', result: 'Screenshot captured. Minor layout shift detected in sidebar.', screenshot: '/qa/screenshots/admin-2026-02-13.png', score: null, timestamp: '2026-02-13T18:01:00Z' },
  { id: 'qc-009', pageUrl: 'https://app.alternatefutures.ai/admin', checkType: 'console-errors', status: 'fail', result: '3 console errors: hydration mismatch in ThemeToggle, missing key prop in nav items, unhandled promise rejection in ChatPanel', screenshot: null, score: 40, timestamp: '2026-02-13T18:02:00Z' },
  { id: 'qc-010', pageUrl: 'https://app.alternatefutures.ai/admin', checkType: 'accessibility', status: 'warning', result: 'WCAG 2.1 AA: 2 violations — missing alt text on brand logo, low contrast on sidebar labels', screenshot: null, score: 82, timestamp: '2026-02-13T18:03:00Z' },

  // Report 2 — login page
  { id: 'qc-011', pageUrl: 'https://app.alternatefutures.ai/login', checkType: 'lighthouse', status: 'pass', result: 'Performance: 97, Accessibility: 100, Best Practices: 100, SEO: 90', screenshot: null, score: 97, timestamp: '2026-02-13T18:05:00Z' },
  { id: 'qc-012', pageUrl: 'https://app.alternatefutures.ai/login', checkType: 'screenshot', status: 'pass', result: 'Screenshot captured. Matches baseline.', screenshot: '/qa/screenshots/login-2026-02-13.png', score: null, timestamp: '2026-02-13T18:06:00Z' },

  // Report 3 — blog
  { id: 'qc-013', pageUrl: 'https://alternatefutures.ai/blog', checkType: 'lighthouse', status: 'pass', result: 'Performance: 89, Accessibility: 95, Best Practices: 95, SEO: 97', screenshot: null, score: 89, timestamp: '2026-02-12T14:00:00Z' },
  { id: 'qc-014', pageUrl: 'https://alternatefutures.ai/blog', checkType: 'console-errors', status: 'pass', result: '0 console errors, 0 warnings', screenshot: null, score: 100, timestamp: '2026-02-12T14:01:00Z' },
  { id: 'qc-015', pageUrl: 'https://alternatefutures.ai/blog', checkType: 'accessibility', status: 'pass', result: 'WCAG 2.1 AA compliant. 28 elements tested.', screenshot: null, score: 95, timestamp: '2026-02-12T14:02:00Z' },
  { id: 'qc-016', pageUrl: 'https://alternatefutures.ai/blog', checkType: 'screenshot', status: 'warning', result: 'Screenshot captured. 2.3% pixel difference from baseline — likely content update.', screenshot: '/qa/screenshots/blog-2026-02-12.png', score: null, timestamp: '2026-02-12T14:03:00Z' },

  // Report 4 — pricing page (older)
  { id: 'qc-017', pageUrl: 'https://alternatefutures.ai/pricing', checkType: 'lighthouse', status: 'fail', result: 'Performance: 62, Accessibility: 88, Best Practices: 85, SEO: 80', screenshot: null, score: 62, timestamp: '2026-02-10T10:00:00Z' },
  { id: 'qc-018', pageUrl: 'https://alternatefutures.ai/pricing', checkType: 'console-errors', status: 'fail', result: '5 console errors: Stripe.js loading failure, pricing tier calculation NaN, unhandled rejection x3', screenshot: null, score: 20, timestamp: '2026-02-10T10:01:00Z' },
  { id: 'qc-019', pageUrl: 'https://alternatefutures.ai/pricing', checkType: 'accessibility', status: 'fail', result: 'WCAG 2.1 AA: 4 violations — missing form labels, no skip navigation, color contrast failures on CTA buttons, missing landmark regions', screenshot: null, score: 55, timestamp: '2026-02-10T10:02:00Z' },
  { id: 'qc-020', pageUrl: 'https://alternatefutures.ai/pricing', checkType: 'screenshot', status: 'fail', result: 'Screenshot captured. 18% pixel difference from baseline — layout broken on mobile viewport.', screenshot: '/qa/screenshots/pricing-2026-02-10.png', score: null, timestamp: '2026-02-10T10:03:00Z' },
]

const SEED_QA_REPORTS: QAReport[] = [
  {
    id: 'qr-001',
    buildId: 'build-2026-02-14-001',
    siteUrl: 'https://alternatefutures.ai',
    siteName: 'Marketing Site',
    checks: SEED_QA_CHECKS.filter((c) => ['qc-001', 'qc-002', 'qc-003', 'qc-004', 'qc-005', 'qc-006'].includes(c.id)),
    overallStatus: 'pass',
    createdAt: '2026-02-14T22:00:00Z',
    completedAt: '2026-02-14T22:10:00Z',
  },
  {
    id: 'qr-002',
    buildId: 'build-2026-02-13-001',
    siteUrl: 'https://app.alternatefutures.ai',
    siteName: 'Admin Dashboard',
    checks: SEED_QA_CHECKS.filter((c) => ['qc-007', 'qc-008', 'qc-009', 'qc-010', 'qc-011', 'qc-012'].includes(c.id)),
    overallStatus: 'fail',
    createdAt: '2026-02-13T18:00:00Z',
    completedAt: '2026-02-13T18:10:00Z',
  },
  {
    id: 'qr-003',
    buildId: 'build-2026-02-12-001',
    siteUrl: 'https://alternatefutures.ai',
    siteName: 'Marketing Site — Blog',
    checks: SEED_QA_CHECKS.filter((c) => ['qc-013', 'qc-014', 'qc-015', 'qc-016'].includes(c.id)),
    overallStatus: 'pass',
    createdAt: '2026-02-12T14:00:00Z',
    completedAt: '2026-02-12T14:05:00Z',
  },
  {
    id: 'qr-004',
    buildId: 'build-2026-02-10-001',
    siteUrl: 'https://alternatefutures.ai',
    siteName: 'Marketing Site — Pricing',
    checks: SEED_QA_CHECKS.filter((c) => ['qc-017', 'qc-018', 'qc-019', 'qc-020'].includes(c.id)),
    overallStatus: 'fail',
    createdAt: '2026-02-10T10:00:00Z',
    completedAt: '2026-02-10T10:05:00Z',
  },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// GraphQL queries & mutations
// ---------------------------------------------------------------------------

const QA_CHECK_FIELDS = `
  id pageUrl checkType status result screenshot score timestamp
`

const QA_REPORT_FIELDS = `
  id buildId siteUrl siteName overallStatus createdAt completedAt
  checks {
    ${QA_CHECK_FIELDS}
  }
`

const QA_REPORTS_QUERY = `
  query QAReports($limit: Int, $offset: Int) {
    qaReports(limit: $limit, offset: $offset) {
      ${QA_REPORT_FIELDS}
    }
  }
`

const QA_REPORT_BY_ID_QUERY = `
  query QAReportById($id: ID!) {
    qaReportById(id: $id) {
      ${QA_REPORT_FIELDS}
    }
  }
`

const RUN_QA_CHECK_MUTATION = `
  mutation RunQACheck($pageUrl: String!, $checkType: String!) {
    runQACheck(pageUrl: $pageUrl, checkType: $checkType) {
      ${QA_CHECK_FIELDS}
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
// In-memory mock store for dev mode
// ---------------------------------------------------------------------------

let mockReports = [...SEED_QA_REPORTS]
let mockChecks = [...SEED_QA_CHECKS]

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

export async function fetchQAReports(
  token: string,
  limit = 50,
  offset = 0,
): Promise<QAReport[]> {
  try {
    const data = await authGraphqlFetch<{ qaReports: QAReport[] }>(
      QA_REPORTS_QUERY,
      { limit, offset },
      token,
    )
    return data.qaReports
  } catch {
    if (useSeedData()) {
      return mockReports
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(offset, offset + limit)
    }
    return []
  }
}

export async function fetchQAReportById(
  token: string,
  id: string,
): Promise<QAReport | null> {
  try {
    const data = await authGraphqlFetch<{ qaReportById: QAReport }>(
      QA_REPORT_BY_ID_QUERY,
      { id },
      token,
    )
    return data.qaReportById
  } catch {
    if (useSeedData()) return mockReports.find((r) => r.id === id) || null
    return null
  }
}

export async function runQACheck(
  token: string,
  pageUrl: string,
  checkType: QACheckType,
): Promise<QACheck> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const score = Math.floor(Math.random() * 30) + 70
    const status: QACheckStatus = score >= 90 ? 'pass' : score >= 70 ? 'warning' : 'fail'

    const resultMessages: Record<QACheckType, string> = {
      lighthouse: `Performance: ${score}, Accessibility: ${Math.floor(Math.random() * 10) + 90}, Best Practices: ${Math.floor(Math.random() * 10) + 90}, SEO: ${Math.floor(Math.random() * 10) + 85}`,
      screenshot: `Screenshot captured. ${status === 'pass' ? 'No visual regressions detected.' : 'Visual differences detected.'}`,
      'console-errors': status === 'pass' ? '0 console errors, 0 warnings' : `${Math.floor(Math.random() * 5) + 1} console errors detected`,
      accessibility: status === 'pass' ? `WCAG 2.1 AA compliant. ${Math.floor(Math.random() * 30) + 20} elements tested.` : `WCAG 2.1 AA: ${Math.floor(Math.random() * 3) + 1} violations found`,
    }

    const check: QACheck = {
      id: `qc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      pageUrl,
      checkType,
      status,
      result: resultMessages[checkType],
      screenshot: checkType === 'screenshot' ? `/qa/screenshots/check-${Date.now()}.png` : null,
      score: checkType !== 'screenshot' ? score : null,
      timestamp: now,
    }
    mockChecks = [check, ...mockChecks]
    return check
  }

  const data = await authGraphqlFetch<{ runQACheck: QACheck }>(
    RUN_QA_CHECK_MUTATION,
    { pageUrl, checkType },
    token,
  )
  return data.runQACheck
}

export async function getQAReport(
  token: string,
  buildId: string,
): Promise<QAReport | null> {
  if (useSeedData()) {
    return mockReports.find((r) => r.buildId === buildId) || null
  }

  const reports = await fetchQAReports(token, 100)
  return reports.find((r) => r.buildId === buildId) || null
}

export async function compareScreenshots(
  _token: string,
  before: string,
  after: string,
): Promise<ScreenshotComparison> {
  const diffPercent = Math.random() * 10
  const status: QACheckStatus = diffPercent < 1 ? 'pass' : diffPercent < 5 ? 'warning' : 'fail'

  return {
    before,
    after,
    diffPercent: Math.round(diffPercent * 100) / 100,
    diffImageUrl: `/qa/diffs/diff-${Date.now()}.png`,
    status,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getPassRate(checks: QACheck[]): number {
  if (checks.length === 0) return 0
  const passed = checks.filter((c) => c.status === 'pass').length
  return Math.round((passed / checks.length) * 100)
}

export function getAverageScore(checks: QACheck[]): number | null {
  const scored = checks.filter((c) => c.score !== null)
  if (scored.length === 0) return null
  const sum = scored.reduce((acc, c) => acc + (c.score || 0), 0)
  return Math.round(sum / scored.length)
}

export const CHECK_TYPE_LABELS: Record<QACheckType, string> = {
  screenshot: 'Screenshot',
  lighthouse: 'Lighthouse',
  'console-errors': 'Console Errors',
  accessibility: 'Accessibility',
}

export const STATUS_LABELS: Record<QACheckStatus, string> = {
  pass: 'Pass',
  fail: 'Fail',
  warning: 'Warning',
  running: 'Running',
  pending: 'Pending',
}

export { SEED_QA_REPORTS, SEED_QA_CHECKS }
