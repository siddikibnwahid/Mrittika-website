import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Leaf } from 'lucide-react'
import AdminView from '@/components/dashboard/AdminView'
import DeliveryView from '@/components/dashboard/DeliveryView'
import LogoutButton from '@/components/dashboard/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'staff'

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-cream/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Leaf size={14} className="text-gold" />
              <span className="font-serif text-xl font-bold text-forest">Mrittika</span>
            </Link>
            <div className="hidden sm:block w-px h-5 bg-border" />
            <span className="hidden sm:block font-sans text-xs text-forest/40 tracking-wider">
              {role === 'admin'
                ? 'Admin Dashboard'
                : role === 'delivery_manager'
                ? 'Delivery Dashboard'
                : 'Staff Portal'}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden sm:block font-sans text-xs text-forest/35">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {role === 'admin' ? (
          <AdminView />
        ) : role === 'delivery_manager' ? (
          <DeliveryView userId={user.id} />
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-px bg-gold mb-8" />
            <p className="font-serif text-3xl font-bold text-forest/40 mb-3">
              Access Pending
            </p>
            <p className="font-sans text-sm text-forest/30">
              Contact an administrator to assign your role.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
