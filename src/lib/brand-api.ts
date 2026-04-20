const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BrandViolationType =
  | 'TERMINOLOGY'
  | 'PARTNER_POSITIONING'
  | 'COMPETITOR_TREATMENT'
  | 'VOICE_MISMATCH'
  | 'TRACK_MISALIGNMENT'
  | 'VISUAL_NONCOMPLIANCE'

export type ViolationSeverity = 'BLOCKING' | 'WARNING' | 'INFO'

export type BrandRuleCategory =
  | 'TERMINOLOGY'
  | 'VOICE'
  | 'POSITIONING'
  | 'VISUAL'
  | 'COMPETITOR'
  | 'PARTNER'

export type BrandGuideStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export type BrandReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED'

export type CertificationStatus = 'PENDING' | 'CERTIFIED' | 'EXPIRED' | 'REVOKED'

export interface BrandScore {
  overall: number
  voice: number
  terminology: number
  partnerPositioning: number
  competitorTreatment: number
  trackAlignment: number
  tone: number
}

export interface BrandViolation {
  id: string
  type: BrandViolationType
  severity: ViolationSeverity
  location: string
  original: string
  suggestion: string | null
  rule: string
}

export interface BrandReview {
  id: string
  contentId: string
  contentType: 'SOCIAL_POST' | 'BLOG_POST' | 'MARKETING_COPY' | 'DOCUMENTATION'
  approved: boolean
  score: BrandScore
  violations: BrandViolation[]
  reviewedBy: string
  reviewedAt: string
  createdAt: string
}

export interface BrandRule {
  id: string
  category: BrandRuleCategory
  name: string
  description: string
  pattern: string | null
  replacement: string | null
  severity: ViolationSeverity
  active: boolean
  examples: string[]
  createdAt: string
  updatedAt: string
}

