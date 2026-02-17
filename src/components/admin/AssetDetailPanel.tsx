'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { MarketingAsset, AssetVersion } from '@/lib/assets-api'
import {
  formatFileSize,
  pinAssetToIpfs,
  fetchAssetVersions,
  uploadAssetVersion,
  setCurrentVersion,
  getIpfsGatewayUrl,
} from '@/lib/assets-api'

interface AssetDetailPanelProps {
  asset: MarketingAsset
  token: string
  onClose: () => void
  onAssetUpdate: (asset: MarketingAsset) => void
}

function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    IMAGE: 'Image', VIDEO: 'Video', AUDIO: 'Audio',
    DOCUMENT: 'Document', BRAND: 'Brand Asset',
    PRESENTATION: 'Presentation', OTHER: 'Other',
  }
  return map[cat] || cat
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}

export default function AssetDetailPanel({
  asset,
  token,
  onClose,
  onAssetUpdate,
}: AssetDetailPanelProps) {
  const [currentAsset, setCurrentAsset] = useState(asset)
  const [versions, setVersions] = useState<AssetVersion[]>([])
  const [pinning, setPinning] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadChangelog, setUploadChangelog] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    setCurrentAsset(asset)
  }, [asset])

  const loadVersions = useCallback(async () => {
    const v = await fetchAssetVersions(token, currentAsset.id)
    setVersions(v)
  }, [token, currentAsset.id])

  useEffect(() => {
    loadVersions()
  }, [loadVersions])

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handlePin = async () => {
    setPinning(true)
    try {
      const updated = await pinAssetToIpfs(token, currentAsset.id)
      setCurrentAsset(updated)
      onAssetUpdate(updated)
    } catch {
      // pinning failed — asset state will reflect FAILED status
    } finally {
      setPinning(false)
    }
  }

  const handleUploadVersion = async () => {
    if (!selectedFile || !uploadChangelog.trim()) return
    setUploading(true)
    try {
      await uploadAssetVersion(token, currentAsset.id, selectedFile, uploadChangelog.trim())
      await loadVersions()
      setShowUploadForm(false)
      setUploadChangelog('')
      setSelectedFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleSetCurrent = async (versionId: string) => {
    const version = await setCurrentVersion(token, currentAsset.id, versionId)
    await loadVersions()
    // Update asset with version data
    const updated = {
      ...currentAsset,
      filename: version.filename,
      url: version.url,
      cid: version.cid,
      size: version.fileSize,
    }
    setCurrentAsset(updated)
    onAssetUpdate(updated)
  }

  const isPinned = currentAsset.pinStatus === 'PINNED'
  const hasThumbnail = currentAsset.thumbnailUrl && currentAsset.mimeType.startsWith('image/')

  return (
    <>
      <div className="library-panel-overlay" onClick={onClose} />
      <div className="library-panel">
        <button className="library-panel-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {/* Preview */}
        <div className="library-panel-preview">
          {hasThumbnail ? (
            <img src={currentAsset.thumbnailUrl!} alt={currentAsset.altText || currentAsset.filename} />
          ) : (
            <span style={{
              fontFamily: 'var(--af-font-architect)',
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--af-stone-300)',
              textTransform: 'uppercase',
            }}>
              {currentAsset.mimeType.split('/')[1]?.slice(0, 4) || 'FILE'}
            </span>
          )}
          <span className="library-panel-preview-badge">
            {getCategoryLabel(currentAsset.category)}
          </span>
        </div>

        {/* Body */}
        <div className="library-panel-body">
          <h2 className="library-panel-title">{currentAsset.originalFilename}</h2>

          {/* Metadata */}
          <div className="library-panel-meta">
            <div className="library-panel-meta-item">
              <span className="library-panel-meta-label">Type</span>
              <span className="library-panel-meta-value">{currentAsset.mimeType}</span>
            </div>
            <div className="library-panel-meta-item">
              <span className="library-panel-meta-label">Size</span>
              <span className="library-panel-meta-value">{formatFileSize(currentAsset.size)}</span>
            </div>
            {currentAsset.width && currentAsset.height && (
              <div className="library-panel-meta-item">
                <span className="library-panel-meta-label">Dimensions</span>
                <span className="library-panel-meta-value">{currentAsset.width} &times; {currentAsset.height}</span>
              </div>
            )}
            <div className="library-panel-meta-item">
              <span className="library-panel-meta-label">Uploaded</span>
              <span className="library-panel-meta-value">{formatDate(currentAsset.createdAt)}</span>
            </div>
            {currentAsset.folder && (
              <div className="library-panel-meta-item">
                <span className="library-panel-meta-label">Folder</span>
                <span className="library-panel-meta-value">{currentAsset.folder}</span>
              </div>
            )}
            <div className="library-panel-meta-item">
              <span className="library-panel-meta-label">Used</span>
              <span className="library-panel-meta-value">{currentAsset.usageCount} times</span>
            </div>
          </div>

          {/* Tags */}
          {currentAsset.tags.length > 0 && (
            <div className="library-panel-tags">
              {currentAsset.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="library-panel-tag"
                  style={{
                    background: tag.color ? `${tag.color}12` : 'var(--af-ultra-ghost)',
                    borderColor: tag.color ? `${tag.color}40` : 'var(--af-ultra-ink)',
                    color: tag.color || 'var(--af-ultra)',
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Copy URLs */}
          <div className="library-panel-section">
            <h3 className="library-panel-section-title">URLs</h3>

            {currentAsset.url && currentAsset.url !== '#' && (
              <div className="library-panel-url-row">
                <span className="library-panel-url-label">HTTP</span>
                <span className="library-panel-url-value">{currentAsset.url}</span>
                <button
                  className={`library-panel-copy-btn${copiedField === 'http' ? ' copied' : ''}`}
                  onClick={() => handleCopy(currentAsset.url, 'http')}
                >
                  {copiedField === 'http' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}

            {isPinned && currentAsset.cid && (
              <>
                <div className="library-panel-url-row">
                  <span className="library-panel-url-label">IPFS</span>
                  <span className="library-panel-url-value">{getIpfsGatewayUrl(currentAsset.cid)}</span>
                  <button
                    className={`library-panel-copy-btn${copiedField === 'ipfs' ? ' copied' : ''}`}
                    onClick={() => handleCopy(getIpfsGatewayUrl(currentAsset.cid!), 'ipfs')}
                  >
                    {copiedField === 'ipfs' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div style={{ marginBottom: 'var(--af-space-breath)' }}>
                  <span className="library-panel-meta-label">CID</span>
                  <div className="library-panel-cid">{currentAsset.cid}</div>
                </div>
              </>
            )}
          </div>

          {/* Pin Status */}
          <div className="library-panel-section">
            <h3 className="library-panel-section-title">IPFS Pinning</h3>
            <div className="library-panel-pin-status">
              <span className={`library-pin-dot ${currentAsset.pinStatus.toLowerCase()}`} />
              <span className="library-panel-pin-label">
                {currentAsset.pinStatus === 'PINNED' && 'Pinned to IPFS'}
                {currentAsset.pinStatus === 'UNPINNED' && 'Not pinned'}
                {currentAsset.pinStatus === 'PINNING' && 'Pinning...'}
                {currentAsset.pinStatus === 'FAILED' && 'Pin failed'}
              </span>
            </div>

            {(currentAsset.pinStatus === 'UNPINNED' || currentAsset.pinStatus === 'FAILED') && (
              <button
                className="library-panel-pin-btn"
                onClick={handlePin}
                disabled={pinning}
              >
                {pinning ? (
                  <>
                    <span className="library-spinner" />{' '}
                    Pinning...
                  </>
                ) : (
                  'Pin to IPFS'
                )}
              </button>
            )}
          </div>

          {/* Version History */}
          <div className="library-panel-section">
            <h3 className="library-panel-section-title">
              Version History
              {versions.length > 0 && ` (${versions.length})`}
            </h3>

            {versions.length > 0 ? (
              <div className="library-version-timeline">
                {versions.map((v) => (
                  <div key={v.id} className={`library-version-item${v.isCurrent ? ' current' : ''}`}>
                    <div className="library-version-dot" />
                    <div className="library-version-header">
                      <span className="library-version-number">v{v.version}</span>
                      {v.isCurrent && <span className="library-version-current-badge">Current</span>}
                      <span className="library-version-date">{formatDateShort(v.uploadedAt)}</span>
                    </div>
                    <div className="library-version-changelog">{v.changelog}</div>
                    {v.cid && (
                      <div className="library-panel-cid" style={{ marginTop: '2px', fontSize: '10px' }}>
                        {v.cid.slice(0, 16)}...
                      </div>
                    )}
                    {!v.isCurrent && (
                      <button
                        className="library-version-set-btn"
                        onClick={() => handleSetCurrent(v.id)}
                      >
                        Set as Current
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{
                fontFamily: 'var(--af-font-poet)',
                fontStyle: 'italic',
                fontSize: 'var(--af-type-xs)',
                color: 'var(--af-stone-400)',
                margin: 0,
              }}>
                No version history yet
              </p>
            )}

            {/* Upload new version */}
            <div className="library-upload-version">
              {!showUploadForm ? (
                <button
                  className="library-upload-version-btn"
                  onClick={() => setShowUploadForm(true)}
                >
                  + Upload New Version
                </button>
              ) : (
                <div className="library-upload-form">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    style={{
                      fontFamily: 'var(--af-font-architect)',
                      fontSize: 'var(--af-type-xs)',
                      color: 'var(--af-stone-700)',
                    }}
                  />
                  <textarea
                    className="library-upload-changelog"
                    placeholder="What changed in this version..."
                    value={uploadChangelog}
                    onChange={(e) => setUploadChangelog(e.target.value)}
                    rows={2}
                  />
                  <div className="library-upload-actions">
                    <button
                      className="library-upload-submit"
                      onClick={handleUploadVersion}
                      disabled={!selectedFile || !uploadChangelog.trim() || uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                      className="library-upload-cancel"
                      onClick={() => {
                        setShowUploadForm(false)
                        setUploadChangelog('')
                        setSelectedFile(null)
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {currentAsset.description && (
            <div className="library-panel-section">
              <h3 className="library-panel-section-title">Description</h3>
              <p style={{
                fontFamily: 'var(--af-font-architect)',
                fontSize: 'var(--af-type-sm)',
                color: 'var(--af-stone-700)',
                lineHeight: 'var(--af-leading-body)',
                margin: 0,
              }}>
                {currentAsset.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
