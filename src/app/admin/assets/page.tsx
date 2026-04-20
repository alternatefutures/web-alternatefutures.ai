'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDialog } from '@/hooks/useDialog'
import Link from 'next/link'
import UploadDialog from '@/components/admin/UploadDialog'
import {
  fetchAllAssets,
  fetchAssetTags,
  deleteAsset,
  uploadAsset,
  formatFileSize,
  getIpfsGatewayUrl,
  type MarketingAsset,
  type AssetTag,
  type AssetCategory,
  type AssetViewMode,
  type UploadProgress,
  type UploadAssetMetadata,
} from '@/lib/assets-api'
import { getCookieValue } from '@/lib/cookies'
import './assets-admin.css'

const ALL_CATEGORIES: { value: AssetCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All categories' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'BRAND', label: 'Brand' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'OTHER', label: 'Other' },
]

export default function AssetsAdminDashboard() {
  const [assets, setAssets] = useState<MarketingAsset[]>([])
  const [tags, setTags] = useState<AssetTag[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'ALL'>('ALL')
  const [tagFilter, setTagFilter] = useState('')
  const [viewMode, setViewMode] = useState<AssetViewMode>('grid')
  const [deleteTarget, setDeleteTarget] = useState<MarketingAsset | null>(null)
  const [deleting, setDeleting] = useState(false)
  const assetDeleteDialogRef = useDialog(!!deleteTarget, () => setDeleteTarget(null))
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const [assetsData, tagsData] = await Promise.all([
          fetchAllAssets(token),
          fetchAssetTags(token),
        ])
        setAssets(assetsData)
        setTags(tagsData)
      } catch {
        setLoadError('Failed to load assets. Please refresh to try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = assets
    if (categoryFilter !== 'ALL') {
      result = result.filter((a) => a.category === categoryFilter)
    }
    if (tagFilter) {
      result = result.filter((a) => a.tags.some((t) => t.slug === tagFilter))
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.filename.toLowerCase().includes(q) ||
          a.originalFilename.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)),
      )
    }
    return result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }, [assets, categoryFilter, tagFilter, search])

  const stats = useMemo(
    () => ({
      total: assets.length,
      images: assets.filter((a) => a.category === 'IMAGE' || a.category === 'BRAND').length,
      documents: assets.filter((a) => a.category === 'DOCUMENT' || a.category === 'PRESENTATION').length,
      storageUsed: formatFileSize(assets.reduce((sum, a) => sum + a.size, 0)),
    }),
    [assets],
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteAsset(token, deleteTarget.id)
      setAssets((prev) => prev.filter((a) => a.id !== deleteTarget.id))
    } catch {
      setLoadError('Failed to delete asset. Please try again.')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  const handleUpload = useCallback(
    async (files: FileList, metadata: UploadAssetMetadata) => {
      const token = getCookieValue('af_access_token')
      const fileArray = Array.from(files)

      // Initialize progress for all files
      const initialProgress: UploadProgress[] = fileArray.map((f, i) => ({
        fileId: `pending-${i}-${Date.now()}`,
        filename: f.name,
        progress: 0,
        status: 'pending',
      }))
      setUploadProgress(initialProgress)

      // Upload files sequentially
      for (let i = 0; i < fileArray.length; i++) {
        try {
          const asset = await uploadAsset(token, fileArray[i], metadata, (progress) => {
            setUploadProgress((prev) =>
              prev.map((p, idx) => (idx === i ? { ...p, ...progress } : p)),
            )
          })
          setAssets((prev) => [asset, ...prev.filter((a) => a.id !== asset.id)])
        } catch (err) {
          setUploadProgress((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? {
                    ...p,
                    status: 'error',
                    error: err instanceof Error ? err.message : 'Upload failed',
                  }
                : p,
            ),
          )
        }
      }

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress([])
        setUploadOpen(false)
      }, 1500)
    },
    [],
  )

  const handleCopyIpfs = useCallback(
    (e: React.MouseEvent, asset: MarketingAsset) => {
      e.preventDefault()
      e.stopPropagation()
      if (!asset.cid) return
      const url = getIpfsGatewayUrl(asset.cid)
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(asset.id)
        setTimeout(() => setCopiedId(null), 1800)
      })
    },
    [],
  )

  function truncateCid(cid: string): string {
    if (cid.length <= 16) return cid
    return `${cid.slice(0, 8)}...${cid.slice(-6)}`
  }

  function pinStatusLabel(status: MarketingAsset['pinStatus']): string {
    switch (status) {
      case 'PINNED': return 'Pinned'
      case 'PINNING': return 'Pinning...'
      case 'FAILED': return 'Pin failed'
      default: return 'Unpinned'
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function isPreviewable(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  if (loading) {
    return <div className="assets-admin-empty"><p>Loading assets...</p></div>
  }

  if (loadError) {
    return (
      <div className="assets-admin-empty">
        <h2>Error</h2>
        <p>{loadError}</p>
        <button
          className="assets-admin-upload-btn"
          onClick={() => window.location.reload()}
          style={{ marginTop: 12 }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="assets-admin-header">
        <h1>Digital Assets</h1>
        <button
          className="assets-admin-upload-btn"
          onClick={() => setUploadOpen(true)}
        >
          + Upload Asset
        </button>
      </div>

      <div className="assets-admin-stats">
        <div className="assets-admin-stat-card">
          <div className="assets-admin-stat-label">Total Assets</div>
          <div className="assets-admin-stat-value">{stats.total}</div>
        </div>
        <div className="assets-admin-stat-card">
          <div className="assets-admin-stat-label">Images</div>
          <div className="assets-admin-stat-value">{stats.images}</div>
        </div>
        <div className="assets-admin-stat-card">
          <div className="assets-admin-stat-label">Documents</div>
          <div className="assets-admin-stat-value">{stats.documents}</div>
        </div>
        <div className="assets-admin-stat-card">
          <div className="assets-admin-stat-label">Storage Used</div>
          <div className="assets-admin-stat-value">{stats.storageUsed}</div>
        </div>
      </div>

      <div className="assets-admin-filters">
        <input
          type="text"
          className="assets-admin-search"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="assets-admin-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as AssetCategory | 'ALL')}
        >
          {ALL_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className="assets-admin-select"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="assets-admin-view-toggle">
          <button
            className={`assets-admin-view-btn${viewMode === 'grid' ? ' active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={`assets-admin-view-btn${viewMode === 'list' ? ' active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="assets-admin-empty">
          <h2>No assets found</h2>
          <p>
            {assets.length === 0
              ? 'Upload your first asset to get started.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="assets-admin-grid">
          {filtered.map((asset) => (
            <Link
              key={asset.id}
              href={`/admin/assets/${asset.id}`}
              className="assets-admin-grid-card"
            >
              <div className="assets-admin-grid-thumb">
                {asset.thumbnailUrl && isPreviewable(asset.mimeType) ? (
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.altText || asset.filename}
                  />
                ) : (
                  <div className="assets-admin-grid-thumb-placeholder">
                    {asset.mimeType.split('/')[1]?.toUpperCase() || asset.category}
                  </div>
                )}
                <div className="assets-admin-grid-overlay">
                  <span className="assets-admin-category-chip">{asset.category}</span>
                </div>
                {asset.cid && (
                  <button
                    className={`assets-admin-grid-copy-btn${copiedId === asset.id ? ' copied' : ''}`}
                    onClick={(e) => handleCopyIpfs(e, asset)}
                    title="Copy IPFS gateway URL"
                  >
                    {copiedId === asset.id ? 'Copied!' : 'Copy IPFS'}
                  </button>
                )}
              </div>
              <div className="assets-admin-grid-info">
                <div className="assets-admin-grid-filename">{asset.filename}</div>
                <div className="assets-admin-grid-meta">
                  <span>{formatFileSize(asset.size)}</span>
                  {asset.width && asset.height && (
                    <span>{asset.width} x {asset.height}</span>
                  )}
                </div>
                <div className="assets-admin-grid-ipfs-row">
                  <span className={`assets-admin-pin-indicator ${asset.pinStatus.toLowerCase()}`}>
                    {pinStatusLabel(asset.pinStatus)}
                  </span>
                  {asset.cid && (
                    <span className="assets-admin-grid-cid">{truncateCid(asset.cid)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="assets-admin-table-wrap">
          <table className="assets-admin-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Category</th>
                <th>Size</th>
                <th>Tags</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <div className="assets-admin-table-filename">
                      {asset.thumbnailUrl && isPreviewable(asset.mimeType) ? (
                        <img
                          className="assets-admin-table-thumb"
                          src={asset.thumbnailUrl}
                          alt={asset.altText || asset.filename}
                        />
                      ) : (
                        <div
                          className="assets-admin-table-thumb"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#6B7280',
                          }}
                        >
                          {asset.mimeType.split('/')[1]?.slice(0, 3).toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="assets-admin-table-name">{asset.filename}</span>
                    </div>
                  </td>
                  <td>
                    <span className="assets-admin-category-chip">{asset.category}</span>
                  </td>
                  <td>{formatFileSize(asset.size)}</td>
                  <td>
                    <div className="assets-admin-tags-cell">
                      {asset.tags.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className="assets-admin-tag-chip"
                          style={{
                            background: t.color ? `${t.color}14` : 'rgba(0, 10, 255, 0.06)',
                            color: t.color || 'var(--color-blue, #000AFF)',
                          }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{formatDate(asset.updatedAt)}</td>
                  <td>
                    <div className="assets-admin-actions">
                      {asset.cid && (
                        <button
                          className={`assets-admin-action-btn ipfs${copiedId === asset.id ? ' copied' : ''}`}
                          onClick={(e) => handleCopyIpfs(e as React.MouseEvent, asset)}
                        >
                          {copiedId === asset.id ? 'Copied!' : 'IPFS'}
                        </button>
                      )}
                      <Link
                        href={`/admin/assets/${asset.id}`}
                        className="assets-admin-action-btn"
                      >
                        View
                      </Link>
                      <button
                        className="assets-admin-action-btn danger"
                        onClick={() => setDeleteTarget(asset)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div
          className="assets-admin-dialog-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="assets-admin-dialog"
            ref={assetDeleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="asset-delete-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="asset-delete-dialog-title">Delete asset?</h3>
            <p>
              Are you sure you want to delete &ldquo;{deleteTarget.filename}&rdquo;?
              This action cannot be undone.
            </p>
            <div className="assets-admin-dialog-actions">
              <button
                className="assets-admin-dialog-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="assets-admin-dialog-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
        uploadProgress={uploadProgress}
      />

      {copiedId && (
        <div className="assets-admin-toast">Copied!</div>
      )}
    </>
  )
}
