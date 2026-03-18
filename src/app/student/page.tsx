import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TYPE_LABELS, STATUT_LABELS } from '@/lib/types'

const STATUT_COLORS = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  validee: 'bg-green-100 text-green-800',
  refusee: 'bg-red-100 text-red-800',
}

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: demandes } = await supabase
    .from('demandes')
    .select('*')
    .eq('etudiant_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">
          Bonjour, {profile?.prenom} 👋
        </h1>
        <p className="text-gray-500 mt-1">Gérez vos demandes de documents administratifs</p>
      </div>

      {/* Cartes de demande */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { type: 'certificat_scolarite', icon: '📋', desc: 'Attestation d\'inscription pour l\'année en cours' },
          { type: 'bulletin_annuel', icon: '📊', desc: 'Relevé de notes et appréciations' },
          { type: 'convention_stage', icon: '🏥', desc: 'Document pour votre stage en structure de soin' },
        ].map(({ type, icon, desc }) => (
          <Link key={type} href={`/student/nouvelle-demande?type=${type}`}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#38bdf8] hover:shadow-md transition group">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-semibold text-[#1e3a5f] group-hover:text-[#38bdf8] transition">
              {TYPE_LABELS[type as keyof typeof TYPE_LABELS]}
            </h3>
            <p className="text-gray-500 text-sm mt-1">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Liste des demandes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Mes demandes</h2>
        </div>
        {!demandes || demandes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📂</div>
            <p>Aucune demande pour l'instant</p>
            <p className="text-sm mt-1">Cliquez sur un document ci-dessus pour commencer</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {demandes.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{TYPE_LABELS[d.type as keyof typeof TYPE_LABELS]}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {d.message_admin && d.statut === 'refusee' && (
                    <p className="text-sm text-red-600 mt-1">Motif : {d.message_admin}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUT_COLORS[d.statut as keyof typeof STATUT_COLORS]}`}>
                    {STATUT_LABELS[d.statut as keyof typeof STATUT_LABELS]}
                  </span>
                  {d.statut === 'validee' && (
                    <a href={`/api/pdf?id=${d.id}`} target="_blank"
                      className="text-sm text-[#38bdf8] font-medium hover:underline">
                      Télécharger
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
