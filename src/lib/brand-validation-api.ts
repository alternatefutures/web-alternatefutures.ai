import {
  fetchBrandGuide,
  fetchAllTerminology,
  fetchAllVoiceProfiles,
  type BrandGuide,
  type BrandTerminology,
  type BrandVoiceProfile,
  type BrandViolation,
  type ViolationSeverity,
} from './brand-api'
import { scanContent } from './terminology-scanner'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BrandValidationResult {
  overallScore: number
  terminologyScore: number
  voiceConsistencyScore: number
  toneScore: number
  platformFitScore: number
  violations: BrandValidationViolation[]
  suggestions: string[]
  scannedAt: string
}

export interface BrandValidationViolation {
  id: string
  category: 'TERMINOLOGY' | 'VOICE' | 'TONE' | 'PLATFORM_FIT'
  severity: ViolationSeverity
  message: string
  position: number | null
  matchedText: string | null
  suggestion: string | null
}

// ---------------------------------------------------------------------------
// Score weights (per BF-BG-005 spec)
// ---------------------------------------------------------------------------

const WEIGHTS = {
  terminology: 0.40,
  voiceConsistency: 0.30,
  toneAppropriateness: 0.20,
  platformFit: 0.10,
} as const

// ---------------------------------------------------------------------------
// Platform content guidelines
// ---------------------------------------------------------------------------

const PLATFORM_GUIDELINES: Record<string, { maxLength: number; formalityRange: string[]; tips: string[] }> = {
  X: {
    maxLength: 280,
    formalityRange: ['CASUAL', 'NEUTRAL'],
    tips: ['Keep under 280 characters', 'Use hashtags sparingly (2-4)', 'Be concise and punchy'],
  },
  BLUESKY: {
    maxLength: 300,
    formalityRange: ['CASUAL', 'NEUTRAL'],
    tips: ['Keep under 300 characters', 'Alt text for images is expected', 'More conversational tone works well'],
  },
  LINKEDIN: {
    maxLength: 3000,
    formalityRange: ['NEUTRAL', 'FORMAL'],
    tips: ['Lead with a hook in first 2 lines', 'Use line breaks for readability', 'Professional but not stiff'],
  },
  BLOG: {
    maxLength: 50000,
    formalityRange: ['NEUTRAL', 'FORMAL'],
    tips: ['Include code examples where relevant', 'Use headings for structure', 'Link to docs and resources'],
  },
  DISCORD: {
    maxLength: 2000,
    formalityRange: ['CASUAL'],
    tips: ['Casual and community-focused', 'Emojis are acceptable', 'Direct and helpful'],
  },
  DOCUMENTATION: {
    maxLength: 100000,
    formalityRange: ['FORMAL'],
    tips: ['Precise and step-by-step', 'Assume competent developers', 'Include examples and code blocks'],
  },
  MARKETING: {
    maxLength: 10000,
    formalityRange: ['NEUTRAL'],
    tips: ['Lead with benefits', 'Use concrete numbers', 'Avoid hype language'],
  },
}

// ---------------------------------------------------------------------------
// Hype word patterns
// ---------------------------------------------------------------------------

const HYPE_PATTERNS = [
  { pattern: /\b(revolutionary|revolutionize|revolutionizing)\b/gi, label: 'revolutionary' },
  { pattern: /\bgame[- ]?chang(ing|er|e)\b/gi, label: 'game-changing' },
  { pattern: /\bdisrupt(ive|ing|s|ed)?\b/gi, label: 'disrupt' },
  { pattern: /\bparadigm\s+shift\b/gi, label: 'paradigm shift' },
  { pattern: /\bsynerg(y|ies|istic)\b/gi, label: 'synergy' },
  { pattern: /\bleverag(e|es|ing|ed)\b/gi, label: 'leverage' },
  { pattern: /\bscalable\s+solution\b/gi, label: 'scalable solution (vague)' },
  { pattern: /\bcutting[- ]?edge\b/gi, label: 'cutting-edge' },
  { pattern: /\bnext[- ]?gen(eration)?\b/gi, label: 'next-generation' },
]

// ---------------------------------------------------------------------------
// Passive voice detection (simple heuristic)
// ---------------------------------------------------------------------------

const PASSIVE_PATTERNS = [
  /\b(is|was|were|been|being|are)\s+(being\s+)?\w+ed\b/gi,
]

// ---------------------------------------------------------------------------
// Core validation function
// ---------------------------------------------------------------------------

