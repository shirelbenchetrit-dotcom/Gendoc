'use client'

import { useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export default function ParametresPage() {
  const sigRef = useRef<SignatureCanvas>(null)
  const [stampPreview, setStampPreview] = useState<string | null>(null)
  const [currentSig, setCurrentSig] = useState<string | null>(null)
  const [currentStamp, setCurrentStamp] = useState<string | null>(null)
  const [isSigEmpty, setIsSigEmpty] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        setCurrentSig(d.admin_signature || null)
        setCurrentStamp(d.admin_stamp || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setStampPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')

    const body: Record<string, string | null> = {}
    if (!isSigEmpty && sigRef.current && !sigRef.current.isEmpty()) {
      body.admin_signature = sigRef.current.toDataURL('image/png')
    }
    if (stampPreview) {
      body.admin_stamp = stampPreview
    }

    if (Object.keys(body).length === 0) {
      setError('Aucune modification à enregistrer.')
      setSaving(false)
      return
    }

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.success) {
      if (body.admin_signature) setCurrentSig(body.admin_signature)
      if (body.admin_stamp) setCurrentStamp(body.admin_stamp)
      setSaved(true)
      sigRef.current?.clear()
      setIsSigEmpty(true)
      setStampPreview(null)
    } else {
      setError(data.error || 'Erreur lors de l\'enregistrement')
    }
    setSaving(false)
  }

  const handleDeleteSig = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_signature: null }),
    })
    setCurrentSig(null)
  }

  const handleDeleteStamp = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_stamp: null }),
    })
    setCurrentStamp(null)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Chargement...</div>

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Paramètres</h1>
        <p className="text-gray-400 text-sm mt-1">Configurez votre signature et tampon — ils apparaîtront automatiquement sur tous les documents générés.</p>
      </div>

      <div className="space-y-6">
        {/* Signature */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-1">Signature</h2>
          <p className="text-sm text-gray-400 mb-5">Dessinez votre signature ci-dessous. Elle remplacera la zone vide sur tous les PDFs.</p>

          {currentSig && (
            <div className="mb-4 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Signature actuelle :</p>
                <img src={currentSig} alt="Signature actuelle" className="h-12 object-contain" />
              </div>
              <button onClick={handleDeleteSig} className="text-xs text-red-400 hover:text-red-600 underline">Supprimer</button>
            </div>
          )}

          <label className="text-sm font-semibold text-gray-700 block mb-2">{currentSig ? 'Nouvelle signature :' : 'Votre signature :'}</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <SignatureCanvas
              ref={sigRef}
              penColor="#1e3a5f"
              canvasProps={{ width: 580, height: 160, className: 'w-full h-auto', style: { touchAction: 'none' } }}
              onBegin={() => setIsSigEmpty(false)}
            />
          </div>
          <button onClick={() => { sigRef.current?.clear(); setIsSigEmpty(true) }} className="text-xs text-gray-400 hover:text-gray-600 mt-1 underline">
            Effacer
          </button>
        </div>

        {/* Tampon */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-1">Tampon / cachet</h2>
          <p className="text-sm text-gray-400 mb-5">Importez une image de votre tampon officiel (PNG avec fond transparent recommandé).</p>

          {currentStamp && (
            <div className="mb-4 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Tampon actuel :</p>
                <img src={currentStamp} alt="Tampon actuel" className="h-16 object-contain" />
              </div>
              <button onClick={handleDeleteStamp} className="text-xs text-red-400 hover:text-red-600 underline">Supprimer</button>
            </div>
          )}

          <label className="cursor-pointer flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#38bdf8] transition text-sm text-gray-500 hover:text-[#38bdf8] w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {currentStamp ? 'Remplacer le tampon' : 'Importer un tampon'}
            <input type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
          </label>

          {stampPreview && (
            <div className="mt-3 flex items-center gap-3">
              <img src={stampPreview} alt="Aperçu tampon" className="h-16 object-contain border border-gray-100 rounded-lg p-1 bg-white" />
              <button onClick={() => setStampPreview(null)} className="text-xs text-red-400 hover:text-red-600 underline">Annuler</button>
            </div>
          )}
        </div>

        {/* Bouton sauvegarder */}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
        {saved && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">✓ Enregistré — vos documents utiliseront cette signature et ce tampon.</div>}

        <button
          onClick={handleSave}
          disabled={saving || (isSigEmpty && !stampPreview)}
          className="w-full bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5a8e] transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">⚠️ Étape requise en Supabase</p>
          <p className="text-blue-600 text-xs">Si cette page affiche une erreur, créez d&apos;abord la table <code className="bg-blue-100 px-1 rounded">settings</code> dans votre SQL Editor Supabase :</p>
          <pre className="mt-2 bg-white rounded p-2 text-xs text-gray-700 overflow-x-auto">{`CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
        </div>
      </div>
    </div>
  )
}
