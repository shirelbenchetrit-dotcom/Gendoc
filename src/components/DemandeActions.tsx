'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Demande } from '@/lib/types'

export default function DemandeActions({ demande }: { demande: Demande }) {
  const [messageAdmin, setMessageAdmin] = useState(demande.message_admin || '')
  const [loading, setLoading] = useState<'valider' | 'refuser' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const updateStatut = async (statut: 'validee' | 'refusee') => {
    setLoading(statut === 'validee' ? 'valider' : 'refuser')

    await supabase.from('demandes').update({
      statut,
      message_admin: messageAdmin || null,
    }).eq('id', demande.id)

    router.refresh()
    setLoading(null)
  }

  if (demande.statut === 'validee') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-green-800">✅ Demande validée</p>
            {demande.message_admin && <p className="text-sm text-green-700 mt-1">{demande.message_admin}</p>}
          </div>
          <a href={`/api/pdf?id=${demande.id}`} target="_blank"
            className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2d5a8e] transition text-sm">
            Télécharger le PDF
          </a>
        </div>
      </div>
    )
  }

  if (demande.statut === 'refusee') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <p className="font-semibold text-red-800">❌ Demande refusée</p>
        {demande.message_admin && <p className="text-sm text-red-700 mt-1">Motif : {demande.message_admin}</p>}
        <button onClick={() => updateStatut('validee')}
          className="mt-4 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2d5a8e] transition">
          Revalider la demande
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Décision</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message pour l'élève (optionnel)
        </label>
        <textarea value={messageAdmin} onChange={(e) => setMessageAdmin(e.target.value)} rows={3}
          placeholder="Remarques, motif de refus..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition resize-none text-sm" />
      </div>

      <div className="flex gap-3">
        <button onClick={() => updateStatut('refusee')} disabled={!!loading}
          className="flex-1 border-2 border-red-200 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition disabled:opacity-50">
          {loading === 'refuser' ? 'Refus...' : '❌ Refuser'}
        </button>
        <button onClick={() => updateStatut('validee')} disabled={!!loading}
          className="flex-1 bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5a8e] transition disabled:opacity-50">
          {loading === 'valider' ? 'Validation...' : '✅ Valider et générer le PDF'}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Une fois validée, l'élève pourra télécharger le document PDF généré automatiquement.
      </p>
    </div>
  )
}
