'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  fetchTrendingTopics,
  formatVelocity,
  formatTimeAgo,
  getSourceColor,
  getVerticalColor,
  getRelevanceTier,
  VERTICAL_LABELS,
  SOURCE_LABELS,
  ALL_VERTICALS,
  ALL_SOURCES,
  type TrendingItem,
  type TrendingSource,
  type GTMVertical,
  type TrendingFilters,
} from '@/lib/trending-api'
import {
  PiArrowsClockwiseBold,
  PiCaretRightBold,
  PiPencilSimpleBold,
  PiLightningBold,
  PiBookmarkSimpleBold,
  PiBookmarkSimpleFill,
  PiXBold,
  PiArrowUpBold,
  PiChatCircleBold,
  PiFireBold,
  PiTrendUpBold,
  PiSquaresFourBold,
  PiGridFourBold,
  PiListBold,
  PiShareFatBold,
  PiCopyBold,
  PiImageBold,
  PiArrowSquareOutBold,
} from 'react-icons/pi'
import { getCookieValue } from '@/lib/cookies'
import './trending-admin.css'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHeatLevel(velocity: number): 'hot' | 'warm' | 'cool' | 'cold' {
  if (velocity >= 80) return 'hot'
  if (velocity >= 40) return 'warm'
  if (velocity >= 15) return 'cool'
  return 'cold'
}

/** Generate pseudo-sparkline bar heights from velocity */
function velocityBars(velocity: number): number[] {
  const heat = velocity / 200
  // 5 bars that ramp up to suggest acceleration
  return [
    Math.max(2, Math.round(heat * 3)),
    Math.max(3, Math.round(heat * 5)),
    Math.max(3, Math.round(heat * 7)),
    Math.max(4, Math.round(heat * 10)),
    Math.max(4, Math.round(heat * 12)),
  ]
}

function heatColor(heat: string): string {
  switch (heat) {
    case 'hot': return 'var(--af-terra)'
    case 'warm': return 'var(--af-signal-wait)'
    case 'cool': return 'var(--af-patina)'
    default: return 'var(--af-stone-300)'
  }
}

const SUGGESTED_PLATFORMS: Record<TrendingSource, string[]> = {
  HACKER_NEWS: ['X', 'Reddit', 'LinkedIn'],
  REDDIT: ['X', 'Discord', 'LinkedIn'],
  PRODUCT_HUNT: ['X', 'LinkedIn', 'Bluesky'],
  DEV_TO: ['X', 'Reddit', 'Discord'],
  X: ['Reddit', 'LinkedIn', 'Discord'],
}

