// Envoi v2 (mise à jour) aux 16 élèves du samedi 16/05/2026 - Mme Benramdane
// Ajoute un bandeau "cette convocation remplace la précédente"
// Usage : node scripts/send-convocations-saturday-v2.mjs

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
  date: '16/05/2026',
  professeur: 'Mme Meryeme Benramdane',
  formulaireSujet: 'https://forms.gle/5pDtPWepFKDJBiNh9',
}

// Mêmes 16 élèves que le batch v1, avec Hawa qui a maintenant un sujet
const students = [
  { prenom: 'Louna',    email: 'lounameunier08@gmail.com',      h1: '08:30', h2: '09:00', sujet: '' },
  { prenom: 'Maynis',   email: 'madimaynis954@gmail.com',       h1: '09:00', h2: '09:30', sujet: "Comment l'endométriose illustre-t-elle les interactions entre douleur chronique, stress et dérèglement hormonal ?" },
  { prenom: 'Jeanne',   email: 'jeannelecanu86@gmail.com',      h1: '09:30', h2: '10:00', sujet: "Qu'est-ce que la Spondylarthrite Ankylosante et comment les avancées en immunologie et en biotechnologies ont-elles permis de la soigner ?" },
  { prenom: 'Rahma',    email: 'rahma.o2810@gmail.com',         h1: '10:00', h2: '10:30', sujet: "Les inégalités sociales influencent-elles le risque de développer la maladie d'Alzheimer ?" },
  { prenom: 'Chloé',    email: 'chloelh26@gmail.com',           h1: '10:30', h2: '11:00', sujet: '' },
  { prenom: 'Camille',  email: 'cambp2008@gmail.com',           h1: '11:00', h2: '11:30', sujet: "Comment l'incitation à la dépendance aux écrans se nourrit de mécanismes essentiels à la survie de l'être humain ?" },
  { prenom: 'Elea',     email: 'eleamartin.pro@gmail.com',      h1: '11:30', h2: '12:00', sujet: '' },
  { prenom: 'Aurélie',  email: 'domaaure@gmail.com',            h1: '12:00', h2: '12:30', sujet: '' },
  { prenom: 'Swann',    email: 'chauveau.swann@gmail.com',      h1: '12:30', h2: '13:00', sujet: '' },
  { prenom: 'Yara',     email: 'sedirayararazane@gmail.com',    h1: '13:00', h2: '13:30', sujet: '' },
  { prenom: 'Maiara',   email: 'maiarafeijo12@gmail.com',       h1: '13:30', h2: '14:00', sujet: '' },
  { prenom: 'Norah',    email: 'norah.tassin@gmail.com',        h1: '17:00', h2: '17:30', sujet: '' },
  { prenom: 'Hawa',     email: 'chawa652@gmail.com',            h1: '17:30', h2: '18:00', sujet: "Comment expliquer la difficulté que le cerveau a pour localiser une douleur interne ?" },
  { prenom: 'Angelina', email: 'cachonangelina@gmail.com',      h1: '18:00', h2: '18:30', sujet: "De quelle manière la maladie de Charcot entraîne-t-elle la perte de motricité volontaire ?" },
  { prenom: 'Sofia',    email: 'boukersisofia08@yahoo.com',     h1: '18:30', h2: '19:00', sujet: '' },
  { prenom: 'Gisèle',   email: 'giselevermer18@gmail.com',      h1: '19:00', h2: '19:30', sujet: "Sur la bipolarité, comment un cerveau de bipolaire fonctionne-t-il, comment peut-on diagnostiquer un bipolaire avec une simple prise de sang ?" },
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

        <!-- Bandeau "mise à jour" -->
        <tr><td style="padding:24px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border-left:4px solid #d97706;border-radius:0 8px 8px 0;">
            <tr><td style="padding:14px 18px;">
              <p style="margin:0;color:#78350f;font-size:13px;line-height:1.55;">
                📌 <strong>Cette convocation remplace celle envoyée précédemment.</strong>
                Merci de ne pas tenir compte du mail précédent — notamment, <strong>le lien Zoom te sera envoyé par email le jour de l'oral</strong> (et non plus dans cette convocation).
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 40px 8px;">
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
                <tr><td style="color:#64748b;padding:5px 0;vertical-align:top;">Connexion</td><td style="color:#334155;padding:5px 0;font-style:italic;line-height:1.5;">Le lien Zoom te sera envoyé par email <strong>le jour de l'oral</strong>.</td></tr>
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
    subject: `[Mise à jour] Convocation oral blanc — ${COMMON.matiere} — ${COMMON.jour} ${COMMON.date}`,
    htmlContent: buildHtml(s),
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return { ok: res.ok, status: res.status, body: await res.text() }
}

console.log(`→ Envoi v2 (mise à jour) à ${students.length} élèves (${COMMON.jour} ${COMMON.date})...\n`)
const results = []
for (const s of students) {
  process.stdout.write(`  • ${s.prenom.padEnd(10)} ${s.email.padEnd(38)} ${s.h1}-${s.h2}  → `)
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