export async function validateContent(
  text: string,
  platform: string,
  token?: string,
): Promise<BrandValidationResult> {
  const violations: BrandValidationViolation[] = []
  const suggestions: string[] = []
  let violationId = 0

  // Load data for validation
  const authToken = token || 'dev-localhost-token'
  let terminology: BrandTerminology[] = []
  let voiceProfiles: BrandVoiceProfile[] = []
  let guide: BrandGuide | null = null

  try {
    ;[terminology, voiceProfiles, guide] = await Promise.all([
      fetchAllTerminology(authToken),
      fetchAllVoiceProfiles(authToken),
      fetchBrandGuide(authToken),
    ])
  } catch {
    // Continue with empty data — score will reflect missing context
  }

  // -----------------------------------------------------------------------
  // 1. Terminology scoring (40%)
  // -----------------------------------------------------------------------

  let terminologyScore = 100

  // Scan for forbidden terms
  const scanResult = scanContent(text, terminology)
  for (const tv of scanResult.violations) {
    violationId++
    violations.push({
      id: `bvv-${violationId}`,
      category: 'TERMINOLOGY',
      severity: 'BLOCKING',
      message: `Forbidden term "${tv.matchedText}" found. ${tv.context}`,
      position: tv.position,
      matchedText: tv.matchedText,
      suggestion: tv.replacement ? `Replace with "${tv.replacement}"` : 'Remove this term.',
    })
    terminologyScore -= 25
  }

  // Check brand guide prohibited terms (regex-based rules)
  if (guide) {
    for (const rule of guide.rules) {
      if (!rule.active || !rule.pattern) continue
      try {
        const regex = new RegExp(rule.pattern, 'gi')
        let match: RegExpExecArray | null
        while ((match = regex.exec(text)) !== null) {
          // Avoid duplicate violations already caught by terminology scan
          const alreadyCaught = violations.some(
            (v) => v.position === match!.index && v.category === 'TERMINOLOGY',
          )
          if (!alreadyCaught) {
            violationId++
            violations.push({
              id: `bvv-${violationId}`,
              category: 'TERMINOLOGY',
              severity: rule.severity,
              message: `${rule.name}: ${rule.description}`,
              position: match.index,
              matchedText: match[0],
              suggestion: rule.replacement ? `Replace with "${rule.replacement}"` : null,
            })
            terminologyScore -= rule.severity === 'BLOCKING' ? 25 : rule.severity === 'WARNING' ? 10 : 3
          }
        }
      } catch {
        // Invalid regex — skip
      }
    }
  }

  terminologyScore = Math.max(0, Math.min(100, terminologyScore))

  // -----------------------------------------------------------------------
  // 2. Voice consistency scoring (30%)
  // -----------------------------------------------------------------------

  let voiceConsistencyScore = 100
  const primaryVoice = voiceProfiles[0]

  if (primaryVoice) {
    // Check for hype words (don'ts)
    for (const hp of HYPE_PATTERNS) {
      let match: RegExpExecArray | null
      while ((match = hp.pattern.exec(text)) !== null) {
        const alreadyCaught = violations.some(
          (v) => v.position === match!.index,
        )
        if (!alreadyCaught) {
          violationId++
          violations.push({
            id: `bvv-${violationId}`,
            category: 'VOICE',
            severity: 'WARNING',
            message: `Hype language detected: "${hp.label}". Our voice is confident and direct, not salesy.`,
            position: match.index,
            matchedText: match[0],
            suggestion: 'Rephrase with specific, concrete language instead.',
          })
          voiceConsistencyScore -= 8
        }
      }
      hp.pattern.lastIndex = 0
    }

    // Check for excessive passive voice
    let passiveCount = 0
    for (const pp of PASSIVE_PATTERNS) {
      let match: RegExpExecArray | null
      while ((match = pp.exec(text)) !== null) {
        passiveCount++
      }
      pp.lastIndex = 0
    }
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const passiveRatio = sentences.length > 0 ? passiveCount / sentences.length : 0
    if (passiveRatio > 0.3) {
      violationId++
      violations.push({
        id: `bvv-${violationId}`,
        category: 'VOICE',
        severity: 'INFO',
        message: `High passive voice ratio (${Math.round(passiveRatio * 100)}%). Our brand voice prefers active voice.`,
        position: null,
        matchedText: null,
        suggestion: 'Rephrase passive constructions to active voice where possible.',
      })
      voiceConsistencyScore -= 10
    }

    // Check for "I" instead of "we" in formal content
    if (platform !== 'DISCORD') {
      const iPattern = /\bI\s+(am|have|was|will|can|could|would|should|think|believe|just)\b/g
      let match: RegExpExecArray | null
      while ((match = iPattern.exec(text)) !== null) {
        violationId++
        violations.push({
          id: `bvv-${violationId}`,
          category: 'VOICE',
          severity: 'WARNING',
          message: 'Use "we" not "I" in official communications. Represent the team.',
          position: match.index,
          matchedText: match[0],
          suggestion: `Replace "I ${match[1]}" with "We ${match[1]}"`,
        })
        voiceConsistencyScore -= 5
      }
    }
  }

  voiceConsistencyScore = Math.max(0, Math.min(100, voiceConsistencyScore))

  // -----------------------------------------------------------------------
  // 3. Tone appropriateness scoring (20%)
  // -----------------------------------------------------------------------

  let toneScore = 100
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length

  // Check for ALL CAPS shouting
  const capsWords = text.split(/\s+/).filter((w) => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w))
  const capsRatio = wordCount > 0 ? capsWords.length / wordCount : 0
  if (capsRatio > 0.1 && capsWords.length > 2) {
    violationId++
    violations.push({
      id: `bvv-${violationId}`,
      category: 'TONE',
      severity: 'WARNING',
      message: `Excessive capitalization detected (${capsWords.length} ALL-CAPS words). Our tone is calm and confident.`,
      position: null,
      matchedText: capsWords.slice(0, 3).join(', '),
      suggestion: 'Use sentence case. Let the content speak — not the formatting.',
    })
    toneScore -= 15
  }

  // Check for excessive exclamation marks
  const exclamationCount = (text.match(/!/g) || []).length
  if (exclamationCount > 2) {
    violationId++
    violations.push({
      id: `bvv-${violationId}`,
      category: 'TONE',
      severity: 'INFO',
      message: `${exclamationCount} exclamation marks detected. Quiet confidence rarely needs exclamation.`,
      position: null,
      matchedText: null,
      suggestion: 'Limit exclamation marks to 1-2 per piece of content.',
    })
    toneScore -= Math.min(20, (exclamationCount - 2) * 5)
  }

  // Check for negativity toward competitors
  const negativePatterns = [
    /\b(terrible|awful|horrible|worst|sucks|overpriced|garbage|useless)\b/gi,
    /\bunlike\s+(those|the)\s+\w+\s+(dinosaur|legacy|outdated)/gi,
  ]
  for (const np of negativePatterns) {
    let match: RegExpExecArray | null
    while ((match = np.exec(text)) !== null) {
      violationId++
      violations.push({
        id: `bvv-${violationId}`,
        category: 'TONE',
        severity: 'WARNING',
        message: `Negative or disparaging language detected. Focus on our strengths, not competitor weaknesses.`,
        position: match.index,
        matchedText: match[0],
        suggestion: 'Rephrase to highlight what we offer, not what others lack.',
      })
      toneScore -= 15
    }
    np.lastIndex = 0
  }

  toneScore = Math.max(0, Math.min(100, toneScore))

  // -----------------------------------------------------------------------
  // 4. Platform fit scoring (10%)
  // -----------------------------------------------------------------------

  let platformFitScore = 100
  const platformKey = platform.toUpperCase()
  const guidelines = PLATFORM_GUIDELINES[platformKey] || PLATFORM_GUIDELINES.MARKETING

  // Length check
  if (text.length > guidelines.maxLength) {
    violationId++
    violations.push({
      id: `bvv-${violationId}`,
      category: 'PLATFORM_FIT',
      severity: 'WARNING',
      message: `Content is ${text.length} chars, exceeds ${platformKey} limit of ${guidelines.maxLength}.`,
      position: null,
      matchedText: null,
      suggestion: `Shorten to under ${guidelines.maxLength} characters for ${platformKey}.`,
    })
    platformFitScore -= 30
  }

  // Add platform tips as suggestions
  for (const tip of guidelines.tips) {
    suggestions.push(`[${platformKey}] ${tip}`)
  }

  platformFitScore = Math.max(0, Math.min(100, platformFitScore))

  // -----------------------------------------------------------------------
  // Weighted overall score
  // -----------------------------------------------------------------------

  const overallScore = Math.round(
    terminologyScore * WEIGHTS.terminology +
    voiceConsistencyScore * WEIGHTS.voiceConsistency +
    toneScore * WEIGHTS.toneAppropriateness +
    platformFitScore * WEIGHTS.platformFit,
  )

  return {
    overallScore,
    terminologyScore,
    voiceConsistencyScore,
    toneScore,
    platformFitScore,
    violations: violations.sort((a, b) => {
      const sevOrder: Record<string, number> = { BLOCKING: 0, WARNING: 1, INFO: 2 }
      return (sevOrder[a.severity] ?? 2) - (sevOrder[b.severity] ?? 2)
    }),
    suggestions,
    scannedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Approval gate threshold check (BF-BG-004)
// ---------------------------------------------------------------------------

export const BRAND_APPROVAL_THRESHOLD = 70

export function shouldBlockApproval(result: BrandValidationResult): boolean {
  return result.overallScore < BRAND_APPROVAL_THRESHOLD ||
    result.violations.some((v) => v.severity === 'BLOCKING')
}
