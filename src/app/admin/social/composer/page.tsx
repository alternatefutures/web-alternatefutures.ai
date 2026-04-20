'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import WizardStepper from '@/components/admin/WizardStepper'
import LinkPreviewCard from '@/components/admin/LinkPreviewCard'
import PlatformChip from '@/components/admin/PlatformChip'
import {
  transformContent,
  generateMockOutputs,
  type ContentSourceType,
  type TransformRequest,
  type TransformOutput,
} from '@/lib/transformer-api'
import {
  createSocialPost,
  PLATFORM_LIMITS,
  type SocialPlatform,
} from '@/lib/social-api'
import {
  createCampaign,
  ALL_EXPANDED_PLATFORMS,
  EXPANDED_PLATFORM_LABELS,
  EXPANDED_PLATFORM_LIMITS,
  PLATFORM_COLORS,
  type ExpandedPlatform,
} from '@/lib/campaign-api'
import ModelSelector from '@/components/admin/ModelSelector'
import { getRecommendedModel } from '@/lib/model-registry-api'
import {
  fetchAllUtmPresets,
  incrementUtmPresetUsage,
  buildUtmUrl,
  PLATFORM_UTM_DEFAULTS,
  type UtmPreset,
} from '@/lib/utm-api'
import { getCookieValue } from '@/lib/cookies'
import './composer-wizard.css'

const WIZARD_STEPS = [
  { label: 'Source Content' },
  { label: 'Platforms & Generate' },
  { label: 'Schedule & Enrich' },
  { label: 'Review & Create' },
]

const SOURCE_TYPE_OPTIONS: { value: ContentSourceType; label: string }[] = [
  { value: 'FREEFORM', label: 'Freeform' },
  { value: 'BLOG_POST', label: 'Blog Post' },
  { value: 'PRESS_RELEASE', label: 'Press Release' },
  { value: 'CHANGELOG', label: 'Changelog' },
  { value: 'DOCUMENTATION', label: 'Documentation' },
]

const TONE_OPTIONS: { value: TransformRequest['tone']; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'technical', label: 'Technical' },
  { value: 'playful', label: 'Playful' },
]

// Platforms that map to our existing SocialPlatform type for API calls
const CORE_PLATFORMS: SocialPlatform[] = [
  'X', 'BLUESKY', 'LINKEDIN', 'REDDIT', 'DISCORD',
  'TELEGRAM', 'THREADS', 'INSTAGRAM', 'FACEBOOK',
]

function isCoreplatform(p: ExpandedPlatform): p is SocialPlatform {
  return CORE_PLATFORMS.includes(p as SocialPlatform)
}

