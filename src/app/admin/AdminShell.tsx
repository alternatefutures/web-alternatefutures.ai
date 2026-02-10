'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'

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

  const navItems = [
    { label: 'Blog', href: '/admin/blog', icon: '\u270D' },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <a href="/">Alternate Futures</a>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`admin-nav-item${pathname.startsWith(item.href) ? ' active' : ''}`}
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
    </div>
  )
}
