'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SignatureCanvas from 'react-signature-canvas'
import Link from 'next/link'
import { Student, DocumentType, DOCUMENT_LABELS, ConventionData } from '@/lib/types'

const EMPTY_CONVENTION: ConventionData = {
  organisme: '', siret: '', adresseOrganisme: '', representant: '',
  typeExercice: '', telephone: '', emailOrganisme: '', dateDebut: '', dateFin: '',
}

type ConvStep = 'form' | 'sign' | 'done'

export default function FicheEtudiantPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const sigRef = useRef<SignatureCanvas>(null)

  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<DocumentType | null>(null)
  const [error, setError] = useState('')

  const [showConvModal, setShowConvModal] = useState(false)
  const [convStep, setConvStep] = useState<ConvStep>('form')
  const [conventionForm, setConventionForm] = useState<ConventionData>(EMPTY_CONVENTION)
  const [sigIsEmpty, setSigIsEmpty] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [convResult, setConvResult] = useState<{ sent?: string[] } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('students').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) setError('Étudiant introuvable')
        else setStudent(data)
        setLoading(false)
      })
  }, [id])

  const downloadPDF = async (type: DocumentType, extra?: object) => {
    setGenerating(type)
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, studentId: id, ...extra }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur génération')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_${student?.last_name?.toLowerCase()}_${student?.first_name?.toLowerCase()}.pdf`
      document.body.appendChild(a); a.click()
      window.URL.revokeObjectURL(url); document.body.removeChild(a)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setGenerating(null)
    }
  }

  const handleDocClick = (type: DocumentType) => {
    if (type === 'convention_stage') {
      setConventionForm(EMPTY_CONVENTION)
      setConvStep('form')
      setConvResult(null)
      setSigIsEmpty(true)
      setShowConvModal(true)
    } else {
      downloadPDF(type)
    }
  }

  const handleConvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConventionForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFormNext = (e: React.FormEvent) => {
    e.preventDefault()
    setConvStep('sign')
    setSigIsEmpty(true)
    setTimeout(() => sigRef.current?.clear(), 50)
  }

  const handleSign = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return
    setSubmitting(true)
    const signature = sigRef.current.toDataURL('image/png')

    try {
      // 1. Créer la convention en DB (avec infos étudiant dénormalisées)
      const enrichedConvention = {
        ...conventionForm,
        studentFirstName: student?.first_name,
        studentLastName: student?.last_name,
        studentFormation: student?.formation,
        studentEmail: student?.email || '',
      }
      const createRes = await fetch('/api/conventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, conventionData: enrichedConvention }),
      })
      const conv = await createRes.json()
      if (!createRes.ok) throw new Error(conv.error)

      // 2. Signer en tant qu'admin → envoie les emails automatiquement
      const signRes = await fetch(`/api/conventions/${conv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature, role: 'admin' }),
      })
      const signData = await signRes.json()
      if (!signRes.ok) throw new Error(signData.error)

      // 3. Aussi télécharger le PDF localement
      downloadPDF('convention_stage', { conventionData: enrichedConvention })

      const sent = []
      if (conventionForm.emailOrganisme) sent.push(`organisme (${conventionForm.emailOrganisme})`)
      if (student?.email) sent.push(`étudiant (${student.email})`)
      setConvResult({ sent })
      setConvStep('done')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setSubmitting(false)
    }
  }

  const closeModal = () => {
    setShowConvModal(false)
    setConvStep('form')
    setConvResult(null)
  }

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Chargement...</div></div>

  if (error || !student) return (
    <div>
      <Link href="/admin/etudiants" className="text-sm text-gray-400 hover:text-gray-600">← Retour</Link>
      <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error || 'Étudiant introuvable'}</div>
    </div>
  )

  const docTypes: DocumentType[] = ['certificat_scolarite', 'convention_stage', 'attestation_presence', 'lettre_recommandation_fr', 'lettre_recommandation_en']

  const formValid = conventionForm.organisme && conventionForm.adresseOrganisme && conventionForm.representant && conventionForm.dateDebut && conventionForm.dateFin

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/etudiants" className="text-sm text-gray-400 hover:text-gray-600 transition">← Retour à la liste</Link>
        <h1 className="text-2xl font-bold text-[#1e3a5f] mt-2">{student.first_name} {student.last_name}</h1>
        <p className="text-gray-400 text-sm mt-0.5">Fiche étudiant</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-lg font-bold">
                {student.first_name[0]}{student.last_name[0]}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{student.first_name} {student.last_name}</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#1e3a5f]/10 text-[#1e3a5f] mt-1">{student.formation}</span>
              </div>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Email', value: student.email || '—' },
                { label: 'Date de naissance', value: student.date_naissance ? formatDate(student.date_naissance) : '—' },
                { label: 'Nationalité', value: student.nationalite || '—' },
                { label: 'Université', value: student.universite || '—' },
                { label: 'Prix de la formation', value: student.prix_formation || '—' },
                { label: "Date d'inscription", value: formatDate(student.date_inscription) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-gray-400 text-xs uppercase tracking-wide font-medium mb-0.5">{label}</dt>
                  <dd className="text-gray-700">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => router.push(`/admin/etudiants/${id}/modifier`)} className="w-full text-center text-sm text-gray-400 hover:text-[#1e3a5f] transition">
                Modifier les informations
              </button>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-1">Générer un document</h3>
            <p className="text-sm text-gray-400 mb-6">Cliquez sur un document pour le générer et le télécharger.</p>
            <div className="space-y-3">
              {docTypes.map((type) => (
                <button key={type} onClick={() => handleDocClick(type)} disabled={generating !== null}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-xl border border-gray-100 hover:border-[#38bdf8] hover:bg-blue-50/30 transition group disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1e3a5f]/5 flex items-center justify-center group-hover:bg-[#38bdf8]/10 transition">
                      <svg className="w-4 h-4 text-[#1e3a5f] group-hover:text-[#38bdf8] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800 text-sm">{DOCUMENT_LABELS[type]}</p>
                      {type === 'convention_stage' && (
                        <p className="text-xs text-[#38bdf8] mt-0.5">Signature électronique des 3 parties</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {generating === type
                      ? <span className="text-xs text-[#38bdf8] font-medium">Génération...</span>
                      : <svg className="w-4 h-4 text-gray-300 group-hover:text-[#38bdf8] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    }
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modale Convention ── */}
      {showConvModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

            {/* Header avec étapes */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-[#1e3a5f]">Convention de stage</h2>
                {convStep !== 'done' && (
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
              {convStep !== 'done' && (
                <div className="flex gap-2 items-center">
                  {[{ n: 1, label: 'Informations' }, { n: 2, label: 'Votre signature' }].map(({ n, label }) => {
                    const active = (n === 1 && convStep === 'form') || (n === 2 && convStep === 'sign')
                    const done = (n === 1 && convStep === 'sign')
                    return (
                      <div key={n} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${done ? 'bg-green-500 text-white' : active ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {done ? '✓' : n}
                        </div>
                        <span className={`text-xs font-medium ${active ? 'text-[#1e3a5f]' : 'text-gray-400'}`}>{label}</span>
                        {n < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Étape 1 : Formulaire ── */}
            {convStep === 'form' && (
              <form onSubmit={handleFormNext} className="p-6 space-y-5">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#b8962e] text-white text-xs flex items-center justify-center font-bold">1</span>
                    Organisme d&apos;accueil
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Structure *</label>
                      <input type="text" name="organisme" value={conventionForm.organisme} onChange={handleConvChange} required placeholder="ex: Cabinet médical Dr. Dupont" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Siret / Siren</label>
                        <input type="text" name="siret" value={conventionForm.siret} onChange={handleConvChange} placeholder="123 456 789 00012" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input type="text" name="telephone" value={conventionForm.telephone} onChange={handleConvChange} placeholder="06 12 34 56 78" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                      <input type="text" name="adresseOrganisme" value={conventionForm.adresseOrganisme} onChange={handleConvChange} required placeholder="12 rue de la Paix, 75001 Paris" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Représenté par *</label>
                      <input type="text" name="representant" value={conventionForm.representant} onChange={handleConvChange} required placeholder="Dr. Martin Sophie" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type et lieu d&apos;exercice</label>
                      <input type="text" name="typeExercice" value={conventionForm.typeExercice} onChange={handleConvChange} placeholder="Médecine générale — Paris 15e" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email de l&apos;organisme</label>
                      <input type="email" name="emailOrganisme" value={conventionForm.emailOrganisme} onChange={handleConvChange} placeholder="contact@cabinet.fr" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center font-bold">2</span>
                    Période du stage
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                      <input type="date" name="dateDebut" value={conventionForm.dateDebut} onChange={handleConvChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
                      <input type="date" name="dateFin" value={conventionForm.dateFin} onChange={handleConvChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-sm" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={!formValid} className="w-full bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5a8e] transition text-sm disabled:opacity-40">
                  Continuer → Signer
                </button>
              </form>
            )}

            {/* ── Étape 2 : Signature admin ── */}
            {convStep === 'sign' && (
              <div className="p-6 space-y-5">
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
                  Signez ci-dessous en tant que <strong>Diploma Santé</strong>. La convention sera ensuite envoyée par email à l&apos;organisme et à l&apos;étudiant pour qu&apos;ils signent à leur tour.
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Votre signature</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <SignatureCanvas
                      ref={sigRef}
                      penColor="#1e3a5f"
                      canvasProps={{ width: 480, height: 180, className: 'w-full h-auto', style: { touchAction: 'none' } }}
                      onBegin={() => setSigIsEmpty(false)}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-1">Signez avec votre souris ou votre doigt</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSign} disabled={sigIsEmpty || submitting}
                    className="flex-1 bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5a8e] transition text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                    {submitting ? 'Envoi en cours...' : 'Signer et envoyer les liens de signature'}
                  </button>
                  <button onClick={() => { sigRef.current?.clear(); setSigIsEmpty(true) }}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition text-sm">
                    Effacer
                  </button>
                </div>

                <button onClick={() => setConvStep('form')} className="w-full text-sm text-gray-400 hover:text-gray-600 transition py-1">
                  ← Retour
                </button>
              </div>
            )}

            {/* ── Étape 3 : Confirmation ── */}
            {convStep === 'done' && (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Convention signée !</h3>
                  <p className="text-sm text-gray-500 mt-1">Votre signature a été enregistrée et les liens de signature ont été envoyés à :</p>
                </div>
                {convResult?.sent?.length ? (
                  <div className="bg-gray-50 rounded-xl p-4 text-left space-y-1">
                    {convResult.sent.map(s => (
                      <p key={s} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                        {s}
                      </p>
                    ))}
                  </div>
                ) : null}
                <p className="text-xs text-gray-400">Suivez l&apos;état des signatures dans <Link href="/admin/conventions" className="text-[#38bdf8] hover:underline">l&apos;espace Conventions</Link></p>
                <button onClick={closeModal} className="w-full bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5a8e] transition text-sm">
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
