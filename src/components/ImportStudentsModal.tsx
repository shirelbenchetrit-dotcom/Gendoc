'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ParsedStudent {
  first_name: string
  last_name: string
  email: string
  formation: string
  universite: string
  date_inscription: string
  date_naissance: string
  nationalite: string
  prix_formation: string
  _errors: string[]
}

// Normalise un header de colonne CSV
function normalizeHeader(h: string): string {
  return h.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève accents
    .replace(/[^a-z0-9_]/g, '_')
}

// Mapping des noms de colonnes vers les champs internes
const COLUMN_MAP: Record<string, string> = {
  prenom: 'first_name', firstname: 'first_name', first_name: 'first_name',
  nom: 'last_name', lastname: 'last_name', last_name: 'last_name',
  email: 'email', courriel: 'email',
  formation: 'formation',
  universite: 'universite', universite_: 'universite',
  date_inscription: 'date_inscription',
  date_naissance: 'date_naissance',
  nationalite: 'nationalite', nationalite_: 'nationalite',
  prix_formation: 'prix_formation', prix: 'prix_formation',
}

function parseCSV(text: string): ParsedStudent[] {
  // Enlever BOM UTF-8
  const clean = text.replace(/^\uFEFF/, '')
  const lines = clean.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  // Détecter le séparateur (virgule ou point-virgule)
  const sep = lines[0].includes(';') ? ';' : ','

  // Parser une ligne CSV en tenant compte des guillemets
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (c === sep && !inQuotes) {
        result.push(cur.trim()); cur = ''
      } else {
        cur += c
      }
    }
    result.push(cur.trim())
    return result
  }

  const headers = parseLine(lines[0]).map(h => {
    const norm = normalizeHeader(h)
    return COLUMN_MAP[norm] || norm
  })

  return lines.slice(1).map(line => {
    const cells = parseLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = cells[i] || '' })

    const errors: string[] = []
    if (!row.first_name) errors.push('Prénom manquant')
    if (!row.last_name) errors.push('Nom manquant')
    if (!row.formation) errors.push('Formation manquante')

    return {
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      email: row.email || '',
      formation: row.formation || '',
      universite: row.universite || '',
      date_inscription: row.date_inscription || '',
      date_naissance: row.date_naissance || '',
      nationalite: row.nationalite || '',
      prix_formation: row.prix_formation || '',
      _errors: errors,
    }
  }).filter(r => r.first_name || r.last_name || r.email) // ignorer les lignes vides
}

const CSV_TEMPLATE = `prenom;nom;email;formation;universite;date_inscription;date_naissance;nationalite;prix_formation
Marie;Dupont;marie.dupont@email.com;PASS;Sorbonne;2024-09-01;2005-03-15;Française;
Lucas;Martin;lucas.martin@email.com;LAS Médecine;Paris 5;2024-09-01;2004-11-22;Française;`

