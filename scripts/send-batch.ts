// Envoie les mails de résultats à tous les élèves prêts ET marque le Google Sheet.
// Robuste : si un mail échoue, on continue avec les autres. Log clair par ligne.
import { readFileSync } from 'fs'

// Charge .env.local
const envContent = readFileSync('.env.local', 'utf8')
envContent.split('\n').forEach(line => {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
})

import { findReadyRows, markRowAsSent } from '../src/lib/oraux/sheets-client'
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

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const prefix = `[${(i + 1).toString().padStart(2, ' ')}/${rows.length}]`
    process.stdout.write(`${prefix} ${row.studentName.padEnd(30)} (${row.note}/20, ${row.prof.matiere.padEnd(15)}) → ${row.email} ... `)

    // Étape 1 : envoi du mail
    try {
      const { subject, html } = renderResultEmail(row)
      await sendEmail({
        to: [{ email: row.email, name: row.studentName }],
        subject,
        htmlContent: html,
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      results.emailError++
      errors.push({ student: row.studentName, email: row.email, phase: 'send', error: msg })
      console.log(`❌ MAIL: ${msg}`)
      // On essaie quand même de marquer l'erreur dans le sheet
      try { await markRowAsSent(row.tabName, row.rowNum, 'error') } catch {}
      continue
    }

    // Étape 2 : marquage du sheet
    try {
      await markRowAsSent(row.tabName, row.rowNum, 'ok')
      results.sent++
      console.log('✅')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      results.markError++
      errors.push({ student: row.studentName, email: row.email, phase: 'mark-sheet', error: msg })
      console.log(`⚠️  MAIL OK mais marquage KO: ${msg}`)
    }

    // Petite pause anti-rate-limit Brevo (300 emails/sec max sur leur API, mais on reste safe)
    await sleep(150)
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`📊 BILAN: ${results.sent} envoyés ✅  |  ${results.emailError} erreurs mail ❌  |  ${results.markError} erreurs marquage sheet ⚠️`)
  if (errors.length) {
    console.log('\n⚠️  Détail des erreurs:')
    errors.forEach(e => console.log(`   - ${e.student} (${e.email}) [${e.phase}]: ${e.error}`))
  }
}

main().catch(e => { console.error('\n❌ FATAL:', e.message); process.exit(1) })
