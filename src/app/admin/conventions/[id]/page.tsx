'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'

interface ConventionData {
  organisme: string
  representant: string
  emailOrganisme: string
  dateDebut: string
  dateFin: string
  studentFirstName?: string
  studentLastName?: string
  studentFormation?: string
  adminStamp?: string
}

interface Convention {
  id: string
  status: string
  convention_data: ConventionData
  admin_signature: string | null
  admin_signed_at: string | null
  organisme_signature: string | null
  organisme_signed_at: string | null
  student_signature: string | null
  student_signed_at: string | null
  students: { first_name: string; last_name: string; formation: string; email: string | null } | null
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function SignedBadge({ date }: { date: string | null }) {
  if (!date) return <span className="text-xs text-gray-300 font-medium">Non signé</span>
  return <span className="text-xs text-green-600 font-semibold">✓ Signé le {fmtDate(date)}</span>
}

export default function ConventionDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const sigRef = useRef<SignatureCanvas>(null)

  const [conv, setConv] = useState<Convention | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(true)
  const [stampPreview, setStampPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    fetch(`/api/conventions/${id}`)
      .then(r => r.json())
      .then(d => { setConv(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setStampPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSign = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return
    setSubmitting(true)
    setError('')

    const signature = sigRef.current.toDataURL('image/png')

    const res = await fetch(`/api/conventions/${id}/admin-sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature, stamp: stampPreview || undefined }),
    })
    const data = await res.json()

    if (data.success) {
      setDone(true)
      load()
    } else {
      setError(data.error || 'Erreur lors de la signature')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Chargement...</div>
  )
  if (!conv) return (
    <div className="text-center py-24 text-gray-400">Convention introuvable.</div>
  )

  const c = conv.convention_data
  const studentName = c.studentFirstName
    ? `${c.studentFirstName} ${c.studentLastName}`
    : conv.students ? `${conv.students.first_name} ${conv.students.last_name}` : '—'

  const alreadySigned = !!conv.admin_signature

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition">
          ← Retour
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Convention — {studentName}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{c.organisme} · {fmtDate(c.dateDebut)} → {fmtDate(c.dateFin)}</p>
        </div>
      </div>

      {/* Statut des signatures */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">État des signatures</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wide">Diploma Santé</span>
            <SignedBadge date={conv.admin_signed_at} />
            {conv.admin_signature && (
              <img src={conv.admin_signature} alt="Signature admin" className="mt-2 h-10 object-contain opacity-70 border border-gray-100 rounded" />
            )}
            {conv.convention_data.adminStamp && (
              <img src={conv.convention_data.adminStamp} alt="Tampon admin" className="mt-1 h-10 object-contain opacity-70 border border-gray-100 rounded" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wide">Organisme d'accueil</span>
            <SignedBadge date={conv.organisme_signed_at} />
            {conv.organisme_signature && (
              <img src={conv.organisme_signature} alt="Signature organisme" className="mt-2 h-10 object-contain opacity-70 border border-gray-100 rounded" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wide">Étudiant(e)</span>
            <SignedBadge date={conv.student_signed_at} />
            {conv.student_signature && (
              <img src={conv.student_signature} alt="Signature étudiant" className="mt-2 h-10 object-contain opacity-70 border border-gray-100 rounded" />
            )}
          </div>
        </div>
      </div>

      {/* Zone de signature admin */}
      {alreadySigned ? (
        done ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold text-green-700">Convention signée et tamponnée !</p>
            <p className="text-sm text-green-600 mt-1">Votre signature et tampon ont bien été enregistrés.</p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <p className="text-sm text-blue-700 font-medium">Vous avez déjà signé cette convention le {fmtDate(conv.admin_signed_at)}.</p>
            <a
              href={`/api/conventions/${id}/download`}
              className="inline-block mt-3 px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-semibold hover:bg-[#2d5a8e] transition"
            >
              ⬇ Télécharger le PDF signé
            </a>
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div>
            <h2 className="font-bold text-gray-800 mb-1">Votre signature (Diploma Santé)</h2>
            <p className="text-sm text-gray-400">Signez dans le cadre ci-dessous avec votre souris ou votre doigt.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          {/* Pad de signature */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Signature *</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <SignatureCanvas
                ref={sigRef}
                penColor="#1e3a5f"
                canvasProps={{
                  width: 640,
                  height: 180,
                  className: 'w-full h-auto',
                  style: { touchAction: 'none' }
                }}
                onBegin={() => setIsEmpty(false)}
              />
            </div>
            <button
              onClick={() => { sigRef.current?.clear(); setIsEmpty(true) }}
              className="text-xs text-gray-400 hover:text-gray-600 mt-1 underline"
            >
              Effacer la signature
            </button>
          </div>

          {/* Upload tampon */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Tampon / cachet <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <div className="flex items-start gap-4">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#38bdf8] transition text-sm text-gray-500 hover:text-[#38bdf8]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Importer une image de tampon
                <input type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
              </label>
              {stampPreview && (
                <div className="flex items-center gap-3">
                  <img src={stampPreview} alt="Tampon" className="h-14 object-contain border border-gray-100 rounded-lg p-1 bg-white" />
                  <button
                    onClick={() => setStampPreview(null)}
                    className="text-xs text-red-400 hover:text-red-600 underline"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">PNG, JPG ou SVG recommandé. Fond transparent de préférence.</p>
          </div>

          {/* Bouton signer */}
          <button
            onClick={handleSign}
            disabled={isEmpty || submitting}
            className="w-full bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5a8e] transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? 'Enregistrement...' : 'Signer la convention en tant que Diploma Santé'}
          </button>
        </div>
      )}
    </div>
  )
}
