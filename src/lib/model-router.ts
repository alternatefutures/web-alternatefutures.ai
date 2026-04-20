// ---------------------------------------------------------------------------
// Model Router — routes generation requests to Ollama, Anthropic, or OpenAI
// ---------------------------------------------------------------------------
// Dev mode: if Ollama is unreachable, returns seed data so the UI stays
// functional without a running inference server.
// ---------------------------------------------------------------------------

import { getAntiAIPrompt, type ContentType } from './anti-ai-prompts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Provider = 'ollama' | 'anthropic' | 'openai'

export interface GenerateRequest {
  model: string
  prompt: string
  systemPrompt?: string
  contentType?: ContentType
  temperature?: number
  maxTokens?: number
}

export interface GenerateResponse {
  content: string
  model: string
  provider: Provider
  tokensUsed: number
  latencyMs: number
}

// ---------------------------------------------------------------------------
// Provider config
// ---------------------------------------------------------------------------

const OLLAMA_BASE = process.env.OLLAMA_URL || 'http://localhost:11434'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

// Known model → provider mapping prefixes
const PROVIDER_PREFIXES: [string, Provider][] = [
  ['claude', 'anthropic'],
  ['gpt', 'openai'],
  ['o1', 'openai'],
  ['o3', 'openai'],
]

// ---------------------------------------------------------------------------
// Seed fallback for dev mode
// ---------------------------------------------------------------------------

const SEED_RESPONSES: Record<string, string> = {
  blog: `Decentralized cloud isn't a buzzword anymore — it's how we're actually building.

At Alternate Futures, we've been running production workloads on Akash Network for months now. The cost savings are real (we're talking 60-70% cheaper than AWS for equivalent compute), but that's not even the interesting part.

The interesting part is what happens when your infrastructure doesn't have a single owner. No one can pull the plug. No region goes dark because some VP decided to "optimize" their data center footprint. Your app just... runs.

We're not pretending this is trivial. There are rough edges. DNS propagation is slower than you'd like. Debugging a container on a decentralized provider takes different tooling. But the trajectory is clear, and the gap is closing fast.`,

  social: `We just hit 50% lower compute costs on decentralized infra vs. AWS.

Not a benchmark. Production traffic.

The future of cloud doesn't have a landlord.`,

  email: `Hey — quick note on something we shipped last week.

We moved our entire auth service to decentralized compute (Akash Network). Same uptime, 60% cost reduction, and we eliminated our single point of failure in us-east-1.

Would be worth a 15-min chat if your team is evaluating infra costs for Q2. I can walk through the actual migration path — it's less painful than you'd expect.`,

  creative: `Your cloud has a landlord. Ours doesn't.

Alternate Futures: decentralized hosting for apps that need to stay up, stay private, and stay affordable.`,

  technical: `The deployment pipeline uses a two-phase approach:

1. Build artifacts are pushed to IPFS via the AF CLI (\`af deploy\`)
2. Compute containers are scheduled on Akash Network providers
3. SSL termination handled by our Pingap-based proxy layer

Configuration is declarative via \`af.config.ts\` — no YAML manifests to maintain.`,
}

function getSeedResponse(contentType?: ContentType): string {
  return SEED_RESPONSES[contentType || 'blog'] || SEED_RESPONSES.blog
}

// ---------------------------------------------------------------------------
// ModelRouter
// ---------------------------------------------------------------------------

export class ModelRouter {
  /**
   * Detect which provider should handle a given model name.
   */
  private static detectProvider(model: string): Provider {
    const lower = model.toLowerCase()
    for (const [prefix, provider] of PROVIDER_PREFIXES) {
      if (lower.startsWith(prefix)) return provider
    }
    // Default to Ollama for unknown models (llama3, mistral, phi, etc.)
    return 'ollama'
  }

  /**
   * Build the full system prompt by combining the user's system prompt with
   * anti-AI writing rules appropriate for the content type.
   */
  private static buildSystemPrompt(request: GenerateRequest): string {
    const parts: string[] = []

    if (request.contentType) {
      parts.push(getAntiAIPrompt(request.contentType))
    }

    if (request.systemPrompt) {
      parts.push(request.systemPrompt)
    }

    return parts.join('\n\n') || 'You are a helpful assistant. Write naturally and clearly.'
  }

  /**
   * Main entry point — route a generation request to the appropriate backend.
   */
  static async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const provider = ModelRouter.detectProvider(request.model)
    const start = Date.now()

    try {
      switch (provider) {
        case 'ollama':
          return await ModelRouter.generateOllama(request, start)
        case 'anthropic':
          return await ModelRouter.generateAnthropic(request, start)
        case 'openai':
          return await ModelRouter.generateOpenAI(request, start)
      }
    } catch (error) {
      // Smart fallback: if Ollama is down, try Claude
      if (provider === 'ollama' && ANTHROPIC_API_KEY) {
        console.warn(`Ollama unavailable for model "${request.model}", falling back to Claude`)
        try {
          return await ModelRouter.generateAnthropic(
            { ...request, model: 'claude-sonnet-4-20250514' },
            start,
          )
        } catch {
          // Fall through to seed data
        }
      }

      // Dev mode: return seed data so the UI works without an inference server
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true') {
        console.warn(`Model "${request.model}" unavailable — returning seed data`)
        return {
          content: getSeedResponse(request.contentType),
          model: `${request.model} (seed-fallback)`,
          provider,
          tokensUsed: 0,
          latencyMs: Date.now() - start,
        }
      }

      throw error
    }
  }

  // -------------------------------------------------------------------------
  // Ollama
  // -------------------------------------------------------------------------

  private static async generateOllama(
    request: GenerateRequest,
    start: number,
  ): Promise<GenerateResponse> {
    const systemPrompt = ModelRouter.buildSystemPrompt(request)

    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        prompt: request.prompt,
        system: systemPrompt,
        stream: false,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens ?? 1024,
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Ollama error ${res.status}: ${text}`)
    }

    const data = await res.json()

    return {
      content: data.response ?? '',
      model: data.model ?? request.model,
      provider: 'ollama',
      tokensUsed: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
      latencyMs: Date.now() - start,
    }
  }

  // -------------------------------------------------------------------------
  // Anthropic (Claude)
  // -------------------------------------------------------------------------

  private static async generateAnthropic(
    request: GenerateRequest,
    start: number,
  ): Promise<GenerateResponse> {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured')
    }

    const systemPrompt = ModelRouter.buildSystemPrompt(request)

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens ?? 1024,
        temperature: request.temperature ?? 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: request.prompt }],
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Anthropic error ${res.status}: ${text}`)
    }

    const data = await res.json()
    const textBlock = data.content?.find(
      (b: { type: string }) => b.type === 'text',
    )

    return {
      content: textBlock?.text ?? '',
      model: data.model ?? request.model,
      provider: 'anthropic',
      tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      latencyMs: Date.now() - start,
    }
  }

  // -------------------------------------------------------------------------
  // OpenAI
  // -------------------------------------------------------------------------

  private static async generateOpenAI(
    request: GenerateRequest,
    start: number,
  ): Promise<GenerateResponse> {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }

    const systemPrompt = ModelRouter.buildSystemPrompt(request)

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens ?? 1024,
        temperature: request.temperature ?? 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.prompt },
        ],
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`OpenAI error ${res.status}: ${text}`)
    }

    const data = await res.json()

    return {
      content: data.choices?.[0]?.message?.content ?? '',
      model: data.model ?? request.model,
      provider: 'openai',
      tokensUsed: (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0),
      latencyMs: Date.now() - start,
    }
  }
}
