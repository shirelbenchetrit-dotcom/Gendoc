import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const KEYS = ['admin_signature', 'admin_stamp'] as const

// GET /api/settings
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', [...KEYS])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result: Record<string, string | null> = { admin_signature: null, admin_stamp: null }
  for (const row of data || []) {
    result[row.key] = row.value
  }
  return NextResponse.json(result)
}

// POST /api/settings
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()

  const upserts = []
  for (const key of KEYS) {
    if (key in body) {
      upserts.push({ key, value: body[key], updated_at: new Date().toISOString() })
    }
  }

  if (upserts.length === 0) return NextResponse.json({ error: 'Aucune donnée' }, { status: 400 })

  const { error } = await supabase
    .from('settings')
    .upsert(upserts, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
