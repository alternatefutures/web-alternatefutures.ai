'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  fetchModels,
  getRecommendedModel,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type ModelConfig,
  type ModelCategory,
} from '@/lib/model-registry-api'
import './ModelSelector.css'

interface ModelSelectorProps {
  value: string | null
  onChange: (modelId: string) => void
  /** Show expanded card with description and stats (default: false) */
  expanded?: boolean
  /** Optional category filter to narrow available models */
  categoryFilter?: ModelCategory
}

export default function ModelSelector({
  value,
  onChange,
  expanded = false,
  categoryFilter,
}: ModelSelectorProps) {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [activeCategory, setActiveCategory] = useState<ModelCategory | null>(
    categoryFilter || null,
  )
  const [showExpanded, setShowExpanded] = useState(expanded)

  useEffect(() => {
    fetchModels().then(setModels)
  }, [])

  const recommendedModel = useMemo(
    () => (models.length > 0 ? getRecommendedModel(activeCategory || undefined) : null),
    [models, activeCategory],
  )

  const filteredModels = useMemo(() => {
    if (!activeCategory) return models
    return models.filter((m) => m.category === activeCategory)
  }, [models, activeCategory])

  // Group models by category for the dropdown
  const groupedModels = useMemo(() => {
    const groups: Record<string, ModelConfig[]> = {}
    for (const m of filteredModels) {
      const cat = CATEGORY_LABELS[m.category]
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(m)
    }
    return groups
  }, [filteredModels])

  const selectedModel = useMemo(
    () => models.find((m) => m.id === value) || null,
    [models, value],
  )

  const categories = useMemo(
    () => Object.keys(CATEGORY_LABELS) as ModelCategory[],
    [],
  )

  if (models.length === 0) return null

  return (
    <div className="model-selector">
      <label className="model-selector-label">AI Model</label>

      {/* Category filter chips */}
      <div className="model-selector-categories">
        <button
          type="button"
          className={`model-selector-cat-btn${activeCategory === null ? ' active' : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`model-selector-cat-btn${activeCategory === cat ? ' active' : ''}`}
            style={{
              '--cat-color': CATEGORY_COLORS[cat],
            } as React.CSSProperties}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Dropdown */}
      <select
        className="model-selector-dropdown"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select a model...</option>
        {Object.entries(groupedModels).map(([group, groupModels]) => (
          <optgroup key={group} label={group}>
            {groupModels
              .sort((a, b) => b.approvalRate - a.approvalRate)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {' '}({m.approvalRate}% approval)
                  {recommendedModel?.id === m.id ? ' ★' : ''}
                </option>
              ))}
          </optgroup>
        ))}
      </select>

      {/* Selected model card (expanded mode) */}
      {selectedModel && (
        <div className="model-selector-selected">
          <div className="model-selector-selected-header">
            <div className="model-selector-selected-info">
              <span className="model-selector-selected-name">{selectedModel.name}</span>
              <span
                className="model-selector-category-badge"
                style={{
                  '--cat-color': CATEGORY_COLORS[selectedModel.category],
                } as React.CSSProperties}
              >
                {CATEGORY_LABELS[selectedModel.category]}
              </span>
              {recommendedModel?.id === selectedModel.id && (
                <span className="model-selector-recommended-badge">Recommended</span>
              )}
            </div>
            <div className="model-selector-approval-rate">
              <span className="model-selector-approval-value">{selectedModel.approvalRate}%</span>
              <span className="model-selector-approval-label">approval</span>
            </div>
          </div>

          {showExpanded && (
            <div className="model-selector-details">
              <p className="model-selector-description">{selectedModel.description}</p>
              <div className="model-selector-stats">
                <div className="model-selector-stat">
                  <span className="model-selector-stat-value">{selectedModel.avgTokensPerSec}</span>
                  <span className="model-selector-stat-label">tok/s</span>
                </div>
                <div className="model-selector-stat">
                  <span className="model-selector-stat-value">{(selectedModel.maxContext / 1000).toFixed(0)}k</span>
                  <span className="model-selector-stat-label">context</span>
                </div>
                <div className="model-selector-stat">
                  <span className="model-selector-stat-value">{selectedModel.provider}</span>
                  <span className="model-selector-stat-label">provider</span>
                </div>
              </div>
              <div className="model-selector-traits">
                <div className="model-selector-strengths">
                  {selectedModel.strengths.map((s) => (
                    <span key={s} className="model-selector-trait model-selector-trait--strength">{s}</span>
                  ))}
                </div>
                <div className="model-selector-weaknesses">
                  {selectedModel.weaknesses.map((w) => (
                    <span key={w} className="model-selector-trait model-selector-trait--weakness">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!expanded && (
            <button
              type="button"
              className="model-selector-expand-btn"
              onClick={() => setShowExpanded(!showExpanded)}
            >
              {showExpanded ? 'Less' : 'More'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
