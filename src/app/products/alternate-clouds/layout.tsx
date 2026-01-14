import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alternate Clouds - Alternate Futures',
  description: 'Ship apps on distributed infrastructure in minutes. Host anything on distributed nodes keeping you up even when centralized services are down.',
}

export default function AlternateCloudsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
