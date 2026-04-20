'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  PiUsersBold,
  PiShieldCheckBold,
  PiTreeStructureBold,
  PiClockCounterClockwiseBold,
  PiBellBold,
  PiPlugsConnectedBold,
  PiLinkBold,
  PiLockKeyBold,
  PiKeyBold,
  PiWebhooksLogoBold,
  PiClipboardTextBold,
} from 'react-icons/pi'
import type { ReactNode } from 'react'
import './settings-subnav.css'

const tabs: { label: string; href: string; icon: ReactNode }[] = [
  { label: 'Team', href: '/admin/settings/team', icon: <PiUsersBold /> },
  { label: 'Approvals', href: '/admin/settings/approvals', icon: <PiShieldCheckBold /> },
  { label: 'Rules', href: '/admin/settings/rules', icon: <PiTreeStructureBold /> },
  { label: 'History', href: '/admin/settings/history', icon: <PiClockCounterClockwiseBold /> },
  { label: 'Notifications', href: '/admin/settings/notifications', icon: <PiBellBold /> },
  { label: 'Connections', href: '/admin/settings/connections', icon: <PiPlugsConnectedBold /> },
  { label: 'UTM', href: '/admin/settings/utm', icon: <PiLinkBold /> },
  { label: 'RBAC', href: '/admin/settings/rbac', icon: <PiLockKeyBold /> },
  { label: 'SSO', href: '/admin/settings/sso', icon: <PiKeyBold /> },
  { label: 'Webhooks', href: '/admin/settings/webhooks', icon: <PiWebhooksLogoBold /> },
  { label: 'Audit', href: '/admin/settings/audit', icon: <PiClipboardTextBold /> },
]

export default function SettingsSubNav() {
  const pathname = usePathname()

  return (
    <nav className="settings-subnav">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`settings-subnav-tab${isActive ? ' active' : ''}`}
          >
            <span className="settings-subnav-icon">{tab.icon}</span>
            <span className="settings-subnav-label">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
