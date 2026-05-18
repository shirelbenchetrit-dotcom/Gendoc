// Envoie 1 mail test à un destinataire choisi, avec les vraies données d'un élève réel du sheet.
// Ne touche PAS au sheet (pas de marquage "envoyé") — c'est juste un test de bout-en-bout Brevo + template.
import { findReadyRows } from '../src/lib/oraux/sheets-client'
import { renderResultEmail } from '../src/lib/oraux/email-template'
import { readFileSync } from 'fs'

// Charge .env.local pour avoir BREVO_API_KEY etc.
const envContent = readFileSync('.env.local', 'utf8')
envContent.split('\n').forEach(line => {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
})

const TEST_RECIPIENT = process.argv[2]
if (!TEST_RECIPIENT) {
  console.error('Usage: tsx scripts/send-test-email.ts <email-destinataire>')
  process.exit(1)
}

async function main() {
  const rows = await findReadyRows()
  // On prend Oscar Green (18/20 SVT) — meilleur cas démo
  const oscar = rows.find(r => r.studentName === 'Oscar Green' && r.tabName.trim() === 'Meryeme Benramdane')
  if (!oscar) {
    console.error('❌ Oscar Green introuvable dans les rows ready. Lignes dispo:')
    rows.slice(0, 5).forEach(r => console.log('  -', r.studentName, '(', r.tabName.trim(), ')'))
    process.exit(1)
  }

  console.log('📨 Envoi test :')
  console.log('   → destinataire:', TEST_RECIPIENT)
  console.log('   → données utilisées:', oscar.studentName, '|', oscar.note + '/20', '|', oscar.prof.matiere)

  const { subject, html } = renderResultEmail(oscar)
  console.log('   → subject:', subject)

  // Import brevo lib
  const { sendEmail } = await import('../src/lib/brevo')

  // ATTENTION: on envoie à TEST_RECIPIENT et non à oscar.email — c'est juste un test
  const result = await sendEmail({
    to: [{ email: TEST_RECIPIENT, name: 'Test - Shirel' }],
    subject: '[TEST] ' + subject,
    htmlContent: html,
  })

  console.log('\n✅ Envoyé !')
  console.log('   Brevo response:', result)
  console.log('\n   → Vérifie ta boite mail et confirme que le rendu est OK.')
}

main().catch(e => { console.error('\n❌ ERREUR:', e.message); process.exit(1) })
