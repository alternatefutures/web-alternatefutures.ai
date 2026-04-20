// ---------------------------------------------------------------------------
// Approval Analytics API — tracks every approval decision for system improvement
// ---------------------------------------------------------------------------

import type { SocialPlatform } from './social-api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ApprovalAction = 'APPROVE' | 'REJECT' | 'CHANGES_REQUESTED'

export type FeedbackCategory =
  | 'TONE_WRONG'
  | 'TOO_LONG'
  | 'TOO_SHORT'
  | 'OFF_BRAND'
  | 'FACTUAL_ERROR'
  | 'AI_SOUNDING'
  | 'MISSING_CTA'
  | 'WRONG_PLATFORM_FIT'
  | 'NEEDS_HASHTAGS'
  | 'GRAMMAR'
  | 'OTHER'

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  TONE_WRONG: 'Tone Wrong',
  TOO_LONG: 'Too Long',
  TOO_SHORT: 'Too Short',
  OFF_BRAND: 'Off-Brand',
  FACTUAL_ERROR: 'Factual Error',
  AI_SOUNDING: 'AI-Sounding',
  MISSING_CTA: 'Missing CTA',
  WRONG_PLATFORM_FIT: 'Wrong Platform Fit',
  NEEDS_HASHTAGS: 'Needs Hashtags',
  GRAMMAR: 'Grammar',
  OTHER: 'Other',
}

export const ALL_FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  'TONE_WRONG', 'TOO_LONG', 'TOO_SHORT', 'OFF_BRAND', 'FACTUAL_ERROR',
  'AI_SOUNDING', 'MISSING_CTA', 'WRONG_PLATFORM_FIT', 'NEEDS_HASHTAGS',
  'GRAMMAR', 'OTHER',
]

export type ContentType = 'blog' | 'social' | 'email' | 'changelog' | 'press_release' | 'docs'

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  blog: 'Blog Post',
  social: 'Social Post',
  email: 'Email',
  changelog: 'Changelog',
  press_release: 'Press Release',
  docs: 'Documentation',
}

export interface ApprovalDecision {
  id: string
  postId: string
  action: ApprovalAction
  reviewer: string
  timestamp: string
  feedback: string | null
  feedbackCategory: FeedbackCategory | null
  contentType: ContentType
  platform: SocialPlatform
  model_used: string
  tone: string
  wordCount: number
}

// ---------------------------------------------------------------------------
// Analytics result types
// ---------------------------------------------------------------------------

export interface ApprovalRateResult {
  total: number
  approved: number
  rejected: number
  changesRequested: number
  approvalRate: number
  rejectionRate: number
  changesRate: number
}

export interface RejectionReasonResult {
  category: FeedbackCategory
  label: string
  count: number
  percentage: number
}

export interface ModelPerformanceResult {
  model: string
  postsGenerated: number
  approved: number
  rejected: number
  changesRequested: number
  approvalRate: number
  topRejectionReason: string | null
  avgRevisionRounds: number
}

export interface ReviewerPatternResult {
  reviewer: string
  total: number
  approved: number
  rejected: number
  changesRequested: number
  approvalRate: number
  topRejectionCategory: FeedbackCategory | null
}

export interface ApprovalTrendPoint {
  date: string
  label: string
  total: number
  approved: number
  approvalRate: number
}

export interface ContentTypeBreakdown {
  contentType: ContentType
  label: string
  total: number
  approved: number
  approvalRate: number
}

export interface PlatformBreakdown {
  platform: SocialPlatform
  total: number
  approved: number
  approvalRate: number
}

export interface ActionableInsight {
  id: string
  type: 'warning' | 'info' | 'success'
  message: string
}

// ---------------------------------------------------------------------------
// Seed data — 55 realistic approval decisions
// ---------------------------------------------------------------------------

