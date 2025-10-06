import '../../styles.css'

export const metadata = {
  title: 'Alternate Futures - Building the Infrastructure for Human-Computer Alignment',
  description: 'Developing comprehensive standards framework and toolset that ensures AI technology serves human flourishing.',
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
        <link rel="preload" href="/assets/logo.svg" as="image" />
        <link rel="dns-prefetch" href="https://www.linkedin.com" />
        <link rel="dns-prefetch" href="https://x.com" />
      </head>
      <body>{children}</body>
    </html>
  )
}
