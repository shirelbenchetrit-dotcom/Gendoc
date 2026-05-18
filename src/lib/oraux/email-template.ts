import { appraisalForNote, competenceColor } from './grading'
import type { ReadyRow } from './sheets-client'

const NAVY = '#1e3a5f'
const LIGHT_GREEN_BG = '#ecfdf5'
const LIGHT_GREEN_BORDER = '#16a34a'
const LIGHT_GRAY_BG = '#f8fafc'

/** Builds the HTML email matching the screenshot template */
export function renderResultEmail(row: ReadyRow): { subject: string; html: string } {
  const firstName = row.studentName.split(/\s+/)[0]
  const appraisal = appraisalForNote(row.note)

  const competences: Array<[string, string]> = [
    ['Qualité orale', row.qualiteOrale],
    ['Prise de parole', row.priseDeParole],
    ['Connaissances', row.connaissances],
    ['Interaction', row.interaction],
    ['Argumentation', row.argumentation],
  ].filter(([, code]) => code && code.trim()) as Array<[string, string]>

  const hasCompetences = competences.length > 0
  const hasAppreciation = row.appreciation.trim().length > 0
  const hasSujet = row.sujet.trim().length > 0

  const competenceRows = competences.map(([label, code]) => `
    <tr>
      <td style="padding:6px 0;font-size:14px;color:#334155;">${label}</td>
      <td style="padding:6px 0;font-size:14px;font-weight:bold;color:${competenceColor(code)};text-align:right;">${escapeHtml(code)}</td>
    </tr>
  `).join('')

  const subject = `Résultat de ton oral blanc de ${row.prof.matiere} — Diploma Santé`

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f1f5f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- HEADER navy -->
          <tr>
            <td style="background:${NAVY};padding:32px 24px;text-align:center;">
              <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.3px;">Diploma Santé</div>
              <div style="color:#94a3b8;font-size:11px;letter-spacing:2.5px;margin-top:6px;font-weight:600;">ORAUX BLANCS — RÉSULTAT</div>
            </td>
          </tr>

          <!-- INTRO -->
          <tr>
            <td style="padding:28px 28px 0 28px;">
              <p style="margin:0 0 12px 0;font-size:15px;color:#0f172a;">Bonjour <strong>${escapeHtml(firstName)}</strong>,</p>
              <p style="margin:0 0 8px 0;font-size:14px;color:#475569;line-height:1.5;">Ton oral blanc de <strong>${escapeHtml(row.prof.matiere)}</strong> du <strong>${escapeHtml(row.date)}</strong> a été évalué.</p>
              <p style="margin:0;font-size:14px;color:#475569;line-height:1.5;">Retrouve ci-dessous ton résultat et l'appréciation de ton professeur.</p>
            </td>
          </tr>

          <!-- BIG NOTE BLOCK -->
          <tr>
            <td style="padding:20px 28px 0 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${NAVY};border-radius:10px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <div style="color:#94a3b8;font-size:11px;letter-spacing:2.5px;font-weight:600;">TA NOTE</div>
                    <div style="margin-top:8px;color:#ffffff;font-size:48px;font-weight:800;line-height:1;">${formatNote(row.note)}<span style="font-size:20px;font-weight:500;color:#94a3b8;">/20</span></div>
                    <div style="margin-top:10px;color:${appraisal.color};font-size:15px;font-weight:700;">${appraisal.label}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${hasCompetences ? `
          <!-- COMPETENCES BLOCK -->
          <tr>
            <td style="padding:20px 28px 0 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${LIGHT_GREEN_BG};border-left:4px solid ${LIGHT_GREEN_BORDER};border-radius:6px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="color:${NAVY};font-size:11px;letter-spacing:1.5px;font-weight:700;margin-bottom:10px;">DÉTAIL PAR COMPÉTENCE</div>
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      ${competenceRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${hasSujet ? `
          <!-- SUJET -->
          <tr>
            <td style="padding:18px 28px 0 28px;">
              <div style="font-size:13px;color:#64748b;">Sujet traité : <em>${escapeHtml(row.sujet)}</em></div>
            </td>
          </tr>
          ` : ''}

          ${hasAppreciation ? `
          <!-- APPRECIATION BLOCK -->
          <tr>
            <td style="padding:18px 28px 0 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${LIGHT_GRAY_BG};border-radius:6px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="color:${NAVY};font-size:11px;letter-spacing:1.5px;font-weight:700;margin-bottom:10px;">APPRÉCIATION DU PROFESSEUR</div>
                    <div style="font-size:14px;color:#334155;line-height:1.55;font-style:italic;">« ${escapeHtml(row.appreciation)} »</div>
                    <div style="font-size:13px;color:#64748b;margin-top:10px;">— ${escapeHtml(row.prof.displayName)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- CLOSING -->
          <tr>
            <td style="padding:24px 28px 28px 28px;">
              <p style="margin:0;font-size:14px;color:#475569;line-height:1.5;">${escapeHtml(appraisal.closing)}<br><strong style="color:#0f172a;">L'équipe Diploma Santé</strong></p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:${NAVY};padding:14px 24px;text-align:center;">
              <div style="color:#94a3b8;font-size:11px;">Ce message est confidentiel — Diploma Santé 2026</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}

function formatNote(n: number): string {
  // 18 → "18", 17.5 → "17,5"
  return Number.isInteger(n) ? String(n) : n.toString().replace('.', ',')
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
