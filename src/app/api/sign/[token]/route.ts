import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ConventionPDF } from '@/lib/pdf/ConventionPDF'
import { sendEmail } from '@/lib/brevo'
import { Student } from '@/lib/types'
import React from 'react'

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  const parts = d.split('T')[0].split('-')
  if (parts.length === 3) {
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return d
}

function completedEmailHtml(
  prenom: string,
  organisme: string,
  dateDebut: string,
  dateFin: string,
  role: 'admin' | 'organisme' | 'student'
) {
  const intro = role === 'admin'
    ? `La convention de stage de <strong>${prenom}</strong> chez <strong>${organisme}</strong> a été signée par toutes les parties.`
    : role === 'organisme'
      ? `La convention de stage que vous avez signée pour <strong>${prenom}</strong> est désormais complète et signée par toutes les parties.`
      : `Votre convention de stage chez <strong>${organisme}</strong> est désormais complète et signée par toutes les parties.`

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
<tr><td style="background:#1e3a5f;padding:28px 40px;text-align:center;">
  <span style="font-size:22px;font-weight:bold;color:#fff;">Diploma </span>
  <span style="font-size:22px;font-weight:bold;color:#38bdf8;">Santé</span>
</td></tr>
<tr><td style="padding:36px 40px;">
  <p style="color:#1e3a5f;font-size:16px;font-weight:bold;margin:0 0 16px;">Convention signée ✓</p>
  <p style="color:#444;font-size:14px;line-height:1.7;margin:0 0 24px;">${intro}</p>
  <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:14px 18px;border-radius:0 8px 8px 0;margin:0 0 28px;">
    <p style="color:#166534;font-size:13px;font-weight:bold;margin:0 0 4px;">Stage du ${fmtDate(dateDebut)} au ${fmtDate(dateFin)}</p>
    <p style="color:#166534;font-size:13px;margin:0;">Vous trouverez la convention complète en pièce jointe.</p>
  </div>
  <p style="color:#888;font-size:12px;text-align:center;margin:0;">En cas de question : <a href="mailto:contact@diploma-sante.fr" style="color:#38bdf8;">contact@diploma-sante.fr</a></p>
</td></tr>
<tr><td style="background:#f0f4f8;padding:14px 40px;text-align:center;border-top:1px solid #e5e7eb;">
  <p style="color:#888;font-size:11px;margin:0;">Diploma Santé — 85 Avenue Ledru Rollin, 75012 Paris</p>
</td></tr>
</table></td></tr></table>
</body></html>`
}

// GET /api/sign/[token] — récupérer la convention via token public
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Chercher par organisme_token ou student_token
  let data = null
  let role: 'organisme' | 'student' | null = null

  const { data: byOrg } = await supabase
    .from('conventions')
    .select('*')
    .eq('organisme_token', token)
    .single()

  if (byOrg) { data = byOrg; role = 'organisme' }
  else {
    const { data: byStu } = await supabase
      .from('conventions')
      .select('*')
      .eq('student_token', token)
      .single()
    if (byStu) { data = byStu; role = 'student' }
  }

  if (!data || !role) return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 })

  // Vérifier si déjà signé
  if (role === 'organisme' && data.organisme_signature) {
    return NextResponse.json({ alreadySigned: true, role })
  }
  if (role === 'student' && data.student_signature) {
    return NextResponse.json({ alreadySigned: true, role })
  }

  // Retourner les infos sans dépendre de la jointure students (RLS)
  const conv = data.convention_data
  return NextResponse.json({
    id: data.id,
    role,
    convention_data: conv,
    student: {
      first_name: conv.studentFirstName || '',
      last_name: conv.studentLastName || '',
      formation: conv.studentFormation || '',
    },
    status: data.status,
  })
}

// POST /api/sign/[token] — soumettre la signature
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { signature } = await request.json()

  if (!signature) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })

  // Trouver la convention
  let conventionId: string | null = null
  let role: 'organisme' | 'student' | null = null

  const { data: byOrg } = await supabase
    .from('conventions')
    .select('id, organisme_signature, student_signature')
    .eq('organisme_token', token)
    .single()

  if (byOrg) { conventionId = byOrg.id; role = 'organisme' }
  else {
    const { data: byStu } = await supabase
      .from('conventions')
      .select('id, organisme_signature, student_signature')
      .eq('student_token', token)
      .single()
    if (byStu) { conventionId = byStu.id; role = 'student' }
  }

  if (!conventionId || !role) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 })

  // Déterminer le nouveau statut
  const conv = byOrg || (await supabase.from('conventions').select('organisme_signature, student_signature').eq('id', conventionId).single()).data
  const otherSigned = role === 'organisme' ? !!conv?.student_signature : !!conv?.organisme_signature
  const newStatus = otherSigned ? 'completed' : (role === 'organisme' ? 'organisme_signed' : 'admin_signed')

  const updateData = role === 'organisme'
    ? { organisme_signature: signature, organisme_signed_at: new Date().toISOString(), status: newStatus }
    : { student_signature: signature, student_signed_at: new Date().toISOString(), status: newStatus }

  const { error } = await supabase
    .from('conventions')
    .update(updateData)
    .eq('id', conventionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // ── Finalisation : envoi du PDF signé quand les 3 parties ont signé ──
  if (newStatus === 'completed') {
    try {
      // Récupérer la convention complète avec toutes les signatures
      const { data: fullConv } = await supabase
        .from('conventions')
        .select('*')
        .eq('id', conventionId)
        .single()

      if (fullConv) {
        const convData = fullConv.convention_data

        // Construire un objet Student à partir des données dénormalisées
        const studentObj: Student = {
          id: fullConv.student_id,
          first_name: convData.studentFirstName || '',
          last_name: convData.studentLastName || '',
          email: convData.studentEmail || null,
          formation: convData.studentFormation || '',
          universite: null,
          date_inscription: null,
          created_at: '',
        }

        // Générer le PDF avec les 3 signatures intégrées
        // (fullConv est fetché après l'update, il contient déjà toutes les signatures)
        const element = React.createElement(ConventionPDF, {
          student: studentObj,
          convention: convData,
          signatures: {
            admin: fullConv.admin_signature,
            organisme: fullConv.organisme_signature,
            student: fullConv.student_signature,
          },
          signedAt: {
            admin: fullConv.admin_signed_at,
            organisme: fullConv.organisme_signed_at,
            student: fullConv.student_signed_at,
          },
        })
        const pdfBuffer = await renderToBuffer(element as React.ReactElement)
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')
        const filename = `convention_signee_${studentObj.last_name.toLowerCase()}_${studentObj.first_name.toLowerCase()}.pdf`
        const attachment = [{ name: filename, content: pdfBase64 }]

        const studentName = `${studentObj.first_name} ${studentObj.last_name}`

        // Email à l'étudiant
        if (convData.studentEmail) {
          await sendEmail({
            to: [{ email: convData.studentEmail, name: studentName }],
            subject: `Votre convention de stage — signée par toutes les parties`,
            htmlContent: completedEmailHtml(studentObj.first_name, convData.organisme, convData.dateDebut, convData.dateFin, 'student'),
            attachments: attachment,
          }).catch(e => console.error('Email étudiant final:', e))
        }

        // Email à l'organisme
        if (convData.emailOrganisme) {
          await sendEmail({
            to: [{ email: convData.emailOrganisme, name: convData.representant }],
            subject: `Convention de stage ${studentName} — signée par toutes les parties`,
            htmlContent: completedEmailHtml(studentName, convData.organisme, convData.dateDebut, convData.dateFin, 'organisme'),
            attachments: attachment,
          }).catch(e => console.error('Email organisme final:', e))
        }

        // Email à Diploma Santé (admin)
        await sendEmail({
          to: [{ email: process.env.BREVO_FROM_EMAIL || 'contact@diploma-sante.fr', name: 'Diploma Santé' }],
          subject: `Convention de stage ${studentName} — complète ✓`,
          htmlContent: completedEmailHtml(studentName, convData.organisme, convData.dateDebut, convData.dateFin, 'admin'),
          attachments: attachment,
        }).catch(e => console.error('Email admin final:', e))
      }
    } catch (finalErr) {
      console.error('Erreur finalisation convention:', finalErr)
      // On ne bloque pas la réponse : la signature est bien enregistrée
    }
  }

  return NextResponse.json({ success: true, status: newStatus })
}
