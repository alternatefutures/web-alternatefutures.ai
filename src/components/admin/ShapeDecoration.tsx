'use client'

import { type CSSProperties } from 'react'

/* ===================================================================
   ShapeDecoration — Geometric decorative elements for admin UI

   Renders SVGs from /shapes/ as positioned, non-interactive decorations.
   All shapes are aria-hidden, pointer-events: none, and respect
   prefers-reduced-motion.
   =================================================================== */

// Available shape assets in /shapes/
const SHAPE_CATALOG = {
  // Stars
  'star-small-brand-blue': '/shapes/star-small-brand-blue.svg',
  'star-small-terracotta': '/shapes/star-small-terracotta.svg',
  'star-medium-apricot': '/shapes/star-medium-apricot.svg',
  'star-medium-brand-blue': '/shapes/star-medium-brand-blue.svg',
  // Circles
  'circle-small-apricot': '/shapes/circle-small-apricot.svg',
  'circle-medium-sky': '/shapes/circle-medium-sky.svg',
  'circle-xl-sky': '/shapes/circle-xl-sky.svg',
  // Rings
  'ring-small-terracotta': '/shapes/ring-small-terracotta.svg',
  'ring-medium-brand-blue': '/shapes/ring-medium-brand-blue.svg',
  'ring-large-medium-blue': '/shapes/ring-large-medium-blue.svg',
  // Waves
  'wave-sky-20': '/shapes/wave-sky-20.svg',
  'wave-brand-blue-10': '/shapes/wave-brand-blue-10.svg',
  'wave-apricot-30': '/shapes/wave-apricot-30.svg',
  'wave-terracotta-10': '/shapes/wave-terracotta-10.svg',
  'wave-dark-blue-30': '/shapes/wave-dark-blue-30.svg',
  // Decorative groups
  'decorative-medium-brand': '/shapes/decorative-medium-brand.svg',
  'decorative-medium-cool': '/shapes/decorative-medium-cool.svg',
  'decorative-medium-warm': '/shapes/decorative-medium-warm.svg',
  // Composed patterns (Hana's optimized)
  'pattern-constellation': '/shapes/pattern-constellation.svg',
  'pattern-wave-divider': '/shapes/pattern-wave-divider.svg',
  'pattern-card-scatter': '/shapes/pattern-card-scatter.svg',
} as const

export type ShapeName = keyof typeof SHAPE_CATALOG

// --- Individual shape element ---

interface ShapeElementProps {
  shape: ShapeName
  className?: string
  style?: CSSProperties
  size?: number | string
}

export function ShapeElement({ shape, className, style, size }: ShapeElementProps) {
  const src = SHAPE_CATALOG[shape]
  const sizeValue = typeof size === 'number' ? `${size}px` : size

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      role="presentation"
      draggable={false}
      className={`af-shape-element ${className || ''}`}
      style={{
        ...(sizeValue ? { width: sizeValue, height: 'auto' } : {}),
        ...style,
      }}
    />
  )
}

// --- Wave section divider ---

type WaveVariant = 'sky' | 'brand-blue' | 'apricot' | 'terracotta' | 'dark-blue'

const WAVE_MAP: Record<WaveVariant, ShapeName> = {
  'sky': 'wave-sky-20',
  'brand-blue': 'wave-brand-blue-10',
  'apricot': 'wave-apricot-30',
  'terracotta': 'wave-terracotta-10',
  'dark-blue': 'wave-dark-blue-30',
}

interface WaveDividerProps {
  variant?: WaveVariant
  className?: string
  flip?: boolean
}

export function WaveDivider({ variant = 'sky', className, flip }: WaveDividerProps) {
  const shapeName = WAVE_MAP[variant]
  const src = SHAPE_CATALOG[shapeName]

  return (
    <div
      className={`af-wave-divider af-wave-${variant} ${className || ''}`}
      aria-hidden="true"
      role="presentation"
      style={flip ? { transform: 'scaleY(-1)' } : undefined}
    >
      <img src={src} alt="" draggable={false} />
    </div>
  )
}

// --- Constellation field (dashboard hero) ---

interface ConstellationFieldProps {
  className?: string
}

export function ConstellationField({ className }: ConstellationFieldProps) {
  return (
    <div
      className={`af-constellation-field ${className || ''}`}
      aria-hidden="true"
      role="presentation"
    >
      {/* Large ring — top-right, mostly hidden */}
      <img
        src={SHAPE_CATALOG['ring-large-medium-blue']}
        alt=""
        draggable={false}
        className="af-constellation-shape af-constellation-ring-outer"
      />
      {/* Medium circle — bottom-right */}
      <img
        src={SHAPE_CATALOG['circle-medium-sky']}
        alt=""
        draggable={false}
        className="af-constellation-shape af-constellation-circle"
      />
      {/* Star — upper area focal sparkle */}
      <img
        src={SHAPE_CATALOG['star-medium-apricot']}
        alt=""
        draggable={false}
        className="af-constellation-shape af-constellation-star"
      />
      {/* Small star — secondary accent */}
      <img
        src={SHAPE_CATALOG['star-small-brand-blue']}
        alt=""
        draggable={false}
        className="af-constellation-shape af-constellation-star-small"
      />
      {/* Ring — bottom-left depth */}
      <img
        src={SHAPE_CATALOG['ring-medium-brand-blue']}
        alt=""
        draggable={false}
        className="af-constellation-shape af-constellation-ring-inner"
      />
    </div>
  )
}

// --- Empty state decoration ---

type EmptyStateTheme = 'brand' | 'cool' | 'warm'

const EMPTY_STATE_MESSAGES: Record<string, string> = {
  dashboard: 'A blank canvas waits for your first mark',
  blog: 'Stories gather here when you\'re ready to tell them',
  social: 'Connect your voices to this space',
  calendar: 'Time opens its doors to your plans',
  assets: 'Your artifacts will find their place',
  trending: 'The currents will reveal themselves soon',
}

interface EmptyStateDecorationProps {
  page: keyof typeof EMPTY_STATE_MESSAGES
  theme?: EmptyStateTheme
  heading?: string
  message?: string
  children?: React.ReactNode
  className?: string
}

export function EmptyStateDecoration({
  page,
  theme = 'brand',
  heading,
  message,
  children,
  className,
}: EmptyStateDecorationProps) {
  return (
    <div className={`af-empty-state ${className || ''}`}>
      <div className="af-empty-state-decoration" aria-hidden="true" role="presentation">
        <img
          src={SHAPE_CATALOG['pattern-constellation']}
          alt=""
          draggable={false}
          className="af-empty-state-pattern"
        />
      </div>
      {heading && <h2 className="af-empty-state-heading">{heading}</h2>}
      <p className="af-empty-state-message">
        {message || EMPTY_STATE_MESSAGES[page] || EMPTY_STATE_MESSAGES.dashboard}
      </p>
      <div className="af-empty-state-kintsugi" aria-hidden="true" />
      {children && <div className="af-empty-state-actions">{children}</div>}
    </div>
  )
}
