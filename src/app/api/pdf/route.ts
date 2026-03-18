import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { CertificatPDF } from '@/lib/pdf/CertificatPDF'
import { BulletinPDF } from '@/lib/pdf/BulletinPDF'
import { ConventionPDF } from '@/lib/pdf/ConventionPDF'
import { DocumentProps } from '@react-pdf/renderer'
import React from 'react'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
  }

  const supabase = await createClient()

  // Vérifier l'auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Récupérer la demande
  const { data: demande, error } = await supabase
    .from('demandes')
    .select('*, profiles(*), notes(*)')
    .eq('id', id)
    .single()

  if (error || !demande) {
    return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
  }

  // Vérifier que la demande est validée
  if (demande.statut !== 'validee') {
    return NextResponse.json({ error: 'Demande non validée' }, { status: 403 })
  }

  // Vérifier les droits : soit l'élève propriétaire, soit un admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && demande.etudiant_id !== user.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  let pdfBuffer: Uint8Array

  try {
    let element: React.ReactElement<DocumentProps>

    if (demande.type === 'certificat_scolarite') {
      element = React.createElement(CertificatPDF, { demande }) as React.ReactElement<DocumentProps>
    } else if (demande.type === 'bulletin_annuel') {
      element = React.createElement(BulletinPDF, { demande }) as React.ReactElement<DocumentProps>
    } else if (demande.type === 'convention_stage') {
      element = React.createElement(ConventionPDF, { demande }) as React.ReactElement<DocumentProps>
    } else {
      return NextResponse.json({ error: 'Type non supporté' }, { status: 400 })
    }

    pdfBuffer = await renderToBuffer(element)
  } catch (err) {
    console.error('Erreur génération PDF:', err)
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  }

  const filename = `${demande.type}_${demande.profiles?.nom?.toLowerCase()}_${demande.profiles?.prenom?.toLowerCase()}.pdf`

  return new Response(pdfBuffer.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
