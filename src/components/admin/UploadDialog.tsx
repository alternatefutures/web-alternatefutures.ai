'use client'

import { useState, useRef, useCallback } from 'react'
import { useDialog } from '@/hooks/useDialog'
import type { AssetCategory, UploadProgress } from '@/lib/assets-api'

interface UploadDialogProps {
  open: boolean
  onClose: () => void
  onUpload: (files: FileList, metadata: {
    category?: AssetCategory
    folder?: string
    altText?: string
    description?: string
  }) => void
  uploadProgress: UploadProgress[]
}

const CATEGORIES: { value: AssetCategory | ''; label: string }[] = [
  { value: '', label: 'Auto-detect' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'BRAND', label: 'Brand' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'OTHER', label: 'Other' },
]

export default function UploadDialog({ open, onClose, onUpload, uploadProgress }: UploadDialogProps) {
  const dialogRef = useDialog(open, onClose)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [category, setCategory] = useState<AssetCategory | ''>('')
  const [folder, setFolder] = useState('')
  const [altText, setAltText] = useState('')
  const [description, setDescription] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isUploading = uploadProgress.some(
    (p) => p.status === 'uploading' || p.status === 'processing',
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      setSelectedFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files)
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (!selectedFiles || selectedFiles.length === 0) return
    onUpload(selectedFiles, {
      category: category || undefined,
      folder: folder || undefined,
      altText: altText || undefined,
      description: description || undefined,
    })
  }, [selectedFiles, category, folder, altText, description, onUpload])

  const handleClose = useCallback(() => {
    if (!isUploading) {
      setSelectedFiles(null)
      setCategory('')
      setFolder('')
      setAltText('')
      setDescription('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      onClose()
    }
  }, [isUploading, onClose])

  if (!open) return null

  return (
    <div className="upload-dialog-overlay" onClick={handleClose}>
      <div className="upload-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="upload-dialog-title" onClick={(e) => e.stopPropagation()}>
        <div className="upload-dialog-header">
          <h3 id="upload-dialog-title">Upload Assets</h3>
          <button className="upload-dialog-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div
          className={`upload-dialog-dropzone${dragOver ? ' drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-dialog-dropzone-icon">&#8682;</div>
          <div className="upload-dialog-dropzone-text">
            Drag and drop files here, or <strong>browse</strong>
          </div>
          <div className="upload-dialog-dropzone-hint">
            Images, documents, videos, and more
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="upload-dialog-file-input"
          multiple
          onChange={handleFileSelect}
        />

        {selectedFiles && selectedFiles.length > 0 && (
          <div className="upload-dialog-selected">
            <div className="upload-dialog-selected-label">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </div>
            <div className="upload-dialog-file-list">
              {Array.from(selectedFiles).map((f, i) => (
                <div key={i} className="upload-dialog-file-item">
                  {f.name} ({(f.size / 1024).toFixed(1)} KB)
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadProgress.length > 0 && (
          <div className="upload-dialog-progress-list">
            {uploadProgress.map((p) => (
              <div key={p.fileId} className="upload-dialog-progress-item">
                <div className="upload-dialog-progress-header">
                  <span className="upload-dialog-progress-name">{p.filename}</span>
                  <span className="upload-dialog-progress-pct">
                    {p.status === 'complete'
                      ? 'Done'
                      : p.status === 'error'
                        ? 'Error'
                        : p.status === 'processing'
                          ? 'Processing...'
                          : `${Math.round(p.progress)}%`}
                  </span>
                </div>
                <div className="upload-dialog-progress-bar">
                  <div
                    className={`upload-dialog-progress-fill${
                      p.status === 'complete' ? ' complete' : ''
                    }${p.status === 'error' ? ' error' : ''}`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                {p.error && (
                  <div className="upload-dialog-progress-error">{p.error}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="upload-dialog-field">
          <label className="upload-dialog-label">Category</label>
          <select
            className="upload-dialog-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as AssetCategory | '')}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="upload-dialog-field">
          <label className="upload-dialog-label">Folder</label>
          <input
            className="upload-dialog-input"
            type="text"
            placeholder="e.g. brand/logos"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
          />
        </div>

        <div className="upload-dialog-field">
          <label className="upload-dialog-label">Alt Text</label>
          <input
            className="upload-dialog-input"
            type="text"
            placeholder="Describe the asset for accessibility"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />
        </div>

        <div className="upload-dialog-field">
          <label className="upload-dialog-label">Description</label>
          <textarea
            className="upload-dialog-textarea"
            placeholder="Internal notes about this asset"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="upload-dialog-actions">
          <button
            className="upload-dialog-cancel-btn"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            className="upload-dialog-upload-btn"
            onClick={handleSubmit}
            disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}
