// Génère un fichier HTML de preview d'email pour un cas test
import { writeFileSync } from 'fs'

// Mock d'une ReadyRow pour preview
const mockRow = {
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
}

// Import dynamique du template (TS) via tsx ou compilation manuelle
const { renderResultEmail } = await import('../src/lib/oraux/email-template.ts').catch(async () => {
  // Fallback: compile à la volée
  const { execSync } = await import('child_process')
  execSync('npx tsc --module esnext --target es2022 --moduleResolution bundler --jsx preserve --outDir /tmp/oraux-build src/lib/oraux/*.ts', { stdio: 'inherit' })
  return await import('/tmp/oraux-build/email-template.js')
})

const { subject, html } = renderResultEmail(mockRow)
writeFileSync('/tmp/preview-email.html', html)
console.log('✅ Preview:', '/tmp/preview-email.html')
console.log('   Subject:', subject)
console.log('\n   Ouvre-le dans le navigateur : open /tmp/preview-email.html')
