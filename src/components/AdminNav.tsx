'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'

export default function AdminNav({ profile }: { profile: Profile }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-[#1e3a5f] text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold">Diploma</span>
          <span className="text-xl font-bold text-[#38bdf8]">Santé</span>
          <span className="text-xs bg-[#38bdf8] text-[#1e3a5f] px-2 py-0.5 rounded-full font-semibold ml-1">Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200 hidden sm:block">
            {profile.prenom} {profile.nom}
          </span>
          <button onClick={handleLogout}
            className="text-sm text-blue-300 hover:text-white transition">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}
