// Marque comme "envoyé" des lignes dont le mail est DÉJÀ parti mais dont le marquage a échoué
// (ex: quota write Google Sheets dépassé). NE RENVOIE AUCUN MAIL.
// Usage: tsx scripts/mark-only.ts "Nom Eleve 1" "Nom Eleve 2" ...
import { readFileSync } from 'fs'
const envContent = readFileSync('.env.local', 'utf8')
envContent.split('\n').forEach(line => {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
})

import { findReadyRows, markRowAsSent } from '../src/lib/oraux/sheets-client'

const names = process.argv.slice(2)
if (!names.length) { console.error('Donne au moins un nom'); process.exit(1) }

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const rows = await findReadyRows()
  for (const name of names) {
    const matches = rows.filter(r => r.studentName.trim().toLowerCase() === name.trim().toLowerCase())
    if (!matches.length) {
      console.log(`⏭️  ${name}: déjà marqué ou introuvable (ok si déjà fait)`)
      continue
    }
    for (const r of matches) {
      try {
        await markRowAsSent(r.tabName, r.rowNum, 'ok')
        console.log(`✅ ${r.studentName} (${r.tabName.trim()} L${r.rowNum}) marqué`)
      } catch (e) {
        console.log(`❌ ${r.studentName}: ${(e as Error).message}`)
      }
      await sleep(1200) // large pause pour rester sous le quota
    }
  }
}
main().catch(e => { console.error(e); process.exit(1) })
