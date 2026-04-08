import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AdminProvider } from '@/lib/admin-context'
import { getSession } from '@/lib/auth'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <AdminProvider isAdmin={!!session}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </AdminProvider>
  )
}
