import { google, sheets_v4 } from 'googleapis'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { getProfInfo, allTabs, type ProfInfo } from './profs'

const SHEET_ID = '1okQXDUqEJSYoCYNEybeI3KeDUctObvXR16wQdZqJK9w'

/**
 * Loads service account credentials from either:
 * - GOOGLE_SERVICE_ACCOUNT_KEY env var (JSON string, for Vercel)
 * - ./google-service-account.json file (for local dev)
 */
function loadCredentials(): Record<string, unknown> {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
  }
  const localPath = path.join(process.cwd(), 'google-service-account.json')
  if (existsSync(localPath)) {
    return JSON.parse(readFileSync(localPath, 'utf8'))
  }
  throw new Error('No Google service account credentials found (set GOOGLE_SERVICE_ACCOUNT_KEY env var or place google-service-account.json at project root)')
}

let _sheetsClient: sheets_v4.Sheets | null = null
function getSheetsClient() {
  if (_sheetsClient) return _sheetsClient
  const auth = new google.auth.GoogleAuth({
    credentials: loadCredentials(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  _sheetsClient = google.sheets({ version: 'v4', auth })
  return _sheetsClient
}

/** A row from the sheet that's complete and ready to send */
export interface ReadyRow {
  tabName: string
  rowNum: number              // 1-indexed row in the sheet
  prof: ProfInfo
  studentName: string
  email: string
  date: string
  horaire: string
  sujet: string
  qualiteOrale: string
  priseDeParole: string
  connaissances: string
  interaction: string
  argumentation: string
  appreciation: string
  note: number
}

/** Scans every prof tab and returns rows that are fully filled and not yet sent */
export async function findReadyRows(): Promise<ReadyRow[]> {
  const sheets = getSheetsClient()
  const ready: ReadyRow[] = []

  for (const tabName of allTabs()) {
    const prof = getProfInfo(tabName)
    if (!prof) continue

    // Try with and without trailing space — actual tab names in the sheet have a trailing space sometimes
    const ranges = [`'${tabName} '!A1:N300`, `'${tabName}'!A1:N300`]
    let rows: string[][] = []
    for (const range of ranges) {
      try {
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range })
        rows = (res.data.values as string[][]) || []
        break
      } catch {
        // try next range
      }
    }
    if (!rows.length) continue

    const headerIdx = rows.findIndex(r => r[0] === 'Élève')
    if (headerIdx === -1) continue
    const dataStart = headerIdx + 1

    for (let i = dataStart; i < rows.length; i++) {
      const r = rows[i]
      if (!r) continue
      // Cols: 0:Élève 1:Email 2:Date 3:Horaire 4:Sujet 5:Durée 6:Q.orale 7:Prise 8:Connaissances 9:Inter 10:Arg 11:Appréciation 12:Note 13:Email envoyé?
      const [name, email, date, horaire, sujet, , q, p, c, inter, arg, app, note, sentMark] = r

      // SEUL critère pour envoyer : la note est présente en colonne M (= index 12).
      // Si pas de note → on n'envoie rien, même si tout le reste est rempli.
      const noteNum = parseFloat(note?.toString().replace(',', '.') || '')
      if (isNaN(noteNum)) continue

      // Garde-fous minimaux : nom + email obligatoires, sinon on peut pas envoyer
      if (!name?.trim() || !email?.trim()) continue
      // Anti-doublon : si déjà marqué envoyé dans la colonne N, on skip
      if (sentMark?.toString().trim()) continue

      ready.push({
        tabName,
        rowNum: i + 1,
        prof,
        studentName: name.trim(),
        email: email.replace(/\s+/g, ' ').trim(),
        date: date?.trim() || '',
        horaire: horaire?.trim() || '',
        sujet: sujet?.trim() || '',
        qualiteOrale: q?.trim().toUpperCase() || '',
        priseDeParole: p?.trim().toUpperCase() || '',
        connaissances: c?.trim().toUpperCase() || '',
        interaction: inter?.trim().toUpperCase() || '',
        argumentation: arg?.trim().toUpperCase() || '',
        appreciation: app?.trim() || '',
        note: noteNum,
      })
    }
  }
  return ready
}

/** Mark a row as sent by writing to column N (the "Email envoyé ?" column) */
export async function markRowAsSent(tabName: string, rowNum: number, status: 'ok' | 'error' = 'ok'): Promise<void> {
  const sheets = getSheetsClient()
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const value = status === 'ok' ? `✅ ${dd}/${mm} ${hh}:${min}` : `❌ erreur ${dd}/${mm} ${hh}:${min}`

  // Try with trailing space first (most tabs have one), fall back without
  const ranges = [`'${tabName} '!N${rowNum}`, `'${tabName}'!N${rowNum}`]
  let lastErr: unknown
  for (const range of ranges) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: { values: [[value]] },
      })
      return
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}
