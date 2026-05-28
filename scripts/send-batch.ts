// Envoie les mails de résultats à tous les élèves prêts ET marque le Google Sheet.
// Robuste : si un mail échoue, on continue avec les autres. Log clair par ligne.
import { readFileSync } from 'fs'

// Charge .env.local
const envContent = readFileSync('.env.local', 'utf8')
envContent.split('\n').forEach(line => {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
})

import { findReadyRows, markRowsAsSentBatch } from '../src/lib/oraux/sheets-client'
import { renderResultEmail } from '../src/lib/oraux/email-template'
import { sendEmail } from '../src/lib/brevo'

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('🔎 Scan du sheet...')
  const rows = await findReadyRows()
  console.log(`✅ ${rows.length} mails à envoyer\n`)

  if (rows.length === 0) {
    console.log('Rien à faire.')
    return
  }

  const results = { sent: 0, emailError: 0, markError: 0 }
  const errors: Array<{ student: string; email: string; phase: string; error: string }> = []
  // On accumule les lignes à marquer, puis on écrit tout en 1 appel groupé à la fin
  const toMark: Array<{ tabName: string; rowNum: number; status: 'ok' | 'error' }> = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const prefix = `[${(i + 1).toString().padStart(2, ' ')}/${rows.length}]`
    process.stdout.write(`${prefix} ${row.studentName.padEnd(30)} (${row.note}/20, ${row.prof.matiere.padEnd(15)}) → ${row.email} ... `)

    // Envoi du mail
    try {
      const { subject, html } = renderResultEmail(row)
      await sendEmail({
        to: [{ email: row.email, name: row.studentName }],
        subject,
        htmlContent: html,
      })
      results.sent++
      toMark.push({ tabName: row.tabName, rowNum: row.rowNum, status: 'ok' })
      console.log('✅')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      results.emailError++
      errors.push({ student: row.studentName, email: row.email, phase: 'send', error: msg })
      toMark.push({ tabName: row.tabName, rowNum: row.rowNum, status: 'error' })
      console.log(`❌ MAIL: ${msg}`)
    }

    // Pause anti-rate-limit Brevo
    await sleep(120)
  }

  // Marquage groupé du sheet : 1 seul appel API (ne tape jamais le quota write)
  console.log('\n📝 Marquage du sheet (groupé)...')
  try {
    await markRowsAsSentBatch(toMark)
    console.log(`✅ ${toMark.length} lignes marquées en 1 appel`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    results.markError = toMark.length
    console.log(`❌ Marquage groupé KO: ${msg}`)
    // Fallback : on tente ligne par ligne avec pauses pour rester sous le quota
    console.log('   Fallback ligne par ligne...')
    const { markRowAsSent } = await import('../src/lib/oraux/sheets-client')
    let ok = 0
    for (const m of toMark) {
      try { await markRowAsSent(m.tabName, m.rowNum, m.status); ok++ } catch {}
      await sleep(1100)
    }
    results.markError = toMark.length - ok
    console.log(`   ${ok}/${toMark.length} marquées en fallback`)
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`📊 BILAN: ${results.sent} envoyés ✅  |  ${results.emailError} erreurs mail ❌  |  ${results.markError} erreurs marquage sheet ⚠️`)
  if (errors.length) {
    console.log('\n⚠️  Détail des erreurs:')
    errors.forEach(e => console.log(`   - ${e.student} (${e.email}) [${e.phase}]: ${e.error}`))
  }
}

main().catch(e => { console.error('\n❌ FATAL:', e.message); process.exit(1) })
