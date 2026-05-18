// Envoi de rappels - Oraux blancs Sam 16/05 + Dim 17/05 + Lun 18/05/2026
// Toutes matières (SVT, PC, Maths) — 1 mail combiné si plusieurs oraux
// Exclusions : Lema Djoanna (annulé étudiant), Chloé SVT sam 16/05 (annulé), Castille SVT dim 17/05 (déplacée lun 18/05)
// Gaspard SVT lun 18/05 (déplacé lun 25/05, mais Maths lun 18/05 toujours actif)
// Usage : node scripts/send-rappels-weekend.mjs

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

const FORMULAIRE = 'https://forms.gle/5pDtPWepFKDJBiNh9'

// Élèves avec leurs oraux sam 16, dim 17, lun 18/05/2026 (triés par chrono)
const students = [
  { nom: 'Louna Meunier', email: 'lounameunier08@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '08:30', h2: '09:00', prof: 'Mme Meryeme Benramdane' },
    { matiere: 'Mathématiques', jour: 'Dimanche', date: '17/05/2026', h1: '15:30', h2: '16:00', prof: 'Mme Vanessa Cohen' },
  ]},
  { nom: 'Maynis MADI MNEMOI', email: 'madimaynis954@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '09:00', h2: '09:30', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Jeanne LE CANU', email: 'jeannelecanu86@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '09:30', h2: '10:00', prof: 'Mme Meryeme Benramdane' },
    { matiere: 'Physique-Chimie', jour: 'Dimanche', date: '17/05/2026', h1: '14:30', h2: '15:00', prof: 'M. Gabriel Boccara' },
  ]},
  { nom: 'Ouazizi Rahma', email: 'rahma.o2810@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '10:00', h2: '10:30', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Camille Boniface-Pistol', email: 'cambp2008@gmail.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Samedi', date: '16/05/2026', h1: '10:30', h2: '11:00', prof: 'Mme Dounia Yazidi' },
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '11:00', h2: '11:30', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Elea Martin', email: 'eleamartin.pro@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '11:30', h2: '12:00', prof: 'Mme Meryeme Benramdane' },
    { matiere: 'Physique-Chimie', jour: 'Samedi', date: '16/05/2026', h1: '14:30', h2: '15:00', prof: 'Mme Dounia Yazidi' },
  ]},
  { nom: 'Domane Aurelie', email: 'domaaure@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '12:00', h2: '12:30', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Swann Chauveau', email: 'chauveau.swann@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '12:30', h2: '13:00', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Yara Sedira', email: 'sedirayararazane@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '13:00', h2: '13:30', prof: 'Mme Meryeme Benramdane' },
    { matiere: 'Physique-Chimie', jour: 'Dimanche', date: '17/05/2026', h1: '15:00', h2: '15:30', prof: 'M. Gabriel Boccara' },
  ]},
  { nom: 'Maiara Da Veiga', email: 'maiarafeijo12@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '13:30', h2: '14:00', prof: 'Mme Meryeme Benramdane' },
    { matiere: 'Mathématiques', jour: 'Dimanche', date: '17/05/2026', h1: '17:00', h2: '17:30', prof: 'Mme Vanessa Cohen' },
  ]},
  { nom: 'Norah Tassin', email: 'norah.tassin@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '17:00', h2: '17:30', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'HAWA CAMARA', email: 'chawa652@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '17:30', h2: '18:00', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Angelina Cachon', email: 'cachonangelina@gmail.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Samedi', date: '16/05/2026', h1: '10:00', h2: '10:30', prof: 'Mme Dounia Yazidi' },
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '18:00', h2: '18:30', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Sofia Boukersi', email: 'boukersisofia08@yahoo.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Samedi', date: '16/05/2026', h1: '09:30', h2: '10:00', prof: 'Mme Dounia Yazidi' },
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '18:30', h2: '19:00', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Gisèle Heckel', email: 'giselevermer18@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Samedi', date: '16/05/2026', h1: '19:00', h2: '19:30', prof: 'Mme Meryeme Benramdane' },
    { matiere: 'Physique-Chimie', jour: 'Dimanche', date: '17/05/2026', h1: '17:30', h2: '18:00', prof: 'M. Gabriel Boccara' },
  ]},
  { nom: 'Tom Homehr', email: 'tomhomehr@gmail.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Samedi', date: '16/05/2026', h1: '09:00', h2: '09:30', prof: 'Mme Dounia Yazidi' },
    { matiere: 'Mathématiques', jour: 'Dimanche', date: '17/05/2026', h1: '14:00', h2: '14:30', prof: 'Mme Vanessa Cohen' },
  ]},
  { nom: 'Chloé Le Helley', email: 'chloelh26@gmail.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Samedi', date: '16/05/2026', h1: '11:00', h2: '11:30', prof: 'Mme Dounia Yazidi' },
  ]},
  { nom: 'Fedaoui Sarah', email: 'sarah.fdui@gmail.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Samedi', date: '16/05/2026', h1: '15:00', h2: '15:30', prof: 'Mme Dounia Yazidi' },
    { matiere: 'Mathématiques', jour: 'Dimanche', date: '17/05/2026', h1: '14:30', h2: '15:00', prof: 'Mme Vanessa Cohen' },
  ]},
  { nom: 'Juliette Grosjean gourlier', email: 'Juliette.2g@gmail.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Samedi', date: '16/05/2026', h1: '15:30', h2: '16:00', prof: 'Mme Dounia Yazidi' },
    { matiere: 'Mathématiques', jour: 'Dimanche', date: '17/05/2026', h1: '15:00', h2: '15:30', prof: 'Mme Vanessa Cohen' },
  ]},
  { nom: 'Marie Raymond Yammine', email: 'marieraymondyammine@outlook.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Samedi', date: '16/05/2026', h1: '16:00', h2: '16:30', prof: 'Mme Dounia Yazidi' },
  ]},
  { nom: 'Louka Milly', email: 'loukamil06@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Dimanche', date: '17/05/2026', h1: '09:30', h2: '10:00', prof: 'Mme Meryeme Benramdane' },
    { matiere: 'Mathématiques', jour: 'Dimanche', date: '17/05/2026', h1: '18:00', h2: '18:30', prof: 'Mme Vanessa Cohen' },
  ]},
  { nom: 'Louise trarieux', email: 'louisetrarieux@icloud.com', oraux: [
    { matiere: 'SVT', jour: 'Dimanche', date: '17/05/2026', h1: '10:00', h2: '10:30', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Margot Jacob', email: 'margotjacob95@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Dimanche', date: '17/05/2026', h1: '10:30', h2: '11:00', prof: 'Mme Meryeme Benramdane' },
    { matiere: 'Physique-Chimie', jour: 'Dimanche', date: '17/05/2026', h1: '16:30', h2: '17:00', prof: 'M. Gabriel Boccara' },
  ]},
  { nom: 'Maïwenn Sewindou', email: 'maiwenn.sewindou4@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Dimanche', date: '17/05/2026', h1: '11:00', h2: '11:30', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Laura Poghosyan', email: 'laourapoghosyan17@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Dimanche', date: '17/05/2026', h1: '11:30', h2: '12:00', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Willan Saadi ahmed', email: 'slefsihane78@hotmail.com', oraux: [
    { matiere: 'SVT', jour: 'Dimanche', date: '17/05/2026', h1: '12:00', h2: '12:30', prof: 'Mme Meryeme Benramdane' },
    { matiere: 'Mathématiques', jour: 'Dimanche', date: '17/05/2026', h1: '17:30', h2: '18:00', prof: 'Mme Vanessa Cohen' },
  ]},
  { nom: 'Carole Pegain', email: 'c.pegain@gmail.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Dimanche', date: '17/05/2026', h1: '14:00', h2: '14:30', prof: 'M. Gabriel Boccara' },
    { matiere: 'Mathématiques', jour: 'Dimanche', date: '17/05/2026', h1: '16:00', h2: '16:30', prof: 'Mme Vanessa Cohen' },
  ]},
  { nom: 'Angèle Bidet', email: 'angelebidet@gmail.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Dimanche', date: '17/05/2026', h1: '15:30', h2: '16:00', prof: 'M. Gabriel Boccara' },
  ]},
  { nom: 'Castille Drüeke', email: 'castille2008@gmail.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Dimanche', date: '17/05/2026', h1: '16:00', h2: '16:30', prof: 'M. Gabriel Boccara' },
    { matiere: 'SVT', jour: 'Lundi', date: '18/05/2026', h1: '19:30', h2: '20:00', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Lina Kadda', email: 'linakadda05@gmail.com', oraux: [
    { matiere: 'Mathématiques', jour: 'Dimanche', date: '17/05/2026', h1: '16:30', h2: '17:00', prof: 'Mme Vanessa Cohen' },
  ]},
  { nom: 'Evie Bijon', email: 'Eviebijon92@gmail.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Lundi', date: '18/05/2026', h1: '17:00', h2: '17:30', prof: 'M. Mathieu Bach' },
    { matiere: 'SVT', jour: 'Lundi', date: '18/05/2026', h1: '18:00', h2: '18:30', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Solene Loussouarn', email: 'solene.loussouarn@outlook.fr', oraux: [
    { matiere: 'SVT', jour: 'Lundi', date: '18/05/2026', h1: '18:30', h2: '19:00', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Camille Dupuis', email: 'camille.dupuis64@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Lundi', date: '18/05/2026', h1: '20:00', h2: '20:30', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Sandrine Slaim', email: 'sandrineslaim@gmail.com', oraux: [
    { matiere: 'SVT', jour: 'Lundi', date: '18/05/2026', h1: '20:30', h2: '21:00', prof: 'Mme Meryeme Benramdane' },
  ]},
  { nom: 'Halifi Ethan', email: 'halifiethan@icloud.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Lundi', date: '18/05/2026', h1: '16:30', h2: '17:00', prof: 'M. Mathieu Bach' },
  ]},
  { nom: 'Diaz Maé', email: 'diazmae679@gmail.com', oraux: [
    { matiere: 'Physique-Chimie', jour: 'Lundi', date: '18/05/2026', h1: '17:30', h2: '18:00', prof: 'M. Mathieu Bach' },
  ]},
  { nom: 'Gaspard du Garreau', email: 'gasparddugarreau@gmail.com', oraux: [
    { matiere: 'Mathématiques', jour: 'Lundi', date: '18/05/2026', h1: '18:00', h2: '18:30', prof: 'Mme Vanessa Cohen' },
  ]},
  { nom: 'Jolibert Eléa', email: 'eleajolibert@gmail.com', oraux: [
    { matiere: 'Mathématiques', jour: 'Lundi', date: '18/05/2026', h1: '18:30', h2: '19:00', prof: 'Mme Vanessa Cohen' },
  ]},
]

