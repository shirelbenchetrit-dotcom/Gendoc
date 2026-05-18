// Script de test : envoie 1 convocation d'oral blanc à une adresse de test
// Usage : node scripts/test-convocation-oral.mjs

import fs from 'fs'
import path from 'path'

// Charge .env.local manuellement
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const idx = trimmed.indexOf('=')
  if (idx === -1) return
  const key = trimmed.slice(0, idx).trim()
  let val = trimmed.slice(idx + 1).trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  env[key] = val
})

// === DONNÉES DE TEST (Maynis MADI MNEMOI - ligne 5 du planning Mme Benramdane) ===
const data = {
  destinataire: 'shirel.benchetrit@diploma-sante.fr',
  prenom: 'Maynis',
  matiere: 'SVT',
  jour: 'Samedi',
  date: '16/05/2026',
  horaireDebut: '09:00',
  horaireFin: '09:30',
  professeur: 'Mme Meryeme Benramdane',
  sujet: "Comment l'endométriose illustre-t-elle les interactions entre douleur chronique, stress et dérèglement hormonal ?",
  zoomLink: 'https://us02web.zoom.us/j/88913149340?pwd=Z5Qd41fPm0cQ7ilEwQb1D6vKTckrRa.1',
  formulaireSujet: 'https://forms.gle/5pDtPWepFKDJBiNh9',
}

const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#eef2f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08);">

        <!-- Header navy -->
        <tr><td style="background:#1a2735;padding:34px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">Diploma Santé</h1>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;letter-spacing:2px;font-weight:600;">ORAUX BLANCS &mdash; CONVOCATION</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px 8px;">
          <p style="color:#0f172a;font-size:16px;margin:0 0 14px;">Bonjour <strong>${data.prenom}</strong>,</p>
          <p style="color:#334155;font-size:14px;line-height:1.65;margin:0 0 4px;">
            Tu es convoqué(e) à un <strong>oral blanc</strong> le <strong>${data.jour.toLowerCase()} ${data.date}</strong>.
          </p>
          <p style="color:#334155;font-size:14px;line-height:1.65;margin:0 0 24px;">
            Retrouve ci-dessous toutes les informations pour te connecter.
          </p>
        </td></tr>

        <!-- Bloc vert : infos oral -->
        <tr><td style="padding:0 40px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:0 10px 10px 0;">
            <tr><td style="padding:20px 22px;">
              <p style="margin:0 0 16px;color:#047857;font-size:15px;font-weight:700;">
                <span style="display:inline-block;margin-right:6px;">📋</span>Oral blanc &mdash; ${data.matiere}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
                <tr>
                  <td width="120" style="color:#64748b;padding:5px 0;vertical-align:top;">Date</td>
                  <td style="color:#0f172a;padding:5px 0;font-weight:600;">${data.jour} ${data.date}</td>
                </tr>
                <tr>
                  <td style="color:#64748b;padding:5px 0;vertical-align:top;">Horaire</td>
                  <td style="color:#0f172a;padding:5px 0;font-weight:600;">${data.horaireDebut} &ndash; ${data.horaireFin}</td>
                </tr>
                <tr>
                  <td style="color:#64748b;padding:5px 0;vertical-align:top;">Professeur</td>
                  <td style="color:#0f172a;padding:5px 0;">${data.professeur}</td>
                </tr>
                <tr>
                  <td style="color:#64748b;padding:5px 0;vertical-align:top;">Lien Zoom</td>
                  <td style="padding:5px 0;">
                    <a href="${data.zoomLink}" style="color:#059669;font-weight:600;text-decoration:none;">▶ Rejoindre la session</a>
                  </td>
                </tr>
                <tr>
                  <td style="color:#64748b;padding:5px 0;vertical-align:top;">Ton sujet</td>
                  <td style="color:#334155;padding:5px 0;font-style:italic;line-height:1.5;">${data.sujet}</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Bloc orange : soumettre sujet -->
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
                <a href="${data.formulaireSujet}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:11px 26px;border-radius:8px;font-size:13px;font-weight:600;">
                  📨 Soumettre mon sujet
                </a>
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Bloc bleu : rappels -->
        <tr><td style="padding:0 40px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:10px;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 10px;color:#1e3a5f;font-size:12px;font-weight:700;letter-spacing:1px;">RAPPELS IMPORTANTS</p>
              <ul style="margin:0;padding-left:20px;color:#334155;font-size:13px;line-height:1.7;">
                <li>Connecte-toi <strong>5 minutes avant</strong> l'heure prévue</li>
                <li>Assure-toi d'être dans un <strong>endroit calme</strong></li>
                <li>Prépare ton matériel à l'avance (micro, caméra)</li>
                <li>En cas de problème technique, contacte-nous immédiatement</li>
              </ul>
            </td></tr>
          </table>
        </td></tr>

        <!-- Signature -->
        <tr><td style="padding:0 40px 32px;">
          <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
            Bon courage,<br>
            <strong>L'équipe Diploma Santé</strong>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1a2735;padding:14px 40px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">Ce message est confidentiel &mdash; Diploma Santé 2026</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

const payload = {
  sender: {
    email: env.BREVO_FROM_EMAIL || 'contact@diploma-sante.fr',
    name: env.BREVO_FROM_NAME || 'Diploma Santé',
  },
  to: [{ email: data.destinataire, name: 'Shirel (test)' }],
  subject: `[TEST] Convocation oral blanc — ${data.matiere} — ${data.jour} ${data.date}`,
  htmlContent,
}

console.log(`→ Envoi du test à ${data.destinataire} via Brevo...`)

const res = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'api-key': env.BREVO_API_KEY,
    'content-type': 'application/json',
  },
  body: JSON.stringify(payload),
})

const respText = await res.text()
if (!res.ok) {
  console.error(`✖ Échec (${res.status}) : ${respText}`)
  process.exit(1)
}
console.log(`✓ Mail envoyé. Réponse Brevo : ${respText}`)
