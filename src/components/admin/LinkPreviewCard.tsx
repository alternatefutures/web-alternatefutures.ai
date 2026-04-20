'use client'

import { useState, useEffect } from 'react'

interface OgData {
  title: string
  description: string
  image: string
  url: string
  siteName: string
}

interface LinkPreviewCardProps {
  url: string
}

export default function LinkPreviewCard({ url }: LinkPreviewCardProps) {
  const [ogData, setOgData] = useState<OgData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)

    fetch(`/api/og-preview?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          if (data.error) {
            setError(true)
          } else {
            setOgData(data)
          }
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [url])

  if (loading) {
    return (
      <div style={{
        border: '1px solid var(--color-border, #E5E7EB)',
        borderRadius: '8px',
        padding: '16px',
        fontFamily: '"Instrument Sans", sans-serif',
        fontSize: '13px',
        color: 'var(--color-text-gray, #6B7280)',
      }}>
        Loading preview...
      </div>
    )
  }

  if (error || !ogData) {
    return null
  }

  return (
    <div style={{
      border: '1px solid var(--color-border, #E5E7EB)',
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'var(--color-white, #fff)',
      transition: 'border-color 0.2s ease',
    }}>
      {ogData.image && (
        <div style={{
          width: '100%',
          height: '140px',
          overflow: 'hidden',
          background: '#f0f0f0',
        }}>
          <img
            src={ogData.image}
            alt={ogData.title || ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
      <div style={{ padding: '12px 14px' }}>
        {ogData.siteName && (
          <div style={{
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: '11px',
            color: 'var(--color-text-gray, #6B7280)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}>
            {ogData.siteName}
          </div>
        )}
        {ogData.title && (
          <div style={{
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-dark, #1F2937)',
            marginBottom: '4px',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {ogData.title}
          </div>
        )}
        {ogData.description && (
          <div style={{
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: '12px',
            color: 'var(--color-text-gray, #6B7280)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {ogData.description}
          </div>
        )}
      </div>
    </div>
  )
}
