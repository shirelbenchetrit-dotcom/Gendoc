// Affiche toutes les lignes prêtes à envoyer avec la nouvelle logique (note en M = trigger)
import { findReadyRows } from '../src/lib/oraux/sheets-client'

async function main() {
  const rows = await findReadyRows()
  console.log(`\n📊 ${rows.length} mails prêts à envoyer (critère : note en colonne M présente)\n`)

  const byTab: Record<string, typeof rows> = {}
  rows.forEach(r => {
    byTab[r.tabName] = byTab[r.tabName] || []
    byTab[r.tabName].push(r)
  })

  for (const [tab, list] of Object.entries(byTab)) {
    console.log(`📁 ${tab.trim()} (${list.length})`)
    list.forEach(r => {
      const hasApp = r.appreciation ? '✓' : '✗'
      const hasComps = [r.qualiteOrale, r.priseDeParole, r.connaissances, r.interaction, r.argumentation].filter(Boolean).length
      console.log(`   L${r.rowNum} | ${r.studentName.padEnd(28)} | ${r.note}/20 | App:${hasApp} | Comp:${hasComps}/5 | ${r.email}`)
    })
    console.log('')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
