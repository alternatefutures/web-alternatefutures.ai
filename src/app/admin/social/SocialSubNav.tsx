'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  PiPencilSimpleLineBold,
  PiQueueBold,
  PiMegaphoneBold,
  PiTrayBold,
  PiBookmarksBold,
  PiChartBarBold,
  PiTrendUpBold,
} from 'react-icons/pi'
import type { ReactNode } from 'react'
import './social-subnav.css'

const tabs: { label: string; href: string; icon: ReactNode }[] = [
  { label: 'Composer', href: '/admin/social/composer', icon: <PiPencilSimpleLineBold /> },
  { label: 'Queue', href: '/admin/social/queue', icon: <PiQueueBold /> },
  { label: 'Trending', href: '/admin/social/trending', icon: <PiTrendUpBold /> },
  { label: 'Campaigns', href: '/admin/social/campaigns', icon: <PiMegaphoneBold /> },
  { label: 'Inbox', href: '/admin/social/inbox', icon: <PiTrayBold /> },
  { label: 'Library', href: '/admin/social/library', icon: <PiBookmarksBold /> },
  { label: 'Analytics', href: '/admin/social/analytics', icon: <PiChartBarBold /> },
]

export default function SocialSubNav() {
  const pathname = usePathname()

  return (
    <nav className="social-subnav">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`social-subnav-tab${isActive ? ' active' : ''}`}
          >
            <span className="social-subnav-icon">{tab.icon}</span>
            <span className="social-subnav-label">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