const MODELS = ['llama-3.3-70b', 'qwen2.5-7b', 'deepseek-r1', 'mixtral-8x7b', 'claude-3-haiku']
const TONES = ['professional', 'casual', 'technical', 'playful']
const REVIEWERS = ['echo', 'hana', 'yusuke', 'senku', 'aria']
const PLATFORMS: SocialPlatform[] = ['X', 'LINKEDIN', 'BLUESKY', 'DISCORD', 'REDDIT', 'MASTODON', 'THREADS']
const CONTENT_TYPES: ContentType[] = ['social', 'blog', 'email', 'changelog', 'press_release', 'docs']

function seedDate(daysAgo: number): string {
  const d = new Date('2026-02-15T12:00:00Z')
  d.setDate(d.getDate() - daysAgo)
  d.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60))
  return d.toISOString()
}

const SEED_DECISIONS: ApprovalDecision[] = [
  // Batch 1: Approvals across platforms and models
  { id: 'ad-001', postId: 'sp-101', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(1), feedback: 'Clean copy, great CTA placement.', feedbackCategory: null, contentType: 'social', platform: 'X', model_used: 'llama-3.3-70b', tone: 'professional', wordCount: 42 },
  { id: 'ad-002', postId: 'sp-102', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(1), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'LINKEDIN', model_used: 'llama-3.3-70b', tone: 'professional', wordCount: 185 },
  { id: 'ad-003', postId: 'sp-103', action: 'REJECT', reviewer: 'echo', timestamp: seedDate(2), feedback: 'Reads like a chatbot wrote it. Needs human touch.', feedbackCategory: 'AI_SOUNDING', contentType: 'social', platform: 'X', model_used: 'qwen2.5-7b', tone: 'professional', wordCount: 38 },
  { id: 'ad-004', postId: 'sp-104', action: 'APPROVE', reviewer: 'hana', timestamp: seedDate(2), feedback: 'Visual pairs well with this copy.', feedbackCategory: null, contentType: 'social', platform: 'INSTAGRAM', model_used: 'llama-3.3-70b', tone: 'casual', wordCount: 65 },
  { id: 'ad-005', postId: 'sp-105', action: 'CHANGES_REQUESTED', reviewer: 'senku', timestamp: seedDate(3), feedback: 'Too vague on technical specs. Add GPU count and latency numbers.', feedbackCategory: 'TOO_SHORT', contentType: 'blog', platform: 'LINKEDIN', model_used: 'deepseek-r1', tone: 'technical', wordCount: 320 },
  { id: 'ad-006', postId: 'sp-106', action: 'APPROVE', reviewer: 'yusuke', timestamp: seedDate(3), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'BLUESKY', model_used: 'llama-3.3-70b', tone: 'casual', wordCount: 55 },
  { id: 'ad-007', postId: 'sp-107', action: 'REJECT', reviewer: 'echo', timestamp: seedDate(4), feedback: 'Off-brand. We do not use hype language like "revolutionary".', feedbackCategory: 'OFF_BRAND', contentType: 'social', platform: 'X', model_used: 'qwen2.5-7b', tone: 'playful', wordCount: 44 },
  { id: 'ad-008', postId: 'sp-108', action: 'APPROVE', reviewer: 'aria', timestamp: seedDate(4), feedback: 'Good rhythm for video overlay text.', feedbackCategory: null, contentType: 'social', platform: 'THREADS', model_used: 'mixtral-8x7b', tone: 'casual', wordCount: 30 },
  { id: 'ad-009', postId: 'sp-109', action: 'CHANGES_REQUESTED', reviewer: 'echo', timestamp: seedDate(5), feedback: 'Missing call-to-action. Add link to docs or signup.', feedbackCategory: 'MISSING_CTA', contentType: 'social', platform: 'LINKEDIN', model_used: 'qwen2.5-7b', tone: 'professional', wordCount: 210 },
  { id: 'ad-010', postId: 'sp-110', action: 'APPROVE', reviewer: 'senku', timestamp: seedDate(5), feedback: 'Technically accurate. Good depth.', feedbackCategory: null, contentType: 'blog', platform: 'REDDIT', model_used: 'deepseek-r1', tone: 'technical', wordCount: 480 },

  // Batch 2: More rejections and changes
  { id: 'ad-011', postId: 'sp-111', action: 'REJECT', reviewer: 'hana', timestamp: seedDate(6), feedback: 'Tone is way too corporate for Discord. Rewrite casually.', feedbackCategory: 'TONE_WRONG', contentType: 'social', platform: 'DISCORD', model_used: 'llama-3.3-70b', tone: 'professional', wordCount: 150 },
  { id: 'ad-012', postId: 'sp-112', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(6), feedback: null, feedbackCategory: null, contentType: 'changelog', platform: 'X', model_used: 'claude-3-haiku', tone: 'technical', wordCount: 68 },
  { id: 'ad-013', postId: 'sp-113', action: 'CHANGES_REQUESTED', reviewer: 'echo', timestamp: seedDate(7), feedback: 'Way too long for Twitter. Cut to under 280 chars.', feedbackCategory: 'TOO_LONG', contentType: 'social', platform: 'X', model_used: 'deepseek-r1', tone: 'professional', wordCount: 95 },
  { id: 'ad-014', postId: 'sp-114', action: 'APPROVE', reviewer: 'yusuke', timestamp: seedDate(7), feedback: 'Solid announcement post.', feedbackCategory: null, contentType: 'social', platform: 'MASTODON', model_used: 'llama-3.3-70b', tone: 'casual', wordCount: 78 },
  { id: 'ad-015', postId: 'sp-115', action: 'REJECT', reviewer: 'senku', timestamp: seedDate(8), feedback: 'Factually wrong — we use Pingap not Nginx for SSL proxy.', feedbackCategory: 'FACTUAL_ERROR', contentType: 'blog', platform: 'LINKEDIN', model_used: 'qwen2.5-7b', tone: 'technical', wordCount: 350 },
  { id: 'ad-016', postId: 'sp-116', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(8), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'X', model_used: 'llama-3.3-70b', tone: 'professional', wordCount: 40 },
  { id: 'ad-017', postId: 'sp-117', action: 'CHANGES_REQUESTED', reviewer: 'hana', timestamp: seedDate(9), feedback: 'Needs hashtags. At least 3 relevant ones for discoverability.', feedbackCategory: 'NEEDS_HASHTAGS', contentType: 'social', platform: 'THREADS', model_used: 'mixtral-8x7b', tone: 'casual', wordCount: 55 },
  { id: 'ad-018', postId: 'sp-118', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(9), feedback: 'Perfect LinkedIn tone.', feedbackCategory: null, contentType: 'social', platform: 'LINKEDIN', model_used: 'claude-3-haiku', tone: 'professional', wordCount: 190 },
  { id: 'ad-019', postId: 'sp-119', action: 'REJECT', reviewer: 'echo', timestamp: seedDate(10), feedback: 'Grammar issues throughout. Run through spell check.', feedbackCategory: 'GRAMMAR', contentType: 'email', platform: 'LINKEDIN', model_used: 'qwen2.5-7b', tone: 'professional', wordCount: 240 },
  { id: 'ad-020', postId: 'sp-120', action: 'APPROVE', reviewer: 'aria', timestamp: seedDate(10), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'X', model_used: 'llama-3.3-70b', tone: 'playful', wordCount: 35 },

  // Batch 3: Mixed decisions, diverse platforms
  { id: 'ad-021', postId: 'sp-121', action: 'APPROVE', reviewer: 'senku', timestamp: seedDate(11), feedback: 'Technical accuracy verified.', feedbackCategory: null, contentType: 'docs', platform: 'REDDIT', model_used: 'deepseek-r1', tone: 'technical', wordCount: 520 },
  { id: 'ad-022', postId: 'sp-122', action: 'CHANGES_REQUESTED', reviewer: 'echo', timestamp: seedDate(11), feedback: 'Not a good fit for Reddit. Too promotional, rewrite as value-add.', feedbackCategory: 'WRONG_PLATFORM_FIT', contentType: 'social', platform: 'REDDIT', model_used: 'qwen2.5-7b', tone: 'professional', wordCount: 180 },
  { id: 'ad-023', postId: 'sp-123', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(12), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'BLUESKY', model_used: 'llama-3.3-70b', tone: 'casual', wordCount: 48 },
  { id: 'ad-024', postId: 'sp-124', action: 'REJECT', reviewer: 'hana', timestamp: seedDate(12), feedback: 'Reads like generic AI output. Too many filler phrases.', feedbackCategory: 'AI_SOUNDING', contentType: 'social', platform: 'LINKEDIN', model_used: 'mixtral-8x7b', tone: 'professional', wordCount: 165 },
  { id: 'ad-025', postId: 'sp-125', action: 'APPROVE', reviewer: 'yusuke', timestamp: seedDate(13), feedback: 'Great visual copy.', feedbackCategory: null, contentType: 'social', platform: 'INSTAGRAM', model_used: 'claude-3-haiku', tone: 'casual', wordCount: 28 },
  { id: 'ad-026', postId: 'sp-126', action: 'CHANGES_REQUESTED', reviewer: 'echo', timestamp: seedDate(13), feedback: 'Off-brand tone. We never use "web3 vibes" unironically.', feedbackCategory: 'OFF_BRAND', contentType: 'social', platform: 'X', model_used: 'qwen2.5-7b', tone: 'playful', wordCount: 42 },
  { id: 'ad-027', postId: 'sp-127', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(14), feedback: null, feedbackCategory: null, contentType: 'press_release', platform: 'LINKEDIN', model_used: 'llama-3.3-70b', tone: 'professional', wordCount: 380 },
  { id: 'ad-028', postId: 'sp-128', action: 'APPROVE', reviewer: 'senku', timestamp: seedDate(14), feedback: 'Accurate changelog entry.', feedbackCategory: null, contentType: 'changelog', platform: 'DISCORD', model_used: 'deepseek-r1', tone: 'technical', wordCount: 120 },
  { id: 'ad-029', postId: 'sp-129', action: 'REJECT', reviewer: 'echo', timestamp: seedDate(15), feedback: 'Way too long for Bluesky. Trim to under 300 chars.', feedbackCategory: 'TOO_LONG', contentType: 'social', platform: 'BLUESKY', model_used: 'deepseek-r1', tone: 'professional', wordCount: 110 },
  { id: 'ad-030', postId: 'sp-130', action: 'APPROVE', reviewer: 'aria', timestamp: seedDate(15), feedback: 'Concise and punchy.', feedbackCategory: null, contentType: 'social', platform: 'X', model_used: 'claude-3-haiku', tone: 'playful', wordCount: 32 },

  // Batch 4: Recent decisions — demonstrates improving trend
  { id: 'ad-031', postId: 'sp-131', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(16), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'X', model_used: 'llama-3.3-70b', tone: 'professional', wordCount: 45 },
  { id: 'ad-032', postId: 'sp-132', action: 'APPROVE', reviewer: 'hana', timestamp: seedDate(16), feedback: 'Matches brand palette brief.', feedbackCategory: null, contentType: 'social', platform: 'THREADS', model_used: 'llama-3.3-70b', tone: 'casual', wordCount: 52 },
  { id: 'ad-033', postId: 'sp-133', action: 'CHANGES_REQUESTED', reviewer: 'senku', timestamp: seedDate(17), feedback: 'Missing CTA link to the deploy guide.', feedbackCategory: 'MISSING_CTA', contentType: 'blog', platform: 'LINKEDIN', model_used: 'mixtral-8x7b', tone: 'professional', wordCount: 290 },
  { id: 'ad-034', postId: 'sp-134', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(17), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'BLUESKY', model_used: 'claude-3-haiku', tone: 'casual', wordCount: 60 },
  { id: 'ad-035', postId: 'sp-135', action: 'APPROVE', reviewer: 'yusuke', timestamp: seedDate(18), feedback: 'Works well.', feedbackCategory: null, contentType: 'social', platform: 'MASTODON', model_used: 'llama-3.3-70b', tone: 'casual', wordCount: 70 },
  { id: 'ad-036', postId: 'sp-136', action: 'REJECT', reviewer: 'echo', timestamp: seedDate(18), feedback: 'Too short. This LinkedIn post needs more substance.', feedbackCategory: 'TOO_SHORT', contentType: 'social', platform: 'LINKEDIN', model_used: 'qwen2.5-7b', tone: 'professional', wordCount: 45 },
  { id: 'ad-037', postId: 'sp-137', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(19), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'X', model_used: 'llama-3.3-70b', tone: 'technical', wordCount: 55 },
  { id: 'ad-038', postId: 'sp-138', action: 'APPROVE', reviewer: 'senku', timestamp: seedDate(19), feedback: 'Solid technical write-up.', feedbackCategory: null, contentType: 'docs', platform: 'REDDIT', model_used: 'deepseek-r1', tone: 'technical', wordCount: 450 },
  { id: 'ad-039', postId: 'sp-139', action: 'CHANGES_REQUESTED', reviewer: 'hana', timestamp: seedDate(20), feedback: 'Tone is wrong for Instagram. Make it more visual and lifestyle.', feedbackCategory: 'TONE_WRONG', contentType: 'social', platform: 'INSTAGRAM', model_used: 'mixtral-8x7b', tone: 'technical', wordCount: 80 },
  { id: 'ad-040', postId: 'sp-140', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(20), feedback: null, feedbackCategory: null, contentType: 'email', platform: 'LINKEDIN', model_used: 'llama-3.3-70b', tone: 'professional', wordCount: 220 },

  // Batch 5: Most recent — higher approval rate (system learning)
  { id: 'ad-041', postId: 'sp-141', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(21), feedback: 'Great improvement in tone.', feedbackCategory: null, contentType: 'social', platform: 'X', model_used: 'llama-3.3-70b', tone: 'professional', wordCount: 38 },
  { id: 'ad-042', postId: 'sp-142', action: 'APPROVE', reviewer: 'hana', timestamp: seedDate(21), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'THREADS', model_used: 'claude-3-haiku', tone: 'playful', wordCount: 42 },
  { id: 'ad-043', postId: 'sp-143', action: 'APPROVE', reviewer: 'senku', timestamp: seedDate(22), feedback: null, feedbackCategory: null, contentType: 'changelog', platform: 'DISCORD', model_used: 'deepseek-r1', tone: 'technical', wordCount: 130 },
  { id: 'ad-044', postId: 'sp-144', action: 'REJECT', reviewer: 'echo', timestamp: seedDate(22), feedback: 'Factual error: IPFS pinning costs are wrong.', feedbackCategory: 'FACTUAL_ERROR', contentType: 'blog', platform: 'LINKEDIN', model_used: 'qwen2.5-7b', tone: 'professional', wordCount: 310 },
  { id: 'ad-045', postId: 'sp-145', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(23), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'BLUESKY', model_used: 'llama-3.3-70b', tone: 'casual', wordCount: 55 },
  { id: 'ad-046', postId: 'sp-146', action: 'APPROVE', reviewer: 'yusuke', timestamp: seedDate(23), feedback: 'Clean.', feedbackCategory: null, contentType: 'social', platform: 'MASTODON', model_used: 'claude-3-haiku', tone: 'casual', wordCount: 68 },
  { id: 'ad-047', postId: 'sp-147', action: 'APPROVE', reviewer: 'aria', timestamp: seedDate(24), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'X', model_used: 'llama-3.3-70b', tone: 'playful', wordCount: 30 },
  { id: 'ad-048', postId: 'sp-148', action: 'CHANGES_REQUESTED', reviewer: 'echo', timestamp: seedDate(24), feedback: 'Needs 2-3 hashtags for Threads discoverability.', feedbackCategory: 'NEEDS_HASHTAGS', contentType: 'social', platform: 'THREADS', model_used: 'mixtral-8x7b', tone: 'casual', wordCount: 48 },
  { id: 'ad-049', postId: 'sp-149', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(25), feedback: 'Excellent press release draft.', feedbackCategory: null, contentType: 'press_release', platform: 'LINKEDIN', model_used: 'llama-3.3-70b', tone: 'professional', wordCount: 400 },
  { id: 'ad-050', postId: 'sp-150', action: 'APPROVE', reviewer: 'senku', timestamp: seedDate(25), feedback: null, feedbackCategory: null, contentType: 'docs', platform: 'REDDIT', model_used: 'deepseek-r1', tone: 'technical', wordCount: 490 },
  { id: 'ad-051', postId: 'sp-151', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(26), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'X', model_used: 'llama-3.3-70b', tone: 'professional', wordCount: 42 },
  { id: 'ad-052', postId: 'sp-152', action: 'REJECT', reviewer: 'hana', timestamp: seedDate(26), feedback: 'Generic AI phrasing. "Leverage the power of" — please rewrite.', feedbackCategory: 'AI_SOUNDING', contentType: 'social', platform: 'LINKEDIN', model_used: 'qwen2.5-7b', tone: 'professional', wordCount: 175 },
  { id: 'ad-053', postId: 'sp-153', action: 'APPROVE', reviewer: 'echo', timestamp: seedDate(27), feedback: null, feedbackCategory: null, contentType: 'social', platform: 'DISCORD', model_used: 'claude-3-haiku', tone: 'casual', wordCount: 90 },
  { id: 'ad-054', postId: 'sp-154', action: 'APPROVE', reviewer: 'yusuke', timestamp: seedDate(28), feedback: 'Solid.', feedbackCategory: null, contentType: 'social', platform: 'BLUESKY', model_used: 'llama-3.3-70b', tone: 'casual', wordCount: 50 },
  { id: 'ad-055', postId: 'sp-155', action: 'CHANGES_REQUESTED', reviewer: 'echo', timestamp: seedDate(28), feedback: 'Wrong fit. This reads like a LinkedIn post, not a Reddit post.', feedbackCategory: 'WRONG_PLATFORM_FIT', contentType: 'social', platform: 'REDDIT', model_used: 'mixtral-8x7b', tone: 'professional', wordCount: 160 },
]

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

