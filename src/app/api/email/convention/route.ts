import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer, DocumentProps } from '@react-pdf/renderer'
import { ConventionPDF } from '@/lib/pdf/ConventionPDF'
import { ConventionData } from '@/lib/types'
import { sendEmail } from '@/lib/brevo'
import React from 'react'

function fmtDate(d: string) {
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function emailHtmlEtudiant(prenom: string, nom: string, organisme: string, dateDebut: string, dateFin: string) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header navy -->
        <tr><td style="background:#1e3a5f;padding:28px 40px;text-align:center;">
          <span style="font-size:22px;font-weight:bold;color:#ffffff;">Diploma </span>
          <span style="font-size:22px;font-weight:bold;color:#38bdf8;">Santé</span>
          <p style="color:#94b8d4;font-size:12px;margin:4px 0 0;">la prépa médecine</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="color:#1e3a5f;font-size:16px;font-weight:bold;margin:0 0 20px;">Bonjour ${prenom},</p>
          <p style="color:#444;font-size:14px;line-height:1.7;margin:0 0 16px;">
            Veuillez trouver en pièce jointe votre <strong>convention de stage</strong> pour votre stage chez
            <strong>${organisme}</strong>, du <strong>${fmtDate(dateDebut)}</strong> au <strong>${fmtDate(dateFin)}</strong>.
          </p>
          <div style="background:#fff8ec;border-left:4px solid #b8962e;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0;">
            <p style="color:#7a5c10;font-size:13px;font-weight:bold;margin:0 0 6px;">Action requise</p>
            <p style="color:#7a5c10;font-size:13px;margin:0;">
              Merci de <strong>signer cette convention</strong> et de la retourner à Diploma Santé ainsi qu'à votre structure d'accueil.
              La convention doit être signée en <strong>3 exemplaires</strong> par les 3 parties.
            </p>
          </div>
          <p style="color:#444;font-size:14px;line-height:1.7;margin:16px 0 0;">
            En cas de question, n'hésitez pas à nous contacter à
            <a href="mailto:contact@diploma-sante.fr" style="color:#38bdf8;">contact@diploma-sante.fr</a>.
          </p>
          <p style="color:#444;font-size:14px;margin:24px 0 0;">
            Cordialement,<br>
            <strong>L'équipe Diploma Santé</strong>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f0f4f8;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#888;font-size:11px;margin:0;">
            Diploma Santé — 85 Avenue Ledru Rollin, 75012 Paris<br>
            <a href="https://www.diploma-sante.fr" style="color:#38bdf8;">www.diploma-sante.fr</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function emailHtmlOrganisme(prenom: string, nom: string, organisme: string, representant: string, formation: string, dateDebut: string, dateFin: string) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <tr><td style="background:#1e3a5f;padding:28px 40px;text-align:center;">
          <span style="font-size:22px;font-weight:bold;color:#ffffff;">Diploma </span>
          <span style="font-size:22px;font-weight:bold;color:#38bdf8;">Santé</span>
          <p style="color:#94b8d4;font-size:12px;margin:4px 0 0;">la prépa médecine</p>
        </td></tr>

        <tr><td style="padding:36px 40px;">
          <p style="color:#1e3a5f;font-size:16px;font-weight:bold;margin:0 0 20px;">Madame, Monsieur,</p>
          <p style="color:#444;font-size:14px;line-height:1.7;margin:0 0 16px;">
            Veuillez trouver en pièce jointe la <strong>convention de stage</strong> de
            <strong>${prenom} ${nom.toUpperCase()}</strong>, étudiant(e) en formation <strong>${formation}</strong>
            à Diploma Santé, pour la période du <strong>${fmtDate(dateDebut)}</strong> au <strong>${fmtDate(dateFin)}</strong>.
          </p>
          <div style="background:#fff8ec;border-left:4px solid #b8962e;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0;">
            <p style="color:#7a5c10;font-size:13px;font-weight:bold;margin:0 0 6px;">Action requise</p>
            <p style="color:#7a5c10;font-size:13px;margin:0;">
              Merci de <strong>signer cette convention</strong>, d'y apposer votre cachet, et de nous en retourner
              un exemplaire signé à <a href="mailto:contact@diploma-sante.fr" style="color:#b8962e;">contact@diploma-sante.fr</a>.
            </p>
          </div>
          <p style="color:#444;font-size:14px;line-height:1.7;margin:16px 0 0;">
            Nous restons disponibles pour toute question.<br>
          </p>
          <p style="color:#444;font-size:14px;margin:24px 0 0;">
            Cordialement,<br>
            <strong>Shirel Benchetrit</strong><br>
            <span style="color:#888;font-size:13px;">Diploma Santé — 85 Avenue Ledru Rollin, 75012 Paris</span>
          </p>
        </td></tr>

        <tr><td style="background:#f0f4f8;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#888;font-size:11px;margin:0;">
            Diploma Santé — 85 Avenue Ledru Rollin, 75012 Paris<br>
            <a href="https://www.diploma-sante.fr" style="color:#38bdf8;">www.diploma-sante.fr</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  let body: { studentId?: string; conventionData?: ConventionData }
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Corps invalide' }, { status: 400 }) }

  const { studentId, conventionData } = body
  if (!studentId || !conventionData) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const { data: student } = await supabase.from('students').select('*').eq('id', studentId).single()
  if (!student) return NextResponse.json({ error: 'Étudiant introuvable' }, { status: 404 })

  // Générer le PDF
  const element = React.createElement(ConventionPDF, { student, convention: conventionData })
  let pdfBuffer: Uint8Array
  try {
    pdfBuffer = await renderToBuffer(element as React.ReactElement<DocumentProps>)
  } catch (err) {
    console.error('Erreur PDF:', err)
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  }

  const filename = `convention_stage_${student.last_name.toLowerCase()}_${student.first_name.toLowerCase()}.pdf`
  const pdfContent = Buffer.from(pdfBuffer)

  const sent: string[] = []
  const errors: string[] = []

  // Email à l'étudiant
  if (student.email) {
    try {
      await sendEmail({
        to: [{ email: student.email, name: `${student.first_name} ${student.last_name}` }],
        subject: `Votre convention de stage — Diploma Santé`,
        htmlContent: emailHtmlEtudiant(
          student.first_name, student.last_name,
          conventionData.organisme, conventionData.dateDebut, conventionData.dateFin
        ),
        attachments: [{
          name: filename,
          content: pdfContent.toString('base64'),
        }],
      })
      sent.push(`étudiant (${student.email})`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Erreur email étudiant:', err)
      errors.push(`étudiant (${student.email}) : ${msg}`)
    }
  } else {
    errors.push("l'étudiant n'a pas d'adresse email")
  }

  // Email à l'organisme d'accueil
  if (conventionData.emailOrganisme) {
    try {
      await sendEmail({
        to: [{ email: conventionData.emailOrganisme, name: conventionData.representant }],
        subject: `Convention de stage — ${student.first_name} ${student.last_name} — Diploma Santé`,
        htmlContent: emailHtmlOrganisme(
          student.first_name, student.last_name,
          conventionData.organisme, conventionData.representant,
          student.formation, conventionData.dateDebut, conventionData.dateFin
        ),
        attachments: [{
          name: filename,
          content: pdfContent.toString('base64'),
        }],
      })
      sent.push(`organisme d'accueil (${conventionData.emailOrganisme})`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Erreur email organisme:', err)
      errors.push(`organisme (${conventionData.emailOrganisme}) : ${msg}`)
    }
  }

  // Log dans documents
  await supabase.from('documents').insert([{
    student_id: studentId,
    type: 'convention_stage',
    generated_by: user.id,
  }])

  return NextResponse.json({ success: true, sent, errors: errors.length ? errors : undefined })
}