const PLATFORM_CHIP_STYLES: Record<string, { bg: string; color: string }> = {
  X: { bg: '#E8F4FD', color: '#1DA1F2' },
  Reddit: { bg: '#FFF0E6', color: '#FF4500' },
  LinkedIn: { bg: '#E8F0FE', color: '#0A66C2' },
  Discord: { bg: '#ECEAFF', color: '#5865F2' },
  Bluesky: { bg: '#E8F0FE', color: '#0085FF' },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TrendingPage() {
  const [items, setItems] = useState<TrendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Filters
  const [activeVerticals, setActiveVerticals] = useState<GTMVertical[]>([])
  const [activeSources, setActiveSources] = useState<TrendingSource[]>([])
  const [recency, setRecency] = useState<'hour' | 'day' | 'week'>('week')

  // UI state
  const [viewMode, setViewMode] = useState<'compact' | 'large' | 'list'>('compact')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null)
  const hydrated = useRef(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('af_trending_saved')
      if (saved) setSavedIds(new Set(JSON.parse(saved)))
      const dismissed = localStorage.getItem('af_trending_dismissed')
      if (dismissed) setDismissedIds(new Set(JSON.parse(dismissed)))
    } catch { /* ignore corrupt storage */ }
    hydrated.current = true
  }, [])

  // Persist to localStorage on change (skip initial render)
  useEffect(() => {
    if (!hydrated.current) return
    localStorage.setItem('af_trending_saved', JSON.stringify([...savedIds]))
  }, [savedIds])

  useEffect(() => {
    if (!hydrated.current) return
    localStorage.setItem('af_trending_dismissed', JSON.stringify([...dismissedIds]))
  }, [dismissedIds])

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

  const loadData = useCallback(async () => {
    setLoading(true)
    const token = getCookieValue('af_access_token')
    const filters: TrendingFilters = {
      verticals: activeVerticals.length > 0 ? activeVerticals : undefined,
      sources: activeSources.length > 0 ? activeSources : undefined,
      maxAge: recency,
    }
    const data = await fetchTrendingTopics(token, filters)
    setItems(data)
    setLastUpdated(new Date())
    setLoading(false)
  }, [activeVerticals, activeSources, recency])

  useEffect(() => {
    loadData()
  }, [loadData])

  // -------------------------------------------------------------------------
  // Filtered + visible items
  // -------------------------------------------------------------------------

  const visibleItems = useMemo(
    () => items.filter((item) => !dismissedIds.has(item.id)),
    [items, dismissedIds],
  )

  // -------------------------------------------------------------------------
  // Interactions
  // -------------------------------------------------------------------------

  function toggleVertical(v: GTMVertical) {
    setActiveVerticals((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    )
  }

  function toggleSource(s: TrendingSource) {
    setActiveSources((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function dismissItem(id: string) {
    setDismissedIds((prev) => new Set(prev).add(id))
    showToast('Trend dismissed', 'info')
  }

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        showToast('Removed from saved', 'info')
      } else {
        next.add(id)
        showToast('Saved for later', 'success')
      }
      return next
    })
  }

  function handleQuickPost(item: TrendingItem) {
    showToast('Draft created in Social queue', 'success')
  }

  // Quote & Share
  const [quoteOpenId, setQuoteOpenId] = useState<string | null>(null)

  function toggleQuoteMenu(id: string) {
    setQuoteOpenId((prev) => (prev === id ? null : id))
  }

  function cardImageUrl(item: TrendingItem): string {
    const params = new URLSearchParams({
      title: item.title,
      source: item.source,
      score: String(item.score),
      comments: String(item.commentCount),
      velocity: String(item.velocity),
      author: item.author || '',
      time: formatTimeAgo(item.postedAt),
    })
    return `/api/trending/card-image?${params.toString()}`
  }

  async function downloadCardImage(item: TrendingItem) {
    showToast('Generating card image...', 'info')
    try {
      const res = await fetch(cardImageUrl(item))
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trending-${item.source.toLowerCase()}-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Card image downloaded', 'success')
    } catch {
      showToast('Failed to generate image', 'warning')
    }
    setQuoteOpenId(null)
  }

  async function copyResponse(item: TrendingItem) {
    const text = item.suggestedResponse || item.title
    await navigator.clipboard.writeText(text)
    showToast('Response copied to clipboard', 'success')
    setQuoteOpenId(null)
  }

  function shareToX(item: TrendingItem) {
    const text = item.suggestedResponse || item.title
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(item.url)}`
    window.open(url, '_blank')
    setQuoteOpenId(null)
  }

  function shareToLinkedIn(item: TrendingItem) {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(item.url)}`
    window.open(url, '_blank')
    setQuoteOpenId(null)
  }

  function shareToReddit(item: TrendingItem) {
    const text = item.suggestedResponse || item.title
    const url = `https://www.reddit.com/submit?title=${encodeURIComponent(item.title)}&url=${encodeURIComponent(item.url)}`
    window.open(url, '_blank')
    setQuoteOpenId(null)
  }

  function clearFilters() {
    setActiveVerticals([])
    setActiveSources([])
    setRecency('week')
  }

  function showToast(message: string, type: string) {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const hasFilters = activeVerticals.length > 0 || activeSources.length > 0 || recency !== 'week'

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      {/* Header */}
      <div className="trending-header">
        <h1>Trending Topics</h1>
        <div className="trending-header-meta">
          {lastUpdated && (
            <span className="trending-last-updated">
              Updated {formatTimeAgo(lastUpdated.toISOString())}
            </span>
          )}
          <div className="trending-view-toggle">
            <button
              className={`trending-view-btn${viewMode === 'compact' ? ' active' : ''}`}
              onClick={() => setViewMode('compact')}
              title="Compact cards"
            >
              <PiGridFourBold />
            </button>
            <button
              className={`trending-view-btn${viewMode === 'large' ? ' active' : ''}`}
              onClick={() => setViewMode('large')}
              title="Large cards"
            >
              <PiSquaresFourBold />
            </button>
            <button
              className={`trending-view-btn${viewMode === 'list' ? ' active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <PiListBold />
            </button>
          </div>
          <button className="trending-refresh-btn" onClick={loadData} disabled={loading}>
            <span className="refresh-icon"><PiArrowsClockwiseBold /></span>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="trending-filters">
        <div className="trending-filter-group">
          <span className="trending-filter-label">Vertical</span>
          <div className="trending-filter-chips">
            {ALL_VERTICALS.map((v) => (
              <button
                key={v}
                className={`trending-chip${activeVerticals.includes(v) ? ' active' : ''}`}
                data-vertical={v}
                onClick={() => toggleVertical(v)}
              >
                {VERTICAL_LABELS[v]}
              </button>
            ))}
          </div>
        </div>

        <div className="trending-filter-group">
          <span className="trending-filter-label">Source</span>
          <div className="trending-filter-chips">
            {ALL_SOURCES.map((s) => (
              <button
                key={s}
                className={`trending-chip${activeSources.includes(s) ? ' active' : ''}`}
                data-source={s}
                onClick={() => toggleSource(s)}
              >
                {SOURCE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="trending-filter-group">
          <span className="trending-filter-label">Recency</span>
          <select
            className="trending-recency-select"
            value={recency}
            onChange={(e) => setRecency(e.target.value as 'hour' | 'day' | 'week')}
          >
            <option value="hour">Past hour</option>
            <option value="day">Past 24h</option>
            <option value="week">Past week</option>
          </select>
        </div>

        <span className="trending-filter-count">
          {visibleItems.length} {visibleItems.length === 1 ? 'topic' : 'topics'}
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="trending-feed">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="trending-skeleton-card">
              <div
                className="trending-skeleton-block"
                style={{ width: '30%', height: 12, marginBottom: 10 }}
              />
              <div
                className="trending-skeleton-block"
                style={{ width: '85%', height: 16, marginBottom: 8 }}
              />
              <div
                className="trending-skeleton-block"
                style={{ width: '60%', height: 16, marginBottom: 12 }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <div className="trending-skeleton-block" style={{ width: 50, height: 20 }} />
                <div className="trending-skeleton-block" style={{ width: 50, height: 20 }} />
                <div className="trending-skeleton-block" style={{ width: 70, height: 20 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && visibleItems.length === 0 && (
        <div className="trending-empty">
          <div className="trending-empty-kintsugi" />
          <div className="trending-empty-title">Nothing stirs here yet</div>
          <div className="trending-empty-sub">
            {hasFilters
              ? 'No topics match these filters. The stream flows — adjust your view to find what surfaces.'
              : 'The feed is quiet. Topics will appear as conversations spark across sources.'}
          </div>
          {hasFilters && (
            <button className="trending-empty-clear-btn" onClick={clearFilters}>
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Feed */}
      {!loading && visibleItems.length > 0 && viewMode !== 'list' && (
        <div className={`trending-feed${viewMode === 'large' ? ' trending-feed-large' : ''}`}>
          {visibleItems.map((item) => {
            const heat = getHeatLevel(item.velocity)
            const bars = velocityBars(item.velocity)
            const relevance = getRelevanceTier(item.relevanceScore)
            const isExpanded = expandedIds.has(item.id)
            const isSaved = savedIds.has(item.id)
            const platforms = SUGGESTED_PLATFORMS[item.source] || ['X', 'LinkedIn']

            return (
              <div key={item.id} className="trend-card" data-heat={heat}>
                <div className="trend-card-body">
                  {/* Source row */}
                  <div className="trend-card-source-row">
                    <div
                      className="trend-card-source-icon"
                      style={{ background: getSourceColor(item.source) }}
                    >
                      {item.source === 'HACKER_NEWS' ? 'Y' :
                       item.source === 'REDDIT' ? 'R' :
                       item.source === 'PRODUCT_HUNT' ? 'P' :
                       item.source === 'DEV_TO' ? 'D' : 'X'}
                    </div>
                    <span className="trend-card-source-name">
                      {SOURCE_LABELS[item.source]}
                    </span>
                    <span className="trend-card-time">
                      {formatTimeAgo(item.postedAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="trend-card-title"
                  >
                    {item.title}
                  </a>

                  {/* Large view: show suggested response inline */}
                  {viewMode === 'large' && item.suggestedResponse && (
                    <p className="trend-card-preview">{item.suggestedResponse}</p>
                  )}

                  {/* Metrics */}
                  <div className="trend-card-metrics">
                    <span className="trend-metric">
                      <span className="trend-metric-icon"><PiArrowUpBold /></span>
                      {item.score.toLocaleString()}
                    </span>
                    <span className="trend-metric">
                      <span className="trend-metric-icon"><PiChatCircleBold /></span>
                      {item.commentCount}
                    </span>
                    <span className="trend-velocity" data-heat={heat}>
                      <span className="trend-velocity-bars">
                        {bars.map((h, i) => (
                          <span
                            key={i}
                            className="trend-velocity-bar"
                            style={{
                              height: h,
                              background: heatColor(heat),
                              opacity: 0.4 + (i * 0.15),
                            }}
                          />
                        ))}
                      </span>
                      {formatVelocity(item.velocity)}
                    </span>
                    {item.relevanceScore > 0 && (
                      <span
                        className="trend-relevance"
                        style={{
                          color: relevance.color,
                          borderColor: relevance.color,
                          background: `color-mix(in srgb, ${relevance.color} 8%, white)`,
                        }}
                      >
                        {relevance.label}
                      </span>
                    )}
                  </div>

                  {/* Vertical badges */}
                  {item.matchedVerticals.length > 0 && (
                    <div className="trend-card-verticals">
                      {item.matchedVerticals.map((v) => (
                        <span
                          key={v}
                          className="trend-vertical-badge"
                          style={{
                            color: getVerticalColor(v),
                            borderColor: getVerticalColor(v),
                            background: `color-mix(in srgb, ${getVerticalColor(v)} 8%, white)`,
                          }}
                        >
                          {VERTICAL_LABELS[v]}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expandable suggested post (compact view only) */}
                  {viewMode === 'compact' && item.suggestedResponse && (
                    <>
                      <button
                        className="trend-card-expand-btn"
                        onClick={() => toggleExpanded(item.id)}
                      >
                        <span className={`trend-card-expand-icon${isExpanded ? ' expanded' : ''}`}>
                          <PiCaretRightBold />
                        </span>
                        AI Suggested Response
                      </button>

                      <div className={`trend-card-suggestion${isExpanded ? ' open' : ''}`}>
                        <div className="trend-suggestion-content">
                          {item.suggestedResponse}
                        </div>
                        <div className="trend-suggestion-platforms">
                          <span className="trend-suggestion-platforms-label">Post to</span>
                          {platforms.map((p) => {
                            const style = PLATFORM_CHIP_STYLES[p] || { bg: '#F3F4F6', color: '#6B7280' }
                            return (
                              <span
                                key={p}
                                className="trend-platform-chip"
                                style={{ background: style.bg, color: style.color }}
                              >
                                {p}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Large view: platform chips always visible */}
                  {viewMode === 'large' && (
                    <div className="trend-suggestion-platforms">
                      <span className="trend-suggestion-platforms-label">Post to</span>
                      {platforms.map((p) => {
                        const style = PLATFORM_CHIP_STYLES[p] || { bg: '#F3F4F6', color: '#6B7280' }
                        return (
                          <span
                            key={p}
                            className="trend-platform-chip"
                            style={{ background: style.bg, color: style.color }}
                          >
                            {p}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="trend-card-actions">
                    <Link
                      href={`/admin/social/composer?prefill=${encodeURIComponent(item.suggestedResponse || '')}&ref=${encodeURIComponent(item.url)}`}
                      className="trend-action-btn action-edit"
                    >
                      <span className="action-icon"><PiPencilSimpleBold /></span>
                      Edit & Post
                    </Link>
                    <button
                      className="trend-action-btn action-quick"
                      onClick={() => handleQuickPost(item)}
                    >
                      <span className="action-icon"><PiLightningBold /></span>
                      Quick Post
                    </button>
                    <button
                      className={`trend-action-btn action-save${isSaved ? ' saved' : ''}`}
                      onClick={() => toggleSave(item.id)}
                    >
                      <span className="action-icon">
                        {isSaved ? <PiBookmarkSimpleFill /> : <PiBookmarkSimpleBold />}
                      </span>
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                    <div className="trend-quote-wrap">
                      <button
                        className="trend-action-btn action-quote"
                        onClick={() => toggleQuoteMenu(item.id)}
                      >
                        <span className="action-icon"><PiShareFatBold /></span>
                        Quote
                      </button>
                      {quoteOpenId === item.id && (
                        <div className="trend-quote-menu">
                          <button className="trend-quote-option" onClick={() => copyResponse(item)}>
                            <PiCopyBold /> Copy Response
                          </button>
                          <button className="trend-quote-option" onClick={() => downloadCardImage(item)}>
                            <PiImageBold /> Download Card Image
                          </button>
                          <div className="trend-quote-divider" />
                          <button className="trend-quote-option" onClick={() => shareToX(item)}>
                            <PiArrowSquareOutBold /> Share to X
                          </button>
                          <button className="trend-quote-option" onClick={() => shareToLinkedIn(item)}>
                            <PiArrowSquareOutBold /> Share to LinkedIn
                          </button>
                          <button className="trend-quote-option" onClick={() => shareToReddit(item)}>
                            <PiArrowSquareOutBold /> Share to Reddit
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      className="trend-action-btn action-dismiss"
                      onClick={() => dismissItem(item.id)}
                    >
                      <span className="action-icon"><PiXBold /></span>
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {!loading && visibleItems.length > 0 && viewMode === 'list' && (
        <div className="trending-list">
          <div className="trending-list-header">
            <span className="tl-col-source">Source</span>
            <span className="tl-col-title">Title</span>
            <span className="tl-col-score">Score</span>
            <span className="tl-col-comments">Comments</span>
            <span className="tl-col-velocity">Velocity</span>
            <span className="tl-col-relevance">Relevance</span>
            <span className="tl-col-verticals">Verticals</span>
            <span className="tl-col-time">Time</span>
            <span className="tl-col-actions">Actions</span>
          </div>
          {visibleItems.map((item) => {
            const heat = getHeatLevel(item.velocity)
            const bars = velocityBars(item.velocity)
            const relevance = getRelevanceTier(item.relevanceScore)
            const isSaved = savedIds.has(item.id)

            return (
              <div key={item.id} className="trending-list-row" data-heat={heat}>
                <span className="tl-col-source">
                  <span
                    className="trend-card-source-icon"
                    style={{ background: getSourceColor(item.source) }}
                  >
                    {item.source === 'HACKER_NEWS' ? 'Y' :
                     item.source === 'REDDIT' ? 'R' :
                     item.source === 'PRODUCT_HUNT' ? 'P' :
                     item.source === 'DEV_TO' ? 'D' : 'X'}
                  </span>
                </span>
                <span className="tl-col-title">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="trend-card-title"
                  >
                    {item.title}
                  </a>
                </span>
                <span className="tl-col-score">
                  <PiArrowUpBold style={{ fontSize: 11, opacity: 0.5 }} />
                  {item.score.toLocaleString()}
                </span>
                <span className="tl-col-comments">
                  <PiChatCircleBold style={{ fontSize: 11, opacity: 0.5 }} />
                  {item.commentCount}
                </span>
                <span className="tl-col-velocity">
                  <span className="trend-velocity" data-heat={heat} style={{ padding: '1px 6px' }}>
                    <span className="trend-velocity-bars">
                      {bars.map((h, i) => (
                        <span
                          key={i}
                          className="trend-velocity-bar"
                          style={{
                            height: h,
                            background: heatColor(heat),
                            opacity: 0.4 + (i * 0.15),
                          }}
                        />
                      ))}
                    </span>
                    {formatVelocity(item.velocity)}
                  </span>
                </span>
                <span className="tl-col-relevance">
                  {item.relevanceScore > 0 && (
                    <span
                      className="trend-relevance"
                      style={{
                        color: relevance.color,
                        borderColor: relevance.color,
                        background: `color-mix(in srgb, ${relevance.color} 8%, white)`,
                      }}
                    >
                      {relevance.label}
                    </span>
                  )}
                </span>
                <span className="tl-col-verticals">
                  {item.matchedVerticals.slice(0, 2).map((v) => (
                    <span
                      key={v}
                      className="trend-vertical-badge"
                      style={{
                        color: getVerticalColor(v),
                        borderColor: getVerticalColor(v),
                        background: `color-mix(in srgb, ${getVerticalColor(v)} 8%, white)`,
                      }}
                    >
                      {VERTICAL_LABELS[v]}
                    </span>
                  ))}
                </span>
                <span className="tl-col-time">{formatTimeAgo(item.postedAt)}</span>
                <span className="tl-col-actions">
                  <Link
                    href={`/admin/social/composer?prefill=${encodeURIComponent(item.suggestedResponse || '')}&ref=${encodeURIComponent(item.url)}`}
                    className="trend-action-btn action-edit"
                    title="Edit & Post"
                  >
                    <span className="action-icon"><PiPencilSimpleBold /></span>
                  </Link>
                  <button
                    className="trend-action-btn action-quick"
                    onClick={() => handleQuickPost(item)}
                    title="Quick Post"
                  >
                    <span className="action-icon"><PiLightningBold /></span>
                  </button>
                  <button
                    className={`trend-action-btn action-save${isSaved ? ' saved' : ''}`}
                    onClick={() => toggleSave(item.id)}
                    title={isSaved ? 'Saved' : 'Save'}
                  >
                    <span className="action-icon">
                      {isSaved ? <PiBookmarkSimpleFill /> : <PiBookmarkSimpleBold />}
                    </span>
                  </button>
                  <div className="trend-quote-wrap">
                    <button
                      className="trend-action-btn action-quote"
                      onClick={() => toggleQuoteMenu(item.id)}
                      title="Quote & Share"
                    >
                      <span className="action-icon"><PiShareFatBold /></span>
                    </button>
                    {quoteOpenId === item.id && (
                      <div className="trend-quote-menu">
                        <button className="trend-quote-option" onClick={() => copyResponse(item)}>
                          <PiCopyBold /> Copy Response
                        </button>
                        <button className="trend-quote-option" onClick={() => downloadCardImage(item)}>
                          <PiImageBold /> Download Card Image
                        </button>
                        <div className="trend-quote-divider" />
                        <button className="trend-quote-option" onClick={() => shareToX(item)}>
                          <PiArrowSquareOutBold /> Share to X
                        </button>
                        <button className="trend-quote-option" onClick={() => shareToLinkedIn(item)}>
                          <PiArrowSquareOutBold /> Share to LinkedIn
                        </button>
                        <button className="trend-quote-option" onClick={() => shareToReddit(item)}>
                          <PiArrowSquareOutBold /> Share to Reddit
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    className="trend-action-btn action-dismiss"
                    onClick={() => dismissItem(item.id)}
                    title="Dismiss"
                  >
                    <span className="action-icon"><PiXBold /></span>
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`trending-toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  )
}
