// ---------------------------------------------------------------------------
// Model Registry API — Available AI models for content generation
// ---------------------------------------------------------------------------

export type ModelProvider = 'ollama' | 'anthropic' | 'openai'

export type ModelCategory =
  | 'long_form'
  | 'short_form'
  | 'email'
  | 'creative'
  | 'technical'

export interface ModelConfig {
  id: string
  name: string
  provider: ModelProvider
  modelId: string
  category: ModelCategory
  description: string
  avgTokensPerSec: number
  maxContext: number
  strengths: string[]
  weaknesses: string[]
  approvalRate: number
}

// ---------------------------------------------------------------------------
// Seed data — 12 models across all categories
// ---------------------------------------------------------------------------

const MODELS: ModelConfig[] = [
  {
    id: 'qwen2.5-7b',
    name: 'Qwen 2.5 7B',
    provider: 'ollama',
    modelId: 'qwen2.5:7b',
    category: 'short_form',
    description: 'Fast, compact model tuned for concise social posts and short-form content.',
    avgTokensPerSec: 85,
    maxContext: 32768,
    strengths: ['Fast inference', 'Good at concise copy', 'Low resource usage'],
    weaknesses: ['Limited long-form coherence', 'Smaller knowledge base'],
    approvalRate: 72,
  },
  {
    id: 'llama3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'ollama',
    modelId: 'llama3.3:70b',
    category: 'long_form',
    description: 'Meta\'s flagship open model. Strong at blog posts, documentation, and detailed content.',
    avgTokensPerSec: 28,
    maxContext: 131072,
    strengths: ['Excellent long-form writing', 'Strong reasoning', 'Broad knowledge'],
    weaknesses: ['Slower inference', 'High resource usage'],
    approvalRate: 88,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'ollama',
    modelId: 'mistral-large:latest',
    category: 'long_form',
    description: 'Mistral\'s largest model with strong multilingual and analytical capabilities.',
    avgTokensPerSec: 32,
    maxContext: 128000,
    strengths: ['Multilingual content', 'Structured output', 'Analytical writing'],
    weaknesses: ['Slower than smaller models', 'Can be verbose'],
    approvalRate: 84,
  },
  {
    id: 'gemma2-9b',
    name: 'Gemma 2 9B',
    provider: 'ollama',
    modelId: 'gemma2:9b',
    category: 'short_form',
    description: 'Google\'s efficient open model. Good balance of speed and quality for social media.',
    avgTokensPerSec: 72,
    maxContext: 8192,
    strengths: ['Fast generation', 'Clean output formatting', 'Good at hashtags'],
    weaknesses: ['Shorter context window', 'Less creative range'],
    approvalRate: 76,
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'ollama',
    modelId: 'deepseek-v3:latest',
    category: 'technical',
    description: 'Strong at technical content, changelogs, and developer-facing copy.',
    avgTokensPerSec: 40,
    maxContext: 65536,
    strengths: ['Technical accuracy', 'Code-aware writing', 'Developer tone'],
    weaknesses: ['Less natural for casual content', 'Can over-explain'],
    approvalRate: 82,
  },
  {
    id: 'phi-3.5-mini',
    name: 'Phi 3.5 Mini',
    provider: 'ollama',
    modelId: 'phi3.5:latest',
    category: 'short_form',
    description: 'Microsoft\'s compact model. Extremely fast for quick draft generation.',
    avgTokensPerSec: 120,
    maxContext: 16384,
    strengths: ['Fastest inference', 'Minimal resource usage', 'Good for brainstorming'],
    weaknesses: ['Lower quality for polished content', 'Limited nuance'],
    approvalRate: 61,
  },
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'ollama',
    modelId: 'command-r-plus:latest',
    category: 'email',
    description: 'Cohere\'s model optimized for business communication and email campaigns.',
    avgTokensPerSec: 35,
    maxContext: 131072,
    strengths: ['Professional tone', 'Email formatting', 'CTA optimization'],
    weaknesses: ['Can feel formulaic', 'Less creative flair'],
    approvalRate: 79,
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'ollama',
    modelId: 'mixtral:8x7b',
    category: 'creative',
    description: 'Mixture-of-experts model with diverse creative output styles.',
    avgTokensPerSec: 50,
    maxContext: 32768,
    strengths: ['Creative variety', 'Good tone matching', 'Efficient MoE architecture'],
    weaknesses: ['Inconsistent quality across experts', 'Higher memory usage'],
    approvalRate: 74,
  },
  {
    id: 'qwen2.5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'ollama',
    modelId: 'qwen2.5:72b',
    category: 'creative',
    description: 'Full-size Qwen model with strong creative writing and brand voice adaptation.',
    avgTokensPerSec: 25,
    maxContext: 131072,
    strengths: ['Brand voice matching', 'Creative copy', 'Nuanced tone control'],
    weaknesses: ['Slow inference', 'Very high resource usage'],
    approvalRate: 86,
  },
  {
    id: 'llama3.2-3b',
    name: 'Llama 3.2 3B',
    provider: 'ollama',
    modelId: 'llama3.2:3b',
    category: 'short_form',
    description: 'Ultra-lightweight model for rapid iteration and A/B variant generation.',
    avgTokensPerSec: 140,
    maxContext: 8192,
    strengths: ['Extremely fast', 'Good for A/B variants', 'Minimal resources'],
    weaknesses: ['Lower quality output', 'Limited context', 'Needs more editing'],
    approvalRate: 55,
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-5-20250929',
    category: 'long_form',
    description: 'Anthropic\'s balanced model. Strong at nuanced, brand-safe content.',
    avgTokensPerSec: 60,
    maxContext: 200000,
    strengths: ['Brand safety', 'Nuanced writing', 'Instruction following'],
    weaknesses: ['API cost', 'External dependency'],
    approvalRate: 93,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    modelId: 'gpt-4o',
    category: 'long_form',
    description: 'OpenAI\'s multimodal model. Versatile across all content types.',
    avgTokensPerSec: 55,
    maxContext: 128000,
    strengths: ['Versatile output', 'Strong formatting', 'Broad knowledge'],
    weaknesses: ['API cost', 'External dependency', 'Can be generic'],
    approvalRate: 90,
  },
]

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

