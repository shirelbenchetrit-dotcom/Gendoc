// Envoi convocations - Mme Benramdane - SVT - Samedi 30/05/2026
// Template v3 (Meet) + BCC
// Usage : node scripts/send-convocations-benramdane-3005.mjs

import fs from 'fs'
import path from 'path'

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const t = line.trim()
  if (!t || t.startsWith('#')) return
  const idx = t.indexOf('=')
  if (idx === -1) return
  const key = t.slice(0, idx).trim()
  let val = t.slice(idx + 1).trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
  env[key] = val
})

const COMMON = {
  matiere: 'SVT',
  jour: 'Samedi',
  date: '30/05/2026',
  professeur: 'Mme Meryeme Benramdane',
  formulaireSujet: 'https://forms.gle/5pDtPWepFKDJBiNh9',
}

const students = [
  { prenom: 'Leane',           email: 'leane.barraque29@gmail.com',         h1: '08:30', h2: '09:00', sujet: '' },
  { prenom: 'Noa',             email: 'kargenoa@gmail.com',                 h1: '09:30', h2: '10:00', sujet: '' },
  { prenom: 'Anastasia',       email: 'ana.huet20@gmail.com',               h1: '10:00', h2: '10:30', sujet: "Comment un traumatisme vécu dans l'enfance peut-il avoir des effets durables à l'âge adulte ?" },
  { prenom: 'Beatrice',        email: 'beatricemujdei@gmail.com',           h1: '10:30', h2: '11:00', sujet: "Dans quelle mesure le détournement du sémaglutide par des personnes non diabétiques affecte-t-il les mécanismes biologiques de régulation du poids ?" },
  { prenom: 'Louane',          email: 'friedrich.louane@gmail.com',         h1: '11:00', h2: '11:30', sujet: "Comment et pourquoi la médecine traite-t-elle différemment le diabète de type 1 et le diabète de type 2 ?" },
  { prenom: 'Marie-Madeleine', email: 'mariemadeleinehaefelin@gmail.com',   h1: '11:30', h2: '12:00', sujet: '' },
  { prenom: 'Malake',          email: 'bmalake90@gmail.com',                h1: '12:00', h2: '12:30', sujet: '' },
  { prenom: 'Arys',            email: 'aryskhemici@gmail.com',              h1: '12:30', h2: '13:00', sujet: '' },
  { prenom: 'Noheyla',         email: 'Noheyla.912@gmail.com',              h1: '14:00', h2: '14:30', sujet: "Comment expliquer les syncinésies dans certaines paralysies faciales ? Quelles sont leur origine, et comment traiter les patients ?" },
  { prenom: 'Yonas',           email: 'jahsay235@gmail.com',                h1: '14:30', h2: '15:00', sujet: "En quoi les douleurs fantômes remettent-elles en question notre perception du corps ?" },
  { prenom: 'Chloé',           email: 'ckaniahloe@gmail.com',               h1: '15:00', h2: '15:30', sujet: "La poule ou l'œuf ? La science tranche." },
  { prenom: 'Jade',            email: 'jade.perradin@gmail.com',            h1: '15:30', h2: '16:00', sujet: "Comment le corps gère-t-il le stress avant une compétition ?" },
  { prenom: 'Rokaya',          email: 'Rokya9790@gmail.com',                h1: '16:00', h2: '16:30', sujet: "Comment le système immunitaire tolère-t-il ou rejette-t-il un filet synthétique, et quels sont les liens avec les facteurs de risques musculaires ?" },
  { prenom: 'Chehrazad',       email: 'chehrazad.benhicham@outlook.fr',     h1: '16:30', h2: '17:00', sujet: "La xénogreffe est-elle une solution utile et réaliste ?" },
  { prenom: 'Olivia',          email: 'Oliviarafa1@icloud.com',             h1: '17:00', h2: '17:30', sujet: "Dans quelle mesure l'acidification des océans pourrait-elle contribuer à une crise de la biodiversité comparable à celles du passé ?" },
  { prenom: 'Hussein',         email: 'husseinalmohammad266@gmail.com',     h1: '18:30', h2: '19:00', sujet: '' },
  { prenom: 'Sanna',           email: 'deraouisanna2@gmail.com',            h1: '19:00', h2: '19:30', sujet: '' },
  { prenom: 'Kamelia',         email: 'kamelia.bendjabeur@gmail.com',       h1: '19:30', h2: '20:00', sujet: "Comment une résurrection comme celle de Jon Snow dans Game of Thrones est-elle biologiquement impossible ?" },
  { prenom: 'Annfel',          email: 'Bannfel@icloud.com',                 h1: '20:00', h2: '20:30', sujet: "Dans quelle mesure les produits de maquillage modifient-ils le fonctionnement de la peau ?" },
]

