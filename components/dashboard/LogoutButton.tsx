'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      id="logout-btn"
      className="flex items-center gap-1.5 font-sans text-xs text-forest/40 hover:text-forest transition-colors"
    >
      <LogOut size={13} />
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  )
}
