import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface StudentRow {
  first_name: string
  last_name: string
  email?: string
  formation: string
  universite?: string
  date_inscription?: string
  date_naissance?: string
  nationalite?: string
  prix_formation?: string
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()
  const { students }: { students: StudentRow[] } = body

  if (!students || !Array.isArray(students) || students.length === 0) {
    return NextResponse.json({ error: 'Aucun étudiant à importer' }, { status: 400 })
  }

  // Récupérer les emails déjà existants pour dédupliquer
  const { data: existing } = await supabase.from('students').select('email').not('email', 'is', null)
  const existingEmails = new Set((existing || []).map((s: { email: string }) => s.email?.toLowerCase()))

  const toInsert = []
  let skipped = 0

  for (const s of students) {
    const email = s.email?.trim() || null
    if (email && existingEmails.has(email.toLowerCase())) {
      skipped++
      continue
    }
    toInsert.push({
      first_name: s.first_name.trim(),
      last_name: s.last_name.trim(),
      email,
      formation: s.formation.trim(),
      universite: s.universite?.trim() || null,
      date_inscription: s.date_inscription?.trim() || null,
      date_naissance: s.date_naissance?.trim() || null,
      nationalite: s.nationalite?.trim() || null,
      prix_formation: s.prix_formation?.trim() || null,
    })
  }

  if (toInsert.length === 0) {
    return NextResponse.json({ imported: 0, skipped })
  }

  const { data, error } = await supabase.from('students').insert(toInsert).select('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imported: data.length, skipped })
}
