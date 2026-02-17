'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, type ReactNode } from 'react'
import { PiChartBarBold, PiArticleBold, PiMegaphoneBold, PiImageSquareBold, PiCalendarBlankBold, PiGearBold, PiTrendUpBold, PiTargetBold, PiUsersBold, PiLightningBold, PiShieldCheckBold, PiStampBold, PiStorefrontBold, PiRobotBold, PiChatCircleDotsBold, PiChalkboardTeacherBold, PiCurrencyDollarBold, PiBellBold, PiHandshakeBold, PiCompassBold, PiCodeBold, PiChartLineUpBold, PiBinocularsBold } from 'react-icons/pi'
import BrandWordmark from '@/components/BrandWordmark'
import ThemeToggle from '@/components/ThemeToggle'
import ChatPanel from '@/components/admin/ChatPanel'

export default function AdminShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

  const navItems: { label: string; href: string; icon: ReactNode }[] = [
    { label: 'Dashboard', href: '/admin', icon: <PiChartBarBold /> },
    { label: 'Blog', href: '/admin/blog', icon: <PiArticleBold /> },
    { label: 'Social', href: '/admin/social', icon: <PiMegaphoneBold /> },
    { label: 'Trending', href: '/admin/trending', icon: <PiTrendUpBold /> },
    { label: 'AEO', href: '/admin/aeo', icon: <PiRobotBold /> },
    { label: 'Commerce', href: '/admin/commerce', icon: <PiStorefrontBold /> },
    { label: 'Workshops', href: '/admin/workshops', icon: <PiChalkboardTeacherBold /> },
    { label: 'Assets', href: '/admin/assets', icon: <PiImageSquareBold /> },
    { label: 'Calendar', href: '/admin/calendar', icon: <PiCalendarBlankBold /> },
    { label: 'Strategy', href: '/admin/strategy', icon: <PiCompassBold /> },
    { label: 'People', href: '/admin/people', icon: <PiUsersBold /> },
    { label: 'Activity', href: '/admin/people/activity', icon: <PiLightningBold /> },
    { label: 'Budget', href: '/admin/budget', icon: <PiCurrencyDollarBold /> },
    { label: 'Partnerships', href: '/admin/partnerships', icon: <PiHandshakeBold /> },
    { label: 'Community', href: '/admin/community', icon: <PiChatCircleDotsBold /> },
    { label: 'DevRel', href: '/admin/devrel', icon: <PiCodeBold /> },
    { label: 'Growth', href: '/admin/growth', icon: <PiChartLineUpBold /> },
    { label: 'Intel', href: '/admin/intel', icon: <PiBinocularsBold /> },
    { label: 'Brand', href: '/admin/brand', icon: <PiStampBold /> },
    { label: 'QA', href: '/admin/qa', icon: <PiShieldCheckBold /> },
    { label: 'Notifications', href: '/admin/notifications', icon: <PiBellBold /> },
    { label: 'Settings', href: '/admin/settings', icon: <PiGearBold /> },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <a href="/">
            <BrandWordmark height={44} />
          </a>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`admin-nav-item${item.href === '/admin' ? (pathname === '/admin' ? ' active' : '') : (pathname.startsWith(item.href) ? ' active' : '')}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar-email">{email}</span>
          <ThemeToggle />
          <button
            className="admin-topbar-logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </div>

      <ChatPanel />
    </div>
  )
}