function buildOralBlock(o) {
  return `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:0 10px 10px 0;margin:0 0 12px;">
                <tr><td style="padding:14px 18px;">
                  <p style="margin:0 0 10px;color:#047857;font-size:14px;font-weight:700;">📋 ${o.matiere} &mdash; ${o.jour} ${o.date}</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
                    <tr><td width="100" style="color:#64748b;padding:3px 0;vertical-align:top;">Horaire</td><td style="color:#0f172a;padding:3px 0;font-weight:600;">${o.h1} &ndash; ${o.h2}</td></tr>
                    <tr><td style="color:#64748b;padding:3px 0;vertical-align:top;">Professeur</td><td style="color:#0f172a;padding:3px 0;">${o.prof}</td></tr>
                  </table>
                </td></tr>
              </table>`
}

function buildHtml(s) {
  const nbOraux = s.oraux.length
  const introText = nbOraux === 1
    ? `Petit rappel : ton oral blanc a lieu <strong>très bientôt</strong>. Voici les détails à retenir.`
    : `Petit rappel : tu as <strong>${nbOraux} oraux blancs</strong> prévus dans les prochains jours. Voici le récap.`

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#eef2f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08);">

        <tr><td style="background:#1a2735;padding:34px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">Diploma Santé</h1>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;letter-spacing:2px;font-weight:600;">RAPPEL &mdash; ORAUX BLANCS À VENIR</p>
        </td></tr>

        <tr><td style="padding:36px 40px 8px;">
          <p style="color:#0f172a;font-size:16px;margin:0 0 14px;">Bonjour <strong>${s.nom}</strong>,</p>
          <p style="color:#334155;font-size:14px;line-height:1.65;margin:0 0 24px;">
            ${introText}
          </p>
        </td></tr>

        <tr><td style="padding:0 40px 20px;">
          ${s.oraux.map(buildOralBlock).join('')}
        </td></tr>

        <tr><td style="padding:0 40px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 10px 10px 0;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 10px;color:#1d4ed8;font-size:14px;font-weight:700;">🔗 Connexion</p>
              <p style="margin:0;color:#334155;font-size:13px;line-height:1.55;">
                Le lien de connexion te sera envoyé par email <strong>le jour de chaque oral</strong>. Une invitation <strong>Google Meet</strong> te sera envoyée, merci de te connecter à l'heure indiquée.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-left:4px solid #f59e0b;border-radius:0 10px 10px 0;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 8px;color:#b45309;font-size:14px;font-weight:700;">📝 Sujet pas encore soumis ?</p>
              <p style="margin:0 0 12px;color:#92400e;font-size:13px;line-height:1.55;">
                Si tu n'as pas encore soumis ton sujet d'oral, c'est le moment ! Utilise le bouton ci-dessous.
              </p>
              <p style="margin:0;text-align:center;">
                <a href="${FORMULAIRE}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;">
                  📨 Soumettre mon sujet
                </a>
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:10px;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 10px;color:#1e3a5f;font-size:12px;font-weight:700;letter-spacing:1px;">RAPPELS PRATIQUES</p>
              <ul style="margin:0;padding-left:20px;color:#334155;font-size:13px;line-height:1.7;">
                <li>Sois prêt(e) <strong>5 minutes avant</strong> l'heure prévue</li>
                <li>Assure-toi d'être dans un <strong>endroit calme</strong></li>
                <li>Prépare ton matériel à l'avance (micro, caméra)</li>
                <li><strong>Pas de temps de préparation</strong> : 10 min présentation + 10 min questions + 10 min conseils</li>
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
  const nbOraux = s.oraux.length
  const subject = nbOraux === 1
    ? `Rappel — Ton oral blanc ${s.oraux[0].jour.toLowerCase()} ${s.oraux[0].date}`
    : `Rappel — Tes ${nbOraux} oraux blancs à venir`
  const payload = {
    sender: { email: env.BREVO_FROM_EMAIL || 'contact@diploma-sante.fr', name: env.BREVO_FROM_NAME || 'Diploma Santé' },
    to: [{ email: s.email, name: s.nom }],
    bcc: [{ email: 'shirel.benchetrit@diploma-sante.fr', name: 'Shirel' }],
    subject,
    htmlContent: buildHtml(s),
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return { ok: res.ok, status: res.status, body: await res.text() }
}

console.log(`→ Envoi de ${students.length} rappels (oraux sam 16 + dim 17 + lun 18/05)...\n`)
const results = []
for (const s of students) {
  process.stdout.write(`  • ${s.nom.padEnd(30)} ${s.email.padEnd(40)} (${s.oraux.length} oral${s.oraux.length > 1 ? 'ux' : ''})  → `)
  try {
    const r = await sendOne(s)
    if (r.ok) { console.log(`✓ envoyé`); results.push({ s, ok: true }) }
    else { console.log(`✖ ${r.status} ${r.body}`); results.push({ s, ok: false, error: `${r.status} ${r.body}` }) }
  } catch (err) { console.log(`✖ ${err.message}`); results.push({ s, ok: false, error: err.message }) }
  await new Promise(r => setTimeout(r, 250))
}

const ok = results.filter(r => r.ok).length
const ko = results.filter(r => !r.ok)
console.log(`\n=== Bilan : ${ok}/${students.length} rappels envoyés ===`)
if (ko.length) {
  console.log(`\nÉchecs :`)
  ko.forEach(r => console.log(`  - ${r.s.nom} (${r.s.email}) : ${r.error}`))
}
