'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import './community-subnav.css'

const tabs = [
  { label: 'Inbox', href: '/admin/community' },
  { label: 'Dashboard', href: '/admin/community/dashboard' },
  { label: 'Members', href: '/admin/community/members' },
  { label: 'Events', href: '/admin/community/events' },
  { label: 'Engagement', href: '/admin/community/engagement' },
  { label: 'Forums', href: '/admin/community/forums' },
]

export default function CommunitySubNav() {
  const pathname = usePathname()

  return (
    <nav className="community-sub-nav">
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/admin/community'
            ? pathname === '/admin/community'
            : pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`community-sub-nav-tab${isActive ? ' active' : ''}`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
