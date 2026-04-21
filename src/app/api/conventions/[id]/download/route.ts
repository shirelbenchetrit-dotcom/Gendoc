import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ConventionPDF } from '@/lib/pdf/ConventionPDF'
import { Student } from '@/lib/types'
import React from 'react'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: conv, error } = await supabase
    .from('conventions')
    .select('*, students(*)')
    .eq('id', id)
    .single()

  if (error || !conv) return NextResponse.json({ error: 'Convention introuvable' }, { status: 404 })

  const student = conv.students as Student
  const convData = conv.convention_data

  const element = React.createElement(ConventionPDF, {
    student,
    convention: convData,
    signatures: {
      admin: conv.admin_signature,
      organisme: conv.organisme_signature,
      student: conv.student_signature,
    },
    signedAt: {
      admin: conv.admin_signed_at,
      organisme: conv.organisme_signed_at,
      student: conv.student_signed_at,
    },
  })

  const pdfBuffer = await renderToBuffer(element as React.ReactElement)
  const filename = `convention_signee_${student.last_name.toLowerCase()}_${student.first_name.toLowerCase()}.pdf`

  return new NextResponse(Buffer.from(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