export function ImportStudentsModal() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [students, setStudents] = useState<ParsedStudent[]>([])
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      setStudents(parsed)
      setStep('preview')
    }
    reader.readAsText(file, 'UTF-8')
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const downloadTemplate = () => {
    const blob = new Blob(['\uFEFF' + CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'modele_import_etudiants.csv'
    a.click(); URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    const valid = students.filter(s => s._errors.length === 0)
    setImporting(true)
    try {
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: valid }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult({ imported: data.imported })
      setStep('done')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur import')
    } finally {
      setImporting(false)
    }
  }

  const reset = () => {
    setStudents([]); setStep('upload'); setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const close = () => { setOpen(false); setTimeout(reset, 300) }

  const validCount = students.filter(s => s._errors.length === 0).length
  const errorCount = students.filter(s => s._errors.length > 0).length

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Importer CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-[#1e3a5f] text-lg">Importer des étudiants</h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {step === 'upload' && 'Téléchargez le modèle, remplissez-le et importez-le'}
                  {step === 'preview' && `${students.length} ligne${students.length > 1 ? 's' : ''} détectée${students.length > 1 ? 's' : ''} — ${validCount} valide${validCount > 1 ? 's' : ''}, ${errorCount} erreur${errorCount > 1 ? 's' : ''}`}
                  {step === 'done' && 'Import terminé'}
                </p>
              </div>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            {/* Corps */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* ÉTAPE 1 : Upload */}
              {step === 'upload' && (
                <div className="space-y-5">
                  {/* Télécharger modèle */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-800">1. Téléchargez le modèle CSV</p>
                      <p className="text-xs text-blue-500 mt-0.5">Remplissez-le avec vos étudiants (séparateur : point-virgule)</p>
                    </div>
                    <button
                      onClick={downloadTemplate}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-blue-200 text-blue-700 text-sm rounded-lg hover:bg-blue-50 transition font-medium"
                    >
                      ⬇ modele_import.csv
                    </button>
                  </div>

                  {/* Zone de drop */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">2. Importez votre fichier CSV</p>
                    <div
                      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${dragOver ? 'border-[#38bdf8] bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                      onClick={() => fileRef.current?.click()}
                    >
                      <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">Glissez votre fichier CSV ici</p>
                      <p className="text-xs text-gray-400 mt-1">ou cliquez pour sélectionner</p>
                      <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFileChange} />
                    </div>
                  </div>

                  {/* Colonnes acceptées */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Colonnes reconnues</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { col: 'prenom', req: true }, { col: 'nom', req: true }, { col: 'formation', req: true },
                        { col: 'email', req: false }, { col: 'universite', req: false },
                        { col: 'date_inscription', req: false }, { col: 'date_naissance', req: false },
                        { col: 'nationalite', req: false }, { col: 'prix_formation', req: false },
                      ].map(({ col, req }) => (
                        <span key={col} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono ${req ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]' : 'bg-gray-100 text-gray-500'}`}>
                          {col}{req && <span className="text-red-400 font-bold">*</span>}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2"><span className="text-red-400 font-bold">*</span> Obligatoire</p>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : Preview */}
              {step === 'preview' && (
                <div className="space-y-4">
                  {errorCount > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                      ⚠ {errorCount} ligne{errorCount > 1 ? 's' : ''} avec des erreurs — elles ne seront pas importées.
                    </div>
                  )}

                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-3 py-2.5 text-left font-semibold text-gray-500">#</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Prénom</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Nom</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Email</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Formation</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Université</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {students.map((s, i) => (
                          <tr key={i} className={s._errors.length > 0 ? 'bg-red-50/50' : 'hover:bg-gray-50'}>
                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-800">{s.first_name || <span className="text-red-400 italic">—</span>}</td>
                            <td className="px-3 py-2 font-medium text-gray-800">{s.last_name || <span className="text-red-400 italic">—</span>}</td>
                            <td className="px-3 py-2 text-gray-500">{s.email || '—'}</td>
                            <td className="px-3 py-2">
                              {s.formation
                                ? <span className="px-2 py-0.5 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] font-medium">{s.formation}</span>
                                : <span className="text-red-400 italic">—</span>}
                            </td>
                            <td className="px-3 py-2 text-gray-500">{s.universite || '—'}</td>
                            <td className="px-3 py-2">
                              {s._errors.length === 0
                                ? <span className="text-green-600 font-semibold">✓ OK</span>
                                : <span className="text-red-500" title={s._errors.join(', ')}>✕ {s._errors[0]}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : Done */}
              {step === 'done' && result && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Import réussi !</h3>
                  <p className="text-gray-500 text-sm">
                    <span className="font-bold text-[#1e3a5f] text-xl">{result.imported}</span> étudiant{result.imported > 1 ? 's' : ''} ajouté{result.imported > 1 ? 's' : ''} avec succès.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              {step === 'upload' && (
                <button onClick={close} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Annuler</button>
              )}

              {step === 'preview' && (
                <>
                  <button onClick={reset} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    ← Changer de fichier
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={validCount === 0 || importing}
                    className="ml-auto px-5 py-2.5 bg-[#1e3a5f] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8e] disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    {importing ? 'Import en cours...' : `Importer ${validCount} étudiant${validCount > 1 ? 's' : ''}`}
                  </button>
                </>
              )}

              {step === 'done' && (
                <button onClick={close} className="ml-auto px-5 py-2.5 bg-[#1e3a5f] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8e] transition">
                  Fermer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
