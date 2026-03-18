'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'

export default function StudentNav({ profile }: { profile: Profile }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/student" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#1e3a5f]">Diploma</span>
          <span className="text-xl font-bold text-[#38bdf8]">Santé</span>
          <span className="text-xs text-gray-400 ml-1">Gendoc</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">
            {profile.prenom} {profile.nom}
          </span>
          <button onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}
