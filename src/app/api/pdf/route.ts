import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { CertificatPDF } from '@/lib/pdf/CertificatPDF'
import { ConventionPDF } from '@/lib/pdf/ConventionPDF'
import { AttestationPDF } from '@/lib/pdf/AttestationPDF'
import { LettreRecoFR } from '@/lib/pdf/LettreRecoFR'
import { LettreRecoEN } from '@/lib/pdf/LettreRecoEN'
import { DocumentType, ConventionData } from '@/lib/types'
import React from 'react'
import { DocumentProps } from '@react-pdf/renderer'

async function getAdminSettings(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['admin_signature', 'admin_stamp'])
  const result: Record<string, string | null> = { admin_signature: null, admin_stamp: null }
  for (const row of data || []) result[row.key] = row.value
  return result
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: { type?: DocumentType; studentId?: string; conventionData?: ConventionData }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { type, studentId, conventionData } = body

  if (!type || !studentId) {
    return NextResponse.json({ error: 'Paramètres manquants : type et studentId requis' }, { status: 400 })
  }

  // Récupérer l'étudiant
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()

  if (studentError || !student) {
    return NextResponse.json({ error: 'Étudiant introuvable' }, { status: 404 })
  }

  // Récupérer la signature et le tampon admin
  const settings = await getAdminSettings(supabase)
  const adminSignature = settings.admin_signature
  const adminStamp = settings.admin_stamp

  // Générer le PDF
  let element: React.ReactElement<DocumentProps>

  switch (type) {
    case 'certificat_scolarite':
      element = React.createElement(CertificatPDF, { student, adminSignature, adminStamp }) as React.ReactElement<DocumentProps>
      break
    case 'convention_stage':
      if (!conventionData) {
        return NextResponse.json({ error: 'Données de la convention manquantes' }, { status: 400 })
      }
      element = React.createElement(ConventionPDF, { student, convention: conventionData, adminSignature, adminStamp }) as React.ReactElement<DocumentProps>
      break
    case 'attestation_presence':
      element = React.createElement(AttestationPDF, { student, adminSignature, adminStamp }) as React.ReactElement<DocumentProps>
      break
    case 'lettre_recommandation_fr':
      element = React.createElement(LettreRecoFR, { student, adminSignature, adminStamp }) as React.ReactElement<DocumentProps>
      break
    case 'lettre_recommandation_en':
      element = React.createElement(LettreRecoEN, { student, adminSignature, adminStamp }) as React.ReactElement<DocumentProps>
      break
    default:
      return NextResponse.json({ error: 'Type de document non supporté' }, { status: 400 })
  }

  let pdfBuffer: Uint8Array
  try {
    pdfBuffer = await renderToBuffer(element)
  } catch (err) {
    console.error('Erreur génération PDF:', err)
    return NextResponse.json({ error: 'Erreur lors de la génération du PDF' }, { status: 500 })
  }

  // Enregistrer le document généré
  await supabase.from('documents').insert([{
    student_id: studentId,
    type,
    generated_by: user.id,
  }])

  const filename = `${type}_${student.last_name.toLowerCase()}_${student.first_name.toLowerCase()}.pdf`

  return new Response(Buffer.from(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  })
}
