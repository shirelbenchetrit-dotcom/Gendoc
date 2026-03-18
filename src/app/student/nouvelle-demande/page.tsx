'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { TYPE_LABELS } from '@/lib/types'
import { Suspense } from 'react'

function NouvelleDemandeForm() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') || 'certificat_scolarite'
  const [type, setType] = useState(typeParam)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Convention de stage fields
  const [organisme, setOrganisme] = useState({
    nom: '', siret: '', adresse: '', representant: '',
    type_exercice: '', telephone: '', email: '',
  })
  const [stageDates, setStageDates] = useState({ debut: '', fin: '' })

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Non connecté'); setLoading(false); return }

    const payload: Record<string, unknown> = {
      etudiant_id: user.id,
      type,
      message_etudiant: message || null,
    }

    if (type === 'convention_stage') {
      Object.assign(payload, {
        organisme_nom: organisme.nom,
        organisme_siret: organisme.siret,
        organisme_adresse: organisme.adresse,
        organisme_representant: organisme.representant,
        organisme_type: organisme.type_exercice,
        organisme_telephone: organisme.telephone,
        organisme_email: organisme.email,
        stage_debut: stageDates.debut || null,
        stage_fin: stageDates.fin || null,
      })
    }

    const { error: err } = await supabase.from('demandes').insert(payload)

    if (err) { setError('Erreur lors de l\'envoi'); setLoading(false); return }

    router.push('/student')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Nouvelle demande</h1>
        <p className="text-gray-500 mt-1">Votre demande sera examinée par l'équipe Diploma Santé</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de document</label>
            <div className="grid grid-cols-1 gap-3">
              {(['certificat_scolarite', 'bulletin_annuel', 'convention_stage'] as const).map((t) => (
                <label key={t} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${type === t ? 'border-[#38bdf8] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="text-[#38bdf8]" />
                  <span className="font-medium text-gray-800">{TYPE_LABELS[t]}</span>
                </label>
              ))}
            </div>
          </div>

          {type === 'convention_stage' && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-800">Informations de l'organisme d'accueil</h3>
              {[
                { name: 'nom', label: 'Raison sociale', placeholder: 'Hôpital Saint-Louis' },
                { name: 'siret', label: 'N° Siret / Siren', placeholder: '12345678900013' },
                { name: 'adresse', label: 'Adresse', placeholder: '1 Avenue de la Santé, 75010 Paris' },
                { name: 'representant', label: 'Représenté par', placeholder: 'Dr. Martin' },
                { name: 'type_exercice', label: 'Type et lieu d\'exercice', placeholder: 'Urgences - Service hospitalier' },
                { name: 'telephone', label: 'Téléphone', placeholder: '01 23 45 67 89' },
                { name: 'email', label: 'Email', placeholder: 'contact@hopital.fr' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={organisme[name as keyof typeof organisme]}
                    onChange={(e) => setOrganisme({ ...organisme, [name]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début du stage</label>
                  <input type="date" value={stageDates.debut} onChange={(e) => setStageDates({ ...stageDates, debut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin du stage</label>
                  <input type="date" value={stageDates.fin} onChange={(e) => setStageDates({ ...stageDates, fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optionnel)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
              placeholder="Précisions supplémentaires..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition resize-none text-sm" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()}
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5a8e] transition disabled:opacity-50">
              {loading ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NouvelleDemandeePage() {
  return (
    <Suspense>
      <NouvelleDemandeForm />
    </Suspense>
  )
}
