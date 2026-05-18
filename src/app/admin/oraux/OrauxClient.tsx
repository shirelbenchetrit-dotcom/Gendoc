'use client'

import { useState } from 'react'
import type { ReadyRow } from '@/lib/oraux/sheets-client'

interface Props {
  initialRows: ReadyRow[]
}

export default function OrauxClient({ initialRows }: Props) {
  const [rows, setRows] = useState(initialRows)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ total: number; sent: number; errors: number; results: Array<{ student: string; email: string; status: string; error?: string }> } | null>(null)

  const refresh = async () => {
    const res = await fetch('/api/oraux/process')
    const data = await res.json()
    setRows(data.rows || [])
    setResult(null)
  }

  const sendAll = async () => {
    if (!confirm(`Envoyer ${rows.length} email(s) aux élèves ? Cette action est irréversible.`)) return
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/oraux/process', { method: 'POST' })
      const data = await res.json()
      setResult(data)
      // Refresh la liste après envoi
      await refresh()
    } catch (e) {
      alert('Erreur: ' + (e as Error).message)
    } finally {
      setSending(false)
    }
  }

  // Group rows by tab
  const byTab = rows.reduce<Record<string, ReadyRow[]>>((acc, r) => {
    acc[r.tabName] = acc[r.tabName] || []
    acc[r.tabName].push(r)
    return acc
  }, {})

  return (
    <>
      {/* Top stats + actions */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex gap-3">
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide">À envoyer</div>
            <div className="text-3xl font-bold text-[#1e3a5f]">{rows.length}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium hover:bg-gray-50"
          >
            Actualiser
          </button>
          <button
            onClick={sendAll}
            disabled={sending || rows.length === 0}
            className="px-5 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#152b47] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Envoi en cours…' : `Envoyer ${rows.length} mail${rows.length > 1 ? 's' : ''} maintenant`}
          </button>
        </div>
      </div>

      {/* Recap of last send */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-green-900">
            ✅ {result.sent} mail{result.sent > 1 ? 's' : ''} envoyé{result.sent > 1 ? 's' : ''}
            {result.errors > 0 && <span className="text-red-700"> · {result.errors} erreur{result.errors > 1 ? 's' : ''}</span>}
          </p>
          {result.errors > 0 && (
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {result.results.filter(r => r.status === 'error').map((r, i) => (
                <li key={i}><strong>{r.student}</strong> ({r.email}) — {r.error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Empty state */}
      {rows.length === 0 && !result && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
          <p className="text-lg mb-2">📭</p>
          <p>Aucun mail à envoyer pour l&apos;instant.</p>
          <p className="text-sm mt-1">La liste se met à jour automatiquement depuis le Google Sheet.</p>
        </div>
      )}

      {/* Grouped by tab */}
      {Object.entries(byTab).map(([tab, tabRows]) => (
        <div key={tab} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            {tab.trim()} <span className="font-normal text-gray-400">· {tabRows.length} mail{tabRows.length > 1 ? 's' : ''}</span>
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="text-left px-4 py-2.5">Élève</th>
                  <th className="text-left px-4 py-2.5">Email</th>
                  <th className="text-left px-4 py-2.5">Date</th>
                  <th className="text-left px-4 py-2.5">Note</th>
                  <th className="text-left px-4 py-2.5">Preview</th>
                </tr>
              </thead>
              <tbody>
                {tabRows.map((r) => (
                  <tr key={`${r.tabName}-${r.rowNum}`} className="border-t border-gray-100">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{r.studentName}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.email}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.date}</td>
                    <td className="px-4 py-2.5 font-bold text-[#1e3a5f]">{r.note}/20</td>
                    <td className="px-4 py-2.5">
                      <a
                        href={`/api/oraux/preview?tab=${encodeURIComponent(r.tabName)}&row=${r.rowNum}`}
                        target="_blank"
                        rel="noopener"
                        className="text-[#38bdf8] hover:underline"
                      >
                        Voir →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  )
}
