import Image from 'next/image'

interface BrandWordmarkProps {
  height?: number
  className?: string
  /** 'default' uses the original SVG colors; 'peach' applies a warm peach tint; 'gold' applies a rich gold tint for dark backgrounds */
  variant?: 'default' | 'peach' | 'gold'
}

/** Aspect ratio from SVG viewBox (606.42 x 134.298) */
const ASPECT_RATIO = 606.42 / 134.298

const VARIANT_CLASSES: Record<string, string> = {
  peach: 'brand-wordmark--peach',
  gold: 'brand-wordmark--gold',
}

export default function BrandWordmark({ height = 40, className, variant = 'default' }: BrandWordmarkProps) {
  const width = Math.round(height * ASPECT_RATIO)
  const variantClass = VARIANT_CLASSES[variant] ?? ''
  const combinedClass = [className, variantClass].filter(Boolean).join(' ')

  return (
    <Image
      src="/landing/title-union.svg"
      alt="Alternate Futures"
      width={width}
      height={height}
      className={combinedClass || undefined}
      priority
      style={{ height, width: 'auto', objectFit: 'contain' }}
    />
  )
}
