'use client'

import { useState, useEffect, useMemo } from 'react'
import type { MarketingAsset, AssetTag, AssetCategory } from '@/lib/assets-api'
import { fetchAllAssets, fetchAssetTags, fetchAssetVersions, formatFileSize } from '@/lib/assets-api'
import AssetDetailPanel from '@/components/admin/AssetDetailPanel'
import '../social-admin.css'
import { getCookieValue } from '@/lib/cookies'
import './library.css'

const CATEGORY_OPTIONS: { value: '' | AssetCategory; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'IMAGE', label: 'Images' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'DOCUMENT', label: 'Documents' },
  { value: 'BRAND', label: 'Brand Assets' },
  { value: 'PRESENTATION', label: 'Presentations' },
  { value: 'OTHER', label: 'Other' },
]

export default function LibraryPage() {
  const [assets, setAssets] = useState<MarketingAsset[]>([])
  const [tags, setTags] = useState<AssetTag[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'' | AssetCategory>('')
  const [activeTagIds, setActiveTagIds] = useState<Set<string>>(new Set())
  const [selectedAsset, setSelectedAsset] = useState<MarketingAsset | null>(null)
  const [versionCounts, setVersionCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [assetList, tagList] = await Promise.all([
        fetchAllAssets(token),
        fetchAssetTags(token),
      ])
      setAssets(assetList)
      setTags(tagList)
      setLoading(false)

      // Load version counts in background
      const counts: Record<string, number> = {}
      await Promise.all(
        assetList.map(async (a) => {
          const versions = await fetchAssetVersions(token, a.id)
          if (versions.length > 0) counts[a.id] = versions.length
        }),
      )
      setVersionCounts(counts)
    }
    load()
  }, [])

  const filteredAssets = useMemo(() => {
    let result = assets

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.filename.toLowerCase().includes(q) ||
          a.originalFilename.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q),
      )
    }

    if (categoryFilter) {
      result = result.filter((a) => a.category === categoryFilter)
    }

    if (activeTagIds.size > 0) {
      result = result.filter((a) =>
        a.tags.some((t) => activeTagIds.has(t.id)),
      )
    }

    return result
  }, [assets, search, categoryFilter, activeTagIds])

  const pinnedCount = assets.filter((a) => a.pinStatus === 'PINNED').length
  const totalSize = assets.reduce((sum, a) => sum + a.size, 0)

  const toggleTag = (tagId: string) => {
    setActiveTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) next.delete(tagId)
      else next.add(tagId)
      return next
    })
  }

  const handleAssetUpdate = (updated: MarketingAsset) => {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    setSelectedAsset(updated)
  }

  if (loading) {
    return (
      <>
        <div className="social-admin-header">
          <h1 className="social-admin-header" style={{ margin: 0 }}>Content Library</h1>
        </div>
        <div className="skeleton-stat-row">
          <div className="skeleton-stat-card" />
          <div className="skeleton-stat-card" />
          <div className="skeleton-stat-card" />
        </div>
        <div className="social-admin-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-block w-40" />
              <div className="skeleton-block w-20" />
              <div className="skeleton-block w-16" />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="social-admin-header">
        <h1 style={{
          fontFamily: 'var(--af-font-poet)',
          fontSize: 'var(--af-type-xl)',
          fontWeight: 400,
          color: 'var(--af-stone-800)',
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          Content Library
        </h1>
      </div>

      {/* Stats row */}
      <div className="library-stats">
        <div className="library-stat-card">
          <div className="library-stat-label">Total Assets</div>
          <div className="library-stat-value">{assets.length}</div>
        </div>
        <div className="library-stat-card">
          <div className="library-stat-label">Pinned to IPFS</div>
          <div className="library-stat-value">{pinnedCount}</div>
        </div>
        <div className="library-stat-card">
          <div className="library-stat-label">Total Storage</div>
          <div className="library-stat-value">{formatFileSize(totalSize)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="library-filters">
        <input
          className="library-search"
          type="text"
          placeholder="Search assets by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="library-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as '' | AssetCategory)}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Tag pills */}
      {tags.length > 0 && (
        <div className="library-tag-pills">
          {tags.map((tag) => (
            <button
              key={tag.id}
              className={`library-tag-pill${activeTagIds.has(tag.id) ? ' active' : ''}`}
              onClick={() => toggleTag(tag.id)}
              style={
                activeTagIds.has(tag.id) && tag.color
                  ? { background: tag.color, borderColor: tag.color }
                  : undefined
              }
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Asset grid */}
      <div className="library-grid">
        {filteredAssets.length === 0 ? (
          <div className="library-empty">
            <p>No assets match your filters</p>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="library-card"
              onClick={() => setSelectedAsset(asset)}
            >
              {asset.thumbnailUrl ? (
                <img
                  className="library-card-thumb"
                  src={asset.thumbnailUrl}
                  alt={asset.altText || asset.filename}
                />
              ) : (
                <div
                  className="library-card-thumb"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--af-font-architect)',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--af-stone-300)',
                    textTransform: 'uppercase',
                  }}
                >
                  {asset.mimeType.split('/')[1]?.slice(0, 4) || 'FILE'}
                </div>
              )}
              <div className="library-card-body">
                <div className="library-card-name">{asset.originalFilename}</div>
                <div className="library-card-meta">
                  <span className="library-card-type-badge">{asset.category}</span>
                  <span className={`library-pin-dot ${asset.pinStatus.toLowerCase()}`} />
                  <span className="library-card-size">{formatFileSize(asset.size)}</span>
                  {versionCounts[asset.id] && (
                    <span className="library-card-versions">
                      v{versionCounts[asset.id]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail panel */}
      {selectedAsset && (
        <AssetDetailPanel
          asset={selectedAsset}
          token={getCookieValue('af_access_token')}
          onClose={() => setSelectedAsset(null)}
          onAssetUpdate={handleAssetUpdate}
        />
      )}
    </>
  )
}
