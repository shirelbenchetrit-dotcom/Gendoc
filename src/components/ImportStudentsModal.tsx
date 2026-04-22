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

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
}

// Mapping large : supporte le CSV générique ET le format de la plateforme d'admission
const COLUMN_MAP: Record<string, string> = {
  // CSV générique
  prenom: 'first_name', firstname: 'first_name', first_name: 'first_name',
  nom: 'last_name', lastname: 'last_name', last_name: 'last_name',
  email: 'email', courriel: 'email',
  formation: 'formation',
  universite: 'universite', universite_: 'universite',
  date_inscription: 'date_inscription',
  date_naissance: 'date_naissance',
  nationalite: 'nationalite', nationalite_: 'nationalite',
  prix_formation: 'prix_formation', prix: 'prix_formation',
  // Format plateforme d'admission
  prenom_: 'first_name',
  nom_: 'last_name',
  voie: 'formation',           // simplifié (PASS, LAS, PAES…)
  montant_formation: 'prix_formation',
  date_de_creation: 'date_inscription',
  date_de_naissance: 'date_naissance',
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return ''
  // DD/MM/YYYY → YYYY-MM-DD
  const m1 = String(d).match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`
  // YYYY-MM-DD déjà bon
  if (/^\d{4}-\d{2}-\d{2}/.test(String(d))) return String(d).substring(0, 10)
  return ''
}

function parseCSVText(text: string): ParsedStudent[] {
  const clean = text.replace(/^\uFEFF/, '')
  const lines = clean.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const sep = lines[0].includes(';') ? ';' : ','

  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let cur = '', inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (c === sep && !inQuotes) {
        result.push(cur.trim()); cur = ''
      } else cur += c
    }
    result.push(cur.trim())
    return result
  }

  const headers = parseLine(lines[0]).map(h => {
    const norm = normalizeHeader(h)
    return COLUMN_MAP[norm] || norm
  })

  return lines.slice(1).map(line => mapRow(headers, parseLine(line)))
    .filter(r => r.first_name || r.last_name || r.email)
}

function mapRow(headers: string[], cells: string[]): ParsedStudent {
  const row: Record<string, string> = {}
  headers.forEach((h, i) => { row[h] = cells[i] || '' })

  // Si "voie" et "formation" tous les deux présents, préférer voie sauf si vide
  const formation = row.formation || row.voie || ''
  const errors: string[] = []
  if (!row.first_name) errors.push('Prénom manquant')
  if (!row.last_name) errors.push('Nom manquant')
  if (!formation) errors.push('Formation manquante')

  return {
    first_name: row.first_name || '',
    last_name: row.last_name || '',
    email: row.email || '',
    formation,
    universite: row.universite || '',
    date_inscription: fmtDate(row.date_inscription),
    date_naissance: fmtDate(row.date_naissance),
    nationalite: row.nationalite || '',
    prix_formation: row.prix_formation || '',
    _errors: errors,
  }
}

async function parseXLSX(file: File): Promise<ParsedStudent[]> {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })

  return rows.map(row => {
    // Normaliser toutes les clés
    const normalized: Record<string, string> = {}
    for (const [k, v] of Object.entries(row)) {
      const normKey = normalizeHeader(k)
      const mappedKey = COLUMN_MAP[normKey] || normKey
      normalized[mappedKey] = String(v || '')
    }

    // Voie présente → utiliser pour formation si formation vide
    const formation = normalized.formation || normalized.voie || ''
    const errors: string[] = []
    if (!normalized.first_name) errors.push('Prénom manquant')
    if (!normalized.last_name) errors.push('Nom manquant')
    if (!formation) errors.push('Formation manquante')

    return {
      first_name: (normalized.first_name || '').trim(),
      last_name: (normalized.last_name || '').trim(),
      email: (normalized.email || '').trim(),
      formation: formation.trim(),
      universite: (normalized.universite || '').trim(),
      date_inscription: fmtDate(normalized.date_inscription),
      date_naissance: fmtDate(normalized.date_naissance),
      nationalite: (normalized.nationalite || '').trim(),
      prix_formation: normalized.prix_formation ? String(normalized.prix_formation) : '',
      _errors: errors,
    }
  }).filter(r => r.first_name || r.last_name || r.email)
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
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)

  const handleFile = async (file: File) => {
    setParsing(true)
    try {
      let parsed: ParsedStudent[]
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parsed = await parseXLSX(file)
      } else {
        const text = await file.text()
        parsed = parseCSVText(text)
      }
      setStudents(parsed)
      setStep('preview')
    } catch (e) {
      alert('Erreur lors de la lecture du fichier : ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setParsing(false)
    }
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
      setResult({ imported: data.imported, skipped: data.skipped || 0 })
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
        Importer
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
                  {step === 'upload' && 'Supporte les fichiers CSV et Excel (.xlsx) — les doublons sont ignorés automatiquement'}
                  {step === 'preview' && `${students.length} ligne${students.length > 1 ? 's' : ''} — ${validCount} valide${validCount > 1 ? 's' : ''}, ${errorCount} erreur${errorCount > 1 ? 's' : ''}`}
                  {step === 'done' && 'Import terminé'}
                </p>
              </div>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">

              {/* ÉTAPE 1 : Upload */}
              {step === 'upload' && (
                <div className="space-y-5">
                  {/* Info formats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-sm font-semibold text-blue-800 mb-1">📊 Export plateforme d'admission</p>
                      <p className="text-xs text-blue-500">Glisse directement le fichier <strong>.xlsx</strong> exporté depuis admission.diploma-sante.fr</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">📄 Fichier CSV générique</p>
                      <button onClick={downloadTemplate} className="text-xs text-[#38bdf8] hover:underline">⬇ Télécharger le modèle CSV</button>
                    </div>
                  </div>

                  {/* Zone de drop */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${dragOver ? 'border-[#38bdf8] bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileRef.current?.click()}
                  >
                    {parsing ? (
                      <p className="text-sm text-gray-500">Lecture du fichier...</p>
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">Glissez votre fichier <strong>CSV</strong> ou <strong>Excel (.xlsx)</strong> ici</p>
                        <p className="text-xs text-gray-400 mt-1">ou cliquez pour sélectionner</p>
                        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,text/csv" className="hidden" onChange={onFileChange} />
                      </>
                    )}
                  </div>

                  <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-xs text-green-700">
                    ✓ Les étudiants dont l'email existe déjà dans Gendoc sont ignorés automatiquement
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : Preview */}
              {step === 'preview' && (
                <div className="space-y-4">
                  {errorCount > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                      ⚠ {errorCount} ligne{errorCount > 1 ? 's' : ''} avec erreurs — elles ne seront pas importées.
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
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Import réussi !</h3>
                  <p className="text-gray-500 text-sm mb-1">
                    <span className="font-bold text-[#1e3a5f] text-xl">{result.imported}</span> étudiant{result.imported > 1 ? 's' : ''} ajouté{result.imported > 1 ? 's' : ''}
                  </p>
                  {result.skipped > 0 && (
                    <p className="text-gray-400 text-sm">{result.skipped} doublon{result.skipped > 1 ? 's' : ''} ignoré{result.skipped > 1 ? 's' : ''} (email déjà présent)</p>
                  )}
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
                  <button onClick={reset} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">← Changer de fichier</button>
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