export const CATEGORY_LABELS: Record<ModelCategory, string> = {
  long_form: 'Long Form',
  short_form: 'Short Form',
  email: 'Email',
  creative: 'Creative',
  technical: 'Technical',
}

export const CATEGORY_COLORS: Record<ModelCategory, string> = {
  long_form: 'var(--af-ultra)',
  short_form: 'var(--af-patina)',
  email: 'var(--af-terra)',
  creative: 'var(--af-gold)',
  technical: 'var(--af-ai-hanada)',
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** Fetch all available models. */
export async function fetchModels(): Promise<ModelConfig[]> {
  return [...MODELS]
}

/** Get models filtered by category. */
export async function getModelsByCategory(
  category: ModelCategory,
): Promise<ModelConfig[]> {
  return MODELS.filter((m) => m.category === category)
}

/** Get performance stats for a specific model. */
export async function getModelPerformance(
  modelId: string,
): Promise<Pick<ModelConfig, 'id' | 'name' | 'avgTokensPerSec' | 'maxContext' | 'approvalRate'> | null> {
  const model = MODELS.find((m) => m.id === modelId)
  if (!model) return null
  return {
    id: model.id,
    name: model.name,
    avgTokensPerSec: model.avgTokensPerSec,
    maxContext: model.maxContext,
    approvalRate: model.approvalRate,
  }
}

/** Get the model with the highest approval rate, optionally within a category. */
export function getRecommendedModel(category?: ModelCategory): ModelConfig {
  const pool = category ? MODELS.filter((m) => m.category === category) : MODELS
  return pool.reduce((best, m) => (m.approvalRate > best.approvalRate ? m : best), pool[0])
}

/** Get a model by ID. */
export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id)
}
