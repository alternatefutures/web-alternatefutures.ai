import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

export const runtime = 'edge'

const SOURCE_COLORS: Record<string, string> = {
  HACKER_NEWS: '#FF6600',
  REDDIT: '#FF4500',
  PRODUCT_HUNT: '#DA552F',
  DEV_TO: '#0A0A0A',
  X: '#1DA1F2',
}

const SOURCE_LABELS: Record<string, string> = {
  HACKER_NEWS: 'Hacker News',
  REDDIT: 'Reddit',
  PRODUCT_HUNT: 'Product Hunt',
  DEV_TO: 'dev.to',
  X: 'X / Twitter',
}

const SOURCE_ICONS: Record<string, string> = {
  HACKER_NEWS: 'Y',
  REDDIT: 'R',
  PRODUCT_HUNT: 'P',
  DEV_TO: 'D',
  X: 'X',
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const title = sp.get('title') || 'Untitled'
  const source = sp.get('source') || 'HACKER_NEWS'
  const score = sp.get('score') || '0'
  const comments = sp.get('comments') || '0'
  const velocity = sp.get('velocity') || '0'
  const author = sp.get('author') || ''
  const time = sp.get('time') || ''

  const sourceColor = SOURCE_COLORS[source] || '#888'
  const sourceLabel = SOURCE_LABELS[source] || source
  const sourceIcon = SOURCE_ICONS[source] || '?'

  const vel = parseFloat(velocity)
  const heatColor =
    vel >= 80 ? '#BE4200' : vel >= 40 ? '#C4860A' : vel >= 15 ? '#5B8A72' : '#8A8479'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#FAF8F5',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Heat bar */}
        <div style={{ height: 6, background: heatColor, width: '100%' }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '36px 40px 32px',
            flex: 1,
          }}
        >
          {/* Source row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: sourceColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              {sourceIcon}
            </div>
            <span style={{ fontSize: 14, color: '#8A8479', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {sourceLabel}
            </span>
            {author && (
              <span style={{ fontSize: 13, color: '#A8A29E', marginLeft: 4 }}>by {author}</span>
            )}
            {time && (
              <span style={{ fontSize: 13, color: '#A8A29E', marginLeft: 'auto' }}>{time}</span>
            )}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#1C1917',
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
              marginBottom: 24,
              flex: 1,
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            {title}
          </div>

          {/* Metrics row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              borderTop: '2px solid #E8E4DE',
              paddingTop: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: '#57534E', fontWeight: 600 }}>
              <span style={{ fontSize: 13 }}>&#9650;</span>
              {parseInt(score).toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: '#57534E', fontWeight: 600 }}>
              <span style={{ fontSize: 13 }}>&#128172;</span>
              {comments}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                fontWeight: 700,
                color: heatColor,
                padding: '3px 10px',
                borderRadius: 20,
                background:
                  vel >= 80
                    ? 'rgba(190,66,0,0.1)'
                    : vel >= 40
                      ? 'rgba(196,134,10,0.1)'
                      : 'rgba(91,138,114,0.1)',
              }}
            >
              {vel.toFixed(1)}/hr
            </div>
            <div
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                color: '#A8A29E',
                fontWeight: 500,
              }}
            >
              via alternatefutures.ai
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 420,
    },
  )
}
