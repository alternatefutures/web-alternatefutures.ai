import '../../styles.css'
import '../styles/design-tokens.css'

export const metadata = {
  title: 'Alternate Futures - Building the Infrastructure for Human-Computer Alignment',
  description: 'Developing comprehensive standards framework and toolset that ensures AI technology serves human flourishing.',
  referrer: 'no-referrer',
  other: {
    'X-DNS-Prefetch-Control': 'off',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/InstrumentSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/InstrumentSans-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/InstrumentSans-SemiBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/InstrumentSerif-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/InstrumentSerif-Italic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/logo.svg" as="image" />
      </head>
      <body>{children}</body>
    </html>
  )
}
