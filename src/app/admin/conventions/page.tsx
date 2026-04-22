'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Convention, STATUS_COLORS, ConventionStatus } from '@/lib/types'

interface ConventionRow extends Convention {
  students: { first_name: string; last_name: string; formation: string; email: string | null }
}

type SignFilter = 'all' | 'waiting_organisme' | 'waiting_student' | 'completed'

const SIGN_FILTERS: { value: SignFilter; label: string; desc: string }[] = [
  { value: 'all',               label: 'Toutes',                  desc: '' },
  { value: 'waiting_organisme', label: '⏳ Attente organisme',     desc: 'Organisme n\'a pas encore signé' },
  { value: 'waiting_student',   label: '⏳ Attente étudiant',      desc: 'Étudiant n\'a pas encore signé' },
  { value: 'completed',         label: '✓ Complètes',             desc: 'Les 3 parties ont signé' },
]

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StepDot({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
        {done ? '✓' : '·'}
      </div>
      <span className={`text-[10px] font-medium ${done ? 'text-green-600' : 'text-gray-300'}`}>{label}</span>
    </div>
  )
}

export default function ConventionsPage() {
  const [conventions, setConventions] = useState<ConventionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [signFilter, setSignFilter] = useState<SignFilter>('all')

  useEffect(() => {
    fetch('/api/conventions')
      .then(r => r.json())
      .then(d => { setConventions(d || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return conventions.filter(conv => {
      // Filtre recherche
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        const fullName = `${conv.students.first_name} ${conv.students.last_name}`.toLowerCase()
        const email = (conv.students.email || conv.convention_data.studentEmail || '').toLowerCase()
        if (!fullName.includes(q) && !email.includes(q)) return false
      }

      // Filtre signature
      const adminSigned = !!conv.admin_signature
      const orgSigned = !!conv.organisme_signature
      const stuSigned = !!conv.student_signature

      if (signFilter === 'waiting_organisme') return adminSigned && !orgSigned
      if (signFilter === 'waiting_student')   return adminSigned && orgSigned && !stuSigned
      if (signFilter === 'completed')         return adminSigned && orgSigned && stuSigned
      return true
    })
  }, [conventions, search, signFilter])

  const counts = useMemo(() => ({
    all: conventions.length,
    waiting_organisme: conventions.filter(c => !!c.admin_signature && !c.organisme_signature).length,
    waiting_student:   conventions.filter(c => !!c.admin_signature && !!c.organisme_signature && !c.student_signature).length,
    completed:         conventions.filter(c => !!c.admin_signature && !!c.organisme_signature && !!c.student_signature).length,
  }), [conventions])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Chargement...</div></div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Conventions de stage</h1>
        <p className="text-gray-400 text-sm mt-1">Suivi des signatures pour chaque convention générée.</p>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 space-y-3">
        {/* Recherche */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8] placeholder-gray-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">✕</button>
          )}
        </div>

        {/* Filtres signature */}
        <div className="flex flex-wrap gap-2">
          {SIGN_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setSignFilter(f.value)}
              title={f.desc}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                signFilter === f.value
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                signFilter === f.value ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          {conventions.length === 0 ? (
            <>
              <p className="text-gray-400 text-sm">Aucune convention générée pour l&apos;instant.</p>
              <Link href="/admin/etudiants" className="text-[#38bdf8] text-sm mt-2 inline-block hover:underline">Aller à la liste des étudiants →</Link>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Aucune convention ne correspond à votre recherche.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((conv) => {
            const status = conv.status as ConventionStatus
            const convData = conv.convention_data
            const adminSigned = !!conv.admin_signature
            const orgSigned = !!conv.organisme_signature
            const stuSigned = !!conv.student_signature

            return (
              <div key={conv.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-bold text-gray-900">
                        {conv.students.first_name} {conv.students.last_name}
                      </h2>
                      <span className="text-xs text-gray-400">{conv.students.formation}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {convData.organisme} · {fmtDate(convData.dateDebut)} → {fmtDate(convData.dateFin)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Créée le {fmtDate(conv.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
                      {status === 'admin_signed' && '⏳ Attente organisme'}
                      {status === 'organisme_signed' && '⏳ Attente étudiant'}
                      {status === 'completed' && '✓ Signé par toutes les parties'}
                      {status === 'draft' && 'Brouillon'}
                    </span>
                    {!adminSigned && (
                      <Link
                        href={`/admin/conventions/${conv.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#b8962e] text-white hover:bg-[#a07a20] transition"
                      >
                        ✍ Signer
                      </Link>
                    )}
                    {adminSigned && status !== 'completed' && (
                      <Link
                        href={`/admin/conventions/${conv.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                      >
                        Voir →
                      </Link>
                    )}
                    {status === 'completed' && (
                      <a
                        href={`/api/conventions/${conv.id}/download`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#1e3a5f] text-white hover:bg-[#16304f] transition"
                      >
                        ⬇ PDF signé
                      </a>
                    )}
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mt-4 flex items-center gap-2">
                  <StepDot done={adminSigned} label="Diploma Santé" />
                  <div className={`flex-1 h-0.5 ${adminSigned && orgSigned ? 'bg-green-400' : adminSigned ? 'bg-yellow-300' : 'bg-gray-100'}`} />
                  <StepDot done={orgSigned} label="Organisme" />
                  <div className={`flex-1 h-0.5 ${orgSigned && stuSigned ? 'bg-green-400' : orgSigned ? 'bg-yellow-300' : 'bg-gray-100'}`} />
                  <StepDot done={stuSigned} label="Étudiant" />
                </div>

                {/* Dates + emails de relance */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-4 text-xs text-gray-400">
                    {conv.admin_signed_at && <span>Diploma : {fmtDate(conv.admin_signed_at)}</span>}
                    {conv.organisme_signed_at && <span>Organisme : {fmtDate(conv.organisme_signed_at)}</span>}
                    {conv.student_signed_at && <span>Étudiant : {fmtDate(conv.student_signed_at)}</span>}
                  </div>

                  {/* Liens de relance rapide */}
                  <div className="flex gap-2">
                    {adminSigned && !orgSigned && convData.emailOrganisme && (
                      <a
                        href={`mailto:${convData.emailOrganisme}?subject=Convention de stage à signer — ${conv.students.first_name} ${conv.students.last_name}&body=Bonjour,\n\nNous vous rappelons que la convention de stage de ${conv.students.first_name} ${conv.students.last_name} est en attente de votre signature.\n\nCordialement,\nDiploma Santé`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 transition"
                        title={`Relancer ${convData.emailOrganisme}`}
                      >
                        ✉ Relancer organisme
                      </a>
                    )}
                    {orgSigned && !stuSigned && (convData.studentEmail || conv.students.email) && (
                      <a
                        href={`mailto:${convData.studentEmail || conv.students.email}?subject=Convention de stage à signer — Diploma Santé&body=Bonjour ${conv.students.first_name},\n\nNous vous rappelons que votre convention de stage est en attente de votre signature.\n\nCordialement,\nDiploma Santé`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 transition"
                        title={`Relancer ${convData.studentEmail || conv.students.email}`}
                      >
                        ✉ Relancer étudiant
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
