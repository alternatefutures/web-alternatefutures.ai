'use client'

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT: { bg: '#FEF3C7', color: '#92400E', label: 'Draft' },
  PUBLISHED: { bg: '#D1FAE5', color: '#065F46', label: 'Published' },
  ARCHIVED: { bg: '#F3F4F6', color: '#6B7280', label: 'Archived' },
}

export default function StatusChip({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.DRAFT

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