export default function ComposerWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  // Step 1 — Source content
  const [campaignName, setCampaignName] = useState('')
  const [sourceType, setSourceType] = useState<ContentSourceType>('FREEFORM')
  const [sourceContent, setSourceContent] = useState('')
  const [tone, setTone] = useState<TransformRequest['tone']>('professional')
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(false)

  // Step 2 — Platforms + generated content
  const [selectedPlatforms, setSelectedPlatforms] = useState<ExpandedPlatform[]>([])
  const [outputs, setOutputs] = useState<(TransformOutput & { editedContent?: string })[]>([])
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  // Auto-select recommended model on mount
  useEffect(() => {
    if (!selectedModel) {
      const rec = getRecommendedModel()
      setSelectedModel(rec.id)
    }
  }, [selectedModel])

  // Step 3 — Schedule & enrich
  const [globalSchedule, setGlobalSchedule] = useState('')
  const [perPlatformSchedules, setPerPlatformSchedules] = useState<Record<string, string>>({})
  const [hashtagsInput, setHashtagsInput] = useState('')
  const [utmSource, setUtmSource] = useState('social')
  const [utmMedium, setUtmMedium] = useState('organic')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [utmTerm, setUtmTerm] = useState('')
  const [utmContent, setUtmContent] = useState('')
  const [utmPresets, setUtmPresets] = useState<UtmPreset[]>([])
  const [selectedPresetId, setSelectedPresetId] = useState('')

  // Step 4 — Review & create
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load UTM presets
  useEffect(() => {
    async function loadPresets() {
      const token = getCookieValue('af_access_token')
      const data = await fetchAllUtmPresets(token)
      setUtmPresets(data)
    }
    loadPresets()
  }, [])

  const handleSelectPreset = useCallback((presetId: string) => {
    setSelectedPresetId(presetId)
    if (!presetId) return
    const preset = utmPresets.find((p) => p.id === presetId)
    if (preset) {
      setUtmSource(preset.utm_source)
      setUtmMedium(preset.utm_medium)
      setUtmCampaign(preset.utm_campaign)
      setUtmTerm(preset.utm_term)
      setUtmContent(preset.utm_content)
    }
  }, [utmPresets])

  const handleAutoUtmFromPlatform = useCallback(() => {
    if (selectedPlatforms.length === 0) return
    // Use the first selected platform for auto-generation
    const primary = selectedPlatforms[0]
    const defaults = PLATFORM_UTM_DEFAULTS[primary]
    if (defaults) {
      setUtmSource(defaults.utm_source)
      setUtmMedium(defaults.utm_medium)
    }
    if (!utmCampaign && campaignName) {
      setUtmCampaign(campaignName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }
  }, [selectedPlatforms, utmCampaign, campaignName])

  // Derived
  const canProceedStep1 = useMemo(
    () => campaignName.trim().length > 0 && sourceContent.trim().length > 0,
    [campaignName, sourceContent],
  )

  const canProceedStep2 = useMemo(
    () => selectedPlatforms.length > 0 && outputs.length > 0,
    [selectedPlatforms, outputs],
  )

  const hashtags = useMemo(() => {
    if (!hashtagsInput.trim()) return []
    return hashtagsInput
      .split(',')
      .map((h) => h.trim())
      .filter((h) => h.length > 0)
      .map((h) => (h.startsWith('#') ? h : `#${h}`))
  }, [hashtagsInput])

  // Extract first URL from content for link preview
  const detectedUrl = useMemo(() => {
    const match = sourceContent.match(/https?:\/\/[^\s]+/)
    return match ? match[0] : null
  }, [sourceContent])

  // UTM preview URL
  const utmPreviewUrl = useMemo(() => {
    const base = detectedUrl || 'https://alternatefutures.ai'
    return buildUtmUrl(base, {
      utm_source: utmSource || undefined,
      utm_medium: utmMedium || undefined,
      utm_campaign: utmCampaign || undefined,
      utm_term: utmTerm || undefined,
      utm_content: utmContent || undefined,
    })
  }, [detectedUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent])

  // Handlers
  const togglePlatform = useCallback((platform: ExpandedPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    )
  }, [])

  const handleGenerate = useCallback(async () => {
    if (generating) return
    setGenerating(true)
    setGenerateError(null)
    setOutputs([])

    try {
      const token = getCookieValue('af_access_token')
      // Only generate for core platforms that our transformer supports
      const corePlatforms = selectedPlatforms.filter(isCoreplatform)

      if (corePlatforms.length === 0) {
        // Generate simple mock outputs for non-core platforms
        const mockOutputs: TransformOutput[] = selectedPlatforms.map((p) => ({
          id: `wizard-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          platform: p as SocialPlatform,
          variant: 'default',
          content: sourceContent.slice(0, EXPANDED_PLATFORM_LIMITS[p]),
          charCount: Math.min(sourceContent.length, EXPANDED_PLATFORM_LIMITS[p]),
          promoted: false,
          socialMediaPostId: null,
        }))
        setOutputs(mockOutputs)
      } else {
        const result = await transformContent(token, {
          title: campaignName,
          sourceContent,
          sourceType,
          targetPlatforms: corePlatforms,
          tone,
          includeHashtags,
          includeEmojis,
        })

        // Add outputs for non-core platforms
        const extraPlatforms = selectedPlatforms.filter((p) => !isCoreplatform(p))
        const extraOutputs: TransformOutput[] = extraPlatforms.map((p) => ({
          id: `wizard-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          platform: p as SocialPlatform,
          variant: 'default',
          content: sourceContent.slice(0, EXPANDED_PLATFORM_LIMITS[p]),
          charCount: Math.min(sourceContent.length, EXPANDED_PLATFORM_LIMITS[p]),
          promoted: false,
          socialMediaPostId: null,
        }))

        setOutputs([...result.outputs, ...extraOutputs])
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate')
    } finally {
      setGenerating(false)
    }
  }, [generating, selectedPlatforms, campaignName, sourceContent, sourceType, tone, includeHashtags, includeEmojis])

  const handleUpdateOutput = useCallback((outputId: string, newContent: string) => {
    setOutputs((prev) =>
      prev.map((o) =>
        o.id === outputId
          ? { ...o, editedContent: newContent, charCount: newContent.length }
          : o,
      ),
    )
  }, [])

  const handleRegenerateOne = useCallback(async (outputId: string) => {
    const output = outputs.find((o) => o.id === outputId)
    if (!output) return

    const platform = output.platform
    if (!isCoreplatform(platform as ExpandedPlatform)) return

    try {
      const token = getCookieValue('af_access_token')
      const result = await transformContent(token, {
        title: campaignName,
        sourceContent,
        sourceType,
        targetPlatforms: [platform],
        tone,
        includeHashtags,
        includeEmojis,
      })

      if (result.outputs.length > 0) {
        setOutputs((prev) =>
          prev.map((o) => (o.id === outputId ? { ...result.outputs[0], editedContent: undefined } : o)),
        )
      }
    } catch {
      // silent
    }
  }, [outputs, campaignName, sourceContent, sourceType, tone, includeHashtags, includeEmojis])

  const handleCreateCampaign = useCallback(async (asDraft: boolean) => {
    setCreating(true)
    setCreateError(null)

    try {
      const token = getCookieValue('af_access_token')

      const posts = outputs
        .filter((o) => isCoreplatform(o.platform as ExpandedPlatform))
        .map((o) => {
          const schedule = perPlatformSchedules[o.platform] || globalSchedule
          return {
            platform: o.platform as SocialPlatform,
            content: (o.editedContent ?? o.content).trim(),
            hashtags: hashtags.length > 0 ? hashtags : undefined,
            scheduledAt: schedule || undefined,
            status: asDraft ? ('DRAFT' as const) : (schedule ? 'SCHEDULED' as const : 'DRAFT' as const),
          }
        })

      await createCampaign(token, {
        name: campaignName.trim(),
        description: `Campaign created from ${sourceType.toLowerCase().replace('_', ' ')} content`,
        sourceContent,
        sourceType,
        tone,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        includeEmojis,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        posts,
      })

      // Track preset usage
      if (selectedPresetId) {
        incrementUtmPresetUsage(token, selectedPresetId).catch(() => {})
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/social/campaigns')
      }, 1500)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setCreating(false)
    }
  }, [
    outputs, campaignName, sourceContent, sourceType, tone, hashtags,
    includeEmojis, globalSchedule, perPlatformSchedules,
    utmSource, utmMedium, utmCampaign, router,
  ])

  // Navigation
  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 3))
  }, [])

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  if (success) {
    return (
      <div className="composer-wizard">
        <div className="wizard-success">
          Campaign &quot;{campaignName}&quot; created with {outputs.length} posts!
          Redirecting to campaigns...
        </div>
      </div>
    )
  }

  return (
    <div className="composer-wizard">
      <div className="composer-wizard-header">
        <h1>Campaign Composer</h1>
        <p className="composer-wizard-subtitle">
          Write once, adapt to all platforms, group as campaign
        </p>
      </div>

      <WizardStepper
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep) setCurrentStep(step)
        }}
      />

      {/* ===== STEP 1: Source Content ===== */}
      {currentStep === 0 && (
        <>
          <div className="wizard-step-card">
            <h2>Source Content</h2>

            <label className="wizard-label">Campaign Name</label>
            <input
              type="text"
              className="wizard-input"
              placeholder="e.g. AF Launch Announcement"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />

            <label className="wizard-label">Source Type</label>
            <select
              className="wizard-select"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as ContentSourceType)}
            >
              {SOURCE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <label className="wizard-label">Content</label>
            <textarea
              className="wizard-textarea"
              placeholder="Paste or write the source content to transform..."
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              rows={8}
            />

            <label className="wizard-label">Tone</label>
            <select
              className="wizard-select"
              value={tone}
              onChange={(e) => setTone(e.target.value as TransformRequest['tone'])}
            >
              {TONE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <div className="wizard-options-row">
              <label className="wizard-option-checkbox">
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                />
                <span>Include hashtags</span>
              </label>
              <label className="wizard-option-checkbox">
                <input
                  type="checkbox"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                />
                <span>Include emojis</span>
              </label>
            </div>
          </div>

          {detectedUrl && (
            <div className="wizard-step-card">
              <h3>Link Preview</h3>
              <LinkPreviewCard url={detectedUrl} />
            </div>
          )}

          <div className="wizard-nav">
            <div />
            <button
              className="wizard-nav-next"
              disabled={!canProceedStep1}
              onClick={goNext}
            >
              Next: Select Platforms
            </button>
          </div>
        </>
      )}

      {/* ===== STEP 2: Platform Selection & AI Generation ===== */}
      {currentStep === 1 && (
        <>
          <div className="wizard-step-card">
            <h2>Select Platforms</h2>
            <div className="wizard-platform-grid">
              {ALL_EXPANDED_PLATFORMS.map((platform) => (
                <label
                  key={platform}
                  className={`wizard-platform-item${selectedPlatforms.includes(platform) ? ' selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                  />
                  <span className="wizard-platform-name">
                    {EXPANDED_PLATFORM_LABELS[platform]}
                  </span>
                  <span className="wizard-platform-limit">
                    {EXPANDED_PLATFORM_LIMITS[platform].toLocaleString()}
                  </span>
                </label>
              ))}
            </div>

            <div style={{ marginTop: 'var(--af-space-hand)' }}>
              <ModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
                expanded={false}
              />
            </div>

            <button
              className="wizard-nav-next"
              disabled={selectedPlatforms.length === 0 || generating}
              onClick={handleGenerate}
              style={{ width: '100%' }}
            >
              {generating ? (
                <><span className="wizard-spinner" /> Generating Variants...</>
              ) : (
                `Generate Variants for ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>

          {generateError && (
            <div className="wizard-error">{generateError}</div>
          )}

          {generating && (
            <div className="wizard-generating">
              <div className="wizard-generating-spinner" />
              <p>Generating platform-optimized content...</p>
            </div>
          )}

          {outputs.length > 0 && !generating && (
            <div className="wizard-step-card">
              <h2>Generated Variants ({outputs.length})</h2>
              {outputs.map((output) => {
                const limit = EXPANDED_PLATFORM_LIMITS[output.platform as ExpandedPlatform] || 5000
                const currentContent = output.editedContent ?? output.content
                const isOver = currentContent.length > limit
                const color = PLATFORM_COLORS[output.platform as ExpandedPlatform] || '#6B7280'

                return (
                  <div key={output.id} className="wizard-output-card">
                    <div className="wizard-output-header">
                      <span
                        className="wizard-output-platform-chip"
                        style={{
                          background: `${color}15`,
                          color: color,
                        }}
                      >
                        {EXPANDED_PLATFORM_LABELS[output.platform as ExpandedPlatform] || output.platform}
                      </span>
                      {output.variant !== 'default' && (
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '50px',
                          background: '#F3F4F6',
                          color: '#6B7280',
                          fontFamily: '"Instrument Sans", sans-serif',
                        }}>
                          {output.variant}
                        </span>
                      )}
                      <span className={`wizard-output-char-count${isOver ? ' over' : ''}`}>
                        {currentContent.length} / {limit}
                      </span>
                    </div>
                    <textarea
                      className="wizard-output-textarea"
                      value={currentContent}
                      onChange={(e) => handleUpdateOutput(output.id, e.target.value)}
                      rows={Math.max(3, Math.ceil(currentContent.length / 70))}
                    />
                    <div className="wizard-output-actions">
                      <button
                        className="wizard-output-action-btn"
                        onClick={() => handleRegenerateOne(output.id)}
                      >
                        Regenerate
                      </button>
                      <button
                        className="wizard-output-action-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(currentContent).catch(() => {})
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="wizard-nav">
            <button className="wizard-nav-back" onClick={goBack}>
              Back
            </button>
            <button
              className="wizard-nav-next"
              disabled={!canProceedStep2}
              onClick={goNext}
            >
              Next: Schedule &amp; Enrich
            </button>
          </div>
        </>
      )}

      {/* ===== STEP 3: Schedule & Enrich ===== */}
      {currentStep === 2 && (
        <>
          <div className="wizard-step-card">
            <h2>Schedule</h2>
            <p style={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: '13px',
              color: 'var(--color-text-gray, #6B7280)',
              margin: '0 0 16px',
            }}>
              Set a global schedule or customize per platform. Leave blank to save as draft.
            </p>

            <label className="wizard-label">Global Schedule</label>
            <input
              type="datetime-local"
              className="wizard-input"
              value={globalSchedule}
              onChange={(e) => setGlobalSchedule(e.target.value)}
            />

            <label className="wizard-label">Per-Platform Overrides</label>
            <div className="wizard-schedule-grid">
              {outputs.map((output) => (
                <div key={output.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--color-text-dark, #1F2937)',
                  }}>
                    {EXPANDED_PLATFORM_LABELS[output.platform as ExpandedPlatform] || output.platform}
                  </span>
                  <input
                    type="datetime-local"
                    className="wizard-input"
                    style={{ marginBottom: 0 }}
                    value={perPlatformSchedules[output.platform] || ''}
                    onChange={(e) =>
                      setPerPlatformSchedules((prev) => ({
                        ...prev,
                        [output.platform]: e.target.value,
                      }))
                    }
                    placeholder="Use global"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="wizard-step-card">
            <h2>Hashtags</h2>
            <label className="wizard-label">Shared Hashtags (comma-separated)</label>
            <input
              type="text"
              className="wizard-input"
              placeholder="Web3, AI, DePIN"
              value={hashtagsInput}
              onChange={(e) => setHashtagsInput(e.target.value)}
            />
            {hashtags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {hashtags.map((h) => (
                  <span key={h} className="social-admin-hashtag-chip">{h}</span>
                ))}
              </div>
            )}
          </div>

          {detectedUrl && (
            <div className="wizard-step-card">
              <h2>Link Preview</h2>
              <LinkPreviewCard url={detectedUrl} />
            </div>
          )}

          <div className="wizard-step-card">
            <h2>UTM Parameters</h2>

            <div className="wizard-utm-preset-row">
              <div style={{ flex: 1 }}>
                <label className="wizard-label">Quick Apply Preset</label>
                <select
                  className="wizard-select"
                  value={selectedPresetId}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                >
                  <option value="">-- Select a preset --</option>
                  {utmPresets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="wizard-utm-auto-btn"
                onClick={handleAutoUtmFromPlatform}
                title="Auto-fill based on selected platforms"
              >
                Auto from Platform
              </button>
            </div>

            <div className="wizard-utm-grid">
              <div>
                <label className="wizard-label">Source</label>
                <input
                  type="text"
                  className="wizard-input"
                  placeholder="social"
                  value={utmSource}
                  onChange={(e) => { setUtmSource(e.target.value); setSelectedPresetId('') }}
                />
              </div>
              <div>
                <label className="wizard-label">Medium</label>
                <input
                  type="text"
                  className="wizard-input"
                  placeholder="organic"
                  value={utmMedium}
                  onChange={(e) => { setUtmMedium(e.target.value); setSelectedPresetId('') }}
                />
              </div>
              <div>
                <label className="wizard-label">Campaign</label>
                <input
                  type="text"
                  className="wizard-input"
                  placeholder="launch-2026"
                  value={utmCampaign}
                  onChange={(e) => { setUtmCampaign(e.target.value); setSelectedPresetId('') }}
                />
              </div>
            </div>
            <div className="wizard-utm-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="wizard-label">Term (optional)</label>
                <input
                  type="text"
                  className="wizard-input"
                  placeholder="keyword"
                  value={utmTerm}
                  onChange={(e) => { setUtmTerm(e.target.value); setSelectedPresetId('') }}
                />
              </div>
              <div>
                <label className="wizard-label">Content (optional)</label>
                <input
                  type="text"
                  className="wizard-input"
                  placeholder="variant-a"
                  value={utmContent}
                  onChange={(e) => { setUtmContent(e.target.value); setSelectedPresetId('') }}
                />
              </div>
            </div>

            {(utmSource || utmCampaign) && (
              <div className="wizard-utm-preview">
                <span className="wizard-utm-preview-label">URL Preview</span>
                <code className="wizard-utm-preview-url">{utmPreviewUrl}</code>
              </div>
            )}
          </div>

          <div className="wizard-nav">
            <button className="wizard-nav-back" onClick={goBack}>
              Back
            </button>
            <button className="wizard-nav-next" onClick={goNext}>
              Next: Review &amp; Create
            </button>
          </div>
        </>
      )}

      {/* ===== STEP 4: Review & Create ===== */}
      {currentStep === 3 && (
        <>
          <div className="wizard-step-card">
            <h2>Campaign Summary</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: '8px 16px',
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: '14px',
              marginBottom: '16px',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-gray, #6B7280)' }}>Name</span>
              <span style={{ color: 'var(--color-text-dark, #1F2937)' }}>{campaignName}</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-gray, #6B7280)' }}>Source Type</span>
              <span style={{ color: 'var(--color-text-dark, #1F2937)' }}>
                {SOURCE_TYPE_OPTIONS.find((o) => o.value === sourceType)?.label}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-gray, #6B7280)' }}>Tone</span>
              <span style={{ color: 'var(--color-text-dark, #1F2937)', textTransform: 'capitalize' }}>{tone}</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-gray, #6B7280)' }}>AI Model</span>
              <span style={{ color: 'var(--color-text-dark, #1F2937)' }}>{selectedModel || 'None'}</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-gray, #6B7280)' }}>Platforms</span>
              <span style={{ color: 'var(--color-text-dark, #1F2937)' }}>{outputs.length} posts</span>
              {hashtags.length > 0 && (
                <>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-gray, #6B7280)' }}>Hashtags</span>
                  <span style={{ color: 'var(--color-text-dark, #1F2937)' }}>{hashtags.join(', ')}</span>
                </>
              )}
              {(utmSource || utmMedium || utmCampaign) && (
                <>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-gray, #6B7280)' }}>UTM</span>
                  <span style={{ color: 'var(--color-text-dark, #1F2937)', fontSize: '12px', fontFamily: 'monospace' }}>
                    {[utmSource && `source=${utmSource}`, utmMedium && `medium=${utmMedium}`, utmCampaign && `campaign=${utmCampaign}`, utmTerm && `term=${utmTerm}`, utmContent && `content=${utmContent}`].filter(Boolean).join('&')}
                  </span>
                </>
              )}
              {selectedPresetId && (
                <>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-gray, #6B7280)' }}>Preset</span>
                  <span style={{ color: 'var(--color-text-dark, #1F2937)' }}>
                    {utmPresets.find((p) => p.id === selectedPresetId)?.name || '--'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="wizard-step-card">
            <h2>Posts ({outputs.length})</h2>
            {outputs.map((output) => {
              const currentContent = output.editedContent ?? output.content
              const schedule = perPlatformSchedules[output.platform] || globalSchedule

              return (
                <div key={output.id} className="wizard-review-post">
                  <div className="wizard-review-post-header">
                    <PlatformChip platform={output.platform} />
                    {schedule && (
                      <span style={{
                        fontSize: '12px',
                        fontFamily: '"Instrument Sans", sans-serif',
                        color: '#3730A3',
                        background: '#E0E7FF',
                        padding: '2px 8px',
                        borderRadius: '50px',
                      }}>
                        Scheduled: {new Date(schedule).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    )}
                    {!schedule && (
                      <span style={{
                        fontSize: '12px',
                        fontFamily: '"Instrument Sans", sans-serif',
                        color: '#6B7280',
                        background: '#F3F4F6',
                        padding: '2px 8px',
                        borderRadius: '50px',
                      }}>
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="wizard-review-post-content">
                    {currentContent}
                  </div>
                  <div className="wizard-review-post-meta">
                    <span>{currentContent.length} chars</span>
                    {hashtags.length > 0 && <span>{hashtags.length} hashtags</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {createError && (
            <div className="wizard-error">{createError}</div>
          )}

          <div className="wizard-nav">
            <button className="wizard-nav-back" onClick={goBack}>
              Back
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="wizard-nav-secondary"
                disabled={creating}
                onClick={() => handleCreateCampaign(true)}
              >
                {creating ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                className="wizard-nav-next"
                disabled={creating}
                onClick={() => handleCreateCampaign(false)}
              >
                {creating ? (
                  <><span className="wizard-spinner" /> Creating...</>
                ) : globalSchedule ? (
                  'Schedule All'
                ) : (
                  'Create Campaign'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
