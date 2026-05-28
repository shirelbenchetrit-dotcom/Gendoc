import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findReadyRows, markRowAsSent, markRowsAsSentBatch } from '@/lib/oraux/sheets-client'
import { renderResultEmail } from '@/lib/oraux/email-template'
import { sendEmail } from '@/lib/brevo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Auth: either a logged-in admin user (Supabase session) OR a valid CRON_SECRET in the
 * Authorization header (for Vercel cron jobs).
 */
async function isAuthorized(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization') || ''
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) {
    return true
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

/** GET → dry-run: liste les lignes prêtes sans envoyer */
export async function GET(req: NextRequest) {
  if (!await isAuthorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const rows = await findReadyRows()
    return NextResponse.json({
      count: rows.length,
      rows: rows.map(r => ({
        tabName: r.tabName,
        rowNum: r.rowNum,
        studentName: r.studentName,
        email: r.email,
        matiere: r.prof.matiere,
        prof: r.prof.displayName,
        date: r.date,
        note: r.note,
      })),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/** POST → envoie les mails et marque comme envoyés */
export async function POST(req: NextRequest) {
  if (!await isAuthorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const rows = await findReadyRows()
  const results: Array<{ student: string; email: string; status: 'sent' | 'error'; error?: string }> = []
  // On accumule les marquages pour les écrire en 1 seul appel (évite le quota write 60/min)
  const toMark: Array<{ tabName: string; rowNum: number; status: 'ok' | 'error' }> = []

  for (const row of rows) {
    try {
      const { subject, html } = renderResultEmail(row)
      await sendEmail({
        to: [{ email: row.email, name: row.studentName }],
        subject,
        htmlContent: html,
      })
      toMark.push({ tabName: row.tabName, rowNum: row.rowNum, status: 'ok' })
      results.push({ student: row.studentName, email: row.email, status: 'sent' })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      toMark.push({ tabName: row.tabName, rowNum: row.rowNum, status: 'error' })
      results.push({ student: row.studentName, email: row.email, status: 'error', error: msg })
    }
  }

  // Marquage groupé en 1 appel API
  let markError: string | null = null
  try {
    await markRowsAsSentBatch(toMark)
  } catch (e: unknown) {
    markError = e instanceof Error ? e.message : 'unknown'
    // Fallback ligne par ligne avec pauses pour rester sous le quota
    for (const m of toMark) {
      try { await markRowAsSent(m.tabName, m.rowNum, m.status) } catch {}
      await new Promise(r => setTimeout(r, 1100))
    }
  }

  const sentCount = results.filter(r => r.status === 'sent').length
  const errorCount = results.filter(r => r.status === 'error').length
  return NextResponse.json({ total: results.length, sent: sentCount, errors: errorCount, markError, results })
}
