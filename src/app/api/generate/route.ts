import { NextResponse, type NextRequest } from 'next/server'
import { getUserFromCookies } from '@/lib/auth'
import { cookies } from 'next/headers'
import { ModelRouter, type GenerateRequest } from '@/lib/model-router'
import type { ContentType } from '@/lib/anti-ai-prompts'

// ---------------------------------------------------------------------------
// Rate limiting — simple in-memory sliding window (per-user, 10 req/min)
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10

const requestLog = new Map<string, number[]>()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const timestamps = requestLog.get(userId) ?? []

  // Drop entries older than the window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(userId, recent)
    return true
  }

  recent.push(now)
  requestLog.set(userId, recent)
  return false
}

// ---------------------------------------------------------------------------
// POST /api/generate
// ---------------------------------------------------------------------------

const VALID_CONTENT_TYPES: ContentType[] = ['blog', 'social', 'email', 'creative', 'technical']

export async function POST(request: NextRequest) {
  // --- Auth check ---
  const cookieStore = await cookies()
  const user = await getUserFromCookies(cookieStore)

  // Allow unauthenticated requests on localhost for dev convenience
  const host = request.headers.get('host') || ''
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1')

  if (!user && !isLocal) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const userId = user?.userId ?? 'dev-local'

  // --- Rate limit ---
  if (isRateLimited(userId)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 10 requests per minute.' },
      { status: 429 },
    )
  }

  // --- Parse body ---
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    model,
    prompt,
    systemPrompt,
    contentType,
    temperature,
    maxTokens,
  } = body as {
    model?: string
    prompt?: string
    systemPrompt?: string
    contentType?: string
    temperature?: number
    maxTokens?: number
  }

  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: '"prompt" is required and must be a string' }, { status: 400 })
  }

  if (contentType && !VALID_CONTENT_TYPES.includes(contentType as ContentType)) {
    return NextResponse.json(
      { error: `Invalid contentType. Must be one of: ${VALID_CONTENT_TYPES.join(', ')}` },
      { status: 400 },
    )
  }

  // --- Build request ---
  const generateReq: GenerateRequest = {
    model: typeof model === 'string' && model ? model : 'llama3.2',
    prompt,
    systemPrompt: typeof systemPrompt === 'string' ? systemPrompt : undefined,
    contentType: contentType as ContentType | undefined,
    temperature: typeof temperature === 'number' ? temperature : undefined,
    maxTokens: typeof maxTokens === 'number' ? maxTokens : undefined,
  }

  // --- Generate ---
  try {
    const result = await ModelRouter.generate(generateReq)

    return NextResponse.json({
      content: result.content,
      metadata: {
        model: result.model,
        provider: result.provider,
        tokensUsed: result.tokensUsed,
        latencyMs: result.latencyMs,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed'
    console.error('Generate API error:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
