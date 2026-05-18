import { google } from 'googleapis'
import { readFileSync } from 'fs'

const SHEET_ID = '1okQXDUqEJSYoCYNEybeI3KeDUctObvXR16wQdZqJK9w'
const credentials = JSON.parse(readFileSync('./google-service-account.json', 'utf8'))

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

try {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
  const tabs = meta.data.sheets.map(s => s.properties.title)
  console.log('✅ Read OK — tabs:', tabs)

  // Read each tab and find rows ready to send
  console.log('\n📊 SCAN DES LIGNES PRÊTES À ENVOYER\n')
  for (const tab of tabs) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'${tab}'!A1:N200`,
    })
    const rows = res.data.values || []
    // First 2 rows are header decoration, row 3 is column names, rows 4+ are data
    let headerIdx = rows.findIndex(r => r[0] === 'Élève')
    if (headerIdx === -1) {
      console.log(`  📁 ${tab}: pas de header "Élève" trouvé`)
      continue
    }
    const dataRows = rows.slice(headerIdx + 1)
    const ready = []
    const partial = []
    const sent = []
    dataRows.forEach((r, i) => {
      // Cols: 0:Élève 1:Email 2:Date 3:Horaire 4:Sujet 5:Durée 6:Q.orale 7:Prise 8:Connaissances 9:Inter 10:Arg 11:Appréciation 12:Note 13:Email envoyé?
      const [name, email, date, horaire, sujet, , q, p, c, inter, arg, app, note, sentMark] = r
      if (!name) return
      const allCompetences = [q, p, c, inter, arg].every(v => v && v.trim())
      const isReady = allCompetences && app?.trim() && note?.toString().trim()
      const isSent = sentMark?.toString().trim()
      const rowNum = headerIdx + 2 + i // 1-indexed row in sheet
      if (isSent) sent.push({ rowNum, name, note })
      else if (isReady) ready.push({ rowNum, name, email, date, horaire, sujet, note, app, q, p, c, inter, arg })
      else partial.push({ rowNum, name, note: note || '—' })
    })
    console.log(`📁 ${tab}`)
    console.log(`   ✅ Prêtes (non envoyées): ${ready.length}`)
    ready.forEach(r => console.log(`      → ligne ${r.rowNum}: ${r.name} | ${r.email} | ${r.date} | ${r.note}/20`))
    console.log(`   ⏳ Pas encore notées: ${partial.length}`)
    console.log(`   📨 Déjà envoyées: ${sent.length}\n`)
  }

  // Test write on Mathieu Bach Z1
  console.log('✏️  Test écriture sur "Mathieu Bach " Z1...')
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `'Mathieu Bach '!Z1`,
    valueInputOption: 'RAW',
    requestBody: { values: [['__test__']] },
  })
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `'Mathieu Bach '!Z1`,
  })
  console.log('✅ Write OK')
} catch (e) {
  console.error('❌ ERROR:', e.message)
  process.exit(1)
}
