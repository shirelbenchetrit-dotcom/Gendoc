'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const FORMATIONS = ['PASS', 'LAS', 'PAES', 'LSPS', 'MMOPK', 'Autre']

export default function NouvelEtudiantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    formation: 'PASS',
    universite: '',
    date_inscription: '',
    date_naissance: '',
    nationalite: '',
    prix_formation: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('students').insert([{
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || null,
      formation: form.formation,
      universite: form.universite || null,
      date_inscription: form.date_inscription || null,
      date_naissance: form.date_naissance || null,
      nationalite: form.nationalite || null,
      prix_formation: form.prix_formation || null,
    }])

    if (error) {
      setError("Erreur lors de la création : " + error.message)
      setLoading(false)
      return
    }

    router.push('/admin/etudiants')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/etudiants" className="text-sm text-gray-400 hover:text-gray-600 transition">
          ← Retour à la liste
        </Link>
        <h1 className="text-2xl font-bold text-[#1e3a5f] mt-2">Ajouter un étudiant</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input
                type="date"
                name="date_naissance"
                value={form.date_naissance}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
              <input
                type="text"
                name="nationalite"
                value={form.nationalite}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
                placeholder="ex: Française"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
              placeholder="etudiant@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formation *</label>
              <select
                name="formation"
                value={form.formation}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] bg-white"
              >
                {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Université</label>
              <input
                type="text"
                name="universite"
                value={form.universite}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
                placeholder="ex: Paris Cité"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix de la formation</label>
              <input
                type="text"
                name="prix_formation"
                value={form.prix_formation}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
                placeholder="ex: 2 500 €"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;inscription</label>
              <input
                type="date"
                name="date_inscription"
                value={form.date_inscription}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1e3a5f] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2d5a8e] transition disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <Link
              href="/admin/etudiants"
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