let decisions = [...SEED_DECISIONS]

export function getAllDecisions(): ApprovalDecision[] {
  return decisions
}

export function addDecision(decision: ApprovalDecision): void {
  decisions = [decision, ...decisions]
}

// ---------------------------------------------------------------------------
// Analytics functions
// ---------------------------------------------------------------------------

export function getApprovalRate(): ApprovalRateResult {
  const total = decisions.length
  const approved = decisions.filter((d) => d.action === 'APPROVE').length
  const rejected = decisions.filter((d) => d.action === 'REJECT').length
  const changesRequested = decisions.filter((d) => d.action === 'CHANGES_REQUESTED').length

  return {
    total,
    approved,
    rejected,
    changesRequested,
    approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
    changesRate: total > 0 ? Math.round((changesRequested / total) * 100) : 0,
  }
}

export function getTopRejectionReasons(): RejectionReasonResult[] {
  const nonApproved = decisions.filter((d) => d.action !== 'APPROVE' && d.feedbackCategory)
  const total = nonApproved.length

  const counts = new Map<FeedbackCategory, number>()
  for (const d of nonApproved) {
    if (d.feedbackCategory) {
      counts.set(d.feedbackCategory, (counts.get(d.feedbackCategory) || 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({
      category,
      label: FEEDBACK_CATEGORY_LABELS[category],
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export function getApprovalsByModel(): ModelPerformanceResult[] {
  const models = new Map<string, ApprovalDecision[]>()
  for (const d of decisions) {
    const existing = models.get(d.model_used) || []
    existing.push(d)
    models.set(d.model_used, existing)
  }

  return Array.from(models.entries())
    .map(([model, modelDecisions]) => {
      const approved = modelDecisions.filter((d) => d.action === 'APPROVE').length
      const rejected = modelDecisions.filter((d) => d.action === 'REJECT').length
      const changesRequested = modelDecisions.filter((d) => d.action === 'CHANGES_REQUESTED').length

      // Find top rejection reason
      const rejectionCategories = new Map<string, number>()
      for (const d of modelDecisions) {
        if (d.action !== 'APPROVE' && d.feedbackCategory) {
          rejectionCategories.set(d.feedbackCategory, (rejectionCategories.get(d.feedbackCategory) || 0) + 1)
        }
      }
      const topRejection = Array.from(rejectionCategories.entries()).sort((a, b) => b[1] - a[1])[0]

      // Estimate avg revision rounds from changes-requested ratio
      const avgRevisionRounds = modelDecisions.length > 0
        ? parseFloat(((changesRequested + rejected) / modelDecisions.length * 1.5 + 1).toFixed(1))
        : 1

      return {
        model,
        postsGenerated: modelDecisions.length,
        approved,
        rejected,
        changesRequested,
        approvalRate: modelDecisions.length > 0 ? Math.round((approved / modelDecisions.length) * 100) : 0,
        topRejectionReason: topRejection ? FEEDBACK_CATEGORY_LABELS[topRejection[0] as FeedbackCategory] : null,
        avgRevisionRounds,
      }
    })
    .sort((a, b) => b.postsGenerated - a.postsGenerated)
}

export function getApprovalsByContentType(): ContentTypeBreakdown[] {
  const types = new Map<ContentType, ApprovalDecision[]>()
  for (const d of decisions) {
    const existing = types.get(d.contentType) || []
    existing.push(d)
    types.set(d.contentType, existing)
  }

  return Array.from(types.entries())
    .map(([contentType, typeDecisions]) => {
      const approved = typeDecisions.filter((d) => d.action === 'APPROVE').length
      return {
        contentType,
        label: CONTENT_TYPE_LABELS[contentType],
        total: typeDecisions.length,
        approved,
        approvalRate: typeDecisions.length > 0 ? Math.round((approved / typeDecisions.length) * 100) : 0,
      }
    })
    .sort((a, b) => b.total - a.total)
}

export function getApprovalsByReviewer(): ReviewerPatternResult[] {
  const reviewers = new Map<string, ApprovalDecision[]>()
  for (const d of decisions) {
    const existing = reviewers.get(d.reviewer) || []
    existing.push(d)
    reviewers.set(d.reviewer, existing)
  }

  return Array.from(reviewers.entries())
    .map(([reviewer, reviewerDecisions]) => {
      const approved = reviewerDecisions.filter((d) => d.action === 'APPROVE').length
      const rejected = reviewerDecisions.filter((d) => d.action === 'REJECT').length
      const changesRequested = reviewerDecisions.filter((d) => d.action === 'CHANGES_REQUESTED').length

      const rejectionCategories = new Map<FeedbackCategory, number>()
      for (const d of reviewerDecisions) {
        if (d.action !== 'APPROVE' && d.feedbackCategory) {
          rejectionCategories.set(d.feedbackCategory, (rejectionCategories.get(d.feedbackCategory) || 0) + 1)
        }
      }
      const topCat = Array.from(rejectionCategories.entries()).sort((a, b) => b[1] - a[1])[0]

      return {
        reviewer,
        total: reviewerDecisions.length,
        approved,
        rejected,
        changesRequested,
        approvalRate: reviewerDecisions.length > 0 ? Math.round((approved / reviewerDecisions.length) * 100) : 0,
        topRejectionCategory: topCat ? topCat[0] : null,
      }
    })
    .sort((a, b) => b.total - a.total)
}

export function getApprovalsByPlatform(): PlatformBreakdown[] {
  const platforms = new Map<SocialPlatform, ApprovalDecision[]>()
  for (const d of decisions) {
    const existing = platforms.get(d.platform) || []
    existing.push(d)
    platforms.set(d.platform, existing)
  }

  return Array.from(platforms.entries())
    .map(([platform, platformDecisions]) => {
      const approved = platformDecisions.filter((d) => d.action === 'APPROVE').length
      return {
        platform,
        total: platformDecisions.length,
        approved,
        approvalRate: platformDecisions.length > 0 ? Math.round((approved / platformDecisions.length) * 100) : 0,
      }
    })
    .sort((a, b) => b.total - a.total)
}

export function getApprovalTrend(days: number): ApprovalTrendPoint[] {
  const now = new Date('2026-02-15T12:00:00Z')
  const bucketSize = days <= 7 ? 1 : days <= 30 ? 7 : 14
  const points: ApprovalTrendPoint[] = []

  for (let i = days; i >= 0; i -= bucketSize) {
    const end = new Date(now)
    end.setDate(end.getDate() - i)
    const start = new Date(end)
    start.setDate(start.getDate() - bucketSize)

    const bucket = decisions.filter((d) => {
      const ts = new Date(d.timestamp)
      return ts >= start && ts < end
    })

    const approved = bucket.filter((d) => d.action === 'APPROVE').length
    const total = bucket.length

    points.push({
      date: end.toISOString().slice(0, 10),
      label: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total,
      approved,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    })
  }

  return points.filter((p) => p.total > 0)
}

export function getModelPerformance(): ModelPerformanceResult[] {
  return getApprovalsByModel()
}

export function getAvgTimeToApprove(): string {
  // Simulated average based on seed data timestamps — in production this would
  // compute from approvalRequestedAt to approvalRespondedAt
  const avgMinutes = 22
  if (avgMinutes < 60) return `${avgMinutes}m`
  const hours = Math.floor(avgMinutes / 60)
  const mins = avgMinutes % 60
  return `${hours}h ${mins}m`
}

export function getActionableInsights(): ActionableInsight[] {
  const modelPerf = getApprovalsByModel()
  const rejectionReasons = getTopRejectionReasons()
  const platformBreakdown = getApprovalsByPlatform()
  const insights: ActionableInsight[] = []

  // Find worst-performing model
  const worstModel = modelPerf.filter((m) => m.postsGenerated >= 3).sort((a, b) => a.approvalRate - b.approvalRate)[0]
  const bestModel = modelPerf.filter((m) => m.postsGenerated >= 3).sort((a, b) => b.approvalRate - a.approvalRate)[0]

  if (worstModel && bestModel && worstModel.model !== bestModel.model) {
    const diff = bestModel.approvalRate - worstModel.approvalRate
    if (diff >= 15) {
      insights.push({
        id: 'insight-model-switch',
        type: 'warning',
        message: `Posts using ${worstModel.model} have ${diff}% lower approval rate than ${bestModel.model} — consider switching models for better first-pass acceptance.`,
      })
    }
  }

  // Top rejection reason insight
  if (rejectionReasons.length > 0) {
    const top = rejectionReasons[0]
    insights.push({
      id: 'insight-top-rejection',
      type: 'info',
      message: `"${top.label}" is the #1 rejection reason (${top.count} occurrences, ${top.percentage}% of rejections). Adding pre-checks for this category could reduce revision rounds.`,
    })
  }

  // Platform-specific insight
  const lowPlatform = platformBreakdown.filter((p) => p.total >= 3).sort((a, b) => a.approvalRate - b.approvalRate)[0]
  if (lowPlatform && lowPlatform.approvalRate < 60) {
    insights.push({
      id: 'insight-platform-low',
      type: 'warning',
      message: `${lowPlatform.platform} posts have only ${lowPlatform.approvalRate}% approval rate — review prompt templates for this platform.`,
    })
  }

  // AI-sounding check
  const aiSounding = rejectionReasons.find((r) => r.category === 'AI_SOUNDING')
  if (aiSounding && aiSounding.count >= 2) {
    insights.push({
      id: 'insight-ai-sounding',
      type: 'warning',
      message: `${aiSounding.count} posts rejected for sounding AI-generated. Consider adding a "humanize" post-processing step or using models with more natural language output.`,
    })
  }

  // Positive trend insight
  const trend = getApprovalTrend(28)
  if (trend.length >= 3) {
    const recent = trend.slice(-2)
    const earlier = trend.slice(0, 2)
    const recentAvg = recent.reduce((s, p) => s + p.approvalRate, 0) / recent.length
    const earlierAvg = earlier.reduce((s, p) => s + p.approvalRate, 0) / earlier.length
    if (recentAvg > earlierAvg + 5) {
      insights.push({
        id: 'insight-positive-trend',
        type: 'success',
        message: `Approval rate trending up: ${Math.round(earlierAvg)}% → ${Math.round(recentAvg)}% over the last 4 weeks. The feedback loop is working.`,
      })
    }
  }

  return insights
}
