// Envoi convocations - Mme Dounia Yazidi - Physique-Chimie - Samedi 23/05/2026
// Template v3 (Meet) + BCC + nom complet
// Usage : node scripts/send-convocations-yazidi-2305.mjs

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
  matiere: 'Physique-Chimie',
  jour: 'Samedi',
  date: '23/05/2026',
  professeur: 'Mme Dounia Yazidi',
  formulaireSujet: 'https://forms.gle/5pDtPWepFKDJBiNh9',
}

const students = [
  { nom: 'Lounissi Meryam',         email: 'meryamlounissi012@gmail.com',     h1: '09:00', h2: '09:30', sujet: '' },
  { nom: 'Tristant Sedenio',        email: 'tristan.sedenio2025@gmail.com',   h1: '09:30', h2: '10:00', sujet: '' },
  { nom: 'Rodeanu Andrei',          email: 'rodeanua8@gmail.com',             h1: '10:00', h2: '10:30', sujet: '' },
  { nom: 'Nougayrede Lucas',        email: 'lulunoug82@gmail.com',            h1: '10:30', h2: '11:00', sujet: "Quelles ont été les conséquences de la catastrophe nucléaire de Tchernobyl sur les êtres vivants, et comment l'expliquer ?" },
  { nom: 'OUAZANA Johanna',         email: 'johanna.ouazana@gmail.com',       h1: '11:00', h2: '11:30', sujet: "Comment profiter d'un concert tout en minimisant les risques pour notre audition ?" },
  { nom: 'Keusseoglou Anguélos',    email: 'amkeusseoglou@gmail.com',         h1: '14:30', h2: '15:00', sujet: "Comment les baleines peuvent-elles survivre aux conditions des profondeurs ?" },
  { nom: 'Ben Sassi Yasmine',       email: 'yasminebensassi06@gmail.com',     h1: '15:00', h2: '15:30', sujet: '' },
  { nom: 'Ouahrani Nayel',          email: 'nayel2008@icloud.com',            h1: '15:30', h2: '16:00', sujet: '' },
  { nom: 'Maëlys Poisson',          email: 'maelys.poisson08@gmail.com',      h1: '16:00', h2: '16:30', sujet: '' },
  { nom: 'Idorane Nora',            email: 'Idoranenora@gmail.com',           h1: '16:30', h2: '17:00', sujet: "Comment un karatéka fait-il pour briser une planche sans se faire mal ?" },
  { nom: 'Zbair Yasmine',           email: 'yas.zbair@gmail.com',             h1: '17:00', h2: '17:30', sujet: '' },
  { nom: 'Forestier Diane',         email: 'diane.forestiergerbert@gmail.com',h1: '17:30', h2: '18:00', sujet: '' },
  { nom: 'Mbakop Hélène',           email: 'helenembak.8@gmail.com',          h1: '18:00', h2: '18:30', sujet: "Pourquoi manger des bonbons provoque-t-il des caries ?" },
  { nom: 'Moreau de Jaeck Arthur',  email: 'Arthur.mdj@icloud.com',           h1: '18:30', h2: '19:00', sujet: '' },
  { nom: 'Pagoulatos Ely',          email: 'elypagoulatos@gmail.com',         h1: '19:00', h2: '19:30', sujet: '' },
  { nom: 'Yasmine Amorri',          email: 'yasamorri08@gmail.com',           h1: '19:30', h2: '20:00', sujet: "En quoi la physique permet-elle d'améliorer la performance d'un joueur de tennis comme Carlos Alcaraz ?" },
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
          <p style="color:#0f172a;font-size:16px;margin:0 0 14px;">Bonjour <strong>${s.nom}</strong>,</p>
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
    to: [{ email: s.email, name: s.nom }],
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
  process.stdout.write(`  • ${s.nom.padEnd(26)} ${s.email.padEnd(40)} ${s.h1}-${s.h2}  → `)
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
  ko.forEach(r => console.log(`  - ${r.s.nom} (${r.s.email}) : ${r.error}`))
}
