const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SocialPlatform =
  | 'X'
  | 'BLUESKY'
  | 'MASTODON'
  | 'LINKEDIN'
  | 'REDDIT'
  | 'DISCORD'
  | 'TELEGRAM'
  | 'THREADS'
  | 'INSTAGRAM'
  | 'FACEBOOK'

export type ContentSourceType =
  | 'FREEFORM'
  | 'BLOG_POST'
  | 'PRESS_RELEASE'
  | 'CHANGELOG'
  | 'DOCUMENTATION'

export interface TransformOutput {
  id: string
  platform: SocialPlatform
  variant: string
  content: string
  charCount: number
  promoted: boolean
  socialMediaPostId: string | null
}

export interface ContentTransformation {
  id: string
  title: string
  sourceContent: string
  sourceType: ContentSourceType
  outputs: TransformOutput[]
  model: string
  promptTokens: number | null
  outputTokens: number | null
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface TransformRequest {
  title: string
  sourceContent: string
  sourceType: ContentSourceType
  targetPlatforms: SocialPlatform[]
  tone: 'professional' | 'casual' | 'technical' | 'playful'
  includeHashtags: boolean
  includeEmojis: boolean
  /** Optional: route generation through a specific model via /api/generate */
  model?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PLATFORM_CHAR_LIMITS: Record<SocialPlatform, number> = {
  X: 280,
  BLUESKY: 300,
  MASTODON: 500,
  LINKEDIN: 3000,
  REDDIT: 40000,
  DISCORD: 2000,
  TELEGRAM: 4096,
  THREADS: 500,
  INSTAGRAM: 2200,
  FACEBOOK: 63206,
}

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  X: 'X (Twitter)',
  BLUESKY: 'Bluesky',
  MASTODON: 'Mastodon',
  LINKEDIN: 'LinkedIn',
  REDDIT: 'Reddit',
  DISCORD: 'Discord',
  TELEGRAM: 'Telegram',
  THREADS: 'Threads',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
}

export const ALL_PLATFORMS: SocialPlatform[] = [
  'X',
  'BLUESKY',
  'MASTODON',
  'LINKEDIN',
  'REDDIT',
  'DISCORD',
  'TELEGRAM',
  'THREADS',
  'INSTAGRAM',
  'FACEBOOK',
]

// ---------------------------------------------------------------------------
// Seed data — used in development when the GraphQL API is unreachable
// ---------------------------------------------------------------------------

const SEED_TRANSFORMATIONS: ContentTransformation[] = [
  {
    id: 'seed-transform-1',
    title: 'AF Launch Announcement Variants',
    sourceContent:
      'Alternate Futures is a decentralized cloud platform that enables developers to deploy AI agents, full-stack applications, and static websites on truly decentralized infrastructure powered by Akash Network, IPFS, Filecoin, and Arweave.',
    sourceType: 'FREEFORM',
    outputs: [
      {
        id: 'seed-to-1',
        platform: 'X',
        variant: 'default',
        content:
          'Introducing Alternate Futures -- the decentralized cloud for AI agents, websites, and serverless functions. Deploy to IPFS, Filecoin, or Arweave with one click. The future of hosting is decentralized. #Web3 #DePIN',
        charCount: 198,
        promoted: true,
        socialMediaPostId: 'seed-social-1',
      },
      {
        id: 'seed-to-2',
        platform: 'LINKEDIN',
        variant: 'default',
        content:
          'Excited to announce Alternate Futures - the decentralized cloud platform designed for AI agents, modern web apps, and serverless functions.\n\nWhy decentralized cloud?\n- 50-80% lower compute costs\n- No single point of failure\n- True data sovereignty\n- Censorship resistant\n\nRequest early access: alternatefutures.ai\n\n#Web3 #CloudComputing #AI',
        charCount: 352,
        promoted: true,
        socialMediaPostId: 'seed-social-2',
      },
    ],
    model: 'claude-sonnet-4-20250514',
    promptTokens: 245,
    outputTokens: 512,
    createdById: 'mock-user-1',
    createdAt: '2026-01-14T16:00:00Z',
    updatedAt: '2026-01-14T16:00:00Z',
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

const TRANSFORMATION_FIELDS = `
  id title sourceContent sourceType model promptTokens outputTokens
  createdById createdAt updatedAt
  outputs {
    id platform variant content charCount promoted socialMediaPostId
  }
`

const TRANSFORM_CONTENT_MUTATION = `
  mutation TransformContent($input: TransformContentInput!) {
    transformContent(input: $input) {
      ${TRANSFORMATION_FIELDS}
    }
  }
`

const TRANSFORMATION_HISTORY_QUERY = `
  query TransformationHistory($limit: Int, $offset: Int) {
    contentTransformations(limit: $limit, offset: $offset) {
      ${TRANSFORMATION_FIELDS}
    }
  }
`

const PROMOTE_OUTPUT_MUTATION = `
  mutation PromoteTransformOutput($outputId: ID!) {
    promoteTransformOutput(outputId: $outputId) {
      id promoted socialMediaPostId
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

let mockTransformations = [...SEED_TRANSFORMATIONS]

// ---------------------------------------------------------------------------
// Mock content generation
// ---------------------------------------------------------------------------

function truncateContent(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 3) + '...'
}

export function generateMockOutputs(request: TransformRequest): TransformOutput[] {
  const { sourceContent, targetPlatforms, tone, includeHashtags, includeEmojis } = request
  const outputs: TransformOutput[] = []

  const hashtagBlock = includeHashtags ? '\n\n#Web3 #DePIN #DecentralizedCloud #AlternateFutures' : ''
  const emojiPrefix = includeEmojis ? '\u{1F525} ' : ''
  const emojiBolt = includeEmojis ? '\u{26A1} ' : ''
  const emojiRocket = includeEmojis ? '\u{1F680} ' : ''
  const emojiPoint = includeEmojis ? '\u{1F449} ' : ''

  for (const platform of targetPlatforms) {
    const limit = PLATFORM_CHAR_LIMITS[platform]
    const id = `seed-transform-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    let content = ''

    switch (platform) {
      case 'X': {
        const tonePrefix =
          tone === 'casual'
            ? `${emojiPrefix}Big news! `
            : tone === 'playful'
              ? `${emojiPrefix}Guess what just dropped? `
              : tone === 'technical'
                ? 'Announcement: '
                : `${emojiBolt}Introducing `
        const body = truncateContent(
          sourceContent,
          limit - tonePrefix.length - (includeHashtags ? 30 : 0),
        )
        content = `${tonePrefix}${body}${includeHashtags ? ' #Web3 #DePIN' : ''}`

        outputs.push({
          id,
          platform: 'X',
          variant: 'default',
          content: truncateContent(content, limit),
          charCount: Math.min(content.length, limit),
          promoted: false,
          socialMediaPostId: null,
        })

        // Also generate a casual variant for X
        const casualId = `seed-transform-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const casualBody = truncateContent(sourceContent, limit - 40)
        const casualContent = `${emojiRocket}${casualBody}${includeHashtags ? ' #Web3' : ''}`
        outputs.push({
          id: casualId,
          platform: 'X',
          variant: 'casual',
          content: truncateContent(casualContent, limit),
          charCount: Math.min(casualContent.length, limit),
          promoted: false,
          socialMediaPostId: null,
        })
        break
      }

      case 'BLUESKY': {
        const prefix =
          tone === 'casual'
            ? `${emojiPrefix}`
            : tone === 'playful'
              ? `${emojiPrefix}`
              : ''
        const body = truncateContent(
          sourceContent,
          limit - prefix.length - (includeHashtags ? 35 : 0),
        )
        content = `${prefix}${body}${includeHashtags ? '\n\n#Web3 #DePIN #DecentralizedCloud' : ''}`
        outputs.push({
          id,
          platform: 'BLUESKY',
          variant: 'default',
          content: truncateContent(content, limit),
          charCount: Math.min(content.length, limit),
          promoted: false,
          socialMediaPostId: null,
        })
        break
      }

      case 'LINKEDIN': {
        const intro =
          tone === 'technical'
            ? 'Technical update:'
            : tone === 'casual'
              ? `${emojiRocket}Exciting news to share!`
              : tone === 'playful'
                ? `${emojiPrefix}Something big is happening!`
                : `${emojiBolt}Exciting announcement!`

        const bullets = sourceContent
          .split(/[.!]/)
          .filter((s) => s.trim().length > 10)
          .slice(0, 4)
          .map((s) => `- ${s.trim()}`)
          .join('\n')

        content = `${intro}\n\n${truncateContent(sourceContent, 500)}\n\nKey highlights:\n${bullets}\n\nLearn more: alternatefutures.ai${hashtagBlock}`
        outputs.push({
          id,
          platform: 'LINKEDIN',
          variant: 'default',
          content: truncateContent(content, limit),
          charCount: Math.min(content.length, limit),
          promoted: false,
          socialMediaPostId: null,
        })
        break
      }

      case 'REDDIT': {
        const titleLine = `**${request.title}**`
        content = `${titleLine}\n\n${truncateContent(sourceContent, 1000)}\n\nMore info: [alternatefutures.ai](https://alternatefutures.ai)`
        outputs.push({
          id,
          platform: 'REDDIT',
          variant: 'default',
          content: truncateContent(content, limit),
          charCount: Math.min(content.length, limit),
          promoted: false,
          socialMediaPostId: null,
        })
        break
      }

      case 'DISCORD': {
        const title = `**${request.title}**`
        const body = truncateContent(sourceContent, 300)
        const cta =
          tone === 'casual'
            ? `${emojiPoint}Check it out and let us know what you think!`
            : tone === 'playful'
              ? `${emojiRocket}Come join the future!`
              : 'Learn more and get started at alternatefutures.ai'

        content = `${title}\n\n${body}\n\n${cta}`
        outputs.push({
          id,
          platform: 'DISCORD',
          variant: 'default',
          content: truncateContent(content, limit),
          charCount: Math.min(content.length, limit),
          promoted: false,
          socialMediaPostId: null,
        })
        break
      }

      case 'TELEGRAM': {
        const body = truncateContent(sourceContent, 600)
        content = `${emojiBolt}${request.title}\n\n${body}\n\nalternatefutures.ai${hashtagBlock}`
        outputs.push({
          id,
          platform: 'TELEGRAM',
          variant: 'default',
          content: truncateContent(content, limit),
          charCount: Math.min(content.length, limit),
          promoted: false,
          socialMediaPostId: null,
        })
        break
      }

      case 'THREADS': {
        const body = truncateContent(sourceContent, limit - (includeHashtags ? 40 : 0) - 5)
        content = `${emojiPrefix}${body}${includeHashtags ? '\n\n#Web3 #DePIN #AlternateFutures' : ''}`
        outputs.push({
          id,
          platform: 'THREADS',
          variant: 'default',
          content: truncateContent(content, limit),
          charCount: Math.min(content.length, limit),
          promoted: false,
          socialMediaPostId: null,
        })
        break
      }

      case 'INSTAGRAM': {
        const body = truncateContent(sourceContent, 800)
        content = `${emojiRocket}${request.title}\n\n${body}\n\nLink in bio!\n${includeHashtags ? '\n#Web3 #DePIN #DecentralizedCloud #AlternateFutures #CloudComputing #AI' : ''}`
        outputs.push({
          id,
          platform: 'INSTAGRAM',
          variant: 'default',
          content: truncateContent(content, limit),
          charCount: Math.min(content.length, limit),
          promoted: false,
          socialMediaPostId: null,
        })
        break
      }

      case 'FACEBOOK': {
        const body = truncateContent(sourceContent, 1000)
        content = `${emojiBolt}${request.title}\n\n${body}\n\nLearn more: alternatefutures.ai${hashtagBlock}`
        outputs.push({
          id,
          platform: 'FACEBOOK',
          variant: 'default',
          content: truncateContent(content, limit),
          charCount: Math.min(content.length, limit),
          promoted: false,
          socialMediaPostId: null,
        })
        break
      }
    }
  }

  return outputs
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function transformContent(
  token: string,
  request: TransformRequest,
): Promise<ContentTransformation> {
  // -----------------------------------------------------------------------
  // Model-routed generation: when a specific model is requested, generate
  // content via /api/generate for each target platform, then assemble the
  // transformation result.
  // -----------------------------------------------------------------------
  if (request.model) {
    return transformViaModelRouter(request)
  }

  if (useSeedData()) {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const now = new Date().toISOString()
    const outputs = generateMockOutputs(request)
    const transformation: ContentTransformation = {
      id: `seed-transform-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: request.title,
      sourceContent: request.sourceContent,
      sourceType: request.sourceType,
      outputs,
      model: 'claude-sonnet-4-20250514',
      promptTokens: Math.floor(request.sourceContent.split(/\s+/).length * 1.3),
      outputTokens: outputs.reduce((sum, o) => sum + Math.floor(o.content.split(/\s+/).length * 1.3), 0),
      createdById: 'mock-user-1',
      createdAt: now,
      updatedAt: now,
    }

    mockTransformations = [transformation, ...mockTransformations]
    return transformation
  }

  const data = await authGraphqlFetch<{ transformContent: ContentTransformation }>(
    TRANSFORM_CONTENT_MUTATION,
    {
      input: {
        title: request.title,
        sourceContent: request.sourceContent,
        sourceType: request.sourceType,
        targetPlatforms: request.targetPlatforms,
        tone: request.tone,
        includeHashtags: request.includeHashtags,
        includeEmojis: request.includeEmojis,
      },
    },
    token,
  )
  return data.transformContent
}

// ---------------------------------------------------------------------------
// Model-routed transformation — generates per-platform via /api/generate
// ---------------------------------------------------------------------------

async function transformViaModelRouter(
  request: TransformRequest,
): Promise<ContentTransformation> {
  const now = new Date().toISOString()
  const baseId = `mr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  let totalPromptTokens = 0
  let totalOutputTokens = 0
  let usedModel = request.model!

  const outputs: TransformOutput[] = []

  for (const platform of request.targetPlatforms) {
    const charLimit = PLATFORM_CHAR_LIMITS[platform]
    const platformLabel = PLATFORM_LABELS[platform]
    const prompt = buildPlatformPrompt(request, platformLabel, charLimit)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model,
          prompt,
          contentType: 'social',
          temperature: 0.8,
          maxTokens: Math.min(charLimit * 2, 2048),
        }),
      })

      if (!res.ok) {
        // Fall back to mock for this platform
        const mockOutputs = generateMockOutputs({
          ...request,
          targetPlatforms: [platform],
        })
        outputs.push(...mockOutputs)
        continue
      }

      const data = await res.json()
      usedModel = data.metadata?.model ?? usedModel
      totalPromptTokens += Math.floor((data.metadata?.tokensUsed ?? 0) * 0.6)
      totalOutputTokens += Math.floor((data.metadata?.tokensUsed ?? 0) * 0.4)

      const content = truncateContent(data.content ?? '', charLimit)
      outputs.push({
        id: `${baseId}-${platform.toLowerCase()}`,
        platform,
        variant: 'default',
        content,
        charCount: content.length,
        promoted: false,
        socialMediaPostId: null,
      })
    } catch {
      // Network error — fall back to mock
      const mockOutputs = generateMockOutputs({
        ...request,
        targetPlatforms: [platform],
      })
      outputs.push(...mockOutputs)
    }
  }

