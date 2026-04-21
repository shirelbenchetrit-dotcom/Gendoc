'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'
import { ConventionData } from '@/lib/types'
import { Student } from '@/lib/types'

interface ConventionInfo {
  id: string
  role: 'organisme' | 'student'
  convention_data: ConventionData
  student: Student
  status: string
  alreadySigned?: boolean
}

function fmtDate(d: string) {
  const parts = d.split('T')[0].split('-')
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return d
}

export default function SignerPage() {
  const params = useParams()
  const token = params.token as string
  const sigRef = useRef<SignatureCanvas>(null)

  const [info, setInfo] = useState<ConventionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    fetch(`/api/sign/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else if (d.alreadySigned) setDone(true)
        else setInfo(d)
        setLoading(false)
      })
      .catch(() => { setError('Erreur réseau'); setLoading(false) })
  }, [token])

  const handleClear = () => {
    sigRef.current?.clear()
    setIsEmpty(true)
  }

  const handleSign = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return
    setSubmitting(true)
    const signature = sigRef.current.toDataURL('image/png')

    const res = await fetch(`/api/sign/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature }),
    })
    const data = await res.json()
    if (data.success) setDone(true)
    else setError(data.error || 'Erreur lors de la signature')
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Chargement...</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-lg font-bold text-gray-800 mb-2">Lien invalide</h1>
        <p className="text-gray-500 text-sm">{error}</p>
        <p className="text-gray-400 text-sm mt-4">Contactez Diploma Santé : <a href="mailto:contact@diploma-sante.fr" className="text-[#38bdf8]">contact@diploma-sante.fr</a></p>
      </div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Convention signée !</h1>
        <p className="text-gray-500 text-sm">Votre signature a bien été enregistrée. Diploma Santé vous contactera pour la suite.</p>
        <p className="text-gray-400 text-xs mt-6">Diploma Santé — 85 Avenue Ledru Rollin, 75012 Paris</p>
      </div>
    </div>
  )

  if (!info) return null

  const { convention_data: conv, student, role } = info
  const signerName = role === 'organisme' ? conv.representant : `${student.first_name} ${student.last_name}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] py-5 px-6 text-center">
        <span className="text-2xl font-bold text-white">Diploma </span>
        <span className="text-2xl font-bold text-[#38bdf8]">Santé</span>
        <p className="text-[#94b8d4] text-xs mt-1">la prépa médecine</p>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Info convention */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-[#1e3a5f] mb-1">Convention de stage</h1>
          <p className="text-sm text-gray-400 mb-5">
            {role === 'organisme' ? 'Signature de l\'organisme d\'accueil' : 'Signature de l\'étudiant(e)'}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">Étudiant(e)</span>
              <p className="font-medium text-gray-800 mt-0.5">{student.first_name} {student.last_name}</p>
              <p className="text-gray-500 text-xs">{student.formation}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">Organisme d'accueil</span>
              <p className="font-medium text-gray-800 mt-0.5">{conv.organisme}</p>
              <p className="text-gray-500 text-xs">{conv.representant}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">Début du stage</span>
              <p className="font-medium text-gray-800 mt-0.5">{fmtDate(conv.dateDebut)}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">Fin du stage</span>
              <p className="font-medium text-gray-800 mt-0.5">{fmtDate(conv.dateFin)}</p>
            </div>
          </div>
        </div>

        {/* Zone de signature */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-1">Votre signature</h2>
          <p className="text-sm text-gray-400 mb-5">
            Signez dans le cadre ci-dessous avec votre souris ou votre doigt.
            En signant, vous acceptez les termes de la convention de stage.
          </p>

          <div className="relative">
            <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <SignatureCanvas
                ref={sigRef}
                penColor="#1e3a5f"
                canvasProps={{
                  width: 560,
                  height: 200,
                  className: 'w-full h-auto',
                  style: { touchAction: 'none' }
                }}
                onBegin={() => setIsEmpty(false)}
              />
            </div>
            <p className="text-xs text-gray-300 text-center mt-2">— Zone de signature —</p>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSign}
              disabled={isEmpty || submitting}
              className="flex-1 bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5a8e] transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? 'Envoi...' : `Signer en tant que ${signerName}`}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition text-sm"
            >
              Effacer
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">
          Diploma Santé — 85 Avenue Ledru Rollin, 75012 Paris<br />
          En cas de problème : <a href="mailto:contact@diploma-sante.fr" className="text-[#38bdf8]">contact@diploma-sante.fr</a>
        </p>
      </div>
    </div>
  )
}
