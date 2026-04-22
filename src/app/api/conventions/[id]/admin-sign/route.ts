import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { signature, stamp } = await request.json()
  if (!signature) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })

  // Récupérer la convention actuelle
  const { data: conv, error: fetchErr } = await supabase
    .from('conventions')
    .select('convention_data, organisme_signature, student_signature')
    .eq('id', id)
    .single()

  if (fetchErr || !conv) return NextResponse.json({ error: 'Convention introuvable' }, { status: 404 })

  // Intégrer le tampon dans convention_data (pas besoin de nouvelle colonne DB)
  const updatedConvData = {
    ...conv.convention_data,
    ...(stamp ? { adminStamp: stamp } : {}),
  }

  // Déterminer le nouveau statut
  const allSigned = !!conv.organisme_signature && !!conv.student_signature
  const newStatus = allSigned ? 'completed' : 'draft'

  const { error } = await supabase
    .from('conventions')
    .update({
      admin_signature: signature,
      admin_signed_at: new Date().toISOString(),
      convention_data: updatedConvData,
      status: newStatus,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
