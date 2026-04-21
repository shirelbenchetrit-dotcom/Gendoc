import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/brevo'

function fmtDate(d: string) {
  const parts = d.split('T')[0].split('-')
  if (parts.length === 3) {
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return d
}

function signingEmailHtml(name: string, role: 'organisme' | 'student', signUrl: string, studentName: string, organisme: string, dateDebut: string, dateFin: string) {
  const title = role === 'organisme' ? `Convention de stage — ${studentName}` : 'Votre convention de stage'
  const intro = role === 'organisme'
    ? `Diploma Santé vous adresse la convention de stage de <strong>${studentName}</strong> pour un stage chez <strong>${organisme}</strong> du <strong>${dateDebut}</strong> au <strong>${dateFin}</strong>.`
    : `Votre convention de stage chez <strong>${organisme}</strong> du <strong>${dateDebut}</strong> au <strong>${dateFin}</strong> est prête à être signée.`

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
  <p style="color:#1e3a5f;font-size:16px;font-weight:bold;margin:0 0 16px;">${title}</p>
  <p style="color:#444;font-size:14px;line-height:1.7;margin:0 0 24px;">${intro}</p>
  <div style="background:#fff8ec;border-left:4px solid #b8962e;padding:14px 18px;border-radius:0 8px 8px 0;margin:0 0 28px;">
    <p style="color:#7a5c10;font-size:13px;font-weight:bold;margin:0 0 6px;">Action requise — Signature électronique</p>
    <p style="color:#7a5c10;font-size:13px;margin:0;">Cliquez sur le bouton ci-dessous pour lire et signer la convention en ligne. La signature ne prend que quelques secondes.</p>
  </div>
  <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
    <tr><td style="background:#1e3a5f;border-radius:10px;padding:14px 32px;text-align:center;">
      <a href="${signUrl}" style="color:#fff;font-size:15px;font-weight:bold;text-decoration:none;">Signer la convention →</a>
    </td></tr>
  </table>
  <p style="color:#888;font-size:12px;text-align:center;margin:0;">Ce lien est personnel et à usage unique.<br>En cas de problème : <a href="mailto:contact@diploma-sante.fr" style="color:#38bdf8;">contact@diploma-sante.fr</a></p>
</td></tr>
<tr><td style="background:#f0f4f8;padding:14px 40px;text-align:center;border-top:1px solid #e5e7eb;">
  <p style="color:#888;font-size:11px;margin:0;">Diploma Santé — 85 Avenue Ledru Rollin, 75012 Paris</p>
</td></tr>
</table></td></tr></table>
</body></html>`
}

// PATCH /api/conventions/[id] — signer (admin, organisme, student)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()
  const { signature, role } = body as { signature: string; role: 'admin' | 'organisme' | 'student' }

  // Auth : admin requis sauf pour les signataires externes (organisme/student) qui passent par /api/sign/[token]
  const { data: { user } } = await supabase.auth.getUser()
  if (role === 'admin' && !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: convention, error: fetchErr } = await supabase
    .from('conventions')
    .select('*, students(*)')
    .eq('id', id)
    .single()

  if (fetchErr || !convention) return NextResponse.json({ error: 'Convention introuvable' }, { status: 404 })

  const student = convention.students
  const convData = convention.convention_data
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  let updateData: Record<string, unknown> = {}

  if (role === 'admin') {
    updateData = {
      admin_signature: signature,
      admin_signed_at: new Date().toISOString(),
      status: 'admin_signed',
    }

    // Envoyer email à l'organisme
    if (convData.emailOrganisme) {
      const orgUrl = `${baseUrl}/signer/${convention.organisme_token}`
      await sendEmail({
        to: [{ email: convData.emailOrganisme, name: convData.representant }],
        subject: `Convention de stage à signer — ${student.first_name} ${student.last_name}`,
        htmlContent: signingEmailHtml(convData.representant, 'organisme', orgUrl, `${student.first_name} ${student.last_name}`, convData.organisme, fmtDate(convData.dateDebut), fmtDate(convData.dateFin)),
      })
    }

    // Envoyer email à l'étudiant
    if (student.email) {
      const stuUrl = `${baseUrl}/signer/${convention.student_token}`
      await sendEmail({
        to: [{ email: student.email, name: `${student.first_name} ${student.last_name}` }],
        subject: `Votre convention de stage à signer — Diploma Santé`,
        htmlContent: signingEmailHtml(student.first_name, 'student', stuUrl, `${student.first_name} ${student.last_name}`, convData.organisme, fmtDate(convData.dateDebut), fmtDate(convData.dateFin)),
      })
    }

  } else if (role === 'organisme') {
    const newStatus = convention.student_signature ? 'completed' : 'organisme_signed'
    updateData = {
      organisme_signature: signature,
      organisme_signed_at: new Date().toISOString(),
      status: newStatus,
    }
  } else if (role === 'student') {
    const newStatus = convention.organisme_signature ? 'completed' : 'organisme_signed'
    updateData = {
      student_signature: signature,
      student_signed_at: new Date().toISOString(),
      status: newStatus,
    }
  }

  const { data: updated, error: updateErr } = await supabase
    .from('conventions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
  return NextResponse.json(updated)
}

// GET /api/conventions/[id] — récupérer une convention (admin)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data, error } = await supabase
    .from('conventions')
    .select('*, students(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