export interface BrandGuide {
  id: string
  version: string
  status: BrandGuideStatus
  missionStatement: string
  voiceAttributes: string[]
  toneGuidelines: Record<string, string>
  rules: BrandRule[]
  prohibitedTerms: string[]
  requiredTerms: Record<string, string>
  colorPalette: { name: string; hex: string; usage: string }[]
  typographyRules: { element: string; font: string; weight: string; size: string }[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BrandTemplate {
  id: string
  name: string
  description: string
  contentType: string
  zones: BrandTemplateZone[]
  createdAt: string
  updatedAt: string
}

export interface BrandTemplateZone {
  id: string
  name: string
  locked: boolean
  defaultContent: string
  maxLength: number | null
  allowedFormats: string[]
}

export interface BrandAuditLogEntry {
  id: string
  action: string
  actor: string
  entityType: string
  entityId: string
  details: Record<string, unknown>
  timestamp: string
}

export interface BrandCertification {
  id: string
  agentId: string
  agentName: string
  guideVersion: string
  status: CertificationStatus
  score: number
  certifiedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export interface BrandHealthMetrics {
  overallScore: number
  reviewsThisWeek: number
  violationsThisWeek: number
  blockingViolations: number
  approvalRate: number
  avgScore: BrandScore
  topViolationTypes: { type: BrandViolationType; count: number }[]
  certifiedAgents: number
  totalAgents: number
}

export interface ValidateContentInput {
  content: string
  contentType: 'SOCIAL_POST' | 'BLOG_POST' | 'MARKETING_COPY' | 'DOCUMENTATION'
  contentId?: string
}

export interface UpdateBrandGuideInput {
  missionStatement?: string
  voiceAttributes?: string[]
  toneGuidelines?: Record<string, string>
  prohibitedTerms?: string[]
  requiredTerms?: Record<string, string>
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_BRAND_GUIDE: BrandGuide = {
  id: 'seed-guide-1',
  version: '1.2.0',
  status: 'ACTIVE',
  missionStatement: 'Alternate Futures empowers developers and organizations to build on truly decentralized infrastructure -- censorship-resistant, cost-effective, and sovereign.',
  voiceAttributes: ['Technical but approachable', 'Confident, not arrogant', 'Builder-focused', 'Forward-looking'],
  toneGuidelines: {
    social: 'Casual, energetic, community-driven. Use technical terms but explain them.',
    blog: 'Authoritative, educational. Deep dives welcome. Show code.',
    investor: 'Data-driven, visionary. Lead with market opportunity.',
    documentation: 'Clear, precise, step-by-step. Assume competent developers.',
  },
  rules: [
    {
      id: 'rule-1',
      category: 'TERMINOLOGY',
      name: 'Platform name',
      description: 'Always use "Alternate Futures" or "AF" -- never "Alt Futures" or "AltFutures" (one word).',
      pattern: '\\bAlt\\s*Futures\\b|\\bAltFutures\\b',
      replacement: 'Alternate Futures',
      severity: 'BLOCKING',
      active: true,
      examples: ['Alternate Futures is...', 'Deploy on AF in minutes'],
      createdAt: '2025-12-01T00:00:00Z',
      updatedAt: '2025-12-01T00:00:00Z',
    },
    {
      id: 'rule-2',
      category: 'COMPETITOR',
      name: 'No Fleek mentions in public content',
      description: 'Never reference Fleek in public-facing content. Acceptable only in internal competitive docs.',
      pattern: '\\bFleek\\b',
      replacement: null,
      severity: 'BLOCKING',
      active: true,
      examples: [],
      createdAt: '2025-12-01T00:00:00Z',
      updatedAt: '2025-12-01T00:00:00Z',
    },
    {
      id: 'rule-3',
      category: 'POSITIONING',
      name: 'Decentralized cloud positioning',
      description: 'Position as "decentralized cloud platform" not "Web3 hosting" to avoid being pigeonholed.',
      pattern: '\\bWeb3\\s+host(ing)?\\b',
      replacement: 'decentralized cloud platform',
      severity: 'WARNING',
      active: true,
      examples: ['AF is a decentralized cloud platform', 'Deploy to decentralized infrastructure'],
      createdAt: '2025-12-01T00:00:00Z',
      updatedAt: '2025-12-01T00:00:00Z',
    },
    {
      id: 'rule-4',
      category: 'VOICE',
      name: 'Avoid hype language',
      description: 'Avoid "revolutionary", "game-changing", "disruptive" -- show rather than tell.',
      pattern: '\\b(revolutionary|game[- ]chang(ing|er)|disruptive|paradigm shift)\\b',
      replacement: null,
      severity: 'WARNING',
      active: true,
      examples: [],
      createdAt: '2025-12-01T00:00:00Z',
      updatedAt: '2025-12-01T00:00:00Z',
    },
    {
      id: 'rule-5',
      category: 'PARTNER',
      name: 'Akash Network attribution',
      description: 'When mentioning Akash, use "Akash Network" on first reference, then "Akash" is acceptable.',
      pattern: null,
      replacement: null,
      severity: 'INFO',
      active: true,
      examples: ['Powered by Akash Network compute', 'Akash provides the compute layer'],
      createdAt: '2025-12-15T00:00:00Z',
      updatedAt: '2025-12-15T00:00:00Z',
    },
  ],
  prohibitedTerms: ['Fleek', 'Alt Futures', 'AltFutures', 'revolutionary', 'game-changing', 'Web3 hosting'],
  requiredTerms: {
    'Alternate Futures': 'Full name on first reference per piece',
    'decentralized cloud': 'Core positioning term',
  },
  colorPalette: [
    { name: 'Primary Blue', hex: '#0026FF', usage: 'Primary actions, links, headers' },
    { name: 'Dark', hex: '#0A0A0A', usage: 'Backgrounds, body text' },
    { name: 'White', hex: '#FFFFFF', usage: 'Backgrounds, inverse text' },
    { name: 'Accent Gold', hex: '#FFB800', usage: 'Highlights, badges, alerts' },
    { name: 'Success Green', hex: '#10B981', usage: 'Success states, positive metrics' },
    { name: 'Error Red', hex: '#EF4444', usage: 'Error states, critical alerts' },
  ],
  typographyRules: [
    { element: 'H1', font: 'Inter', weight: '700', size: '2.5rem' },
    { element: 'H2', font: 'Inter', weight: '600', size: '2rem' },
    { element: 'Body', font: 'Inter', weight: '400', size: '1rem' },
    { element: 'Code', font: 'JetBrains Mono', weight: '400', size: '0.875rem' },
  ],
  publishedAt: '2026-01-01T00:00:00Z',
  createdAt: '2025-12-01T00:00:00Z',
  updatedAt: '2026-02-10T00:00:00Z',
}

const SEED_REVIEWS: BrandReview[] = [
  {
    id: 'seed-review-1',
    contentId: 'seed-social-1',
    contentType: 'SOCIAL_POST',
    approved: true,
    score: {
      overall: 92,
      voice: 95,
      terminology: 100,
      partnerPositioning: 90,
      competitorTreatment: 100,
      trackAlignment: 85,
      tone: 88,
    },
    violations: [],
    reviewedBy: 'brand-guardian',
    reviewedAt: '2026-01-15T09:00:00Z',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'seed-review-2',
    contentId: 'seed-social-4',
    contentType: 'SOCIAL_POST',
    approved: false,
    score: {
      overall: 45,
      voice: 70,
      terminology: 80,
      partnerPositioning: 60,
      competitorTreatment: 10,
      trackAlignment: 50,
      tone: 45,
    },
    violations: [
      {
        id: 'seed-violation-1',
        type: 'COMPETITOR_TREATMENT',
        severity: 'BLOCKING',
        location: 'Line 1, position 38',
        original: 'Both Fleek and Spheron have pivoted away from hosting.',
        suggestion: 'Remove direct competitor mentions. Focus on our capabilities instead.',
        rule: 'No Fleek mentions in public content',
      },
      {
        id: 'seed-violation-2',
        type: 'VOICE_MISMATCH',
        severity: 'WARNING',
        location: 'Line 3',
        original: 'We\'re filling that gap.',
        suggestion: 'Rephrase to focus on what we build, not competitor shortcomings. e.g., "We\'re building the infrastructure developers need."',
        rule: 'Avoid reactive positioning against competitors',
      },
    ],
    reviewedBy: 'brand-guardian',
    reviewedAt: '2026-02-08T15:00:00Z',
    createdAt: '2026-02-08T15:00:00Z',
  },
  {
    id: 'seed-review-3',
    contentId: 'seed-social-3',
    contentType: 'SOCIAL_POST',
    approved: true,
    score: {
      overall: 88,
      voice: 90,
      terminology: 95,
      partnerPositioning: 85,
      competitorTreatment: 100,
      trackAlignment: 80,
      tone: 85,
    },
    violations: [
      {
        id: 'seed-violation-3',
        type: 'TERMINOLOGY',
        severity: 'INFO',
        location: 'Line 1',
        original: 'Deploy Your First AI Agent on Decentralized Infrastructure',
        suggestion: 'Consider using "Alternate Futures" or "AF" explicitly to reinforce brand association.',
        rule: 'Brand mention in headlines',
      },
    ],
    reviewedBy: 'brand-guardian',
    reviewedAt: '2026-02-05T10:00:00Z',
    createdAt: '2026-02-05T10:00:00Z',
  },
]

const SEED_CERTIFICATIONS: BrandCertification[] = [
  {
    id: 'seed-cert-1',
    agentId: 'content-writer',
    agentName: 'Content Writer',
    guideVersion: '1.2.0',
    status: 'CERTIFIED',
    score: 94,
    certifiedAt: '2026-01-15T00:00:00Z',
    expiresAt: '2026-04-15T00:00:00Z',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'seed-cert-2',
    agentId: 'echo',
    agentName: 'Echo (Communications)',
    guideVersion: '1.2.0',
    status: 'CERTIFIED',
    score: 97,
    certifiedAt: '2026-01-10T00:00:00Z',
    expiresAt: '2026-04-10T00:00:00Z',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'seed-cert-3',
    agentId: 'growth-hacker',
    agentName: 'Growth Hacker',
    guideVersion: '1.1.0',
    status: 'EXPIRED',
    score: 82,
    certifiedAt: '2025-10-01T00:00:00Z',
    expiresAt: '2026-01-01T00:00:00Z',
    createdAt: '2025-10-01T00:00:00Z',
  },
]

const SEED_AUDIT_LOG: BrandAuditLogEntry[] = [
  {
    id: 'seed-audit-1',
    action: 'GUIDE_UPDATED',
    actor: 'brand-guardian',
    entityType: 'BrandGuide',
    entityId: 'seed-guide-1',
    details: { field: 'voiceAttributes', change: 'Added "Builder-focused"' },
    timestamp: '2026-02-10T00:00:00Z',
  },
  {
    id: 'seed-audit-2',
    action: 'REVIEW_REJECTED',
    actor: 'brand-guardian',
    entityType: 'BrandReview',
    entityId: 'seed-review-2',
    details: { contentId: 'seed-social-4', reason: 'Fleek mention in public content' },
    timestamp: '2026-02-08T15:00:00Z',
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

const BRAND_SCORE_FIELDS = `overall voice terminology partnerPositioning competitorTreatment trackAlignment tone`

const BRAND_VIOLATION_FIELDS = `id type severity location original suggestion rule`

const BRAND_REVIEW_FIELDS = `
  id contentId contentType approved reviewedBy reviewedAt createdAt
  score { ${BRAND_SCORE_FIELDS} }
  violations { ${BRAND_VIOLATION_FIELDS} }
`

const BRAND_RULE_FIELDS = `
  id category name description pattern replacement severity active examples createdAt updatedAt
`

const BRAND_GUIDE_FIELDS = `
  id version status missionStatement voiceAttributes toneGuidelines
  prohibitedTerms requiredTerms publishedAt createdAt updatedAt
  rules { ${BRAND_RULE_FIELDS} }
  colorPalette { name hex usage }
  typographyRules { element font weight size }
`

const GET_BRAND_GUIDE_QUERY = `
  query BrandGuide { brandGuide { ${BRAND_GUIDE_FIELDS} } }
`

const UPDATE_BRAND_GUIDE_MUTATION = `
  mutation UpdateBrandGuide($input: UpdateBrandGuideInput!) {
    updateBrandGuide(input: $input) { ${BRAND_GUIDE_FIELDS} }
  }
`

const VALIDATE_CONTENT_MUTATION = `
  mutation ValidateContent($input: ValidateContentInput!) {
    validateContent(input: $input) { ${BRAND_REVIEW_FIELDS} }
  }
`

const BRAND_REVIEWS_QUERY = `
  query BrandReviews($contentId: String, $approved: Boolean, $limit: Int, $offset: Int) {
    brandReviews(contentId: $contentId, approved: $approved, limit: $limit, offset: $offset) {
      ${BRAND_REVIEW_FIELDS}
    }
  }
`

const BRAND_HEALTH_QUERY = `
  query BrandHealth {
    brandHealth {
      overallScore reviewsThisWeek violationsThisWeek blockingViolations
      approvalRate certifiedAgents totalAgents
      avgScore { ${BRAND_SCORE_FIELDS} }
      topViolationTypes { type count }
    }
  }
`

const BRAND_AUDIT_LOG_QUERY = `
  query BrandAuditLog($limit: Int, $offset: Int) {
    brandAuditLog(limit: $limit, offset: $offset) {
      id action actor entityType entityId details timestamp
    }
  }
`

const BRAND_CERTIFICATIONS_QUERY = `
  query BrandCertifications($status: CertificationStatus) {
    brandCertifications(status: $status) {
      id agentId agentName guideVersion status score
      certifiedAt expiresAt createdAt
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
// In-memory mock stores
// ---------------------------------------------------------------------------

let mockGuide = { ...SEED_BRAND_GUIDE }
let mockReviews = [...SEED_REVIEWS]

// ---------------------------------------------------------------------------
// Mock validation engine
// ---------------------------------------------------------------------------

function runMockValidation(content: string, contentType: string): BrandReview {
  const violations: BrandViolation[] = []
  let violationCounter = 0

  for (const rule of mockGuide.rules) {
    if (!rule.active || !rule.pattern) continue
    const regex = new RegExp(rule.pattern, 'gi')
    let match: RegExpExecArray | null
    while ((match = regex.exec(content)) !== null) {
      violationCounter++
      violations.push({
        id: `mock-violation-${Date.now()}-${violationCounter}`,
        type: rule.category as BrandViolationType,
        severity: rule.severity,
        location: `Character ${match.index}`,
        original: match[0],
        suggestion: rule.replacement
          ? `Replace with "${rule.replacement}"`
          : `Remove or rephrase: ${rule.description}`,
        rule: rule.name,
      })
    }
  }

  const hasBlocking = violations.some((v) => v.severity === 'BLOCKING')
  const warningCount = violations.filter((v) => v.severity === 'WARNING').length

  const score: BrandScore = {
    overall: hasBlocking ? Math.min(50, 100 - violations.length * 15) : Math.max(60, 100 - warningCount * 10),
    voice: hasBlocking ? 50 : 85 + Math.floor(Math.random() * 15),
    terminology: violations.some((v) => v.type === 'TERMINOLOGY') ? 40 : 95,
    partnerPositioning: violations.some((v) => v.type === 'PARTNER_POSITIONING') ? 50 : 90,
    competitorTreatment: violations.some((v) => v.type === 'COMPETITOR_TREATMENT') ? 10 : 100,
    trackAlignment: 80 + Math.floor(Math.random() * 20),
    tone: 75 + Math.floor(Math.random() * 25),
  }

  const now = new Date().toISOString()
  return {
    id: `mock-review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    contentId: `content-${Date.now()}`,
    contentType: contentType as BrandReview['contentType'],
    approved: !hasBlocking,
    score,
    violations,
    reviewedBy: 'brand-guardian',
    reviewedAt: now,
    createdAt: now,
  }
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchBrandGuide(
  token: string,
): Promise<BrandGuide> {
  try {
    const data = await authGraphqlFetch<{ brandGuide: BrandGuide }>(
      GET_BRAND_GUIDE_QUERY,
      {},
      token,
    )
    return data.brandGuide
  } catch {
    if (useSeedData()) return { ...mockGuide }
    throw new Error('Failed to fetch brand guide')
  }
}

export async function updateBrandGuide(
  token: string,
  input: UpdateBrandGuideInput,
): Promise<BrandGuide> {
  if (useSeedData()) {
    mockGuide = {
      ...mockGuide,
      missionStatement: input.missionStatement ?? mockGuide.missionStatement,
      voiceAttributes: input.voiceAttributes ?? mockGuide.voiceAttributes,
      toneGuidelines: input.toneGuidelines ?? mockGuide.toneGuidelines,
      prohibitedTerms: input.prohibitedTerms ?? mockGuide.prohibitedTerms,
      requiredTerms: input.requiredTerms ?? mockGuide.requiredTerms,
      updatedAt: new Date().toISOString(),
    }
    return { ...mockGuide }
  }

  const data = await authGraphqlFetch<{ updateBrandGuide: BrandGuide }>(
    UPDATE_BRAND_GUIDE_MUTATION,
    { input },
    token,
  )
  return data.updateBrandGuide
}

export async function validateContent(
  token: string,
  input: ValidateContentInput,
): Promise<BrandReview> {
  if (useSeedData()) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const review = runMockValidation(input.content, input.contentType)
    if (input.contentId) review.contentId = input.contentId
    mockReviews = [review, ...mockReviews]
    return review
  }

  const data = await authGraphqlFetch<{ validateContent: BrandReview }>(
    VALIDATE_CONTENT_MUTATION,
    { input },
    token,
  )
  return data.validateContent
}

export async function fetchBrandReviews(
  token: string,
  params: {
    contentId?: string
    approved?: boolean
    limit?: number
    offset?: number
  } = {},
): Promise<BrandReview[]> {
  try {
    const data = await authGraphqlFetch<{ brandReviews: BrandReview[] }>(
      BRAND_REVIEWS_QUERY,
      params,
      token,
    )
    return data.brandReviews
  } catch {
    if (useSeedData()) {
      let result = [...mockReviews]
      if (params.contentId) result = result.filter((r) => r.contentId === params.contentId)
      if (params.approved !== undefined) result = result.filter((r) => r.approved === params.approved)
      const offset = params.offset ?? 0
      const limit = params.limit ?? 50
      return result.slice(offset, offset + limit)
    }
    return []
  }
}

export async function fetchBrandHealth(
  token: string,
): Promise<BrandHealthMetrics> {
  try {
    const data = await authGraphqlFetch<{ brandHealth: BrandHealthMetrics }>(
      BRAND_HEALTH_QUERY,
      {},
      token,
    )
    return data.brandHealth
  } catch {
    if (useSeedData()) {
      const reviews = mockReviews
      const allViolations = reviews.flatMap((r) => r.violations)
      const approved = reviews.filter((r) => r.approved)

      const typeCounts = new Map<BrandViolationType, number>()
      for (const v of allViolations) {
        typeCounts.set(v.type, (typeCounts.get(v.type) || 0) + 1)
      }

      const avgScore: BrandScore = {
        overall: 0,
        voice: 0,
        terminology: 0,
        partnerPositioning: 0,
        competitorTreatment: 0,
        trackAlignment: 0,
        tone: 0,
      }
      if (reviews.length > 0) {
        for (const r of reviews) {
          avgScore.overall += r.score.overall
          avgScore.voice += r.score.voice
          avgScore.terminology += r.score.terminology
          avgScore.partnerPositioning += r.score.partnerPositioning
          avgScore.competitorTreatment += r.score.competitorTreatment
          avgScore.trackAlignment += r.score.trackAlignment
          avgScore.tone += r.score.tone
        }
        const n = reviews.length
        avgScore.overall = Math.round(avgScore.overall / n)
        avgScore.voice = Math.round(avgScore.voice / n)
        avgScore.terminology = Math.round(avgScore.terminology / n)
        avgScore.partnerPositioning = Math.round(avgScore.partnerPositioning / n)
        avgScore.competitorTreatment = Math.round(avgScore.competitorTreatment / n)
        avgScore.trackAlignment = Math.round(avgScore.trackAlignment / n)
        avgScore.tone = Math.round(avgScore.tone / n)
      }

      return {
        overallScore: avgScore.overall,
        reviewsThisWeek: reviews.length,
        violationsThisWeek: allViolations.length,
        blockingViolations: allViolations.filter((v) => v.severity === 'BLOCKING').length,
        approvalRate: reviews.length > 0 ? Math.round((approved.length / reviews.length) * 100) : 0,
        avgScore,
        topViolationTypes: Array.from(typeCounts.entries())
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        certifiedAgents: SEED_CERTIFICATIONS.filter((c) => c.status === 'CERTIFIED').length,
        totalAgents: SEED_CERTIFICATIONS.length,
      }
    }
    throw new Error('Failed to fetch brand health')
  }
}

export async function fetchBrandAuditLog(
  token: string,
  limit = 50,
  offset = 0,
): Promise<BrandAuditLogEntry[]> {
  try {
    const data = await authGraphqlFetch<{ brandAuditLog: BrandAuditLogEntry[] }>(
      BRAND_AUDIT_LOG_QUERY,
      { limit, offset },
      token,
    )
    return data.brandAuditLog
  } catch {
    if (useSeedData()) return [...SEED_AUDIT_LOG].slice(offset, offset + limit)
    return []
  }
}

export async function fetchBrandCertifications(
  token: string,
  status?: CertificationStatus,
): Promise<BrandCertification[]> {
  try {
    const data = await authGraphqlFetch<{ brandCertifications: BrandCertification[] }>(
      BRAND_CERTIFICATIONS_QUERY,
      { status },
      token,
    )
    return data.brandCertifications
  } catch {
    if (useSeedData()) {
      let result = [...SEED_CERTIFICATIONS]
      if (status) result = result.filter((c) => c.status === status)
      return result
    }
    return []
  }
}

// ---------------------------------------------------------------------------
// Convenience: terminology scan (subset of full validation)
// ---------------------------------------------------------------------------

export async function scanTerminology(
  token: string,
  content: string,
): Promise<BrandViolation[]> {
  const review = await validateContent(token, {
    content,
    contentType: 'MARKETING_COPY',
  })
  return review.violations.filter((v) => v.type === 'TERMINOLOGY')
}

// ---------------------------------------------------------------------------
// BF-BG-001: Brand Style Guide Registry — Granular CRUD
// ---------------------------------------------------------------------------

export type TerminologyStatus = 'REQUIRED' | 'FORBIDDEN' | 'PREFERRED'

export interface BrandTerminology {
  id: string
  term: string
  status: TerminologyStatus
  replacement: string | null
  context: string
  createdAt: string
  updatedAt: string
}

export interface BrandVoiceProfile {
  id: string
  name: string
  tone: string[]
  formality: 'CASUAL' | 'NEUTRAL' | 'FORMAL'
  personalityTraits: string[]
  doList: string[]
  dontList: string[]
  exampleGood: string[]
  exampleBad: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateTerminologyInput {
  term: string
  status: TerminologyStatus
  replacement?: string
  context: string
}

export interface UpdateTerminologyInput {
  term?: string
  status?: TerminologyStatus
  replacement?: string | null
  context?: string
}

export interface CreateVoiceProfileInput {
  name: string
  tone: string[]
  formality: 'CASUAL' | 'NEUTRAL' | 'FORMAL'
  personalityTraits: string[]
  doList: string[]
  dontList: string[]
  exampleGood?: string[]
  exampleBad?: string[]
}

export interface UpdateVoiceProfileInput {
  name?: string
  tone?: string[]
  formality?: 'CASUAL' | 'NEUTRAL' | 'FORMAL'
  personalityTraits?: string[]
  doList?: string[]
  dontList?: string[]
  exampleGood?: string[]
  exampleBad?: string[]
}

export interface CreateBrandRuleInput {
  category: BrandRuleCategory
  name: string
  description: string
  pattern?: string
  replacement?: string
  severity: ViolationSeverity
  examples?: string[]
}

export interface UpdateBrandRuleInput {
  category?: BrandRuleCategory
  name?: string
  description?: string
  pattern?: string | null
  replacement?: string | null
  severity?: ViolationSeverity
  active?: boolean
  examples?: string[]
}

// -- Seed: Terminology --

const SEED_TERMINOLOGY: BrandTerminology[] = [
  { id: 'bt-001', term: 'Alternate Futures', status: 'REQUIRED', replacement: null, context: 'Full brand name. Always use on first mention. Never abbreviate to AF, Alt Futures, or Alternate in formal content.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-002', term: 'Alternate Clouds', status: 'REQUIRED', replacement: null, context: 'Product name for cloud hosting. Always "Alternate Clouds" — never "AC", "Alt Clouds", or just "Clouds".', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-003', term: 'decentralized cloud platform', status: 'REQUIRED', replacement: null, context: 'Primary positioning phrase. Preferred over "Web3 hosting", "dApp hosting", or "blockchain hosting".', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-004', term: 'deploy', status: 'REQUIRED', replacement: null, context: 'Use "deploy" for publishing apps/sites. Not "upload", "publish", or "push" for the deployment action.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-005', term: 'Fleek', status: 'FORBIDDEN', replacement: null, context: 'NEVER mention in public-facing content. Internal competitive docs only. Hard rule.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-006', term: 'Web3 hosting', status: 'FORBIDDEN', replacement: 'decentralized cloud platform', context: 'We are not a "Web3 hosting" provider. Sounds niche and limits audience.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-007', term: 'blockchain hosting', status: 'FORBIDDEN', replacement: 'decentralized cloud platform', context: 'Avoid — we are a cloud platform, not a blockchain product.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-008', term: 'revolutionary', status: 'FORBIDDEN', replacement: null, context: 'Hype language. Quiet confidence, not marketing fluff.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-009', term: 'game-changing', status: 'FORBIDDEN', replacement: null, context: 'Hype language that undermines credibility.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-010', term: 'disrupt', status: 'FORBIDDEN', replacement: null, context: 'Overused startup jargon. We build, ship, and improve.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-011', term: 'AC', status: 'FORBIDDEN', replacement: 'Alternate Clouds', context: 'Do not abbreviate Alternate Clouds to AC.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-012', term: 'Alt Clouds', status: 'FORBIDDEN', replacement: 'Alternate Clouds', context: 'Do not abbreviate. Always use full name.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-013', term: 'synergy', status: 'FORBIDDEN', replacement: null, context: 'Corporate buzzword. Be specific about what you mean.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-014', term: 'leverage', status: 'FORBIDDEN', replacement: 'use', context: 'Overused business-speak. Say "use" instead.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-015', term: 'AF', status: 'PREFERRED', replacement: null, context: 'Acceptable abbreviation after first mention in casual contexts (Discord, internal docs).', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-016', term: 'ship', status: 'PREFERRED', replacement: null, context: 'Preferred verb for releasing. "We shipped dark mode" > "We released dark mode".', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-017', term: 'build', status: 'PREFERRED', replacement: null, context: 'Preferred action verb. "Build on AF", "Build with Alternate Clouds".', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-018', term: 'permanent hosting', status: 'PREFERRED', replacement: null, context: 'For IPFS/Arweave storage. Emphasizes permanence as a feature.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-019', term: 'one-click deploy', status: 'PREFERRED', replacement: null, context: 'Describes our simplified deployment flow. Emphasizes ease of use.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-020', term: 'AI agent hosting', status: 'PREFERRED', replacement: null, context: 'Key differentiator for AI agent deployment capability.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-021', term: 'data sovereignty', status: 'PREFERRED', replacement: null, context: 'Core value proposition of decentralized hosting.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'bt-022', term: 'censorship resistant', status: 'PREFERRED', replacement: null, context: 'Important differentiator for decentralized hosting.', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
]

// -- Seed: Voice Profiles --

const SEED_VOICE_PROFILES: BrandVoiceProfile[] = [
  {
    id: 'bv-001',
    name: 'Alternate Futures — Primary Voice',
    tone: ['confident', 'direct', 'warm', 'technical-but-approachable'],
    formality: 'NEUTRAL',
    personalityTraits: [
      'Builder mentality — we ship, we iterate, we improve',
      'Quiet confidence — no hype, no empty promises',
      'Community-first — we build with our users, not for them',
      'Technical depth — we know our stack and are not afraid to show it',
      'Wabi-sabi aesthetic — beauty in imperfection, warmth in simplicity',
    ],
    doList: [
      'Use "we" to represent the team',
      'Lead with user benefits before technical details',
      'Be specific — numbers, timelines, concrete examples',
      'Use active voice and short sentences',
      'Celebrate community contributions',
      'Acknowledge tradeoffs honestly',
      'Use analogies to explain complex concepts',
      'Write like you are explaining to a smart friend',
    ],
    dontList: [
      'Use hype words: revolutionary, game-changing, disrupt, synergy',
      'Make claims without evidence or citations',
      'Use jargon without explaining it',
      'Be self-deprecating or overly humble',
      'Use passive voice unnecessarily',
      'Write walls of text without structure',
      'Promise specific dates unless confirmed',
      'Mention competitors negatively — let our work speak',
    ],
    exampleGood: [
      'Deploy your AI agent to decentralized infrastructure in under 2 minutes. No vendor lock-in, no surprises on your cloud bill.',
      'We shipped IPFS pinning support this week. Here is how to use it with your existing Next.js project.',
      'Alternate Futures runs on Akash Network, cutting compute costs by 50-80% compared to AWS. Same performance, fraction of the price.',
    ],
    exampleBad: [
      'We are REVOLUTIONIZING the cloud industry with our GAME-CHANGING decentralized platform!!!',
      'Our disruptive synergistic platform leverages cutting-edge blockchain technology.',
      'Unlike those overpriced centralized dinosaurs, we actually care about developers.',
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

// -- In-memory mock stores (terminology + voice profiles) --

let mockTerminology = [...SEED_TERMINOLOGY]
let mockVoiceProfiles = [...SEED_VOICE_PROFILES]

// -- Terminology GraphQL --

const TERMINOLOGY_FIELDS = `id term status replacement context createdAt updatedAt`

const TERMINOLOGY_QUERY = `
  query BrandTerminology($limit: Int, $offset: Int) {
    brandTerminology(limit: $limit, offset: $offset) { ${TERMINOLOGY_FIELDS} }
  }
`

const CREATE_TERMINOLOGY_MUTATION = `
  mutation CreateBrandTerminology($input: CreateBrandTerminologyInput!) {
    createBrandTerminology(input: $input) { ${TERMINOLOGY_FIELDS} }
  }
`

const UPDATE_TERMINOLOGY_MUTATION = `
  mutation UpdateBrandTerminology($id: ID!, $input: UpdateBrandTerminologyInput!) {
    updateBrandTerminology(id: $id, input: $input) { ${TERMINOLOGY_FIELDS} }
  }
`

const DELETE_TERMINOLOGY_MUTATION = `
  mutation DeleteBrandTerminology($id: ID!) {
    deleteBrandTerminology(id: $id) { id }
  }
`

// -- Voice Profile GraphQL --

const VOICE_PROFILE_FIELDS = `
  id name tone formality personalityTraits doList dontList exampleGood exampleBad createdAt updatedAt
`

const VOICE_PROFILES_QUERY = `
  query BrandVoiceProfiles { brandVoiceProfiles { ${VOICE_PROFILE_FIELDS} } }
`

const CREATE_VOICE_PROFILE_MUTATION = `
  mutation CreateBrandVoiceProfile($input: CreateBrandVoiceProfileInput!) {
    createBrandVoiceProfile(input: $input) { ${VOICE_PROFILE_FIELDS} }
  }
`

const UPDATE_VOICE_PROFILE_MUTATION = `
  mutation UpdateBrandVoiceProfile($id: ID!, $input: UpdateBrandVoiceProfileInput!) {
    updateBrandVoiceProfile(id: $id, input: $input) { ${VOICE_PROFILE_FIELDS} }
  }
`

const DELETE_VOICE_PROFILE_MUTATION = `
  mutation DeleteBrandVoiceProfile($id: ID!) {
    deleteBrandVoiceProfile(id: $id) { id }
  }
`

// -- Brand Rule CRUD GraphQL --

const CREATE_BRAND_RULE_MUTATION = `
  mutation CreateBrandRule($input: CreateBrandRuleInput!) {
    createBrandRule(input: $input) { ${BRAND_RULE_FIELDS} }
  }
`

const UPDATE_BRAND_RULE_MUTATION = `
  mutation UpdateBrandRule($id: ID!, $input: UpdateBrandRuleInput!) {
    updateBrandRule(id: $id, input: $input) { ${BRAND_RULE_FIELDS} }
  }
`

const DELETE_BRAND_RULE_MUTATION = `
  mutation DeleteBrandRule($id: ID!) {
    deleteBrandRule(id: $id) { id }
  }
`

// ---------------------------------------------------------------------------
// Terminology CRUD
// ---------------------------------------------------------------------------

export async function fetchAllTerminology(
  token: string,
  limit = 200,
  offset = 0,
): Promise<BrandTerminology[]> {
  try {
    const data = await authGraphqlFetch<{ brandTerminology: BrandTerminology[] }>(
      TERMINOLOGY_QUERY,
      { limit, offset },
      token,
    )
    return data.brandTerminology
  } catch {
    if (useSeedData()) return mockTerminology.slice(offset, offset + limit)
    return []
  }
}

export async function createTerminology(
  token: string,
  input: CreateTerminologyInput,
): Promise<BrandTerminology> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const entry: BrandTerminology = {
      id: `bt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      term: input.term,
      status: input.status,
      replacement: input.replacement || null,
      context: input.context,
      createdAt: now,
      updatedAt: now,
    }
    mockTerminology = [entry, ...mockTerminology]
    return entry
  }

  const data = await authGraphqlFetch<{ createBrandTerminology: BrandTerminology }>(
    CREATE_TERMINOLOGY_MUTATION,
    { input },
    token,
  )
  return data.createBrandTerminology
}

export async function updateTerminology(
  token: string,
  id: string,
  input: UpdateTerminologyInput,
): Promise<BrandTerminology> {
  if (useSeedData()) {
    const idx = mockTerminology.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Terminology entry not found')
    const existing = mockTerminology[idx]
    const updated: BrandTerminology = {
      ...existing,
      term: input.term !== undefined ? input.term : existing.term,
      status: input.status !== undefined ? input.status : existing.status,
      replacement: input.replacement !== undefined ? input.replacement : existing.replacement,
      context: input.context !== undefined ? input.context : existing.context,
      updatedAt: new Date().toISOString(),
    }
    mockTerminology[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateBrandTerminology: BrandTerminology }>(
    UPDATE_TERMINOLOGY_MUTATION,
    { id, input },
    token,
  )
  return data.updateBrandTerminology
}

export async function deleteTerminology(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockTerminology = mockTerminology.filter((t) => t.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteBrandTerminology: { id: string } }>(
    DELETE_TERMINOLOGY_MUTATION,
    { id },
    token,
  )
}

// ---------------------------------------------------------------------------
// Voice Profiles CRUD
// ---------------------------------------------------------------------------

export async function fetchAllVoiceProfiles(
  token: string,
): Promise<BrandVoiceProfile[]> {
  try {
    const data = await authGraphqlFetch<{ brandVoiceProfiles: BrandVoiceProfile[] }>(
      VOICE_PROFILES_QUERY,
      {},
      token,
    )
    return data.brandVoiceProfiles
  } catch {
    if (useSeedData()) return [...mockVoiceProfiles]
    return []
  }
}

export async function createVoiceProfile(
  token: string,
  input: CreateVoiceProfileInput,
): Promise<BrandVoiceProfile> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const profile: BrandVoiceProfile = {
      id: `bv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name,
      tone: input.tone,
      formality: input.formality,
      personalityTraits: input.personalityTraits,
      doList: input.doList,
      dontList: input.dontList,
      exampleGood: input.exampleGood || [],
      exampleBad: input.exampleBad || [],
      createdAt: now,
      updatedAt: now,
    }
    mockVoiceProfiles = [profile, ...mockVoiceProfiles]
    return profile
  }

  const data = await authGraphqlFetch<{ createBrandVoiceProfile: BrandVoiceProfile }>(
    CREATE_VOICE_PROFILE_MUTATION,
    { input },
    token,
  )
  return data.createBrandVoiceProfile
}

export async function updateVoiceProfile(
  token: string,
  id: string,
  input: UpdateVoiceProfileInput,
): Promise<BrandVoiceProfile> {
  if (useSeedData()) {
    const idx = mockVoiceProfiles.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Voice profile not found')
    const existing = mockVoiceProfiles[idx]
    const updated: BrandVoiceProfile = {
      ...existing,
      name: input.name !== undefined ? input.name : existing.name,
      tone: input.tone !== undefined ? input.tone : existing.tone,
      formality: input.formality !== undefined ? input.formality : existing.formality,
      personalityTraits: input.personalityTraits !== undefined ? input.personalityTraits : existing.personalityTraits,
      doList: input.doList !== undefined ? input.doList : existing.doList,
      dontList: input.dontList !== undefined ? input.dontList : existing.dontList,
      exampleGood: input.exampleGood !== undefined ? input.exampleGood : existing.exampleGood,
      exampleBad: input.exampleBad !== undefined ? input.exampleBad : existing.exampleBad,
      updatedAt: new Date().toISOString(),
    }
    mockVoiceProfiles[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateBrandVoiceProfile: BrandVoiceProfile }>(
    UPDATE_VOICE_PROFILE_MUTATION,
    { id, input },
    token,
  )
  return data.updateBrandVoiceProfile
}

export async function deleteVoiceProfile(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockVoiceProfiles = mockVoiceProfiles.filter((p) => p.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteBrandVoiceProfile: { id: string } }>(
    DELETE_VOICE_PROFILE_MUTATION,
    { id },
    token,
  )
}

// ---------------------------------------------------------------------------
// Brand Rules CRUD (individual rules beyond guide)
// ---------------------------------------------------------------------------

export async function createBrandRule(
  token: string,
  input: CreateBrandRuleInput,
): Promise<BrandRule> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const rule: BrandRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: input.category,
      name: input.name,
      description: input.description,
      pattern: input.pattern || null,
      replacement: input.replacement || null,
      severity: input.severity,
      active: true,
      examples: input.examples || [],
      createdAt: now,
      updatedAt: now,
    }
    mockGuide = { ...mockGuide, rules: [rule, ...mockGuide.rules] }
    return rule
  }

  const data = await authGraphqlFetch<{ createBrandRule: BrandRule }>(
    CREATE_BRAND_RULE_MUTATION,
    { input },
    token,
  )
  return data.createBrandRule
}

export async function updateBrandRule(
  token: string,
  id: string,
  input: UpdateBrandRuleInput,
): Promise<BrandRule> {
  if (useSeedData()) {
    const idx = mockGuide.rules.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Brand rule not found')
    const existing = mockGuide.rules[idx]
    const updated: BrandRule = {
      ...existing,
      category: input.category !== undefined ? input.category : existing.category,
      name: input.name !== undefined ? input.name : existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      pattern: input.pattern !== undefined ? input.pattern : existing.pattern,
      replacement: input.replacement !== undefined ? input.replacement : existing.replacement,
      severity: input.severity !== undefined ? input.severity : existing.severity,
      active: input.active !== undefined ? input.active : existing.active,
      examples: input.examples !== undefined ? input.examples : existing.examples,
      updatedAt: new Date().toISOString(),
    }
    const newRules = [...mockGuide.rules]
    newRules[idx] = updated
    mockGuide = { ...mockGuide, rules: newRules }
    return updated
  }

  const data = await authGraphqlFetch<{ updateBrandRule: BrandRule }>(
    UPDATE_BRAND_RULE_MUTATION,
    { id, input },
    token,
  )
  return data.updateBrandRule
}

export async function deleteBrandRule(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockGuide = { ...mockGuide, rules: mockGuide.rules.filter((r) => r.id !== id) }
    return
  }

  await authGraphqlFetch<{ deleteBrandRule: { id: string } }>(
    DELETE_BRAND_RULE_MUTATION,
    { id },
    token,
  )
}

// Re-export seed data
export {
  SEED_BRAND_GUIDE,
  SEED_REVIEWS,
  SEED_CERTIFICATIONS,
  SEED_AUDIT_LOG,
  SEED_TERMINOLOGY,
  SEED_VOICE_PROFILES,
}
