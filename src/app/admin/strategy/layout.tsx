'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  PiTargetBold,
  PiMapPinBold,
  PiFlagBold,
  PiGridFourBold,
  PiLightningBold,
  PiFileTextBold,
} from 'react-icons/pi'
import './strategy-admin.css'

const SUBNAV_ITEMS = [
  { label: 'OKRs', href: '/admin/strategy/okrs', icon: <PiTargetBold /> },
  { label: 'Roadmap', href: '/admin/strategy/roadmap', icon: <PiMapPinBold /> },
  { label: 'Initiatives', href: '/admin/strategy/initiatives', icon: <PiFlagBold /> },
  { label: 'Alignment', href: '/admin/strategy/alignment', icon: <PiGridFourBold /> },
  { label: 'Execution', href: '/admin/strategy/execution', icon: <PiLightningBold /> },
  { label: 'Reports', href: '/admin/strategy/reports', icon: <PiFileTextBold /> },
]

export default function StrategyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <>
      <nav className="strategy-subnav">
        {SUBNAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/admin/strategy/okrs'
              ? pathname === '/admin/strategy/okrs'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`strategy-subnav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
      {children}
    </>
  )
}
