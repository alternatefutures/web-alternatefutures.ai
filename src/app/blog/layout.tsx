import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './blog.css'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on decentralized cloud, AI agents, Web3 hosting, and the future of infrastructure from the Alternate Futures team.',
  openGraph: {
    title: 'Blog | Alternate Futures',
    description:
      'Insights on decentralized cloud, AI agents, Web3 hosting, and the future of infrastructure.',
    type: 'website',
  },
  alternates: {
    types: {
      'application/rss+xml': '/blog/rss.xml',
    },
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="blog-page-wrapper">
      <Header activePage="blog" />
      <main className="blog-main">{children}</main>
      <Footer variant="cream" />
    </div>
  )
}
