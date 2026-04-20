'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  PiTrendUpBold,
  PiLightningBold,
  PiChatCircleTextBold,
  PiArrowSquareOutBold,
  PiCopyBold,
  PiPaperPlaneRightBold,
  PiFunnelBold,
  PiArrowsClockwiseBold,
  PiCheckBold,
  PiFireBold,
} from 'react-icons/pi'
import {
  fetchTrendingTopics,
  formatVelocity,
  formatTimeAgo,
  getSourceColor,
  getVerticalColor,
  getRelevanceTier,
  ALL_VERTICALS,
  ALL_SOURCES,
  VERTICAL_LABELS,
  SOURCE_LABELS,
  type TrendingItem,
  type TrendingFilters,
  type GTMVertical,
  type TrendingSource,
} from '@/lib/trending-api'
import { getCookieValue } from '@/lib/cookies'
import './trending-admin.css'

export default function TrendingPage() {
  const [items, setItems] = useState<TrendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filters
  const [selectedVerticals, setSelectedVerticals] = useState<GTMVertical[]>([])
  const [selectedSources, setSelectedSources] = useState<TrendingSource[]>([])
  const [maxAge, setMaxAge] = useState<'hour' | 'day' | 'week'>('day')
  const [minRelevance, setMinRelevance] = useState(0)

  const filters: TrendingFilters = useMemo(
    () => ({
      verticals: selectedVerticals.length > 0 ? selectedVerticals : undefined,
      sources: selectedSources.length > 0 ? selectedSources : undefined,
      maxAge,
      minRelevance: minRelevance > 0 ? minRelevance : undefined,
    }),
    [selectedVerticals, selectedSources, maxAge, minRelevance],
  )

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    const token = getCookieValue('af_access_token')
    const data = await fetchTrendingTopics(token, filters).catch(() => [])
    setItems(data)

    if (isRefresh) setRefreshing(false)
    else setLoading(false)
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const toggleVertical = useCallback((v: GTMVertical) => {
    setSelectedVerticals((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    )
  }, [])

  const toggleSource = useCallback((s: TrendingSource) => {
    setSelectedSources((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }, [])

  // Stats
  const stats = useMemo(() => {
    const highRelevance = items.filter((i) => i.relevanceScore >= 70).length
    const avgVelocity =
      items.length > 0
        ? items.reduce((sum, i) => sum + i.velocity, 0) / items.length
        : 0
    return { total: items.length, highRelevance, avgVelocity }
  }, [items])

  const activeFilterCount =
    selectedVerticals.length + selectedSources.length + (minRelevance > 0 ? 1 : 0)

  if (loading) {
    return (
      <div className="trending-admin">
        <div className="trending-admin-header">
          <div className="trending-admin-header-left">
            <h1>
              <PiTrendUpBold className="trending-admin-header-icon" />
              Trending Topics
            </h1>
            <p className="trending-admin-subtitle">
              Live feed of trending content across platforms relevant to our verticals
            </p>
          </div>
        </div>
        <div className="trending-admin-stats">
          {[1, 2, 3].map((i) => (
            <div key={i} className="trending-admin-stat-card trending-skeleton">
              <div className="skeleton-block" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-block" style={{ width: '50%', height: 24, marginBottom: 6 }} />
                <div className="skeleton-block" style={{ width: '70%', height: 12 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="trending-admin-feed">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="trending-admin-card trending-skeleton">
              <div className="skeleton-block" style={{ width: '80%', height: 18, marginBottom: 12 }} />
              <div className="skeleton-block" style={{ width: '60%', height: 14, marginBottom: 8 }} />
              <div className="skeleton-block" style={{ width: '90%', height: 44 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="trending-admin">
      {/* Header */}
      <div className="trending-admin-header">
        <div className="trending-admin-header-left">
          <h1>
            <PiTrendUpBold className="trending-admin-header-icon" />
            Trending Topics
          </h1>
          <p className="trending-admin-subtitle">
            Live feed of trending content across platforms relevant to our verticals
          </p>
        </div>
        <div className="trending-admin-header-actions">
          <button
            className={`trending-admin-filter-btn${showFilters ? ' active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <PiFunnelBold />
            Filters
            {activeFilterCount > 0 && (
              <span className="trending-admin-filter-count">{activeFilterCount}</span>
            )}
          </button>
          <button
            className="trending-admin-refresh-btn"
            onClick={() => loadData(true)}
            disabled={refreshing}
          >
            <PiArrowsClockwiseBold className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="trending-admin-filters">
          <div className="trending-admin-filter-group">
            <label className="trending-admin-filter-label">Verticals</label>
            <div className="trending-admin-chip-row">
              {ALL_VERTICALS.map((v) => (
                <button
                  key={v}
                  className={`trending-admin-chip${selectedVerticals.includes(v) ? ' selected' : ''}`}
                  onClick={() => toggleVertical(v)}
                  style={
                    selectedVerticals.includes(v)
                      ? { borderColor: getVerticalColor(v), background: `color-mix(in srgb, ${getVerticalColor(v)} 10%, transparent)` }
                      : undefined
                  }
                >
                  {VERTICAL_LABELS[v]}
                </button>
              ))}
            </div>
          </div>

          <div className="trending-admin-filter-group">
            <label className="trending-admin-filter-label">Platform</label>
            <div className="trending-admin-chip-row">
              {ALL_SOURCES.map((s) => (
                <button
                  key={s}
                  className={`trending-admin-chip${selectedSources.includes(s) ? ' selected' : ''}`}
                  onClick={() => toggleSource(s)}
                  style={
                    selectedSources.includes(s)
                      ? { borderColor: getSourceColor(s), background: `color-mix(in srgb, ${getSourceColor(s)} 10%, transparent)` }
                      : undefined
                  }
                >
                  {SOURCE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="trending-admin-filter-row">
            <div className="trending-admin-filter-group">
              <label className="trending-admin-filter-label">Recency</label>
              <select
                className="trending-admin-select"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value as 'hour' | 'day' | 'week')}
              >
                <option value="hour">Last hour</option>
                <option value="day">Last 24 hours</option>
                <option value="week">Last 7 days</option>
              </select>
            </div>

            <div className="trending-admin-filter-group">
              <label className="trending-admin-filter-label">Min Relevance</label>
              <select
                className="trending-admin-select"
                value={minRelevance}
                onChange={(e) => setMinRelevance(Number(e.target.value))}
              >
                <option value={0}>Any</option>
                <option value={20}>20+</option>
                <option value={40}>40+ (Medium)</option>
                <option value={70}>70+ (High)</option>
              </select>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              className="trending-admin-clear-filters"
              onClick={() => {
                setSelectedVerticals([])
                setSelectedSources([])
                setMinRelevance(0)
                setMaxAge('day')
              }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="trending-admin-stats">
        <div className="trending-admin-stat-card">
          <div className="trending-admin-stat-icon">
            <PiTrendUpBold />
          </div>
          <div className="trending-admin-stat-info">
            <div className="trending-admin-stat-value">{stats.total}</div>
            <div className="trending-admin-stat-label">Trending Items</div>
          </div>
        </div>
        <div className="trending-admin-stat-card">
          <div className="trending-admin-stat-icon fire">
            <PiFireBold />
          </div>
          <div className="trending-admin-stat-info">
            <div className="trending-admin-stat-value">{stats.highRelevance}</div>
            <div className="trending-admin-stat-label">High Relevance</div>
          </div>
        </div>
        <div className="trending-admin-stat-card">
          <div className="trending-admin-stat-icon velocity">
            <PiLightningBold />
          </div>
          <div className="trending-admin-stat-info">
            <div className="trending-admin-stat-value">{stats.avgVelocity.toFixed(0)}/hr</div>
            <div className="trending-admin-stat-label">Avg. Velocity</div>
          </div>
        </div>
      </div>

      {/* Feed */}
      {items.length === 0 ? (
        <div className="trending-admin-empty">
          <PiTrendUpBold />
          <p>No trending items match your filters.</p>
          <button
            className="trending-admin-clear-filters"
            onClick={() => {
              setSelectedVerticals([])
              setSelectedSources([])
              setMinRelevance(0)
              setMaxAge('week')
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="trending-admin-feed">
          {items.map((item) => {
            const relevance = getRelevanceTier(item.relevanceScore)
            const isExpanded = expandedId === item.id

            return (
              <div key={item.id} className="trending-admin-card">
                {/* Card header */}
                <div className="trending-admin-card-header">
                  <div className="trending-admin-card-source">
                    <span
                      className="trending-admin-source-dot"
                      style={{ background: getSourceColor(item.source) }}
                    />
                    <span className="trending-admin-source-name">
                      {SOURCE_LABELS[item.source]}
                    </span>
                    <span className="trending-admin-time">
                      {formatTimeAgo(item.postedAt)}
                    </span>
                  </div>
                  <div className="trending-admin-card-relevance">
                    <span
                      className="trending-admin-relevance-badge"
                      style={{ color: relevance.color, borderColor: relevance.color }}
                    >
                      {item.relevanceScore}% {relevance.label}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="trending-admin-card-title">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                    <PiArrowSquareOutBold className="trending-admin-external-icon" />
                  </a>
                </h3>

                {/* Metrics bar */}
                <div className="trending-admin-card-metrics">
                  <span className="trending-admin-metric">
                    <PiTrendUpBold />
                    {item.score.toLocaleString()} pts
                  </span>
                  <span className="trending-admin-metric">
                    <PiChatCircleTextBold />
                    {item.commentCount} comments
                  </span>
                  <span className="trending-admin-metric velocity">
                    <PiLightningBold />
                    {formatVelocity(item.velocity)}
                  </span>
                  {item.author && (
                    <span className="trending-admin-metric author">
                      by {item.author}
                    </span>
                  )}
                </div>

                {/* Vertical tags */}
                {item.matchedVerticals.length > 0 && (
                  <div className="trending-admin-verticals">
                    {item.matchedVerticals.map((v) => (
                      <span
                        key={v}
                        className="trending-admin-vertical-tag"
                        style={{
                          color: getVerticalColor(v),
                          borderColor: getVerticalColor(v),
                          background: `color-mix(in srgb, ${getVerticalColor(v)} 8%, transparent)`,
                        }}
                      >
                        {VERTICAL_LABELS[v]}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested response */}
                <div className="trending-admin-suggestion">
                  <div
                    className="trending-admin-suggestion-header"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setExpandedId(isExpanded ? null : item.id)
                      }
                    }}
                  >
                    <span className="trending-admin-suggestion-label">
                      AI Suggested Response
                    </span>
                    <span className="trending-admin-suggestion-toggle">
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </span>
                  </div>
                  {isExpanded && (
                    <div className="trending-admin-suggestion-body">
                      <p className="trending-admin-suggestion-text">
                        {item.suggestedResponse}
                      </p>
                      <div className="trending-admin-suggestion-actions">
                        <button
                          className="trending-admin-action-btn copy"
                          onClick={() => handleCopy(item.id, item.suggestedResponse)}
                        >
                          {copiedId === item.id ? (
                            <>
                              <PiCheckBold /> Copied
                            </>
                          ) : (
                            <>
                              <PiCopyBold /> Copy
                            </>
                          )}
                        </button>
                        <Link
                          href={`/admin/social/composer?prefill=${encodeURIComponent(item.suggestedResponse)}&ref=${encodeURIComponent(item.url)}`}
                          className="trending-admin-action-btn compose"
                        >
                          <PiPaperPlaneRightBold /> Send to Composer
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