function buildHtml(s) {
  const hasSujet = s.sujet && s.sujet.trim().length > 0
  const sujetCell = hasSujet
    ? `<td style="color:#334155;padding:5px 0;font-style:italic;line-height:1.5;">${s.sujet}</td>`
    : `<td style="padding:5px 0;line-height:1.5;"><span style="color:#b91c1c;font-weight:600;">⚠️ Tu n'as pas encore soumis ton sujet</span> <span style="color:#64748b;">— remplis-le via le bouton ci-dessous.</span></td>`

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#eef2f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08);">

        <tr><td style="background:#1a2735;padding:34px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">Diploma Santé</h1>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;letter-spacing:2px;font-weight:600;">ORAUX BLANCS &mdash; CONVOCATION</p>
        </td></tr>

        <tr><td style="padding:36px 40px 8px;">
          <p style="color:#0f172a;font-size:16px;margin:0 0 14px;">Bonjour <strong>${s.prenom}</strong>,</p>
          <p style="color:#334155;font-size:14px;line-height:1.65;margin:0 0 4px;">
            Tu es convoqué(e) à un <strong>oral blanc</strong> le <strong>${COMMON.jour.toLowerCase()} ${COMMON.date}</strong>.
          </p>
          <p style="color:#334155;font-size:14px;line-height:1.65;margin:0 0 24px;">
            Voici toutes les informations à savoir pour ton passage.
          </p>
        </td></tr>

        <tr><td style="padding:0 40px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:0 10px 10px 0;">
            <tr><td style="padding:20px 22px;">
              <p style="margin:0 0 16px;color:#047857;font-size:15px;font-weight:700;">
                <span style="display:inline-block;margin-right:6px;">📋</span>Oral blanc &mdash; ${COMMON.matiere}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
                <tr><td width="120" style="color:#64748b;padding:5px 0;vertical-align:top;">Date</td><td style="color:#0f172a;padding:5px 0;font-weight:600;">${COMMON.jour} ${COMMON.date}</td></tr>
                <tr><td style="color:#64748b;padding:5px 0;vertical-align:top;">Horaire</td><td style="color:#0f172a;padding:5px 0;font-weight:600;">${s.h1} &ndash; ${s.h2}</td></tr>
                <tr><td style="color:#64748b;padding:5px 0;vertical-align:top;">Professeur</td><td style="color:#0f172a;padding:5px 0;">${COMMON.professeur}</td></tr>
                <tr><td style="color:#64748b;padding:5px 0;vertical-align:top;">Connexion</td><td style="color:#334155;padding:5px 0;font-style:italic;line-height:1.5;">Le lien de connexion te sera envoyé par email <strong>le jour de l'oral</strong>. Une invitation <strong>Google Meet</strong> te sera envoyée, merci de te connecter à l'heure indiquée sur ta convocation.</td></tr>
                <tr><td style="color:#64748b;padding:5px 0;vertical-align:top;">Ton sujet</td>${sujetCell}</tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 10px 10px 0;">
            <tr><td style="padding:20px 22px;">
              <p style="margin:0 0 12px;color:#1d4ed8;font-size:15px;font-weight:700;">
                <span style="display:inline-block;margin-right:6px;">⏱</span>Déroulé de ton oral (30 min)
              </p>
              <p style="margin:0 0 12px;color:#334155;font-size:13px;line-height:1.55;">
                <strong>Pas de temps de préparation</strong> — tu passes directement.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
                <tr><td width="60" style="color:#1d4ed8;padding:5px 0;font-weight:700;vertical-align:top;">10 min</td><td style="color:#334155;padding:5px 0;line-height:1.5;">Présentation de ton sujet</td></tr>
                <tr><td style="color:#1d4ed8;padding:5px 0;font-weight:700;vertical-align:top;">10 min</td><td style="color:#334155;padding:5px 0;line-height:1.5;">Questions du professeur</td></tr>
                <tr><td style="color:#1d4ed8;padding:5px 0;font-weight:700;vertical-align:top;">10 min</td><td style="color:#334155;padding:5px 0;line-height:1.5;">Conseils pour ton vrai oral du Bac</td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-left:4px solid #f59e0b;border-radius:0 10px 10px 0;">
            <tr><td style="padding:20px 22px;">
              <p style="margin:0 0 8px;color:#b45309;font-size:14px;font-weight:700;">
                <span style="display:inline-block;margin-right:6px;">📝</span>Soumettre ton sujet d'oral
              </p>
              <p style="margin:0 0 16px;color:#92400e;font-size:13px;line-height:1.55;">
                Merci de soumettre ton sujet <strong>avant l'oral</strong> via le formulaire ci-dessous.
              </p>
              <p style="margin:0;text-align:center;">
                <a href="${COMMON.formulaireSujet}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:11px 26px;border-radius:8px;font-size:13px;font-weight:600;">
                  📨 Soumettre mon sujet
                </a>
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:10px;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 10px;color:#1e3a5f;font-size:12px;font-weight:700;letter-spacing:1px;">RAPPELS IMPORTANTS</p>
              <ul style="margin:0;padding-left:20px;color:#334155;font-size:13px;line-height:1.7;">
                <li>Sois prêt(e) <strong>5 minutes avant</strong> l'heure prévue</li>
                <li>Assure-toi d'être dans un <strong>endroit calme</strong></li>
                <li>Prépare ton matériel à l'avance (micro, caméra)</li>
                <li>En cas de problème technique, contacte-nous immédiatement</li>
              </ul>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 32px;">
          <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
            Bon courage,<br>
            <strong>L'équipe Diploma Santé</strong>
          </p>
        </td></tr>

        <tr><td style="background:#1a2735;padding:14px 40px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">Ce message est confidentiel &mdash; Diploma Santé 2026</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function sendOne(s) {
  const payload = {
    sender: { email: env.BREVO_FROM_EMAIL || 'contact@diploma-sante.fr', name: env.BREVO_FROM_NAME || 'Diploma Santé' },
    to: [{ email: s.email, name: s.prenom }],
    bcc: [{ email: 'shirel.benchetrit@diploma-sante.fr', name: 'Shirel' }],
    subject: `Convocation oral blanc — ${COMMON.matiere} — ${COMMON.jour} ${COMMON.date}`,
    htmlContent: buildHtml(s),
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return { ok: res.ok, status: res.status, body: await res.text() }
}

console.log(`→ Envoi de ${students.length} convocations (${COMMON.professeur} - ${COMMON.matiere} - ${COMMON.jour} ${COMMON.date})...\n`)
const results = []
for (const s of students) {
  process.stdout.write(`  • ${s.prenom.padEnd(16)} ${s.email.padEnd(42)} ${s.h1}-${s.h2}  → `)
  try {
    const r = await sendOne(s)
    if (r.ok) { console.log(`✓ envoyé`); results.push({ s, ok: true }) }
    else { console.log(`✖ ${r.status} ${r.body}`); results.push({ s, ok: false, error: `${r.status} ${r.body}` }) }
  } catch (err) { console.log(`✖ ${err.message}`); results.push({ s, ok: false, error: err.message }) }
  await new Promise(r => setTimeout(r, 250))
}

const ok = results.filter(r => r.ok).length
const ko = results.filter(r => !r.ok)
console.log(`\n=== Bilan : ${ok}/${students.length} envoyés ===`)
if (ko.length) {
  console.log(`\nÉchecs :`)
  ko.forEach(r => console.log(`  - ${r.s.prenom} (${r.s.email}) : ${r.error}`))
}
