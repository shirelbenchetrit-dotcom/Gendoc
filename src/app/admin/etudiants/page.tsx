import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Student } from '@/lib/types'
import { ImportStudentsModal } from '@/components/ImportStudentsModal'

export default async function EtudiantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('students')
    .select('*')
    .order('last_name', { ascending: true })

  if (q) {
    query = query.or(`last_name.ilike.%${q}%,first_name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: students, error } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Étudiants</h1>
          <p className="text-gray-500 text-sm mt-1">
            {students?.length ?? 0} étudiant{(students?.length ?? 0) > 1 ? 's' : ''} enregistré{(students?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportStudentsModal />
          <Link
            href="/admin/etudiants/nouveau"
            className="bg-[#1e3a5f] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2d5a8e] transition"
          >
            + Ajouter un étudiant
          </Link>
        </div>
      </div>

      {/* Recherche */}
      <form method="GET" className="mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Rechercher un étudiant..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] bg-white"
          />
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          Erreur lors du chargement : {error.message}
        </div>
      )}

      {!students || students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">Aucun étudiant trouvé</p>
          {q ? (
            <p className="text-gray-400 text-sm">
              Aucun résultat pour &quot;{q}&quot;.{' '}
              <Link href="/admin/etudiants" className="text-[#38bdf8] hover:underline">Voir tous les étudiants</Link>
            </p>
          ) : (
            <p className="text-gray-400 text-sm">
              Commencez par{' '}
              <Link href="/admin/etudiants/nouveau" className="text-[#38bdf8] hover:underline">ajouter un étudiant</Link>.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Étudiant</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Formation</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Université</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student: Student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-sm font-semibold">
                        {student.first_name[0]}{student.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.first_name} {student.last_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1e3a5f]/10 text-[#1e3a5f]">
                      {student.formation}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.universite || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.email || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/etudiants/${student.id}`}
                      className="text-[#38bdf8] hover:text-[#1e3a5f] text-sm font-semibold transition"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
