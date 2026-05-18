import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findReadyRows } from '@/lib/oraux/sheets-client'
import { renderResultEmail } from '@/lib/oraux/email-template'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/oraux/preview?tab=...&row=...  → returns the email HTML for visual check */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const tab = req.nextUrl.searchParams.get('tab')
  const rowNum = parseInt(req.nextUrl.searchParams.get('row') || '0', 10)
  if (!tab || !rowNum) {
    return NextResponse.json({ error: 'tab and row params required' }, { status: 400 })
  }

  const rows = await findReadyRows()
  const target = rows.find(r => r.tabName === tab && r.rowNum === rowNum)
  if (!target) return NextResponse.json({ error: 'row not found or not ready' }, { status: 404 })

  const { html } = renderResultEmail(target)
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
