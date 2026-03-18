import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TYPE_LABELS } from '@/lib/types'
import DemandeActions from '@/components/DemandeActions'

export default async function DemandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: demande } = await supabase
    .from('demandes')
    .select('*, profiles(*), notes(*)')
    .eq('id', id)
    .single()

  if (!demande) notFound()

  const profile = demande.profiles

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Retour</a>
        <h1 className="text-2xl font-bold text-[#1e3a5f] mt-2">
          {TYPE_LABELS[demande.type as keyof typeof TYPE_LABELS]}
        </h1>
        <p className="text-gray-500">
          Demande de {profile?.prenom} {profile?.nom} · {new Date(demande.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Infos élève */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">Informations de l'élève</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Nom complet', value: `${profile?.prenom} ${profile?.nom}` },
            { label: 'Date de naissance', value: profile?.date_naissance ? new Date(profile.date_naissance).toLocaleDateString('fr-FR') : '—' },
            { label: 'Nationalité', value: profile?.nationalite || '—' },
            { label: 'Formation', value: profile?.formation || '—' },
            { label: 'Classe', value: profile?.classe || '—' },
            { label: 'Année scolaire', value: profile?.annee_scolaire || '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-gray-400">{label}</p>
              <p className="text-gray-800 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Infos convention de stage */}
      {demande.type === 'convention_stage' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-semibold text-gray-800 mb-4">Organisme d'accueil</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Raison sociale', value: demande.organisme_nom },
              { label: 'N° Siret', value: demande.organisme_siret },
              { label: 'Adresse', value: demande.organisme_adresse },
              { label: 'Représenté par', value: demande.organisme_representant },
              { label: 'Type d\'exercice', value: demande.organisme_type },
              { label: 'Téléphone', value: demande.organisme_telephone },
              { label: 'Email', value: demande.organisme_email },
              { label: 'Dates du stage', value: demande.stage_debut && demande.stage_fin ? `${new Date(demande.stage_debut).toLocaleDateString('fr-FR')} → ${new Date(demande.stage_fin).toLocaleDateString('fr-FR')}` : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-gray-400">{label}</p>
                <p className="text-gray-800 font-medium">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message élève */}
      {demande.message_etudiant && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-blue-800 mb-1">Message de l'élève</p>
          <p className="text-sm text-blue-700">{demande.message_etudiant}</p>
        </div>
      )}

      {/* Actions admin */}
      <DemandeActions demande={demande} />
    </div>
  )
}
