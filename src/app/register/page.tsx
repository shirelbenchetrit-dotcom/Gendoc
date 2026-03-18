'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FORMATIONS = [
  "PAES - FR/EU Préparation à l'Admission en Études de Santé - Présentiel",
  "PAES - FR/EU Préparation à l'Admission en Études de Santé - Distanciel",
  'MMOPK - Préparation Masso-Kinésithérapie - Présentiel',
  'MMOPK - Préparation Masso-Kinésithérapie - Distanciel',
  'Passerelle IFSI - Formation infirmière',
]

const CLASSES = ['PAES', 'MMOPK', 'IFSI', 'Passerelle']

export default function RegisterPage() {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    date_naissance: '',
    nationalite: 'Française',
    formation: FORMATIONS[0],
    classe: 'PAES',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message || 'Erreur lors de la création du compte')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      date_naissance: form.date_naissance || null,
      nationalite: form.nationalite,
      formation: form.formation,
      classe: form.classe,
      role: 'student',
    })

    if (profileError) {
      setError('Erreur lors de la création du profil')
      setLoading(false)
      return
    }

    router.push('/student')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] flex items-center justify-center p-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-block mb-2">
            <span className="text-3xl font-bold text-[#1e3a5f]">Diploma</span>
            <span className="text-3xl font-bold text-[#38bdf8]"> Santé</span>
          </div>
          <p className="text-gray-500 text-sm">la prépa médecine</p>
          <h1 className="text-2xl font-semibold text-gray-800 mt-3">Créer mon compte</h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input name="nom" type="text" value={form.nom} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition"
                placeholder="Dupont" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input name="prenom" type="text" value={form.prenom} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition"
                placeholder="Marie" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition"
              placeholder="votre@email.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition"
              placeholder="Minimum 6 caractères" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input name="date_naissance" type="date" value={form.date_naissance} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
              <input name="nationalite" type="text" value={form.nationalite} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Formation</label>
            <select name="formation" value={form.formation} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition">
              {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
            <select name="classe" value={form.classe} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5a8e] transition disabled:opacity-50">
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#38bdf8] font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
