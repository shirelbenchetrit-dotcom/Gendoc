import { findReadyRows } from '@/lib/oraux/sheets-client'
import OrauxClient from './OrauxClient'

export const dynamic = 'force-dynamic'

export default async function OrauxAdminPage() {
  let rows: Awaited<ReturnType<typeof findReadyRows>> = []
  let error: string | null = null
  try {
    rows = await findReadyRows()
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'erreur inconnue'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Oraux blancs — Envoi des résultats</h1>
        <p className="text-sm text-gray-500 mt-1">
          Liste des élèves dont l&apos;oral a été noté et qui n&apos;ont pas encore reçu leur mail.
          Les envois se font automatiquement toutes les 15 minutes.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="font-semibold text-red-800">Erreur de connexion au Google Sheet</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <p className="text-xs text-red-600 mt-2">
            Vérifie que le compte <code className="bg-red-100 px-1">gendoc-sheets@oraux-blancs.iam.gserviceaccount.com</code> a bien les droits d&apos;Éditeur sur le sheet.
          </p>
        </div>
      )}

      <OrauxClient initialRows={rows} />
    </div>
  )
}
