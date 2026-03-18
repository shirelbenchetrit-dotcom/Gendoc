import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TYPE_LABELS, STATUT_LABELS } from '@/lib/types'

const STATUT_COLORS = {
  en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  validee: 'bg-green-100 text-green-800 border-green-200',
  refusee: 'bg-red-100 text-red-800 border-red-200',
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: demandes } = await supabase
    .from('demandes')
    .select('*, profiles(nom, prenom, formation, classe)')
    .order('created_at', { ascending: false })

  const stats = {
    total: demandes?.length || 0,
    en_attente: demandes?.filter(d => d.statut === 'en_attente').length || 0,
    validee: demandes?.filter(d => d.statut === 'validee').length || 0,
    refusee: demandes?.filter(d => d.statut === 'refusee').length || 0,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Gérez les demandes de documents de vos élèves</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-800', bg: 'bg-white' },
          { label: 'En attente', value: stats.en_attente, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Validées', value: stats.validee, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Refusées', value: stats.refusee, color: 'text-red-700', bg: 'bg-red-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 shadow-sm border border-gray-100`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table des demandes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Toutes les demandes</h2>
        </div>
        {!demandes || demandes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>Aucune demande pour l'instant</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Élève</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {demandes.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {d.profiles?.prenom} {d.profiles?.nom}
                      </p>
                      <p className="text-sm text-gray-400">{d.profiles?.classe}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {TYPE_LABELS[d.type as keyof typeof TYPE_LABELS]}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(d.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUT_COLORS[d.statut as keyof typeof STATUT_COLORS]}`}>
                        {STATUT_LABELS[d.statut as keyof typeof STATUT_LABELS]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/demandes/${d.id}`}
                        className="text-sm text-[#38bdf8] font-medium hover:underline">
                        {d.statut === 'en_attente' ? 'Examiner →' : 'Voir →'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
