import { cookies } from 'next/headers'
import { getUserFromCookies } from '@/lib/auth'
import AdminShell from './AdminShell'
import './admin.css'

export const metadata = {
  title: 'Admin | Alternate Futures',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const user = await getUserFromCookies(cookieStore)

  return (
    <AdminShell email={user?.email || 'admin'}>
      {children}
    </AdminShell>
  )
}
