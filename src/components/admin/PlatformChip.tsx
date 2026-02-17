'use client'

const PLATFORM_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  X: { bg: '#E8F4FD', color: '#1DA1F2', label: 'X' },
  BLUESKY: { bg: '#E8F0FE', color: '#0085FF', label: 'Bluesky' },
  MASTODON: { bg: '#ECEAFF', color: '#6364FF', label: 'Mastodon' },
  LINKEDIN: { bg: '#E8F0FE', color: '#0A66C2', label: 'LinkedIn' },
  REDDIT: { bg: '#FFF0E6', color: '#FF4500', label: 'Reddit' },
  DISCORD: { bg: '#ECEAFF', color: '#5865F2', label: 'Discord' },
  TELEGRAM: { bg: '#E8F4FD', color: '#26A5E4', label: 'Telegram' },
  THREADS: { bg: '#F3F4F6', color: '#000000', label: 'Threads' },
  INSTAGRAM: { bg: '#FDE8F0', color: '#E4405F', label: 'Instagram' },
  FACEBOOK: { bg: '#E8F0FE', color: '#1877F2', label: 'Facebook' },
}

export default function PlatformChip({ platform }: { platform: string }) {
  const s = PLATFORM_STYLES[platform] || { bg: '#F3F4F6', color: '#6B7280', label: platform }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '50px',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: '"Instrument Sans", sans-serif',
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  )
}
