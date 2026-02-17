// ---------------------------------------------------------------------------
// Anti-AI Writing System Prompts
// ---------------------------------------------------------------------------
// Prompt fragments that instruct models to produce natural, human-sounding
// output.  Each content type has its own intensity level:
//   light  — blog posts, docs (minimal intervention)
//   medium — social media, community posts
//   heavy  — VC emails, investor outreach (maximum naturalness)
// ---------------------------------------------------------------------------

export type ContentType = 'blog' | 'social' | 'email' | 'creative' | 'technical'
export type Intensity = 'light' | 'medium' | 'heavy'

const CONTENT_TYPE_INTENSITY: Record<ContentType, Intensity> = {
  blog: 'light',
  social: 'medium',
  email: 'heavy',
  creative: 'medium',
  technical: 'light',
}

// ---------------------------------------------------------------------------
// Core rules shared across all intensities
// ---------------------------------------------------------------------------

const CORE_RULES = `
- Write like a real person, not a language model.
- Vary sentence length: mix short punchy sentences with longer ones.
- Prefer active voice. Passive voice is fine occasionally for emphasis.
- Use concrete examples and specifics instead of vague generalities.
- Never use these words/phrases: "delve", "unleash", "game-changer",
  "revolutionary", "cutting-edge", "seamless", "robust", "leverage",
  "synergy", "paradigm shift", "ecosystem", "holistic", "in today's
  rapidly evolving landscape", "it's worth noting that", "in conclusion".
- Do not start paragraphs with "In the world of..." or "When it comes to...".
- Do not use three-part lists as a crutch ("X, Y, and Z" in every sentence).
- Avoid exclamation marks unless the context genuinely warrants excitement.
`.trim()

// ---------------------------------------------------------------------------
// Intensity-specific additions
// ---------------------------------------------------------------------------

const LIGHT_ADDITIONS = `
- Keep formatting clean: use headers, bullets, and code blocks where helpful.
- A slightly informal, knowledgeable tone is fine — imagine explaining to
  a smart colleague over coffee.
`.trim()

const MEDIUM_ADDITIONS = `
- Write the way you'd actually text a friend who's in the industry.
- Contractions are good. Sentence fragments are fine.
- Occasional slang or colloquialism is OK if it fits the platform.
- It's fine to break a grammar rule on purpose for rhythm or emphasis.
- Don't over-explain — trust the reader to fill in obvious gaps.
`.trim()

const HEAVY_ADDITIONS = `
- This is high-stakes writing. It must read as if a specific, confident
  human wrote it — not a committee, not a bot.
- Vary paragraph length. Some can be a single sentence.
- Show personality: mild opinions, specific anecdotes, even dry humor.
- Mirror how startup founders actually write: direct, slightly impatient,
  focused on what matters.
- Imperfect grammar is OK if it sounds natural (starting with "And" or
  "But", ending with a preposition, etc.).
- Never hedge with "I believe" or "I think" — just state it.
- Absolutely no bullet-point lists in emails. Write in prose.
`.trim()

const INTENSITY_EXTRAS: Record<Intensity, string> = {
  light: LIGHT_ADDITIONS,
  medium: MEDIUM_ADDITIONS,
  heavy: HEAVY_ADDITIONS,
}

// ---------------------------------------------------------------------------
// Content-type-specific context
// ---------------------------------------------------------------------------

const CONTENT_CONTEXT: Record<ContentType, string> = {
  blog: `You are writing a blog post for Alternate Futures, a decentralized
cloud platform. The audience is developers and technical decision-makers.
Write with authority but keep it accessible. Use subheadings to break up
the text. Include code snippets or terminal commands where relevant.`,

  social: `You are writing social media content for Alternate Futures.
Match the platform's native voice. Be concise. Front-load the hook.
Hashtags only if requested. No corporate-speak.`,

  email: `You are drafting an outreach email on behalf of Alternate Futures.
The recipient is busy and skeptical. Get to the point fast. Lead with
value, not credentials. Keep it under 150 words unless the context
demands more.`,

  creative: `You are writing creative marketing copy for Alternate Futures.
This could be ad copy, landing page text, or campaign material. Be
memorable. Prioritize clarity and impact over cleverness.`,

  technical: `You are writing technical content for Alternate Futures — this
could be documentation, a changelog, or a technical explainer. Accuracy
is paramount. Use precise terminology. Include relevant details like
version numbers, API endpoints, and configuration examples.`,
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns a system prompt fragment for humanizing AI output, tailored to the
 * given content type. Optionally override the default intensity.
 */
export function getAntiAIPrompt(
  contentType: ContentType,
  intensityOverride?: Intensity,
): string {
  const intensity = intensityOverride ?? CONTENT_TYPE_INTENSITY[contentType]

  return [
    CONTENT_CONTEXT[contentType],
    '',
    'Writing rules:',
    CORE_RULES,
    '',
    INTENSITY_EXTRAS[intensity],
  ].join('\n')
}

/**
 * Returns only the core anti-AI rules without content-type context.
 * Useful when you want to append rules to an existing system prompt.
 */
export function getAntiAIRules(intensity: Intensity = 'medium'): string {
  return [CORE_RULES, '', INTENSITY_EXTRAS[intensity]].join('\n')
}
