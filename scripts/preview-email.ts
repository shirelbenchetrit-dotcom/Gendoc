import { writeFileSync } from 'fs'
import { renderResultEmail } from '../src/lib/oraux/email-template'
import type { ReadyRow } from '../src/lib/oraux/sheets-client'

// Trois cas de test : note excellente, note moyenne, note faible
const cases: ReadyRow[] = [
  {
    tabName: 'Meryeme Benramdane',
    rowNum: 4,
    prof: { displayName: 'Mme Meryeme Benramdane', matiere: 'SVT' },
    studentName: 'Oscar Green',
    email: 'oscar.r.n.green@gmail.com',
    date: '05/05/2026',
    horaire: '20:00 – 20:30',
    sujet: 'Comment la sérotonine régule-t-elle notre humeur ?',
    qualiteOrale: 'S',
    priseDeParole: 'TS',
    connaissances: 'TS',
    interaction: 'S',
    argumentation: 'TS',
    appreciation: "Très bon oral. Sujet original et parfaitement maîtrisé. Oscar a su captiver son auditoire par une analyse rigoureuse des mécanismes d'électrolocalisation. Les capacités d'analyse et de synthèse sont remarquables",
    note: 18,
  },
  {
    tabName: 'Mathieu Bach',
    rowNum: 5,
    prof: { displayName: 'Mr Mathieu Bach', matiere: 'Physique-Chimie' },
    studentName: 'Yugen PUVIRAJ',
    email: 'puvirajyugen@gmail.com',
    date: '08/05/2026',
    horaire: '13:00 – 13:30',
    sujet: 'Comment la cryothérapie impacte le corps humain ?',
    qualiteOrale: 'TI',
    priseDeParole: 'TI',
    connaissances: 'I',
    interaction: 'S',
    argumentation: 'TI',
    appreciation: "Lit son texte. Pas de notation de l'oral. Faible maîtrise du sujet.",
    note: 8,
  },
  {
    tabName: 'Vanessa Cohen',
    rowNum: 38,
    prof: { displayName: 'Mme Vanessa Cohen', matiere: 'Mathématiques' },
    studentName: 'Sacha David',
    email: 'sdavid2222008@gmail.com',
    date: '11/05/2026',
    horaire: '17:00 – 17:30',
    sujet: 'Suites récurrentes et convergence',
    qualiteOrale: 'TS',
    priseDeParole: 'TS',
    connaissances: 'TS',
    interaction: 'TS',
    argumentation: 'TS',
    appreciation: 'Excellente prestation. Maîtrise totale du sujet et grande clarté dans l\'exposition.',
    note: 18,
  },
]

const allHtml = cases.map(c => {
  const { subject, html } = renderResultEmail(c)
  return `<div style="margin:20px 0;padding:12px;background:#1e293b;color:#fff;font-family:monospace;font-size:12px;border-radius:6px;">
  <strong>To:</strong> ${c.email}<br>
  <strong>Subject:</strong> ${subject}
</div>
${html}`
}).join('<hr style="margin:40px 0;border:none;border-top:2px dashed #cbd5e1;">')

writeFileSync('/tmp/preview-emails.html', `<html><body style="background:#e2e8f0;padding:20px;margin:0;">${allHtml}</body></html>`)
console.log('✅ Preview généré: /tmp/preview-emails.html')
console.log('   Ouvre avec: open /tmp/preview-emails.html')
