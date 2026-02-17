'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  fetchAssetById,
  fetchAssetTags,
  updateAssetMetadata,
  deleteAsset,
  formatFileSize,
  getIpfsGatewayUrl,
  buildIpfsCdnUrl,
  IPFS_GATEWAYS,
  type MarketingAsset,
  type AssetTag,
  type AssetCategory,
  type IpfsGateway,
} from '@/lib/assets-api'
import { getCookieValue } from '@/lib/cookies'
import '../assets-admin.css'

const ALL_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'BRAND', label: 'Brand' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'OTHER', label: 'Other' },
]

export default function AssetDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const assetId = params.id

  const [asset, setAsset] = useState<MarketingAsset | null>(null)
  const [allTags, setAllTags] = useState<AssetTag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // CDN URL builder
  const [cdnWidth, setCdnWidth] = useState('')
  const [cdnHeight, setCdnHeight] = useState('')
  const [cdnFormat, setCdnFormat] = useState<'auto' | 'webp' | 'avif' | 'png' | 'jpg'>('auto')
  const [cdnQuality, setCdnQuality] = useState('80')
  const [cdnFit, setCdnFit] = useState<'cover' | 'contain' | 'fill' | 'scale-down'>('cover')
  const [cdnDpr, setCdnDpr] = useState('1')
  const [cdnGateway, setCdnGateway] = useState<IpfsGateway>(IPFS_GATEWAYS[0])
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Editable fields
  const [altText, setAltText] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<AssetCategory>('IMAGE')
  const [folder, setFolder] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [assetData, tagsData] = await Promise.all([
        fetchAssetById(token, assetId),
        fetchAssetTags(token),
      ])
      if (assetData) {
        setAsset(assetData)
        setAltText(assetData.altText || '')
        setDescription(assetData.description || '')
        setCategory(assetData.category)
        setFolder(assetData.folder || '')
        setSelectedTagIds(assetData.tags.map((t) => t.id))
      }
      setAllTags(tagsData)
      setLoading(false)
    }
    load()
  }, [assetId])

  const handleSave = useCallback(async () => {
    if (!asset) return
    setSaving(true)
    setStatusMsg(null)
    try {
      const token = getCookieValue('af_access_token')
      const updated = await updateAssetMetadata(token, asset.id, {
        altText,
        description,
        category,
        folder: folder || undefined,
        tagIds: selectedTagIds,
      })
      setAsset(updated)
      setStatusMsg({ type: 'success', text: 'Asset updated successfully.' })
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save changes.',
      })
    } finally {
      setSaving(false)
    }
  }, [asset, altText, description, category, folder, selectedTagIds])

  const handleDelete = useCallback(async () => {
    if (!asset) return
    setDeleting(true)
    try {
      const token = getCookieValue('af_access_token')
      await deleteAsset(token, asset.id)
      router.push('/admin/assets')
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to delete asset.' })
      setDeleting(false)
      setDeleteConfirm(false)
    }
  }, [asset, router])

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    )
  }, [])

  const buildCdnUrl = useCallback((): string => {
    if (!asset?.cid) return ''
    return buildIpfsCdnUrl(asset.cid, cdnGateway, {
      width: cdnWidth,
      height: cdnHeight,
      format: cdnFormat,
      quality: cdnQuality,
      fit: cdnFit,
      dpr: cdnDpr,
    })
  }, [asset, cdnGateway, cdnWidth, cdnHeight, cdnFormat, cdnQuality, cdnFit, cdnDpr])

  const plainGatewayUrl = asset?.cid ? cdnGateway.buildUrl(asset.cid) : ''
  const cdnUrl = asset?.cid ? buildCdnUrl() : ''
  const ipfsProtocolUrl = asset?.cid ? `ipfs://${asset.cid}` : ''
  const httpGatewayUrl = asset?.cid ? getIpfsGatewayUrl(asset.cid) : ''
  const hasTransforms = cdnWidth || cdnHeight || cdnFormat !== 'auto' || cdnQuality !== '80' || cdnFit !== 'cover' || cdnDpr !== '1'

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1800)
    })
  }, [])

  function isPreviewable(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <div className="assets-admin-empty"><p>Loading asset...</p></div>
  }

  if (!asset) {
    return (
      <div className="assets-admin-empty">
        <h2>Asset not found</h2>
        <p>The requested asset could not be loaded.</p>
        <Link href="/admin/assets" className="assets-detail-back">
          Back to Assets
        </Link>
      </div>
    )
  }

  return (
    <>
      <Link href="/admin/assets" className="assets-detail-back">
        &larr; Back to Assets
      </Link>

      <div className="assets-detail-header">
        <h1>{asset.originalFilename}</h1>
      </div>

      <div className="assets-detail-layout">
        {/* Main column: Preview + CDN builder */}
        <div className="assets-detail-main-col">
        <div className="assets-detail-preview">
          <div className="assets-detail-preview-inner">
            {isPreviewable(asset.mimeType) ? (
              <img
                src={asset.url}
                alt={asset.altText || asset.filename}
              />
            ) : (
              <div className="assets-detail-preview-placeholder">
                <span>&#128196;</span>
                {asset.mimeType.split('/')[1]?.toUpperCase() || asset.category}
              </div>
            )}
          </div>
          <div className="assets-detail-file-info">
            <div className="assets-detail-info-item">
              <span className="assets-detail-info-label">Size</span>
              <span className="assets-detail-info-value">
                {formatFileSize(asset.size)}
              </span>
            </div>
            {asset.width && asset.height && (
              <div className="assets-detail-info-item">
                <span className="assets-detail-info-label">Dimensions</span>
                <span className="assets-detail-info-value">
                  {asset.width} x {asset.height}
                </span>
              </div>
            )}
            <div className="assets-detail-info-item">
              <span className="assets-detail-info-label">MIME Type</span>
              <span className="assets-detail-info-value">{asset.mimeType}</span>
            </div>
            <div className="assets-detail-info-item">
              <span className="assets-detail-info-label">Storage</span>
              <span className="assets-detail-info-value">{asset.storageType}</span>
            </div>
            {asset.cid && (
              <div className="assets-detail-info-item">
                <span className="assets-detail-info-label">CID</span>
                <span className="assets-detail-info-value mono">{asset.cid}</span>
              </div>
            )}
            <div className="assets-detail-info-item">
              <span className="assets-detail-info-label">Created</span>
              <span className="assets-detail-info-value">
                {formatDate(asset.createdAt)}
              </span>
            </div>
            <div className="assets-detail-info-item">
              <span className="assets-detail-info-label">Updated</span>
              <span className="assets-detail-info-value">
                {formatDate(asset.updatedAt)}
              </span>
            </div>
            <div className="assets-detail-info-item">
              <span className="assets-detail-info-label">Usage Count</span>
              <span className="assets-detail-info-value">{asset.usageCount}</span>
            </div>
          </div>
        </div>

        {/* CDN URL Builder */}
        {asset.cid && isPreviewable(asset.mimeType) && (
          <div className="assets-detail-cdn-builder">
            <h3>CDN URL Builder</h3>

            <div className="assets-detail-cdn-preview">
              <img
                src={plainGatewayUrl}
                alt={asset.altText || 'IPFS preview'}
                key={plainGatewayUrl}
              />
            </div>

            {/* Gateway selector */}
            <div className="assets-detail-cdn-controls">
              <div className="assets-detail-cdn-row">
                <div className="assets-detail-cdn-field" style={{ flex: '1 1 100%' }}>
                  <label>IPFS Gateway</label>
                  <select
                    value={cdnGateway.name}
                    onChange={(e) => {
                      const gw = IPFS_GATEWAYS.find((g) => g.name === e.target.value)
                      if (gw) setCdnGateway(gw)
                    }}
                  >
                    {IPFS_GATEWAYS.map((gw) => (
                      <option key={gw.name} value={gw.name}>
                        {gw.label}{gw.supportsTransforms ? ' (transforms)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!cdnGateway.supportsTransforms && (
                <div className="assets-detail-cdn-notice">
                  This gateway serves raw IPFS content — image transforms are not supported.
                  Switch to Cloudflare IPFS for resize, format conversion, and quality controls.
                </div>
              )}

              {cdnGateway.supportsTransforms && (
                <>
                  <div className="assets-detail-cdn-row">
                    <div className="assets-detail-cdn-field">
                      <label>Width</label>
                      <input
                        type="number"
                        placeholder="auto"
                        value={cdnWidth}
                        onChange={(e) => setCdnWidth(e.target.value)}
                      />
                    </div>
                    <div className="assets-detail-cdn-field">
                      <label>Height</label>
                      <input
                        type="number"
                        placeholder="auto"
                        value={cdnHeight}
                        onChange={(e) => setCdnHeight(e.target.value)}
                      />
                    </div>
                    <div className="assets-detail-cdn-field">
                      <label>DPR</label>
                      <select value={cdnDpr} onChange={(e) => setCdnDpr(e.target.value)}>
                        <option value="1">1x</option>
                        <option value="2">2x</option>
                        <option value="3">3x</option>
                      </select>
                    </div>
                  </div>

                  <div className="assets-detail-cdn-row">
                    <div className="assets-detail-cdn-field">
                      <label>Format</label>
                      <select value={cdnFormat} onChange={(e) => setCdnFormat(e.target.value as typeof cdnFormat)}>
                        <option value="auto">Auto</option>
                        <option value="webp">WebP</option>
                        <option value="avif">AVIF</option>
                        <option value="png">PNG</option>
                        <option value="jpg">JPEG</option>
                      </select>
                    </div>
                    <div className="assets-detail-cdn-field">
                      <label>Quality</label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={cdnQuality}
                        onChange={(e) => setCdnQuality(e.target.value)}
                      />
                      <span className="assets-detail-cdn-quality-val">{cdnQuality}%</span>
                    </div>
                    <div className="assets-detail-cdn-field">
                      <label>Fit</label>
                      <select value={cdnFit} onChange={(e) => setCdnFit(e.target.value as typeof cdnFit)}>
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                        <option value="scale-down">Scale Down</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="assets-detail-cdn-url-field">
              <label>{cdnGateway.supportsTransforms && hasTransforms ? 'CDN URL (with transforms)' : 'Gateway URL'}</label>
              <div className="assets-detail-cdn-url-row">
                <input type="text" readOnly value={cdnUrl} />
                <button
                  className={copiedField === 'cdn' ? 'copied' : ''}
                  onClick={() => copyToClipboard(cdnUrl, 'cdn')}
                >
                  {copiedField === 'cdn' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="assets-detail-cdn-links">
              <div className="assets-detail-cdn-link-item">
                <span className="assets-detail-cdn-link-label">ipfs://</span>
                <code>{ipfsProtocolUrl}</code>
                <button
                  className={copiedField === 'ipfs' ? 'copied' : ''}
                  onClick={() => copyToClipboard(ipfsProtocolUrl, 'ipfs')}
                >
                  {copiedField === 'ipfs' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="assets-detail-cdn-link-item">
                <span className="assets-detail-cdn-link-label">HTTP</span>
                <code>{httpGatewayUrl}</code>
                <button
                  className={copiedField === 'http' ? 'copied' : ''}
                  onClick={() => copyToClipboard(httpGatewayUrl, 'http')}
                >
                  {copiedField === 'http' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        </div>{/* end main-col */}

        {/* Sidebar: Editable fields */}
        <div className="assets-detail-sidebar">
          <div className="assets-detail-sidebar-card">
            <h3>Metadata</h3>

            <label className="assets-detail-sidebar-label">Alt Text</label>
            <input
              className="assets-detail-sidebar-input"
              type="text"
              placeholder="Describe the asset for accessibility"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />

            <label className="assets-detail-sidebar-label">Description</label>
            <textarea
              className="assets-detail-sidebar-textarea"
              placeholder="Internal notes about this asset"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="assets-detail-sidebar-label">Category</label>
            <select
              className="assets-detail-sidebar-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <label className="assets-detail-sidebar-label">Folder</label>
            <input
              className="assets-detail-sidebar-input"
              type="text"
              placeholder="e.g. brand/logos"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
            />
          </div>

          <div className="assets-detail-sidebar-card">
            <h3>Tags</h3>
            <div className="assets-detail-tag-list">
              {allTags.map((tag) => (
                <label key={tag.id} className="assets-detail-tag-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                  />
                  {tag.color && (
                    <span
                      className="assets-detail-tag-color"
                      style={{ background: tag.color }}
                    />
                  )}
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          <div className="assets-detail-sidebar-card">
            <h3>Actions</h3>

            {statusMsg && (
              <div className={`assets-detail-status ${statusMsg.type}`}>
                {statusMsg.text}
              </div>
            )}

            <div className="assets-detail-actions" style={{ marginTop: statusMsg ? 12 : 0 }}>
              <button
                className="assets-detail-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="assets-detail-actions" style={{ marginTop: 8 }}>
              {asset.url && asset.url !== '#' && (
                <a
                  className="assets-detail-download-btn"
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={asset.filename}
                  style={{ flex: 1 }}
                >
                  Download
                </a>
              )}
              <button
                className="assets-detail-delete-btn"
                onClick={() => setDeleteConfirm(true)}
                style={{ flex: 1 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div
          className="assets-admin-dialog-overlay"
          onClick={() => setDeleteConfirm(false)}
        >
          <div
            className="assets-admin-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete asset?</h3>
            <p>
              Are you sure you want to delete &ldquo;{asset.filename}&rdquo;?
              This action cannot be undone.
            </p>
            <div className="assets-admin-dialog-actions">
              <button
                className="assets-admin-dialog-cancel"
                onClick={() => setDeleteConfirm(false)}
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
    </>
  )
}
