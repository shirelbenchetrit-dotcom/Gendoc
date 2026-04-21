import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ConventionData } from '@/lib/types'

// POST /api/conventions — créer une convention
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()
  const { studentId, conventionData }: { studentId: string; conventionData: ConventionData } = body

  const { data, error } = await supabase
    .from('conventions')
    .insert([{
      student_id: studentId,
      convention_data: conventionData,
      status: 'draft',
      created_by: user.id,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// GET /api/conventions — liste toutes les conventions
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data, error } = await supabase
    .from('conventions')
    .select(`*, students(first_name, last_name, formation, email)`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