  const transformation: ContentTransformation = {
    id: baseId,
    title: request.title,
    sourceContent: request.sourceContent,
    sourceType: request.sourceType,
    outputs,
    model: usedModel,
    promptTokens: totalPromptTokens,
    outputTokens: totalOutputTokens,
    createdById: 'current-user',
    createdAt: now,
    updatedAt: now,
  }

  mockTransformations = [transformation, ...mockTransformations]
  return transformation
}

function buildPlatformPrompt(
  request: TransformRequest,
  platformLabel: string,
  charLimit: number,
): string {
  const toneDesc = request.tone === 'professional' ? 'professional and authoritative'
    : request.tone === 'casual' ? 'casual and conversational'
    : request.tone === 'technical' ? 'technical and precise'
    : 'playful and engaging'

  const hashtagNote = request.includeHashtags
    ? 'Include 2-3 relevant hashtags.'
    : 'Do not include hashtags.'

  const emojiNote = request.includeEmojis
    ? 'Use 1-2 emojis where natural.'
    : 'Do not use emojis.'

  return `Transform this content for ${platformLabel} (max ${charLimit} characters).
Tone: ${toneDesc}. ${hashtagNote} ${emojiNote}

Source content:
${request.sourceContent}

Write ONLY the post content. No labels, no explanations, no meta-commentary.`
}

export async function fetchTransformationHistory(
  token: string,
  limit = 50,
  offset = 0,
): Promise<ContentTransformation[]> {
  try {
    const data = await authGraphqlFetch<{
      contentTransformations: ContentTransformation[]
    }>(TRANSFORMATION_HISTORY_QUERY, { limit, offset }, token)
    return data.contentTransformations
  } catch {
    if (useSeedData()) return mockTransformations.slice(offset, offset + limit)
    return []
  }
}

export async function promoteOutput(
  token: string,
  outputId: string,
  transformationId: string,
): Promise<TransformOutput> {
  if (useSeedData()) {
    const tx = mockTransformations.find((t) => t.id === transformationId)
    if (tx) {
      const output = tx.outputs.find((o) => o.id === outputId)
      if (output) {
        output.promoted = true
        output.socialMediaPostId = `seed-social-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        return { ...output }
      }
    }
    throw new Error('Output not found')
  }

  const data = await authGraphqlFetch<{
    promoteTransformOutput: TransformOutput
  }>(PROMOTE_OUTPUT_MUTATION, { outputId }, token)
  return data.promoteTransformOutput
}

// Re-export seed data for use in mock mode
export { SEED_TRANSFORMATIONS }
