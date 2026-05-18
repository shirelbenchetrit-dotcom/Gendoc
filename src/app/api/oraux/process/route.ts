import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findReadyRows, markRowAsSent } from '@/lib/oraux/sheets-client'
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

  for (const row of rows) {
    try {
      const { subject, html } = renderResultEmail(row)
      await sendEmail({
        to: [{ email: row.email, name: row.studentName }],
        subject,
        htmlContent: html,
      })
      await markRowAsSent(row.tabName, row.rowNum, 'ok')
      results.push({ student: row.studentName, email: row.email, status: 'sent' })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      // On essaie de marquer l'erreur dans le sheet pour traçabilité
      try { await markRowAsSent(row.tabName, row.rowNum, 'error') } catch {}
      results.push({ student: row.studentName, email: row.email, status: 'error', error: msg })
    }
  }

  const sentCount = results.filter(r => r.status === 'sent').length
  const errorCount = results.filter(r => r.status === 'error').length
  return NextResponse.json({ total: results.length, sent: sentCount, errors: errorCount, results })
}
